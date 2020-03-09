import React, { useEffect, useState, useRef } from 'react'
import styled from 'styled-components'
import { useSelector, useDispatch } from 'react-redux'
import Module from '../../components/Module'
import { preDefinedElementsLineCount } from '../code-editor/predefinitions'
import { translatePythonException } from '../../utils/translate-error-messages'

const StyledModule = styled(Module)`
  align-self: flex-start;

  .module-content {
    padding: 1em;
  }
`

const LogListContainer = styled.div`
  flex: 1 1 auto;
  white-space: pre-wrap;
  text-align: left;
  font-family: 'Roboto Mono', monospace;
  font-size: 0.8em;
  overflow-y: auto;
  position: relative;
  display: flex;
  flex-direction: column;
`

const LogList = styled.div`
  white-space: pre-wrap;
  text-align: left;
  display: block;
`

const LogMessage = styled.div`
  color: white;
  display: inline;
  word-break: break-word;
`

const WarningMessage = styled(LogMessage)`
  color: orange;
  background-color: #f801;
  display: block;
  padding: 3px 7px;
  border-radius: 3px;
  margin: 5px 0;
  box-shadow: inset 0 0 2px red;
`
const ErrorMessage = styled(WarningMessage)`
  color: red;
  background-color: #f001;
`
const InputMessage = styled(LogMessage)`
  color: orange;
`

const CommandContainer = styled.div`
  flex: 1 0 auto;
  display: flex;
  align-items: flex-start;

  ::before {
    content: '> ';
    margin-top: 2px;
  }
`

const CommandInput = styled.input`
  flex: 1 0 0;
  width: 100%;
  appearance: none;
  background: none;
  border: none;
  color: white;
  font-family: 'Roboto Mono', monospace;

  :focus {
    outline: none;
  }
`

function Log(props) {
  const { logSize, isPyodideReady, runCode, editor } = useSelector(
    state => state
  )
  const dispatch = useDispatch()
  const [log, setLog] = useState([])
  const [history, setHistory] = useState([])
  const [currentCommand, setCurrentCommand] = useState([])
  const [historyPointer, setHistoryPointer] = useState(0)
  const logListElement = useRef(null)
  const commandInputElement = useRef(null)

  useEffect(() => {
    const writeToLogFunction = (
      message,
      styledMessage = false,
      error = false
    ) => {
      let MessageType = null
      if (error) {
        if (error === 'warning') {
          console.warn(message)
          MessageType = WarningMessage
        } else {
          console.error(message)
          MessageType = ErrorMessage
        }
      } else {
        console.log(message)
        MessageType = LogMessage
      }
      if (styledMessage !== false) {
        setLog(log => [
          ...log,
          <MessageType key={log.length}>
            {styledMessage}
            {'\n'}
          </MessageType>,
        ])
      } else if (error) {
        setLog(log => [
          ...log,
          <MessageType key={log.length}>
            {translatePythonException(
              message,
              preDefinedElementsLineCount - 1,
              editor.current()
            )}
          </MessageType>,
        ])
      } else {
        setLog(log => [
          ...log,
          <MessageType key={log.length}>{message}</MessageType>,
        ])
      }
    }
    const onLogInput = message => {
      setLog(log => [
        ...log,
        <InputMessage key={log.length}>{message}</InputMessage>,
      ])
      //const promise = new Promise(resolve => {
      //  commandInputElement.current.focus()
      //  commandInputElement.current.addEventListener('keydown', e => {
      //    if (e.keyCode === 13) {
      //      resolve(e.target.value)
      //    }
      //  })
      //})
      //const output = await promise
      return window.prompt(message)
    }
    dispatch({
      type: 'setWriteToLogFunction',
      writeToLogFunction,
    })
    dispatch({
      type: 'setOnLogInput',
      onLogInput,
    })

    /** /
    const hijack = (context, oldFunction, runBefore) => {
      return function(...args) {
        runBefore.apply(context, args)
        oldFunction.apply(context, args)
      }
    }
    const logToDisplay = (messages, type) => {
      //const [row, col] = new Error().stack
      //  .split('\n')[4]
      //  .replace(/[()]/g, '')
      //  .split(':')
      //  .slice(-2)
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
    // TODO: Make errors display in the log module
    console.error = hijack(console, console.error, (...args) => {
      logToDisplay(args, 'error')
    })
    /**/
  }, [dispatch, commandInputElement, editor])

  useEffect(() => {
    logListElement.current.scrollTop = logListElement.current.scrollHeight
  }, [log, logListElement])

  async function handleCommandInput(e) {
    if (isPyodideReady) {
      if (e.keyCode === 13) {
        e.preventDefault()
        const code = e.target.value
        if (code.length) {
          window.pyodide.globals.print(`> ${code}`, {})
          const { output = '' } = await runCode(code, false)
          switch (typeof output) {
            case 'number':
              window.pyodide.globals.print(output, { styleArgs: true })
              break
            default:
              if (output)
                window.pyodide.globals.print(output, { styleArgs: true })
              break
          }
          if (history[history.length - 1] !== code) {
            setHistoryPointer(history.length + 1)
            setHistory(history => [...history, code])
          } else {
            setHistoryPointer(history.length)
          }
          commandInputElement.current.value = ''
          setCurrentCommand('')
        }
      } else if (e.keyCode === 38) {
        e.preventDefault()
        if (historyPointer === history.length) {
          setCurrentCommand(commandInputElement.current.value)
        }
        if (historyPointer - 1 >= 0) {
          commandInputElement.current.value = history[historyPointer - 1]
          setHistoryPointer(historyPointer - 1)
        } else {
          commandInputElement.current.value = history[0] || ''
          setHistoryPointer(0)
        }
      } else if (e.keyCode === 40) {
        e.preventDefault()
        if (historyPointer + 1 < history.length) {
          commandInputElement.current.value = history[historyPointer + 1]
          setHistoryPointer(historyPointer + 1)
        } else {
          commandInputElement.current.value = currentCommand
          setHistoryPointer(history.length)
        }
      } else if (historyPointer === history.length) {
        setCurrentCommand(commandInputElement.current.value)
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
        <>
          <LogListContainer
            style={{ height: logSize.h + 'px' }}
            ref={logListElement}
          >
            <LogList>{log}</LogList>
            <CommandContainer
              onClick={() => commandInputElement.current.focus()}
            >
              <CommandInput
                ref={commandInputElement}
                onKeyDown={handleCommandInput}
              />
            </CommandContainer>
          </LogListContainer>
        </>
      }
    />
  )
}

export default Log
