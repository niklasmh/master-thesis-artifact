import React from 'react'
import styled, { createGlobalStyle } from 'styled-components'

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    font-family: sans-serif;
  }
`

const AppContainer = styled.div`
  text-align: center;
`

function App() {
  return (
    <>
      <GlobalStyle />
      <AppContainer>Hello</AppContainer>
    </>
  )
}

export default App
