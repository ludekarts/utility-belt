const { cmp, html, fragment } = window.utilityBelt;


describe("Component", () => {
  it("ist should works", () => {

    const App = cmp(props => {

      const readState = () => {
        console.log(props.getState());
      };

      const shout = () => {
        console.log(props.getState()?.label);
      };

      props.effect((element, refs) => {
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