import BLOG from '@/blog.config'
import { fetchGlobalAllData } from '@/lib/db/SiteDataApi'
import { useMember } from '@/hooks/useMember'
import BlogPostCard from '@/themes/heo/components/BlogPostCard'
import { siteConfig } from '@/lib/config'

/**
 * 会员专区聚合首页
 * 路由：/vip
 */
const VipIndex = props => {
  const { posts = [], siteInfo } = props
  const {
    member,
    isLoggedIn,
    loading: memberLoading,
    openAuthModal,
    logout
  } = useMember()

  const vipIcon = siteConfig('HEO_VIP_ICON', '👑', props.NOTION_CONFIG)
  const vipColor = siteConfig('HEO_VIP_COLOR', '#f59e0b', props.NOTION_CONFIG)
  const vipColorEnd = siteConfig('HEO_VIP_COLOR_END', '#eab308', props.NOTION_CONFIG)

  return (
    <div className='w-full min-h-screen px-4 md:px-6 py-6 max-w-7xl mx-auto'>
      {/* 顶部会员专属横幅与信息卡片 */}
      <div className='w-full mb-8 relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white p-6 md:p-10 shadow-xl border border-indigo-900/50'>
        {/* 背景光晕装饰 */}
        <div className='absolute -right-16 -top-16 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none' />
        <div className='absolute -left-16 -bottom-16 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none' />

        <div className='relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6'>
          {/* 专区标题与介绍 */}
          <div className='max-w-2xl'>
            <div className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-semibold mb-3'>
              <span>{vipIcon}</span>
              <span>TERRY 专属会员空间</span>
            </div>
            <h1 className='text-2xl md:text-4xl font-extrabold tracking-tight mb-2 flex items-center gap-2'>
              <span>{vipIcon}</span>
              <span>会员深度专区</span>
            </h1>
            <p className='text-indigo-200/80 text-sm md:text-base leading-relaxed'>
              这里汇集全站精选深度文章、实战课程、源码资源与前沿 AI 解锁指南。专为会员持续输出核心干货。
            </p>
          </div>

          {/* 会员状态操作区 */}
          <div className='w-full md:w-auto shrink-0'>
            {!memberLoading && isLoggedIn && member ? (
              // 已登录会员信息卡片
              <div className='bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 md:p-5 flex flex-col gap-3 min-w-[260px] shadow-lg'>
                <div className='flex items-center justify-between gap-3'>
                  <div className='flex items-center gap-2.5'>
                    <div className='w-9 h-9 rounded-full bg-amber-400 text-amber-950 font-bold flex items-center justify-center text-sm shadow-sm'>
                      {member.username.slice(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <div className='font-bold text-sm text-white flex items-center gap-1.5'>
                        <span>{member.username}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${member.level === 'SVIP' ? 'bg-gradient-to-r from-purple-500 to-amber-400 text-white shadow-xs' : 'bg-amber-400/30 text-amber-300'}`}>
                          {member.level === 'SVIP' ? 'SVIP 尊享' : 'VIP 会员'}
                        </span>
                      </div>
                      <div className='text-xs text-indigo-200/70'>
                        {member.expireDate ? `有效期至: ${member.expireDate}` : '终身会员'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className='pt-2 border-t border-white/10 flex items-center justify-between text-xs'>
                  <span className='text-emerald-400 flex items-center gap-1'>
                    <span className='w-2 h-2 rounded-full bg-emerald-400 animate-pulse' />
                    会员权益已激活
                  </span>
                  <button
                    onClick={() => {
                      void logout()
                    }}
                    className='text-xs text-indigo-300 hover:text-white transition-colors cursor-pointer'>
                    退出登录
                  </button>
                </div>
              </div>
            ) : (
              // 未登录引导卡片
              <div className='flex flex-col sm:flex-row md:flex-col gap-2.5 w-full sm:w-auto'>
                <button
                  onClick={() => openAuthModal('login')}
                  className='px-6 py-3 rounded-xl text-sm font-semibold bg-white text-indigo-950 hover:bg-indigo-50 active:scale-95 transition-all shadow-md cursor-pointer flex items-center justify-center gap-2'>
                  <i className='fas fa-sign-in-alt' />
                  <span>会员账号登录</span>
                </button>
                <button
                  onClick={() => openAuthModal('register')}
                  className='px-6 py-3 rounded-xl text-sm font-semibold bg-indigo-600/60 hover:bg-indigo-600 text-white border border-indigo-400/30 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2'>
                  <i className='fas fa-key' />
                  <span>输入邀请码注册</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 专区内容导航栏与文章统计 */}
      <div className='flex items-center justify-between mb-6 border-b border-gray-200 dark:border-gray-800 pb-3'>
        <div className='flex items-center gap-2'>
          <h2 className='text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2'>
            <span>{vipIcon}</span>
            会员专属文章与资源
          </h2>
          <span
            style={{ color: vipColor, backgroundColor: `${vipColor}20` }}
            className='text-xs px-2 py-0.5 rounded-full font-medium'>
            共 {posts.length} 篇
          </span>
        </div>

        {!isLoggedIn && (
          <p className='text-xs text-gray-500 hidden sm:block'>
            💡 登录后可无障碍畅读以下所有专享内容
          </p>
        )}
      </div>

      {/* 文章列表网格 */}
      {posts && posts.length > 0 ? (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6'>
          {posts.map((post, index) => (
            <BlogPostCard
              key={post.id || index}
              index={index}
              post={post}
              siteInfo={siteInfo}
            />
          ))}
        </div>
      ) : (
        <div className='w-full py-20 text-center bg-gray-50 dark:bg-[#1e1e20] rounded-2xl border border-dashed border-gray-200 dark:border-gray-800'>
          <div className='text-4xl mb-3'>🔒</div>
          <h3 className='text-base font-semibold text-gray-700 dark:text-gray-300'>
            暂无会员专属文章
          </h3>
          <p className='text-xs text-gray-400 mt-1 max-w-sm mx-auto'>
            管理员可在 Notion 博客表格中为文章勾选【vip】属性，发布后将自动聚合在此专区中。
          </p>
        </div>
      )}
    </div>
  )
}

export async function getStaticProps({ locale }) {
  const props = await fetchGlobalAllData({ from: 'vip-index', locale })
  // 筛选出所有状态为已发布且带有 vip 属性的文章
  const allPosts =
    props.allPages?.filter(
      page => page.type === 'Post' && page.status === 'Published'
    ) || []

  // 会员专区只展示勾选了 vip 属性的文章
  props.posts = allPosts.filter(page => page.vip)
  delete props.allPages

  return {
    props,
    revalidate: process.env.NEXT_PUBLIC_REVALIDATE_SECOND || 60
  }
}

export default VipIndex
