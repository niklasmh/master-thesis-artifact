import React, { forwardRef, useState, useRef, useEffect } from 'react'
import styled from 'styled-components'
import { useSelector } from 'react-redux'
import mdIt from 'markdown-it'
import mk from 'markdown-it-katex'
import hljs from 'highlight.js'
import 'highlight.js/styles/vs2015.css'
import { lightCodeTheme } from '../utils/light-code-theme'

import { Button, Input, TextArea, RadioGroup, CodeEditor } from './Form'
import Icon from './Icon'

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

export function Markdown({ children, ...props }) {
  const [renderedMarkdown, setRenderedMarkdown] = useState('')

  useEffect(() => {
    setRenderedMarkdown(md.render(children.replace(/\\n/g, '\n')))
  }, [children])

  return (
    <RenderedMarkdown
      dangerouslySetInnerHTML={{ __html: renderedMarkdown }}
      {...props}
    />
  )
}

const StyledTextEditor = styled.div`
  display: flex;
  flex-flow: row wrap;
  width: 100%;
  font-size: 0.8em;
  margin: 0.5em auto;
  align-items: flex-start;
  text-align: left;

  > textarea {
    align-self: stretch;
  }

  > * {
    flex: 1 1 200px;
    display: inline-block;
  }
`

export const RenderedMarkdown = styled.div`
  color: #fff;

  .light & {
    color: #000;
  }

  blockquote {
    border-left: 4px solid #fff4;
    padding: 1px 0 1px 1em;
    margin: 0;
    background-color: #fff1;
    border-radius: 6px;
    border-top-left-radius: 3px;
    border-bottom-left-radius: 3px;

    .light & {
      border-left-color: #fff;
      background-color: #0001;
    }
  }

  table {
    border-spacing: 0;
    border-collapse: collapse;

    tr {
      :nth-child(2n) > td {
        background-color: #fff1;
      }
      th,
      td {
        border: 1px solid #fff3;
        padding: 6px 13px;
      }
    }
  }

  .light & {
    ${lightCodeTheme}
  }
`

const initialHelpText = `Her kan man skrive i [Markdown](https://www.markdownguide.org/cheat-sheet) samt inkludere matematiske likninger i [Latex](https://katex.org/docs/supported.html).

# Tittel 1
## Tittel 2

### Likninger inni en tekst

Dette er en $\\sqrt{(1+x)^2 + 1}$ tekst.

### Flere likninger sammen

$$\\begin{array}{c}
a_y(t_{i+1}) = g - \\frac{D}{m} \\\\
v_y(t_{i+1}) = v_y(t_i) + a_y(t_{i+1}) * \\Delta t \\\\
s_y(t_{i+1}) = s_y(t_i) + v_y(t_{i+1}) * \\Delta t
\\end{array}$$

### Kodeblokk med Python

\`\`\`python
g = 9.81 # Gravitasjonskonstanten

def kvadrat(x):
  return x**2
\`\`\`

### Tabell

| Tid | Beregnet y | Eksakt y | Error |
|:---:|:----------:|:--------:|:-----:|
| 0   | 0          | 0        | 0     |
| 0.1 | 0.098      | 0.049    | 0.049 |
| 0.2 | 0.294      | 0.196    | 0.098 |
| 0.3 | 0.588      | 0.441    | 0.147 |
`
export const addToDescriptionButtons = [
  {
    text: 'Kodeblokk',
    icon: 'code',
    insert: '```python\n# Skriv Python kode her\n```',
  },
  {
    text: 'Likning',
    icon: 'functions',
    insert: '$a_y(t_{i+1}) = g - \\frac{D}{m}$',
  },
  {
    text: 'Flerlinjet likning',
    icon: 'functions',
    insert: `$$\\begin{array}{c}
a_y(t_{i+1}) = g - \\frac{D}{m} \\\\
v_y(t_{i+1}) = v_y(t_i) + a_y(t_{i+1}) * \\Delta t \\\\
s_y(t_{i+1}) = s_y(t_i) + v_y(t_{i+1}) * \\Delta t
\\end{array}$$`,
  },
  {
    text: 'Tabell',
    icon: 'view_list',
    insert: `| Tid | Beregnet y | Eksakt y | Error |
|:---:|:----------:|:--------:|:-----:|
| 0   | 0          | 0        | 0     |
| 0.1 | 0.098      | 0.049    | 0.049 |
| 0.2 | 0.294      | 0.196    | 0.098 |
| 0.3 | 0.588      | 0.441    | 0.147 |`,
  },
  {
    text: 'Nummerert liste',
    icon: 'format_list_numbered',
    insert: `1. ...
2. ...`,
  },
  {
    text: 'Unummerert liste',
    icon: 'format_list_bulleted',
    insert: `* ...
* ...`,
  },
  {
    text: 'Bilde (via URL)',
    icon: 'insert_photo',
    insert: `![Leonhard Euler](https://upload.wikimedia.org/wikipedia/commons/6/60/Leonhard_Euler_2.jpg)`,
  },
  {
    text: 'Lenke',
    icon: 'link',
    insert: `[Leonhard Euler](https://no.wikipedia.org/wiki/Leonhard_Euler)`,
  },
  {
    text: 'Sitat',
    icon: 'format_quote',
    insert: `> Logic is the foundation of the certainty of all the knowledge we acquire\n>\n> -- _Leonhard Euler_`,
  },
]

