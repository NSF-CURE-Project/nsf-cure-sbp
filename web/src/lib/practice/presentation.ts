const fixedNumericSources = new Set([
  "lawOfSines1",
  "equilibriumOfAParticle",
  "momentOfACouple",
  "truss4",
  "momentOfInertia1",
  "momentOfInertia2",
  "momentOfInertia3",
  "trigReview7",
  "trigReview9",
]);

export function hasNumericVariants(problem: {
  source: string;
  parts?: { name: string; fixed?: number }[];
}) {
  return Boolean(
    problem.parts?.some((part) => part.fixed == null) &&
      !fixedNumericSources.has(problem.source.split("/").at(-1) ?? ""),
  );
}
