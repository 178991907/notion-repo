import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import Head from "next/head"
import Link from "next/link"

const NOTION_COLOR_MAP = {
  default: "bg-gray-100 text-gray-800 border-gray-200",
  gray: "bg-gray-100 text-gray-700 border-gray-300",
  brown: "bg-amber-100 text-amber-800 border-amber-200",
  orange: "bg-orange-100 text-orange-800 border-orange-200",
  yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
  green: "bg-green-100 text-green-800 border-green-200",
  blue: "bg-blue-100 text-blue-800 border-blue-200",
  purple: "bg-purple-100 text-purple-800 border-purple-200",
  pink: "bg-pink-100 text-pink-800 border-pink-200",
  red: "bg-red-100 text-red-800 border-red-200"
}

const COLOR_OPTIONS = [
  { label: "默认灰", value: "default" },
  { label: "灰色", value: "gray" },
  { label: "棕色", value: "brown" },
  { label: "橙色", value: "orange" },
  { label: "黄色", value: "yellow" },
  { label: "绿色", value: "green" },
  { label: "蓝色", value: "blue" },
  { label: "紫色", value: "purple" },
  { label: "粉色", value: "pink" },
  { label: "红色", value: "red" }
]

export default function TagManagement() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [tags, setTags] = useState([])
  const [allPosts, setAllPosts] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTag, setActiveTag] = useState(null)
  const [selectedTags, setSelectedTags] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [toast, setToast] = useState({ show: false, message: "", type: "success" })

  // Modal 状态
  const [modalType, setModalType] = useState(null)
  const [modalData, setModalData] = useState({})

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000)
  }

  const loadData = async () => {
    try {
      const res = await fetch("/api/admin/tags")
      if (res.status === 401) {
        router.push("/admin/login")
        return
      }
      const data = await res.json()
      if (data.success) {
        setTags(data.tags || [])
        setAllPosts(data.allPosts || [])
      }
    } catch (err) {
      showToast("加载标签失败: " + err.message, "error")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleAction = async (payload) => {
    setIsProcessing(true)
    try {
      const res = await fetch("/api/admin/tags", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-csrf": "1"
        },
        body: JSON.stringify(payload)
      })
      const result = await res.json()
      if (result.success) {
        showToast(result.message || "操作成功")
        setModalType(null)
        setModalData({})
        setSelectedTags([])
        await loadData()
      } else {
        showToast(result.error || "操作失败", "error")
      }
    } catch (err) {
      showToast("请求异常: " + err.message, "error")
    } finally {
      setIsProcessing(false)
    }
  }

  const filteredTags = tags.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const emptyTagsCount = tags.filter(t => t.count === 0).length

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-16">
      <Head>
        <title>标签管理 | Notion Repo 管理后台</title>
      </Head>

      {toast.show && (
        <div className={"fixed top-5 right-5 z-50 px-4 py-3 rounded-lg shadow-lg text-white font-medium text-sm transition-all duration-300 " + (toast.type === "error" ? "bg-red-600" : "bg-green-600")}>
          {toast.message}
        </div>
      )}

      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-3">
              <Link href="/admin" className="text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors">
                管理后台
              </Link>
              <span className="text-gray-300">/</span>
              <span className="text-gray-900 font-bold text-base">🏷️ 标签编辑管理 (Tags)</span>
            </div>
            <div className="flex items-center space-x-3">
              {emptyTagsCount > 0 && (
                <button
                  onClick={() => handleAction({ action: "cleanup_empty" })}
                  disabled={isProcessing}
                  className="inline-flex items-center px-3 py-2 border border-orange-300 text-xs font-medium rounded-lg text-orange-700 bg-orange-50 hover:bg-orange-100 transition-colors disabled:opacity-50"
                >
                  🧹 清理 {emptyTagsCount} 个无文章空标签
                </button>
              )}
              {selectedTags.length > 0 && (
                <button
                  onClick={() => {
                    setModalType("batch_merge")
                    setModalData({ sourceNames: selectedTags, targetName: selectedTags[0] })
                  }}
                  className="inline-flex items-center px-3 py-2 border border-purple-300 text-xs font-medium rounded-lg text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors"
                >
                  🔀 合并选中的 {selectedTags.length} 个标签
                </button>
              )}
              <button
                onClick={() => {
                  setModalType("create")
                  setModalData({ name: "", color: "default" })
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 shadow-sm transition-colors"
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                新建标签
              </button>
              <button
                onClick={() => {
                  setModalType("batch_tag")
                  setModalData({ pageIds: [], addTags: "", removeTags: "" })
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors"
              >
                ⚡ 批量文章打标
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-grow space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-500">已创建标签</div>
              <div className="text-3xl font-extrabold text-gray-900 mt-1">{tags.length} <span className="text-sm font-normal text-gray-500">个</span></div>
            </div>
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center text-xl font-bold">
              🏷️
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-500">已打标文章总数</div>
              <div className="text-3xl font-extrabold text-blue-600 mt-1">{allPosts.filter(p => p.tags.length > 0).length} <span className="text-sm font-normal text-gray-500">篇</span></div>
            </div>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-xl font-bold">
              📑
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-500">最多引用的热门标签</div>
              <div className="text-xl font-bold text-green-600 mt-1 truncate max-w-[200px]">{tags[0]?.name || "暂无"} <span className="text-xs font-normal text-gray-500">({tags[0]?.count || 0} 篇)</span></div>
            </div>
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center text-xl font-bold">
              🔥
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="搜索标签名称..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
            <div className="absolute left-3 top-2.5 text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            提示：支持新建标签、重命名/删除标签同步更新 Notion 数据库，旧卡片会自动移除。
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTags.map((tag) => {
            const colorClass = NOTION_COLOR_MAP[tag.color] || NOTION_COLOR_MAP.default
            const isSelected = selectedTags.includes(tag.name)
            return (
              <div key={tag.name} className={"bg-white rounded-xl shadow-sm hover:shadow-md border transition-all overflow-hidden flex flex-col justify-between " + (isSelected ? "border-purple-500 ring-1 ring-purple-500" : "border-gray-200")}>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2 truncate">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTags([...selectedTags, tag.name])
                          } else {
                            setSelectedTags(selectedTags.filter(n => n !== tag.name))
                          }
                        }}
                        className="rounded text-purple-600 focus:ring-purple-500 h-4 w-4 border-gray-300"
                      />
                      <span className={"inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border " + colorClass}>
                        #{tag.name}
                      </span>
                    </div>
                    <span className={"text-xs font-semibold px-2.5 py-0.5 rounded-full flex-shrink-0 " + (tag.count === 0 ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-700")}>
                      {tag.count} 篇
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 mb-4">
                    前台标签链接: <code className="text-gray-700 font-mono bg-gray-50 px-1 py-0.5 rounded">/tag/{tag.name}</code>
                  </p>

                  <div className="flex items-center space-x-2 pt-2 border-t border-gray-100">
                    <button
                      onClick={() => {
                        setModalType("rename")
                        setModalData({ oldName: tag.name, newName: tag.name, color: tag.color || "default" })
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2.5 py-1.5 rounded hover:bg-blue-50 transition-colors"
                    >
                      ✏️ 重命名
                    </button>
                    <button
                      onClick={() => {
                        setModalType("merge")
                        setModalData({ sourceName: tag.name, targetName: "" })
                      }}
                      className="text-xs text-purple-600 hover:text-purple-800 font-medium px-2.5 py-1.5 rounded hover:bg-purple-50 transition-colors"
                    >
                      🔀 合并到...
                    </button>
                    <button
                      onClick={() => {
                        setModalType("delete")
                        setModalData({ name: tag.name })
                      }}
                      className="text-xs text-red-600 hover:text-red-800 font-medium px-2.5 py-1.5 rounded hover:bg-red-50 transition-colors"
                    >
                      🗑️ 删除标签
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex items-center justify-between">
                  <button
                    onClick={() => setActiveTag(activeTag === tag.name ? null : tag.name)}
                    className="text-xs font-medium text-gray-600 hover:text-gray-900 flex items-center"
                  >
                    {activeTag === tag.name ? "收起文章列表 ▲" : ("查看打标的 " + tag.count + " 篇文章 ▼")}
                  </button>
                </div>

                {activeTag === tag.name && (
                  <div className="p-4 bg-gray-50 border-t border-gray-200 max-h-60 overflow-y-auto space-y-2">
                    {tag.posts.length === 0 ? (
                      <div className="text-xs text-gray-400 py-2 text-center">暂无关联文章（可直接点击上方删除移除该标签）</div>
                    ) : (
                      tag.posts.map(p => (
                        <div key={p.id} className="p-2 bg-white rounded border border-gray-200 text-xs flex justify-between items-center">
                          <div className="truncate mr-2">
                            <div className="font-medium text-gray-900 truncate">{p.title}</div>
                            <div className="text-gray-400 text-[10px]">{p.date || "无日期"} · 分类: {p.category || "未分类"}</div>
                          </div>
                          <a
                            href={"/" + p.slug}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-500 hover:underline flex-shrink-0"
                          >
                            查看 ↗
                          </a>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </main>

      {modalType === "create" && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">新建标签</h3>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">标签名称</label>
              <input
                type="text"
                placeholder="例如：AI 提示词、架构设计、效率工具..."
                value={modalData.name || ""}
                onChange={(e) => setModalData({ ...modalData, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">标签色彩样式 (Notion 颜色)</label>
              <select
                value={modalData.color || "default"}
                onChange={(e) => setModalData({ ...modalData, color: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
              >
                {COLOR_OPTIONS.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
              <button
                onClick={() => setModalType(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => handleAction({ action: "create", name: modalData.name, color: modalData.color })}
                disabled={isProcessing || !modalData.name?.trim()}
                className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium shadow-sm transition-colors disabled:opacity-50"
              >
                {isProcessing ? "创建中..." : "确认创建"}
              </button>
            </div>
          </div>
        </div>
      )}

      {modalType === "rename" && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">重命名标签</h3>
            <p className="text-xs text-gray-500">
              将原标签 <span className="font-bold text-gray-900">#{modalData.oldName}</span> 批量重命名。将自动更新 Notion 中所有关联文章并替换 Schema。
            </p>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">新标签名称</label>
              <input
                type="text"
                value={modalData.newName || ""}
                onChange={(e) => setModalData({ ...modalData, newName: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">标签色彩样式</label>
              <select
                value={modalData.color || "default"}
                onChange={(e) => setModalData({ ...modalData, color: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              >
                {COLOR_OPTIONS.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
              <button
                onClick={() => setModalType(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => handleAction({
                  action: "rename",
                  oldName: modalData.oldName,
                  newName: modalData.newName,
                  color: modalData.color
                })}
                disabled={isProcessing || !modalData.newName?.trim()}
                className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm transition-colors disabled:opacity-50"
              >
                {isProcessing ? "更新中..." : "确认修改"}
              </button>
            </div>
          </div>
        </div>
      )}

      {modalType === "merge" && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">合并标签</h3>
            <p className="text-xs text-gray-500">
              将标签 <span className="font-bold text-gray-900">#{modalData.sourceName}</span> 合并到目标标签中，原标签将被移除：
            </p>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">合并到目标标签</label>
              <select
                value={modalData.targetName || ""}
                onChange={(e) => setModalData({ ...modalData, targetName: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="" disabled>请选择合并目标标签...</option>
                {tags.filter(t => t.name !== modalData.sourceName).map(t => (
                  <option key={t.name} value={t.name}>#{t.name} ({t.count} 篇)</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
              <button
                onClick={() => setModalType(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => handleAction({
                  action: "merge",
                  sourceNames: [modalData.sourceName],
                  targetName: modalData.targetName
                })}
                disabled={isProcessing || !modalData.targetName}
                className="px-4 py-2 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium shadow-sm transition-colors disabled:opacity-50"
              >
                {isProcessing ? "合并中..." : "确认合并"}
              </button>
            </div>
          </div>
        </div>
      )}

      {modalType === "batch_merge" && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">批量合并标签</h3>
            <p className="text-xs text-gray-500">
              将已勾选的 {selectedTags.length} 个标签 ({selectedTags.map(t => "#" + t).join("、")}) 全部合并为一个标签：
            </p>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">合并后的统一标签名称</label>
              <input
                type="text"
                value={modalData.targetName || ""}
                onChange={(e) => setModalData({ ...modalData, targetName: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
              <button
                onClick={() => setModalType(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => handleAction({
                  action: "merge",
                  sourceNames: selectedTags,
                  targetName: modalData.targetName
                })}
                disabled={isProcessing || !modalData.targetName?.trim()}
                className="px-4 py-2 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium shadow-sm transition-colors disabled:opacity-50"
              >
                {isProcessing ? "合并中..." : "确认批量合并"}
              </button>
            </div>
          </div>
        </div>
      )}

      {modalType === "delete" && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-red-600 flex items-center">
              <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              删除标签
            </h3>
            <p className="text-xs text-gray-600">
              确定要删除标签 <span className="font-bold text-gray-900">#{modalData.name}</span> 吗？该操作将从所有关联文章中移除此标签，并彻底从 Notion Schema 中注销。
            </p>
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
              <button
                onClick={() => setModalType(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => handleAction({ action: "delete", name: modalData.name })}
                disabled={isProcessing}
                className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium shadow-sm transition-colors disabled:opacity-50"
              >
                {isProcessing ? "删除中..." : "确认彻底删除"}
              </button>
            </div>
          </div>
        </div>
      )}

      {modalType === "batch_tag" && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900">⚡ 批量文章打标</h3>
            <p className="text-xs text-gray-500">
              勾选目标文章，批量追加或移除标签：
            </p>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">要追加的标签 (英文逗号隔开)</label>
              <input
                type="text"
                placeholder="例如：推荐, AI实操, 精选"
                value={modalData.addTags || ""}
                onChange={(e) => setModalData({ ...modalData, addTags: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">要移除的标签 (英文逗号隔开)</label>
              <input
                type="text"
                placeholder="例如：旧标签, 待清理"
                value={modalData.removeTags || ""}
                onChange={(e) => setModalData({ ...modalData, removeTags: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">选择文章 ({(modalData.pageIds || []).length} 篇已选)</label>
              <div className="border border-gray-200 rounded-lg p-3 max-h-48 overflow-y-auto space-y-1.5">
                {allPosts.map(p => {
                  const checked = (modalData.pageIds || []).includes(p.id)
                  return (
                    <label key={p.id} className="flex items-center text-xs text-gray-800 hover:bg-gray-50 p-1.5 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          const current = modalData.pageIds || []
                          if (e.target.checked) {
                            setModalData({ ...modalData, pageIds: [...current, p.id] })
                          } else {
                            setModalData({ ...modalData, pageIds: current.filter(id => id !== p.id) })
                          }
                        }}
                        className="mr-2 rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className="truncate font-medium">{p.title}</span>
                    </label>
                  )
                })}
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
              <button
                onClick={() => setModalType(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => handleAction({
                  action: "batch_tag_posts",
                  pageIds: modalData.pageIds || [],
                  addTags: (modalData.addTags || "").split(",").map(s => s.trim()).filter(Boolean),
                  removeTags: (modalData.removeTags || "").split(",").map(s => s.trim()).filter(Boolean)
                })}
                disabled={isProcessing || !(modalData.pageIds || []).length}
                className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm transition-colors disabled:opacity-50"
              >
                {isProcessing ? "批量处理中..." : "确认执行"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
