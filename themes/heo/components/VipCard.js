import FlipCard from '@/components/FlipCard'
import { siteConfig } from '@/lib/config'
import SmartLink from '@/components/SmartLink'
import CONFIG from '../config'

/**
 * 侧边栏会员专区卡片（支持 3D 翻转交互）
 */
export default function VipCard() {
  const enable = siteConfig('HEO_SIDEBAR_VIP_CARD', true, CONFIG)
  if (!enable) {
    return null
  }

  const title1 = siteConfig('HEO_SIDEBAR_VIP_CARD_TITLE_1', '👑 会员专区', CONFIG)
  const title2 = siteConfig('HEO_SIDEBAR_VIP_CARD_TITLE_2', '解锁全部深度实战专栏与源码', CONFIG)
  const title3 = siteConfig('HEO_SIDEBAR_VIP_CARD_TITLE_3', '点击进入会员专区 →', CONFIG)
  const url = siteConfig('HEO_SIDEBAR_VIP_CARD_URL', '/vip', CONFIG)

  return (
    <div className='relative h-28 text-white flex flex-col select-none'>
      <FlipCard
        className='cursor-pointer lg:p-6 p-4 border rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-600 dark:from-amber-600 dark:to-yellow-700 shadow-md border-amber-400/40 dark:border-amber-500/30'
        frontContent={
          <div className='h-full flex flex-col justify-center'>
            <div className='flex items-center gap-2'>
              <span className='px-2 py-0.5 rounded text-[10px] font-black bg-white/20 uppercase tracking-widest text-amber-100'>VIP CLUB</span>
            </div>
            <h2 className='font-[1000] text-2xl mt-1 text-white tracking-tight drop-shadow-xs'>
              {title1}
            </h2>
            <h3 className='text-xs text-amber-100/90 pt-1 truncate'>
              {title2}
            </h3>
            <div
              className='absolute right-2 bottom-1 opacity-15 pointer-events-none text-6xl'>
              <i className='fas fa-crown' />
            </div>
          </div>
        }
        backContent={
          <SmartLink href={url}>
            <div className='font-extrabold text-lg h-full flex items-center justify-center gap-2 text-white hover:scale-105 transition-transform'>
              <span>{title3}</span>
            </div>
          </SmartLink>
        }
      />
    </div>
  )
}
