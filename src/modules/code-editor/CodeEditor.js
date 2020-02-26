import React from 'react'
import styled from 'styled-components'
import Editor from '@monaco-editor/react'
import Module from '../../components/Module'

const StyledModule = styled(Module)`
  align-self: flex-start;

  .module-content {
    box-shadow: none;
    background: none;
  }

  .monaco-editor,
  .overflow-guard {
    border-radius: 6px;
  }
`

const Button = styled.button`
  align-self: center;
`

function CodeEditor({ size = {}, ...props }) {
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
          height={(size.h || 400) + 'px'}
          language="python"
          theme="vs-dark"
          value={'g = 9.81'}
          options={{}}
          onChange={() => {}}
          editorDidMount={() => {}}
          borderRadius="3px"
        />
      }
    ></StyledModule>
  )
}

export default CodeEditor
