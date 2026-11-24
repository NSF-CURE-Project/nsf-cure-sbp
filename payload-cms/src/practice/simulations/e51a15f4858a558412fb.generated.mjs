export default function runSimulation({ document, localStorage, seed, newSeed, initialLevel = "easy", onAttempt, onVariant, gradeResponses }) {

  let randomState;
  let currentSeed;
  function resetRandom(seed, level) {
    currentSeed = seed;
    randomState = parseInt(seed.slice(0, 8), 16) >>> 0;
    onVariant?.(seed, level);
  }
  function random() {
    let next = (randomState = (randomState + 0x6d2b79f5) | 0);
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  }

// ============================================================
// Practice Problem 1 — Simply Supported Beam, One Point Load
// Students find R1, R2, Vmax, Mmax, then draw V(x) and M(x) on a
// blank grid by placing points and connecting them with line tools.
//
// Units: ft, kip, kip-ft.
// Sign convention: reactions positive up; V positive when the left
// side of a cut tends to move up relative to the right side;
// M positive = sagging, plotted upward. x measured from the left support.
//
// Optional: add ?seed=123 to the URL to get the same problem every time.
// ============================================================

const SVG_NS = "http://www.w3.org/2000/svg";

// The beam and both grids share one horizontal scale, so a longer beam is
// drawn longer and the diagrams line up underneath it.
const PX_PER_FT = 28;
const VB_W = 960;
const PAD_L = 76;

const COLORS = {
    shear: "#1f6fb2",
    moment: "#c0392b",
    beam: "#5dade2",
    dark: "#2c2c2c",
    solution: "#1e8e3e",
};

// ---------- tiny helpers ----------

function svgEl(tag, attrs, parent) {
    const e = document.createElementNS(SVG_NS, tag);
    for (const k in attrs || {}) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
}

function clearNode(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
}

function fmt(n) {
    return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.?0+$/, "");
}

// ---------- random numbers (optionally seeded) ----------

function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

const rng = random;

// ---------- problem generator ----------
// Parameters are chosen so that R1, R2 and Mmax come out as whole numbers
// that land exactly on grid lines. Otherwise a student who solved the
// problem correctly (say R1 = 44.05 kip) couldn't click that height on a grid.

const STEPS_V = [1, 2, 5, 10, 20];
const STEPS_M = [1, 2, 5, 10, 20, 25, 50, 100, 200];
const MAX_ROWS_FILLED = 6; // grid rows needed to reach the largest value

function pickStep(maxValue, steps) {
    for (const s of steps) if (maxValue / s <= MAX_ROWS_FILLED) return s;
    return steps[steps.length - 1];
}

function isMultiple(value, step) {
    const r = value / step;
    return Math.abs(r - Math.round(r)) < 1e-9;
}

function isWhole(value) {
    return Math.abs(value - Math.round(value)) < 1e-9;
}

function buildCandidates() {
    const out = [];
    for (let L = 10; L <= 30; L++) {
        for (let a = 2; a <= L - 2; a++) {
            if (2 * a === L) continue; // keep R1 != R2 so the two reactions have to be told apart
            for (let P = 2; P <= 40; P++) {
                const R1 = (P * (L - a)) / L;
                const R2 = (P * a) / L;
                if (!isWhole(R1) || !isWhole(R2)) continue;
                const Vmax = Math.max(R1, R2);
                const Mmax = R1 * a;
                const stepV = pickStep(Vmax, STEPS_V);
                const stepM = pickStep(Mmax, STEPS_M);
                if (!isMultiple(R1, stepV) || !isMultiple(R2, stepV) || !isMultiple(Mmax, stepM)) continue;
                out.push({
                    key: `${L}-${a}-${P}`,
                    L, a, P,
                    R1: Math.round(R1), R2: Math.round(R2),
                    Vmax: Math.round(Vmax), Mmax: Math.round(Mmax),
                    stepV, stepM,
                });
            }
        }
    }
    return out;
}

const CANDIDATES = buildCandidates();
const LENGTHS = Array.from(new Set(CANDIDATES.map((c) => c.L)));
let lastKey = null;

function generateProblem() {
    let prob;
    for (let i = 0; i < 20; i++) {
        // pick the length first so short and long beams come up equally often
        const L = LENGTHS[Math.floor(rng() * LENGTHS.length)];
        const pool = CANDIDATES.filter((c) => c.L === L);
        prob = pool[Math.floor(rng() * pool.length)];
        if (prob.key !== lastKey) break;
    }
    lastKey = prob.key;
    return prob;
}

// ---------- the correct diagrams, in grid units (column = ft, row = grid step) ----------

function expectedShear(p) {
    const r1 = p.R1 / p.stepV;
    const r2 = p.R2 / p.stepV;
    const pts = [[0, 0], [0, r1], [p.a, r1], [p.a, -r2], [p.L, -r2], [p.L, 0]];
    return pts.slice(1).map((pt, i) => [pts[i], pt]);
}

