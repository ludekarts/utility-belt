import "../dist/utility-belt.umd.js";
import { fuzzySearchWidget } from "./source/fuzzy-example.js";

const main = document.querySelector("#main");
main.innerHTML = " I'm Batman 🦇";

document.body.appendChild(fuzzySearchWidget());
