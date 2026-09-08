import "../dist/utility-belt.umd.js";

const { fragment, copyAttrs, moveNodes } = UtilityBelt;

describe("DOM helper boundaries", () => {
  it("returns a single element or a fragment for trusted markup", () => {
    const single = fragment("<p>One</p>");
    const multiple = fragment("<p>One</p><p>Two</p>");

    expect(single.tagName).to.equal("P");
    expect(multiple).to.be.instanceOf(DocumentFragment);
    expect(multiple.childElementCount).to.equal(2);
  });

  it("wraps markup and rejects an invalid wrapper", () => {
    const wrapped = fragment("<p>One</p><p>Two</p>", "section");

    expect(wrapped.tagName).to.equal("SECTION");
    expect(wrapped.children).to.have.length(2);
    expect(() => fragment("<p>One</p>", null)).to.throw(
      "FragmentError: domWrapper must be a string or undefined",
    );
  });

  it("copies attributes except excluded names and moves all node types", () => {
    const source = document.createElement("div");
    source.setAttribute("id", "source");
    source.setAttribute("data-state", "ready");
    const target = document.createElement("div");
    copyAttrs(source, target, ["id"]);

    source.append("text", document.createElement("span"));
    moveNodes(source, target);

    expect(target.hasAttribute("id")).to.be.false;
    expect(target.dataset.state).to.equal("ready");
    expect(target.childNodes).to.have.length(2);
    expect(source.childNodes).to.have.length(0);
  });
});