function expectedMoment(p) {
    const m = p.Mmax / p.stepM;
    const pts = [[0, 0], [p.a, m], [p.L, 0]];
    return pts.slice(1).map((pt, i) => [pts[i], pt]);
}

// ---------- geometry for grading ----------

function distPointSeg(p, a, b) {
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const len2 = dx * dx + dy * dy;
    let t = len2 === 0 ? 0 : ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / len2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy));
}

// curved segments are parabolas with a flat (zero-slope) end at one of the two points
function curveControl(seg) {
    const cx = (seg.c1 + seg.c2) / 2;
    return seg.vertex === "right" ? [cx, seg.r2] : [cx, seg.r1];
}

// turn any drawn segment into a list of short straight pieces
function toPolyline(seg) {
    if (seg.type !== "curve") return [[seg.c1, seg.r1], [seg.c2, seg.r2]];
    const c = curveControl(seg);
    const pts = [];
    for (let i = 0; i <= 40; i++) {
        const t = i / 40, u = 1 - t;
        pts.push([
            u * u * seg.c1 + 2 * u * t * c[0] + t * t * seg.c2,
            u * u * seg.r1 + 2 * u * t * c[1] + t * t * seg.r2,
        ]);
    }
    return pts;
}

function samplePolyline(poly, spacing) {
    const out = [];
    for (let i = 0; i < poly.length - 1; i++) {
        const a = poly[i], b = poly[i + 1];
        const n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / spacing));
        for (let k = 0; k <= n; k++) out.push([a[0] + ((b[0] - a[0]) * k) / n, a[1] + ((b[1] - a[1]) * k) / n]);
    }
    return out;
}

const GRADE_TOL = 0.25; // grid units

// Grading compares the drawn geometry with the correct geometry (not how the
// student happened to split it into pieces), so a correct diagram built from
// extra intermediate points still counts.
function gradeDiagram(studentSegs, expected) {
    if (studentSegs.length === 0) return { ok: false, empty: true, extra: 0, missing: 0 };

    const studentPolys = studentSegs.map(toPolyline);

    let extra = 0;
    studentPolys.forEach((poly) => {
        const bad = samplePolyline(poly, 0.1).some(
            (pt) => Math.min(...expected.map(([a, b]) => distPointSeg(pt, a, b))) > GRADE_TOL
        );
        if (bad) extra++;
    });

    let missing = 0;
    expected.forEach(([a, b]) => {
        const uncovered = samplePolyline([a, b], 0.1).some((pt) => {
            let best = Infinity;
            studentPolys.forEach((poly) => {
                for (let i = 0; i < poly.length - 1; i++) best = Math.min(best, distPointSeg(pt, poly[i], poly[i + 1]));
            });
            return best > GRADE_TOL;
        });
        if (uncovered) missing++;
    });

    return { ok: extra === 0 && missing === 0, empty: false, extra, missing };
}

// ---------- free body diagram (given), drawn to scale ----------

