import React from 'react'
import styled from 'styled-components'
import Editor from '@monaco-editor/react';
import Module from '../../components/Module'

const StyledModule = styled(Module)`
`

function CodeEditor() {
  return <StyledModule title="Kode">
    <Editor width="100%" height="200px" language="python" theme="vs-dark" value={"g = 9.81"} options={{}} onChange={() => { }} editorDidMount={() => { }} />
  </StyledModule>
}

export default CodeEditor
