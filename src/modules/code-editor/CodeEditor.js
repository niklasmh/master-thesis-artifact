import React from 'react'
import Module from '../../components/Module'
import styled from 'styled-components'

const StyledModule = styled(Module)`
  padding: 1em;
`

function CodeEditor() {
  return <StyledModule title="Kode">Monaco editor</StyledModule>
}

export default CodeEditor
