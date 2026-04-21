const path = require('path');
const { spawn } = require('child_process');

const electronBinary = require('electron');

const APP_DIR = path.resolve(__dirname, '..');
const E2E_ARG = '--e2e-external-link';
const E2E_MARKER = 'E2E_OPEN_EXTERNAL:';
const EXPECTED_URL = 'https://example.com/';
const TIMEOUT_MS = 40000;

const child = spawn(electronBinary, [APP_DIR, E2E_ARG], {
    cwd: APP_DIR,
    env: (() => {
        const env = {
        ...process.env,
        ELECTRON_ENABLE_LOGGING: '1'
        };
        delete env.ELECTRON_RUN_AS_NODE;
        return env;
    })(),
    stdio: ['ignore', 'pipe', 'pipe']
});

let markerUrl = null;
let stdoutBuffer = '';
let stderrBuffer = '';
let timedOut = false;

const timeoutId = setTimeout(() => {
    timedOut = true;
    child.kill('SIGTERM');
}, TIMEOUT_MS);

function handleOutput(data, isStdErr = false) {
    const chunk = data.toString();
    if (isStdErr) {
        stderrBuffer += chunk;
    } else {
        stdoutBuffer += chunk;
    }

    const combined = stdoutBuffer + '\n' + stderrBuffer;
    const markerIndex = combined.indexOf(E2E_MARKER);
    if (markerIndex === -1) return;

    const afterMarker = combined.slice(markerIndex + E2E_MARKER.length);
    const matchedLine = afterMarker.split('\n')[0].trim();
    if (matchedLine) {
        markerUrl = matchedLine;
    }
}

child.stdout.on('data', (data) => handleOutput(data, false));
child.stderr.on('data', (data) => handleOutput(data, true));

child.on('exit', (code, signal) => {
    clearTimeout(timeoutId);

    if (timedOut) {
        console.error(`E2E failed: timeout after ${TIMEOUT_MS}ms`);
        process.exit(1);
    }

    if (!markerUrl) {
        console.error(`E2E failed: external-link marker was not emitted (code=${code}, signal=${signal}).`);
        if (stdoutBuffer.trim()) console.error(`stdout:\n${stdoutBuffer}`);
        if (stderrBuffer.trim()) console.error(`stderr:\n${stderrBuffer}`);
        process.exit(1);
    }

    if (markerUrl !== EXPECTED_URL) {
        console.error(`E2E failed: unexpected URL. expected=${EXPECTED_URL} actual=${markerUrl}`);
        process.exit(1);
    }

    if (code !== 0 && signal !== 'SIGTERM') {
        console.error(`E2E failed: electron exited with code=${code} signal=${signal}`);
        process.exit(1);
    }

    console.log(`E2E passed: opened ${markerUrl}`);
    process.exit(0);
});
