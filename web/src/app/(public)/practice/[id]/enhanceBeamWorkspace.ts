const SHORTCUTS: Record<string, string> = {
  point: "P",
  horizontal: "H",
  vertical: "V",
  diagonal: "D",
  curve: "C",
  erase: "E",
};

const FIELD_DISPLAY: Record<string, { title: string; small: string }> = {
  rb: { title: "Vertical reaction, <i>R</i><sub>B</sub>", small: "upward" },
  mb: { title: "Fixed-end moment, <i>M</i><sub>B</sub>", small: "magnitude" },
  r1: { title: "Vertical reaction, <i>R</i><sub>A</sub>", small: "upward" },
  r2: { title: "Vertical reaction, <i>R</i><sub>B</sub>", small: "upward" },
  vmax: { title: "Maximum shear, |<i>V</i>|<sub>max</sub>", small: "absolute value" },
  mmax: { title: "Maximum moment, |<i>M</i>|<sub>max</sub>", small: "absolute value" },
};

const STEPS = [
  {
    id: "reactions",
    label: "Reactions",
    title: "Support reactions",
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
    title: "Shear diagram",
    match: (el: Element) => el.id === "partB" || el.classList.contains("editor-shear"),
  },
  {
    id: "moment",
    label: "Moment",
    title: "Moment diagram",
    match: (el: Element) => el.id === "partC" || el.classList.contains("editor-moment"),
  },
  {
    id: "review",
    label: "Review",
    title: "Review",
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
  return !!(root.querySelector("#shearEditor") && root.querySelector("#fbdSvg") && root.querySelector("#momentEditor"));
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

/** Tag reaction arrows/labels so inputs can highlight the matching FBD marks. */
function tagFbdReactions(svg: SVGSVGElement) {
  for (const node of svg.querySelectorAll("[data-reaction]")) {
    node.removeAttribute("data-reaction");
  }
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
      sibling = sibling.previousElementSibling;
    }
  }
  fitFbdSvg(svg);
}

function simplifyPanelTitle(panel: HTMLElement, title: string) {
  const heading = panel.querySelector(":scope > h2");
  if (!(heading instanceof HTMLElement)) return;
  heading.textContent = title;
  heading.classList.add("sbp-task-title");
}

