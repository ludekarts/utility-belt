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
 * Checkbox values are included whether checked or not. Radio groups include
 * only their checked value. Disabled form controls are excluded.
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
export type FormFields = Record<string, FormValue | FormValue[]>;
export type FormUpdateValue = FormValue | number | null;
export type FormFieldsOptions = {
  onlySelectedCheckboxes?: boolean;
  includeCheckboxState?: boolean;
  onlyCheckboxState?: boolean;
  onlyRecentValues?: boolean;
};

export function getFormFields(
  form: HTMLFormElement,
  options: FormFieldsOptions = {},
): FormFields {
  const {
    onlySelectedCheckboxes = false,
    includeCheckboxState = false,
    onlyCheckboxState = false,
    onlyRecentValues = false,
  } = options;
  const fields = new Map<string, FormValue[]>();

  for (const element of form.elements) {
    if (!isFormControl(element) || !element.name || element.disabled) {
      continue;
    }

    const { name, value } = element;

    // Add new name.
    if (!fields.has(name)) {
      fields.set(name, []);
    }

    // Handle checkboxes.
    if (element instanceof HTMLInputElement && element.type === "checkbox") {
      if (onlySelectedCheckboxes && !element.checked) {
        continue;
      }

      let pushValue: FormValue = onlyCheckboxState ? element.checked : value;

      if (includeCheckboxState) {
        pushValue = onlyCheckboxState
          ? { checked: element.checked }
          : { value, checked: element.checked };
      }
      fields.get(name)?.push(pushValue);
    }

    // Handle radio buttons.
    else if (element instanceof HTMLInputElement && element.type === "radio") {
      element.checked && fields.set(name, [value]);
    }

    // Handle other input types.
    else {
      fields.get(name)?.push(value);
    }
  }

  // Cleanup.

  const result: FormFields = {};
  for (const [name, values] of fields.entries()) {
    const recentValue = values[values.length - 1];

    // Set only the most recent value.
    if (values.length === 0) {
      continue;
    }
    // If only one value then set it as a single value not an array.
    if (onlyRecentValues || values.length === 1) {
      result[name] = recentValue;
    }
    // Keep multiple values if not requires only recent value.
    else {
      result[name] = values;
    }
  }

  return result;
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
  source: Record<string, FormUpdateValue>,
) {
  const form =
    selector instanceof HTMLFormElement
      ? selector
      : document.querySelector(selector);

  if (form instanceof HTMLFormElement) {
    Array.from(form.elements).forEach((element) => {
      if (isFormControl(element) && element.name) {
        const value = source[element.name];
        if (value !== undefined) {
          if (isSimpleValue(value)) {
            element.value = value === null ? "" : String(value);
          } else {
            if (value.value !== undefined) {
              element.value = value.value;
            }
            if (element instanceof HTMLInputElement) {
              element.checked = value.checked;
            }
          }
        }
      }
    });
  } else {
    throw new Error("UpdateFormError:Cannot find form element to update");
  }
}

function isFormControl(
  element: Element,
): element is
  | HTMLInputElement
  | HTMLSelectElement
  | HTMLButtonElement
  | HTMLTextAreaElement {
  return (
    element instanceof HTMLInputElement ||
    element instanceof HTMLSelectElement ||
    element instanceof HTMLButtonElement ||
    element instanceof HTMLTextAreaElement
  );
}

function isSimpleValue(
  value: unknown,
): value is string | boolean | number | null {
  return (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  );
}
