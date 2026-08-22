import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { CONFIG_DESCRIPTIONS } from '@/lib/admin/config-dict'

// 字段分类与中文说明引擎
const CATEGORIES = [
  { id: 'core', name: '核心系统配置', prefix: [] },
  { id: 'heo', name: '🎨 Heo 主题专属', prefix: ['HEO_'] },
  { id: 'ai', name: '🤖 AI 与辅助功能', prefix: ['AI_', 'TianliGPT_', 'WEB_WHIZ_'] },
  { id: 'comment', name: '💬 评论系统', prefix: ['COMMENT_', 'VALINE_', 'WALINE_', 'CUSDIS_', 'GISCUS_', 'GITALK_', 'UTTERANCES_'] },
  { id: 'analytics', name: '📊 流量与统计', prefix: ['ANALYTICS_', 'UMAMI_', 'ACKEE_'] },
  { id: 'ads', name: '💰 广告配置', prefix: ['AD_', 'ADSENSE_'] },
  { id: 'search', name: '🔍 搜索引擎', prefix: ['ALGOLIA_'] },
  { id: 'plugin', name: '🔌 第三方插件', prefix: ['TECH_GROW_', 'MUSIC_', 'CHATBASE_', 'DAO_VOICE_', 'TIDIO_', 'LIVE2D_', 'FACEBOOK_', 'MESSENGER_', 'CHATRA_'] },
  { id: 'themes', name: '🖼️ 其他主题配置', prefix: ['SIMPLE_', 'HEXO_', 'NEXT_', 'MEDIUM_', 'FUKASAWA_', 'PLOG_', 'NOBELIUM_', 'MATERY_', 'LANDING_', 'PROXIO_', 'STARTER_', 'THOUGHTLITE_', 'TYPOGRAPHY_', 'XUHOME_'] }
]

