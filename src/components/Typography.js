import styled from 'styled-components'

export const Title = styled.h1`
  font-weight: normal;
  font-size: 4em;
  color: white;
  text-shadow: 0 4px 8px #0004;
  text-align: ${({ align = 'center' }) => align};
  align-self: ${({ alignSelf = 'center' }) => alignSelf};
`

export const SubTitle = styled.h2`
  font-weight: normal;
  font-size: 2.5em;
  color: white;
  text-shadow: 0 4px 8px #0004;
  text-align: ${({ align = 'center' }) => align};
  align-self: ${({ alignSelf = 'center' }) => alignSelf};
`

export const Paragraph = styled.p`
  font-size: 1em;
  color: white;
  text-shadow: 0 4px 8px #0004;
  text-align: ${({ align = 'center' }) => align};
  align-self: ${({ alignSelf = 'center' }) => alignSelf};
`
