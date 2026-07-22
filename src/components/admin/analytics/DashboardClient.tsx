'use client'

import React, { useState, useTransition, useRef, useEffect } from 'react'
import { getAnalyticsData, AnalyticsPayload, RangeType } from '@/lib/admin-actions'
import { AnalyticsCards } from './AnalyticsCard'
import { AnalyticsCharts } from './AnalyticsCharts'
import { AnalyticsTable } from './AnalyticsTable'
import { Button } from '@/components/ui/button'
import { Loader2, Calendar, Zap, ChevronDown, Settings } from 'lucide-react'

type Props = {
  initialData: AnalyticsPayload
}

const rangeOptions = [
  { value: 'realtime', label: 'Realtime (30 phút)', labelShort: '30 phút qua', icon: Zap, iconColor: 'text-amber-500 fill-amber-500/10' },
  { value: 'today', label: 'Hôm nay', labelShort: 'hôm nay', icon: Calendar, iconColor: 'text-blue-500' },
  { value: '7days', label: '7 ngày qua', labelShort: '7 ngày qua', icon: Calendar, iconColor: 'text-indigo-500' },
  { value: '30days', label: '30 ngày qua', labelShort: '30 ngày qua', icon: Calendar, iconColor: 'text-amber-500' },
  { value: 'custom', label: 'Khoảng tùy chỉnh', labelShort: 'tùy chỉnh', icon: Settings, iconColor: 'text-purple-500' },
] as const

