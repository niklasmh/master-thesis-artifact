import React from 'react'
import { Link } from 'react-router-dom'
import * as firebase from 'firebase/app'
import { useCollectionData } from 'react-firebase-hooks/firestore'
import styled from 'styled-components'

import Card from './Card'
import { Paragraph } from './Typography'

export default function TaskList({ pin, taskIDs }) {
  const [tasks, loadingTasks, error] = useCollectionData(
    firebase
      .firestore()
      .collection('tasks')
      .where(firebase.firestore.FieldPath.documentId(), 'in', taskIDs),
    {
      idField: 'id',
    }
  )

  return (
    <StyledTaskList>
      {loadingTasks ? (
        <span>Laster inn opplegg ...</span>
      ) : error ? null : (
        tasks.map(c => (
          <Task key={c.title} pin={pin} id={c.id} name={c.title} />
        ))
      )}
    </StyledTaskList>
  )
}

const StyledTaskList = styled.div`
  width: 100%;
  display: flex;
  flex-flow: row wrap;
  align-items: flex-start;
  justify-content: flex-start;
`

const TaskName = styled(Paragraph)`
  margin: 0;
  text-align: left;
  word-break: break-all;
  hyphens: manual;
  align-self: flex-start;
  font-size: 1.5em;
`

const TaskProgress = styled.p`
  margin: 0.25em 0;
  align-self: flex-end;
  color: #fff8;
  font-size: 0.85em;
`

const TaskOpen = styled(Link)`
  margin: 0.25em 0;
  align-self: flex-end;
  color: #fff;
  text-decoration: none;
`

const Space = styled.div`
  flex: 1 0 auto;
`

const StyledTask = styled(Card)`
  margin: 3em 2em;
  min-height: 220px;
  width: 320px;
`

function Task({ name, id, pin, studentCount = 0, taskCount = 0 }) {
  return (
    <StyledTask>
      <TaskName>{name}</TaskName>
      <Space />
      <TaskProgress>55% har fullført</TaskProgress>
      <TaskOpen to={`/klasse/${pin}/oppgave/${id}`}>Åpne opplegg</TaskOpen>
    </StyledTask>
  )
}
