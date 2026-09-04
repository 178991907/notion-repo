import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'

/**
 * 管理后台首页仪表盘
 */
export default function AdminDashboard() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [config, setConfig] = useState(null)

  useEffect(() => {
    // 检查登录状态
    fetch('/api/admin/config')
      .then(res => {
        if (res.status === 401) {
          router.push('/admin/login')
          return null
        }
        return res.json()
      })
      .then(data => {
        if (data && data.success) {
          setConfig(data.config)
          setIsLoading(false)
        }
      })
      .catch(err => {
        console.error('Failed to load admin config', err)
        router.push('/admin/login')
      })
  }, [router])

  const handleLogout = () => {
    // 清除 cookie 并退出
    document.cookie = 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
    router.push('/admin/login')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Head>
        <title>管理后台 | notionrepo</title>
      </Head>

      {/* 顶部导航 */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-gray-900 tracking-tight">Notion Repo管理后台</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">欢迎，管理员</span>
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                退出登录
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 主内容区 */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">仪表盘总览</h1>
          <p className="mt-1 text-sm text-gray-500">管理您的博客站点配置、外观与内容。</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* 状态卡片 */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="text-sm font-medium text-gray-500 mb-1">当前主题</div>
            <div className="text-2xl font-bold text-gray-900 capitalize">{config?.THEME || '未知'}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="text-sm font-medium text-gray-500 mb-1">外观模式</div>
            <div className="text-2xl font-bold text-gray-900 capitalize">{config?.APPEARANCE || 'auto'}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="text-sm font-medium text-gray-500 mb-1">系统版本</div>
            <div className="text-2xl font-bold text-gray-900">{config?._version || '4.x'}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="text-sm font-medium text-gray-500 mb-1">已覆写配置项</div>
            <div className="text-2xl font-bold text-blue-600">{config?._overrideCount || 0} 个</div>
          </div>
        </div>

        <h2 className="text-lg font-medium text-gray-900 mb-4">核心管理入口</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 会员与邀请码管理 */}
          <Link href="/admin/members" className="group block h-full">
            <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-6 border border-gray-200 h-full flex flex-col items-start cursor-pointer hover:border-amber-400">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-lg mb-4 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path></svg>
              </div>
              <div className="flex items-center justify-between w-full">
                <h3 className="text-lg font-bold text-gray-900 mb-1">🔑 会员、邀请码与粉丝专区</h3>
                <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">核心功能</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">管理会员体系、生成注册邀请码（一人一码/固定码），管理粉丝专区限制访问码与免登录特权。</p>
            </div>
          </Link>

          {/* 分类管理 */}
          <Link href="/admin/categories" className="group block h-full">
            <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-6 border border-gray-200 h-full flex flex-col items-start cursor-pointer hover:border-blue-300">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>
              </div>
              <div className="flex items-center justify-between w-full">
                <h3 className="text-lg font-bold text-gray-900 mb-1">📁 分类编辑管理</h3>
                <span className="text-xs bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded-full">常用</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">查看文章分类统计、一键重命名、合并、新建分类及未分类文章一键分配。</p>
            </div>
          </Link>

          {/* 标签管理 */}
          <Link href="/admin/tags" className="group block h-full">
            <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-6 border border-gray-200 h-full flex flex-col items-start cursor-pointer hover:border-purple-300">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-lg mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
              </div>
              <div className="flex items-center justify-between w-full">
                <h3 className="text-lg font-bold text-gray-900 mb-1">🏷️ 标签编辑管理</h3>
                <span className="text-xs bg-purple-50 text-purple-700 font-semibold px-2 py-0.5 rounded-full">常用</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">全景标签云、一键批量重命名、智能标签合并、清理无用标签与批量打标。</p>
            </div>
          </Link>

          {/* 主题定制 */}
          <Link href="/admin/settings/theme" className="group block h-full">
            <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-6 border border-gray-200 h-full flex flex-col items-start cursor-pointer hover:border-indigo-300">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"></path></svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">🎨 主题可视化定制</h3>
              <p className="text-sm text-gray-500 mt-1">顶栏导航、英雄区、侧边栏名片、此刻通知横幅、配色与 1:1 动态实时预览。</p>
            </div>
          </Link>

          {/* 基础设置 */}
          <Link href="/admin/settings/general" className="group block h-full">
            <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-6 border border-gray-200 h-full flex flex-col items-start cursor-pointer hover:border-gray-300">
              <div className="p-3 bg-gray-50 text-gray-600 rounded-lg mb-4 group-hover:bg-gray-700 group-hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">📝 基础设置</h3>
              <p className="text-sm text-gray-500 mt-1">管理站点名称、作者信息、语言及基础展现模式。</p>
            </div>
          </Link>

          {/* 插件与评论 */}
          <Link href="/admin/settings/plugins" className="group block h-full">
            <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-6 border border-gray-200 h-full flex flex-col items-start cursor-pointer hover:border-green-300">
              <div className="p-3 bg-green-50 text-green-600 rounded-lg mb-4 group-hover:bg-green-600 group-hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">💬 插件与评论系统</h3>
              <p className="text-sm text-gray-500 mt-1">Twikoo、Giscus 评论系统及 RSS 输出订阅配置。</p>
            </div>
          </Link>

          {/* 高级配置 */}
          <Link href="/admin/settings/advanced" className="group block h-full">
            <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-6 border border-gray-200 h-full flex flex-col items-start cursor-pointer hover:border-red-300">
              <div className="p-3 bg-red-50 text-red-600 rounded-lg mb-4 group-hover:bg-red-600 group-hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">⚙️ 高级配置字典</h3>
              <p className="text-sm text-gray-500 mt-1">专家模式：全量检索并修改全栈 389+ 项核心参数。</p>
            </div>
          </Link>
        </div>
      </main>
      
      {/* 底部版权 */}
      <footer className="w-full bg-gray-50 border-t border-gray-200 py-6 text-center text-sm text-gray-400">
        <p>Notion Repo Admin © {new Date().getFullYear()} - <a href="https://github.com/178991907/notion-repo" className="hover:text-gray-600 transition-colors" target="_blank" rel="noreferrer">GitHub</a></p>
      </footer>
    </div>
  )
}
