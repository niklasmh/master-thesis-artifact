import React from 'react'
import { Link } from 'react-router-dom'
import * as firebase from 'firebase/app'
import { useCollectionData } from 'react-firebase-hooks/firestore'
import styled from 'styled-components'

import Card from './Card'
import { Paragraph } from './Typography'

export default function TaskList({ taskIDs }) {
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
        tasks.map((c) => (
          <Task key={c.title} image={c.image || ''} id={c.id} name={c.title} />
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

// eslint-disable-next-line
const TaskOpen = styled(Link)`
  margin: 0.25em 0;
  align-self: flex-end;
  color: #fff;
  text-decoration: none;
  text-align: right;
`

const Space = styled.div`
  flex: 1 0 auto;
  width: 100%;
`

const DarkArea = styled.div`
  background-color: #0005;
  padding: 1em;
  width: 100%;
`

const StyledTask = styled(Card)`
  margin: 3em 2em;
  min-height: 220px;
  width: 320px;
  padding: 0;
  overflow: hidden;
  background-image: ${(props) => `url(${props.image})`};
  background-size: cover;
  background-position: center center;
`

const LinkContainer = styled(Link)`
  display: flex;
  flex-direction: column;
  flex: 1 0 auto;
  width: 100%;
  text-decoration: none;

  :hover {
    text-decoration: underline;
    color: inherit;
  }
`

function Task({ name, id, image, studentCount = 0, taskCount = 0 }) {
  return (
    <StyledTask image={image}>
      <LinkContainer to={`/oppgave/${id}`}>
        <Space />
        <DarkArea>
          <TaskName>{name}</TaskName>
          {false ? <TaskProgress>55% har fullført</TaskProgress> : null}
        </DarkArea>
      </LinkContainer>
    </StyledTask>
  )
}
