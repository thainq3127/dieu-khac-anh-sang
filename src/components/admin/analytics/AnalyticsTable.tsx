'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { FileText, ExternalLink, QrCode } from 'lucide-react'
import Link from 'next/link'
import { RangeType } from '@/lib/admin-actions'

type PageStat = {
  path: string
  views: number
  percentage: number
}

type QrStat = {
  path: string
  scans: number
  percentage: number
}

type Props = {
  pageStats: PageStat[]
  qrStats: QrStat[]
  rangeType: RangeType
  rangeLabel: string
}

export function AnalyticsTable({ pageStats, qrStats = [], rangeType, rangeLabel }: Props) {
  const [activeTab, setActiveTab] = useState<'views' | 'qr'>('views')
  const isRealtime = rangeType === 'realtime'

  const currentData = activeTab === 'views' ? pageStats : qrStats

  return (
    <Card className="overflow-hidden border border-border/80">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-4">
        <div>
          <CardTitle className="text-base flex items-center gap-2 text-foreground font-bold">
            {activeTab === 'views' ? (
              <FileText className="w-4 h-4 text-amber-500" />
            ) : (
              <QrCode className="w-4 h-4 text-amber-500" />
            )}
            {activeTab === 'views' ? 'Thống kê truy cập chi tiết' : 'Thống kê quét mã QR chi tiết'}
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-muted-foreground font-normal">
            Danh sách trang có hoạt động cao nhất trong {rangeLabel} (Tối đa 20 trang)
          </CardDescription>
        </div>

        {/* Tab Switcher Pills */}
        <div className="flex bg-muted/60 p-1 rounded-xl border border-border/80 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('views')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'views'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Lượt xem trang
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('qr')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'qr'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Lượt quét QR
          </button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {currentData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground text-sm">
            {activeTab === 'views' ? 'Không có dữ liệu lượt xem trang' : 'Không có dữ liệu lượt quét mã QR'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs font-bold text-muted-foreground">
                    {isRealtime ? 'Tiêu đề trang (Page Title)' : 'Đường dẫn trang (Path)'}
                  </TableHead>
                  <TableHead className="w-32 text-right text-xs font-bold text-muted-foreground">
                    {activeTab === 'views' ? 'Lượt xem (Views)' : 'Lượt quét (Scans)'}
                  </TableHead>
                  <TableHead className="w-48 sm:w-56 text-right text-xs font-bold text-muted-foreground">
                    {activeTab === 'views' ? 'Tỷ lệ xem' : 'Tỷ lệ quét'}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentData.map((page, idx) => {
                  const count = 'views' in page ? page.views : page.scans
                  return (
                    <TableRow key={idx} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium text-xs max-w-[200px] sm:max-w-none truncate sm:whitespace-normal">
                        {isRealtime ? (
                          <span className="inline-flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            <span className="truncate">{page.path}</span>
                          </span>
                        ) : (
                          <Link
                            href={page.path}
                            target="_blank"
                            rel="noopener"
                            className="inline-flex items-center gap-1 hover:text-amber-500 transition-colors font-mono"
                          >
                            <span className="truncate">{page.path}</span>
                            <ExternalLink className="w-3 h-3 text-muted-foreground shrink-0" />
                          </Link>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-sm">
                        {count.toLocaleString('vi-VN')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-3">
                          <div className="w-16 sm:w-24 h-1.5 rounded bg-muted overflow-hidden shrink-0">
                            <div
                              className="h-full bg-amber-500 rounded"
                              style={{ width: `${page.percentage}%` }}
                            />
                          </div>
                          <span className="text-xs font-mono text-muted-foreground min-w-[36px] text-right">
                            {page.percentage}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

