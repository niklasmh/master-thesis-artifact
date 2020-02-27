import React, { useState, useEffect } from 'react'
import styled, { createGlobalStyle } from 'styled-components'
import Markdown from 'markdown-to-jsx'
import GridLayout from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import { useDispatch } from 'react-redux'

import CodeEditor from './modules/code-editor/CodeEditor'
import Result from './modules/result/Result'
import Goal from './modules/goal/Goal'
import Values from './modules/values/Values'

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css?family=Roboto|Roboto+Mono&display=swap');

  body {
    margin: 0;
    padding: 0 2em 8em;
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
const code = `# Constants
g = -9.81 # Gravity
dt = 0.01 # Delta time in seconds
t_tot = 5 # Total time (-1 is infinite)

ball = Ball(x=0, y=0)
ball_red = Ball(x=100, y=0, color='red')
x, y = 0, 0
vx, vy = 4, 0
ax, ay = 0, g

def loop(t):
  # Make variables writable
  global x, y, vx, vy

  # Change velocity
  vx += ax*dt
  vy += ay*dt

  # Change position
  x += vx*dt
  y += vy*dt

  # Set ball position
  ball.y = y * 100 + ball.y0
  ball.x = x * 100 + ball.x0

  if ball.y < -100 or ball.y > 100:
    y -= vy*dt
    vy = -vy
  if ball.x < -190 or ball.x > 190:
    x -= vx*dt
    vx *= -1

def end():
  print("After", t_tot)
  print("seconds: y =", y, 1/2*g*t_tot**2)
  print("Ball y =", ball.y)

blockPrint()
for __i__ in range(1, 10 + 1):
  loop(__i__ * dt)
enablePrint()
end()
`
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
const margin = 64
let prevResultCanvasSize = { w: 0, h: 0 }
let prevGoalCanvasSize = { w: 0, h: 0 }
let prevValuesSize = { w: 0, h: 0 }

function App() {
  const dispatch = useDispatch()
  const [layout, setLayout] = useState([
    {
      i: 'code-editor',
      x: 0,
      y: 0,
      w: 6,
      h: 6,
      minW: 4,
      minH: 4,
      maxH: 10,
    },
    {
      i: 'result',
      x: 6,
      y: 0,
      w: 3,
      h: 3,
      minW: 2,
      minH: 2,
      maxH: 10,
    },
    {
      i: 'goal',
      x: 9,
      y: 0,
      w: 3,
      h: 3,
      minW: 2,
      minH: 2,
      maxH: 10,
    },
    {
      i: 'values',
      x: 6,
      y: 5,
      w: 3,
      h: 3,
      minW: 2,
      minH: 2,
      maxH: 10,
      isResizable: true,
    },
  ])

  const [codeEditorSize, setCodeEditorSize] = useState({
    w: layout[0].w * (50 + margin * 0.7) - margin,
    h: layout[0].h * (50 + margin) - margin * 1.75,
  })

  useEffect(() => {
    layout.forEach(e => {
      switch (e.i) {
        case 'code-editor':
          setCodeEditorSize({
            w: e.w * (50 + margin * 0.7) - margin,
            h: e.h * (50 + margin) - margin * 1.75,
          })
          break
        case 'result':
          const resultSize = {
            w: e.w * (50 + margin * 0.7) - margin,
            h: e.h * (50 + margin) - margin * 1.75,
          }
          if (
            prevResultCanvasSize.w !== resultSize.w ||
            prevResultCanvasSize.h !== resultSize.h
          ) {
            dispatch({
              type: 'setResultCanvasSize',
              size: resultSize,
            })
            prevResultCanvasSize = resultSize
          }
          break
        case 'goal':
          const goalSize = {
            w: e.w * (50 + margin * 0.7) - margin,
            h: e.h * (50 + margin) - margin * 1.75,
          }
          if (
            prevGoalCanvasSize.w !== goalSize.w ||
            prevGoalCanvasSize.h !== goalSize.h
          ) {
            dispatch({
              type: 'setGoalCanvasSize',
              size: goalSize,
            })
            prevGoalCanvasSize = goalSize
          }
          break
        case 'values':
          const valuesSize = {
            w: e.w * (50 + margin * 0.7) - margin,
            h: e.h * (50 + margin) - margin * 2.25,
          }
          if (
            prevValuesSize.w !== valuesSize.w ||
            prevValuesSize.h !== valuesSize.h
          ) {
            dispatch({
              type: 'setValuesSize',
              size: valuesSize,
            })
            prevValuesSize = valuesSize
          }
          break
        default:
          break
      }
    })
  }, [layout, dispatch])

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
          layout={layout}
          cols={12}
          rowHeight={50}
          width={1200}
          margin={[margin, margin]}
          useCSSTransforms={false}
          onResize={setLayout}
        >
          <CodeEditor key="code-editor" size={codeEditorSize} code={code} />
          <Result key="result" />
          <Goal key="goal" />
          <Values key="values" />
        </ModuleContainer>
      </AppContainer>
    </>
  )
}

export default App
