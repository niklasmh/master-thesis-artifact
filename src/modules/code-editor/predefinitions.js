import React from 'react'
import styled from 'styled-components'

export const preDefinedImports = `import sys, os
from math import *
`
export const preDefinedElements = `
loop = False
__loop__ = False
dt = 0.02
t_tot = 1

def blockPrint():
    sys.stdout = open(os.devnull, 'w')

def enablePrint():
    sys.stdout = sys.__stdout__

__elements__ = []
class Ball:
    def __init__(self, x=0, y=0, r=1, color="blue", **kwargs):
        self.x = x
        self.y = y
        self.x0 = x
        self.y0 = y
        self.vx = 0
        self.vy = 0
        self.ax = 0
        self.ay = 0
        self.r = r
        self.m = -1
        self.color = color
        self.drawforces = False
        for k, i in kwargs.items():
            if k == "vx":
                self.vx = i
                self.vx0 = i
            elif k == "vy":
                self.vy = i
                self.vy0 = i
            if k == "ax":
                self.ax = i
                self.ax0 = i
            elif k == "ay":
                self.ay = i
                self.ay0 = i
            elif k == "drawforces": self.drawforces = i
        __elements__.append(self)
    def render(self, ctx):
        ctx.drawCircle(self)
        if self.drawforces:
                ctx.drawForces(self)
        return {
          "minx": self.x - self.r,
          "maxx": self.x + self.r,
          "miny": self.y - self.r,
          "maxy": self.y + self.r,
        }

class Planet:
    def __init__(self, x=0, y=0, r=1, m=1, color="blue", **kwargs):
        self.x = x
        self.y = y
        self.x0 = x
        self.y0 = y
        self.vx = 0
        self.vy = 0
        self.ax = 0
        self.ay = 0
        self.r = r
        self.m = m
        self.color = color
        self.drawforces = False
        for k, i in kwargs.items():
            if k == "vx":
                self.vx = i
                self.vx0 = i
            elif k == "vy":
                self.vy = i
                self.vy0 = i
            if k == "ax":
                self.ax = i
                self.ax0 = i
            elif k == "ay":
                self.ay = i
                self.ay0 = i
            elif k == "drawforces": self.drawforces = i
        __elements__.append(self)
    def render(self, ctx):
        ctx.drawCircle(self)
        if self.drawforces:
                ctx.drawForces(self)
        return {
          "minx": self.x - self.r,
          "maxx": self.x + self.r,
          "miny": self.y - self.r,
          "maxy": self.y + self.r,
        }

class Kloss:
    def __init__(self, x=0, y=0, b=1, h=1, m=1, rot=0, color="blue", **kwargs):
        self.x = x
        self.y = y
        self.x0 = x
        self.y0 = y
        self.vx = 0
        self.vy = 0
        self.ax = 0
        self.ay = 0
        self.b = b
        self.h = h
        self.m = m
        self.rot = rot
        self.color = color
        self.drawforces = False
        for k, i in kwargs.items():
            if k == "vx":
                self.vx = i
                self.vx0 = i
            elif k == "vy":
                self.vy = i
                self.vy0 = i
            if k == "ax":
                self.ax = i
                self.ax0 = i
            elif k == "ay":
                self.ay = i
                self.ay0 = i
            elif k == "drawforces": self.drawforces = i
        __elements__.append(self)
    def render(self, ctx):
        ctx.drawBlock(self)
        if self.drawforces:
                ctx.drawForces(self)
        r = max(self.b, self.h) # Approx
        return {
          "minx": self.x - r,
          "maxx": self.x + r,
          "miny": self.y - r,
          "maxy": self.y + r,
        }

class Linje:
    def __init__(self, x1=0, y1=0, x2=1, y2=1, color="black", w=3, **kwargs):
        self.x1 = x1
        self.y1 = y1
        self.x10 = x1
        self.y10 = y1
        self.x2 = x2
        self.y2 = y2
        self.x20 = x2
        self.y20 = y2
        self.color = color
        self.w = w
        __elements__.append(self)
    def render(self, ctx):
        ctx.drawLine(self)
        return {
          "minx": min(self.x1, self.x2),
          "maxx": max(self.x1, self.x2),
          "miny": min(self.y1, self.y2),
          "maxy": max(self.y1, self.y2),
        }
`
export const preDefinedElementsLineCount = (
  preDefinedImports + preDefinedElements
).split('\n').length
export const classTypes = preDefinedElements
  .split('\n')
  .filter((e) => e.indexOf('class') === 0)
  .map((c) => c.replace(/^class ([A-Za-z]+).*$/, '$1'))

