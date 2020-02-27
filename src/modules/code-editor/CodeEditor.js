import React, { useRef, useState, useEffect, useContext } from 'react'
import styled from 'styled-components'
import Editor from '@monaco-editor/react'
import Module from '../../components/Module'
import { preDefinedElements, preDefinedVars } from './predefinitions'
import { CanvasContext } from '../../App'

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

function CodeEditor({ code = '', size = {}, goalSize = {}, ...props }) {
  const {
    canvasContext,
    resultSize = { w: 0, h: 0 },
    setCanvasContext,
  } = useContext(CanvasContext)
  const prevResultSize = useRef({ w: 0, h: 0 })
  const editor = useRef(null)
  const [isEditorReady, setIsEditorReady] = useState(false)
  const [isPyodideReady, setIsPyodideReady] = useState(false)
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
  function execAndGetCurrentVariableValues(runBefore = '', variables = null) {
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
  }
  function runCode(value) {
    window.pyodide.runPythonAsync(preDefinedElements + value).then(() => {
      if (canvasContext !== null) {
        currentState = {
          dt: window.pyodide.globals.dt,
          t_tot: window.pyodide.globals.t_tot,
          elements: window.pyodide.globals.__elements__,
        }
        renderToCanvas(canvasContext, currentState)
      }
      const variables = execAndGetCurrentVariableValues()
      console.log(variables)
      setCanvasContext(context => ({
        ...context,
        variables,
        setCanvasContext,
      }))
    })
  }
  function handleEditorDidMount(_valueGetter) {
    setIsEditorReady(true)
    editor.current = _valueGetter
  }
  useEffect(() => {
    window.languagePluginLoader.then(() => {
      setIsPyodideReady(true)
    })
  }, [])

  useEffect(() => {
    if (
      canvasContext &&
      canvasContext !== null &&
      (prevResultSize.current.h !== resultSize.h ||
        prevResultSize.current.w !== resultSize.w)
    ) {
      renderToCanvas(canvasContext, currentState)
    }
    prevResultSize.current = resultSize
  }, [prevResultSize, resultSize, canvasContext])

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
