const { cmp, html, createAppContext, fragment } = window.utilityBelt;


describe("Component", () => {

  it("Should handle RDX component", () => {

    const { renderApp, component, dispatch } = createAppContext({ emoji: "🧮" });

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
      },
    };

    const ResetComponent = component(({ dispatch, onAction, effect }) => {

      onAction("AUTO", (state, payload) => {
        state.counter < 5 &&
          setTimeout(() => {
            dispatch("AUTO", state.counter + 1);
          }, 500);
      });

      effect(() => {
        console.log("Reset component created");
      });

      return count => html`
        <span>
          <button onclick="${() => dispatch("RESET", 0)}">RESET (${count})</button>
          <button onclick="${() => dispatch("AUTO", 0)}">AUTOCOUNTER</button>
        </span>
      `;
    }, resetReducer);

    const MyApp = component(({ dispatch }) => {
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

    renderApp(document.body, MyApp);

    document.body.appendChild(fragment(`<div style="margin-top:1rem;">
        <button id="toggle">Outside Toggle</button>
        <button id="ac">Outside Autocounter</button>
        </div>`));

    toggle.onclick = () => {
      dispatch("TOGGLE");
    };

    ac.onclick = () => {
      dispatch("AUTO", 0);
    };

  });


  // it("Should handle simple component", () => {

  //   let state = {
  //     count: 0,
  //     resize: true,
  //   };

  //   const ResizeComponent = cmp(({ effect }) => {

  //     effect(() => {

  //       function handleResize() {
  //         const size = window.innerWidth;
  //         console.log(size);
  //         ResizeComponent(size);
  //       }

  //       window.addEventListener("resize", handleResize);
  //       return () => {
  //         window.removeEventListener("resize", handleResize);
  //       };
  //     });

  //     return (state) => html`
  //       <div>
  //         <span>Width</span>
  //         <span>${state || window.innerWidth}</span>
  //       </div>
  //     `;
  //   });

  //   const WrapperComponent = cmp(({ effect }) => {

  //     effect(() => {
  //       console.log("Wrapper created");
  //     });

  //     return (resize) => html`
  //       <div>
  //         <span>Wrapper</span>
  //         <div>
  //           ${resize ? ResizeComponent() : ""}
  //         </div>
  //       </div>
  //     `;
  //   });

  //   const MyComponent = cmp(({ effect }) => {

  //     const handleClick = () => {
  //       MyComponent(state => ({
  //         ...state,
  //         count: state.count + 1,
  //       }));
  //     };

  //     const toggleRsize = () => {
  //       MyComponent(state => ({
  //         ...state,
  //         resize: !state.resize,
  //       }));
  //     };

  //     effect(() => {
  //       console.log("Created");
  //       return () => state = {
  //         count: 0,
  //         resize: false,
  //       };
  //     });

  //     return (state) => html`
  //       <div id="component">
  //         <div>
  //           <span>Hello counter:</span>
  //           <span>${state.count}</span>
  //         </div>
  //         <div>
  //         ${WrapperComponent(state.resize)}
  //         </div>
  //         <button onclick="${handleClick}">Counter ++</button>
  //         <button onclick="${toggleRsize}">Toggle resize</button>
  //       </div>
  //     `;
  //   });


  //   const controllers = fragment(`<div>
  //     <button id="unmount">Unmount</button>
  //     <button id="remount">Remount</button>
  //     </div>`);

  //   document.body.appendChild(MyComponent(state));
  //   document.body.appendChild(controllers);

  //   unmount.onclick = () => {
  //     document.getElementById("component").remove();
  //   }

  //   remount.onclick = () => {
  //     document.body.appendChild(MyComponent());
  //   }

  // });


});
