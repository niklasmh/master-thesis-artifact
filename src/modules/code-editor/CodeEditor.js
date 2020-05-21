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

function CodeEditor(props) {
  const {
    code,
    codeEditorRun,
    codeEditorSize,
    resultCanvasSize,
    resultCanvasContext,
    goalCanvasSize,
    goalCanvasContext,
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

  function renderToCanvas(ctx, result) {
    if (ctx !== null) {
      ctx.fillStyle = '#ddd'
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
      const scale = 50
      const [cx, cy] = [ctx.canvas.width / 2, ctx.canvas.height / 2]
      ctx.drawCircle = (self) => {
        ctx.beginPath()
        ctx.arc(
          cx + self.x * scale,
          cy - self.y * scale,
          self.r * scale,
          0,
          2 * Math.PI,
          false
        )
        ctx.fillStyle = self.color || '#0aa'
        ctx.fill()
      }
      if ('elements' in result) {
        result.elements.forEach((element) => element.render(ctx))
      }
    }
  }

  function handleEditorDidMount(_valueGetter, _editor) {
    setIsEditorReady(true)
    const types = {
      Ball: {
        signature: 'Ball(x=tall, y=tall, r=tall, color="farge")',
        kind: window.monaco.languages.CompletionItemKind.Function,
        documentation:
          'Eksempel på bruk:\n\n```python\nBall(x=0, y=0, r=1)\n```',
        insertText: 'Ball(x=${1:0}, y=${2:0}, r=${3:1}, color="blue")',
        parameters: [
          {
            label: 'x=tall',
            documentation: 'Posisjon på x-aksen',
          },
          {
            label: 'y=tall',
            documentation: 'Posisjon på y-aksen',
          },
          {
            label: 'r=tall',
            documentation: 'Posisjon på y-aksen',
          },
        ],
      },
      Blokk: {
        signature: 'Blokk(x=tall, y=tall, b=tall, h=tall, color="farge")',
        kind: window.monaco.languages.CompletionItemKind.Function,
        documentation:
          'Eksempel på bruk:\n\n```python\nBlokk(x=0, y=0, b=1, h=1)\n```',
        insertText:
          'Blokk(x=${1:0}, y=${2:0}, b=${3:1}, h=${4:1}, color="blue")',
        parameters: [
          {
            label: 'x=tall',
            documentation: 'Posisjon på x-aksen',
          },
          {
            label: 'y=tall',
            documentation: 'Posisjon på y-aksen',
          },
          {
            label: 'b=tall',
            documentation: 'Bredde',
          },
          {
            label: 'h=tall',
            documentation: 'Høyde',
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
        const suggestions = Object.values(types).map((type) => ({
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

  function handleEditorChange(_, value) {
    setEditorHasChanged(value !== editorValue)
  }

  function handleLoopEditorChange(_, value) {
    setLoopEditorHasChanged(value !== loopEditorValue)
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
    if (
      resultCanvasContext &&
      resultCanvasContext !== null &&
      (prevResultSize.current.h !== resultCanvasSize.h ||
        prevResultSize.current.w !== resultCanvasSize.w)
    ) {
      renderToCanvas(resultCanvasContext, currentState)
    }
    prevResultSize.current = resultCanvasSize
  }, [prevResultSize, resultCanvasSize, resultCanvasContext])

  useEffect(() => {
    if (
      goalCanvasContext &&
      goalCanvasContext !== null &&
      (prevGoalSize.current.h !== goalCanvasSize.h ||
        prevGoalSize.current.w !== goalCanvasSize.w)
    ) {
      renderToCanvas(goalCanvasContext, currentSolutionState)
    }
    prevGoalSize.current = goalCanvasSize
  }, [prevGoalSize, goalCanvasSize, goalCanvasContext])

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
                classTypes.includes(k[1].type)
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
        if (resultCanvasContext !== null) {
          const t_tot = window.pyodide.globals.t_tot
          currentState = {
            dt: window.pyodide.globals.dt || 0.02,
            t_tot: typeof t_tot === 'number' ? t_tot : 1,
            elements: window.pyodide.globals.__elements__ || [],
          }
          renderToCanvas(resultCanvasContext, currentState)
        }
        if (goalCanvasContext !== null) {
          const t_tot = window.pyodide.globals.__t_tot__
          currentSolutionState = {
            dt: window.pyodide.globals.__dt__ || 0.02,
            t_tot: typeof t_tot === 'number' ? t_tot : 1,
            elements: window.pyodide.globals.__solution_elements__ || [],
          }
          renderToCanvas(goalCanvasContext, currentSolutionState)
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
  }, [dispatch, writeToLogFunction, resultCanvasContext, goalCanvasContext])

  useEffect(() => {
    _time = time
  }, [time])

  useEffect(() => {
    if (isEngineReady) {
      if (isPlaying && intervalID === null) {
        const minDeltaTime = Math.min(deltaTime, solutionDeltaTime)
        const maxTotalTime = Math.max(totalTime, solutionTotalTime)
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
        }, minDeltaTime * 1000)
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
        isEditorReady && isEngineReady ? (
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
              ) : null}
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
      className={isPlaying ? (time < 0.1 ? 'start playing' : 'playing') : ''}
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
                <Button
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
                </Button>
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
