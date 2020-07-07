
const { createTemplate, getRefs } = window.utilityBelt;

describe("createTemplate", () => {
  it("should be a function", () => {
    chai.expect(createTemplate).to.be.a("function");
  });

  it("should return single HTMLElement with calss 'hello'", () => {
    const template = createTemplate();
    const element = template`<div class="hello"></div>`;
    chai.expect(element).to.be.instanceof(HTMLElement);
    chai.expect(element.classList.contains("hello")).to.be.true;
  });

  it("should return two inputs wrapped with div", () => {
    const template = createTemplate();
    const element = template`<input type="text"><input type="password">`;
    chai.expect(element.nodeName).to.be.equal("DIV");
    chai.expect(element.children.length).to.be.equal(2);
    chai.expect(element.lastChild.nodeName).to.be.equal("INPUT");
    chai.expect(element.firstChild.nodeName).to.be.equal("INPUT");
  });

  it("should return an array of HTMLElement and refs object with button named 'btn'", () => {
    const template = createTemplate();
    const element = template`<div class="hello"><button ref="btn">hello</button></div>`;
    const refs = getRefs(element);
    chai.expect(element).to.be.instanceof(HTMLElement);
    chai.expect(refs).to.be.an("object").that.has.keys("btn");
    chai.expect(refs.btn.nodeName).to.be.equal("BUTTON");
  });

  it("should embed HTMLElement into the template", () => {
    const template = createTemplate();
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

  it("should dynamicly insert node into root HTML structure", () => {
    const template = createTemplate();
    const paragraph = document.createElement("span");
    paragraph.textContent = "Hello i'm a paragraph of text";

    const element = template`
      <div>
        <h2>Headline</h2>
        ${paragraph}
      </div>
    `;

    const selectedElement = element.lastElementChild;
    chai.expect(selectedElement).to.be.equal(paragraph);
  });

  it("should replace text node with block node", () => {
    const template = createTemplate();
    const paragraph = document.createElement("p");
    paragraph.textContent = "paragraph";

    const render = node => template`
      <div>${node}</div>
    `;

    const element = render("hello");
    chai.expect(element.innerHTML).to.be.equal("hello");
    render(paragraph);

    chai.expect(element.innerHTML).to.be.equal("<p>paragraph</p>");
  });

  it("should embed an array of HTMLElements into the template", () => {
    const template = createTemplate();
    const nodeA = document.createElement("span");
    const nodeB = document.createElement("strong");
    const list = [nodeA, nodeB];
    const element = template`<div>${list}</div>`;
    chai.expect(element.firstElementChild).to.be.equal(nodeA);
    chai.expect(element.lastElementChild).to.be.equal(nodeB);
  });

  it("should handle dynaimc and static attibutes", () => {
    const template = createTemplate();
    const element = template`<input data-index="${0}" type="text" value="${10}">`;
    chai.expect(element.getAttribute("value")).to.be.equal("10");
    chai.expect(element.getAttribute("type")).to.be.equal("text");
    chai.expect(element.getAttribute("data-index")).to.be.equal("0");
  });

  it("should not allow for non-sting and non-number attributes", () => {
    const template = createTemplate();
    const t = () => template`<input type="text" value="${document.createTextNode("hello")}">`;
    chai.expect(t).to.throw();
  });

  it("should alow for embeding 'strings' and 'numbers' into template", () => {
    const template = createTemplate();
    // Numbers.
    const elementA = template`<div>${1}</div>`;
    chai.expect(elementA.textContent).to.be.equal("1");

    // Strings.
    const elementB = template`<div>${"helllo"}</div>`;
    chai.expect(elementB.textContent).to.be.equal("helllo");
  });

  it("should skip embeded into template 'functions' and 'objects'", () => {
    const template = createTemplate();
    // Objects.
    const elementA = template`<div>${{}}</div>`;
    chai.expect(elementA.textContent).to.be.equal("");

    // Functions.
    const elementB = template`<div>${() => false}</div>`;
    chai.expect(elementB.textContent).to.be.equal("");
  });
});

