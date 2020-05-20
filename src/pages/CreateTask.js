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

## Lage konstanter

For å lage en konstant må du lage en variabel. Det gjøres slik:

\`\`\`python
variabelnavn = 1.23
\`\`\`

Her blir variabelen \`variabelnavn\` satt til desimaltallet \`1.23\`.

### Lag gravitasjonskonstanten \`g\` og sett den til \`9.81\`

Du kan lage en ball med å skrive:

\`\`\`python skjult
ball = Ball(x=0, y=0, r=1)
dt = 0.1
t_tot = 2
g = 0

#### ELEVENS KODE PLASSERES HER ####

def loop(t):
    ball.y = -1/2*g*t**2
\`\`\`

\`\`\`python løsning
g = 9.81
\`\`\`

\`\`\`python test
# Returner True / False ut ifra om testen er passert

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
\`\`\`

### Lag konstanten \`dt\` og sett den til \`0.01\`

\`\`\`python skjult
ball = Ball(x=0, y=0, r=1)
dt = 0.1
t_tot = 2
g = 0

#### ELEVENS KODE PLASSERES HER ####

def loop(t):
    ball.y = -1/2*g*t**2
\`\`\`

\`\`\`python løsning
g = 9.81
dt = 0.01
\`\`\`

\`\`\`python test
# Returner True / False ut ifra om testen er passert

# For å sjekke om en variabel er definert (alltid lurt å gi tilbakemelding på dette)
if not defined('dt'):
  print("Du må definere 'dt'") # Sender tilbakemelding til eleven
  return False # Testen feiler her

# Sjekke om en variabel ikke er lik fasitverdien
if dt != 0.01:
  print("Du må sette verdien 0.01 til variabel 'dt'. Husk å bruke punktum og ikke komma.")
  return False

# Her kan du printe ut en tilpasset melding til eleven. Gjerne bruk denne til motivasjon.
print("Du klarte oppgaven! La du merke til at simuleringen ble mindre hakkete?")
return True
\`\`\`

## Lag ballen

Sålangt har vi bare satt noen konstanter. Nå skal vi lage den ballen som ble vist i de forrige deloppgavene.

For å lage en ball kan man skrive:

\`\`\`python
ball = Ball(x=0, y=0) # Hvor x og y er posisjonen i rommet.
\`\`\`

### Lage en ball i punkt (0,0)

\`\`\`python startkode
g = 9.81
dt = 0.01

# Sett inn koden her
\`\`\`

\`\`\`python løsning
g = 9.81
dt = 0.01

ball = Ball(x=0, y=0)
\`\`\`

\`\`\`python test
# Returner True / False ut ifra om testen er passert

# For å sjekke om en variabel er definert (alltid lurt å gi tilbakemelding på dette)
if not defined('ball'):
  print("Du må definere 'ball'") # Sender tilbakemelding til eleven
  return False # Testen feiler her

# Sjekke om en variabel ikke er lik fasitverdien
if ball.x != 0 or ball.y != 0:
  print("Du må plassere ballen i punkt (0,0)")
  return False

# Her kan du printe ut en tilpasset melding til eleven. Gjerne bruk denne til motivasjon.
print("Du klarte oppgaven!")
return True
\`\`\`

### Endre ballens farge til "red"

For å endre fargen på ballen kan du legge til et til argument, \`color\`, til \`Ball(x=0, y=0, ...)\` slik:

\`\`\`python
ball = Ball(x=0, y=0, color="blue")
\`\`\`

\`\`\`python løsning
g = 9.81
dt = 0.01

ball = Ball(x=0, y=0, color="red")
\`\`\`

\`\`\`python test
# Returner True / False ut ifra om testen er passert

# Sjekke om en variabel ikke er lik fasitverdien
if ball.color != "red":
  print("Du må sette verdien \"red\" til ballen. Les instruksjonen.")
  return False

# Her kan du printe ut en tilpasset melding til eleven. Gjerne bruk denne til motivasjon.
print("Du klarte oppgaven! Så du hvordan fargen endret seg?")
return True
\`\`\`

### Sette radiusen til ballen til \`0.5\`

For å endre radius kan man bruke argumentet: \`r\`. Det brukes slik:

\`\`\`python
ball = Ball(x=0, y=0, color="red", r=1)
\`\`\`

\`\`\`python løsning
g = 9.81
dt = 0.01

ball = Ball(x=0, y=0, color="red", r=0.5)
\`\`\`

\`\`\`python test
# Returner True / False ut ifra om testen er passert

if ball.r != 0.5:
  print("Du må sette verdien 0.5 til ballradiusen. Husk å bruke punktum og ikke komma.")
  return False

# Her kan du printe ut en tilpasset melding til eleven. Gjerne bruk denne til motivasjon.
print("Du klarte oppgaven!")
return True
\`\`\`

## Bevege ballen basert på tid

Nå begynner morroa. Vi skal få ballen til å bevege seg. For å få ballen til å bevege seg må man kunne kjøre en kode veldig mange ganger, og for hver gang må ballens posisjon endre seg.

For å gjøre dette enkelt kan du bruke det nederste kodefeltet til å legge inn kode som skal kjøres mange ganger. Det kan brukes slik:

\`\`\`python
ball.y = t # t er tid i sekunder
\`\`\`

### Sett ballens y, \`ball.y\`, til tid \`t\`

\`\`\`python startkode
g = 9.81
dt = 0.01

ball = Ball(x=0, y=0, color="red", r=0.5)

#### LOOP ####
\`\`\`

\`\`\`python løsning
g = 9.81
dt = 0.01

ball = Ball(x=0, y=0, color="red", r=0.5)

#### LOOP ####

ball.y = t
\`\`\`

\`\`\`python test
# Returner True / False ut ifra om testen er passert

# Kjør loop 10 ganger
runLoopNTimes(10)

if ball.y != 0.01*10:
  print("Du må sette ball.y til tid t.")
  return False

# Her kan du printe ut en tilpasset melding til eleven. Gjerne bruk denne til motivasjon.
print("Du klarte oppgaven!")
return True
\`\`\`

### Sett ballens y til likningen for fritt fall

Likningen for fritt fall er:

$$y=\frac{1}{2}gt^2+v_0*t+y_0$$

Dette kan skrives om til kode, slik:

\`\`\`python
y = 1/2*g*t**2 + v_0*t + y_0
\`\`\`

\`\`\`python startkode
g = 9.81
dt = 0.01
v_0 = 0
y_0 = 0

ball = Ball(x=0, y=0, color="red", r=0.5)

#### LOOP ####

ball.y = t
\`\`\`

\`\`\`python løsning
g = 9.81
dt = 0.01
v_0 = 0
y_0 = 0

ball = Ball(x=0, y=0, color="red", r=0.5)

#### LOOP ####

ball.y = 1/2*g*t**2 + v_0*t + y_0
\`\`\`

\`\`\`python test
# Returner True / False ut ifra om testen er passert

# Kjør loop 10 ganger
runLoopNTimes(10)

if ball.y != 1/2*9.81*(0.01*10)**2:
  print("Kopier likningen fra instruksjonen.")
  return False

# Her kan du printe ut en tilpasset melding til eleven. Gjerne bruk denne til motivasjon.
print("Du klarte oppgaven!")
return True
\`\`\`

## Legge til luftmotstand

Denne delen kan være litt vanskelig, fordi vi må bruke en ny metode for å simulere fallet. Vi skal bruke en metode som heter Euler's metode. Kort sagt fungerer den slik:

\`\`\`python
ny_verdi = gammel_verdi + endring*tidssteg
\`\`\`

For å ta det inn i vårt eksempel, så kan vi gjøre dette med posisjon, fart og akselerasjon, hver for seg. Slik:

\`\`\`python
ay = ay + 0*dt # Ingen endring uten luftmotstand
vy = vy + ay*dt # Husk at "a" er [m/s^2], så når den ganges 
med dt, som er [s], så blir den [m/s] som er fart
y = y + vy*dt # Igjen, ganger med dt
\`\`\`

### Endre bevegelsen til Euler's metode

\`\`\`python startkode
g = 9.81
dt = 0.01

ay = g
vy = 0
y = 0

ball = Ball(x=0, y=0, color="red", r=0.5)

#### LOOP ####

# Fyll inn i variablene under
ay = ay
vy = vy + 
y = y + 

ball.y = y
\`\`\`

\`\`\`python løsning
g = 9.81
dt = 0.01

ay = g
vy = 0
y = 0

ball = Ball(x=0, y=0, color="red", r=0.5)

#### LOOP ####

# Fyll inn i variablene under
ay = ay
vy = vy + ay*dt
y = y + vy*dt

ball.y = y
\`\`\`

\`\`\`python test
# Returner True / False ut ifra om testen er passert

runLoopNTimes(10)
solution = runSolutionLoopNTimes(10)

if ball.y != solution("ball")["y"]:
  print("Kopier likningen fra instruksjonen.")
  return False

# Her kan du printe ut en tilpasset melding til eleven. Gjerne bruk denne til motivasjon.
print("Du klarte oppgaven!")
return True
\`\`\`

### Legge til luftmotstand til akselerasjon

Nå kommer den delen som er veldig vanskelig matematisk, men veldig enkel med programmering: legge til luftmotstand.

Her skal vi bare legge til en motstand i akselerasjonen. Dette kan nå gjøres slik:

\`\`\`python
ay = ay - motstand
\`\`\`

Motstanden regnes ut ifra en konstant og kvadratet av farten:

\`\`\`python
motstand = k*vy**2
\`\`\`

\`\`\`python startkode
g = 9.81
dt = 0.01

ay = g
vy = 0
y = 0

k = 0.3

ball = Ball(x=0, y=0, color="red", r=0.5)

#### LOOP ####

motstand = # Fyll inn her
ay = ay - motstand
vy = vy + ay*dt
y = y + vy*dt

ball.y = y
\`\`\`

\`\`\`python løsning
g = 9.81
dt = 0.01

ay = g
vy = 0
y = 0

k = 0.3

ball = Ball(x=0, y=0, color="red", r=0.5)

#### LOOP ####

motstand = k*vy**2
ay = ay - motstand
vy = vy + ay*dt
y = y + vy*dt

ball.y = y
\`\`\`

\`\`\`python test
# Returner True / False ut ifra om testen er passert

runLoopNTimes(10)
solution = runSolutionLoopNTimes(10)

if ball.y != solution("ball")["y"]:
  print("Kopier likningen fra instruksjonen.")
  return False

# Her kan du printe ut en tilpasset melding til eleven. Gjerne bruk denne til motivasjon.
print("Du klarte hele oppgaven! Gratulerer!")
return True
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

const solutionCodes = {}

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
  const [sectionToJSONFunctions, setSectionToJSONFunctions] = useState([
    () => ``,
  ])
  const [useMarkdownOnly, setUseMarkdownOnly] = useState(false)

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

  function buildJSONFromGUI(sections, sectionToJSONFunctions) {
    return {
      title: getCurrentValueOrDefault(title, 'value').trim() || 'Tittel',
      description: getCurrentValueOrDefault(description, 'value'),
      hiddenCode: hiddenCodeEditor.current().trim(),
      sections: sections.map(
        (section, i) => sectionToJSONFunctions[i] && sectionToJSONFunctions[i]()
      ),
    }
  }

  const saveTask = async () => {
    try {
      const ref = await firebase
        .firestore()
        .collection('tasks')
        .add({
          ...buildJSONFromGUI(sections, sectionToJSONFunctions),
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
          display: useMarkdownOnly ? 'flex' : 'none',
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
            //margin: 'auto',
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
            //margin: '1em auto 0',
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
                toJSON={(fn) => {
                  setSectionToJSONFunctions((stm) => [
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
  toJSON,
}) {
  const title = useRef(null)
  const descriptionRef = useRef(null)
  const toMarkdownFunction = useRef(toMarkdown)
  const toJSONFunction = useRef(toJSON)
  const [subgoals, setSubgoals] = useState([randomString()])
  const [sectionOpen, setSectionOpen] = useState(true)
  const [descriptionOpen, setDescriptionOpen] = useState(false)
  const [useHiddenCode, setUseHiddenCode] = useState(false)
  const hiddenCodeEditor = useRef(null)
  const [subgoalToMarkdownFunctions, setSubgoalToMarkdownFunctions] = useState([
    () => ``,
  ])
  const [subgoalToJSONFunctions, setSubgoalToJSONFunctions] = useState([
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

${addCode(hiddenCodeEditor.current.getValue().trim(), 'skjult')}
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
        hiddenCode: hiddenCodeEditor.current.getValue().trim(),
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
              prevSubgoal={i > 0 ? defaultData.subgoals[i - 1] : null}
              toMarkdown={(fn) => {
                setSubgoalToMarkdownFunctions((stm) => [
                  ...stm.slice(0, i),
                  fn,
                  ...stm.slice(i + 1, -1),
                ])
              }}
              toJSON={(fn) => {
                setSubgoalToJSONFunctions((stm) => [
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
  display: flex;
  flex-direction: column;
  align-items: flex-start;
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
  const predefinedCodeEditor = useRef(null)
  const solutionCodeEditor = useRef(null)
  const testCodeEditor = useRef(null)

  function toggleSubgoal() {
    setSubgoalOpen((open) => !open)
  }

  function toggleDescription() {
    setDescriptionOpen((open) => !open)
  }

  function handleHiddenCodeEditorDidMount(_, _editor) {
    hiddenCodeEditor.current = _editor
  }

  function handlePredefinedCodeEditorDidMount(_, _editor) {
    predefinedCodeEditor.current = _editor
  }

  function handleSolutionCodeEditorDidMount(_, _editor) {
    solutionCodeEditor.current = _editor
    solutionCodes[sectionNo + '-' + subgoalNo] = _editor.getValue()
  }

  function handleTestCodeEditorDidMount(_, _editor) {
    testCodeEditor.current = _editor
  }

  useEffect(() => {
    toMarkdownFunction.current(
      () => `### ${title.current.value.trim()}