function drawFBD(svg, p) {
    clearNode(svg);
    const x0 = PAD_L;
    const xL = PAD_L + p.L * PX_PER_FT;
    const xa = PAD_L + p.a * PX_PER_FT;
    const beamY = 96;

    const defs = svgEl("defs", {}, svg);
    const marker = svgEl("marker", {
        id: "fbdArrow", markerWidth: 8, markerHeight: 8, refX: 8, refY: 4, orient: "auto", markerUnits: "userSpaceOnUse",
    }, defs);
    svgEl("path", { d: "M0,0 L8,4 L0,8 Z", fill: "#c0392b" }, marker);
    const markerBlue = svgEl("marker", {
        id: "fbdArrowBlue", markerWidth: 8, markerHeight: 8, refX: 8, refY: 4, orient: "auto", markerUnits: "userSpaceOnUse",
    }, defs);
    svgEl("path", { d: "M0,0 L8,4 L0,8 Z", fill: COLORS.shear }, markerBlue);

    svgEl("rect", {
        x: x0, y: beamY - 8, width: xL - x0, height: 16,
        fill: COLORS.beam, stroke: COLORS.dark, "stroke-width": 1.2,
    }, svg);

    // pin support (left)
    svgEl("polygon", {
        points: `${x0 - 16},${beamY + 30} ${x0 + 16},${beamY + 30} ${x0},${beamY + 8}`,
        fill: "#d6d6d6", stroke: COLORS.dark, "stroke-width": 1.2,
    }, svg);
    svgEl("line", { x1: x0 - 24, y1: beamY + 30, x2: x0 + 24, y2: beamY + 30, stroke: COLORS.dark, "stroke-width": 1.2 }, svg);

    // roller support (right)
    const rollerCy = beamY + 8 + 14;
    svgEl("circle", { cx: xL, cy: rollerCy, r: 14, fill: "#d6d6d6", stroke: COLORS.dark, "stroke-width": 1.2 }, svg);
    svgEl("line", { x1: xL - 24, y1: rollerCy + 14, x2: xL + 24, y2: rollerCy + 14, stroke: COLORS.dark, "stroke-width": 1.2 }, svg);

    // support names, set beside each support so they clear the arrows and dimension lines
    const nameA = svgEl("text", {
        x: x0 - 30, y: beamY + 26, "text-anchor": "end", "font-size": 16, "font-weight": 700, fill: COLORS.dark,
    }, svg);
    nameA.textContent = "A";
    const nameB = svgEl("text", {
        x: xL + 30, y: beamY + 26, "text-anchor": "start", "font-size": 16, "font-weight": 700, fill: COLORS.dark,
    }, svg);
    nameB.textContent = "B";

    // reaction arrows (upward, under each support). Every arrow is the same length for every
    // problem, so their size doesn't hint at the answers.
    [[x0, "A"], [xL, "B"]].forEach(([x, name]) => {
        svgEl("line", {
            x1: x, y1: beamY + 88, x2: x, y2: beamY + 46,
            stroke: COLORS.shear, "stroke-width": 3, "marker-end": "url(#fbdArrowBlue)",
        }, svg);
        const rt = svgEl("text", {
            x: x, y: beamY + 106, "text-anchor": "middle", "font-size": 15, fill: COLORS.shear, "font-weight": 700, "font-style": "italic",
        }, svg);
        rt.appendChild(document.createTextNode("R"));
        const sub = svgEl("tspan", { dy: 4, "font-size": 11 }, rt);
        sub.textContent = name;
    });

    // load
    svgEl("line", {
        x1: xa, y1: 34, x2: xa, y2: beamY - 10,
        stroke: "#c0392b", "stroke-width": 3, "marker-end": "url(#fbdArrow)",
    }, svg);
    const pt = svgEl("text", {
        x: xa, y: 24, "text-anchor": "middle", "font-size": 14, fill: "#c0392b", "font-weight": 700,
    }, svg);
    pt.textContent = `P = ${p.P} kip`;

    // dimension lines: a, then L (with a tick every foot so the length can be read off)
    const dimA = beamY + 138;
    svgEl("line", { x1: x0, y1: dimA - 6, x2: x0, y2: dimA + 6, stroke: COLORS.dark }, svg);
    svgEl("line", { x1: xa, y1: dimA - 6, x2: xa, y2: dimA + 6, stroke: COLORS.dark }, svg);
    svgEl("line", { x1: x0, y1: dimA, x2: xa, y2: dimA, stroke: COLORS.dark }, svg);
    const at = svgEl("text", {
        x: (x0 + xa) / 2, y: dimA + 17, "text-anchor": "middle", "font-size": 13, "font-weight": 700, "font-style": "italic", fill: COLORS.dark,
    }, svg);
    at.textContent = `a = ${p.a} ft`;

    const dimL = dimA + 40;
    svgEl("line", { x1: x0, y1: dimL - 7, x2: x0, y2: dimL + 7, stroke: COLORS.dark }, svg);
    svgEl("line", { x1: xL, y1: dimL - 7, x2: xL, y2: dimL + 7, stroke: COLORS.dark }, svg);
    svgEl("line", { x1: x0, y1: dimL, x2: xL, y2: dimL, stroke: COLORS.dark }, svg);
    for (let ft = 1; ft < p.L; ft++) {
        const x = PAD_L + ft * PX_PER_FT;
        svgEl("line", { x1: x, y1: dimL - 3, x2: x, y2: dimL + 3, stroke: "#9aa0a6" }, svg);
    }
    const lt = svgEl("text", {
        x: (x0 + xL) / 2, y: dimL + 20, "text-anchor": "middle", "font-size": 13, "font-weight": 700, "font-style": "italic", fill: COLORS.dark,
    }, svg);
    lt.textContent = `L = ${p.L} ft`;

    svg.setAttribute("viewBox", `0 0 ${VB_W} ${dimL + 34}`);
}

// ---------- the drawing editor (one for shear, one for moment) ----------

const ICONS = {
    point: '<svg viewBox="0 0 24 16" width="24" height="16"><circle cx="12" cy="8" r="3.6" fill="currentColor"/></svg>',
    horizontal: '<svg viewBox="0 0 24 16" width="24" height="16"><line x1="3" y1="8" x2="21" y2="8" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
    vertical: '<svg viewBox="0 0 24 16" width="24" height="16"><line x1="12" y1="1.5" x2="12" y2="14.5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
    diagonal: '<svg viewBox="0 0 24 16" width="24" height="16"><line x1="4" y1="13" x2="20" y2="3" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
    curve: '<svg viewBox="0 0 24 16" width="24" height="16"><path d="M3 13.5 Q 14 13.5 21 3" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
    erase: '<svg viewBox="0 0 24 16" width="24" height="16"><path d="M7 3 L17 13 M17 3 L7 13" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
};

