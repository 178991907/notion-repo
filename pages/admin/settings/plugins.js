import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'

export default function PluginSettings() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  
  const [formData, setFormData] = useState({
    COMMENT_TWIKOO_ENV_ID: '',
    COMMENT_GISCUS_REPO: '',
    COMMENT_GISCUS_REPO_ID: '',
    COMMENT_GISCUS_CATEGORY: '',
    COMMENT_GISCUS_CATEGORY_ID: '',
    ENABLE_RSS: true
  })

  useEffect(() => {
    fetch('/api/admin/config')
      .then(res => res.status === 401 ? router.push('/admin/login') : res.json())
      .then(data => {
        if (data?.success) {
          setFormData(prev => ({
            ...prev,
            ...Object.keys(prev).reduce((acc, key) => {
              if (data.config[key] !== undefined) acc[key] = data.config[key]
              return acc
            }, {})
          }))
          setIsLoading(false)
        }
      })
      .catch(() => {})
  }, [router])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const configs = Object.entries(formData).map(([key, value]) => ({ key, value }))
      await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-csrf': '1' },
        body: JSON.stringify({ configs })
      })
      alert('插件配置保存成功')
    } catch (err) {
      alert('请求失败')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Head><title>插件与评论设置 | 管理后台</title></Head>

      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center text-sm">
              <Link href="/admin" className="text-gray-500 hover:text-gray-900">管理后台</Link>
              <span className="mx-2 text-gray-400">/</span>
              <span className="font-medium text-gray-900">插件系统</span>
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              {isSaving ? '保存中...' : '保存修改'}
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* 评论系统 */}
        <section className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-5 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">评论系统 (Twikoo / Giscus)</h3>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Twikoo 环境 ID (支持填写内置 API)</label>
              <input type="text" name="COMMENT_TWIKOO_ENV_ID" value={formData.COMMENT_TWIKOO_ENV_ID} onChange={handleChange} placeholder="例如：https://您的域名/api/twikoo" className="w-full border-gray-300 rounded-md py-2 px-3 border text-sm" />
              <p className="text-xs text-gray-500 mt-2">提示：由于我们已经集成了内置 Twikoo 引擎，您只需填入您的主站域名即可，如 <code>https://blog.xxx.com/api/twikoo</code></p>
            </div>
            <hr className="my-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Giscus 仓库 (REPO)</label>
                <input type="text" name="COMMENT_GISCUS_REPO" value={formData.COMMENT_GISCUS_REPO} onChange={handleChange} className="w-full border-gray-300 rounded-md py-2 px-3 border text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Giscus 仓库 ID</label>
                <input type="text" name="COMMENT_GISCUS_REPO_ID" value={formData.COMMENT_GISCUS_REPO_ID} onChange={handleChange} className="w-full border-gray-300 rounded-md py-2 px-3 border text-sm" />
              </div>
            </div>
          </div>
        </section>
        
        {/* 其他插件 */}
        <section className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-5 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">组件与输出</h3>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between py-2">
              <div>
                <h4 className="text-sm font-medium text-gray-900">RSS 订阅输出</h4>
                <p className="text-xs text-gray-500 mt-1">自动生成 /feed 订阅源供读者订阅</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" name="ENABLE_RSS" checked={formData.ENABLE_RSS} onChange={handleChange} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </section>

      </main>
    </div>
  )
}
