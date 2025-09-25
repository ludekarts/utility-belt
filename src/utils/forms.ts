/**
 *
 * Get an object with all form fields and their values.
 *
 * @example
 *
 * <form id="myForm">
 *   <input type="text" name="name" value="John">
 *   <input type="number" name="age" value="25">
 *   <input type="radio" name="mood" value="bad">
 *   <input type="radio" name="mood" value="good" checked>
 *   <input type="checkbox" name="element" value="🔥" checked>
 *   <input type="checkbox" name="element" value="💧">
 * </form>
 *
 * const { name, age, mood, element } = getFormFields("#myForm");
 * // element => ["🔥", "💧"]
 *
 * OR w/ options:
 *
 * -> includeCheckboxState: true - include the checkbox state in the result (checked/unchecked)
 *
 * const { name, age, mood, element } = getFormFields("#myForm",  { includeCheckboxState: true });
 * // element => [{ value: "🔥", checked: true }, { value: "💧", checked: false }]
 *
 * -> onlyCheckboxState: true - only include the checkbox state in the result (true/false)
 *
 * const { name, age, mood, element } = getFormFields("#myForm",  { onlyCheckboxState: true });
 * // element => [true, false]
 *
 * -> onlyRecentValues: true - include only the most recent (last in the DOM tree) value for each "name" field
 *
 * const { name, age, mood, element } = getFormFields("#myForm",  { onlyRecentValues: true });
 * // element => ["💧"]
 *
 * -> onlySelectedCheckboxes: true - include in the result only value of selected checkboxes
 *
 * const { name, age, mood, element } = getFormFields("#myForm",  { onlySelectedCheckboxes: true });
 * // element => ["🔥"]
 *
 */

export type CheckboxValue = { value?: string; checked: boolean };
export type FormValue = string | boolean | CheckboxValue;
export type FormFieldsOptions = {
  onlySelectedCheckboxes?: boolean;
  includeCheckboxState?: boolean;
  onlyCheckboxState?: boolean;
  onlyRecentValues?: boolean;
};

export function getFormFields<R>(
  form: HTMLFormElement,
  options: FormFieldsOptions = {}
): R {
  const {
    onlySelectedCheckboxes = false,
    includeCheckboxState = false,
    onlyCheckboxState = false,
    onlyRecentValues = false,
  } = options;
  const fields: Map<string, FormValue | FormValue[]> = new Map();

  for (const element of form.elements) {
    const { name, type, value, checked } = element as HTMLInputElement;
    if (name) {
      !fields.has(name) && fields.set(name, []);

      if (type === "checkbox") {
        if (onlySelectedCheckboxes && !checked) {
          continue;
        }

        let pushValue: FormValue = onlyCheckboxState ? checked : value;

        if (includeCheckboxState) {
          pushValue = onlyCheckboxState ? { checked } : { value, checked };
        }

        (fields.get(name) as FormValue[]).push(pushValue);
      } else if (type === "radio") {
        checked && fields.set(name, [value]);
      } else {
        (fields.get(name) as FormValue[]).push(value);
      }
    }
  }

  // Cleanup.

  for (const [name, v] of fields.entries()) {
    const values = v as FormValue[];
    const recentValue = (values as FormValue[])[values.length - 1];

    // Set only the most recent value.
    if (onlyRecentValues && Array.isArray(values)) {
      fields.set(name, recentValue);
    }

    // Remove empty fields.
    if (values.length === 0) {
      fields.delete(name);
    }
    // If only one value then set it as a single value not an array.
    else if (values.length === 1) {
      fields.set(name, recentValue);
    }
    // Keep multiple values if not requires only recent value.
    else if (!onlyRecentValues) {
      fields.set(name, values);
    }
  }

  return Object.fromEntries(fields.entries()) as R;
}

/**
 * This is an imperative way to update a form. When providing a @source object all form's inputs that names matches
 * fields in @source will be translated into the inputs "value".
 *
 *
 * @example
 *`
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
  source: Record<string, FormValue>
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
