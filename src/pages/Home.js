import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import styled from 'styled-components'
import * as firebase from 'firebase/app'
import { useDocumentData } from 'react-firebase-hooks/firestore'

import { Paragraph, Title } from '../components/Typography'
import ClassroomList from '../components/ClassroomList'

const Container = styled.div`
  display: flex;
  flex: 1 0 auto;
  width: 100%;
  flex-flow: column nowrap;
  justify-content: flex-start;
  align-items: center;
`

export default function HomePage() {
  const [isTeacher, setIsTeacher] = useState(null)
  const { uid } = useSelector(state => state.user)
  const [userData, loadingUserData] = useDocumentData(
    firebase
      .firestore()
      .collection('users')
      .doc(uid)
  )

  useEffect(() => {
    if (userData) {
      setIsTeacher(!!userData.isTeacher)
    }
  }, [userData])

  return (
    <Container>
      {loadingUserData ? null : isTeacher ? (
        <TeacherPage classroomIDs={userData.classrooms.map(c => c.id)} />
      ) : (
        <StudentPage />
      )}
    </Container>
  )
}

function TeacherPage({ classroomIDs = [] }) {
  const { uid } = useSelector(state => state.user)
  const generatePIN = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    return [
      chars[Math.floor(Math.random() * chars.length)],
      chars[Math.floor(Math.random() * chars.length)],
      chars[Math.floor(Math.random() * chars.length)],
      chars[Math.floor(Math.random() * chars.length)],
    ].join('')
  }
  const createClassroom = async () => {
    const PIN = generatePIN()
    await firebase
      .firestore()
      .collection('classrooms')
      .doc(PIN)
      .set({
        name: window.prompt(
          'Hva vil du kalle klassen? (f.eks.: Klasse 1A eller Fysikk 1 klasse A)'
        ),
        students: [],
        tasks: [],
        teachers: firebase.firestore.FieldValue.arrayUnion(
          firebase
            .firestore()
            .collection('users')
            .doc(uid)
        ),
      })
    firebase
      .firestore()
      .collection('users')
      .doc(uid)
      .update({
        classrooms: firebase.firestore.FieldValue.arrayUnion(
          firebase
            .firestore()
            .collection('classrooms')
            .doc(PIN)
        ),
      })
  }

  return (
    <>
      <Title>Dine klasser</Title>
      {classroomIDs.length ? (
        <>
          <Paragraph>
            Du kan be elevene skrive inn PIN for å komme inn til klassene
          </Paragraph>
          <ClassroomList classroomIDs={classroomIDs} />
          <button onClick={createClassroom}>Lag et nytt klasserom</button>
        </>
      ) : (
        <>
          <Paragraph>
            Du må lage et klassrom for å komme i gang. Om du vil bli lærer på et
            eksisterende klasserom må du bli invitert til det klasserommet.
          </Paragraph>
          <button onClick={createClassroom}>Lag ditt første klassrom</button>
        </>
      )}
    </>
  )
}

function StudentPage() {
  return <>Du er elev og kan foreløpig ikke gjøre noe her enda</>
}
