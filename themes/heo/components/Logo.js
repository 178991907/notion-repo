import { Home } from '@/components/HeroIcons'
import LazyImage from '@/components/LazyImage'
import { siteConfig } from '@/lib/config'
import SmartLink from '@/components/SmartLink'
import CONFIG from '../config'

const Logo = props => {
  const { siteInfo } = props
  const logoImage = siteConfig('HEO_LOGO_IMAGE', null, CONFIG) || siteConfig('AVATAR') || siteInfo?.icon
  const showLogoIcon = JSON.parse(siteConfig('HEO_LOGO_SHOW_ICON', true, CONFIG))
  const logoSize = parseInt(siteConfig('HEO_LOGO_SIZE', 38, CONFIG)) || 38
  const logoText = siteConfig('TITLE')
  const logoDesc = siteConfig('DESCRIPTION')

  return (
    <div className='relative group'>
      <SmartLink href='/' passHref legacyBehavior>
        <div className='flex flex-nowrap items-center cursor-pointer font-extrabold select-none py-1'>
          {showLogoIcon && logoImage && (
            <div className='mr-3 hidden md:flex items-center justify-center flex-shrink-0 transition-transform duration-300 ease-out group-hover:scale-105'>
              <LazyImage
                src={logoImage}
                width={logoSize}
                height={logoSize}
                alt={siteConfig('AUTHOR') || logoText}
                style={{ width: `${logoSize}px`, height: `${logoSize}px` }}
                className='rounded-xl object-cover border border-black/5 dark:border-white/10 shadow-sm'
              />
            </div>
          )}
          <div id='logo-text' className='rounded-2xl flex-none relative'>
            <div className='logo group-hover:opacity-0 opacity-100 visible group-hover:invisible text-xl font-extrabold my-auto rounded dark:border-white duration-200 tracking-tight'>
              {logoText}
            </div>
            <div className='flex justify-center items-center rounded-2xl group-hover:bg-[var(--heo-color-primary)] w-full group-hover:opacity-100 opacity-0 invisible group-hover:visible absolute top-0 py-1 duration-200'>
              <Home className={'w-6 h-6 stroke-white stroke-2 '} />
            </div>
          </div>
        </div>
      </SmartLink>

      {/* 鼠标悬停弹出显示大 Logo 浮窗卡片 */}
      {logoImage && (
        <div className='absolute left-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 pointer-events-none z-50'>
          <div className='bg-[var(--heo-color-card)] dark:bg-[var(--heo-color-card-dark)] p-3 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col items-center min-w-[160px] backdrop-blur-md'>
            <div className='relative overflow-hidden rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-2 shadow-inner'>
              <img
                src={logoImage}
                alt={logoText}
                className='w-32 h-32 object-contain rounded-lg transition-transform duration-300 hover:scale-105'
              />
            </div>
            <div className='mt-2.5 text-center px-1'>
              <div className='font-bold text-sm text-gray-900 dark:text-gray-100 tracking-tight'>{logoText}</div>
              {logoDesc && <div className='text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 line-clamp-1 max-w-[140px]'>{logoDesc}</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
export default Logo
