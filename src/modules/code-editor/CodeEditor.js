import React from 'react'
import styled from 'styled-components'
import Editor from '@monaco-editor/react'
import Module from '../../components/Module'

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
  return (
    <StyledModule
      title="Kode"
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
          options={{}}
          onChange={() => {}}
          editorDidMount={() => {}}
        />
      }
    ></StyledModule>
  )
}

export default CodeEditor
