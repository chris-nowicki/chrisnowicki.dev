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

class DocsPipeline extends HTMLElement {
  connectedCallback() {
    const stage = this.getAttribute("stage") ?? "";
    const stageLabel = this.getAttribute("stage-label") ?? "";
    const steps = parseJsonAttribute(this, "steps", []);
    const captionId = nextId();

    // The SFC reveals node i at click i (v-click="index") and the edge after
    // node i at click i + 1 (v-click="index + 1"), so each advance shows one
    // edge + the node it points at. data-fragment-index replicates that
    // grouping; the first node is always visible.
    const items = steps
      .map((step, index) => {
        const node =
          index === 0
            ? `
          <div class="docs-pipeline__node vs-node" data-node="${esc(step.kind)}">
            <strong>${esc(step.label)}</strong>
          </div>`
            : `
          <div class="fragment docs-pipeline__node vs-node" data-fragment-index="${index}" data-node="${esc(step.kind)}">
            <strong>${esc(step.label)}</strong>
          </div>`;

        const edge =
          index < steps.length - 1
            ? `
          <span class="fragment docs-pipeline__edge" data-fragment-index="${index + 1}">
            <span aria-hidden="true">→</span>
          </span>`
            : "";

        return `
        <li>${node}${edge}
        </li>`;
      })
      .join("");

    this.innerHTML = `
      <figure class="docs-pipeline" data-stage="${esc(stage)}" aria-labelledby="${captionId}">
        <figcaption id="${captionId}" class="docs-pipeline__caption">
          <span>${esc(stage)}</span>
          <strong>${esc(stageLabel)}</strong>
        </figcaption>

        <ol class="docs-pipeline__steps" style="--docs-pipeline-count: ${steps.length}">${items}
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
