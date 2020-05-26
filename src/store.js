import { combineReducers } from 'redux'

export const setLocalStorage = (key, value) => {
  try {
    window.localStorage.setItem(key, value)
    return true
  } catch (ex) {
    return false
  }
}

export const getLocalStorage = (key, defaultValue, setIfDefault = false) => {
  try {
    const value = window.localStorage.getItem(key)
    if (value === null) {
      if (setIfDefault) {
        setLocalStorage(key, defaultValue)
      }
      return defaultValue
    }
    return value
  } catch (ex) {
    return defaultValue
  }
}

const setTheme = (theme) => {
  document.documentElement.style.setProperty(
    '--background-color',
    theme === 'dark' ? '#626262' : '#ddd'
  )
}

const theme = getLocalStorage('theme', 'dark', true)
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
    scale: 5,
    solutionScale: 5,
    position: 1,
    solutionPosition: 1,
    timeScale: 1,
    solutionTimeScale: 1,
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
    traceResultCanvasContext: null,
    resultCanvasSize: { w: 0, h: 0 },
    goalCanvasContext: null,
    traceGoalCanvasContext: null,
    goalCanvasSize: { w: 0, h: 0 },
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
    case 'setScale':
      return {
        ...state,
        scale: action.scale || state.scale,
        solutionScale: action.solutionScale || state.solutionScale,
      }
    case 'setTimeScale':
      return {
        ...state,
        timeScale: action.timeScale || state.timeScale,
        solutionTimeScale: action.solutionTimeScale || state.solutionTimeScale,
      }
    case 'setPosition':
      return {
        ...state,
        position: action.position || state.position,
        solutionPosition: action.solutionPosition || state.solutionPosition,
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
      }
    case 'setTraceResultCanvasContext':
      return {
        ...state,
        traceResultCanvasContext: action.context,
      }
    case 'setResultCanvasSize':
      return {
        ...state,
        resultCanvasSize: action.size,
      }
    case 'setGoalCanvasContext':
      return {
        ...state,
        goalCanvasContext: action.context,
      }
    case 'setTraceGoalCanvasContext':
      return {
        ...state,
        traceGoalCanvasContext: action.context,
      }
    case 'setGoalCanvasSize':
      return {
        ...state,
        goalCanvasSize: action.size,
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
