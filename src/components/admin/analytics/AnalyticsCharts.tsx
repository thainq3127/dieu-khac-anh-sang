'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Globe, TrendingUp, BookOpen, Layers } from 'lucide-react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts'

import { RangeType } from '@/lib/admin-actions'

type TrafficData = { date: string; visits: number; users: number }
type UserGrowthData = { date: string; totalUsers: number }
type ContentGrowthData = { month: string; pages: number; blogs: number; locations: number }
type CountryData = { country: string; count: number; percentage: number }

type Props = {
  trafficTrend: TrafficData[]
  userGrowth: UserGrowthData[]
  contentGrowth: ContentGrowthData[]
  countryShare: CountryData[]
  rangeType: RangeType
  rangeLabel: string
}

export function AnalyticsCharts({
  trafficTrend,
  userGrowth,
  contentGrowth,
  countryShare,
  rangeType,
  rangeLabel
}: Props) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    Promise.resolve().then(() => {
      setMounted(true)
    })
  }, [])

  if (!mounted) {
    const loadingFallback = (
      <div className="w-full h-[240px] flex items-center justify-center text-xs text-muted-foreground bg-muted/10 border border-dashed rounded-lg">
        Đang tải biểu đồ...
      </div>
    )
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card><CardHeader><CardTitle className="text-base">Lượt truy cập & Người dùng</CardTitle></CardHeader><CardContent className="h-60">{loadingFallback}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base">Tăng trưởng người dùng</CardTitle></CardHeader><CardContent className="h-60">{loadingFallback}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base">Tăng trưởng nội dung</CardTitle></CardHeader><CardContent className="h-60">{loadingFallback}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base">Phân bố khách theo quốc gia</CardTitle></CardHeader><CardContent className="h-60">{loadingFallback}</CardContent></Card>
      </div>
    )
  }

  // Custom styling for Tooltip to fit premium dashboard look
  const tooltipStyle = {
    contentStyle: {
      backgroundColor: 'var(--card)',
      borderColor: 'var(--border)',
      borderRadius: '8px',
      fontSize: '12px',
      color: 'var(--foreground)'
    },
    itemStyle: {
      padding: '2px 0'
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Lượt truy cập & Người dùng (Area Chart) */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-500" />
            Lượt truy cập & Người dùng
          </CardTitle>
          <CardDescription>
            {rangeType === 'realtime'
              ? 'Số lượt sự kiện (visits) và người dùng hoạt động (users) trong 30 phút qua'
              : `Số lượt truy cập (sessions) và người dùng hoạt động trong ${rangeLabel}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="h-60 p-4">
          {trafficTrend.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground bg-muted/10 border border-dashed rounded-lg">
              Không có dữ liệu
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(226, 232, 240, 0.1)" />
                <XAxis dataKey="date" tickLine={false} tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
                <YAxis tickLine={false} tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
                <Tooltip contentStyle={tooltipStyle.contentStyle} itemStyle={tooltipStyle.itemStyle} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                <Area name="Lượt truy cập" type="monotone" dataKey="visits" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorVisits)" />
                <Area name="Người dùng" type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorUsers)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* 2. Tăng trưởng người dùng (Area Chart) */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            Tăng trưởng người dùng
          </CardTitle>
          <CardDescription>
            {rangeType === 'realtime'
              ? 'Tổng số lượng người dùng tích lũy trong 30 phút qua'
              : `Tổng số lượng người dùng tích lũy trong ${rangeLabel}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="h-60 p-4">
          {userGrowth.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground bg-muted/10 border border-dashed rounded-lg">
              Không có dữ liệu
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={userGrowth} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(226, 232, 240, 0.1)" />
                <XAxis dataKey="date" tickLine={false} tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
                <YAxis tickLine={false} tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
                <Tooltip contentStyle={tooltipStyle.contentStyle} itemStyle={tooltipStyle.itemStyle} />
                <Area name="Tổng người dùng" type="monotone" dataKey="totalUsers" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorGrowth)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* 3. Tăng trưởng nội dung (Bar Chart) */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-500" />
            Tăng trưởng nội dung
          </CardTitle>
          <CardDescription>Số lượng trang di sản, blogs, địa điểm phát triển trong CSDL</CardDescription>
        </CardHeader>
        <CardContent className="h-60 p-4">
          {contentGrowth.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground bg-muted/10 border border-dashed rounded-lg">
              Không có dữ liệu
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={contentGrowth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(226, 232, 240, 0.1)" />
                <XAxis dataKey="month" tickLine={false} tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
                <YAxis tickLine={false} tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
                <Tooltip contentStyle={tooltipStyle.contentStyle} itemStyle={tooltipStyle.itemStyle} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                <Bar name="Trang di sản" dataKey="pages" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar name="Bài viết Blog" dataKey="blogs" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar name="Địa điểm bản đồ" dataKey="locations" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* 4. Phân bố khách theo quốc gia (Horizontal Bar Chart) */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="w-4 h-4 text-indigo-500" />
            Phân bố khách theo quốc gia
          </CardTitle>
          <CardDescription>Số lượng người dùng hoạt động theo quốc gia ({rangeLabel})</CardDescription>
        </CardHeader>
        <CardContent className="h-60 p-4">
          {countryShare.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground bg-muted/10 border border-dashed rounded-lg">
              Không có dữ liệu
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={countryShare}
                layout="vertical"
                margin={{ top: 10, right: 20, left: 20, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(226, 232, 240, 0.1)" horizontal={false} />
                <XAxis type="number" tickLine={false} tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
                <YAxis
                  dataKey="country"
                  type="category"
                  tickLine={false}
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                  width={80}
                />
                <Tooltip contentStyle={tooltipStyle.contentStyle} itemStyle={tooltipStyle.itemStyle} />
                <Bar name="Lượt truy cập" dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
