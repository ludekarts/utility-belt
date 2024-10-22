describe("PubSub tests", () => {
  const { PubSub } = window.UtilityBelt;
  const pubsub = PubSub();

  it("Should have default namespace", () => {
    expect(pubsub.__namespace().has("/")).to.be.true;
  });

  it("Should create new 'hello' subject in default namespace", () => {
    pubsub.on("hello", () => 0);
    expect(pubsub.__namespace("/").observers.has("hello")).to.be.true;
  });

  it("Should create 'custom' namespace", () => {
    pubsub.on("custom", "x", () => 0);
    expect(pubsub.__namespace().has("custom")).to.be.true;
  });

  it("Should create new 'hello' subject in 'custom' namespace", () => {
    pubsub.on("custom", "hello", () => 0);
    expect(pubsub.__namespace("custom").observers.has("hello")).to.be.true;
  });

  it("Should publish message in 'hello' subject in default namespace", () => {
    pubsub.on("hello", (m) => expect(m).to.equal("This is message"));
    pubsub.emmit("hello", "This is message");
  });

  it("Should publish message in 'hello' subject in 'custom' namespace", () => {
    pubsub.on("custom", "hello", (m) => expect(m).to.equal("This is message"));
    pubsub.emmit("custom", "hello", "This is message");
  });

  it("Should not be able to remove default namespace", () => {
    const ns = pubsub.__namespace("/", { remove: true });
    expect(ns.has("/")).to.be.true;
  });

  it("Should remove 'custom' namespace", () => {
    const ns = pubsub.__namespace("custom", { remove: true });
    expect(ns.has("custom")).to.be.false;
  });

  it("Should unsubscribe from 'greetings' subject in default namespace", () => {
    const fn = () => 0;
    pubsub.on("greetings", fn);
    pubsub.off("greetings", fn);
    expect(pubsub.__namespace("/").observers.has("greetings")).to.be.false;
  });

  it("Should unsubscribe from 'greetings' subject in 'custom' namespace", () => {
    const fn = () => 0;
    pubsub.on("custom", "hello", fn);
    pubsub.on("custom", "greetings", fn);
    pubsub.off("custom", "greetings", fn);
    expect(pubsub.__namespace("custom").observers.has("greetings")).to.be.false;
  });

  it("Should subscribe to all events in default namespasce", () => {
    const spy = chai.spy();
    pubsub.on("*", spy);
    pubsub.emmit("hi", "This is HI message!");
    pubsub.emmit("ho", "This is HO message!");
    pubsub.emmit("he", "This is HE message!");
    expect(spy).to.have.been.called(3);
  });

  it("Should subscribe to all events in 'custom' namespasce", () => {
    const spy = chai.spy();
    pubsub.on("custom", "*", spy);
    pubsub.emmit("custom", "hi", "This is HI message!");
    pubsub.emmit("custom", "ho", "This is HO message!");
    pubsub.emmit("custom", "he", "This is HE message!");
    pubsub.emmit("other", "er", "This should not be registered!");
    expect(spy).to.have.been.called(3);
  });
});
