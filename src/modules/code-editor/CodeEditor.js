import React, { useRef, useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import Editor from '@monaco-editor/react'
import styled from 'styled-components'
import Module from '../../components/Module'
import { removeMarkRangeInEditor } from '../../utils/translate-error-messages'
import {
  preDefinedElements,
  preDefinedVars,
  createPrintFunction,
  createOnLogInputFunction,
  classTypes,
} from './predefinitions'

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
`

const Button = styled.button`
  align-self: center;
`

let currentState = {
  dt: 0,
  t_tot: 0,
  elements: [],
}

let _time = 0
let intervalID = 0

function CodeEditor({
  code = '',
  size = {},
  tests = [],
  testsFeedback = () => {},
  currentTest = 0,
  nextTest = () => {},
  ...props
}) {
  const {
    resultCanvasSize,
    resultCanvasContext,
    writeToLogFunction,
    isPyodideReady,
    isPlaying,
    time,
    deltaTime,
    totalTime,
    runCode,
    onLogInput,
  } = useSelector(state => state.task)
  const dispatch = useDispatch()
  const prevResultSize = useRef({ w: 0, h: 0 })
  const editor = useRef(null)
  const [isEditorReady, setIsEditorReady] = useState(false)
  const [ourCurrentTest, setOurCurrentTest] = useState(currentTest)

  function renderToCanvas(ctx, result) {
    if (ctx !== null) {
      ctx.fillStyle = '#ddd'
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
      const scale = 50
      const [cx, cy] = [ctx.canvas.width / 2, ctx.canvas.height / 2]
      ctx.drawCircle = self => {
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
        result.elements.forEach(element => element.render(ctx))
      }
    }
  }

  function handleEditorDidMount(_valueGetter) {
    setIsEditorReady(true)
    editor.current = _valueGetter
    dispatch({
      type: 'setEditor',
      editor,
    })
  }

  useEffect(() => {
    if (window.languagePluginLoader) {
      window.languagePluginLoader.then(() => {
        dispatch({
          type: 'setIsPyodideReady',
          isReady: true,
        })
      })
    }
  }, [dispatch])

  useEffect(() => {
    if (isPyodideReady) {
      window.pyodide.globals.print = createPrintFunction(writeToLogFunction)
    }
  }, [isPyodideReady, writeToLogFunction])

  useEffect(() => {
    if (isPyodideReady) {
      window.pyodide.globals.input = createOnLogInputFunction(onLogInput)
    }
  }, [isPyodideReady, onLogInput])

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
    function execAndGetCurrentVariableValues(runBefore = '', variables = null) {
      try {
        if (variables === null) {
          return Object.keys(window.pyodide.runPython(runBefore + '\nvars()'))
            .filter(k => preDefinedVars.indexOf(k) === -1)
            .map(k => [k, window.pyodide.globals[k]])
            .filter(
              k =>
                typeof k[1] === 'string' ||
                typeof k[1] === 'number' ||
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
                  .map(name => `"${name}":${name}`)
                  .join(',')}}`
            )
          ).map(k => [k, window.pyodide.globals[k]])
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
      updateVariables = true
    ) {
      try {
        const output = await window.pyodide.runPythonAsync(
          (withPredefinitions ? preDefinedElements : '') + value
        )
        if (resultCanvasContext !== null) {
          currentState = {
            dt: window.pyodide.globals.dt || 0,
            t_tot: window.pyodide.globals.t_tot || 0,
            elements: window.pyodide.globals.__elements__ || [],
          }
          renderToCanvas(resultCanvasContext, currentState)
        }
        if (updateVariables) {
          const variables = execAndGetCurrentVariableValues()
          dispatch({
            type: 'setValues',
            values: variables,
            deltaTime: currentState.dt,
            totalTime: currentState.t_tot,
          })
        }
        return { output }
      } catch (ex) {
        writeToLogFunction(ex.message, false, true)
        return { error: true }
      }
    }
    dispatch({
      type: 'setRunCodeFunction',
      function: runCode,
    })
  }, [dispatch, writeToLogFunction, resultCanvasContext])

  useEffect(() => {
    _time = time
  }, [time])

  useEffect(() => {
    if (isPyodideReady) {
      if (isPlaying && intervalID === null) {
        intervalID = setInterval(() => {
          if (_time + deltaTime >= totalTime) {
            clearInterval(intervalID)
            intervalID = null
            dispatch({
              type: 'setIsPlaying',
              isPlaying: false,
            })
          } else {
            dispatch({
              type: 'setTime',
              time: _time + deltaTime,
            })
          }
        }, deltaTime * 1000)
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
  }, [isPlaying, deltaTime, totalTime, isPyodideReady, dispatch])

  useEffect(() => {
    if (isPyodideReady && time > 0) {
      if (window.pyodide.globals.loop) {
        runCode(`loop(${time})`, false).then(({ error = '' }) => {
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
      if (time + deltaTime > totalTime && window.pyodide.globals.end) {
        runCode(`end()`, false)
      }
    }
  }, [time, deltaTime, totalTime, runCode, isPyodideReady, dispatch])

  const prevTest = useRef(currentTest)
  useEffect(() => {
    if (
      isEditorReady &&
      isPyodideReady &&
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
                    window.pyodide.globals.print(`Du klarte steg ${i + 1}!`, {})
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
  }, [
    tests,
    isEditorReady,
    isPyodideReady,
    ourCurrentTest,
    writeToLogFunction,
    testsFeedback,
    nextTest,
    runCode,
    dispatch,
  ])

  return (
    <StyledModule
      title="Kode"
      width={size.w + 'px'}
      height={size.h + 'px'}
      before={
        isEditorReady && isPyodideReady ? (
          <>
            <div style={{ flex: '1' }} />
            <Button
              onMouseDown={e => e.stopPropagation()}
              onClick={async () => {
                await runCode(
                  editor.current() + '\nprint("Koden kjørte uten feil.")'
                )
                nextTest(ourCurrentTest)
                setOurCurrentTest(ourCurrentTest + 1)
                removeMarkRangeInEditor()
                dispatch({
                  type: 'setTime',
                  time: 0,
                })
              }}
            >
              Kjør koden
            </Button>
          </>
        ) : null
      }
      after={
        <Button onMouseDown={e => e.stopPropagation()}>
          Last ned kode &nbsp;↓
        </Button>
      }
      {...props}
      content={
        <Editor
          width={size.w + 'px'}
          height={size.h + 'px'}
          language="python"
          theme="vs-dark"
          value={code}
          options={{ renderWhitespace: 'boundary' }}
          editorDidMount={handleEditorDidMount}
        />
      }
    ></StyledModule>
  )
}

export default CodeEditor
