import { LitElement, html } from '@polymer/lit-element';

class MyElement extends LitElement {  
  static get properties(){
    return {
      textAreaId: String,
      startingText: String
    };
  }
  constructor(){
    super();
    this.textAreaId = 'myText';
    this.startingText = 'Focus me on first update';
  }
  render(){
    return html`
      <textarea id="${this.textAreaId}">${this.startingText}</textarea>
    `;
  }
  firstUpdated(changedProperties){
    changedProperties.forEach((oldValue, propName) => { 
      console.log(`${propName} changed. oldValue: ${oldValue}`);
    });
    const textArea = this.shadowRoot.getElementById(this.textAreaId);
    textArea.focus();
  }
}
customElements.define('my-element', MyElement);
