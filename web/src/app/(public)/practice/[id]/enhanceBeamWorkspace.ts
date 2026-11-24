const SHORTCUTS: Record<string, string> = {
  point: "P",
  horizontal: "H",
  vertical: "V",
  diagonal: "D",
  curve: "C",
  erase: "E",
};

const FIELD_DISPLAY: Record<
  string,
  {
    title: string;
    small: string;
    group: "reactions" | "extrema";
    hud: string;
  }
> = {
  r1: {
    title: "Vertical reaction, <i>R</i><sub>A</sub>",
    small: "upward at A",
    group: "reactions",
    hud: "R_A · Vertical reaction at A (kip)",
  },
  ra: {
    title: "Vertical reaction, <i>R</i><sub>A</sub>",
    small: "upward at A",
    group: "reactions",
    hud: "R_A · Vertical reaction at A (kip)",
  },
  r2: {
    title: "Vertical reaction, <i>R</i><sub>B</sub>",
    small: "upward at B",
    group: "reactions",
    hud: "R_B · Vertical reaction at B (kip)",
  },
  rb: {
    title: "Vertical reaction, <i>R</i><sub>B</sub>",
    small: "upward at B",
    group: "reactions",
    hud: "R_B · Vertical reaction at B (kip)",
  },
  mb: {
    title: "Fixed-end moment, <i>M</i><sub>B</sub>",
    small: "magnitude at B",
    group: "reactions",
    hud: "M_B · Fixed-end moment at B (kip·ft)",
  },
  vmax: {
    title: "Maximum shear, |<i>V</i>|<sub>max</sub>",
    small: "peak magnitude along span",
    group: "extrema",
    hud: "|V|max · Peak internal shear along span AB (kip)",
  },
  mmax: {
    title: "Maximum moment, |<i>M</i>|<sub>max</sub>",
    small: "peak magnitude along span",
    group: "extrema",
    hud: "|M|max · Peak bending moment along span AB (kip·ft)",
  },
};

const REACTION_HUD: Record<string, string> = {
  ra: "R_A · Vertical reaction at A (kip) — click to enter",
  rb: "R_B · Vertical reaction at B (kip) — click to enter",
  mb: "M_B · Fixed-end moment at B (kip·ft) — click to enter",
};

const STEPS = [
  {
    id: "reactions",
    label: "Reactions",
    title: "Reactions & peak values",
    match: (el: Element) =>
      !!el.querySelector(".inputs-grid, #inputsGrid") &&
      !el.classList.contains("editor-shear") &&
      !el.classList.contains("editor-moment") &&
      !el.querySelector("#fbdSvg") &&
      !el.querySelector("#btnCheck"),
  },
  {
    id: "shear",
    label: "Shear",
    title: "Shear diagram, V(x)",
    match: (el: Element) => el.id === "partB" || el.classList.contains("editor-shear"),
  },
  {
    id: "moment",
    label: "Moment",
    title: "Moment diagram, M(x)",
    match: (el: Element) => el.id === "partC" || el.classList.contains("editor-moment"),
  },
  {
    id: "review",
    label: "Review",
    title: "Summary & verification",
    match: (el: Element) =>
      !!el.querySelector("#btnCheck") &&
      !el.classList.contains("editor-shear") &&
      !el.classList.contains("editor-moment"),
  },
] as const;

type StepId = (typeof STEPS)[number]["id"];

const isTypingTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable;
};

export function isBeamSimulation(root: ParentNode) {
  return !!(
    root.querySelector("#shearEditor") &&
    root.querySelector("#fbdSvg") &&
    root.querySelector("#momentEditor")
  );
}

function fitFbdSvg(svg: SVGSVGElement) {
  try {
    const bbox = svg.getBBox();
    if (!(bbox.width > 0 && bbox.height > 0)) return;
    const padX = Math.max(20, bbox.width * 0.06);
    const padY = Math.max(14, bbox.height * 0.08);
    svg.setAttribute(
      "viewBox",
      `${bbox.x - padX} ${bbox.y - padY} ${bbox.width + padX * 2} ${bbox.height + padY * 2}`
    );
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
  } catch {
    // getBBox can throw if the SVG is not rendered yet.
  }
}

const REACTION_INPUT_ALIASES: Record<string, string[]> = {
  ra: ["ra", "r1"],
  rb: ["rb", "r2"],
  mb: ["mb"],
};

function resolveReactionInput(body: HTMLElement, reactionKey: string) {
  const candidates = REACTION_INPUT_ALIASES[reactionKey] ?? [reactionKey];
  for (const id of candidates) {
    const input = body.querySelector<HTMLInputElement>(`#in-${id}`);
    if (input) return { id, input };
  }
  return null;
}

function setDiagramHud(body: HTMLElement, message: string | null) {
  const hud = body.querySelector<HTMLElement>(".sbp-diagram-hud");
  if (!hud) return;
  if (message) {
    hud.textContent = message;
    hud.dataset.visible = "true";
  } else {
    hud.textContent = "";
    delete hud.dataset.visible;
  }
}

