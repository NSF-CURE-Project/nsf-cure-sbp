import { evaluate, parse } from 'mathjs'

export type TemplateParameterDefinition = {
  name?: string | null
  label?: string | null
  unit?: string | null
  defaultValue?: number | null
  min?: number | null
  max?: number | null
  step?: number | null
  precision?: number | null
}

export type TemplateDerivedValueDefinition = {
  name?: string | null
  label?: string | null
  expression?: string | null
  unit?: string | null
}

export type VariableEntry = {
  key: string
  label: string
  unit?: string | null
  value: number
}

type ValidationResult = {
  errors: string[]
}

type VariantResult = {
  errors: string[]
  parameters: VariableEntry[]
  derived: VariableEntry[]
  scope: Record<string, number>
}

const VARIABLE_NAME_RE = /^[A-Za-z_][A-Za-z0-9_]*$/

const toFiniteNumber = (value: unknown): number | null => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null
  return value
}

const normalizeName = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

const normalizeScope = (value: unknown): Record<string, number> => {
  if (!value || typeof value !== 'object') return {}
  const next: Record<string, number> = {}
  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    const name = normalizeName(key)
    const numberValue = toFiniteNumber(raw)
    if (!name || numberValue == null) continue
    next[name] = numberValue
  }
  return next
}

const hashSeed = (value: string): number => {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0 || 1
}

const lcg = (seed: number) => {
  let state = seed >>> 0
  return () => {
    state = (1664525 * state + 1013904223) >>> 0
    return state / 0x100000000
  }
}

const quantize = (value: number, min: number, step: number | null, precision: number | null) => {
  let next = value
  if (step && step > 0) {
    const bucket = Math.round((value - min) / step)
    next = min + bucket * step
  }
  if (precision != null && precision >= 0) {
    const factor = 10 ** Math.trunc(precision)
    next = Math.round(next * factor) / factor
  }
  return next
}

const parameterLabel = (definition: TemplateParameterDefinition, fallbackIndex: number) =>
  normalizeName(definition.label) ||
  normalizeName(definition.name) ||
  `Parameter ${fallbackIndex + 1}`

const derivedLabel = (definition: TemplateDerivedValueDefinition, fallbackIndex: number) =>
  normalizeName(definition.label) ||
  normalizeName(definition.name) ||
  `Derived ${fallbackIndex + 1}`

export const validateProblemTemplate = ({
  enabled,
  parameterDefinitions,
  derivedValues,
}: {
  enabled?: boolean | null
  parameterDefinitions?: unknown
  derivedValues?: unknown
}): ValidationResult => {
  if (!enabled) return { errors: [] }

  const errors: string[] = []
  const seen = new Set<string>()
  const parameters = Array.isArray(parameterDefinitions)
    ? (parameterDefinitions as TemplateParameterDefinition[])
    : []
  const derived = Array.isArray(derivedValues)
    ? (derivedValues as TemplateDerivedValueDefinition[])
    : []

  parameters.forEach((definition, index) => {
    const name = normalizeName(definition?.name)
    if (!name) {
      errors.push(`Parameter ${index + 1} is missing a variable name.`)
      return
    }
    if (!VARIABLE_NAME_RE.test(name)) {
      errors.push(
        `Parameter "${name}" must start with a letter or underscore and use only letters, numbers, and underscores.`,
      )
    }
    if (seen.has(name)) {
      errors.push(`Parameter "${name}" is duplicated.`)
    }
    seen.add(name)

    const min = toFiniteNumber(definition?.min)
    const max = toFiniteNumber(definition?.max)
    const defaultValue = toFiniteNumber(definition?.defaultValue)
    const step = toFiniteNumber(definition?.step)

    if (min != null && max != null && min > max) {
      errors.push(`Parameter "${name}" has min greater than max.`)
    }
    if (defaultValue != null && min != null && defaultValue < min) {
      errors.push(`Parameter "${name}" has default value below min.`)
    }
    if (defaultValue != null && max != null && defaultValue > max) {
      errors.push(`Parameter "${name}" has default value above max.`)
    }
    if (step != null && step <= 0) {
      errors.push(`Parameter "${name}" must use a positive step size.`)
    }
  })

  derived.forEach((definition, index) => {
    const name = normalizeName(definition?.name)
    const expression =
      typeof definition?.expression === 'string' ? definition.expression.trim() : ''

    if (!name) {
      errors.push(`Derived value ${index + 1} is missing a variable name.`)
      return
    }
    if (!VARIABLE_NAME_RE.test(name)) {
      errors.push(
        `Derived value "${name}" must start with a letter or underscore and use only letters, numbers, and underscores.`,
      )
    }
    if (seen.has(name)) {
      errors.push(`Derived value "${name}" conflicts with another parameter or derived value.`)
    }
    seen.add(name)

    if (!expression) {
      errors.push(`Derived value "${name}" is missing an expression.`)
      return
    }

    try {
      parse(expression)
    } catch (error) {
      errors.push(`Derived value "${name}" has an invalid expression: ${String(error)}`)
    }
  })

  return { errors }
}

