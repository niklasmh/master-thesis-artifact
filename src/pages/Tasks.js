import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import Markdown from 'markdown-to-jsx'
import GridLayout from 'react-grid-layout'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import * as firebase from 'firebase/app'
import { useDocumentData } from 'react-firebase-hooks/firestore'

import { Title, SubTitle, Paragraph } from '../components/Typography'

import CodeEditor from '../modules/code-editor/CodeEditor'
import Result from '../modules/result/Result'
import Goal from '../modules/goal/Goal'
import Values from '../modules/values/Values'
import Log from '../modules/log/Log'

const TasksContainer = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  min-width: 1200px;
  width: 100%;
`

const Description = styled(Paragraph)`
  font-size: 1.5em;
  margin-top: 0;
  margin-bottom: 2em;
  color: #ddd;
`

const Tasks = styled.div`
  display: flex;
  flex-direction: column;
  margin: auto;
  margin-bottom: 2em;
`

const TaskDescription = styled(Description)`
  margin: 0;
  text-align: left;
  align-self: flex-start;
  opacity: 0.4;
  color: #fff;

  &.current {
    opacity: 1;
    position: relative;

    ::before {
      content: '►';
      position: absolute;
      right: calc(100% + 10px);
    }
  }
`

const ModuleContainer = styled(GridLayout)`
  flex: 1 1 auto;
  width: 100%;
  height: 100%;
  max-width: 1200px;
  position: relative;

  --nr: 3;
  --nc: 12;
  --bx: ${props => props.margin[0] + 'px'};
  --by: ${props => props.margin[1] + 'px'};
  --gx: transparent calc(100% - var(--bx)), #626262 0;
  --gy: transparent calc(100% - var(--by)), #626262 0;

  background: linear-gradient(to right, var(--gx)),
    linear-gradient(to bottom, var(--gy)),
    ${props => (props.edit ? '#0001' : 'transparent')};
  background-size: calc(
        (100% - var(--bx) * (var(--nc) + 1)) / var(--nc) + var(--bx)
      )
      100%,
    100% ${props => `${props.rowHeight + props.margin[1]}px`};
  background-position: var(--bx) 0, 0 var(--by);
`

const Disabled = styled.div`
  display: flex;
  flex-flow: row wrap;
`

const Checked = styled.span`
  color: lime;
`

const Failed = styled.span`
  color: red;
