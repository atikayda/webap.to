// SPDX-FileCopyrightText: 2025 Atikayda Pty Ltd
// SPDX-License-Identifier: AGPL-3.0-only

import { LitElement, html, css } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';
import './instance-config.js';
import './redirect-handler.js';
import './code-snippet.js';
import './faq-accordion.js';

export class WebAPApp extends LitElement {
  static properties = {
    page: { type: String },
    linkInput: { type: String },
    generatedLink: { type: String },
  };

  static styles = css`
    :host {
      display: block;
      min-height: 100vh;
    }

    .header {
      background: white;
      border-bottom: 1px solid var(--gray-2, #e5e7eb);
      padding: var(--size-3, 0.75rem) 0;
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 var(--size-4, 1rem);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: var(--size-2, 0.5rem);
      font-size: var(--font-size-3, 1.25rem);
      font-weight: 700;
      color: var(--gray-9, #111827);
      text-decoration: none;
    }

    .logo-icon {
      width: 28px;
      height: 28px;
      color: var(--indigo-6, #6366f1);
    }

    .nav {
      display: flex;
      align-items: center;
      gap: var(--size-4, 1rem);
    }

    .nav a {
      color: var(--gray-6, #6b7280);
      text-decoration: none;
      font-size: var(--font-size-1, 0.875rem);
      font-weight: 500;
    }

    .nav a:hover {
      color: var(--indigo-6, #6366f1);
    }

    .github-link {
      display: flex;
      align-items: center;
    }

    .github-link svg {
      width: 24px;
      height: 24px;
    }

    main {
      padding: var(--size-6, 2rem) 0;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 var(--size-4, 1rem);
    }

    .hero {
      text-align: center;
      padding: var(--size-8, 4rem) 0;
    }

    .hero h1 {
      font-size: clamp(2rem, 5vw, 3rem);
      font-weight: 700;
      margin: 0 0 var(--size-3, 0.75rem) 0;
      color: var(--gray-9, #111827);
    }

    .hero .tagline {
      font-size: var(--font-size-3, 1.25rem);
      color: var(--gray-6, #6b7280);
      max-width: 600px;
      margin: 0 auto var(--size-6, 2rem);
    }

    .gradient-text {
      background: linear-gradient(135deg, var(--indigo-6, #6366f1), var(--purple-6, #9333ea));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .config-section {
      max-width: 500px;
      margin: 0 auto var(--size-8, 4rem);
    }

    .how-it-works {
      padding: var(--size-8, 4rem) 0;
      background: var(--gray-1, #f9fafb);
    }

    section[id] {
      scroll-margin-top: 80px;
    }

    .section-title {
      text-align: center;
      font-size: var(--font-size-5, 1.875rem);
      font-weight: 700;
      margin: 0 0 var(--size-6, 2rem) 0;
    }

    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: var(--size-4, 1rem);
    }

    .card {
      background: white;
      border: 1px solid var(--gray-2, #e5e7eb);
      border-radius: 16px;
      padding: var(--size-5, 1.5rem);
    }

    .card-icon {
      width: 48px;
      height: 48px;
      background: var(--indigo-1, #eef2ff);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: var(--size-3, 0.75rem);
    }

    .card-icon svg {
      width: 24px;
      height: 24px;
      color: var(--indigo-6, #6366f1);
    }

    .card h3 {
      font-size: var(--font-size-2, 1rem);
      font-weight: 600;
      margin: 0 0 var(--size-2, 0.5rem) 0;
    }

    .card p {
      font-size: var(--font-size-1, 0.875rem);
      color: var(--gray-6, #6b7280);
      margin: 0;
      line-height: 1.6;
    }

    .card-desc {
      margin-bottom: var(--size-2, 0.5rem);
    }

    .card.card-blue {
      background: var(--blue-0, #eff6ff);
      border-color: var(--blue-2, #bfdbfe);
    }

    .card.card-blue .card-icon {
      background: white;
    }

    .card.card-blue .card-icon svg {
      color: var(--blue-6, #2563eb);
    }

    .card.card-green {
      background: var(--green-0, #f0fdf4);
      border-color: var(--green-2, #bbf7d0);
    }

    .card.card-green .card-icon {
      background: white;
    }

    .card.card-green .card-icon svg {
      color: var(--green-6, #16a34a);
    }

    .card.card-purple {
      background: var(--purple-0, #faf5ff);
      border-color: var(--purple-2, #e9d5ff);
    }

    .card.card-purple .card-icon {
      background: white;
    }

    .card.card-purple .card-icon svg {
      color: var(--purple-6, #9333ea);
    }

    .link-generator {
      padding: var(--size-8, 4rem) 0;
    }

    .link-generator-card {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border: 1px solid var(--gray-2, #e5e7eb);
      border-radius: 16px;
      padding: var(--size-5, 1.5rem);
    }

    .link-generator-card h3 {
      font-size: var(--font-size-3, 1.25rem);
      font-weight: 600;
      margin: 0 0 var(--size-2, 0.5rem) 0;
    }

    .link-generator-card > p {
      color: var(--gray-6, #6b7280);
      font-size: var(--font-size-1, 0.875rem);
      margin: 0 0 var(--size-4, 1rem) 0;
    }

    .link-input-group {
      display: flex;
      gap: var(--size-2, 0.5rem);
      margin-bottom: var(--size-3, 0.75rem);
    }

    .link-input-group input {
      flex: 1;
      padding: var(--size-3, 0.75rem);
      border: 1px solid var(--gray-3, #d1d5db);
      border-radius: 8px;
      font-size: var(--font-size-1, 0.875rem);
      font-family: inherit;
    }

    .link-input-group input:focus {
      outline: none;
      border-color: var(--indigo-6, #6366f1);
      box-shadow: 0 0 0 3px var(--indigo-1, #eef2ff);
    }

    .link-input-group button {
      padding: var(--size-3, 0.75rem) var(--size-4, 1rem);
      background: var(--indigo-6, #6366f1);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: var(--font-size-1, 0.875rem);
      font-weight: 500;
      cursor: pointer;
      white-space: nowrap;
    }

    .link-input-group button:hover {
      background: var(--indigo-7, #4f46e5);
    }

    .generated-result {
      background: var(--gray-1, #f9fafb);
      border: 1px solid var(--gray-2, #e5e7eb);
      border-radius: 8px;
      padding: var(--size-3, 0.75rem);
    }

    .generated-result label {
      display: block;
      font-size: var(--font-size-0, 0.75rem);
      color: var(--gray-5, #6b7280);
      margin-bottom: var(--size-1, 0.25rem);
    }

    .generated-links {
      display: flex;
      flex-direction: column;
      gap: var(--size-2, 0.5rem);
    }

    .generated-link-row {
      display: flex;
      align-items: center;
      gap: var(--size-2, 0.5rem);
    }

    .generated-link-row code {
      flex: 1;
      font-family: 'JetBrains Mono', monospace;
      font-size: var(--font-size-0, 0.75rem);
      color: var(--indigo-7, #4f46e5);
      word-break: break-all;
    }

    .generated-link-row button {
      padding: var(--size-1, 0.25rem) var(--size-2, 0.5rem);
      background: var(--gray-2, #e5e7eb);
      border: none;
      border-radius: 4px;
      font-size: var(--font-size-0, 0.75rem);
      cursor: pointer;
      color: var(--gray-7, #374151);
    }

    .generated-link-row button:hover {
      background: var(--gray-3, #d1d5db);
    }

    .link-chip {
      display: inline-block;
      width: 36px;
      text-align: center;
      padding: var(--size-1, 0.25rem) 0;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 600;
      font-family: 'JetBrains Mono', monospace;
      flex-shrink: 0;
    }

    .link-chip.web {
      background: var(--blue-1, #dbeafe);
      color: var(--blue-7, #1d4ed8);
    }

    .link-chip.ap {
      background: var(--purple-1, #f3e8ff);
      color: var(--purple-7, #7c3aed);
    }

    .code-examples {
      padding: var(--size-8, 4rem) 0;
    }

    .code-steps {
      max-width: 700px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: var(--size-5, 1.5rem);
    }

    .code-step {
      display: flex;
      gap: var(--size-4, 1rem);
    }

    .step-number {
      flex-shrink: 0;
      width: 36px;
      height: 36px;
      background: var(--indigo-6, #6366f1);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: var(--font-size-1, 0.875rem);
    }

    .step-content {
      flex: 1;
      background: white;
      border: 1px solid var(--gray-2, #e5e7eb);
      border-radius: 12px;
      padding: var(--size-4, 1rem);
    }

    .step-content h3 {
      font-size: var(--font-size-2, 1rem);
      font-weight: 600;
      margin: 0 0 var(--size-2, 0.5rem) 0;
      color: var(--gray-9, #111827);
    }

    .step-content .card-desc {
      color: var(--gray-6, #6b7280);
      font-size: var(--font-size-1, 0.875rem);
      line-height: 1.6;
    }

    .faq-section {
      padding: var(--size-8, 4rem) 0;
      background: var(--gray-1, #f9fafb);
    }

    .footer {
      background: var(--gray-9, #111827);
      color: white;
      padding: var(--size-8, 4rem) 0 var(--size-4, 1rem);
    }

    .footer-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 var(--size-4, 1rem);
    }

    .footer-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: var(--size-6, 2rem);
      margin-bottom: var(--size-6, 2rem);
    }

    .footer-col h4 {
      font-size: var(--font-size-1, 0.875rem);
      font-weight: 600;
      margin: 0 0 var(--size-3, 0.75rem) 0;
      color: var(--gray-4, #9ca3af);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .footer-col ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .footer-col li {
      margin-bottom: var(--size-2, 0.5rem);
    }

    .footer-col a {
      color: var(--gray-3, #d1d5db);
      text-decoration: none;
      font-size: var(--font-size-1, 0.875rem);
      display: inline-flex;
      align-items: center;
      gap: var(--size-1, 0.25rem);
    }

    .footer-col a:hover {
      color: white;
    }

    .footer-bottom {
      border-top: 1px solid var(--gray-7, #374151);
      padding-top: var(--size-4, 1rem);
      text-align: center;
      color: var(--gray-5, #6b7280);
      font-size: var(--font-size-0, 0.75rem);
    }

    .footer-bottom p {
      margin: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--size-1, 0.25rem);
    }

    .footer-bottom a {
      display: inline-flex;
      align-items: center;
      gap: var(--size-1, 0.25rem);
      color: var(--gray-3, #d1d5db);
      text-decoration: none;
    }

    .footer-bottom a:hover {
      color: white;
    }

    .footer-icon {
      width: 16px;
      height: 16px;
    }

    .redirect-page {
      min-height: 80vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--size-4, 1rem);
    }

    @media (max-width: 768px) {
      .nav {
        gap: var(--size-3, 0.75rem);
      }

      .nav a:not(.github-link) {
        display: none;
      }
    }
  `;

