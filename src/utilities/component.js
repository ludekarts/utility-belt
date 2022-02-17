import { html, derivableState } from "./template.js";

export default function component(renderFunction, initState) {
  let api = {};
  let prevState = initState;
  let key = { component: Date.now() + Math.random() };

  api.element = renderFunction(initState, key);

  api.refs = html.refs(api.element);

  api.render = state => {
    const newState = derivableState(prevState, state);
    const newRender = renderFunction(newState, key);
    prevState = newState;
    return newRender;
  };

  api.install = (plugin, ...args) => {
    return plugin(api, ...args);
  };

  api.destroy = () => {
    html.destroy(key);
    api.element.remove();
    api.install = undefined;
    api.element = undefined;
    api.render = undefined;
    api.remove = undefined;
    api.refs = undefined;
    api = undefined;
    key = undefined;
    prevState = undefined;
  };

  return api;
}