export const addTemplateToDescriptionButtons = [
  {
    text: 'Konstanter',
    icon: 'square_foot',
    insert: `For å lage en konstant kan man bruke \`=\`, slik:

\`\`\`python
navn_på_konstant = 1.23
\`\`\`

Legg merke til at desimaltall bruker punktum og ikke komma.`,
  },
  {
    text: 'Lage en kloss',
    icon: 'stop',
    insert: `For å lage en kloss kan du gjøre slik:

\`\`\`python
kloss = Kloss(x=0, y=0, b=1, h=1, rot=0, color="blue")
\`\`\`

Her er \`x\` og \`y\` posisjonen i meter. \`b\` og \`h\` er bredden og høyden i meter. \`rot\` er rotasjonen i radianer, og \`color\` er fargen.`,
  },
  {
    text: 'Lage en ball',
    icon: 'fiber_manual_record',
    insert: `For å lage en ball kan du gjøre slik:

\`\`\`python
ball = Ball(x=0, y=0, r=1, color="blue")
\`\`\`

Her er \`x\` og \`y\` posisjonen i meter. \`r\` er radiusen i meter og \`color\` er fargen.`,
  },
  {
    text: 'Lage en planet',
    icon: 'public',
    insert: `For å lage en planet kan du gjøre slik:

\`\`\`python
planet = Planet(x=0, y=0, r=1, m=1, color="blue")
\`\`\`

Her er \`x\` og \`y\` posisjonen i meter. \`r\` er radiusen i meter, \`m\` er massen i kilogram og \`color\` er fargen.`,
  },
  {
    text: 'Lage en linje',
    icon: 'show_chart',
    insert: `For å lage en linje kan du gjøre slik:

\`\`\`python
linje = Linje(x1=0, y1=0, x2=1, y2=1, w=3, color="black")
\`\`\`

Her er \`x1\` og \`y1\` startposisjonen i meter. \`x2\` og \`y2\` er sluttposisjonen i meter. \`w\` er bredden til linja i pixler på skjermen. \`color\` er fargen.`,
  },
  {
    text: "Euler's metode",
    insert: `Euler's metode fungerer slik:

\`\`\`python
ny_verdi = gammel_verdi + endring*tidssteg
\`\`\`

For å ta det inn i vårt eksempel, så kan vi gjøre dette med posisjon, fart og akselerasjon, hver for seg. Slik:

\`\`\`python
ay = g
vy = vy + ay*dt # Her er 'vy' gammel verdi og 'ay' endringen
y = y + vy*dt # Her er 'y' gammel verdi og 'vy' endringen
\`\`\``,
  },
  {
    text: 'Luftmotstand',
    icon: <i className="fas fa-wind"></i>,
    insert: `Luftmotstand er en kraft som alltid går i mot akselerasjonen:

\`\`\`python
ay = g - luftmotstand / masse # Viktig å huske at luftmotstand er en kraft, og må derfor deles på massen for å få akselerasjon
\`\`\`

Selve luftmotstanden kan beskrives på flere måter, men vanligvis kan man bruke denne tilnærmingen:

\`\`\`python
luftmotstand = k*vy*vy # Her er k en konstant mellom 0 og 1 som beskriver hvor mye luftmotstand
\`\`\``,
  },
  {
    text: 'Kontaktfriksjon',
    icon: 'keyboard_backspace',
    insert: `Kontaktfriksjon er en kraft som alltid går i mot akselerasjonen:

\`\`\`python
ay = g - friksjonskraft / masse # Viktig å huske at friksjonskraften er en kraft, og må derfor deles på massen for å få akselerasjon
\`\`\`

Selve friksjonskraften kan beskrives på flere måter, men vanligvis kan man bruke denne tilnærmingen:

\`\`\`python
friksjonskraft = k*vy*vy # Her er k en konstant mellom 0 og 1 som beskriver hvor mye friksjonskraft
\`\`\``,
  },
]

