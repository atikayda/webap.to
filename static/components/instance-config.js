// SPDX-FileCopyrightText: 2025 Atikayda Pty Ltd
// SPDX-License-Identifier: AGPL-3.0-only

import { LitElement, html, css } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';
import { getHomeInstance, setHomeInstance, clearHomeInstance, getConfig, setConfig, getSoftwareInfo, setHomeSoftware, setCategorySoftware, normalizeDomain } from '/js/storage.js';
import { registerHandler, supportsProtocolHandler } from '/js/protocol.js';

const GENERAL_PURPOSE_SOFTWARE = [
  'mastodon', 'pleroma', 'akkoma', 'misskey', 'firefish', 'iceshrimp', 'sharkey', 'catodon',
  'hometown', 'glitch-soc', 'gotosocial', 'honk', 'takahē', 'takahe', 'gnusocial',
  'friendica', 'hubzilla', 'diaspora', 'wafrn', 'guppe'
];

const SPECIALIZED_SOFTWARE = {
  pixelfed: 'photo',
  lemmy: 'community',
  piefed: 'community',
  kbin: 'community',
  mbin: 'community',
  peertube: 'video',
  funkwhale: 'music',
  mobilizon: 'social',
};

const PUBLISH_ONLY_SOFTWARE = [
  'writefreely', 'plume', 'wordpress', 'owncast', 'bookwyrm'
];

export class InstanceConfig extends LitElement {
  static properties = {
    instance: { type: String },
    status: { type: String },
    errorMessage: { type: String },
    isValidating: { type: Boolean },
    showSuccess: { type: Boolean },
    showAdvanced: { type: Boolean },
    config: { type: Object },
    softwareName: { type: String },
    advancedSoftware: { type: Object },
  };

