'use client'

// @ts-ignore
import curl from 'highlightjs-curl'
import { noop } from 'lodash'
import { Check, Copy } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Children, ReactNode, useState } from 'react'
import { Light as SyntaxHighlighter, SyntaxHighlighterProps } from 'react-syntax-highlighter'
import bash from 'react-syntax-highlighter/dist/cjs/languages/hljs/bash'
import csharp from 'react-syntax-highlighter/dist/cjs/languages/hljs/csharp'
import dart from 'react-syntax-highlighter/dist/cjs/languages/hljs/dart'
import go from 'react-syntax-highlighter/dist/cjs/languages/hljs/go'
import http from 'react-syntax-highlighter/dist/cjs/languages/hljs/http'
import ini from 'react-syntax-highlighter/dist/cjs/languages/hljs/ini'
import js from 'react-syntax-highlighter/dist/cjs/languages/hljs/javascript'
import json from 'react-syntax-highlighter/dist/cjs/languages/hljs/json'
import kotlin from 'react-syntax-highlighter/dist/cjs/languages/hljs/kotlin'
import pgsql from 'react-syntax-highlighter/dist/cjs/languages/hljs/pgsql'
import php from 'react-syntax-highlighter/dist/cjs/languages/hljs/php'
import {
  default as py,
  default as python,
} from 'react-syntax-highlighter/dist/cjs/languages/hljs/python'
import sql from 'react-syntax-highlighter/dist/cjs/languages/hljs/sql'
import swift from 'react-syntax-highlighter/dist/cjs/languages/hljs/swift'
import ts from 'react-syntax-highlighter/dist/cjs/languages/hljs/typescript'
import xml from 'react-syntax-highlighter/dist/cjs/languages/hljs/xml'
import yaml from 'react-syntax-highlighter/dist/cjs/languages/hljs/yaml'
import { Button } from '../Button'
import { cn } from '../../lib/utils/cn'
import { copyToClipboard } from '../../lib/utils/clipboard'

import { monokaiCustomTheme } from './CodeBlock.utils'

export type CodeBlockLang =
  | 'js'
  | 'jsx'
  | 'sql'
  | 'py'
  | 'bash'
  | 'ts'
  | 'dart'
  | 'json'
  | 'csharp'
  | 'kotlin'
  | 'curl'
  | 'http'
  | 'php'
  | 'python'
  | 'go'
  | 'pgsql'
  | 'swift'
  | 'yaml'
  | 'toml'
  | 'html'

export interface CodeBlockProps {
  title?: ReactNode
  language?: CodeBlockLang
  linesToHighlight?: number[]
  highlightBorder?: boolean
  styleConfig?: {
    lineNumber?: string
    highlightBackgroundColor?: string
    highlightBorderColor?: string
  }
  hideCopy?: boolean
  hideLineNumbers?: boolean
  className?: string
  wrapperClassName?: string
  value?: string
  theme?: any
  children?: string
  wrapLines?: boolean
  focusable?: boolean
  renderer?: SyntaxHighlighterProps['renderer']
  handleCopy?: (value?: string) => void
  onCopyCallback?: () => void
}

