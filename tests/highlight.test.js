import "../dist/utility-belt.umd.js";

const { highlight } = UtilityBelt;

describe("highlight", () => {
  it("returns the original text when no phrases are provided", () => {
    expect(highlight("Good and goofy", "")).to.equal("Good and goofy");
  });

  it("wraps each case-insensitive phrase in strong tags", () => {
    expect(highlight("Good and goofy", "go, fy")).to.equal(
      "<strong>Go</strong>od and <strong>go</strong>o<strong>fy</strong>",
    );
  });
});