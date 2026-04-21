# TextMe

[![CI](https://github.com/yashafake/text-me/actions/workflows/ci.yml/badge.svg)](https://github.com/yashafake/text-me/actions/workflows/ci.yml)

TextMe is an Electron desktop app that combines popular web messengers in one window: Telegram, WhatsApp, Instagram, and VK.

## Features

- Telegram Web, WhatsApp Web, Instagram, VK in tabbed UI
- Native desktop notifications
- Unread counters for tabs and Dock badge
- Fast keyboard switching (`Cmd+1` ... `Cmd+5`)
- Per-service proxy support via bundled `sing-box` binaries

## Supported Platforms

- macOS (primary target)
- Windows build scripts are included

## Requirements

- Node.js 18+
- npm 9+

## Getting Started

```bash
npm install
npm start
```

## Build

```bash
# macOS installers/artifacts
npm run build

# Windows build
npm run build:win
```

Build output is generated in `dist/`.

## Testing

```bash
# Unit tests
npm test

# E2E external-link smoke test
npm run test:e2e
```

`CI` workflow runs unit tests on Node 18 and Node 20.

`E2E Smoke` workflow is available as a manual GitHub Action run (`workflow_dispatch`) for macOS.

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Cmd+1` | Telegram |
| `Cmd+2` | WhatsApp |
| `Cmd+3` | WhatsApp Business |
| `Cmd+4` | Instagram |
| `Cmd+5` | VK |

## Notes

- This project loads official web clients; availability depends on those services.
- This project is not affiliated with Telegram, WhatsApp, Instagram, or VK.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## Security

See [SECURITY.md](./SECURITY.md).

## License

[MIT](./LICENSE)
