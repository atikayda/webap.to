// SPDX-FileCopyrightText: 2025 Atikayda Pty Ltd
// SPDX-License-Identifier: AGPL-3.0-only

export function supportsProtocolHandler() {
  return typeof navigator !== 'undefined' && 'registerProtocolHandler' in navigator;
}

export function registerHandler(instanceDomain) {
  if (!supportsProtocolHandler()) {
    return { success: false, reason: 'unsupported' };
  }

  try {
    const handlerUrl = `https://${instanceDomain}/authorize_interaction?uri=%s`;
    navigator.registerProtocolHandler('web+ap', handlerUrl);
    return { success: true };
  } catch (err) {
    return { success: false, reason: err.message };
  }
}

export function parseWebApUrl(url) {
  if (!url || typeof url !== 'string') return '';
  return url
    .replace(/^web\+ap:\/\//, '')
    .replace(/^https?:\/\/webap\.to\//, '');
}

export function buildAuthorizeUrl(homeInstance, targetUri) {
  const fullUri = targetUri.startsWith('http') ? targetUri : `https://${targetUri}`;
  return `https://${homeInstance}/authorize_interaction?uri=${encodeURIComponent(fullUri)}`;
}
