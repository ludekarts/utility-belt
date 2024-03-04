const { createReducer, createStore, createSelector } = window.utilityBelt;

const action = (type, payload) => ({ type, payload });

describe("MiniRDX", () => {

  it("CreateReducer:: Should create 'empty' reducer", () => {
    const state = { name: "state" };
    const mainReducer = createReducer(state).done();
    chai.expect(mainReducer).to.be.instanceOf(Function);
    chai.expect(mainReducer(state, {})).to.have.property("name", "state");
  });


  it("CreateReducer:: Should create reducer handling 'update' action", () => {
    const state = { name: "state" };
    const mainReducer = createReducer(state)
      .on("update", (state, name) => {
        return { ...state, name };
      })
      .done();

    const newState = mainReducer(state, action("update", "newState"));
    chai.expect(newState).to.have.property("name", "newState");

    const finalState = mainReducer(newState, action("update", "anotherState"));
    chai.expect(finalState).to.have.property("name", "anotherState");
  });


  it("CreateReducer:: Should create reducer handling multiple actions", () => {
    const state = {
      name: "state",
      counter: 0,
    };

    const mainReducer = createReducer(state)
      .on("update", (state, name) => {
        return { ...state, name };
      })
      .on("increment", (state) => {
        state.counter = state.counter + 1;
        return state;
      })
      .done();

    const newState = mainReducer(state, action("update", "newState"));
    chai.expect(newState).to.have.property("name", "newState");

    const finalState = mainReducer(newState, action("increment"));
    chai.expect(finalState).to.have.property("counter", 1);
  });


  it("CreateReducer:: Should return initState if reducing state is undefined", () => {
    const initState = {
      name: "initState",
    };

    const mainReducer = createReducer(initState).done();

    chai.expect(mainReducer(undefined, {})).to.equal(initState);
  });


  it("CreateReducer:: Should throw when state or acrion are not applied", () => {
    const mainReducer = createReducer().done();
    chai.expect(() => mainReducer()).to.throw();
  });


  it("CreateReducer:: Should throw if two or more cases try to handle same action", () => {
    const identity = a => a;
    const create = () => createReducer()
      .on("action", identity)
      .on("action", identity)
      .done();
    chai.expect(create).to.throw();
  });


  it("CreateReducer:: When creating new case it should throw if action is not a 'string'", () => {
    const create = () => createReducer().on(10, () => { }).done();
    chai.expect(create).to.throw();
  });


  it("CreateReducer:: When creating new case it should throw if reducer is not a 'function'", () => {
    const create = () => createReducer().on("action_name", {}).done();
    chai.expect(create).to.throw();
  });


  it("ExtendReducer:: Should extend main reducer", () => {

    const initState = {
      hello: "world",
    };

    const mainReducer = createReducer(initState).done();
    const store = createStore(mainReducer);

    // Check for proper initial state.
    chai.expect(store.getState()).to.have.property("hello", "world");

    // ---- Extend ------------

    const extendState = {
      some: {
        deep: {
          value: "👻",
        },
      },
    };

    // Define new extended reducer.
    const extendedReducer = createReducer(extendState).done();

    store.extendReducer(extendedReducer, "ext");

    // Check for extended state.
    chai.expect(store.getState()).to.have.property("ext");
    chai.expect(store.getState().ext.some.deep).to.have.property("value", "👻");

  });


  it("ExtendReducer:: Should handle actions from extended reducer", () => {

    const initState = {
      hello: "world",
    };

    const mainReducer = createReducer(initState).done();
    const store = createStore(mainReducer);

    // Check for proper initial state.
    chai.expect(store.getState()).to.have.property("hello", "world");

    // ---- Extend ------------

    const extendState = {
      some: {
        deep: {
          value: "👻",
        },
      },
    };

    // Define new extended reducer.
    const extendedReducer = createReducer(extendState)
      .on("update_extended", (state) => {
        state.some.deep.value = "🦖";
        return { ...state };
      })
      .done();

    store.extendReducer(extendedReducer, "ext");

    store.dispatch("update_extended");

    chai.expect(store.getState().ext.some.deep).to.have.property("value", "🦖");
  });


  it("ExtendReducer:: Should update global state from extended reducer", () => {

    const initState = {
      hello: "world",
    };

    const mainReducer = createReducer(initState).done();
    const store = createStore(mainReducer);

    // Check for proper initial state.
    chai.expect(store.getState()).to.have.property("hello", "world");

    // ---- Extend ------------

    const extendState = {
      some: {
        deep: {
          value: "👻",
        },
      },
    };

    // Define new extended reducer.
    const extendedReducer = createReducer(extendState)
      .on("update_global", (state) => (globalState) => ({
        ...globalState,
        hello: "🍕",
      }))
      .done();

    store.extendReducer(extendedReducer, "ext");

    store.dispatch("update_global");

    chai.expect(store.getState()).to.have.property("hello", "🍕");
  });


  it("ExtendReducer:: Should extend reducer but not override default state", () => {

    const initState = {
      hello: "world",
    };

    const mainReducer = createReducer(initState).done();
    const store = createStore(mainReducer);

    // Check for proper initial state.
    chai.expect(store.getState()).to.have.property("hello", "world");

    // ---- Extend ------------

    const extendState = {
      some: {
        deep: {
          value: "👻",
        },
      },
    };

    // Define new extended reducer.
    const extendedReducer = createReducer(extendState).done();
    store.extendReducer(extendedReducer, "ext");
    chai.expect(store.getState().ext.some.deep).to.have.property("value", "👻");

    // ---- Extend 2 ------------

    const hookReducer = createReducer()
      .on("update_hook", (state) => {
        return "🦖";
      })
      .done();

    // Define another extended reducer which only modify part of global state.
    store.extendReducer(hookReducer, "ext.some.deep.value");
    store.dispatch("update_hook");
    chai.expect(store.getState().ext.some.deep).to.have.property("value", "🦖");
  });

  it("ExtendReducer:: Should connect to global state without overriding it", () => {
    const initState = {
      hello: "world",
    };

    const mainReducer = createReducer(initState).done();
    const store = createStore(mainReducer);

    // Check for proper initial state.
    chai.expect(store.getState()).to.have.property("hello", "world");

    // ---- Extend ------------

    // Define new extended reducer.
    const extendedReducer = createReducer({ bad: "state" })
      .on("update_global", (state) => {
        return {
          ...state,
          hello: "there"
        }
      })
      .done();

    store.extendReducer(extendedReducer);
    chai.expect(store.getState()).to.not.have.property("bad", "state");

    store.dispatch("update_global");
    chai.expect(store.getState()).to.have.property("hello", "there");

  });


  it("Store:: Should allow to subscribe to Store updates", () => {
    const mainReducer = createReducer({})
      .on("update", () => ({}))
      .done();

    const store = createStore(mainReducer);
    const spy = chai.spy();
    store.subscribe(spy);
    store.dispatch("update");
    store.dispatch("update");
    chai.expect(spy).to.have.been.called(2);
  });


  it("Store:: Subscriber should recieve new state object along with dispatched action", () => {

    const newState = { isNew: true };

    const mainReducer = createReducer({})
      .on("update", () => newState)
      .done();

    const store = createStore(mainReducer);
    const spy = chai.spy();
    store.subscribe(spy);
    store.dispatch("update");
    store.dispatch("update");
    chai.expect(spy).to.have.been.called(2);
    chai.expect(spy).to.have.been.called.with(newState, { type: "update", payload: undefined });
  });


  it("Store:: Should dipatch multiple actions as one batch", () => {
    const initState = {
      counter: 0,
      title: "none",
    };

    const mainReducer = createReducer(initState)
      .on("add", state => {
        state.counter++;
        return { ...state };
      })
      .on("subtract", state => {
        state.counter--;
        return { ...state };
      })
      .on("rename", (state, title) => {
        return { ...state, title };
      })
      .done();

    const store = createStore(mainReducer);
    const spyStoreListener = chai.spy();

    store.subscribe(spyStoreListener);

    store.dispatch.batch(
      ["add"],
      ["add"],
      ["subtract"],
      ["rename", "batch"]
    );

    chai.expect(spyStoreListener).to.have.been.called.once;
    chai.expect(store.getState()).to.have.property("counter", 1);
    chai.expect(store.getState()).to.have.property("title", "batch");

  });

  it("Store:: Should dipatch action with miltiple payload arguments", () => {

    const initState = {};
    const spy = chai.spy();
    const mainReducer = createReducer(initState)
      .on("update", spy)
      .done();

    const store = createStore(mainReducer);
    store.dispatch("update", "a", 2, "c");
    chai.expect(spy).to.have.been.called(1);
    chai.expect(spy).to.have.been.called.with(initState, "a", 2, "c");
  });


  it("Store:: Subscriber should recieve new state object along with list of dispatched action (batch dispatch)", () => {

    const newState = { isNew: true };
    const actions = [
      { type: "this", payload: undefined },
      { type: "is", payload: undefined },
      { type: "batch", payload: true },
    ];

    const mainReducer = createReducer({})
      .on("is", () => newState) // Any action from batch list will trigger subscriber.
      .done();

    const store = createStore(mainReducer);
    const spy = chai.spy();
    store.subscribe(spy);
    store.dispatch.batch(["this"], ["is"], ["batch", true]);
    chai.expect(spy).to.have.been.called.with(newState, actions);
  });


  it("Create Selector:: Should fail with invalid selector", () => {
    chai.expect(() => createSelector("alert(1);")).to.throw();
  });


  it("Create Selector:: Should create various selectros", () => {
    chai.expect(() => createSelector("a")).to.not.throw();
    chai.expect(() => createSelector("a[0]")).to.not.throw();
    chai.expect(() => createSelector("a.b.c")).to.not.throw();
    chai.expect(() => createSelector("a.b[1].c[2]")).to.not.throw();
  });


  it("Create Selector:: Should create propper getter & setter", () => {
    const state = {
      user: {
        name: "John",
        age: 25,
        address: {
          city: "London",
          street: "Baker Street"
        }
      }
    };

    const { getter, setter } = createSelector("user.address.city");

    // Getter.
    chai.expect(getter(state)).to.equal("London");

    // Setter.
    setter(state, "New York");
    chai.expect(getter(state)).to.equal("New York");
  });

});