import React, { useEffect, useRef, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useParams, useLocation } from 'react-router-dom'
import styled from 'styled-components'
import * as firebase from 'firebase/app'
import mdIt from 'markdown-it'
import mk from 'markdown-it-katex'
import hljs from 'highlight.js'
import 'highlight.js/styles/vs2015.css'

import { SubTitle, Paragraph } from '../components/Typography'
import Icon from '../components/Icon'
import Help from '../components/Help'
import { Button, Input, RadioGroup, CodeEditor } from '../components/Form'
import {
  TextEditor,
  ExtendedMarkdownEditor,
  SingleEditorTaskCreator,
  parseMarkdownOnly,
  addToDescriptionButtons,
  addTemplateToDescriptionButtons,
} from '../components/TextEditor'
import TaskCodeEnvironment from '../modules'
import { loopCodeSplit } from '../modules'

const md = mdIt({
  langPrefix: 'language-',
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(lang, str).value
      } catch (ex) {}
    }

    return ''
  },
})
md.use(mk)

const Container = styled.div`
  display: flex;
  flex: 1 0 auto;
  width: 100%;
  box-sizing: border-box;
  flex-flow: column nowrap;
  justify-content: flex-start;
  align-items: center;
  font-size: 1.5em;

  .monaco-editor,
  .overflow-guard {
    border-radius: 6px;
  }
`

const AddNewSection = styled.button`
  font-size: 1.5em;
  align-self: center;
`

const AddNewSubgoal = styled.button`
  font-size: 1.5em;
  align-self: center;
`

const Sections = styled.ol`
  list-style: none;
  counter-reset: section-counter;
  padding: 0;
  width: 100%;
  position: relative;

  & ol {
    margin: 1em;
  }

  > li {
    counter-increment: section-counter;
    display: flex;
    flex-flow: row nowrap;
    position: relative;

    ::before {
      content: counter(section-counter) '. ';
      display: inline-block;
      margin: 1.3em 0.5em 1em 0;
      font-size: 1.5em;
    }
  }
`

const placeholders = {
  oldTestCode: `
assert defined('g'), "Du må definere 'g'"
assert g == 9.81, "Du må sette verdien 9.81 til variabel 'g'. Husk å bruke punktum og ikke komma."
simulate(time=2)
assert ball.y == solution("ball.y"), "Husk å sette ballens fart til 2 m/s"

# Om testen ikke har feilet til nå, så er den
print(f"Du klarte deloppgave {section}. {subgoal})!")
`,
  testCode: '',
}

const addCode = (code, type, hideIfNone = false) => {
  if (hideIfNone && !code) {
    return ''
  }

  return `\`\`\`python ${type}
${code}
\`\`\`
`
}

const randomString = () => Math.floor(Math.random() * 100000) + ''
const fixNewlines = (str) => str.replace(/\\n/g, '\n')

const solutionCodes = {}
const solutionLoopCodes = {}

function getCurrentValueOrDefault(ref, key = '', defaultValue = '') {
  if (!ref.current) return defaultValue
  if (key) return ref.current[key]
  return ref.current
}

const emptySection = {
  title: '',
  hiddenCode: '',
  description: '',
  subgoals: [
    {
      title: '',
      hiddenCode: '',
      predefinedCode: '',
      solutionCode: '',
      testCode: '' || placeholders.testCode,
      description: '',
    },
  ],
}

