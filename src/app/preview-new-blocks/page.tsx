import DynamicBlock from '@/components/blocks/DynamicBlock'
import type { CMSBlock } from '@/lib/cms'

// Static fake data — no API/DB call at all, just hardcoded content so the
// 7 new block types (Gallery, Reveal, Film, Offer, Closing, Size, Catalog)
// can be eyeballed for UI/UX locally.
const FAKE_BLOCKS: CMSBlock[] = [
  {
    id: 'gallery',
    page_id: 'fake',
    block_type: 'gallery',
    sort_order: 10,
    is_visible: true,
    content: {
      id: 'gallery',
      kicker: 'BỘ SƯU TẬP',
      theme: 'light',
      images: [
        { src: '/images/gallery-wide-01.jpg', alt: 'Tác phẩm điêu khắc ánh sáng 1', caption: 'Diệu Liên — Tâm Ảnh' },
        { src: '/images/gallery-wide-02.jpg', alt: 'Tác phẩm điêu khắc ánh sáng 2', caption: 'Vô Ưu — Lặng' },
        { src: '/images/gallery-wide-03.jpg', alt: 'Tác phẩm điêu khắc ánh sáng 3', caption: 'Nguyệt Quang' },
        { src: '/images/gallery-wide-04.jpg', alt: 'Tác phẩm điêu khắc ánh sáng 4', caption: 'Tịnh Tâm' },
      ],
    },
  },
  {
    id: 'reveal',
    page_id: 'fake',
    block_type: 'reveal',
    sort_order: 20,
    is_visible: true,
    content: {
      id: 'reveal',
      text: 'Ánh sáng không tạo ra hình khối,\nnó khơi dậy điều đã ngủ quên trong đá.',
      bgImage: '/images/culture-space.jpg',
      bgImageOpacity: 1,
    },
  },
  {
    id: 'film',
    page_id: 'fake',
    block_type: 'film',
    sort_order: 30,
    is_visible: true,
    content: {
      id: 'film',
      kicker: 'THƯỚC PHIM',
      title: 'Câu chuyện ánh sáng',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      theme: 'dark',
    },
  },
  {
    id: 'size',
    page_id: 'fake',
    block_type: 'size',
    sort_order: 40,
    is_visible: true,
    content: {
      id: 'size',
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
        { label: 'Kỹ thuật', value: 'Đúc sáp thất truyền & chạm tay' },
      ],
    },
  },
  {
    id: 'catalog-1',
    page_id: 'fake',
    block_type: 'catalog',
    sort_order: 50,
    is_visible: true,
    content: {
      id: 'catalog-1',
      number: '01',
      title: 'Diệu Liên — Tâm Ảnh',
      subtitle: 'Điêu khắc ánh sáng trên đồng nguyên khối',
      body: 'Tác phẩm khắc hoạ khoảnh khắc tâm thức tĩnh lặng, nơi ánh sáng xuyên qua hình khối để hé lộ chiều sâu nội tâm.',
      price: 'Liên hệ',
      theme: 'light',
      images: ['/images/gamma-card-41.jpg', '/images/hoalai-gamma-detail.jpg'],
      imageCaption: 'Diệu Liên — Tâm Ảnh, 2026',
      columns: [
        { heading: 'Chất liệu', items: ['Đồng nguyên khối', 'Hoàn thiện patina tay'] },
        { heading: 'Kỹ thuật', items: ['Đúc sáp thất truyền', 'Chạm khắc chi tiết thủ công'] },
      ],
    },
  },
  {
    id: 'catalog-2',
    page_id: 'fake',
    block_type: 'catalog',
    sort_order: 60,
    is_visible: true,
    content: {
      id: 'catalog-2',
      number: '02',
      title: 'Vô Ưu — Lặng',
      subtitle: 'Điêu khắc ánh sáng trên đá cẩm thạch',
      body: 'Một dáng ngồi tĩnh tại, nơi ánh sáng đổ bóng dịu dàng lên từng thớ đá, gợi nhắc về sự buông bỏ.',
      price: 'Liên hệ',
      theme: 'dark',
      images: ['/images/hoalai-gamma-garuda.jpg'],
      imageCaption: 'Vô Ưu — Lặng, 2026',
      columns: [
        { heading: 'Chất liệu', items: ['Đá cẩm thạch trắng'] },
        { heading: 'Kích thước', items: ['Cao 65cm', 'Đế gỗ gụ tự nhiên'] },
      ],
    },
  },
  {
    id: 'offer',
    page_id: 'fake',
    block_type: 'offer',
    sort_order: 70,
    is_visible: true,
    content: {
      id: 'offer',
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
  },
  {
    id: 'closing',
    page_id: 'fake',
    block_type: 'closing',
    sort_order: 80,
    is_visible: true,
    content: {
      id: 'closing',
      kicker: 'LỜI KẾT',
      q1: 'Điêu khắc ánh sáng',
      q2: 'là nơi vật chất và tâm thức gặp nhau.',
      sub1: 'Mỗi tác phẩm là một hành trình lắng nghe đá.',
      sub2: 'Chúng tôi tin ánh sáng luôn ẩn sẵn bên trong hình khối.',
      author: 'Diệu Liên Studio',
      theme: 'dark',
    },
  },
]

const NAV_ITEMS = [
  { href: '#gallery', label: 'Gallery' },
  { href: '#reveal', label: 'Reveal' },
  { href: '#film', label: 'Film' },
  { href: '#size', label: 'Size' },
  { href: '#catalog-1', label: 'Catalog ×2' },
  { href: '#offer', label: 'Offer' },
  { href: '#closing', label: 'Closing' },
]

export default function PreviewNewBlocksPage() {
  return (
    <div className="min-w-0 bg-bg w-full min-h-screen">
      <nav className="sticky top-0 z-50 flex flex-wrap items-center gap-1 p-2 bg-black/85 backdrop-blur border-b border-white/10 text-[0.72rem]">
        <span className="px-2 py-1 font-bold text-gold-lt uppercase tracking-wider">Fake preview — 7 block mới</span>
        {NAV_ITEMS.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="px-2.5 py-1 rounded-full border border-white/15 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
          >
            {item.label}
          </a>
        ))}
      </nav>

      {FAKE_BLOCKS.map((block) => (
        <DynamicBlock key={block.id} block={block} />
      ))}
    </div>
  )
}
