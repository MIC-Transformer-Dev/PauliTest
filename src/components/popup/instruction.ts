import { fromEvent, Subscription } from "rxjs";
import { instructionPopupVisibility$ } from "@/store/popup";
import baseStyles from "@/styles/base-popup.shadow.css?inline";
import styles from "@/styles/instruction-popup.shadow.css?inline";

export default class InstructionPopup extends HTMLElement {
  private _shadowRoot: ShadowRoot;
  private _pageNumber: number = 1;
  private _clickEvent$: Subscription | null = null;
  private _isVisible: boolean = false;

  constructor() {
    super();
    this._shadowRoot = this.attachShadow({ mode: "open" });
    instructionPopupVisibility$.subscribe((visible) => {
      if (!visible) this._pageNumber = 1;
      this._isVisible = visible;
      this._render();
    });
  }

  private _render() {
    // clean previous content and remove previous event listener
    this._clickEvent$?.unsubscribe();
    this._shadowRoot.innerHTML = "";

    const wrapper = document.createElement("template");
    wrapper.innerHTML = `
      <style>
        ${baseStyles}
        ${styles}

        :host {
          visibility: ${this._isVisible ? "visible" : "hidden"};
          opacity: ${this._isVisible ? "1" : "0"};
          transform: ${this._isVisible ? "translateY(0)" : "translateY(-2rem)"};
        }
      </style>
      <div class="content" id="content">
        <button class="close-button" id="close">&times;</button>
        <h1 class="title">Instructions</h1>
        <div class="body">
          <div style="display: ${this._pageNumber === 1 ? "block" : "none"}">
            <p>
              <b>BINAR GROUP'S PAULI TEST</b> adalah aplikasi untuk <b>tes Pauli/Kraepelin</b> di Binar Group. Ini adalah tes untuk mengukur
              konsistensi, akurasi dan konsentrasi. Tes ini biasanya berdurasi 60 menit dan ditulis di selembar kertas.
            </p>
            <p>
              Pada tes ini, anda akan disajikan dengan serangkaian angka. Tugas anda
              adalah menghitung modulus / sisa bagi dari 2 angka yang muncul.
            </p>
            <p>
              Untuk menghitung hasilnya, yang anda harus lakukan adalah menjumlahkan angkanya,
              <code>8 + 7</code> sebagai contoh, dan kemudian hitung dengan modulus <code>10</code>.
              Sebagai contoh: <code>8 + 7 = 15 % 10 = 5</code>
              <br />
              Cara lain untuk digunakan sebagai cara berpikir adalah dengan menjumlahkan angkanya, dengan contoh
              <code>8 + 7</code> kembali, dan hanya tuliskan digit terakhirnya. Jadi, hasilnya
              adalah <code>5</code> sebab <code>8 + 7</code> sama dengan <code>15</code> dan
              digit terakhirnya adalah <code>5</code>.
              <br />
              Jika hasilnya hanya satu digit, <code>2 + 5 = 7</code> contohnya,
              maka hasil finalnya adalah <code>7</code>.
            </p>
          </div>
          <div style="display: ${this._pageNumber === 2 ? "block" : "none"}">
            <p>
              Tes ini akan dibagi menjadi beberapa ronde. Durasi setiap ronde akan ditentukan sebelum tes dimulai. 
            </p>
            <p>
              Anda tidak akan mendapat notifikasi ketika ronde berganti. Anda dapat tetap melanjutkan pengerjaan soal 
              seperti biasa. Anda juga dapat melihat waktu yang tersisa
            </p>
          </div>
          <div style="display: ${this._pageNumber === 3 ? "block" : "none"}">
            <p>
              Beberapa poin penting untuk dipahami sebelum memulai:
            </p>
            <ul>
              <li>
                Untuk setiap jawaban benar, anda akan mendapatkan 1 poin.
              </li>
              <li>
                Untuk setiap jawaban salah, anda akan mendapat pengurangan 1 poin.
              </li>
              <li>
                Anda dapat menjawab soal dengan menggunakan numpad virtual pada layar,
                atau menggunakan keyboard.
              </li>
            </ul>
          </div>
        </div>
        <div class="footer" id="footer">
          <button id="prev" class="secondary-button" style="display: ${
            this._pageNumber === 1 ? "none" : "block"
          }">
            Previous
          </button>
          <button id="next" class="primary-button">
            ${this._pageNumber === 3 ? "Finish" : "Next"}
          </button>
        </div>
      </div>
    `;

    this._shadowRoot.appendChild(wrapper.content.cloneNode(true));
    this._attachEventListener();
  }

  private _attachEventListener() {
    const content = this._shadowRoot.getElementById("content");

    this._clickEvent$ = fromEvent(
      content!,
      "click",
      (e) => e.target as HTMLButtonElement
    ).subscribe((button) => {
      if (button === null) return;

      switch (button.id) {
        case "next":
          if (this._pageNumber >= 3) {
            instructionPopupVisibility$.next(false);
            return;
          }
          this._pageNumber++;
          break;
        case "prev":
          if (this._pageNumber <= 1) return;
          this._pageNumber--;
          break;
        case "close":
          instructionPopupVisibility$.next(false);
          break;
        default: /* noop */
      }
      this._render();
    });
  }

  public get popupTitle() {
    return this.getAttribute("p-title") || "DEFAULT POPUP TITLE";
  }

  public connectedCallback() {
    this._render();
  }

  public disconnectedCallback() {
    this._clickEvent$?.unsubscribe();
  }
}
