const { arrayToObject, chunksArray, compareArrays, getRandomSubarray, nodeListToArray, createElement, loop, reduce, shuffleArray, sortByPhraseIndex } = window.utilityBelt;



describe("Transform array to object", () => {

  it("Should exist an be a function", () => {
    chai.expect(arrayToObject).to.be.a("function");
  });

  it("Should collect array items in object lebeled by 'name' property", () => {
    const source = [{ name: "John", age: 22 }, { name: "Marry", age: 21 }];
    const result = arrayToObject(source, "name");
    const expected = { John: { name: "John", age: 22 }, Marry: { name: "Marry", age: 21 } };
    chai.expect(result).to.eql(expected);
  });

});



describe("Chunks array", () => {

  it("Should exist an be a function", () => {
    chai.expect(chunksArray).to.be.a("function");
  });

  it("Should slice array in chunks of 2 elements", () => {
    const source = [1, 2, 3, 4, 5];
    const result = chunksArray(source, 2);
    const expected = [[1, 2], [3, 4], [5]];
    chai.expect(result).to.eql(expected);
  });

});



describe("Compare two arrays", () => {

  it("Should exist an be a function", () => {
    chai.expect(compareArrays).to.be.a("function");
  });

  it("Should slice array in chunks of 2 elements", () => {
    const versionA = [1, 2, 3, 4, 5];
    const versionB = [1, 3, 4, 5, 7, 8];
    const result = compareArrays(versionA, versionB);
    const expected = {
      added: [7, 8],
      removed: [2],
    };
    chai.expect(result).to.eql(expected);
  });

});



describe("Get random subarray", () => {

  it("Should exist an be a function", () => {
    chai.expect(getRandomSubarray).to.be.a("function");
  });

  it("Should generate subaray with random elements from source array", () => {
    const source = [1, 2, 3, 4, 5, 6];
    const result = getRandomSubarray(source, 3);
    const sourceContainsAllReults = result.every(i => source.includes(i));

    chai.expect(result).to.have.lengthOf(3);
    chai.expect(sourceContainsAllReults).to.be.true;
  });

});



describe("NodeList to array", () => {

  it("Should exist an be a function", () => {
    chai.expect(nodeListToArray).to.be.a("function");
  });

  it("Should generate subaray with random elements from source array", () => {

    [1, 2, 3, 4].forEach(i => {
      document.body.append(createElement("span.list-item"));
    });

    const list = nodeListToArray(document.querySelectorAll(".list-item"));

    chai.expect(Array.isArray(list)).to.be.true;
    chai.expect(list).to.have.lengthOf(4);
  });

});



describe("Loop array", () => {

  it("Should exist an be a function", () => {
    chai.expect(loop).to.be.a("function");
  });

  it("Should loop though array and update items to n+1", () => {
    const source = [1, 2, 3, 4, 5];
    const expected = [2, 3, 4, 5, 6];

    loop(source, (item, index, array) => array[index] = item + 1);
    chai.expect(source).to.eql(expected);
  });

});



describe("Reduce array", () => {

  it("Should exist an be a function", () => {
    chai.expect(reduce).to.be.a("function");
  });

  it("Should reduce array into one numeric value", () => {
    const source = [1, 2, 3, 4, 5];
    const result = reduce(source, (acc, current) => acc += current, 0);
    const expeceted = 15;
    chai.expect(result).to.be.equal(expeceted);
  });

  it("Should reduce array into a value and return object with value as a last step", () => {
    const source = [1, 2, 3, 4, 5];
    const result = reduce(source, (acc, current, _index, isLast) => {
      const value = acc + current;
      return isLast ? { value } : value;
    }, 0);
    const expeceted = { value: 15 };

    chai.expect(result).to.be.eql(expeceted);
  });

});



describe("Shuffle array", () => {

  it("Should exist an be a function", () => {
    chai.expect(shuffleArray).to.be.a("function");
  });

  it("Should shuffle the array", () => {
    const source = [1, 2, 3, 4, 5];
    const result = shuffleArray(source);
    chai.expect(source).to.have.same.members(result);
    chai.expect(source).to.not.deep.equal(result);
  });

});



describe("Sort by phrase index", () => {

  it("Should exist an be a function", () => {
    chai.expect(sortByPhraseIndex).to.be.a("function");
  });

  it("Should sort items by phrase index", () => {
    const source = ["zero", "big", "deep", "deer", "bolder", "older"].sort();
    const result = sortByPhraseIndex(source, "de");
    const expected = ["deep", "deer", "older", "bolder", "big", "zero"];
    chai.expect(result).to.eql(expected);
  });

  it("Should sort items of objects by phrase index", () => {
    const source = [
      { value: "zero" },
      { value: "big" },
      { value: "deep" },
      { value: "deer" },
      { value: "bolder" },
      { value: "older" },
    ].sort((a, b) => a.value.localeCompare(b.value));
    const result = sortByPhraseIndex(source, "de", i => i.value);
    const expected = [
      { value: "deep" },
      { value: "deer" },
      { value: "older" },
      { value: "bolder" },
      { value: "big" },
      { value: "zero" },
    ];
    chai.expect(result).to.eql(expected);
  });

});

