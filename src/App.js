import React from 'react'
import styled, { createGlobalStyle } from 'styled-components'
import Markdown from 'markdown-to-jsx'

import CodeEditor from './modules/code-editor/CodeEditor'
import Result from './modules/result/Result'
import Goal from './modules/goal/Goal'

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css?family=Roboto&display=swap');

  body {
    margin: 0;
    padding: 0 2em;
    font-family: 'Roboto', sans-serif;
    font-size: 16px;
    background-color: #626262;
    color: #ddd;
  }
`

const AppContainer = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
`

const Title = styled.h1`
  font-size: 4em;
  font-weight: normal;
  text-shadow: 0 0 8px #0006;
  margin-bottom: 0;
`

const Description = styled.p`
  font-size: 1.5em;
  font-weight: normal;
  text-shadow: 0 0 8px #0006;
  margin-top: 2em;
  margin-bottom: 2em;
`

const Tasks = styled.div`
  display: flex;
  flex-direction: column;
  margin: auto;
`

const TaskDescription = styled(Description)`
  margin: 0;
  text-align: left;
  opacity: 0.4;

  &.current {
    opacity: 1;
  }
`

const ModuleContainer = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  flex-flow: row wrap;
  flex: 1 0 auto;
  width: 100%;
  height: 100%;
  max-width: 1200px;
  margin-top: 2em;
`

const title = 'Kloss ned skråplan'
const description =
  'Her skal du simulere en kloss som sklir ned et skråplan uten friksjon.'
const tasks = [
  {
    description:
      'Lag en variabel som heter **b** og har **9.81** som verdi _(Hint står i Hjelp under)_',
    help:
      '**a = 1.23**: Definere en variabel **a** med\n          verdi **1.23**\n\n(Legg merke til at man bruker punktum "." og ikke komma "," for desimaltall)',
  },
  {
    description:
      'Lag en variabel med delta tid som heter **dt** og har **0.01** som verdi',
    help:
      '**a = 1.23**: Definere en variabel **a** med\n          verdi **1.23**\n\n(Legg merke til at man bruker punktum "." og ikke komma "," for desimaltall)',
  },
]
let currentTask = 1

function App() {
  return (
    <>
      <GlobalStyle />
      <AppContainer>
        <Title>
          <Markdown>{title}</Markdown>
        </Title>
        <Description>
          <Markdown>{description}</Markdown>
        </Description>
        <Tasks>
          {tasks.map((task, i) => (
            <TaskDescription key={task.description} className={currentTask === i + 1 ? 'current' : ''}>
              {<Markdown>{`Oppgave ${i + 1}: ${task.description}`}</Markdown>}
            </TaskDescription>
          ))}
        </Tasks>
        <ModuleContainer>
          <CodeEditor />
          <Result />
          <Goal />
        </ModuleContainer>
      </AppContainer>
    </>
  )
}

export default App