export const preDefinedVars = [
  '__name__',
  '__doc__',
  '__package__',
  '__loader__',
  '__spec__',
  '__annotations__',
  '__builtins__',
  '__build_class__',
  '__import__',
  '__debug__',
  '_importlib',
  'abs',
  'all',
  'any',
  'ascii',
  'bin',
  'breakpoint',
  'callable',
  'chr',
  'compile',
  'delattr',
  'dir',
  'divmod',
  'eval',
  'exec',
  'format',
  'getattr',
  'globals',
  'hasattr',
  'hash',
  'hex',
  'id',
  'input',
  'isinstance',
  'issubclass',
  'iter',
  'len',
  'locals',
  'max',
  'min',
  'next',
  'oct',
  'ord',
  'pow',
  'print',
  'repr',
  'round',
  'setattr',
  'sorted',
  'sum',
  'vars',
  'None',
  'Ellipsis',
  'NotImplemented',
  'False',
  'True',
  'bool',
  'memoryview',
  'bytearray',
  'bytes',
  'classmethod',
  'complex',
  'dict',
  'enumerate',
  'filter',
  'float',
  'frozenset',
  'property',
  'int',
  'list',
  'map',
  'object',
  'range',
  'reversed',
  'set',
  'slice',
  'staticmethod',
  'str',
  'super',
  'tuple',
  'type',
  'zip',
  'BaseException',
  'Exception',
  'TypeError',
  'StopAsyncIteration',
  'StopIteration',
  'GeneratorExit',
  'SystemExit',
  'KeyboardInterrupt',
  'ImportError',
  'ModuleNotFoundError',
  'OSError',
  'EnvironmentError',
  'IOError',
  'EOFError',
  'RuntimeError',
  'RecursionError',
  'NotImplementedError',
  'NameError',
  'UnboundLocalError',
  'AttributeError',
  'SyntaxError',
  'IndentationError',
  'TabError',
  'LookupError',
  'IndexError',
  'KeyError',
  'ValueError',
  'UnicodeError',
  'UnicodeEncodeError',
  'UnicodeDecodeError',
  'UnicodeTranslateError',
  'AssertionError',
  'ArithmeticError',
  'FloatingPointError',
  'OverflowError',
  'ZeroDivisionError',
  'SystemError',
  'ReferenceError',
  'MemoryError',
  'BufferError',
  'Warning',
  'UserWarning',
  'DeprecationWarning',
  'PendingDeprecationWarning',
  'SyntaxWarning',
  'RuntimeWarning',
  'FutureWarning',
  'ImportWarning',
  'UnicodeWarning',
  'BytesWarning',
  'ResourceWarning',
  'ConnectionError',
  'BlockingIOError',
  'BrokenPipeError',
  'ChildProcessError',
  'ConnectionAbortedError',
  'ConnectionRefusedError',
  'ConnectionResetError',
  'FileExistsError',
  'FileNotFoundError',
  'IsADirectoryError',
  'NotADirectoryError',
  'InterruptedError',
  'PermissionError',
  'ProcessLookupError',
  'TimeoutError',
  'open',
  'quit',
  'exit',
  'copyright',
  'credits',
  'license',
  'help',
  'sys',
  'os',
  'acos',
  'acosh',
  'asin',
  'asinh',
  'atan',
  'atan2',
  'atanh',
  'ceil',
  'copysign',
  'cos',
  'cosh',
  'degrees',
  'erf',
  'erfc',
  'exp',
  'expm1',
  'fabs',
  'factorial',
  'floor',
  'fmod',
  'frexp',
  'fsum',
  'gamma',
  'gcd',
  'hypot',
  'isclose',
  'isfinite',
  'isinf',
  'isnan',
  'ldexp',
  'lgamma',
  'log',
  'log1p',
  'log10',
  'log2',
  'modf',
  'radians',
  'remainder',
  'sin',
  'sinh',
  'sqrt',
  'tan',
  'tanh',
  'trunc',
  'pi',
  'e',
  'tau',
  'inf',
  'nan',
]

