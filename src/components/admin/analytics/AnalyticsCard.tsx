'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Users, Eye, Clock, BarChart3, Search, QrCode, TrendingUp, TrendingDown, RefreshCw
} from 'lucide-react'

import { RangeType } from '@/lib/admin-actions'

type Props = {
  kpis: {
    totalVisits: number
    activeToday: number
    activeThisMonth: number
    newVisitors: number
    returningVisitors: number
    avgTimeSeconds: number
    totalPageViews: number
    bounceRate: number
    totalSearches: number
    totalQrScans: number
  }
  rangeType: RangeType
  rangeLabel: string
}

export function AnalyticsCards({ kpis, rangeType, rangeLabel }: Props) {
  // Format seconds to mm:ss
  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}p ${seconds}s`
  }

  // Formatting large numbers with thousands separator
  const formatNumber = (num: number) => {
    return num?.toLocaleString('vi-VN') || '0'
  }

  const isRealtime = rangeType === 'realtime'

  const items = isRealtime
    ? [
      {
        title: `Người dùng hoạt động (${rangeLabel})`,
        value: formatNumber(kpis.activeToday),
        description: 'Số người dùng hoạt động hiện tại',
        icon: Users,
        trend: 'Realtime',
        trendUp: true,
        color: 'text-emerald-500'
      },
      {
        title: `Lượt xem trang (${rangeLabel})`,
        value: formatNumber(kpis.totalPageViews),
        description: 'Số lượt tải trang web',
        icon: Eye,
        trend: 'Realtime',
        trendUp: true,
        color: 'text-indigo-500'
      },
      {
        title: `Tổng số sự kiện (${rangeLabel})`,
        value: formatNumber(kpis.totalVisits),
        description: 'Tổng số tương tác người dùng',
        icon: BarChart3,
        trend: 'Realtime',
        trendUp: true,
        color: 'text-amber-500'
      },
      {
        title: `Lượt tìm kiếm (${rangeLabel})`,
        value: formatNumber(kpis.totalSearches),
        description: 'Tìm kiếm trên website',
        icon: Search,
        trend: 'Realtime',
        trendUp: true,
        color: 'text-yellow-500'
      },
      {
        title: `Lượt quét mã QR (${rangeLabel})`,
        value: formatNumber(kpis.totalQrScans),
        description: 'Số lượt truy cập từ QR',
        icon: QrCode,
        trend: 'Realtime',
        trendUp: true,
        color: 'text-pink-500'
      }
    ]
    : [
      {
        title: `Lượt truy cập (${rangeLabel})`,
        value: formatNumber(kpis.totalVisits),
        description: 'Tổng số phiên hoạt động',
        icon: BarChart3,
        trend: 'Đã lưu',
        trendUp: true,
        color: 'text-amber-500'
      },
      {
        title: `Người dùng hoạt động (${rangeLabel})`,
        value: formatNumber(kpis.activeToday),
        description: 'Khách truy cập duy nhất',
        icon: Users,
        trend: 'Đã lưu',
        trendUp: true,
        color: 'text-emerald-500'
      },
      {
        title: `Khách mới / Quay lại (${rangeLabel})`,
        value: `${formatNumber(kpis.newVisitors)} / ${formatNumber(kpis.returningVisitors)}`,
        description: 'Tỷ lệ khách mới và quay lại',
        icon: RefreshCw,
        trend: 'Đã lưu',
        trendUp: true,
        color: 'text-cyan-500'
      },
      {
        title: `Lượt xem trang (${rangeLabel})`,
        value: formatNumber(kpis.totalPageViews),
        description: 'Số lượt tải trang web',
        icon: Eye,
        trend: 'Đã lưu',
        trendUp: true,
        color: 'text-indigo-500'
      },
      {
        title: `Thời gian TB trên web (${rangeLabel})`,
        value: formatTime(kpis.avgTimeSeconds),
        description: 'Thời lượng một phiên TB',
        icon: Clock,
        trend: 'Đã lưu',
        trendUp: true,
        color: 'text-purple-500'
      },
      {
        title: `Lượt tìm kiếm (${rangeLabel})`,
        value: formatNumber(kpis.totalSearches),
        description: 'Tìm kiếm trên website',
        icon: Search,
        trend: 'Đã lưu',
        trendUp: true,
        color: 'text-yellow-500'
      },
      {
        title: `Lượt quét mã QR (${rangeLabel})`,
        value: formatNumber(kpis.totalQrScans),
        description: 'Số lượt truy cập từ QR',
        icon: QrCode,
        trend: 'Đã lưu',
        trendUp: true,
        color: 'text-pink-500'
      }
    ]

  const gridClass = isRealtime ? 'grid grid-cols-1 sm:grid-cols-6 gap-5' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-5'

  // Non-realtime cards are laid out on a 2-col (sm) / 12-unit (lg, 3 units = 1 "visual" column)
  // grid so an incomplete last row spreads evenly across the full width instead of leaving a gap.
  const smLastRowSpan: Record<number, string> = { 1: 'sm:col-span-2' }
  const lgLastRowSpan: Record<number, string> = { 1: 'lg:col-span-12', 2: 'lg:col-span-6', 3: 'lg:col-span-4' }
  const smRemainder = items.length % 2
  const lgRemainder = items.length % 4

  return (
    <div className={gridClass}>
      {items.map((item, index) => {
        const Icon = item.icon
        let spanClass = ''
        if (isRealtime) {
          spanClass = index < 3 ? 'sm:col-span-2' : 'sm:col-span-3'
        } else {
          const isSmLastRow = smRemainder !== 0 && index >= items.length - smRemainder
          const isLgLastRow = lgRemainder !== 0 && index >= items.length - lgRemainder
          spanClass = [
            isSmLastRow ? smLastRowSpan[smRemainder] : '',
            isLgLastRow ? lgLastRowSpan[lgRemainder] : 'lg:col-span-3',
          ].filter(Boolean).join(' ')
        }
        return (
          <Card key={index} className={`hover:border-primary/30 transition-all duration-300 shadow-sm hover:shadow-md ${spanClass}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-base font-semibold text-muted-foreground">
                {item.title}
              </CardTitle>
              <Icon className={`w-5 h-5 ${item.color}`} />
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-4xl font-bold tracking-tight">{item.value}</div>
              <div className="flex items-center gap-1.5 pt-1">
                <span className="text-sm text-muted-foreground">{item.description}</span>
                <span className={`text-xs font-bold flex items-center ml-auto px-2.5 py-0.5 rounded-full ${item.trendUp
                    ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                    : 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400'
                  }`}>
                  {item.trendUp ? <TrendingUp className="w-3.5 h-3.5 mr-1" /> : <TrendingDown className="w-3.5 h-3.5 mr-1" />}
                  {item.trend}
                </span>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
