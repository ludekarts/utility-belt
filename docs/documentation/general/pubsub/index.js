import { PubSub } from "../../../assets/ubm/utility-belt.js";

(function () {
  const pubsub = PubSub(logger);
  const customBtn = document.getElementById("pubsub-cn-call");
  const defaultBtn = document.getElementById("pubsub-dn-call");

  const showAlert = msg => alert(msg);

  pubsub.subscribe("hello", showAlert);
  pubsub.subscribe("custom", "hello", showAlert);


  defaultBtn.addEventListener("click", event => {
    pubsub.publish("hello", "Hello from DEFAULT namespace");
  });

  customBtn.onclick = () => {
    pubsub.publish("custom", "hello", "Hello from CUSTOM namespace");
  }

}());

function logger(message, data) {
  console.log(message, data);
}