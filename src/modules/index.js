import React, { useEffect, useState, useRef } from 'react'
import styled from 'styled-components'
import Markdown from 'markdown-to-jsx'
import GridLayout from 'react-grid-layout'
import { useDispatch, useSelector } from 'react-redux'

import { SubTitle, Paragraph } from '../components/Typography'

import { preDefinedElements } from './code-editor/predefinitions'
import CodeEditor from './code-editor/CodeEditor'
import Result from './result/Result'
import Goal from './goal/Goal'
import Values from './values/Values'
import Log from './log/Log'
import Loading from '../components/Loading'

const marginX = 32
const marginY = 16
const colWidth = 50
const rowHeight = 80
const sizeFactorW = 1.475
const sizeFactorH = 1
const sizeOffFactorW = 0.95
const sizeOffFactorH = 4
let prevCodeEditorSize = { w: 0, h: 0 }
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
    y: 3,
    w: 3,
    h: 3,
    minW: 2,
    minH: 2,
    maxH: 10,
  },
]
const allVisible = defaultInitialLayout.map((e) => e.i)

export const loopCodeSplit = '\n#### LOOP ####'

export function indentCode(code, indents = 1, spacesPerIndent = 4) {
  const spaces = ' '.repeat(indents * spacesPerIndent)
  return spaces + code.split('\n').join('\n' + spaces)
}

/*
g = 9.81
dt = 0.01
ay = g
vy = 0
y = 0
ball = Ball(x=0, y=0, color="red", r=0.5)
*/

function getVariables(code, indents = 0, spacesPerIndent = 4) {
  const space = ' '.repeat(spacesPerIndent)
  const spaces = space.repeat(indents)
  const lines = code.split('\n')
  const variableRegex = new RegExp('^' + spaces + '[\\w_][\\w_\\d]* ?=')
  return [
    ...new Set(
      lines
        .filter((line) => variableRegex.test(line))
        .map((line) => line.split('=')[0].trim())
        .filter((line) => line.slice(-1)[0] !== '_')
    ),
  ]
}

function makeAllVariablesChangeableInLoop(
  code,
  indents = 0,
  spacesPerIndent = 4,
  useVariables = false
) {
  const space = ' '.repeat(spacesPerIndent)
  const spaces = space.repeat(indents)
  const variables = useVariables
    ? useVariables
    : getVariables(code, indents, spacesPerIndent)
  const lines = code.split('\n')
  const loopRegex = new RegExp('^' + spaces + 'def loop\\(')
  return lines
    .map((line) => {
      if (loopRegex.test(line) && variables.length)
        return (
          line +
          '\n' +
          spaces +
          space +
          (indents ? 'nonlocal ' : 'global ') +
          variables.join(', ')
        )
      return line
    })
    .join('\n')
}

export function wrapSolutionCode(
  hiddenCode,
  solutionCode,
  solutionLoopCode = ''
) {
  const hasLoopCodeFromBefore = (hiddenCode + '\n' + solutionCode).includes(
    '\ndef loop('
  )
  const hasLoopCode = !!(hasLoopCodeFromBefore || solutionLoopCode)
  const needLoopFunction = !hasLoopCodeFromBefore && !!solutionLoopCode
  return `
__loop__ = False
__dt__ = 0.01
__t_tot__ = 1
__solution_elements__ = []
__solution_scope__ = {}
def __init_solution_code__():
    global __loop__, __dt__, __t_tot__, __solution_elements__, __solution_scope__
${indentCode(
  preDefinedElements.replace(/__elements__/g, '__solution_elements__'),
  1
)}
${indentCode(hiddenCode, 1)}
${indentCode(solutionCode, 1)}
${
  needLoopFunction
    ? `    def loop(t):
` + indentCode(solutionLoopCode, 2)
    : ''
}
    __solution_scope__ = locals()
    __dt__ = dt
    __t_tot__ = t_tot
    __loop__ = ${hasLoopCode ? 'loop' : 'False'}
__init_solution_code__()
`
}

