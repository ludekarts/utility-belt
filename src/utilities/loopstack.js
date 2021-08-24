// Create a looping stack.
export default function loopstack(length) {
  let head;
  let counter = 0;
  const stack = new Array(length);

  return Object.freeze({
    push(item) {
      if (!item) return;
      stack[counter] = item;
      head = stack[counter];
      counter = (counter + 1) % length;
    },

    pull() {
      counter = (counter - 1 + length) % length;
      head = stack[counter];
      stack[counter] = undefined;
      return head;
    },

    get(index) {
      return stack[index];
    },

    head() {
      return head;
    },

    getAll() {
      return stack;
    }

  });
};