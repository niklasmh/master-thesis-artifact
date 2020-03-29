import React from 'react'
import styled from 'styled-components'
import { useParams } from 'react-router-dom'
import * as firebase from 'firebase/app'
import { useDocumentData } from 'react-firebase-hooks/firestore'

import { Title, SubTitle } from '../components/Typography'
import TaskList from '../components/TaskList'
import StudentList from '../components/StudentList'

const Container = styled.div`
  display: flex;
  flex: 1 0 auto;
  width: 100%;
  box-sizing: border-box;
  flex-flow: column nowrap;
  justify-content: flex-start;
  align-items: center;
`

const Pin = styled(SubTitle)`
  color: #0ff;

  &::before {
    content: 'PIN: ';
    color: #fff;
  }
`

export default function ClassroomPage() {
  const { pin } = useParams()
  const [classroom, loadingClassroom] = useDocumentData(
    firebase
      .firestore()
      .collection('classrooms')
      .doc(pin)
  )

  return (
    <Container>
      <Title>{loadingClassroom ? null : classroom.name}</Title>
      <Pin>{pin}</Pin>
      <SubTitle alignSelf="flex-start">Dine opplegg</SubTitle>
      {loadingClassroom ? null : classroom.tasks.length ? (
        <TaskList pin={pin} taskIDs={classroom.tasks.map(task => task.id)} />
      ) : null}
      <SubTitle alignSelf="flex-start">Dine elever</SubTitle>
      {loadingClassroom ? null : classroom.students.length &&
        classroom.tasks.length ? (
        <StudentList
          pin={pin}
          taskIDs={classroom.tasks.map(task => task.id)}
          studentIDs={classroom.students.map(student => student.id)}
        />
      ) : null}
    </Container>
  )
}