export default function CreateTaskPage() {
  const dispatch = useDispatch()
  const { resultCanvasContext } = useSelector((state) => state.task)
  const { uid } = useSelector((state) => state.user)
  const { pathname } = useLocation()
  const { id } = useParams()
  const [isNew, setIsNew] = useState(null)
  const title = useRef('')
  const description = useRef('')
  const [task, setTask] = useState({
    title: '',
    description: '',
    hiddenCode: '',
    sections: [],
  })
  const [sections, setSections] = useState([randomString()])
  const [sectionNo, setSectionNo] = useState(-1)
  const [subgoalNo, setSubgoalNo] = useState(-1)
  const [updatedTask, setUpdatedTask] = useState(-1)
  const [taskSectionNo, setTaskSectionNo] = useState(-1)
  const [taskSubgoalNo, setTaskSubgoalNo] = useState(-1)
  const [saveFeedback, setSaveFeedback] = useState('')
  const [sectionsData, setSectionsData] = useState([emptySection])
  const [useHiddenCode, setUseHiddenCode] = useState(false)
  const [newlyHydrated, setNewlyHydrated] = useState(false)
  const [
    extendedMarkdownEditorValue,
    setExtendedMarkdownEditorValue,
  ] = useState('')
  const hiddenCodeEditor = useRef(null)
  const hiddenLoopCodeEditor = useRef(null)
  const [hiddenCode, setHiddenCode] = useState('')
  const [hiddenLoopCode, setHiddenLoopCode] = useState('')
  const defaultTitle = ''
  const defaultDecription = ''
  const [sectionToMarkdownFunctions, setSectionToMarkdownFunctions] = useState(
    {}
  )
  const [sectionToJSONFunctions, setSectionToJSONFunctions] = useState({})
  const [mode, setMode] = useState('gui')
  const testTaskAnchor = useRef(null)

  function handleHiddenCodeEditorDidMount(_valueGetter) {
    hiddenCodeEditor.current = _valueGetter
  }

  function handleHiddenLoopCodeEditorDidMount(_valueGetter) {
    hiddenLoopCodeEditor.current = _valueGetter
  }

  useEffect(() => {
    setIsNew(pathname.indexOf('/endre/') === -1)
  }, [pathname])

  function buildMarkdownFromGUI(sections, sectionToMarkdownFunctions) {
    return `# ${getCurrentValueOrDefault(title, 'value').trim() || 'Tittel'}

${getCurrentValueOrDefault(description, 'value')}

${addCode(
  hiddenCodeEditor.current().trim() +
    loopCodeSplit +
    '\n' +
    hiddenLoopCodeEditor.current().trim(),
  'skjult'
)}
${sections
  .map(
    (section, i) =>
      sectionToMarkdownFunctions[i] && sectionToMarkdownFunctions[i]()
  )
  .join('\n')
  .trim()}`
  }

  function buildJSONFromGUI(sections, sectionToJSONFunctions) {
    const newTitle = getCurrentValueOrDefault(title, 'value').trim() || 'Tittel'
    const newDescription = getCurrentValueOrDefault(description, 'value')
    const newHiddenCode =
      hiddenCodeEditor.current().trim() +
      loopCodeSplit +
      '\n' +
      hiddenLoopCodeEditor.current().trim()
    const newSections = sections.map((section, i) => {
      if (sectionToJSONFunctions[i]) {
        const result = sectionToJSONFunctions[i]()
        return result
      }
      return false
    })
    return {
      title: newTitle,
      description: newDescription,
      hiddenCode: newHiddenCode,
      sections: newSections,
    }
  }

  const firstTitle = useRef('')
  useEffect(() => {
    if (id) {
      const hydrate = async (id) => {
        const snap = await firebase
          .firestore()
          .collection('tasks')
          .doc(id)
          .get()
        const result = snap.data()
        setNewlyHydrated(true)
        setTimeout(() => {
          setNewlyHydrated(false)
        }, 200)
        title.current.value = result.title
        firstTitle.current = result.title
        description.current.value = result.description
        if (result.hiddenCode) {
          const [before, ...after] = fixNewlines(result.hiddenCode).split(
            loopCodeSplit
          )
          setHiddenCode(before.trim())
          setHiddenLoopCode(after.join('\n').trim())
        }
        setSectionsData(result.sections)
        if (result.sections.length !== sections.length) {
          setSections(result.sections.map(() => randomString()))
        }
      }
      hydrate(id)
    }
  }, [id])

  const saveTask = async () => {
    try {
      const ref = await firebase
        .firestore()
        .collection('tasks')
        .add({
          ...buildJSONFromGUI(sections, sectionToJSONFunctions),
          image: resultCanvasContext.canvas.toDataURL('image/jpeg', 0.1),
          author: firebase.firestore().collection('users').doc(uid),
        })
      await firebase
        .firestore()
        .collection('users')
        .doc(uid)
        .update({
          tasksCreated: firebase.firestore.FieldValue.arrayUnion(ref),
        })
      setSaveFeedback('Din oppgave ble lagret!')
    } catch (ex) {
      setSaveFeedback(
        'Vi klarte ikke å lagre oppgaven din akkurat nå. Prøv igjen senere. Eventuelt ta vare på Markdownversjonen av oppgaven'
      )
      console.log(ex)
      try {
        console.log(buildJSONFromGUI(sections, sectionToJSONFunctions))
      } catch (e) {}
    }
  }

  const testTask = () => {
    const newTask = buildJSONFromGUI(sections, sectionToJSONFunctions)
    //console.log(newTask)
    setTask(newTask)
    setTimeout(() => {
      testTaskAnchor.current.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      })
    }, 100)
    setTimeout(() => {
      testTaskAnchor.current.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      })
    }, 500)
  }

  const prevSectionNo = useRef(-1)
  const prevSubgoalNo = useRef(-1)
  const prevUpdatedTask = useRef(-1)
  useEffect(() => {
    if (
      prevSectionNo.current !== sectionNo ||
      prevSubgoalNo.current !== subgoalNo ||
      prevUpdatedTask.current !== updatedTask
    ) {
      prevSectionNo.current = sectionNo
      prevSubgoalNo.current = subgoalNo
      prevUpdatedTask.current = updatedTask
      setTaskSectionNo(sectionNo - 1)
      setTaskSubgoalNo(subgoalNo - 1)
      testTask()
    }
  }, [sectionNo, subgoalNo, updatedTask])

  function changeMode() {
    setMode((mode) => {
      switch (mode) {
        case 'markdown':
          return 'gui'
          break
        case 'gui':
          return 'editor'
          break
        case 'editor':
          return 'markdown'
          break
        default:
          return 'editor'
          break
      }
    })
  }

  useEffect(() => {
    if (mode === 'markdown') {
      // Convert GUI to Markdown
      const markdown = buildMarkdownFromGUI(
        sections,
        sectionToMarkdownFunctions
      )
      setExtendedMarkdownEditorValue(markdown)
    } else if (
      mode === 'gui' &&
      !newlyHydrated &&
      extendedMarkdownEditorValue
    ) {
      // Hydrate GUI
      const result = parseMarkdownOnly(extendedMarkdownEditorValue)
      setNewlyHydrated(true)
      setTimeout(() => {
        setNewlyHydrated(false)
      }, 200)
      title.current.value = result.title
      description.current.value = result.description
      if (result.hiddenCode) {
        const [before, ...after] = fixNewlines(result.hiddenCode).split(
          loopCodeSplit
        )
        setHiddenCode(before.trim())
        setHiddenLoopCode(after.join('\n').trim())
      }
      setSectionsData(result.sections)
      if (result.sections.length !== sections.length) {
        setSections(result.sections.map(() => randomString()))
      }
    }
  }, [mode, sectionToMarkdownFunctions])

  return (
    <Container>
      {isNew ? (
        <SubTitle style={{ fontSize: '2.5rem' }}>
          Lag en ny opp
          <span onClick={changeMode}>g</span>
          ave{isNew && id ? ` fra "${firstTitle.current}"` : ''}
        </SubTitle>
      ) : (
        <SubTitle style={{ fontSize: '2.5rem' }}>
          En<span onClick={changeMode}>d</span>re "{firstTitle.current}"
        </SubTitle>
      )}
      <div
        style={{
          display: mode === 'markdown' ? 'flex' : 'none',
          fontSize: '1rem',
          flexDirection: 'column',
          alignItems: 'flex-start',
          width: '100%',
        }}
      >
        <ExtendedMarkdownEditor
          onChange={(value) => setExtendedMarkdownEditorValue(value)}
          value={extendedMarkdownEditorValue}
        />
      </div>
      <div
        style={{
          display: mode === 'editor' ? 'flex' : 'none',
          fontSize: '1rem',
          flexDirection: 'column',
          alignItems: 'flex-start',
          width: '100%',
        }}
      >
        <Input
          size="3em"
          width="100%"
          align="center"
          shadow={true}
          autoFocus={true}
          defaultValue={defaultTitle}
          placeholder="Skriv inn tittel ..."
        />
        <Input
          size="1.5em"
          width="100%"
          align="center"
          shadow={true}
          defaultValue={defaultDecription}
          placeholder="Legg til en kort beskrivelse ..."
        />
        <SingleEditorTaskCreator />
      </div>
      <div
        style={{
          display: mode === 'gui' ? 'inherit' : 'none',
          width: '100%',
          position: 'relative',
          flexDirection: 'inherit',
          alignItems: 'inherit',
        }}
      >
        <Help
          width="800px"
          y="2em"
          z={100}
          absolute
          right
          md
        >{`Skriv inn kort tittel og en kort beskrivelse på oppgaven. Vi anbefaler å heller ha en veldig kort tittel og en lengre beskrivelse enn omvendt.

### Typiske titler:

1. Ball i fritt fall med luftmotstand
2. Kloss ned skråplan med friksjon
3. Baller som kolliderer
4. Planeter i bane

### Typiske beskrivelser til titlene:

1. Her skal vi simulere en ball som faller i fritt fall med luftmotstand.
2. Her skal vi først få en kloss til å skli ned et skråplan uten friksjon, så skal vi legge til friksjon.
3. Her starter vi med å få to baller til å kollidere i en dimensjon, så beveger vi oss til to dimensjoner.
4. Vi starter først med to planeter som tiltrekkes av hverandre. Etterhvert inkluderer vi flere planeter.
`}</Help>
        <Input
          size="3em"
          width="100%"
          align="center"
          shadow={true}
          autoFocus={true}
          ref={title}
          defaultValue={defaultTitle}
          placeholder="Skriv inn tittel ..."
        />
        <Input
          size="1.5em"
          width="100%"
          align="center"
          shadow={true}
          ref={description}
          defaultValue={defaultDecription}
          placeholder="Legg til en kort beskrivelse ..."
        />
        <Help
          width="800px"
          y="0.5em"
          x="-8.5em"
          z={99}
          right
          center
          md
        >{`Man vil helst fjerne distraksjoner fra det eleven skal lære slik at fokuset blir på faget og ikke koden. Legg det du vil skjule her, slik som funksjoner og verdier. Disse vil videre kunne bli brukt av eleven i deres kode.

### Eksempel på kode

\`\`\`python
# Funksjon for distanse
def distanse(x1, y1, x2, y2):
    """
    Hjelp til eleven går inn her.

    Gjerne oppgi eksempel på bruk slik:
    \`\`\`python
    dist = distanse(0, 0, 3, 4) # \`dist\` får nå verdien 5
    \`\`\`

    Med å spesifisere "Args" kan du også oppgi beskrivelse av argumentene:
    Args:
        x1: Startposisjon i x-aksen
        y1: Startposisjon i y-aksen
        x2: Sluttposisjon i x-aksen
        y2: Sluttposisjon i y-aksen
    """
    dx = x2 - x1
    dy = y2 - y1
    return (dx**2 + dy**2)**0.5
\`\`\`
`}</Help>
        <Button onClick={() => setUseHiddenCode((use) => !use)}>
          <Icon
            key={useHiddenCode}
            name={useHiddenCode ? 'expand_more' : 'chevron_right'}
          />{' '}
          Legg til skjult kode for hele oppgaven <Icon name="visibility_off" />
        </Button>
        <CodeEditorWrapper
          style={{
            display: useHiddenCode ? 'initial' : 'none',
            maxWidth: '800px',
            //margin: '1em auto 0',
          }}
        >
          <Help
            width="800px"
            y="2em"
            z={92}
            absolute
            right
            md
          >{`I denne kodeblokken kan du oppgi kode som skal simuleres. Denne blokken kjøres hver \`dt\` og du har tilgang til alle variablene fra den andre blokken her. Videre er det også mulig å bruke variabelen \`t\` for å hente ut tiden.`}</Help>
          <DoubleCodeEditor>
            <CodeEditor
              width={'48%'}
              height={'240px'}
              value={hiddenCode}
              editorDidMount={handleHiddenCodeEditorDidMount}
            />
            <CodeEditor
              width={'48%'}
              height={'240px'}
              value={hiddenLoopCode}
              editorDidMount={handleHiddenLoopCodeEditorDidMount}
            />
          </DoubleCodeEditor>
        </CodeEditorWrapper>
        <Sections>
          <Help
            width="800px"
            y="1.5em"
            x="-1em"
            z={98}
            md
          >{`Det er viktig å dele oppgaven inn i seksjoner. Her er noen eksempler på typiske seksjoner:

1. Definere konstanter
2. Lage en ball
3. Bevege ballen basert på tid
4. Få ballen til å falle med gravitasjonskraften
`}</Help>
          {sections.map((section, i) => (
            <li key={section}>
              <Icon
                name="delete"
                onClick={() => {
                  const answer = prompt("Skriv 'fjern' for å fjerne:")
                  if (answer === 'fjern') {
                    setSections((s) => [...s.slice(0, i), ...s.slice(i + 1)])
                    setSectionsData((s) => [
                      ...s.slice(0, i),
                      ...s.slice(i + 1),
                    ])
                    Object.keys(solutionCodes)
                      .map((c) => c.split('-').map((no) => parseInt(no)))
                      .filter((c) => c[0] === i + 1)
                      .forEach((c) => delete solutionCodes[c[0] + '-' + c[1]])
                    Object.keys(solutionLoopCodes)
                      .map((c) => c.split('-').map((no) => parseInt(no)))
                      .filter((c) => c[0] === i + 1)
                      .forEach(
                        (c) => delete solutionLoopCodes[c[0] + '-' + c[1]]
                      )
                    Object.keys(solutionCodes)
                      .map((c) => c.split('-').map((no) => parseInt(no)))
                      .filter((c) => c[0] > i + 1)
                      .sort((a, b) => a[0] - b[0])
                      .forEach((c) => {
                        solutionCodes[c[0] - 1 + '-' + (c[1] - 1)] =
                          solutionCodes[c[0] + '-' + c[1]]
                        delete solutionCodes[c[0] + '-' + c[1]]
                      })
                    Object.keys(solutionLoopCodes)
                      .map((c) => c.split('-').map((no) => parseInt(no)))
                      .filter((c) => c[0] > i + 1)
                      .sort((a, b) => a[0] - b[0])
                      .forEach((c) => {
                        solutionLoopCodes[c[0] - 1 + '-' + (c[1] - 1)] =
                          solutionLoopCodes[c[0] + '-' + c[1]]
                        delete solutionLoopCodes[c[0] + '-' + c[1]]
                      })
                  }
                }}
                style={{
                  position: 'absolute',
                  right: '-2em',
                  top: '1.5em',
                  fontSize: '1.5em',
                }}
              />
              <Section
                sectionNo={i + 1}
                setSectionNo={setSectionNo}
                setSubgoalNo={setSubgoalNo}
                setUpdatedTask={setUpdatedTask}
                defaultData={sectionsData[i]}
                toMarkdown={(fn) =>
                  setSectionToMarkdownFunctions((stm) => ({ ...stm, [i]: fn }))
                }
                toJSON={(fn) =>
                  setSectionToJSONFunctions((stm) => ({ ...stm, [i]: fn }))
                }
              />
            </li>
          ))}
        </Sections>
        <AddNewSection
          onClick={() => {
            setSections((s) => [...s, randomString()])
            setSectionsData((sd) => [...sd, emptySection])
          }}
        >
          + Legg til ny seksjon
        </AddNewSection>
      </div>
      {true && (
        <TaskCodeEnvironment
          style={{ fontSize: '1rem' }}
          edit={true}
          task={task}
          updatedTask={updatedTask}
          subgoalNo={taskSubgoalNo}
          sectionNo={taskSectionNo}
          subgoalNoMax={100000}
          sectionNoMax={100000}
          onFinishedSubgoal={(
            sectionNo,
            subgoalNo,
            sectionNoMax,
            subgoalNoMax
          ) => {
            //console.log(sectionNo, subgoalNo, sectionNoMax, subgoalNoMax)
          }}
          onUnFinishedSubgoal={(
            sectionNo,
            subgoalNo,
            sectionNoMax,
            subgoalNoMax
          ) => {
            //console.log(sectionNo, subgoalNo, sectionNoMax, subgoalNoMax)
          }}
          engine="pyodide"
          /*
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
            ],
          }}
          */
        />
      )}
      <div ref={testTaskAnchor} />
      <SubTitle>Ferdig med å lage oppgaven?</SubTitle>
      <AddNewSection onClick={saveTask}>Lagre</AddNewSection>
      <Paragraph>{saveFeedback}</Paragraph>
    </Container>
  )
}

