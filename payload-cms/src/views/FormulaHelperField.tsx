'use client'

import { parse } from 'mathjs'
import katex from 'katex'
import React, { useEffect, useMemo, useState } from 'react'
import { useField } from '@payloadcms/ui'

type Category =
  | 'equilibrium'
  | 'moments'
  | 'trusses'
  | 'stress-strain'
  | 'beams'
  | 'custom'

type FormulaTemplate = {
  id: string
  category: Exclude<Category, 'custom'>
  name: string
  latex: string
  mathjs: string
  variables: string[]
}

const FORMULAS: FormulaTemplate[] = [
  {
    id: 'sum-forces-2d',
    category: 'equilibrium',
    name: 'Sum of forces (2D)',
    latex: '\\sum F_x = 0',
    mathjs: 'F1*cos(theta1) + F2*cos(theta2)',
    variables: ['F1', 'theta1', 'F2', 'theta2'],
  },
  {
    id: 'resultant-two-forces',
    category: 'equilibrium',
    name: 'Resultant of two forces',
    latex: 'R = \\sqrt{F_x^2 + F_y^2}',
    mathjs: 'sqrt(Fx^2 + Fy^2)',
    variables: ['Fx', 'Fy'],
  },
  {
    id: 'moment-force',
    category: 'moments',
    name: 'Moment of a force',
    latex: 'M = F \\cdot d',
    mathjs: 'F * d',
    variables: ['F', 'd'],
  },
  {
    id: 'moment-about-point',
    category: 'moments',
    name: 'Moment about a point',
    latex: 'M = F \\cdot d \\cdot \\sin(\\theta)',
    mathjs: 'F * d * sin(theta)',
    variables: ['F', 'd', 'theta'],
  },
  {
    id: 'truss-member-force',
    category: 'trusses',
    name: 'Member force (method of joints)',
    latex: 'F_{AB} = \\frac{P}{\\sin(\\theta)}',
    mathjs: 'P / sin(theta)',
    variables: ['P', 'theta'],
  },
  {
    id: 'truss-angle',
    category: 'trusses',
    name: 'Angle of a member',
    latex: '\\theta = \\arctan(h / b)',
    mathjs: 'atan(h / b)',
    variables: ['h', 'b'],
  },
  {
    id: 'beam-reaction-pin',
    category: 'beams',
    name: 'Reaction at pin (simply-supported)',
    latex: 'R_A = \\frac{P \\cdot b}{L}',
    mathjs: 'P * b / L',
    variables: ['P', 'b', 'L'],
  },
  {
    id: 'beam-max-moment-midload',
    category: 'beams',
    name: 'Max moment (simply-supported, mid-load)',
    latex: 'M_{max} = \\frac{P \\cdot L}{4}',
    mathjs: 'P * L / 4',
    variables: ['P', 'L'],
  },
  {
    id: 'beam-max-moment-udl',
    category: 'beams',
    name: 'Max moment (UDL)',
    latex: 'M_{max} = \\frac{w \\cdot L^2}{8}',
    mathjs: 'w * L^2 / 8',
    variables: ['w', 'L'],
  },
  {
    id: 'beam-max-deflection-udl',
    category: 'beams',
    name: 'Max deflection (simply-supported, UDL)',
    latex: '\\delta_{max} = \\frac{5wL^4}{384EI}',
    mathjs: '5 * w * L^4 / (384 * E * I)',
    variables: ['w', 'L', 'E', 'I'],
  },
  {
    id: 'normal-stress',
    category: 'stress-strain',
    name: 'Normal stress',
    latex: '\\sigma = \\frac{P}{A}',
    mathjs: 'P / A',
    variables: ['P', 'A'],
  },
  {
    id: 'shear-stress',
    category: 'stress-strain',
    name: 'Shear stress',
    latex: '\\tau = \\frac{V \\cdot Q}{I \\cdot b}',
    mathjs: 'V * Q / (I * b)',
    variables: ['V', 'Q', 'I', 'b'],
  },
  {
    id: 'axial-deformation',
    category: 'stress-strain',
    name: 'Axial deformation',
    latex: '\\delta = \\frac{P L}{A E}',
    mathjs: 'P * L / (A * E)',
    variables: ['P', 'L', 'A', 'E'],
  },
  {
    id: 'factor-of-safety',
    category: 'stress-strain',
    name: 'Factor of safety',
    latex: 'FS = \\frac{\\sigma_{allow}}{\\sigma_{actual}}',
    mathjs: 'sigma_allow / sigma_actual',
    variables: ['sigma_allow', 'sigma_actual'],
  },
]

const CATEGORY_LABELS: Record<Category, string> = {
  equilibrium: 'Statics - Equilibrium',
  moments: 'Statics - Moments',
  trusses: 'Statics - Trusses',
  'stress-strain': 'Mechanics - Stress & Strain',
  beams: 'Mechanics - Beams',
  custom: 'Custom (raw entry)',
}

const renderLatex = (latex: string) => {
  try {
    return katex.renderToString(latex, { throwOnError: false, displayMode: false })
  } catch {
    return ''
  }
}

