/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
import { PropertiesMixin } from '../../@polymer/polymer/lib/mixins/properties-mixin.js';
import { camelToDashCase } from '../../@polymer/polymer/lib/utils/case-map.js';
import { TemplateResult } from '../../lit-html/lit-html.js';
import { render } from '../../lit-html/lib/lit-extended.js';

export { html } from '../../lit-html/lib/lit-extended.js';
/**
 * Renders attributes to the given element based on the `attrInfo` object where
 * boolean values are added/removed as attributes.
 * @param {*} element Element on which to set attributes.
 * @param {*} attrInfo Object describing attributes.
 */
export function renderAttributes(element: HTMLElement, attrInfo: any) {
  for (const a in attrInfo) {
    const v = attrInfo[a] === true ? '' : attrInfo[a];
    if (v || v === '' || v === 0)  {
      if (element.getAttribute(a) !== v) {
        element.setAttribute(a, v);
      }
    } else if (element.hasAttribute(a)) {
      element.removeAttribute(a);
    }
  }
}

/**
 * Returns a string of css class names formed by taking the properties
 * in the `classInfo` object and appending the property name to the string of
 * class names if the property value is truthy.
 * @param {*} classInfo
 */
export function classString(classInfo: any) {
  const o = [];
  for (const name in classInfo) {
    const v = classInfo[name];
    if (v) {
      o.push(name);
    }
  }
  return o.join(' ');
}

/**
 * Returns a css style string formed by taking the properties in the `styleInfo`
 * object and appending the property name (dash-cased) colon the
 * property value. Properties are separated by a semi-colon.
 * @param {*} styleInfo
 */
export function styleString(styleInfo: any) {
  const o = [];
  for (const name in styleInfo) {
    const v = styleInfo[name];
    if (v || v === 0) {
      o.push(`${camelToDashCase(name)}: ${v}`);
    }
  }
  return o.join('; ');
}

export class LitElement extends PropertiesMixin(HTMLElement) {

  private __renderComplete: Promise<any>|null = null;
  private __resolveRenderComplete: Function|null = null;
  private __isInvalid: Boolean = false;
  private __isChanging: Boolean = false;

  protected ready() {
    this._root = this._createRoot();
    super.ready();
  }



  /**
   * Returns an
   * @returns {Node|ShadowRoot} Returns a node into which to render.
  */
  protected _createRoot() {
    return this.attachShadow({mode: 'open'});
  }

  /**
   * Override which always returns true so that `_propertiesChanged`
   * is called whenver properties are invalidated. This ensures `render`
   * is always called in response to `invalidate`.
   * @param {*} _props Current element properties
   * @param {*} _changedProps Changing element properties
   * @param {*} _prevProps Previous element properties
   * @returns {boolean} Default implementation always returns true.
   */
  protected _shouldPropertiesChange(_props: any, _changedProps: any, _prevProps: any) {
    return true;
  }

  /**
   * Override which always calls `render` and `didRender` to perform
   * element rendering.
   * @param {*} props Current element properties
   * @param {*} changedProps Changing element properties
   * @param {*} prevProps Previous element properties
   */
  protected _propertiesChanged(props: any, changedProps: any, prevProps: any) {
    this.__isChanging = true;
    this.__isInvalid = false;
    super._propertiesChanged(props, changedProps, prevProps);
    const result = this.render(props);
    if (result && this._root) {
      render(result, this._root);
    }
    this.didRender(props, changedProps, prevProps);
    if (this.__resolveRenderComplete) {
      this.__resolveRenderComplete();
    }
    this.__isChanging = false;
  }

  _shouldPropertyChange(property: String, value: any, old: any) {
    const change = super._shouldPropertyChange(property, value, old);
    if (change && this.__isChanging) {
      console.trace(`Setting propertyes in response to other properties changing considered harmful. Setting '${property}' from '${this._getProperty(property)}' to '${value}'.`);
    }
    return change;
  }

  /**
   * Returns a lit-html TemplateResult which is rendered into the element's
   * shadowRoot. This method must be implemented.
   * @param {*} _props Current element properties
   * @returns {TemplateResult} Must return a lit-html TemplateResult.
   */
  protected render(_props: any): TemplateResult {
    throw new Error('render() not implemented');
  }

  /**
   * Called after element dom has been rendered. Implement to
   * directly access element DOM.
   * @param {*} _props Current element properties
   * @param {*} _changedProps Changing element properties
   * @param {*} _prevProps Previous element properties
   */
  protected didRender(_props: any, _changedProps: any, _prevProps: any) {}

  /**
   * Provokes the element to asynchronously re-render.
   */
  invalidate() {
    this._invalidateProperties();
  }

  /**
   * Override which provides tracking of invalidated state.
  */
  _invalidateProperties() {
    this.__isInvalid = true;
    super._invalidateProperties();
  }

  /**
   * Returns a promise which resolves after the element next renders.
   */
  get renderComplete() {
    if (!this.__renderComplete) {
      // TODO(sorvell): handle rejected render.
      this.__renderComplete = new Promise((resolve) => {
        this.__resolveRenderComplete = () => {
          this.__resolveRenderComplete = this.__renderComplete = null;
          resolve();
        }
      });
      if (!this.__isInvalid && this.__resolveRenderComplete) {
        this.__resolveRenderComplete();
      }
    }
    return this.__renderComplete;
  }

}
