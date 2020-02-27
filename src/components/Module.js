import React from 'react'
import styled from 'styled-components'

const ModuleContainer = styled.div`
  cursor: move;
  touch-action: none;
`

const Title = styled.h1`
  font-size: 1.3em;
  font-weight: normal;
  margin-bottom: 0.5em;
`

const ModuleContent = styled.div`
  display: flex;
  background: #222;
  border-radius: 6px;
  box-shadow: 0 0 8px #0005;
  cursor: default;
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

function Module({
  title,
  children,
  content = null,
  before = null,
  after = null,
  ...props
}) {
  return (
    <ModuleContainer {...props}>
      <Title>{title}</Title>
      {before ? <TopElement>{before}</TopElement> : null}
      <ModuleContent
        className="module-content"
        onMouseDown={e => e.stopPropagation()}
      >
        {content}
      </ModuleContent>
      {after ? <BottomElement>{after}</BottomElement> : null}
      {children}
    </ModuleContainer>
  )
}

export default Module
