const { deepOverride, deepCopy, hyphenate, fuzzySearch, isObject, inPolygon, wordCase, getRandomNumber, uid, loopstack } = window.utilityBelt;


describe("Deep Override", () => {

  it("Should exist an be a function", () => {
    chai.expect(deepOverride).to.be.a("function");
  });

  it("Should override targer object with source object", () => {
    const target = {
      user: {
        name: "John",
        age: 22,
        gender: "male",
        metadata: {
          ststus: "Admin",
        }
      }
    };

    const source = {
      user: {
        name: "Marry",
        age: 21,
        gender: "female",
        metadata: {
          auth: true,
        }
      }
    };

    const expected = {
      user: {
        name: "Marry",
        age: 21,
        gender: "female",
        metadata: {
          auth: true,
          ststus: "Admin"
        }
      }
    };

    const result = deepOverride(target, source);
    chai.expect(result).to.eql(expected);
  });

  it("Should override items in array", () => {
    const source = [1, 2, 3, 4];
    const target = [1, 0, 3, 4, 5];
    const expected = [1, 2, 3, 4, 5];

    const result = deepOverride(target, source);
    chai.expect(result).to.eql(expected);
  });

  it("Should override specyfied items in array", () => {
    const source = [undefined, undefined, 4];
    const target = [1, 2, 3];
    const expected = [1, 2, 4];

    const result = deepOverride(target, source);
    chai.expect(result).to.eql(expected);
  });

  it("Should override specyfied objects in array", () => {
    const source = [undefined, undefined, { name: "Jerry", age: 44 }];
    const target = [{ name: "Rick", age: 55 }, { name: "Beth", age: 43 }, { name: "Morty", age: 14 }];
    const expected = [{ name: "Rick", age: 55 }, { name: "Beth", age: 43 }, { name: "Jerry", age: 44 }];

    const result = deepOverride(target, source);
    chai.expect(result).to.eql(expected);
  });

});



describe("Deep Copy", () => {
  it("Should exist an be a function", () => {
    chai.expect(deepCopy).to.be.a("function");
  });

  it("Should copy an Array", () => {
    const source = [1, 2, 3, 4];
    const result = deepCopy(source);
    chai.expect(result).to.eql(source);
    chai.expect(result).to.not.equal(source);
  });

  it("Should copy an Object", () => {
    const source = {
      user: {
        name: "John",
        surname: "Wick",
        age: 53,
        aliases: [
          "Baba Yaga", "The Boogeyman", "The Reaper"
        ],
      }
    };

    const result = deepCopy(source);
    chai.expect(result).to.eql(source);
    chai.expect(result).to.not.equal(source);
  });

  it("should bypass all types except Arry and Object", () => {
    const symbol = Symbol();
    function fn() { };
    chai.expect(deepCopy(1)).to.equal(1);
    chai.expect(deepCopy(fn)).to.equal(fn);
    chai.expect(deepCopy(null)).to.equal(null);
    chai.expect(deepCopy("one")).to.equal("one");
    chai.expect(deepCopy(symbol)).to.equal(symbol);
    chai.expect(deepCopy(undefined)).to.equal(undefined);
  });

});


describe("Hyphenate", () => {

  it("Should exist an be a function", () => {
    chai.expect(hyphenate).to.be.a("function");
  });

  it("Should remove all spaces, special characters and Polish diactricts", () => {
    const phrase = "Wół go pyta: „Panie chrząszczu, Po co pan tak brzęczy w gąszczu?”";
    const result = hyphenate(phrase);
    const expected = "wol-go-pyta-panie-chrzaszczu-po-co-pan-tak-brzeczy-w-gaszczu";
    chai.expect(result).to.equal(expected);
  });

});



describe("Fuzzy Search", () => {

  it("Should exist an be a function", () => {
    chai.expect(fuzzySearch).to.be.a("function");
  });

  it("Should filter out correct words", () => {
    const phrase = "on";
    const source = ["Love", "Dragon", "Boring", "World"];
    const result = source.filter(word => fuzzySearch(phrase, word));
    const expected = ["Dragon", "Boring"];

    chai.expect(result).to.eql(expected);
  });

});



