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

      {/* 公告栏（支持文字、Emoji、图片、超链接等富文本混排） */}
      {showNotice && (
        customNotice ? (
          <div id='announcement-content' className='text-sm text-white/95 my-2.5 leading-relaxed font-normal'>
            <RichNoticeRenderer content={customNotice} defaultUrl={announcementUrl} />
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

/**
 * 轻量级富文本公告渲染组件
 * 支持 Markdown 语法：[链接文字](url)、![图片描述](url)、**加粗**、Emoji 与多行混排
 */
export function RichNoticeRenderer({ content, defaultUrl }) {
  if (!content || typeof content !== 'string') return null
  const trimmed = content.trim()

  // 1. 如果整段内容就是一个纯图片 URL（且没有回车换行）
  const isPureImageUrl = /^https?:\/\/[^\s]+\.(jpg|jpeg|png|webp|gif|svg)(\?[^\s]*)?$/i.test(trimmed)
  if (isPureImageUrl) {
    return (
      <SmartLink href={defaultUrl || trimmed} className='block cursor-pointer hover:opacity-90 transition'>
        <img
          src={trimmed}
          alt='公告配图'
          className='rounded-xl max-h-32 w-full object-cover shadow-sm'
        />
      </SmartLink>
    )
  }

  // 2. 按行渲染富文本（严格保留用户输入的空格缩进与换行）
  const lines = content.split('\n')

  return (
    <div className='space-y-1.5 leading-relaxed text-sm whitespace-pre-wrap font-sans'>
      {lines.map((line, idx) => {
        const trimmedLine = line.trim()
        if (!trimmedLine) {
          return <div key={idx} className='h-2' />
        }

        // 如果该行单独是一个图片链接
        const pureImgMatch = trimmedLine.match(/^https?:\/\/[^\s]+\.(jpg|jpeg|png|webp|gif|svg)(\?[^\s]*)?$/i)
        if (pureImgMatch) {
          return (
            <div key={idx} className='my-1.5'>
              <img src={trimmedLine} alt='公告配图' className='rounded-lg max-h-24 w-auto object-cover border border-white/20 shadow-sm' />
            </div>
          )
        }

        return (
          <div key={idx} className='break-words whitespace-pre-wrap'>
            {renderLineTokens(line, defaultUrl)}
          </div>
        )
      })}
    </div>
  )
}

/**
 * 解析单行中的 Markdown 标记：![alt](url)、[text](url)、**bold**、裸链接
 */
function renderLineTokens(lineText, defaultUrl) {
  // 正则匹配：1.图片 ![alt](url) 2.链接 [text](url) 3.加粗 **text** 4.裸链接 https?://...
  const tokenRegex = /(!\[(.*?)\]\((.*?)\))|(\[(.*?)\]\((.*?)\))|(\*\*(.*?)\*\*)|(https?:\/\/[^\s<]+)/g
  const elements = []
  let lastIndex = 0
  let match
  let keyCount = 0

  while ((match = tokenRegex.exec(lineText)) !== null) {
    const matchIndex = match.index
    // 填充匹配前的纯文本
    if (matchIndex > lastIndex) {
      elements.push(lineText.slice(lastIndex, matchIndex))
    }

    const fullMatch = match[0]

    if (fullMatch.startsWith('![')) {
      // 1. Markdown 图片: ![alt](url)
      const alt = match[2] || '配图'
      const src = match[3]
      elements.push(
        <span key={keyCount++} className='inline-block my-1'>
          <img src={src} alt={alt} className='rounded-lg max-h-24 object-cover border border-white/20 shadow-sm' />
        </span>
      )
    } else if (fullMatch.startsWith('[')) {
      // 2. Markdown 链接: [text](url)
      const linkText = match[5] || '链接'
      const href = match[6]
      elements.push(
        <SmartLink
          key={keyCount++}
          href={href}
          className='underline underline-offset-2 hover:text-white font-medium text-white/95 hover:opacity-100 transition inline-flex items-center gap-0.5'
        >
          <span>{linkText}</span>
          <i className='fas fa-arrow-up-right-from-square text-[10px] opacity-70 ml-0.5' />
        </SmartLink>
      )
    } else if (fullMatch.startsWith('**')) {
      // 3. Markdown 加粗: **text**
      const boldText = match[8]
      elements.push(
        <strong key={keyCount++} className='font-bold text-white'>
          {boldText}
        </strong>
      )
    } else if (fullMatch.startsWith('http://') || fullMatch.startsWith('https://')) {
      // 4. 裸链接
      const rawUrl = fullMatch
      elements.push(
        <SmartLink
          key={keyCount++}
          href={rawUrl}
          className='underline underline-offset-2 hover:text-white font-medium text-white/90 truncate max-w-[200px] inline-block align-bottom'
        >
          {rawUrl.replace(/^https?:\/\//, '')}
        </SmartLink>
      )
    }

    lastIndex = tokenRegex.lastIndex
  }

  // 填充剩余纯文本
  if (lastIndex < lineText.length) {
    elements.push(lineText.slice(lastIndex))
  }

  // 如果这一行是普通文字且没有内部链接，但是有全局 defaultUrl，提供平滑链接支持
  if (elements.length === 1 && typeof elements[0] === 'string' && defaultUrl) {
    return (
      <SmartLink href={defaultUrl} className='hover:underline hover:text-white transition font-normal'>
        {elements[0]}
      </SmartLink>
    )
  }

  return elements.length > 0 ? elements : lineText
}
