import { parse } from 'mathjs'

const IDENTIFIER_RE = /^[A-Za-z_][A-Za-z0-9_]*$/
const ZERO_FORMULA_RE = /^0+(?:\.0+)?$/

export type PlotLabelOption = {
  rawLabel: string
  reference: string
  sanitized: boolean
}

const normalizeExpression = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

export const normalizePlotReference = (value: string) => {
  const trimmed = value.trim()
  if (!trimmed) return ''
  let next = trimmed.replace(/\s+/g, '_').replace(/[^A-Za-z0-9_]/g, '_').replace(/_+/g, '_')
  if (!next) return ''
  if (!/^[A-Za-z_]/.test(next)) {
    next = `_${next}`
  }
  return next
}

export const buildPlotLabelOptions = (labels: string[]): PlotLabelOption[] => {
  const seen = new Set<string>()
  const options: PlotLabelOption[] = []
  for (const label of labels) {
    const rawLabel = label.trim()
    if (!rawLabel || seen.has(rawLabel)) continue
    seen.add(rawLabel)
    const normalized = normalizePlotReference(rawLabel)
    options.push({
      rawLabel,
      reference: normalized || rawLabel,
      sanitized: Boolean(normalized) && normalized !== rawLabel,
    })
  }
  return options
}

export const coercePlotWizardReference = (value: string, labelOptions: PlotLabelOption[]) => {
  const trimmed = value.trim()
  if (!trimmed) return ''
  const matchedLabel = labelOptions.find((option) => option.rawLabel === trimmed)
  return matchedLabel?.reference ?? trimmed
}

const validateExpression = (value: unknown, label: string) => {
  const expression = normalizeExpression(value)
  if (!expression) return `${label} is required.`
  try {
    parse(expression)
    return true
  } catch (error) {
    return `${label} has an invalid math expression: ${String(error)}`
  }
}

export const validatePlotXMax = (value: unknown) => {
  const expression = normalizeExpression(value)
  if (!expression) return true
  return validateExpression(expression, 'xMax')
}

export const validateResultPlotSegments = ({
  plotType,
  segments,
}: {
  plotType?: unknown
  segments?: unknown
}) => {
  if (!Array.isArray(segments) || !segments.length) return true

  for (let index = 0; index < segments.length; index += 1) {
    const segment = segments[index] as { xStart?: unknown; xEnd?: unknown; formula?: unknown }
    const xStartValidation = validateExpression(segment?.xStart, `Segment ${index + 1} xStart`)
    if (xStartValidation !== true) return xStartValidation
    const xEndValidation = validateExpression(segment?.xEnd, `Segment ${index + 1} xEnd`)
    if (xEndValidation !== true) return xEndValidation
    const formulaValidation = validateExpression(segment?.formula, `Segment ${index + 1} formula`)
    if (formulaValidation !== true) return formulaValidation
  }

  if (
    plotType === 'deflection' &&
    segments.every((segment) =>
      ZERO_FORMULA_RE.test(normalizeExpression((segment as { formula?: unknown }).formula)),
    )
  ) {
    return 'Deflection plots cannot use the placeholder zero formula from the wizard. Enter real deflection equations or switch to a different plot type.'
  }

  return true
}

export const validateResultPlotCriticalPoints = (value: unknown) => {
  if (!Array.isArray(value) || !value.length) return true
  for (let index = 0; index < value.length; index += 1) {
    const point = value[index] as { x?: unknown }
    const validation = validateExpression(point?.x, `Critical point ${index + 1} x`)
    if (validation !== true) return validation
  }
  return true
}

export const isValidPlotIdentifier = (value: string) => IDENTIFIER_RE.test(value.trim())