/**
 * Tag FBD beam, reaction arrows/labels, and applied loads so diagram <-> input
 * hover, focus, and click interactions work cleanly across all 6 beam problems.
 */
function tagFbdReactions(svg: SVGSVGElement) {
  // Remove any previously injected hit targets before re-measuring bbox.
  for (const oldHit of svg.querySelectorAll(".sbp-hit-target")) {
    oldHit.remove();
  }
  for (const node of svg.querySelectorAll("[data-reaction], [data-fbd-part], [data-load-label]")) {
    node.removeAttribute("data-reaction");
    node.removeAttribute("data-fbd-part");
    node.removeAttribute("data-load-label");
  }

  // Tag the beam body rect.
  const beamRect = svg.querySelector("rect");
  if (beamRect) {
    beamRect.setAttribute("data-fbd-part", "beam");
  }

  // Tag reaction labels (R_A, R_B, M_B) and their preceding arrow/arc primitives.
  const hitClones: SVGElement[] = [];
  for (const text of svg.querySelectorAll("text")) {
    const base = text.childNodes[0]?.textContent?.trim() ?? "";
    const sub = text.querySelector("tspan")?.textContent?.trim() ?? "";
    if (!base || !sub) continue;
    const key = `${base}${sub}`.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!/^[rm][a-z0-9]+$/.test(key)) continue;
    text.setAttribute("data-reaction", key);

    let sibling = text.previousElementSibling;
    while (sibling && sibling.tagName.toLowerCase() !== "text") {
      sibling.setAttribute("data-reaction", key);
      const tag = sibling.tagName.toLowerCase();
      if ((tag === "line" || tag === "path") && sibling instanceof SVGElement) {
        const hit = sibling.cloneNode(false) as SVGElement;
        hit.classList.add("sbp-hit-target");
        hit.removeAttribute("marker-end");
        hit.setAttribute("stroke", "transparent");
        hit.setAttribute("stroke-width", "16");
        hit.setAttribute("fill", "none");
        hit.setAttribute("data-reaction", key);
        hitClones.push(hit);
      }
      sibling = sibling.previousElementSibling;
    }
  }

  // Tag applied load arrows (#c0392b) with their label & units for hover feedback.
  const redTexts = [...svg.querySelectorAll("text")].filter(
    (t) => (t.getAttribute("fill") ?? "").toLowerCase() === "#c0392b"
  );
  const loadSummary = redTexts
    .map((t) => t.textContent?.trim() ?? "")
    .filter(Boolean)
    .join(" · ");
  if (loadSummary) {
    const loadDesc = loadSummary.includes("/")
      ? `Distributed load · ${loadSummary}`
      : `Applied load · ${loadSummary}`;
    for (const el of svg.querySelectorAll('[stroke="#c0392b"], [fill="#c0392b"]')) {
      if (el.closest("defs")) continue;
      el.setAttribute("data-load-label", loadDesc);
      const tag = el.tagName.toLowerCase();
      if (tag === "line" && el instanceof SVGElement) {
        const hit = el.cloneNode(false) as SVGElement;
        hit.classList.add("sbp-hit-target");
        hit.removeAttribute("marker-end");
        hit.setAttribute("stroke", "transparent");
        hit.setAttribute("stroke-width", "14");
        hit.setAttribute("data-load-label", loadDesc);
        hitClones.push(hit);
      }
    }
  }

  // Fit viewBox before appending invisible hit targets so stroke-width=16 doesn't inflate bounds.
  fitFbdSvg(svg);
  for (const hit of hitClones) {
    svg.appendChild(hit);
  }
}

function simplifyPanelTitle(panel: HTMLElement, title: string) {
  const heading = panel.querySelector(":scope > h2");
  if (!(heading instanceof HTMLElement)) return;
  heading.textContent = title;
  heading.classList.add("sbp-task-title");
}

function groupFields(inputsGrid: HTMLElement) {
  const directFields = [...inputsGrid.querySelectorAll<HTMLElement>(":scope > .field")];
  if (directFields.length === 0) return;

  const reactionFields: HTMLElement[] = [];
  const extremaFields: HTMLElement[] = [];

  for (const field of directFields) {
    const id = field.id.replace(/^field-/, "");
    const group = FIELD_DISPLAY[id]?.group ?? (id.includes("max") ? "extrema" : "reactions");
    if (group === "extrema") extremaFields.push(field);
    else reactionFields.push(field);
  }

  const makeGroup = (headingText: string, fields: HTMLElement[]) => {
    const section = document.createElement("div");
    section.className = "sbp-field-section";
    const heading = document.createElement("div");
    heading.className = "sbp-field-section-title";
    heading.textContent = headingText;
    const row = document.createElement("div");
    row.className = "sbp-field-row";
    row.append(...fields);
    section.append(heading, row);
    return section;
  };

  inputsGrid.classList.add("sbp-grouped-inputs");
  if (reactionFields.length > 0) {
    inputsGrid.append(makeGroup("Support reactions", reactionFields));
  }
  if (extremaFields.length > 0) {
    inputsGrid.append(makeGroup("Maximum internal values", extremaFields));
  }
}

