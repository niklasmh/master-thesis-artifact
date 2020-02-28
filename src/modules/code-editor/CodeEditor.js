import React, { useRef, useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import Editor from '@monaco-editor/react'
import styled from 'styled-components'
import Module from '../../components/Module'
import {
  preDefinedElements,
  preDefinedVars,
  createPrintFunction,
  createOnLogInputFunction,
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

function CodeEditor({ code = '', size = {}, ...props }) {
  const {
    resultCanvasSize,
    resultCanvasContext,
    writeToLogFunction,
    isPyodideReady,
    execAndGetCurrentVariableValues,
    onLogInput,
  } = useSelector(state => state)
  const dispatch = useDispatch()
  const prevResultSize = useRef({ w: 0, h: 0 })
  const editor = useRef(null)
  const [isEditorReady, setIsEditorReady] = useState(false)

  function renderToCanvas(ctx, result) {
    if (ctx !== null) {
      ctx.fillStyle = '#ddd'
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
      const [cx, cy] = [ctx.canvas.width / 2, ctx.canvas.height / 2]
      ctx.drawCircle = self => {
        ctx.beginPath()
        ctx.arc(self.x + cx, self.y + cy, self.r, 0, 2 * Math.PI, false)
        ctx.fillStyle = self.color || '#0aa'
        ctx.fill()
      }
      if ('elements' in result) {
        result.elements.forEach(element => element.render(ctx))
      }
    }
  }

  function runCode(value) {
    window.pyodide
      .runPythonAsync(preDefinedElements + value)
      .then(() => {
        if (resultCanvasContext !== null) {
          currentState = {
            dt: window.pyodide.globals.dt,
            t_tot: window.pyodide.globals.t_tot,
            elements: window.pyodide.globals.__elements__,
          }
          renderToCanvas(resultCanvasContext, currentState)
        }
        const variables = execAndGetCurrentVariableValues()
        dispatch({
          type: 'setValues',
          values: variables,
        })
      })
      .catch(ex => writeToLogFunction(ex.message.trim(), false, true))
  }

  function handleEditorDidMount(_valueGetter) {
    setIsEditorReady(true)
    editor.current = _valueGetter
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
            .filter(k => typeof k[1] === 'string' || typeof k[1] === 'number')
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
        writeToLogFunction(ex.message.trim(), false, true)
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
  }, [dispatch, writeToLogFunction])

  return (
    <StyledModule
      title="Kode"
      before={
        isEditorReady && isPyodideReady ? (
          <>
            <div style={{ flex: '1' }} />
            <Button
              onMouseDown={e => e.stopPropagation()}
              onClick={() => runCode(editor.current())}
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
          width="100%"
          height={size.h + 'px'}
          language="python"
          theme="vs-dark"
          value={code}
          editorDidMount={handleEditorDidMount}
        />
      }
    ></StyledModule>
  )
}

export default CodeEditor