  constructor() {
    super();
    this.page = 'home';
    this.linkInput = '';
    this.generatedLink = '';
  }

  generateLink() {
    if (!this.linkInput.trim()) return;

    let url = this.linkInput.trim();
    if (!url.match(/^https?:\/\//)) {
      url = 'https://' + url;
    }

    try {
      const parsed = new URL(url);
      this.generatedLink = parsed.host + parsed.pathname;
    } catch {
      this.generatedLink = '';
    }
  }

  async copyLink(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }

  handleHashClick(e) {
    const href = e.target.closest('a')?.getAttribute('href');
    if (href?.startsWith('#')) {
      e.preventDefault();
      const id = href.slice(1);
      const el = this.shadowRoot.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        history.pushState(null, '', href);
      }
    }
  }

  renderHeader() {
    return html`
      <header class="header">
        <div class="header-content">
          <a href="/" class="logo">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
              <g fill-rule="evenodd">
                <path fill="#a90093" d="M10.838 14.536Q12.303 16 14.373 16t3.535-1.464l4-4q1.697-1.638 1.585-3.782-.1-1.902-1.535-3.338-1.436-1.436-3.338-1.535-2.144-.112-3.794 1.597c-.092.095-1.225 1.362-1.225 1.362l1.55.587a.7.7 0 0 0 .666-.13c.173-.163.373-.352.448-.43q1.017-1.053 2.251-.989 1.135.06 2.028.952.892.893.952 2.028.064 1.234-1.002 2.264l-4 4q-2.121 2.12-4.242 0c-.031-.032-1.323-1.15-2.151-1.867a1.02 1.02 0 0 0-1.337.028l-.473.444a.358.358 0 0 0 .008.539c.698.618 2.385 2.116 2.54 2.27m-.925-7.454 4.28 1.711q.059.024.122.028t.125-.012q.06-.015.114-.049.054-.033.095-.082l.824-.989-4.278-1.71q-.059-.023-.122-.028-.063-.004-.124.012-.061.015-.115.049-.053.033-.094.082zm1.153-1.4 4.277 1.711q.06.023.122.028.064.004.125-.012.061-.015.115-.049t.094-.082l.824-.989-4.275-1.71q-.06-.023-.122-.028-.063-.004-.125.012-.061.015-.115.049-.053.033-.094.082z"/>
                <path fill="#0063a9" d="M13.162 9.464Q11.697 8 9.627 8T6.092 9.464l-4 4Q.395 15.102.507 17.246q.1 1.901 1.535 3.338 1.436 1.436 3.338 1.535 2.144.112 3.794-1.597c.092-.095 1.225-1.362 1.225-1.362l-1.55-.587a.7.7 0 0 0-.666.13 19 19 0 0 0-.448.43q-1.018 1.053-2.251.989-1.135-.06-2.028-.952-.892-.893-.952-2.028-.064-1.234 1.002-2.264l4-4q2.121-2.12 4.242 0c.031.032 1.323 1.15 2.151 1.867a1.02 1.02 0 0 0 1.337-.028l.473-.444a.358.358 0 0 0-.008-.539 238 238 0 0 1-2.54-2.27m.925 7.454-4.28-1.711q-.059-.024-.122-.028t-.125.012q-.06.015-.114.049-.054.033-.095.082l-.824.989 4.278 1.71q.059.023.122.028.063.004.124-.012.061-.015.115-.049.053-.033.094-.082zm-1.153 1.4-4.277-1.711q-.06-.023-.122-.028-.064-.004-.125.012-.061.015-.115.049t-.094.082l-.824.989 4.275 1.71q.06.023.122.028.063.004.125-.012.061-.015.115-.049.053-.033.094-.082z"/>
              </g>
            </svg> WebAP.to
          </a>
          <nav class="nav" @click=${this.handleHashClick}>
            <a href="#how-it-works">How it works</a>
            <a href="#create-link">Create link</a>
            <a href="#faq">FAQ</a>
            <a href="https://github.com/atikayda/webap.to" class="github-link" target="_blank" rel="noopener">
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd"/>
              </svg>
            </a>
          </nav>
        </div>
      </header>
    `;
  }

