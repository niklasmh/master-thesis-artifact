import React, { useState } from 'react'
import styled, { createGlobalStyle } from 'styled-components'
import Markdown from 'markdown-to-jsx'
import GridLayout from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

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

  button {
    appearance: none;
    background-color: #222;
    box-shadow: 0 0 8px #0004;
    color: white;
    padding: 0.5em 1em;
    margin: 1em;
    border-radius: 3px;
    border: none;
    cursor: pointer;
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

const ModuleContainer = styled(GridLayout)`
  flex: 1 1 auto;
  width: 100%;
  height: 100%;
  max-width: 1200px;
  position: relative;
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
const margin = 32

function App() {
  const [codeEditorSize, setCodeEditorSize] = useState({
    w: 400 - margin * 2,
    h: 480 - 120,
  })
  const [resultSize, setResultSize] = useState({
    w: 400 - margin * 2,
    h: 320 - 120,
  })
  const [goalSize, setGoalSize] = useState({
    w: 400 - margin * 2,
    h: 320 - 120,
  })
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
            <TaskDescription
              key={task.description}
              className={currentTask === i + 1 ? 'current' : ''}
            >
              {<Markdown>{`Oppgave ${i + 1}: ${task.description}`}</Markdown>}
            </TaskDescription>
          ))}
        </Tasks>
        <ModuleContainer
          className="layout"
          layout={[
            {
              i: 'code-editor',
              x: 0,
              y: 0,
              w: 2,
              h: 6,
              minW: 2,
              minH: 4,
              maxH: 20,
            },
            { i: 'result', x: 2, y: 0, w: 2, h: 4, isResizable: false },
            { i: 'goal', x: 4, y: 0, w: 2, h: 4, isResizable: false },
          ]}
          cols={6}
          rowHeight={50}
          width={1200}
          margin={[margin, margin]}
          useCSSTransforms={false}
          onResize={modules => {
            modules.forEach(e => {
              switch (e.i) {
                case 'code-editor':
                  setCodeEditorSize({
                    w: e.w * 200 - margin * 2,
                    h: e.h * 80 - 120,
                  })
                  break
                case 'result':
                  setResultSize({
                    w: e.w * 200 - margin * 2,
                    h: e.h * 80 - 120,
                  })
                  break
                case 'goal':
                  setGoalSize({ w: e.w * 200 - margin * 2, h: e.h * 80 - 120 })
                  break
              }
            })
          }}
        >
          <CodeEditor key="code-editor" size={codeEditorSize} />
          <Result key="result" size={resultSize} />
          <Goal key="goal" size={goalSize} />
        </ModuleContainer>
      </AppContainer>
    </>
  )
}

export default App
