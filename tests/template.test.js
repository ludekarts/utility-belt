// import { template } from "../../src/index.js" // Development;
import { template } from "../../docs/lib/utility-belt.module.js" // Production;

describe("template", () => {
  it("should be a function", () => {
    chai.expect(template).to.be.a("function");
  });

  it("should throw when called as function", () => {
    chai.expect(template).to.throw();
  });

  it("should return single HTMLElement with calss 'hello'", () => {
    const element = template`<div class="hello"></div>`;
    chai.expect(element).to.be.instanceof(HTMLElement);
    chai.expect(element.classList.contains("hello")).to.be.true;
  });

  it("should return two inputs wrapped with div", () => {
    const element = template`<input type="text"><input type="password">`;
    chai.expect(element.nodeName).to.be.equal("DIV");
    chai.expect(element.children.length).to.be.equal(2);
    chai.expect(element.lastChild.nodeName).to.be.equal("INPUT");
    chai.expect(element.firstChild.nodeName).to.be.equal("INPUT");
  });

  it("should return an array of HTMLElement and refs object with button named 'btn'", () => {
    const [element, refs] = template`<div class="hello"><button ref="btn">hello</button></div>`;
    chai.expect(element).to.be.instanceof(HTMLElement);
    chai.expect(refs).to.be.an("object").that.has.keys("btn");
    chai.expect(refs.btn.nodeName).to.be.equal("BUTTON");
  });

  it("should include embeded HTMLElement into the template", () => {
    const paragraph = document.createElement("span");
    paragraph.textContent = "Hello i'm a paragraph of text";

    const element = template`
      <div>
        <h2>Headline</h2>
        <p>${paragraph}</p>
      </div>
    `;

    const selectedElement = element.lastElementChild.firstElementChild;
    chai.expect(selectedElement).to.be.equal(paragraph);
  });

  it("should embed an array of HTMLElements into the template", () => {
    const nodeA = document.createElement("span");
    const nodeB = document.createElement("strong");
    const list = [nodeA, nodeB];
    const element = template`<div>${list}</div>`;
    chai.expect(element.firstElementChild).to.be.equal(nodeA);
    chai.expect(element.lastElementChild).to.be.equal(nodeB);
  });

  it("should alow for embeding 'strings' and 'numbers' into template", () => {
    // Numbers.
    const elementA = template`<div>${1}</div>`;
    chai.expect(elementA.textContent).to.be.equal("1");

    // Strings.
    const elementB = template`<div>${"helllo"}</div>`;
    chai.expect(elementB.textContent).to.be.equal("helllo");
  });

  it("should skip embeded into template 'functions' and 'objects'", () => {
    // Objects.
    const elementA = template`<div>${{}}</div>`;
    chai.expect(elementA.textContent).to.be.equal("");

    // Functions.
    const elementB = template`<div>${() => false}</div>`;
    chai.expect(elementB.textContent).to.be.equal("");
  });

});
