type SymbolicVariable = {
  variable: string
  testMin: number
  testMax: number
}

const hashSeed = (value: string): number => {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0
  }
  return hash || 1
}

const lcg = (seed: number) => {
  let state = seed >>> 0
  return () => {
    state = (1664525 * state + 1013904223) >>> 0
    return state / 0x100000000
  }
}

const normalizeVariables = (variables: SymbolicVariable[]) =>
  variables.filter(
    (variable) =>
      typeof variable.variable === 'string' &&
      variable.variable.trim() &&
      Number.isFinite(variable.testMin) &&
      Number.isFinite(variable.testMax),
  )

export async function gradeSymbolic(
  studentExpr: string,
  correctExpr: string,
  variables: SymbolicVariable[],
  tolerance: number,
  numTestPoints = 5,
  seed = 'symbolic-default',
): Promise<boolean> {
  if (!studentExpr?.trim() || !correctExpr?.trim()) return false
  const usableVariables = normalizeVariables(variables)
  if (!usableVariables.length) return false

  const { evaluate } = await import('mathjs')
  const random = lcg(hashSeed(seed))
  let validPointCount = 0

  for (let index = 0; index < numTestPoints; index += 1) {
    const scope: Record<string, number> = {}
    for (const variable of usableVariables) {
      const min = Math.min(variable.testMin, variable.testMax)
      const max = Math.max(variable.testMin, variable.testMax)
      scope[variable.variable] = min + random() * (max - min)
    }

    try {
      const studentValue = Number(evaluate(studentExpr, scope))
      const correctValue = Number(evaluate(correctExpr, scope))
      if (!Number.isFinite(studentValue) || !Number.isFinite(correctValue)) continue
      validPointCount += 1
      if (Math.abs(studentValue - correctValue) > Math.abs(tolerance)) {
        return false
      }
    } catch {
      continue
    }
  }

  return validPointCount > 0
}

