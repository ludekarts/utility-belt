
const { html, debugElementsStore } = window.utilityBelt;

describe("DOM Templates", () => {
  it("should be a function", () => {
    chai.expect(html).to.be.a("function");
  });

  it("should have 'refs' and 'destroy' methods", () => {
    chai.expect(html.refs).to.be.a("function");
    chai.expect(html.destroy).to.be.a("function");
  });

  it("should return single HTMLElement with calss 'hello'", () => {
    const element = html`<div class="hello"></div>`;
    chai.expect(element).to.be.instanceof(HTMLElement);
    chai.expect(element.classList.contains("hello")).to.be.true;
  });

  it("should return two inputs wrapped with div", () => {
    const element = html`<input type="text"><input type="password">`;
    chai.expect(element.nodeName).to.be.equal("DIV");
    chai.expect(element.children.length).to.be.equal(2);
    chai.expect(element.lastChild.nodeName).to.be.equal("INPUT");
    chai.expect(element.firstChild.nodeName).to.be.equal("INPUT");
  });

  it("should embed HTMLElement into the template", () => {
    const paragraph = document.createElement("span");
    paragraph.textContent = "Hello i'm a paragraph of text";
    const element = html`
      <div>
        <h2>Headline</h2>
        <p>${paragraph}</p>
      </div>
    `;
    const selectedElement = element.lastElementChild.firstElementChild;
    chai.expect(selectedElement).to.be.equal(paragraph);
  });

  it("should dynamicly insert node into root HTML structure", () => {
    const paragraph = document.createElement("span");
    paragraph.textContent = "Hello i'm a paragraph of text";
    const element = html`
      <div>
        <h2>Headline</h2>
        ${paragraph}
      </div>
    `;
    const selectedElement = element.lastElementChild;
    chai.expect(selectedElement).to.be.equal(paragraph);
  });

  it("should update same DOM element when use same template with string ID", () => {
    const element = html("#9")`<span>${"hi"}</span>`;
    chai.expect(element.textContent).to.be.equal("hi");
    html("#9")`<span>${"ho"}</span>`;
    chai.expect(element.textContent).to.be.equal("ho");
  });

  it("should update same DOM element when use same template with reference ID", () => {
    const id = [];
    const element = html(id)`<span>${"hi"}</span>`;
    chai.expect(element.textContent).to.be.equal("hi");
    html(id)`<span>${"ho"}</span>`;
    chai.expect(element.textContent).to.be.equal("ho");
  });

  it("should create two instance of HTMLElement when not use ID", () => {
    const element = html`<div class="hello"></div>`;
    const element2 = html`<div class="hello"></div>`;
    chai.expect(element).to.be.instanceof(HTMLElement);
    chai.expect(element2).to.be.instanceof(HTMLElement);
    chai.expect(element).to.not.be.equal(element2);
  });

  it("should return an array of HTMLElement and refs object with button named 'btn'", () => {
    const element = html("#1")`<div class="hello"><button ref="btn">hello</button></div>`;
    const refs = html.refs(element);
    chai.expect(element).to.be.instanceof(HTMLElement);
    chai.expect(refs).to.be.an("object").that.has.keys("btn");
    chai.expect(refs.btn.nodeName).to.be.equal("BUTTON");
  });

  it("should not override template with same key", () => {
    const element = html("#2")`<div class="hello"></div>`;
    const element2 = html("#2")`<div class="goodbye"></div>`;
    chai.expect(element).to.be.instanceof(HTMLElement);
    chai.expect(element).to.be.equal(element2);
  });

  it("should replace text node with block node", () => {
    const paragraph = document.createElement("p");
    paragraph.textContent = "paragraph";
    const render = node => html("#3")`<div id="ttobn">${node}</div>`;
    const element = render("hello");
    chai.expect(element.innerHTML).to.be.equal("hello");
    render(paragraph);
    chai.expect(element.innerHTML).to.be.equal("<p>paragraph</p>");
  });

  it("should replace text node with array of elements", () => {
    const nodeA = document.createElement("span");
    const nodeB = document.createElement("strong");
    const list = [nodeA, nodeB];
    const render = node => html("#4")`<div id="ttoarroe">${node}</div>`;
    const element = render("hello");
    chai.expect(element.innerHTML).to.be.equal("hello");
    render(list);
    chai.expect(element.innerHTML).to.be.equal("<span></span><strong></strong>");
  });

  it("should replace node with array of elements", () => {
    const node = document.createElement("p");
    const nodeA = document.createElement("span");
    const nodeB = document.createElement("strong");
    const list = [nodeA, nodeB];
    const render = node => html("#5")`<div id="ntoarroe">${node}</div>`;
    const element = render(node);
    chai.expect(element.innerHTML).to.be.equal("<p></p>");
    render(list);
    chai.expect(element.innerHTML).to.be.equal("<span></span><strong></strong>");
  });

  it("should replace node with text node", () => {
    const node = document.createElement("p");
    const text = "hi";
    const render = node => html("#6")`<div id="txt">${node}</div>`;
    const element = render(node);
    chai.expect(element.innerHTML).to.be.equal("<p></p>");
    render(text);
    chai.expect(element.innerHTML).to.be.equal("hi");
  });

  it("should embed an array of HTMLElements into the template", () => {
    const nodeA = document.createElement("span");
    const nodeB = document.createElement("strong");
    const list = [nodeA, nodeB];
    const element = html("#7")`<div id="nodes">${list}</div>`;
    chai.expect(element.firstElementChild).to.be.equal(nodeA);
    chai.expect(element.lastElementChild).to.be.equal(nodeB);
  });

  it("should replace array of HTMLElements with single node", () => {
    const node = document.createElement("p");
    const nodeA = document.createElement("span");
    const nodeB = document.createElement("strong");
    const list = [nodeA, nodeB];
    const render = content => html("#8")`<div id="node">${content}</div>`;
    const element = render(list);
    chai.expect(element.innerHTML).to.be.equal("<span></span><strong></strong>");
    render(node);
    chai.expect(element.innerHTML).to.be.equal("<p></p>");
  });

  it("should alow for embeding 'strings' and 'numbers' into template", () => {
    // Numbers.
    const elementA = html`<div id="num">${1}</div>`;
    chai.expect(elementA.textContent).to.be.equal("1");

    // Strings.
    const elementB = html`<div id="str">${"hello"}</div>`;
    chai.expect(elementB.textContent).to.be.equal("hello");
  });

  it("should skip embeded into template 'functions' and 'objects'", () => {
    // Objects.
    const elementA = html`<div id="obj">${{}}</div>`;
    chai.expect(elementA.textContent).to.be.equal("");

    // Functions.
    const elementB = html`<div id="fn">${() => false}</div>`;
    chai.expect(elementB.textContent).to.be.equal("");
  });

  it("should handle dynaimc and static attibutes", () => {
    const element = html`<input data-index="${0}" type="text" value="${10}">`;
    chai.expect(element.getAttribute("value")).to.be.equal("10");
    chai.expect(element.getAttribute("type")).to.be.equal("text");
    chai.expect(element.getAttribute("data-index")).to.be.equal("0");
  });

  it("should not allow for non-sting and non-number attributes", () => {
    const t = () => html`<input type="text" value="${document.createTextNode("hello")}">`;
    chai.expect(t).to.throw();
  });

  it("should destroy element", () => {
    const element = html("#10")`<span>Hello</span>`;
    html.destroy("#10");
    const element2 = html("#10")`<span>Hello</span>`;
    chai.expect(element).to.not.be.equal(element2);
  });

  it("should move elements to another container", () => {
    const content = ["A", "B", "C", "D"];
    const redenrContent = el => html(`el-${el}`)`<span>${el}</span>`;
    const container = html`<div>${content.map(redenrContent)}</div>`;
    chai.expect(container.textContent).to.be.equal("ABCD");
    content.reverse();
    const container2 = html`<div>${content.map(redenrContent)}</div>`;
    chai.expect(container2.textContent).to.be.equal("DCBA");
  });

});


// window.__debugElementsStore = debugElementsStore;
// debugElementsStore();
// html.__setTerminateInterval(5000);
// setTimeout(() => {
//   document.body.append(html("X")`<p>HELLO</p>`);
//   debugElementsStore();
// }, 6000);
