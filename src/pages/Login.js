import React, { useEffect, useRef, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import styled from 'styled-components'
import * as firebase from 'firebase/app'
import { useAuthState } from 'react-firebase-hooks/auth'

const Container = styled.div`
  display: flex;
  flex: 1 0 auto;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;
`

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false)
  const [errorMessage, setErrorMessage] = useState(false)
  const [user] = useAuthState(firebase.auth())
  const dispatch = useDispatch()
  const userEmailElement = useRef(null)
  const userPasswordElement = useRef(null)
  const userRepeatPasswordElement = useRef(null)
  const userNameElement = useRef(null)
  const history = useHistory()

  const login = async () => {
    try {
      await firebase
        .auth()
        .signInWithEmailAndPassword(
          userEmailElement.current.value,
          userPasswordElement.current.value
        )
      history.push('/')
    } catch (ex) {
      console.error(ex)
      switch (ex.code) {
        case 'auth/user-not-found':
          setErrorMessage(
            <>
              Denne brukeren finnes ikke.{' '}
              <button onClick={() => setIsRegister(true)}>
                Lag ny bruker?
              </button>
            </>
          )
          break
        case 'auth/wrong-password':
          setErrorMessage('Feil passord :)')
          break
        default:
          setErrorMessage(ex.message)
          break
      }
    }
  }

  const getFormData = () => {
    const email = userEmailElement.current.value
    const password = userPasswordElement.current.value
    const repeatPassword = userRepeatPasswordElement.current.value
    const name = userNameElement.current.value

    if (!email) throw new Error('Eposten mangler')
    if (!password) throw new Error('Passord manger')
    if (password !== repeatPassword) throw new Error('Passordene er ikke like')

    return {
      email,
      password,
      name,
    }
  }

  const forgottenPassword = () => {
    console.log('Ikke implementert enda')
  }

  const register = async () => {
    try {
      const { email, password, name } = getFormData()
      await firebase.auth().createUserWithEmailAndPassword(email, password)
      const user = firebase.auth().currentUser
      if (user) {
        user.updateProfile({
          displayName: name,
        })
        firebase
          .firestore()
          .collection('users')
          .doc(user.uid)
          .set({
            tasks: [],
            classrooms: [],
            isTeacher: true,
          })
      }
      login()
    } catch (ex) {
      console.error(ex)
      switch (ex.code) {
        case 'auth/weak-password':
          setErrorMessage('Passordet må ha minst 6 karakterer')
          break
        case 'auth/email-already-in-use':
          setErrorMessage(
            <>
              Eposten er allerede i bruk.
              <button onClick={() => setIsRegister(false)}>
                Logg inn
              </button>{' '}
              eller <button onClick={forgottenPassword}>Glemt passord</button>?
            </>
          )
          break
        default:
          setErrorMessage(ex.message)
          break
      }
    }
  }

  useEffect(() => {
    dispatch({ type: 'setUser', user })
    if (user && user.uid) {
      firebase
        .firestore()
        .collection('users')
        .doc(user.uid)
        .get()
        .then(doc => {
          if (doc.exists) {
            dispatch({ type: 'setUserData', user: doc.data() })
          } else {
            dispatch({ type: 'setUserData', user: null })
          }
        })
    } else {
      dispatch({ type: 'setUserData', user: null })
    }
  }, [user, dispatch])

  return (
    <Container>
      <h2>Epost{isRegister ? ' (dette blir ditt brukernavn)' : ''}</h2>
      <input ref={userEmailElement} type="username" />
      <h2>Passord</h2>
      <input ref={userPasswordElement} type="password" />
      {isRegister ? (
        <>
          <h2>Gjenta passord</h2>
          <input ref={userRepeatPasswordElement} type="password" />
          <h2>Ditt navn</h2>
          <input ref={userNameElement} />
          <button onClick={register}>Registrer bruker</button>
          <button onClick={() => setIsRegister(false)}>Jeg har bruker</button>
          <p>{errorMessage}</p>
        </>
      ) : (
        <>
          <button onClick={login}>Logg inn</button>
          <button onClick={() => setIsRegister(true)}>
            Jeg har ikke bruker
          </button>
          <p>{errorMessage}</p>
        </>
      )}
    </Container>
  )
}