  renderHomePage() {
    return html`
      ${this.renderHeader()}
      <main>
        <section class="hero">
          <div class="container">
            <h1>One-click <span class="gradient-text">Fediverse</span> interactions</h1>
            <p class="tagline">Click web+ap:// links anywhere to interact with Fediverse content from your home instance. No more copy-pasting URLs.</p>
          </div>
        </section>

        <section class="config-section">
          <div class="container">
            <instance-config></instance-config>
          </div>
        </section>

        <section class="how-it-works" id="how-it-works">
          <div class="container">
            <h2 class="section-title">How it works</h2>
            <div class="cards-grid">
              <div class="card card-blue">
                <div class="card-icon">
                  <svg fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
                <h3>For Users</h3>
                <p>Set your home instance once. Click web+ap:// links anywhere on the web and instantly interact from your account.</p>
              </div>
              <div class="card card-green">
                <div class="card-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
                  </svg>
                </div>
                <h3>For Publishers</h3>
                <p>Add web+ap:// links to your content. Users can like, boost, or reply with a single click from their own instance.</p>
              </div>
              <div class="card card-purple">
                <div class="card-icon">
                  <svg fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
                  </svg>
                </div>
                <h3>For Instance Admins</h3>
                <p>Add a "Set as home" button to let users register your instance as their home. Works with native protocol handlers.</p>
              </div>
            </div>
          </div>
        </section>

        <section class="link-generator" id="create-link">
          <div class="container">
            <h2 class="section-title">Create a link</h2>
            <div class="link-generator-card">
              <h3>Create a link to:</h3>
              <p>Enter any Fediverse URL to create a link you can share</p>
              <div class="link-input-group">
                <input
                  type="text"
                  placeholder="https://mastodon.social/@user/123456"
                  .value=${this.linkInput}
                  @input=${(e) => this.linkInput = e.target.value}
                  @keydown=${(e) => e.key === 'Enter' && this.generateLink()}
                />
                <button @click=${this.generateLink}>Generate</button>
              </div>
              ${this.generatedLink ? html`
                <div class="generated-result">
                  <label>Your links:</label>
                  <div class="generated-links">
                    <div class="generated-link-row">
                      <span class="link-chip web">WEB</span>
                      <code>https://webap.to/${this.generatedLink}</code>
                      <button @click=${() => this.copyLink(`https://webap.to/${this.generatedLink}`)}>Copy</button>
                    </div>
                    <div class="generated-link-row">
                      <span class="link-chip ap">AP</span>
                      <code>web+ap://${this.generatedLink}</code>
                      <button @click=${() => this.copyLink(`web+ap://${this.generatedLink}`)}>Copy</button>
                    </div>
                  </div>
                </div>
              ` : ''}
            </div>
          </div>
        </section>

        <section class="code-examples" id="publishers">
          <div class="container">
            <h2 class="section-title">Add to your site (for publishers)</h2>
            <div class="code-steps">
              <div class="code-step">
                <div class="step-number">1</div>
                <div class="step-content">
                  <h3>Initialise web+ap support</h3>
                  <p class="card-desc">Add this script to your page. It handles clicks on web+ap:// links and redirects users through WebAP.to if they don't have a protocol handler installed.</p>
                  <code-snippet language="html" .code=${`<script src="https://webap.to/dist/webap-links.js"></script>
<script>
  WebAP.init();
</script>`}></code-snippet>
                </div>
              </div>
              <div class="code-step">
                <div class="step-number">2</div>
                <div class="step-content">
                  <h3>Add web+ap:// links</h3>
                  <p class="card-desc">Link to any Fediverse content. Users will be redirected to interact from their home instance.</p>
                  <code-snippet language="html" .code=${`<a href="web+ap://mastodon.social/@user">
  Follow me on the fediverse!
</a>

<a href="web+ap://pixelfed.social/p/abc123">
  Like, reply or boost this post
</a>`}></code-snippet>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="code-examples how-it-works" id="instance-owners">
          <div class="container">
            <h2 class="section-title">Add to your instance (for admins)</h2>
            <div class="code-steps">
              <div class="code-step">
                <div class="step-number">1</div>
                <div class="step-content">
                  <h3>Add the WebAP script</h3>
                  <p class="card-desc">Include this script on your instance's settings or about page.</p>
                  <code-snippet language="html" .code=${`<script src="https://webap.to/dist/webap-instance.js"></script>`}></code-snippet>
                </div>
              </div>
              <div class="code-step">
                <div class="step-number">2</div>
                <div class="step-content">
                  <h3>Add a "Set as Home" button</h3>
                  <p class="card-desc">Let users register your instance as their home for web+ap:// links. Replace the domain with your instance.</p>
                  <code-snippet language="html" .code=${`<div id="webap-button"></div>
<script>
  WebAP.createHomeButton({
    container: '#webap-button',
    instanceDomain: 'your-instance.social'
  });
</script>`}></code-snippet>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="faq-section" id="faq">
          <div class="container">
            <h2 class="section-title">FAQ</h2>
            <faq-accordion></faq-accordion>
          </div>
        </section>
      </main>

      ${this.renderFooter()}
    `;
  }