export const TextEditor = forwardRef(
  (
    {
      onChange = () => {},
      style = {},
      showInitialHelpText = false,
      placeholder = '',
      defaultValue = '',
      ...props
    },
    ref
  ) => {
    const [descriptionRendered, setDescriptionRendered] = useState('')
    const savedPlaceholderValue = useRef(
      showInitialHelpText && !placeholder ? initialHelpText : placeholder
    )
    const renderedHTMLElement = useRef(null)

    function onChangeHandler(e) {
      onValueChange(e.target.value)
    }

    function onValueChange(value) {
      onChange(value)
      if (value) {
        setDescriptionRendered(md.render(value))
      } else {
        setDescriptionRendered(md.render(savedPlaceholderValue.current))
      }
    }

    useEffect(() => {
      setDescriptionRendered(md.render(savedPlaceholderValue.current))
    }, [savedPlaceholderValue])

    return (
      <>
        <StyledTextEditor style={style}>
          <TextArea
            size="1em"
            minHeight="100%"
            onChange={onChangeHandler}
            defaultValue={defaultValue}
            placeholder={savedPlaceholderValue.current}
            ref={ref}
            {...props}
          ></TextArea>
          <div style={{ display: 'flex', flexFlow: 'row wrap' }}>
            <RenderedMarkdown
              style={{
                paddingLeft: '1.5em',
                width: '100%',
              }}
              ref={renderedHTMLElement}
              dangerouslySetInnerHTML={{ __html: descriptionRendered }}
            />
            <h2
              style={{ width: '100%', margin: '0 1em', fontWeight: 'normal' }}
            >
              Legg til elementer:
            </h2>
            {addToDescriptionButtons.map(({ text, icon, insert }) => (
              <button
                onClick={() => {
                  const oldValue = ref.current.value
                  ref.current.value =
                    (oldValue ? oldValue.trim() + '\n\n' : '') + insert + '\n'
                  onValueChange(ref.current.value)
                }}
                key={text}
              >
                {text}
                {icon ? (
                  <> {typeof icon === 'string' ? <Icon name={icon} /> : icon}</>
                ) : null}
              </button>
            ))}
            {addTemplateToDescriptionButtons.length ? (
              <h2
                style={{ width: '100%', margin: '0 1em', fontWeight: 'normal' }}
              >
                Legg til forklaringsmaler:
              </h2>
            ) : null}
            {addTemplateToDescriptionButtons.map(({ text, icon, insert }) => (
              <button
                onClick={() => {
                  const oldValue = ref.current.value
                  ref.current.value =
                    (oldValue ? oldValue.trim() + '\n\n' : '') + insert + '\n'
                  onValueChange(ref.current.value)
                }}
                key={text}
              >
                {text}
                {icon ? (
                  <> {typeof icon === 'string' ? <Icon name={icon} /> : icon}</>
                ) : null}
              </button>
            ))}
          </div>
        </StyledTextEditor>
      </>
    )
  }
)

const StyledExtendedMarkdownEditor = styled.div`
  display: flex;
  flex-direction: row wrap;
  width: 100%;
  align-items: flex-start;

  > div {
    flex: 1 1 200px;
    display: inline-block;
  }
`

const ExtendedMarkdownRenderer = styled.div`
  text-align: left;

  h1 {
    text-align: center;

    & + p {
      text-align: center;
    }
  }

  .light & {
    ${lightCodeTheme}
  }
`

const RenderBlock = styled.div``

const CodeEditorWrapper = styled.div``

function addTaskNumbersMarkdown(markdown, sectionNo = 1, subgoalNo = 1) {
  let newSectionNo = sectionNo
  let newSubgoalNo = subgoalNo
  const getAlpha = (n) => String.fromCharCode(97 + ((n - 1) % 26))
  const output = markdown
    .split('\n## ')
    .map((section, i) => {
      if (i !== 0) {
        newSectionNo++
        newSubgoalNo = 0
      }
      return (
        (i !== 0 ? newSectionNo + '. ' : '') +
        section
          .split('\n### ')
          .map((subgoal, j) => {
            if (j === 0) return subgoal
            newSubgoalNo++
            return getAlpha(newSubgoalNo) + ') ' + subgoal
          })
          .join('\n### ')
      )
    })
    .join('\n## ')
  return { newSectionNo, newSubgoalNo, output }
}

