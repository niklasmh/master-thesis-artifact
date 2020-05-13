import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { ControlledEditor } from '@monaco-editor/react'
import { useSelector } from 'react-redux'

export const Button = styled.button`
  padding: 0.6em 0.6em;
  margin: 0.5em 0;
  box-shadow: none;
  background: #0002;
  border-radius: 6px;
`

export const Input = styled.input`
  font-size: ${(props) => props.size};
  text-align: ${(props) => props.align || 'left'};
  width: ${(props) => props.width || 'unset'};
  color: #ddd;
  background-color: #fff0;
  border-radius: 6px;
  border: none;
  padding: 0.2em 0;
  margin: 0.5em 0;
  outline: none;
  text-shadow: ${(props) => (props.shadow ? '0 4px 8px #0004' : 'none')};

  ::placeholder {
    color: #fff8;

    .light & {
      color: #2222;
      text-shadow: none;
    }
  }

  .light & {
    color: #222;
  }
`

export const TextArea = styled.textarea`
  font-size: ${(props) => props.size};
  background-color: #fff2;
  border-radius: 6px;
  border: none;
  color: #fff;
  margin: 0.5em 0;
  padding: 0.5em;
  width: ${(props) => props.width || 'unset'};
  height: ${(props) => props.height || 'unset'};
  min-height: ${(props) => props.minHeight || 'unset'};
  text-align: ${(props) => props.align || 'left'};
  text-shadow: ${(props) => (props.shadow ? '0 4px 8px #0004' : 'none')};
  outline: none;

  ::placeholder {
    color: #fff8;

    .light & {
      color: #0008;
    }
  }

  .light & {
    background-color: #fff;
    color: #000;
  }
`

export function CodeEditor(props) {
  const { theme } = useSelector((state) => state.user)

  return (
    <ControlledEditor
      width={'100%'}
      height={'200px'}
      language="python"
      theme={theme}
      {...props}
      options={{
        renderWhitespace: 'boundary',
        scrollbar: {
          alwaysConsumeMouseWheel: false,
        },
        scrollBeyondLastLine: false,
        wordWrap: true,
        mouseWheelZoom: true,
        minimap: {
          enabled: false,
        },
        ...props.options,
      }}
    />
  )
}

const StyledRadioGroup = styled.div`
  display: flex;
  flex-direction: ${(props) => props.direction || 'column'};
  align-items: flex-start;
  margin-top: 1em;
`

const StyledRadio = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`

const RadioInput = styled.input.attrs({ type: 'radio' })`
  cursor: pointer;
  width: 1.5em;
  height: 1.5em;

  :disabled,
  :disabled + label {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const RadioLabel = styled.label`
  cursor: pointer;
`

export function RadioGroup({
  labels = [],
  checked = -1,
  defaultChecked = -1,
  onChange = () => {},
  disabled = false,
  ...props
}) {
  const [randomID, setRandomID] = useState(0)

  useEffect(() => {
    setRandomID('radio-' + Math.floor(Math.random() * 100000))
  }, [])

  return (
    <StyledRadioGroup {...props}>
      {labels.map((label, i) => {
        return (
          <StyledRadio key={label}>
            {checked === -1 ? (
              <RadioInput
                id={randomID + i}
                name={randomID}
                disabled={disabled}
                defaultChecked={defaultChecked === i}
                onChange={() => onChange(i)}
              />
            ) : (
              <RadioInput
                id={randomID + i}
                name={randomID + '-controlled'}
                disabled={disabled}
                checked={checked === i}
                onChange={() => onChange(i)}
              />
            )}
            <RadioLabel htmlFor={randomID + i}>{label}</RadioLabel>
          </StyledRadio>
        )
      })}
    </StyledRadioGroup>
  )
}
