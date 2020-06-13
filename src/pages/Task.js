import React, { useRef, useState, useEffect } from 'react'
import styled from 'styled-components'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, Link } from 'react-router-dom'
import { default as SingleLineMarkdown } from 'markdown-to-jsx'
import * as firebase from 'firebase/app'
import { useDocumentDataOnce } from 'react-firebase-hooks/firestore'

import TaskCodeEnvironment from '../modules'
import { Title, SubTitle } from '../components/Typography'
import { Markdown } from '../components/TextEditor'
import Icon from '../components/Icon'
import Loading from '../components/Loading'
import Outline from '../components/Outline'

const TaskContainer = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  min-width: 1200px;
  width: 100%;

  & .section-name,
  & .subgoal-name {
    opacity: 0.5;
  }
  & .subgoal-name + span {
    text-decoration: underline;
  }
`

const Description = styled.div`
  font-size: 1.5em;
  margin: 0 auto;
  color: #ddd;
  text-shadow: 0 4px 8px #0004;
  text-align: center;
  align-self: center;
`

const Subgoals = styled.div`
  display: flex;
  flex-direction: column;
  margin: auto;
  margin-bottom: 2em;
`

const SubgoalDescription = styled(Description)`
  margin: 0;
  text-align: left;
  align-self: flex-start;
  opacity: 0.4;
  color: #fff;
  max-width: 800px;
  width: 800px;

  .light & {
    color: #000;
  }

  &.current {
    opacity: 1;
    position: relative;

    &.descriptionn {
      margin: 0 0 0.5em;
      border-radius: 6px;
      background-color: #0001;
    }

    ::before {
      content: '►';
      position: absolute;
      right: calc(100% + 10px);
    }
  }
`

const Checked = styled.span`
  color: #0f0;

  .light & {
    color: #090;
  }
`

const Failed = styled.span`
  color: #faa;

  .light & {
    color: #e00;
  }
`

const NextButton = styled.button`
  background-color: #0a0;
  color: #fff;
  font-size: 1.5em;
