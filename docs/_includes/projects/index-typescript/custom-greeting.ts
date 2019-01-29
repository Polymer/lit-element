import { LitElement, html, property } from 'lit-element';

export class CustomGreeting extends LitElement {
  @property() name = 'World';
  render() {
    return html`<p>Hello, ${this.name}!</p>`;
  }
}

customElements.define('custom-greeting', CustomGreeting);