const SectionHead = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  font-size: 1.5em;
  width: 100%;

  input {
    flex: 1 0 auto;
  }
`

const StyledSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin: 1em;
  font-size: 1em;
  width: 100%;
  position: relative;

  &.closed > ${SectionHead} ~ * {
    display: none !important;
  }
`

const SectionContent = styled.ol`
  display: flex;
  flex-flow: column nowrap;
  counter-reset: subgoal-counter;
  padding: 0;
  width: 100%;

  & ul {
    margin: 1em;
  }

  > li {
    counter-increment: subgoal-counter;
    display: flex;
    flex-flow: row nowrap;
    font-size: 1em;
    background: #0002;
    border-radius: 6px;
    margin-top: 1em;
    padding: 0 0.5em 0 1em;
    position: relative;

    .light & {
      background-color: #fff8;
    }

    :first-child {
      margin-top: 0.5em;
    }

    ::before {
      content: counter(subgoal-counter, lower-alpha) ') ';
      display: inline-block;
      margin: 1.1em 0.5em 1em 0;
      font-size: 1em;
    }
  }
`

function Section({
  defaultData = {
    title: '',
    hiddenCode: '',
    description: '',
    subgoals: [
      {
        title: '',
        hiddenCode: '',
        predefinedCode: '',
        solutionCode: '',
        testCode: '' || placeholders.testCode,
        description: '',
      },
    ],
  },
  sectionNo,
  setSectionNo,
  setSubgoalNo,
  setUpdatedTask,
  toMarkdown,
  toJSON,
}) {
  const title = useRef(null)
  const descriptionRef = useRef(null)
  const [hiddenCode, setHiddenCode] = useState('')
  const [hiddenLoopCode, setHiddenLoopCode] = useState('')
  const toMarkdownFunction = useRef(toMarkdown)
  const toJSONFunction = useRef(toJSON)
  const [subgoals, setSubgoals] = useState([randomString()])
  const [sectionOpen, setSectionOpen] = useState(true)
  const [descriptionOpen, setDescriptionOpen] = useState(false)
  const [useHiddenCode, setUseHiddenCode] = useState(false)
  const hiddenCodeEditor = useRef(null)
  const hiddenLoopCodeEditor = useRef(null)
  const [subgoalToMarkdownFunctions, setSubgoalToMarkdownFunctions] = useState(
    {}
  )
  const [subgoalToJSONFunctions, setSubgoalToJSONFunctions] = useState({})

  useEffect(() => {
    if (defaultData.hiddenCode) {
      const [before, ...after] = fixNewlines(defaultData.hiddenCode).split(
        loopCodeSplit
      )
      setHiddenCode(before.trim())
      setHiddenLoopCode(after.join('\n').trim())
    }
    if (defaultData.subgoals.length !== subgoals.length) {
      setSubgoals(defaultData.subgoals.map(() => randomString()))
    }
  }, [defaultData])

  useEffect(() => {
    if (toMarkdownFunction.current !== null) {
      toMarkdownFunction.current(
        () => `## ${getCurrentValueOrDefault(title, 'value').trim()}

${getCurrentValueOrDefault(descriptionRef, 'value').trim()}

${addCode(
  hiddenCodeEditor.current.getValue().trim() +
    loopCodeSplit +
    '\n' +
    hiddenLoopCodeEditor.current.getValue().trim(),
  'skjult'
)}
${subgoals
  .map(
    (subgoal, i) =>
      subgoalToMarkdownFunctions[i] && subgoalToMarkdownFunctions[i]()
  )
  .join('\n')
  .trim()}`
      )
    }
  }, [subgoalToMarkdownFunctions, sectionNo, subgoals])

  useEffect(() => {
    if (toJSONFunction.current !== null) {
      toJSONFunction.current(() => ({
        title: getCurrentValueOrDefault(title, 'value').trim(),
        description: getCurrentValueOrDefault(descriptionRef, 'value').trim(),
        hiddenCode:
          hiddenCodeEditor.current.getValue().trim() +
          loopCodeSplit +
          '\n' +
          hiddenLoopCodeEditor.current.getValue().trim(),
        subgoals: subgoals.map(
          (subgoal, i) =>
            subgoalToJSONFunctions[i] && subgoalToJSONFunctions[i]()
        ),
      }))
    }
  }, [subgoalToJSONFunctions, sectionNo, subgoals])

  function toggleSection() {
    setSectionOpen((open) => !open)
  }

  function toggleDescription() {
    setDescriptionOpen((open) => !open)
  }

  function handleHiddenCodeEditorDidMount(_, _editor) {
    hiddenCodeEditor.current = _editor
  }

  function handleHiddenLoopCodeEditorDidMount(_, _editor) {
    hiddenLoopCodeEditor.current = _editor
  }

  function autofillSection(type) {
    switch (type) {
      case 'define constants':
        if (title.current && !title.current.value) {
          title.current.value = 'Definere konstanter'
        }
        if (descriptionRef.current && !descriptionRef.current.value) {
          descriptionRef.current.value =
            addTemplateToDescriptionButtons[0].insert
          setDescriptionOpen(true)
        }
        break
      default:
        break
    }
  }

  return (
    <StyledSection className={sectionOpen ? 'open' : 'closed'}>
      <SectionHead>
        <Input
          size="1em"
          defaultValue={defaultData.title}
          ref={title}
          placeholder="Legg til en kort introduksjon til seksjonen ..."
        />
        <Icon
          onClick={toggleSection}
          size="2em"
          key={sectionOpen}
          name={sectionOpen ? 'expand_more' : 'chevron_right'}
        />
      </SectionHead>
      <div
        style={{
          display: 'flex',
          flexFlow: 'row nowrap',
          alignItems: 'center',
        }}
      >
        <p>Forhåndsfyll seksjon: </p>
        {[['define constants', 'Definere konstanter']].map(([ID, text], i) => (
          <Button
            key={i}
            style={{ margin: 8 }}
            onClick={() => autofillSection(ID)}
          >
            {text}
          </Button>
        ))}
      </div>
      {sectionNo === 1 ? (
        <Help
          width="800px"
          y="0.5em"
          x="18.5em"
          z={97}
          center
          md
        >{`Denne beskrivelsen skal være en introduksjon til seksjonen. Gjerne oppgi teori som skal brukes i seksjonen.`}</Help>
      ) : null}
      {descriptionOpen ? (
        <Help
          width="800px"
          y="6em"
          x="2em"
          z={97}
          absolute
          right
          md
        >{`Beskrivelsen her skrives i [Markdown](https://www.markdownguide.org/cheat-sheet) samtidig som den kan inkludere matematiske likninger i [Latex](https://katex.org/docs/supported.html). Her er noen eksempler:

### Tekst

All tekst, uten formateringene under, vil bli vist som vanlig tekst.

### Kodeblokker med Python

Bruk "\`\`\`" for å markere starten og slutten av en kodeblokk:

\`\`\`\`python
\`\`\`python
g = 9.81 # Gravitasjonskonstanten

def kvadrat(x):
  return x**2
\`\`\`
\`\`\`\`

### Likninger

Disse skrives i Latex med \`$\` foran og bak:

\`\`\`latex
$a_y(t_{i+1}) = g - \\frac{D}{m}$
\`\`\`

#### Likninger inni en tekst

\`\`\`latex
Dette er en $\\sqrt{(1+x)^2 + 1}$ tekst.
\`\`\`

#### Flere likninger sammen

Dette er litt komplekst, men kan komme til nytte:

\`\`\`latex
$$\\begin{array}{c}
a_y(t_{i+1}) = g - \\frac{D}{m} \\\\
v_y(t_{i+1}) = v_y(t_i) + a_y(t_{i+1}) * \\Delta t \\\\
s_y(t_{i+1}) = s_y(t_i) + v_y(t_{i+1}) * \\Delta t
\\end{array}$$
\`\`\`

### Tabeller

\`\`\`markdown
| Tid | Beregnet y | Eksakt y | Error |
|:---:|:----------:|:--------:|:-----:|
| 0   | 0          | 0        | 0     |
| 0.1 | 0.098      | 0.049    | 0.049 |
| 0.2 | 0.294      | 0.196    | 0.098 |
| 0.3 | 0.588      | 0.441    | 0.147 |
\`\`\`
`}</Help>
      ) : null}
      <Button onClick={toggleDescription}>
        <Icon
          key={descriptionOpen}
          name={descriptionOpen ? 'expand_more' : 'chevron_right'}
        />{' '}
        Legg til en lengre beskrivelse av seksjonen <Icon name="description" />
      </Button>
      <TextEditor
        showInitialHelpText={false}
        placeholder="I denne seksjonen skal vi se nærmere på ..."
        ref={descriptionRef}
        defaultValue={defaultData.description}
        style={{ display: descriptionOpen ? 'flex' : 'none' }}
      />
      <Button onClick={() => setUseHiddenCode((use) => !use)}>
        <Icon
          key={useHiddenCode}
          name={useHiddenCode ? 'expand_more' : 'chevron_right'}
        />{' '}
        Legg til skjult kode for hele seksjonen <Icon name="visibility_off" />
      </Button>
      <CodeEditorWrapper
        style={{
          display: useHiddenCode ? 'initial' : 'none',
          maxWidth: '800px',
          margin: 'auto',
        }}
      >
        <Help
          width="800px"
          y="2em"
          z={92}
          absolute
          right
          md
        >{`I denne kodeblokken kan du oppgi kode som skal simuleres. Denne blokken kjøres hver \`dt\` og du har tilgang til alle variablene fra den andre blokken her. Videre er det også mulig å bruke variabelen \`t\` for å hente ut tiden.`}</Help>
        <DoubleCodeEditor>
          <CodeEditor
            width={'48%'}
            height={'320px'}
            value={hiddenCode}
            editorDidMount={handleHiddenCodeEditorDidMount}
          />
          <CodeEditor
            width={'48%'}
            height={'320px'}
            value={hiddenLoopCode}
            editorDidMount={handleHiddenLoopCodeEditorDidMount}
          />
        </DoubleCodeEditor>
      </CodeEditorWrapper>
      <SectionContent>
        {sectionNo === 1 ? (
          <Help
            width="800px"
            y="1em"
            x="0em"
            z={95}
            left
            md
          >{`Dette er en deloppgave. Det er denne eleven skal utføre for å komme videre i oppgaven. Deloppgaven trenger en kort beskrivelse som beskriver hva eleven skal gjøre. Om ikke all informasjonen til eleven ligger i seksjonens beskrivelse, kan du oppgi en mer detaljert beskrivelse spesifikt for denne deloppgaven, men ofte er ikke det nødvendig.

### Eksempel på korte deloppgavebeskrivelser:

- Lag gravitasjonskonstanten \\\`g\\\` og sett den til \\\`9.81\\\`
- Lage en Ball, kalt \\\`ball\\\`, i punkt \\\`(0, 0)\\\`
- Sette radiusen til ballen til \\\`0.5\\\`
- Sett ballens y, \\\`ball.y\\\`, til tid \\\`t\\\`
- Trekk ifra luftmotstand, \\\`k*vy**2\\\`, fra akselerasjonen, \\\`ay\\\`

(Enkeltfnutter "\\\`" vil bli tolket som kode: \\\`g\\\` blir til \`g\`)
`}</Help>
        ) : null}
        {subgoals.map((subgoal, i) => (
          <li key={subgoal}>
            <Icon
              name="delete"
              onClick={() => {
                const answer = prompt("Skriv 'fjern' for å fjerne:")
                if (answer === 'fjern') {
                  setSubgoals((s) => [...s.slice(0, i), ...s.slice(i + 1)])
                  defaultData.subgoals = [
                    ...defaultData.subgoals.slice(0, i),
                    ...defaultData.subgoals.slice(i + 1),
                  ]
                  const ID = sectionNo + '-' + (i + 1)
                  if (ID in solutionCodes) delete solutionCodes[ID]
                  if (ID in solutionLoopCodes) delete solutionLoopCodes[ID]
                  Object.keys(solutionCodes)
                    .map((c) => c.split('-').map((no) => parseInt(no)))
                    .filter((c) => c[0] === sectionNo && c[1] > i + 1)
                    .sort((a, b) => a[1] - b[1])
                    .forEach((c) => {
                      solutionCodes[sectionNo + '-' + (c[1] - 1)] =
                        solutionCodes[sectionNo + '-' + c[1]]
                      delete solutionCodes[sectionNo + '-' + c[1]]
                    })
                  Object.keys(solutionLoopCodes)
                    .map((c) => c.split('-').map((no) => parseInt(no)))
                    .filter((c) => c[0] === sectionNo && c[1] > i + 1)
                    .sort((a, b) => a[1] - b[1])
                    .forEach((c) => {
                      solutionLoopCodes[sectionNo + '-' + (c[1] - 1)] =
                        solutionLoopCodes[sectionNo + '-' + c[1]]
                      delete solutionLoopCodes[sectionNo + '-' + c[1]]
                    })
                }
              }}
              style={{
                position: 'absolute',
                right: '-1.6em',
                top: '0.7em',
                fontSize: '1.5em',
              }}
            />
            <Subgoal
              sectionNo={sectionNo}
              subgoalNo={i + 1}
              setSectionNo={setSectionNo}
              setSubgoalNo={setSubgoalNo}
              setUpdatedTask={setUpdatedTask}
              defaultData={defaultData.subgoals[i]}
              prevSubgoal={i > 0 ? defaultData.subgoals[i - 1] : null}
              toMarkdown={(fn) =>
                setSubgoalToMarkdownFunctions((stm) => ({ ...stm, [i]: fn }))
              }
              toJSON={(fn) =>
                setSubgoalToJSONFunctions((stm) => ({ ...stm, [i]: fn }))
              }
            />
          </li>
        ))}
      </SectionContent>
      <AddNewSubgoal
        onClick={() => {
          setSubgoals((s) => [...s, randomString()])
          //setSubgoalsData(sd=>[...sd, emptySubgoal])
        }}
      >
        + Legg til ny deloppgave
      </AddNewSubgoal>
    </StyledSection>
  )
}

