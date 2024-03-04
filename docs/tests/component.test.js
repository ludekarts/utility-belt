const { cmp, html, createAppContext, fragment } = window.utilityBelt;


describe("Component", () => {
  it("Should works", () => {

    let state = {
      count: 0,
      resize: true,
    };


    const ResizeComponent = cmp(props => {

      props.effect(() => {

        function handleResize() {
          const size = window.innerWidth;
          console.log(size);
          ResizeComponent(size);
        }

        window.addEventListener("resize", handleResize);
        return () => {
          window.removeEventListener("resize", handleResize);
        };
      });

      return (state) => html`
        <div>
          <span>Width</span>
          <span>${state || window.innerWidth}</span>
        </div>
      `;
    });

    const WrapperComponent = cmp(({ effect }) => {

      effect(() => {
        console.log("Wrapper created");
      });

      return (resize) => html`
        <div>
          <span>Wrapper</span>
          <div>
            ${resize ? ResizeComponent() : ""}
          </div>
        </div>
      `;
    });

    const MyComponent = cmp(props => {
      const { getArgs, getState, getRefs, effect } = props;

      const handleClick = () => {
        MyComponent(state => ({
          ...state,
          count: state.count + 1,
        }));
      };

      const toggleRsize = () => {
        MyComponent(state => ({
          ...state,
          resize: !state.resize,
        }));
      };

      effect(() => {
        console.log("Created");
        return () => state = {
          count: 0,
          resize: false,
        };
      });

      return (state) => html`
        <div id="component">
          <div>
            <span>Hello counter:</span>
            <span>${state.count}</span>
          </div>
          <div>
          ${WrapperComponent(state.resize)}
          </div>
          <button onclick="${handleClick}">Counter ++</button>
          <button onclick="${toggleRsize}">Toggle resize</button>
        </div>
      `;
    });


    const controllers = fragment(`<div>
      <button id="unmount">Unmount</button>
      <button id="remount">Remount</button>
      </div>`);

    document.body.appendChild(MyComponent(state));
    document.body.appendChild(controllers);

    unmount.onclick = () => {
      document.getElementById("component").remove();
    }

    remount.onclick = () => {
      document.body.appendChild(MyComponent());
    }

  })
})

/*


  it("Should create proper <div> from fragment string", () => {

    const e1 = fragment(`<div><h1>hello</h1></div>`);
    chai.expect(e1).to.be.instanceOf(HTMLDivElement);

    const e2 = fragment(`<h1>hello</h1><span>world</span>`);
    chai.expect(e2).to.be.instanceOf(HTMLDivElement);
    chai.expect(e2.outerHTML).to.be.equal(`<div><h1>hello</h1><span>world</span></div>`);

    const e3 = fragment(`<h1>hello</h1><span>world</span>`, "span");
    chai.expect(e3).to.be.instanceOf(HTMLSpanElement);
    chai.expect(e3.outerHTML).to.be.equal(`<span><h1>hello</h1><span>world</span></span>`);

    const e4 = fragment(`<h1>hello</h1><span>world</span>`, "-f");
    const w = document.createElement("div");
    w.append(e4);
    chai.expect(e4).to.be.instanceOf(DocumentFragment);
    chai.expect(w.innerHTML).to.be.equal(`<h1>hello</h1><span>world</span>`);

  });


describe("Component", () => {
  it("Should create context component", () => {

    const { app, component, subscribe, dispatch } = createAppContext({ emoji: "🧮" });

    const appReducer = {
      state: {
        counter: 0,
        showReset: false,
      },

      actions: {
        INCREMENT: (state, payload) => {
          return { ...state, counter: state.counter + payload };
        },

        DECREMENT: (state, payload) => {
          return { ...state, counter: state.counter - payload };
        },

        RESET: (state, payload) => {
          return { ...state, counter: payload };
        },

        TOGGLE: (state) => {
          return { ...state, showReset: !state.showReset };
        },

        AUTO: (state, payload) => {
          return { ...state, counter: payload };
        },
      },
    };

    const resetReducer = {
      state: 0,
      store: "resetCount",
      actions: {
        RESET: (state) => state + 1,
      }
    }

    const ResetComponent = component(({ dispatch, onAction, effect }) => {

      onAction("AUTO", (state, payload) => {
        state.counter < 5 &&
          setTimeout(() => {
            dispatch("AUTO", state.counter + 1);
          }, 500);
      });

      effect(() => {
        console.log("Reset component created");
      })

      return count => html`
        <span>
          <button onclick="${() => dispatch("RESET", 0)}">RESET (${count})</button>
          <button onclick="${() => dispatch("AUTO", 0)}">AUTOCOUNTER</button>
        </span>
      `;
    }, resetReducer);

    const MyApp = app(({ dispatch }) => {
      return state => html`
          <div>
            <h1>${state.emoji} Counter: ${state.counter}</h1>
            <div>
              <button onclick="${() => dispatch("INCREMENT", 1)}">INCREMENT</button>
              <button onclick="${() => dispatch("DECREMENT", 1)}">DECREMENT</button>
              <button onclick="${() => dispatch("TOGGLE")}">TOGGLE</button>
              ${state.showReset ? ResetComponent(state.resetCount) : ""}
            </div>
          </div>
      `;
    }, appReducer);


    subscribe(console.log);


    document.body.appendChild(MyApp);
    document.body.appendChild(fragment(`<div>
    <button id="unmount">Unmount</button>
    <button id="remount">Remount</button>
    </div>`));

    unmount.onclick = () => {
      document.getElementById("reset").remove();
    }


  });
});
  */
/*
  it("Should create independent component", () => {

    const App = cmp(props => {

      const readState = () => {
        console.log(props.getState());
      };

      const shout = () => {
        console.log(props.getState()?.label);
      };

      props.effect(({ element, refs, args }) => {
        // console.log(element, refs);
      });

      return (state, updateLabel) => html`
          <div style="display:flex; flex-direction:column; gap:0.5rem;">
            <label $ref="label">${state.label}</label>
            <div>
              <button onclick="${shout}">${state.button}</button>
              <button onclick="${readState}">read state</button>
            </div>
            <input type="text" oninput="${updateLabel}"/>
          </div>
        `;
    });

    let globalState = {
      label: "hello",
      button: "READ LABEL ❤️",
    };

    const updateLabel = event => {
      App({ ...globalState, label: event.target.value });
    };

    const controlls = fragment(`
      <div>
        <button id="unm">UNMOUNT ⏏️</button>
        <button id="trsh">TRASH 🗑️</button>
      </div>
    `);

    document.body.appendChild(controlls);

    unm.onclick = () => {
      App.unmount();
      setTimeout(() => {
        console.log("RE-INITIALIZE 💡");
        document.body.appendChild(App(globalState, updateLabel));
      }, 1000);
    };

    trsh.onclick = () => {
      App.trash();
      console.log(App);
      document.body.appendChild(App(globalState, updateLabel));
    };


    document.body.appendChild(App(globalState, updateLabel));

  });
});

*/