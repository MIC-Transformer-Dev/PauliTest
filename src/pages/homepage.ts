import { fromEvent, Subscription } from "rxjs";
import {
  instructionPopupVisibility$,
  optionsPopupVisibility$
} from "@/store/popup";
import styles from "@/styles/homepage.shadow.css?inline";

export default class Homepage extends HTMLElement {
  private _shadowRoot: ShadowRoot;
  private _clickEvent$: Subscription | null = null;

  constructor() {
    super();
    this._shadowRoot = this.attachShadow({ mode: "open" });
  }

  private _render() {
    // clean previous content and remove previous event listener
    this._clickEvent$?.unsubscribe();
    this._shadowRoot.innerHTML = "";

    const wrapper = document.createElement("template");
    wrapper.innerHTML = `
      <style>
        ${styles}
      </style>
      <p-instruction-popup></p-instruction-popup>
      <p-options-popup></p-options-popup>
      <div class="container">
        <h1 class="title">PAULI TEST</h1>
        <p class="description">BINAR Group's Pauli Test Application</p>
        <div class="buttons" id="buttons">
          <button class="start-button" id="start-button">Start</button>
          <button class="instruction-button" id="instruction-button">Instructions</button>
        </div>
      </div>
    `;

    this._shadowRoot.appendChild(wrapper.content.cloneNode(true));
    this._attachEventListener();
  }

  private _attachEventListener() {
    const buttons = this._shadowRoot.getElementById("buttons");

    this._clickEvent$ = fromEvent(
      buttons!,
      "click",
      (e) => e.target as HTMLButtonElement
    ).subscribe((button) => {
      if (button === null) return;

      if (button.id === "start-button") {
        optionsPopupVisibility$.next(true);
      }

      if (button.id === "instruction-button") {
        instructionPopupVisibility$.next(true);
      }
    });
  }

  public connectedCallback() {
    this._render();
  }

  public disconnectedCallback() {
    this._clickEvent$?.unsubscribe();
  }
}
