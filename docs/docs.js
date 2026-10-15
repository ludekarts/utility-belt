import modules from "./glossary.js";

const main = document.querySelector("#main");
const nav = document.querySelector("#module-nav");
const search = document.querySelector("#utility-search");

function escapeHtml(value) {
  return value.replace(
    /[&<>"]/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[character],
  );
}

function render(query = "") {
  const normalizedQuery = query.trim().toLowerCase();
  const visibleModules = modules
    .map((module) => ({
      ...module,
      utilities: Object.values(module.utilities).filter((utility) =>
        Object.values(utility)
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery),
      ),
    }))
    .filter((module) => module.utilities.length);

  nav.innerHTML = visibleModules
    .map(
      (module) =>
        `<a href="#${module.file}">${module.file.replace(".ts", "")} <span>${module.utilities.length}</span></a>`,
    )
    .join("");

  main.innerHTML = visibleModules.length
    ? visibleModules
        .map((module) => {
          const badgeClass =
            module.environment.includes("Node") &&
            !module.environment.includes("Browser")
              ? "node"
              : "browser";

          return `
		<section class="module" id="${module.file}">
			<div class="module-heading">
        <div class="module-meta">
          <span class="badge ${badgeClass}">
            ${module.environment}
          </span>
          <span class="badge">
            src/utils/${module.file}
          </span>
        </div>
        <h2>
          <a href="#${module.file}">${module.file.replace(".ts", "")}</a>
        </h2>
      </div>
			<div class="utility-list">${module.utilities
        .map(
          ({ name, description, signature, example, options }) => `
				<article class="utility" id="${name}">
					<div class="utility-copy"><h3>${name}</h3><p>${description}</p></div>
					<div class="api-detail">
            <p class="utility-signature">${escapeHtml(signature)}</p>
            <pre class="utility-example"><code>${escapeHtml(example)}</code></pre>
            <div>
              <p class="utility-options">
                <strong>Configuration</strong>
              </p>
              <p>${options}</p>
            </div>
          </div>
				</article>`,
        )
        .join("")}</div>
		</section>`;
        })
        .join("")
    : `<div class="empty"><p>No matching utilities found.</p></div>`;

  document.querySelector("#clear-search")?.addEventListener("click", () => {
    search.value = "";
    render();
    search.focus();
  });
}

search.addEventListener("input", (event) => render(event.target.value));
render();