  static styles = css`
    :host {
      display: block;
    }

    .config-card {
      background: white;
      border: 1px solid var(--gray-3, #e5e7eb);
      border-radius: 16px;
      padding: var(--size-5, 1.5rem);
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .config-header {
      margin-bottom: var(--size-4, 1rem);

      h3 {
        font-size: var(--font-size-3, 1.25rem);
        font-weight: 600;
        margin: 0 0 0.25rem 0;
        color: var(--gray-9, #111827);
      }

      p {
        font-size: var(--font-size-1, 0.875rem);
        color: var(--gray-6, #6b7280);
        margin: 0;
      }
    }

    .input-group {
      display: flex;
      gap: var(--size-2, 0.5rem);
      margin-bottom: var(--size-3, 0.75rem);
    }

    input {
      flex: 1;
      font-family: inherit;
      font-size: var(--font-size-1, 0.875rem);
      padding: var(--size-2, 0.5rem) var(--size-3, 0.75rem);
      border: 1px solid var(--gray-3, #e5e7eb);
      border-radius: 8px;
      background: white;
      color: var(--gray-9, #111827);

      &:focus {
        outline: none;
        border-color: var(--indigo-6, #6366f1);
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
      }

      &::placeholder {
        color: var(--gray-5, #9ca3af);
      }
    }

    button {
      font-family: inherit;
      font-size: var(--font-size-1, 0.875rem);
      font-weight: 500;
      padding: var(--size-2, 0.5rem) var(--size-4, 1rem);
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.15s ease;
      white-space: nowrap;
    }

    .btn-primary {
      background: var(--indigo-6, #6366f1);
      color: white;

      &:hover:not(:disabled) {
        background: var(--indigo-7, #4f46e5);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    .btn-secondary {
      background: var(--gray-1, #f3f4f6);
      color: var(--gray-7, #374151);
      border: 1px solid var(--gray-3, #e5e7eb);

      &:hover {
        background: var(--gray-2, #e5e7eb);
      }
    }

    .status-message {
      font-size: var(--font-size-0, 0.75rem);
      padding: var(--size-2, 0.5rem) var(--size-3, 0.75rem);
      border-radius: 6px;
      margin-top: var(--size-2, 0.5rem);

      &.status-error {
        background: var(--red-1, #fef2f2);
        color: var(--red-7, #b91c1c);
      }

      &.status-success {
        background: var(--green-1, #f0fdf4);
        color: var(--green-7, #15803d);
      }
    }

    .current-instance {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--size-3, 0.75rem);
      background: var(--indigo-1, #eef2ff);
      border-radius: 8px;
      margin-bottom: var(--size-3, 0.75rem);

      .current-instance-info {
        display: flex;
        align-items: center;
        gap: var(--size-2, 0.5rem);
      }

      .instance-icon {
        width: 20px;
        height: 20px;
        color: var(--indigo-6, #6366f1);
      }

      .instance-domain {
        font-weight: 500;
        color: var(--indigo-7, #4f46e5);
      }

      .platform-icon {
        width: 20px;
        height: 20px;
        flex-shrink: 0;
      }
    }

    .helper-text {
      font-size: var(--font-size-0, 0.75rem);
      color: var(--gray-5, #9ca3af);
      margin-top: var(--size-2, 0.5rem);
    }

    .protocol-note {
      display: flex;
      align-items: flex-start;
      gap: var(--size-2, 0.5rem);
      padding: var(--size-3, 0.75rem);
      background: var(--yellow-1, #fefce8);
      border-radius: 8px;
      margin-top: var(--size-3, 0.75rem);
      font-size: var(--font-size-0, 0.75rem);
      color: var(--yellow-8, #854d0e);
    }

    .advanced-toggle {
      display: flex;
      align-items: center;
      gap: var(--size-2, 0.5rem);
      padding: var(--size-2, 0.5rem) 0;
      margin-top: var(--size-3, 0.75rem);
      font-size: var(--font-size-0, 0.75rem);
      color: var(--gray-6, #6b7280);
      cursor: pointer;
      user-select: none;
      border: none;
      background: none;
      font-family: inherit;

      &:hover {
        color: var(--gray-7, #374151);
      }

      svg {
        transition: transform 0.2s ease;
      }

      &.open svg {
        transform: rotate(90deg);
      }
    }

    .advanced-section {
      margin-top: var(--size-3, 0.75rem);
      padding: var(--size-4, 1rem);
      background: var(--gray-1, #f9fafb);
      border-radius: 8px;
      border: 1px solid var(--gray-2, #e5e7eb);

      .advanced-description {
        font-size: var(--font-size-0, 0.75rem);
        color: var(--gray-6, #6b7280);
        margin-bottom: var(--size-4, 1rem);
        line-height: 1.5;
      }

      .advanced-row {
        display: flex;
        align-items: center;
        gap: var(--size-3, 0.75rem);
        margin-bottom: var(--size-3, 0.75rem);

        &:last-child {
          margin-bottom: 0;
        }
      }

      .advanced-label {
        flex: 0 0 90px;
        font-size: var(--font-size-0, 0.75rem);
        font-weight: 500;
        color: var(--gray-7, #374151);
      }

      .advanced-input-wrapper {
        flex: 1;
        display: flex;
        align-items: center;
        gap: var(--size-2, 0.5rem);
      }

      .advanced-input-icon {
        width: 20px;
        height: 20px;
        flex-shrink: 0;
        opacity: 0;
        transition: opacity 0.15s ease;

        &.visible {
          opacity: 1;
        }
      }

      .advanced-input {
        flex: 1;
        font-family: inherit;
        font-size: var(--font-size-0, 0.75rem);
        padding: var(--size-2, 0.5rem);
        border: 1px solid var(--gray-3, #e5e7eb);
        border-radius: 6px;
        background: white;
        color: var(--gray-9, #111827);
        transition: background-color 0.15s ease, border-color 0.15s ease;

        &:focus {
          outline: none;
          border-color: var(--indigo-6, #6366f1);
          box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
        }

        &::placeholder {
          color: var(--gray-4, #9ca3af);
        }

        &.incompatible {
          background: var(--red-1, #fef2f2);
          border-color: var(--red-3, #fca5a5);
        }
      }

      select.advanced-input {
        cursor: pointer;
      }

      .advanced-hint {
        font-size: 0.7rem;
        color: var(--gray-5, #6b7280);
        margin-top: -14px;
        margin-bottom: 12px;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px;

        .hint-icon {
          width: 14px;
          height: 14px;
          vertical-align: middle;
          opacity: 0.7;
          margin-right: -4px;
        }
      }

      .advanced-subheading {
        font-size: var(--font-size-0, 0.75rem);
        font-weight: 500;
        color: var(--gray-7, #374151);
        margin-top: var(--size-4, 1rem);
        margin-bottom: var(--size-3, 0.75rem);
      }

      .delay-warning {
        display: flex;
        align-items: flex-start;
        gap: var(--size-2, 0.5rem);
        padding: var(--size-2, 0.5rem) var(--size-3, 0.75rem);
        background: var(--yellow-1, #fefce8);
        border-radius: 6px;
        margin-top: var(--size-3, 0.75rem);
        font-size: var(--font-size-0, 0.75rem);
        color: var(--yellow-8, #854d0e);
      }
    }
  `;

