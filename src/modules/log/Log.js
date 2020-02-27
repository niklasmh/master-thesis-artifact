import React, { useEffect, useState, useRef } from 'react'
import styled from 'styled-components'
import { useSelector, useDispatch } from 'react-redux'
import Module from '../../components/Module'

const StyledModule = styled(Module)`
  align-self: flex-start;

  .module-content {
    padding: 1em;
  }
`

const LogList = styled.div`
  flex: 1 1 auto;
  white-space: pre-wrap;
  text-align: left;
  font-family: 'Roboto Mono', monospace;
  font-size: 0.8em;
  overflow-y: auto;
  position: relative;
`

const LogMessage = styled.div`
  color: white;
  word-break: break-word;
`

const WarningMessage = styled(LogMessage)`
  color: orange;
  background-color: #f801;
`
const ErrorMessage = styled(LogMessage)`
  color: red;
  background-color: #f001;
`

const hijack = (context, oldFunction, runBefore) => {
  return function(...args) {
    runBefore.apply(context, args)
    oldFunction.apply(context, args)
  }
}

function Log(props) {
  const { logSize } = useSelector(state => state)
  const dispatch = useDispatch()
  const [log, setLog] = useState([])
  const logListElement = useRef(null)

  useEffect(() => {
    const writeToLogFunction = message => {
      console.log(message)
      setLog(log => [
        ...log,
        <LogMessage key={log.length}>{message}</LogMessage>,
      ])
    }
    dispatch({
      type: 'setWriteToLogFunction',
      writeToLogFunction,
    })

    const logToDisplay = (messages, type) => {
      const [row, col] = new Error().stack
        .split('\n')[4]
        .replace(/[()]/g, '')
        .split(':')
        .slice(-2)
      const message = (
        <>
          <span style={{ right: 0, position: 'absolute' }}>
            {row}:{col}
          </span>
          {messages
            .map(msg => (typeof msg === 'object' ? JSON.stringify(msg) : msg))
            .join('\n') + '\n'}
        </>
      )
      switch (type) {
        case 'warn':
          setLog(log => [
            ...log,
            <WarningMessage key={log.length}>{message}</WarningMessage>,
          ])
          break
        case 'error':
          setLog(log => [
            ...log,
            <ErrorMessage key={log.length}>{message}</ErrorMessage>,
          ])
          break
        default:
          setLog(log => [
            ...log,
            <LogMessage key={log.length}>{message}</LogMessage>,
          ])
          break
      }
    }
    /** /
    console.log = hijack(console, console.log, (...args) => {
      logToDisplay(args, 'log')
    })
    console.warn = hijack(console, console.warn, (...args) => {
      logToDisplay(args, 'warn')
    })
    /**/
    // TODO: Make errors display in the log module
    console.error = hijack(console, console.error, (...args) => {
      logToDisplay(args, 'error')
    })
  }, [dispatch])

  useEffect(() => {
    logListElement.current.scrollTop = logListElement.current.scrollHeight
  }, [log, logListElement])

  return (
    <StyledModule
      title={
        <>
          Logg{' '}
          <span
            style={{
              fontSize: '0.5em',
              position: 'absolute',
              margin: '1em 0.5em 0',
            }}
          >
            print("tekst")
          </span>
        </>
      }
      {...props}
      content={
        <LogList style={{ height: logSize.h + 'px' }} ref={logListElement}>
          {log}
        </LogList>
      }
    />
  )
}

export default Log
