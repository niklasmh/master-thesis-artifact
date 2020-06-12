import React, { useRef, useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { ControlledEditor } from '@monaco-editor/react'
import styled from 'styled-components'
import Module from '../../components/Module'
import { removeMarkRangeInEditor } from '../../utils/translate-error-messages'
import {
  preDefinedImports,
  preDefinedElements,
  preDefinedVars,
  preDefinedUserVars,
  createPrintFunction,
  preDefinedElementsLineCount,
  createOnLogInputFunction,
  classTypes,
} from './predefinitions'
import { indentCode, loopCodeSplit } from '../'
import Icon from '../../components/Icon'

const StyledModule = styled(Module)`
  align-self: flex-start;

  .module-content {
    background: none;

    & > section {
      background: #1e1e1e;
      border-radius: 6px;
    }
  }

  .monaco-editor,
  .overflow-guard {
    border-radius: 6px;
  }
  .monaco-editor {
    box-shadow: 0 0 8px #0005;
  }
  &.start > .module-content > section:nth-of-type(1),
  &.playing > .module-content > section:nth-of-type(2) {
    box-shadow: 0.5px 0 0 3px #d4c600;
  }
  @keyframes fadeInOut {
    0% {
      box-shadow: 0.5px 0 0 3px #d4c60000;
    }
    50% {
      box-shadow: 0.5px 0 0 3px #d4c600ff;
    }
    100% {
      box-shadow: 0.5px 0 0 3px #d4c60000;
    }
  }
  &.init > .module-content > section:nth-of-type(1) {
    animation: fadeInOut 1s infinite;
  }

  /*section:first-child > div > .monaco-editor {
    &,
    .overflow-guard {
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
    }
  }

  section:last-child > div > .monaco-editor {
    &,
    .overflow-guard {
      border-top-left-radius: 0;
      border-top-right-radius: 0;
    }
  }*/
`

const Button = styled.button`
  align-self: center;
`

let currentState = {
  dt: 0,
  t_tot: 1,
  elements: [],
}

let currentSolutionState = {
  dt: 0,
  t_tot: 1,
  elements: [],
}

let _time = 0
let intervalID = 0
const units = {
  //'-24': ['ym', 1],
  //'-23': ['ym', 10],
  //'-22': ['ym', 100],
  //'-21': ['zm', 1],
  //'-20': ['zm', 10],
  //'-19': ['zm', 100],
  //'-18': ['am', 1],
  //'-17': ['am', 10],
  //'-16': ['am', 100],
  //'-15': ['fm', 1],
  //'-14': ['fm', 10],
  //'-13': ['fm', 100],
  //'-12': ['pm', 1],
  //'-11': ['pm', 10],
  //'-10': ['pm', 100],
  '-9': ['nm', 1],
  '-8': ['nm', 10],
  '-7': ['nm', 100],
  '-6': ['μm', 1],
  '-5': ['μm', 10],
  '-4': ['μm', 100],
  '-3': ['mm', 1],
  '-2': ['cm', 1],
  '-1': ['dm', 1],
  '0': ['m', 1],
  '1': ['m', 10],
  '2': ['m', 100],
  '3': ['km', 1],
  '4': ['km', 10],
  //'5': ['km', 100],
  //'6': ['km', 1000],
  //'7': ['km', 10000],
  //'8': ['km', 100000],
  //'9': ['km', 1000000],
  //'10': ['km', 10000000],
  //'11': ['km', 100000000],
}

function CodeEditor(props) {
  const {
    code,
    codeEditorRun,
    codeEditorSize,
    resultCanvasSize,
    resultCanvasContext,
    traceResultCanvasContext,
    goalCanvasSize,
    goalCanvasContext,
    traceGoalCanvasContext,
    writeToLogFunction,
    clearLog,
    clearValues,
    isEngineReady,
    isPlaying,
    withError,
    isSolution,
    time,
    deltaTime,
    totalTime,
    solutionDeltaTime,
    solutionTotalTime,
    position,
    solutionPosition,
    scale,
    solutionScale,
    runCode,
    onLogInput,
  } = useSelector((state) => state.task)
  const { theme } = useSelector((state) => state.user)
  const dispatch = useDispatch()
  const prevResultSize = useRef({ w: 0, h: 0 })
  const prevGoalSize = useRef({ w: 0, h: 0 })
  const editor = useRef(null)
  const loopEditor = useRef(null)
  const [isEditorReady, setIsEditorReady] = useState(false)
  const [hasLoopCode, setHasLoopCode] = useState(false)
  const [loopEditorValue, setLoopEditorValue] = useState('')
  const [loopEditorHasChanged, setLoopEditorHasChanged] = useState('')
  const [editorValue, setEditorValue] = useState('')
  const [editorHasChanged, setEditorHasChanged] = useState('')

  const [parsedCode, setParsedCode] = useState('')
  const [parsedLoopCode, setParsedLoopCode] = useState('')
  const prevCode = useRef('')
  useEffect(() => {
    if ((prevCode.current !== code && code !== false) || isSolution) {
      prevCode.current = code
      const [beforeLoopCode, loopCode = false] = code
        .replace(/\\n/g, '\n')
        .split(loopCodeSplit)
      setParsedCode(beforeLoopCode.trim() + '\n')
      setHasLoopCode(loopCode !== false)
      setParsedLoopCode(loopCode && loopCode.trim() + '\n')
      if (isSolution) {
        if (editor.current) {
          editor.current.setValue(beforeLoopCode.trim() + '\n')
        }
        if (loopEditor.current) {
          loopEditor.current.setValue(
            (loopCode || '') && loopCode.trim() + '\n'
          )
        }
        dispatch({
          type: 'setCode',
          code,
          isSolution: false,
        })
      }
    }
  }, [code, isSolution])

  function drawGrid(
    ctx,
    { w, h, ccx, ccy, cx, cy, scale = 1, color = '#0006' }
  ) {
    const minGrid = 10
    const dist = (minGrid * scale) / Math.pow(10, Math.floor(Math.log10(scale)))
    const offset = 0
    ctx.strokeStyle = color
    ctx.beginPath()
    ctx.lineWidth = 3
    for (let y = ccy; y <= h - offset - cy; y += dist * 10) {
      ctx.moveTo(offset, cy + y)
      ctx.lineTo(w - offset, cy + y)
    }
    for (let y = ccy - dist * 10; y > offset - cy; y -= dist * 10) {
      ctx.moveTo(offset, cy + y)
      ctx.lineTo(w - offset, cy + y)
    }
    for (let x = ccx; x <= w - offset - cx; x += dist * 10) {
      ctx.moveTo(cx + x, offset)
      ctx.lineTo(cx + x, h - offset)
    }
    for (let x = ccx - dist * 10; x > offset - cx; x -= dist * 10) {
      ctx.moveTo(cx + x, offset)
      ctx.lineTo(cx + x, h - offset)
    }
    ctx.stroke()
    ctx.lineWidth = 1
    for (let y = ccy + dist; y <= h - offset - cy; y += dist) {
      ctx.moveTo(offset, cy + y)
      ctx.lineTo(w - offset, cy + y)
    }
    for (let y = ccy - dist; y > offset - cy; y -= dist) {
      ctx.moveTo(offset, cy + y)
      ctx.lineTo(w - offset, cy + y)
    }
    for (let x = ccx + dist; x <= w - offset - cx; x += dist) {
      ctx.moveTo(cx + x, offset)
      ctx.lineTo(cx + x, h - offset)
    }
    for (let x = ccx - dist; x > offset - cx; x -= dist) {
      ctx.moveTo(cx + x, offset)
      ctx.lineTo(cx + x, h - offset)
    }
    ctx.stroke()
    ctx.fillStyle = 'black'
    const sizeW = 2
    const sizeH = 12
    const textOffset = offset - sizeH * 4
    const potent = 1 - Math.floor(Math.log10(scale))
    const unit = potent in units ? units[potent] : ['e' + potent + 'm', 1]
    const jump = dist < 64 ? (dist < 32 ? (dist < 16 ? 5 : 2.5) : 1) : 0.5
    ctx.font = sizeH + 'px Roboto'
    const textXPos = Math.max(sizeW, Math.min(w - sizeW, ccx + cx + sizeW))
    const textYPos = Math.max(sizeH, Math.min(h - sizeW, ccy + cy + sizeH))
    ctx.fillText(0, ccx + cx + sizeW, ccy + cy + sizeH)
    ctx.textAlign = ccx + cx > w - 64 ? 'right' : 'left'
    for (
      let y = ccy + dist * jump, i = jump, x = textXPos;
      y <= h - offset - cy;
      y += dist * jump, i += jump
    ) {
      ctx.fillText(i * unit[1] + unit[0], x, cy + y + sizeH)
    }
    for (
      let y = ccy - dist * jump, i = -jump, x = textXPos;
      y > textOffset - cy;
      y -= dist * jump, i -= jump
    ) {
      ctx.fillText(i * unit[1] + unit[0], x, cy + y + sizeH)
    }
    ctx.textAlign = 'left'
    for (
      let x = ccx + dist * jump, i = jump, y = textYPos;
      x <= w - offset - cx;
      x += dist * jump, i += jump
    ) {
      ctx.fillText(i * unit[1] + unit[0], cx + x + sizeW, y)
    }
    for (
      let x = ccx - dist * jump, i = -jump, y = textYPos;
      x > textOffset - cx;
      x -= dist * jump, i -= jump
    ) {
      ctx.fillText(i * unit[1] + unit[0], cx + x + sizeW, y)
    }
  }

  const positionRef = useRef(0)
  const scaleRef = useRef(0)
  const solutionPositionRef = useRef(0)
  const solutionScaleRef = useRef(0)
  function renderToCanvas(ctx, result, solution = false) {
    if (ctx && ctx !== null) {
      ctx.fillStyle = 'transparent'
      const w = ctx.canvas.width
      const h = ctx.canvas.height
      ctx.clearRect(0, 0, w, h)
      const [ccx, ccy] = [w / 2, h / 2]
      const { x: cx, y: cy } = solution
        ? solutionPositionRef.current
        : positionRef.current
      const scale = solution ? solutionScaleRef.current : scaleRef.current
      ctx.drawCircle = (self) => {
        ctx.beginPath()
        ctx.arc(
          cx + ccx + self.x * scale,
          cy + ccy + self.y * scale,
          self.r * scale,
          0,
          2 * Math.PI,
          false
        )
        ctx.fillStyle = self.color || '#0aa'
        ctx.fill()
      }
      ctx.drawBlock = (self) => {
        ctx.beginPath()
        const a = self.rot
        const sinA = Math.sin(a)
        const cosA = Math.cos(a)
        const cw = (self.b * scale) / 2
        const ch = (self.h * scale) / 2
        const x1 = cw * cosA - ch * sinA
        const x2 = cw * cosA + ch * sinA
        const y1 = -ch * cosA - cw * sinA
        const y2 = ch * cosA - cw * sinA
        ctx.moveTo(
          cx + ccx + self.x * scale + x1,
          cy + ccy + self.y * scale + y1
        )
        ctx.lineTo(
          cx + ccx + self.x * scale + x2,
          cy + ccy + self.y * scale + y2
        )
        ctx.lineTo(
          cx + ccx + self.x * scale - x1,
          cy + ccy + self.y * scale - y1
        )
        ctx.lineTo(
          cx + ccx + self.x * scale - x2,
          cy + ccy + self.y * scale - y2
        )
        ctx.fillStyle = self.color || '#0aa'
        ctx.closePath()
        ctx.fill()
      }
      ctx.drawLine = (self) => {
        ctx.beginPath()
        ctx.lineWidth = self.w
        ctx.moveTo(cx + ccx + self.x1 * scale, cy + ccy + self.y1 * scale)
        ctx.lineTo(cx + ccx + self.x2 * scale, cy + ccy + self.y2 * scale)
        ctx.strokeStyle = self.color || '#0aa'
        ctx.stroke()
      }
      if ('elements' in result) {
        result.elements.forEach((element) => element.render(ctx))
      }
    }
  }

  function renderTraceToCanvas(ctx, result, solution = false) {
    if (ctx && ctx !== null) {
      const w = ctx.canvas.width
      const h = ctx.canvas.height
      const [ccx, ccy] = [w / 2, h / 2]
      const { x: cx, y: cy } = solution
        ? solutionPositionRef.current
        : positionRef.current
      const scale = solution ? solutionScaleRef.current : scaleRef.current
      if ('clear' in result && result.clear) {
        ctx.fillStyle = '#ddd'
        ctx.fillRect(0, 0, w, h)
        drawGrid(ctx, {
          w,
          h,
          ccx,
          ccy,
          cx,
          cy,
          scale,
        })
      }
      let minX = 0
      let minY = 0
      let maxX = 0
      let maxY = 0
      ctx.drawCircle = (self) => {
        ctx.beginPath()
        ctx.arc(
          cx + ccx + self.x * scale,
          cy + ccy + self.y * scale,
          self.r * scale,
          0,
          2 * Math.PI,
          false
        )
        ctx.fillStyle = self.color || '#0aa'
        ctx.fill()
      }
      ctx.drawBlock = (self) => {
        ctx.beginPath()
        const a = self.rot
        const sinA = Math.sin(a)
        const cosA = Math.cos(a)
        const cw = (self.b * scale) / 2
        const ch = (self.h * scale) / 2
        const x1 = cw * cosA - ch * sinA
        const x2 = cw * cosA + ch * sinA
        const y1 = -ch * cosA - cw * sinA
        const y2 = ch * cosA - cw * sinA
        ctx.moveTo(
          cx + ccx + self.x * scale + x1,
          cy + ccy + self.y * scale + y1
        )
        ctx.lineTo(
          cx + ccx + self.x * scale + x2,
          cy + ccy + self.y * scale + y2
        )
        ctx.lineTo(
          cx + ccx + self.x * scale - x1,
          cy + ccy + self.y * scale - y1
        )
        ctx.lineTo(
          cx + ccx + self.x * scale - x2,
          cy + ccy + self.y * scale - y2
        )
        ctx.fillStyle = self.color || '#0aa'
        ctx.closePath()
        ctx.fill()
      }
      ctx.drawLine = (self) => {
        ctx.beginPath()
        ctx.lineWidth = self.w
        ctx.moveTo(cx + ccx + self.x1 * scale, cy + ccy + self.y1 * scale)
        ctx.lineTo(cx + ccx + self.x2 * scale, cy + ccy + self.y2 * scale)
        ctx.strokeStyle = self.color || '#0aa'
        ctx.stroke()
      }
      if ('elements' in result) {
        result.elements.forEach((element) => {
          const { minx = 0, miny = 0, maxx = 0, maxy = 0 } =
            element.render(ctx) || {}
          minX = Math.min(minX, minx)
          minY = Math.min(minY, miny)
          maxX = Math.max(maxX, maxx)
          maxY = Math.max(maxY, maxy)
        })
      }
      const dx = maxX - minX
      const dy = maxY - minY
      const dist = Math.max(dx, dy)
      if (dist > 0) {
        if (!solution) {
          const newScale = 160 / dist
          dispatch({
            type: 'setScale',
            scale: Math.log2(newScale),
          })
          dispatch({
            type: 'setPosition',
            position: {
              x: -(newScale * (minX + maxX)) / 2,
              y: -(newScale * (minY + maxY)) / 2,
            },
          })
        } else {
          const newScale = 160 / dist
          dispatch({
            type: 'setScale',
            solutionScale: Math.log2(newScale),
          })
          dispatch({
            type: 'setPosition',
            solutionPosition: {
              x: -(newScale * (minX + maxX)) / 2,
              y: -(newScale * (minY + maxY)) / 2,
            },
          })
        }
      }
    }
  }

  function handleEditorDidMount(_valueGetter, _editor) {
    setIsEditorReady(true)
    const types = {
      Ball: {
        signature: 'Ball(x=meter, y=meter, r=meter, m=kilogram, color="farge")',
        kind: window.monaco.languages.CompletionItemKind.Function,
        documentation:
          'Eksempel på bruk:\n\n```python\nBall(x=0, y=0, r=1)\n```',
        insertText: 'Ball(x=${1:0}, y=${2:0}, r=${3:1}, color="blue")',
        parameters: [
          {
            label: 'x=meter',
            documentation: 'Posisjon på x-aksen',
          },
          {
            label: 'y=meter',
            documentation: 'Posisjon på y-aksen',
          },
          {
            label: 'r=meter',
            documentation: 'Radius i meter',
          },
          {
            label: 'm=kilogram',
            documentation: 'Massen til ballen',
          },
          {
            label: 'color="farge"',
            documentation: 'Farge på ballen',
          },
        ],
      },
      Planet: {
        signature:
          'Planet(x=meter, y=meter, r=meter, m=kilogram, color="farge")',
        kind: window.monaco.languages.CompletionItemKind.Function,
        documentation:
          'Eksempel på bruk:\n\n```python\nPlanet(x=0, y=0, r=1.23e4, m=1.23e4)\n```',
        insertText:
          'Planet(x=${1:0}, y=${2:0}, r=${3:1}, m=${4:1}, color="blue")',
        parameters: [
          {
            label: 'x=meter',
            documentation: 'Posisjon på x-aksen',
          },
          {
            label: 'y=meter',
            documentation: 'Posisjon på y-aksen',
          },
          {
            label: 'r=meter',
            documentation: 'Radius i meter',
          },
          {
            label: 'm=kilogram',
            documentation: 'Massen til planeten',
          },
          {
            label: 'color="farge"',
            documentation: 'Farge på planeten',
          },
        ],
      },
      Kloss: {
        signature:
          'Kloss(x=meter, y=meter, b=meter, h=meter, rot=radianer, m=kilogram, color="farge")',
        kind: window.monaco.languages.CompletionItemKind.Function,
        documentation:
          'Eksempel på bruk:\n\n```python\nKloss(x=0, y=0, b=1, h=1, rot=45*pi/180, color="blue")\n```',
        insertText:
          'Kloss(x=${1:0}, y=${2:0}, b=${3:1}, h=${4:1}, rot=0*pi/180, color="blue")',
        parameters: [
          {
            label: 'x=meter',
            documentation: 'Posisjon på x-aksen',
          },
          {
            label: 'y=meter',
            documentation: 'Posisjon på y-aksen',
          },
          {
            label: 'b=meter',
            documentation: 'Bredde',
          },
          {
            label: 'h=meter',
            documentation: 'Høyde',
          },
          {
            label: 'rot=radianer',
            documentation: 'Vinkel i radianer',
          },
          {
            label: 'm=kilogram',
            documentation: 'Massen til klossen',
          },
          {
            label: 'color="farge"',
            documentation: 'Farge på klossen',
          },
        ],
      },
      Linje: {
        signature:
          'Linje(x1=meter, y1=meter, x2=meter, y2=meter, w=meter, color="farge")',
        kind: window.monaco.languages.CompletionItemKind.Function,
        documentation:
          'Eksempel på bruk:\n\n```pythonLinje(x1=0, y1=0, x2=1, y2=1, w=3)\n```',
        insertText:
          'Linje(x1=${1:0}, y1=${2:0}, x2=${3:1}, y2=${4:1}, w=${5:3}, color="black")',
        parameters: [
          {
            label: 'x1=meter',
            documentation: 'Startposisjon på x-aksen',
          },
          {
            label: 'y1=meter',
            documentation: 'Startposisjon på y-aksen',
          },
          {
            label: 'x2=meter',
            documentation: 'Sluttposisjon på x-aksen',
          },
          {
            label: 'y2=meter',
            documentation: 'Sluttposisjon på y-aksen',
          },
          {
            label: 'w=meter',
            documentation: 'Bredde på linjen i pixler (ikke meter)',
          },
          {
            label: 'color="farge"',
            documentation: 'Farge på linja',
          },
        ],
      },
      dt: {
        signature: 'dt',
        kind: window.monaco.languages.CompletionItemKind.Variable,
        documentation:
          'Tidssteg i sekunder. Denne beskriver hvor store tidsssteg simuleringen tar.\n\nF.eks. er dt = 0.1, kjøres simuleringen 10 ganger per sekund. Vanligvis vil man ha dt rundt 0.01 og 0.04, avgengig av hvor viktig at simuleringen ikke hakker.',
        insertText: 'dt',
      },
      t_tot: {
        signature: 't_tot',
        kind: window.monaco.languages.CompletionItemKind.Variable,
        documentation:
          'Total tid til simuleringen er ferdig. Om du aldri vil at den skal bli ferdig, sett denne til 0. Denne kan også settes mens simuleringen spilles, om du vil stanse den. Eventuelt kan du kjøre `stopp()` for å stoppe simuleringen.',
        insertText: 't_tot',
      },
      stopp: {
        signature: 'stopp()',
        kind: window.monaco.languages.CompletionItemKind.Function,
        documentation:
          'Denne funksjonen stopper simuleringen.\n\nBrukes slik:\n\n```python\nif t > 1:\n    stopp()\n```',
        insertText: 'stopp()',
      },
    }
    /* Works in the beginning, but not when dealing with multiple arguments * /
    window.monaco.languages.registerSignatureHelpProvider('python', {
      signatureHelpTriggerCharacters: ['(', ','],
      provideSignatureHelp: async function (model, position, token, context) {
        const { column, lineNumber } = position
        const signatures = []
        const line = model.getLineContent(lineNumber)
        const start = line.lastIndexOf('(')
        let activeParameter = line.slice(start).split(',').length - 1
        if (context.triggerCharacter === '(') {
          const word = model.getWordAtPosition({
            column: column - 1,
            lineNumber,
          }).word
          if (word in types) {
            signatures.push({
              label: types[word].signature,
              documentation: {
                value: types[word].documentation,
              },
              parameters: types[word].parameters,
            })
          }
        }
        return {
          value: {
            activeParameter,
            activeSignature: 0,
            signatures,
          },
          dispose: () => {},
        }
      },
    })
    /**/
    window.monaco.languages.registerCompletionItemProvider('python', {
      provideCompletionItems: async function (model, position) {
        var word = model.getWordUntilPosition(position)
        var range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        }
        let hasUpperCase = false
        if (word.word) {
          if (/^[A-Z]/.test(word.word)) {
            hasUpperCase = true
          }
        }
        const suggestions = Object.values(types)
          .filter((type) =>
            hasUpperCase ? true : /^[a-z]/.test(type.signature)
          )
          .map((type) => ({
            label: type.signature,
            kind: type.kind,
            documentation: {
              value: type.documentation,
            },
            insertText: type.insertText,
            insertTextRules:
              window.monaco.languages.CompletionItemInsertTextRule
                .InsertAsSnippet,
            range,
          }))
        const completions = preDefinedUserVars
        suggestions.push(
          ...completions.map((c) => ({ label: c, insertText: c }))
        )
        return {
          suggestions,
        }
      },
    })
    window.monaco.languages.registerHoverProvider('python', {
      provideHover: function (model, position) {
        try {
          const { word = '' } = model.getWordAtPosition(position)
          if (word in types) {
            return {
              contents: [
                { value: types[word].signature },
                { value: types[word].documentation },
              ],
            }
          }
        } catch (ex) {}
        return {}
      },
    })
    editor.current = _editor
    dispatch({
      type: 'setEditor',
      editor: _editor,
    })
  }

  function handleLoopEditorDidMount(_valueGetter, _editor) {
    setIsEditorReady(true)
    loopEditor.current = _editor
    dispatch({
      type: 'setLoopEditor',
      loopEditor: _editor,
    })
  }

  const [dirty, setDirty] = useState(false)
  function handleEditorChange(_, value) {
    setEditorHasChanged(value !== editorValue)
    setDirty(true)
  }

  function handleLoopEditorChange(_, value) {
    setLoopEditorHasChanged(value !== loopEditorValue)
    setDirty(true)
  }

  useEffect(() => {
    if (isPlaying) {
      if (editorHasChanged) {
        setEditorValue(editor.current.getValue())
        setEditorHasChanged(false)
      }
      if (loopEditorHasChanged) {
        setLoopEditorValue(loopEditor.current.getValue())
        setLoopEditorHasChanged(false)
      }
    }
  }, [isPlaying])

  useEffect(() => {
    if (isEngineReady && window.pyodide) {
      //window.pyodide.runPython('import pyodide')
    }
  }, [isEngineReady])

  useEffect(() => {
    if (isEngineReady) {
      window.pyodide.globals.print = createPrintFunction(writeToLogFunction)
    }
  }, [isEngineReady, writeToLogFunction])

  useEffect(() => {
    if (isEngineReady) {
      window.pyodide.globals.input = createOnLogInputFunction(onLogInput)
    }
  }, [isEngineReady, onLogInput])

  useEffect(() => {
    if (isEngineReady) {
      const stopFunction = () => {
        dispatch({
          type: 'setIsPlaying',
          isPlaying: false,
        })
      }
      window.pyodide.globals.stopp = stopFunction
      window.pyodide.globals.stop = stopFunction
    }
  }, [isEngineReady, dispatch])

  useEffect(() => {
    scaleRef.current = Math.max(Number.MIN_VALUE, Math.pow(2, scale))
    positionRef.current = position
    if (resultCanvasContext && resultCanvasContext !== null) {
      renderToCanvas(resultCanvasContext, currentState)
    }
    if (traceResultCanvasContext && traceResultCanvasContext !== null) {
      renderTraceToCanvas(traceResultCanvasContext, {
        elements: [],
        clear: true,
      })
    }
  }, [scale, position, resultCanvasContext])

  useEffect(() => {
    if (
      resultCanvasContext &&
      resultCanvasContext !== null &&
      (prevResultSize.current.h !== resultCanvasSize.h ||
        prevResultSize.current.w !== resultCanvasSize.w)
    ) {
      renderToCanvas(resultCanvasContext, currentState)
      if (traceResultCanvasContext && traceResultCanvasContext !== null) {
        renderTraceToCanvas(traceResultCanvasContext, currentState)
      }
    }
    prevResultSize.current = resultCanvasSize
  }, [
    prevResultSize,
    resultCanvasSize,
    resultCanvasContext,
    traceResultCanvasContext,
  ])

  useEffect(() => {
    solutionScaleRef.current = Math.max(
      Number.MIN_VALUE,
      Math.pow(2, solutionScale)
    )
    solutionPositionRef.current = solutionPosition
    if (goalCanvasContext && goalCanvasContext !== null) {
      renderToCanvas(goalCanvasContext, currentSolutionState, true)
    }
    if (traceGoalCanvasContext && traceGoalCanvasContext !== null) {
      renderTraceToCanvas(
        traceGoalCanvasContext,
        { elements: [], clear: true },
        true
      )
    }
  }, [
    solutionScale,
    solutionPosition,
    goalCanvasContext,
    traceGoalCanvasContext,
  ])

  useEffect(() => {
    if (
      goalCanvasContext &&
      goalCanvasContext !== null &&
      (prevGoalSize.current.h !== goalCanvasSize.h ||
        prevGoalSize.current.w !== goalCanvasSize.w)
    ) {
      renderToCanvas(goalCanvasContext, currentSolutionState, true)
      if (traceGoalCanvasContext && traceGoalCanvasContext !== null) {
        renderTraceToCanvas(traceGoalCanvasContext, currentSolutionState, true)
      }
    }
    prevGoalSize.current = goalCanvasSize
  }, [prevGoalSize, goalCanvasSize, goalCanvasContext, traceGoalCanvasContext])

  useEffect(() => {
    function execAndGetCurrentVariableValues(runBefore = '', variables = null) {
      try {
        if (variables === null) {
          return Object.keys(window.pyodide.runPython(runBefore + '\nvars()'))
            .filter((k) => preDefinedVars.indexOf(k) === -1)
            .map((k) => [k, window.pyodide.globals[k]])
            .filter(
              (k) =>
                typeof k[1] === 'string' ||
                typeof k[1] === 'number' ||
                typeof k[1] === 'boolean' ||
                ('__class__' in k[1] &&
                  classTypes.includes(k[1].__class__.__name__))
            )
          //.reduce((acc, n) => Object.assign(acc, { [n[0]]: n[1] }), {});
        } else if (variables === false) {
          return window.pyodide.runPython(runBefore)
        } else {
          return Object.keys(
            window.pyodide.runPython(
              runBefore +
                `\n{${Object.keys(variables)
                  .map((name) => `"${name}":${name}`)
                  .join(',')}}`
            )
          ).map((k) => [k, window.pyodide.globals[k]])
          //.reduce((acc, n) => Object.assign(acc, { [n[0]]: n[1] }), {});
        }
      } catch (ex) {
        writeToLogFunction(ex.message, false, true)
        if (variables === false) {
          return ''
        } else {
          return []
        }
      }
    }
    dispatch({
      type: 'setExecFunction',
      function: execAndGetCurrentVariableValues,
    })
    async function runCode(
      value,
      withPredefinitions = true,
      updateVariables = true,
      _editor = null,
      offset = 0
    ) {
      try {
        const output = await window.pyodide.runPythonAsync(
          (withPredefinitions ? preDefinedImports + preDefinedElements : '') +
            value +
            '\n'
        )
        {
          const t_tot = window.pyodide.globals.t_tot
          currentState = {
            dt: window.pyodide.globals.dt || 0.02,
            t_tot: typeof t_tot === 'number' ? t_tot : 1,
            elements: window.pyodide.globals.__elements__ || [],
          }
          if (resultCanvasContext !== null) {
            renderToCanvas(resultCanvasContext, currentState)
          }
          if (traceResultCanvasContext !== null) {
            renderTraceToCanvas(traceResultCanvasContext, currentState)
          }
        }
        {
          const t_tot = window.pyodide.globals.__t_tot__
          currentSolutionState = {
            dt: window.pyodide.globals.__dt__ || 0.02,
            t_tot: typeof t_tot === 'number' ? t_tot : 1,
            elements: window.pyodide.globals.__solution_elements__ || [],
          }
          if (goalCanvasContext !== null) {
            renderToCanvas(goalCanvasContext, currentSolutionState, true)
          }
          if (traceGoalCanvasContext !== null) {
            renderTraceToCanvas(
              traceGoalCanvasContext,
              currentSolutionState,
              true
            )
          }
        }
        if (updateVariables) {
          const variables = execAndGetCurrentVariableValues()
          dispatch({
            type: 'setValues',
            values: variables,
            deltaTime: currentState.dt,
            totalTime: currentState.t_tot,
            solutionDeltaTime: currentSolutionState.dt,
            solutionTotalTime: currentSolutionState.t_tot,
          })
        }
        return { output }
      } catch (ex) {
        writeToLogFunction(
          ex.message,
          false,
          true,
          _editor,
          (withPredefinitions ? preDefinedElementsLineCount : 0) + offset
        )
        return { error: true }
      }
    }
    dispatch({
      type: 'setRunCodeFunction',
      function: runCode,
    })
  }, [
    dispatch,
    writeToLogFunction,
    resultCanvasContext,
    goalCanvasContext,
    traceResultCanvasContext,
    traceGoalCanvasContext,
  ])

  useEffect(() => {
    _time = time
  }, [time])

  useEffect(() => {
    if (isEngineReady) {
      if (isPlaying && intervalID === null) {
        const maxTotalTime = Math.max(totalTime, solutionTotalTime)
        const minDeltaTime = Math.min(deltaTime, solutionDeltaTime)
        const steps = maxTotalTime / minDeltaTime
        intervalID = setInterval(() => {
          if (totalTime > 0 && _time + minDeltaTime >= maxTotalTime) {
            clearInterval(intervalID)
            intervalID = null
            dispatch({
              type: 'setIsPlaying',
              isPlaying: false,
            })
            dispatch({
              type: 'setTime',
              time: maxTotalTime,
            })
          } else {
            dispatch({
              type: 'setTime',
              time: _time + minDeltaTime,
            })
          }
        }, Math.min(minDeltaTime * 1000, 100))
      } else if (intervalID !== null) {
        clearInterval(intervalID)
        intervalID = null
      }
    }
    return () => {
      if (intervalID !== null) {
        clearInterval(intervalID)
        intervalID = null
      }
    }
  }, [
    isPlaying,
    deltaTime,
    totalTime,
    solutionDeltaTime,
    solutionTotalTime,
    isEngineReady,
    dispatch,
  ])

  const prevTime = useRef(0)
  const prevSolutionTime = useRef(0)
  useEffect(() => {
    if (time === 0) {
      prevTime.current = 0
      prevSolutionTime.current = 0
    }
    if (isEngineReady && time > 0) {
      if (
        !withError &&
        window.pyodide.globals.loop &&
        prevTime.current + deltaTime <= time &&
        (time <= totalTime || totalTime === 0)
      ) {
        prevTime.current = time
        runCode(`loop(${time})`, false, true, loopEditor.current, 2).then(
          ({ error = '' }) => {
            if (error) {
              dispatch({
                type: 'setIsPlaying',
                isPlaying: false,
              })
              dispatch({
                type: 'setTime',
                time: 0,
              })
            }
          }
        )
      }
      if (time + deltaTime > totalTime && window.pyodide.globals.end) {
        runCode(`end()`, false)
      }
      if (
        window.pyodide.globals.__loop__ &&
        prevSolutionTime.current + solutionDeltaTime <= time &&
        (time <= solutionTotalTime || solutionTotalTime === 0)
      ) {
        prevSolutionTime.current = time
        runCode(`__loop__(${time})`, false, false).then(({ error = '' }) => {
          if (error) {
            dispatch({
              type: 'setIsPlaying',
              isPlaying: false,
            })
            dispatch({
              type: 'setTime',
              time: 0,
            })
          }
        })
      }
    }
  }, [
    time,
    deltaTime,
    totalTime,
    solutionDeltaTime,
    solutionTotalTime,
    runCode,
    isEngineReady,
    dispatch,
    withError,
  ])

  /*
  const prevTest = useRef(currentTest)
  useEffect(
    () => {
      if (
        isEditorReady &&
        isEngineReady &&
        prevTest.current !== ourCurrentTest
      ) {
        prevTest.current = ourCurrentTest
        if (window.values) {
          window.values.forEach(([key, _]) => {
            try {
              if (typeof window.pyodide.globals[key] !== 'undefined') {
                delete window.pyodide.globals[key]
              }
            } catch (ex) {}
          })
          dispatch({
            type: 'setValues',
            values: [],
          })
        }
        async function runTests() {
          try {
            window.pyodide.runPython(preDefinedElements + editor.current())
            let failed = false
            for (let i = 0; i < ourCurrentTest && i < tests.length; i++) {
              if (failed) {
                testsFeedback(i, undefined)
              } else {
                const test = tests[i]
                try {
                  const { error = false, output = '' } = await runCode(
                    test,
                    false
                  )
                  if (error) {
                    testsFeedback(i, false)
                    failed = true
                  }
                  if (output === true) {
                    testsFeedback(i, true)
                    if (ourCurrentTest === i)
                      window.pyodide.globals.print(
                        `Du klarte steg ${i + 1}!`,
                        {}
                      )
                  } else {
                    testsFeedback(i, false)
                    window.pyodide.globals.print(
                      `Noe mangler på steg ${i + 1}.`,
                      {}
                    )
                    failed = true
                  }
                } catch (ex) {
                  writeToLogFunction(ex.message, false, true)
                  testsFeedback(i, false)
                  failed = true
                }
                if (failed) {
                  nextTest(i - 1)
                  setOurCurrentTest(i)
                }
              }
            }
          } catch (ex) {
            writeToLogFunction(ex.message, false, true)
          }
          removeMarkRangeInEditor()
        }
        runTests()
      }
    },
    [
      //tests,
      //isEditorReady,
      //isEngineReady,
      //ourCurrentTest,
      //writeToLogFunction,
      //testsFeedback,
      //nextTest,
      //runCode,
      //dispatch,
    ]
  )*/

  return (
    <StyledModule
      title="Kode som kjører en gang"
      width={codeEditorSize.w + 'px'}
      height={codeEditorSize.h + 'px'}
      before={
        isEditorReady && isEngineReady && dirty ? (
          <>
            <div style={{ flex: '1' }} />
            <Button
              onMouseDown={(e) => e.stopPropagation()}
              onClick={async () => {
                if (editor.current) removeMarkRangeInEditor(editor.current)
                if (loopEditor.current)
                  removeMarkRangeInEditor(loopEditor.current)
                clearLog()
                clearValues()
                codeEditorRun(true)
                dispatch({
                  type: 'setTime',
                  time: 0,
                })
                dispatch({
                  type: 'setIsPlaying',
                  isPlaying: true,
                })
                dispatch({
                  type: 'addAttempt',
                })
              }}
            >
              Test koden
              {editorHasChanged || loopEditorHasChanged ? (
                <>
                  {' '}
                  <Icon name="arrow_forward" />
                </>
              ) : (
                ' igjen'
              )}
            </Button>
          </>
        ) : null
      }
      //after={
      //  <Button onMouseDown={e => e.stopPropagation()}>
      //    Last ned kode &nbsp;↓
      //  </Button>
      //}
      outerShadow={false}
      {...props}
      className={
        isPlaying
          ? time < 0.1
            ? 'start playing'
            : 'playing'
          : dirty
          ? ''
          : 'init'
      }
      content={
        <>
          <ControlledEditor
            width={codeEditorSize.w + 'px'}
            height={
              codeEditorSize.h * (hasLoopCode ? 0.5 : 1) -
              (hasLoopCode ? 32 : 0) +
              'px'
            }
            language="python"
            theme={theme}
            value={parsedCode}
            options={{
              renderWhitespace: 'boundary',
              scrollbar: {
                alwaysConsumeMouseWheel: false,
              },
              scrollBeyondLastLine: false,
              wordWrap: true,
              mouseWheelZoom: true,
              minimap: {
                enabled: false,
              },
            }}
            onChange={handleEditorChange}
            editorDidMount={handleEditorDidMount}
          />
          {hasLoopCode ? (
            <>
              <LoopCodeTitle>
                Kode som kjører hvert tidssteg, <code>dt</code>
                {/*<Button
                  style={{ fontSize: '0.8rem' }}
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={async () => {
                    if (isPlaying) {
                      dispatch({
                        type: 'setIsPlaying',
                        isPlaying: false,
                      })
                    } else {
                      if (editor.current)
                        removeMarkRangeInEditor(editor.current)
                      if (loopEditor.current)
                        removeMarkRangeInEditor(loopEditor.current)
                      if (
                        time === 0 ||
                        time + deltaTime >= totalTime ||
                        loopEditorHasChanged
                      ) {
                        clearLog()
                        clearValues()
                        codeEditorRun(true)
                        dispatch({
                          type: 'setTime',
                          time: 0,
                        })
                        dispatch({
                          type: 'setIsPlaying',
                          isPlaying: true,
                        })
                      } else {
                        dispatch({
                          type: 'setIsPlaying',
                          isPlaying: true,
                        })
                      }
                      dispatch({
                        type: 'addAttempt',
                      })
                    }
                  }}
                >
                  {isPlaying ? (
                    <>
                      Pause <i className="fas fa-pause" />
                    </>
                  ) : loopEditorHasChanged ? (
                    <>
                      Spill av ny kode <i className="fas fa-play" />
                    </>
                  ) : (
                    <>
                      Spill av <i className="fas fa-play" />
                    </>
                  )}
                </Button>*/}
              </LoopCodeTitle>
              <ControlledEditor
                width={codeEditorSize.w + 'px'}
                height={codeEditorSize.h * 0.5 - 32 + 'px'}
                language="python"
                theme={theme}
                value={parsedLoopCode}
                options={{
                  renderWhitespace: 'boundary',
                  scrollbar: {
                    alwaysConsumeMouseWheel: false,
                  },
                  scrollBeyondLastLine: false,
                  wordWrap: true,
                  mouseWheelZoom: true,
                  minimap: {
                    enabled: false,
                  },
                }}
                onChange={handleLoopEditorChange}
                editorDidMount={handleLoopEditorDidMount}
              />
            </>
          ) : null}
        </>
      }
    />
  )
}

export default CodeEditor

const LoopCodeTitle = styled.h1`
  font-size: 1.3em;
  font-weight: normal;
  line-height: 32px;
  margin: 0;
  padding: 24px 0 8px;
  /*background-color: #202124;*/
  position: relative;
  width: 100%;

  button {
    position: absolute;
    right: 0;
    bottom: -2px;
  }
`
