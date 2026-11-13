import { useState, useRef, useEffect } from 'react'
import { HelpCircle, X } from 'lucide-react'

interface HelpTooltipProps {
  title: string
  content: string | string[]
  position?: 'top' | 'bottom' | 'left' | 'right'
  size?: 'sm' | 'md' | 'lg'
}

export const HelpTooltip = ({
  title,
  content,
  position = 'bottom',
  size = 'md'
}: HelpTooltipProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipRef.current &&
        buttonRef.current &&
        !tooltipRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  const tooltipWidths = {
    sm: 'w-64',
    md: 'w-80',
    lg: 'w-96'
  }

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  }

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-gray-800 dark:border-t-gray-700',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-gray-800 dark:border-b-gray-700',
    left: 'left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-gray-800 dark:border-l-gray-700',
    right: 'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-gray-800 dark:border-r-gray-700'
  }

  const contentArray = Array.isArray(content) ? content : [content]

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 rounded-full"
        aria-label="ヘルプを表示"
        type="button"
      >
        <HelpCircle className={iconSizes[size]} />
      </button>

      {isOpen && (
        <div
          ref={tooltipRef}
          className={`absolute z-50 ${tooltipWidths[size]} ${positionClasses[position]} animate-in fade-in slide-in-from-top-1 duration-200`}
        >
          {/* Arrow */}
          <div className={`absolute w-0 h-0 border-8 ${arrowClasses[position]}`} />

          {/* Tooltip content */}
          <div className="bg-gray-800 dark:bg-gray-700 text-white rounded-lg shadow-xl border border-gray-700 dark:border-gray-600 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700 dark:border-gray-600 bg-gray-900 dark:bg-gray-800">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-blue-400" />
                {title}
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white transition-colors rounded p-1 hover:bg-gray-700"
                aria-label="閉じる"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="px-4 py-3 text-sm text-gray-200 dark:text-gray-300 space-y-2 max-h-96 overflow-y-auto">
              {contentArray.map((paragraph, index) => (
                <p key={index} className="leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
