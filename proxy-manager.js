const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const net = require('net');
const { app } = require('electron');

class ProxyManager {
    constructor() {
        this.processes = {}; // messenger -> child_process
        this.ports = {}; // messenger -> local_port
        this.binPath = this.getBinaryPath();
    }

    getBinaryDescriptor() {
        const descriptors = {
            darwin: {
                arm64: {
                    devSubdir: 'darwin-arm64',
                    executable: 'sing-box'
                }
            },
            win32: {
                x64: {
                    devSubdir: 'win32-x64',
                    executable: 'sing-box.exe'
                }
            }
        };

        const platformDescriptors = descriptors[process.platform];
        if (!platformDescriptors) {
            throw new Error(`Unsupported platform for bundled sing-box: ${process.platform}`);
        }

        const descriptor = platformDescriptors[process.arch];
        if (!descriptor) {
            throw new Error(`Unsupported architecture for bundled sing-box: ${process.platform}/${process.arch}`);
        }

        return descriptor;
    }

    getBinaryPath() {
        const descriptor = this.getBinaryDescriptor();
        if (app.isPackaged) {
            return path.join(process.resourcesPath, 'bin', descriptor.executable);
        }
        return path.join(__dirname, 'resources', 'bin', descriptor.devSubdir, descriptor.executable);
    }

    ensureBinaryExists() {
        if (!fs.existsSync(this.binPath)) {
            throw new Error(`Bundled sing-box binary not found: ${this.binPath}`);
        }
    }

    async getFreePort() {
        return new Promise((resolve, reject) => {
            const server = net.createServer();
            server.listen(0, '127.0.0.1', () => {
                const port = server.address().port;
                server.close(() => resolve(port));
            });
            server.on('error', reject);
        });
    }

    // Парсим ссылку и создаем конфиг для sing-box
    // Поддержка: vless://, ss://, trojan:// (базовая)
    generateConfig(link, localPort) {
        // Шаблон конфига sing-box
        const config = {
            "log": {
                "level": "error",
                "timestamp": true
            },
            "inbounds": [
                {
                    "type": "socks",
                    "tag": "socks-in",
                    "listen": "127.0.0.1",
                    "listen_port": localPort
                }
            ],
            "outbounds": []
        };

        try {
            const url = new URL(link);
            const protocol = url.protocol.replace(':', '');

            let outbound = {
                "type": protocol, // vless, shadowsocks, trojan
                "tag": "proxy-out"
            };

            if (protocol === 'socks5') {
                outbound.type = "socks";
                outbound.server = url.hostname;
                outbound.server_port = parseInt(url.port);
                outbound.version = "5";
                if (url.username) outbound.username = url.username;
                if (url.password) outbound.password = url.password;
            }
            else if (protocol === 'ss' || protocol === 'shadowsocks') {
                outbound.type = "shadowsocks";
                // ss://base64... или ss://method:pass@host:port
                if (url.username) {
                    // Старый формат ss://method:pass@host:port
                    outbound.server = url.hostname;
                    outbound.server_port = parseInt(url.port);
                    outbound.method = url.username;
                    outbound.password = url.password;
                } else {
                    // Новый формат ss://base64#name
                    // Декодируем base64 userinfo
                    let decoded;
                    try {
                        decoded = Buffer.from(url.hostname, 'base64').toString();
                    } catch (e) {
                        // Пробуем просто как base64 всей части
                        const raw = link.replace('ss://', '').split('#')[0];
                        decoded = Buffer.from(raw, 'base64').toString();
                    }

                    // method:pass@host:port
                    const parts = decoded.split('@');
                    const credentials = parts[0].split(':');
                    const address = parts[1].split(':');

                    outbound.method = credentials[0];
                    outbound.password = credentials[1];
                    outbound.server = address[0];
                    outbound.server_port = parseInt(address[1]);
                }
            }
            else if (protocol === 'vless') {
                outbound.type = "vless";
                outbound.server = url.hostname;
                outbound.server_port = parseInt(url.port);
                outbound.uuid = url.username;
                outbound.flow = url.searchParams.get('flow') || "";
                outbound.tls = {
                    "enabled": url.searchParams.get('security') === 'tls' || url.searchParams.get('security') === 'reality',
                    "server_name": url.searchParams.get('sni'),
                    "insecure": true
                };

                if (url.searchParams.get('security') === 'reality') {
                    outbound.tls.reality = {
                        "enabled": true,
                        "public_key": url.searchParams.get('pbk'),
                        "short_id": url.searchParams.get('sid')
                    };
                    outbound.tls.utls = {
                        "enabled": true,
                        "fingerprint": url.searchParams.get('fp') || "chrome"
                    };
                }
            }
            // TODO: Vmess support

            config.outbounds.push(outbound);
            config.outbounds.push({
                "type": "direct",
                "tag": "direct"
            });

        } catch (e) {
            console.error('Error parsing link:', e);
            throw new Error(`Failed to parse proxy link: ${e.message}`);
        }

        return JSON.stringify(config, null, 2);
    }

    async start(messenger, link) {
        // Останавливаем старый процесс если есть
        this.stop(messenger);

        try {
            this.ensureBinaryExists();

            const localPort = await this.getFreePort();
            const configContent = this.generateConfig(link, localPort);

            const userDataPath = app.getPath('userData');
            const configPath = path.join(userDataPath, `config_${messenger}.json`);

            await fs.promises.writeFile(configPath, configContent);

            console.log(`[ProxyManager] Starting sing-box for ${messenger} on 127.0.0.1:${localPort}`);

            const child = spawn(this.binPath, ['run', '-c', configPath], {
                windowsHide: true
            });

            child.stderr.on('data', (data) => {
                console.error(`[sing-box ${messenger}]: ${data}`);
            });

            child.on('error', (error) => {
                console.error(`[sing-box ${messenger}] failed to start:`, error);
            });

            child.on('close', (code) => {
                if (code !== 0 && code !== null) { // null if killed
                    console.log(`[sing-box ${messenger}] exited with code ${code}`);
                }
                if (this.processes[messenger] === child) {
                    delete this.processes[messenger];
                    delete this.ports[messenger];
                }
            });

            this.processes[messenger] = child;
            this.ports[messenger] = localPort;

            return localPort;
        } catch (e) {
            console.error(`[ProxyManager] Error starting proxy for ${messenger}:`, e);
            throw e;
        }
    }

    stop(messenger) {
        if (this.processes[messenger]) {
            console.log(`[ProxyManager] Stopping proxy for ${messenger}`);
            try {
                this.processes[messenger].kill();
            } catch (e) {
                console.warn(`[ProxyManager] Failed to kill process for ${messenger}:`, e);
            }
            delete this.processes[messenger];
            delete this.ports[messenger];
        }
    }

    stopAll() {
        Object.keys(this.processes).forEach(m => this.stop(m));
    }
}

module.exports = new ProxyManager();
