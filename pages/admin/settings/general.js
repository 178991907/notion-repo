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
    BEI_AN: '',
    BEI_AN_GONGAN: ''
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
