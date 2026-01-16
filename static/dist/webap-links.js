// SPDX-FileCopyrightText: 2025 Atikayda Pty Ltd
// SPDX-License-Identifier: AGPL-3.0-only

(function(global) {
  'use strict';

  const WEBAP_URL = 'https://webap.to';
  const DEFAULT_TIMEOUT = 2000;

  function parseWebApUrl(url) {
    let target = url;
    target = target.replace(/^web\+ap:\/\//, '');
    return target;
  }

  function tryProtocolHandler(url, onFail, timeout) {
    let hasBlurred = false;

    const onBlur = function() {
      hasBlurred = true;
    };

    window.addEventListener('blur', onBlur);

    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:absolute;width:0;height:0;border:0;visibility:hidden;';
    iframe.src = url;
    document.body.appendChild(iframe);

    setTimeout(function() {
      window.removeEventListener('blur', onBlur);
      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }

      if (!hasBlurred) {
        onFail();
      }
    }, timeout);
  }

  function handleLinkClick(e, link, options) {
    e.preventDefault();

    const href = link.getAttribute('href');
    const target = parseWebApUrl(href);

    if (!target) {
      console.warn('WebAP: Invalid web+ap:// URL', href);
      return;
    }

    tryProtocolHandler(
      href,
      function() {
        const fallbackUrl = (options.fallbackUrl || WEBAP_URL) + '/' + target;
        window.location.href = fallbackUrl;
      },
      options.timeout || DEFAULT_TIMEOUT
    );
  }

  function init(options = {}) {
    const {
      selector = 'a[href^="web+ap://"]',
      fallbackUrl = WEBAP_URL,
      timeout = DEFAULT_TIMEOUT,
    } = options;

    const links = document.querySelectorAll(selector);

    links.forEach(function(link) {
      link.addEventListener('click', function(e) {
        handleLinkClick(e, link, { fallbackUrl, timeout });
      });
    });

    return {
      count: links.length,
      links: Array.from(links),
    };
  }

  function enhance(link, options = {}) {
    if (typeof link === 'string') {
      link = document.querySelector(link);
    }

    if (!link) {
      console.error('WebAP: Link element not found');
      return null;
    }

    link.addEventListener('click', function(e) {
      handleLinkClick(e, link, options);
    });

    return link;
  }

  const WebAPLinks = {
    init,
    enhance,
    parseWebApUrl,
    version: '1.0.0',
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = WebAPLinks;
  } else {
    global.WebAPLinks = WebAPLinks;

    if (!global.WebAP) {
      global.WebAP = {};
    }
    global.WebAP.links = WebAPLinks;
    global.WebAP.init = init;
  }

})(typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : this);
