import MarqueeBlock from '@/components/blocks/MarqueeBlock';

export default function MarqueeFooter() {
  return (
    <MarqueeBlock
      theme="footer"
      items={[
        'Sắc màu Chăm',
        'Di sản sống',
        'Tỏa sáng cùng thời gian',
        'Khánh Hòa 2026',
        'Ngày hội Văn hóa Chăm lần thứ VI',
      ]}
    />
  );
}
