import { siteConfig } from '@/lib/config'

/**
 * 顶部导航栏 RSS 订阅按钮
 */
export default function RssButton() {
  const enableRss = siteConfig('ENABLE_RSS')
  if (!enableRss) {
    return null
  }

  return (
    <a
      href='/rss/feed.xml'
      target='_blank'
      rel='noreferrer'
      title='RSS 订阅'
      aria-label='RSS 订阅'
      className='cursor-pointer hover:bg-black hover:bg-opacity-10 rounded-full w-10 h-10 flex items-center justify-center duration-200 transition-all text-current'>
      <svg
        className='w-[17px] h-[17px] fill-current'
        viewBox='0 0 24 24'
        xmlns='http://www.w3.org/2000/svg'>
        <path d='M6.18 15.64a2.18 2.18 0 1 1-2.18 2.18 2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-3.33A12.23 12.23 0 0 0 4 7.77zm0 5.56A10 10 0 0 1 14 20h-3.33A6.67 6.67 0 0 0 4 13.33z' />
      </svg>
    </a>
  )
}
