type FormValue = null | string | boolean | { value: string; checked: boolean };
type FormFields = Record<string, FormValue>;

type FormFieldsOptions = {
  includeCheckboxValues: boolean;
};

/**
 *
 * Get an object with all form fields and their values.
 *
 * ⚠️ NOTICE:
 * In case of checkboxes the value is replaced with "checked" state since in most cases this is what you want
 * from toggle switch rather than the value that is not changing.
 *
 * @example
 *
 * <form id="myForm">
 *   <input type="text" name="name" value="John">
 *   <input type="number" name="age" value="25">
 *   <input type="radio" name="mood" value="bad">
 *   <input type="radio" name="mood" value="good" checked>
 *   <input type="checkbox" name="active" value="🔥" checked>
 * </form>
 *
 * const { name, age, mood, active } = getFormFields("#myForm");
 * // active => true
 *
 * OR W/ options
 *
 * const { name, age, mood, active } = getFormFields("#myForm",  { includeCheckboxValues: true });
 * // active => { value: "🔥", checked: true }
 *
 */

export function getFormFields(
  form: HTMLFormElement,
  options: FormFieldsOptions = { includeCheckboxValues: false }
) {
  return (Array.from(form.elements) as HTMLFormElement[]).reduce(
    (acc, element) => {
      if (element.name) {
        if (element.type === "radio") {
          if (element.checked) {
            acc[element.name] = element.value;
          }
        } else if (element.type === "checkbox") {
          if (options.includeCheckboxValues) {
            acc[element.name] = {
              value: element.value,
              checked: element.checked,
            };
          } else {
            acc[element.name] = element.checked;
          }
        } else {
          acc[element.name] = element.value;
        }
      }
      return acc;
    },
    {} as FormFields
  );
}

/**
 * This is an imperative way to update a form. When providing a @source object all form's inputs that names matches
 * fields in @source will be translated into the inputs "value".
 *
 *
 * @example
 *
 *💡HINT:
 * If you wnant to update other properties on the input e.g. "checked" field then use object notation
 * instead a plain value like so:

 * formUpdate("#form", {
 *   name: "Rex",
 *   active: {
 *     checked: true,
 *     value: "🦖"
 *   }
 * });
 *
 * 💡HINT:
 *  If you want to update a multiple radio buttons with same name then just treat them as a one files input
 *  and set the value normally e.g.:
 *
 *  <form id="form">
 *    <input type="radio" name="mood" value="bad">
 *    <input type="radio" name="mood" value="neutral" checked>
 *    <input type="radio" name="mood" value="good">
 *  </form>
 *
 *  . . .
 *
 * formUpdate("#form", {
 *  mood: {
 *     value: "good",
 *     checked: true,
 *   }
 * });
 *
 **/
export function updateForm(
  selector: HTMLFormElement | string,
  source: FormFields
) {
  const form =
    selector instanceof HTMLFormElement
      ? selector
      : document.querySelector(selector);

  if (form instanceof HTMLFormElement) {
    (Array.from(form.elements) as HTMLFormElement[]).forEach((element) => {
      if (element.name) {
        const value = source[element.name];
        if (value !== undefined) {
          if (isSimpleValue(value)) {
            element.value = value;
          } else if (typeof value === "object" && value !== null) {
            Object.keys(value as object).forEach(
              (key) => (element[key] = value[key as keyof typeof value])
            );
          }
        }
      }
    });
  } else {
    throw new Error("UpdateFormError:Cannot find form element to update");
  }
}

function isSimpleValue(value: any) {
  return (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean" ||
    typeof value === "number"
  );
}
