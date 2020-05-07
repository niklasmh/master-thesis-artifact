import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch,
} from 'react-router-dom'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

import styled, { createGlobalStyle } from 'styled-components'

import * as firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/database'
import 'firebase/firestore'
import { useAuthState } from 'react-firebase-hooks/auth'

import Header from './components/Header'
import ClassroomPage from './pages/Classroom'
import HomePage from './pages/Home'
import LandingPage from './pages/Landing'
import LoadingPage from './pages/Loading'
import LoginPage from './pages/Login'
import ProfilePage from './pages/Profile'
import TasksPage from './pages/Tasks'

var firebaseConfig = {
  apiKey: 'AIzaSyDy07r8PY3WutOHNEOMvT94FREgtHwma5I',
  authDomain: 'master-thesis-artifact.firebaseapp.com',
  databaseURL: 'https://master-thesis-artifact.firebaseio.com',
  projectId: 'master-thesis-artifact',
  storageBucket: 'master-thesis-artifact.appspot.com',
  messagingSenderId: '949577889226',
  appId: '1:949577889226:web:7aeb77c91fda121aa54b33',
  measurementId: 'G-05Q8GCEF63',
}

firebase.initializeApp(firebaseConfig)

const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
  }

  body {
    margin: auto;
    padding: 0 2em 8em;
    max-width: calc(1200px + 4em);
    font-family: 'Roboto', sans-serif;
    font-size: 16px;
    background-color: #626262;
    color: #ddd;
  }

  button, .button {
    font-size: 13px;
    text-decoration: none;
    appearance: none;
    background-color: #222;
    box-sizing: border-box;
    box-shadow: 0 0 8px #0004;
    line-height: 15px;
    color: white;
    padding: 0.5em 1em;
    margin: 1em;
    border-radius: 3px;
    border: none;
    cursor: pointer;
  }
`

const AppContainer = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  min-height: calc(100vh - 8em);
`

function App() {
  const [user, loading] = useAuthState(firebase.auth())
  const { uid } = useSelector((state) => state.user)
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch({ type: 'setUser', user })
    if (user && user.uid) {
      firebase
        .firestore()
        .collection('users')
        .doc(user.uid)
        .get()
        .then((doc) => {
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
    <>
      <GlobalStyle />
      {loading ? (
        <AppContainer>
          <LoadingPage />
        </AppContainer>
      ) : (
        <AppContainer>
          <Router>
            <Header />
            <Switch>
              <Route exact path="/" component={LandingPage} />
              <Route
                path="/profil"
                component={uid ? ProfilePage : LandingPage}
              />
              <Route path="/oppgave/:id" component={TasksPage} />
              <Route
                exact
                path="/klasse/:pin/oppgave"
                render={(props) => (
                  <Redirect to={`/klasse/${props.match.params.pin}`} />
                )}
              />
              <Route
                path="/klasse/:pin/oppgave/:id"
                component={uid ? TasksPage : LandingPage}
              />
              <Route
                path="/klasse/:pin"
                component={uid ? ClassroomPage : LandingPage}
              />
              <Route path="/login" component={LoginPage} />
              <Route path="*">
                <Redirect to="/" />
              </Route>
            </Switch>
          </Router>
        </AppContainer>
      )}
    </>
  )
}

export default App