  constructor() {
    super();
    this.instance = '';
    this.status = 'idle';
    this.errorMessage = '';
    this.isValidating = false;
    this.showSuccess = false;
    this.showAdvanced = false;
    this.config = {
      social: '',
      community: '',
      photo: '',
      video: '',
      music: '',
      blog: '',
      delay: 3,
    };
    this.softwareName = '';
    this.advancedSoftware = {};
  }

  connectedCallback() {
    super.connectedCallback();
    this.config = getConfig();
    const saved = getHomeInstance();
    if (saved) {
      this.instance = saved;
      this.status = 'configured';
    }
    const softwareInfo = getSoftwareInfo();
    this.softwareName = softwareInfo.home || '';
    this.advancedSoftware = softwareInfo.categories || {};
  }

  async validateInstance(domain) {
    try {
      const response = await fetch(`/api/software?instance=${encodeURIComponent(domain)}`);
      if (!response.ok) {
        throw new Error('Could not reach instance');
      }
      const data = await response.json();
      if (data.software) {
        return { valid: true, software: data.software };
      }
      return { valid: false, software: null };
    } catch {
      return { valid: false, software: null };
    }
  }

  getSoftwareIcon(software) {
    if (!software) return null;
    const normalized = software.toLowerCase().replace(/[^a-z0-9]/g, '');
    const aliases = { glitchsoc: 'glitch-soc', takah: 'takahē', takahe: 'takahē' };
    if (aliases[normalized]) return aliases[normalized];
    const known = new Set([
      'mastodon', 'pleroma', 'misskey', 'gotosocial', 'akkoma', 'firefish', 'iceshrimp',
      'sharkey', 'catodon', 'hometown', 'honk', 'gnusocial', 'friendica', 'hubzilla',
      'diaspora', 'wafrn', 'guppe', 'lemmy', 'piefed', 'kbin', 'mbin', 'pixelfed',
      'peertube', 'owncast', 'funkwhale', 'writefreely', 'plume', 'wordpress', 'bookwyrm', 'mobilizon',
    ]);
    return known.has(normalized) ? normalized : null;
  }

  async handleSubmit(e) {
    e.preventDefault();
    const input = this.shadowRoot.querySelector('input');
    const domain = normalizeDomain(input.value);

    if (!domain) {
      this.errorMessage = 'Please enter an instance domain';
      this.status = 'error';
      return;
    }

    this.isValidating = true;
    this.status = 'validating';

    const result = await this.validateInstance(domain);

    if (!result.valid) {
      this.isValidating = false;
      this.errorMessage = 'Could not connect to this instance. Please check the domain and try again.';
      this.status = 'error';
      return;
    }

    setHomeInstance(domain);
    this.instance = domain;
    this.softwareName = result.software;
    setHomeSoftware(result.software);
    this.isValidating = false;
    this.status = 'configured';
    this.showSuccess = true;

    const categories = ['social', 'community', 'photo', 'video', 'music', 'blog'];
    const newConfig = { ...this.config };
    const newAdvancedSoftware = { ...this.advancedSoftware };
    for (const cat of categories) {
      newConfig[cat] = domain;
      newAdvancedSoftware[cat] = result.software;
      setCategorySoftware(cat, result.software);
    }
    this.config = newConfig;
    this.advancedSoftware = newAdvancedSoftware;
    setConfig(this.config);

    if (supportsProtocolHandler()) {
      registerHandler(domain);
    }

    this.dispatchEvent(new CustomEvent('instance-configured', {
      detail: { instance: domain, software: result.software },
      bubbles: true,
      composed: true
    }));

    setTimeout(() => {
      this.showSuccess = false;
    }, 3000);
  }