const TOOL_HELP = {
    point: "Click grid intersections to place points.",
    horizontal: "Click two points at the same height to connect them with a horizontal line.",
    vertical: "Click two points at the same x to connect them with a vertical line.",
    diagonal: "Click two points to connect them with a straight sloped line.",
    curve: "Click two points to connect them with a curve. Choose which end of the curve is flat.",
    erase: "Click a point or a line to remove it.",
};

class DiagramEditor {
    constructor(host, opts) {
        this.host = host;
        this.kind = opts.kind;
        this.symbol = opts.symbol; // "V" or "M"
        this.unit = opts.unit;
        this.color = opts.color;

        host.innerHTML = `
            <div class="toolbar" role="toolbar" aria-label="Drawing tools">
                <div class="tool-group">
                    <button type="button" class="tool-btn" data-tool="point" title="Place points">${ICONS.point}<span>Point</span></button>
                    <button type="button" class="tool-btn" data-tool="horizontal" title="Horizontal line">${ICONS.horizontal}<span>Horizontal</span></button>
                    <button type="button" class="tool-btn" data-tool="vertical" title="Vertical line">${ICONS.vertical}<span>Vertical</span></button>
                    <button type="button" class="tool-btn" data-tool="diagonal" title="Diagonal line">${ICONS.diagonal}<span>Diagonal</span></button>
                    <button type="button" class="tool-btn" data-tool="curve" title="Curved line">${ICONS.curve}<span>Curved</span></button>
                    <button type="button" class="tool-btn" data-tool="erase" title="Erase">${ICONS.erase}<span>Erase</span></button>
                </div>
                <div class="tool-group">
                    <button type="button" class="tool-btn action" data-action="undo">Undo</button>
                    <button type="button" class="tool-btn action" data-action="clear">Clear</button>
                </div>
                <div class="curve-opts" hidden>
                    Flat end of curve at the
                    <button type="button" data-vertex="left">left point</button>
                    <button type="button" data-vertex="right">right point</button>
                </div>
            </div>
            <div class="editor-readout">&nbsp;</div>
            <svg class="editor-svg" role="img" aria-label="Blank ${opts.title} grid"></svg>
            <div class="editor-caption"></div>
            <div class="editor-msg info" role="status"></div>
        `;

        this.svg = host.querySelector(".editor-svg");
        this.readout = host.querySelector(".editor-readout");
        this.caption = host.querySelector(".editor-caption");
        this.msgEl = host.querySelector(".editor-msg");
        this.curveOpts = host.querySelector(".curve-opts");

        this.chartH = 300;
        this.padT = 22;
        this.padB = 42;

        this.tool = "point";
        this.vertex = "right";
        this.points = new Map();
        this.segments = [];
        this.pending = null;
        this.history = [];
        this.showSolution = false;
        this.expected = [];

        host.querySelectorAll("[data-tool]").forEach((b) =>
            b.addEventListener("click", () => this.setTool(b.dataset.tool))
        );
        host.querySelector('[data-action="undo"]').addEventListener("click", () => this.undo());
        host.querySelector('[data-action="clear"]').addEventListener("click", () => this.clearAll());
        host.querySelectorAll("[data-vertex]").forEach((b) =>
            b.addEventListener("click", () => {
                this.vertex = b.dataset.vertex;
                this.updateToolbar();
            })
        );

        this.svg.addEventListener("click", (e) => this.onClick(e));
        this.svg.addEventListener("pointermove", (e) => this.onMove(e));
        this.svg.addEventListener("pointerleave", () => this.onLeave());
    }

    // ----- setup for a new problem -----

    configure(prob, step, maxValue, expected) {
        this.L = prob.L;
        this.step = step;
        this.rows = Math.ceil(maxValue / step) + 1;
        this.expected = expected;
        this.H = this.padT + this.chartH + this.padB;
        this.centerY = this.padT + this.chartH / 2;
        this.rowPx = this.chartH / 2 / this.rows;

        this.points = new Map();
        this.segments = [];
        this.pending = null;
        this.history = [];
        this.showSolution = false;
        this.tool = "point";

        this.svg.setAttribute("viewBox", `0 0 ${VB_W} ${this.H}`);
        this.caption.textContent = `Each vertical gridline = 1 ft. Each horizontal gridline = ${this.step} ${this.unit}.`;
        this.buildGrid();
        this.updateToolbar();
        this.message(TOOL_HELP.point, "info");
        this.render();
    }

    // ----- coordinates -----

