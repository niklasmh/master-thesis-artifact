import React, { useEffect } from 'react'
import styled from 'styled-components'
import { useSelector, useDispatch } from 'react-redux'

import Module from '../../components/Module'
import { classTypes } from '../code-editor/predefinitions'
import { store } from '../../'

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
  cursor: text;

  &:hover > ${RemoveButton}::before {
    visibility: visible;
  }
`

const SubVariable = styled.div`
  margin-left: 2em;
  cursor: text;

  :not(:last-of-type)::after {
    content: ', ';
  }
`

const Key = styled.span``

const Sign = styled.span``

const Value = styled.span`
  color: #b5cea8;

  .light & {
    color: #09885a;
  }
`

const BooleanValue = styled.span`
  color: #569cd6;

  .light & {
    color: #0000ff;
  }
`

const StringValue = styled(Value)`
  color: #ce9178;

  .light & {
    color: #a31515;
  }
`

const Comment = styled(Value)`
  color: #608b4e;
  font-style: italic;

  .light & {
    color: #008000;
  }

  :before {
    content: ' # ';
  }
`

const ObjectValue = styled(Value)`
  color: #888;

  .light & {
    color: #888;
  }
`

const Viz = styled.span`
  color: #ddd;

  .light & {
    color: #000;
  }
`

const Button = styled.button`
  background: #800;

  .light & {
    background: #d00;
    color: #fffd;
    font-weight: bold;
  }
`

const Figure = styled.span`
  width: 1em;
  height: 1em;
  display: inline-block;
  background-color: white;
  vertical-align: middle;
  cursor: pointer;
