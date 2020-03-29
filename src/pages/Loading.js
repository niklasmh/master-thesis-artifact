import React from 'react'
import styled from 'styled-components'

const Container = styled.div`
  display: flex;
  flex: 1 0 auto;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;
`

export default function LoadingPage() {
  return <Container>Laster ...</Container>
}
