import React, { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import styled from 'styled-components'
import * as firebase from 'firebase/app'
import mdIt from 'markdown-it'
import mk from 'markdown-it-katex'
import hljs from 'highlight.js'
import 'highlight.js/styles/vs2015.css'

import { SubTitle, Paragraph } from '../components/Typography'
import Icon from '../components/Icon'
import { Button, Input, RadioGroup, CodeEditor } from '../components/Form'
import {
  TextEditor,
  ExtendedMarkdownEditor,
  parseMarkdownOnly,
} from '../components/TextEditor'

const md = mdIt({
  langPrefix: 'language-',
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(lang, str).value
      } catch (__) {}
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

  > li {
    counter-increment: section-counter;
    display: flex;
    flex-flow: row nowrap;

    ::before {
      content: counter(section-counter) '. ';
      display: inline-block;
      margin: 1.3em 0.5em 1em 0;
      font-size: 1.5em;
    }
  }
`

const placeholders = {
  testCode: `# Returner True / False ut ifra om testen er passert

# For å sjekke om en variabel er definert (alltid lurt å gi tilbakemelding på dette)
if not defined('g'):
  print("Du må definere 'g'") # Sender tilbakemelding til eleven
  return False # Testen feiler her

# Sjekke om en variabel ikke er lik fasitverdien
if g != 9.81:
  print("Du må sette verdien 9.81 til variabel 'g'. Husk å bruke punktum og ikke komma.")
  return False

# Her kan du printe ut en tilpasset melding til eleven. Gjerne bruk denne til motivasjon.
print("Du klarte oppgaven!")
return True
`,
  testMarkdown: `# Ball i fritt fall

Her skal du simulere en ball som faller i fritt fall.

## Lag ballen

Her skal du lage en ball som

### Bruk Ball(...) til å lage en ball

Du kan lage en ball med å skrive:

\`\`\`python
ball = Ball(x=0, y=0) # x og y er posisjonen i meter
\`\`\`

\`\`\`python startkode

\`\`\`

\`\`\`python løsning
ball = Ball(x=0, y=0)
\`\`\`

\`\`\`python test
if not ball:
  print("Du må definere ball.")
\`\`\`

### Flytt ballen til (0, 1)

Nå skal ballen, \`ball\`, flyttes til (0, 1). Henholdsvis x = 0 og y = 1.

\`\`\`python startkode
ball = Ball(x=0, y=0)
\`\`\`

\`\`\`python løsning
ball = Ball(x=0, y=1)
\`\`\`

\`\`\`python test
if not ball:
  print("Du må definere ball.")
  return false
else:
  if ball.x == 0 and ball.y == 1:
    print("Du klarte det!")
    return true

return false
\`\`\`

## Lage konstanter

Nå skal vi legge til noen konstanter slik at vi kan få ballen til å falle. For å lage en konstant \`a\` med verdi \`1.23\`, så bare skriver vi:

\`\`\`python
a = 1.23
\`\`\`

### Lage gravitasjonskonstanten

Lag gravitasjonskonstanten, \`g\`, og sett den til \`9.81\`.

\`\`\`python startkode
ball = Ball(x=0, y=1) # Bare la denne stå
\`\`\`

\`\`\`python løsning
ball = Ball(x=0, y=1) # Bare la denne stå
g = 9.81
\`\`\`

\`\`\`python test
if not g:
  g = 9.81
\`\`\`
`,
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
  const { uid } = useSelector((state) => state.user)
  const title = useRef('')
  const description = useRef('')
  const [sections, setSections] = useState([randomString()])
  const [saveFeedback, setSaveFeedback] = useState('')
  const [sectionsData, setSectionsData] = useState([emptySection])
  const [useHiddenCode, setUseHiddenCode] = useState(false)
  const [newlyHydrated, setNewlyHydrated] = useState(false)
  const [
    extendedMarkdownEditorValue,
    setExtendedMarkdownEditorValue,
  ] = useState('')
  const hiddenCodeEditor = useRef(null)
  const [defaultData, setDefaultData] = useState({
    hiddenCode: '',
  })
  const defaultTitle = ''
  const defaultDecription = ''
  const [sectionToMarkdownFunctions, setSectionToMarkdownFunctions] = useState([
    () => ``,
  ])
  const [useMarkdownOnly, setUseMarkdownOnly] = useState(false)

  const saveTask = async () => {
    try {
      const ref = await firebase
        .firestore()
        .collection('tasks')
        .add({
          title: title.current.value,
          description: description.current.value,
          hiddenCode: defaultData.hiddenCode,
          sections: sectionsData,
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
    }
  }

  function handleHiddenCodeEditorDidMount(_valueGetter) {
    hiddenCodeEditor.current = _valueGetter
  }

  function buildMarkdownFromGUI(sections, sectionToMarkdownFunctions) {
    return `# ${getCurrentValueOrDefault(title, 'value').trim() || 'Tittel'}

${getCurrentValueOrDefault(description, 'value')}

${addCode(hiddenCodeEditor.current().trim(), 'skjult')}
${sections
  .map(
    (section, i) =>
      sectionToMarkdownFunctions[i] && sectionToMarkdownFunctions[i]()
  )
  .join('\n')
  .trim()}`
  }

  useEffect(() => {
    if (useMarkdownOnly) {
      // Convert GUI to Markdown
      const markdown = buildMarkdownFromGUI(
        sections,
        sectionToMarkdownFunctions
      )
      setExtendedMarkdownEditorValue(markdown)
    } else if (!newlyHydrated && extendedMarkdownEditorValue) {
      // Hydrate GUI
      const result = parseMarkdownOnly(extendedMarkdownEditorValue)
      setNewlyHydrated(true)
      setTimeout(() => {
        setNewlyHydrated(false)
      }, 200)
      title.current.value = result.title
      description.current.value = result.description
      setDefaultData({ hiddenCode: result.hiddenCode })
      setSectionsData(result.sections)
      if (result.sections.length !== sections.length) {
        setSections(result.sections.map(() => randomString()))
      }
    }
  }, [useMarkdownOnly, sections, sectionToMarkdownFunctions])

  return (
    <Container>
      <SubTitle style={{ fontSize: '2.5rem' }}>
        Lag en ny opp
        <span onClick={() => setUseMarkdownOnly((use) => !use)}>g</span>
        ave
      </SubTitle>
      <div
        style={{
          display: useMarkdownOnly ? 'initial' : 'none',
          fontSize: '1rem',
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
          display: !useMarkdownOnly ? 'initial' : 'none',
          width: '100%',
        }}
      >
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
        <Paragraph align="left">
          Det er viktig å dele oppgaven inn i seksjoner. Her er noen eksempler
          på typiske seksjoner:
        </Paragraph>
        <ul style={{ textAlign: 'left', alignSelf: 'flex-start' }}>
          <li>Definere konstanter</li>
          <li>Lage en ball</li>
          <li>Bevege ballen basert på tid</li>
          <li>Få ballen til å falle med gravitasjonskraften</li>
        </ul>
        <Button onClick={() => setUseHiddenCode((use) => !use)}>
          <Icon
            key={useHiddenCode}
            name={useHiddenCode ? 'expand_more' : 'chevron_right'}
          />{' '}
          Legg til skjult kode for hele oppgaven
        </Button>
        <Paragraph
          style={{
            display: useHiddenCode ? 'initial' : 'none',
            maxWidth: '800px',
            margin: 'auto',
          }}
          align="left"
        >
          Ofte vil man fjerne distraksjoner fra det eleven skal lære. Legg det
          du vil skjule her, slik som funksjoner og verdier. Disse vil videre
          kunne bli brukt av eleven i deres kode.
        </Paragraph>
        <CodeEditorWrapper
          style={{
            display: useHiddenCode ? 'initial' : 'none',
            maxWidth: '800px',
            margin: '1em auto 0',
          }}
        >
          <CodeEditor
            width={'100%'}
            height={'240px'}
            value={defaultData.hiddenCode}
            editorDidMount={handleHiddenCodeEditorDidMount}
          />
        </CodeEditorWrapper>
        <Sections>
          {sections.map((section, i) => (
            <li key={section}>
              <Section
                sectionNo={i + 1}
                defaultData={sectionsData[i]}
                toMarkdown={(fn) => {
                  setSectionToMarkdownFunctions((stm) => [
                    ...stm.slice(0, i),
                    fn,
                    ...stm.slice(i + 1, -1),
                  ])
                }}
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

  &.closed > ${SectionHead} ~ * {
    display: none !important;
  }
`

const SectionContent = styled.ol`
  display: flex;
  flex-flow: column nowrap;
  padding: 0;
  width: 100%;

  > li {
    counter-increment: subgoal-counter;
    display: flex;
    flex-flow: row nowrap;
    font-size: 1em;
    background: #0002;
    border-radius: 6px;
    margin-top: 1em;
    padding: 0 0.5em 0 1em;

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
  toMarkdown,
}) {
  const title = useRef(null)
  const descriptionRef = useRef(null)
  const toMarkdownFunction = useRef(toMarkdown)
  const [subgoals, setSubgoals] = useState([randomString()])
  const [sectionOpen, setSectionOpen] = useState(true)
  const [descriptionOpen, setDescriptionOpen] = useState(false)
  const [useHiddenCode, setUseHiddenCode] = useState(false)
  const hiddenCodeEditor = useRef(null)
  const [subgoalToMarkdownFunctions, setSubgoalToMarkdownFunctions] = useState([
    () => ``,
  ])

  useEffect(() => {
    if (defaultData.subgoals.length !== subgoals.length) {
      setSubgoals(defaultData.subgoals.map(() => randomString()))
    }
  }, [defaultData])

  useEffect(() => {
    if (toMarkdownFunction.current !== null) {
      toMarkdownFunction.current(
        () => `## ${getCurrentValueOrDefault(title, 'value').trim()}

${getCurrentValueOrDefault(descriptionRef, 'value').trim()}

${addCode(hiddenCodeEditor.current().trim(), 'skjult')}
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

  function toggleSection() {
    setSectionOpen((open) => !open)
  }

  function toggleDescription() {
    setDescriptionOpen((open) => !open)
  }

  function handleHiddenCodeEditorDidMount(_valueGetter) {
    hiddenCodeEditor.current = _valueGetter
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
      <Button onClick={toggleDescription}>
        <Icon
          key={descriptionOpen}
          name={descriptionOpen ? 'expand_more' : 'chevron_right'}
        />{' '}
        Legg til en lengre beskrivelse av seksjonen
      </Button>
      <TextEditor
        showInitialHelpText={true}
        ref={descriptionRef}
        defaultValue={defaultData.description}
        style={{ display: descriptionOpen ? 'flex' : 'none' }}
      />
      <Button onClick={() => setUseHiddenCode((use) => !use)}>
        <Icon
          key={useHiddenCode}
          name={useHiddenCode ? 'expand_more' : 'chevron_right'}
        />{' '}
        Legg til skjult kode for hele seksjonen
      </Button>
      <Paragraph style={{ display: useHiddenCode ? 'initial' : 'none' }}>
        Ofte vil man fjerne distraksjoner fra det eleven skal lære. Legg det du
        vil skjule her, slik som funksjoner og verdier. Disse vil videre kunne
        bli brukt av eleven i deres kode.
      </Paragraph>
      <CodeEditorWrapper
        style={{
          display: useHiddenCode ? 'initial' : 'none',
          maxWidth: '800px',
          margin: 'auto',
        }}
      >
        <CodeEditor
          width={'100%'}
          height={'320px'}
          value={defaultData.hiddenCode}
          editorDidMount={handleHiddenCodeEditorDidMount}
        />
      </CodeEditorWrapper>
      <SectionContent>
        {subgoals.map((subgoal, i) => (
          <li key={subgoal}>
            <Subgoal
              sectionNo={sectionNo}
              subgoalNo={i + 1}
              defaultData={defaultData.subgoals[i]}
              toMarkdown={(fn) => {
                setSubgoalToMarkdownFunctions((stm) => [
                  ...stm.slice(0, i),
                  fn,
                  ...stm.slice(i + 1, -1),
                ])
              }}
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
  width: 100%;
  :not(:empty) {
    margin-top: 1em;
    margin-bottom: 1em;
  }
`
const getAlpha = (n) => String.fromCharCode(97 + ((n - 1) % 26))

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
  toMarkdown,
}) {
  const title = useRef(null)
  const descriptionRef = useRef(null)
  const toMarkdownFunction = useRef(toMarkdown)
  const [subgoalOpen, setSubgoalOpen] = useState(true)
  const [descriptionOpen, setDescriptionOpen] = useState(false)
  const [useHiddenCode, setUseHiddenCode] = useState(false)
  const [usePredefinedCode, setUsePredefinedCode] = useState(false)
  const hiddenCodeEditor = useRef(null)
  const predefinedCodeEditor = useRef(null)
  const solutionCodeEditor = useRef(null)
  const testCodeEditor = useRef(null)

  function toggleSubgoal() {
    setSubgoalOpen((open) => !open)
  }

  function toggleDescription() {
    setDescriptionOpen((open) => !open)
  }

  function handleHiddenCodeEditorDidMount(_valueGetter) {
    hiddenCodeEditor.current = _valueGetter
  }

  function handlePredefinedCodeEditorDidMount(_valueGetter) {
    predefinedCodeEditor.current = _valueGetter
  }

  function handleSolutionCodeEditorDidMount(_valueGetter) {
    solutionCodeEditor.current = _valueGetter
  }

  function handleTestCodeEditorDidMount(_valueGetter) {
    testCodeEditor.current = _valueGetter
  }

  useEffect(() => {
    toMarkdownFunction.current(
      () => `### ${title.current.value.trim()}

${descriptionRef.current.value.trim()}

${addCode(hiddenCodeEditor.current().trim(), 'skjult')}
${
  usePredefinedCode
    ? `${addCode(predefinedCodeEditor.current().trim(), 'startkode')}`
    : ''
}
${addCode(solutionCodeEditor.current().trim(), 'løsning')}
${addCode(testCodeEditor.current().trim(), 'test')}
`
    )
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
          key={subgoalOpen}
          name={subgoalOpen ? 'expand_more' : 'chevron_right'}
        />
      </SubgoalHead>
      <Button onClick={toggleDescription}>
        <Icon
          key={descriptionOpen}
          name={descriptionOpen ? 'expand_more' : 'chevron_right'}
        />{' '}
        Legg til en lengre beskrivelse av deloppgaven
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
        Legg til skjult kode
      </Button>
      <SubgoalParagraph style={{ display: useHiddenCode ? 'initial' : 'none' }}>
        Ofte vil man fjerne distraksjoner fra det eleven skal lære. Legg det du
        vil skjule her, slik som funksjoner og verdier. Disse vil videre kunne
        bli brukt av eleven i deres kode.
      </SubgoalParagraph>
      <CodeEditorWrapper
        style={{ display: useHiddenCode ? 'initial' : 'none' }}
      >
        <CodeEditor
          width={'1000px'}
          height={'240px'}
          value={defaultData.hiddenCode}
          editorDidMount={handleHiddenCodeEditorDidMount}
        />
      </CodeEditorWrapper>
      <SubgoalTitle>Kode til eleven</SubgoalTitle>
      <RadioGroup
        labels={[
          sectionNo === 1 && subgoalNo === 1
            ? 'Start med ingen kode'
            : 'Gjenbruk koden fra forrige deloppgave',
          'Legg til forhåndsdefinert kode',
        ]}
        defaultChecked={0}
        onChange={(choice) => setUsePredefinedCode(choice === 1)}
      />
      <CodeEditorWrapper
        style={{ display: usePredefinedCode ? 'initial' : 'none' }}
      >
        <CodeEditor
          width={'1000px'}
          height={'240px'}
          value={defaultData.predefinedCode}
          editorDidMount={handlePredefinedCodeEditorDidMount}
        />
      </CodeEditorWrapper>
      <SubgoalTitle>Løsning på deloppgaven</SubgoalTitle>
      <SubgoalParagraph>
        Eleven kan velge å se løsningen etter de har forsøkt 3 ganger. Prøv å
        gjør løsningen så lesbar som mulig.
      </SubgoalParagraph>
      <CodeEditorWrapper>
        <CodeEditor
          width={'1000px'}
          height={'240px'}
          value={defaultData.solutionCode}
          editorDidMount={handleSolutionCodeEditorDidMount}
        />
      </CodeEditorWrapper>
      <SubgoalTitle>Tester</SubgoalTitle>
      <SubgoalParagraph>
        Disse testene skal sjekke om svaret er riktig. Her kan du også gi en
        tilpasset tilbakemelding til eleven om hva som er feil.
      </SubgoalParagraph>
      <CodeEditorWrapper>
        <button onClick={() => console.log('kjøøør')}>Kjør testen</button>
        <CodeEditor
          width={'1000px'}
          height={'320px'}
          value={defaultData.testCode}
          editorDidMount={handleTestCodeEditorDidMount}
        />
      </CodeEditorWrapper>
    </StyledSubgoal>
  )
}
