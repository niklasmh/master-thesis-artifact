import React from 'react'
import styled from 'styled-components'

const ModuleContainer = styled.div`
  display: flex;
  flex: 1 1 300px;
  flex-direction: column;
  margin: 2em;
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
`

function Module({ title, className = '', children, after = null }) {
  return (
    <ModuleContainer>
      <Title>{title}</Title>
      <ModuleContent className={className}>{children}</ModuleContent>
      {after}
    </ModuleContainer>
  )
}

export default Module