export const CodeBlock = ({
  title,
  language,
  linesToHighlight = [],
  highlightBorder,
  styleConfig,
  className,
  wrapperClassName,
  value,
  theme,
  children,
  hideCopy = false,
  hideLineNumbers = false,
  wrapLines = true,
  renderer,
  focusable = true,
  onCopyCallback = noop,
  handleCopy,
}: CodeBlockProps) => {
  const { resolvedTheme } = useTheme()
  const isDarkTheme = resolvedTheme?.includes('dark')!
  const monokaiTheme = theme ?? monokaiCustomTheme(isDarkTheme)

  const [copied, setCopied] = useState(false)

  const onSelectCopy = (value?: string) => {
    if (value) {
      if (!!handleCopy) {
        handleCopy(value)
      } else {
        copyToClipboard(value)
      }
    }
    setCopied(true)
    onCopyCallback()
    setTimeout(() => setCopied(false), 1000)
  }

  const childrenArray = Children.toArray(children)
  const [singleChild] = childrenArray.length === 1 ? childrenArray : []
  const singleString = typeof singleChild === 'string' ? singleChild : undefined

  let codeValue = value ?? singleString ?? children
  codeValue = codeValue?.trimEnd?.() ?? codeValue

  const shortCodeBlockClasses =
    typeof codeValue === 'string' && codeValue.length < 70 ? 'short-inline-codeblock' : ''

  let lang = language ? language : className ? className.replace('language-', '') : 'js'
  if (lang === 'jsx') lang = 'js'
  SyntaxHighlighter.registerLanguage('js', js)
  SyntaxHighlighter.registerLanguage('ts', ts)
  SyntaxHighlighter.registerLanguage('py', py)
  SyntaxHighlighter.registerLanguage('sql', sql)
  SyntaxHighlighter.registerLanguage('bash', bash)
  SyntaxHighlighter.registerLanguage('dart', dart)
  SyntaxHighlighter.registerLanguage('csharp', csharp)
  SyntaxHighlighter.registerLanguage('json', json)
  SyntaxHighlighter.registerLanguage('kotlin', kotlin)
  SyntaxHighlighter.registerLanguage('curl', curl)
  SyntaxHighlighter.registerLanguage('http', http)
  SyntaxHighlighter.registerLanguage('php', php)
  SyntaxHighlighter.registerLanguage('python', python)
  SyntaxHighlighter.registerLanguage('go', go)
  SyntaxHighlighter.registerLanguage('pgsql', pgsql)
  SyntaxHighlighter.registerLanguage('swift', swift)
  SyntaxHighlighter.registerLanguage('html', xml)
  SyntaxHighlighter.registerLanguage('toml', ini)
  SyntaxHighlighter.registerLanguage('yaml', yaml)

  const large = false
  if (lang === 'bash' || lang === 'sh') hideLineNumbers = true
  const showLineNumbers = !hideLineNumbers

  return (
    <>
      {title && (
        <div className="text-sm rounded-t-md bg-surface-100 py-2 px-4 border border-b-0 border-default font-sans">
          {title}
        </div>
      )}
      {className ? (
        <div
          className={cn(
            'group relative max-w-[90vw] md:max-w-none overflow-auto',
            wrapperClassName
          )}
        >
          {/* @ts-ignore */}
          <SyntaxHighlighter
            suppressContentEditableWarning
            language={lang}
            wrapLines={wrapLines}
            style={monokaiTheme}
            className={cn(
              'code-block border border-surface p-4 w-full my-0! !bg-surface-100 outline-hidden focus:border-foreground-lighter/50',
              `${!title ? 'rounded-md' : 'rounded-t-none rounded-b-md'}`,
              `${!showLineNumbers ? 'pl-6' : ''}`,
              className
            )}
            customStyle={{
              fontSize: large ? 18 : 13,
              lineHeight: large ? 1.5 : 1.4,
            }}
            showLineNumbers={showLineNumbers}
            lineProps={(lineNumber) => {
              if (linesToHighlight.includes(lineNumber)) {
                return {
                  style: {
                    display: 'block',
                    backgroundColor: styleConfig?.highlightBackgroundColor
                      ? styleConfig?.highlightBackgroundColor
                      : 'hsl(var(--background-selection))',
                    borderLeft: highlightBorder
                      ? `1px solid ${styleConfig?.highlightBorderColor ? styleConfig?.highlightBorderColor : 'hsl(var(--foreground-default)'})`
                      : null,
                  },
                  class: 'hljs-line-highlight',
                }
              }
              return {}
            }}
            lineNumberContainerStyle={{
              paddingTop: '128px',
            }}
            lineNumberStyle={{
              minWidth: '44px',
              paddingLeft: '4px',
              paddingRight: '4px',
              marginRight: '12px',
              color: styleConfig?.lineNumber ?? '#828282',
              textAlign: 'center',
              fontSize: large ? 14 : 12,
              paddingTop: '4px',
              paddingBottom: '4px',
            }}
            renderer={renderer}
            contentEditable={focusable}
            onBeforeInput={(e: any) => {
              e.preventDefault()
              return false
            }}
            onKeyDown={(e: any) => {
              if (e.code === 'Backspace') {
                e.preventDefault()
                return false
              }
            }}
          >
            {codeValue}
          </SyntaxHighlighter>
          {!hideCopy && (value || children) && className ? (
            <div
              className={[
                'absolute right-2 top-2',
                'opacity-0 group-hover:opacity-100 transition',
                `${isDarkTheme ? 'dark' : ''}`,
              ].join(' ')}
            >
              <Button
                type="default"
                className="px-1.5"
                icon={copied ? <Check /> : <Copy />}
                onClick={() => onSelectCopy(value || children)}
              >
                {copied ? 'Copied' : ''}
              </Button>
            </div>
          ) : null}
        </div>
      ) : (
        <code className={shortCodeBlockClasses}>{value || children}</code>
      )}
    </>
  )
}
