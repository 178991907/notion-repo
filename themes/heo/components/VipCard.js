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
  const vipColor = siteConfig('HEO_VIP_COLOR', '#f59e0b', CONFIG)
  const vipColorEnd = siteConfig('HEO_VIP_COLOR_END', '#eab308', CONFIG)

  return (
    <div className='relative h-28 text-white flex flex-col select-none'>
      <FlipCard
        style={{ background: `linear-gradient(135deg, ${vipColor}, ${vipColorEnd})` }}
        className='cursor-pointer lg:p-6 p-4 border rounded-xl shadow-md border-white/20 bg-gradient-to-br from-amber-500 to-yellow-600'
        frontContent={
          <div className='h-full flex flex-col justify-center relative z-10'>
            <div className='flex items-center gap-2'>
              <span className='px-2 py-0.5 rounded text-[10px] font-black bg-white/25 uppercase tracking-widest text-white shadow-xs'>VIP CLUB</span>
            </div>
            <h2 className='font-[1000] text-2xl mt-1 text-white tracking-tight drop-shadow-md flex items-center gap-1.5'>
              {title1}
            </h2>
            <h3 className='text-xs text-white/95 pt-1 truncate font-medium drop-shadow-xs'>
              {title2}
            </h3>
            <div
              className='absolute right-2 bottom-1 opacity-20 pointer-events-none text-6xl text-white'>
              <i className='fas fa-crown' />
            </div>
          </div>
        }
        backContent={
          <SmartLink href={url} className='h-full w-full block'>
            <div className='font-extrabold text-base lg:text-lg h-full flex items-center justify-center gap-2 text-white bg-black/25 backdrop-blur-xs rounded-xl hover:scale-105 transition-transform px-4 text-center shadow-inner'>
              <span>{title3}</span>
            </div>
          </SmartLink>
        }
      />
    </div>
  )
}
