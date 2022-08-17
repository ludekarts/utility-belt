const { createReducer, createStore, action } = window.utilityBelt;


describe("Mini RDX", () => {

  it("CreateReducer:: Should create 'empty' reducer", () => {
    const state = { name: "state" };
    const mainReducer = createReducer(state).done();
    chai.expect(mainReducer).to.be.instanceOf(Function);
    chai.expect(mainReducer(state, {})).to.have.property("name", "state");
  });


  it("CreateReducer:: Should create reduce handling 'update' action", () => {
    const state = { name: "state" };
    const mainReducer = createReducer(state)
      .on("update", (state, action) => {
        state.name = action.payload;
        return state;
      })
      .done();

    const newState = mainReducer(state, action("update", "newState"));
    chai.expect(newState).to.have.property("name", "newState");

    const finalState = mainReducer(newState, action("update", "anotherState"));
    chai.expect(finalState).to.have.property("name", "anotherState");
  });


  it("CreateReducer:: Should create reduce handling multiple actions", () => {
    const state = { name: "state", counter: 0 };
    const mainReducer = createReducer(state)
      .on("update", (state, action) => {
        state.name = action.payload;
        return state;
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
    const initState = { name: "initState" };
    const mainReducer = createReducer(initState).done();
    chai.expect(mainReducer(undefined, {})).to.equal(initState);
  });

  it("CreateReducer:: Should throw when state or acrion are not applied", () => {
    const mainReducer = createReducer().done();
    chai.expect(() => mainReducer()).to.throw();
  });

  it("CreateReducer:: Should throw when creating case with duplicated action", () => {
    const identity = a => a;
    const create = () => createReducer()
      .on("action", identity)
      .on("action", identity)
      .done();
    chai.expect(create).to.throw();
  });

  it("CreateReducer:: Should throw when creating case with action not being a 'string'", () => {
    const create = () => createReducer().on(10, () => { }).done();
    chai.expect(create).to.throw();
  });

  it("CreateReducer:: Should throw when creating case with resucer not being a 'function'", () => {
    const create = () => createReducer().on("action_name", {}).done();
    chai.expect(create).to.throw();
  });


  it("Store:: Should create Store with Main reducer", () => {
    const initState = { hello: "world" };
    const mainReducer = createReducer(initState).done();
    const store = createStore(mainReducer);
    chai.expect(store.getState()).to.have.property("hello", "world");
  });


  it("Store:: Should define new reducer", () => {
    const initState = { hello: "world" };
    const mainReducer = createReducer(initState).done();
    const store = createStore(mainReducer);

    chai.expect(store.getState()).to.have.property("hello", "world");


    const deepReducer = createReducer({ some: { deep: { value: "👻" } } })
      .on("rex", state => {
        state.rex = "🦖"
        return state;
      })
      .done();
    store.defineReducer(deepReducer, state => state.enter, (state, value) => state.enter = value, "deep");

    const someReducer = createReducer({ invader: "👾" })
      .on("punch", state => {
        state.punch = "🥊"
        return state;
      })
      .done();

    store.defineReducer(someReducer, state => state.enter.some, (state, value) => state.enter.some = value, "some");
    chai.expect(store.getState().enter.some).to.not.have.property("invader");

    store.dispatch(action("punch"));
    chai.expect(store.getState().enter.some).to.have.property("punch");


    const userReducer = createReducer({ name: "John" }).done();
    store.defineReducer(userReducer, state => state.user, (state, value) => state.user = value, "user");
    chai.expect(store.getState()).to.have.property("user");

    store.dispatch(action("rex"));

    // console.log("STORE:", store.getState());
    chai.expect(store.getState().user).to.have.property("name", "John");

  });


  it("Store:: Should subscribe to Store updates", () => {
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

  it("Store:: Should dipatch action withouth actionCreator", () => {
    const initState = { text: "World" };
    const mainReducer = createReducer(initState)
      .on("greet", state => {
        state.text = "Hello" + state.text;
        return { ...state };
      })
      .done();

    const store = createStore(mainReducer);
    store.dispatch("greet");
    chai.expect(store.getState()).to.have.property("text", "HelloWorld");
  });

  it("Store:: Should dipatch multiple actions as one batch", () => {
    const initState = { counter: 0, title: "none" };
    const mainReducer = createReducer(initState)
      .on("add", state => {
        state.counter++;
        return { ...state };
      })
      .on("subtract", state => {
        state.counter--;
        return { ...state };
      })
      .on("rename", (state, action) => {
        state.title = action.payload;
        return { ...state };
      })
      .done();

    const store = createStore(mainReducer);
    const spyActionListeners = chai.spy();
    const spyStoreListener = chai.spy();

    store.on("add", spyActionListeners);
    store.subscribe(spyStoreListener);

    store.dispatch.batch(
      ["add"],
      ["add"],
      ["subtract"],
      ["rename", "batch"]
    );

    chai.expect(spyActionListeners).to.have.been.called(2);
    chai.expect(spyStoreListener).to.have.been.called.once;
    chai.expect(store.getState()).to.have.property("counter", 1);
    chai.expect(store.getState()).to.have.property("title", "batch");

  });


  it("Action creator:: Should create new action with proper format", () => {
    const updateAction = action("update", "newValue");
    chai.expect(updateAction).to.have.property("type", "update");
    chai.expect(updateAction).to.have.property("payload", "newValue");
  });


  it("Action listener:: Should detect 'hello' action being dispatched", () => {
    const mainReducer = createReducer({}).done();
    const store = createStore(mainReducer);
    const spy = chai.spy();

    store.on("hello", spy);

    store.dispatch("fake.action");
    chai.expect(spy).to.not.have.been.called();

    store.dispatch("hello");
    chai.expect(spy).to.have.been.called();
  });


  it("Action listener:: Should fire many callback attached to single action", () => {
    const mainReducer = createReducer({}).done();
    const store = createStore(mainReducer);
    const spy1 = chai.spy();
    const spy2 = chai.spy();

    store.on("hello", spy1);
    store.on("hello", spy2);

    store.dispatch("hello");

    chai.expect(spy1).to.have.been.called();
    chai.expect(spy2).to.have.been.called();
  });

  it("Action listener:: Should destroy action handler", () => {
    const mainReducer = createReducer({}).done();
    const store = createStore(mainReducer);
    const spy = chai.spy();
    const destory = store.on("hello", spy);

    store.dispatch("fake.action");
    chai.expect(spy).to.not.been.called();

    destory();

    store.dispatch("hello");
    chai.expect(spy).to.have.not.been.called();
  });


  it("Action listener:: Should pass to action handler current state value", () => {
    const mainReducer = createReducer("one")
      .on("change", () => "two")
      .done();
    const store = createStore(mainReducer);
    const spy = chai.spy();

    store.on("change", spy);
    chai.expect(store.getState()).to.equal("one");

    store.dispatch("change");
    chai.expect(spy).to.have.been.called.with("one", "change");
  });

  it("Action listener:: Should handle '::afterupdate' action with new state value", () => {
    const mainReducer = createReducer("one")
      .on("change", () => "two")
      .done();
    const store = createStore(mainReducer);
    const spy = chai.spy();

    store.on("change::afterupdate", spy);
    chai.expect(store.getState()).to.equal("one");

    store.dispatch("change");
    chai.expect(spy).to.have.been.called.with("two", "change::afterupdate");
  });



});
