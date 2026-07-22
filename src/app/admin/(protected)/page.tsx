import { getAnalyticsData } from '@/lib/admin-actions'
import DashboardClient from '@/components/admin/analytics/DashboardClient'
import { AlertCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function DashboardPage() {
  const data = await getAnalyticsData('realtime')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Admin CMS</p>
        </div>
      </div>

      {data.errorMsg && (
        <div className="flex items-start gap-2 text-xs text-destructive bg-destructive/10 border border-destructive/20 px-4 py-3 rounded-md">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{data.errorMsg}</span>
        </div>
      )}

      <DashboardClient initialData={data} />
    </div>
  )
}
