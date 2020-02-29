function reducer(
  state = {
    resultCanvasContext: null,
    resultCanvasSize: { w: 0, h: 0 },
    goalCanvasContext: null,
    goalCanvasSize: { w: 0, h: 0 },
    values: [],
    valuesSize: { w: 0, h: 0 },
    logSize: { w: 0, h: 0 },
    isPyodideReady: false,
    writeToLogFunction: () => {},
    execAndGetCurrentVariableValues: () => {},
    runCode: () => {},
    onLogInput: () => {},
  },
  action
) {
  switch (action.type) {
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
    case 'setValues':
      return {
        ...state,
        values: action.values,
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
    default:
      return {
        ...state,
      }
  }
}

export default reducer
