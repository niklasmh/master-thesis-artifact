function reducer(
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
    isPyodideReady: false,
    writeToLogFunction: () => {},
    execAndGetCurrentVariableValues: () => {},
    runCode: () => {},
    onLogInput: () => {},
    editor: null,
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
    case 'setIsPyodideReady':
      return {
        ...state,
        isPyodideReady: action.isReady,
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

export default reducer