const expressionToLatex = (expr: string) => {
  if (!expr) return ''
  try {
    return parse(expr).toTex()
  } catch {
    return ''
  }
}

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export default function FormulaHelperField() {
  const { value: symbolicAnswerValue, setValue: setSymbolicAnswerValue } = useField<string>({
    path: 'symbolicAnswer',
  })
  const { setValue: setSymbolicVariablesValue } = useField<
    { variable: string; testMin: number; testMax: number }[]
  >({
    path: 'symbolicVariables',
  })

  const [category, setCategory] = useState<Category>('equilibrium')
  const [formulaId, setFormulaId] = useState<string>(FORMULAS[0]?.id ?? '')
  const [variableMap, setVariableMap] = useState<Record<string, string>>({})

  const categoryFormulas = useMemo(
    () => FORMULAS.filter((formula) => formula.category === category),
    [category],
  )

  const selectedFormula = useMemo(
    () => FORMULAS.find((formula) => formula.id === formulaId) ?? null,
    [formulaId],
  )

  const applyFormula = (template: FormulaTemplate, map: Record<string, string>) => {
    let expression = template.mathjs
    for (const variable of template.variables) {
      const nextVar = (map[variable] ?? variable).trim()
      if (!nextVar) continue
      const matcher = new RegExp(`\\b${escapeRegExp(variable)}\\b`, 'g')
      expression = expression.replace(matcher, nextVar)
    }

    setSymbolicAnswerValue(expression)
    setSymbolicVariablesValue(
      template.variables.map((variable) => ({
        variable: (map[variable] ?? variable).trim() || variable,
        testMin: 1,
        testMax: 10,
      })),
    )
  }

  useEffect(() => {
    if (category === 'custom') return
    if (!categoryFormulas.length) return
    const activeFormula =
      categoryFormulas.find((formula) => formula.id === formulaId) ?? categoryFormulas[0]
    setFormulaId(activeFormula.id)
    const nextMap = Object.fromEntries(activeFormula.variables.map((variable) => [variable, variable]))
    setVariableMap(nextMap)
    applyFormula(activeFormula, nextMap)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category])

  useEffect(() => {
    if (category === 'custom') return
    if (!selectedFormula) return
    const nextMap = Object.fromEntries(selectedFormula.variables.map((variable) => [variable, variable]))
    setVariableMap(nextMap)
    applyFormula(selectedFormula, nextMap)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formulaId])

  const previewLatex = useMemo(() => {
    if (category === 'custom') return expressionToLatex(symbolicAnswerValue ?? '')
    return expressionToLatex(symbolicAnswerValue ?? selectedFormula?.mathjs ?? '')
  }, [category, selectedFormula?.mathjs, symbolicAnswerValue])

  return (
    <div
      style={{
        marginTop: 6,
        border: '1px solid var(--theme-elevation-200)',
        borderRadius: 8,
        padding: 10,
        display: 'grid',
        gap: 10,
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8 }}>
        Formula Helper
      </div>
      <label style={{ display: 'grid', gap: 4 }}>
        <span style={{ fontSize: 12 }}>Category</span>
        <select value={category} onChange={(event) => setCategory(event.target.value as Category)}>
          {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>

      {category !== 'custom' ? (
        <>
          <label style={{ display: 'grid', gap: 4 }}>
            <span style={{ fontSize: 12 }}>Formula</span>
            <select value={formulaId} onChange={(event) => setFormulaId(event.target.value)}>
              {categoryFormulas.map((formula) => (
                <option key={formula.id} value={formula.id}>
                  {formula.name}
                </option>
              ))}
            </select>
          </label>

          {selectedFormula ? (
            <div style={{ fontSize: 12 }}>
              <div
                dangerouslySetInnerHTML={{ __html: renderLatex(selectedFormula.latex) }}
                style={{ padding: '2px 0' }}
              />
            </div>
          ) : null}

          {selectedFormula?.variables?.length ? (
            <div style={{ display: 'grid', gap: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 600 }}>Variable Mapping</div>
              {selectedFormula.variables.map((variable) => (
                <label key={variable} style={{ display: 'grid', gap: 4 }}>
                  <span style={{ fontSize: 12 }}>{variable}</span>
                  <input
                    value={variableMap[variable] ?? variable}
                    onChange={(event) => {
                      const nextMap = {
                        ...variableMap,
                        [variable]: event.target.value,
                      }
                      setVariableMap(nextMap)
                      applyFormula(selectedFormula, nextMap)
                    }}
                  />
                </label>
              ))}
            </div>
          ) : null}
        </>
      ) : (
        <label style={{ display: 'grid', gap: 4 }}>
          <span style={{ fontSize: 12 }}>Expression</span>
          <input
            value={symbolicAnswerValue ?? ''}
            onChange={(event) => setSymbolicAnswerValue(event.target.value)}
            placeholder="Example: sqrt(3) * F / 2"
          />
        </label>
      )}

      <div style={{ display: 'grid', gap: 4 }}>
        <div style={{ fontSize: 12, fontWeight: 600 }}>Generated mathjs expression</div>
        <code style={{ fontSize: 12 }}>{symbolicAnswerValue ?? ''}</code>
      </div>
      <div style={{ display: 'grid', gap: 4 }}>
        <div style={{ fontSize: 12, fontWeight: 600 }}>Rendered preview</div>
        {previewLatex ? (
          <div dangerouslySetInnerHTML={{ __html: renderLatex(previewLatex) }} />
        ) : (
          <div style={{ fontSize: 12, color: 'var(--theme-elevation-700)' }}>
            Expression preview unavailable.
          </div>
        )}
      </div>
    </div>
  )
}