function wireFieldChrome(body: HTMLElement) {
  const rootNode = body.getRootNode() as ShadowRoot | Document;
  for (const field of body.querySelectorAll<HTMLElement>(".field")) {
    const id = field.id.replace(/^field-/, "");
    if (id) field.dataset.reaction = id;
    if (field.dataset.sbpWired === "1") continue;
    field.dataset.sbpWired = "1";

    const display = FIELD_DISPLAY[id];
    if (display) {
      const label = field.querySelector("label");
      if (label) {
        label.innerHTML = `${display.title}<small>${display.small}</small>`;
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
    };
    const clear = () => {
      if (body.dataset.sbpHighlight === id && rootNode.activeElement !== input) {
        delete body.dataset.sbpHighlight;
      }
    };
    input.addEventListener("focus", activate);
    input.addEventListener("mouseenter", activate);
    input.addEventListener("blur", clear);
    input.addEventListener("mouseleave", clear);
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
    const clamped = Math.min(48, Math.max(18, ratio));
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
    const fallback = body.classList.contains("sbp-step-graph") ? 24 : 34;
    const current = Number.parseFloat(body.style.getPropertyValue("--sbp-user-ref")) || fallback;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      body.style.setProperty("--sbp-user-ref", `${Math.max(18, current - 2)}%`);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      body.style.setProperty("--sbp-user-ref", `${Math.min(48, current + 2)}%`);
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
  infoBtn.className = "sbp-icon-btn is-active";
  infoBtn.setAttribute("aria-expanded", "true");
  infoBtn.setAttribute("aria-label", "Diagram notes");
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
    const svg = reference.querySelector("#fbdSvg");
    if (svg) {
      svg.before(diagramHost);
      diagramHost.append(svg);
    }

    const convention = reference.querySelector(".convention");
    if (convention instanceof HTMLElement) {
      convention.classList.add("sbp-notes");
      convention.hidden = false;
      infoBtn.addEventListener("click", () => {
        const open = convention.hidden;
        convention.hidden = !open;
        infoBtn.setAttribute("aria-expanded", open ? "true" : "false");
        infoBtn.classList.toggle("is-active", open);
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

  const progressMeta = document.createElement("div");
  progressMeta.className = "sbp-progress-meta";
  progressMeta.setAttribute("aria-live", "polite");

  const focusBtn = document.createElement("button");
  focusBtn.type = "button";
  focusBtn.className = "btn sbp-focus-btn sbp-btn-ghost";
  focusBtn.textContent = "Focus graph";

  toolbar.append(stepsNav, progressMeta, focusBtn);

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
  const evalRight = document.createElement("div");
  evalRight.className = "sbp-actionbar-eval";
  const summarySlot = document.createElement("div");
  summarySlot.className = "sbp-actionbar-summary";

  const prevBtn = document.createElement("button");
  prevBtn.type = "button";
  prevBtn.className = "btn sbp-btn-ghost";
  prevBtn.textContent = "Previous";

  const nextBtn = document.createElement("button");
  nextBtn.type = "button";
  nextBtn.className = "btn sbp-btn-secondary";
  nextBtn.textContent = "Continue";

  navLeft.append(prevBtn, nextBtn);
  actionBar.append(navLeft, summarySlot, evalRight);

  const stepButtons = new Map<StepId, HTMLButtonElement>();
  const stepPanels = new Map<StepId, HTMLElement[]>();
  const stepTitles = new Map<StepId, string>();

  for (const step of STEPS) {
    stepPanels.set(step.id, []);
    stepTitles.set(step.id, step.title);
  }

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

      if (actions instanceof HTMLElement) {
        actions.classList.add("sbp-core-actions");
        if (checkBtn instanceof HTMLButtonElement) {
          checkBtn.classList.add("primary");
          checkBtn.classList.remove("sbp-btn-secondary");
        }
        if (solutionBtn instanceof HTMLButtonElement) {
          solutionBtn.className = "sbp-text-action";
          solutionBtn.textContent = "Show solution";
        }
        evalRight.append(actions);
      }
      if (summary instanceof HTMLElement) summarySlot.append(summary);
      panel.hidden = true;
    } else {
      simplifyPanelTitle(panel, matched.title);
      const heading = panel.querySelector(":scope > h2");
      if (heading instanceof HTMLElement) heading.hidden = true;
      panelsHost.append(panel);
    }
  }

  if (howTo) {
    const details = howTo.querySelector("details");
    if (details) details.open = false;
    const summary = howTo.querySelector("summary h2");
    if (summary) summary.textContent = "How to draw";
    panelsHost.prepend(howTo);
  }

  for (const step of STEPS) {
    if (!(stepPanels.get(step.id)?.length) && step.id !== "review") continue;
    if (step.id === "review" && !actionBar.querySelector("#btnCheck")) continue;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "sbp-step";
    button.id = `sbp-step-${step.id}`;
    button.setAttribute("role", "tab");
    button.dataset.step = step.id;
    button.textContent = step.label;
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

  let active: StepId = stepButtons.has("reactions") ? "reactions" : ([...stepButtons.keys()][0] ?? "shear");
  let checkedOnce = false;

  const setActive = (next: StepId) => {
    if (!stepButtons.has(next)) return;
    active = next;
    body.dataset.sbpStep = next;
    body.classList.toggle("sbp-step-graph", next === "shear" || next === "moment");

    const keys = [...stepButtons.keys()];
    const index = keys.indexOf(next);
    progressMeta.textContent = `${index + 1} of ${keys.length}`;
    taskTitle.textContent = stepTitles.get(next) ?? "";

    for (const [id, button] of stepButtons) {
      const on = id === next;
      if (on) button.setAttribute("aria-current", "step");
      else button.removeAttribute("aria-current");
      button.setAttribute("aria-selected", on ? "true" : "false");
    }
    for (const [id, group] of stepPanels) {
      if (id === "review") continue;
      for (const panel of group) {
        const show = id === next;
        panel.hidden = !show;
        panel.classList.toggle("sbp-step-hidden", !show);
      }
    }
    prevBtn.disabled = index <= 0;
    const last = index >= keys.length - 1;
    nextBtn.textContent = last ? "Back to start" : "Continue";
    nextBtn.classList.toggle("primary", checkedOnce && !last);
    nextBtn.classList.toggle("sbp-btn-secondary", !(checkedOnce && !last));
    nextBtn.onclick = () => {
      if (last) setActive(keys[0]!);
      else setActive(keys[index + 1]!);
    };
    if (howTo) {
      const showHelp = next === "shear" || next === "moment";
      howTo.hidden = !showHelp;
      howTo.classList.toggle("sbp-step-hidden", !showHelp);
    }
    focusBtn.hidden = !(next === "shear" || next === "moment");
    if (!(next === "shear" || next === "moment")) {
      body.classList.remove("sbp-graph-focus");
      focusBtn.textContent = "Focus graph";
    }
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
    focusBtn.textContent = focused ? "Exit focus" : "Focus graph";
  });

  setActive(active);

  const markDone = (step: StepId, done: boolean) => {
    const button = stepButtons.get(step);
    if (button) button.dataset.done = done ? "true" : "false";
  };

  const onCheck = () => {
    requestAnimationFrame(() => {
      const fields = [...body.querySelectorAll(".field")];
      const reactionOk =
        fields.length > 0 && fields.every((field) => field.classList.contains("ok"));
      const shearMsg = body.querySelector("#shearEditor .editor-msg");
      const momentMsg = body.querySelector("#momentEditor .editor-msg");
      checkedOnce = true;
      const keys = [...stepButtons.keys()];
      const index = keys.indexOf(active);
      const last = index >= keys.length - 1;
      nextBtn.classList.toggle("primary", !last);
      nextBtn.classList.toggle("sbp-btn-secondary", last);
      markDone("reactions", reactionOk);
      markDone("shear", !!shearMsg?.classList.contains("ok"));
      markDone("moment", !!momentMsg?.classList.contains("ok"));
      if (reactionOk && shearMsg?.classList.contains("ok") && momentMsg?.classList.contains("ok")) {
        markDone("review", true);
      }
    });
  };

  const checkBtn = body.querySelector("#btnCheck");
  checkBtn?.addEventListener("click", onCheck);

  const newTop = body.querySelector("#btnNewTop");
  const newBottom = body.querySelector("#btnNew");
  const confirmNew = (event: Event) => {
    if (!window.confirm("Generate a new problem? Your current answers and drawings will be cleared.")) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    checkedOnce = false;
    nextBtn.classList.remove("primary");
    nextBtn.classList.add("sbp-btn-secondary");
    for (const id of stepButtons.keys()) markDone(id, false);
  };
  newTop?.addEventListener("click", confirmNew, true);
  newBottom?.addEventListener("click", confirmNew, true);

  const fbd = body.querySelector("#fbdSvg");
  let fbdObserver: MutationObserver | null = null;
  let fbdFitFrame = 0;
  if (fbd instanceof SVGSVGElement) {
    const refreshFbd = () => {
      cancelAnimationFrame(fbdFitFrame);
      fbdFitFrame = requestAnimationFrame(() => tagFbdReactions(fbd));
    };
    refreshFbd();
    fbdObserver = new MutationObserver(() => refreshFbd());
    fbdObserver.observe(fbd, { childList: true });
    fbd.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const marked = target.closest("[data-reaction]");
      const key = marked?.getAttribute("data-reaction");
      if (!key) return;
      setActive("reactions");
      resolveReactionInput(body, key)?.input.focus();
    });
  }

  const inputsGrid = body.querySelector("#inputsGrid, .inputs-grid");
  let inputsObserver: MutationObserver | null = null;
  if (inputsGrid) {
    const refreshFields = () => wireFieldChrome(body);
    refreshFields();
    inputsObserver = new MutationObserver(() => refreshFields());
    inputsObserver.observe(inputsGrid, { childList: true });
  }

  return () => {
    checkBtn?.removeEventListener("click", onCheck);
    newTop?.removeEventListener("click", confirmNew, true);
    newBottom?.removeEventListener("click", confirmNew, true);
    cancelAnimationFrame(fbdFitFrame);
    fbdObserver?.disconnect();
    inputsObserver?.disconnect();
  };
}

/** Post-mount enhancements: tooltips, shortcuts, tool hint line. */
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
