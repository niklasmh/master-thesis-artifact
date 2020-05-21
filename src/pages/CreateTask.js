import React, { useEffect, useRef, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
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
  parseMarkdownOnly,
} from '../components/TextEditor'
import TaskCodeEnvironment from '../modules'

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

    ::before {
      content: counter(section-counter) '. ';
      display: inline-block;
      margin: 1.3em 0.5em 1em 0;
      font-size: 1.5em;
    }
  }
`

const placeholders = {
  testCode: `
# For å sjekke om en variabel er definert (alltid lurt å gi tilbakemelding på dette)
assert defined('g'), "Du må definere 'g'" # Sender tilbakemelding til eleven om dette feiler

# Sjekke om en variabel er lik fasitverdien
assert g == 9.81, "Du må sette verdien 9.81 til variabel 'g'. Husk å bruke punktum og ikke komma."

# Simulere 2 sekunder frem i tid
simulate(t=2)

# Sjekke om elevens ball.y er lik løsningen over sin ball.y i sekund 2
assert ball.y == solution("ball.y"), "Husk å sette ballens fart til 2 m/s"

# Om testen ikke har feilet til nå, så er den
print("Du klarte oppgaven!")
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
  const dispatch = useDispatch()
  const { uid } = useSelector((state) => state.user)
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
  const testTaskAnchor = useRef(null)

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

  const testTask = () => {
    const newTask = buildJSONFromGUI(sections, sectionToJSONFunctions)
    console.log(newTask)
    setTask(newTask)
    setTimeout(() => {
      testTaskAnchor.current.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      })
    }, 100)
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
          display: !useMarkdownOnly ? 'inherit' : 'none',
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
          x="-8em"
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
          Legg til skjult kode for hele oppgaven
        </Button>
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
              <Section
                sectionNo={i + 1}
                setSectionNo={setSectionNo}
                setSubgoalNo={setSubgoalNo}
                setUpdatedTask={setUpdatedTask}
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
      />
      <div ref={testTaskAnchor} />
      <AddNewSection onClick={saveTask}>Lagre oppgaven</AddNewSection>
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
      <Help
        width="800px"
        y="0.5em"
        x="18em"
        z={97}
        center
        md
      >{`Denne beskrivelsen skal være en introduksjon til seksjonen. Gjerne oppgi teori som skal brukes i seksjonen.

Beskrivelsen her skrives i [Markdown](https://www.markdownguide.org/cheat-sheet) samtidig som den kan inkludere matematiske likninger i [Latex](https://katex.org/docs/supported.html). Her er noen eksempler:

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
      <Button onClick={toggleDescription}>
        <Icon
          key={descriptionOpen}
          name={descriptionOpen ? 'expand_more' : 'chevron_right'}
        />{' '}
        Legg til en lengre beskrivelse av seksjonen
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
        Legg til skjult kode for hele seksjonen
      </Button>
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
            <Subgoal
              sectionNo={sectionNo}
              subgoalNo={i + 1}
              setSectionNo={setSectionNo}
              setSubgoalNo={setSubgoalNo}
              setUpdatedTask={setUpdatedTask}
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
        Legg til skjult kode for deloppgaven
      </Button>
      <CodeEditorWrapper style={{ display: useHiddenCode ? 'flex' : 'none' }}>
        <CodeEditor
          width={'1000px'}
          height={'240px'}
          value={defaultData.hiddenCode}
          editorDidMount={handleHiddenCodeEditorDidMount}
        />
      </CodeEditorWrapper>
      <SubgoalTitle>Kode til eleven</SubgoalTitle>
      {sectionNo === 1 && subgoalNo === 2 ? (
        <Help
          width="800px"
          y="1em"
          x="23em"
          z={90}
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
        {sectionNo === 1 && subgoalNo === 1 ? (
          <Help
            width="800px"
            y="0em"
            x="0em"
            z={93}
            left
            md
          >{`Her kan du oppgi kode til eleven på forhånd. Dette kan hjelpe eleven med å se helheten i oppgaven, men pass på at du ikke viser for mye detaljer. Om du har mye kode fra før bør denne skjules i "skjult kode"-blokkene.`}</Help>
        ) : null}
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
        {sectionNo === 1 && subgoalNo === 1 ? (
          <Help
            width="800px"
            y="0em"
            x="0em"
            z={92}
            left
            md
          >{`Denne løsningskoden er viktig for å demonstrere til eleven hva som er forventet resultet, men også for å kunne gi eleven en løsning på oppgaven om de står fast.`}</Help>
        ) : null}
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
        <button onClick={() => console.log('test')}>Kjør testen</button>
        <Help
          width="800px"
          y="0em"
          x="0em"
          z={91}
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
simulate(t=3)

# Sjekker om elevens ball.y er lik løsningens ball.y, i t = 3
assert ball.y == solution("ball.y"), "Du må sette g til 9.81"
\`\`\`

#### Sjekke verdier etter x steg

\`\`\`python
# Simulerer elevens kode og løsningskoden 2 ganger til
simulate(steps=2)

# Sjekker om elevens ball.y nesten lik løsningens ball.y, i den nye tiden
error = abs(ball.y - solution("ball.y"))
assert error > 0.01, f"Du er veldig nærme. Du har en error på: {error}"
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
          value={defaultData.testCode}
          editorDidMount={handleTestCodeEditorDidMount}
        />
      </CodeEditorWrapper>
      <SubgoalTitle>Prøv ut deloppgaven</SubgoalTitle>
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
