import { dynamicElement } from "./template.js";

/* USAGE:

  import { component, html, dynamicElement } from "@ludekarts/utility-belt";


// ----------------------------------------------------

// 1. Shorthand (no static logic in component).

  const MyComponent = component(text => html`<div>${text}</div>`);

  document.body.append(MyComponent("hello"));

  // Update component.
  MyComponent("hello world");


// ----------------------------------------------------

// 2. Full (with static logic in component).

  const MyComponent = component((state, otherParam1, otherParam2, ...) => {
    const element = dynamicElement(text => html`<div>${text}</div>`, state);

    element.onclick = () => alert("Element clicked!");

    return element;
  });


  // ⚠️ NOTE ⚠️:
  // In "Full" variant of component function you have access to additional parameters next to @state (see below 👇).
  // Howewer component will be called with them only on the first render.

  document.body.append(MyComponent("hello", otherParam1, otherParam2));

  // Update component.
  MyComponent("hello world");


  // ----------------------------------------------------

  // 3. Shorthand/Full with state selector.

  const state = {
    article: {
      title: "Hello",
    },
  };

  const MyComponent = component(text => html`<h1>${text}</h1>`, state => state.article.title);

  document.body.append(MyComponent(state));

  // Update component.
  state.article.title = "Hello world";
  MyComponent(state);

**/

export default function component(componentFn, selector) {
  let element;
  return (...props) => {
    const [state, ...rest] = props;

    if (!element) {
      element = componentFn(selector ? selector(state) : state, ...rest);

      // When component() is used in a shorthand version;
      if (!(element instanceof HTMLElement)) {
        element = dynamicElement(componentFn, selector ? selector(state) : state)
      }
    }

    else if (element.update) {
      element.update(selector ? selector(state) : state);
    }

    else {
      console.warn("Component's element is not a dynamicElement");
    }

    return element;
  }
}
