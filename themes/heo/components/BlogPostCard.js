import LazyImage from '@/components/LazyImage'
import NotionIcon from './NotionIcon'
import { siteConfig } from '@/lib/config'
import SmartLink from '@/components/SmartLink'
import CONFIG from '../config'
import TagItemMini from './TagItemMini'

const BlogPostCard = ({ index, post, showSummary, siteInfo }) => {
  const showPreview =
    siteConfig('HEO_POST_LIST_PREVIEW', null, CONFIG) && post.blockMap
  if (
    post &&
    !post.pageCoverThumbnail &&
    siteConfig('HEO_POST_LIST_COVER_DEFAULT', null, CONFIG)
  ) {
    post.pageCoverThumbnail = siteInfo?.pageCover
  }
  const showPageCover =
    siteConfig('HEO_POST_LIST_COVER', null, CONFIG) &&
    post?.pageCoverThumbnail &&
    !showPreview

  const POST_TWO_COLS = siteConfig('HEO_HOME_POST_TWO_COLS', true, CONFIG)
  const COVER_HOVER_ENLARGE = siteConfig(
    'HEO_POST_LIST_COVER_HOVER_ENLARGE',
    true,
    CONFIG
  )

  return (
    <article
      className={`${COVER_HOVER_ENLARGE ? 'hover:transition-all duration-150' : ''}`}>
      <div
        data-wow-delay='.2s'
        className={
          (POST_TWO_COLS ? '2xl:h-96 2xl:flex-col' : '') +
          ' wow fadeInUp border bg-[var(--heo-color-card)] dark:bg-[var(--heo-color-card-dark)] flex mb-4 flex-col h-[23rem] md:h-52 md:flex-row  group w-full dark:border-gray-600 hover:border-[var(--heo-color-border)] dark:hover:border-[var(--heo-color-border-dark)] duration-300 transition-colors justify-between overflow-hidden rounded-xl'
        }>
        {/* 图片封面 */}
        {showPageCover && (
          <SmartLink href={post?.href} passHref legacyBehavior>
            <div
              className={
                (POST_TWO_COLS ? ' 2xl:w-full' : '') +
                ' relative w-full md:w-5/12 overflow-hidden cursor-pointer select-none'
              }>
              {/* 角标展示优先级：粉丝专享 > SVIP尊享 > VIP专享 */}
              {post?.fans ? (
                <div className='absolute top-2.5 left-2.5 z-10 flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[11px] font-bold shadow-md backdrop-blur-xs'>
                  <i className='fas fa-gift text-[10px]' />
                  <span>粉丝专享</span>
                </div>
              ) : post?.vip_level === 'SVIP' ? (
                <div className='absolute top-2.5 left-2.5 z-10 flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-500 text-white text-[11px] font-bold shadow-md backdrop-blur-xs'>
                  <i className='fas fa-gem text-[10px]' />
                  <span>SVIP 尊享</span>
                </div>
              ) : post?.vip ? (
                <div className='absolute top-2.5 left-2.5 z-10 flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-[11px] font-bold shadow-md backdrop-blur-xs'>
                  <i className='fas fa-crown text-[10px]' />
                  <span>VIP 专享</span>
                </div>
              ) : null}
              <LazyImage
                priority={index === 0}
                src={post?.pageCoverThumbnail}
                alt={post?.title}
                className='h-full w-full object-cover group-hover:scale-105 group-hover:brightness-75 transition-all duration-500 ease-in-out' //宽高都调整为自适应,保证封面居中
              />
            </div>
          </SmartLink>
        )}

        {/* 文字区块 */}
        <div
          className={
            (POST_TWO_COLS ? '2xl:p-4 2xl:h-48 2xl:w-full' : '') +
            ' flex p-6  flex-col justify-between h-48 md:h-full w-full md:w-7/12'
          }>
          <header>
            {/* 分类与会员/粉丝专享标记 */}
            <div className='flex mb-1 items-center justify-start flex-wrap gap-1.5'>
              {post?.fans ? (
                <span className='inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-md bg-emerald-500/10 dark:bg-emerald-400/20 text-emerald-600 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 shadow-xs select-none'>
                  <i className='fas fa-gift text-[10px]' />
                  粉丝专享
                </span>
              ) : post?.vip_level === 'SVIP' ? (
                <span className='inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-md bg-purple-500/10 dark:bg-purple-400/20 text-purple-600 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 shadow-xs select-none'>
                  <i className='fas fa-gem text-[10px]' />
                  SVIP 尊享
                </span>
              ) : post?.vip ? (
                <span className='inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-md bg-amber-500/10 dark:bg-amber-400/20 text-amber-600 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 shadow-xs select-none'>
                  <i className='fas fa-crown text-[10px]' />
                  会员专享
                </span>
              ) : null}
              {post?.category && (
                <div
                  className={`flex items-center ${showPreview ? 'justify-center' : 'justify-start'} hidden md:block dark:text-gray-300 text-gray-600 hover:text-[var(--heo-color-primary)] dark:hover:text-[var(--heo-color-accent)]`}>
                  <SmartLink
                    passHref
                    href={`/category/${post.category}`}
                    className='cursor-pointer text-xs font-normal menu-link '>
                    {post.category}
                  </SmartLink>
                </div>
              )}
            </div>

            {/* 标题和图标 */}
            <SmartLink
              href={post?.href}
              passHref
              className={
                ' group-hover:text-[var(--heo-color-primary)] dark:hover:text-[var(--heo-color-accent)] dark:group-hover:text-[var(--heo-color-accent)] text-black dark:text-gray-100  line-clamp-2 replace cursor-pointer text-xl font-extrabold leading-tight'
              }>
              {siteConfig('POST_TITLE_ICON') && (
                <NotionIcon
                icon={post.pageIcon}
                className="heo-icon w-6 h-6 mr-1 align-middle transform translate-y-[-8%]" // 专门为 Heo 主题的图标设置样式
              />
              )}
              <span className='menu-link '>{post.title}</span>
            </SmartLink>
          </header>

          {/* 摘要 */}
          {(!showPreview || showSummary) && (
            <main className='line-clamp-2 replace text-gray-700  dark:text-gray-300 text-sm font-light leading-tight'>
              {post.summary}
            </main>
          )}

          <div className='flex items-center justify-between mt-2 text-xs text-gray-400 dark:text-gray-500'>
            <div className='md:flex-nowrap flex-wrap md:justify-start inline-flex items-center gap-1'>
              {post.tagItems?.map(tag => (
                <TagItemMini key={tag.name} tag={tag} />
              ))}
            </div>

            {/* 发布时间 */}
            {(post?.publishDay || post?.date?.start_date) && (
              <span className='whitespace-nowrap flex items-center font-light text-xs text-gray-400 dark:text-gray-500'>
                <i className='far fa-calendar-alt mr-1'></i>
                {post?.publishDay || post?.date?.start_date}
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}

export default BlogPostCard