const getAlpha = (n) => String.fromCharCode(97 + ((n - 1) % 26))

function wrapTestCode(testCode, sectionNo, subgoalNo) {
  return `
def test():
    section = ${sectionNo + 1}
    subgoal = "${getAlpha(subgoalNo + 1)}"
    t = 0
    try:
        def defined(variable):
            return variable in globals()
        def simulate(time=0, steps=1):
            nonlocal t
            if time:
              while t < time:
                  t += dt
                  loop(t)
                  __loop__(t)
            else:
              for i in range(steps):
                  t += dt
                  loop(t)
                  __loop__(t)
        def solution(variable):
            if "." in variable:
                levels = variable.split(".")
                scope = __solution_scope__
                for level in levels:
                    if isinstance(scope, list) or isinstance(scope, dict):
                      scope = scope[level]
                    else:
                      scope = getattr(scope, level)
                return scope
            return __solution_scope__[variable]
${indentCode(testCode, 2)}
        print(f"Du klarte deloppgave {section}. {subgoal})!")
        return True
    except BaseException as e:
        raise e
test()
`
}

export function wrapLoopCode(loopCode) {
  return `def loop(t):
${indentCode(loopCode, 1)}
    __keep_this_line__ = 0
`
}

export default function TaskCodeEnvironment({
  layout: initialLayout = defaultInitialLayout,
  onLayoutChange = () => {},
  edit = false,
  task = null,
  sectionNo = 0,
  subgoalNo = 0,
  sectionNoMax = 0,
  subgoalNoMax = 0,
  updatedTask = 0,
  onFinishedSubgoal = () => {},
  onUnFinishedSubgoal = () => {},
  engine = {},
  ...props
}) {
  const { editor, loopEditor, runCode, isEngineReady, clearLog } = useSelector(
    (state) => state.task
  )
  const dispatch = useDispatch()
  const [layout, setLayout] = useState(initialLayout)
  const [visible, setVisible] = useState(allVisible)
  const [attempts, setAttempts] = useState(0)
  const [currentStartCode, setCurrentStartCode] = useState('')
  const [currentLoopCode, setCurrentLoopCode] = useState('')
  const [currentHiddenCode, setCurrentHiddenCode] = useState('')
  const [currentSolutionCode, setCurrentSolutionCode] = useState([''])
  const [width] = useState(1200)
  //console.log(task)

  useEffect(() => {
    setLayout(initialLayout)
  }, [initialLayout])

  const scriptsLoaded = useRef(new Set())
  const attepmtedToLoad = useRef(false)
  useEffect(() => {
    if (!attepmtedToLoad.current && engine.scripts && true) {
      async function loadScripts(scripts) {
        for (let {
          src,
          onload = () => {},
          onerror = () => {},
          loadAsync = false,
        } of scripts) {
          if (!scriptsLoaded.current.has(src)) {
            scriptsLoaded.current.add(src)
            if (document.querySelector(`script[src$="${src}"]`) === null) {
              await new Promise((resolve, reject) => {
                const scriptElement = document.createElement('script')
                scriptElement.type = 'text/javascript'
                scriptElement.onload = () => {
                  if (typeof onload === 'function') onload()
                  if (!loadAsync) resolve()
                }
                scriptElement.onerror = () => {
                  scriptsLoaded.current.remove(src)
                  if (typeof onerror === 'function') onerror()
                  reject()
                }
                scriptElement.src = src
                document.head.appendChild(scriptElement)
                if (loadAsync) resolve()
              })
            }
          }
        }
      }
      attepmtedToLoad.current = true
      loadScripts(engine.scripts)
    }
  }, [engine])

  const [codeEditorSize, setCodeEditorSize] = useState({
    w: colWidth + marginX * sizeFactorW - marginX * sizeOffFactorW,
    h: rowHeight + marginY * sizeFactorH - marginY * sizeOffFactorH,
  })

  useEffect(() => {
    if (task && 'title' in task) {
      try {
        const { hiddenCode: taskHiddenCode = '' } = task
        if (task.sections && task.sections.length > sectionNo) {
          const fixNewlines = (str) => str.replace(/\\n/g, '\n')
          const section = task.sections[sectionNo]
          const { hiddenCode: sectionHiddenCode = '' } = section
          if (section.subgoals && section.subgoals.length > subgoalNo) {
            dispatch({
              type: 'resetAttempts',
            })
            const subgoal = section.subgoals[subgoalNo]
            let {
              title = 'Steg',
              description = '',
              hiddenCode = '',
              predefinedCode = false,
              solutionCode = '',
              testCode = '',
            } = subgoal
            description = fixNewlines(description)
            hiddenCode = fixNewlines(
              [taskHiddenCode, sectionHiddenCode, hiddenCode].join('\n')
            )
            setCurrentHiddenCode(hiddenCode)
            predefinedCode =
              predefinedCode !== false ? fixNewlines(predefinedCode) : false
            solutionCode = fixNewlines(solutionCode)
            let [beforeLoop, solutionLoopCode] = solutionCode.split(
              loopCodeSplit
            )
            solutionCode = beforeLoop
            setCurrentSolutionCode([solutionCode, solutionLoopCode])
            testCode = fixNewlines(testCode)

            if (editor) {
              const editorCode = makeAllVariablesChangeableInLoop(
                editor.getValue()
              )
              let loopEditorCode = ''
              if (loopEditor) {
                loopEditorCode = makeAllVariablesChangeableInLoop(
                  wrapLoopCode(loopEditor.getValue()),
                  0,
                  4,
                  getVariables(editorCode)
                )
              }
              setCurrentStartCode(editorCode)
              setCurrentLoopCode(loopEditorCode)
            } else {
              setCurrentStartCode('')
              setCurrentLoopCode('')
            }

            dispatch({
              type: 'setCodeEditorRun',
              run: async (withTests = false) => {
                if (editor) {
                  const editorCode = makeAllVariablesChangeableInLoop(
                    editor.getValue()
                  )
                  let loopEditorCode = ''
                  if (loopEditor) {
                    loopEditorCode = makeAllVariablesChangeableInLoop(
                      wrapLoopCode(loopEditor.getValue()),
                      0,
                      4,
                      getVariables(editorCode)
                    )
                  }
                  await runCode(hiddenCode, true, true)
                  const { error = false } = await runCode(
                    editorCode,
                    false,
                    true,
                    editor
                  )
                  dispatch({
                    type: 'setWithError',
                    withError: error,
                  })
                  const { error: solutionError = false } = await runCode(
                    makeAllVariablesChangeableInLoop(
                      wrapSolutionCode(
                        hiddenCode,
                        solutionCode,
                        solutionLoopCode
                      ),
                      1
                    ),
                    false,
                    false
                  )
                  if (!error) {
                    if (loopEditorCode) {
                      const { error: loopError = false } = await runCode(
                        loopEditorCode,
                        false,
                        false,
                        loopEditor,
                        2
                      )
                      if (loopError) return false
                    }
                    if (withTests) {
                      clearLog()
                      const {
                        output = '',
                        error: testError = false,
                      } = await runCode(
                        wrapTestCode(
                          fixNewlines(testCode),
                          sectionNo,
                          subgoalNo
                        ),
                        false,
                        false
                      )
                      if (output === true) {
                        onFinishedSubgoal(
                          sectionNo,
                          subgoalNo,
                          sectionNoMax,
                          subgoalNoMax
                        )
                      } else {
                        onUnFinishedSubgoal(
                          sectionNo,
                          subgoalNo,
                          sectionNoMax,
                          subgoalNoMax
                        )
                      }
                      await runCode(hiddenCode, true, true)
                      await runCode(editorCode, false, true, editor)
                      await runCode(
                        makeAllVariablesChangeableInLoop(
                          wrapSolutionCode(
                            hiddenCode,
                            solutionCode,
                            solutionLoopCode
                          ),
                          1
                        ),
                        false,
                        false
                      )
                      await runCode(loopEditorCode, false, false, loopEditor, 2)
                    }
                  } else {
                    return false
                  }
                  return true
                }
                return false
              },
            })
            dispatch({ type: 'setCode', code: predefinedCode })
            dispatch({
              type: 'setSubgoal',
              subgoal: {
                title,
                description,
                hiddenCode,
                predefinedCode,
                solutionCode,
                testCode,
              },
            })
          }
        }
        if (task.layout) {
          const l = JSON.parse(task.layout)
          setVisible(l.map((e) => e.i))
          setLayout(l)
        }
      } catch (ex) {}
    }
  }, [
    task,
    sectionNo,
    subgoalNo,
    updatedTask,
    sectionNoMax,
    subgoalNoMax,
    runCode,
    editor,
    loopEditor,
  ])

  const prevSubgoalID = useRef('-')
  const prevCode = useRef('')
  useEffect(() => {
    const subgoalID = sectionNo + '-' + subgoalNo
    if (isEngineReady && subgoalID !== prevSubgoalID.current) {
      const code =
        currentHiddenCode +
        currentStartCode +
        currentLoopCode +
        currentSolutionCode
      if (code !== prevCode.current) {
        prevCode.current = code
        //console.log(currentHiddenCode)
        //console.log(currentStartCode)
        //console.log(currentLoopCode)
        //console.log(
        //  makeAllVariablesChangeableInLoop(
        //    wrapSolutionCode(currentHiddenCode, ...currentSolutionCode),
        //    1
        //  )
        //)
        prevSubgoalID.current = subgoalID
        const runCodes = async () => {
          await runCode(currentHiddenCode, true, true)
          const { error = false } = await runCode(
            currentStartCode,
            false,
            true,
            editor
          )
          if (!error && currentLoopCode) {
            await runCode(currentLoopCode, false, false, loopEditor, 2)
          }
          await runCode(
            makeAllVariablesChangeableInLoop(
              wrapSolutionCode(currentHiddenCode, ...currentSolutionCode),
              1
            ),
            false,
            false
          )
          dispatch({
            type: 'setTime',
            time: 0,
          })
          dispatch({
            type: 'setIsPlaying',
            isPlaying: true,
          })
          dispatch({
            type: 'setWithError',
            withError: error,
          })
        }
        runCodes()
      }
    }
  }, [
    runCode,
    currentStartCode,
    currentLoopCode,
    currentHiddenCode,
    currentSolutionCode,
    isEngineReady,
    sectionNo,
    subgoalNo,
  ])

  useEffect(() => {
    layout.forEach((e) => {
      const size = {
        w: e.w * (colWidth + marginX * sizeFactorW) - marginX * sizeOffFactorW,
        h: e.h * (rowHeight + marginY * sizeFactorH) - marginY * sizeOffFactorH,
      }
      switch (e.i) {
        case 'code-editor':
          if (
            prevCodeEditorSize.w !== size.w ||
            prevCodeEditorSize.h !== size.h
          ) {
            dispatch({
              type: 'setCodeEditorSize',
              size,
            })
            prevCodeEditorSize = size
          }
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

  const removeFromLayout = (id) => {
    setLayout((layout) => layout.filter((e) => e.i !== id))
    setVisible((visible) => visible.filter((e) => e !== id))
  }

  const addToLayout = (id) => {
    const {
      minW = 2,
      minH = 2,
      maxH = 10,
      x = Math.floor(Math.random() * 10),
      y = 0,
      w = 3,
      h = 3,
      ...rest
    } = defaultInitialLayout.find((e) => e.i === id) || {}
    setLayout((layout) => [
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
    setVisible((visible) => [...visible, id])
  }

  return (
    <TaskCodeEnvironmentContainer {...props}>
      {edit && allVisible.length !== visible.length ? (
        <SubTitle>Verktøykasse</SubTitle>
      ) : null}
      {edit ? (
        <Disabled>
          {allVisible
            .filter((e) => !visible.includes(e))
            .map((e) => {
              switch (e) {
                case 'code-editor':
                  return (
                    <CodeEditor
                      key="code-editor"
                      isClosed={true}
                      onOpen={() => addToLayout('code-editor')}
                    />
                  )
                case 'result':
                  return (
                    <Result
                      key="result"
                      isClosed={true}
                      onOpen={() => addToLayout('result')}
                    />
                  )
                case 'goal':
                  return (
                    <Goal
                      key="goal"
                      isClosed={true}
                      onOpen={() => addToLayout('goal')}
                    />
                  )
                case 'values':
                  return (
                    <Values
                      key="values"
                      isClosed={true}
                      onOpen={() => addToLayout('values')}
                    />
                  )
                case 'log':
                  return (
                    <Log
                      key="log"
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
      {isEngineReady ? null : (
        <>
          <SubTitle>
            Laster inn Python <Loading />
          </SubTitle>
          <Paragraph>Dette kan ta litt tid første gangen.</Paragraph>
        </>
      )}
      <ModuleContainer
        className="layout"
        edit={edit}
        layout={layout}
        cols={12}
        rowHeight={rowHeight}
        width={width}
        margin={[marginX, marginY]}
        useCSSTransforms={false}
        onResize={setLayout}
        onLayoutChange={(l) => {
          onLayoutChange(l)
          setLayout(l)
          window.layout = JSON.stringify(l)
        }}
      >
        {visible.map((e) => {
          switch (e) {
            case 'code-editor':
              return (
                <CodeEditor
                  key="code-editor"
                  onClose={edit ? () => removeFromLayout('code-editor') : null}
                />
              )
            case 'result':
              return (
                <Result
                  key="result"
                  onClose={edit ? () => removeFromLayout('result') : null}
                />
              )
            case 'goal':
              return (
                <Goal
                  key="goal"
                  onClose={edit ? () => removeFromLayout('goal') : null}
                />
              )
            case 'values':
              return (
                <Values
                  key="values"
                  onClose={edit ? () => removeFromLayout('values') : null}
                />
              )
            case 'log':
              return (
                <Log
                  key="log"
                  onClose={edit ? () => removeFromLayout('log') : null}
                />
              )
            default:
              return <div key={e}>Ukjent element</div>
          }
        })}
      </ModuleContainer>
    </TaskCodeEnvironmentContainer>
  )
}

const TaskCodeEnvironmentContainer = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 1200px;
  width: 100%;
`

const ModuleContainer = styled(GridLayout)`
  flex: 1 1 auto;
  width: 100%;
  height: 100%;
  max-width: 1200px;
  position: relative;
  --color: #0001;
  --grid-color: #626262;

  .light & {
    --color: #d0d0d0;
    --grid-color: #ddd;
  }

  --nr: 3;
  --nc: 12;
  --bx: ${(props) => marginX + 'px'};
  --by: ${(props) => marginY + 'px'};
  --gx: transparent calc(100% - var(--bx)), var(--grid-color) 0;
  --gy: transparent calc(100% - var(--by)), var(--grid-color) 0;

  background: linear-gradient(to right, var(--gx)),
    linear-gradient(to bottom, var(--gy)),
    ${(props) => (props.edit ? 'var(--color)' : 'transparent')};
  background-size: calc(
        (100% - var(--bx) * (var(--nc) + 1)) / var(--nc) + var(--bx)
      )
      100%,
    100% ${(props) => `${props.rowHeight + marginY}px`};
  background-position: var(--bx) 0, 0 var(--by);
`

const Disabled = styled.div`
  display: flex;
  flex-flow: row wrap;
`