    px(c) { return PAD_L + c * PX_PER_FT; }
    py(r) { return this.centerY - r * this.rowPx; }

    eventToSvg(evt) {
        const pt = this.svg.createSVGPoint();
        pt.x = evt.clientX;
        pt.y = evt.clientY;
        return pt.matrixTransform(this.svg.getScreenCTM().inverse());
    }

    // nearest grid intersection, or null if the pointer is off the grid
    snap(p) {
        const cRaw = (p.x - PAD_L) / PX_PER_FT;
        const rRaw = (this.centerY - p.y) / this.rowPx;
        const c = Math.max(0, Math.min(this.L, Math.round(cRaw)));
        const r = Math.max(-this.rows, Math.min(this.rows, Math.round(rRaw)));
        if (Math.abs(p.x - this.px(c)) > PX_PER_FT * 0.6 || Math.abs(p.y - this.py(r)) > this.rowPx * 0.7) return null;
        return { c, r };
    }

    key(pt) { return `${pt.c},${pt.r}`; }

    // ----- static grid -----

    buildGrid() {
        clearNode(this.svg);
        const g = svgEl("g", { class: "grid" }, this.svg);
        const top = this.py(this.rows), bottom = this.py(-this.rows);
        const left = this.px(0), right = this.px(this.L);

        for (let c = 0; c <= this.L; c++) {
            const major = c % 5 === 0;
            svgEl("line", { x1: this.px(c), y1: top, x2: this.px(c), y2: bottom, stroke: major ? "#cfd5dc" : "#e8ebef", "stroke-width": major ? 1.1 : 0.8 }, g);
            const t = svgEl("text", { x: this.px(c), y: bottom + 16, "text-anchor": "middle", "font-size": 10, fill: "#6b7280" }, g);
            t.textContent = c;
        }
        for (let r = -this.rows; r <= this.rows; r++) {
            const zero = r === 0;
            svgEl("line", { x1: left, y1: this.py(r), x2: right, y2: this.py(r), stroke: zero ? "#6b7280" : "#e8ebef", "stroke-width": zero ? 1.6 : 0.8 }, g);
            const t = svgEl("text", { x: left - 8, y: this.py(r) + 3.5, "text-anchor": "end", "font-size": 10, fill: "#6b7280" }, g);
            t.textContent = r * this.step;
        }
        svgEl("line", { x1: left, y1: top, x2: left, y2: bottom, stroke: "#6b7280", "stroke-width": 1.4 }, g);

        const yl = svgEl("text", { x: left - 8, y: top - 8, "text-anchor": "end", "font-size": 11, "font-weight": 700, fill: this.color }, g);
        yl.textContent = `${this.symbol} (${this.unit})`;
        const xl = svgEl("text", { x: right, y: bottom + 32, "text-anchor": "end", "font-size": 11, "font-weight": 700, fill: "#6b7280" }, g);
        xl.textContent = "x (ft)";

        this.solutionLayer = svgEl("g", { class: "solution" }, this.svg);
        this.drawLayer = svgEl("g", { class: "drawn" }, this.svg);
        this.hoverLayer = svgEl("g", { class: "hover", "pointer-events": "none" }, this.svg);
    }

    // ----- dynamic drawing -----

    render() {
        clearNode(this.solutionLayer);
        clearNode(this.drawLayer);

        if (this.showSolution) {
            this.expected.forEach(([a, b]) => {
                svgEl("line", {
                    x1: this.px(a[0]), y1: this.py(a[1]), x2: this.px(b[0]), y2: this.py(b[1]),
                    stroke: COLORS.solution, "stroke-width": 5, "stroke-dasharray": "8 6", opacity: 0.75, "stroke-linecap": "round",
                }, this.solutionLayer);
            });
        }

        this.segments.forEach((s) => {
            if (s.type === "curve") {
                const c = curveControl(s);
                svgEl("path", {
                    d: `M ${this.px(s.c1)} ${this.py(s.r1)} Q ${this.px(c[0])} ${this.py(c[1])} ${this.px(s.c2)} ${this.py(s.r2)}`,
                    fill: "none", stroke: this.color, "stroke-width": 3, "stroke-linecap": "round",
                }, this.drawLayer);
            } else {
                svgEl("line", {
                    x1: this.px(s.c1), y1: this.py(s.r1), x2: this.px(s.c2), y2: this.py(s.r2),
                    stroke: this.color, "stroke-width": 3, "stroke-linecap": "round",
                }, this.drawLayer);
            }
        });

        this.points.forEach((pt) => {
            svgEl("circle", { cx: this.px(pt.c), cy: this.py(pt.r), r: 5, fill: this.color, stroke: "#fff", "stroke-width": 1.5 }, this.drawLayer);
        });

        if (this.pending) {
            svgEl("circle", {
                cx: this.px(this.pending.c), cy: this.py(this.pending.r), r: 9,
                fill: "none", stroke: this.color, "stroke-width": 2, "stroke-dasharray": "3 2",
            }, this.drawLayer);
        }
    }

