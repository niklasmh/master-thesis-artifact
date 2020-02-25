import React from 'react'
import Module from '../../components/Module'
import styled from 'styled-components'

const StyledModule = styled(Module)`
  padding: 1em;
`

function Goal() {
  return <StyledModule title="Mål">Grafikk</StyledModule>
}

export default Goal
