import React from 'react'

export const preDefinedElements = `import sys, os
from math import *

def blockPrint():
  sys.stdout = open(os.devnull, 'w')

def enablePrint():
  sys.stdout = sys.__stdout__

__elements__ = []
class Ball:
  def __init__(self, **kwargs):
    self.x = 0
    self.y = 0
    self.x0 = 0
    self.y0 = 0
    self.r = 50
    self.m = -1
    self.color = "blue"
    self.drawforces = False
    self.type = "Ball"
    for k, i in kwargs.items():
      if k == "x":
        self.x = i
        self.x0 = i
      elif k == "y":
        self.y = i
        self.y0 = i
      elif k == "r": self.r = i
      elif k == "m": self.m = i if i >= 0 else pi*r**2
      elif k == "color": self.color = i
      elif k == "drawforces": self.drawforces = i
    __elements__.append(self)
  def render(self, ctx):
    ctx.drawCircle(self)
    if self.drawforces:
        ctx.drawForces(self)
`

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
  'pi',
  'e',
  'tau',
  'inf',
  'nan',
]

export function createPrintFunction(write) {
  const prettyPrint = arg => {
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
        sep = kwargs['sep'] || sep
        delete kwargs['sep']
        if (sep !== null) {
          if (typeof sep !== 'string') {
            throw new Error('sep must be None or a string')
          }
        }
      }
      if ('end' in kwargs) {
        end = kwargs['end'] || end
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
    const content = args.map(arg => prettyPrint(arg)).join(sep) + end
    if (styleArgs) {
      let styledContent = args.map((arg, i) => {
        switch (typeof arg) {
          case 'object':
            return <span key={i}>JSON.stringify(arg)</span>
          case 'string':
            return (
              <span key={i} style={{ color: '#ce9178' }}>
                "{arg}"
              </span>
            )
          case 'number':
            return (
              <span key={i} style={{ color: '#b5cea8' }}>
                {arg}
              </span>
            )
          default:
            return <span key={i}>arg</span>
        }
      })
      write(content, styledContent)
    } else {
      write(content)
    }
  }
  return print
}