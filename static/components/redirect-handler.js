// SPDX-FileCopyrightText: 2025 Atikayda Pty Ltd
// SPDX-License-Identifier: AGPL-3.0-only

import { LitElement, html, css } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';
import { getHomeInstance, setPendingRedirect, getConfig } from '/js/storage.js';
import { parseWebApUrl, buildAuthorizeUrl } from '/js/protocol.js';

export class RedirectHandler extends LitElement {
  static properties = {
    target: { type: String },
    status: { type: String },
    homeInstance: { type: String },
    countdown: { type: Number },
    redirectUrl: { type: String },
  };

  static styles = css`
    :host {
      display: block;
    }

    .redirect-card {
      max-width: 500px;
      margin: 0 auto;
      background: white;
      border: 1px solid var(--gray-3, #e5e7eb);
      border-radius: 16px;
      padding: var(--size-6, 2rem);
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      text-align: center;
    }

    .spinner {
      width: 48px;
      height: 48px;
      margin: 0 auto var(--size-4, 1rem);
      border: 3px solid var(--gray-2, #e5e7eb);
      border-top-color: var(--indigo-6, #6366f1);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    h2 {
      font-size: var(--font-size-4, 1.5rem);
      font-weight: 600;
      margin: 0 0 var(--size-2, 0.5rem) 0;
      color: var(--gray-9, #111827);
    }

    .target-url {
      font-family: 'JetBrains Mono', monospace;
      font-size: var(--font-size-0, 0.75rem);
      background: var(--gray-1, #f3f4f6);
      padding: var(--size-2, 0.5rem) var(--size-3, 0.75rem);
      border-radius: 6px;
      color: var(--gray-7, #374151);
      word-break: break-all;
      margin: var(--size-4, 1rem) 0;
    }

    .status-text {
      color: var(--gray-6, #6b7280);
      font-size: var(--font-size-1, 0.875rem);
    }

    .needs-config {
      text-align: left;
    }

    .needs-config h2 {
      text-align: center;
      margin-bottom: var(--size-4, 1rem);
    }

    .needs-config p {
      color: var(--gray-6, #6b7280);
      margin-bottom: var(--size-4, 1rem);
      text-align: center;
    }

    .error-icon {
      width: 48px;
      height: 48px;
      margin: 0 auto var(--size-4, 1rem);
      color: var(--red-6, #dc2626);
    }

    .btn-primary {
      display: inline-block;
      font-family: inherit;
      font-size: var(--font-size-1, 0.875rem);
      font-weight: 500;
      padding: var(--size-2, 0.5rem) var(--size-4, 1rem);
      border: none;
      border-radius: 8px;
      cursor: pointer;
      background: var(--indigo-6, #6366f1);
      color: white;
      text-decoration: none;
      margin-top: var(--size-3, 0.75rem);
    }

    .btn-primary:hover {
      background: var(--indigo-7, #4f46e5);
    }

    .countdown {
      font-size: var(--font-size-5, 2rem);
      font-weight: 600;
      color: var(--indigo-6, #6366f1);
      margin: var(--size-3, 0.75rem) 0;
    }

    .btn-group {
      display: flex;
      gap: var(--size-2, 0.5rem);
      justify-content: center;
      margin-top: var(--size-4, 1rem);
    }

    .btn-secondary {
      display: inline-block;
      font-family: inherit;
      font-size: var(--font-size-1, 0.875rem);
      font-weight: 500;
      padding: var(--size-2, 0.5rem) var(--size-4, 1rem);
      border: 1px solid var(--gray-3, #e5e7eb);
      border-radius: 8px;
      cursor: pointer;
      background: white;
      color: var(--gray-7, #374151);
      text-decoration: none;
    }

    .btn-secondary:hover {
      background: var(--gray-1, #f3f4f6);
    }
  `;

  constructor() {
    super();
    this.target = '';
    this.status = 'loading';
    this.homeInstance = null;
    this.countdown = 0;
    this.redirectUrl = '';
    this._countdownTimer = null;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._countdownTimer) {
      clearInterval(this._countdownTimer);
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this.parseAndRedirect();
  }

  parseAndRedirect() {
    const url = new URL(window.location.href);

    let target;
    if (url.searchParams.has('uri')) {
      target = parseWebApUrl(url.searchParams.get('uri'));
    } else {
      target = parseWebApUrl(url.pathname.slice(1));
    }

    if (!target || target === '' || target === 'handle.html') {
      this.status = 'error';
      return;
    }

    this.target = target;
    this.homeInstance = getHomeInstance();

    if (this.homeInstance) {
      this.initiateRedirect();
    } else {
      setPendingRedirect(this.target);
      this.status = 'needs-config';
    }
  }

  startCountdown() {
    this._countdownTimer = setInterval(() => {
      this.countdown -= 1;
      if (this.countdown <= 0) {
        clearInterval(this._countdownTimer);
        window.location.href = this.redirectUrl;
      }
    }, 1000);
  }

  initiateRedirect() {
    const config = getConfig();
    this.redirectUrl = buildAuthorizeUrl(this.homeInstance, this.target);

    if (config.delay === 'never') {
      this.status = 'manual';
    } else if (config.delay === 0) {
      window.location.href = this.redirectUrl;
    } else {
      this.countdown = config.delay;
      this.status = 'redirecting';
      this.startCountdown();
    }
  }

  redirectNow() {
    if (this._countdownTimer) {
      clearInterval(this._countdownTimer);
    }
    window.location.href = this.redirectUrl;
  }

  cancelRedirect() {
    if (this._countdownTimer) {
      clearInterval(this._countdownTimer);
    }
    this.status = 'manual';
  }

  render() {
    if (this.status === 'loading') {
      return html`
        <div class="redirect-card">
          <div class="spinner"></div>
          <h2>Loading...</h2>
        </div>
      `;
    }

    if (this.status === 'error') {
      return html`
        <div class="redirect-card">
          <svg class="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
          <h2>Invalid Link</h2>
          <p class="status-text">This doesn't appear to be a valid web+ap:// link.</p>
          <a href="/" class="btn-primary">Go to WebAP.to</a>
        </div>
      `;
    }

    if (this.status === 'redirecting') {
      return html`
        <div class="redirect-card">
          <div class="spinner"></div>
          <h2>Redirecting...</h2>
          <div class="countdown">${this.countdown}</div>
          <div class="target-url">${this.target}</div>
          <p class="status-text">Taking you to ${this.homeInstance}</p>
          <div class="btn-group">
            <button class="btn-primary" @click=${this.redirectNow}>Go Now</button>
            <button class="btn-secondary" @click=${this.cancelRedirect}>Cancel</button>
          </div>
        </div>
      `;
    }

    if (this.status === 'manual') {
      return html`
        <div class="redirect-card">
          <h2>Ready to Redirect</h2>
          <div class="target-url">${this.target}</div>
          <p class="status-text">Click the button to go to ${this.homeInstance}</p>
          <button class="btn-primary" @click=${this.redirectNow}>Open on ${this.homeInstance}</button>
        </div>
      `;
    }

    if (this.status === 'needs-config') {
      return html`
        <div class="redirect-card needs-config">
          <h2>Set Your Home Instance</h2>
          <p>To interact with this content, we need to know your Fediverse home.</p>
          <div class="target-url">${this.target}</div>
          <instance-config @instance-configured=${this.handleConfigured}></instance-config>
        </div>
      `;
    }

    return html``;
  }

  handleConfigured(e) {
    this.homeInstance = e.detail.instance;
    this.initiateRedirect();
  }
}

customElements.define('redirect-handler', RedirectHandler);