    // ----- toolbar -----

    updateToolbar() {
        this.host.querySelectorAll("[data-tool]").forEach((b) => b.classList.toggle("active", b.dataset.tool === this.tool));
        this.host.querySelectorAll("[data-vertex]").forEach((b) => b.classList.toggle("active", b.dataset.vertex === this.vertex));
        this.curveOpts.hidden = this.tool !== "curve";
    }

    setTool(tool) {
        this.tool = tool;
        this.pending = null;
        this.updateToolbar();
        this.message(TOOL_HELP[tool], "info");
        this.render();
    }

    message(text, kind) {
        this.msgEl.textContent = text || "";
        this.msgEl.className = `editor-msg ${kind || "info"}`;
    }

    // ----- history -----

    snapshot() {
        this.history.push(JSON.stringify({ points: Array.from(this.points.entries()), segments: this.segments }));
        if (this.history.length > 100) this.history.shift();
    }

    undo() {
        if (this.history.length === 0) return;
        const s = JSON.parse(this.history.pop());
        this.points = new Map(s.points);
        this.segments = s.segments;
        this.pending = null;
        this.render();
        this.message("Undid the last change.", "info");
    }

    clearAll() {
        if (this.points.size === 0 && this.segments.length === 0) return;
        this.snapshot();
        this.points = new Map();
        this.segments = [];
        this.pending = null;
        this.render();
        this.message("Cleared. Press Undo to bring it back.", "info");
    }

    // ----- pointer handling -----

    onMove(e) {
        const snapped = this.snap(this.eventToSvg(e));
        clearNode(this.hoverLayer);
        if (!snapped) {
            this.readout.innerHTML = "&nbsp;";
            return;
        }
        svgEl("circle", {
            cx: this.px(snapped.c), cy: this.py(snapped.r), r: 7,
            fill: "none", stroke: "#6b7280", "stroke-width": 1.4,
        }, this.hoverLayer);
        this.readout.textContent = `x = ${snapped.c} ft,  ${this.symbol} = ${fmt(snapped.r * this.step)} ${this.unit}`;
    }

    onLeave() {
        clearNode(this.hoverLayer);
        this.readout.innerHTML = "&nbsp;";
    }

    onClick(e) {
        const pt = this.snap(this.eventToSvg(e));
        if (!pt) return;

        if (this.tool === "point") {
            if (this.points.has(this.key(pt))) {
                this.message("There is already a point there. Use Erase to remove it.", "warn");
                return;
            }
            this.snapshot();
            this.points.set(this.key(pt), pt);
            this.render();
            this.message(`Placed a point at x = ${pt.c} ft, ${this.symbol} = ${fmt(pt.r * this.step)} ${this.unit}.`, "info");
            return;
        }

        if (this.tool === "erase") {
            this.erase(e, pt);
            return;
        }

        this.lineClick(pt);
    }

    lineClick(pt) {
        if (!this.pending) {
            this.pending = pt;
            this.ensurePoint(pt);
            this.render();
            this.message("Now click the second point.", "info");
            return;
        }
        if (this.key(this.pending) === this.key(pt)) {
            this.pending = null;
            this.render();
            this.message("Cancelled. Click a first point to start a new line.", "info");
            return;
        }

        const a = this.pending;
        const b = pt;
        const problem = this.geometryProblem(a, b);
        if (problem) {
            this.message(problem, "warn");
            return; // keep the first point selected so they can pick a different second point
        }

        // store left-to-right (bottom-to-top if vertical)
        const [p1, p2] = a.c < b.c || (a.c === b.c && a.r < b.r) ? [a, b] : [b, a];
        const dup = this.segments.some(
            (s) => s.type === this.tool && s.c1 === p1.c && s.r1 === p1.r && s.c2 === p2.c && s.r2 === p2.r && (this.tool !== "curve" || s.vertex === this.vertex)
        );
        if (dup) {
            this.message("That line is already drawn.", "warn");
            this.pending = null;
            this.render();
            return;
        }

        this.snapshot();
        if (!this.points.has(this.key(b))) this.points.set(this.key(b), b);
        this.segments.push({
            type: this.tool, c1: p1.c, r1: p1.r, c2: p2.c, r2: p2.r,
            vertex: this.tool === "curve" ? this.vertex : null,
        });
        this.pending = null;
        this.render();
        this.message("Line added.", "info");
    }

