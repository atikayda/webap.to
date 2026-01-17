// SPDX-FileCopyrightText: 2025 Atikayda Pty Ltd
// SPDX-License-Identifier: AGPL-3.0-only

import { LitElement, html, css } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';

export class FaqAccordion extends LitElement {
  static properties = {
    openIndex: { type: Number },
  };

  static styles = css`
    :host {
      display: block;
      max-width: 800px;
      margin: 0 auto;
    }

    .faq-list {
      display: flex;
      flex-direction: column;
      gap: var(--size-2, 0.5rem);
    }

    .faq-item {
      background: white;
      border: 1px solid var(--gray-2, #e5e7eb);
      border-radius: 12px;
      overflow: hidden;
    }

    .faq-question {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--size-4, 1rem);
      background: none;
      border: none;
      cursor: pointer;
      text-align: left;
      font-family: inherit;
      font-size: var(--font-size-1, 0.875rem);
      font-weight: 500;
      color: var(--gray-9, #111827);
      transition: background 0.15s ease;
    }

    .faq-question:hover {
      background: var(--gray-1, #f9fafb);
    }

    .faq-question svg {
      width: 20px;
      height: 20px;
      color: var(--gray-5, #6b7280);
      transition: transform 0.2s ease;
      flex-shrink: 0;
    }

    .faq-item.open .faq-question svg {
      transform: rotate(180deg);
    }

    .faq-answer {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.3s ease;
    }

    .faq-item.open .faq-answer {
      max-height: 500px;
    }

    .faq-answer-content {
      padding: 0 var(--size-4, 1rem) var(--size-4, 1rem);
      color: var(--gray-6, #6b7280);
      font-size: var(--font-size-1, 0.875rem);
      line-height: 1.6;
    }

    .faq-answer-content p {
      margin: 0;
    }

    .faq-answer-content p + p {
      margin-top: var(--size-2, 0.5rem);
    }

    .faq-answer-content code {
      background: var(--gray-1, #f3f4f6);
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.9em;
    }

    .faq-answer-content a {
      color: var(--indigo-6, #6366f1);
      text-decoration: none;
    }

    .faq-answer-content a:hover {
      text-decoration: underline;
    }
  `;

  constructor() {
    super();
    this.openIndex = -1;
    this.faqs = [
      {
        question: 'What is web+ap://?',
        answer: html`<p><code>web+ap://</code> is a custom protocol scheme for ActivityPub content. It allows websites to create links that open in the user's preferred Fediverse instance, similar to how <code>mailto:</code> links open in your email client.</p>`
      },
      {
        question: 'Is my data stored anywhere?',
        answer: html`<p>No. Your home instance preference is stored only in your browser's localStorage. WebAP.to doesn't have accounts, doesn't track users, and doesn't store any personal information on servers.</p>`
      },
      {
        question: 'Which Fediverse platforms are supported?',
        answer: html`<p>Any platform that implements the <code>authorize_interaction</code> endpoint works with WebAP.to. This includes Mastodon, Pleroma, Akkoma, Pixelfed, and most other ActivityPub-compatible software.</p>`
      },
      {
        question: 'Why do I need to set a home instance?',
        answer: html`<p>When you interact with Fediverse content (like, boost, reply), you need to do it from your own account on your own instance. WebAP.to needs to know where to send you so you can complete the interaction.</p>`
      },
      {
        question: 'Does this work on Safari/iOS?',
        answer: html`<p>Safari doesn't support the <code>registerProtocolHandler</code> API, so native protocol handling isn't available. However, WebAP.to still works as a redirect service. For the best experience on iOS, install the WebAP native app (coming soon).</p>`
      },
      {
        question: 'How do I add web+ap:// links to my site?',
        answer: html`<p>Simply create links with the <code>web+ap://</code> protocol followed by the full URL path. For example: <code>&lt;a href="web+ap://mastodon.social/@user/123"&gt;View post&lt;/a&gt;</code></p><p>For browsers without protocol handler support, include our JavaScript snippet to provide a fallback.</p>`
      },
      {
        question: 'Is WebAP.to open source?',
        answer: html`<p>Sure is! WebAP.to is fully open source under the AGPL-3.0-only license. You can find the code on GitHub (check the footer of this page) and run your own instance if you prefer.</p>`
      },
      {
        question: 'Where can I find more information/report bugs/help out?',
        answer: html`<p>Head over to the GitHub site or our Matrix room (check the footer of this page) and check them out.</p>`
      },
      {
        question: 'What\'s the logo?',
        answer: html`<p>It's 2 screw-type carabiners linked together.</p>`
      },
    ];
  }

  toggleFaq(index) {
    this.openIndex = this.openIndex === index ? -1 : index;
  }

  render() {
    return html`
      <div class="faq-list">
        ${this.faqs.map((faq, index) => html`
          <div class="faq-item ${this.openIndex === index ? 'open' : ''}">
            <button class="faq-question" @click=${() => this.toggleFaq(index)}>
              <span>${faq.question}</span>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>
            <div class="faq-answer">
              <div class="faq-answer-content">
                ${faq.answer}
              </div>
            </div>
          </div>
        `)}
      </div>
    `;
  }
}

customElements.define('faq-accordion', FaqAccordion);
