
const { PubSub } = window.utilityBelt;
const pubsub = PubSub({ debug: true });

describe("PubSub", () => {
  it("Should have default namespace", () => {
    chai.expect(pubsub.getNamespace().has("/")).to.be.true;
  });

  it("Should create new 'hello' subject in default namespace", () => {
    pubsub.on("hello", () => 0);
    chai.expect(pubsub.getNamespace("/").has("hello")).to.be.true;
  });

  it("Should create 'custom' namespace", () => {
    pubsub.on("custom", "x", () => 0);
    chai.expect(pubsub.getNamespace().has("custom")).to.be.true;
  });

  it("Should create new 'hello' subject in 'custom' namespace", () => {
    pubsub.on("custom", "hello", () => 0);
    chai.expect(pubsub.getNamespace("custom").has("hello")).to.be.true;
  });

  it("Should publish message in 'hello' subject in default namespace", () => {
    pubsub.on("hello", m => chai.expect(m).to.equal("This is message"));
    pubsub.dispatch("hello", "This is message");
  });

  it("Should publish message in 'hello' subject in 'custom' namespace", () => {
    pubsub.on("custom", "hello", m => chai.expect(m).to.equal("This is message"));
    pubsub.dispatch("custom", "hello", "This is message");
  });

  it("Should not be able to remove default namespace", () => {
    const ns = pubsub.getNamespace("/", true);
    chai.expect(ns.has("/")).to.be.true;
  });

  it("Should remove 'custom' namespace", () => {
    const ns = pubsub.getNamespace("custom", true);
    chai.expect(ns.has("custom")).to.be.false;
  });

  it("Should unsubscribe from 'greetings' subject in default namespace", () => {
    const fn = m => 0
    pubsub.on("greetings", fn);
    pubsub.off("greetings", fn);
    chai.expect(pubsub.getNamespace("/").has("greetings")).to.be.false;
  });

  it("Should unsubscribe from 'greetings' subject in 'custom' namespace", () => {
    const fn = m => 0
    pubsub.on("custom", "hello", fn);
    pubsub.on("custom", "greetings", fn);
    pubsub.off("custom", "greetings", fn);
    chai.expect(pubsub.getNamespace("custom").has("greetings")).to.be.false;
  });

});