  renderRedirectPage() {
    return html`
      ${this.renderHeader()}
      <main class="redirect-page">
        <redirect-handler></redirect-handler>
      </main>
    `;
  }

  renderSetHomePage() {
    const params = new URLSearchParams(window.location.search);
    const instance = params.get('instance');
    const returnUrl = params.get('return');

    return html`
      ${this.renderHeader()}
      <main class="redirect-page">
        <instance-config
          .prefilledInstance=${instance}
          @instance-configured=${() => {
            if (returnUrl) {
              window.location.href = returnUrl;
            }
          }}
        ></instance-config>
      </main>
    `;
  }

  renderFooter() {
    return html`
      <footer class="footer">
        <div class="footer-content">
          <div class="footer-grid" @click=${this.handleHashClick}>
            <div class="footer-col">
              <h4>Learn</h4>
              <ul>
                <li><a href="#how-it-works">How it works</a></li>
                <li><a href="#faq">FAQ</a></li>
                <li><a href="https://activitypub.rocks" target="_blank" rel="noopener">About ActivityPub</a></li>
              </ul>
            </div>
            <div class="footer-col">
              <h4>Developers</h4>
              <ul>
                <li><a href="#publishers">Publisher Integration</a></li>
                <li><a href="#instance-owners">Instance Integration</a></li>
                <li><a href="/dist/webap-links.js">Links Snippet</a></li>
              </ul>
            </div>
            <div class="footer-col">
              <h4>Community</h4>
              <ul>
                <li>
                  <a href="https://github.com/atikayda/webap.to" target="_blank" rel="noopener">
                    <svg class="footer-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 19c-4.3 1.4 -4.3 -2.5 -6 -3m12 5v-3.5c0 -1 .1 -1.4 -.5 -2c2.8 -.3 5.5 -1.4 5.5 -6a4.6 4.6 0 0 0 -1.3 -3.2a4.2 4.2 0 0 0 -.1 -3.2s-1.1 -.3 -3.5 1.3a12.3 12.3 0 0 0 -6.2 0c-2.4 -1.6 -3.5 -1.3 -3.5 -1.3a4.2 4.2 0 0 0 -.1 3.2a4.6 4.6 0 0 0 -1.3 3.2c0 4.6 2.7 5.7 5.5 6c-.6 .6 -.6 1.2 -.5 2v3.5"/></svg>
                    GitHub
                  </a>
                </li>
                <li>
                  <a href="https://matrix.to/#/#web-ap:chat.blahaj.zone" target="_blank" rel="noopener">
                    <svg class="footer-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 3h-1v18h1"/><path d="M20 21h1v-18h-1"/><path d="M7 9v6"/><path d="M12 15v-3.5a2.5 2.5 0 1 0 -5 0v.5"/><path d="M17 15v-3.5a2.5 2.5 0 1 0 -5 0v.5"/></svg>
                    Matrix
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div class="footer-bottom">
            <p>
              Brought to you by
              <a href="https://blahaj.zone" target="_blank" rel="noopener">
                <svg class="footer-icon" viewBox="0 0 415 508" fill="currentColor"><path d="M315.657 1.587c-10.702 1.757-21.054 5.388-31.216 9.178-22.268 8.304-44.21 17.839-64.869 29.588-15.363 8.738-29.219 19.9-43.572 30.214-4.129 2.967-8.137 6.1-12.235 9.108l-.092.068c-9.964 8.113-19.552 16.68-29.111 25.267-.972.873-2.104 1.956-2.87 2.668-20.589 1.105-37.37 5.651-54.361 13.364-15.7 7.126-29.082 18.683-42.36 29.68-8.914 7.382-17.372 15.411-24.873 24.224-3.389 3.982-6.88 9.179-9.008 12.842L0 189.666s.968 1.076 1.442 1.623c7.547 8.721 16.41 16.539 22.3 26.455 3.827 6.443 6.137 13.733 8.162 20.949.962 3.43 1.564 7.536 1.868 10.523-1.422 5.557-5.082 16.177-7.477 24.31-1.908 6.478-4.3 12.854-5.491 19.501-1.532 8.541-1.928 17.273-2.091 25.949-.007.358.015.717.046 1.074 1.033 11.75 1.22 23.799 4.674 35.077 3.233 10.555 8.724 20.404 14.761 29.646 3.5 5.359 5.157 6.436 12.3 14.746 1.994 2.318 3.336 3.885 4.029 4.701.54.636.948 1.124 1.226 1.463l.153.103c.007.013.914 8.476 1.412 12.71.693 5.897.787 11.908 2.193 17.676 1.88 7.71 4.277 15.468 8.274 22.324 4.62 7.925 10.656 15.212 17.742 21.038 10.324 8.49 22.48 14.957 35.072 19.443 15.257 5.436 31.636 7.945 47.818 8.62 7.845.327 15.671-1.158 23.449-2.234.942-.13 1.872-.339 2.807-.511.273-.05.546-.1.819-.152.055-.01.11-.024.165-.032 1.382-.193 4.172-.359 4.172-.359s-1.115-2.56-1.682-3.836a97.5 97.5 0 0 0-1.716-3.809c-4.5-9.331-8.722-18.856-14.227-27.632-6.299-10.041-9.899-14-21.38-28.415 20.904 8.883 27.07 12.566 41.497 15.95 5.678 1.332 11.69 2.734 17.419 1.64 8.088-1.545 15.156-6.653 22.01-11.217 6.083-4.05 11.254-9.33 16.718-14.183l.057-.053c5.57-5.42 10.891-11.088 16.337-16.632 2.62-2.667 7.859-8.001 7.859-8.001l-11.133-1.285c-36.795-4.308-50.649-5.681-75.543-10.942-17.457-3.689-29.899-7.604-51.549-14.415l-.026-.009-.197-.062.074-.112.032-.047c8.525-12.815 15.917-20.506 25.827-28.728 10.254-8.508 22.521-14.272 34.148-20.78 1.994-1.116 4.067-2.085 6.1-3.129 2.236-1.148 6.706-3.447 6.706-3.447 17.999 3.613 32.273 5.314 48.572 6.013 11.701.502 23.596.82 35.112-1.315 5.089-.943 10.298-2.286 14.693-5.019 3.331-2.071 6.472-4.854 8.337-8.305.93-1.72 1.15-4.238 1.187-5.743 9.179-8.528 16.301-16.041 21.365-22.539 8.903 3.637 16.973 7.175 26.004 8.18 13.359 1.486 27.504 1.11 40.184-3.35.18-.064.34-.186.476-.321.136-.135.332-.282.324-.473-.912-21.132-8.237-23.911-40.237-49.066.36-.752.858-1.697 1.235-2.569 5.113-11.829 9.765-23.869 13.904-36.073l.015-.051.013-.051c2.874-12.125 5.974-24.22 8.007-36.514 1.336-8.079 1.916-16.265 2.743-24.411.495-4.879.849-9.772 1.329-14.653l.009-.085c0-.028.004-.057.004-.085.113-15.714.974-31.606-1.539-47.118-1.526-9.42-4.601-18.586-8.148-27.446-4.632-11.573-8.196-19.428-13.086-26.377-5.866-8.335-12.627-16.375-20.921-22.3-5.632-4.022-12.137-7.208-18.931-8.527-7.736-1.503-15.847-.393-23.624 0.835zM382.774 171.709c1.01-.16 2.002-.491 2.976-.993-4.474 27.228-10.435 47.499-20.859 69.229-7.546 15.732-18.873 29.414-29.637 43.146-4.848 6.185-10.923 12.668-15.683 17.602-7.692-10.791-13.648-18.094-22.486-24.979-8.992-7.005-19.927-11.11-30.24-15.964-5.606-2.639-11.755-5.011-17.161-7.138 2.978-4.1 6.605-10 8.333-15.652 5.172-16.916 1.981-35.447 5.518-52.778 4.126-20.214 4.319-43.894 18.202-59.154 25.625-28.167 54.666-33.693 105.531-43.742 2.943 19.054 3.606 39.248 1.991 60.581 0 0-.874 1.901-1.334 2.84-1.884 3.85-3.665 7.762-5.838 11.456-.535.909-1.293 2.058-1.766 2.625-.038.046-.074.088-.107.126-2.027.04-6.423-2.472-9.541-3.922-3.399-1.58-6.436-3.952-9.971-5.197-.662-.233-1.353-.387-2.064-.411-.71-.024-1.432.018-2.087.27-5.083 1.955-9.032 6.092-13.432 9.3-4.387 3.198-9.135 7.812-12.924 9.913-3.646-3.253-10.766-13.143-15.785-19.992-.362-.494-.596-1.09-1.032-1.52-1.179-1.163-2.52-2.423-4.146-2.737-1.628-.315-3.416.207-4.875.996-.743.402-1.318 1.097-1.784 1.802-.466.705-.797 1.518-.958 2.348-.16.83-.156 1.708.013 2.536.169.829.535 1.621.982 2.339 6.43 10.324 13.644 21.076 23.962 27.515.786.491 1.738.675 2.686.719.947.044 1.883-.117 2.74-.469 7.518-3.084 13.528-9.026 19.994-13.948 2.251-1.714 4.91-4.357 6.533-5.417 1.487.749 3.559 2.048 5.357 3.038 2.661 1.465 5.143 3.378 8.039 4.295 3.475 1.1 7.304 1.899 10.853 1.337zM211.607 143.682c1.702 12.132 3.492 24.826 9.497 35.504 2.919 5.191 6.395 12.79 12.349 12.911 3.636.074 6.194-4.336 7.858-7.57 4.962-9.648 5.173-21.361 4.736-32.201-.652-16.176-5.037-32.24-10.912-47.325-2.36-6.059-5.427-12.001-9.626-16.965-1.964-2.321-4.045-5.959-7.078-5.753-1.96.133-3.094 2.572-4.027 4.3-2.38 4.406-2.986 9.624-3.536 14.6-1.557 14.083-1.23 28.468.739 42.499zm-50.141 164.676c15.407 5.298 29.662 9.632 42.766 13.001-17.763 8.369-28.753 14.266-41.101 24.311-9.185 7.472-16.355 17.151-23.93 26.252-.386.464-.788 1.039-1.095 1.443-.399.027-.882.032-1.45.016-2.007-.056-4.313-.152-6.326-.84-4.44-1.518-10.201-2.817-12.168-7.077-2.625-5.684.39-12.961 3.341-18.484 8.729-16.34 20.072-23.513 39.963-38.622z"/></svg>
                Blåhaj Zone
              </a>
            </p>
          </div>
        </div>
      </footer>
    `;
  }

  render() {
    switch (this.page) {
      case 'redirect':
        return this.renderRedirectPage();
      case 'set-home':
        return this.renderSetHomePage();
      default:
        return this.renderHomePage();
    }
  }
}

customElements.define('webap-app', WebAPApp);
