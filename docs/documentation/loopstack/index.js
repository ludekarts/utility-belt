import { loopstack, events } from "../../lib/utility-belt.module.js";

(function() {
  const loopstackExample = document.getElementById("loopstack-example");
  const display = loopstackExample.querySelector(".display");
  const pulled = loopstackExample.querySelector(".pulled");
  const handlers = events(loopstackExample, "click");
  const card = loopstack(5);

  handlers.add("addItem", event => {
    card.push(event.target.textContent);
    drawBasket();
  });

  handlers.add("pullItem", event => {
    pulled.innerHTML = `Pulled: ${card.pull() || "⚪️"}`;
    drawBasket();
  });

  handlers.add("getIndex", event => {
    pulled.innerHTML = `Pulled: ${card.get(3) || "⚪️"}`;
    drawBasket();
  });

  handlers.add("pullHead", event => {
    pulled.innerHTML = `Pulled: ${card.head() || "⚪️"}`;
    drawBasket();
  });

  function drawBasket() {
    let basket = "";
    for(let i = 0; i < 5; i++) {
      const item = card.dump()[i];
      basket += ` ${item || "⚪️"}`;
    }
    display.innerHTML = `Basket: [ ${basket} ]`;
  }
}());