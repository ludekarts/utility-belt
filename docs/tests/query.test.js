const { getQueryParams, updateQueryParams } = window.utilityBelt;


describe("Query helpers", () => {

  it("should get query params", () => {
    const [id, user] = getQueryParams("id", "user", "http://exampla.com?id=123&user=admin&filter=age&filter=address");
    chai.expect(id).to.be.equal("123");
    chai.expect(user).to.be.equal("admin");
  });

  it("should get query params as array", () => {
    const [id, filter] = getQueryParams("id", "filter", "http://exampla.com?id=123&user=admin&filter=age&filter=address");
    chai.expect(id).to.be.equal("123");
    chai.expect(filter).to.be.an("array");
    chai.expect(filter[0]).to.be.equal("age");
    chai.expect(filter[1]).to.be.equal("address");
  });

  it("should update single query param", () => {
    const query = updateQueryParams("http://exampla.com?id=123&user=admin&filter=age&filter=address", "id", "456");
    chai.expect(decodeURIComponent(query)).to.be.equal("http://exampla.com?id=456&user=admin&filter=age&filter=address");
  });

  it("should update multiple query param", () => {
    const query = updateQueryParams("http://exampla.com?id=123&user=admin&filter=age&filter=address", {
      id: "789",
      user: "editor",
    });
    chai.expect(decodeURIComponent(query)).to.be.equal("http://exampla.com?id=789&user=editor&filter=age&filter=address");
  });

  it("should update array params", () => {
    const query = updateQueryParams("http://exampla.com?id=123&user=admin&filter=age&filter=address", {
      id: "789",
      filter: ["gender", "status", "height"],
    });
    chai.expect(decodeURIComponent(query)).to.be.equal("http://exampla.com?id=789&user=admin&filter=gender&filter=status&filter=height");
  });

  it("should remove param ", () => {
    const query = updateQueryParams("http://exampla.com?id=123&user=admin&filter=age&filter=address", {
      id: undefined,
      user: "editor",
    });
    chai.expect(decodeURIComponent(query)).to.be.equal("http://exampla.com?user=editor&filter=age&filter=address");
  });

  it("should remove array params", () => {
    const query = updateQueryParams("http://exampla.com?id=123&user=admin&filter=age&filter=address", {
      filter: undefined,
    });
    chai.expect(decodeURIComponent(query)).to.be.equal("http://exampla.com?id=123&user=admin");

    const query2 = updateQueryParams("http://exampla.com?id=123&user=admin&filter=age&filter=address", "filter");
    chai.expect(decodeURIComponent(query2)).to.be.equal("http://exampla.com?id=123&user=admin");
  });

});

