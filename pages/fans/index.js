import BLOG from '@/blog.config'
import { fetchGlobalAllData } from '@/lib/db/SiteDataApi'
import BlogPostCard from '@/themes/heo/components/BlogPostCard'
import { siteConfig } from '@/lib/config'

/**
 * 粉丝福利专区聚合首页
 * 路由：/fans
 * 免注册登录，输入暗号极速解锁阅读
 */
const FansIndex = props => {
  const { posts = [], siteInfo } = props

  const unlockTips = siteConfig(
    'HEO_FANS_UNLOCK_TIPS',
    '关注微信公众号【Terry校长】，后台回复【暗号】免费获取解锁验证码',
    props.NOTION_CONFIG
  )
  const contactUrl = siteConfig('HEO_SOCIAL_CARD_URL', 'https://pic1.imgdb.cn/i/034BfzDhRhxZqya8uJorEM.png', props.NOTION_CONFIG)

  return (
    <div className='w-full min-h-screen px-4 md:px-6 py-6 max-w-7xl mx-auto'>
      {/* 顶部粉丝专属横幅 */}
      <div className='w-full mb-8 relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-teal-950 to-emerald-950 text-white p-6 md:p-10 shadow-xl border border-teal-900/50'>
        {/* 背景光晕装饰 */}
        <div className='absolute -right-16 -top-16 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none' />
        <div className='absolute -left-16 -bottom-16 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl pointer-events-none' />

        <div className='relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6'>
          {/* 专区标题与介绍 */}
          <div className='max-w-2xl'>
            <div className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-400/20 border border-emerald-400/40 text-emerald-300 text-xs font-semibold mb-3'>
              <i className='fas fa-gift text-[11px]' />
              <span>TERRY 粉丝专属特权空间</span>
            </div>
            <h1 className='text-2xl md:text-4xl font-extrabold tracking-tight mb-2'>
              粉丝福利专区
            </h1>
            <p className='text-emerald-100/80 text-sm md:text-base leading-relaxed'>
              专为社群与公众号粉丝打造的轻量级知识库。无需繁琐注册登录，输入专属暗号即可免费解锁全部深度实战手册与干货源码。
            </p>
          </div>

          {/* 快速获取暗号卡片 */}
          <div className='w-full md:w-auto shrink-0'>
            <div className='bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 md:p-5 flex flex-col gap-3 min-w-[260px] shadow-lg'>
              <div className='flex items-center gap-2.5'>
                <div className='w-9 h-9 rounded-full bg-emerald-400 text-emerald-950 font-bold flex items-center justify-center text-sm shadow-sm'>
                  <i className='fas fa-key' />
                </div>
                <div>
                  <div className='font-bold text-sm text-white'>如何获取暗号？</div>
                  <div className='text-xs text-emerald-200/80 line-clamp-1'>免注册免登录秒看</div>
                </div>
              </div>

              <div className='text-xs text-emerald-100/90 leading-relaxed bg-black/20 p-2.5 rounded-xl border border-white/5'>
                {unlockTips}
              </div>

              {contactUrl && (
                <a
                  href={contactUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='w-full py-2 px-3 text-center text-xs font-semibold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 active:bg-emerald-500 rounded-xl transition-colors shadow-sm inline-flex items-center justify-center gap-1.5'>
                  <span>扫码获取公众号暗号</span>
                  <i className='fas fa-arrow-up-right-from-square text-[10px]' />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 专区文章列表区域 */}
      <div className='w-full'>
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center gap-2'>
            <span className='w-2.5 h-6 bg-emerald-500 rounded-full' />
            <h2 className='text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100'>
              粉丝专享文章列表
            </h2>
            <span className='ml-2 text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-medium'>
              共 {posts.length} 篇
            </span>
          </div>
        </div>

        {posts && posts.length > 0 ? (
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {posts.map((post, index) => (
              <BlogPostCard key={post.id || index} post={post} siteInfo={siteInfo} index={index} />
            ))}
          </div>
        ) : (
          <div className='w-full py-20 flex flex-col items-center justify-center text-center bg-white dark:bg-[#1e1e20] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm'>
            <div className='w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 flex items-center justify-center text-2xl mb-4'>
              <i className='fas fa-gift' />
            </div>
            <h3 className='text-lg font-bold text-gray-800 dark:text-gray-200 mb-1'>
              暂无粉丝专享文章
            </h3>
            <p className='text-sm text-gray-500 dark:text-gray-400 max-w-sm'>
              管理员在 Notion 博客库中勾选「fans」或填写「fans_code」字段即可将文章收录到粉丝福利专区。
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * 服务端静态/增量数据获取
 */
export async function getStaticProps() {
  const from = 'fans-index'
  const props = await fetchGlobalAllData({ from })

  // 筛选属于粉丝专区的文章（post.fans === true 或包含 post.fans_code）
  const allPosts = props?.allPages || []
  const fansPosts = allPosts.filter(post => {
    return Boolean(
      post?.type === 'Post' &&
      post?.status === 'Published' &&
      (post?.fans === true || post?.fans_code)
    )
  })

  return {
    props: {
      ...props,
      posts: fansPosts
    },
    revalidate: process.env.EXPORT
      ? undefined
      : siteConfig(
          'NEXT_REVALIDATE_SECOND',
          BLOG.NEXT_REVALIDATE_SECOND,
          props.NOTION_CONFIG
        )
  }
}

export default FansIndex