function wireFieldChrome(body: HTMLElement, onDirty?: () => void) {
  const rootNode = body.getRootNode() as ShadowRoot | Document;
  const inputsGrid = body.querySelector<HTMLElement>("#inputsGrid, .inputs-grid");
  if (inputsGrid) {
    groupFields(inputsGrid);
  }

  const isCantilever = !!body.querySelector("#field-mb");
  body.dataset.sbpSupportType = isCantilever ? "cantilever" : "simply-supported";

  // Refresh the concise 2-line reference summary once fields reveal support type.
  const primaryLine = body.querySelector<HTMLElement>(".sbp-ref-summary-primary");
  if (primaryLine) {
    primaryLine.textContent = isCantilever
      ? "Free end A · Fixed support B · x measured from A"
      : "Pin support A · Roller support B · x measured from A";
  }

  for (const field of body.querySelectorAll<HTMLElement>(".field")) {
    const id = field.id.replace(/^field-/, "");
    if (id) field.dataset.reaction = id;
    if (field.dataset.sbpWired === "1") continue;
    field.dataset.sbpWired = "1";

    const display = FIELD_DISPLAY[id];
    if (display) {
      const label = field.querySelector("label");
      if (label) {
        label.innerHTML = `<span class="sbp-label-main">${display.title}</span><small>${display.small}</small>`;
      }
    }

    if (!field.querySelector(".sbp-check")) {
      const mark = document.createElement("span");
      mark.className = "sbp-check";
      mark.setAttribute("aria-hidden", "true");
      mark.textContent = "✓";
      field.append(mark);
    }

    const input = field.querySelector("input");
    if (!(input instanceof HTMLInputElement)) continue;
    input.inputMode = "decimal";

    const activate = () => {
      body.dataset.sbpHighlight = id;
      setDiagramHud(body, display?.hud ?? null);
    };
    const clear = () => {
      const activeEl = rootNode.activeElement;
      if (activeEl instanceof HTMLInputElement && activeEl.id.startsWith("in-")) {
        const focusedId = activeEl.id.replace(/^in-/, "");
        body.dataset.sbpHighlight = focusedId;
        setDiagramHud(body, FIELD_DISPLAY[focusedId]?.hud ?? null);
        return;
      }
      if (body.dataset.sbpHighlight === id) {
        delete body.dataset.sbpHighlight;
        setDiagramHud(body, null);
      }
    };

    input.addEventListener("focus", activate);
    input.addEventListener("blur", clear);
    field.addEventListener("mouseenter", () => {
      if (!rootNode.activeElement || !(rootNode.activeElement instanceof HTMLInputElement)) {
        activate();
      }
    });
    field.addEventListener("mouseleave", clear);
    if (onDirty) {
      input.addEventListener("input", onDirty);
    }
  }
}

function wireRefResize(body: HTMLElement, workspace: HTMLElement, ref: HTMLElement) {
  const handle = document.createElement("div");
  handle.className = "sbp-resize";
  handle.setAttribute("role", "separator");
  handle.setAttribute("aria-orientation", "vertical");
  handle.setAttribute("aria-label", "Resize reference panel");
  handle.tabIndex = 0;
  ref.after(handle);

  let dragging = false;
  const onMove = (clientX: number) => {
    const bounds = workspace.getBoundingClientRect();
    const ratio = ((clientX - bounds.left) / bounds.width) * 100;
    const clamped = Math.min(46, Math.max(20, ratio));
    body.style.setProperty("--sbp-user-ref", `${clamped}%`);
  };

  handle.addEventListener("pointerdown", (event) => {
    dragging = true;
    handle.setPointerCapture(event.pointerId);
    body.classList.add("sbp-resizing");
  });
  handle.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    onMove(event.clientX);
  });
  const endDrag = () => {
    dragging = false;
    body.classList.remove("sbp-resizing");
  };
  handle.addEventListener("pointerup", endDrag);
  handle.addEventListener("pointercancel", endDrag);
  handle.addEventListener("keydown", (event) => {
    const fallback = body.classList.contains("sbp-step-graph") ? 28 : 35;
    const current = Number.parseFloat(body.style.getPropertyValue("--sbp-user-ref")) || fallback;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      body.style.setProperty("--sbp-user-ref", `${Math.max(20, current - 2)}%`);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      body.style.setProperty("--sbp-user-ref", `${Math.min(46, current + 2)}%`);
    }
  });
}

