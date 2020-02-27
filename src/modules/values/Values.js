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

const Key = styled.span``

const Sign = styled.span``

const Value = styled.span`
  color: #b5cea8;
`

const StringValue = styled(Value)`
  color: #ce9178;
`

function Values(props) {
  const { values, valuesSize } = useSelector(state => state)

  return (
    <StyledModule
      title="Verdier"
      {...props}
      content={
        <ValueList style={{ height: valuesSize.h + 'px' }}>
          {values.map(([key, value]) => {
            if (typeof value === 'string') {
              return (
                <React.Fragment key={key}>
                  <Key>{key}</Key> <Sign>=</Sign>{' '}
                  <StringValue>"{value}"</StringValue>
                  {'\n'}
                </React.Fragment>
              )
            }
            return (
              <React.Fragment key={key}>
                <Key>{key}</Key> <Sign>=</Sign> <Value>{value}</Value>
                {'\n'}
              </React.Fragment>
            )
          })}
        </ValueList>
      }
    />
  )
}

export default Values