describe("Is Object", () => {

  it("Should exist an be a function", () => {
    chai.expect(isObject).to.be.a("function");
  });

  it("Should properly detect object", () => {
    chai.expect(isObject(true)).to.be.false;
    chai.expect(isObject("object")).to.be.false;
    chai.expect(isObject([])).to.be.false;
    chai.expect(isObject(1)).to.be.false;
    chai.expect(isObject(null)).to.be.false;
    chai.expect(isObject(Symbol())).to.be.false;
    chai.expect(isObject(function () { })).to.be.false;
    chai.expect(isObject(undefined)).to.be.false;
    chai.expect(isObject({})).to.be.true;
  });

});



describe("Is Polygon", () => {

  it("Should exist an be a function", () => {
    chai.expect(inPolygon).to.be.a("function");
  });

  it("Should detect point in polygon", () => {
    const polygon = [[-1, 3], [-3, 0], [-2, 1], [3, 1], [1, 1], [1, 3]];
    const point = [-1, 1];
    chai.expect(inPolygon(point, polygon)).to.be.true;
  });

});



describe("Word Case", () => {

  it("Should exist an be a function", () => {
    chai.expect(wordCase).to.be.a("function");
  });

  it("Should duse proper word case for given number", () => {

    const caseOptions = {
      one: "zadanie",
      couple: "zadania",
      multiple: "zadań",
    };

    const wcase = wordCase(caseOptions);

    chai.expect(`Masz jedno nowe ${wcase(1)}.`).to.equal("Masz jedno nowe zadanie.");
    chai.expect(`Masz dwa nowe ${wcase(2)}.`).to.equal("Masz dwa nowe zadania.");
    chai.expect(`Masz pięć nowych ${wcase(5)}.`).to.equal("Masz pięć nowych zadań.");
  });

});



describe("Random number form a range", () => {

  it("Should exist an be a function", () => {
    chai.expect(getRandomNumber).to.be.a("function");
  });

  it("Should return a number from a range 2 - 5", () => {
    const result = getRandomNumber(2, 5);
    chai.expect(result >= 2 && result <= 5).to.be.true;
  });

  it("Should generate a set of numbers with repeating ratio < 50%", () => {
    let preValue;
    let counter = 0;
    let totalTrials = 50;
    let numbersRange = [0, 20];

    for (let i = 0; i < totalTrials; i++) {
      const currentValue = getRandomNumber(numbersRange[0], numbersRange[1]);
      preValue === currentValue && counter++;
      preValue = currentValue;
    }

    chai.expect(counter < totalTrials / 2).to.be.true;
  });

});


describe("Generate UUID", () => {

  it("Should exist an be a function", () => {
    chai.expect(uid).to.be.a("function");
  });

  it("Generates valid UUID v4", () => {
    const uuidRegex = /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;
    chai.expect(uuidRegex.test(uid())).to.be.true;
  });
});



describe("Loopstack", () => {

  it("Should exist an be a function", () => {
    chai.expect(loopstack).to.be.a("function");
  });

  it("Should create stack with 5 elements", () => {
    const stack = loopstack(5);
    chai.expect(stack.getAll().length).to.equal(5);
  });

  it("Should push elements onto stack", () => {
    const stack = loopstack(5);

    stack.push("Banana");
    stack.push("Apple");
    stack.push("Cherry");
    stack.push("Lime");

    chai.expect(stack.get(2)).to.equal("Cherry");
  });

  it("Should loop pushed values onto the stack", () => {
    const stack = loopstack(3);

    stack.push("Banana");
    stack.push("Apple");
    stack.push("Cherry");
    stack.push("Lime");

    chai.expect(stack.get(0)).to.equal("Lime");
  });

  it("Should get proper head value from the stack", () => {
    const stack = loopstack(3);

    stack.push("Banana");
    stack.push("Apple");
    stack.push("Cherry");
    stack.push("Lime");
    stack.push("Orange");

    chai.expect(stack.head()).to.equal("Orange");
  });

  it("Should pull out value fronthe stack", () => {
    const stack = loopstack(3);

    stack.push("Banana");
    stack.push("Apple");
    stack.push("Cherry");
    stack.push("Lime");
    stack.push("Orange");

    const lastOne = stack.pull();
    chai.expect(lastOne).to.equal("Orange");
    chai.expect(stack.getAll().includes("Orange")).to.be.false;
  });

});