    geometryProblem(a, b) {
        const sameX = a.c === b.c, sameY = a.r === b.r;
        if (this.tool === "horizontal" && (!sameY || sameX)) return "A horizontal line needs two different points at the same height.";
        if (this.tool === "vertical" && (!sameX || sameY)) return "A vertical line needs two different points at the same x.";
        if (this.tool === "diagonal" && (sameX || sameY)) return "A diagonal line needs points at different x and different heights. Use Horizontal or Vertical for flat or straight-up lines.";
        if (this.tool === "curve" && (sameX || sameY)) return "A curve needs points at different x and different heights.";
        return null;
    }

    ensurePoint(pt) {
        if (!this.points.has(this.key(pt))) {
            this.snapshot();
            this.points.set(this.key(pt), pt);
        }
    }

    erase(e, pt) {
        const svgPt = this.eventToSvg(e);

        // a point close to the click wins
        const hit = this.points.get(this.key(pt));
        if (hit && Math.hypot(svgPt.x - this.px(hit.c), svgPt.y - this.py(hit.r)) < 14) {
            this.snapshot();
            this.points.delete(this.key(pt));
            this.segments = this.segments.filter(
                (s) => !((s.c1 === hit.c && s.r1 === hit.r) || (s.c2 === hit.c && s.r2 === hit.r))
            );
            this.render();
            this.message("Removed the point and any lines attached to it.", "info");
            return;
        }

        // otherwise the nearest line within a few pixels
        let bestIdx = -1, bestDist = 9;
        this.segments.forEach((s, i) => {
            const poly = toPolyline(s).map(([c, r]) => [this.px(c), this.py(r)]);
            for (let k = 0; k < poly.length - 1; k++) {
                const d = distPointSeg([svgPt.x, svgPt.y], poly[k], poly[k + 1]);
                if (d < bestDist) { bestDist = d; bestIdx = i; }
            }
        });
        if (bestIdx >= 0) {
            this.snapshot();
            this.segments.splice(bestIdx, 1);
            this.render();
            this.message("Removed the line.", "info");
        } else {
            this.message("Nothing to erase there.", "info");
        }
    }

    // ----- solution overlay and grading -----

    setSolutionVisible(on) {
        this.showSolution = on;
        this.render();
    }

    grade() {
        return gradeDiagram(this.segments, this.expected);
    }
}

// ---------- page wiring ----------

const FIELDS = [
    { id: "r1", key: "R1", label: "R<sub>A</sub>", unit: "kip", abs: false,
      hint: "Try summing moments about support B." },
    { id: "r2", key: "R2", label: "R<sub>B</sub>", unit: "kip", abs: false,
      hint: "Try summing moments about support A, or use the sum of vertical forces." },
    { id: "vmax", key: "Vmax", label: "Vmax", unit: "kip", abs: true,
      hint: "Look at the largest value of |V| anywhere along the beam." },
    { id: "mmax", key: "Mmax", label: "Mmax", unit: "kip-ft", abs: true,
      hint: "Moment is largest where the shear passes through zero." },
];

    if (gradeResponses) {
      resetRandom(seed);
      const problem = generateProblem();
      const diagrams = { shear: expectedShear(problem), moment: expectedMoment(problem) };
      const results = FIELDS.map((field) => {
        const response = gradeResponses.values?.[field.id];
        const entered = typeof response === "string" && response.trim() !== "" && Number.isFinite(Number(response));
        const expected = problem[field.key];
        return { name: field.id, entered, correct: entered && checkNumber(response, expected, field.abs) === "ok", expected };
      });
      for (const name of ["shear", "moment"]) {
        const expected = diagrams[name];
        const segments = gradeResponses[name] ?? [];
        const comparison = expected;
        results.push({ name, entered: segments.length > 0, correct: gradeDiagram(segments, comparison).ok });
      }
      return { parameters: problem, results };
    }
  
const el = {
    gL: document.getElementById("gL"),
    gP: document.getElementById("gP"),
    gA: document.getElementById("gA"),
    fbd: document.getElementById("fbdSvg"),
    summary: document.getElementById("summary"),
    btnSolution: document.getElementById("btnSolution"),
};

const shearEditor = new DiagramEditor(document.getElementById("shearEditor"), {
    kind: "shear", symbol: "V", unit: "kip", color: COLORS.shear, title: "shear diagram",
});
const momentEditor = new DiagramEditor(document.getElementById("momentEditor"), {
    kind: "moment", symbol: "M", unit: "kip-ft", color: COLORS.moment, title: "moment diagram",
});



let problem = null;
let solutionShown = false;

function checkNumber(raw, expected, useAbs) {
    if (raw.trim() === "") return "empty";
    const v = parseFloat(raw);
    if (Number.isNaN(v)) return "empty";
    const value = useAbs ? Math.abs(v) : v;
    const tol = Math.max(0.01 * Math.abs(expected), 0.05);
    return Math.abs(value - expected) <= tol ? "ok" : "bad";
}