export default function AdvancedSettings() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })
  
  // 所有的配置项 (来自后端 API)
  const [fullConfig, setFullConfig] = useState({})
  // 用于界面展示和编辑的数组 [{key, value, originalValue, desc, categoryId}]
  const [configList, setConfigList] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  
  const [newKey, setNewKey] = useState('')
  const [newValue, setNewValue] = useState('')

  // 给一个 Key 分配分类
  const getCategoryForKey = (key) => {
    for (let i = 1; i < CATEGORIES.length; i++) { // 跳过 core
      const prefixes = CATEGORIES[i].prefix
      if (prefixes.some(prefix => key.startsWith(prefix))) {
        return CATEGORIES[i].id
      }
    }
    return 'core' // 默认分类
  }

  useEffect(() => {
    fetch('/api/admin/config')
      .then(res => res.status === 401 ? router.push('/admin/login') : res.json())
      .then(data => {
        if (data?.success) {
          const config = data.config
          delete config._version
          delete config._overrideCount
          setFullConfig(config)
          
          const list = Object.keys(config).map(key => ({
            key,
            value: typeof config[key] === 'object' ? JSON.stringify(config[key]) : String(config[key] || ''),
            originalValue: typeof config[key] === 'object' ? JSON.stringify(config[key]) : String(config[key] || ''),
            desc: CONFIG_DESCRIPTIONS[key] || '未知扩展参数，不启用可保持空',
            categoryId: getCategoryForKey(key)
          })).sort((a, b) => a.key.localeCompare(b.key))
          
          setConfigList(list)
          setIsLoading(false)
        }
      })
      .catch(() => {})
  }, [router])

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000)
  }

  const handleItemChange = (index, val) => {
    const newList = [...configList]
    newList[index].value = val
    setConfigList(newList)
  }

  const handleAddNew = () => {
    if (!newKey.trim()) return showToast('键名不能为空', 'error')
    if (configList.some(item => item.key === newKey.trim())) {
      return showToast('该配置项已存在，请在列表中搜索并修改', 'error')
    }
    
    setConfigList([{
      key: newKey.trim(),
      value: newValue,
      originalValue: '',
      desc: CONFIG_DESCRIPTIONS[newKey.trim()] || '用户手动添加',
      categoryId: getCategoryForKey(newKey.trim())
    }, ...configList])
    
    setNewKey('')
    setNewValue('')
    showToast('已添加到列表，请点击右上角保存以生效')
  }

  const handleRemove = (index) => {
    const newList = [...configList]
    newList[index].value = ''
    setConfigList(newList)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const changedConfigs = configList
        .filter(item => item.value !== item.originalValue)
        .map(item => ({ key: item.key, value: item.value }))
      
      if (changedConfigs.length === 0) {
        setIsSaving(false)
        return showToast('没有检测到任何修改')
      }

      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-csrf': '1' },
        body: JSON.stringify({ configs: changedConfigs })
      })
      
      const data = await res.json()
      if (res.ok && data.success) {
        showToast(`成功更新 ${changedConfigs.length} 项配置！`)
        const newList = configList.map(item => ({
          ...item,
          originalValue: item.value
        }))
        setConfigList(newList)
      } else {
        showToast(data.error || '保存失败', 'error')
      }
    } catch (err) {
      showToast('请求失败', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const filteredList = configList.filter(item => 
    item.key.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.desc.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Head><title>全量高级配置 | 管理后台</title></Head>

      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center text-sm">
              <Link href="/admin" className="text-gray-500 hover:text-gray-900">管理后台</Link>
              <span className="mx-2 text-gray-400">/</span>
              <span className="font-medium text-gray-900">高级配置字典 (Advanced)</span>
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 shadow-sm"
            >
              {isSaving ? '保存中...' : '提交所有修改'}
            </button>
          </div>
        </div>
      </nav>

      {toast.show && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
          <div className={`px-4 py-3 rounded-md shadow-lg font-medium text-sm ${toast.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            {toast.message}
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">按模块分类的专家参数库</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>我们已将底层上百个散乱的系统参数智能分类。大多数第三方插件参数留空 <code>[空]</code> 即表示“未启用/关闭”。只有明确需要修改的细节才需要填写内容。</p>
              </div>
            </div>
          </div>
        </div>

        <section className="bg-white shadow-sm rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">搜索与强制添加</h3>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-[2] w-full">
              <label className="block text-xs font-medium text-gray-500 mb-1">全局搜索</label>
              <input 
                type="text" 
                placeholder="在此输入中文或变量名进行全局搜索 (如: 统计, HEO_)..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full border-blue-300 focus:ring-blue-500 focus:border-blue-500 rounded-md py-2 px-3 border text-sm" 
              />
            </div>
            <div className="flex-[1] w-full">
              <label className="block text-xs font-medium text-gray-500 mb-1">手动增加 KEY</label>
              <input type="text" value={newKey} onChange={e => setNewKey(e.target.value)} placeholder="键名..." className="w-full border-gray-300 rounded-md py-2 px-3 border text-sm font-mono" />
            </div>
            <div className="flex-[1] w-full">
              <label className="block text-xs font-medium text-gray-500 mb-1">手动增加 VALUE</label>
              <input type="text" value={newValue} onChange={e => setNewValue(e.target.value)} placeholder="值..." className="w-full border-gray-300 rounded-md py-2 px-3 border text-sm" />
            </div>
            <button onClick={handleAddNew} className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 whitespace-nowrap">
              添加
            </button>
          </div>
        </section>

        {/* 循环渲染按类别的区块 */}
        {CATEGORIES.map(category => {
          const catList = filteredList.filter(item => item.categoryId === category.id)
          if (catList.length === 0) return null

          return (
            <section key={category.id} className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden mb-6">
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <h3 className="text-md font-bold text-gray-800">{category.name} <span className="text-gray-400 text-sm font-normal">({catList.length} 项)</span></h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full w-full divide-y divide-gray-200 table-fixed">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '35%' }}>参数与说明</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '15%' }}>可选值参考</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '40%' }}>覆盖值 (空表示使用系统默认)</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '10%' }}>操作</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {catList.map((item) => {
                      const realIndex = configList.findIndex(i => i.key === item.key)
                      const isModified = item.value !== item.originalValue
                      
                      // 智能提取中文释义中的括号内容作为“填写建议”
                      const match = item.desc.match(/\((.*?)\)/)
                      const title = item.desc.replace(/\(.*?\)/, '').trim()
                      
                      // 智能提取注释中的可选数组 (例如 ['light', 'dark', 'auto'])
                      const arrayMatch = item.desc.match(/\[(.*?)\]/)
                      let enumOptions = null
                      if (arrayMatch && arrayMatch[1].includes("'")) {
                         // 将 "'light', 'dark'" 解析成 ['light', 'dark']
                         enumOptions = arrayMatch[1].split(',').map(s => s.replace(/'/g, '').trim()).filter(Boolean)
                      }
                      
                      // 针对特定核心变量进行“硬编码”推断（当原注释没有标准数组括号时）
                      if (item.key === 'THEME') {
                         enumOptions = ['heo', 'simple', 'claude', 'endspace', 'example', 'fukasawa', 'fuwari', 'gitbook', 'hexo', 'landing', 'matery', 'medium', 'next', 'nobelium', 'plog', 'proxio', 'starter', 'thoughtlite', 'typography', 'xuhome', 'commerce', 'game', 'nav', 'movie', 'magzine']
                      } else if (item.key === 'LANG') {
                         enumOptions = ['zh-CN', 'en-US', 'zh-HK', 'zh-TW', 'ja-JP', 'es-ES']
                      }
                      
                      // 智能推断可选值
                      let suggestion = match ? match[1] : ''
                      if (!suggestion) {
                        const val = item.originalValue || item.value
                        if (val === 'true' || val === 'false') suggestion = 'true / false'
                        else if (enumOptions) suggestion = '下拉选择'
                        else if (!isNaN(Number(val)) && val !== '') suggestion = '数字'
                        else if (val.startsWith('[')) suggestion = '数组格式 []'
                        else if (val.startsWith('#') && (val.length === 4 || val.length === 7)) suggestion = '颜色HEX (如 #ffffff)'
                        else if (val.startsWith('http')) suggestion = 'URL 链接'
                        else suggestion = '自定义文本'
                      }
                      
                      // 智能控件渲染
                      let inputControl = null
                      const valStr = String(item.value)
                      
                      if (enumOptions && enumOptions.length > 0) {
                        // 枚举数组，渲染下拉框
                        inputControl = (
                          <select 
                            value={valStr} 
                            onChange={(e) => handleItemChange(realIndex, e.target.value)}
                            className="w-full border border-gray-300 rounded-md p-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium"
                          >
                            <option value="">⚪️ 恢复系统默认</option>
                            {enumOptions.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        )
                      } else if (valStr === 'true' || valStr === 'false') {
                        // 布尔型渲染下拉框
                        inputControl = (
                          <select 
                            value={valStr} 
                            onChange={(e) => handleItemChange(realIndex, e.target.value)}
                            className="w-full border border-gray-300 rounded-md p-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium"
                          >
                            <option value="">⚪️ 恢复系统默认</option>
                            <option value="true">✅ 开启 (true)</option>
                            <option value="false">❌ 关闭 (false)</option>
                          </select>
                        )
                      } else if (valStr.startsWith('#') && (valStr.length === 4 || valStr.length === 7)) {
                        // 颜色值渲染调色盘
                        inputControl = (
                          <div className="flex items-center gap-2 w-full">
                            <input 
                              type="color" 
                              value={valStr} 
                              onChange={(e) => handleItemChange(realIndex, e.target.value)}
                              className="h-10 w-12 flex-shrink-0 rounded cursor-pointer border border-gray-200"
                            />
                            <input 
                              type="text" 
                              value={valStr}
                              onChange={(e) => handleItemChange(realIndex, e.target.value)}
                              className="w-full border border-gray-300 rounded-md p-2 bg-white focus:ring-2 focus:ring-blue-500 text-sm font-mono uppercase"
                            />
                          </div>
                        )
                      } else if (!isNaN(Number(valStr)) && valStr !== '') {
                        // 数字型渲染短输入框
                        inputControl = (
                          <input 
                            type="number"
                            value={valStr}
                            onChange={(e) => handleItemChange(realIndex, e.target.value)}
                            className="w-full border border-gray-300 rounded-md p-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            placeholder="数字..."
                          />
                        )
                      } else {
                        // 字符串和长文本，渲染自适应 Textarea
                        inputControl = (
                          <textarea 
                            rows={item.value.length > 50 || item.value.includes('\\n') || item.value.includes('[') ? 3 : 1}
                            value={item.value} 
                            onChange={(e) => handleItemChange(realIndex, e.target.value)}
                            className="w-full border border-gray-300 rounded-md p-2.5 bg-white focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-y font-mono"
                            placeholder="[系统默认 / 未开启]"
                          />
                        )
                      }
                      
                      return (
                        <tr key={item.key} className={isModified ? 'bg-yellow-50' : 'hover:bg-gray-50/50'}>
                          <td className="px-6 py-4 align-top">
                            <div className="font-mono text-gray-900 font-medium break-all">{item.key}</div>
                            <div className={`text-xs mt-1.5 ${item.desc.includes('未知扩展') ? 'text-gray-400' : 'text-blue-700 font-medium'}`}>{title}</div>
                          </td>
                          <td className="px-6 py-4 align-top">
                            <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded leading-relaxed break-all inline-block">
                              {suggestion}
                            </div>
                          </td>
                          <td className="px-6 py-4 align-top">
                            {inputControl}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right align-top">
                            <button 
                              onClick={() => handleRemove(realIndex)}
                              title="清空此项设置以恢复默认机制"
                              className="text-red-500 hover:text-red-700 border border-red-100 hover:bg-red-50 rounded px-3 py-1.5 transition-colors text-sm"
                            >
                              清空恢复
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )
        })}

        {filteredList.length === 0 && (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500 text-lg">没有搜索到包含此内容的系统参数</p>
          </div>
        )}

      </main>
    </div>
  )
}
