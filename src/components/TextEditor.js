import React, { forwardRef, useState, useRef, useEffect } from 'react'
import styled from 'styled-components'
import { useSelector } from 'react-redux'
import mdIt from 'markdown-it'
import mk from 'markdown-it-katex'
import hljs from 'highlight.js'
import 'highlight.js/styles/vs2015.css'
import { lightCodeTheme } from '../utils/light-code-theme'

import { TextArea, RadioGroup, CodeEditor } from './Form'

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
      onChange(e.target.value)
      if (e.target.value) {
        setDescriptionRendered(md.render(e.target.value))
      } else {
        setDescriptionRendered(md.render(savedPlaceholderValue.current))
      }
    }

    useEffect(() => {
      setDescriptionRendered(md.render(savedPlaceholderValue.current))
    }, [savedPlaceholderValue])

    return (
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
        <RenderedMarkdown
          style={{
            paddingLeft: '1.5em',
          }}
          ref={renderedHTMLElement}
          dangerouslySetInnerHTML={{ __html: descriptionRendered }}
        />
      </StyledTextEditor>
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
            if (acc.level === 0) {
              acc += ' for hele oppgaven'
            } else if (acc.level === 1) {
              acc += ' for hele seksjonen'
            } else if (acc.level === 2) {
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
