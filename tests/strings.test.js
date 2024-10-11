import "../dist/utility-belt.umd.js";

describe("Strings tests", () => {
  it("Should split word at given index", () => {
    const result = UtilityBelt.splitAtIndex("Hello World", 5);
    expect(result).to.eql(["Hello", " World"]);
  });

  it("Should insert word at given index", () => {
    const result = UtilityBelt.insertStrAtIndex(
      "Hello World",
      " Beautifull",
      5
    );
    expect(result).to.equal("Hello Beautifull World");
  });
});