`

const getAlpha = (n) => String.fromCharCode(97 + ((n - 1) % 26))

function TaskPage() {
  const dispatch = useDispatch()
  const { uid, userData } = useSelector((state) => state.user)
  const { clearLog, clearValues, attempts } = useSelector((state) => state.task)
  const [task, setTask] = useState({
    title: '',
    description: '',
    hiddenCode: '',
    sections: [],
  })
  const [edit] = useState(false)
  const [sectionNo, setSectionNo] = useState(0)
  const [subgoalNo, setSubgoalNo] = useState(0)
  const [sectionNoMax, setSectionNoMax] = useState(0)
  const [subgoalNoMax, setSubgoalNoMax] = useState(0)
  const [subgoalFinished, setSubgoalFinished] = useState(false)
  const [testsPassed, setTestsPassed] = useState({})
  const topOfSectionRef = useRef(null)
  const topOfSubgoalRef = useRef(null)

  const { id } = useParams()
  const [taskData, loadingTaskData] = useDocumentDataOnce(
    firebase.firestore().collection('tasks').doc(id)
  )

  useEffect(() => {
    if (taskData && task.title === '') {
      if (taskData.title === '') {
        taskData.title = 'Tittel'
      }
      if (taskData.sections) {
        setSectionNoMax(taskData.sections.length - 1)
        if (taskData.sections[0].subgoals) {
          setSubgoalNoMax(taskData.sections[0].subgoals.length - 1)
        }
      }
      //console.log(taskData)
      setTask(taskData)
    }
  }, [taskData, task.title])

  useEffect(() => {
    if (task && task.sections && task.sections.length) {
      if (task.sections[sectionNo].subgoals) {
        setSubgoalNoMax(task.sections[sectionNo].subgoals.length - 1)
        if (topOfSectionRef.current) {
          const { top } = topOfSectionRef.current.getBoundingClientRect()
          if (top < -60) {
            topOfSectionRef.current.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
            })
          }
        }
      }
    }
  }, [task, sectionNo])

  useEffect(() => {
    if (subgoalNo) {
      if (topOfSubgoalRef.current) {
        const { top } = topOfSubgoalRef.current.getBoundingClientRect()
        if (top < -60) {
          topOfSubgoalRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          })
        }
      }
    }
  }, [subgoalNo])

  if (loadingTaskData) {
    return (
      <TaskContainer>
        Laster oppgave <Loading />
      </TaskContainer>
    )
  }

  return (
    <TaskContainer>
      {task.author && task.author.id === uid ? (
        <Link className="button" to={`/oppgave/endre/${id}`}>
          Endre oppgaven <Icon name="edit" />
        </Link>
      ) : null}
      {userData && userData.isTeacher ? (
        <Link className="button" to={`/oppgave/endre/${id}`}>
          Lag en ny oppgave ut ifra denne <Icon name="file_copy" />
        </Link>
      ) : null}
      <Title>
        <SingleLineMarkdown>{task.title}</SingleLineMarkdown>
      </Title>
      {task.description ? (
        <Description style={{ width: '100%', marginBottom: '1em' }}>
          <Markdown>{task.description}</Markdown>
        </Description>
      ) : null}
      {task.sections && task.sections.length ? (
        <>
          <div
            style={{
              display: 'flex',
              flexFlow: 'row wrap',
              position: 'relative',
            }}
          >
            <Outline
              task={task}
              sectionNo={sectionNo}
              subgoalNo={subgoalNo}
              testsPassed={testsPassed}
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                height: '100%',
                borderRadius: '6px',
              }}
            />
            <div
              style={{
                flex: '1 0 auto',
                flexFlow: 'column nowrap',
                marginRight: 'calc(320px + 3em)',
                maxWidth: 'calc(1200px - 320px)',
              }}
            >
              {
                //task.sections.slice(0, sectionNo + 1).map((section, i) => (
                task.sections.slice(0, sectionNo + 1).map((section, i) => {
                  if (sectionNo !== i) {
                    return null
                  } else {
                    return (
                      <SubTitle
                        key={i}
                        style={{
                          margin: 0,
                          opacity: sectionNo === i ? 1 : 0.4,
                        }}
                      >
                        {/*sectionNo > i ? <Checked>✓ </Checked> : null*/}
                        <span>
                          <span className="section-name">
                            Seksjon {i + 1}:{' '}
                          </span>
                          <SingleLineMarkdown>
                            {`${section.title} (${
                              sectionNo > i
                                ? task.sections[i].subgoals.length
                                : subgoalNo
                            }/${task.sections[i].subgoals.length})`}
                          </SingleLineMarkdown>
                        </span>
                      </SubTitle>
                    )
                  }
                })
              }
              <div
                ref={topOfSectionRef}
                style={{ position: 'relative', top: '-75px' }}
              />
              {task.sections[sectionNo].description ? (
                <Markdown
                  style={{
                    width: '800px',
                    textAlign: 'left',
                    fontSize: '1.25em',
                    margin: '1em auto',
                  }}
                >
                  {task.sections[sectionNo].description}
                </Markdown>
              ) : (
                <div style={{ height: '1em' }} />
              )}
              <Subgoals>
                {task.sections[sectionNo].subgoals.map((subgoal, i) => {
                  if (subgoalNo !== i) {
                    return null
                  } else {
                    return (
                      <SubgoalDescription
                        key={subgoal.title}
                        className={
                          subgoalNo === i
                            ? 'current' +
                              (subgoal.description ? ' description' : '')
                            : ''
                        }
                      >
                        {subgoalNo === i ? (
                          <div
                            ref={topOfSubgoalRef}
                            style={{ position: 'relative', top: '-16px' }}
                          />
                        ) : null}
                        {testsPassed[sectionNo + '-' + i] ? (
                          <Checked>✓ </Checked>
                        ) : testsPassed[sectionNo + '-' + i] === false ? (
                          <Failed>✕ </Failed>
                        ) : null}
                        <span>
                          <span className="subgoal-name">
                            Deloppgave {getAlpha(i + 1)})
                          </span>{' '}
                          <SingleLineMarkdown>
                            {subgoal.title}
                          </SingleLineMarkdown>
                        </span>
                        {subgoalNo === i && subgoal.description ? (
                          <Markdown
                            style={{
                              width: 'calc(100% - 3.3em)',
                              fontSize: '0.7em',
                              background: '#0002',
                              borderRadius: '6px',
                              padding: '0.5em 1em',
                              margin: '1em auto 1em 3.3em',
                            }}
                          >
                            {subgoal.description}
                          </Markdown>
                        ) : null}
                      </SubgoalDescription>
                    )
                  }
                })}
              </Subgoals>
            </div>
          </div>
          <TaskCodeEnvironment
            edit={edit}
            task={task}
            subgoalNo={subgoalNo}
            sectionNo={sectionNo}
            subgoalNoMax={subgoalNoMax}
            sectionNoMax={sectionNoMax}
            onFinishedSubgoal={(
              sectionNo,
              subgoalNo,
              sectionNoMax,
              subgoalNoMax
            ) => {
              setSubgoalFinished(true)
              if (subgoalNo < subgoalNoMax) {
                setTestsPassed((passed) => ({
                  ...passed,
                  [sectionNo + '-' + subgoalNo]: true,
                }))
              } else {
                if (sectionNo < sectionNoMax) {
                  setTestsPassed((passed) => ({
                    ...passed,
                    [sectionNo + '-' + subgoalNoMax]: true,
                  }))
                } else {
                  setTestsPassed((passed) => ({
                    ...passed,
                    [sectionNoMax + '-' + subgoalNoMax]: true,
                  }))
                }
              }
            }}
            onUnFinishedSubgoal={(
              sectionNo,
              subgoalNo,
              sectionNoMax,
              subgoalNoMax
            ) => {
              setSubgoalFinished(false)
              if (subgoalNo < subgoalNoMax) {
                setTestsPassed((passed) => ({
                  ...passed,
                  [sectionNo + '-' + subgoalNo]: false,
                }))
              } else {
                if (sectionNo < sectionNoMax) {
                  setTestsPassed((passed) => ({
                    ...passed,
                    [sectionNo + '-' + subgoalNoMax]: false,
                  }))
                } else {
                  setTestsPassed((passed) => ({
                    ...passed,
                    [sectionNoMax + '-' + subgoalNoMax]: false,
                  }))
                }
              }
            }}
            engine={{
              scripts: [
                {
                  src: 'https://pyodide.cdn.iodide.io/pyodide.js',
                  onload: () => {
                    if (window.languagePluginLoader) {
                      window.languagePluginLoader.then(() => {
                        dispatch({
                          type: 'setIsEngineReady',
                          isReady: true,
                        })
                      })
                    }
                  },
                },
                /*{
                  src: 'http://www.skulpt.org/js/skulpt.min.js',
                },
                {
                  src: 'http://www.skulpt.org/js/skulpt-stdlib.js',
                  onload: () => {
                    window.Sk.pre = 'output'
                    window.Sk.configure({
                      output: (text) => {
                        window.writeToLogFunction(text)
                      },
                      read: (x) => {
                        if (
                          window.Sk.builtinFiles === undefined ||
                          window.Sk.builtinFiles['files'][x] === undefined
                        )
                          throw "File not found: '" + x + "'"
                        return window.Sk.builtinFiles['files'][x]
                      },
                      __future__: window.Sk.python3,
                    })
                    ;(
                      window.Sk.TurtleGraphics ||
                      (window.Sk.TurtleGraphics = {})
                    ).target = 'mycanvas'

                    dispatch({
                      type: 'setIsEngineReady',
                      isReady: true,
                      runCode: (code) => {
                        var myPromise = window.Sk.misceval.asyncToPromise(
                          function () {
                            return window.Sk.importMainWithBody(
                              '<stdin>',
                              false,
                              code,
                              true
                            )
                          }
                        )
                        myPromise.then(
                          function (mod) {
                            // Success
                          },
                          function (err) {
                            window.writeToLogFunction(
                              err.toString(),
                              false,
                              true
                            )
                          }
                        )
                      },
                    })
                  },
                },*/
              ],
            }}
          />
          {subgoalFinished ? (
            subgoalNo === subgoalNoMax && sectionNo === sectionNoMax ? (
              <SubTitle>Du er ferdig med alle deloppgavene!</SubTitle>
            ) : (
              <NextButton
                onClick={() => {
                  clearLog()
                  clearValues()
                  setSubgoalFinished(false)
                  if (subgoalNo < subgoalNoMax) {
                    console.log('Next subgoal')
                    setSubgoalNo((n) => n + 1)
                  } else {
                    if (sectionNo < sectionNoMax) {
                      console.log('Next section')
                      setSubgoalNo(0)
                      setSectionNo((n) => n + 1)
                    } else {
                      console.log('Task is done')
                    }
                  }
                }}
              >
                Gå til neste deloppgave <Icon key="next" name="arrow_forward" />
              </NextButton>
            )
          ) : attempts >= 3 ? (
            <NextButton
              onClick={() => {
                try {
                  const solutionCode =
                    task.sections[sectionNo].subgoals[subgoalNo].solutionCode
                  if (solutionCode) {
                    dispatch({
                      type: 'setCode',
                      code: solutionCode,
                      isSolution: true,
                    })
                    setSubgoalFinished(true)
                  } else {
                    console.log('Var visst ikke noen løsning på denne :/')
                  }
                } catch (ex) {
                  console.log('Kunne ikke hente løsningen :(')
                  console.error(ex)
                }
              }}
            >
              Se løsningen på oppgaven <Icon key="reveal" name="visibility" />
            </NextButton>
          ) : null}
        </>
      ) : null}
    </TaskContainer>
  )
}

export default TaskPage
