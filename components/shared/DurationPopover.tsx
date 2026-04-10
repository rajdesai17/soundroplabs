'use client'

import { useState, useRef, useEffect } from 'react'

interface DurationPopoverProps {
  value: number | null // null means "Auto"
  onChange: (value: number | null) => void
}

const presets = [
  { label: 'Short (1–3s)', min: 1, max: 3 },
  { label: 'Medium (5–10s)', min: 5, max: 10 },
  { label: 'Long (15–22s)', min: 15, max: 22 },
]

export default function DurationPopover({ value, onChange }: DurationPopoverProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [localValue, setLocalValue] = useState(value ?? 5)
  const popoverRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value)
    setLocalValue(newValue)
    onChange(newValue)
  }

  const handlePresetClick = (min: number, max: number) => {
    const midpoint = (min + max) / 2
    setLocalValue(midpoint)
    onChange(midpoint)
  }

  const handleAutoClick = () => {
    onChange(null)
    setIsOpen(false)
  }

  const displayValue = value === null ? 'Auto' : `${value}s`

  return (
    <div className="relative" ref={popoverRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="font-mono text-xs text-text-secondary border border-border-default px-2.5 py-1 rounded hover:border-border-hover hover:text-text-primary transition-colors"
      >
        {displayValue} ↕
      </button>

      {isOpen && (
        <div className="absolute bottom-full mb-2 left-0 w-60 bg-bg-surface border border-border-default rounded-lg p-4 z-50 animate-fade-in-up">
          {/* Label */}
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-xs text-text-tertiary">Duration</span>
            <span className="font-mono text-sm text-text-primary">
              {value === null ? 'Auto' : `${localValue}s`}
            </span>
          </div>

          {/* Slider */}
          <input
            type="range"
            min="0.5"
            max="22"
            step="0.5"
            value={localValue}
            onChange={handleSliderChange}
            className="w-full h-1 bg-bg-elevated rounded-full appearance-none cursor-pointer mb-4
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-3
              [&::-webkit-slider-thumb]:h-3
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-sd-accent
              [&::-webkit-slider-thumb]:cursor-pointer
              [&::-moz-range-thumb]:w-3
              [&::-moz-range-thumb]:h-3
              [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:bg-sd-accent
              [&::-moz-range-thumb]:border-0
              [&::-moz-range-thumb]:cursor-pointer"
          />

          {/* Presets */}
          <div className="flex flex-wrap gap-2 mb-3">
            {presets.map((preset) => (
              <button
                key={preset.label}
                onClick={() => handlePresetClick(preset.min, preset.max)}
                className="font-mono text-xs text-text-secondary border border-border-default px-2 py-1 rounded hover:border-border-hover hover:text-text-primary transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Auto option */}
          <button
            onClick={handleAutoClick}
            className={`w-full font-mono text-xs py-2 rounded transition-colors ${
              value === null
                ? 'bg-sd-accent text-bg-base'
                : 'text-text-secondary border border-border-default hover:border-border-hover hover:text-text-primary'
            }`}
          >
            Auto (let AI decide)
          </button>
        </div>
      )}
    </div>
  )
}
