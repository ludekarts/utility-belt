import "../dist/utility-belt.umd.js";

describe("FuzzySearch tests", () => {
  const { fuzzySearch } = window.UtilityBelt;

  it("Should find best match base on phrase distance from start", () => {
    const texts = [
      "hello world",
      "this is hell",
      "hotel like this",
      "hotel like this hello",
      "hotel like this helloello",
    ];

    const results = fuzzySearch(texts, "llo").map((r) => r.text);

    expect(results).to.eql([
      "hello world",
      "hotel like this hello",
      "hotel like this helloello",
    ]);

    const results2 = fuzzySearch(texts, "rd").map((r) => r.text);

    expect(results2).to.eql(["hello world"]);
  });
});