export const buildProblemTemplateVariant = ({
  enabled,
  parameterDefinitions,
  derivedValues,
  seed,
}: {
  enabled?: boolean | null
  parameterDefinitions?: unknown
  derivedValues?: unknown
  seed?: string | null
}): VariantResult => {
  const validation = validateProblemTemplate({ enabled, parameterDefinitions, derivedValues })
  if (!enabled) {
    return { errors: [], parameters: [], derived: [], scope: {} }
  }
  if (validation.errors.length) {
    return { errors: validation.errors, parameters: [], derived: [], scope: {} }
  }

  const parameters = Array.isArray(parameterDefinitions)
    ? (parameterDefinitions as TemplateParameterDefinition[])
    : []
  const derived = Array.isArray(derivedValues)
    ? (derivedValues as TemplateDerivedValueDefinition[])
    : []
  const random = lcg(hashSeed(seed?.trim() || 'template-default'))
  const scope: Record<string, number> = {}

  const parameterValues = parameters.map((definition, index) => {
    const key = normalizeName(definition.name)
    const min = toFiniteNumber(definition.min)
    const max = toFiniteNumber(definition.max)
    const defaultValue = toFiniteNumber(definition.defaultValue) ?? 0
    const precision = toFiniteNumber(definition.precision)
    const step = toFiniteNumber(definition.step)

    let value = defaultValue
    if (min != null && max != null) {
      value = min === max ? min : min + random() * (max - min)
      value = quantize(value, min, step, precision)
    } else if (precision != null && precision >= 0) {
      value = quantize(value, defaultValue, null, precision)
    }

    scope[key] = value
    return {
      key,
      label: parameterLabel(definition, index),
      unit: definition.unit,
      value,
    }
  })

  const derivedValuesResolved: VariableEntry[] = []
  const errors = [...validation.errors]

  derived.forEach((definition, index) => {
    const key = normalizeName(definition.name)
    const expression = typeof definition.expression === 'string' ? definition.expression.trim() : ''
    if (!key || !expression) return

    try {
      const value = Number(evaluate(expression, scope))
      if (!Number.isFinite(value)) {
        errors.push(`Derived value "${key}" did not evaluate to a finite number.`)
        return
      }
      scope[key] = value
      derivedValuesResolved.push({
        key,
        label: derivedLabel(definition, index),
        unit: definition.unit,
        value,
      })
    } catch (error) {
      errors.push(`Derived value "${key}" failed to evaluate: ${String(error)}`)
    }
  })

  return {
    errors,
    parameters: parameterValues,
    derived: derivedValuesResolved,
    scope,
  }
}

export const evaluateTemplateExpression = (
  expression: string,
  scope: Record<string, number>,
): number | null => {
  if (!expression.trim()) return null
  try {
    const value = Number(evaluate(expression, scope))
    return Number.isFinite(value) ? value : null
  } catch {
    return null
  }
}

export const resolveProblemTemplateScope = ({
  enabled,
  parameterDefinitions,
  derivedValues,
  seed,
  providedScope,
}: {
  enabled?: boolean | null
  parameterDefinitions?: unknown
  derivedValues?: unknown
  seed?: string | null
  providedScope?: unknown
}): VariantResult => {
  const generated = buildProblemTemplateVariant({
    enabled,
    parameterDefinitions,
    derivedValues,
    seed,
  })
  if (!enabled) return generated

  const scopeFromRequest = normalizeScope(providedScope)
  if (!Object.keys(scopeFromRequest).length) return generated

  const mergedScope: Record<string, number> = {
    ...generated.scope,
    ...scopeFromRequest,
  }
  const parameters = generated.parameters.map((entry) => ({
    ...entry,
    value: mergedScope[entry.key] ?? entry.value,
  }))
  const derived = generated.derived.map((entry) => ({
    ...entry,
    value: mergedScope[entry.key] ?? entry.value,
  }))

  return {
    errors: generated.errors,
    parameters,
    derived,
    scope: mergedScope,
  }
}