function renderMarkdownOnly(markdown) {
  const render = []
  let acc = ''
  let sectionNo = 0
  let subgoalNo = 0
  let level = 0
  let typeNo = { skjult: 0, startkode: 0, løsning: 0, test: 0 }
  const prepareRenderBlock = () => {
    const taskedMarkdown = addTaskNumbersMarkdown(acc, sectionNo, subgoalNo)
    acc = taskedMarkdown.output
    sectionNo = taskedMarkdown.newSectionNo
    subgoalNo = taskedMarkdown.newSubgoalNo
    if (sectionNo > 0) {
      level = 1
    }
    if (subgoalNo > 0) {
      level = 2
    }
  }
  const renderBlock = (i) => {
    render.push(
      <RenderBlock
        key={i}
        dangerouslySetInnerHTML={{ __html: md.render(acc) }}
      />
    )
  }
  ;[...markdown.split('\n```'), false].forEach((block, i) => {
    if (i % 2 === 0) {
      if (block === false) {
        prepareRenderBlock()
        renderBlock(i)
      } else {
        acc += block
      }
    } else {
      const lines = block === false ? [''] : block.split('\n')
      const type = lines.shift().trim().split(' ').slice(-1)[0]
      switch (type) {
        case 'skjult':
        case 'startkode':
        case 'løsning':
        case 'test':
          prepareRenderBlock()
          if (type === 'skjult') {
            typeNo.skjult++
            acc += '\n#### Skjult kode'
            if (level === 0) {
              acc += ' for hele oppgaven'
            } else if (level === 1) {
              acc += ' for hele seksjonen'
            } else if (level === 2) {
              acc += ' for bare deloppgaven'
            }
          } else if (type === 'startkode') {
            typeNo.startkode++
            acc += '\n#### Kode til eleven'
          } else if (type === 'løsning') {
            typeNo.løsning++
            acc += '\n#### Løsning'
          } else if (type === 'test') {
            typeNo.test++
            acc += '\n#### Test'
          }
          renderBlock(i - 1)
          acc = ''
          if (type === 'startkode') {
            render.push(
              <RadioGroup
                key={'radio-' + i}
                labels={[
                  sectionNo === 1 && subgoalNo === 1
                    ? 'Start med ingen kode'
                    : 'Gjenbruk koden fra forrige deloppgave',
                  'Legg til skjult kode',
                ]}
                disabled={true}
                checked={1}
                style={{ marginBottom: '1em' }}
              />
            )
          }
          render.push(
            <CodeEditor
              key={
                sectionNo + '-' + subgoalNo + '-' + typeNo[type] + '-' + type
              }
              width={'100%'}
              height={Math.max(3, lines.length + 1) * 19 + 'px'}
              readOnly={true}
              language="python"
              value={lines.join('\n')}
              options={{
                scrollBeyondLastLine: false,
                wordWrap: true,
              }}
            />
          )
          break
        default:
          if (block === false) {
            prepareRenderBlock()
            renderBlock(i)
          } else {
            acc += '\n```' + block + '\n```'
          }
          break
      }
    }
  })
  return render
}

export function parseMarkdownOnly(markdown) {
  const lines = markdown.split('\n')
  const lastIndex = lines.length - 1
  return lines.reduce(
    (acc, line, index) => {
      if (acc.mode && acc.mode !== 'description') {
        if (line === '```') {
          acc.mode = ''
        } else {
          const needNewline = acc.firstCodeLine ? '' : '\n'
          if (acc.mode === 'hidden') {
            if (acc.level === 0) acc.json.hiddenCode += needNewline + line
            else if (acc.level === 1)
              acc.json.sections[acc.sectionNo].hiddenCode += needNewline + line
            else if (acc.level === 2)
              acc.json.sections[acc.sectionNo].subgoals[
                acc.subgoalNo
              ].hiddenCode += needNewline + line
          } else if (acc.mode === 'predefined') {
            acc.json.sections[acc.sectionNo].subgoals[
              acc.subgoalNo
            ].predefinedCode += needNewline + line
          } else if (acc.mode === 'solution') {
            acc.json.sections[acc.sectionNo].subgoals[
              acc.subgoalNo
            ].solutionCode += needNewline + line
          } else if (acc.mode === 'test') {
            acc.json.sections[acc.sectionNo].subgoals[acc.subgoalNo].testCode +=
              needNewline + line
          }
        }
        acc.firstCodeLine = false
      } else {
        if (line.slice(0, 2) === '# ' && acc.level === 0) {
          acc.json.title = line.slice(2)
        } else if (line.slice(0, 3) === '## ') {
          acc.sectionNo++
          acc.subgoalNo = -1
          acc.level = 1
          acc.json.sections.push({
            title: line.slice(3),
            description: '',
            hiddenCode: '',
            subgoals: [],
          })
        } else if (line.slice(0, 4) === '### ') {
          acc.subgoalNo++
          acc.level = 2
          acc.json.sections[acc.sectionNo].subgoals.push({
            title: line.slice(4),
            description: '',
            hiddenCode: '',
            predefinedCode: '',
            solutionCode: '',
            testCode: '',
          })
        } else {
          if (line.startsWith('```python')) {
            const type = line.slice(3).trim().split(' ').slice(-1)[0]
            if (type === 'skjult') {
              acc.mode = 'hidden'
              acc.firstCodeLine = true
            } else if (acc.level === 2) {
              if (type === 'startkode') {
                acc.mode = 'predefined'
                acc.firstCodeLine = true
              } else if (type === 'løsning') {
                acc.mode = 'solution'
                acc.firstCodeLine = true
              } else if (type === 'test') {
                acc.mode = 'test'
                acc.firstCodeLine = true
              } else {
                acc.mode = 'description'
              }
            } else {
              acc.mode = 'description'
            }
          }
          if (!acc.firstCodeLine) {
            if (acc.level === 0) acc.json.description += '\n' + line
            else if (acc.level === 1)
              acc.json.sections[acc.sectionNo].description += '\n' + line
            else if (acc.level === 2)
              acc.json.sections[acc.sectionNo].subgoals[
                acc.subgoalNo
              ].description += '\n' + line
          }
        }
      }
      if (index === lastIndex) {
        acc.json.description = acc.json.description.trim()
        acc.json.sections.forEach((_, i) => {
          if (acc.json.sections[i].description) {
            acc.json.sections[i].description = acc.json.sections[
              i
            ].description.trim()
          }
          acc.json.sections[i].subgoals.forEach((_, j) => {
            if (acc.json.sections[i].subgoals[j].description) {
              acc.json.sections[i].subgoals[j].description = acc.json.sections[
                i
              ].subgoals[j].description.trim()
            }
          })
        })
        return acc.json
      }
      return acc
    },
    {
      json: { title: '', description: '', hiddenCode: '', sections: [] },
      mode: '',
      firstCodeLine: false,
      sectionNo: -1,
      subgoalNo: -1,
      level: 0,
    }
  )
}

