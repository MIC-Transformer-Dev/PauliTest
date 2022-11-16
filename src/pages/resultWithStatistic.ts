import { chartMode, chartMode$ } from "@/store/chart";
import { chosenDuration, GameHistory, gameHistory } from "@/store/gameState";
import { resultsByRound, resultsByRound$ } from "@/store/result";
import styles from "@/styles/result.shadow.css?inline";
import { toFixedTwo } from "@/utils/toFixedTwo";
import barChartIcon from "@/icons/bar-chart.svg?raw";
import lineChartIcon from "@/icons/line-chart.svg?raw";
import questionIcon from "@/icons/question.svg?raw";
import {
  from,
  fromEvent,
  groupBy,
  map,
  mergeMap,
  reduce,
  Subscription
} from "rxjs";
import { currentRoute$ } from "@/store/route";

export default class ResultPage extends HTMLElement {
  private _shadowRoot: ShadowRoot;
  private _clickEvent: Subscription | null = null;
  private _correct: number = 0;
  private _incorrect: number = 0;
  private _averageRatio: number = 0;
  private _standardDeviation: number = 0;
  private _totalAnswered: number = 0;
  private _chartToggle: HTMLElement | null = null;

  constructor() {
    super();
    this._shadowRoot = this.attachShadow({ mode: "open" });

    chartMode$.subscribe((mode) => {
      if (this._chartToggle === null) return;
      this._chartToggle.innerHTML =
        mode === "line" ? barChartIcon : lineChartIcon;
    });
  }

  private _render() {
    // clean previous content and remove previous event listener
    this._clickEvent?.unsubscribe();
    this._shadowRoot.innerHTML = "";

    const wrapper = document.createElement("template");
    wrapper.innerHTML = `
      <style>
        ${styles}
      </style>
      <div class="container">
        <h1 class="title">Your Test Result</h1>
        <h2 align="center">${new Date().toLocaleString()}</h3>
        <a class="back-button" href="/" id="back">Back to home</a>
        <div class="result-box">
          <div class="result-item">
            <span class="result-question">${questionIcon}</span>
            <div class="result-info">
              <p>Total jawaban benar dari seluruh soal.</p>
            </div>
            <span class="result-label">Jawaban Benar</span>
            <span class="result-value">${this._correct}</span>
          </div>
          <div class="result-item">
            <span class="result-question">${questionIcon}</span>
            <div class="result-info">
              <p>Total jawaban salah dari seluruh soal.</p>
            </div>
            <span class="result-label">Jawaban Salah</span>
            <span class="result-value">${this._incorrect}</span>
          </div>
          <div class="result-item">
            <span class="result-question">${questionIcon}</span>
            <div class="result-info">
              <p>Rasio jawaban benar dari seluruh soal.</p>
            </div>
            <span class="result-label">Rasio Jawaban Benar</span>
            <span class="result-value">${this._averageRatio * 100}%</span>
          </div>
          <div class="result-item">
            <span class="result-question">${questionIcon}</span>
            <div class="result-info">
              <p>
                Standar deviasi adalah seberapa banyak perbedaan jumlah jawaban setiap rondenya.
                Angka kecil menunjukkan bahwa anda konsisten. Angka besar menunjukkan anda tidak konsisten antar rondenya.
              </p>
            </div>
            <span class="result-label">Standar Deviasi</span>
            <span class="result-value">${this._standardDeviation}</span>
          </div>
          <div class="result-item">
            <span class="result-question">${questionIcon}</span>
            <div class="result-info">
              <p>
                Durasi pengerjaan tes. Opsi ini sudah dipilih saat sebelum pengerjaan tes.
              </p>
            </div>
            <span class="result-label">Durasi</span>
            <span class="result-value">${chosenDuration}m</span>
          </div>
          <div class="result-item">
            <span class="result-question">${questionIcon}</span>
            <div class="result-info">
              <p>
                Rata-rata soal yang dijawab di setiap ronde.
              </p>
            </div>
            <span class="result-label">Jawaban per Ronde</span>
            <span class="result-value">${
              (this._correct + this._incorrect) / 10
            }</span>
          </div>
        </div>
        <div class="chart-box">
          <div class="chart-header">
            <button class="chart-toggle" id="chart-toggle">
              ${chartMode === "line" ? barChartIcon : lineChartIcon}
            </button>
            <span class="chart-title">Progression Overtime</span>
            <div class="chart-legend">
              <span class="chart-legend-item correct"></span>
              <span class="chart-legend-item incorrect"></span>
            </div>
          </div>
          <p-chart></p-chart>
        </div>
        <div class="history-box">
          <span class="history-title">History</span>
          <p-history-table></p-history-table>
        </div>
      </div>
    `;

    this._shadowRoot.appendChild(wrapper.content.cloneNode(true));
    this._attachEventListener();
  }

