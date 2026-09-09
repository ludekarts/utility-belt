import "../dist/utility-belt.umd.js";

describe("Compress JSON helpers tests", () => {
  const { compressJson, decompressJson } = window.UtilityBelt;

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
