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
    deltaTime: 0.02,
    totalTime: 0,
    solutionDeltaTime: 0.02,
    solutionTotalTime: 0,
    isPlaying: false,
    withError: false,
    attempts: 0,
    code: '',
    isSolution: false,
    subgoal: {
      title: '',
      description: '',
      hiddenCode: '',
      predefinedCode: false,
      solutionCode: '',
      testCode: '',
    },
    codeEditorRun: () => {},
    codeEditorSize: { w: 0, h: 0 },
    resultCanvasContext: null,
    resultCanvasSize: { w: 0, h: 0 },
    resultCanvasSettings: { scale: 1, position: { w: 0, h: 0 } },
    goalCanvasContext: null,
    goalCanvasSize: { w: 0, h: 0 },
    goalCanvasSettings: { scale: 1, position: { w: 0, h: 0 } },
    values: [],
    clearValues: () => {},
    valuesSize: { w: 0, h: 0 },
    logSize: { w: 0, h: 0 },
    isEngineReady: false,
    writeToLogFunction: () => {},
    execAndGetCurrentVariableValues: () => {},
    runCode: () => {},
    onLogInput: () => {},
    clearLog: () => {},
    editor: null,
    loopEditor: null,
  },
  action
) {
  switch (action.type) {
    case 'setTime':
      return {
        ...state,
        time: action.time,
        deltaTime: 'deltaTime' in action ? action.deltaTime : state.deltaTime,
        totalTime: 'totalTime' in action ? action.totalTime : state.totalTime,
        solutionDeltaTime:
          'solutionDeltaTime' in action
            ? action.solutionDeltaTime
            : state.solutionDeltaTime,
        solutionTotalTime:
          'solutionTotalTime' in action
            ? action.solutionTotalTime
            : state.solutionTotalTime,
      }
    case 'setIsPlaying':
      return {
        ...state,
        isPlaying: action.isPlaying,
      }
    case 'setWithError':
      return {
        ...state,
        withError: action.withError,
      }
    case 'addAttempt':
      return {
        ...state,
        attempts: state.attempts + 1,
      }
    case 'resetAttempts':
      return {
        ...state,
        attempts: 0,
      }
    case 'setCode':
      return {
        ...state,
        code: action.code,
        isSolution: !!action.isSolution,
      }
    case 'setSubgoal':
      return {
        ...state,
        subgoal: action.subgoal,
      }
    case 'setCodeEditorRun':
      return {
        ...state,
        codeEditorRun: action.run,
      }
    case 'setCodeEditorSize':
      return {
        ...state,
        codeEditorSize: action.size,
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
        deltaTime: 'deltaTime' in action ? action.deltaTime : state.deltaTime,
        totalTime: 'totalTime' in action ? action.totalTime : state.totalTime,
        solutionDeltaTime:
          'solutionDeltaTime' in action
            ? action.solutionDeltaTime
            : state.solutionDeltaTime,
        solutionTotalTime:
          'solutionTotalTime' in action
            ? action.solutionTotalTime
            : state.solutionTotalTime,
      }
    case 'setClearValuesFunction':
      return {
        ...state,
        clearValues: action.clearValues,
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
      window.writeToLogFunction = action.writeToLogFunction
      return {
        ...state,
        writeToLogFunction: action.writeToLogFunction,
      }
    case 'setIsEngineReady':
      if (action.runCode) window.runCode = action.runCode
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
      window.runCode = action.function
      return {
        ...state,
        runCode: action.function,
      }
    case 'setOnLogInput':
      window.onLogInput = action.onLogInput
      return {
        ...state,
        onLogInput: action.onLogInput,
      }
    case 'setClearLogFunction':
      return {
        ...state,
        clearLog: action.clearLog,
      }
    case 'setEditor':
      return {
        ...state,
        editor: action.editor,
      }
    case 'setLoopEditor':
      return {
        ...state,
        loopEditor: action.loopEditor,
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
