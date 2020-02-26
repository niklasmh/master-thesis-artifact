import React, { useRef, useState, useEffect } from 'react'
import styled from 'styled-components'
import Editor from '@monaco-editor/react'
import Module from '../../components/Module'
import { preDefinedElements } from './predefinitions'

const StyledModule = styled(Module)`
  align-self: flex-start;

  .module-content {
    box-shadow: none;
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

function CodeEditor({ code = '', size = {}, ...props }) {
  const editor = useRef(null)
  const [isEditorReady, setIsEditorReady] = useState(false)
  const [isPyodideReady, setIsPyodideReady] = useState(false)
  function runCode(value) {
    window.pyodide.runPythonAsync(preDefinedElements + value).then(() => {})
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
