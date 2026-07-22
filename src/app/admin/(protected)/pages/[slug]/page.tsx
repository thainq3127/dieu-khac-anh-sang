'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  createBlock,
  deleteBlock as deleteBlockAction,
  getAdminPageBySlug,
  reorderBlocks,
  updateBlock,
} from '@/lib/admin-actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import {
  ArrowLeft, Plus, Pencil, Trash2, Loader2, AlertCircle,
  Eye, EyeOff, ExternalLink, GripVertical, Monitor, Laptop, Smartphone,
  Maximize2, Minimize2, Languages, Copy, Check, X, Type, MoreVertical,
} from 'lucide-react'
import Link from 'next/link'
import { revalidatePage } from '@/lib/actions'
import { BlockForm, validateBlockContent } from '@/components/admin/BlockForm'
import { translateContentObject } from '@/lib/auto-translate'
import { showToast } from '@/lib/toast'
import { useAdminAuth } from '@/components/admin/AdminAuthProvider'
import { cn } from '@/lib/utils'

// ── Types ─────────────────────────────────────────────────────────────────────

type ContentBlock = {
  id: string
  page_id: string
  block_type: string
  sort_order: number
  content: Record<string, unknown>
  is_visible: boolean
  label?: string | null
}

type PageData = {
  id: string
  slug: string
  title: { vi: string; en: string; ru: string; zh: string }
  description?: { vi: string; en: string; ru: string; zh: string }
  seo_image?: string | null
}

// ── Block type meta ───────────────────────────────────────────────────────────

