const { html, component, getRandomSubarray } = window.utilityBelt;

const state = {
  input: "",
  error: "",
  todos: [],
  emoji: "🤯",
};

function getEmoji() {
  return getRandomSubarray(["🤯", "🤔", "🤓", "🤩", "🤨"])[0];
}

const App = component(({ effect }) => {
  const updateInput = ({ target }) => {
    App(update_input(target.value));
  };

  const selectCheckbox = ({ target }) => {
    target.matches("input[type=checkbox]") &&
      App(toggle_item(target.value, target.checked));
  };

  const addTodo = () => {
    App(add_todo);
  };

  const setEmoji = () => {
    App((state) => ({ ...state, emoji: getEmoji() }));
  };

  effect(async () => {
    const todos = await getTodos();
    App((state) => ({ ...state, todos }));
  });

  // onStateChange((state, prevState) => {});

  return (state) => {
    console.log(state);
    return html`
      <div>
        <h1>Todos</h1>
        ${Timer()}
        <div style="display:flex; gap:1rem;">
          <input type="text" value="${state.input}" oninput="${updateInput}" />
          <button onclick="${addTodo}">+</button>
          <button onclick="${setEmoji}">@</button>
        </div>
        ${!state.todos.length && "Loading..."}
        <ul
          $key="${(i) => i.id}"
          $items="${state.todos}"
          onchange="${selectCheckbox}"
        >
          ${ToDoItem}
        </ul>
        <hr />
        ${Counter(state.emoji)}
        <dialog ?open="${state.error.length}">
          <p>${state.error}</p>
          <button onclick="${() => App(remove_error)}">Close</button>
        </dialog>
      </div>
    `;
  };
});

function ToDoItem(item) {
  return html`
    <li
      style="${item.completed && "text-decoration: line-through; opacity:0.5;"}"
    >
      <label>
        <input
          type="checkbox"
          value="${item.id}"
          ?checked="${item.completed}"
        />
        <span>${item.text}</span>
      </label>
    </li>
  `;
}

const Timer = component(({ effect }) => {
  effect(() => {
    const interval = setInterval(() => {
      Timer(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  });
  return (time) => html`
    <div style="font-family:monospace; font-size:1.35rem;">${time}</div>
  `;
});

const Counter = component(({ effect }) => {
  effect(() => {
    Counter(0);
  });

  return (count, emoji) => html`<div style="display:flex; gap:1rem;">
    <code>${count}</code>
    <button onclick="${() => Counter((count) => count + 1)}">+</button>
    <button onclick="${() => Counter((count) => count - 1)}">-</button>
    <span>${emoji}</span>
  </div> `;
});

// ---- State Actions ----------------

function remove_error(state) {
  return { ...state, error: "" };
}

function update_input(text) {
  return (state) => {
    return {
      ...state,
      input: text,
    };
  };
}

function add_todo(state) {
  return state.input.length === 0
    ? {
        ...state,
        error: "Please enter a todo",
      }
    : {
        ...state,
        input: "",
        todos: [
          ...state.todos,
          {
            id: Date.now() + "",
            text: state.input,
            completed: false,
          },
        ],
      };
}

function toggle_item(id, completed) {
  return (state) => {
    return {
      ...state,
      todos: state.todos.map((todo) => {
        if (todo.id === id) {
          return {
            ...todo,
            completed,
          };
        }
        return todo;
      }),
    };
  };
}

// ---- API Mocks ----------------

function getTodos() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: "1", text: "Buy milk", completed: false },
        { id: "2", text: "Walk the dog", completed: false },
      ]);
    }, 1000);
  });
}

document.body.append(App(state, "🤔"));
