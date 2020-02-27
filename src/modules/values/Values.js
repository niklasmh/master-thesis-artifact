import React, { useContext, useEffect } from 'react'
import styled from 'styled-components'
import Module from '../../components/Module'
import { CanvasContext } from '../../App'

const StyledModule = styled(Module)`
  align-self: flex-start;

  .module-content {
    padding: 1em;
  }
`

const ValueList = styled.div`
  white-space: pre-wrap;
  font-family: 'Roboto Mono', sans-serif;
`

function Values(props) {
  const { values = [] } = useContext(CanvasContext)

  return (
    <StyledModule
      title="Verdier"
      {...props}
      content={
        <ValueList>
          {values.map((key, value) => `${key} = ${value}`).join('\n')}
        </ValueList>
      }
    />
  )
}

export default Values