`

function Values(props) {
  const { values, valuesSize, runCode } = useSelector((state) => state.task)
  const dispatch = useDispatch()

  function clearValues(values) {
    store.getState().task.values.forEach(([key, _]) => {
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
    runCode('', false)
  }

  useEffect(() => {
    dispatch({
      type: 'setClearValuesFunction',
      clearValues,
    })
  }, [dispatch])

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
    runCode('', false)
  }

  function manuallyChangeValue(key, arg = '') {
    if (arg) {
      const oldValue = values.find(([k]) => k === key)[1][arg]
      const type = typeof oldValue
      let value = ''
      if (typeof oldValue !== 'undefined') {
        value =
          prompt(`Sett en ny verdi til "${key}.${arg}":`, oldValue) || oldValue
      } else {
        value = prompt(`Sett "${key}.${arg}" til:`) || oldValue
      }

      switch (type) {
        case 'number':
          runCode(`${key}.${arg} = ${parseFloat(value)}`, false)
          break
        default:
          runCode(`${key}.${arg} = "${value}"`, false)
          break
      }
    } else {
      const oldValue = values.find(([k]) => k === key)[1]
      const type = typeof oldValue
      let value = ''
      if (typeof oldValue !== 'undefined') {
        value = prompt(`Sett en ny verdi til "${key}":`, oldValue) || oldValue
      } else {
        value = prompt(`Sett "${key}" til:`) || oldValue
      }

      switch (type) {
        case 'number':
          runCode(`${key} = ${parseFloat(value)}`, false)
          break
        default:
          runCode(`${key} = "${value}"`, false)
          break
      }
    }
  }

  return (
    <StyledModule
      title="Verdier"
      height={valuesSize.h + 'px'}
      width={valuesSize.w + 'px'}
      {...props}
      content={
        <ValueList style={{}}>
          {values
            .filter(
              ([key, value]) =>
                key !== 'loop' &&
                key !== '__loop__' &&
                key !== '__t_tot__' &&
                key !== '__dt__'
            )
            .map(([key, value]) => {
              let comment = ''
              switch (key) {
                case 'dt':
                  if (value === 0) {
                    comment = (
                      <Comment>Tidssteg (0 betyr at den kjører evig)</Comment>
                    )
                  } else {
                    comment = <Comment>Tidssteg</Comment>
                  }
                  break
                case 't_tot':
                  comment = <Comment>Total tid</Comment>
                  break
              }
              switch (typeof value) {
                case 'string':
                  return (
                    <Variable
                      key={key}
                      onClick={() => manuallyChangeValue(key)}
                      title={`Trykk for å endre verdien til "${key}"`}
                    >
                      <RemoveButton onClick={() => clearValue(key)} />{' '}
                      <Key>{key}</Key> <Sign>=</Sign>{' '}
                      <StringValue>"{value}"</StringValue>
                      {comment}
                      {'\n'}
                    </Variable>
                  )
                case 'number':
                  return (
                    <Variable
                      key={key}
                      onClick={() => manuallyChangeValue(key)}
                      title={`Trykk for å endre verdien til "${key}"`}
                    >
                      <RemoveButton onClick={() => clearValue(key)} />{' '}
                      <Key>{key}</Key> <Sign>=</Sign> <Value>{value}</Value>
                      {comment}
                      {'\n'}
                    </Variable>
                  )
                case 'boolean':
                  return (
                    <Variable
                      key={key}
                      onClick={() => manuallyChangeValue(key)}
                      title={`Trykk for å endre verdien til "${key}"`}
                    >
                      <RemoveButton onClick={() => clearValue(key)} />{' '}
                      <Key>{key}</Key> <Sign>=</Sign>{' '}
                      <BooleanValue>{value ? 'True' : 'False'}</BooleanValue>
                      {comment}
                      {'\n'}
                    </Variable>
                  )
                case 'function':
                  try {
                    const type = value.__class__.__name__
                    if (classTypes.includes(type)) {
                      const args = ['x', 'y', 'x1', 'y1', 'x2', 'y2']
                        .filter((arg) => typeof value[arg] !== 'undefined')
                        .map((arg) => (
                          <SubVariable
                            key={arg}
                            onClick={() => manuallyChangeValue(key, arg)}
                            title={`Trykk for å endre verdien til "${key}.${arg}"`}
                          >
                            <Key>{arg}</Key>
                            <Sign>=</Sign>
                            <Value>{value[arg].toFixed(2)}</Value>
                            {comment}
                          </SubVariable>
                        ))
                      const optionalArgs = [
                        'vx',
                        'vy',
                        'ax',
                        'ay',
                        'r',
                        'm',
                        'w',
                        'h',
                      ]
                        .filter((arg) => value[arg])
                        .map((arg) => (
                          <SubVariable
                            key={arg}
                            onClick={() => manuallyChangeValue(key, arg)}
                            title={`Trykk for å endre verdien til "${key}.${arg}"`}
                          >
                            <Key>{arg}</Key>
                            <Sign>=</Sign>
                            <Value>{value[arg].toFixed(2)}</Value>
                            {comment}
                          </SubVariable>
                        ))
                      let figure = null
                      if (type === 'Ball' || type === 'Planet') {
                        figure = (
                          <Figure
                            onClick={() => manuallyChangeValue(key, 'color')}
                            title={`Denne fargen heter "${value.color}". Trykk for å endre fargen.`}
                            style={{
                              borderRadius: '50%',
                              backgroundColor: value.color,
                            }}
                          />
                        )
                      }
                      if (type === 'Kloss') {
                        const sideRatio = value.b / value.h
                        figure = (
                          <Figure
                            onClick={() => manuallyChangeValue(key, 'color')}
                            title={`Denne fargen heter "${value.color}". Trykk for å endre fargen.`}
                            style={{
                              width: `${sideRatio > 1 ? 1 : sideRatio}em`,
                              height: `${sideRatio < 1 ? 1 : 1 / sideRatio}em`,
                              transform: `scale(0.9) rotate(${
                                (-value.rot * 180) / Math.PI
                              }deg)`,
                              backgroundColor: value.color,
                            }}
                          />
                        )
                      }
                      if (type === 'Linje') {
                        figure = (
                          <Figure
                            onClick={() => manuallyChangeValue(key, 'color')}
                            title={`Denne fargen heter "${value.color}". Trykk for å endre fargen.`}
                            style={{
                              width: '3px',
                              transform: `scale(0.9) rotate(${
                                (-Math.atan2(
                                  value.x2 - value.x1,
                                  value.y2 - value.y1
                                ) *
                                  180) /
                                Math.PI
                              }deg)`,
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
                            {figure} <Viz>{type}(</Viz>
                            {args}
                            {optionalArgs}
                            <Viz style={{ marginLeft: '0.66em' }}>)</Viz>
                          </ObjectValue>
                          {'\n'}
                        </Variable>
                      )
                    }
                  } catch (ex) {
                    console.log(ex)
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