function getMarkdownSectionLevel(markdown, lineNumber) {
  return markdown
    .split('\n')
    .slice(0, lineNumber)
    .reduce(
      (acc, line) => {
        const add = { ...acc }
        if (line.slice(0, 2) === '# ' && acc.level === -1) {
          add.level = 0
        } else if (line.slice(0, 3) === '## ') {
          add.sectionNo++
          add.subgoalNo = 0
          add.level = 1
        } else if (line.slice(0, 4) === '### ') {
          add.subgoalNo++
          add.level = 2
        }
        return add
      },
      { sectionNo: 0, subgoalNo: 0, level: -1 }
    )
}

export function ExtendedMarkdownEditor({
  style = {},
  onChange = () => {},
  defaultValue = '',
  value = '',
  ...props
}) {
  const { theme } = useSelector((state) => state.user)
  const [renderedMarkdownOnly, setRenderedMarkdownOnly] = useState([])
  const savedDefaultValue = useRef(defaultValue)
  const renderedHTMLElement = useRef(null)
  const editor = useRef(null)
  const [sectionLevel, setSectionLevel] = useState(0)
  const [minHeight, setMinHeight] = useState(200)

  function handleEditorDidMount(_, _editor) {
    editor.current = _editor
    _editor.onDidChangeCursorPosition((e) => {
      const { level } = getMarkdownSectionLevel(
        editor.current.getValue(),
        e.position.lineNumber
      )
      setSectionLevel(level)
    })
    // Maybe add ViewZones later, if feedback tells so
    //_editor.changeViewZones(function (changeAccessor) {
    //  var domNode = document.createElement('div')
    //    changeAccessor.addZone({
    //      afterLineNumber: 3,
    //      heightInPx: 100,
    //      domNode: domNode,
    //    })
    //})
  }

  function onChangeHandler(_, value) {
    onChange(value)
    setRenderedMarkdownOnly(renderMarkdownOnly(value, theme))
  }

  function insertIntoEditor(text, moveCursorUp = 0, moveCursorRight = 0) {
    editor.current.trigger('keyboard', 'type', {
      text,
    })
    editor.current.focus()
    const { lineNumber } = editor.current.getPosition()
    editor.current.setPosition({
      lineNumber: lineNumber - moveCursorUp,
      column: moveCursorRight,
    })
  }

  useEffect(() => {
    setRenderedMarkdownOnly(renderMarkdownOnly(savedDefaultValue.current))
  }, [savedDefaultValue])

  useEffect(() => {
    if (renderedMarkdownOnly.current !== null) {
      setMinHeight(renderedHTMLElement.current.clientHeight)
    }
  }, [renderedMarkdownOnly])

  useEffect(() => {
    if (editor.current !== null) {
      setRenderedMarkdownOnly(
        renderMarkdownOnly(editor.current.getValue(), theme)
      )
    }
  }, [theme])

  return (
    <StyledExtendedMarkdownEditor style={style} {...props}>
      <CodeEditorWrapper>
        <CodeEditor
          width={'550px'}
          height={Math.max(200, minHeight) + 'px'}
          language="markdown"
          defaultValue={savedDefaultValue.current}
          value={value}
          onChange={onChangeHandler}
          editorDidMount={handleEditorDidMount}
        />
      </CodeEditorWrapper>
      <ExtendedMarkdownRenderer ref={renderedHTMLElement}>
        {renderedMarkdownOnly}

        {sectionLevel === -1 ? (
          <button
            onClick={() => {
              insertIntoEditor(
                '# ' + prompt('Velg hva oppgaven skal hete:') + '\n\n'
              )
            }}
          >
            Legg til tittel
          </button>
        ) : null}
        {sectionLevel === 0 ? (
          <>
            <button
              onClick={() => {
                insertIntoEditor(
                  prompt('Legg til en beskrivelse av oppgaven:') + '\n\n'
                )
              }}
            >
              Legg til beskrivelse
            </button>
            <button
              onClick={() => {
                insertIntoEditor('```python skjult\n\n```\n', 2)
              }}
            >
              Legg til skjult kode
            </button>
            <button
              onClick={() => {
                insertIntoEditor(
                  '## ' + prompt('Velg hva seksjonen skal hete:') + '\n\n'
                )
              }}
            >
              Legg til seksjon
            </button>
          </>
        ) : null}
        {sectionLevel === 1 ? (
          <>
            <button
              onClick={() => {
                insertIntoEditor(
                  prompt('Legg til en beskrivelse av seksjonen:') + '\n\n'
                )
              }}
            >
              Legg til beskrivelse
            </button>
            <button
              onClick={() => {
                insertIntoEditor('```python skjult\n\n```\n', 2)
              }}
            >
              Legg til skjult kode
            </button>
            <button
              onClick={() => {
                insertIntoEditor(
                  '### ' + prompt('Velg hva delproblemet skal være:') + '\n\n'
                )
              }}
            >
              Legg til delproblem
            </button>
          </>
        ) : null}
        {sectionLevel === 2 ? (
          <>
            <button
              onClick={() => {
                insertIntoEditor(
                  prompt('Legg til en beskrivelse av deloppgaven:') + '\n\n'
                )
              }}
            >
              Legg til beskrivelse
            </button>
            <button
              onClick={() => {
                insertIntoEditor('```python startkode\n\n```\n', 2)
              }}
            >
              Legg til startkode
            </button>
            <button
              onClick={() => {
                insertIntoEditor('```python skjult\n\n```\n', 2)
              }}
            >
              Legg til skjult kode
            </button>
            <button
              onClick={() => {
                insertIntoEditor('```python løsning\n\n```\n', 2)
              }}
            >
              Legg til løsningskode
            </button>
            <button
              onClick={() => {
                insertIntoEditor(
                  '```python test\nif g != 9.81:\n    return False\r\n```\n',
                  2,
                  17
                )
              }}
            >
              Legg til testkode
            </button>
            <button
              onClick={() => {
                insertIntoEditor(
                  '### ' + prompt('Velg hva delproblemet skal være:') + '\n\n'
                )
              }}
            >
              Legg til nytt delproblem
            </button>
            <button
              onClick={() => {
                insertIntoEditor(
                  '## ' + prompt('Velg hva seksjonen skal hete:') + '\n\n'
                )
              }}
            >
              Legg til ny seksjon
            </button>
          </>
        ) : null}
      </ExtendedMarkdownRenderer>
    </StyledExtendedMarkdownEditor>
  )
}