export const preDefinedUserVars = [
  'acos',
  'acosh',
  'asin',
  'asinh',
  'atan',
  'atan2',
  'atanh',
  'ceil',
  'copysign',
  'cos',
  'cosh',
  'degrees',
  'erf',
  'erfc',
  'exp',
  'expm1',
  'fabs',
  'factorial',
  'floor',
  'fmod',
  'frexp',
  'fsum',
  'gamma',
  'gcd',
  'hypot',
  'isclose',
  'isfinite',
  'isinf',
  'isnan',
  'ldexp',
  'lgamma',
  'log',
  'log1p',
  'log10',
  'log2',
  'modf',
  'radians',
  'remainder',
  'sin',
  'sinh',
  'sqrt',
  'tan',
  'tanh',
  'trunc',
  'abs',
  'all',
  'any',
  'ascii',
  'bin',
  'chr',
  'delattr',
  'dir',
  'divmod',
  'eval',
  'exec',
  'format',
  'getattr',
  'globals',
  'hasattr',
  'hash',
  'hex',
  'input',
  'isinstance',
  'issubclass',
  'iter',
  'len',
  'locals',
  'max',
  'min',
  'next',
  'oct',
  'ord',
  'pow',
  'print',
  'repr',
  'round',
  'setattr',
  'sorted',
  'sum',
  'vars',
  'None',
  'False',
  'True',
  'bool',
  'bytearray',
  'bytes',
  'complex',
  'dict',
  'enumerate',
  'filter',
  'float',
  'property',
  'int',
  'list',
  'map',
  'object',
  'range',
  'reversed',
  'set',
  'slice',
  'str',
  'super',
  'tuple',
  'type',
  'zip',
  'open',
  'quit',
  'exit',
  'copyright',
  'credits',
  'license',
  'help',
  'sys',
  'pi',
  'e',
  'tau',
  'inf',
  'nan',
]

const Value = styled.span`
  color: #b5cea8;

  .light & {
    color: #09885a;
  }
`

const BooleanValue = styled.span`
  color: #569cd6;

  .light & {
    color: #0000ff;
  }
`

const StringValue = styled(Value)`
  color: #ce9178;

  .light & {
    color: #a31515;
  }
`

export function createPrintFunction(write) {
  const prettyPrint = (arg) => {
    switch (typeof arg) {
      case 'object':
        return JSON.stringify(arg)
      case 'string':
        return arg
      case 'number':
        return arg
      default:
        return arg
    }
  }
  const print = (...args) => {
    const kwargs = args.pop()
    let sep = ' '
    let end = '\n'
    let styleArgs = false
    if (typeof kwargs === 'object') {
      if ('file' in kwargs) {
        delete kwargs['file']
      }
      if ('sep' in kwargs) {
        sep = kwargs['sep']
        delete kwargs['sep']
        if (sep !== null) {
          if (typeof sep !== 'string') {
            throw new Error('sep must be None or a string')
          }
        }
      }
      if ('end' in kwargs) {
        end = kwargs['end']
        delete kwargs['end']
        if (end !== null) {
          if (typeof end !== 'string') {
            throw new Error('end must be None or a string')
          }
        }
      }
      if ('styleArgs' in kwargs) {
        styleArgs = kwargs['styleArgs'] || false
        delete kwargs['styleArgs']
      }
      if (Object.keys(kwargs).length) {
        throw new Error('invalid keyword arguments to print()')
      }
    }
    const content = args.map((arg) => prettyPrint(arg)).join(sep) + end
    if (styleArgs) {
      let styledContent = args.map((arg, i) => {
        switch (typeof arg) {
          case 'object':
            return <span key={i}>{JSON.stringify(arg)}</span>
          case 'string':
            return <StringValue key={i}>"{arg}"</StringValue>
          case 'number':
            return <Value key={i}>{arg}</Value>
          case 'boolean':
            return <BooleanValue key={i}>{arg ? 'True' : 'False'}</BooleanValue>
          case 'function':
            return <span key={i}>{arg.__str__()}</span>
          default:
            return <span key={i}>{arg}</span>
        }
      })
      write(content, styledContent)
    } else {
      write(content)
    }
  }
  return print
}

export function createOnLogInputFunction(write) {
  const input = (...args) => {
    let prompt = ''
    if (args.length) {
      const kwargs = args.pop()
      if (typeof kwargs === 'object') {
        throw new Error('input() takes no keyword arguments')
      }
      if (args.length) {
        prompt = args[0]
      }
    }
    return write(prompt)
  }
  return input
}
