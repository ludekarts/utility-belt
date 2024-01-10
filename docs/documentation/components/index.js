import { html, createAppContext } from '../../../dist/utility-belt.modern.js';

const { app, component } = createAppContext({ title: "My app" });

const counterReducer = {
  store: "counter",

  state: 0,

  actions: {
    "INCREMENT": (state) => {
      return state + 1;
    },

    "DECREMENT": (state) => {
      return state - 1;
    },
  },
};


export const Counter = component(({ state: counter, dispatch }) => {
  return html`
  <div>
    <span>${counter}</span>
    <button onclick="${() => dispatch("INCREMENT")}">+</button>
    <button onclick="${() => dispatch("DECREMENT")}">-</button>
  </div>
`;
}, counterReducer);



// -----------------------------------------------------

const mainReducer = {

  state: {
    someGlobalValue: "hi!",
  },

  actions: {
    "UPDATE_GLOBAL_VALUE": (state, value) => {
      return { ...state, someGlobalValue: value };
    },
  },
};


const App = app(({ state, dispatch }) => {

  const updateGloablValue = () => {
    dispatch("UPDATE_GLOBAL_VALUE", "hello!");
  };

  return html`
    <div>
      <h1>${state.title}</h1>
      <span>${state.someGlobalValue}</span>
      <button onclick="${updateGloablValue}">Change Global Value</button>
      ${Counter(state.counter)}
    </div>
  `;

});


document.querySelector("#components-doc").appendChild(App);