const SubgoalHead = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  font-size: 1em;
  width: 100%;

  input {
    flex: 1 0 auto;
  }
`

const StyledSubgoal = styled.div`
  padding: 0.5em;
  display: flex;
  flex-flow: column nowrap;
  width: 100%;
  align-items: flex-start;
  position: relative;

  &.closed > ${SubgoalHead} ~ * {
    display: none !important;
  }
`

const SubgoalTitle = styled(SubTitle)`
  font-size: 1.1em;
  text-align: left;
  align-self: flex-start;
  margin-bottom: 0;
`

const SubgoalParagraph = styled(Paragraph)`
  color: #fffd;
  font-size: 0.8em;
  text-align: left;
  align-self: flex-start;
  margin-bottom: 0;
`

const CodeEditorWrapper = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  :not(:empty) {
    margin-top: 1em;
    margin-bottom: 1em;
  }
`

const DoubleCodeEditor = styled.div`
  width: 100%;
  display: flex;
  flex-flow: row wrap;
  align-items: flex-start;
  justify-content: space-between;

  ::before,
  ::after {
    content: 'Kode som kjører en gang';
    display: inline-block;
    flex: 1 0 48%;
    order: -1;
    margin-bottom: 0.5em;
    font-size: 0.9em;
  }

  ::after {
    content: 'Kode som kjører hvert tidssteg, dt';
  }
`

