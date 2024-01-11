const { createHistory } = window.utilityBelt;

describe("Manage history state", () => {

  it("Should create new history instance with proper API", () => {
    const history = createHistory("--debug");
    chai.expect(history).to.have.property("pushState");
    chai.expect(history).to.have.property("current");
    chai.expect(history).to.have.property("undo");
    chai.expect(history).to.have.property("redo");
    chai.expect(history).to.have.property("debug");
  });

  it("Should have not 'debug()' mentod if not in 'debugMode' ", () => {
    const history = createHistory();
    chai.expect(history).to.not.have.property("debug");
  });

  it("Should 'debug()' with history and pointer reference", () => {
    const history = createHistory("--debug");
    chai.expect(history.debug()).to.have.property("history");
    chai.expect(history.debug()).to.have.property("pointer");
    chai.assert.isArray(history.debug().history);
    chai.assert.isNumber(history.debug().pointer);
  });

  it("Should push state", () => {
    const history = createHistory("--debug");
    history.pushState(1);
    chai.expect(history.current()).to.be.equal(1);
  });

  it("Should push multiple history entries on single element", () => {
    const history = createHistory("--debug");
    history.pushState(1);
    history.pushState(2);
    history.pushState(3);
    chai.expect(history.current()).to.be.equal(3);
  });

  it("Should move pointer accordingly to new history push", () => {
    const history = createHistory("--debug");
    history.pushState(1);
    history.pushState(2);
    history.pushState(3);
    chai.expect(history.debug().pointer).to.be.equal(2);
  });

  it("Should undo history", () => {
    const history = createHistory("--debug");
    history.pushState(1);
    history.pushState(2);
    history.pushState(3);
    chai.expect(history.undo()).to.be.equal(2);
  });

  it("Should redo history", () => {
    const history = createHistory("--debug");
    history.pushState(1);
    history.pushState(2);
    history.pushState(3);
    history.pushState(4);
    history.pushState(5);
    history.undo();
    history.undo();
    history.undo();

    chai.expect(history.current()).to.be.equal(2);
    chai.expect(history.redo()).to.be.equal(3);
  });

  it("Should remove forward history if new action is created", () => {
    const history = createHistory("--debug");
    history.pushState(1);
    history.pushState(2);
    history.pushState(3);
    history.pushState(4);
    history.pushState(5);
    history.pushState(6);
    history.undo();
    history.undo();
    history.undo();
    history.pushState(7);

    chai.expect(history.current()).to.be.equal(7);
    chai.expect(history.debug().history).to.have.lengthOf(4);
    chai.expect(history.debug().history).to.have.members([1, 2, 3, 7]);
  });

  it("Undo should not overflow below first history state", () => {
    const history = createHistory("--debug");
    history.pushState(1);
    history.pushState(2);
    history.pushState(3);
    chai.expect(history.current()).to.be.equal(3);
    history.undo();
    history.undo();
    chai.expect(history.current()).to.be.equal(1);
    chai.expect(history.undo()).to.be.equal(1);
    chai.expect(history.undo()).to.be.equal(1);
  });

  it("Redo should not overflow above last history state", () => {
    const history = createHistory("--debug");
    history.pushState(1);
    history.pushState(2);
    history.pushState(3);
    chai.expect(history.current()).to.be.equal(3);
    history.undo();
    history.undo();
    history.undo();
    chai.expect(history.current()).to.be.equal(1);
    history.redo();
    history.redo();
    chai.expect(history.redo()).to.be.equal(3);
    chai.expect(history.current()).to.be.equal(3);
    chai.expect(history.redo()).to.be.equal(3);
  });

  it("Should handle undo and redo on range fringes", () => {
    const history = createHistory("--debug");
    history.pushState(1);
    history.pushState(2);
    history.pushState(3);
    chai.expect(history.current()).to.be.equal(3);
    history.undo();
    history.undo();
    history.undo();
    history.undo();
    chai.expect(history.current()).to.be.equal(1);
    chai.expect(history.redo()).to.be.equal(2);
    chai.expect(history.current()).to.be.equal(2);
    history.redo();
    history.redo();
    history.redo();
    chai.expect(history.current()).to.be.equal(3);
    chai.expect(history.undo()).to.be.equal(2);
    chai.expect(history.current()).to.be.equal(2);
  });

});

