'use server'

import { auth } from '@/auth'
import crypto from 'crypto'
import { db } from '@/lib/db'
import { getContentCreatedAtStats } from '@/lib/repos/analytics'
import * as pagesRepo from '@/lib/repos/pages'
import * as postsRepo from '@/lib/repos/posts'
import * as mapRepo from '@/lib/repos/map'
import * as settingsRepo from '@/lib/repos/settings'

// ── Types & Interfaces for Analytics ─────────────────────────────────────────

export type RangeType = 'realtime' | 'today' | '7days' | '30days' | 'custom'

export type AnalyticsPayload = {
  errorMsg?: string | null
  rangeType: RangeType
  rangeLabel: string
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
  charts: {
    trafficTrend: Array<{ date: string; visits: number; users: number }>
    userGrowth: Array<{ date: string; totalUsers: number }>
    contentGrowth: Array<{ month: string; pages: number; blogs: number; locations: number }>
    countryShare: Array<{ country: string; count: number; percentage: number }>
    pageStats: Array<{ path: string; views: number; percentage: number }>
    qrStats: Array<{ path: string; scans: number; percentage: number }>
  }
}

interface GA4DimensionValue {
  value?: string
}

interface GA4MetricValue {
  value?: string
}

interface GA4Row {
  dimensionValues?: GA4DimensionValue[] | null
  metricValues?: GA4MetricValue[] | null
}

// ── Service Account JWT Helpers for GA4 ───────────────────────────────────────

function generateJWT(clientEmail: string, privateKey: string): string {
  const formattedKey = privateKey.replace(/\\n/g, '\n')

  const header = {
    alg: 'RS256',
    typ: 'JWT',
  }

  const now = Math.floor(Date.now() / 1000)
  const claim = {
    iss: clientEmail,
    scope: 'https://www.googleapis.com/auth/analytics.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  }

  const base64Header = Buffer.from(JSON.stringify(header)).toString('base64url')
  const base64Claim = Buffer.from(JSON.stringify(claim)).toString('base64url')

  const signatureInput = `${base64Header}.${base64Claim}`
  const signer = crypto.createSign('RSA-SHA256')
  signer.update(signatureInput)
  const signature = signer.sign(formattedKey, 'base64url')

  return `${signatureInput}.${signature}`
}

async function getAccessToken(clientEmail: string, privateKey: string): Promise<string> {
  const jwt = generateJWT(clientEmail, privateKey)
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
    next: { revalidate: 3600 }
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Failed to get Google access token: ${errText}`)
  }

  const data = await res.json()
  return data.access_token as string
}

async function runGA4Report(accessToken: string, propertyId: string, payload: unknown) {
  const res = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runRealtimeReport`, { // 1. Đổi thành runRealtimeReport
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    next: { revalidate: 30 } // 2. Cache 30 giây để tránh bị bóp băng thông (Rate Limit) từ Google API khi F5 liên tục
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`GA4 API error: ${errText}`)
  }

  return res.json()
}

async function runGA4StandardReport(accessToken: string, propertyId: string, payload: unknown) {
  const res = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    next: { revalidate: 30 }
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`GA4 API error: ${errText}`)
  }

  return res.json()
}

// ── Server Action: Fetch GA4 & DB Analytics Data ─────────────────────────────

