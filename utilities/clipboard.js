// Allows for copying text to clipboard.

export default function clipboard() {
  const container = document.getElementById("_clipContainer_") || document.createElement("textarea");

  if (!container.id) {
    container.id = "_clipContainer_";
    container.style.opacity = 0;
    container.style.position= "fixed";
    container.style.pointerEvents= "none";
    document.body.appendChild(container);
  }

  return value => {
    try {
      container.value = value;
      container.select();
      document.execCommand("copy");
      return value;
    } catch (error) {
      console.error(error);
      return;
    }
  }
}