`

const marginX = 32
const marginY = 16
const colWidth = 50
const rowHeight = 80
const sizeFactorW = 1.475
const sizeFactorH = 1
const sizeOffFactorW = 0.95
const sizeOffFactorH = 4
let prevResultCanvasSize = { w: 0, h: 0 }
let prevGoalCanvasSize = { w: 0, h: 0 }
let prevValuesSize = { w: 0, h: 0 }
let prevLogSize = { w: 0, h: 0 }
const defaultInitialLayout = [
  {
    i: 'code-editor',
    x: 0,
    y: 0,
    w: 6,
    h: 6,
    minW: 4,
    minH: 3,
    maxH: 10,
  },
  {
    i: 'result',
    x: 9,
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
    y: 3,
    w: 3,
    h: 3,
    minW: 2,
    minH: 2,
    maxH: 10,
  },
  {
    i: 'values',
    x: 6,
    y: 0,
    w: 3,
    h: 3,
    minW: 2,
    minH: 2,
    maxH: 10,
  },
  {
    i: 'log',
    x: 6,
    y: 1,
    w: 6,
    h: 3,
    minW: 2,
    minH: 2,
    maxH: 10,
  },
]
const allVisible = defaultInitialLayout.map(e => e.i)

function TasksPage() {
  const dispatch = useDispatch()
  const { userData } = useSelector(state => state.user)
  const [task, setTask] = useState({
    title: '',
    description: '',
    code: '',
    tests: [],
  })
  const [testsPassed, setTestsPassed] = useState([])
  const [currentTest, setCurrentTest] = useState(0)
  const [width] = useState(1200)
  const [edit, setEdit] = useState(false)
  const [layout, setLayout] = useState(defaultInitialLayout)
  const [visible, setVisible] = useState(allVisible)

  useEffect(() => {
    if (userData) {
      setEdit(userData.isTeacher)
    }
  }, [userData])

  const { id } = useParams()
  const [taskData, loadingTaskData] = useDocumentData(
    firebase
      .firestore()
      .collection('tasks')
      .doc(id)
  )

  const [codeEditorSize, setCodeEditorSize] = useState({
    w: colWidth + marginX * sizeFactorW - marginX * sizeOffFactorW,
    h: rowHeight + marginY * sizeFactorH - marginY * sizeOffFactorH,
  })

  const testsFeedback = (i, passed) => {
    setTestsPassed(tests => {
      const newTests = tests.slice(0)
      if (i >= newTests.length) {
        newTests.push(passed)
      } else {
        newTests[i] = passed
      }
      return newTests
    })
  }

  useEffect(() => {
    if (taskData && task.title === '') {
      taskData.code = taskData.code.replace(/\\n/g, '\n')
      setTask(taskData)
      if (taskData.tests) {
        setTestsPassed(taskData.tests.map(_ => undefined))
      }
      try {
        if (taskData.layout) {
          const l = JSON.parse(taskData.layout)
          setVisible(l.map(e => e.i))
          setLayout(l)
          const n = {
            w:
              l[0].w * (colWidth + marginX * sizeFactorW) -
              marginX * sizeOffFactorW,
            h:
              l[0].h * (rowHeight + marginY * sizeFactorH) -
              marginY * sizeOffFactorH,
          }
          setCodeEditorSize(n)
        }
      } catch (ex) {}
    }
  }, [taskData, task.title])

  useEffect(() => {
    layout.forEach(e => {
      const size = {
        w: e.w * (colWidth + marginX * sizeFactorW) - marginX * sizeOffFactorW,
        h: e.h * (rowHeight + marginY * sizeFactorH) - marginY * sizeOffFactorH,
      }
      switch (e.i) {
        case 'code-editor':
          setCodeEditorSize(size)
          break
        case 'result':
          if (
            prevResultCanvasSize.w !== size.w ||
            prevResultCanvasSize.h !== size.h
          ) {
            dispatch({
              type: 'setResultCanvasSize',
              size,
            })
            prevResultCanvasSize = size
          }
          break
        case 'goal':
          if (
            prevGoalCanvasSize.w !== size.w ||
            prevGoalCanvasSize.h !== size.h
          ) {
            dispatch({
              type: 'setGoalCanvasSize',
              size,
            })
            prevGoalCanvasSize = size
          }
          break
        case 'values':
          if (prevValuesSize.w !== size.w || prevValuesSize.h !== size.h) {
            dispatch({
              type: 'setValuesSize',
              size,
            })
            prevValuesSize = size
          }
          break
        case 'log':
          if (prevLogSize.w !== size.w || prevLogSize.h !== size.h) {
            dispatch({
              type: 'setLogSize',
              size: size,
            })
            prevLogSize = size
          }
          break
        default:
          break
      }
    })
  }, [layout, dispatch])

  const removeFromLayout = id => {
    setLayout(layout => layout.filter(e => e.i !== id))
    setVisible(visible => visible.filter(e => e !== id))
  }

  const addToLayout = id => {
    const {
      minW = 2,
      minH = 2,
      maxH = 10,
      x = Math.floor(Math.random() * 10),
      y = 0,
      w = 3,
      h = 3,
      ...rest
    } = defaultInitialLayout.find(e => e.i === id) || {}
    setLayout(layout => [
      ...layout,
      {
        i: id,
        x,
        y,
        w,
        h,
        minW,
        minH,
        maxH,
        ...rest,
      },
    ])
    setVisible(visible => [...visible, id])
  }

  return (
    <TasksContainer>
      {loadingTaskData ? (
        'Laster oppgave ...'
      ) : (
        <>
          <Title>
            <Markdown>{task.title}</Markdown>
          </Title>
          {task.description ? (
            <Description>
              <Markdown>{task.description}</Markdown>
            </Description>
          ) : null}
          <Tasks>
            {task.tests.map((test, i) => (
              <TaskDescription
                key={test.description}
                className={currentTest === i ? 'current' : ''}
              >
                {testsPassed[i] ? (
                  <Checked>✓ </Checked>
                ) : testsPassed[i] === false ? (
                  <Failed>✕ </Failed>
                ) : null}
                {<Markdown>{`Steg ${i + 1}: ${test.description}`}</Markdown>}
              </TaskDescription>
            ))}
          </Tasks>
          {edit && allVisible.length !== visible.length ? (
            <SubTitle>Verktøykasse</SubTitle>
          ) : null}
          {edit ? (
            <Disabled>
              {allVisible
                .filter(e => !visible.includes(e))
                .map(e => {
                  switch (e) {
                    case 'code-editor':
                      return (
                        <CodeEditor
                          key="code-editor"
                          size={codeEditorSize}
                          code={task.code || ''}
                          canOpen={true}
                          isClosed={true}
                          onOpen={() => addToLayout('code-editor')}
                        />
                      )
                    case 'result':
                      return (
                        <Result
                          key="result"
                          canOpen={true}
                          isClosed={true}
                          onOpen={() => addToLayout('result')}
                        />
                      )
                    case 'goal':
                      return (
                        <Goal
                          key="goal"
                          canOpen={true}
                          isClosed={true}
                          onOpen={() => addToLayout('goal')}
                        />
                      )
                    case 'values':
                      return (
                        <Values
                          key="values"
                          canOpen={true}
                          isClosed={true}
                          onOpen={() => addToLayout('values')}
                        />
                      )
                    case 'log':
                      return (
                        <Log
                          key="log"
                          canOpen={true}
                          isClosed={true}
                          onOpen={() => addToLayout('log')}
                        />
                      )
                    default:
                      return <div key={e}>Ukjent element</div>
                  }
                })}
            </Disabled>
          ) : null}
          {edit ? <SubTitle>Oppsett for oppgave</SubTitle> : null}
          {task.title ? (
            <ModuleContainer
              className="layout"
              layout={layout}
              edit={edit}
              cols={12}
              rowHeight={rowHeight}
              width={width}
              margin={[marginX, marginY]}
              useCSSTransforms={false}
              onResize={setLayout}
              onLayoutChange={l => {
                setLayout(l)
                window.layout = JSON.stringify(l)
              }}
            >
              {visible.map(e => {
                switch (e) {
                  case 'code-editor':
                    return (
                      <CodeEditor
                        key="code-editor"
                        size={codeEditorSize}
                        code={task.code || ''}
                        tests={task.tests.map(test =>
                          test.test.replace(/\\n/g, '\n')
                        )}
                        currentTest={currentTest}
                        testsFeedback={testsFeedback}
                        nextTest={curr => setCurrentTest(curr + 1)}
                        canClose={edit}
                        onClose={() => removeFromLayout('code-editor')}
                      />
                    )
                  case 'result':
                    return (
                      <Result
                        key="result"
                        canClose={edit}
                        onClose={() => removeFromLayout('result')}
                      />
                    )
                  case 'goal':
                    return (
                      <Goal
                        key="goal"
                        canClose={edit}
                        onClose={() => removeFromLayout('goal')}
                      />
                    )
                  case 'values':
                    return (
                      <Values
                        key="values"
                        canClose={edit}
                        onClose={() => removeFromLayout('values')}
                      />
                    )
                  case 'log':
                    return (
                      <Log
                        key="log"
                        canClose={edit}
                        onClose={() => removeFromLayout('log')}
                      />
                    )
                  default:
                    return <div key={e}>Ukjent element</div>
                }
              })}
            </ModuleContainer>
          ) : null}
        </>
      )}
    </TasksContainer>
  )
}

export default TasksPage