  handleClear() {
    clearHomeInstance();
    this.instance = '';
    this.softwareName = '';
    this.advancedSoftware = {};
    this.status = 'idle';
  }

  handleInput(e) {
    if (this.status === 'error') {
      this.status = 'idle';
      this.errorMessage = '';
    }
  }

  toggleAdvanced() {
    this.showAdvanced = !this.showAdvanced;
  }

  async handleAdvancedInput(type, e) {
    const value = normalizeDomain(e.target.value);
    this.config = { ...this.config, [type]: value };
    setConfig(this.config);

    if (value) {
      const result = await this.validateInstance(value);
      if (result.valid && result.software) {
        this.advancedSoftware = { ...this.advancedSoftware, [type]: result.software };
        setCategorySoftware(type, result.software);
      } else {
        this.advancedSoftware = { ...this.advancedSoftware, [type]: null };
        setCategorySoftware(type, null);
      }
    } else {
      this.advancedSoftware = { ...this.advancedSoftware, [type]: null };
      setCategorySoftware(type, null);
    }
  }

  isIncompatible(category, software) {
    if (!software) return false;
    const normalized = software.toLowerCase();
    if (PUBLISH_ONLY_SOFTWARE.includes(normalized)) return true;
    if (GENERAL_PURPOSE_SOFTWARE.includes(normalized)) return false;
    const specialty = SPECIALIZED_SOFTWARE[normalized];
    return specialty && specialty !== category;
  }

  handleDelayChange(e) {
    const value = e.target.value === 'never' ? 'never' : parseInt(e.target.value, 10);
    this.config = { ...this.config, delay: value };
    setConfig(this.config);
  }

  renderAdvancedInput(category, label, placeholder, hints) {
    const value = this.config[category] || '';
    const software = this.advancedSoftware[category];
    const iconName = this.getSoftwareIcon(software);
    const incompatible = this.isIncompatible(category, software);

    return html`
      <div class="advanced-row">
        <label class="advanced-label">${label}</label>
        <div class="advanced-input-wrapper">
          <img
            src="/images/platforms/${iconName || 'mastodon'}.svg"
            alt=""
            class="advanced-input-icon ${value && iconName ? 'visible' : ''}"
          >
          <input
            type="text"
            class="advanced-input ${incompatible ? 'incompatible' : ''}"
            placeholder="${placeholder}"
            .value=${value}
            @change=${(e) => this.handleAdvancedInput(category, e)}
          >
        </div>
      </div>
      <div class="advanced-hint">
        eg: ${hints}
      </div>
    `;
  }

