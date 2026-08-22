import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'

const THEMES = ['heo', 'hexo', 'next', 'medium', 'fukasawa', 'simple', 'nobelium', 'matery', 'landing', 'proxio', 'gitbook', 'photo', 'nav', 'plog', 'fuwari', 'commerce', 'magzine', 'game', 'movie', 'starter', 'example', 'opc', 'claude', 'endspace', 'thoughtlite', 'typography', 'xuhome']

/**
 * 管理后台基础设置页面
 */
export default function GeneralSettings() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })
  
  const [formData, setFormData] = useState({
    TITLE: '',
    DESCRIPTION: '',
    AUTHOR: '',
    BIO: '',
    LINK: '',
    THEME: 'heo',
    APPEARANCE: 'auto',
    LANG: 'zh-CN',
    REDIRECT_LANG: false,
    BEI_AN: '',
    BEI_AN_GONGAN: '',
    // 社交媒体与联系方式
    CONTACT_EMAIL: '',
    CONTACT_WEIBO: '',
    CONTACT_TWITTER: '',
    CONTACT_GITHUB: '',
    CONTACT_TELEGRAM: '',
    CONTACT_LINKEDIN: '',
    CONTACT_INSTAGRAM: '',
    CONTACT_BILIBILI: '',
    CONTACT_YOUTUBE: '',
    CONTACT_XIAOHONGSHU: '',
    CONTACT_WEHCHAT_PUBLIC: ''
  })

  useEffect(() => {
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
          // 只合并页面需要的字段
          setFormData(prev => ({
            ...prev,
            ...Object.keys(prev).reduce((acc, key) => {
              if (data.config[key] !== undefined) {
                acc[key] = data.config[key]
              }
              return acc
            }, {})
          }))
          setIsLoading(false)
        }
      })
      .catch(err => {
        console.error('加载配置失败', err)
      })
  }, [router])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // 将 formData 转换为后端期望的 { configs: [{key, value}] } 格式
      const configs = Object.entries(formData).map(([key, value]) => ({ key, value }))
      
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-csrf': '1' // 简单的 CSRF 头保护
        },
        body: JSON.stringify({ configs })
      })
      
      const data = await res.json()
      if (res.ok && data.success) {
        showToast('配置已保存，站点将在几秒内更新。重新刷新首页即可看到变化。')
      } else {
        showToast(data.error || '保存失败', 'error')
      }
    } catch (err) {
      showToast('网络请求失败', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Head>
        <title>基础设置 | 管理后台</title>
      </Head>

      {/* 顶部导航 */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center text-sm">
              <Link href="/admin" className="text-gray-500 hover:text-gray-900 transition-colors">管理后台</Link>
              <svg className="h-5 w-5 text-gray-400 mx-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span className="font-medium text-gray-900">基础设置</span>
            </div>
            
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isSaving ? '保存中...' : '保存修改'}
            </button>
          </div>
        </div>
      </nav>

      {/* 消息提示 */}
      {toast.show && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in-down">
          <div className={`rounded-md px-4 py-3 shadow-lg flex items-center ${toast.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            {toast.type === 'success' ? (
              <svg className="h-5 w-5 mr-2 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
            ) : (
              <svg className="h-5 w-5 mr-2 text-red-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
            )}
            <p className="text-sm font-medium">{toast.message}</p>
          </div>
        </div>
      )}

      {/* 主表单区 */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* 站点信息 */}
        <section className="bg-white shadow-sm sm:rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">站点信息</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">配置您博客的基础文案展示。</p>
          </div>
          <div className="px-4 py-5 sm:p-6 space-y-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-6">
                <label className="flex justify-between items-center text-sm font-medium text-gray-700">
                  站点名称
                  <span className="text-xs text-gray-400 font-mono bg-gray-100 px-1.5 py-0.5 rounded">TITLE</span>
                </label>
                <div className="mt-1">
                  <input type="text" name="TITLE" value={formData.TITLE} onChange={handleChange} className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border" />
                </div>
              </div>

              <div className="sm:col-span-6">
                <label className="flex justify-between items-center text-sm font-medium text-gray-700">
                  一句话描述
                  <span className="text-xs text-gray-400 font-mono bg-gray-100 px-1.5 py-0.5 rounded">DESCRIPTION</span>
                </label>
                <div className="mt-1">
                  <input type="text" name="DESCRIPTION" value={formData.DESCRIPTION} onChange={handleChange} className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border" />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label className="flex justify-between items-center text-sm font-medium text-gray-700">
                  作者名
                  <span className="text-xs text-gray-400 font-mono bg-gray-100 px-1.5 py-0.5 rounded">AUTHOR</span>
                </label>
                <div className="mt-1">
                  <input type="text" name="AUTHOR" value={formData.AUTHOR} onChange={handleChange} className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border" />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label className="flex justify-between items-center text-sm font-medium text-gray-700">
                  作者简介
                  <span className="text-xs text-gray-400 font-mono bg-gray-100 px-1.5 py-0.5 rounded">BIO</span>
                </label>
                <div className="mt-1">
                  <input type="text" name="BIO" value={formData.BIO} onChange={handleChange} className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border" />
                </div>
              </div>

              <div className="sm:col-span-6">
                <label className="flex justify-between items-center text-sm font-medium text-gray-700">
                  站点完整域名链接
                  <span className="text-xs text-gray-400 font-mono bg-gray-100 px-1.5 py-0.5 rounded">LINK</span>
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                    https://
                  </span>
                  <input type="text" name="LINK" value={formData.LINK.replace(/^https?:\/\//, '')} onChange={(e) => setFormData(prev => ({ ...prev, LINK: 'https://' + e.target.value }))} className="flex-1 focus:ring-blue-500 focus:border-blue-500 block w-full min-w-0 rounded-none rounded-r-md sm:text-sm border-gray-300 py-2 px-3 border" placeholder="blog.example.com" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 外观设置 */}
        <section className="bg-white shadow-sm sm:rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">外观设置</h3>
          </div>
          <div className="px-4 py-5 sm:p-6 space-y-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-3">
              
              <div className="sm:col-span-1">
                <label className="flex justify-between items-center text-sm font-medium text-gray-700 mb-1">
                  当前主题
                  <span className="text-xs text-gray-400 font-mono bg-gray-100 px-1.5 py-0.5 rounded">THEME</span>
                </label>
                <select name="THEME" value={formData.THEME} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border capitalize">
                  {THEMES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className="sm:col-span-1">
                <label className="flex justify-between items-center text-sm font-medium text-gray-700 mb-1">
                  深色模式
                  <span className="text-xs text-gray-400 font-mono bg-gray-100 px-1.5 py-0.5 rounded">APPEARANCE</span>
                </label>
                <select name="APPEARANCE" value={formData.APPEARANCE} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border">
                  <option value="auto">跟随系统自动 (auto)</option>
                  <option value="light">始终浅色 (light)</option>
                  <option value="dark">始终深色 (dark)</option>
                </select>
              </div>

              <div className="sm:col-span-1">
                <label className="flex justify-between items-center text-sm font-medium text-gray-700 mb-1">
                  系统语言
                  <span className="text-xs text-gray-400 font-mono bg-gray-100 px-1.5 py-0.5 rounded">LANG</span>
                </label>
                <select name="LANG" value={formData.LANG} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border">
                  <option value="zh-CN">简体中文 (zh-CN)</option>
                  <option value="zh-HK">繁体中文 - 香港 (zh-HK)</option>
                  <option value="zh-TW">繁体中文 - 台湾 (zh-TW)</option>
                  <option value="en-US">English (en-US)</option>
                </select>
              </div>

              {/* 多语言自动重定向开关 */}
              <div className="sm:col-span-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900 flex items-center">
                    🌐 多语言自动重定向 (根据浏览器跳转 /en)
                    <span className="ml-2 text-xs text-gray-400 font-mono bg-gray-100 px-1.5 py-0.5 rounded">REDIRECT_LANG</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-0.5">若开启，当访客浏览器首选语言为英文时将自动跳转至 /en。建议保持关闭以常驻中文主页。</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, REDIRECT_LANG: !prev.REDIRECT_LANG }))}
                  className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none ${formData.REDIRECT_LANG ? 'bg-blue-600' : 'bg-gray-200'}`}
                >
                  <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transform transition ease-in-out duration-200 ${formData.REDIRECT_LANG ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 🌐 社交媒体与联系方式 */}
        <section className="bg-white shadow-sm sm:rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
              <span className="mr-2">💬</span> 社交媒体主页与联系方式
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">配置作者在侧边栏、挂件中展示的个人主页链接，留空则不显示该图标。</p>
          </div>
          <div className="px-4 py-5 sm:p-6 space-y-6">
            <div className="grid grid-cols-1 gap-y-5 gap-x-4 sm:grid-cols-2">
              <div>
                <label className="flex justify-between items-center text-sm font-medium text-gray-700">
                  🐙 GitHub 个人主页
                  <span className="text-xs text-gray-400 font-mono bg-gray-100 px-1.5 py-0.5 rounded">CONTACT_GITHUB</span>
                </label>
                <input type="text" name="CONTACT_GITHUB" value={formData.CONTACT_GITHUB} onChange={handleChange} placeholder="https://github.com/your-username" className="mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border" />
              </div>

              <div>
                <label className="flex justify-between items-center text-sm font-medium text-gray-700">
                  𝕏 Twitter / X 主页
                  <span className="text-xs text-gray-400 font-mono bg-gray-100 px-1.5 py-0.5 rounded">CONTACT_TWITTER</span>
                </label>
                <input type="text" name="CONTACT_TWITTER" value={formData.CONTACT_TWITTER} onChange={handleChange} placeholder="https://twitter.com/your-handle" className="mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border" />
              </div>

              <div>
                <label className="flex justify-between items-center text-sm font-medium text-gray-700">
                  🔴 新浪微博主页
                  <span className="text-xs text-gray-400 font-mono bg-gray-100 px-1.5 py-0.5 rounded">CONTACT_WEIBO</span>
                </label>
                <input type="text" name="CONTACT_WEIBO" value={formData.CONTACT_WEIBO} onChange={handleChange} placeholder="https://weibo.com/your-id" className="mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border" />
              </div>

              <div>
                <label className="flex justify-between items-center text-sm font-medium text-gray-700">
                  ✈️ Telegram 账号 / 频道
                  <span className="text-xs text-gray-400 font-mono bg-gray-100 px-1.5 py-0.5 rounded">CONTACT_TELEGRAM</span>
                </label>
                <input type="text" name="CONTACT_TELEGRAM" value={formData.CONTACT_TELEGRAM} onChange={handleChange} placeholder="https://t.me/your-channel" className="mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border" />
              </div>

              <div>
                <label className="flex justify-between items-center text-sm font-medium text-gray-700">
                  📺 哔哩哔哩 (Bilibili)
                  <span className="text-xs text-gray-400 font-mono bg-gray-100 px-1.5 py-0.5 rounded">CONTACT_BILIBILI</span>
                </label>
                <input type="text" name="CONTACT_BILIBILI" value={formData.CONTACT_BILIBILI} onChange={handleChange} placeholder="https://space.bilibili.com/123456" className="mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border" />
              </div>

              <div>
                <label className="flex justify-between items-center text-sm font-medium text-gray-700">
                  📕 小红书
                  <span className="text-xs text-gray-400 font-mono bg-gray-100 px-1.5 py-0.5 rounded">CONTACT_XIAOHONGSHU</span>
                </label>
                <input type="text" name="CONTACT_XIAOHONGSHU" value={formData.CONTACT_XIAOHONGSHU} onChange={handleChange} placeholder="https://www.xiaohongshu.com/user/profile/..." className="mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border" />
              </div>

              <div>
                <label className="flex justify-between items-center text-sm font-medium text-gray-700">
                  🎥 YouTube 主页
                  <span className="text-xs text-gray-400 font-mono bg-gray-100 px-1.5 py-0.5 rounded">CONTACT_YOUTUBE</span>
                </label>
                <input type="text" name="CONTACT_YOUTUBE" value={formData.CONTACT_YOUTUBE} onChange={handleChange} placeholder="https://youtube.com/@channel" className="mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border" />
              </div>

              <div>
                <label className="flex justify-between items-center text-sm font-medium text-gray-700">
                  💬 微信公众号文章/名片链接
                  <span className="text-xs text-gray-400 font-mono bg-gray-100 px-1.5 py-0.5 rounded">CONTACT_WEHCHAT_PUBLIC</span>
                </label>
                <input type="text" name="CONTACT_WEHCHAT_PUBLIC" value={formData.CONTACT_WEHCHAT_PUBLIC} onChange={handleChange} placeholder="https://mp.weixin.qq.com/..." className="mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border" />
              </div>

              <div>
                <label className="flex justify-between items-center text-sm font-medium text-gray-700">
                  ✉️ 电子邮箱
                  <span className="text-xs text-gray-400 font-mono bg-gray-100 px-1.5 py-0.5 rounded">CONTACT_EMAIL</span>
                </label>
                <input type="text" name="CONTACT_EMAIL" value={formData.CONTACT_EMAIL} onChange={handleChange} placeholder="your-email@example.com" className="mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border" />
              </div>

              <div>
                <label className="flex justify-between items-center text-sm font-medium text-gray-700">
                  💼 领英 (LinkedIn)
                  <span className="text-xs text-gray-400 font-mono bg-gray-100 px-1.5 py-0.5 rounded">CONTACT_LINKEDIN</span>
                </label>
                <input type="text" name="CONTACT_LINKEDIN" value={formData.CONTACT_LINKEDIN} onChange={handleChange} placeholder="https://linkedin.com/in/..." className="mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border" />
              </div>
            </div>
          </div>
        </section>

        {/* 备案信息 */}
        <section className="bg-white shadow-sm sm:rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">备案信息 (仅国内节点需要)</h3>
          </div>
          <div className="px-4 py-5 sm:p-6 space-y-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <label className="flex justify-between items-center text-sm font-medium text-gray-700">
                  ICP 备案号
                  <span className="text-xs text-gray-400 font-mono bg-gray-100 px-1.5 py-0.5 rounded">BEI_AN</span>
                </label>
                <div className="mt-1">
                  <input type="text" name="BEI_AN" value={formData.BEI_AN} onChange={handleChange} placeholder="例如：京ICP备xxxxxx号" className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border" />
                </div>
              </div>

              <div className="sm:col-span-1">
                <label className="flex justify-between items-center text-sm font-medium text-gray-700">
                  公安备案号
                  <span className="text-xs text-gray-400 font-mono bg-gray-100 px-1.5 py-0.5 rounded">BEI_AN_GONGAN</span>
                </label>
                <div className="mt-1">
                  <input type="text" name="BEI_AN_GONGAN" value={formData.BEI_AN_GONGAN} onChange={handleChange} className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border" />
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  )
}