/** Restructure DOM before the simulation script mounts editors. */
export function mountBeamWorkspace(body: HTMLElement) {
  if (!isBeamSimulation(body) || body.dataset.sbpWorkspace === "1") return () => undefined;
  body.dataset.sbpWorkspace = "1";
  body.classList.add("sbp-beam-workspace");

  const wrap = body.querySelector(".wrap");
  if (!(wrap instanceof HTMLElement)) return () => undefined;

  const children = [...wrap.children] as HTMLElement[];
  const header = children.find((el) => el.classList.contains("quiz-header")) ?? null;
  const reference = children.find((el) => !!el.querySelector("#fbdSvg")) ?? null;
  const howTo = children.find((el) => el.classList.contains("how-to")) ?? null;
  const panels = children.filter((el) => el !== header && el !== reference && el !== howTo);

  const workspace = document.createElement("div");
  workspace.className = "sbp-workspace";

  const ref = document.createElement("aside");
  ref.className = "sbp-ref";
  ref.setAttribute("aria-label", "Beam reference");

  const refHead = document.createElement("div");
  refHead.className = "sbp-ref-head";
  const refTitle = document.createElement("div");
  refTitle.className = "sbp-ref-title";
  refTitle.textContent = "Beam reference";
  const refActions = document.createElement("div");
  refActions.className = "sbp-ref-actions";

  const infoBtn = document.createElement("button");
  infoBtn.type = "button";
  infoBtn.className = "sbp-icon-btn";
  infoBtn.setAttribute("aria-expanded", "false");
  infoBtn.setAttribute("aria-label", "Show full diagram notes");
  infoBtn.title = "Diagram notes";
  infoBtn.textContent = "i";

  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "sbp-icon-btn sbp-ref-toggle";
  toggle.setAttribute("aria-expanded", "true");
  toggle.setAttribute("aria-label", "Collapse problem reference");
  toggle.title = "Collapse reference";
  toggle.textContent = "‹";
  toggle.addEventListener("click", () => {
    const collapsed = body.classList.toggle("sbp-ref-collapsed");
    toggle.textContent = collapsed ? "›" : "‹";
    toggle.setAttribute("aria-expanded", collapsed ? "false" : "true");
    toggle.setAttribute(
      "aria-label",
      collapsed ? "Expand problem reference" : "Collapse problem reference"
    );
    toggle.title = collapsed ? "Expand reference" : "Collapse reference";
  });

  refActions.append(infoBtn, toggle);
  refHead.append(refTitle, refActions);
  ref.append(refHead);

  if (reference) {
    const givenHeading = reference.querySelector(":scope > h2");
    if (givenHeading) givenHeading.remove();

    const givens = reference.querySelector(".givens");
    if (givens) givens.classList.add("sbp-params");

    const diagramHost = document.createElement("div");
    diagramHost.className = "sbp-diagram";
    const hud = document.createElement("div");
    hud.className = "sbp-diagram-hud";
    hud.setAttribute("aria-live", "polite");

    const svg = reference.querySelector("#fbdSvg");
    if (svg) {
      svg.before(diagramHost);
      diagramHost.append(svg, hud);
    }

    const convention = reference.querySelector(".convention");
    const rawNote = convention?.textContent?.replace(/\s+/g, " ").trim() ?? "";
    const looksCantilever =
      /fixed support/i.test(rawNote) || !!body.querySelector("#field-mb");

    const summaryBox = document.createElement("div");
    summaryBox.className = "sbp-ref-summary";
    const line1 = document.createElement("p");
    line1.className = "sbp-ref-summary-primary";
    line1.textContent = looksCantilever
      ? "Free end A · Fixed support B · x measured from A"
      : "Pin support A · Roller support B · x measured from A";
    const line2 = document.createElement("p");
    line2.className = "sbp-ref-summary-sub";
    line2.textContent = "Beam length drawn to scale. Reaction arrows indicate direction.";
    summaryBox.append(line1, line2);
    diagramHost.after(summaryBox);

    if (convention instanceof HTMLElement) {
      convention.classList.add("sbp-notes");
      convention.hidden = true;
      infoBtn.addEventListener("click", () => {
        const willOpen = convention.hidden;
        convention.hidden = !willOpen;
        infoBtn.setAttribute("aria-expanded", willOpen ? "true" : "false");
        infoBtn.classList.toggle("is-active", willOpen);
      });
    } else {
      infoBtn.hidden = true;
    }

    ref.append(reference);
  }

  const main = document.createElement("div");
  main.className = "sbp-main";

  const toolbar = document.createElement("div");
  toolbar.className = "sbp-toolbar";

  const stepsNav = document.createElement("div");
  stepsNav.className = "sbp-steps";
  stepsNav.setAttribute("role", "tablist");
  stepsNav.setAttribute("aria-label", "Practice steps");

  const toolbarRight = document.createElement("div");
  toolbarRight.className = "sbp-toolbar-actions";

  const helpBtn = document.createElement("button");
  helpBtn.type = "button";
  helpBtn.className = "btn sbp-btn-ghost sbp-help-btn";
  helpBtn.setAttribute("aria-expanded", "false");
  helpBtn.textContent = "Drawing guide";

  const focusBtn = document.createElement("button");
  focusBtn.type = "button";
  focusBtn.className = "btn sbp-focus-btn sbp-btn-ghost";
  focusBtn.textContent = "Expand graph";

  toolbarRight.append(helpBtn, focusBtn);
  toolbar.append(stepsNav, toolbarRight);

  const taskTitle = document.createElement("h2");
  taskTitle.className = "sbp-active-task";

  const panelsHost = document.createElement("div");
  panelsHost.className = "sbp-step-panels";

  const actionBar = document.createElement("div");
  actionBar.className = "sbp-actionbar";
  actionBar.setAttribute("role", "toolbar");
  actionBar.setAttribute("aria-label", "Practice actions");

  const navLeft = document.createElement("div");
  navLeft.className = "sbp-actionbar-nav";
  const summarySlot = document.createElement("div");
  summarySlot.className = "sbp-actionbar-summary";
  const evalRight = document.createElement("div");
  evalRight.className = "sbp-actionbar-eval";

  const prevBtn = document.createElement("button");
  prevBtn.type = "button";
  prevBtn.className = "btn sbp-btn-ghost";
  prevBtn.textContent = "Previous";

  const nextBtn = document.createElement("button");
  nextBtn.type = "button";
  nextBtn.className = "btn sbp-btn-secondary";
  nextBtn.textContent = "Continue";

  navLeft.append(prevBtn);
  actionBar.append(navLeft, summarySlot, evalRight);

  const stepButtons = new Map<StepId, HTMLButtonElement>();
  const stepPanels = new Map<StepId, HTMLElement[]>();
  const stepTitles = new Map<StepId, string>();

  for (const step of STEPS) {
    stepPanels.set(step.id, []);
    stepTitles.set(step.id, step.title);
  }

  let checkBtnEl: HTMLButtonElement | null = null;

  for (const panel of panels) {
    const matched = STEPS.find((step) => step.match(panel));
    if (!matched) {
      panelsHost.append(panel);
      continue;
    }
    stepPanels.get(matched.id)!.push(panel);
    if (matched.id === "review") {
      const actions = panel.querySelector(".actions");
      const summary = panel.querySelector(".summary");
      const checkBtn = panel.querySelector("#btnCheck");
      const solutionBtn = panel.querySelector("#btnSolution");
      const newBottom = panel.querySelector("#btnNew");
      if (newBottom instanceof HTMLElement) newBottom.hidden = true;

      if (solutionBtn instanceof HTMLButtonElement) {
        solutionBtn.className = "sbp-text-action";
        solutionBtn.textContent = "Show solution";
        navLeft.append(solutionBtn);
      }

      if (actions instanceof HTMLElement) {
        actions.classList.add("sbp-core-actions");
        if (checkBtn instanceof HTMLButtonElement) {
          checkBtnEl = checkBtn;
          checkBtn.classList.add("primary");
          checkBtn.classList.remove("sbp-btn-secondary");
        }
        actions.append(nextBtn);
        evalRight.append(actions);
      } else {
        evalRight.append(nextBtn);
      }

      if (summary instanceof HTMLElement) {
        // Show full breakdown inside the Review tab, while keeping a concise status pill in the action bar.
        panel.replaceChildren(summary);
        panel.classList.add("sbp-review-panel");
        panelsHost.append(panel);
      } else {
        panel.hidden = true;
      }
    } else {
      simplifyPanelTitle(panel, matched.title);
      const heading = panel.querySelector(":scope > h2");
      if (heading instanceof HTMLElement) heading.hidden = true;
      panelsHost.append(panel);
    }
  }

  const inlineStatus = document.createElement("span");
  inlineStatus.className = "sbp-inline-status";
  summarySlot.append(inlineStatus);

  if (howTo) {
    const details = howTo.querySelector("details");
    if (details) details.open = true;
    const summary = howTo.querySelector("summary");
    if (summary) summary.hidden = true;
    howTo.classList.add("sbp-howto-drawer");
    howTo.hidden = true;
    panelsHost.prepend(howTo);

    helpBtn.addEventListener("click", () => {
      const willOpen = howTo.hidden;
      howTo.hidden = !willOpen;
      howTo.classList.toggle("sbp-step-hidden", !willOpen);
      helpBtn.setAttribute("aria-expanded", willOpen ? "true" : "false");
      helpBtn.classList.toggle("is-active", willOpen);
    });
  } else {
    helpBtn.hidden = true;
  }

  for (const step of STEPS) {
    if (!stepPanels.get(step.id)?.length) continue;
    if (step.id === "review" && !checkBtnEl) continue;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "sbp-step";
    button.id = `sbp-step-${step.id}`;
    button.setAttribute("role", "tab");
    button.dataset.step = step.id;

    const labelSpan = document.createElement("span");
    labelSpan.textContent = step.label;
    const checkSpan = document.createElement("span");
    checkSpan.className = "sbp-step-check";
    checkSpan.setAttribute("aria-hidden", "true");
    checkSpan.textContent = "✓";
    button.append(labelSpan, checkSpan);

    stepButtons.set(step.id, button);
    stepsNav.append(button);
  }

  main.append(toolbar, taskTitle, panelsHost, actionBar);
  workspace.append(ref, main);
  wireRefResize(body, workspace, ref);

  if (header) {
    header.classList.add("sbp-sim-header");
    const title = header.querySelector("h1");
    const subtitle = header.querySelector(".subtitle");
    if (title instanceof HTMLElement) title.hidden = true;
    if (subtitle instanceof HTMLElement) {
      subtitle.classList.add("sbp-instructions-body");
    }
  }

  wrap.replaceChildren(...(header ? [header, workspace] : [workspace]));

  let active: StepId = stepButtons.has("reactions")
    ? "reactions"
    : ([...stepButtons.keys()][0] ?? "shear");

  // Track which steps have been checked since last edit so Check answers is primary
  // until checked, then Continue becomes primary for smooth progression.
  const checkedSteps = new Set<StepId>();
  const completedSteps = new Set<StepId>();

  const syncActionHierarchy = () => {
    const keys = [...stepButtons.keys()];
    const index = keys.indexOf(active);
    const isFirst = index <= 0;
    const isLast = index >= keys.length - 1;

    prevBtn.hidden = isFirst;
    prevBtn.disabled = isFirst;
    nextBtn.hidden = isLast;
    nextBtn.textContent = "Continue";

    const hasAttemptOnActive =
      active !== "reactions" ||
      [...body.querySelectorAll<HTMLInputElement>(".field input")].some(
        (inp) => inp.value.trim().length > 0,
      );

    const readyToAdvance =
      !isLast &&
      (completedSteps.has(active) ||
        (checkedSteps.has(active) && hasAttemptOnActive));

    if (checkBtnEl) {
      checkBtnEl.classList.toggle("primary", !readyToAdvance);
      checkBtnEl.classList.toggle("sbp-btn-secondary", readyToAdvance);
    }
    nextBtn.classList.toggle("primary", readyToAdvance);
    nextBtn.classList.toggle("sbp-btn-secondary", !readyToAdvance);
  };

  const updateInlineStatus = () => {
    if (active === "reactions" && completedSteps.has("reactions")) {
      inlineStatus.textContent = "Reactions verified";
      inlineStatus.dataset.tone = "ok";
      return;
    }
    inlineStatus.textContent = "";
    inlineStatus.dataset.tone = "";
  };

  const setActive = (next: StepId) => {
    if (!stepButtons.has(next)) return;
    active = next;
    body.dataset.sbpStep = next;
    const isGraph = next === "shear" || next === "moment";
    body.classList.toggle("sbp-step-graph", isGraph);

    taskTitle.textContent = stepTitles.get(next) ?? "";

    for (const [id, button] of stepButtons) {
      const on = id === next;
      if (on) button.setAttribute("aria-current", "step");
      else button.removeAttribute("aria-current");
      button.setAttribute("aria-selected", on ? "true" : "false");
    }
    for (const [id, group] of stepPanels) {
      for (const panel of group) {
        const show = id === next;
        panel.hidden = !show;
        panel.classList.toggle("sbp-step-hidden", !show);
      }
    }

    const keys = [...stepButtons.keys()];
    const index = keys.indexOf(next);
    nextBtn.onclick = () => {
      if (index < keys.length - 1) setActive(keys[index + 1]!);
    };

    if (howTo) {
      if (!isGraph) {
        howTo.hidden = true;
        howTo.classList.add("sbp-step-hidden");
        helpBtn.setAttribute("aria-expanded", "false");
        helpBtn.classList.remove("is-active");
      }
      helpBtn.hidden = !isGraph;
    }
    focusBtn.hidden = !isGraph;
    if (!isGraph) {
      body.classList.remove("sbp-graph-focus");
      focusBtn.textContent = "Expand graph";
    }

    // Ensure the Review tab has fresh results if opened before checking.
    if (next === "review") {
      const summary = body.querySelector(".sbp-review-panel .summary");
      if (summary && !summary.innerHTML.trim()) {
        summary.innerHTML =
          '<p class="sbp-review-empty">Click <strong>Check answers</strong> below to grade your reactions, shear diagram, and moment diagram.</p>';
      }
    }

    syncActionHierarchy();
    updateInlineStatus();
  };

  for (const [id, button] of stepButtons) {
    button.addEventListener("click", () => setActive(id));
  }
  prevBtn.addEventListener("click", () => {
    const keys = [...stepButtons.keys()];
    const index = keys.indexOf(active);
    if (index > 0) setActive(keys[index - 1]!);
  });
  focusBtn.addEventListener("click", () => {
    const focused = body.classList.toggle("sbp-graph-focus");
    focusBtn.textContent = focused ? "Show reference" : "Expand graph";
  });

  const markDone = (step: StepId, done: boolean) => {
    if (done) completedSteps.add(step);
    else completedSteps.delete(step);
    const button = stepButtons.get(step);
    if (button) button.dataset.done = done ? "true" : "false";
  };

  const markStepDirty = (step: StepId) => {
    if (!checkedSteps.has(step) && !completedSteps.has(step)) return;
    checkedSteps.delete(step);
    completedSteps.delete(step);
    const button = stepButtons.get(step);
    if (button) button.dataset.done = "false";
    syncActionHierarchy();
    updateInlineStatus();
  };

  setActive(active);

  const onCheck = () => {
    requestAnimationFrame(() => {
      const fields = [...body.querySelectorAll(".field")];
      const reactionOk =
        fields.length > 0 && fields.every((field) => field.classList.contains("ok"));
      const shearMsg = body.querySelector("#shearEditor .editor-msg");
      const momentMsg = body.querySelector("#momentEditor .editor-msg");
      const shearOk = !!shearMsg?.classList.contains("ok");
      const momentOk = !!momentMsg?.classList.contains("ok");

      checkedSteps.add(active);
      markDone("reactions", reactionOk);
      markDone("shear", shearOk);
      markDone("moment", momentOk);
      markDone("review", reactionOk && shearOk && momentOk);

      syncActionHierarchy();
      updateInlineStatus();
    });
  };

  checkBtnEl?.addEventListener("click", onCheck);

  const newTop = body.querySelector("#btnNewTop");
  const newBottom = body.querySelector("#btnNew");
  const confirmNew = (event: Event) => {
    if (
      !window.confirm(
        "Generate a new problem? Your current answers and drawings will be cleared."
      )
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    checkedSteps.clear();
    completedSteps.clear();
    for (const id of stepButtons.keys()) markDone(id, false);
    syncActionHierarchy();
    updateInlineStatus();
  };
  newTop?.addEventListener("click", confirmNew, true);
  newBottom?.addEventListener("click", confirmNew, true);

  // Diagram <-> input hover, focus, and click interactions.
  const fbd = body.querySelector("#fbdSvg");
  let fbdObserver: MutationObserver | null = null;
  let fbdFitFrame = 0;
  if (fbd instanceof SVGSVGElement) {
    const observeFbd = () => fbdObserver?.observe(fbd, { childList: true });
    const refreshFbd = () => {
      cancelAnimationFrame(fbdFitFrame);
      fbdFitFrame = requestAnimationFrame(() => {
        fbdObserver?.disconnect();
        tagFbdReactions(fbd);
        observeFbd();
      });
    };
    fbdObserver = new MutationObserver(() => refreshFbd());
    refreshFbd();

    const clearHoverField = () => {
      for (const f of body.querySelectorAll<HTMLElement>(".field[data-fbd-hover]")) {
        delete f.dataset.fbdHover;
      }
    };

    fbd.addEventListener("pointermove", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const reactionEl = target.closest("[data-reaction]");
      const loadEl = target.closest("[data-load-label]");
      const rootNode = body.getRootNode() as ShadowRoot | Document;
      const hasInputFocus =
        rootNode.activeElement instanceof HTMLInputElement &&
        rootNode.activeElement.id.startsWith("in-");

      clearHoverField();

      if (reactionEl) {
        const key = reactionEl.getAttribute("data-reaction") ?? "";
        const resolved = resolveReactionInput(body, key);
        if (resolved) {
          const field = body.querySelector<HTMLElement>(`#field-${resolved.id}`);
          if (field) field.dataset.fbdHover = "true";
        }
        if (!hasInputFocus) {
          body.dataset.sbpHighlight = key;
        }
        setDiagramHud(body, REACTION_HUD[key] ?? null);
        return;
      }

      if (loadEl) {
        if (!hasInputFocus) {
          delete body.dataset.sbpHighlight;
        }
        setDiagramHud(body, loadEl.getAttribute("data-load-label"));
        return;
      }

      if (!hasInputFocus) {
        delete body.dataset.sbpHighlight;
        setDiagramHud(body, null);
      } else if (rootNode.activeElement instanceof HTMLInputElement) {
        const focusedId = rootNode.activeElement.id.replace(/^in-/, "");
        setDiagramHud(body, FIELD_DISPLAY[focusedId]?.hud ?? null);
      }
    });

    fbd.addEventListener("pointerleave", () => {
      clearHoverField();
      const rootNode = body.getRootNode() as ShadowRoot | Document;
      if (
        rootNode.activeElement instanceof HTMLInputElement &&
        rootNode.activeElement.id.startsWith("in-")
      ) {
        const focusedId = rootNode.activeElement.id.replace(/^in-/, "");
        body.dataset.sbpHighlight = focusedId;
        setDiagramHud(body, FIELD_DISPLAY[focusedId]?.hud ?? null);
      } else {
        delete body.dataset.sbpHighlight;
        setDiagramHud(body, null);
      }
    });

    fbd.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const marked = target.closest("[data-reaction]");
      const key = marked?.getAttribute("data-reaction");
      if (!key) return;
      setActive("reactions");
      const resolved = resolveReactionInput(body, key);
      if (resolved) {
        resolved.input.focus();
        resolved.input.select();
      }
    });
  }

  const inputsGrid = body.querySelector("#inputsGrid, .inputs-grid");
  let inputsObserver: MutationObserver | null = null;
  if (inputsGrid) {
    const observeInputs = () => inputsObserver?.observe(inputsGrid, { childList: true });
    const refreshFields = () => {
      inputsObserver?.disconnect();
      wireFieldChrome(body, () => markStepDirty("reactions"));
      observeInputs();
    };
    inputsObserver = new MutationObserver(() => refreshFields());
    refreshFields();
  }

  // Mark graph steps dirty when student draws/modifies segments so Check answers returns as primary.
  const shearHost = body.querySelector("#shearEditor");
  const momentHost = body.querySelector("#momentEditor");
  const onShearInteract = () => markStepDirty("shear");
  const onMomentInteract = () => markStepDirty("moment");
  shearHost?.addEventListener("pointerdown", onShearInteract);
  momentHost?.addEventListener("pointerdown", onMomentInteract);

  return () => {
    checkBtnEl?.removeEventListener("click", onCheck);
    newTop?.removeEventListener("click", confirmNew, true);
    newBottom?.removeEventListener("click", confirmNew, true);
    shearHost?.removeEventListener("pointerdown", onShearInteract);
    momentHost?.removeEventListener("pointerdown", onMomentInteract);
    cancelAnimationFrame(fbdFitFrame);
    fbdObserver?.disconnect();
    inputsObserver?.disconnect();
  };
}

