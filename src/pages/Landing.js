import React from 'react'
import styled from 'styled-components'
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

export default function LoadingPage() {
  const [popular, loadingPopular] = useDocumentData(
    firebase.firestore().collection('community').doc('popular')
  )

  return (
    <Container>
      <Title>Programmeringsoppgaver for fysikk på videregående</Title>
      <SubTitle alignSelf="flex-start">
        {loadingPopular ? 'Laster ...' : popular.title}
      </SubTitle>
      {loadingPopular ? null : popular.tasks.length ? (
        <TaskList taskIDs={popular.tasks.map((task) => task.id)} />
      ) : null}
    </Container>
  )
}
