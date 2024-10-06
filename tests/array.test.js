import "../dist/utility-belt.umd.js";

describe("Array tests", () => {
  it("Should convert array of object into object w/ keys created from selected velue", () => {
    const array = [
      { name: "John", age: 25 },
      { name: "Jane", age: 22 },
    ];
    const obj = UtilityBelt.arrayToObject(array, "name");
    expect(obj).to.deep.equal({
      John: { name: "John", age: 25 },
      Jane: { name: "Jane", age: 22 },
    });
  });

  it("Should chunk array", () => {
    const array = [1, 2, 3, 4, 5];
    const chunked = UtilityBelt.chunkArray(array, 2);
    expect(chunked).eql([[1, 2], [3, 4], [5]]);
  });

  it("Should compare arrays", () => {
    const arrayA = [1, 2, 3, 4, 5];
    const arrayB = [3, 4, 5, 6, 7];
    const compared = UtilityBelt.compareArrays(arrayA, arrayB);
    expect(compared).to.deep.equal({ added: [6, 7], removed: [1, 2] });
  });

  it("Should get random subarray", () => {
    const array = [1, 2, 3, 4, 5];
    const subarray = UtilityBelt.getRandomSubarray(array, 2);
    expect(subarray.length).eql(2);
  });

  it("Should reduce array", () => {
    const array = [1, 2, 3, 4, 5];
    const reduced = UtilityBelt.reduce(array, (acc, val) => acc + val, 0);
    expect(reduced).eql(15);
  });

  it("Should loop array", () => {
    const array = [1, 2, 3, 4, 5];
    let sum = 0;
    UtilityBelt.loop(array, (val) => (sum += val));
    expect(sum).eql(15);
  });

  it("Should shuffle array", () => {
    const array = [1, 2, 3, 4, 5];
    const shuffled = UtilityBelt.shuffleArray(array);
    expect(shuffled).not.eql(array);
  });

  it("Should remove item by index", () => {
    const array = [1, 2, 3, 4, 5];
    const removed = UtilityBelt.removeByIndex(array, 2);
    expect(removed).eql([1, 2, 4, 5]);
  });

  it("Should remove item by instance", () => {
    const array = [1, 2, 3, 4, 5];
    const removed = UtilityBelt.removeByInstance(array, 3);
    expect(removed).eql([1, 2, 4, 5]);
  });

  it("Should replace item on index", () => {
    const array = [1, 2, 3, 4, 5];
    const replaced = UtilityBelt.replaceOnIndex(array, 2, 10);
    expect(replaced).eql([1, 2, 10, 4, 5]);
  });

  it("Should swap array items (swap in place)", () => {
    const array = [1, 2, 3, 4, 5];
    const swapped = UtilityBelt.swapItems(array, 0, 3);
    expect(swapped).eql([4, 2, 3, 1, 5]);
  });

  it("Should swap items order (move from -> to)", () => {
    const array = [1, 2, 3, 4, 5];
    const swapped = UtilityBelt.swapOrder(array, 0, 3);
    expect(swapped).eql([2, 3, 4, 1, 5]);
  });

  it("Should insert item at index", () => {
    const array = [1, 2, 3, 4, 5];
    const inserted = UtilityBelt.insertAtIndex(array, 2, 10);
    expect(inserted).eql([1, 2, 10, 3, 4, 5]);
  });

  it("Should zip arrays", () => {
    const array1 = [1, 2, 3];
    const array2 = [4, 5, 6];
    const zipped = UtilityBelt.zipArray(array1, array2);
    expect(zipped).eql([
      [1, 4],
      [2, 5],
      [3, 6],
    ]);
  });

  it("Should get unique array", () => {
    const array = [1, 2, 3, 1, 2, 3];
    const unique = UtilityBelt.uniqueArray(array);
    expect(unique).eql([1, 2, 3]);
  });

  it("Should sort out array", () => {
    const [even, odd] = UtilityBelt.sortOutArray(
      [1, 2, 3, 4, 5],
      (x) => x % 2 === 0
    );
    expect(even).eql([2, 4]);
    expect(odd).eql([1, 3, 5]);
  });

  it("Should split array at index", () => {
    const array = [1, 2, 3, 4, 5];
    const splitted = UtilityBelt.splitArrayAt(array, 2);
    expect(splitted).eql([
      [1, 2],
      [3, 4, 5],
    ]);
  });
});
