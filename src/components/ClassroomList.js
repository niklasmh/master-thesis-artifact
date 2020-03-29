import React from 'react'
import { Link } from 'react-router-dom'
import * as firebase from 'firebase/app'
import { useCollectionData } from 'react-firebase-hooks/firestore'
import styled from 'styled-components'

import Card from './Card'
import { Paragraph, SubTitle } from './Typography'

export default function ClassroomList({ classroomIDs = [] }) {
  const [classrooms, loadingClassrooms, error] = useCollectionData(
    firebase
      .firestore()
      .collection('classrooms')
      .where(firebase.firestore.FieldPath.documentId(), 'in', classroomIDs),
    {
      idField: 'pin',
    }
  )

  return (
    <StyledClassroomList>
      {loadingClassrooms ? (
        <span>Laster inn klasser ...</span>
      ) : error ? null : (
        classrooms.map(c => (
          <Classroom key={c.name} name={c.name} pin={c.pin} />
        ))
      )}
    </StyledClassroomList>
  )
}

const StyledClassroomList = styled.div`
  display: flex;
  width: 100%;
  justify-content: flex-start;
  flex-flow: row wrap;
  align-items: flex-start;
`

const ClassroomName = styled(Paragraph)`
  margin: 0;
  text-transform: uppercase;
  align-self: flex-start;
`

const ClassroomPIN = styled(SubTitle)`
  margin: 0;
`

const ClassroomStudents = styled.p`
  margin: 0.25em 0;
  align-self: flex-end;
  color: #fff8;
`

const ClassroomTasks = styled.p`
  margin: 0.25em 0;
  align-self: flex-end;
  color: #fff8;
`

const ClassroomOpen = styled(Link)`
  margin: 0.25em 0;
  align-self: flex-end;
  color: #fff;
  text-decoration: none;
`

const StyledClassroom = styled(Card)`
  margin: 3em 1em;
`

function Classroom({ name, pin, studentCount = 0, taskCount = 0 }) {
  return (
    <StyledClassroom>
      <ClassroomName>{name}</ClassroomName>
      <ClassroomPIN>
        PIN: <span style={{ color: '#0ff' }}>{pin}</span>
      </ClassroomPIN>
      <ClassroomStudents>{studentCount} elever</ClassroomStudents>
      <ClassroomTasks>{taskCount} opplegg</ClassroomTasks>
      <ClassroomOpen to={`/klasse/${pin}`}>Åpne klasse</ClassroomOpen>
    </StyledClassroom>
  )
}