${descriptionRef.current.value.trim()}

${addCode(hiddenCodeEditor.current.getValue().trim(), 'skjult')}
${
  usePredefinedCode
    ? `${addCode(predefinedCodeEditor.current.getValue().trim(), 'startkode')}`
    : ''
}
${addCode(solutionCodeEditor.current.getValue().trim(), 'løsning')}
${addCode(testCodeEditor.current.getValue().trim(), 'test')}
`
    )
  }, [subgoalNo, usePredefinedCode])

  useEffect(() => {
    toJSONFunction.current(() => ({
      title: title.current.value.trim(),
      description: descriptionRef.current.value.trim(),
      hiddenCode: hiddenCodeEditor.current.getValue().trim(),
      ...(usePredefinedCode && {
        predefinedCode: predefinedCodeEditor.current.getValue().trim(),
      }),
      solutionCode: solutionCodeEditor.current.getValue().trim(),
      testCode: testCodeEditor.current.getValue().trim(),
    }))
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
      <CodeEditorWrapper style={{ display: useHiddenCode ? 'flex' : 'none' }}>
        <CodeEditor
          width={'1000px'}
          height={'240px'}
          value={defaultData.hiddenCode}
          editorDidMount={handleHiddenCodeEditorDidMount}
        />
      </CodeEditorWrapper>
      <SubgoalTitle>Kode til eleven</SubgoalTitle>
      {sectionNo === 1 && subgoalNo === 1 ? null : (
        <RadioGroup
          labels={[
            'Fortsett på elevens kode fra forrige deloppgave',
            'Legg til ny startkode',
          ]}
          defaultChecked={0}
          onChange={(choice) => {
            setUsePredefinedCode(choice >= 1)
          }}
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
                const ID = sectionNo + '-' + subgoalNo
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
                } else {
                  const prevSubgoalNo = subgoalNo - 1
                  const prevID = sectionNo + '-' + prevSubgoalNo
                  if (prevID in solutionCodes) {
                    code = solutionCodes[prevID]
                  }
                }
                predefinedCodeEditor.current.setValue(code)
              }
            }}
          >
            Hent inn løsningskoden fra forrige deloppgave
          </button>
        )}
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
          onChange={(_, value) =>
            (solutionCodes[sectionNo + '-' + subgoalNo] = value)
          }
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
