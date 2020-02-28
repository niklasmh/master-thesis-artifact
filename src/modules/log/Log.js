import React, { useEffect, useState, useRef } from 'react'
import styled from 'styled-components'
import { useSelector, useDispatch } from 'react-redux'
import Module from '../../components/Module'
import { execAndGetCurrentVariableValues } from '../code-editor/CodeEditor'

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

const CommandContainer = styled.div`
  display: flex;

  ::before {
    content: '> ';
  }
`

const CommandInput = styled.input`
  flex: 1 0 auto;
  appearance: none;
  background: none;
  border: none;
  color: white;
  font-family: 'Roboto Mono', monospace;

  :focus {
    outline: none;
  }
`

const hijack = (context, oldFunction, runBefore) => {
  return function(...args) {
    runBefore.apply(context, args)
    oldFunction.apply(context, args)
  }
}

function Log(props) {
  const { logSize, isPyodideReady } = useSelector(state => state)
  const dispatch = useDispatch()
  const [log, setLog] = useState([])
  const [history, setHistory] = useState([])
  const [currentCommand, setCurrentCommand] = useState([])
  const [historyPointer, setHistoryPointer] = useState(0)
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

  function handleCommandInput(e) {
    if (isPyodideReady) {
      if (e.keyCode === 13) {
        e.preventDefault()
        const code = e.target.value
        if (code.length) {
          const variables = execAndGetCurrentVariableValues(code)
          dispatch({
            type: 'setValues',
            values: variables,
          })
          if (history[history.length - 1] !== code) {
            setHistoryPointer(history.length + 1)
            setHistory(history => [...history, code])
          } else {
            setHistoryPointer(history.length)
          }
          e.target.value = ''
          setCurrentCommand('')
        }
      } else if (e.keyCode === 38) {
        e.preventDefault()
        if (historyPointer === history.length) {
          setCurrentCommand(e.target.value)
        }
        if (historyPointer - 1 >= 0) {
          e.target.value = history[historyPointer - 1]
          setHistoryPointer(historyPointer - 1)
        } else {
          e.target.value = history[0] || ''
          setHistoryPointer(0)
        }
      } else if (e.keyCode === 40) {
        e.preventDefault()
        if (historyPointer + 1 < history.length) {
          e.target.value = history[historyPointer + 1]
          setHistoryPointer(historyPointer + 1)
        } else {
          e.target.value = currentCommand
          setHistoryPointer(history.length)
        }
      } else if (historyPointer === history.length) {
        setCurrentCommand(e.target.value)
      }
    }
  }

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
          <CommandContainer>
            <CommandInput onKeyDown={handleCommandInput} />
          </CommandContainer>
        </LogList>
      }
    />
  )
}

export default Log