/** Post-mount enhancements: tooltips, shortcuts, field/FBD sync. */
export function enhanceBeamEditors(root: ParentNode) {
  if (!isBeamSimulation(root)) return () => undefined;
  const hosts = [root.querySelector("#shearEditor"), root.querySelector("#momentEditor")].filter(
    (node): node is HTMLElement => node instanceof HTMLElement
  );

  const cleanups: Array<() => void> = [];

  if (root instanceof HTMLElement || (root as ShadowRoot).querySelector) {
    const body =
      root instanceof HTMLElement
        ? root.classList.contains("simulation-body")
          ? root
          : root.querySelector(".simulation-body")
        : (root as ShadowRoot).querySelector(".simulation-body");
    if (body instanceof HTMLElement) {
      wireFieldChrome(body);
      const fbd = body.querySelector("#fbdSvg");
      if (fbd instanceof SVGSVGElement) tagFbdReactions(fbd);
    }
  }

  for (const host of hosts) {
    for (const button of host.querySelectorAll<HTMLButtonElement>("[data-tool]")) {
      const tool = button.dataset.tool;
      if (!tool) continue;
      const shortcut = SHORTCUTS[tool];
      const label = button.querySelector("span")?.textContent?.trim() || tool;
      button.title = shortcut ? `${label} (${shortcut})` : label;
      button.setAttribute("aria-label", button.title);
    }
    const undo = host.querySelector<HTMLButtonElement>('[data-action="undo"]');
    if (undo) {
      undo.title = "Undo (⌘/Ctrl+Z)";
      undo.setAttribute("aria-label", undo.title);
      if (!undo.querySelector("span")) {
        const span = document.createElement("span");
        span.textContent = "Undo";
        undo.replaceChildren(span);
      }
    }
    const clear = host.querySelector<HTMLButtonElement>('[data-action="clear"]');
    if (clear) {
      clear.title = "Clear diagram";
      clear.setAttribute("aria-label", clear.title);
      if (!clear.querySelector("span")) {
        const span = document.createElement("span");
        span.textContent = "Clear";
        clear.replaceChildren(span);
      }
    }
  }

  const onKeyDown = (event: KeyboardEvent) => {
    if (isTypingTarget(event.target)) return;
    const activeHost =
      hosts.find((host) => host.offsetParent !== null && !host.closest("[hidden]")) ?? hosts[0];
    if (!activeHost) return;

    const meta = event.metaKey || event.ctrlKey;
    if (meta && event.key.toLowerCase() === "z") {
      event.preventDefault();
      activeHost.querySelector<HTMLButtonElement>('[data-action="undo"]')?.click();
      return;
    }
    if (event.altKey || meta) return;
    const key = event.key.toLowerCase();
    const tool = Object.entries(SHORTCUTS).find(([, shortcut]) => shortcut.toLowerCase() === key)?.[0];
    if (!tool) return;
    event.preventDefault();
    activeHost.querySelector<HTMLButtonElement>(`[data-tool="${tool}"]`)?.click();
  };

  window.addEventListener("keydown", onKeyDown);
  cleanups.push(() => window.removeEventListener("keydown", onKeyDown));

  return () => {
    for (const cleanup of cleanups) cleanup();
  };
}