  renderAdvancedSection() {
    return html`
      <button
        class="advanced-toggle ${this.showAdvanced ? 'open' : ''}"
        @click=${this.toggleAdvanced}
      >
        <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
        </svg>
        Advanced
      </button>

      ${this.showAdvanced ? html`
        <div class="advanced-section">
          <p class="advanced-description">
            Here you can fine-tune your preferences to use different homeservers for different kinds of content, depending upon the destination server type.
          </p>

          ${this.renderAdvancedInput('social', 'Social', 'mastodon.social', html`
            <img src="/images/platforms/mastodon.svg" alt="" class="hint-icon">Mastodon
            <img src="/images/platforms/pleroma.svg" alt="" class="hint-icon">Pleroma
            <img src="/images/platforms/misskey.svg" alt="" class="hint-icon">Misskey
            <img src="/images/platforms/gotosocial.svg" alt="" class="hint-icon">GoToSocial
          `)}

          ${this.renderAdvancedInput('community', 'Community', 'lemmy.world', html`
            <img src="/images/platforms/lemmy.svg" alt="" class="hint-icon">Lemmy
            <img src="/images/platforms/piefed.svg" alt="" class="hint-icon">PieFed
            <img src="/images/platforms/kbin.svg" alt="" class="hint-icon">Kbin
            <img src="/images/platforms/mbin.svg" alt="" class="hint-icon">Mbin
          `)}

          ${this.renderAdvancedInput('photo', 'Photo', 'pixelfed.social', html`
            <img src="/images/platforms/pixelfed.svg" alt="" class="hint-icon">Pixelfed
          `)}

          ${this.renderAdvancedInput('video', 'Video', 'peertube.tv', html`
            <img src="/images/platforms/peertube.svg" alt="" class="hint-icon">PeerTube
            <img src="/images/platforms/owncast.svg" alt="" class="hint-icon">Owncast
          `)}

          ${this.renderAdvancedInput('music', 'Music', 'funkwhale.audio', html`
            <img src="/images/platforms/funkwhale.svg" alt="" class="hint-icon">Funkwhale
          `)}

          ${this.renderAdvancedInput('blog', 'Blog', 'write.as', html`
            <img src="/images/platforms/writefreely.svg" alt="" class="hint-icon">WriteFreely
            <img src="/images/platforms/plume.svg" alt="" class="hint-icon">Plume
            <img src="/images/platforms/wordpress.svg" alt="" class="hint-icon">WordPress
          `)}

          <p class="advanced-subheading">Configure the delay before being redirected:</p>

          <div class="advanced-row">
            <label class="advanced-label">Delay</label>
            <div class="advanced-input-wrapper">
              <div class="advanced-input-icon"></div>
              <select
                class="advanced-input"
                .value=${String(this.config.delay)}
                @change=${this.handleDelayChange}
              >
                <option value="0">Instant</option>
                <option value="1">1 second</option>
                <option value="2">2 seconds</option>
                <option value="3">3 seconds</option>
                <option value="5">5 seconds</option>
                <option value="10">10 seconds</option>
                <option value="never">Never (manual)</option>
              </select>
            </div>
          </div>

          ${this.config.delay === 0 ? html`
            <div class="delay-warning">
              <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
              <span>Instant redirect won't give you time to modify the URL or cancel.</span>
            </div>
          ` : ''}
        </div>
      ` : ''}
    `;
  }

  render() {
    const hasInstance = this.status === 'configured' && this.instance;

    return html`
      <div class="config-card">
        <div class="config-header">
          <h3>Your Home Instance</h3>
          <p>Set your Fediverse home to enable one-click interactions</p>
        </div>

        ${hasInstance ? html`
          <div class="current-instance">
            <div class="current-instance-info">
              ${this.softwareName && this.getSoftwareIcon(this.softwareName) ? html`
                <img class="platform-icon" src="/images/platforms/${this.getSoftwareIcon(this.softwareName)}.svg" alt="${this.softwareName}">
              ` : html`
                <svg class="instance-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
                </svg>
              `}
              <span class="instance-domain">${this.instance}</span>
            </div>
            <button class="btn-secondary" @click=${this.handleClear}>Change</button>
          </div>
          ${this.showSuccess ? html`
            <div class="status-message status-success">
              Home instance saved! You're ready to use web+ap:// links.
            </div>
          ` : ''}
          ${this.renderAdvancedSection()}
        ` : html`
          <form @submit=${this.handleSubmit}>
            <div class="input-group">
              <input
                type="text"
                placeholder="mastodon.social"
                .value=${this.instance}
                @input=${this.handleInput}
                ?disabled=${this.isValidating}
              >
              <button
                type="submit"
                class="btn-primary"
                ?disabled=${this.isValidating}
              >
                ${this.isValidating ? 'Checking...' : 'Set Home'}
              </button>
            </div>
          </form>

          ${this.status === 'error' ? html`
            <div class="status-message status-error">${this.errorMessage}</div>
          ` : ''}

          <p class="helper-text">
            Your preference is stored locally in your browser.
          </p>
        `}

        ${!supportsProtocolHandler() ? html`
          <div class="protocol-note">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
            </svg>
            <span>Your browser doesn't support native protocol handlers. WebAP.to will handle redirects for you.</span>
          </div>
        ` : ''}
      </div>
    `;
  }
}

customElements.define('instance-config', InstanceConfig);