const AddButton = styled.button`
  &.check {
    background-color: #aa7220;
  }
  &.time {
    background-color: #2196f3;
  }
  &.feedback {
    background-color: #248f28;
  }
`

function Subgoal({
  defaultData = {
    title: '',
    hiddenCode: '',
    predefinedCode: '',
    solutionCode: '',
    testCode: '' || placeholders.testCode,
    description: '',
  },
  sectionNo,
  subgoalNo,
  setSectionNo,
  setSubgoalNo,
  setUpdatedTask,
  toMarkdown,
  toJSON,
}) {
  const title = useRef(null)
  const descriptionRef = useRef(null)
  const toMarkdownFunction = useRef(toMarkdown)
  const toJSONFunction = useRef(toJSON)
  const [subgoalOpen, setSubgoalOpen] = useState(true)
  const [descriptionOpen, setDescriptionOpen] = useState(false)
  const [useHiddenCode, setUseHiddenCode] = useState(false)
  const [usePredefinedCode, setUsePredefinedCode] = useState(
    sectionNo === 1 && subgoalNo === 1
  )
  const hiddenCodeEditor = useRef(null)
  const hiddenLoopCodeEditor = useRef(null)
  const predefinedCodeEditor = useRef(null)
  const predefinedLoopCodeEditor = useRef(null)
  const solutionCodeEditor = useRef(null)
  const solutionLoopCodeEditor = useRef(null)
  const testCodeEditor = useRef(null)

  const [hiddenCode, setHiddenCode] = useState('')
  const [hiddenLoopCode, setHiddenLoopCode] = useState('')
  const [predefinedCode, setPredefinedCode] = useState('')
  const [predefinedLoopCode, setPredefinedLoopCode] = useState('')
  const [solutionCode, setSolutionCode] = useState('')
  const [solutionLoopCode, setSolutionLoopCode] = useState('')
  const [testCode, setTestCode] = useState('')

  const prevDefaultData = useRef('')
  useEffect(() => {
    const stringified = JSON.stringify(defaultData)
    if (prevDefaultData.current !== stringified) {
      prevDefaultData.current = stringified
      if (defaultData.hiddenCode) {
        const [before, ...after] = fixNewlines(defaultData.hiddenCode).split(
          loopCodeSplit
        )
        setHiddenCode(before.trim())
        setHiddenLoopCode(after.join('\n').trim())
      }
      if (typeof defaultData.predefinedCode === 'string') {
        const [before, ...after] = fixNewlines(
          defaultData.predefinedCode
        ).split(loopCodeSplit)
        setPredefinedCode(before.trim())
        setPredefinedLoopCode(after.join('\n').trim())
        setUsePredefinedCode(true)
      } else {
        setUsePredefinedCode(false)
      }
      if (defaultData.solutionCode) {
        const [before, ...after] = fixNewlines(defaultData.solutionCode).split(
          loopCodeSplit
        )
        setSolutionCode(before.trim())
        setSolutionLoopCode(after.join('\n').trim())
      }
      if (defaultData.testCode) {
        setTestCode(fixNewlines(defaultData.testCode.trim()))
      }
    }
  }, [defaultData])

  function toggleSubgoal() {
    setSubgoalOpen((open) => !open)
  }

  function toggleDescription() {
    setDescriptionOpen((open) => !open)
  }

  function handleHiddenCodeEditorDidMount(_, _editor) {
    hiddenCodeEditor.current = _editor
  }

  function handleLoopHiddenCodeEditorDidMount(_, _editor) {
    hiddenLoopCodeEditor.current = _editor
  }

  function handlePredefinedCodeEditorDidMount(_, _editor) {
    predefinedCodeEditor.current = _editor
  }

  function handlePredefinedLoopCodeEditorDidMount(_, _editor) {
    predefinedLoopCodeEditor.current = _editor
  }

  function handleSolutionCodeEditorDidMount(_, _editor) {
    solutionCodeEditor.current = _editor
    solutionCodes[sectionNo + '-' + subgoalNo] = _editor.getValue()
  }

  function handleSolutionLoopCodeEditorDidMount(_, _editor) {
    solutionLoopCodeEditor.current = _editor
    solutionLoopCodes[sectionNo + '-' + subgoalNo] = _editor.getValue()
  }

  function handleTestCodeEditorDidMount(_, _editor) {
    testCodeEditor.current = _editor
  }

  const [addToTestButtons, setAddToTestButtons] = useState([])

  function updateAddToTestButtons(code, noLoop = false) {
    const hasLoopCode = noLoop
      ? false
      : !!solutionLoopCodeEditor.current.getValue().trim()
    const buttons = []
    code.split(`\n`).forEach((line) => {
      if (/^[\w_][\w_0-9]* *=/.test(line)) {
        const [name, value] = line
          .split('#')[0]
          .split('=')
          .map((e) => e.trim())
        buttons.push({
          text: `Sjekk om '${name}' er definert`,
          type: 'check',
          icon: 'check',
          insert: `assert defined('${name}'), "Du må definere '${name}'"`,
        })
        if (/[0-9]+/.test(value)) {
          buttons.push({
            text: `Sjekk om '${name}' er lik ${value}`,
            type: 'check',
            icon: <i className="fas fa-ruler"></i>,
            insert: `assert ${name} == ${value}, "Du må sette variabel '${name}' til ${value}."`,
          })
        } else if (/[0-9]*\.[0-9]+/.test(value)) {
          buttons.push({
            text: `Sjekk om '${name}' er lik ${value}`,
            type: 'check',
            icon: <i className="fas fa-ruler"></i>,
            insert: `assert ${name} == ${value}, "Du må sette variabel '${name}' til ${value}. Husk å bruke punktum og ikke komma."`,
          })
        } else if (/^(Ball|Planet|Kloss|Linje)\(/.test(value)) {
          buttons.push({
            text: `Sjekk om '${name}.y' er lik løsningen sin '${name}.y'`,
            type: 'check',
            icon: <i className="fas fa-ruler"></i>,
            insert: `assert ${name}.y == solution('${name}.y'), "Har du husket å sette rikig startverdi?"`,
          })
          if (hasLoopCode) {
            buttons.push({
              text: `Sjekk om '${name}.y' er nesten lik løsningen sin '${name}.y'`,
              type: 'check',
              icon: <i className="fas fa-ruler"></i>,
              insert: `error = abs(${name}.y - solution('${name}.y'))\nassert error < 0.01, "Har du husket å sette rikig startverdi på '${name}.y'?"`,
            })
          }
        }
      }
    })
    if (hasLoopCode) {
      buttons.push({
        text: 'Simuler 1 sekund',
        type: 'time',
        icon: 'update',
        insert: 'simulate(time=1)',
      })
      buttons.push({
        text: 'Simuler et steg',
        type: 'time',
        icon: 'skip_next',
        insert: 'simulate(steps=1)',
      })
    }
    buttons.push({
      text: 'Legg til tilbakemelding',
      type: 'feedback',
      icon: 'feedback',
      insert:
        '# Alle tester bør skje før du sier om oppgaven ble gjennomført\nprint(f"Du klarte deloppgave {section}. {subgoal})!")',
    })
    setAddToTestButtons(buttons)
  }

  useEffect(() => {
    updateAddToTestButtons('', true)
  }, [])

  useEffect(() => {
    toMarkdownFunction.current(
      () => `### ${title.current.value.trim()}

${descriptionRef.current.value.trim()}

${addCode(
  hiddenCodeEditor.current.getValue().trim() +
    loopCodeSplit +
    '\n' +
    hiddenLoopCodeEditor.current.getValue().trim() +
    loopCodeSplit +
    '\n',
  'skjult'
)}
${
  usePredefinedCode
    ? `${addCode(
        predefinedCodeEditor.current.getValue().trim() +
          loopCodeSplit +
          '\n' +
          predefinedLoopCodeEditor.current.getValue().trim() +
          loopCodeSplit +
          '\n',
        'startkode'
      )}`
    : ''
}
${addCode(
  solutionCodeEditor.current.getValue().trim() +
    loopCodeSplit +
    '\n' +
    solutionLoopCodeEditor.current.getValue().trim() +
    loopCodeSplit +
    '\n',
  'løsning'
)}
${addCode(testCodeEditor.current.getValue().trim(), 'test')}
`
    )
  }, [subgoalNo, usePredefinedCode])

  useEffect(() => {
    toJSONFunction.current(() => {
      const predefinedLoopCodeEditorValue = predefinedLoopCodeEditor.current
        .getValue()
        .trim()
      const solutionLoopCodeEditorValue = solutionLoopCodeEditor.current
        .getValue()
        .trim()
      const hasLoopCode = !!(
        predefinedLoopCodeEditorValue || solutionLoopCodeEditorValue
      )
      return {
        title: title.current.value.trim(),
        description: descriptionRef.current.value.trim(),
        hiddenCode:
          hiddenCodeEditor.current.getValue().trim() +
          loopCodeSplit +
          '\n' +
          hiddenLoopCodeEditor.current.getValue().trim(),
        ...(usePredefinedCode && {
          predefinedCode:
            predefinedCodeEditor.current.getValue().trim() +
            (hasLoopCode
              ? loopCodeSplit + '\n' + predefinedLoopCodeEditorValue
              : ''),
        }),
        solutionCode:
          solutionCodeEditor.current.getValue().trim() +
          (hasLoopCode
            ? loopCodeSplit + '\n' + solutionLoopCodeEditorValue
            : ''),
        testCode: testCodeEditor.current.getValue().trim(),
      }
    })
  }, [subgoalNo, usePredefinedCode])

  return (
    <StyledSubgoal className={subgoalOpen ? 'open' : 'closed'}>
      <SubgoalHead>
        <Input
          size="1em"
          defaultValue={defaultData.title}
          ref={title}
          placeholder="Kort beskrivelse av hvordan deloppgaven skal utføres ..."
        />
        <Icon
          onClick={toggleSubgoal}
          size="2em"
          key={subgoalOpen ? 'expand_more' : 'chevron_right'}
          name={subgoalOpen ? 'expand_more' : 'chevron_right'}
        />
      </SubgoalHead>
      {descriptionOpen ? (
        <Help
          width="800px"
          y="6em"
          x="2em"
          z={97}
          absolute
          right
          md
        >{`Beskrivelsen her skrives i [Markdown](https://www.markdownguide.org/cheat-sheet) samtidig som den kan inkludere matematiske likninger i [Latex](https://katex.org/docs/supported.html). Her er noen eksempler:

### Tekst

All tekst, uten formateringene under, vil bli vist som vanlig tekst.

### Kodeblokker med Python

Bruk "\`\`\`" for å markere starten og slutten av en kodeblokk:

\`\`\`\`python
\`\`\`python
g = 9.81 # Gravitasjonskonstanten

def kvadrat(x):
  return x**2
\`\`\`
\`\`\`\`

### Likninger

Disse skrives i Latex med \`$\` foran og bak:

\`\`\`latex
$a_y(t_{i+1}) = g - \\frac{D}{m}$
\`\`\`

#### Likninger inni en tekst

\`\`\`latex
Dette er en $\\sqrt{(1+x)^2 + 1}$ tekst.
\`\`\`

#### Flere likninger sammen

Dette er litt komplekst, men kan komme til nytte:

\`\`\`latex
$$\\begin{array}{c}
a_y(t_{i+1}) = g - \\frac{D}{m} \\\\
v_y(t_{i+1}) = v_y(t_i) + a_y(t_{i+1}) * \\Delta t \\\\
s_y(t_{i+1}) = s_y(t_i) + v_y(t_{i+1}) * \\Delta t
\\end{array}$$
\`\`\`

### Tabeller

\`\`\`markdown
| Tid | Beregnet y | Eksakt y | Error |
|:---:|:----------:|:--------:|:-----:|
| 0   | 0          | 0        | 0     |
| 0.1 | 0.098      | 0.049    | 0.049 |
| 0.2 | 0.294      | 0.196    | 0.098 |
| 0.3 | 0.588      | 0.441    | 0.147 |
\`\`\`
`}</Help>
      ) : null}
      <Button onClick={toggleDescription}>
        <Icon
          key={descriptionOpen}
          name={descriptionOpen ? 'expand_more' : 'chevron_right'}
        />{' '}
        Legg til en lengre beskrivelse av deloppgaven{' '}
        <Icon name="description" />
      </Button>
      <TextEditor
        ref={descriptionRef}
        defaultValue={defaultData.description}
        placeholder={
          'Gjerne beskriv hvordan deloppgaven kan gjøres med kodeeksempler:\n\n```python\ng = 9.81 # Sette verdien 9.81 til variabel g\n```'
        }
        style={{ display: descriptionOpen ? 'flex' : 'none' }}
      />
      <Button onClick={() => setUseHiddenCode((use) => !use)}>
        <Icon
          key={useHiddenCode}
          name={useHiddenCode ? 'expand_more' : 'chevron_right'}
        />{' '}
        Legg til skjult kode for deloppgaven <Icon name="visibility_off" />
      </Button>
      <CodeEditorWrapper style={{ display: useHiddenCode ? 'flex' : 'none' }}>
        <DoubleCodeEditor>
          <CodeEditor
            width={'48%'}
            height={'240px'}
            value={hiddenCode}
            editorDidMount={handleHiddenCodeEditorDidMount}
          />
          <CodeEditor
            width={'48%'}
            height={'240px'}
            value={hiddenLoopCode}
            editorDidMount={handleLoopHiddenCodeEditorDidMount}
          />
        </DoubleCodeEditor>
      </CodeEditorWrapper>
      <SubgoalTitle>
        Kode til eleven <Icon name="code" />
      </SubgoalTitle>
      {sectionNo === 1 && subgoalNo === 2 ? (
        <Help
          width="800px"
          y="1em"
          x="23em"
          z={80}
          center
          md
        >{`Det er veldig greit at eleven får gjenbrukt sin egen kode over flere deloppgaver, men pass også på at de får ny startkode en gang i blant slik at de ikke ender opp med å bruke tiden på å finne feil i sin egen kode.`}</Help>
      ) : null}
      {sectionNo === 1 && subgoalNo === 1 ? null : (
        <RadioGroup
          labels={[
            'Fortsett på elevens kode fra forrige deloppgave',
            'Legg til ny startkode',
          ]}
          checked={usePredefinedCode ? 1 : 0}
          onChange={(choice) => setUsePredefinedCode(choice === 1)}
        />
      )}
      <CodeEditorWrapper
        style={{ display: usePredefinedCode ? 'flex' : 'none' }}
      >
        {sectionNo === 1 && subgoalNo === 1 ? null : (
          <button
            style={{ alignSelf: 'flex-start' }}
            onClick={() => {
              if (sectionNo > 1 || subgoalNo > 1) {
                let code = ''
                let loopCode = ''
                if (subgoalNo <= 1) {
                  const prevSectionNo = sectionNo - 1
                  const prevSubgoalNo = Math.max(
                    ...Object.keys(solutionCodes)
                      .map((id) => id.split('-').map((e) => parseInt(e)))
                      .filter(([sec, _]) => sec === prevSectionNo)
                      .map(([_, sub]) => sub)
                  )
                  const prevID = prevSectionNo + '-' + prevSubgoalNo
                  if (prevID in solutionCodes) {
                    code = solutionCodes[prevID]
                  }
                  if (prevID in solutionLoopCodes) {
                    loopCode = solutionLoopCodes[prevID]
                  }
                } else {
                  const prevSubgoalNo = subgoalNo - 1
                  const prevID = sectionNo + '-' + prevSubgoalNo
                  if (prevID in solutionCodes) {
                    code = solutionCodes[prevID]
                  }
                  if (prevID in solutionLoopCodes) {
                    loopCode = solutionLoopCodes[prevID]
                  }
                }
                predefinedCodeEditor.current.setValue(code)
                predefinedLoopCodeEditor.current.setValue(loopCode)
              }
            }}
          >
            Hent inn løsningskoden fra forrige deloppgave
          </button>
        )}
        {sectionNo === 1 && subgoalNo === 1 ? (
          <Help
            width="800px"
            y="2em"
            x="0em"
            z={93}
            left
            md
          >{`Her kan du oppgi kode til eleven på forhånd. Dette kan hjelpe eleven med å se helheten i oppgaven, men pass på at du ikke viser for mye detaljer. Om du har mye kode fra før bør denne skjules i "skjult kode"-blokkene.`}</Help>
        ) : null}
        {sectionNo === 1 && subgoalNo === 1 ? (
          <Help
            width="800px"
            y="2em"
            x="23em"
            z={92}
            center
            md
          >{`I denne kodeblokken kan du oppgi kode som skal simuleres. Denne blokken kjøres hver \`dt\` og du har tilgang til alle variablene fra den andre blokken her. Videre er det også mulig å bruke variabelen \`t\` for å hente ut tiden.`}</Help>
        ) : null}
        <DoubleCodeEditor>
          <CodeEditor
            width={'48%'}
            height={'240px'}
            value={predefinedCode}
            editorDidMount={handlePredefinedCodeEditorDidMount}
          />
          <CodeEditor
            width={'48%'}
            height={'240px'}
            value={predefinedLoopCode}
            editorDidMount={handlePredefinedLoopCodeEditorDidMount}
          />
        </DoubleCodeEditor>
      </CodeEditorWrapper>
      <SubgoalTitle>
        Løsning på deloppgaven <Icon name="visibility" />
      </SubgoalTitle>
      <SubgoalParagraph>
        Eleven kan velge å se løsningen etter de har forsøkt 3 ganger. Prøv å
        gjør løsningen så lesbar som mulig.
      </SubgoalParagraph>
      <CodeEditorWrapper>
        {usePredefinedCode ? (
          <button
            style={{ alignSelf: 'flex-start' }}
            onClick={() => {
              solutionCodeEditor.current.setValue(
                predefinedCodeEditor.current.getValue()
              )
              solutionLoopCodeEditor.current.setValue(
                predefinedLoopCodeEditor.current.getValue()
              )
            }}
          >
            Kopier inn fra koden til eleven <Icon name="file_copy" />
          </button>
        ) : null}
        {sectionNo === 1 && subgoalNo === 1 ? (
          <Help
            width="800px"
            y="0em"
            x="0em"
            z={91}
            left
            md
          >{`Denne løsningskoden er viktig for å demonstrere til eleven hva som er forventet resultet, men også for å kunne gi eleven en løsning på oppgaven om de står fast.`}</Help>
        ) : null}
        <DoubleCodeEditor>
          <CodeEditor
            width={'48%'}
            height={'240px'}
            value={solutionCode}
            onChange={(_, value) => {
              solutionCodes[sectionNo + '-' + subgoalNo] = value
              updateAddToTestButtons(value)
            }}
            editorDidMount={handleSolutionCodeEditorDidMount}
          />
          <CodeEditor
            width={'48%'}
            height={'240px'}
            value={solutionLoopCode}
            onChange={(_, value) => {
              solutionLoopCodes[sectionNo + '-' + subgoalNo] = value
              updateAddToTestButtons(solutionCodeEditor.current.getValue())
            }}
            editorDidMount={handleSolutionLoopCodeEditorDidMount}
          />
        </DoubleCodeEditor>
      </CodeEditorWrapper>
      <SubgoalTitle>
        Tester <Icon name="assignment_turned_in" />
      </SubgoalTitle>
      <SubgoalParagraph>
        Disse testene skal sjekke om svaret er riktig. Her kan du også gi en
        tilpasset tilbakemelding til eleven om hva som er feil.
      </SubgoalParagraph>
      <CodeEditorWrapper>
        <div style={{ display: 'flex', flexFlow: 'row wrap' }}>
          {addToTestButtons.map(({ text, icon, type, insert }) => (
            <AddButton
              className={type}
              onClick={() => {
                const oldValue = testCodeEditor.current.getValue()
                testCodeEditor.current.setValue(
                  (oldValue ? oldValue.trim() + '\n\n' : '') + insert + '\n'
                )
              }}
              key={text}
            >
              {text}
              {icon ? (
                <> {typeof icon === 'string' ? <Icon name={icon} /> : icon}</>
              ) : null}
            </AddButton>
          ))}
        </div>
        <Help
          width="800px"
          y="0em"
          x="0em"
          z={90}
          left
          md
        >{`For å teste om elvens kode er riktig kan du ta i bruk en rekke funksjoner. Disse er beskrevet her:

#### Sjekke om noe er definert

\`\`\`python
assert defined('g'), "Husk å definere 'g'"

# Begge disse er ekvivalente

if not defined("g"):
    raise Exception("Husk å definere 'g'")

# Den neste gir en litt snillere tilbakemelding:

if not defined("g"):
    print("Husk å definere 'g'")
    return False # Her må man returnere False for å stoppe koden
\`\`\`

#### Sjekke verdier

\`\`\`python
assert g == 9.81, "Du må sette g til 9.81"
\`\`\`

#### Sjekke med verdier til løsningen

Noen ganger kan det være vanskelig å si om hva verdien skal bli, så da kan man sammenligne med løsningen over sine verdier, med \`solution("variabel")\`:

\`\`\`python
assert g == solution("g"), f"Du må sette g til {solution("g")}"
\`\`\`

#### Sjekke verdier etter x sekunder

\`\`\`python
# Simulerer elevens kode og løsningskoden i 3 sekunder
simulate(time=3)

# Sjekker om elevens ball.y er lik løsningens ball.y, i t = 3
assert ball.y == solution("ball.y"), "Du må sette g til 9.81"
\`\`\`

#### Sjekke verdier etter x steg

\`\`\`python
# Simulerer elevens kode og løsningskoden 2 ganger til
simulate(steps=2)

# Sjekker om elevens ball.y nesten lik løsningens ball.y, i den nye tiden
error = abs(ball.y - solution("ball.y"))
assert error < 0.01, f"Du er veldig nærme. Du har en error på: {error}"
\`\`\`

#### Gi tilbakemelding til eleven

\`\`\`python
print("Du klarte deloppgaven! Godt jobbet!")
\`\`\`

Om du vil inkludere seksjonsnummer og deloppgavebokstav, så kan det gjøres slik:

\`\`\`python
print(f"Du klarte deloppgave {section}. {subgoal})!")
\`\`\`
`}</Help>
        <CodeEditor
          width={'1000px'}
          height={'320px'}
          value={testCode}
          editorDidMount={handleTestCodeEditorDidMount}
        />
      </CodeEditorWrapper>
      <SubgoalTitle>
        Prøv ut deloppgaven <Icon name="play_circle_filled" />
      </SubgoalTitle>
      <SubgoalParagraph>
        For å sjekke om alt stemmer, kan du teste deloppgaven slik eleven vil se
        den.
      </SubgoalParagraph>
      <button
        onClick={() => {
          setSectionNo(sectionNo)
          setSubgoalNo(subgoalNo)
          setUpdatedTask(Math.floor(Math.random() * 100000))
        }}
      >
        Prøv ut deloppgaven
      </button>
    </StyledSubgoal>
  )
}
