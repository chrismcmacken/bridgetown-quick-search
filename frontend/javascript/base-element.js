import { LitElement } from "lit"

export class BaseElement extends LitElement {
  static customElementRegistry = window.customElements
  static baseName

  /**
   * @param {string} [name] - Name of custom element
   * @param {CustomElementConstructor} [ctor] - The constructor of the element
   * @param {ElementDefinitionOptions} [options] - Options for initialization

   */
  static define (
    name,
    ctor,
    options
  ) {
    if (name == null) name = this.baseName
    if (ctor == null) ctor = this

    // Can't register twice.
    if (this.customElementRegistry.get(name)) return

  // creates anonymous class due to a limitation of CEs only allowing 1 class definition.
    this.customElementRegistry.define(name, toAnonymousClass(ctor), options)
  }
}

export function toAnonymousClass (klass) {
  return class extends klass {}
}


