import "../dist/utility-belt.umd.js";

const { component, html, unsafeHtml } = UtilityBelt;

describe("Component HTML safety", () => {
  it("renders untrusted interpolated markup as text on creation and update", () => {
    const render = component(() => (value) => html`<div>${value}</div>`);
    const element = render('<img src=x onerror="window.xss = true">');

    expect(element.querySelector("img")).to.equal(null);
    expect(element.textContent).to.equal(
      '<img src=x onerror="window.xss = true">',
    );

    element.d.update("<script>window.xss = true</script>");

    expect(element.querySelector("script")).to.equal(null);
    expect(element.textContent).to.equal("<script>window.xss = true</script>");
  });

  it("rejects untrusted markup for $innerhtml", () => {
    const render = component(
      () => () =>
        html`<div $innerhtml=${"<img src=x onerror=alert(1)>"}></div>`,
    );

    expect(render).to.throw("$innerhtml requires unsafeHtml");
  });

  it("renders explicitly trusted markup through unsafeHtml", () => {
    const render = component(
      () => () =>
        html`<div $innerhtml=${unsafeHtml("<strong>Trusted</strong>")}></div>`,
    );
    const element = render();

    expect(element.innerHTML).to.equal("<strong>Trusted</strong>");
  });
});
