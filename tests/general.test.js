import "../dist/utility-belt.umd.js";

describe("Generla helpers tests", () => {
  const {
    uid,
    isObject,
    wordCase,
    hyphenate,
    isPromise,
    inPolygon,
    getRandomNumber,
  } = window.UtilityBelt;

  it("Should hyphenate phrase", () => {
    expect(hyphenate("Hello World")).to.equal("hello-world");
    expect(hyphenate("Łódź na tafli jeziora!")).to.equal(
      "lodz-na-tafli-jeziora"
    );
  });

  it("Should varify if value is an object", () => {
    expect(isObject({})).to.be.true;
    expect(isObject([])).to.be.false;
    expect(isObject("")).to.be.false;
    expect(isObject(1)).to.be.false;
    expect(isObject(null)).to.be.false;
    expect(isObject(undefined)).to.be.false;
  });

  it("Should varify if value is a promise", () => {
    expect(isPromise(Promise.resolve())).to.be.true;
    expect(isPromise({})).to.be.false;
    expect(isPromise([])).to.be.false;
    expect(isPromise("")).to.be.false;
    expect(isPromise(1)).to.be.false;
    expect(isPromise(null)).to.be.false;
    expect(isPromise(undefined)).to.be.false;
  });

  it("Should varify if value is insied a polygon", () => {
    expect(
      inPolygon(
        [1, 1],
        [
          [0, 0],
          [2, 0],
          [2, 2],
          [0, 2],
        ]
      )
    ).to.be.true;
    expect(
      inPolygon(
        [3, 3],
        [
          [0, 0],
          [2, 0],
          [2, 2],
          [0, 2],
        ]
      )
    ).to.be.false;
  });

  it("Should apply proper word case", () => {
    const getCase = wordCase({
      one: "produkt",
      some: "produkty",
      multiple: "produktów",
    });
    expect(getCase(1)).to.equal("produkt");
    expect(getCase(2)).to.equal("produkty");
    expect(getCase(3)).to.equal("produkty");
    expect(getCase(5)).to.equal("produktów");
  });

  it("Should give a randomnumber", () => {
    expect(getRandomNumber(1, 10)).to.be.within(1, 10);
    expect(getRandomNumber(1, 10)).to.be.within(1, 10);
    expect(getRandomNumber(1, 10)).to.be.within(1, 10);
  });

  it("Should generate new UID ", () => {
    const uid1 = uid();
    const uid2 = uid();
    expect(uid1).to.be.a("string");
    expect(uid2).to.be.a("string");
    expect(uid1).to.not.equal(uid2);

    expect(uid1).to.have.length(36);
    expect(uid2).to.have.length(36);

    const uid3 = uid("--short");
    expect(uid3).to.have.length(8);
  });
});
