import { ChevronDoubleLeft, ChevronDoubleRight } from '@/components/HeroIcons'
import { useGlobal } from '@/lib/global'
import SmartLink from '@/components/SmartLink'
import { useRouter } from 'next/router'
import { useRef, useState, useEffect } from 'react'
import { siteConfig } from '@/lib/config'
import CONFIG from '../config'

/**
 * 博客列表上方嵌入条
 * @param {*} props
 * @returns
 */
export default function CategoryBar(props) {
  const { categoryOptions, border = true } = props
  const { locale } = useGlobal()
  const categoryBarItemsRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  // 检查横向滚动状态
  const checkScroll = () => {
    if (categoryBarItemsRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = categoryBarItemsRef.current
      setCanScrollLeft(scrollLeft > 5)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5)
    }
  }

  useEffect(() => {
    checkScroll()
    window.addEventListener('resize', checkScroll)
    return () => window.removeEventListener('resize', checkScroll)
  }, [categoryOptions])

  // 支持鼠标滚轮直接在横条上左右滚动
  const handleWheel = (e) => {
    if (categoryBarItemsRef.current) {
      if (e.deltaY !== 0) {
        categoryBarItemsRef.current.scrollLeft += e.deltaY
        checkScroll()
      }
    }
  }

  // 向左平滑滚动
  const handleScrollLeft = (e) => {
    e?.stopPropagation()
    e?.preventDefault()
    if (categoryBarItemsRef.current) {
      categoryBarItemsRef.current.scrollBy({ left: -220, behavior: 'smooth' })
      setTimeout(checkScroll, 300)
    }
  }

  // 向右平滑滚动 (步进滑动)
  const handleScrollRight = (e) => {
    e?.stopPropagation()
    e?.preventDefault()
    if (categoryBarItemsRef.current) {
      categoryBarItemsRef.current.scrollBy({ left: 220, behavior: 'smooth' })
      setTimeout(checkScroll, 300)
    }
  }

  return (
    <div
      id='category-bar'
      className={`wow fadeInUp flex flex-nowrap justify-between items-center h-12 mb-4 space-x-2 w-full lg:bg-[var(--heo-color-card)] dark:lg:bg-[var(--heo-color-card-dark)]
            ${border ? 'lg:border lg:hover:border dark:lg:border-gray-800 hover:border-[var(--heo-color-border)] dark:hover:border-[var(--heo-color-border-dark)] ' : ''} py-2 px-3 rounded-xl transition-colors duration-200 select-none`}>
      
      {/* 左侧平滑回滑按钮（向右滑过后自动出现） */}
      {canScrollLeft && (
        <button
          type='button'
          onClick={handleScrollLeft}
          title='向左滑动'
          className='flex-shrink-0 w-7 h-7 rounded-full bg-gray-100 hover:bg-[var(--heo-color-primary)] hover:text-white dark:bg-gray-800 dark:hover:bg-[var(--heo-color-accent)] flex items-center justify-center transition-all duration-200 shadow-sm mr-1 cursor-pointer z-10'>
          <ChevronDoubleLeft className='w-4 h-4' />
        </button>
      )}

      {/* 分类快捷标签列表（支持鼠标滚轮、手势拖拉滑动） */}
      <div
        id='category-bar-items'
        ref={categoryBarItemsRef}
        onWheel={handleWheel}
        onScroll={checkScroll}
        className='scroll-smooth flex-1 rounded-lg scroll-hidden flex justify-start flex-nowrap items-center overflow-x-auto no-scrollbar'>
        <MenuItem href='/' name={locale?.NAV?.INDEX || '首页'} />
        {/* 会员专区专属 Tab 快捷入口 */}
        {Boolean(siteConfig('HEO_CATEGORY_BAR_VIP', true, CONFIG)) && (
          <MenuItem
            href='/vip'
            isVip
            name={
              <span className='inline-flex items-center gap-1 text-amber-500 dark:text-amber-400 font-extrabold'>
                <i className='fas fa-crown text-[11px]' />
                <span>{siteConfig('HEO_CATEGORY_BAR_VIP_TITLE', '会员专区', CONFIG)}</span>
              </span>
            }
          />
        )}
        {categoryOptions?.map((c, index) => (
          <MenuItem key={index} href={`/category/${c.name}`} name={c.name} />
        ))}
      </div>

      {/* 右侧交互区：独立滑动按钮 + 全部分类跳转链接 */}
      <div id='category-bar-next' className='flex items-center space-x-2 flex-shrink-0 pl-2'>
        {/* 向右滑动按钮 (仅执行平滑滑动，绝不跳转) */}
        <button
          type='button'
          onClick={handleScrollRight}
          title='向右滑动查看更多'
          className='w-7 h-7 rounded-full bg-gray-100 hover:bg-[var(--heo-color-primary)] hover:text-white dark:bg-gray-800 dark:hover:bg-[var(--heo-color-accent)] flex items-center justify-center transition-all duration-200 shadow-sm cursor-pointer'>
          <ChevronDoubleRight className='w-4 h-4' />
        </button>

        {/* 独立分割线 */}
        <div className='h-4 w-[1px] bg-gray-200 dark:bg-gray-700' />
        
        {/* 全部分类独立跳转入口 */}
        <SmartLink
          href='/category'
          title='查看全部分类'
          className='whitespace-nowrap text-xs font-bold text-gray-700 dark:text-gray-200 hover:text-[var(--heo-color-primary)] dark:hover:text-[var(--heo-color-accent)] transition-colors duration-200 px-1 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-0.5'>
          <span>{locale?.COMMON?.CATEGORY || '全部分类'}</span>
          <span className='text-[10px] text-gray-400'>❯</span>
        </SmartLink>
      </div>
    </div>
  )
}

/**
 * 按钮
 * @param {*} param0
 * @returns
 */
const MenuItem = ({ href, name, isVip }) => {
  const router = useRouter()
  const { category } = router.query
  const selected = (category && category === name) || (href === '/vip' && router.asPath?.startsWith('/vip'))
  return (
    <div
      className={`whitespace-nowrap mr-2 duration-200 transition-all font-bold px-2.5 py-0.5 rounded-lg text-gray-900 dark:text-white hover:text-[var(--heo-color-primary-text)] hover:bg-[var(--heo-color-primary)] dark:hover:bg-[var(--heo-color-accent)] ${selected ? 'text-[var(--heo-color-primary-text)] bg-[var(--heo-color-primary)] dark:bg-[var(--heo-color-accent)]' : ''} ${isVip && !selected ? 'border border-amber-300/70 dark:border-amber-700/50 bg-amber-500/10 dark:bg-amber-400/15 hover:border-transparent' : ''}`}>
      <SmartLink href={href}>{name}</SmartLink>
    </div>
  )
}
