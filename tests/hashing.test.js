import "../dist/utility-belt.umd.js";

describe("Hashing helpers tests", () => {
  const { hashCode, compressJson, decompressJson } = window.UtilityBelt;

  it("Should hash a string", () => {
    const h1 = hashCode("Hello World");
    const h2 = hashCode("Hello World");
    expect(h1).to.be.a("number");
    expect(h1).to.equal(h2);
  });

  it("Should compress and decompress a JSON object", async () => {
    const user = {
      name: "John Doe",
      age: 30,
      city: "New York",
    };

    const compressed = await compressJson(user);
    const decompressed = await decompressJson(compressed);

    expect(compressed).to.be.a("string");
    expect(decompressed).to.be.an("object");
    expect(decompressed).to.eql(user);
  });
});
