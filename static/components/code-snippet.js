// SPDX-FileCopyrightText: 2025 Atikayda Pty Ltd
// SPDX-License-Identifier: AGPL-3.0-only

import { LitElement, html, css } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';
import { unsafeHTML } from 'https://cdn.jsdelivr.net/npm/lit@3/directives/unsafe-html.js/+esm';

export class CodeSnippet extends LitElement {
  static properties = {
    code: { type: String },
    language: { type: String },
    copied: { type: Boolean },
  };

  static styles = css`
    :host {
      display: block;
    }

    .snippet-container {
      position: relative;
      margin-top: var(--size-3, 0.75rem);
    }

    pre {
      font-family: 'JetBrains Mono', monospace;
      font-size: var(--font-size-0, 0.75rem);
      background: var(--gray-9, #111827);
      color: var(--gray-2, #e5e7eb);
      padding: var(--size-4, 1rem);
      border-radius: 8px;
      overflow-x: auto;
      margin: 0;
      line-height: 1.6;
    }

    code {
      font-family: inherit;
    }

    .copy-btn {
      position: absolute;
      top: var(--size-2, 0.5rem);
      right: var(--size-2, 0.5rem);
      background: var(--gray-7, #374151);
      border: none;
      border-radius: 4px;
      padding: var(--size-1, 0.25rem) var(--size-2, 0.5rem);
      color: var(--gray-3, #d1d5db);
      font-size: var(--font-size-0, 0.75rem);
      font-family: inherit;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: var(--size-1, 0.25rem);
      transition: all 0.15s ease;
    }

    .copy-btn:hover {
      background: var(--gray-6, #4b5563);
      color: white;
    }

    .copy-btn svg {
      width: 14px;
      height: 14px;
    }

    .copy-btn.copied {
      background: var(--green-6, #16a34a);
      color: white;
    }

    .language-tag {
      position: absolute;
      bottom: var(--size-2, 0.5rem);
      right: var(--size-2, 0.5rem);
      font-size: 10px;
      color: var(--gray-5, #6b7280);
      text-transform: uppercase;
      font-family: 'JetBrains Mono', monospace;
    }

    .hl-tag { color: #f87171; }
    .hl-attr { color: #facc15; }
    .hl-value { color: #4ade80; }
    .hl-keyword { color: #c084fc; }
    .hl-string { color: #4ade80; }
    .hl-comment { color: #6b7280; font-style: italic; }
  `;

  constructor() {
    super();
    this.code = '';
    this.language = 'text';
    this.copied = false;
  }

  async copyToClipboard() {
    try {
      await navigator.clipboard.writeText(this.code);
      this.copied = true;
      setTimeout(() => {
        this.copied = false;
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }

  escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  highlightHtml(code) {
    const escaped = this.escapeHtml(code);

    return escaped
      .replace(/&lt;(\/?)([\w-]+)/g, '&lt;$1<span class="hl-tag">$2</span>')
      .replace(/([\w-]+)(=)(&quot;|&#039;)/g, '<span class="hl-attr">$1</span>$2$3')
      .replace(/(&quot;|&#039;)([^&]*)(&quot;|&#039;)/g, '$1<span class="hl-value">$2</span>$3');
  }

  highlightJs(code) {
    const escaped = this.escapeHtml(code);

    return escaped
      .replace(/\b(const|let|var|function|return|if|else|for|while|import|export|from|async|await|true|false|null|undefined)\b/g, '<span class="hl-keyword">$1</span>')
      .replace(/(&quot;|&#039;|`)([^&`]*)(\1)/g, '<span class="hl-string">$1$2$3</span>')
      .replace(/(\/\/.*$)/gm, '<span class="hl-comment">$1</span>');
  }

  getHighlightedCode() {
    switch (this.language) {
      case 'html':
        return this.highlightHtml(this.code);
      case 'javascript':
      case 'js':
        return this.highlightJs(this.code);
      default:
        return this.escapeHtml(this.code);
    }
  }

  render() {
    return html`
      <div class="snippet-container">
        <pre><code>${unsafeHTML(this.getHighlightedCode())}</code></pre>
        <button class="copy-btn ${this.copied ? 'copied' : ''}" @click=${this.copyToClipboard}>
          ${this.copied ? html`
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            Copied!
          ` : html`
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
            </svg>
            Copy
          `}
        </button>
        <span class="language-tag">${this.language}</span>
      </div>
    `;
  }
}

customElements.define('code-snippet', CodeSnippet);
