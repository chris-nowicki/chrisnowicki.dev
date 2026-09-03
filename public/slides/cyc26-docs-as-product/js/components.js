// Framework-free ports of the Slidev/Vue SFCs still used by slides.md
// (DocsPipeline, TrafficSplit). Light DOM (innerHTML in
// connectedCallback) so reveal.js fragment scanning and the global stylesheets
// keep working untouched. Stage.vue and Spacer.vue are not ported: <Stage> is
// expanded into static section markup at authoring time in index.html, and
// <Spacer> is unused by the current deck.

let idCounter = 0;

function nextId() {
  idCounter += 1;
  return `cyc-id-${idCounter}`;
}

function esc(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function parseJsonAttribute(element, name, fallback) {
  const raw = element.getAttribute(name);
  if (raw === null) {
    return fallback;
  }
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.error(`<${element.localName}> has invalid JSON in "${name}"`, error);
    return fallback;
  }
}

// Stack Overflow logomark (Simple Icons, CC0). Single path, monochrome via
// currentColor so it inherits the node's ink color in both light and dark.
const STACK_OVERFLOW_ICON = `<svg class="docs-pipeline__so-icon" viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M15.725 0l-1.72 1.277 6.39 8.588 1.716-1.277L15.725 0zm-3.94 3.418l-1.369 1.644 8.225 6.85 1.369-1.644-8.225-6.85zm-3.15 4.465l-.905 1.94 9.702 4.517.904-1.94-9.701-4.517zm-1.85 4.86l-.44 2.093 10.473 2.201.44-2.092-10.473-2.203zM1.89 15.47V24h19.19v-8.53h-2.133v6.397H4.021v-6.396H1.89zm4.265 2.133v2.13h10.66v-2.13H6.154Z"/></svg>`;

class DocsPipeline extends HTMLElement {
  connectedCallback() {
    const stage = this.getAttribute("stage") ?? "";
    const stageLabel = this.getAttribute("stage-label") ?? "";
    const steps = parseJsonAttribute(this, "steps", []);
    const detour = parseJsonAttribute(this, "detour", null);
    const captionId = nextId();

    // Optional detour target: the step the branch hangs off of. When present,
    // the detour reveals right after that step, and every step past it shifts
    // one click later so the sequence reads docs → detour → next step (e.g.
    // Docs → Stack Overflow → Product) instead of the detour tacking on last.
    const detourIndex =
      detour !== null ? steps.findIndex((step) => step.kind === detour.after) : -1;
    const hasDetour = detour !== null && detourIndex !== -1;
    const fragFor = (index) => index + (hasDetour && index > detourIndex ? 1 : 0);

    // The SFC reveals node i at click i (v-click="index") and the edge after
    // node i at click i + 1 (v-click="index + 1"), so each advance shows one
    // edge + the node it points at. data-fragment-index replicates that
    // grouping (with fragFor applying the detour shift); the first node is
    // always visible.
    const items = steps
      .map((step, index) => {
        const node =
          index === 0
            ? `
          <div class="docs-pipeline__node vs-node" data-node="${esc(step.kind)}">
            <strong>${esc(step.label)}</strong>
          </div>`
            : `
          <div class="fragment docs-pipeline__node vs-node" data-fragment-index="${fragFor(index)}" data-node="${esc(step.kind)}">
            <strong>${esc(step.label)}</strong>
          </div>`;

        const edge =
          index < steps.length - 1
            ? `
          <span class="fragment docs-pipeline__edge" data-fragment-index="${fragFor(index + 1)}">
            <span aria-hidden="true">→</span>
          </span>`
            : "";

        return `
        <li>${node}${edge}
        </li>`;
      })
      .join("");

    // Optional detour: a node that hangs below one of the steps with a
    // down/up loop back into it (e.g. "Docs → Stack Overflow → back to Docs").
    // Rendered as an extra grid cell pinned to the target column on row 2, so
    // the main single-row line is untouched.
    let detourCells = "";
    if (hasDetour) {
      const column = detourIndex + 1;
      const fragmentIndex = detourIndex + 1;
      detourCells = `
        <li
          class="fragment docs-pipeline__detour"
          data-fragment-index="${fragmentIndex}"
          style="grid-column: ${column}; grid-row: 2;"
        >
          <span class="docs-pipeline__detour-arrows" aria-hidden="true">
            <span>&#8595;</span><span>&#8593;</span>
          </span>
          <div class="docs-pipeline__node vs-node docs-pipeline__detour-node" data-node="${esc(detour.kind)}">
            <span class="docs-pipeline__so">
              ${STACK_OVERFLOW_ICON}
              <strong>${esc(detour.label)}</strong>
            </span>
          </div>
        </li>`;
    }

    this.innerHTML = `
      <figure class="docs-pipeline" data-stage="${esc(stage)}" aria-labelledby="${captionId}">
        <figcaption id="${captionId}" class="docs-pipeline__caption">
          <span>${esc(stage)}</span>
          <strong>${esc(stageLabel)}</strong>
        </figcaption>

        <ol class="docs-pipeline__steps" style="--docs-pipeline-count: ${steps.length}">${items}${detourCells}
        </ol>
      </figure>
    `;
  }
}

class TrafficSplit extends HTMLElement {
  connectedCallback() {
    const claimId = this.getAttribute("claim-id") ?? "";
    const human = parseJsonAttribute(this, "human", { label: "", percentage: "" });
    const ai = parseJsonAttribute(this, "ai", { label: "", percentage: "" });
    const context = this.getAttribute("context") ?? "";
    const scopeLabel = this.getAttribute("scope-label") ?? "";
    const captionId = nextId();

    this.innerHTML = `
      <figure class="traffic-split" aria-labelledby="${captionId}" data-claim-id="${esc(claimId)}">
        <figcaption id="${captionId}" class="traffic-split__context">
          ${esc(context)}
        </figcaption>

        <div class="traffic-split__rows">
          <div class="traffic-split__row">
            <div class="traffic-split__label">
              <strong>${esc(human.label)}</strong>
              <span>${esc(human.percentage)}</span>
            </div>
            <div class="traffic-split__track" aria-hidden="true">
              <span
                class="traffic-split__fill traffic-split__fill--human"
                style="width: ${esc(human.share ?? human.percentage)}"
              ></span>
            </div>
          </div>

          <div class="fragment traffic-split__row">
            <div class="traffic-split__label">
              <strong>${esc(ai.label)}</strong>
              <span>${esc(ai.percentage)}</span>
            </div>
            <div class="traffic-split__track" aria-hidden="true">
              <span
                class="traffic-split__fill traffic-split__fill--ai"
                style="width: ${esc(ai.share ?? ai.percentage)}"
              ></span>
            </div>
          </div>
        </div>

        ${scopeLabel ? `<p class="traffic-split__scope">${esc(scopeLabel)}</p>` : ""}
      </figure>
    `;
  }
}

customElements.define("docs-pipeline", DocsPipeline);
customElements.define("traffic-split", TrafficSplit);
