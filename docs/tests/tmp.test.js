const { html, createAppContext, getRandomSubarray } = window.utilityBelt;

const { component, renderApp, subscribe } = createAppContext({
  emoji: "✨",
  showTimer: false,
  list: [
    // Marverl superheroes.
    { id: 1, name: "Spider-man" },
    { id: 2, name: "Iron man" },
    { id: 3, name: "Hulk" },
    { id: 4, name: "Thor" },
    { id: 5, name: "Black Widow" },
    { id: 6, name: "Captain America" },
    { id: 7, name: "Black Panther" },
    { id: 8, name: "Doctor Strange" },
    // DC Superheroes.
    { id: 9, name: "Superman" },
    { id: 10, name: "Batman" },
    { id: 11, name: "Wonder Woman" },
    { id: 12, name: "The Flash" },
    { id: 13, name: "Aquaman" },
    { id: 14, name: "Cyborg" },
    { id: 15, name: "Green Lantern" },
    { id: 16, name: "Shazam" },
  ],
});


const searchReducer = {
  store: "search",
  state: "",
  actions: {
    PHRASE: (state, phrase) => {
      return phrase;
    },

    EMOJI: (state, emoji) => (globalState) => {
      return {
        ...globalState,
        emoji,
      }
    },
  },
};

// subscribe(state => console.log(state));

const Timer = component(({ effect }) => {
  effect(() => {
    const interval = setInterval(() => {
      Timer(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  });

  return time => {
    console.log("TICK");
    return html`<div style="font-family:monospace; font-size:1.35rem;">${time || new Date().toLocaleTimeString()}<div>`;
  }
});

const Search = component(({ onAction, dispatch }) => {

  const updateInput = e => {
    dispatch("PHRASE", e.target.value);
  };

  const setEmoji = () => {
    dispatch("EMOJI", "⚠️");
  };

  onAction("SET_EMOJI", (state) => {
    console.log(`EMOJI changed: ${state.emoji}`);
  });

  return (phrase, list) => {
    return html`
      <div>
        <div>
          <input type="text" value=${phrase} oninput=${updateInput} />
          <button onclick="${setEmoji}">⚠️</button>
        </div>
        <div $key="${i => i.id}" $items="${list.filter(h => h.name.toLowerCase().includes(phrase))}">
          ${rednerHero}
        </div>
      </div>
    `;
  }
}, searchReducer);

const emojis = ["🔥", "🧮", "🎉", "🎈", "🎁", "🎊"];

const App = component(({ dispatch }) => {

  const shuffleEmoji = () => {
    dispatch("SET_EMOJI", getRandomSubarray(emojis, 1)[0]);
  };

  const toggleTimer = () => {
    dispatch("TOGGLE_TIMER");
  };

  return state => html`
    <div>
      <h1>SEARCH ${state.emoji}</h1>
      ${state.showTimer ? Timer() : ""}
      <div>
        <button onclick="${shuffleEmoji}">Shuffle EMOJI</button>
        <button onclick="${toggleTimer}">Toggle TIMER</button>
      </div>
      <br/>
      <div>
        ${Search(state, state.list)}
      </div>
    </div>
  `;
}, {
  actions: {
    SET_EMOJI: (state, emoji) => {
      return {
        ...state,
        emoji,
      };
    },
    TOGGLE_TIMER: (state) => {
      return {
        ...state,
        showTimer: !state.showTimer,
      };
    },
  },

});


function rednerHero(hero) {
  return html`<div>${hero.name}</div>`;
}

renderApp(document.body, App);

/*

const { app, component, dispatch } = createAppContext({ emoji: "🧮", list });

const reducer = {
  state: {
    phrase: ""
  },
};


const sReducer = {
  store: "search",
  state: {
    phrase: ""
  },
  actions: {
    PHRASE: (state, phrase) => {
      return {
        ...state,
        phrase
      };
    },
  },
}

const Search = component(({ dispatch }) => {

  const updateInput = e => {
    dispatch("PHRASE", e.target.value);
  };

  return state => {
    const { search } = state;
    return html`
      <input type="text" value=${search.phrase} oninput=${updateInput} />
      <div $key="${i => i.id}" $items="${state.list.filter(h => h.name.toLowerCase().includes(search.phrase))}">
        ${rednerHero}
      </div>
    `;
  }
}, sReducer);

const App = app(({ dispatch }) => {
  return state => html`
    <div>
      <h1>SEARCH ${state.emoji}</h1>
      <div>
        ${Search(state)}
      </div>
    </div>
  `;
}, reducer);


function rednerHero(hero) {
  return html`<div>${hero.name}</div>`;
}

document.body.appendChild(App);
*/