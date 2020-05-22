import React from 'react'
import styled, { css } from 'styled-components'

const ModuleContainer = styled.div`
  cursor: move;
  touch-action: none;
  position: relative;

  ${(props) =>
    props.isClosed
      ? css`
          background: #0002;
          cursor: default;
          border-radius: 6px;
          padding: 0 14px;
          padding-right: 100px;
          display: flex;
          margin: 1em;

          button {
            margin-top: 10px;
          }
        `
      : ''}
`

const Title = styled.h1`
  font-size: 1.3em;
  font-weight: normal;
  margin: 0.5em 0;
`

const ModuleContent = styled.div`
  display: flex;
  flex-direction: column;
  background: #202124;
  border-radius: 6px;
  box-shadow: ${(props) => (props.outerShadow ? '0 0 8px #0005' : 'none')};
  cursor: default;

  .light & {
    background: #fff;
  }
`

const TopElement = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: row;
  justify-content: center;
`

const BottomElement = styled(TopElement)`
  position: absolute;
  top: 100%;
`

const Close = styled.button`
  color: red;
  margin-right: auto;
`

const Open = styled.button`
  color: lime;
  margin-left: auto;
`

function Module({
  title,
  children,
  content = null,
  before = null,
  after = null,
  width = 'auto',
  height = 'auto',
  isClosed = false,
  onClose = null,
  onOpen = null,
  outerShadow = true,
  ...props
}) {
  return (
    <ModuleContainer
      {...props}
      isClosed={isClosed}
      className={`widget-number ${props.className}`}
    >
      <Title>{title}</Title>
      {before || onClose || onOpen ? (
        <TopElement>
          {onClose ? <Close onClick={onClose}>Fjern</Close> : null}
          {before}
          {onOpen ? <Open onClick={onOpen}>Legg til</Open> : null}
        </TopElement>
      ) : null}
      {isClosed ? null : (
        <>
          <ModuleContent
            outerShadow={outerShadow}
            className="module-content"
            style={{ height, width }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {content}
          </ModuleContent>
          {after ? <BottomElement>{after}</BottomElement> : null}
          {children}
        </>
      )}
    </ModuleContainer>
  )
}

export default Module
