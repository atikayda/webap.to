// SPDX-FileCopyrightText: 2025 Atikayda Pty Ltd
// SPDX-License-Identifier: AGPL-3.0-only

(function(global) {
  'use strict';

  const WEBAP_URL = 'https://webap.to';
  const STORAGE_KEY = 'webap_home_instance';

  function supportsProtocolHandler() {
    return typeof navigator !== 'undefined' && 'registerProtocolHandler' in navigator;
  }

  function registerHandler(domain = window.location.host) {
    if (!supportsProtocolHandler()) {
      return { success: false, reason: 'unsupported' };
    }

    try {
      const handlerUrl = `https://${domain}/authorize_interaction?uri=%s`;
      navigator.registerProtocolHandler('web+ap', handlerUrl);
      return { success: true };
    } catch (err) {
      return { success: false, reason: err.message };
    }
  }

  function setHome(instanceDomain) {
    const domain = instanceDomain.toLowerCase().trim().replace(/^https?:\/\//, '').split('/')[0];

    try {
      localStorage.setItem(STORAGE_KEY, domain);
    } catch (e) {}

    const result = registerHandler();
    if (result.success) {
      return { success: true, method: 'native' };
    }

    if (result.reason === 'unsupported') {
      const returnUrl = encodeURIComponent(window.location.href);
      window.location.href = `${WEBAP_URL}/set-home?instance=${encodeURIComponent(domain)}&return=${returnUrl}`;
      return { success: true, method: 'fallback' };
    }

    console.warn('WebAP: Protocol handler failed:', result.reason);
    return { success: false, reason: result.reason };
  }

  function getHome() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  function clearHome() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (e) {
      return false;
    }
  }

  function createHomeButton(options = {}) {
    const {
      container,
      instanceDomain,
      buttonText = 'Set as Home Instance',
      buttonClass = 'webap-home-btn',
      onSuccess,
      onFallback,
    } = options;

    const containerEl = typeof container === 'string'
      ? document.querySelector(container)
      : container;

    if (!containerEl) {
      console.error('WebAP: Container not found');
      return null;
    }

    if (!instanceDomain) {
      console.error('WebAP: instanceDomain is required');
      return null;
    }

    const btn = document.createElement('button');
    btn.textContent = buttonText;
    btn.className = buttonClass;
    btn.type = 'button';

    btn.addEventListener('click', function() {
      const result = setHome(instanceDomain);

      if (result.method === 'native' && typeof onSuccess === 'function') {
        onSuccess(result);
      } else if (result.method === 'fallback' && typeof onFallback === 'function') {
        onFallback(result);
      }
    });

    containerEl.appendChild(btn);
    return btn;
  }

  const WebAP = {
    registerHandler,
    setHome,
    getHome,
    clearHome,
    createHomeButton,
    supportsProtocolHandler,
    version: '1.0.0',
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = WebAP;
  } else {
    global.WebAP = WebAP;
  }

})(typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : this);
