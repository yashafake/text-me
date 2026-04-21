const { shell } = require('electron');

const ALLOWED_EXTERNAL_PROTOCOLS = new Set(['http:', 'https:', 'mailto:']);
const defaultOpenExternal = shell && typeof shell.openExternal === 'function'
    ? shell.openExternal.bind(shell)
    : () => {};

function normalizeExternalUrl(rawUrl) {
    if (typeof rawUrl !== 'string') return null;
    const trimmed = rawUrl.trim();
    if (!trimmed) return null;

    let parsed;
    try {
        parsed = new URL(trimmed);
    } catch (_error) {
        return null;
    }

    if (!ALLOWED_EXTERNAL_PROTOCOLS.has(parsed.protocol)) {
        return null;
    }

    return parsed.toString();
}

function createExternalLinkOpener(options = {}) {
    const dedupeWindowMs = Number.isFinite(options.dedupeWindowMs) ? options.dedupeWindowMs : 500;
    const openExternal = typeof options.openExternal === 'function' ? options.openExternal : defaultOpenExternal;

    let lastOpenedUrl = null;
    let lastOpenedAt = 0;

    return function openExternalLink(rawUrl) {
        const normalizedUrl = normalizeExternalUrl(rawUrl);
        if (!normalizedUrl) return false;

        const now = Date.now();
        const isDuplicate = lastOpenedUrl === normalizedUrl && (now - lastOpenedAt) < dedupeWindowMs;
        if (isDuplicate) return false;

        lastOpenedUrl = normalizedUrl;
        lastOpenedAt = now;

        try {
            const maybePromise = openExternal(normalizedUrl);
            if (maybePromise && typeof maybePromise.catch === 'function') {
                maybePromise.catch((error) => {
                    console.error('Failed to open external URL:', error);
                });
            }
        } catch (error) {
            console.error('Failed to open external URL:', error);
            return false;
        }

        return true;
    };
}

module.exports = {
    createExternalLinkOpener,
    normalizeExternalUrl
};
