import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import Icon from '../components/Icon'
import { RenderedMarkdown } from '../components/TextEditor'
import mdIt from 'markdown-it'
import mk from 'markdown-it-katex'
import hljs from 'highlight.js'
import 'highlight.js/styles/vs2015.css'

const md = mdIt({
  langPrefix: 'language-',
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(lang, str).value
      } catch (ex) {}
    }

    return ''
  },
})
md.use(mk)

const HelpButton = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  font-size: 1.5em;
  transform: translate(-50%, -50%);
  cursor: pointer;
  color: ${(props) => (props.dirty ? '#fff' : '#ffc5a4')};
  box-shadow: 0 0 0 5px
    ${(props) => (props.dirty ? 'transparent' : '#ff830082')};
  border-radius: 50%;

  > i {
    display: block;
  }

  :hover,
  &.open {
    box-shadow: 0 0 0 8px
      ${(props) => (props.dirty ? 'transparent' : '#ff830082')};
  }

  .light & {
    color: ${(props) => (props.dirty ? '#000' : '#0002ff96')};
    box-shadow: 0 0 0 5px
      ${(props) => (props.dirty ? 'transparent' : '#0033ff45')};
    :hover,
    &.open {
      box-shadow: 0 0 0 8px
        ${(props) => (props.dirty ? 'transparent' : '#0033ff45')};
    }
  }
`

const HelpContent = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  display: ${(props) => (props.open ? 'block' : 'none')};
  width: ${(props) => props.width};
  border-radius: 6px;
  background: #1e1e1e;
  padding: 0 1em;
  margin: 1em;
  text-align: left;
  box-shadow: 0 0 20px -5px #0004;
  max-height: 80vh;
  overflow: auto;
  font-size: 0.9em;

  .light & {
    background: #fff;
  }

  & :not(pre) > code {
    background-color: #fff1;
  }
`

const HelpContainer = styled.div`
  position: ${(props) => (props.absolute ? 'absolute' : 'relative')};
  top: ${(props) => (props.bottom ? 'unset' : props.y)};
  bottom: ${(props) => (props.bottom ? props.y : 'unset')};
  left: ${(props) => (props.right ? 'unset' : props.x)};
  right: ${(props) => (props.right ? props.x : 'unset')};
  z-index: ${(props) => props.z};

  > ${HelpContent} {
    top: 0;
    left: ${(props) => (props.right ? 'unset' : 0)};
    right: ${(props) => (props.right ? 0 : 'unset')};
    transform: ${(props) =>
      props.center
        ? props.right
          ? 'translate(calc(50% + 1em), 0)'
          : 'translate(calc(-50% - 1em), 0)'
        : 'none'};
  }
`

export default function Help({
  title = '',
  children,
  md: isMarkdown = false,
  absolute = false,
  isOpen = false,
  isDirty = false,
  width = '420px',
  top = false,
  left = false,
  bottom = false,
  right = false,
  center = false,
  y = 0,
  x = 0,
  z = 2,
  ...props
}) {
  const [rendered, setRendered] = useState('')
  const [open, setOpen] = useState(isOpen)
  const [dirty, setDirty] = useState(isDirty)

  useEffect(() => {
    if (isMarkdown) {
      setRendered(md.render(children))
    }
  }, [isMarkdown, title, children])

  return (
    <HelpContainer
      absolute={absolute}
      top={top}
      left={left}
      bottom={bottom}
      right={right}
      x={x}
      y={y}
      z={z}
      center={center}
    >
      <HelpContent {...props} open={open} width={width}>
        {title ? <h1>{title}</h1> : null}
        {isMarkdown ? (
          <RenderedMarkdown dangerouslySetInnerHTML={{ __html: rendered }} />
        ) : (
          children
        )}
      </HelpContent>
      <HelpButton
        onClick={() => {
          setOpen((open) => !open)
          setDirty(false)
        }}
        dirty={dirty}
        className={open ? 'open' : ''}
      >
        {open ? (
          <Icon key="off" name="cancel" />
        ) : (
          <Icon key="on" name="help" />
        )}
      </HelpButton>
    </HelpContainer>
  )
}
