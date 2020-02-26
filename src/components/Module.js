import React from 'react'
import styled from 'styled-components'

const ModuleContainer = styled.div`
  cursor: move;
`

const Title = styled.h1`
  font-size: 1.3em;
  font-weight: normal;
  margin-bottom: 0.5em;
`

const ModuleContent = styled.div`
  display: flex;
  background: #222;
  border-radius: 5px;
  box-shadow: 0 0 8px #0005;
  cursor: default;
`

const ModuleResize = styled.span``

function Module({ title, children, content = null, after = null, ...props }) {
  return (
    <ModuleContainer {...props}>
      <Title>{title}</Title>
      <ModuleContent
        className="module-content"
        onMouseDown={e => e.stopPropagation()}
      >
        {content}
      </ModuleContent>
      {after}
      {children}
    </ModuleContainer>
  )
}

export default Module