export async function getAnalyticsData(
  rangeType: RangeType = 'realtime',
  customStartDate?: string,
  customEndDate?: string
): Promise<AnalyticsPayload> {
  // 1. Fetch content statistics from the local database
  const contentStats = await getContentCreatedAtStats()

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const contentGrowthMap: Record<string, { pages: number; blogs: number; locations: number }> = {}

  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`
    contentGrowthMap[key] = { pages: 0, blogs: 0, locations: 0 }
  }

  const addContentToTimeline = (createdAtStr: string | null, type: 'pages' | 'blogs' | 'locations') => {
    if (!createdAtStr) return
    const date = new Date(createdAtStr)
    Object.keys(contentGrowthMap).forEach((monthKey) => {
      const [mName, yStr] = monthKey.split(' ')
      const mIdx = monthNames.indexOf(mName)
      const yVal = parseInt(yStr, 10)
      const keyDate = new Date(yVal, mIdx, 1)
      if (date <= new Date(keyDate.getFullYear(), keyDate.getMonth() + 1, 0)) {
        contentGrowthMap[monthKey][type]++
      }
    })
  }

  contentStats.pages.forEach((p) => addContentToTimeline(p.created_at, 'pages'))
  contentStats.posts.forEach((b) => addContentToTimeline(b.created_at, 'blogs'))
  contentStats.mapLocations.forEach((l) => addContentToTimeline(l.created_at, 'locations'))

  const contentGrowth = Object.entries(contentGrowthMap).map(([month, stats]) => ({
    month,
    ...stats
  }))

  // 2. Query GA4 API if credentials are set
  const propertyId = process.env.GA_PROPERTY_ID
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')

  const fallbackResult = (errorMsg: string): AnalyticsPayload => ({
    errorMsg,
    rangeType,
    rangeLabel: '',
    kpis: {
      totalVisits: 0,
      activeToday: 0,
      activeThisMonth: 0,
      newVisitors: 0,
      returningVisitors: 0,
      avgTimeSeconds: 0,
      totalPageViews: 0,
      bounceRate: 0,
      totalSearches: 0,
      totalQrScans: 0,
    },
    charts: {
      trafficTrend: [],
      userGrowth: [],
      contentGrowth,
      countryShare: [],
      pageStats: [],
      qrStats: [],
    }
  })

  if (!propertyId || !clientEmail || !privateKey) {
    return fallbackResult('Thiếu cấu hình Google Analytics 4 (GA_PROPERTY_ID, GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY) trong file .env.local.')
  }

  try {
    const accessToken = await getAccessToken(clientEmail, privateKey)

    if (rangeType === 'realtime') {
      // ────────── REALTIME REPORTING PATH ──────────
      const kpisReportPromise = runGA4Report(accessToken, propertyId, {
        metrics: [
          { name: 'activeUsers' },
          { name: 'screenPageViews' },
          { name: 'eventCount' }
        ]
      })

      const customEventsPromise = runGA4Report(accessToken, propertyId, {
        dimensions: [{ name: 'eventName' }],
        metrics: [{ name: 'eventCount' }]
      })

      const trendReportPromise = runGA4Report(accessToken, propertyId, {
        dimensions: [{ name: 'minutesAgo' }],
        metrics: [{ name: 'activeUsers' }, { name: 'eventCount' }],
        orderBys: [{ dimension: { dimensionName: 'minutesAgo' }, desc: true }]
      })

      const countryReportPromise = runGA4Report(accessToken, propertyId, {
        dimensions: [{ name: 'country' }],
        metrics: [{ name: 'activeUsers' }],
        orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
        limit: 5
      })

      const pagesReportPromise = runGA4Report(accessToken, propertyId, {
        dimensions: [{ name: 'unifiedScreenName' }],
        metrics: [{ name: 'screenPageViews' }],
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        limit: 20
      })

      const [
        kpisReport,
        customEventsReport,
        trendReport,
        countryReport,
        pagesReport
      ] = await Promise.all([
        kpisReportPromise,
        customEventsPromise,
        trendReportPromise,
        countryReportPromise,
        pagesReportPromise
      ])

      const kpiValues = kpisReport.rows?.[0]?.metricValues || []
      const activeToday = parseInt(kpiValues[0]?.value || '0', 10)
      const totalPageViews = parseInt(kpiValues[1]?.value || '0', 10)
      const totalVisits = parseInt(kpiValues[2]?.value || '0', 10)

      const activeThisMonth = activeToday
      const newVisitors = 0
      const returningVisitors = 0
      const avgTimeSeconds = 0
      const bounceRate = 0

      let totalSearches = 0
      let totalQrScans = 0
      customEventsReport.rows?.forEach((row: GA4Row) => {
        const eName = row.dimensionValues?.[0]?.value
        const eCount = parseInt(row.metricValues?.[0]?.value || '0', 10)
        if (eName === 'view_search_results' || eName === 'search') {
          totalSearches += eCount
        } else if (eName === 'qr_scan') {
          totalQrScans += eCount
        }
      })

      const trafficTrend = (trendReport.rows || []).map((row: GA4Row) => {
        const minutesAgo = row.dimensionValues?.[0]?.value || '0'
        return {
          date: `${minutesAgo}p trước`,
          visits: parseInt(row.metricValues?.[1]?.value || '0', 10),
          users: parseInt(row.metricValues?.[0]?.value || '0', 10)
        }
      })

      let cumulative = 0
      const userGrowth = trafficTrend.map((t: { date: string; visits: number; users: number }) => {
        cumulative += t.users
        return {
          date: t.date,
          totalUsers: cumulative
        }
      })

      const rawCountries = countryReport.rows || []
      const countryTotalVisits = rawCountries.reduce((acc: number, row: GA4Row) => acc + parseInt(row.metricValues?.[0]?.value || '0', 10), 0)
      const countryShare = rawCountries.map((row: GA4Row) => {
        const count = parseInt(row.metricValues?.[0]?.value || '0', 10)
        return {
          country: row.dimensionValues?.[0]?.value || 'Khác',
          count,
          percentage: countryTotalVisits > 0 ? parseFloat(((count / countryTotalVisits) * 100).toFixed(1)) : 0
        }
      })

      const rawPages = pagesReport.rows || []
      const pageTotalViews = rawPages.reduce((acc: number, row: GA4Row) => acc + parseInt(row.metricValues?.[0]?.value || '0', 10), 0)
      const pageStats = rawPages.map((row: GA4Row) => {
        const views = parseInt(row.metricValues?.[0]?.value || '0', 10)
        return {
          path: row.dimensionValues?.[0]?.value || '/',
          views,
          percentage: pageTotalViews > 0 ? parseFloat(((views / pageTotalViews) * 100).toFixed(1)) : 0
        }
      })

      const qrStats: Array<{ path: string; scans: number; percentage: number }> = []

      return {
        rangeType,
        rangeLabel: '30 phút qua',
        kpis: {
          totalVisits,
          activeToday,
          activeThisMonth,
          newVisitors,
          returningVisitors,
          avgTimeSeconds,
          totalPageViews,
          bounceRate,
          totalSearches,
          totalQrScans
        },
        charts: {
          trafficTrend,
          userGrowth,
          contentGrowth,
          countryShare,
          pageStats,
          qrStats
        }
      }
    } else {
      // ────────── HISTORICAL STANDARD REPORT PATH ──────────
      let startDate = '30daysAgo'
      let endDate = 'today'
      let rangeLabel = '30 ngày qua'

      if (rangeType === 'today') {
        startDate = 'today'
        endDate = 'today'
        rangeLabel = 'Hôm nay'
      } else if (rangeType === '7days') {
        startDate = '7daysAgo'
        endDate = 'today'
        rangeLabel = '7 ngày qua'
      } else if (rangeType === '30days') {
        startDate = '30daysAgo'
        endDate = 'today'
        rangeLabel = '30 ngày qua'
      } else if (rangeType === 'custom') {
        startDate = customStartDate || '30daysAgo'
        endDate = customEndDate || 'today'
        const formatDate = (dateStr: string) => {
          const parts = dateStr.split('-')
          return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateStr
        }
        rangeLabel = `${formatDate(startDate)} - ${formatDate(endDate)}`
      }

      const dateRanges = [{ startDate, endDate }]

      const kpisReportPromise = runGA4StandardReport(accessToken, propertyId, {
        dateRanges,
        metrics: [
          { name: 'sessions' },
          { name: 'activeUsers' },
          { name: 'newUsers' },
          { name: 'screenPageViews' },
          { name: 'bounceRate' },
          { name: 'averageSessionDuration' }
        ]
      })

      const customEventsPromise = runGA4StandardReport(accessToken, propertyId, {
        dateRanges,
        dimensions: [{ name: 'eventName' }],
        metrics: [{ name: 'eventCount' }]
      })

      const trendReportPromise = runGA4StandardReport(accessToken, propertyId, {
        dateRanges,
        dimensions: [{ name: 'date' }],
        metrics: [{ name: 'sessions' }, { name: 'activeUsers' }],
        orderBys: [{ dimension: { dimensionName: 'date' } }]
      })

      const countryReportPromise = runGA4StandardReport(accessToken, propertyId, {
        dateRanges,
        dimensions: [{ name: 'country' }],
        metrics: [{ name: 'sessions' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 5
      })

      const pagesReportPromise = runGA4StandardReport(accessToken, propertyId, {
        dateRanges,
        dimensions: [{ name: 'pagePath' }],
        metrics: [{ name: 'screenPageViews' }],
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        limit: 20
      })

      const qrReportPromise = runGA4StandardReport(accessToken, propertyId, {
        dateRanges,
        dimensions: [{ name: 'pagePath' }],
        metrics: [{ name: 'eventCount' }],
        dimensionFilter: {
          filter: {
            fieldName: 'eventName',
            stringFilter: {
              value: 'qr_scan'
            }
          }
        },
        limit: 20
      }).catch(err => {
        console.error('Error fetching standard QR stats:', err)
        return null
      })

      const [
        kpisReport,
        customEventsReport,
        trendReport,
        countryReport,
        pagesReport,
        qrReport
      ] = await Promise.all([
        kpisReportPromise,
        customEventsPromise,
        trendReportPromise,
        countryReportPromise,
        pagesReportPromise,
        qrReportPromise
      ])

      const kpiValues = kpisReport.rows?.[0]?.metricValues || []
      const totalVisits = parseInt(kpiValues[0]?.value || '0', 10)
      const activeToday = parseInt(kpiValues[1]?.value || '0', 10)
      const newVisitors = parseInt(kpiValues[2]?.value || '0', 10)
      const totalPageViews = parseInt(kpiValues[3]?.value || '0', 10)
      const bounceRate = parseFloat(kpiValues[4]?.value || '0') * 100
      const avgTimeSeconds = Math.round(parseFloat(kpiValues[5]?.value || '0'))

      const activeThisMonth = activeToday
      const returningVisitors = Math.max(0, activeThisMonth - newVisitors)

      let totalSearches = 0
      let totalQrScans = 0
      customEventsReport.rows?.forEach((row: GA4Row) => {
        const eName = row.dimensionValues?.[0]?.value
        const eCount = parseInt(row.metricValues?.[0]?.value || '0', 10)
        if (eName === 'view_search_results' || eName === 'search') {
          totalSearches += eCount
        } else if (eName === 'qr_scan') {
          totalQrScans += eCount
        }
      })

      const trafficTrend = (trendReport.rows || []).map((row: GA4Row) => {
        const rawDate = row.dimensionValues?.[0]?.value || ''
        const day = rawDate.substring(6, 8)
        const month = rawDate.substring(4, 6)
        return {
          date: `${day}/${month}`,
          visits: parseInt(row.metricValues?.[0]?.value || '0', 10), // sessions
          users: parseInt(row.metricValues?.[1]?.value || '0', 10)  // activeUsers
        }
      })

      let cumulative = Math.max(0, activeThisMonth - 2000)
      const userGrowth = trafficTrend.map((t: { date: string; visits: number; users: number }) => {
        cumulative += Math.round(t.users * 0.15)
        return {
          date: t.date,
          totalUsers: cumulative
        }
      })

      const rawCountries = countryReport.rows || []
      const countryTotalVisits = rawCountries.reduce((acc: number, row: GA4Row) => acc + parseInt(row.metricValues?.[0]?.value || '0', 10), 0)
      const countryShare = rawCountries.map((row: GA4Row) => {
        const count = parseInt(row.metricValues?.[0]?.value || '0', 10)
        return {
          country: row.dimensionValues?.[0]?.value || 'Khác',
          count,
          percentage: countryTotalVisits > 0 ? parseFloat(((count / countryTotalVisits) * 100).toFixed(1)) : 0
        }
      })

      const rawPages = pagesReport.rows || []
      const pageTotalViews = rawPages.reduce((acc: number, row: GA4Row) => acc + parseInt(row.metricValues?.[0]?.value || '0', 10), 0)
      const pageStats = rawPages.map((row: GA4Row) => {
        const views = parseInt(row.metricValues?.[0]?.value || '0', 10)
        return {
          path: row.dimensionValues?.[0]?.value || '/',
          views,
          percentage: pageTotalViews > 0 ? parseFloat(((views / pageTotalViews) * 100).toFixed(1)) : 0
        }
      })

      const rawQr = qrReport?.rows || []
      const qrTotalScans = rawQr.reduce((acc: number, row: GA4Row) => acc + parseInt(row.metricValues?.[0]?.value || '0', 10), 0)
      const qrStats = rawQr.map((row: GA4Row) => {
        const scans = parseInt(row.metricValues?.[0]?.value || '0', 10)
        return {
          path: row.dimensionValues?.[0]?.value || '/',
          scans,
          percentage: qrTotalScans > 0 ? parseFloat(((scans / qrTotalScans) * 100).toFixed(1)) : 0
        }
      })

      return {
        rangeType,
        rangeLabel,
        kpis: {
          totalVisits,
          activeToday,
          activeThisMonth,
          newVisitors,
          returningVisitors,
          avgTimeSeconds,
          totalPageViews,
          bounceRate: parseFloat(bounceRate.toFixed(1)),
          totalSearches,
          totalQrScans
        },
        charts: {
          trafficTrend,
          userGrowth,
          contentGrowth,
          countryShare,
          pageStats,
          qrStats
        }
      }
    }
  } catch (err: unknown) {
    console.error('Error fetching GA4 reports:', err)
    return {
      errorMsg: err instanceof Error ? err.message : 'Có lỗi xảy ra khi kết nối API GA4.',
      rangeType,
      rangeLabel: '',
      kpis: {
        totalVisits: 0,
        activeToday: 0,
        activeThisMonth: 0,
        newVisitors: 0,
        returningVisitors: 0,
        avgTimeSeconds: 0,
        totalPageViews: 0,
        bounceRate: 0,
        totalSearches: 0,
        totalQrScans: 0,
      },
      charts: {
        trafficTrend: [],
        userGrowth: [],
        contentGrowth,
        countryShare: [],
        pageStats: [],
        qrStats: [],
      }
    }
  }
}

// ── Server Actions: Accounts Management ───────────────────────────────────────

export async function getAccounts() {
  const session = await auth()
  if (!session?.user) throw new Error('Chưa đăng nhập')

  return [{
    id: 'admin',
    email: process.env.ADMIN_EMAIL || session.user.email || '',
    role: 'admin',
    display_name: 'Admin',
    raw_password: null,
    created_at: new Date(0).toISOString(),
  }]
}

export async function saveAccount(data: {
  id?: string // Empty for create
  email: string
  password?: string // Required for create, optional for update
  displayName: string
  role: 'admin' | 'edit'
}) {
  const session = await auth()
  if (!session?.user) return { error: 'Chưa đăng nhập' }
  void data
  return { error: 'Hệ thống hiện dùng một tài khoản admin cố định qua biến môi trường. Vui lòng cập nhật ADMIN_EMAIL và ADMIN_PASSWORD_HASH để đổi thông tin đăng nhập.' }
}

export async function deleteAccount(id: string) {
  const session = await auth()
  if (!session?.user) return { error: 'Chưa đăng nhập' }
  void id
  return { error: 'Không thể xóa tài khoản admin cố định được cấu hình bằng biến môi trường.' }
}

export async function getActivityLogs(userId?: string) {
  const session = await auth()
  if (!session?.user) throw new Error('Chưa đăng nhập')

  const result = userId
    ? await db.query('select * from public.activity_logs where user_id = $1 order by created_at desc', [userId])
    : await db.query('select * from public.activity_logs order by created_at desc')

  return result.rows
}

async function requireAdmin() {
  const session = await auth()
  if (!session?.user) throw new Error('Chưa đăng nhập')
}

export async function getAdminPages() {
  await requireAdmin()
  return pagesRepo.getAdminPages()
}

export async function getAdminPageBySlug(slug: string) {
  await requireAdmin()
  return pagesRepo.getPageBySlugWithBlocks(slug)
}

export async function createPage(input: pagesRepo.PageInput) {
  await requireAdmin()
  return pagesRepo.createPage(input)
}

export async function updatePage(id: string, input: pagesRepo.PageInput) {
  await requireAdmin()
  return pagesRepo.updatePage(id, input)
}

export async function deletePage(id: string) {
  await requireAdmin()
  return pagesRepo.deletePage(id)
}

export async function createBlock(input: pagesRepo.BlockInput) {
  await requireAdmin()
  return pagesRepo.createBlock(input)
}

export async function updateBlock(id: string, input: pagesRepo.BlockInput) {
  await requireAdmin()
  return pagesRepo.updateBlock(id, input)
}

export async function deleteBlock(id: string) {
  await requireAdmin()
  return pagesRepo.deleteBlock(id)
}

export async function duplicatePage(id: string, input: pagesRepo.PageInput) {
  await requireAdmin()
  return pagesRepo.duplicatePage(id, input)
}

export async function reorderBlocks(orderedBlocks: Array<{ id: string; sort_order: number }>) {
  await requireAdmin()
  return pagesRepo.reorderBlocks(orderedBlocks)
}

export async function getAdminPosts() {
  await requireAdmin()
  return postsRepo.getAdminPosts()
}

export async function getAdminPostById(id: string) {
  await requireAdmin()
  return postsRepo.getAdminPostById(id)
}

export async function createPost(input: postsRepo.PostInput) {
  await requireAdmin()
  return postsRepo.createPost(input)
}

export async function updatePost(id: string, input: postsRepo.PostInput) {
  await requireAdmin()
  return postsRepo.updatePost(id, input)
}

export async function deletePost(id: string) {
  await requireAdmin()
  return postsRepo.deletePost(id)
}

export async function getAdminPostBySlug(slug: string) {
  await requireAdmin()
  return postsRepo.getAdminPostBySlug(slug)
}

export async function duplicatePost(id: string, slug: string, title: unknown) {
  await requireAdmin()
  return postsRepo.duplicatePost(id, slug, title)
}

export async function getPostCategories() {
  await requireAdmin()
  return postsRepo.getPostCategories()
}

export async function createPostCategory(input: postsRepo.PostCategoryInput) {
  await requireAdmin()
  return postsRepo.createPostCategory(input)
}

export async function deletePostCategory(id: string) {
  await requireAdmin()
  return postsRepo.deletePostCategory(id)
}

export async function getAdminMapData() {
  await requireAdmin()
  const [locations, categories, pages] = await Promise.all([
    mapRepo.getAdminMapLocations(),
    mapRepo.getLocationCategories(),
    pagesRepo.getAdminPages(),
  ])
  return { locations, categories, pages: pages.filter((page) => page.is_published) }
}

export async function createMapLocation(input: mapRepo.MapLocationInput) {
  await requireAdmin()
  return mapRepo.createMapLocation(input)
}

export async function updateMapLocation(id: string, input: mapRepo.MapLocationInput) {
  await requireAdmin()
  return mapRepo.updateMapLocation(id, input)
}

export async function deleteMapLocation(id: string) {
  await requireAdmin()
  return mapRepo.deleteMapLocation(id)
}

export async function createLocationCategory(input: mapRepo.LocationCategoryInput) {
  await requireAdmin()
  return mapRepo.createLocationCategory(input)
}

export async function getLocationCategories() {
  await requireAdmin()
  return mapRepo.getLocationCategories()
}

export async function getAdminSettings() {
  await requireAdmin()
  return settingsRepo.getAdminSettings()
}

export async function setAdminSettings(settings: settingsRepo.SiteSettings) {
  await requireAdmin()
  return settingsRepo.setAdminSettings(settings)
}

export async function getAdminBlogSettings() {
  await requireAdmin()
  return settingsRepo.getSetting('blog_settings')
}

export async function setAdminBlogSettings(value: unknown) {
  await requireAdmin()
  return settingsRepo.setBlogSettings(value)
}
