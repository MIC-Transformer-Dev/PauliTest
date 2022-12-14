import "@fontsource/raleway/400.css";
import "@fontsource/raleway/500.css";
import "@fontsource/raleway/600.css";
import "@fontsource/raleway/800.css";

import "@fontsource/barlow/400.css";
import "@fontsource/barlow/500.css";
import "@fontsource/barlow/600.css";

import "@/styles/main.css";

import Homepage from "@/pages/homepage";
import Playpage from "@/pages/playpage";
import Result from "@/pages/result";
import NotFound from "@/pages/notfound";
import InstructionPopup from "@/components/popup/instruction";
import OptionsPopup from "@/components/popup/options";
import CountdownBar from "@/components/countdown/bar";
import SidebarContainer from "@/components/sidebar/container";
import SidebarHistory from "@/components/sidebar/history";
import Timer from "@/components/countdown/timer";
import Chart from "@/components/chart/chart";
import HistoryTable from "@/components/history/table";
import ThemeButton from "@/components/theme/button";
import { currentRoute$, Route } from "@/store/route";
import { currentTheme$ } from "./store/theme";

customElements.define("p-homepage", Homepage);
customElements.define("p-playpage", Playpage);
customElements.define("p-result", Result);
customElements.define("p-notfound", NotFound);
customElements.define("p-instruction-popup", InstructionPopup);
customElements.define("p-options-popup", OptionsPopup);
customElements.define("p-countdown-bar", CountdownBar);
customElements.define("p-countdown-timer", Timer);
customElements.define("p-sidebar", SidebarContainer);
customElements.define("p-history", SidebarHistory);
customElements.define("p-chart", Chart);
customElements.define("p-history-table", HistoryTable);
customElements.define("p-theme-button", ThemeButton);

const outlet = document.querySelector("p-outlet");
const outletShadowRoot = outlet!.attachShadow({ mode: "open" });

const routes: Record<string, Route> = {
  "/": {
    component: "p-homepage",
    title: "Homepage"
  },
  "/play": {
    component: "p-playpage",
    title: "Play"
  },
  "/result": {
    component: "p-result",
    title: "Result"
  },
  "*": {
    component: "p-notfound",
    title: "Not Found"
  }
};

currentRoute$.subscribe((route) => {
  const r = routes[route] || routes["*"];

  document.title = r.title + " | Pauli Test";
  outletShadowRoot.innerHTML = `<${r.component}></${r.component}>`;
  history.pushState(null, "", route);
});

// load the correct page on initial load
window.onload = () => {
  const route = window.location.pathname;
  currentRoute$.next(route);
};

// dark mode stuff
currentTheme$.subscribe(({ current }) => {
  document.documentElement.setAttribute("data-theme", current);
});