const BLOCK_TYPES = [
  { type: 'hero', label: 'Hero', desc: 'Full-screen hero với carousel ảnh', color: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
  { type: 'split', label: 'Split', desc: 'Chia đôi: văn bản + ảnh/media', color: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
  { type: 'split_cards', label: 'Split Cards', desc: 'Chia đôi: văn bản + thẻ dọc', color: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20' },
  { type: 'marquee', label: 'Marquee', desc: 'Cuộn chữ ngang', color: 'bg-purple-500/15 text-purple-400 border-purple-500/20' },
  { type: 'quote_break', label: 'Quote', desc: 'Trích dẫn nổi bật', color: 'bg-red-500/15 text-red-400 border-red-500/20' },
  { type: 'card_grid', label: 'Card Grid', desc: 'Lưới thẻ nội dung', color: 'bg-teal-500/15 text-teal-400 border-teal-500/20' },
  { type: 'video_grid', label: 'Video Grid', desc: 'Lưới video YouTube', color: 'bg-green-500/15 text-green-400 border-green-500/20' },
  { type: 'features_strip', label: 'Features', desc: 'Dải tính năng ngang', color: 'bg-orange-500/15 text-orange-400 border-orange-500/20' },
  { type: 'intro', label: 'Intro', desc: 'Section giới thiệu (hardcoded)', color: 'bg-gray-500/15 text-gray-400 border-gray-500/20' },
  { type: 'map', label: 'Bản đồ', desc: 'Bản đồ di sản (từ DB)', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
  { type: 'iframe', label: 'Iframe Embed', desc: 'Nhúng nội dung ngoài (3D Tour, Maps)', color: 'bg-pink-500/15 text-pink-400 border-pink-500/20' },
  { type: 'image_banner', label: 'Banner ảnh', desc: 'Ảnh biểu diễn full width tràn lề', color: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/20' },
  { type: 'gallery', label: 'Gallery', desc: 'Bộ sưu tập ảnh: ảnh lớn + dải thumbnail', color: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20' },
  { type: 'reveal', label: 'Reveal', desc: 'Câu chữ nổi bật trên nền ảnh spotlight', color: 'bg-violet-500/15 text-violet-400 border-violet-500/20' },
  { type: 'film', label: 'Film', desc: 'Video showcase (YouTube hoặc tải lên)', color: 'bg-rose-500/15 text-rose-400 border-rose-500/20' },
  { type: 'offer', label: 'Offer', desc: 'Giá + đếm số + liên hệ đặt hàng', color: 'bg-lime-500/15 text-lime-500 border-lime-500/20' },
  { type: 'closing', label: 'Closing', desc: 'Câu kết trang trọng cuối trang', color: 'bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/20' },
  { type: 'size', label: 'Kích thước', desc: 'Ảnh sản phẩm + kích thước + thông số', color: 'bg-sky-500/15 text-sky-400 border-sky-500/20' },
  { type: 'catalog', label: 'Catalog', desc: 'Thẻ giới thiệu tác phẩm: ảnh + mô tả + thông số', color: 'bg-orange-600/15 text-orange-500 border-orange-600/20' },
] as const

const LAYOUT_OPTIONS = [
  {
    type: 'hero',
    label: 'Hero Slider',
    desc: 'Full-screen hero với carousel ảnh và chữ căn lề',
    color: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
    initialContent: { title: 'Tháp Bà Po Nagar', subtitle: 'DI SẢN VĂN HÓA TIÊU BIỂU', eyebrow: 'KHÁNH HÒA · VIỆT NAM', scrollLabel: 'Cuộn xuống', contentAlign: 'start', images: ['/images/hero-tower.jpg'], buttons: [{ label: 'Khám phá', href: '#ponagar', variant: 'primary' }], titleStyle: { fontFamily: 'serif', fontWeight: 'bold', fontStyle: 'italic', fontSize: 'large' }, eyebrowStyle: { fontWeight: 'bold' }, subtitleStyle: { fontFamily: 'serif', fontStyle: 'italic' }, buttonsStyle: {} },
    illustration: 'hero'
  },
  {
    type: 'split',
    label: 'Split - Ảnh đơn',
    desc: 'Chia đôi: một bên văn bản, một bên ảnh đơn lớn',
    color: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    initialContent: { title: 'Kiến trúc tháp cổ', eyebrow: 'GIỚI THIỆU', theme: 'light', imagePosition: 'right', mediaType: 'single', body: ['Quần thể đền tháp Po Nagar là một trong những khu di tích lịch sử và văn hóa lớn nhất miền Trung.'], images: [{ src: '/images/hero-tower.jpg', alt: 'Tháp Bà Po Nagar' }] },
    illustration: 'split-single'
  },
  {
    type: 'split',
    label: 'Split - Lưới ảnh (2x3)',
    desc: 'Chia đôi: một bên văn bản, một bên lưới nhiều ảnh',
    color: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    initialContent: { title: 'Không gian văn hóa', eyebrow: 'HÌNH ẢNH', theme: 'dark', imagePosition: 'right', mediaType: 'grid-2x3', body: ['Những góc nhìn chân thực về các nét chạm khắc tinh xảo của ngôi đền cổ kính.'], images: [{ src: '/images/hero-tower.jpg', alt: 'Tháp Bà' }, { src: '/images/culture-space.jpg', alt: 'Chi tiết chạm khắc' }] },
    illustration: 'split-grid'
  },
  {
    type: 'split',
    label: 'Split - Mosaic (1+2)',
    desc: 'Chia đôi: một bên văn bản, một bên 1 ảnh lớn và 2 ảnh nhỏ',
    color: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    initialContent: { title: 'Di sản thế giới', eyebrow: 'DI SẢN', theme: 'light', imagePosition: 'right', mediaType: 'mosaic-1+2', body: ['Nơi tôn vinh Thiên Y A Na Thánh Mẫu, được xây dựng từ thế kỷ thứ VIII.'], images: [{ src: '/images/hero-tower.jpg', alt: 'Toàn cảnh' }, { src: '/images/culture-space.jpg', alt: 'Cổng tháp' }, { src: '/images/hero-tower.jpg', alt: 'Khu đền chính' }] },
    illustration: 'split-mosaic-3'
  },
  {
    type: 'split',
    label: 'Split - Mosaic (4 ảnh)',
    desc: 'Chia đôi: một bên văn bản, một bên 1 ảnh đứng và 3 ảnh nhỏ',
    color: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    initialContent: { title: 'Nghệ thuật kiến trúc', eyebrow: 'KHÔNG GIAN', theme: 'dark', imagePosition: 'right', mediaType: 'mosaic-4', body: ['Chi tiết gạch xây dựng không cần chất kết dính, một bí ẩn của người Chăm cổ.'], images: [{ src: '/images/hero-tower.jpg', alt: 'Ảnh đứng' }, { src: '/images/culture-space.jpg', alt: 'Gạch cổ' }, { src: '/images/hero-tower.jpg', alt: 'Phù điêu' }, { src: '/images/culture-space.jpg', alt: 'Tượng thờ' }] },
    illustration: 'split-mosaic-4'
  },
  {
    type: 'split_cards',
    label: 'Split - Thẻ thông tin',
    desc: 'Chia đôi: một bên văn bản, một bên là các thẻ dọc',
    color: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
    initialContent: { title: 'Thông số di tích', eyebrow: 'TỔNG QUAN', theme: 'dark', imagePosition: 'right', body: ['Các khu vực chính cấu thành quần thể di tích Tháp Bà Po Nagar.'], infoCards: [{ prefix: 'I', title: 'Khu tháp cổng', body: 'Đã bị tàn phá chỉ còn lại chân cột gạch cổ.' }, { prefix: 'II', title: 'Mandapa', body: 'Gồm 10 cột lớn xếp thành hai hàng chính.' }] },
    illustration: 'split-info-cards'
  },
  {
    type: 'marquee',
    label: 'Marquee',
    desc: 'Dòng chữ chạy ngang màn hình',
    color: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
    initialContent: { theme: 'gold', items: ['Văn hóa Chăm', 'Khánh Hòa 2026', 'Di sản sống', 'Lễ hội Katê'] },
    illustration: 'marquee'
  },
  {
    type: 'quote_break',
    label: 'Quote Break',
    desc: 'Trích dẫn nổi bật trên nền màu',
    color: 'bg-red-500/15 text-red-400 border-red-500/20',
    initialContent: { theme: 'terra', eyebrow: 'THÔNG ĐIỆP', quote: 'Di sản không phải là những gì chúng ta giữ lại, mà là những gì chúng ta truyền lại cho thế hệ mai sau.' },
    illustration: 'quote'
  },
  {
    type: 'card_grid',
    label: 'Card Grid',
    desc: 'Lưới các thẻ thông tin',
    color: 'bg-teal-500/15 text-teal-400 border-teal-500/20',
    initialContent: { title: 'Khám phá văn hóa', eyebrow: 'NỘI DUNG', theme: 'light', columns: 3, cardStyle: 'plain', cards: [{ title: 'Lịch sử cổ đại', body: 'Lịch sử hình thành vương quốc Champa.' }, { title: 'Nghệ thuật múa', body: 'Những điệu múa Chăm dâng Mẫu uyển chuyển.' }, { title: 'Nghề dệt thổ cẩm', body: 'Làng dệt Mỹ Nghiệp lưu giữ sợi chỉ truyền thống.' }] },
    illustration: 'card-grid'
  },
  {
    type: 'video_grid',
    label: 'Video Grid',
    desc: 'Lưới các video YouTube',
    color: 'bg-green-500/15 text-green-400 border-green-500/20',
    initialContent: { title: 'Thư viện tư liệu', eyebrow: 'TRUYỀN THÔNG', subtitle: 'Các thước phim quý về di sản Chăm', columns: 2, videos: [{ id: 'dQw4w9WgXcQ', tag: 'YouTube', title: 'Lễ hội Tháp Bà Po Nagar', desc: 'Thước phim ghi lại không khí lễ hội lớn nhất năm.' }] },
    illustration: 'video-grid'
  },
  {
    type: 'features_strip',
    label: 'Features Strip',
    desc: 'Dải ngang hiển thị các đặc điểm nổi bật kèm icon',
    color: 'bg-orange-500/15 text-orange-400 border-orange-500/20',
    initialContent: { ariaLabel: 'Đặc trưng tiêu biểu', items: [{ iconKey: 'Landmark', title: 'Kiến Trúc', subtitle: 'Kỹ thuật xếp gạch' }, { iconKey: 'Drama', title: 'Lễ Hội', subtitle: 'Lễ Katê dâng Mẫu' }, { iconKey: 'Palette', title: 'Nghệ Thuật', subtitle: 'Chạm khắc đá' }] },
    illustration: 'features'
  },
  {
    type: 'intro',
    label: 'Intro Section',
    desc: 'Phần giới thiệu tinh hoa di sản (biên tập được chữ)',
    color: 'bg-gray-500/15 text-gray-400 border-gray-500/20',
    initialContent: {
      eyebrow: {
        vi: 'Tinh hoa di sản',
        en: 'Heritage Essence',
        ru: 'Эссенция наследия',
        zh: '遗产精髓'
      },
      title: {
        vi: 'Mỗi lễ hội, mỗi điệu múa, mỗi tiếng trống Ginăng — là cách cộng đồng kể lại ký ức, niềm tin và bản sắc của mình.',
        en: 'Every festival, every dance, every Ginang drum beat — is how the community retells its memory, belief and identity.',
        ru: 'Каждый фестиваль, каждый танец, каждый удар барабана Гинанг — это то, как сообщество пересказывает свою память, веру и самобытность.',
        zh: '每一个节日，每一支舞蹈，每一声Ginang鼓点——都是社区讲述其记忆、信仰 và 认同的方式。'
      },
      subtitle: {
        vi: 'Văn hóa Chăm là một phần độc đáo của nền văn hóa Việt Nam thống nhất trong đa dạng.',
        en: 'Cham culture is a unique part of the unified and diverse Vietnamese culture.',
        ru: 'Культура Тям — это уникальная часть единой и разнообразной вьетнамской культуры.',
        zh: '占族文化是统一多样的越南文化中独特的一部分。'
      }
    },
    illustration: 'intro'
  },
  {
    type: 'map',
    label: 'Interactive Map',
    desc: 'Bản đồ di sản hiển thị các vị trí lịch sử (từ DB)',
    color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    initialContent: {
      title: {
        vi: 'Hành trình Văn hóa Chăm',
        en: 'Journey of Cham Culture',
        ru: 'Путешествие в тямскую культуру',
        zh: '占婆文化之旅'
      },
      subtitle: {
        vi: 'BẢN ĐỒ DI SẢN',
        en: 'HERITAGE MAP',
        ru: 'КАРТА НАСЛЕДИЯ',
        zh: '遗产地图'
      },
      description: {
        vi: 'Khám phá vị trí địa lý các đền tháp, đền thờ, trung tâm nghiên cứu và bảo tàng lưu giữ hiện vật cổ xưa tiêu biểu của nền văn minh Champa tại Khánh Hòa và Ninh Thuận.',
        en: 'Discover the geographical locations of key temples, shrines, research centers, and museums preserving typical ancient artifacts of the Champa civilization in Khanh Hoa and Nhu Thuan.',
        ru: 'Откройте для себя географическое положение ключевых храмов, святилищ, исследовательских центров и музеев, хранящих древние артефакты цивилизации Тямпа в провинциях Кханьхоа и Ниньтхуан.',
        zh: '探索庆和省和宁顺省的占婆文明代表性古老文物的神庙、圣地、研究中心和博物馆的地理位置。'
      }
    },
    illustration: 'map'
  },
  {
    type: 'iframe',
    label: 'Iframe Embed',
    desc: 'Nhúng tour ảo 3D hoặc bản đồ ngoài',
    color: 'bg-pink-500/15 text-pink-400 border-pink-500/20',
    initialContent: { src: 'https://my.matterport.com/show/?m=Qd6j8nI12mU', layout: 'contained', height: 550, theme: 'light' },
    illustration: 'iframe'
  },
  {
    type: 'image_banner',
    label: 'Banner ảnh',
    desc: 'Ảnh banner full width căn giữa tự nhiên',
    color: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/20',
    initialContent: { src: '/images/hero-tower.jpg', alt: { vi: 'Banner di sản' } },
    illustration: 'image-banner'
  },
  {
    type: 'gallery',
    label: 'Gallery',
    desc: 'Ảnh lớn + dải thumbnail bên dưới, bấm để đổi ảnh',
    color: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20',
    initialContent: {
      kicker: 'BỘ SƯU TẬP',
      theme: 'light',
      images: [
        { src: '/images/gallery-wide-01.jpg', alt: 'Tác phẩm 1' },
        { src: '/images/gallery-wide-02.jpg', alt: 'Tác phẩm 2' },
        { src: '/images/gallery-wide-03.jpg', alt: 'Tác phẩm 3' },
      ],
    },
    illustration: 'gallery'
  },
  {
    type: 'reveal',
    label: 'Reveal — Câu chữ Spotlight',
    desc: 'Câu chữ nổi bật giữa nền ảnh tối, sáng dần theo con trỏ chuột',
    color: 'bg-violet-500/15 text-violet-400 border-violet-500/20',
    initialContent: {
      text: 'Ánh sáng không tạo ra hình khối,\\nnó khơi dậy điều đã ngủ quên trong đá.',
      bgImage: '/images/culture-space.jpg',
      bgImageOpacity: 1,
    },
    illustration: 'reveal'
  },
  {
    type: 'film',
    label: 'Film — Video Showcase',
    desc: 'Video lớn tự phát khi cuộn tới (YouTube hoặc tải lên)',
    color: 'bg-rose-500/15 text-rose-400 border-rose-500/20',
    initialContent: { kicker: 'THƯỚC PHIM', title: 'Câu chuyện ánh sáng', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', theme: 'dark' },
    illustration: 'film'
  },
  {
    type: 'offer',
    label: 'Offer — Giá & Liên hệ',
    desc: 'Giá đếm số khi cuộn tới + nút liên hệ đặt hàng',
    color: 'bg-lime-500/15 text-lime-500 border-lime-500/20',
    initialContent: {
      headline: 'Sở hữu tác phẩm điêu khắc ánh sáng',
      price: '250000000',
      currency: 'VNĐ',
      note: 'Đã bao gồm vận chuyển & lắp đặt',
      hint: 'Số lượng phiên bản có hạn',
      theme: 'dark',
      contacts: [
        { name: 'Nghệ nhân Tuyết', phone: '0985680698' },
        { name: 'Nghệ nhân Linh', phone: '0835583765' },
      ],
    },
    illustration: 'offer'
  },
  {
    type: 'closing',
    label: 'Closing — Câu kết',
    desc: 'Câu trích dẫn / thông điệp kết trang trang trọng',
    color: 'bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/20',
    initialContent: {
      kicker: 'LỜI KẾT',
      q1: 'Điêu khắc ánh sáng',
      q2: 'là nơi vật chất và tâm thức gặp nhau.',
      sub1: 'Mỗi tác phẩm là một hành trình lắng nghe đá.',
      sub2: 'Chúng tôi tin ánh sáng luôn ẩn sẵn bên trong hình khối.',
      author: 'Diệu Liên Studio',
      theme: 'dark',
    },
    illustration: 'closing'
  },
  {
    type: 'size',
    label: 'Kích thước sản phẩm',
    desc: 'Ảnh sản phẩm + bảng kích thước + thông số kỹ thuật',
    color: 'bg-sky-500/15 text-sky-400 border-sky-500/20',
    initialContent: {
      kicker: 'KÍCH THƯỚC',
      label: 'Diệu Liên — Tâm Ảnh',
      imageUrl: '/images/gallery-square.jpg',
      theme: 'light',
      dimensions: [
        { label: 'Cao', value: '90cm' },
        { label: 'Rộng', value: '42cm' },
        { label: 'Dài', value: '70cm' },
      ],
      specs: [
        { label: 'Chất liệu', value: 'Đồng nguyên khối' },
        { label: 'Kỹ thuật', value: 'Đúc & chạm tay' },
      ],
    },
    illustration: 'size'
  },
  {
    type: 'catalog',
    label: 'Catalog — Thẻ tác phẩm',
    desc: 'Ảnh + mô tả + thông số, có thể lặp lại nhiều thẻ trên 1 trang',
    color: 'bg-orange-600/15 text-orange-500 border-orange-600/20',
    initialContent: {
      number: '01',
      title: 'Diệu Liên — Tâm Ảnh',
      subtitle: 'Điêu khắc ánh sáng trên đồng nguyên khối',
      body: 'Tác phẩm khắc hoạ khoảnh khắc tâm thức tĩnh lặng, nơi ánh sáng xuyên qua hình khối để hé lộ chiều sâu nội tâm.',
      price: 'Liên hệ',
      theme: 'light',
      images: ['/images/gamma-card-41.jpg'],
      imageCaption: 'Diệu Liên — Tâm Ảnh, 2026',
      columns: [
        { heading: 'Chất liệu', items: ['Đồng nguyên khối', 'Hoàn thiện patina tay'] },
        { heading: 'Kỹ thuật', items: ['Đúc sáp thất truyền', 'Chạm khắc chi tiết thủ công'] },
      ],
    },
    illustration: 'catalog'
  }
]

function BlockIllustration({ type }: { type: string }) {
  switch (type) {
    case 'hero':
      return (
        <div className="relative w-full h-20 bg-[#0b2a24] rounded-lg overflow-hidden flex flex-col justify-end p-2 border border-border">
          <div className="absolute inset-0 bg-linear-to-t from-black/85 to-black/35" />
          <div className="relative z-10 space-y-0.5">
            <div className="h-0.5 w-6 bg-amber-400 rounded" />
            <div className="h-2 w-14 bg-white rounded" />
            <div className="h-0.5 w-16 bg-white/60 rounded" />
            <div className="flex gap-1 pt-0.5">
              <div className="h-1.5 w-4 bg-terra rounded-[2px]" />
              <div className="h-1.5 w-4 border border-white/40 rounded-[2px]" />
            </div>
          </div>
        </div>
      )
    case 'split-single':
      return (
        <div className="w-full h-20 bg-[#f5f0e6] rounded-lg border border-border p-2 grid grid-cols-2 gap-1 items-center">
          <div className="space-y-0.5">
            <div className="h-1 w-5 bg-terra rounded" />
            <div className="h-1.5 w-10 bg-[#1a2320] rounded" />
            <div className="space-y-0.5">
              <div className="h-0.5 w-full bg-[#1a2320]/30 rounded" />
              <div className="h-0.5 w-5/6 bg-[#1a2320]/30 rounded" />
            </div>
          </div>
          <div className="h-full bg-[#1a2320]/10 rounded relative overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 bg-linear-to-b from-transparent to-black/10" />
            <div className="w-3.5 h-3.5 rounded-full bg-white/50 flex items-center justify-center text-[7px]">🖼️</div>
          </div>
        </div>
      )
    case 'split-grid':
      return (
        <div className="w-full h-20 bg-[#0b2a24] rounded-lg border border-border p-2 grid grid-cols-2 gap-1 items-center text-white">
          <div className="space-y-0.5">
            <div className="h-1 w-6 bg-amber-400 rounded" />
            <div className="h-1.5 w-8 bg-white rounded" />
            <div className="space-y-0.5">
              <div className="h-0.5 w-full bg-white/20 rounded" />
              <div className="h-0.5 w-5/6 bg-white/20 rounded" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-0.5 h-full">
            <div className="bg-white/10 rounded" />
            <div className="bg-white/10 rounded" />
            <div className="bg-white/10 rounded" />
            <div className="bg-white/10 rounded" />
          </div>
        </div>
      )
    case 'split-mosaic-3':
      return (
        <div className="w-full h-20 bg-[#f5f0e6] rounded-lg border border-border p-2 grid grid-cols-2 gap-1 items-center">
          <div className="space-y-0.5">
            <div className="h-1 w-6 bg-terra rounded" />
            <div className="h-1.5 w-10 bg-[#1a2320] rounded" />
            <div className="h-0.5 w-full bg-[#1a2320]/30 rounded" />
          </div>
          <div className="grid grid-cols-2 gap-0.5 h-full">
            <div className="col-span-2 bg-[#1a2320]/10 rounded" />
            <div className="bg-[#1a2320]/10 rounded" />
            <div className="bg-[#1a2320]/10 rounded" />
          </div>
        </div>
      )
    case 'split-mosaic-4':
      return (
        <div className="w-full h-20 bg-[#0b2a24] rounded-lg border border-border p-2 grid grid-cols-2 gap-1 items-center text-white">
          <div className="space-y-0.5">
            <div className="h-1 w-5 bg-amber-400 rounded" />
            <div className="h-1.5 w-8 bg-white rounded" />
            <div className="h-0.5 w-full bg-white/20 rounded" />
          </div>
          <div className="grid grid-cols-2 grid-rows-3 gap-0.5 h-full">
            <div className="row-span-3 bg-white/10 rounded" />
            <div className="bg-white/10 rounded" />
            <div className="bg-white/10 rounded" />
            <div className="bg-white/10 rounded" />
          </div>
        </div>
      )
    case 'split-info-cards':
      return (
        <div className="w-full h-20 bg-[#0b2a24] rounded-lg border border-border p-2 grid grid-cols-2 gap-1 items-center text-white">
          <div className="space-y-0.5">
            <div className="h-1 w-5 bg-amber-400 rounded" />
            <div className="h-1.5 w-8 bg-white rounded" />
            <div className="h-0.5 w-full bg-white/20 rounded" />
          </div>
          <div className="flex flex-col gap-0.5">
            {[1, 2].map(i => (
              <div key={i} className="bg-white/5 border border-white/10 rounded p-0.5 space-y-0.5">
                <div className="h-1 w-2 bg-amber-400 rounded" />
                <div className="h-0.5 w-full bg-white/30 rounded" />
              </div>
            ))}
          </div>
        </div>
      )
    case 'marquee':
      return (
        <div className="w-full h-20 bg-[#fbf8f2] rounded-lg border border-border flex items-center justify-center p-2">
          <div className="w-full py-1 bg-amber-500 text-white font-semibold text-[6px] flex justify-around items-center overflow-hidden border-y border-amber-300 whitespace-nowrap gap-0.5">
            <span>DI SẢN SỐNG • LỄ HỘI KATÊ • VĂN HÓA CHĂM</span>
          </div>
        </div>
      )
    case 'quote':
      return (
        <div className="w-full h-20 bg-terra rounded-lg border border-border flex flex-col justify-center p-2 text-center space-y-0.5">
          <div className="h-0.5 w-4 bg-amber-300 mx-auto rounded" />
          <div className="text-[6.5px] text-amber-300 italic font-serif leading-none">&quot;Di sản không của riêng ai...&quot;</div>
        </div>
      )
    case 'card-grid':
      return (
        <div className="w-full h-20 bg-[#f5f0e6] rounded-lg border border-border p-1 flex flex-col justify-center space-y-0.5">
          <div className="h-1.5 w-10 bg-[#1a2320] rounded mx-auto" />
          <div className="grid grid-cols-3 gap-0.5">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white border border-border rounded p-0.5 space-y-0.5">
                <div className="h-1 w-2 bg-terra rounded" />
                <div className="h-0.5 w-full bg-[#1a2320]/20 rounded" />
              </div>
            ))}
          </div>
        </div>
      )
    case 'video-grid':
      return (
        <div className="w-full h-20 bg-[#143d35] rounded-lg border border-border p-1 flex flex-col justify-center space-y-0.5">
          <div className="h-1 w-6 bg-amber-400 rounded mx-auto" />
          <div className="grid grid-cols-2 gap-0.5">
            {[1, 2].map(i => (
              <div key={i} className="aspect-video bg-black/40 rounded border border-white/10 relative flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white/80 flex items-center justify-center">
                  <div className="w-0 h-0 border-t-[1.5px] border-t-transparent border-l-[2.5px] border-l-black border-b-[1.5px] border-b-transparent ml-0.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    case 'features':
      return (
        <div className="w-full h-20 bg-[#f5f0e6] rounded-lg border border-border p-1 flex items-center justify-around">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex flex-col items-center space-y-0.5">
              <div className="w-2.5 h-2.5 rounded-full bg-terra/10 border border-terra/20 flex items-center justify-center text-[4px]">🏛️</div>
              <div className="h-0.5 w-4 bg-[#1a2320] rounded" />
            </div>
          ))}
        </div>
      )
    case 'intro':
      return (
        <div className="w-full h-20 bg-[#fbf8f2] rounded-lg border border-border p-2 flex flex-col justify-center space-y-0.5">
          <div className="h-1 w-6 bg-terra rounded mx-auto" />
          <div className="h-1 w-10 bg-[#1a2320] rounded mx-auto" />
          <div className="space-y-0.5">
            <div className="h-0.5 w-full bg-[#1a2320]/20 rounded" />
            <div className="h-0.5 w-5/6 bg-[#1a2320]/20 rounded mx-auto" />
          </div>
        </div>
      )
    case 'map':
      return (
        <div className="w-full h-20 bg-[#efe4d2] rounded-lg border border-border p-1 relative overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 bg-[radial-gradient(#c8920c_0.8px,transparent_0.8px)] bg-size-[4px_4px] opacity-20" />
          <div className="absolute top-1/3 left-1/4 w-0.5 h-0.5 rounded-full bg-terra animate-pulse" />
          <div className="absolute top-1/2 right-1/3 w-0.5 h-0.5 rounded-full bg-amber-500" />
          <div className="absolute bottom-1/4 left-1/2 w-0.5 h-0.5 rounded-full bg-emerald-600" />
          <span className="relative z-10 px-0.5 py-0.2 bg-white/95 border border-border rounded text-[4.5px] font-bold">BẢN ĐỒ</span>
        </div>
      )
    case 'iframe':
      return (
        <div className="w-full h-20 bg-[#efe4d2] rounded-lg border border-border p-1 relative overflow-hidden flex flex-col justify-center items-center text-terra">
          <div className="h-6 w-12 border-2 border-dashed border-terra/30 rounded flex items-center justify-center text-[5px] font-bold">IFRAME</div>
        </div>
      )
    case 'image-banner':
      return (
        <div className="w-full h-20 bg-muted rounded-lg border border-border overflow-hidden relative flex items-center justify-center">
          <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(0,0,0,0.1),rgba(0,0,0,0.05))]" />
          <span className="relative z-10 text-[6px] font-bold tracking-wider text-muted-foreground uppercase">IMAGE BANNER</span>
        </div>
      )
    case 'gallery':
      return (
        <div className="w-full h-20 bg-[#f5f0e6] rounded-lg border border-border p-1.5 flex flex-col gap-1">
          <div className="flex-1 bg-[#1a2320]/10 rounded" />
          <div className="flex gap-0.5 h-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={`flex-1 rounded-[2px] ${i === 1 ? 'bg-terra' : 'bg-[#1a2320]/15'}`} />
            ))}
          </div>
        </div>
      )
    case 'reveal':
      return (
        <div className="w-full h-20 bg-black rounded-lg border border-border relative overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(255,255,255,0.22),rgba(0,0,0,0.9)_60%)]" />
          <span className="relative z-10 text-[6.5px] italic text-white/90 font-serif text-center px-3 leading-tight">&quot;Ánh sáng khơi dậy điều ngủ quên...&quot;</span>
        </div>
      )
    case 'film':
      return (
        <div className="w-full h-20 bg-[#0b2a24] rounded-lg border border-border p-1.5 flex flex-col justify-center gap-1 items-center">
          <div className="h-0.5 w-8 bg-amber-400 rounded" />
          <div className="w-[92%] aspect-video bg-black rounded flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-white/85 flex items-center justify-center">
              <div className="w-0 h-0 border-t-[2px] border-t-transparent border-l-[3px] border-l-black border-b-[2px] border-b-transparent ml-0.5" />
            </div>
          </div>
        </div>
      )
    case 'offer':
      return (
        <div className="w-full h-20 bg-[#12241f] rounded-lg border border-border flex flex-col items-center justify-center gap-1 text-center">
          <div className="h-1 w-10 bg-white/70 rounded" />
          <div className="h-2.5 w-16 bg-amber-400 rounded" />
          <div className="flex gap-1 mt-0.5">
            <div className="h-1.5 w-6 border border-white/40 rounded-[2px]" />
            <div className="h-1.5 w-6 border border-white/40 rounded-[2px]" />
          </div>
        </div>
      )
    case 'closing':
      return (
        <div className="w-full h-20 bg-[#0b2a24] rounded-lg border border-border flex flex-col items-center justify-center gap-1 text-center px-2">
          <div className="h-0.5 w-6 bg-amber-400 rounded" />
          <div className="text-[6.5px] text-white italic font-serif leading-tight">&quot;Điêu khắc ánh sáng...&quot;</div>
          <div className="h-0.5 w-10 bg-white/30 rounded mt-0.5" />
        </div>
      )
    case 'size':
      return (
        <div className="w-full h-20 bg-[#f5f0e6] rounded-lg border border-border p-1.5 grid grid-cols-2 gap-1 items-center">
          <div className="h-full bg-[#1a2320]/10 rounded" />
          <div className="space-y-0.5">
            <div className="h-1 w-8 bg-terra rounded" />
            <div className="grid grid-cols-3 gap-0.5">
              {[1, 2, 3].map(i => <div key={i} className="h-3 bg-white border border-border rounded-[2px]" />)}
            </div>
          </div>
        </div>
      )
    case 'catalog':
      return (
        <div className="w-full h-20 bg-[#fbf8f2] rounded-lg border border-border p-1.5 grid grid-cols-2 gap-1 items-center">
          <div className="grid grid-cols-2 gap-0.5 h-full">
            {[1, 2, 3, 4].map(i => <div key={i} className="bg-[#1a2320]/10 rounded" />)}
          </div>
          <div className="space-y-0.5">
            <div className="h-1 w-8 bg-[#1a2320] rounded" />
            <div className="h-0.5 w-full bg-[#1a2320]/20 rounded" />
            <div className="h-0.5 w-5/6 bg-[#1a2320]/20 rounded" />
          </div>
        </div>
      )
    default:
      return <div className="w-full h-20 bg-muted rounded-lg border border-border" />
  }
}

