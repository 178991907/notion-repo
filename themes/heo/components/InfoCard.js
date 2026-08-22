import { ArrowRightCircle } from '@/components/HeroIcons'
import LazyImage from '@/components/LazyImage'
import { siteConfig } from '@/lib/config'
import SmartLink from '@/components/SmartLink'
import { useRouter } from 'next/router'
import { useState } from 'react'
import CONFIG from '../config'
import Announcement from './Announcement'
import Card from './Card'

export function normalizeInfoCardGreetings(value) {
  if (Array.isArray(value)) {
    return value.map(item => String(item).trim()).filter(Boolean)
  }

  if (typeof value !== 'string') {
    return []
  }

  const trimmed = value.trim()
  if (!trimmed) {
    return []
  }

  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      const parsed = JSON.parse(trimmed.replace(/'/g, '"'))
      return normalizeInfoCardGreetings(parsed)
    } catch {
      return trimmed
        .slice(1, -1)
        .split(',')
        .map(item => item.trim().replace(/^['"]|['"]$/g, ''))
        .filter(Boolean)
    }
  }

  return [trimmed]
}

export function shouldUseInfoCardBlurAvatar(isSlugPage, avatarBlurEnabled) {
  return Boolean(isSlugPage && avatarBlurEnabled)
}

/**
 * 社交信息卡
 * @param {*} props
 * @returns
 */
export function InfoCard(props) {
  const { siteInfo, notice } = props
  const router = useRouter()
  // 在文章详情页特殊处理
  const isSlugPage = router.pathname.indexOf('/[prefix]') === 0
  const url1 = siteConfig('HEO_INFO_CARD_URL1', null, CONFIG)
  const icon1 = siteConfig('HEO_INFO_CARD_ICON1', null, CONFIG)
  const url2 = siteConfig('HEO_INFO_CARD_URL2', null, CONFIG)
  const icon2 = siteConfig('HEO_INFO_CARD_ICON2', null, CONFIG)
  const orcidUrl = siteConfig('CONTACT_ORCID')
  const orcidIcon = siteConfig('HEO_INFO_CARD_ICON_ORCID', 'fab fa-orcid', CONFIG)
  const avatarBlurEnabled = siteConfig(
    'HEO_INFO_CARD_AVATAR_BLUR',
    false,
    CONFIG
  )
  const useBlurAvatar = shouldUseInfoCardBlurAvatar(
    isSlugPage,
    avatarBlurEnabled
  )
  const avatarUrl = siteConfig('HEO_INFO_CARD_AVATAR', null, CONFIG) || siteConfig('AVATAR') || siteInfo?.icon
  const avatarLink = siteConfig('HEO_INFO_CARD_AVATAR_URL', null, CONFIG) || '/about'
  const avatarSize = parseInt(siteConfig('HEO_INFO_CARD_AVATAR_SIZE', 80, CONFIG)) || 80
  const customNotice = siteConfig('HEO_INFO_CARD_CUSTOM_ANNOUNCEMENT', null, CONFIG)
  const announcementUrl = siteConfig('HEO_INFO_CARD_ANNOUNCEMENT_URL', null, CONFIG)
  const showNotice = siteConfig('HEO_INFO_CARD_SHOW_ANNOUNCEMENT', true, CONFIG)

  // 智能检测公告内容是否为图片地址
  const isImageNotice = typeof customNotice === 'string' && (
    /\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i.test(customNotice.trim()) ||
    customNotice.includes('imgdb') ||
    customNotice.includes('sinaimg') ||
    customNotice.includes('imgur')
  )

  return (
    <Card className='wow fadeInUp bg-[var(--heo-color-primary)] dark:bg-[var(--heo-color-accent)] text-[var(--heo-color-primary-text)] flex flex-col w-72 overflow-hidden relative'>
      {/* 顶部个人信息与大头像区域 */}
      <div className='flex justify-between items-start'>
        <div className='flex flex-col items-start pr-2'>
          {/* 问候语 */}
          <GreetingsWords />
          <h2 className='text-3xl font-extrabold mt-3 tracking-tight'>{siteConfig('AUTHOR')}</h2>
        </div>
        {/* 右上角大头像 */}
        <SmartLink href={avatarLink} className='flex-shrink-0'>
          <div
            className={`${
              useBlurAvatar
                ? 'absolute right-0 -mt-8 -mr-6 hover:opacity-0 hover:scale-150 blur'
                : 'cursor-pointer hover:scale-105'
            } justify-center items-center flex dark:text-gray-100 transform transition-all duration-200`}>
            <LazyImage
              src={avatarUrl}
              className='rounded-full object-cover border-2 border-white/60 shadow-lg'
              style={{ width: `${avatarSize}px`, height: `${avatarSize}px` }}
              width={avatarSize}
              height={avatarSize}
              alt={siteConfig('AUTHOR')}
            />
          </div>
        </SmartLink>
      </div>

      {/* 公告栏 */}
      {showNotice && (
        customNotice ? (
          <div id='announcement-content' className='text-sm text-white/90 my-2 leading-relaxed'>
            {isImageNotice ? (
              <SmartLink href={announcementUrl || customNotice} className='block cursor-pointer hover:opacity-90 transition'>
                <img
                  src={customNotice.trim()}
                  alt='公告配图'
                  className='rounded-xl max-h-28 w-full object-cover shadow-sm'
                />
              </SmartLink>
            ) : announcementUrl ? (
              <SmartLink
                href={announcementUrl}
                className='inline-block hover:underline hover:text-white cursor-pointer transition font-medium whitespace-pre-line group'>
                <span>{customNotice}</span>
                <i className='fas fa-chevron-right text-xs ml-1 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-transform inline-block' />
              </SmartLink>
            ) : (
              <div className='whitespace-pre-line'>
                {customNotice}
              </div>
            )}
          </div>
        ) : (
          <Announcement post={notice} style={{ color: 'white !important' }} />
        )
      )}

      <div className='flex justify-between'>
        <div className='flex space-x-3  hover:text-black dark:hover:text-white'>
          {/* 社交按钮 */}
          {url1 && (
            <div className='w-10 text-center bg-[var(--heo-color-primary-hover)] p-2 rounded-full  transition-colors duration-200 dark:bg-[var(--heo-color-accent)] dark:hover:bg-black hover:bg-white'>
              <SmartLink href={url1}>
                <i className={icon1} />
              </SmartLink>
            </div>
          )}
          {url2 && (
            <div className='bg-[var(--heo-color-primary-hover)] p-2 rounded-full w-10 items-center flex justify-center transition-colors duration-200 dark:bg-[var(--heo-color-accent)] dark:hover:bg-black hover:bg-white'>
              <SmartLink href={url2}>
                <i className={icon2} />
              </SmartLink>
            </div>
          )}
          {orcidUrl && (
            <div className='bg-[var(--heo-color-primary-hover)] p-2 rounded-full w-10 items-center flex justify-center transition-colors duration-200 dark:bg-[var(--heo-color-accent)] dark:hover:bg-black hover:bg-white'>
              <SmartLink href={orcidUrl} title='ORCID' aria-label='ORCID'>
                <i className={orcidIcon} />
              </SmartLink>
            </div>
          )}
        </div>
        {/* 第三个按钮 */}
        <MoreButton />
      </div>
    </Card>
  )
}

/**
 * 了解更多按鈕
 * @returns
 */
function MoreButton() {
  const url3 = siteConfig('HEO_INFO_CARD_URL3', null, CONFIG)
  const text3 = siteConfig('HEO_INFO_CARD_TEXT3', null, CONFIG)
  if (!url3) {
    return <></>
  }
  return (
    <SmartLink href={url3}>
      <div
        className={
          'group bg-[var(--heo-color-primary-hover)] dark:bg-[var(--heo-color-accent)] hover:bg-white dark:hover:bg-black hover:text-black dark:hover:text-white flex items-center transition-colors duration-200 py-2 px-3 rounded-full space-x-1'
        }>
        <ArrowRightCircle
          className={
            'group-hover:stroke-black dark:group-hover:stroke-white w-6 h-6 transition-all duration-100'
          }
        />
        <div className='font-bold'>{text3}</div>
      </div>
    </SmartLink>
  )
}

/**
 * 欢迎语
 */
function GreetingsWords() {
  const greetings = normalizeInfoCardGreetings(
    siteConfig('HEO_INFOCARD_GREETINGS', null, CONFIG)
  )
  const [greeting, setGreeting] = useState(greetings[0])
  if (greetings.length === 0) {
    return null
  }
  // 每次点击，随机获取greetings中的一个
  const handleChangeGreeting = () => {
    const randomIndex = Math.floor(Math.random() * greetings.length)
    setGreeting(greetings[randomIndex])
  }

  return (
    <div
      onClick={handleChangeGreeting}
      className='w-fit self-start inline-flex select-none cursor-pointer py-1 px-2.5 bg-[var(--heo-color-primary-hover)] hover:bg-[var(--heo-color-card-muted)] hover:text-[var(--heo-color-text)] dark:bg-[var(--heo-color-accent)] dark:hover:text-white dark:hover:bg-black text-sm rounded-lg duration-200 transition-all'>
      {greeting}
    </div>
  )
}
