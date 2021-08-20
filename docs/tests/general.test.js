
const { hyphenate } = window.utilityBelt;

describe("Hyphenate", () => {

  it("Hyphenateshould exist an be a function", () => {
    chai.expect(hyphenate).to.be.a("function");
  });

  it("Should remove all spaces, special characters and Polish diactricts", () => {
    const word = hyphenate("Wół go pyta: „Panie chrząszczu, Po co pan tak brzęczy w gąszczu?”");
    const result = "wol-go-pyta-panie-chrzaszczu-po-co-pan-tak-brzeczy-w-gaszczu";
    chai.expect(word).to.equal(result);
  });

});



describe("Hyphenate", () => {

  it("Hyphenateshould exist an be a function", () => {
    chai.expect(hyphenate).to.be.a("function");
  });

  it("Should remove all spaces, special characters and Polish diactricts", () => {
    const word = hyphenate("Wół go pyta: „Panie chrząszczu, Po co pan tak brzęczy w gąszczu?”");
    const result = "wol-go-pyta-panie-chrzaszczu-po-co-pan-tak-brzeczy-w-gaszczu";
    chai.expect(word).to.equal(result);
  });

});