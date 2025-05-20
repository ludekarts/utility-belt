import "../dist/utility-belt.umd.js";

describe("Strings tests", () => {
  const { splitAtIndex, insertStringAtIndex } = window.UtilityBelt;

  it("Should split word at given index", () => {
    const result = splitAtIndex("Hello World", 5);
    expect(result).to.eql(["Hello", " World"]);
  });

  it("Should insert word at given index", () => {
    const result = insertStringAtIndex("Hello World", " Beautifull", 5);
    expect(result).to.equal("Hello Beautifull World");
  });
});
