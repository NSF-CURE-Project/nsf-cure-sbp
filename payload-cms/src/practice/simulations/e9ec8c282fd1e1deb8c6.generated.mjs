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


    function submit(step) {
      const components = {};
      for (const card of document.querySelectorAll(".comp-card[data-force]")) {
        components[card.dataset.force] = Object.fromEntries(
          Array.from(card.querySelectorAll("[data-k]"), (field) => [field.dataset.k, field.value])
        );
      }
      onAttempt?.(currentSeed, { step, level: state.level, drawn: state.drawn, components });
    }
  /* Free Body Diagram practice: ball on an incline
 *
 * Step 1  Students pick which forces act on the ball and aim each arrow.
 * Step 2  (Level 1 only) Students draw the horizontal and vertical components of N, Nx and Ny,
 *         as dashed arrows starting at the tail of N.
 * Step 3  (Step 2 on Level 2) Students find the angle(s) between a force and the
 *         reference axes, choose sin or cos for each component, and pick component directions.
 *         On Level 1 the normal force gets BOTH angles (from the vertical and from the horizontal)
 *         and each component row lets the student choose which angle it uses.
 *
 * Geometry is kept in "math" coordinates (x right, y up, ground at y = 0)
 * and converted to SVG screen coordinates only when drawing.
 */

  'use strict';

  /* ------------------------------------------------------------------ *
   *  Constants
   * ------------------------------------------------------------------ */
  const VB_W = 700;        // width of the world the geometry is laid out in
  const VIEW_W = 500;      // width actually shown (cropped to the incline's side)
  const VB_H = 440;
  const GY = 400;          // screen y of the ground line
  const BALL_R = 42;
  const SLOPE_L = 380;     // length of the incline surface
  const CONTACT_D = 209;   // distance from the incline's base vertex to the contact point
  const TOL_DIR = 7;       // degrees of tolerance on an arrow's direction
  const TOL_ANGLE = 0.5;   // degrees of tolerance on the typed component angle
  const SNAP = 5;          // arrows snap to 5 degree steps while dragging

  const FORCES = {
    W:  { name: 'Weight', len: 100, html: 'W', svg: 'W' },
    N:  { name: 'Normal force', len: 120, html: 'N', svg: 'N' },
    f:  { name: 'Friction force', len: 100, html: 'f', svg: 'f' },
    T:  { name: 'Rope tension', len: 100, html: 'T', svg: 'T' },
    // components of N (Easy only): length is proportional to the real component
    Nx: { name: 'Horizontal component of N', comp: true, html: 'N<sub>x</sub>', svg: 'N<tspan class="sub" dy="6">x</tspan>' },
    Ny: { name: 'Vertical component of N', comp: true, html: 'N<sub>y</sub>', svg: 'N<tspan class="sub" dy="6">y</tspan>' },
  };

  // present : forces that really act in the problem
  // palette : forces the student may add (anything not in `present` is a distractor)
  // compIds : (Easy only) component arrows drawn in the extra step
  // resolve : forces the student breaks into components in the last step
  //           ref 'both' = student finds the angle from the vertical AND from the horizontal
  const LEVELS = {
    easy: {
      thetas: [20, 25, 30, 35, 40, 45, 50, 55, 60],
      palette: ['W', 'N'],
      present: ['W', 'N'],
      compIds: ['Nx', 'Ny'],
      resolve: [{ id: 'N', ref: 'both' }],
    },
    hard: {
      thetas: [20, 25, 30, 35, 40],
      betas: [15, 20, 25, 30],
      palette: ['W', 'N', 'f', 'T'],
      present: ['W', 'N', 'T'],
      resolve: [{ id: 'N', ref: 'vertical' }, { id: 'T', ref: 'horizontal' }],
    },
  };

  /* ------------------------------------------------------------------ *
   *  Small helpers
   * ------------------------------------------------------------------ */
  const $ = (sel, root) => (root || document).querySelector(sel);
  const rad = (d) => (d * Math.PI) / 180;
  const deg = (r) => (r * 180) / Math.PI;
  const norm360 = (a) => ((a % 360) + 360) % 360;
  const angDiff = (a, b) => {            // a - b wrapped into (-180, 180]
    let d = norm360(a - b);
    if (d > 180) d -= 360;
    return d;
  };
  const pick = (arr) => arr[Math.floor(random() * arr.length)];
  const X = (p) => p.x.toFixed(1);
  const Y = (p) => (GY - p.y).toFixed(1);
  const PT = (p) => X(p) + ',' + Y(p);
  const polar = (c, r, a) => ({ x: c.x + r * Math.cos(rad(a)), y: c.y + r * Math.sin(rad(a)) });

  /* ------------------------------------------------------------------ *
   *  State
   * ------------------------------------------------------------------ */
  const state = {
    level: 'easy',
    problem: null,
    drawn: {},        // { N: { angle } }  arrows the student has placed
    status: {},       // { N: 'ok' | 'bad' | 'missing' } after a check
    phase: 'forces',  // 'forces' -> ('comps' on Easy) -> 'resolve'
    drag: null,
    focusId: null,
    step2Status: {},  // arc-label status, keyed 'N' or (Easy) 'N-v' / 'N-h'
    angleText: {},    // typed angle text, same keys
  };

  
    const fnFor = (comp, axis) => ((comp === 'x') === (axis === 'vertical') ? 'sin' : 'cos');
    if (gradeResponses) {
      const level = Object.hasOwn(LEVELS, gradeResponses.level) ? gradeResponses.level : "easy";
      resetRandom(seed, level);
      const problem = makeProblem(level, null);
      const cfg = LEVELS[level];
      const drawn = gradeResponses.drawn ?? {};
      const results = [];
      for (const name of [...cfg.present, ...(cfg.compIds ?? [])]) {
        const angle = drawn[name]?.angle;
        const expected = forceSpec(problem, name).angle;
        const entered = Number.isFinite(angle);
        results.push({ name, entered, correct: entered && Math.abs(angDiff(angle, expected)) <= TOL_DIR, expected });
      }
      for (const name of cfg.palette.filter((name) => !cfg.present.includes(name))) {
        if (Number.isFinite(drawn[name]?.angle)) results.push({ name, entered: true, correct: false });
      }
      for (const { id, ref } of problem.resolve ?? cfg.resolve) {
        const expected = expectedComponents(problem, id, ref);
        const values = gradeResponses.components?.[id] ?? {};
        const check = (key, target, angle = false) => {
          const value = values[key];
          const entered = typeof value === "string" && value !== "" && (!angle || Number.isFinite(Number(value)));
          results.push({ name: id + "." + key, entered, expected: target,
            correct: entered && (angle ? Math.abs(Number(value) - target) <= TOL_ANGLE : value === target) });
        };
        if (ref === "both") {
          check("angleV", expected.alphaV, true);
          check("angleH", expected.alphaH, true);
          for (const component of ["x", "y"]) {
            const key = component + "Axis";
            const axis = values[key];
            const entered = axis === "vertical" || axis === "horizontal";
            results.push({ name: id + "." + key, entered, correct: entered });
            check(component + "Fn", entered ? fnFor(component, axis) : null);
            check(component + "Dir", expected[component + "Dir"]);
          }
        } else {
          check("angle", expected.alpha, true);
          for (const key of ["xFn", "xDir", "yFn", "yDir"]) check(key, expected[key]);
        }
      }
      return { parameters: problem, results };
    }
    const svg = $('#stage');
  const layerStatic = $('#layer-static');
  const layerDyn = $('#layer-dynamic');

  /* ------------------------------------------------------------------ *
   *  Problem generation and geometry
   * ------------------------------------------------------------------ */
  function makeProblem(level, prev) {
    const cfg = LEVELS[level];
    let p;
    let tries = 0;
    do {
      p = {
        level,
        theta: pick(cfg.thetas),
        beta: cfg.betas ? pick(cfg.betas) : null,
        s: random() < 0.5 ? 1 : -1,   // +1: incline rises to the right, -1: to the left
      };
      tries++;
    } while (
      prev && prev.level === level && prev.theta === p.theta &&
      prev.s === p.s && prev.beta === p.beta && tries < 25
    );
    p.geo = computeGeometry(p);
    return p;
  }

  function computeGeometry(p) {
    const t = rad(p.theta);
    const s = p.s;
    const V = { x: s === 1 ? 60 : VB_W - 60, y: 0 };               // base vertex of the incline
    const u = { x: s * Math.cos(t), y: Math.sin(t) };              // unit vector up the slope
    const n = { x: -s * Math.sin(t), y: Math.cos(t) };             // outward unit normal
    const top = { x: V.x + SLOPE_L * u.x, y: SLOPE_L * u.y };
    const C = { x: V.x + CONTACT_D * u.x, y: CONTACT_D * u.y };    // contact point
    const O = { x: C.x + BALL_R * n.x, y: C.y + BALL_R * n.y };    // ball centre
    const geo = { V, u, n, top, C, O };

    if (p.beta != null) {
      const a = rad(p.theta + p.beta);
      const d = { x: s * Math.cos(a), y: Math.sin(a) };            // rope direction
      geo.ropeDir = d;
      geo.A = { x: O.x + BALL_R * d.x, y: O.y + BALL_R * d.y };    // rope attachment point
      geo.anchor = { x: geo.A.x + 170 * d.x, y: geo.A.y + 170 * d.y };
    }
    return geo;
  }

  // Tail position and (for forces that act) the correct direction of each force.
  function forceSpec(p, id) {
    const g = p.geo;
    const ang = (v) => norm360(deg(Math.atan2(v.y, v.x)));
    switch (id) {
      case 'W': return { tail: g.O, angle: 270 };
      case 'N': return { tail: g.C, angle: ang(g.n) };
      case 'f': return { tail: g.C, angle: ang(g.u) };
      case 'T':
        if (g.ropeDir) return { tail: g.A, angle: ang(g.ropeDir) };
        return { tail: { x: g.O.x + BALL_R * g.u.x, y: g.O.y + BALL_R * g.u.y }, angle: null };
      // components of N start at the tail of N
      case 'Nx': return { tail: g.C, angle: g.n.x > 0 ? 0 : 180 };
      case 'Ny': return { tail: g.C, angle: 90 };
      default: return null;
    }
  }

  // Drawn length of an arrow. Component arrows are scaled to the real components of N.
  function forceLen(p, id) {
    if (id === 'Nx') return FORCES.N.len * Math.abs(p.geo.n.x);
    if (id === 'Ny') return FORCES.N.len * Math.abs(p.geo.n.y);
    return FORCES[id].len;
  }

  // What the last step expects for one force.
  function expectedComponents(p, id, ref) {
    const a = rad(forceSpec(p, id).angle);
    const dx = Math.cos(a);
    const dy = Math.sin(a);
    const round = (v) => Math.round(v * 100) / 100;
    const alphaV = round(deg(Math.acos(Math.min(1, Math.abs(dy)))));   // angle between the force and the vertical
    const alphaH = round(deg(Math.acos(Math.min(1, Math.abs(dx)))));   // angle between the force and the horizontal
    const vertical = ref === 'vertical' || ref === 'both';
    return {
      alpha: ref === 'horizontal' ? alphaH : alphaV,
      alphaV,
      alphaH,
      xFn: vertical ? 'sin' : 'cos',
      yFn: vertical ? 'cos' : 'sin',
      xDir: dx > 0 ? 'right' : 'left',
      yDir: dy > 0 ? 'up' : 'down',
    };
  }

  // sin or cos for a component when the angle is measured from the given axis
  

  /* ------------------------------------------------------------------ *
   *  SVG builders
   * ------------------------------------------------------------------ */
  function arcPoints(center, a0, a1, r) {
    const delta = angDiff(a1, a0);
    const pts = [];
    for (let i = 0; i <= 24; i++) pts.push(polar(center, r, a0 + (delta * i) / 24));
    return { pts, mid: a0 + delta / 2 };
  }
  const pathFrom = (pts) => 'M' + pts.map(PT).join(' L');

  function arrowHTML(id, tail, angle, len, status) {
    const a = rad(angle);
    const c = Math.cos(a);
    const s = Math.sin(a);
    const tp = { x: tail.x + len * c, y: tail.y + len * s };
    const HL = 16;
    const HW = 7;
    const b = { x: tp.x - HL * c, y: tp.y - HL * s };
    const l = { x: b.x - s * HW, y: b.y + c * HW };
    const r = { x: b.x + s * HW, y: b.y - c * HW };
    const lab = { x: tp.x + 25 * c, y: tp.y + 25 * s };
    const dashed = FORCES[id].comp ? ' dashed' : '';
    return (
      '<g class="arrow f-' + id + dashed + ' ' + (status || '') + '">' +
        '<line x1="' + X(tail) + '" y1="' + Y(tail) + '" x2="' + X(b) + '" y2="' + Y(b) + '"/>' +
        '<polygon points="' + PT(tp) + ' ' + PT(l) + ' ' + PT(r) + '"/>' +
        '<circle class="tail-dot" cx="' + X(tail) + '" cy="' + Y(tail) + '" r="3.5"/>' +
        '<text class="f-label" x="' + X(lab) + '" y="' + Y(lab) + '">' + FORCES[id].svg + '</text>' +
      '</g>'
    );
  }

  function handleHTML(id, tail, angle, len) {
    const tp = polar(tail, len, angle);
    return (
      '<g class="handle f-' + id + '" data-handle="' + id + '" tabindex="0" role="button"' +
        ' aria-label="Aim the ' + FORCES[id].name + ' arrow. Use the arrow keys to rotate it.">' +
        '<circle class="hit" cx="' + X(tp) + '" cy="' + Y(tp) + '" r="18"/>' +
        '<circle class="vis" cx="' + X(tp) + '" cy="' + Y(tp) + '" r="6.5"/>' +
      '</g>'
    );
  }

  function arcLabelHTML(key, pos, st) {
    const typed = state.angleText[key];
    return '<text class="arc-label ' + (st || '') + '" id="arc-label-' + key + '" x="' + X(pos) + '" y="' + Y(pos) + '">' +
      (typed ? typed + '°' : '?') + '</text>';
  }

  function overlayHTML(p, cfg) {
    let html = '';
    cfg.resolve.forEach(({ id, ref }) => {
      const spec = forceSpec(p, id);
      const dx = Math.cos(rad(spec.angle));
      const dy = Math.sin(rad(spec.angle));

      if (ref === 'both') {
        // two arcs on either side of N: one from the vertical, one from the horizontal.
        // The dashed Nx / Ny arrows already mark the two axes, so no extra axis lines are drawn.
        // Each arc gets its own colour (teal = from the vertical, amber = from the horizontal)
        // so students can tell the two angles apart.
        const arcs = [
          { key: id + '-v', cls: 'ang-v', psi: dy >= 0 ? 90 : 270, r: 40 },
          { key: id + '-h', cls: 'ang-h', psi: dx >= 0 ? 0 : 180, r: 40 },
        ];
        html += '<g class="f-' + id + '">';
        arcs.forEach(({ key, cls, psi, r }) => {
          const arc = arcPoints(spec.tail, psi, spec.angle, r);
          // a narrow wedge (N close to the axis) gets its label farther out, where there is room
          html += '<g class="' + cls + '"><path class="arc" d="' + pathFrom(arc.pts) + '"/>' +
            arcLabelHTML(key, polar(spec.tail, Math.abs(angDiff(spec.angle, psi)) < 40 ? 96 : r + 24, arc.mid), state.step2Status[key]) + '</g>';
        });
        html += '</g>';
        return;
      }

      const vertical = ref === 'vertical';
      const psi = vertical ? (dy >= 0 ? 90 : 270) : (dx >= 0 ? 0 : 180);   // reference axis direction
      const radius = id === 'T' ? 32 : 38;
      const arc = arcPoints(spec.tail, psi, spec.angle, radius);
      const axisEnd = polar(spec.tail, 95, psi);
      html +=
        '<g class="f-' + id + '">' +
          '<line class="axis-line" x1="' + X(spec.tail) + '" y1="' + Y(spec.tail) + '" x2="' + X(axisEnd) + '" y2="' + Y(axisEnd) + '"/>' +
          '<path class="arc" d="' + pathFrom(arc.pts) + '"/>' +
          arcLabelHTML(id, polar(spec.tail, radius + 22, arc.mid), state.step2Status[id]) +
        '</g>';
    });
    return html;
  }

  function renderStatic() {
    const p = state.problem;
    const g = p.geo;
    const s = p.s;
    const x0 = s === 1 ? 0 : VB_W - VIEW_W;               // left edge of the visible window
    svg.setAttribute('viewBox', x0 + ' 0 ' + VIEW_W + ' ' + VB_H);
    let html = '';

    html += '<rect x="' + x0 + '" y="' + GY + '" width="' + VIEW_W + '" height="' + (VB_H - GY) + '" fill="url(#hatch)"/>';
    html += '<line class="ground-line" x1="' + (x0 + 10) + '" y1="' + GY + '" x2="' + (x0 + VIEW_W - 10) + '" y2="' + GY + '"/>';
    html += '<polygon class="wedge" points="' + PT(g.V) + ' ' + PT(g.top) + ' ' + PT({ x: g.top.x, y: 0 }) + '"/>';
    html += '<line class="slope-line" x1="' + X(g.V) + '" y1="' + Y(g.V) + '" x2="' + X(g.top) + '" y2="' + Y(g.top) + '"/>';

    if (g.A) {
      html += '<line class="rope" x1="' + X(g.A) + '" y1="' + Y(g.A) + '" x2="' + X(g.anchor) + '" y2="' + Y(g.anchor) + '"/>';
      html += '<circle class="anchor" cx="' + X(g.anchor) + '" cy="' + Y(g.anchor) + '" r="6"/>';
    }

    html += '<circle class="ball" cx="' + X(g.O) + '" cy="' + Y(g.O) + '" r="' + BALL_R + '"/>';

    // given incline angle, theta
    const slopeAng = s === 1 ? p.theta : 180 - p.theta;
    const groundAng = s === 1 ? 0 : 180;
    const thArc = arcPoints(g.V, groundAng, slopeAng, 58);
    const thLab = polar(g.V, 90, thArc.mid);
    thLab.y = Math.max(thLab.y, 17);
    html += '<path class="given-arc" d="' + pathFrom(thArc.pts) + '"/>';
    html += '<text class="given-label" x="' + X(thLab) + '" y="' + Y(thLab) + '">θ=' + p.theta + '°</text>';

    // given rope angle, beta (measured from the incline surface)
    if (g.A) {
      const ropeAng = s === 1 ? p.theta + p.beta : 180 - p.theta - p.beta;
      const refEnd = polar(g.A, 95, slopeAng);
      const bArc = arcPoints(g.A, slopeAng, ropeAng, 62);
      const bLab = polar(g.A, 84, bArc.mid);
      html += '<line class="given-ref" x1="' + X(g.A) + '" y1="' + Y(g.A) + '" x2="' + X(refEnd) + '" y2="' + Y(refEnd) + '"/>';
      html += '<path class="given-arc" d="' + pathFrom(bArc.pts) + '"/>';
      html += '<text class="given-label" x="' + X(bLab) + '" y="' + Y(bLab) + '">β=' + p.beta + '°</text>';
    }

    layerStatic.innerHTML = html;
  }

  function renderDynamic() {
    const p = state.problem;
    const cfg = LEVELS[state.level];
    const everything = cfg.palette.concat(cfg.compIds || []);
    const ids = everything.filter((id) => state.drawn[id]);
    let html = '';

    if (state.phase === 'resolve') html += overlayHTML(p, cfg);

    ids.forEach((id) => {
      const spec = forceSpec(p, id);
      html += arrowHTML(id, spec.tail, state.drawn[id].angle, forceLen(p, id), state.status[id]);
    });

    if (state.phase !== 'resolve') {
      const active = state.phase === 'comps' ? cfg.compIds : cfg.palette;
      ids.filter((id) => active.includes(id)).forEach((id) => {
        const spec = forceSpec(p, id);
        html += handleHTML(id, spec.tail, state.drawn[id].angle, forceLen(p, id));
      });
    }

    layerDyn.innerHTML = html;

    if (state.focusId) {
      const h = layerDyn.querySelector('[data-handle="' + state.focusId + '"]');
      if (h) h.focus({ preventScroll: true });
    }
  }

  /* ------------------------------------------------------------------ *
   *  Problem text, chips, last-step form
   * ------------------------------------------------------------------ */
  function statementHTML(p) {
    if (p.level === 'easy') {
      return 'A ball is released on a <b>smooth</b> (frictionless) incline that makes an angle of <b>θ = ' + p.theta +
        '°</b> with the horizontal. Draw every force acting on the ball, then draw the horizontal and vertical ' +
        'components of the normal force.';
    }
    return 'A ball is held at rest on a <b>smooth</b> incline (<b>θ = ' + p.theta + '°</b>) by a rope attached to the ball. ' +
      'The rope pulls up the slope and makes an angle of <b>β = ' + p.beta + '°</b> with the incline surface. ' +
      'Draw every force acting on the ball.';
  }

  function chipButton(id, phase) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip f-' + id;
    b.dataset.force = id;
    b.dataset.phase = phase;
    b.setAttribute('aria-pressed', 'false');
    b.innerHTML = '<span class="swatch"></span><span class="sym">' + FORCES[id].html + '</span>' +
      '<span>' + FORCES[id].name + '</span><span class="status"></span>';
    return b;
  }

  function buildChips() {
    const cfg = LEVELS[state.level];
    const hostF = $('#chips');
    const hostC = $('#chips-c');
    hostF.innerHTML = '';
    hostC.innerHTML = '';
    cfg.palette.forEach((id) => hostF.appendChild(chipButton(id, 'forces')));
    (cfg.compIds || []).forEach((id) => hostC.appendChild(chipButton(id, 'comps')));
  }

  function updateChips() {
    document.querySelectorAll('.chip').forEach((b) => {
      const id = b.dataset.force;
      const st = state.status[id] || '';
      b.setAttribute('aria-pressed', state.drawn[id] ? 'true' : 'false');
      b.className = 'chip f-' + id + (st ? ' ' + st : '');
      b.disabled = state.phase !== b.dataset.phase;
      $('.status', b).textContent = st === 'ok' ? '✓' : st === 'bad' ? '✗' : st === 'missing' ? 'not drawn' : '';
    });
  }

  function buildStep2() {
    const cfg = LEVELS[state.level];
    const host = $('#components');
    host.innerHTML = '';
    cfg.resolve.forEach(({ id, ref }) => {
      const nm = FORCES[id].name;
      const card = document.createElement('div');
      card.className = 'comp-card f-' + id;
      card.dataset.force = id;
      const head = '<h3><span class="swatch"></span>' + nm + ' <span class="sym">' + id + '</span></h3>';
      if (ref === 'both') {
        card.innerHTML = head +
          angleField(id, 'angleV', 'vertical', 'the <b>?</b> between <i>' + id + '</i> and the vertical arrow') +
          angleField(id, 'angleH', 'horizontal', 'the <b>?</b> between <i>' + id + '</i> and the horizontal arrow') +
          componentRow(id, 'x', ['left', 'right'], true) +
          componentRow(id, 'y', ['up', 'down'], true);
      } else {
        card.innerHTML = head +
          angleField(id, 'angle', ref, 'the <b>?</b> in the diagram') +
          componentRow(id, 'x', ['left', 'right'], false) +
          componentRow(id, 'y', ['up', 'down'], false);
      }
      host.appendChild(card);
    });
    updateEchos();
  }

  function angleField(id, key, ref, where) {
    const cls = key === 'angleV' ? ' ang-v' : key === 'angleH' ? ' ang-h' : '';
    const dot = cls ? '<span class="swatch"></span> ' : '';
    return '<label class="field' + cls + '"><span>' + dot + 'Angle between <i>' + id + '</i> and the <b>' + ref + '</b> axis (' + where + ')</span>' +
      '<span class="inp"><input type="number" step="any" inputmode="decimal" data-k="' + key + '" ' +
      'aria-label="Angle between ' + FORCES[id].name + ' and the ' + ref + ' axis in degrees"> °</span></label>';
  }

  function componentRow(id, comp, dirs, withAxis) {
    const arrows = { left: '←', right: '→', up: '↑', down: '↓' };
    const dirOpts = dirs.map((d) => '<option value="' + d + '">' + arrows[d] + ' ' + d + '</option>').join('');
    const axisSel = withAxis
      ? '<span class="dirgrp"><span class="dir">angle from the</span>' +
        '<select data-k="' + comp + 'Axis" aria-label="Which angle the ' + id + ' ' + comp + ' component uses">' +
          '<option value="">—</option><option value="vertical">vertical</option><option value="horizontal">horizontal</option></select></span>'
      : '';
    return (
      '<div class="eq-row"><span><i>' + id + '</i><sub>' + comp + '</sub> = <i>' + id + '</i> ·</span>' +
        '<select data-k="' + comp + 'Fn" aria-label="Trig function for ' + id + ' ' + comp + '">' +
          '<option value="">—</option><option value="sin">sin</option><option value="cos">cos</option></select>' +
        '<span class="paren">(<span class="echo" data-echo="' + comp + '">angle</span>)</span>' + axisSel +
        '<span class="dirgrp"><span class="dir">points</span>' +
        '<select data-k="' + comp + 'Dir" aria-label="Direction of ' + id + ' ' + comp + ' component">' +
          '<option value="">—</option>' + dirOpts + '</select></span></div>'
    );
  }

  // Show the angle the student typed inside each equation, e.g. cos ( 40° ). Empty box -> "angle".
  function updateEchos() {
    document.querySelectorAll('.comp-card').forEach((card) => {
      const both = !!$('[data-k="angleV"]', card);
      ['x', 'y'].forEach((comp) => {
        const echo = $('[data-echo="' + comp + '"]', card);
        if (!echo) return;
        let src = null;
        if (both) {
          const axis = $('[data-k="' + comp + 'Axis"]', card).value;
          src = axis === 'vertical' ? $('[data-k="angleV"]', card) : axis === 'horizontal' ? $('[data-k="angleH"]', card) : null;
        } else {
          src = $('[data-k="angle"]', card);
        }
        const v = src ? src.value.trim() : '';
        echo.textContent = v ? v + '°' : 'angle';
        echo.classList.toggle('filled', !!v);
        echo.classList.toggle('ang-v', !!src && src === $('[data-k="angleV"]', card));
        echo.classList.toggle('ang-h', !!src && src === $('[data-k="angleH"]', card));
      });
    });
  }

  /* ------------------------------------------------------------------ *
   *  Messages
   * ------------------------------------------------------------------ */
  function setMsg(n, text, kind) {
    const el = $('#msg' + n);
    el.textContent = text || '';
    el.className = 'msg' + (kind ? ' ' + kind : '');
  }

  /* ------------------------------------------------------------------ *
   *  Flow
   * ------------------------------------------------------------------ */
  function startProblem(level) {
    resetRandom(currentSeed ? newSeed() : seed, level);
    state.problem = null;
    state.level = level;
    state.problem = makeProblem(level, state.problem);
    state.drawn = {};
    state.status = {};
    state.phase = 'forces';
    state.drag = null;
    state.focusId = null;
    state.step2Status = {};
    state.angleText = {};
    const cfg = LEVELS[level];
    const hasComps = !!cfg.compIds;

    document.querySelectorAll('.seg button').forEach((b) =>
      b.setAttribute('aria-pressed', b.dataset.level === level ? 'true' : 'false'));

    $('#statement').innerHTML = statementHTML(state.problem);
    svg.setAttribute('aria-label', 'Ball on an incline. ' + $('#statement').textContent);

    buildChips();
    buildStep2();

    // optional "draw the components" step (Easy only)
    $('#stepc').hidden = !hasComps;
    $('#stepc').classList.add('locked');
    $('#stepc-fields').disabled = true;
    $('#stepc-hint').textContent = 'Finish Step 1 to unlock this step.';
    $('#checkc').disabled = false;
    $('#showc').disabled = false;
    setMsg('c', '');

    // last step
    $('#num2').textContent = hasComps ? '3' : '2';
    $('#step2').classList.add('locked');
    $('#step2-fields').disabled = true;
    $('#step2-hint').textContent = 'Finish Step ' + (hasComps ? '2' : '1') + ' to unlock this step.';
    $('#check1').disabled = false;
    $('#show1').disabled = false;
    setMsg(1, '');
    setMsg(2, '');

    updateChips();
    renderStatic();
    renderDynamic();
  }

  function checkStep1() {
    const p = state.problem;
    const cfg = LEVELS[state.level];
    const res = {};
    let allOk = true;

    cfg.palette.forEach((id) => {
      const drawn = state.drawn[id];
      const needed = cfg.present.includes(id);
      if (needed) {
        if (!drawn) { res[id] = 'missing'; allOk = false; }
        else if (Math.abs(angDiff(drawn.angle, forceSpec(p, id).angle)) <= TOL_DIR) res[id] = 'ok';
        else { res[id] = 'bad'; allOk = false; }
      } else if (drawn) {
        res[id] = 'bad';
        allOk = false;
      }
    });

    state.status = res;
    if (allOk) {
      completeStep1('Every force is placed and aimed correctly. Step 2 is unlocked.');
    } else {
      updateChips();
      renderDynamic();
      setMsg(1, 'Not quite. Fix the forces marked ✗ or “not drawn”, then check again.', 'bad');
    }
  }

  function completeStep1(message) {
    const p = state.problem;
    const cfg = LEVELS[state.level];
    state.drawn = {};
    cfg.present.forEach((id) => { state.drawn[id] = { angle: forceSpec(p, id).angle }; });
    state.status = {};
    cfg.present.forEach((id) => { state.status[id] = 'ok'; });
    state.phase = cfg.compIds ? 'comps' : 'resolve';
    state.focusId = null;

    updateChips();
    state.status = {};            // arrows go back to their force colours
    renderDynamic();

    $('#check1').disabled = true;
    $('#show1').disabled = true;
    setMsg(1, message, 'ok');

    if (cfg.compIds) unlockComps();
    else unlockResolve();
  }

  function showAnswer1() {
    completeStep1('Answer shown. Step 2 is unlocked.');
  }

  /* ----- Easy only: draw Nx and Ny ----- */
  function unlockComps() {
    $('#stepc').classList.remove('locked');
    $('#stepc-fields').disabled = false;
    $('#stepc-hint').textContent =
      'Break N into its horizontal and vertical components. Click Nₓ and Nᵧ to add them, then drag each round handle to aim the dashed arrow. Both start at the tail of N.';
    $('#stepc').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function checkComps() {
    const p = state.problem;
    const cfg = LEVELS[state.level];
    const res = {};
    let allOk = true;

    cfg.compIds.forEach((id) => {
      const drawn = state.drawn[id];
      if (!drawn) { res[id] = 'missing'; allOk = false; }
      else if (Math.abs(angDiff(drawn.angle, forceSpec(p, id).angle)) <= TOL_DIR) res[id] = 'ok';
      else { res[id] = 'bad'; allOk = false; }
    });

    state.status = res;
    if (allOk) {
      completeComps('Both components are drawn correctly. Step 3 is unlocked.');
    } else {
      updateChips();
      renderDynamic();
      setMsg('c', 'Not quite. Fix the components marked ✗ or “not drawn”, then check again.', 'bad');
    }
  }

  function completeComps(message) {
    const p = state.problem;
    const cfg = LEVELS[state.level];
    cfg.compIds.forEach((id) => { state.drawn[id] = { angle: forceSpec(p, id).angle }; });
    state.status = {};
    cfg.compIds.forEach((id) => { state.status[id] = 'ok'; });
    state.phase = 'resolve';
    state.focusId = null;

    updateChips();
    state.status = {};
    renderDynamic();

    $('#checkc').disabled = true;
    $('#showc').disabled = true;
    setMsg('c', message, 'ok');
    unlockResolve();
  }

  function showAnswerComps() {
    completeComps('Answer shown. Step 3 is unlocked.');
  }

  /* ----- last step: angles, sin/cos, directions ----- */
  function unlockResolve() {
    const both = !!LEVELS[state.level].compIds;
    $('#step2').classList.remove('locked');
    $('#step2-fields').disabled = false;
    $('#step2-hint').textContent = both
      ? 'Use x → right and y ↑ up. Find both angles marked “?” in the diagram, one from the vertical and one from the horizontal. ' +
        'For each component, choose which angle you are using, then sin or cos, and the direction.'
      : 'Use x → right and y ↑ up. Find the angle marked “?” in the diagram, then choose sin or cos and the direction for each component.';
    const first = $('#components input');
    if (first) first.focus({ preventScroll: true });
    $('#step2').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function checkStep2() {
    const p = state.problem;
    const cfg = LEVELS[state.level];
    let allOk = true;

    cfg.resolve.forEach(({ id, ref }) => {
      const exp = expectedComponents(p, id, ref);
      const card = $('.comp-card[data-force="' + id + '"]');
      const get = (k) => $('[data-k="' + k + '"]', card);
      const num = (k) => parseFloat(get(k).value);
      const results = {};   // true = right, false = wrong, null = can't be judged yet

      if (ref === 'both') {
        results.angleV = Math.abs(num('angleV') - exp.alphaV) <= TOL_ANGLE;
        results.angleH = Math.abs(num('angleH') - exp.alphaH) <= TOL_ANGLE;
        ['x', 'y'].forEach((comp) => {
          const axis = get(comp + 'Axis').value;
          const axisOk = axis === 'vertical' || axis === 'horizontal';
          results[comp + 'Axis'] = axisOk;
          results[comp + 'Fn'] = axisOk ? get(comp + 'Fn').value === fnFor(comp, axis) : null;
          results[comp + 'Dir'] = get(comp + 'Dir').value === exp[comp + 'Dir'];
        });
        state.step2Status[id + '-v'] = results.angleV ? 'ok' : 'bad';
        state.step2Status[id + '-h'] = results.angleH ? 'ok' : 'bad';
      } else {
        results.angle = Math.abs(num('angle') - exp.alpha) <= TOL_ANGLE;
        results.xFn = get('xFn').value === exp.xFn;
        results.xDir = get('xDir').value === exp.xDir;
        results.yFn = get('yFn').value === exp.yFn;
        results.yDir = get('yDir').value === exp.yDir;
        state.step2Status[id] = results.angle ? 'ok' : 'bad';
      }

      Object.keys(results).forEach((k) => {
        const el = get(k);
        el.classList.remove('ok', 'bad');
        if (results[k] !== null) el.classList.add(results[k] ? 'ok' : 'bad');
        if (results[k] !== true) allOk = false;
      });

      Object.keys(state.step2Status).forEach((key) => {
        const label = $('#arc-label-' + key);
        if (label) label.setAttribute('class', 'arc-label ' + state.step2Status[key]);
      });
    });

    if (allOk) setMsg(2, 'All components are correct. Try a new problem or move up a level.', 'ok');
    else setMsg(2, 'Not quite. Fix the fields marked in red and check again.', 'bad');
  }

  function showAnswer2() {
    const p = state.problem;
    const cfg = LEVELS[state.level];
    cfg.resolve.forEach(({ id, ref }) => {
      const exp = expectedComponents(p, id, ref);
      const card = $('.comp-card[data-force="' + id + '"]');
      const set = (k, v) => { $('[data-k="' + k + '"]', card).value = v; };
      const setLabel = (key, v) => {
        state.angleText[key] = String(v);
        const label = $('#arc-label-' + key);
        if (label) label.textContent = v + '°';
      };
      if (ref === 'both') {
        set('angleV', exp.alphaV);
        set('angleH', exp.alphaH);
        setLabel(id + '-v', exp.alphaV);
        setLabel(id + '-h', exp.alphaH);
        set('xAxis', 'vertical');
        set('yAxis', 'vertical');
        set('xFn', fnFor('x', 'vertical'));
        set('yFn', fnFor('y', 'vertical'));
      } else {
        set('angle', exp.alpha);
        setLabel(id, exp.alpha);
        set('xFn', exp.xFn);
        set('yFn', exp.yFn);
      }
      set('xDir', exp.xDir);
      set('yDir', exp.yDir);
    });
    updateEchos();
    checkStep2();
  }

  /* ------------------------------------------------------------------ *
   *  Events
   * ------------------------------------------------------------------ */
  const activeMsg = () => (state.phase === 'comps' ? 'c' : 1);

  function clearStatusOnEdit() {
    if (Object.keys(state.status).length) {
      state.status = {};
      updateChips();
    }
    setMsg(activeMsg(), '');
  }

  function pointerToMath(e) {
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const q = pt.matrixTransform(svg.getScreenCTM().inverse());
    return { x: q.x, y: GY - q.y };
  }

  svg.addEventListener('pointerdown', (e) => {
    if (state.phase === 'resolve') return;
    const h = e.target.closest('[data-handle]');
    if (!h) return;
    e.preventDefault();
    state.drag = { id: h.dataset.handle };
    state.focusId = null;
    try { svg.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
  });

  svg.addEventListener('pointermove', (e) => {
    if (!state.drag) return;
    const id = state.drag.id;
    const tail = forceSpec(state.problem, id).tail;
    const m = pointerToMath(e);
    const raw = deg(Math.atan2(m.y - tail.y, m.x - tail.x));
    const snapped = norm360(Math.round(raw / SNAP) * SNAP);
    // keep the handle inside the visible diagram so it can always be grabbed again
    const tip = polar(tail, forceLen(state.problem, id), snapped);
    const x0 = state.problem.s === 1 ? 0 : VB_W - VIEW_W;
    const M = 22;
    if (tip.x < x0 + M || tip.x > x0 + VIEW_W - M || GY - tip.y < M || GY - tip.y > VB_H - M) return;
    if (state.drawn[id] && state.drawn[id].angle !== snapped) {
      state.drawn[id].angle = snapped;
      clearStatusOnEdit();
      renderDynamic();
    }
  });

  const endDrag = (e) => {
    if (!state.drag) return;
    state.drag = null;
    try { svg.releasePointerCapture(e.pointerId); } catch (err) { /* ignore */ }
  };
  svg.addEventListener('pointerup', endDrag);
  svg.addEventListener('pointercancel', endDrag);

  svg.addEventListener('keydown', (e) => {
    if (state.phase === 'resolve') return;
    const h = e.target.closest('[data-handle]');
    if (!h) return;
    const id = h.dataset.handle;
    let step = 0;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') step = SNAP;      // counter-clockwise
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') step = -SNAP;      // clockwise
    if (!step) return;
    e.preventDefault();
    const next = norm360(state.drawn[id].angle + step);
    const tip = polar(forceSpec(state.problem, id).tail, forceLen(state.problem, id), next);
    const x0 = state.problem.s === 1 ? 0 : VB_W - VIEW_W;
    const M = 22;
    if (tip.x < x0 + M || tip.x > x0 + VIEW_W - M || GY - tip.y < M || GY - tip.y > VB_H - M) {
      state.focusId = id;
      return;
    }
    state.drawn[id].angle = next;
    state.focusId = id;
    clearStatusOnEdit();
    renderDynamic();
  });

  function onChipClick(e) {
    const b = e.target.closest('.chip');
    if (!b || b.dataset.phase !== state.phase) return;
    const id = b.dataset.force;
    const sideways = state.problem.s === 1 ? 0 : 180;
    if (state.drawn[id]) delete state.drawn[id];
    // A new arrow starts pointing the wrong way, never at a correct answer.
    // Nx starts pointing down and Ny sideways, so the two handles do not sit on top of each other.
    else state.drawn[id] = { angle: id === 'Nx' ? 270 : sideways };
    state.status = {};
    state.focusId = null;
    setMsg(activeMsg(), '');
    updateChips();
    renderDynamic();
  }
  $('#chips').addEventListener('click', onChipClick);
  $('#chips-c').addEventListener('click', onChipClick);

  $('#check1').addEventListener('click', () => { checkStep1(); submit("forces"); });
  $('#show1').addEventListener('click', showAnswer1);
  $('#checkc').addEventListener('click', () => { checkComps(); submit("components"); });
  $('#showc').addEventListener('click', showAnswerComps);
  $('#check2').addEventListener('click', () => { checkStep2(); submit("resolve"); });
  $('#show2').addEventListener('click', showAnswer2);

  function onComponentsEdit(e) {
    const el = e.target;
    el.classList.remove('ok', 'bad');
    const k = el.dataset.k;
    if (k === 'angle' || k === 'angleV' || k === 'angleH') {
      const id = el.closest('.comp-card').dataset.force;
      const key = k === 'angleV' ? id + '-v' : k === 'angleH' ? id + '-h' : id;
      const v = el.value.trim();
      state.angleText[key] = v;
      const label = $('#arc-label-' + key);
      if (label) {
        label.textContent = v ? v + '°' : '?';
        label.setAttribute('class', 'arc-label');
      }
      delete state.step2Status[key];
    }
    updateEchos();
    setMsg(2, '');
  }
  $('#components').addEventListener('input', onComponentsEdit);
  $('#components').addEventListener('change', onComponentsEdit);

  document.querySelectorAll('.seg button').forEach((b) =>
    b.addEventListener('click', () => startProblem(b.dataset.level)));
  $('#new-problem').addEventListener('click', () => startProblem(state.level));

  /* ---------- light / dark theme ---------- */
  const themeBtn = $('#theme-toggle');
  function applyTheme(t, save) {
    document.documentElement.setAttribute('data-theme', t);
    themeBtn.textContent = t === 'dark' ? '☀ Light mode' : '☾ Dark mode';
    themeBtn.setAttribute('aria-label', t === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    if (save) { try { localStorage.setItem('fbd-theme', t); } catch (e) { /* storage unavailable */ } }
  }
  themeBtn.addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    applyTheme(cur === 'dark' ? 'light' : 'dark', true);
  });
  applyTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light', false);

  startProblem(initialLevel);

}
