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
  /* Free Body Diagram practice: weight hanging from cables
 *
 * Easy / Medium : a bar hangs from the ceiling by two cables.
 * Hard          : a knot is held by a vertical cable (to the ceiling) and two cables (to the floor).
 *
 * Step 1  Students pick which forces act on the object and aim each arrow.
 * Step 2  (Easy only) Students draw the horizontal and vertical components of the left
 *         cable's tension, T1x and T1y, as dashed arrows starting at the tail of T1.
 * Step 3  (Step 2 on Medium and Hard) Students find the angle between a cable force and a
 *         reference axis, choose sin or cos for each component, and pick component directions.
 *         On Easy the tension gets BOTH angles (from the vertical and from the horizontal)
 *         and each component row lets the student choose which angle it uses.
 *
 * Geometry is kept in "math" coordinates (x right, y up) and converted to SVG
 * screen coordinates only when drawing.
 */

  'use strict';

  /* ------------------------------------------------------------------ *
   *  Constants
   * ------------------------------------------------------------------ */
  const VB_W = 700;
  const VB_H = 380;
  const GY = 380;          // screen y of math y = 0
  const CEIL_Y = 350;      // underside of the ceiling (math y)
  const FLOOR_Y = 40;      // top of the floor (math y), hard level only
  const CX = 350;          // horizontal centre of the scene
  const BAR_W = 160;
  const BAR_H = 44;
  const ATT = 60;          // cables attach this far either side of the bar's centre
  const TOL_DIR = 7;       // degrees of tolerance on an arrow's direction
  const TOL_ANGLE = 0.5;   // degrees of tolerance on the typed component angle
  const SNAP = 5;          // arrows snap to 5 degree steps while dragging
  const ALPHAS = [30, 35, 40, 45, 50, 55, 60, 65];   // cable angle from the horizontal

  const FORCES = {
    W:  { label: 'W',  len: 90 },
    N:  { label: 'N',  len: 90 },
    T1: { label: 'T₁', len: 90 },
    T2: { label: 'T₂', len: 90 },
    T3: { label: 'T₃', len: 90 },
    // components of the left cable's tension (Easy only); length follows the real component
    T1x: { label: 'T₁', html: 'T<sub>1x</sub>', svg: 'T<tspan class="sub" dy="6">1x</tspan>', len: 90, comp: true },
    T1y: { label: 'T₁', html: 'T<sub>1y</sub>', svg: 'T<tspan class="sub" dy="6">1y</tspan>', len: 90, comp: true },
  };
  const lblHtml = (id) => FORCES[id].html || FORCES[id].label;
  const lblSvg = (id) => FORCES[id].svg || FORCES[id].label;

  // scene    : which picture is drawn
  // palette  : forces the student may add (anything not in `present` is a distractor)
  // present  : forces that really act in the problem
  // compIds  : (Easy only) component arrows drawn in the extra step
  // defaults : direction a newly added arrow starts in (never a correct answer)
  const LEVELS = {
    easy: {
      scene: 'bar',
      palette: ['W', 'T1', 'T2'],
      present: ['W', 'T1', 'T2'],
      compIds: ['T1x', 'T1y'],
      names: { W: 'Weight of the bar', T1: 'Tension in left cable', T2: 'Tension in right cable',
               T1x: 'Horizontal component of T₁', T1y: 'Vertical component of T₁' },
      defaults: { W: 0, T1: 180, T2: 0 },
    },
    medium: {
      scene: 'bar',
      palette: ['W', 'T1', 'T2', 'N'],
      present: ['W', 'T1', 'T2'],
      names: { W: 'Weight of the bar', T1: 'Tension in left cable', T2: 'Tension in right cable', N: 'Normal force' },
      defaults: { W: 0, T1: 180, T2: 0, N: 180 },
    },
    hard: {
      scene: 'knot',
      palette: ['W', 'T1', 'T2', 'T3'],
      present: ['T1', 'T2', 'T3'],
      names: { W: 'Weight of the knot', T1: 'Tension in vertical cable', T2: 'Tension in left cable', T3: 'Tension in right cable' },
      defaults: { W: 315, T1: 0, T2: 180, T3: 270 },
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
    drawn: {},        // { T1: { angle } }  arrows the student has placed
    status: {},       // { T1: 'ok' | 'bad' | 'missing' } after a check
    phase: 'forces',  // 'forces' -> ('comps' on Easy) -> 'resolve'
    drag: null,
    focusId: null,
    step2Status: {},  // arc-label status, keyed 'T1' or (Easy) 'T1-v' / 'T1-h'
    angleText: {},
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
  // Each cable's angle is given either from the ceiling/floor ('h') or from the vertical ('v').
  function makeProblem(level, prev) {
    let p;
    let tries = 0;
    do {
      p = { level, scene: LEVELS[level].scene };
      // Easy shows two extra angle labels next to T1, so keep the cables shallower there or they crowd the ceiling.
      p.aL = pick(level === 'easy' ? ALPHAS.filter((a) => a <= 55) : ALPHAS);   // left cable, angle from the horizontal
      if (level === 'easy') {
        p.aR = p.aL;                                         // symmetric
        p.convL = 'h';
        p.convR = 'h';
      } else {
        do { p.aR = pick(ALPHAS); } while (p.aR === p.aL);   // right cable, angle from the horizontal
        if (random() < 0.5) { p.convL = 'h'; p.convR = 'v'; }
        else { p.convL = 'v'; p.convR = 'h'; }
      }
      tries++;
    } while (
      prev && prev.level === level && prev.aL === p.aL && prev.aR === p.aR &&
      prev.convL === p.convL && tries < 25
    );
    p.geo = computeGeometry(p);
    p.resolve = resolveList(p);
    return p;
  }

  // Which forces Step 2 asks about, and the axis each angle is measured from.
  function resolveList(p) {
    if (p.level === 'easy') return [{ id: 'T1', ref: 'both' }];
    if (p.level === 'medium') return [{ id: 'T1', ref: 'horizontal' }, { id: 'T2', ref: 'horizontal' }];
    const opposite = (c) => (c === 'h' ? 'vertical' : 'horizontal');   // hard: both need converting
    return [{ id: 'T2', ref: opposite(p.convL) }, { id: 'T3', ref: opposite(p.convR) }];
  }

  function computeGeometry(p) {
    const tL = Math.tan(rad(p.aL));
    const tR = Math.tan(rad(p.aR));

    if (p.scene === 'bar') {
      const AxL = CX - ATT;
      const AxR = CX + ATT;
      // Height of the cables, limited so both ceiling anchors stay inside the picture.
      const rise = Math.max(100, Math.min(150, (AxL - 60) * tL, (640 - AxR) * tR));
      const top = CEIL_Y - rise;
      return {
        AL: { x: AxL, y: top },
        AR: { x: AxR, y: top },
        PL: { x: AxL - rise / tL, y: CEIL_Y },
        PR: { x: AxR + rise / tR, y: CEIL_Y },
        C: { x: CX, y: top - BAR_H / 2 },
        Bot: { x: CX, y: top - BAR_H },
        top,
      };
    }

    const h = Math.min(170, 280 * tL, 280 * tR);             // drop from the knot to the floor
    return {
      K: { x: CX, y: FLOOR_Y + h },
      FL: { x: CX - h / tL, y: FLOOR_Y },
      FR: { x: CX + h / tR, y: FLOOR_Y },
      CE: { x: CX, y: CEIL_Y },
    };
  }

  // Tail position and (for forces that act) the correct direction of each force.
  // Cable tensions pull the object toward the cable, so they point along the cable, away from the object.
  function forceSpec(p, id) {
    const g = p.geo;
    if (p.scene === 'bar') {
      switch (id) {
        case 'W': return { tail: g.C, angle: 270 };
        case 'N': return { tail: g.Bot, angle: null };
        case 'T1': return { tail: g.AL, angle: 180 - p.aL };
        case 'T2': return { tail: g.AR, angle: p.aR };
        // components of the left cable's tension start at the tail of T1
        case 'T1x': return { tail: g.AL, angle: 180 };
        case 'T1y': return { tail: g.AL, angle: 90 };
        default: return null;
      }
    }
    switch (id) {
      case 'W': return { tail: g.K, angle: null };
      case 'T1': return { tail: g.K, angle: 90 };
      case 'T2': return { tail: g.K, angle: 180 + p.aL };
      case 'T3': return { tail: g.K, angle: 360 - p.aR };
      default: return null;
    }
  }

  // Drawn length of an arrow. Component arrows are scaled to the real components of T1.
  function forceLen(p, id) {
    if (id === 'T1x') return FORCES.T1.len * Math.cos(rad(p.aL));
    if (id === 'T1y') return FORCES.T1.len * Math.sin(rad(p.aL));
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
    let lab = { x: tp.x + 25 * c, y: tp.y + 25 * s };
    const dashed = FORCES[id].comp ? ' dashed' : '';
    if (id.charAt(0) === 'T' && !FORCES[id].comp) {
      // Cable tensions run along a drawn cable, so put the label beside the tip, on the outer side.
      const sgn = tp.x - CX >= -0.5 ? 1 : -1;
      const perp = (-s) * sgn > 0 ? { x: -s, y: c } : { x: s, y: -c };
      lab = { x: tp.x + 8 * c + 21 * perp.x, y: tp.y + 8 * s + 21 * perp.y };
    }
    return (
      '<g class="arrow f-' + id + dashed + ' ' + (status || '') + '">' +
        '<line x1="' + X(tail) + '" y1="' + Y(tail) + '" x2="' + X(b) + '" y2="' + Y(b) + '"/>' +
        '<polygon points="' + PT(tp) + ' ' + PT(l) + ' ' + PT(r) + '"/>' +
        '<circle class="tail-dot" cx="' + X(tail) + '" cy="' + Y(tail) + '" r="3.5"/>' +
        '<text class="f-label" x="' + X(lab) + '" y="' + Y(lab) + '">' + lblSvg(id) + '</text>' +
      '</g>'
    );
  }

  function handleHTML(id, tail, angle, len) {
    const tp = polar(tail, len, angle);
    return (
      '<g class="handle f-' + id + '" data-handle="' + id + '" tabindex="0" role="button"' +
        ' aria-label="Aim the ' + LEVELS[state.level].names[id].toLowerCase() + ' arrow. Use the arrow keys to rotate it.">' +
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

  function overlayHTML(p) {
    let html = '';
    p.resolve.forEach(({ id, ref }) => {
      const spec = forceSpec(p, id);
      const dx = Math.cos(rad(spec.angle));
      const dy = Math.sin(rad(spec.angle));

      if (ref === 'both') {
        // two arcs next to the force: one from the vertical, one from the horizontal.
        // The dashed Tx / Ty arrows already mark the two axes, so no extra axis lines are drawn.
        // Each arc gets its own colour (blue = from the vertical, amber = from the horizontal)
        // so students can tell the two angles apart.
        const arcs = [
          { key: id + '-v', cls: 'ang-v', psi: dy >= 0 ? 90 : 270, r: 40 },
          { key: id + '-h', cls: 'ang-h', psi: dx >= 0 ? 0 : 180, r: 40 },
        ];
        html += '<g class="f-' + id + '">';
        arcs.forEach(({ key, cls, psi, r }) => {
          const arc = arcPoints(spec.tail, psi, spec.angle, r);
          const gap = angDiff(spec.angle, psi);
          let pos;
          if (Math.abs(gap) >= 40) {
            pos = polar(spec.tail, r + 24, arc.mid);                       // wide wedge: label just outside the arc
          } else if (psi === 0 || psi === 180) {
            // narrow wedge next to the horizontal: label sits inside the wedge, between the tension
            // arrow and the horizontal component, just past the arc
            pos = polar(spec.tail, 68, arc.mid);
          } else {
            pos = polar(spec.tail, 96, arc.mid);                           // narrow wedge next to the vertical
          }
          html += '<g class="' + cls + '"><path class="arc" d="' + pathFrom(arc.pts) + '"/>' +
            arcLabelHTML(key, pos, state.step2Status[key]) + '</g>';
        });
        html += '</g>';
        return;
      }

      const vertical = ref === 'vertical';
      const psi = vertical ? (dy >= 0 ? 90 : 270) : (dx >= 0 ? 0 : 180);   // reference axis direction
      const radius = 38;
      const arc = arcPoints(spec.tail, psi, spec.angle, radius);
      const axisEnd = polar(spec.tail, 95, psi);
      html +=
        '<g class="f-' + id + '">' +
          '<line class="axis-line" x1="' + X(spec.tail) + '" y1="' + Y(spec.tail) + '" x2="' + X(axisEnd) + '" y2="' + Y(axisEnd) + '"/>' +
          '<path class="arc" d="' + pathFrom(arc.pts) + '"/>' +
          arcLabelHTML(id, polar(spec.tail, radius + 24, arc.mid), state.step2Status[id]) +
        '</g>';
    });
    return html;
  }

  const cableLine = (from, to, id) =>
    '<line class="cable" data-force="' + id + '" x1="' + X(from) + '" y1="' + Y(from) +
    '" x2="' + X(to) + '" y2="' + Y(to) + '"/>';

  const anchorDot = (pt, r) => '<circle class="anchor" cx="' + X(pt) + '" cy="' + Y(pt) + '" r="' + r + '"/>';

  // The angle printed on the diagram where a cable meets the ceiling or floor.
  //   cableAng : direction from the anchor along the cable, toward the object
  //   horizAng : direction from the anchor along the ceiling/floor, toward the object's side
  //   vertAng  : direction from the anchor straight toward the object's side (up or down)
  function givenAngle(anchor, cableAng, conv, horizAng, vertAng, value) {
    const ref = conv === 'h' ? horizAng : vertAng;
    const arc = arcPoints(anchor, ref, cableAng, 54);
    const delta = angDiff(cableAng, ref);
    // Label sits inside the wedge, just above the curved line. A narrow wedge (small angle) needs a longer
    // radius so the text fits between the two lines.
    const wedge = Math.abs(delta);
    const r = conv === 'v' ? Math.min(112, Math.max(80, 56 / (2 * Math.sin(rad(wedge) / 2)))) : 82;
    const lab = polar(anchor, r, arc.mid);
    let html = '';
    if (conv === 'v') {
      const e = polar(anchor, 105, vertAng);
      html += '<line class="given-ref" x1="' + X(anchor) + '" y1="' + Y(anchor) + '" x2="' + X(e) + '" y2="' + Y(e) + '"/>';
    }
    html += '<path class="given-arc" d="' + pathFrom(arc.pts) + '"/>';
    html += '<text class="given-label" style="paint-order:stroke;stroke:var(--surface);stroke-width:4px;stroke-linejoin:round" data-given="' + conv + ':' + value + '" x="' + X(lab) + '" y="' + Y(lab) + '">' +
      (conv === 'h' ? 'α' : 'φ') + '=' + value + '°</text>';
    return html;
  }

  const givenValue = (p, side) => {
    const conv = side === 'L' ? p.convL : p.convR;
    const a = side === 'L' ? p.aL : p.aR;
    return conv === 'h' ? a : 90 - a;
  };

  function renderStatic() {
    const p = state.problem;
    const g = p.geo;
    const ceilScreen = GY - CEIL_Y;
    let html = '';

    html += '<rect x="0" y="0" width="' + VB_W + '" height="' + ceilScreen + '" fill="url(#hatch)"/>';
    html += '<line class="ceiling-line" x1="10" y1="' + ceilScreen + '" x2="' + (VB_W - 10) + '" y2="' + ceilScreen + '"/>';

    if (p.scene === 'bar') {
      html += cableLine(g.AL, g.PL, 'T1') + cableLine(g.AR, g.PR, 'T2');
      html += '<rect class="bar" x="' + (CX - BAR_W / 2) + '" y="' + (GY - g.top).toFixed(1) +
        '" width="' + BAR_W + '" height="' + BAR_H + '" rx="6"/>';
      html += anchorDot(g.PL, 5) + anchorDot(g.PR, 5) + anchorDot(g.AL, 4.5) + anchorDot(g.AR, 4.5);
      html += givenAngle(g.PL, -p.aL, p.convL, 0, -90, givenValue(p, 'L'));
      html += givenAngle(g.PR, 180 + p.aR, p.convR, 180, -90, givenValue(p, 'R'));
    } else {
      const floorScreen = GY - FLOOR_Y;
      html += '<rect x="0" y="' + floorScreen + '" width="' + VB_W + '" height="' + (VB_H - floorScreen) + '" fill="url(#hatch)"/>';
      html += '<line class="ground-line" x1="10" y1="' + floorScreen + '" x2="' + (VB_W - 10) + '" y2="' + floorScreen + '"/>';
      html += cableLine(g.K, g.CE, 'T1') + cableLine(g.K, g.FL, 'T2') + cableLine(g.K, g.FR, 'T3');
      html += anchorDot(g.CE, 5) + anchorDot(g.FL, 5) + anchorDot(g.FR, 5);
      html += '<circle class="knot" cx="' + X(g.K) + '" cy="' + Y(g.K) + '" r="11"/>';
      html += givenAngle(g.FL, p.aL, p.convL, 0, 90, givenValue(p, 'L'));
      html += givenAngle(g.FR, 180 - p.aR, p.convR, 180, 90, givenValue(p, 'R'));
    }

    layerStatic.innerHTML = html;
  }

  function renderDynamic() {
    const p = state.problem;
    const cfg = LEVELS[state.level];
    const ids = cfg.palette.concat(cfg.compIds || []).filter((id) => state.drawn[id]);
    let html = '';

    if (state.phase === 'resolve') html += overlayHTML(p);

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
   *  Problem text, chips, Step 2 form
   * ------------------------------------------------------------------ */
  function statementHTML(p) {
    if (p.level === 'easy') {
      return 'A uniform bar is hung from the ceiling by two cables. Each cable makes an angle of <b>α = ' + p.aL +
        '°</b> with the ceiling. Draw every force acting on the bar, then draw the horizontal and vertical ' +
        'components of the tension in the left cable.';
    }
    const side = (word, conv, a, where, cap) =>
      (cap ? 'The ' : 'the ') + word + ' cable makes an angle of <b>' + (conv === 'h' ? 'α = ' + a : 'φ = ' + (90 - a)) + '°</b> with the ' +
      (conv === 'h' ? where : 'vertical');
    if (p.level === 'medium') {
      return 'A bar is hung from the ceiling by two cables: ' + side('left', p.convL, p.aL, 'ceiling') + ', and ' +
        side('right', p.convR, p.aR, 'ceiling') + '. Draw every force acting on the bar.';
    }
    return 'A knot is held at rest by three cables: one vertical cable fixed to the ceiling and two cables anchored to the floor. ' +
      side('left', p.convL, p.aL, 'floor', true) + ', and ' + side('right', p.convR, p.aR, 'floor') + '. ' +
      'Neglect the weight of the knot. Draw every force acting on the knot.';
  }

  function chipButton(id, phase) {
    const cfg = LEVELS[state.level];
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip f-' + id;
    b.dataset.force = id;
    b.dataset.phase = phase;
    b.setAttribute('aria-pressed', 'false');
    b.innerHTML = '<span class="swatch"></span><span class="sym">' + lblHtml(id) + '</span>' +
      '<span>' + cfg.names[id] + '</span><span class="status"></span>';
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
    const p = state.problem;
    const cfg = LEVELS[state.level];
    const host = $('#components');
    host.innerHTML = '';
    p.resolve.forEach(({ id, ref }) => {
      const nm = cfg.names[id];
      const lab = FORCES[id].label;
      const card = document.createElement('div');
      card.className = 'comp-card f-' + id;
      card.dataset.force = id;
      const head = '<h3><span class="swatch"></span>' + nm + ' <span class="sym">' + lab + '</span></h3>';
      if (ref === 'both') {
        card.innerHTML = head +
          angleField(id, lab, nm, 'angleV', 'vertical', 'the <b>?</b> between <i>' + lab + '</i> and the vertical arrow') +
          angleField(id, lab, nm, 'angleH', 'horizontal', 'the <b>?</b> between <i>' + lab + '</i> and the horizontal arrow') +
          componentRow(lab, 'x', ['left', 'right'], true) +
          componentRow(lab, 'y', ['up', 'down'], true);
      } else {
        card.innerHTML = head +
          angleField(id, lab, nm, 'angle', ref, 'the <b>?</b> in the diagram') +
          componentRow(lab, 'x', ['left', 'right'], false) +
          componentRow(lab, 'y', ['up', 'down'], false);
      }
      host.appendChild(card);
    });
    updateEchos();
  }

  function angleField(id, lab, nm, key, ref, where) {
    const cls = key === 'angleV' ? ' ang-v' : key === 'angleH' ? ' ang-h' : '';
    const dot = cls ? '<span class="swatch"></span> ' : '';
    return '<label class="field' + cls + '"><span>' + dot + 'Angle between <i>' + lab + '</i> and the <b>' + ref + '</b> axis (' + where + ')</span>' +
      '<span class="inp"><input type="number" step="any" inputmode="decimal" data-k="' + key + '" ' +
      'aria-label="Angle between ' + nm + ' and the ' + ref + ' axis in degrees"> °</span></label>';
  }

  function componentRow(lab, comp, dirs, withAxis) {
    const arrows = { left: '←', right: '→', up: '↑', down: '↓' };
    const dirOpts = dirs.map((d) => '<option value="' + d + '">' + arrows[d] + ' ' + d + '</option>').join('');
    const axisSel = withAxis
      ? '<span class="dirgrp"><span class="dir">angle from the</span>' +
        '<select data-k="' + comp + 'Axis" aria-label="Which angle the ' + lab + ' ' + comp + ' component uses">' +
          '<option value="">—</option><option value="vertical">vertical</option><option value="horizontal">horizontal</option></select></span>'
      : '';
    return (
      '<div class="eq-row"><span><i>' + lab + '</i><sub>' + comp + '</sub> = <i>' + lab + '</i> ·</span>' +
        '<select data-k="' + comp + 'Fn" aria-label="Trig function for ' + lab + ' ' + comp + '">' +
          '<option value="">—</option><option value="sin">sin</option><option value="cos">cos</option></select>' +
        '<span class="paren">(<span class="echo" data-echo="' + comp + '">angle</span>)</span>' + axisSel +
        '<span class="dirgrp"><span class="dir">points</span>' +
        '<select data-k="' + comp + 'Dir" aria-label="Direction of ' + lab + ' ' + comp + ' component">' +
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
        echo.classList.toggle('ang-v', src === $('[data-k="angleV"]', card) && !!src);
        echo.classList.toggle('ang-h', src === $('[data-k="angleH"]', card) && !!src);
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
    svg.setAttribute('aria-label', 'Weight hanging from cables. ' + $('#statement').textContent);

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

  /* ----- Easy only: draw T1x and T1y ----- */
  function unlockComps() {
    $('#stepc').classList.remove('locked');
    $('#stepc-fields').disabled = false;
    $('#stepc-hint').textContent =
      'Break the tension in the left cable (T\u2081) into its horizontal and vertical components. Click each component to add its dashed arrow, then drag the round handle to aim it. Both start at the tail of T\u2081.';
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
    let allOk = true;

    p.resolve.forEach(({ id, ref }) => {
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
    p.resolve.forEach(({ id, ref }) => {
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

  // keep an arrow's handle inside the visible diagram so it can always be grabbed again
  function tipInView(id, angle) {
    const tip = polar(forceSpec(state.problem, id).tail, forceLen(state.problem, id), angle);
    const M = 22;
    return !(tip.x < M || tip.x > VB_W - M || GY - tip.y < M || GY - tip.y > VB_H - M);
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
    if (!tipInView(id, snapped)) return;
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
    state.focusId = id;
    const next = norm360(state.drawn[id].angle + step);
    if (!tipInView(id, next)) return;
    state.drawn[id].angle = next;
    clearStatusOnEdit();
    renderDynamic();
  });

  function onChipClick(e) {
    const b = e.target.closest('.chip');
    if (!b || b.dataset.phase !== state.phase) return;
    const id = b.dataset.force;
    if (state.drawn[id]) delete state.drawn[id];
    // A new arrow starts pointing the wrong way, never at a correct answer, and spread out so handles don't overlap.
    // T1x starts pointing down and T1y to the right (the correct ones are left and up).
    else if (id === 'T1x') state.drawn[id] = { angle: 270 };
    else if (id === 'T1y') state.drawn[id] = { angle: 0 };
    else state.drawn[id] = { angle: LEVELS[state.level].defaults[id] };
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
