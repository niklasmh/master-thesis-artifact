import React, { useEffect, useRef } from 'react'
import { default as SingleLineMarkdown } from 'markdown-to-jsx'
import styled from 'styled-components'

export default function Outline({
  task,
  sectionNo = 0,
  subgoalNo = 0,
  testsPassed = {},
  onSectionSelect = () => {},
  onSubgoalSelect = () => {},
  ...props
}) {
  const anchor = useRef(null)
  const list = useRef(null)

  useEffect(() => {
    if (list.current && anchor.current) {
      const { top: listTop, height } = list.current.getBoundingClientRect()
      const { top } = anchor.current.getBoundingClientRect()
      list.current.scrollTop = top - listTop - height / 2
    }
  }, [subgoalNo])

  return (
    <SectionList ref={list} {...props}>
      {task &&
        task.sections &&
        task.sections.map((section, i) => (
          <li key={i} className={sectionNo === i ? 'current' : ''}>
            <span onClick={() => onSectionSelect(i)}>
              <span>{section.title}</span>
            </span>
            {sectionNo === i ? (
              <SubgoalList>
                {section &&
                  section.subgoals &&
                  section.subgoals.map((subgoal, j) => (
                    <li
                      key={j}
                      className={
                        (sectionNo === i && subgoalNo === j ? 'current' : '') +
                        (i + '-' + j in testsPassed
                          ? testsPassed[i + '-' + j]
                            ? ' passed'
                            : testsPassed[i + '-' + j] === false
                            ? ' failed'
                            : ''
                          : '')
                      }
                    >
                      <span onClick={() => onSubgoalSelect(i, j)}>
                        {i + '-' + j in testsPassed ? (
                          testsPassed[i + '-' + j] ? (
                            <Checked>✓ </Checked>
                          ) : testsPassed[i + '-' + j] === false ? (
                            <Failed>✕ </Failed>
                          ) : null
                        ) : null}
                        <SingleLineMarkdown>{subgoal.title}</SingleLineMarkdown>
                        {sectionNo === i && subgoalNo === j ? (
                          <span ref={anchor} />
                        ) : null}
                      </span>
                    </li>
                  ))}
              </SubgoalList>
            ) : null}
          </li>
        ))}
    </SectionList>
  )
}

const OrderedList = styled.ol`
  display: flex;
  flex-flow: column nowrap;
  padding: 0.5em;
  width: 320px;
  text-align: left;
  color: #fff4;
  overflow-y: auto;
  margin: 0;

  .light & {
    color: #000d;
  }

  > li {
    display: flex;
    flex-flow: column nowrap;
    font-size: 1em;
    padding: 0 0.5em;
    position: relative;

    > span {
      margin: 0;

      ::before {
        color: #fff4;

        .light & {
          color: #000d;
        }
      }
    }
  }
`

const SectionList = styled(OrderedList)`
  counter-reset: section-counter;
  background: #0002;
  border-radius: 6px;
  margin-top: 1em;

  .light & {
    background: #fff4;
  }

  > li {
    counter-increment: section-counter;

    &.current > span {
      color: #fffa;

      .light & {
        color: #000d;
      }
    }

    > span {
      padding: 0.3em 0 0.3em 0;

      ::before {
        content: counter(section-counter, decimal) '. ';
      }
    }
  }
`

const SubgoalList = styled(OrderedList)`
  counter-reset: subgoal-counter;
  width: 100%;

  > li {
    counter-increment: subgoal-counter;

    &.current > span {
      color: #fffa;

      .light & {
        color: #000d;
      }
    }

    > span {
      padding: 0.3em 0 0.3em 1.5em;

      ::before {
        content: counter(subgoal-counter, lower-alpha) ') ';
      }
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
