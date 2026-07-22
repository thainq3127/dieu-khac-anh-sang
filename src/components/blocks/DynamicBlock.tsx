import { Landmark, Drama, Palette, ShieldCheck, MapPin, Music, Camera, Star, BookOpen, Globe } from 'lucide-react'
import HeroBlock from './HeroBlock'
import SplitBlock from './SplitBlock'
import SplitCardsBlock from './SplitCardsBlock'
import MarqueeBlock from './MarqueeBlock'
import QuoteBreakBlock from './QuoteBreakBlock'
import CardGridBlock from './CardGridBlock'
import VideoGridBlock from './VideoGridBlock'
import FeaturesStripBlock from './FeaturesStripBlock'
import IntroSection from '@/components/main-page/IntroSection'
import MapSection from '@/components/main-page/MapSection'
import type { CMSBlock } from '@/lib/cms'
import type { FeaturesStripItem } from './types'
import { resolveAssetUrl } from '@/lib/assets'
import IframeBlock from './IframeBlock'
import ImageBannerBlock from './ImageBannerBlock'
import GalleryBlock from './GalleryBlock'
import RevealBlock from './RevealBlock'
import FilmBlock from './FilmBlock'
import OfferBlock from './OfferBlock'
import ClosingBlock from './ClosingBlock'
import SizeBlock from './SizeBlock'
import CatalogBlock from './CatalogBlock'

const ICON_MAP: Record<string, React.ReactElement> = {
  Landmark: <Landmark className="w-[22px] h-[22px] text-terra" strokeWidth={1.8} aria-hidden />,
  Drama: <Drama className="w-[22px] h-[22px] text-terra" strokeWidth={1.8} aria-hidden />,
  Palette: <Palette className="w-[22px] h-[22px] text-terra" strokeWidth={1.8} aria-hidden />,
  ShieldCheck: <ShieldCheck className="w-[22px] h-[22px] text-terra" strokeWidth={1.8} aria-hidden />,
  MapPin: <MapPin className="w-[22px] h-[22px] text-terra" strokeWidth={1.8} aria-hidden />,
  Music: <Music className="w-[22px] h-[22px] text-terra" strokeWidth={1.8} aria-hidden />,
  Camera: <Camera className="w-[22px] h-[22px] text-terra" strokeWidth={1.8} aria-hidden />,
  Star: <Star className="w-[22px] h-[22px] text-terra" strokeWidth={1.8} aria-hidden />,
  BookOpen: <BookOpen className="w-[22px] h-[22px] text-terra" strokeWidth={1.8} aria-hidden />,
  Globe: <Globe className="w-[22px] h-[22px] text-terra" strokeWidth={1.8} aria-hidden />,
}

export default function DynamicBlock({ block, locale }: { block: CMSBlock; locale?: string }) {
  const c = block.content
  let blockJSX = null

  /* eslint-disable @typescript-eslint/no-explicit-any */
  switch (block.block_type) {
    case 'hero':
      blockJSX = <HeroBlock {...(c as any)} audioUrl={resolveAssetUrl(block.audio_url)} />
      break

    case 'split': {
      // Inject locale into ctaButtons that have isInternal: true
      const splitContent = locale && Array.isArray(c.ctaButtons)
        ? {
            ...c,
            ctaButtons: (c.ctaButtons as Array<Record<string, unknown>>).map((btn) =>
              btn.isInternal ? { ...btn, locale } : btn
            ),
          }
        : c
      blockJSX = <SplitBlock {...(splitContent as any)} />
      break
    }

    case 'split_cards': {
      // Inject locale into ctaButtons that have isInternal: true
      const splitContent = locale && Array.isArray(c.ctaButtons)
        ? {
            ...c,
            ctaButtons: (c.ctaButtons as Array<Record<string, unknown>>).map((btn) =>
              btn.isInternal ? { ...btn, locale } : btn
            ),
          }
        : c
      blockJSX = <SplitCardsBlock {...(splitContent as any)} />
      break
    }

    case 'marquee':
      blockJSX = <MarqueeBlock {...(c as any)} />
      break

    case 'quote_break':
      blockJSX = <QuoteBreakBlock {...(c as any)} />
      break

    case 'card_grid':
      blockJSX = <CardGridBlock {...(c as any)} />
      break

    case 'video_grid':
      blockJSX = <VideoGridBlock {...(c as any)} />
      break

    case 'features_strip': {
      const rawItems = (c.items ?? []) as Array<{ iconKey?: string; title: string; subtitle: string }>
      const items: FeaturesStripItem[] = rawItems.map((item) => ({
        icon: ICON_MAP[item.iconKey ?? ''] ?? ICON_MAP.Landmark,
        title: item.title,
        subtitle: item.subtitle,
      }))
      blockJSX = <FeaturesStripBlock {...(c as any)} items={items} />
      break
    }

    case 'intro':
      blockJSX = <IntroSection {...(c as any)} />
      break

    case 'map':
      blockJSX = <MapSection {...(c as any)} />
      break
    case 'iframe':
      blockJSX = <IframeBlock {...(c as any)} />
      break

    case 'image_banner':
      blockJSX = <ImageBannerBlock {...(c as any)} />
      break

    case 'gallery':
      blockJSX = <GalleryBlock {...(c as any)} />
      break

    case 'reveal':
      blockJSX = <RevealBlock {...(c as any)} />
      break

    case 'film':
      blockJSX = <FilmBlock {...(c as any)} />
      break

    case 'offer':
      blockJSX = <OfferBlock {...(c as any)} />
      break

    case 'closing':
      blockJSX = <ClosingBlock {...(c as any)} />
      break

    case 'size':
      blockJSX = <SizeBlock {...(c as any)} />
      break

    case 'catalog':
      blockJSX = <CatalogBlock {...(c as any)} />
      break

    default:
      blockJSX = null
  }

  if (!blockJSX) return null

  return (
    <div id={block.id} className="scroll-mt-[138px]">
      {blockJSX}
    </div>
  )
}
