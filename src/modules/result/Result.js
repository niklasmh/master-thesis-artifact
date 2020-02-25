import React from 'react'
import Module from '../../components/Module'
import styled from 'styled-components'

const StyledModule = styled(Module)`
  padding: 1em;
`

function Result() {
  return <StyledModule title="Resultat">Grafikk</StyledModule>
}

export default Result
