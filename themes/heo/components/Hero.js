// import Image from 'next/image'
import { ArrowSmallRight, PlusSmall } from '@/components/HeroIcons'
import LazyImage from '@/components/LazyImage'
import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'
import SmartLink from '@/components/SmartLink'
import { useRouter } from 'next/router'
import { useImperativeHandle, useRef, useState } from 'react'
import CONFIG from '../config'

/**
 * 顶部英雄区
 * 左右布局，
 * 左侧：banner组
 * 右侧：今日卡牌遮罩
 * @returns
 */
const Hero = props => {
  const HEO_HERO_REVERSE = siteConfig('HEO_HERO_REVERSE', false, CONFIG)
  return (
    <div
      id='hero-wrapper'
      className='recent-top-post-group w-full overflow-hidden select-none px-5 mb-4'>
      <div
        id='hero'
        style={{ zIndex: 1 }}
        className={`${HEO_HERO_REVERSE ? 'xl:flex-row-reverse' : ''}
           recent-post-top rounded-[12px] 2xl:px-5 recent-top-post-group max-w-[86rem] overflow-x-scroll w-full mx-auto flex-row flex-nowrap flex relative`}>
        {/* 左侧banner组 */}
        <BannerGroup {...props} />

        {/* 中间留白 */}
        <div className='px-1.5 h-full'></div>

        {/* 右侧置顶文章组 */}
        <TopGroup {...props} />
      </div>
    </div>
  )
}

/**
 * 英雄区左侧banner组
 * @returns
 */
function BannerGroup(props) {
  return (
    // 左侧英雄区
    <div
      id='bannerGroup'
      className='flex flex-col justify-between flex-1 mr-2 max-w-[42rem]'>
      {/* 动图 */}
      <Banner {...props} />
      {/* 导航分类 */}
      <GroupMenu />
    </div>
  )
}

/**
 * 英雄区左上角banner动图
 * @returns
 */
