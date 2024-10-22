import "../dist/utility-belt.umd.js";

describe("Forms helpers", () => {
  const { getFormFields, updateForm } = window.UtilityBelt;

  it("Should get form fields", () => {
    const form = createForm();
    const { name, email, age, gender, subscribe, country, comments } =
      getFormFields(form);

    expect(name).to.be.equal("John");
    expect(email).to.be.equal("john@example.com");
    expect(age).to.be.equal("30");
    expect(gender).to.be.equal("male");
    expect(subscribe).to.be.equal(true);
    expect(country).to.be.equal("ca");
    expect(comments).to.be.equal("Hello test");

    form.remove();
  });

  it("Should get form fields including checkbox values", () => {
    const form = createForm();
    const { name, email, age, gender, subscribe, country, comments } =
      getFormFields(form, { includeCheckboxValues: true });

    expect(name).to.be.equal("John");
    expect(email).to.be.equal("john@example.com");
    expect(age).to.be.equal("30");
    expect(gender).to.be.equal("male");
    expect(subscribe).to.be.eql({
      value: "subscribe",
      checked: true,
    });
    expect(country).to.be.equal("ca");
    expect(comments).to.be.equal("Hello test");

    form.remove();
  });

  it("Should update form fields values", () => {
    const form = createForm();
    updateForm(form, {
      name: "Jane",
      gender: {
        value: "female",
        checked: true,
      },
      country: "uk",
    });

    const { name, gender, country } = getFormFields(form);

    expect(name).to.be.equal("Jane");
    expect(gender).to.be.equal("female");
    expect(country).to.be.equal("uk");

    form.remove();
  });
});

// ---- Helpers ----------------

function createForm() {
  const form = document.createElement("form");

  form.style.position = "absolute";
  form.style.pointerEvents = "none";
  form.style.opacity = 0;

  form.innerHTML = `
  <input type="text" name="name" value="John">
  <input type="email" name="email" value="john@example.com">
  <input type="number" name="age" min="1" max="100" value="30">
  <input type="radio" name="gender" value="male" checked>
  <input type="radio" name="gender" value="female">
  <input type="checkbox" name="subscribe" value="subscribe" checked>
  <select name="country">
    <option value="us">United States</option>
    <option value="uk">United Kingdom</option>
    <option value="ca" selected>Canada</option>
  </select>
  <textarea name="comments" rows="4" cols="50">Hello test</textarea>
  <input type="submit" value="Submit">
`;

  document.body.appendChild(form);

  return form;
}
