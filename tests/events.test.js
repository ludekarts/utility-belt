import "../dist/utility-belt.umd.js";
const { catchEvents } = UtilityBelt;

describe("catchEvents tests", () => {
  it("removes delegated listeners when destroyed", () => {
    const root = document.createElement("div");
    const button = document.createElement("button");
    button.dataset.click = "save";
    root.append(button);

    const handler = chai.spy();
    const handlers = catchEvents(root, "click");
    handlers.add("save", handler);

    button.click();
    expect(handler).to.have.been.called.once;

    handlers.destroy();
    handlers.destroy();
    button.click();
    expect(handler).to.have.been.called.once;
  });
});