function Banner(props) {
  const router = useRouter()
  const { allNavPages } = props
  /**
   * 随机跳转文章
   */
  function handleClickBanner() {
    const list = Array.isArray(allNavPages) && allNavPages.length > 0 ? allNavPages : (Array.isArray(props.posts) ? props.posts : [])
    if (list.length === 0) return
    const randomIndex = Math.floor(Math.random() * list.length)
    const randomPost = list[randomIndex]
    if (randomPost?.slug) {
      router.push(`${siteConfig('SUB_PATH', '')}/${randomPost.slug}`)
    }
  }

  // 遮罩文字
  const coverTitle = siteConfig('HEO_HERO_COVER_TITLE')

  return (
    <div
      id='banners'
      onClick={handleClickBanner}
        className='hidden xl:flex xl:flex-col group h-full bg-[var(--heo-color-card)] dark:bg-[var(--heo-color-card-dark)] rounded-xl border dark:border-gray-700 mb-3 relative overflow-hidden'>
      <div
        id='banner-title'
        className='z-10 flex flex-col absolute top-10 left-10'>
        <div className='text-4xl font-bold mb-3  dark:text-white'>
          {siteConfig('HEO_HERO_TITLE_1', null, CONFIG)}
          <br />
          {siteConfig('HEO_HERO_TITLE_2', null, CONFIG)}
        </div>
        <div className='text-xs text-gray-600  dark:text-gray-200'>
          {siteConfig('HEO_HERO_TITLE_3', null, CONFIG)}
        </div>
      </div>

      {/* 斜向滚动的图标 */}
      <TagsGroupBar />

      {/* 遮罩 */}
      <div
        id='banner-cover'
        style={{ backdropFilter: 'blur(15px)' }}
        className={
          'z-20 rounded-xl overflow-hidden opacity-0 group-hover:opacity-100 duration-300 transition-all bg-[var(--heo-color-primary)] dark:bg-[var(--heo-color-accent)] dark:text-white cursor-pointer absolute w-full h-full top-0 flex justify-start items-center'
        }>
        <div className='ml-12 -translate-x-32 group-hover:translate-x-0 duration-300 transition-all ease-in'>
          <div className='text-7xl text-white font-extrabold'>{coverTitle}</div>
          <div className='-ml-3 text-gray-300'>
            <ArrowSmallRight className={'w-24 h-24 stroke-2'} />
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * 图标滚动标签组
 * 英雄区左上角banner条中斜向滚动的图标
 */
function TagsGroupBar() {
  let groupIcons = siteConfig('HEO_GROUP_ICONS', null, CONFIG)
  if (groupIcons) {
    groupIcons = groupIcons.concat(groupIcons)
  }
  return (
    <div className='tags-group-all flex -rotate-[30deg] h-full'>
      <div className='tags-group-wrapper flex flex-nowrap absolute top-16'>
        {groupIcons?.map((g, index) => {
          return (
            <div key={index} className='tags-group-icon-pair ml-6 select-none'>
              <div
                style={{ background: g.color_1 }}
                className={
                  'tags-group-icon w-28 h-28 rounded-3xl flex items-center justify-center text-white text-lg font-bold shadow-md'
                }>
                <LazyImage
                  priority={true}
                  src={g.img_1}
                  title={g.title_1}
                  className='w-2/3 hidden xl:block'
                />
              </div>
              <div
                style={{ background: g.color_2 }}
                className={
                  'tags-group-icon  mt-5 w-28 h-28 rounded-3xl flex items-center justify-center text-white text-lg font-bold shadow-md'
                }>
                <LazyImage
                  priority={true}
                  src={g.img_2}
                  title={g.title_2}
                  className='w-2/3 hidden xl:block'
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/**
 * 英雄区左下角3个指定分类按钮
 * @returns
 */
function GroupMenu() {
  // 动态读取配置中的分类卡片
  const categories = []
  for (let i = 1; i <= 6; i++) {
    const cat = siteConfig(`HEO_HERO_CATEGORY_${i}`, null, CONFIG)
    if (cat && cat.title && cat.url) {
      categories.push(cat)
    }
  }

  if (categories.length === 0) return null

  // 预设的颜色和图标样式组
  const styles = [
    { bg: 'bg-[var(--heo-color-primary)] text-[var(--heo-color-primary-text)]', icon: 'fa-star' },
    { bg: 'bg-gradient-to-r from-red-500 to-yellow-500 text-white', icon: 'fa-fire-flame-curved' },
    { bg: 'bg-gradient-to-r from-teal-300 to-cyan-300 text-white', icon: 'fa-book-bookmark' },
    { bg: 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white', icon: 'fa-compass' },
    { bg: 'bg-gradient-to-r from-pink-500 to-rose-500 text-white', icon: 'fa-heart' },
    { bg: 'bg-gradient-to-r from-emerald-400 to-green-500 text-white', icon: 'fa-leaf' },
  ]

  const count = categories.length

  return (
    <div className='select-none grid grid-cols-2 md:grid-cols-3 xl:flex xl:flex-row xl:flex-nowrap gap-3 xl:w-full'>
      {categories.map((c, index) => {
        const style = styles[index % styles.length]
        return (
          <SmartLink
            key={index}
            href={c.url}
            className={`group relative overflow-hidden flex h-20 w-full justify-start items-center rounded-xl transition-all duration-300 ease-out ${style.bg} ${
              count <= 3
                ? 'xl:flex-1 xl:hover:flex-[1.5]'
                : 'xl:flex-1 xl:hover:flex-[1.35] xl:min-w-[110px]'
            }`}>
            <div className='font-bold text-sm sm:text-base lg:text-base xl:text-lg px-3.5 relative -mt-1 whitespace-nowrap overflow-hidden text-ellipsis z-10 max-w-full'>
              <span className='truncate block'>{c.title}</span>
              <span className='absolute -bottom-1 left-3.5 w-5 h-0.5 bg-white rounded-full'></span>
            </div>
            <div className='hidden lg:block absolute right-2.5 duration-500 ease-out transition-all scale-[1.5] translate-y-4 rotate-12 opacity-20 group-hover:opacity-60 group-hover:scale-100 group-hover:translate-y-0 group-hover:rotate-0 pointer-events-none'>
              <i className={`fa-solid ${style.icon} text-3xl`}></i>
            </div>
          </SmartLink>
        )
      })}
    </div>
  )
}

/**
 * 置顶文章区域
 */
function TopGroup(props) {
  const { latestPosts, allNavPages, siteInfo } = props
  const { locale } = useGlobal()
  const todayCardRef = useRef()
  function handleMouseLeave() {
    todayCardRef.current.coverUp()
  }

  // 获取置顶推荐文章
  const topPosts = getTopPosts({ latestPosts, allNavPages })

  return (
    <div
      id='hero-right-wrapper'
      onMouseLeave={handleMouseLeave}
      className='flex-1 relative w-full'>
      {/* 置顶推荐文章 */}
      <div
        id='top-group'
        className='w-full flex space-x-3 xl:space-x-0 xl:grid xl:grid-cols-3 xl:gap-3 xl:h-[342px]'>
        {topPosts?.map((p, index) => {
          return (
            <SmartLink href={`${siteConfig('SUB_PATH', '')}/${p?.slug}`} key={index}>
              <div className='cursor-pointer h-[164px] group relative flex flex-col w-52 xl:w-full overflow-hidden shadow bg-white dark:bg-black dark:text-white rounded-xl'>
                <LazyImage
                  priority={index === 0}
                  className='h-24 object-cover'
                  alt={p?.title}
                  src={p?.pageCoverThumbnail || siteInfo?.pageCover}
                />
                <div className='group-hover:text-[var(--heo-color-primary)] dark:group-hover:text-[var(--heo-color-accent)] line-clamp-2 overflow-hidden m-2 font-semibold'>
                  {p?.title}
                </div>
                {/* hover 悬浮的 ‘荐’ 字 */}
                <div className='opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 duration-200 transition-all absolute -top-2 -left-2 bg-[var(--heo-color-primary)] dark:bg-[var(--heo-color-accent)] text-[var(--heo-color-primary-text)] rounded-xl overflow-hidden pr-2 pb-2 pl-4 pt-4 text-xs'>
                  {locale.COMMON.RECOMMEND_BADGES}
                </div>
              </div>
            </SmartLink>
          )
        })}
      </div>
      {/* 一个大的跳转文章卡片 */}
      <TodayCard cRef={todayCardRef} siteInfo={siteInfo} />
    </div>
  )
}

/**
 * 获取推荐置顶文章
 */
function getTopPosts({ latestPosts = [], allNavPages = [] }) {
  const posts = Array.isArray(allNavPages) ? [...allNavPages] : (Array.isArray(latestPosts) ? [...latestPosts] : [])
  const recommendTag = siteConfig('HEO_HERO_RECOMMEND_POST_TAG', null, CONFIG)
  if (!recommendTag || recommendTag === '') {
    return Array.isArray(latestPosts) ? latestPosts : []
  }

  let sortPosts = [...posts]
  const sortByUpdateTime = siteConfig('HEO_HERO_RECOMMEND_POST_SORT_BY_UPDATE_TIME', false, CONFIG)
  if (sortByUpdateTime === true || sortByUpdateTime === 'true') {
    sortPosts.sort((a, b) => {
      const dateA = new Date(a?.lastEditedDate || a?.publishDate || 0)
      const dateB = new Date(b?.lastEditedDate || b?.publishDate || 0)
      return dateB - dateA
    })
  }

  const topPosts = []
  for (const post of sortPosts) {
    if (topPosts.length === 6) break
    if (post?.tags && Array.isArray(post.tags) && post.tags.includes(recommendTag)) {
      topPosts.push(post)
    }
  }
  return topPosts.length > 0 ? topPosts : (Array.isArray(latestPosts) ? latestPosts.slice(0, 6) : [])
}

/**
 * 英雄区右侧，今日卡牌
 * @returns
 */
function TodayCard({ cRef, siteInfo }) {
  const router = useRouter()
  const link = siteConfig('HEO_HERO_TITLE_LINK', null, CONFIG)
  const { locale } = useGlobal()
  // 获取遮罩控制配置
  const coverEnable = siteConfig('HEO_HERO_RECOMMEND_COVER_ENABLE', true, CONFIG)
  // 卡牌是否盖住下层，如果配置为false则默认不盖住
  const [isCoverUp, setIsCoverUp] = useState(coverEnable)

  /**
   * 外部可以调用此方法
   */
  useImperativeHandle(cRef, () => {
    return {
      coverUp: () => {
        if (coverEnable) {
          setIsCoverUp(true)
        }
      }
    }
  })

  /**
   * 查看更多
   * @param {*} e
   */
  function handleClickShowMore(e) {
    e.stopPropagation()
    setIsCoverUp(false)
  }

  /**
   * 点击卡片跳转的链接
   * @param {*} e
   */
  function handleCardClick(e) {
    router.push(link)
  }

  // 如果配置为不显示遮罩，则不渲染TodayCard
  if (!coverEnable) {
    return null
  }

  return (
    <div
      id='today-card'
      className={`${
        isCoverUp ? ' ' : 'pointer-events-none'
      } overflow-hidden absolute hidden xl:flex flex-1 flex-col h-full top-0 w-full`}>
      <div
        id='card-body'
        onClick={handleCardClick}
        className={`${
          isCoverUp
            ? 'opacity-100 cursor-pointer'
            : 'opacity-0 transform scale-110 pointer-events-none'
        } shadow transition-all duration-200 today-card h-full bg-black rounded-xl relative overflow-hidden flex items-end`}>
        {/* 卡片文字信息 */}
        <div
          id='today-card-info'
          className='flex justify-between w-full relative text-white p-10 items-end'>
          <div className='flex flex-col'>
            <div className='text-xs font-light'>
              {siteConfig('HEO_HERO_TITLE_4', null, CONFIG)}
            </div>
            <div className='text-3xl font-bold'>
              {siteConfig('HEO_HERO_TITLE_5', null, CONFIG)}
            </div>
          </div>
          {/* 查看更多的按钮 */}
          <div
            onClick={handleClickShowMore}
            className={`'${isCoverUp ? '' : 'hidden pointer-events-none'} z-10 group flex items-center px-3 h-10 justify-center  rounded-3xl
            glassmorphism transition-colors duration-100 `}>
            <PlusSmall
              className={
                'group-hover:rotate-180 duration-500 transition-all w-6 h-6 mr-2 bg-white rounded-full stroke-black'
              }
            />
            <div id='more' className='select-none'>
              {locale.COMMON.RECOMMEND_POSTS}
            </div>
          </div>
        </div>

        {/* 封面图 */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={siteConfig('HEO_HERO_RECOMMEND_COVER', null, CONFIG) || siteInfo?.pageCover}
          id='today-card-cover'
          className={`${
            isCoverUp ? '' : ' pointer-events-none'
          } hover:scale-110 duration-1000 object-cover cursor-pointer today-card-cover absolute w-full h-full top-0`}
        />
      </div>
    </div>
  )
}

export default Hero
