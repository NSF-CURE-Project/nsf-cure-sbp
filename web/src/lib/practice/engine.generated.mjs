import { createHash } from "node:crypto";
import { round } from "mathjs";
import generators from "./generators.generated.mjs";

const ownValue = (value, key) =>
  value != null && Object.prototype.hasOwnProperty.call(value, key)
    ? value[key]
    : undefined;

export function generateNumeric(problemId, parts, seed) {
  const bytes = createHash("sha256").update(problemId).update(seed).digest();
  let state = bytes.readUInt32LE();
  const sample = () => {
    let next = (state = (state + 0x6d2b79f5) | 0);
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
  const math = {
    round,
    randomInt: (min, max) => min + Math.floor(sample() * (max - min)),
    pickRandom: (items) => items[Math.floor(sample() * items.length)],
  };
  for (let retry = 0; retry < 32; retry += 1) {
    const data = generators[problemId]?.(math, ownValue) ?? { params: {}, correct_answers: {} };
    const values = parts.map((part) => part.fixed ?? data.correct_answers[part.name]);
    if (values.every(Number.isFinite)) return { data, values };
  }
  throw new Error("Could not generate a finite answer for every part");
}

const decimal = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;

export function parseResponse(input) {
  const terms = input.trim().split("/").map((term) => term.trim());
  if (terms.length > 2 || !terms.every((term) => decimal.test(term))) return null;
  const value = Number(terms[0]) / (terms.length === 2 ? Number(terms[1]) : 1);
  return Number.isFinite(value) ? value : null;
}

export function matchesSignificantFigures(input, expected, digits) {
  const exponent = expected === 0 ? 0 : Math.floor(Math.log10(Math.abs(expected)));
  const tolerance = 0.51 * 10 ** (exponent - digits + 1);
  return input > expected - tolerance && input < expected + tolerance;
}
