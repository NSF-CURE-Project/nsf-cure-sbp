import DOMPurify from "isomorphic-dompurify";
import katex from "katex";
import catalog from "./catalog.generated.json";
import { generateNumeric } from "./engine.generated.mjs";
import { resolvePracticeId } from "./slugs";
export { matchesSignificantFigures, parseResponse } from "./engine.generated.mjs";
export {
  getPracticeSlug,
  isPracticeHashId,
  practicePath,
  resolvePracticeId,
} from "./slugs";

export const practiceEnabled = () =>
  process.env.ENABLE_PRACTICE_LIBRARY === "true" || process.env.NODE_ENV === "development";

export const problems = catalog.problems;

export const getProblem = (idOrSlug: string) => {
  const id = resolvePracticeId(idOrSlug) ?? idOrSlug;
  return problems.find((problem) => problem.id === id);
};

export function prepareSimulation(source: string) {
  const bridge = `<style>
    html { color-scheme: light; }
    body { margin: 0; min-height: 0 !important; background: white !important; }
    header h1, body > h1 { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
    input, button, select { font: inherit; }
  </style><script>
    (() => {
      const report = () => parent.postMessage({
        type: "sbp-practice-size",
        height: document.body.getBoundingClientRect().height
      }, "*");
      const observer = new ResizeObserver(report);
      observer.observe(document.body);
      requestAnimationFrame(report);
    })();
  </script>`;
  return source.replace(/<\/body>/i, () => bridge + "</body>");
}

type Parameters = Record<string, string | number>;
type Generated = { params: Parameters; correct_answers: Record<string, number> };

const ownValue = (value: object | null, key: PropertyKey) =>
  value != null && Object.prototype.hasOwnProperty.call(value, key)
    ? (value as Record<PropertyKey, unknown>)[key]
    : undefined;

export function instantiate(problem: NonNullable<ReturnType<typeof getProblem>>, seed: string) {
  if (!problem.parts) throw new Error("Expected a numeric practice problem");
  return generateNumeric(problem.id, problem.parts, seed) as { data: Generated; values: number[] };
}

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char]!);

export function renderPracticeHtml(template: string, data: Generated, plainText = false) {
  const substituted = (plainText ? escapeHtml(template) : template).replace(/\{\{\s*(params|correct_answers)\.(\w+)\s*\}\}/g, (_, group: keyof Generated, key: string) =>
    escapeHtml(String(ownValue(data[group], key) ?? ""))
  );
  const fragment = DOMPurify.sanitize(substituted, {
    ALLOWED_TAGS: ["p", "div", "span", "strong", "em", "b", "i", "br", "ul", "ol", "li", "img", "details", "summary", "sub", "sup", "h2", "h3", "hr"],
    ALLOWED_ATTR: ["src", "alt", "data-practice-part"],
    ALLOW_DATA_ATTR: false,
    ADD_URI_SAFE_ATTR: ["data-practice-part"],
    ALLOWED_URI_REGEXP: /^\/practice-diagrams\/[a-f0-9]{20}\.png$/,
    RETURN_DOM_FRAGMENT: true,
  });
  const document = fragment.ownerDocument;
  const walker = document.createTreeWalker(fragment, 4); // SHOW_TEXT
  const nodes: Text[] = [];
  for (let node = walker.nextNode(); node; node = walker.nextNode()) nodes.push(node as Text);
  for (const node of nodes) {
    if (!node.data.includes("$")) continue;
    const html = escapeHtml(node.data).replace(/\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$/g, (_, display, inline) =>
      katex.renderToString((display ?? inline).replace(/&(?:amp|lt|gt|quot|#39);/g, (entity: string) => ({
        "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'",
      })[entity]!), { displayMode: display != null, throwOnError: false, trust: false })
    );
    const content = document.createElement("template");
    content.innerHTML = html;
    node.replaceWith(content.content);
  }
  const wrapper = document.createElement("div");
  wrapper.append(fragment);
  return wrapper.innerHTML;
}