  private _mapToResult({
    roundResult,
    round
  }: {
    roundResult: GameHistory[];
    round: number;
  }) {
    const correct = roundResult.filter(
      ({ questionNumber: [a, b], answer }) => (a + b) % 10 === answer
    ).length;
    const incorrect = roundResult.length - correct;

    return {
      correct: correct,
      incorrect: incorrect,
      correctRatio: toFixedTwo(correct / (correct + incorrect)),
      round
    };
  }

  private _findStandardDeviation() {
    const results = Object.values(resultsByRound);
    const mean = this._totalAnswered / results.length;

    // I could've done this without rxjs... but meh,
    // it's fun to do it this way :p
    from(results)
      .pipe(
        map((r) => r.correct + r.incorrect),
        map((x) => (x - mean) ** 2),
        reduce((acc, curr) => acc + curr, 0),
        map((sum) => toFixedTwo(sum / (results.length - 1)))
      )
      .subscribe((s) => {
        this._standardDeviation = s;
      });
  }

  private _findStatistics() {
    from(gameHistory)
      .pipe(
        groupBy((x) => x.round),
        mergeMap((group$) =>
          group$.pipe(
            reduce((acc, curr) => [...acc, curr], [] as GameHistory[])
          )
        ),
        map((roundResult) => ({ roundResult, round: roundResult[0].round })),
        map(this._mapToResult)
      )
      .subscribe(({ correct, incorrect, correctRatio, round }) => {
        this._correct += correct;
        this._incorrect += incorrect;
        resultsByRound$.next({
          round,
          result: {
            correct: correct,
            incorrect: incorrect,
            correctRatio: correctRatio
          }
        });
      });
    this._totalAnswered = this._correct + this._incorrect;
    this._averageRatio = toFixedTwo(
      this._correct / (this._correct + this._incorrect)
    );
  }

  private _attachEventListener() {
    this._chartToggle = this._shadowRoot.getElementById("chart-toggle");
    fromEvent(this._chartToggle!, "click").subscribe(() => {
      chartMode$.next(chartMode === "line" ? "bar" : "line");
    });

    const backButton = this._shadowRoot.getElementById("back");
    fromEvent(backButton!, "click").subscribe((e) => {
      e.preventDefault();
      currentRoute$.next("/");
    });
  }

  public ObjectId() {
    const timestamp = Math.floor(new Date().getTime() / 1000).toString(16);
    const objectId = timestamp + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, () => {
        return Math.floor(Math.random() * 16).toString(16);
    }).toLowerCase();

    return objectId;  
  }

  public connectedCallback() {
    this._findStatistics();
    this._findStandardDeviation();
    this._render();
    setTimeout(window.print, 2000)
    // fetch('http://localhost:4000/test', {mode: 'cors'})
    //   .then(async res => {
    //     const data = await res.json()
    //     console.log(data)})
    //   .catch(err => console.log(err))
    fetch('http://localhost:4000/test', {
      method: "POST",
      body: JSON.stringify({
        _id: this.ObjectId(),
        totalCorrect: this._correct,
        totalIncorrect: this._incorrect,
        ratio: this._averageRatio * 100,
        standardDeviation: this._standardDeviation,
        duration: chosenDuration,
        answerPerRound: (this._correct + this._incorrect) / 10,
        gameHistory
      }),
      headers:{          
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
      .then(async res => {
        const data = await res.json()
        console.log(data)
        console.log('Test result has been sent to server')
      })
      .catch(err => console.log(err))
  }
}
