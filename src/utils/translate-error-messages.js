export const getLineNumber = (message, offset = 0) => {
  try {
    const match = message.replace(
      /[\s\S]*File "<e...>", line (\d+), in <module>[\s\S]*/,
      '$1'
    )
    if (match.length > 10) {
      const match2 = message.replace(
        /[\s\S]*File "<unknown>", line (\d+)[\s\S]*/,
        '$1'
      )
      return parseInt(match2) - offset
    }
    return parseInt(match) - offset
  } catch (ex) {
    return -1
  }
}

export const translatePythonException = (exception, offset, code = '') => {
  const lines = exception.trim().split('\n')
  const lastLine = lines.slice(-1)[0]
  const messageStartIndex = lastLine.indexOf(': ')
  const type = lastLine.slice(0, messageStartIndex)
  const message = lastLine.slice(messageStartIndex + 2)
  return formatPythonException(
    type,
    message,
    lines.slice(0, -1),
    getLineNumber(exception, offset),
    code
  )
}

export const formatPythonException = (
  type,
  message,
  prevLines,
  line = -1,
  code = ''
) => {
  if (type in exceptions) {
    const codeSplitted = code.split('\n')
    const output = exceptions[type](
      message,
      line,
      prevLines,
      (n = line) => codeSplitted[n - 1] || ''
    )
    if (line >= 0) {
      markRangeInEditor([line, 0, line + 1, 0], output)
    }
    return output
  }

  return `Ukjent error. Se i konsollen i nettleseren for mer informasjon.`
}

const markRangeInEditor = (range, message = '', severity = 3, source = '') => {
  window.monaco.editor.setModelMarkers(
    window.monaco.editor.getModels()[0],
    'code-editor',
    [
      {
        startLineNumber: range[0],
        startColumn: range[1],
        endLineNumber: range[2],
        endColumn: range[3],
        message,
        severity,
        source,
      },
    ]
  )
}

export const removeMarkRangeInEditor = () => {
  window.monaco.editor.setModelMarkers(
    window.monaco.editor.getModels()[0],
    'code-editor',
    []
  )
}

const ifline = (pre, line, post = '', elsestr = '', uselinenumber = true) =>
  line >= 0 ? pre + (uselinenumber ? line : '') + post : elsestr

//const ifcontent = (content, pre, post = '') => content ? pre + content + post : ''

const getncode = (
  code,
  line,
  above = 1,
  { below = -1, around = '\n\n', postLine = '', preLine = '' }
) => {
  below = below < 0 ? above : below
  const lines = []
  for (let i = -above; i < below; i++) {
    if (i === 0) {
      lines.push(preLine + code(i + line) + postLine)
    } else {
      lines.push(code(i + line))
    }
  }
  return around + lines.join('\n').trim() + around
}

//const ifgt = (value, ifstr, elsestr = '', cond = 0) => value > cond ? ifstr : elsestr

export const exceptions = {
  SystemExit: (message, line, prev, code) => message,
  KeyboardInterrupt: (message, line, prev, code) => message,
  GeneratorExit: (message, line, prev, code) => message,
  //Exception: (message, line, prev, code) => message,
  StopIteration: (message, line, prev, code) => message,
  StopAsyncIteration: (message, line, prev, code) => message,
  //ArithmeticError: (message, line, prev, code) => message,
  FloatingPointError: (message, line, prev, code) => message,
  OverflowError: (message, line, prev, code) => message,
  ZeroDivisionError: (message, line, prev, code) => message,
  //},
  AssertionError: (message, line, prev, code) => message,
  AttributeError: (message, line, prev, code) => message,
  BufferError: (message, line, prev, code) => message,
  EOFError: (message, line, prev, code) => message,
  //ImportError: (message, line, prev, code) => message,
  ModuleNotFoundError: (message, line, prev, code) => message,
  //},
  //LookupError: (message, line, prev, code) => message,
  IndexError: (message, line, prev, code) =>
    message.replace(
      /list index out of range/,
      `Du prøver å hente et element fra listen som ikke finnes${ifline(
        '',
        line,
        ':' + getncode(code, line, 2, { postLine: ' <-- Linje ' + line }),
        '. ',
        false
      )}Prøv å bruk en ${~code().indexOf('-') ? 'høyere' : 'lavere'} verdi.`
    ),
  KeyError: (message, line, prev, code) => message,
  //},
  MemoryError: (message, line, prev, code) => message,
  NameError: (message, line, prev, code) =>
    message.replace(
      /name '(.+)' is not defined/,
      `Variabel '$1'${ifline(
        '',
        line,
        ' er ikke definert:' +
          getncode(code, line, 2, { postLine: ' <-- Linje ' + line }),
        ' er ikke definert.\n\n',
        false
      )}Du kan sette variabelen slik:\n\n$1 = 123`
    ),
  UnboundLocalError: (message, line, prev, code) => message,
  //},
  //OSError: (message, line, prev, code) => message,
  FileExistsError: (message, line, prev, code) => message,
  FileNotFoundError: (message, line, prev, code) => message,
  InterruptedError: (message, line, prev, code) => message,
  IsADirectoryError: (message, line, prev, code) => message,
  NotADirectoryError: (message, line, prev, code) => message,
  PermissionError: (message, line, prev, code) => message,
  ProcessLookupError: (message, line, prev, code) => message,
  //},
  ReferenceError: (message, line, prev, code) => message,
  //RuntimeError: (message, line, prev, code) => message,
  NotImplementedError: (message, line, prev, code) => message,
  RecursionError: (message, line, prev, code) => message,
  //},
  SyntaxError: (message, line, prev, code) =>
    message.replace(
      /invalid syntax/,
      `Du har skrevet noe feil${ifline(' på linje ', line)}:\n${prev
        .slice(-2)
        .join('\n')}`
    ),
  //IndentationError: (message, line, prev, code) => message,
  TabError: (message, line, prev, code) => message,
  //},
  //},
  SystemError: (message, line, prev, code) => message,
  TypeError: (message, line, prev, code) => message,
  //ValueError: (message, line, prev, code) => message,
  //UnicodeError: (message, line, prev, code) => message,
  UnicodeDecodeError: (message, line, prev, code) => message,
  UnicodeEncodeError: (message, line, prev, code) => message,
  UnicodeTranslateError: (message, line, prev, code) => message,
  //},
  //},
  //Warning: (message, line, prev, code) => message,
  DeprecationWarning: (message, line, prev, code) => message,
  PendingDeprecationWarning: (message, line, prev, code) => message,
  RuntimeWarning: (message, line, prev, code) => message,
  SyntaxWarning: (message, line, prev, code) => message,
  UserWarning: (message, line, prev, code) => message,
  FutureWarning: (message, line, prev, code) => message,
  ImportWarning: (message, line, prev, code) => message,
  UnicodeWarning: (message, line, prev, code) => message,
  BytesWarning: (message, line, prev, code) => message,
  ResourceWarning: (message, line, prev, code) => message,
  //},
  //},
}
