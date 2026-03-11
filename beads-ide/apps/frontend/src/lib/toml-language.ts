/**
 * CodeMirror 6 TOML language support via StreamLanguage.
 * Provides syntax highlighting for .formula.toml files.
 */
import {
  HighlightStyle,
  StreamLanguage,
  type StreamParser,
  type StringStream,
  syntaxHighlighting,
} from '@codemirror/language'
import { tags } from '@lezer/highlight'

/** State tracked across lines by the TOML tokenizer */
interface TomlState {
  /** Whether we're inside a multi-line basic string (""") */
  inMultiBasic: boolean
  /** Whether we're inside a multi-line literal string (''') */
  inMultiLiteral: boolean
}

/**
 * Stream parser for TOML syntax.
 * Handles comments, section headers, keys, strings, numbers, booleans, and dates.
 */
const tomlStreamParser: StreamParser<TomlState> = {
  startState(): TomlState {
    return { inMultiBasic: false, inMultiLiteral: false }
  },

  token(stream: StringStream, state: TomlState): string | null {
    // Multi-line basic string continuation
    if (state.inMultiBasic) {
      while (!stream.eol()) {
        if (stream.match('"""')) {
          state.inMultiBasic = false
          return 'string'
        }
        // Handle escape sequences inside multi-line strings
        if (stream.next() === '\\') {
          stream.next() // skip escaped char
        }
      }
      return 'string'
    }

    // Multi-line literal string continuation
    if (state.inMultiLiteral) {
      while (!stream.eol()) {
        if (stream.match("'''")) {
          state.inMultiLiteral = false
          return 'string'
        }
        stream.next()
      }
      return 'string'
    }

    // Skip whitespace
    if (stream.eatSpace()) return null

    // Comments
    if (stream.match('#')) {
      stream.skipToEnd()
      return 'comment'
    }

    // Array of tables header [[...]]
    if (stream.match('[[')) {
      stream.skipTo(']]')
      stream.match(']]')
      return 'heading'
    }

    // Table header [...]
    if (stream.match('[')) {
      stream.skipTo(']')
      stream.match(']')
      return 'heading'
    }

    // Multi-line basic string """
    if (stream.match('"""')) {
      state.inMultiBasic = true
      while (!stream.eol()) {
        if (stream.match('"""')) {
          state.inMultiBasic = false
          return 'string'
        }
        if (stream.next() === '\\') {
          stream.next()
        }
      }
      return 'string'
    }

    // Multi-line literal string '''
    if (stream.match("'''")) {
      state.inMultiLiteral = true
      while (!stream.eol()) {
        if (stream.match("'''")) {
          state.inMultiLiteral = false
          return 'string'
        }
        stream.next()
      }
      return 'string'
    }

    // Basic string "..."
    if (stream.match('"')) {
      while (!stream.eol()) {
        const ch = stream.next()
        if (ch === '"') return 'string'
        if (ch === '\\') stream.next() // skip escape
      }
      return 'string'
    }

    // Literal string '...'
    if (stream.match("'")) {
      while (!stream.eol()) {
        if (stream.next() === "'") return 'string'
      }
      return 'string'
    }

    // Booleans
    if (stream.match(/^true\b/) || stream.match(/^false\b/)) {
      return 'bool'
    }

    // Date/time (ISO 8601 patterns)
    if (stream.match(/^\d{4}-\d{2}-\d{2}([T ]\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})?)?/)) {
      return 'number'
    }

    // Numbers: hex, oct, bin, float, int
    if (stream.match(/^0x[0-9a-fA-F_]+/) ||
        stream.match(/^0o[0-7_]+/) ||
        stream.match(/^0b[01_]+/) ||
        stream.match(/^[+-]?(inf|nan)\b/) ||
        stream.match(/^[+-]?\d[\d_]*(\.\d[\d_]*)?([eE][+-]?\d[\d_]*)?/)) {
      return 'number'
    }

    // Equals sign (assignment operator)
    if (stream.match('=')) {
      return 'operator'
    }

    // Comma, dot
    if (stream.match(',') || stream.match('.')) {
      return 'punctuation'
    }

    // Braces and brackets (inline tables/arrays)
    if (stream.match('{') || stream.match('}') || stream.match(']')) {
      return 'bracket'
    }

    // Bare keys and dotted keys (before = sign, this is a key)
    if (stream.match(/^[A-Za-z0-9_-]+/)) {
      // Look ahead: if followed by whitespace then =, this is a key
      if (stream.match(/^\s*=/, false)) {
        return 'propertyName'
      }
      // After = sign, could be a value identifier
      return 'propertyName'
    }

    // Consume any other character
    stream.next()
    return null
  },
}

/** CodeMirror 6 TOML language definition */
export const tomlLanguage = StreamLanguage.define(tomlStreamParser)

/** Highlight style tailored for TOML in the dark theme */
export const tomlHighlightStyle = HighlightStyle.define([
  { tag: tags.comment, color: '#6b7280', fontStyle: 'italic' },
  { tag: tags.heading, color: '#60a5fa', fontWeight: 'bold' },
  { tag: tags.string, color: '#34d399' },
  { tag: tags.bool, color: '#c084fc' },
  { tag: tags.number, color: '#fb923c' },
  { tag: tags.propertyName, color: '#93c5fd' },
  { tag: tags.operator, color: '#94a3b8' },
  { tag: tags.punctuation, color: '#94a3b8' },
  { tag: tags.bracket, color: '#94a3b8' },
])

/** Combined TOML language and highlighting extension */
export const tomlSupport = [tomlLanguage, syntaxHighlighting(tomlHighlightStyle)]
