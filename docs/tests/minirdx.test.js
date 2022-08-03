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


  it("Store:: Should add define more reducer", () => {
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


  it("Action tests:: Should create new action with proper format", () => {
    const updateAction = action("update", "newValue");
    chai.expect(updateAction).to.have.property("type", "update");
    chai.expect(updateAction).to.have.property("payload", "newValue");
  });

});