const StyledSingleEditorTaskCreator = styled(StyledExtendedMarkdownEditor)`
  & .contentWidgets {
    .node {
      width: 482px;
      padding-top: 6px;
    }
    .description {
      font-style: italic;
      margin: 6px 0 4px;
    }
    button {
      background: #333;
      margin: 2px 4px;
    }
  }

  & .loop-content {
    background: #0882;
  }

  & .input {
    background: #0f02;
    border: 1px solid #0f0a;
    border-radius: 2px;
  }

  & .hidden-code {
    background: #f802;
  }

  & .hidden-code-start,
  & .hidden-code-end {
    color: #fff4 !important;
  }

  & .loop-code {
    background: #0882;
  }

  & .loop-code-start,
  & .loop-code-end {
    color: #fff4 !important;
  }

  & .selected-area {
    margin-left: 1em;
    margin-top: -2px;

    button {
      background: #333;
      margin: 0 4px;
      white-space: nowrap;
      font-size: 0.6em;
    }
  }
`
const SingleEditorTaskCreatorController = styled(ExtendedMarkdownRenderer)`
  padding-left: 2em;

  button {
    font-size: 1em;

    &:disabled {
      opacity: 0.5;
    }
  }
`

export function SingleEditorTaskCreator(props) {
  const editor = useRef(null)
  const [viewZones, setViewZones] = useState([])
  const [hasRange, setHasRange] = useState(false)
  const viewZonesIDs = useRef([])
  const widgetIDs = useRef([])
  const decorationIDs = useRef([])
  const selectWidget = useRef(null)
  const inputWidgets = useRef([])
  //const [value, setValue] = useState('# Skriv inn din Python 3 kode her ...\n')
  const [value, setValue] = useState(`#### SKJULT KODE START ####
# Kode som skal skjules
#### SKJULT KODE SLUTT ####

# Kode til eleven går her
g = ... # Sted eleven skal fylle inn kode

#### LØKKE START #### def loop(t):
#### SKJULT KODE START ####
# Kode som skal skjules i løkke
#### SKJULT KODE SLUTT ####

# Bruk variabel \`t\` for tid, og \`dt\` for tidssteg
#### LØKKE SLUTT ####
`)

  function handleEditorDidMount(_, _editor) {
    editor.current = _editor
    const domNode = document.createElement('div')
    domNode.classList.add('selected-area')
    const domHideButton = document.createElement('button')
    domHideButton.innerHTML = 'Skjul kode'
    //domNode.appendChild(domHideButton)
    const widget = {
      domNode,
      getPosition: () => ({
        position: { lineNumber: 1, column: 1 },
        preference: [
          window.monaco.editor.ContentWidgetPositionPreference.BELOW,
        ],
      }),
      getId: () => 'select.widget',
      getDomNode: () => domNode,
    }
    selectWidget.current = widget
    editor.current.addContentWidget(widget)
    editor.current.onDidChangeCursorSelection(({ selection }) => {
      setHasRange(
        selection.startLineNumber !== selection.endLineNumber ||
          selection.startColumn !== selection.endColumn
      )
      selectWidget.current.getPosition = () => ({
        position: {
          lineNumber: selection.endLineNumber,
          column: editor.current
            .getModel()
            .getLineLength(selection.endLineNumber),
        },
        preference: [
          window.monaco.editor.ContentWidgetPositionPreference.EXACT,
        ],
      })
      editor.current.layoutContentWidget(selectWidget.current)
    })
    onChangeHandler(null, editor.current.getValue())
  }

  function onChangeHandler(_, value) {
    setValue(value)
    const zones = []
    if (value) {
      let isLoopCode = false
      let isForloop = false
      let isHiddenCode = false
      let prevLine = ''
      let emptyLineCount = 0
      value.split('\n').forEach((line, i) => {
        if (/^for /.test(line)) {
          isForloop = true
          zones.push({
            type: 'for-loop',
            lineNumber: i + 1,
            style: 'color: red',
            description: 'Skal løkken under simulere tidssteg?',
            inputs: [
              {
                label: 'Ja',
                onClick: () => console.log('jaaaa'),
              },
              {
                label: 'Nei',
                onClick: () => console.log('neii :('),
              },
            ],
          })
          zones.push({
            type: 'for-loop-content',
            lineNumber: i + 1,
          })
        }
        if (/\.\.\./.test(line)) {
          line
            .split('...')
            .slice(0, -1)
            .reduce((col, n) => {
              const newCol = col + n.length
              zones.push({
                type: 'input',
                lineNumber: i + 1,
                column: newCol,
              })
              return newCol
            }, 1)
        }
        if (/\?\?\?/.test(line)) {
          line
            .split('???')
            .slice(0, -1)
            .reduce((col, n) => {
              const newCol = col + n.length
              zones.push({
                type: 'input',
                lineNumber: i + 1,
                column: newCol,
              })
              return newCol
            }, 1)
        }
        if (isHiddenCode) {
          if (/^#### SKJULT KODE SLUTT/.test(line)) {
            isHiddenCode = false
            zones.push({
              type: 'hidden-code-end',
              lineNumber: i + 1,
            })
          } else {
            zones.push({
              type: 'hidden-code',
              lineNumber: i + 1,
            })
          }
        }
        if (!isHiddenCode && /^#### SKJULT KODE START/.test(line)) {
          isHiddenCode = true
          zones.push({
            type: 'hidden-code-start',
            lineNumber: i + 1,
          })
        }
        if (isLoopCode) {
          if (/^#### LØKKE SLUTT/.test(line)) {
            isLoopCode = false
            zones.push({
              type: 'loop-code-end',
              lineNumber: i + 1,
            })
          } else {
            zones.push({
              type: 'loop-code',
              lineNumber: i + 1,
            })
          }
        }
        if (!isLoopCode && /^#### LØKKE START/.test(line)) {
          isLoopCode = true
          zones.push({
            type: 'loop-code-start',
            lineNumber: i + 1,
          })
        }
        if (isForloop) {
          if (/\s+/.test(line)) {
            for (let j = 1 - emptyLineCount; j <= 1; j++) {
              zones.push({
                type: 'for-loop-content',
                lineNumber: j + i + 1,
              })
            }
            emptyLineCount = 0
          } else if (!line.trim()) {
            emptyLineCount++
          } else {
            if (!prevLine.trim()) zones.pop()
            isForloop = false
            emptyLineCount = 0
          }
        }
        prevLine = line
      })
    }
    setViewZones(zones)
  }

  useEffect(() => {
    if (editor.current) {
      editor.current.changeViewZones((changeAccessor) => {
        viewZonesIDs.current.forEach((id) => {
          changeAccessor.removeZone(id)
        })
        widgetIDs.current.forEach((id) => {
          editor.current.removeContentWidget(id)
        })
        const newDecorations = []
        viewZones.forEach(
          ({
            type,
            description,
            inputs = [],
            style = '',
            lineNumber,
            column = 1,
          }) => {
            const domNode = document.createElement('div')
            domNode.style = style
            domNode.classList.add('node')
            if (type === 'for-loop') {
              const domDescription = document.createElement('span')
              domDescription.classList.add('description')
              domDescription.innerHTML = description
              domNode.appendChild(domDescription)
              const domBreak = document.createElement('br')
              domNode.appendChild(domBreak)
              inputs.forEach(({ label, type = 'button', onClick }) => {
                const domInput = document.createElement('button')
                domInput.innerHTML = label
                domInput.onclick = onClick
                domNode.appendChild(domInput)
              })
              viewZonesIDs.current.push(
                changeAccessor.addZone({
                  afterLineNumber: lineNumber - 1,
                  heightInLines: 3,
                  domNode: document.createElement('div'),
                })
              )
              const widget = {
                domNode,
                getPosition: () => ({
                  position: { lineNumber: lineNumber - 1, column: 0 },
                  preference: [
                    window.monaco.editor.ContentWidgetPositionPreference.BELOW,
                  ],
                }),
                getId: () => lineNumber,
                getDomNode: () => domNode,
              }
              editor.current.addContentWidget(widget)
              widgetIDs.current.push(widget)
            }
            if (type === 'input') {
              newDecorations.push({
                range: new window.monaco.Range(
                  lineNumber,
                  column,
                  lineNumber,
                  column + 3
                ),
                options: {
                  inlineClassName: 'input',
                },
              })
            }
            if (type === 'for-loop-content') {
              newDecorations.push({
                range: new window.monaco.Range(lineNumber, 1, lineNumber, 1),
                options: {
                  isWholeLine: true,
                  className: 'loop-content',
                },
              })
            }
            if (type === 'hidden-code') {
              newDecorations.push({
                range: new window.monaco.Range(lineNumber, 1, lineNumber, 1),
                options: {
                  isWholeLine: true,
                  className: 'hidden-code',
                },
              })
            }
            if (type === 'hidden-code-start' || type === 'hidden-code-end') {
              newDecorations.push({
                range: new window.monaco.Range(lineNumber, 1, lineNumber, 1),
                options: {
                  isWholeLine: true,
                  inlineClassName: type,
                },
              })
            }
            if (type === 'loop-code') {
              newDecorations.push({
                range: new window.monaco.Range(lineNumber, 1, lineNumber, 1),
                options: {
                  isWholeLine: true,
                  className: 'loop-code',
                },
              })
            }
            if (type === 'loop-code-start' || type === 'loop-code-end') {
              newDecorations.push({
                range: new window.monaco.Range(lineNumber, 1, lineNumber, 1),
                options: {
                  isWholeLine: true,
                  inlineClassName: type,
                },
              })
            }
          }
        )
        decorationIDs.current = editor.current.deltaDecorations(
          decorationIDs.current,
          newDecorations
        )
      })
    }
  }, [viewZones])

  return (
    <StyledSingleEditorTaskCreator {...props}>
      <CodeEditorWrapper>
        <h2>Legg inn koden til eleven her</h2>
        <CodeEditor
          width={'550px'}
          height={'640px'}
          language="python"
          value={value}
          onChange={onChangeHandler}
          editorDidMount={handleEditorDidMount}
        />
      </CodeEditorWrapper>
      <SingleEditorTaskCreatorController>
        <h2>Detaljer om seksjonen</h2>
        <Input size="2em" placeholder="Tittel på seksjon" />
        <br />
        <button
          disabled={!hasRange}
          onClick={() => {
            const {
              startLineNumber,
              endLineNumber,
              startColumn,
              endColumn,
            } = editor.current.getSelection()
            const lines = editor.current.getValue().split('\n')
            const startLine =
              startLineNumber +
              (lines[Math.max(0, startLineNumber - 1)].trim() === '' ? 1 : 0)
            const beforeContent = lines.slice(0, startLine - 1)
            const endLine = endLineNumber - (endColumn === 1 ? 1 : 0)
            const content = lines.slice(startLine - 1, endLine)
            const afterContent = lines.slice(endLine)
            editor.current.setValue(
              [
                beforeContent.join('\n'),
                '#### SKJULT KODE START ####',
                content.join('\n'),
                '#### SKJULT KODE SLUTT ####',
                afterContent.join('\n'),
              ].join('\n')
            )
          }}
        >
          Marker kode som skal være skjult fra eleven
        </button>
        <button
          onClick={() => {
            editor.current.trigger('keyboard', 'type', {
              text: '...',
            })
          }}
        >
          Marker del av koden hvor eleven skal fylle inn{' '}
          <span
            style={{
              fontFamily: 'monospace',
              background: '#0f02',
              border: '1px solid #0f0a',
              borderRadius: '2px',
            }}
          >
            ...
          </span>
        </button>
        <h3>Deloppgaver til seksjonen</h3>
        <Input size="1.5em" placeholder="Tittel på deloppgave" />
      </SingleEditorTaskCreatorController>
    </StyledSingleEditorTaskCreator>
  )
}