function setField(f, state, text) {
    const wrap = document.getElementById(`field-${f.id}`);
    wrap.classList.remove("ok", "bad");
    if (state === "ok" || state === "bad") wrap.classList.add(state);
    wrap.querySelector(".fb").innerHTML = text || "";
}

function newProblem() {
    resetRandom(currentSeed ? newSeed() : seed);
    lastKey = null;
    problem = generateProblem();
    solutionShown = false;
    el.btnSolution.textContent = "Show solution";

    el.gL.textContent = problem.L;
    el.gP.textContent = problem.P;
    el.gA.textContent = problem.a;
    drawFBD(el.fbd, problem);

    FIELDS.forEach((f) => {
        document.getElementById(`in-${f.id}`).value = "";
        setField(f, "none", "");
    });

    shearEditor.configure(problem, problem.stepV, problem.Vmax, expectedShear(problem));
    momentEditor.configure(problem, problem.stepM, problem.Mmax, expectedMoment(problem));
    el.summary.innerHTML = "";
}

function runCheck() {
    const results = [];

    FIELDS.forEach((f) => {
        const raw = document.getElementById(`in-${f.id}`).value;
        const state = checkNumber(raw, problem[f.key], f.abs);
        if (state === "empty") {
            setField(f, "none", "Enter a value.");
            results.push({ label: f.label, ok: false });
        } else if (state === "ok") {
            setField(f, "ok", "Correct");
            results.push({ label: f.label, ok: true });
        } else {
            const negativeReaction = !f.abs && parseFloat(raw) < 0;
            setField(f, "bad", negativeReaction ? "Reactions are positive when they push up." : f.hint);
            results.push({ label: f.label, ok: false });
        }
        if (solutionShown) {
            const wrap = document.getElementById(`field-${f.id}`);
            wrap.querySelector(".fb").innerHTML += ` <span class="reveal">Answer: ${problem[f.key]} ${f.unit}</span>`;
        }
    });

    const shear = shearEditor.grade();
    const moment = momentEditor.grade();

    reportDiagram(shearEditor, shear,
        "Remember: shear jumps up by each upward reaction, drops by the load P, and comes back to zero at the far support.");
    reportDiagram(momentEditor, moment,
        "Remember: between loads the moment diagram is made of straight sloped lines, and it is zero at both supports.");

    results.push({ label: "Shear diagram", ok: shear.ok });
    results.push({ label: "Moment diagram", ok: moment.ok });

    const correct = results.filter((r) => r.ok).length;
    const all = correct === results.length;
    el.summary.innerHTML = `
        <div class="banner ${all ? "all-ok" : "partial"}">
            ${all ? "All correct. Nice work." : `${correct} of ${results.length} parts correct. Keep going, you can fix and re-check as many times as you like.`}
        </div>
        <ul>${results.map((r) => `<li class="${r.ok ? "ok" : "bad"}">${r.ok ? "&#10003;" : "&#10007;"} ${r.label}</li>`).join("")}</ul>
    `;
}

function reportDiagram(editor, g, hint) {
    if (g.ok) {
        editor.message("Correct. The diagram matches.", "ok");
    } else if (g.empty) {
        editor.message("Nothing drawn yet. Place points, then connect them with the line tools.", "bad");
    } else {
        const bits = [];
        if (g.missing > 0) bits.push(g.missing === 1 ? "part of the diagram is missing" : "parts of the diagram are missing");
        if (g.extra > 0) bits.push(g.extra === 1 ? "one line doesn't belong" : `${g.extra} lines don't belong`);
        editor.message(`Not quite: ${bits.join(" and ")}. ${hint}`, "bad");
    }
}

function toggleSolution() {
    solutionShown = !solutionShown;
    el.btnSolution.textContent = solutionShown ? "Hide solution" : "Show solution";
    shearEditor.setSolutionVisible(solutionShown);
    momentEditor.setSolutionVisible(solutionShown);

    FIELDS.forEach((f) => {
        const wrap = document.getElementById(`field-${f.id}`);
        wrap.querySelectorAll(".reveal").forEach((n) => n.remove());
        if (solutionShown) wrap.querySelector(".fb").innerHTML += ` <span class="reveal">Answer: ${problem[f.key]} ${f.unit}</span>`;
    });
}

document.getElementById("btnCheck").addEventListener("click", () => {
      runCheck();
      onAttempt?.(currentSeed, {
        values: Object.fromEntries(FIELDS.map((field) => [field.id, document.getElementById("in-" + field.id).value])),
        shear: shearEditor.segments,
        moment: momentEditor.segments,
      });
    });
document.getElementById("btnSolution").addEventListener("click", toggleSolution);
document.getElementById("btnNew").addEventListener("click", newProblem);
document.getElementById("btnNewTop").addEventListener("click", newProblem);

newProblem();

// Small hook so automated tests can read the current problem and place clicks on exact grid points.

}
