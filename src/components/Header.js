import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, Link } from 'react-router-dom'
import styled from 'styled-components'
import * as firebase from 'firebase/app'

import Icon from './Icon'
import { Paragraph } from './Typography'

const Container = styled.div`
  display: flex;
  flex: 0 0 60px;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
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

    .light & {
      color: #000a;
    }

    &:hover {
      color: #fff;

      .light & {
        color: #000;
      }
    }
  }

  a:last-child {
    color: #fff;

    .light & {
      color: #000;
    }
  }

  .light & {
    color: #000a;
  }
`

const IconWrapper = styled.div``

const StyledLightSwitch = styled.div`
  display: flex;
  flex-direction: row;
  font-size: 1.5em;
  width: 2.5em;
  height: 1.2em;
  border: 2px solid ${(props) => (props.checked ? '#444' : '#fff')};
  border-radius: 0.6em;
  background-color: ${(props) => (props.checked ? '#444' : '#fff')};
  position: relative;
  cursor: pointer;
  margin: 0 1em;

  ${IconWrapper} {
    height: 1em;
    position: absolute;
    transition: left 0.2s;
    top: 0;
    left: ${(props) => (props.checked ? '1.3em' : '0')};

    > i {
      position: absolute;
      top: 0;
      left: 0;
      transition: opacity 0.2s;

      :first-child {
        opacity: ${(props) => (props.checked ? 0 : 1)};
      }
      :last-child {
        opacity: ${(props) => (props.checked ? 1 : 0)};
      }
    }
  }
`

function LightSwitch() {
  const { theme } = useSelector((state) => state.user)
  const dispatch = useDispatch()

  return (
    <StyledLightSwitch
      checked={theme === 'dark'}
      onClick={() => {
        dispatch({
          type: 'setTheme',
          theme: theme === 'dark' ? 'light' : 'dark',
        })
      }}
    >
      <IconWrapper>
        <Icon key={'sun'} name="brightness_5" />
        <Icon key={'moon'} name="nights_stay" />
      </IconWrapper>
    </StyledLightSwitch>
  )
}

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
      <LightSwitch />
      {user ? (
        <Paragraph>
          Du er logget inn som: {user.displayName || user.email}
        </Paragraph>
      ) : null}
      {(location.pathname || '').indexOf('/oppgave/ny') !== 0 ? (
        <Link className="button" to="/oppgave/ny">
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
