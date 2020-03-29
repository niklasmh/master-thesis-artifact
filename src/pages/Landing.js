import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'

const Container = styled.div`
  display: flex;
  flex: 1 0 auto;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;
`
const PinField = styled.input.attrs({ type: 'text', placeholder: 'PIN...' })`
  text-transform: uppercase;
`
const IAmTeacher = styled(Link).attrs({ to: '/login' })``

export default function LandingPage() {
  return (
    <Container>
      <PinField />
      <IAmTeacher>Jeg er lærer</IAmTeacher>
    </Container>
  )
}
