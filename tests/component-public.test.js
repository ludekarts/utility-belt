import "../dist/utility-belt.umd.js";

const { component, html } = window.UtilityBelt;

describe("Component public API", () => {
  it("exports html and component", () => {
    expect(html).to.be.a("function");
    expect(component).to.be.a("function");
  });

  it("creates templates with values and an optional ID", () => {
    const template = html`<div>${"Hello"}</div>`;
    const keyedTemplate = html("greeting")`<span>${"Hi"}</span>`;

    expect(template.markup).to.be.an("array");
    expect(template.values).to.deep.equal(["Hello"]);
    expect(keyedTemplate.id).to.equal("greeting");
    expect(keyedTemplate.values).to.deep.equal(["Hi"]);
  });

  it("renders and updates a component through its public render function", () => {
    const render = component(
      () => (state) =>
        html`<div class="${state.className}">${state.label}</div>`,
    );
    const element = render({ className: "ready", label: "First" });

    expect(element).to.be.instanceof(HTMLElement);
    expect(element.className).to.equal("ready");
    expect(element.textContent).to.equal("First");

    render({ className: "updated", label: "Second" });

    expect(element.className).to.equal("updated");
    expect(element.textContent).to.equal("Second");
  });
});
