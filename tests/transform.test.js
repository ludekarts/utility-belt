import "../dist/utility-belt.umd.js";
const { transformObject } = UtilityBelt;

describe("transformObject tests", () => {
  it("transforms values in nested plain objects and arrays", () => {
    const result = transformObject(
      { name: "Ada", nested: { count: 1 }, items: [2, { label: "new" }] },
      (key, value) => {
        if (typeof value === "number") return value + 1;
        if (typeof value === "string") return `${key}:${value}`;
      },
    );

    expect(result).to.eql({
      name: "name:Ada",
      nested: { count: 2 },
      items: [3, { label: "label:new" }],
    });
  });

  it("preserves special objects without traversing them", () => {
    class Example {
      constructor() {
        this.count = 1;
      }
    }

    const date = new Date();
    const map = new Map([["count", 1]]);
    const instance = new Example();
    const result = transformObject(
      { count: 1, date, map, instance },
      (_key, value) => (typeof value === "number" ? value + 1 : undefined),
    );

    expect(result.count).to.equal(2);
    expect(result.date).to.equal(date);
    expect(result.map).to.equal(map);
    expect(result.instance).to.equal(instance);
  });

  it("traverses null-prototype objects and preserves custom-prototype objects", () => {
    const specialObject = Object.assign(Object.create({ inherited: 1 }), {
      own: 2,
    });
    const nullPrototype = Object.assign(Object.create(null), { value: 3 });
    const result = transformObject(
      { specialObject, nullPrototype },
      (_key, value) => (typeof value === "number" ? value * 2 : undefined),
    );

    expect(result.specialObject).to.equal(specialObject);
    expect(result.nullPrototype).to.deep.equal({ value: 6 });
  });
});
