import "../dist/utility-belt.umd.js";

describe("Query helpers", () => {
  const { getQueryParams, updateQueryParams } = window.UtilityBelt;

  it("Should get query params", () => {
    const [id, user] = getQueryParams(
      "id",
      "user",
      "https://example.com?id=123&user=admin&filter=age&filter=address"
    );
    expect(id).to.be.equal("123");
    expect(user).to.be.equal("admin");
  });

  it("Should get query params as array", () => {
    const [id, filter] = getQueryParams(
      "id",
      "filter[]",
      "https://example.com?id=123&user=admin&filter=age&filter=address"
    );
    expect(id).to.be.equal("123");
    expect(filter).to.be.an("array");
    expect(filter[0]).to.be.equal("age");
    expect(filter[1]).to.be.equal("address");
  });

  it("Should update single query param", () => {
    const query = updateQueryParams(
      "https://example.com?id=123&user=admin&filter=age&filter=address",
      "id",
      "456"
    );

    expect(decodeURIComponent(query)).to.be.equal(
      "https://example.com?id=456&user=admin&filter=age&filter=address"
    );
  });

  it("Should update multiple query param", () => {
    const query = updateQueryParams(
      "https://example.com?id=123&user=admin&filter=age&filter=address",
      {
        id: "789",
        user: "editor",
      }
    );
    expect(decodeURIComponent(query)).to.be.equal(
      "https://example.com?id=789&user=editor&filter=age&filter=address"
    );
  });

  it("Should update array params", () => {
    const query = updateQueryParams(
      "https://example.com?id=123&user=admin&filter=age&filter=address",
      {
        id: "789",
        filter: ["gender", "status", "height"],
      }
    );
    expect(decodeURIComponent(query)).to.be.equal(
      "https://example.com?id=789&user=admin&filter=gender&filter=status&filter=height"
    );
  });

  it("Should remove param ", () => {
    const query = updateQueryParams(
      "https://example.com?id=123&user=admin&filter=age&filter=address",
      {
        id: undefined,
        user: "editor",
      }
    );
    expect(decodeURIComponent(query)).to.be.equal(
      "https://example.com?user=editor&filter=age&filter=address"
    );
  });

  it("Should remove array params", () => {
    const query = updateQueryParams(
      "https://example.com?id=123&user=admin&filter=age&filter=address",
      {
        filter: undefined,
      }
    );

    expect(decodeURIComponent(query)).to.be.equal(
      "https://example.com?id=123&user=admin"
    );

    const query2 = updateQueryParams(
      "https://example.com?id=123&user=admin&filter=age&filter=address",
      "filter"
    );

    expect(decodeURIComponent(query2)).to.be.equal(
      "https://example.com?id=123&user=admin"
    );
  });

  it("Should support relative URLs and preserve fragments", () => {
    const query = updateQueryParams("/items#results", "page", "2");

    expect(query).to.be.equal("/items?page=2#results");
  });

  it("Should return duplicate values predictably", () => {
    const [firstFilter, allFilters] = getQueryParams(
      "filter",
      "filter[]",
      "/items?filter=age&filter=address&filter=status"
    );

    expect(firstFilter).to.be.equal("age");
    expect(allFilters).to.deep.equal(["age", "address", "status"]);
  });

  it("Should keep existing key order and append replacement arrays in order", () => {
    const query = updateQueryParams("/items?a=1&filter=old&z=3", {
      a: "2",
      filter: ["age", "status"],
    });

    expect(query).to.be.equal("/items?a=2&z=3&filter=age&filter=status");
  });
});
