import "../dist/utility-belt.umd.js";

const { debounce, throttle, triggerIfRapid, wait } = UtilityBelt;

describe("Delay helper boundaries", () => {
  it("wait resolves without a value", async () => {
    expect(await wait(0)).to.equal(undefined);
  });

  it("debounce invokes only the latest call with its arguments", async () => {
    const callback = chai.spy();
    const delayed = debounce(callback, 5);

    delayed("first");
    delayed("last");
    await wait(15);

    expect(callback).to.have.been.called.once;
    expect(callback).to.have.been.called.with("last");
  });

  it("throttle suppresses calls until its wait period has elapsed", async () => {
    const callback = chai.spy();
    const throttled = throttle(callback, 5);

    throttled("first");
    throttled("ignored");
    await wait(15);
    throttled("next");

    expect(callback).to.have.been.called.twice;
    expect(callback).to.have.been.called.with("next");
  });

  it("triggerIfRapid only invokes on a second call within its delta", () => {
    const callback = chai.spy();
    const rapid = triggerIfRapid(callback, 1000);

    rapid("first");
    rapid("second");
    rapid("third");

    expect(callback).to.have.been.called.once;
    expect(callback).to.have.been.called.with("second");
  });
});
