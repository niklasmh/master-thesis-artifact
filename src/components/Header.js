import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useLocation, Link } from 'react-router-dom'
import styled from 'styled-components'
import * as firebase from 'firebase/app'

import { Paragraph } from './Typography'

const Container = styled.div`
  display: flex;
  flex: 0 0 60px;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: flex-end;
  width: 100%;
`

const Breadcrumb = styled.p`
  flex: 1 0 auto;
  text-align: left;
  color: #fff8;
  text-shadow: 0 4px 8px #0004;

  a {
    color: #fff8;
    text-decoration: none;
    transition: color 0.2s;

    &:hover {
      color: #fff;
    }
  }

  a:last-child {
    color: #fff;
  }
`

export default function Header() {
  const { user } = useSelector((state) => state.user)
  const location = useLocation()
  const [breadcrumb, setBreadcrumb] = useState([])

  const firstLetterToUpper = (str) => {
    const [firstLetter, ...rest] = str.split('')
    return firstLetter.toUpperCase() + rest.join('')
  }

  useEffect(() => {
    if (location.pathname.length > 1) {
      const paths = []
      setBreadcrumb([
        <Link to={paths.join('/')} key={'hjem'}>
          Hjem
        </Link>,
        ...location.pathname
          .split('/')
          .filter((path) => path)
          .map((path) => {
            paths.push(path)
            return (
              <React.Fragment key={path}>
                {' '}
                /{' '}
                <Link to={'/' + paths.join('/')}>
                  {firstLetterToUpper(path)}
                </Link>
              </React.Fragment>
            )
          }),
      ])
    } else {
      setBreadcrumb([])
    }
  }, [location])

  const logout = () => {
    firebase.auth().signOut()
  }

  return (
    <Container>
      <Breadcrumb>{breadcrumb}</Breadcrumb>
      {user ? (
        <Paragraph>
          Du er logget inn som: {user.displayName || user.email}
        </Paragraph>
      ) : null}
      {(location.pathname || '').indexOf('/create') !== 0 ? (
        <Link className="button" to="/create">
          + Lag ny oppgave
        </Link>
      ) : null}
      {user ? (
        <button onClick={logout}>Logg ut</button>
      ) : (
        <Link className="button" to="/login">
          Logg inn
        </Link>
      )}
    </Container>
  )
}