function blockMeta(type: string) {
  return BLOCK_TYPES.find((b) => b.type === type) ?? { type, label: type, desc: '', color: 'bg-gray-500/15 text-gray-400 border-gray-500/20' }
}

function blockAutoTitle(block: ContentBlock): string {
  const c = block.content
  if (c.title) {
    if (typeof c.title === 'object' && c.title !== null) {
      const titleObj = c.title as Record<string, string>
      return titleObj.vi || titleObj.en || ''
    }
    return c.title as string
  }
  if (c.quote) {
    if (typeof c.quote === 'object' && c.quote !== null) {
      const quoteObj = c.quote as Record<string, string>
      const quoteStr = quoteObj.vi || quoteObj.en || ''
      return (quoteStr.slice(0, 50) + '…')
    }
    return ((c.quote as string).slice(0, 50) + '…')
  }
  if (c.items && Array.isArray(c.items)) return `${(c.items as unknown[]).length} mục`
  if (c.videos && Array.isArray(c.videos)) return `${(c.videos as unknown[]).length} video`
  return blockMeta(block.block_type).desc
}

function blockTitle(block: ContentBlock): string {
  return block.label || blockAutoTitle(block)
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function PageEditorPage() {
  const { role, loading: authLoading } = useAdminAuth()
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [page, setPage] = useState<PageData | null>(null)
  const [blocks, setBlocks] = useState<ContentBlock[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Dialog state
  const [dialogMode, setDialogMode] = useState<'pick' | 'edit' | null>(null)
  const [editingBlock, setEditingBlock] = useState<ContentBlock | null>(null)
  const [draftContent, setDraftContent] = useState<Record<string, unknown>>({})
  const [newBlockType, setNewBlockType] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [activeLang, setActiveLang] = useState<string>('vi')
  const [translatingBlock, setTranslatingBlock] = useState(false)
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'laptop' | 'mobile'>('desktop')
  const [fullPreview, setFullPreview] = useState(false)
  const [editTab, setEditTab] = useState<'editor' | 'preview'>('editor')
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
  const observerRef = useRef<ResizeObserver | null>(null)
  const containerRef = useCallback((node: HTMLDivElement | null) => {
    if (observerRef.current) {
      observerRef.current.disconnect()
      observerRef.current = null
    }
    if (node) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setContainerSize({
            width: entry.contentRect.width,
            height: entry.contentRect.height,
          })
        }
      })
      resizeObserver.observe(node)
      observerRef.current = resizeObserver
    }
  }, [])
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [draggedOverIndex, setDraggedOverIndex] = useState<number | null>(null)
  const [draggableRowId, setDraggableRowId] = useState<string | null>(null)

  // Inline rename state
  const [renamingBlockId, setRenamingBlockId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)

  async function renameBlock(blockId: string, newLabel: string) {
    const trimmed = newLabel.trim()
    await updateBlock(blockId, { label: trimmed || null })
    setRenamingBlockId(null)
    setRenameValue('')
    await load()
  }


  const load = useCallback(async () => {
    if (!slug) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const { page: pageData, blocks: blocksData } = await getAdminPageBySlug(slug)
      if (!pageData) throw new Error('Không tìm thấy trang.')
      setPage(pageData)
      setBlocks(blocksData ?? [])
    } catch (err) {
      console.error('Error loading page:', err)
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }, [slug])

  // Iframe container ResizeObserver is managed dynamically via the callback ref containerRef

  useEffect(() => {
    if (authLoading) return
    let active = true

    const init = async () => {
      if (!slug) {
        if (active) setLoading(false)
        return
      }
      setLoading(true)
      try {
        const { page: pageData, blocks: blocksData } = await getAdminPageBySlug(slug)

        if (!active) return
        if (!pageData) {
          setError('Không tìm thấy trang.')
          return
        }
        setPage(pageData)
        setBlocks(blocksData ?? [])
      } catch (err) {
        console.error('Error initializing page:', err)
        if (active) {
          setError(err instanceof Error ? err.message : String(err))
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    const t = setTimeout(() => {
      init()
    }, 0)

    return () => {
      active = false
      clearTimeout(t)
    }
  }, [slug, authLoading])

  // ── Edit existing block ────────────────────────────────────────────────────

  function openEdit(block: ContentBlock) {
    setEditingBlock(block)
    setDraftContent({ ...block.content })
    setNewBlockType(null)
    setActiveLang('vi')
    setDialogMode('edit')
    setEditTab('editor')
  }

  // Auto-translate block content from Vietnamese to all other languages
  async function handleAutoTranslateBlock() {
    setTranslatingBlock(true)
    setError(null)
    try {
      const translated = await translateContentObject(draftContent, 'vi', 'gemini')
      setDraftContent(translated)
    } catch (err) {
      console.error('Auto-translate block error:', err)
      const errMsg = err instanceof Error ? err.message : String(err)
      if (errMsg.includes('GEMINI_RATE_LIMIT')) {
        showToast('Gemini API đã đạt giới hạn cuộc gọi (Rate Limit). Vui lòng thử lại sau.', 'error')
      } else {
        setError('Có lỗi xảy ra khi dịch tự động. Vui lòng thử lại.')
      }
    } finally {
      setTranslatingBlock(false)
    }
  }



  async function saveEdit() {
    if (!editingBlock) return
    setError(null)
    const validationError = validateBlockContent(editingBlock.block_type, draftContent)
    if (validationError) {
      setError(validationError)
      return
    }
    setSaving(true)
    await updateBlock(editingBlock.id, { content: draftContent })
    await Promise.all([load(), revalidatePage(slug)])
    setDialogMode(null)
    setSaving(false)
  }

  // ── Add new block ──────────────────────────────────────────────────────────

  function openPickType() {
    setNewBlockType(null)
    setEditingBlock(null)
    setDialogMode('pick')
  }

  function selectLayout(option: typeof LAYOUT_OPTIONS[0]) {
    setNewBlockType(option.type)
    setDraftContent({ ...option.initialContent })
    setActiveLang('vi')
    setDialogMode('edit')
    setEditTab('editor')
  }

  async function saveNew() {
    if (!page || !newBlockType) return
    setError(null)
    const validationError = validateBlockContent(newBlockType, draftContent)
    if (validationError) {
      setError(validationError)
      return
    }
    setSaving(true)
    const maxOrder = blocks.reduce((m, b) => Math.max(m, b.sort_order), 0)
    await createBlock({
      page_id: page.id,
      block_type: newBlockType,
      sort_order: maxOrder + 10,
      content: draftContent,
      is_visible: true,
    })
    await Promise.all([load(), revalidatePage(slug)])
    setDialogMode(null)
    setSaving(false)
  }

  // ── Delete ────────────────────────────────────────────────────────────────

  async function deleteBlock(id: string) {
    if (!confirm('Xoá block này?')) return
    setDeletingId(id)
    await deleteBlockAction(id)
    await Promise.all([load(), revalidatePage(slug)])
    setDeletingId(null)
  }

  async function duplicateBlock(block: ContentBlock) {
    if (!confirm('Bạn có chắc chắn muốn nhân bản block này không?')) return
    setSaving(true)
    await createBlock({
      page_id: block.page_id,
      block_type: block.block_type,
      sort_order: block.sort_order + 5,
      content: block.content,
      is_visible: block.is_visible,
      label: block.label ? `${block.label} (bản sao)` : null,
    })
    await Promise.all([load(), revalidatePage(slug)])
    setSaving(false)
  }

  // ── Toggle visibility ─────────────────────────────────────────────────────

  async function toggleVisibility(block: ContentBlock) {
    await updateBlock(block.id, { is_visible: !block.is_visible })
    await Promise.all([load(), revalidatePage(slug)])
  }

  // ── Drag & Drop Reorder ───────────────────────────────────────────────────

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', index.toString())
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return
    setDraggedOverIndex(index)
  }

  const handleDragEnd = async () => {
    if (draggedIndex !== null && draggedOverIndex !== null && draggedIndex !== draggedOverIndex) {
      // Reorder blocks array
      const reordered = [...blocks].sort((a, b) => a.sort_order - b.sort_order)
      const [movedItem] = reordered.splice(draggedIndex, 1)
      reordered.splice(draggedOverIndex, 0, movedItem)

      // Recalculate sort orders (e.g. 10, 20, 30...)
      const updated = reordered.map((item, idx) => ({
        ...item,
        sort_order: (idx + 1) * 10
      }))

      // Optimistically update local state
      setBlocks(updated)

      try {
        await Promise.all([
          reorderBlocks(updated.map((item) => ({ id: item.id, sort_order: item.sort_order }))),
          revalidatePage(slug),
        ])
        await load()
      } catch (err) {
        console.error('Failed to update block order', err)
        setError('Không thể lưu thứ tự sắp xếp mới.')
      }
    }
    setDraggedIndex(null)
    setDraggedOverIndex(null)
    setDraggableRowId(null)
  }

  const iframeRef = useRef<HTMLIFrameElement>(null)

  const isAddMode = dialogMode === 'edit' && newBlockType !== null
  const currentBlockType = isAddMode ? newBlockType : editingBlock?.block_type ?? ''

  // Real-time synchronization of draft changes to preview iframe
  useEffect(() => {
    if (dialogMode === 'edit' && currentBlockType) {
      const blockData = {
        id: editingBlock?.id || 'preview-id',
        page_id: editingBlock?.page_id || 'preview-page',
        block_type: currentBlockType,
        sort_order: editingBlock?.sort_order || 0,
        content: draftContent,
        is_visible: true,
      }

      // Store in sessionStorage to handle initial page load in iframe
      sessionStorage.setItem('preview_block_data', JSON.stringify({ block: blockData, activeLang }))

      // Send postMessage to the iframe
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          { type: 'PREVIEW_BLOCK', block: blockData, activeLang },
          window.location.origin
        )
      }
    }
  }, [draftContent, currentBlockType, editingBlock, dialogMode, activeLang])

  // ── Render ────────────────────────────────────────────────────────────────

  const noEditor = false

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <Button variant="ghost" size="icon" className="w-8 h-8 mt-0.5 shrink-0" onClick={() => router.push('/admin/pages')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight truncate">
              {page?.title?.vi ?? slug}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5 flex flex-wrap items-center gap-2">
              <code className="text-xs bg-muted px-1.5 py-0.5 rounded">/{slug}</code>
              <span>·</span>
              <span>{blocks.length} blocks</span>
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Link href={`/${activeLang}/${slug}`} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 text-sm border border-border rounded-md px-3 py-1.5 hover:bg-muted transition-colors whitespace-nowrap">
            <ExternalLink className="w-3.5 h-3.5" /> <span className="text-xs sm:text-sm">Xem trang</span>
          </Link>
          <Button size="sm" className="bg-amber-600 hover:bg-amber-500 text-black font-semibold" onClick={openPickType}>
            <Plus className="w-4 h-4 mr-1.5" /> <span className="text-xs sm:text-sm">Thêm block</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 px-4 py-3 rounded-md">
          <AlertCircle className="w-4 h-4 shrink-0" />{error}
        </div>
      )}

      {/* Block list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Danh sách Blocks</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {blocks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-sm text-muted-foreground">Chưa có block nào.</p>
              <Button variant="link" onClick={openPickType} className="mt-1 text-amber-500">
                Thêm block đầu tiên
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {[...blocks].sort((a, b) => a.sort_order - b.sort_order).map((block, i, arr) => {
                const meta = blockMeta(block.block_type)
                const isDragging = draggedIndex === i
                const isDraggedOver = draggedOverIndex === i
                return (
                  <div
                    key={block.id}
                    draggable={draggableRowId === block.id}
                    onDragStart={(e) => handleDragStart(e, i)}
                    onDragOver={(e) => handleDragOver(e, i)}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center gap-3 px-4 py-3 hover:bg-muted/20 transition-all duration-150 ${!block.is_visible ? 'opacity-50' : ''
                      } ${isDragging ? 'opacity-30 bg-muted/50 border-dashed border-2 border-amber-500/30' : ''
                      } ${isDraggedOver && draggedIndex !== null && draggedIndex < i ? 'border-b-2 border-b-amber-500/70 bg-amber-500/5' : ''
                      } ${isDraggedOver && draggedIndex !== null && draggedIndex > i ? 'border-t-2 border-t-amber-500/70 bg-amber-500/5' : ''
                      }`}
                  >
                    {/* Drag handle */}
                    <GripVertical
                      className="w-4 h-4 text-muted-foreground/40 shrink-0 cursor-grab active:cursor-grabbing"
                      onMouseDown={() => setDraggableRowId(block.id)}
                      onMouseUp={() => setDraggableRowId(null)}
                    />

                    {/* Type badge */}
                    <Badge variant="outline" className={`text-[10px] shrink-0 border ${meta.color}`}>
                      {meta.label}
                    </Badge>

                    {/* Title */}
                    <div className="flex-1 min-w-0">
                      {renamingBlockId === block.id ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            autoFocus
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') renameBlock(block.id, renameValue)
                              if (e.key === 'Escape') { setRenamingBlockId(null); setRenameValue('') }
                            }}
                            placeholder={blockAutoTitle(block)}
                            className="h-7 flex-1 min-w-0 rounded border border-input bg-background px-2 text-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 dark:bg-zinc-950"
                          />
                          <Button variant="ghost" size="icon" className="w-6 h-6 text-green-500 hover:text-green-400" onClick={() => renameBlock(block.id, renameValue)} title="Lưu tên">
                            <Check className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="w-6 h-6 text-muted-foreground hover:text-foreground" onClick={() => { setRenamingBlockId(null); setRenameValue('') }} title="Huỷ">
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm font-medium truncate">{blockTitle(block)}</p>
                          {block.label && (
                            <p className="text-[10px] text-muted-foreground/60 truncate italic">({blockAutoTitle(block)})</p>
                          )}
                        </>
                      )}
                      <p className="text-xs text-muted-foreground">Sort: {block.sort_order}</p>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Edit (Primary Action) */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1.5 text-xs font-semibold border-amber-500/20 text-amber-700 hover:text-amber-600 hover:bg-amber-500/10 hover:border-amber-500/40 transition-colors px-2 sm:px-3"
                        onClick={() => openEdit(block)}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Chỉnh sửa</span>
                      </Button>

                      {/* Visibility Toggle */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 rounded-md"
                        onClick={() => toggleVisibility(block)}
                        title={block.is_visible ? 'Ẩn block' : 'Hiện block'}
                      >
                        {block.is_visible ? (
                          <Eye className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-muted-foreground/60" />
                        )}
                      </Button>

                      {/* More Actions Dropdown */}
                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 rounded-md hover:bg-muted"
                          onClick={() => setActiveDropdownId(activeDropdownId === block.id ? null : block.id)}
                          title="Thao tác khác"
                        >
                          <MoreVertical className="w-4 h-4 text-muted-foreground" />
                        </Button>

                        {activeDropdownId === block.id && (
                          <>
                            {/* Transparent backdrop to click outside */}
                            <div
                              className="fixed inset-0 z-45 cursor-default"
                              onClick={() => setActiveDropdownId(null)}
                            />
                            <div
                              className={`absolute right-0 w-48 rounded-md border border-border bg-popover py-1 text-popover-foreground shadow-lg z-50 animate-in fade-in-50 slide-in-from-top-1 ${i === arr.length - 1 && arr.length > 2
                                ? 'bottom-full mb-1 origin-bottom'
                                : 'top-full mt-1 origin-top'
                                }`}
                            >
                              {/* Rename */}
                              <button
                                onClick={() => {
                                  setActiveDropdownId(null);
                                  setRenamingBlockId(block.id);
                                  setRenameValue(block.label || '');
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs hover:bg-muted transition-colors"
                              >
                                <Type className="w-3.5 h-3.5 text-muted-foreground" /> Đổi tên block
                              </button>

                              {/* Duplicate */}
                              <button
                                onClick={() => {
                                  setActiveDropdownId(null);
                                  duplicateBlock(block);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs hover:bg-muted transition-colors"
                              >
                                <Copy className="w-3.5 h-3.5 text-muted-foreground" /> Nhân bản block
                              </button>



                              {role === 'admin' && (
                                <>
                                  <Separator className="my-1" />
                                  {/* Delete */}
                                  <button
                                    onClick={() => {
                                      setActiveDropdownId(null);
                                      deleteBlock(block.id);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs hover:bg-destructive/10 text-destructive font-medium transition-colors"
                                  >
                                    {deletingId === block.id ? (
                                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />
                                    ) : (
                                      <Trash2 className="w-3.5 h-3.5 mr-2" />
                                    )}
                                    Xóa block
                                  </button>
                                </>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pick block type dialog */}
      <Dialog open={dialogMode === 'pick'} onOpenChange={(open) => !open && setDialogMode(null)}>
        <DialogContent className="w-[80vw] sm:max-w-[80vw] max-h-[90vh] flex flex-col p-6 overflow-hidden">
          <DialogHeader className="pb-4 border-b border-border shrink-0">
            <DialogTitle className="text-lg">Chọn loại bố cục block</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 py-4 overflow-y-auto pr-1 flex-1 min-h-0">
            {LAYOUT_OPTIONS.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => selectLayout(opt)}
                className="flex flex-col gap-2.5 p-3.5 rounded-xl border border-border hover:border-amber-500/40 hover:bg-muted/30 text-left transition-all group duration-200 hover:shadow-md"
              >
                {/* Visual mockup of the layout */}
                <div className="w-full shrink-0 group-hover:scale-[1.02] transition-transform duration-200">
                  <BlockIllustration type={opt.illustration} />
                </div>

                <Badge variant="outline" className={`text-[10px] self-start border ${opt.color}`}>
                  {opt.label}
                </Badge>

                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {opt.desc}
                </p>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit / Add block dialog */}
      <Dialog open={dialogMode === 'edit'} onOpenChange={(open) => !open && setDialogMode(null)}>
        <DialogContent className="w-[95vw] sm:max-w-7xl max-h-[95vh] h-[95vh] flex flex-col p-6 overflow-hidden">
          <DialogHeader className="pb-4 border-b border-border shrink-0 flex flex-row items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg">
              {isAddMode ? 'Thêm block:' : 'Chỉnh sửa:'}
              <Badge variant="outline" className={`text-xs border ${blockMeta(currentBlockType).color}`}>
                {blockMeta(currentBlockType).label}
              </Badge>
            </DialogTitle>
            {!noEditor && !fullPreview && (
              <div className="flex items-center gap-2 mr-6">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={translatingBlock}
                  onClick={() => handleAutoTranslateBlock()}
                  className="h-8 text-xs gap-1.5 font-semibold border-amber-500/30 text-amber-600 hover:text-amber-500 hover:bg-amber-500/10 hover:border-amber-500/50 transition-all"
                >
                  {translatingBlock ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Đang dịch...</>
                  ) : (
                    <><Languages className="w-3.5 h-3.5" /> Dịch tự động</>
                  )}
                </Button>
              </div>
            )}
          </DialogHeader>

          <div className="flex border-b border-border lg:hidden mb-2 shrink-0">
            <button
              type="button"
              className={cn(
                "flex-1 py-2 text-center text-sm font-medium border-b-2 transition-all",
                editTab === 'editor'
                  ? "border-amber-500 text-amber-600 font-semibold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setEditTab('editor')}
            >
              Chỉnh sửa
            </button>
            <button
              type="button"
              className={cn(
                "flex-1 py-2 text-center text-sm font-medium border-b-2 transition-all",
                editTab === 'preview'
                  ? "border-amber-500 text-amber-600 font-semibold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setEditTab('preview')}
            >
              Xem trước
            </button>
          </div>

          <div className={cn(
            "flex-1 min-h-0 py-4 grid grid-cols-1 gap-6 overflow-hidden",
            fullPreview ? "grid-cols-1" : "lg:grid-cols-2"
          )}>
            {/* Left editor pane */}
            {!fullPreview && (
              <div className={cn("overflow-y-auto pr-2 space-y-4", editTab !== 'editor' && "hidden lg:block")}>
                {noEditor ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center h-full">
                    <p className="text-sm text-muted-foreground">
                      Block này không có nội dung chỉnh sửa.
                      <br />Nó được render tự động từ code.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Language Tab Selector */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border border-border flex-1">
                        {[
                          { code: 'vi', name: 'Tiếng Việt (Gốc)' },
                          { code: 'en', name: 'English' },
                          { code: 'ru', name: 'Русский' },
                          { code: 'zh', name: '中文' }
                        ].map((lang) => (
                          <Button
                            key={lang.code}
                            type="button"
                            variant={activeLang === lang.code ? 'secondary' : 'ghost'}
                            size="sm"
                            className={cn(
                              "flex-1 text-xs py-1.5 h-auto transition-all",
                              activeLang === lang.code
                                ? "bg-background font-semibold shadow-sm text-foreground"
                                : "text-muted-foreground hover:text-foreground"
                            )}
                            onClick={() => setActiveLang(lang.code)}
                          >
                            <span className="hidden sm:inline">{lang.name}</span>
                            <span className="sm:hidden">{lang.code.toUpperCase()}</span>
                          </Button>
                        ))}
                      </div>
                    </div>

                    <BlockForm
                      blockType={currentBlockType}
                      content={draftContent}
                      onChange={setDraftContent}
                      activeLang={activeLang}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Right preview pane (Isolated iframe to mirror public page styles exactly) */}
            <div className={cn(
              "border border-border rounded-lg bg-bg text-ivory flex flex-col overflow-hidden h-full min-h-[300px]",
              !fullPreview && editTab !== 'preview' && "hidden lg:flex"
            )}>
              <div className="p-3 bg-muted border-b border-border flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Preview trực tiếp</span>
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px]">Realtime</Badge>
                </div>
                {/* Device Selector & Full Screen Toggle */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-background/50 p-0.5 rounded border border-border">
                    <Button
                      type="button"
                      variant={previewDevice === 'desktop' ? 'secondary' : 'ghost'}
                      size="icon"
                      className="w-7 h-7"
                      onClick={() => setPreviewDevice('desktop')}
                      title="Máy tính (Desktop)"
                    >
                      <Monitor className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant={previewDevice === 'laptop' ? 'secondary' : 'ghost'}
                      size="icon"
                      className="w-7 h-7"
                      onClick={() => setPreviewDevice('laptop')}
                      title="Máy tính xách tay (Laptop)"
                    >
                      <Laptop className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant={previewDevice === 'mobile' ? 'secondary' : 'ghost'}
                      size="icon"
                      className="w-7 h-7"
                      onClick={() => setPreviewDevice('mobile')}
                      title="Điện thoại (Mobile)"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  <Separator orientation="vertical" className="h-5" />
                  <Button
                    type="button"
                    variant={fullPreview ? 'secondary' : 'ghost'}
                    size="icon"
                    className="w-7 h-7"
                    onClick={() => setFullPreview(!fullPreview)}
                    title={fullPreview ? "Hiện trình chỉnh sửa" : "Mở rộng Preview"}
                  >
                    {fullPreview ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                  </Button>
                </div>
              </div>
              <div
                ref={containerRef}
                className="flex-1 relative bg-muted/20 font-sans overflow-hidden min-h-[300px]"
              >
                {containerSize.width > 0 && containerSize.height > 0 && (() => {
                  const targetWidth = previewDevice === 'desktop' ? 1280 : previewDevice === 'laptop' ? 1024 : 375
                  const padding = 32
                  const availableWidth = Math.max(containerSize.width - padding, 280)
                  const scale = availableWidth < targetWidth ? availableWidth / targetWidth : 1

                  const childWidth = targetWidth
                  const childHeight = (containerSize.height - padding) / scale

                  return (
                    <div
                      className="border border-border/40 shadow-lg bg-bg rounded overflow-hidden"
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        width: `${childWidth}px`,
                        height: `${childHeight}px`,
                        transform: `translate(-50%, -50%) scale(${scale})`,
                        transformOrigin: 'center center',
                      }}
                    >
                      <iframe
                        ref={iframeRef}
                        src="/preview-block"
                        className="w-full h-full border-0 bg-bg"
                      />
                    </div>
                  )
                })()}
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-border shrink-0 gap-2 bg-muted/20">
            <Button variant="outline" onClick={() => setDialogMode(null)}>Huỷ</Button>
            <Button
              onClick={isAddMode ? saveNew : saveEdit}
              disabled={saving}
              className="bg-amber-600 hover:bg-amber-500 text-black font-semibold"
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isAddMode ? 'Thêm block' : 'Lưu thay đổi'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
