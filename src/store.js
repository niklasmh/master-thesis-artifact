import { combineReducers } from 'redux'

export const getLocalStorage = (key, defaultValue) => {
  try {
    return window.localStorage.getItem(key)
  } catch (ex) {
    return defaultValue
  }
}

export const setLocalStorage = (key, value) => {
  try {
    window.localStorage.setItem(key, value)
    return true
  } catch (ex) {
    return false
  }
}

const setTheme = (theme) => {
  document.documentElement.style.setProperty(
    '--background-color',
    theme === 'dark' ? '#626262' : '#ddd'
  )
}

const theme = getLocalStorage('theme', 'dark')
setTheme(theme)

export function user(
  state = {
    user: null,
    userData: null,
    uid: '',
    theme,
  },
  action
) {
  switch (action.type) {
    case 'setUser':
      return {
        ...state,
        user: action.user,
        uid: action.user ? action.user.uid : '',
      }
    case 'setUserData':
      return {
        ...state,
        userData: action.user,
      }
    case 'setUid':
      return {
        ...state,
        uid: action.uid,
      }
    case 'setTheme':
      setLocalStorage('theme', action.theme)
      setTheme(action.theme)
      return {
        ...state,
        theme: action.theme,
      }
    default:
      return {
        ...state,
      }
  }
}

export function task(
  state = {
    time: 0,
    deltaTime: 0.01,
    totalTime: 0,
    isPlaying: false,
    resultCanvasContext: null,
    resultCanvasSize: { w: 0, h: 0 },
    resultCanvasSettings: { scale: 1, position: { w: 0, h: 0 } },
    goalCanvasContext: null,
    goalCanvasSize: { w: 0, h: 0 },
    goalCanvasSettings: { scale: 1, position: { w: 0, h: 0 } },
    values: [],
    valuesSize: { w: 0, h: 0 },
    logSize: { w: 0, h: 0 },
    isEngineReady: false,
    writeToLogFunction: () => {},
    execAndGetCurrentVariableValues: () => {},
    runCode: () => {},
    onLogInput: () => {},
    editor: { current: null },
  },
  action
) {
  switch (action.type) {
    case 'setTime':
      return {
        ...state,
        time: action.time,
        deltaTime: action.deltaTime || state.deltaTime,
        totalTime: action.totalTime || state.totalTime,
      }
    case 'setIsPlaying':
      return {
        ...state,
        isPlaying: action.isPlaying,
      }
    case 'setResultCanvasContext':
      return {
        ...state,
        resultCanvasContext: action.context,
        resultCanvasSize: {
          w: action.context.canvas.width,
          h: action.context.canvas.height,
        },
      }
    case 'setResultCanvasSize':
      return {
        ...state,
        resultCanvasSize: action.size,
      }
    case 'setResultCanvasSettings':
      return {
        ...state,
        resultCanvasSettings: {
          scale: action.scale || state.resultCanvasSettings.scale,
          position: action.position || state.resultCanvasSettings.position,
        },
      }
    case 'setGoalCanvasContext':
      return {
        ...state,
        goalCanvasContext: action.context,
        goalCanvasSize: {
          w: action.context.canvas.width,
          h: action.context.canvas.height,
        },
      }
    case 'setGoalCanvasSize':
      return {
        ...state,
        goalCanvasSize: action.size,
      }
    case 'setGoalCanvasSettings':
      return {
        ...state,
        goalCanvasSettings: {
          scale: action.scale || state.goalCanvasSettings.scale,
          position: action.position || state.goalCanvasSettings.position,
        },
      }
    case 'setValues':
      window.values = action.values
      return {
        ...state,
        values: action.values,
        deltaTime: action.deltaTime || state.deltaTime,
        totalTime: action.totalTime || state.totalTime,
      }
    case 'setValuesSize':
      return {
        ...state,
        valuesSize: action.size,
      }
    case 'setLogSize':
      return {
        ...state,
        logSize: action.size,
      }
    case 'setWriteToLogFunction':
      return {
        ...state,
        writeToLogFunction: action.writeToLogFunction,
      }
    case 'setIsEngineReady':
      return {
        ...state,
        isEngineReady: action.isReady,
        ...(!!action.runCode && { runCode: action.runCode }),
      }
    case 'setExecFunction':
      return {
        ...state,
        execAndGetCurrentVariableValues: action.function,
      }
    case 'setRunCodeFunction':
      return {
        ...state,
        runCode: action.function,
      }
    case 'setOnLogInput':
      return {
        ...state,
        onLogInput: action.onLogInput,
      }
    case 'setEditor':
      return {
        ...state,
        editor: action.editor,
      }
    default:
      return {
        ...state,
      }
  }
}

export default combineReducers({
  user,
  task,
})
