
const { html, dynamicElement, createRepeater } = window.utilityBelt;

describe("Dynamic Elements", () => {

  it("UTB Should have an Dynamic Elements API", () => {
    chai.expect(html).to.be.a("function");
    chai.expect(dynamicElement).to.be.a("function");
  });

  it("dynamicElement Should have '__setTerminateInterval' method", () => {
    chai.expect(dynamicElement.__setTerminateInterval).to.be.a("function");
  });

  it("html tag fn Should create {inserts, markup} object", () => {
    const collection = html`<div class="${"hello"}"></div>`;
    chai.expect(collection.markup).to.be.an("array");
    chai.expect(collection.inserts).to.be.an("array");
    chai.expect(collection.markup[0]).to.be.equal("<div class=\"");
    chai.expect(collection.inserts[0]).to.be.equal("hello");
  });

  it("Should create HTMLElement with calss 'hello'", () => {
    const element = dynamicElement(() => html`<div class="hello"></div>`);
    chai.expect(element).to.be.instanceof(HTMLElement);
    chai.expect(element.classList.contains("hello")).to.be.true;
  });

  it("Should create HTMLElement with 'update' method ", () => {
    const element = dynamicElement(() => html`<div class="hello"></div>`);
    chai.expect(element.update).to.be.a("function");
  });

  it("Should create HTMLElement with 'refs' prop", () => {
    const element = dynamicElement(() => html`<div class="hello"></div>`);
    chai.expect(element.refs).to.be.a("object");
  });

  it("Should create HTMLElement with reference to 'input' element in 'refs' prop", () => {
    const element = dynamicElement(() => html`<div class="hello"><input $ref="input" type="text"></div>`);
    chai.expect(element.refs.input).to.be.instanceof(HTMLElement);
  });

  it("Should return two inputs wrapped with div", () => {
    const element = dynamicElement(() => html`<input type="text"><input type="password">`);
    chai.expect(element.nodeName).to.be.equal("DIV");
    chai.expect(element.children.length).to.be.equal(2);
    chai.expect(element.lastChild.nodeName).to.be.equal("INPUT");
    chai.expect(element.firstChild.nodeName).to.be.equal("INPUT");
  });

  it("Should embed HTMLElement into the template", () => {
    const paragraph = document.createElement("span");
    paragraph.textContent = "Hello i'm a paragraph of text";
    const element = dynamicElement(() => html`
        <div>
          <h2>Headline</h2>
          <p>${paragraph}</p>
        </div>
      `);
    const selectedElement = element.lastElementChild.firstElementChild;
    chai.expect(selectedElement).to.be.equal(paragraph);
  });

  it("Should dynamicly insert node into root HTML structure", () => {
    const paragraph = document.createElement("span");
    paragraph.textContent = "Hello i'm a paragraph of text";
    const element = dynamicElement(() => html`
        <div>
          <h2>Headline</h2>
          ${paragraph}
        </div>
      `);
    const selectedElement = element.lastElementChild;
    chai.expect(selectedElement).to.be.equal(paragraph);
  });

  it("Should render element with default content", () => {
    const element = dynamicElement(content => html`<span>${content}</span>`, "hi");
    chai.expect(element.textContent).to.be.equal("hi");
  });

  it("Should update element's content with update() method", () => {
    const element = dynamicElement(content => html`<span>${content}</span>`, "hi");
    chai.expect(element.textContent).to.be.equal("hi");
    element.update("ho");
    chai.expect(element.textContent).to.be.equal("ho");
  });

  it("Should replace text node with block node", () => {
    const paragraph = document.createElement("p");
    paragraph.textContent = "paragraph";
    const element = dynamicElement(node => html`<div>${node}</div>`, "hello");
    chai.expect(element.innerHTML).to.be.equal("hello");
    element.update(paragraph);
    chai.expect(element.innerHTML).to.be.equal("<p>paragraph</p>");
  });

  it("Should replace text node with array of elements", () => {
    const nodeA = document.createElement("span");
    const nodeB = document.createElement("strong");
    const list = [nodeA, nodeB];
    const element = dynamicElement(node => html`<div id="ttoarroe">${node}</div>`, "hello");
    chai.expect(element.innerHTML).to.be.equal("hello");
    element.update(list);
    chai.expect(element.innerHTML).to.be.equal("<span></span><strong></strong>");
  });

  it("Should replace node with array of elements", () => {
    const node = document.createElement("p");
    const nodeA = document.createElement("span");
    const nodeB = document.createElement("strong");
    const list = [nodeA, nodeB];
    const element = dynamicElement(node => html`<div id="ntoarroe">${node}</div>`, node);
    chai.expect(element.innerHTML).to.be.equal("<p></p>");
    element.update(list);
    chai.expect(element.innerHTML).to.be.equal("<span></span><strong></strong>");
  });

  it("Should replace node with text node", () => {
    const node = document.createElement("p");
    const text = "hi";
    const element = dynamicElement(node => html`<div id="txt">${node}</div>`, node);
    chai.expect(element.innerHTML).to.be.equal("<p></p>");
    element.update(text);
    chai.expect(element.innerHTML).to.be.equal("hi");
  });

  it("Should embed an array of HTMLElements into the template", () => {
    const nodeA = document.createElement("span");
    const nodeB = document.createElement("strong");
    const list = [nodeA, nodeB];
    const element = dynamicElement(list => html`<div id="nodes">${list}</div>`, list);
    chai.expect(element.firstElementChild).to.be.equal(nodeA);
    chai.expect(element.lastElementChild).to.be.equal(nodeB);
  });

  it("Should replace array of HTMLElements with single node", () => {
    const node = document.createElement("p");
    const nodeA = document.createElement("span");
    const nodeB = document.createElement("strong");
    const list = [nodeA, nodeB];
    const element = dynamicElement(content => html`<div id="node">${content}</div>`, list);
    chai.expect(element.innerHTML).to.be.equal("<span></span><strong></strong>");
    element.update(node);
    chai.expect(element.innerHTML).to.be.equal("<p></p>");
  });

  it("Should alow for embeding 'strings' and 'numbers' into template", () => {
    // Numbers.
    const elementA = dynamicElement(() => html`<div id="num">${1}</div>`);
    chai.expect(elementA.textContent).to.be.equal("1");

    // Strings.
    const elementB = dynamicElement(() => html`<div id="str">${"hello"}</div>`);
    chai.expect(elementB.textContent).to.be.equal("hello");
  });

  it("Should skip embeded into template 'functions' and 'objects'", () => {
    // Objects.
    const elementA = dynamicElement(() => html`<div id="obj">${{}}</div>`);
    chai.expect(elementA.textContent).to.be.equal("");

    // Functions.
    const elementB = dynamicElement(() => html`<div id="fn">${() => false}</div>`);
    chai.expect(elementB.textContent).to.be.equal("");
  });

  it("Should handle dynaimc and static attibutes", () => {
    const element = dynamicElement(() => html`<input data-index="${0}" type="text" value="${10}">`);
    chai.expect(element.getAttribute("value")).to.be.equal("10");
    chai.expect(element.getAttribute("type")).to.be.equal("text");
    chai.expect(element.getAttribute("data-index")).to.be.equal("0");
  });

  it("Should not allow for non-sting and non-number attributes", () => {
    const t = () => dynamicElement(() => html`<input type="text" value="${document.createTextNode("hello")}">`);
    chai.expect(t).to.throw();
  });

  it("Should update multple attribute entries", () => {
    const a = "add";
    const b = "two";
    const c = "four";
    const a2 = "remove";
    const b2 = "change";

    const container = dynamicElement(({ a, b, c }) => html`<div data-action="${a}" class="one ${b} three ${c}">Hello</div>`, { a, b, c });

    chai.expect(container.className).to.be.equal("one two three four");
    chai.expect(container.dataset.action).to.be.equal("add");

    container.update({ a: a2, b: b2, c });
    chai.expect(container.className).to.be.equal("one change three four");
    chai.expect(container.dataset.action).to.be.equal("remove");
  });

  it("Should allow undefined attributes", () => {
    const element = dynamicElement(type => html`<input type="${type}" value="${10}">`, "text");

    chai.expect(element.getAttribute("value")).to.be.equal("10");
    chai.expect(element.getAttribute("type")).to.be.equal("text");

    element.update(undefined);
    chai.expect(element.getAttribute("type")).to.be.equal("");

    element.update("number");
    chai.expect(element.getAttribute("type")).to.be.equal("number");
  });

  it("Should update value prop when update attribute", () => {
    const element = dynamicElement(value => html`<input value="${value}">`, 10);

    chai.expect(element.getAttribute("value")).to.be.equal("10");
    chai.expect(element.value).to.be.equal("10");

    element.update("ok");

    chai.expect(element.getAttribute("value")).to.be.equal("ok");
    chai.expect(element.value).to.be.equal("ok");

  });


  it("Should apply partial markup to main template", () => {
    const element = dynamicElement(() => html`
        <div>
          <strong>Hello</strong>
          ${html`<ul><li>1</li><li>2</li><li>3</li></ul>`}
        </div>`
    );

    chai.expect(element.lastElementChild.textContent).to.be.equal("123");

  });

  it("Should update partial markup in main template", () => {
    const items = [1, 2, 3];
    const element = dynamicElement(items => html`
        <div>
          <strong>Hello</strong>
          ${html`<ul><li>${items[0]}</li><li>${items[1]}</li><li>${items[2]}</li></ul>`}
        </div>`
      , items);

    element.update([4, 5, 6]);

    chai.expect(element.lastElementChild.textContent).to.be.equal("456");

  });

  it("Should render nestes partials markups", () => {
    const items = [1, 2, 3, 4, 5, 6];
    const sublist = (a, b, c) => html`<span><strong>${a}</strong>${b}<em>${c}</em></span>`;
    const list = (items) => html`<ul><li>${items[0]}</li><li>${items[1]}</li><li>${items[2]}${sublist(items[3], items[4], items[5])}</li></ul>`;
    const element = dynamicElement(items => html`
        <div>
          <strong>Hello</strong>
          ${list(items)}
        </div>`
      , items);

    chai.expect(element.lastElementChild.textContent).to.be.equal("123456");
  });

  it("Should update nestes partials markups", () => {
    const items = [1, 2, 3, 4, 5, 6];
    const sublist = (a, b, c) => html`<span><strong>${a}</strong>${b}<em>${c}</em></span>`;
    const list = (items) => html`<ul><li>${items[0]}</li><li>${items[1]}</li><li>${items[2]}${sublist(items[3], items[4], items[5])}</li></ul>`;
    const element = dynamicElement(items => html`
        <div>
          <strong>Hello</strong>
          ${list(items)}
        </div>`
      , items);

    element.update([1, 2, 3, 4, "a", "b"]);

    chai.expect(element.lastElementChild.textContent).to.be.equal("1234ab");
  });

  it("Should replace nestes partials with DOM node", () => {
    const element = dynamicElement(usePartial => html`<div><strong>Hello</strong>${usePartial ? html`<span>Partial</span>` : "World"}</div>`, false);
    chai.expect(element.textContent).to.be.equal("HelloWorld");
    element.update(true);
    chai.expect(element.textContent).to.be.equal("HelloPartial");
    element.update(false);
    chai.expect(element.textContent).to.be.equal("HelloWorld");
  });

  it("Should render array with partials", () => {
    const items = [1, 2, 3];
    const listItem = item => html`<li>${item}</li>`;
    const element = dynamicElement(list => html`<div><strong>Hello</strong><ul>${list.map(listItem)}</ul></div>`, items);

    chai.expect(element.lastElementChild.textContent).to.be.equal("123");
  });

  it("Should udate partial node in array with partials", () => {
    const items = [1, 2, 3];
    const listItem = item => html`<li>${item}</li>`;
    const element = dynamicElement(list => html`<div><strong>Hello</strong><ul>${list.map(listItem)}</ul></div>`, items);

    element.update([1, "x", 3]);

    chai.expect(element.lastElementChild.textContent).to.be.equal("1x3");
  });


  it("Should repeat elements", () => {
    const items = [
      { id: 1, name: "Item 1" },
      { id: 2, name: "Item 2" },
      { id: 3, name: "Item 3" },
      { id: 4, name: "Item 4" },
      { id: 5, name: "Item 5" },
    ];

    const ListItemUi = item => html`<li>${item.name}</li>`;
    const Items = items => html`<ul $key="${i => i.id}" $items="${items}">${ListItemUi}</ul>`;
    const list = dynamicElement(Items, items);

    chai.expect(list.textContent).to.be.equal("Item 1Item 2Item 3Item 4Item 5");
  });

  it("Should reuse repeated elements", () => {
    const items = [
      { id: 1, name: "Item 1" },
      { id: 2, name: "Item 2" },
      { id: 3, name: "Item 3" },
    ];

    const ListItemUi = item => html`<li>${item.name}</li>`;
    const Items = items => html`<ul $key="${i => i.id}" $items="${items}">${ListItemUi}</ul>`;
    const listA = dynamicElement(Items, items);
    const item2Ref = listA.children[1];

    const items2 = [...items];
    items[1].name = "Changed";

    listA.update(items2);

    chai.expect(listA.children[1]).to.be.equal(item2Ref);
    chai.expect(listA.children[1].textContent).to.be.equal("Changed");
  });

  it("Should re-render reperater when $items attribute changes", () => {

    let spy = chai.spy();
    let items = [1, 2, 3, 4];
    let ListItemUi = item => {
      spy();
      return html`<li>${item}</li>`;
    }
    let List = items => html`<ul $key="${i => i}" $items="${items}">${ListItemUi}</ul>`

    const listElement = dynamicElement(List, items);
    chai.expect(spy).to.have.been.called(4);

    listElement.update(items);
    chai.expect(spy).to.have.been.called(4);

    items[1] = "X";
    listElement.update(items);
    chai.expect(spy).to.have.been.called(4);

    listElement.update([1, 2, 3, 4, 5]);
    chai.expect(spy).to.have.been.called(9);

  });

  it("Should not re-render reperater when repeater fn changes", () => {

    let spyA = chai.spy();
    let spyB = chai.spy();
    let items = [1];

    let ListItem = item => {
      spyA();
      return html`<li>${item}</li>`;
    }

    let List = items => html`<ul $key="${i => i}" $items="${items}">${ListItem}</ul>`

    const listElement = dynamicElement(List, items);
    chai.expect(spyA).to.have.been.called(1);

    ListItem = item => {
      spyB();
      return html`<li>${item}</li>`;
    }

    listElement.update(items);
    chai.expect(spyB).to.not.have.been.called;

  });

  it("Should destroy repeater elements after given time", done => {

    const items = [
      { id: 1, name: "Item 1" },
      { id: 2, name: "Item 2" },
      { id: 3, name: "Item 3" },
    ];

    const ListItemUi = item => html`<li>${item.name}</li>`;
    const Items = items => html`<ul $key="${i => i.id}" $items="${items}">${ListItemUi}</ul>`;
    const listA = dynamicElement(Items, items);
    const item2Ref = listA.children[1];

    dynamicElement.__setTerminateInterval(100);

    setTimeout(() => {
      items[1].name = "Changed";
      listA.update([...items]);
      chai.expect(listA.children[1]).to.not.be.equal(item2Ref);
      dynamicElement.__setTerminateInterval(300_000);
      done();
    }, 400);
  });

});
