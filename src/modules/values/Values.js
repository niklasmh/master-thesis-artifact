import React from 'react'
import styled from 'styled-components'
import { useSelector, useDispatch } from 'react-redux'
import Module from '../../components/Module'
import { classTypes } from '../code-editor/predefinitions'

const StyledModule = styled(Module)`
  align-self: flex-start;

  .module-content {
    padding: 1em 1em 1em 0;
  }
`

const ValueList = styled.div`
  text-align: left;
  font-family: 'Roboto Mono', monospace;
  font-size: 0.8em;
  overflow-y: auto;
  flex: 1 1 auto;
  padding-left: 1em;
`

const RemoveButton = styled.span`
  ::before {
    content: '✖';
    position: absolute;
    color: red;
    right: calc(100% - 4px);
    cursor: pointer;
    visibility: hidden;
  }
`

const Variable = styled.div`
  white-space: pre-wrap;
  word-break: break-word;
  position: relative;

  &:hover > ${RemoveButton}::before {
    visibility: visible;
  }
`

const SubVariable = styled.div`
  margin-left: 2em;

  :not(:last-of-type)::after {
    content: ', ';
  }
`

const Key = styled.span``

const Sign = styled.span``

const Value = styled.span`
  color: #b5cea8;
`

const StringValue = styled(Value)`
  color: #ce9178;
`

const ObjectValue = styled(Value)`
  color: #888;
`

const Viz = styled.span`
  color: #ddd;
`

const Button = styled.button`
  background: #800;
`

const Figure = styled.span`
  width: 1em;
  height: 1em;
  display: inline-block;
  background-color: white;
  vertical-align: middle;
`

function Values(props) {
  const { values, valuesSize } = useSelector(state => state)
  const dispatch = useDispatch()

  function clearValues() {
    values.forEach(([key, _]) => {
      try {
        if (typeof window.pyodide.globals[key] !== 'undefined') {
          delete window.pyodide.globals[key]
        }
      } catch (ex) {}
    })
    dispatch({
      type: 'setValues',
      values: [],
    })
  }

  function clearValue(valueKey) {
    try {
      if (typeof window.pyodide.globals[valueKey] !== 'undefined') {
        delete window.pyodide.globals[valueKey]
      }
    } catch (ex) {}
    dispatch({
      type: 'setValues',
      values: values.filter(([key, _]) => key !== valueKey),
    })
  }

  return (
    <StyledModule
      title="Verdier"
      {...props}
      content={
        <ValueList style={{ height: valuesSize.h + 'px' }}>
          {values.map(([key, value]) => {
            switch (typeof value) {
              case 'string':
                return (
                  <Variable key={key}>
                    <RemoveButton onClick={() => clearValue(key)} />{' '}
                    <Key>{key}</Key> <Sign>=</Sign>{' '}
                    <StringValue>"{value}"</StringValue>
                    {'\n'}
                  </Variable>
                )
              case 'number':
                return (
                  <Variable key={key}>
                    <RemoveButton onClick={() => clearValue(key)} />{' '}
                    <Key>{key}</Key> <Sign>=</Sign> <Value>{value}</Value>
                    {'\n'}
                  </Variable>
                )
              case 'function':
                if (classTypes.includes(value.type)) {
                  const args = ['vx', 'vy', 'ax', 'ay', 'r', 'w', 'h']
                    .filter(arg => value[arg])
                    .map(arg => (
                      <SubVariable key={arg}>
                        <Key>{arg}</Key>
                        <Sign>=</Sign>
                        <Value>{value[arg].toFixed(2)}</Value>
                      </SubVariable>
                    ))
                  let figure = null
                  if (value.type === 'Ball') {
                    figure = (
                      <Figure
                        title={value.color}
                        style={{
                          borderRadius: '50%',
                          backgroundColor: value.color,
                        }}
                      />
                    )
                  }
                  return (
                    <Variable key={key}>
                      <RemoveButton onClick={() => clearValue(key)} />{' '}
                      <Key>{key}</Key> <Sign>=</Sign>{' '}
                      <ObjectValue>
                        {figure} <Viz>Ball(</Viz>
                        <SubVariable>
                          <Key>x</Key>
                          <Sign>=</Sign>
                          <Value>{value.x.toFixed(2)}</Value>
                        </SubVariable>
                        <SubVariable>
                          <Key>y</Key>
                          <Sign>=</Sign>
                          <Value>{value.y.toFixed(2)}</Value>
                        </SubVariable>
                        {args}
                        <Viz style={{ marginLeft: '1em' }}>)</Viz>
                      </ObjectValue>
                      {'\n'}
                    </Variable>
                  )
                }
                break
              default:
                break
            }
            return null
          })}
          {values.length > 0 ? (
            <Button onClick={clearValues}>Fjern verdier</Button>
          ) : null}
        </ValueList>
      }
    />
  )
}

export default Values
