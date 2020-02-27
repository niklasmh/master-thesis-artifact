import React from 'react'
import styled from 'styled-components'
import { useSelector } from 'react-redux'
import Module from '../../components/Module'

const StyledModule = styled(Module)`
  align-self: flex-start;

  .module-content {
    padding: 1em;
  }
`

const ValueList = styled.div`
  white-space: pre;
  text-align: left;
  font-family: 'Roboto Mono', monospace;
  font-size: 0.8em;
  overflow-y: auto;
  flex: 1 1 auto;
`

function Values(props) {
  const { values, valuesSize } = useSelector(state => state)

  return (
    <StyledModule
      title="Verdier"
      {...props}
      content={
        <ValueList style={{ height: valuesSize.h + 'px' }}>
          {values.map(([key, value]) => `${key} = ${value}`).join('\n')}
        </ValueList>
      }
    />
  )
}

export default Values
