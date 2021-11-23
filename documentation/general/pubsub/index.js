import { PubSub } from "../../../assets/ubm/utility-belt.js";

(function () {
  const pubsub = PubSub(logger);
  const customBtn = document.getElementById("pubsub-cn-call");
  const defaultBtn = document.getElementById("pubsub-dn-call");

  const showAlert = msg => alert(msg);

  pubsub.on("hello", showAlert);
  pubsub.on("custom", "hello", showAlert);


  defaultBtn.addEventListener("click", event => {
    pubsub.dispatch("hello", "Hello from DEFAULT namespace");
  });

  customBtn.onclick = () => {
    pubsub.dispatch("custom", "hello", "Hello from CUSTOM namespace");
  }

}());

function logger(message, data) {
  console.log(message, data);
}