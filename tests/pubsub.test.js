
const { PubSub } = window.utilityBelt;
const pubsub = PubSub({ debug: true });

describe("PubSub", () => {
  it("should have default namespace", () => {
    chai.expect(pubsub.getNamespace().has("/")).to.be.true;
  });

  it("should create new 'hello' subject in default namespace", () => {
    pubsub.subscribe("hello", () => 0);
    chai.expect(pubsub.getNamespace("/").has("hello")).to.be.true;
  });

  it("should create 'custom' namespace", () => {
    pubsub.subscribe("custom", "x", () => 0);
    chai.expect(pubsub.getNamespace().has("custom")).to.be.true;
  });

  it("should create new 'hello' subject in 'custom' namespace", () => {
    pubsub.subscribe("custom", "hello", () => 0);
    chai.expect(pubsub.getNamespace("custom").has("hello")).to.be.true;
  });

  it("should publish message in 'hello' subject in default namespace", () => {
    pubsub.subscribe("hello", m => chai.expect(m).to.equal("This is message"));
    pubsub.publish("hello", "This is message");
  });

  it("should publish message in 'hello' subject in 'custom' namespace", () => {
    pubsub.subscribe("custom", "hello", m => chai.expect(m).to.equal("This is message"));
    pubsub.publish("custom", "hello", "This is message");
  });

  it("should not be able to remove default namespace", () => {
    const ns = pubsub.getNamespace("/", true);
    chai.expect(ns.has("/")).to.be.true;
  });

  it("should remove 'custom' namespace", () => {
    const ns = pubsub.getNamespace("custom", true);
    chai.expect(ns.has("custom")).to.be.false;
  });

  it("should unsubscribe from 'greetings' subject in default namespace", () => {
    const fn = m => 0
    pubsub.subscribe("greetings", fn);
    pubsub.unsubscribe("greetings", fn);
    chai.expect(pubsub.getNamespace("/").has("greetings")).to.be.false;
  });

  it("should unsubscribe from 'greetings' subject in 'custom' namespace", () => {
    const fn = m => 0
    pubsub.subscribe("custom", "hello", fn);
    pubsub.subscribe("custom", "greetings", fn);
    pubsub.unsubscribe("custom", "greetings", fn);
    console.log(pubsub.getNamespace("custom"));
    chai.expect(pubsub.getNamespace("custom").has("greetings")).to.be.false;
  });

});