export default function DashboardClient({ initialData }: Props) {
  const [data, setData] = useState<AnalyticsPayload>(initialData)
  const [rangeType, setRangeType] = useState<RangeType>(initialData.rangeType)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isPending, startTransition] = useTransition()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSelectOption = (nextRange: RangeType) => {
    setRangeType(nextRange)
    setIsDropdownOpen(false)

    if (nextRange !== 'custom') {
      startTransition(async () => {
        try {
          const res = await getAnalyticsData(nextRange)
          setData(res)
        } catch (err) {
          console.error('Failed to fetch analytics:', err)
        }
      })
    }
  }

  const handleFilterCustom = () => {
    if (!startDate || !endDate) return
    startTransition(async () => {
      try {
        const res = await getAnalyticsData('custom', startDate, endDate)
        setData(res)
      } catch (err) {
        console.error('Failed to fetch analytics:', err)
      }
    })
  }

  const currentOption = rangeOptions.find(o => o.value === rangeType) || rangeOptions[0]
  const IconComponent = currentOption.icon

  // Setup theme styling for the status dot and radar
  const theme = {
    realtime: { bg: 'bg-emerald-500', bgLight: 'bg-emerald-500/20' },
    today: { bg: 'bg-blue-500', bgLight: 'bg-blue-500/20' },
    '7days': { bg: 'bg-indigo-500', bgLight: 'bg-indigo-500/20' },
    '30days': { bg: 'bg-amber-500', bgLight: 'bg-amber-500/20' },
    custom: { bg: 'bg-purple-500', bgLight: 'bg-purple-500/20' }
  }[rangeType] || { bg: 'bg-emerald-500', bgLight: 'bg-emerald-500/20' }

  return (
    <div className="space-y-6 relative">
      {/* CSS keyframe animation for custom radar ripple */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes radar-ripple {
          0% {
            transform: scale(0.5);
            opacity: 0.8;
          }
          50% {
            opacity: 0.45;
          }
          100% {
            transform: scale(2.4);
            opacity: 0;
          }
        }
        .radar-ring-1 {
          animation: radar-ripple 3s cubic-bezier(0.16, 1, 0.3, 1) infinite;
        }
        .radar-ring-2 {
          animation: radar-ripple 3s cubic-bezier(0.16, 1, 0.3, 1) infinite;
          animation-delay: 1s;
        }
        .radar-ring-3 {
          animation: radar-ripple 3s cubic-bezier(0.16, 1, 0.3, 1) infinite;
          animation-delay: 2s;
        }
      `}} />

      {/* Dynamic Loading Overlay */}
      {isPending && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-[2px] z-50 flex items-center justify-center rounded-lg min-h-[400px]">
          <div className="bg-card border shadow-lg rounded-xl p-4 flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
            <span className="text-sm font-medium">Đang cập nhật số liệu...</span>
          </div>
        </div>
      )}

      {/* Floating Sticky Toolbar Filter */}
      <div className="sticky top-4 z-40 bg-card/90 backdrop-blur-md border border-border/80 rounded-xl p-4 md:py-3 md:px-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-all duration-300 mb-6 shadow-md shadow-black/5">

        {/* Left Side: Radar Animation + Status Label */}
        <div className="flex items-center gap-3">
          {/* Concentric radar animation */}
          <div className="relative flex items-center justify-center w-9 h-9 shrink-0">
            <div className={`absolute inset-0 rounded-full ${theme.bgLight} ${rangeType === 'realtime' ? 'radar-ring-1' : 'opacity-40'}`} />
            <div className={`absolute inset-0 rounded-full ${theme.bgLight} ${rangeType === 'realtime' ? 'radar-ring-2' : 'hidden'}`} />
            <div className={`absolute inset-0 rounded-full ${theme.bgLight} ${rangeType === 'realtime' ? 'radar-ring-3' : 'hidden'}`} />
            <div className={`relative w-3 h-3 rounded-full ${theme.bg} border border-white dark:border-zinc-950 shadow-sm`} />
          </div>

          {/* Text: CHẾ ĐỘ XEM 30 phút qua */}
          <div className="flex items-center gap-1.5 text-sm sm:text-base leading-none">
            <span className="font-extrabold text-foreground tracking-wide uppercase">CHẾ ĐỘ XEM</span>
            <span className="text-muted-foreground font-normal lowercase">{data.rangeLabel}</span>
          </div>
        </div>

        {/* Right Side: Select Dropdown & Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 relative" ref={dropdownRef}>
            <span className="text-xs sm:text-sm font-semibold text-muted-foreground whitespace-nowrap">Chọn phạm vi:</span>

            {/* Custom Dropdown Trigger Button */}
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              disabled={isPending}
              className="h-10 px-3.5 flex items-center justify-between gap-2.5 rounded-xl border border-border/80 bg-background hover:bg-muted/30 text-sm shadow-sm transition-all focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50 font-medium cursor-pointer min-w-[200px]"
            >
              <div className="flex items-center gap-2">
                <IconComponent className={`w-4 h-4 ${currentOption.iconColor}`} />
                <span>{currentOption.label}</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Custom Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border bg-popover text-popover-foreground shadow-lg z-50 py-1.5 animate-in fade-in slide-in-from-top-1 duration-100">
                {rangeOptions.map((opt) => {
                  const OptIcon = opt.icon
                  const isSelected = opt.value === rangeType
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleSelectOption(opt.value)}
                      className={`w-full px-3.5 py-2 flex items-center gap-2.5 text-sm transition-colors text-left hover:bg-muted/80 ${isSelected ? 'bg-muted font-semibold text-foreground' : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                      <OptIcon className={`w-4 h-4 ${opt.iconColor}`} />
                      <span>{opt.label}</span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Custom Date Range Selectors */}
          {rangeType === 'custom' && (
            <div className="flex items-center gap-2 border-l border-border/50 pl-3 sm:ml-1 flex-wrap">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={isPending}
                className="h-10 w-[140px] rounded-xl border border-border/80 bg-background px-3 text-sm shadow-sm transition-all focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
              />
              <span className="text-xs text-muted-foreground">đến</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={isPending}
                className="h-10 w-[140px] rounded-xl border border-border/80 bg-background px-3 text-sm shadow-sm transition-all focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
              />
              <Button
                size="sm"
                disabled={isPending || !startDate || !endDate}
                onClick={handleFilterCustom}
                className="bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-sm h-10 px-4 rounded-xl text-xs"
              >
                Áp dụng
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Analytics Cards */}
      <AnalyticsCards kpis={data.kpis} rangeType={data.rangeType} rangeLabel={data.rangeLabel} />

      {/* Analytics Charts */}
      <AnalyticsCharts
        trafficTrend={data.charts.trafficTrend}
        userGrowth={data.charts.userGrowth}
        contentGrowth={data.charts.contentGrowth}
        countryShare={data.charts.countryShare}
        rangeType={data.rangeType}
        rangeLabel={data.rangeLabel}
      />

      {/* Page Stats Table */}
      <AnalyticsTable
        pageStats={data.charts.pageStats}
        qrStats={data.charts.qrStats}
        rangeType={data.rangeType}
        rangeLabel={data.rangeLabel}
      />
    </div>
  )
}
