export const getLineNumber = (lines, offset = 0) => {
  try {
    let match = null
    for (let line of lines.reverse()) {
      match = line.replace(/^[\s\S]*File "<e...>", line (\d+), in .*/, '$1')
      if (match.length > 5) {
        match = line.replace(/^[\s\S]*File "<unknown>", line (\d+).*/, '$1')
      }
      if (/^\d+$/.test(match)) {
        break
      }
    }
    return parseInt(match) - offset
  } catch (ex) {
    return -1
  }
}

export const translatePythonException = (
  exception,
  offset,
  code = '',
  model = null
) => {
  const lines = exception.trim().split('\n')
  const lastLine = lines.slice(-1)[0]
  const messageStartIndex = lastLine.indexOf(': ')
  const type = lastLine.slice(0, messageStartIndex)
  const message = lastLine.slice(messageStartIndex + 2)
  return formatPythonException(
    type,
    message,
    lines.slice(0, -1),
    getLineNumber(lines, offset),
    code,
    model
  )
}

export const formatPythonException = (
  type,
  message,
  prevLines,
  line = -1,
  code = '',
  model = null
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
      markRangeInEditor([line, 0, line + 1, 0], output, 3, '', model)
    }
    return output
  }

  return `Ukjent error. Se i konsollen i nettleseren for mer informasjon.`
}

const markRangeInEditor = (
  range,
  message = '',
  severity = 3,
  source = '',
  model = null
) => {
  if (model) {
    window.monaco.editor.setModelMarkers(
      'getModel' in model ? model.getModel() : model,
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
}

export const removeMarkRangeInEditor = (model) => {
  if (model) {
    window.monaco.editor.setModelMarkers(
      'getModel' in model ? model.getModel() : model,
      'code-editor',
      []
    )
  }
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
  return around + lines.join('\n').replace(/^\n+|\n+$/g, '') + around
}

//const ifgt = (value, ifstr, elsestr = '', cond = 0) => value > cond ? ifstr : elsestr

export const exceptions = {
  SystemExit: (message, line, prev, code) => message,
  KeyboardInterrupt: (message, line, prev, code) => message,
  GeneratorExit: (message, line, prev, code) => message,
  Exception: (message, line, prev, code) => message,
  StopIteration: (message, line, prev, code) => message,
  StopAsyncIteration: (message, line, prev, code) => message,
  ArithmeticError: (message, line, prev, code) => message,
  FloatingPointError: (message, line, prev, code) => message,
  OverflowError: (message, line, prev, code) => message,
  ZeroDivisionError: (message, line, prev, code) => message,
  AssertionError: (message, line, prev, code) => message,
  AttributeError: (message, line, prev, code) => message,
  BufferError: (message, line, prev, code) => message,
  EOFError: (message, line, prev, code) => message,
  ImportError: (message, line, prev, code) => message,
  ModuleNotFoundError: (message, line, prev, code) => message,
  LookupError: (message, line, prev, code) => message,
  IndexError: (message, line, prev, code) =>
    message.replace(
      /list index out of range/,
      `Koden prøver å hente et element fra listen som ikke finnes${ifline(
        '',
        line,
        ':' + getncode(code, line, 2, { postLine: ' <-- Linje ' + line }),
        '. ',
        false
      )}Prøv å bruk en ${~code().indexOf('-') ? 'høyere' : 'lavere'} verdi.`
    ),
  KeyError: (message, line, prev, code) => message,
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
  OSError: (message, line, prev, code) => message,
  FileExistsError: (message, line, prev, code) => message,
  FileNotFoundError: (message, line, prev, code) => message,
  InterruptedError: (message, line, prev, code) => message,
  IsADirectoryError: (message, line, prev, code) => message,
  NotADirectoryError: (message, line, prev, code) => message,
  PermissionError: (message, line, prev, code) => message,
  ProcessLookupError: (message, line, prev, code) => message,
  ReferenceError: (message, line, prev, code) => message,
  RuntimeError: (message, line, prev, code) => message,
  NotImplementedError: (message, line, prev, code) => message,
  RecursionError: (message, line, prev, code) => message,
  SyntaxError: (message, line, prev, code) =>
    message.replace(
      /invalid syntax/,
      `Det er en feil${ifline(' på linje ', line)}:\n${prev
        .slice(-2)
        .join('\n')}`
    ),
  IndentationError: (message, line, prev, code) => {
    if (message === 'unindent does not match any outer indentation level') {
      return `Det er for få eller for mange innrykk:${ifline(
        '',
        line,
        getncode(code, line, 2, { postLine: ' <-- Linje ' + line }),
        '',
        false
      )}`
    } else if (message === 'unexpected indent') {
      return `For mange innrykk:${ifline(
        '',
        line,
        getncode(code, line, 2, { postLine: ' <-- Linje ' + line }),
        '',
        false
      )}`
    }
    return message
  },
  TabError: (message, line, prev, code) => message,
  SystemError: (message, line, prev, code) => message,
  TypeError: (message, line, prev, code) => {
    if (/^unsupported operand type\(s\) for.+'ellipsis'/.test(message)) {
      let indexOfEllipsis = -1
      try {
        let i = 0
        while (indexOfEllipsis === -1) {
          if (code(i).indexOf('...')) {
            indexOfEllipsis = i
          }
          i++
        }
      } catch (ex) {
        console.log(ex)
      }
      return `Du må fylle inn svaret ditt her:${ifline(
        '',
        indexOfEllipsis,
        getncode(code, indexOfEllipsis, 2, { postLine: ' <-- Linje ' + line }),
        '',
        false
      )}`
    }
  },
  ValueError: (message, line, prev, code) => message,
  UnicodeError: (message, line, prev, code) => message,
  UnicodeDecodeError: (message, line, prev, code) => message,
  UnicodeEncodeError: (message, line, prev, code) => message,
  UnicodeTranslateError: (message, line, prev, code) => message,
  Warning: (message, line, prev, code) => message,
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
}
