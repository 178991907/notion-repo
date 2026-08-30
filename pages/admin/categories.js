import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import Head from "next/head"
import Link from "next/link"

export default function CategoryManagement() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [categories, setCategories] = useState([])
  const [uncategorizedPosts, setUncategorizedPosts] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState(null)
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
      const res = await fetch("/api/admin/categories")
      if (res.status === 401) {
        router.push("/admin/login")
        return
      }
      const data = await res.json()
      if (data.success) {
        setCategories(data.categories || [])
        setUncategorizedPosts(data.uncategorizedPosts || [])
      }
    } catch (err) {
      showToast("加载数据失败: " + err.message, "error")
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
      const res = await fetch("/api/admin/categories", {
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

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const emptyCategoriesCount = categories.filter(c => c.count === 0).length

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
        <title>分类管理 | Notion Repo 管理后台</title>
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
              <span className="text-gray-900 font-bold text-base">📁 分类编辑管理 (Categories)</span>
            </div>
            <div className="flex items-center space-x-3">
              {emptyCategoriesCount > 0 && (
                <button
                  onClick={() => handleAction({ action: "cleanup_empty" })}
                  disabled={isProcessing}
                  className="inline-flex items-center px-3 py-2 border border-orange-300 text-xs font-medium rounded-lg text-orange-700 bg-orange-50 hover:bg-orange-100 transition-colors disabled:opacity-50"
                >
                  🧹 清理 {emptyCategoriesCount} 个无文章空分类
                </button>
              )}
              <button
                onClick={() => {
                  setModalType("create")
                  setModalData({ name: "" })
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors"
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                新建分类
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-grow space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-500">已注册分类</div>
              <div className="text-3xl font-extrabold text-gray-900 mt-1">{categories.length} <span className="text-sm font-normal text-gray-500">个</span></div>
            </div>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-xl font-bold">
              📁
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-500">已分类文章总数</div>
              <div className="text-3xl font-extrabold text-green-600 mt-1">{categories.reduce((s, c) => s + c.count, 0)} <span className="text-sm font-normal text-gray-500">篇</span></div>
            </div>
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center text-xl font-bold">
              📄
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-500">未分类文章</div>
              <div className="text-3xl font-extrabold text-orange-600 mt-1">{uncategorizedPosts.length} <span className="text-sm font-normal text-gray-500">篇</span></div>
            </div>
            <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center text-xl font-bold">
              ⚠️
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="搜索分类名称..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
            <div className="absolute left-3 top-2.5 text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            提示：重命名/删除分类将同步更新文章与 Notion Schema 结构，旧卡片会自动移除。
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((cat) => (
            <div key={cat.name} className="bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-200 transition-all overflow-hidden flex flex-col justify-between">
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-blue-50 text-blue-700 border border-blue-100">
                    📁 {cat.name}
                  </span>
                  <span className={"text-xs font-semibold px-2.5 py-0.5 rounded-full " + (cat.count === 0 ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-700")}>
                    {cat.count} 篇文章
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-4">
                  前台分类链接: <code className="text-gray-700 font-mono bg-gray-50 px-1 py-0.5 rounded">/category/{cat.name}</code>
                </p>

                <div className="flex items-center space-x-2 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => {
                      setModalType("rename")
                      setModalData({ oldName: cat.name, newName: cat.name })
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2.5 py-1.5 rounded hover:bg-blue-50 transition-colors"
                  >
                    ✏️ 重命名
                  </button>
                  <button
                    onClick={() => {
                      setModalType("merge")
                      setModalData({ sourceName: cat.name, targetName: "" })
                    }}
                    className="text-xs text-purple-600 hover:text-purple-800 font-medium px-2.5 py-1.5 rounded hover:bg-purple-50 transition-colors"
                  >
                    🔀 合并
                  </button>
                  <button
                    onClick={() => {
                      setModalType("delete")
                      setModalData({ name: cat.name, targetCategory: "" })
                    }}
                    className="text-xs text-red-600 hover:text-red-800 font-medium px-2.5 py-1.5 rounded hover:bg-red-50 transition-colors"
                  >
                    🗑️ 删除
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex items-center justify-between">
                <button
                  onClick={() => setActiveCategory(activeCategory === cat.name ? null : cat.name)}
                  className="text-xs font-medium text-gray-600 hover:text-gray-900 flex items-center"
                >
                  {activeCategory === cat.name ? "收起文章列表 ▲" : ("查看包含的 " + cat.count + " 篇文章 ▼")}
                </button>
              </div>

              {activeCategory === cat.name && (
                <div className="p-4 bg-gray-50 border-t border-gray-200 max-h-60 overflow-y-auto space-y-2">
                  {cat.posts.length === 0 ? (
                    <div className="text-xs text-gray-400 py-2 text-center">暂无关联文章（可直接点击上方删除移除该分类）</div>
                  ) : (
                    cat.posts.map(p => (
                      <div key={p.id} className="p-2 bg-white rounded border border-gray-200 text-xs flex justify-between items-center">
                        <div className="truncate mr-2">
                          <div className="font-medium text-gray-900 truncate">{p.title}</div>
                          <div className="text-gray-400 text-[10px]">{p.date || "无日期"} · {p.slug}</div>
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
          ))}
        </div>

        {uncategorizedPosts.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-orange-900 flex items-center">
                  <span className="mr-2">⚠️</span> 未分类文章列表 ({uncategorizedPosts.length} 篇)
                </h3>
                <p className="text-xs text-orange-700 mt-1">
                  以下文章在 Notion 数据库中未设置 category 属性，建议为它们分配一个分类：
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {uncategorizedPosts.map(p => (
                <div key={p.id} className="bg-white p-4 rounded-lg border border-orange-200 shadow-sm flex flex-col justify-between">
                  <div className="mb-3">
                    <div className="font-bold text-sm text-gray-900 truncate">{p.title}</div>
                    <div className="text-xs text-gray-400 mt-1">发布时间: {p.date || "未设置"}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          handleAction({
                            action: "update_post_category",
                            pageId: p.id,
                            category: e.target.value
                          })
                        }
                      }}
                      defaultValue=""
                      className="w-full text-xs border border-gray-300 rounded py-1 px-2 outline-none focus:border-blue-500"
                    >
                      <option value="" disabled>选择分配分类...</option>
                      {categories.map(c => (
                        <option key={c.name} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {modalType === "create" && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">新建分类</h3>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">分类名称</label>
              <input
                type="text"
                placeholder="例如：AI 探索、英语进阶、随笔感悟..."
                value={modalData.name || ""}
                onChange={(e) => setModalData({ ...modalData, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
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
                onClick={() => handleAction({ action: "create", name: modalData.name })}
                disabled={isProcessing || !modalData.name?.trim()}
                className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm transition-colors disabled:opacity-50"
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
            <h3 className="text-lg font-bold text-gray-900">重命名分类</h3>
            <p className="text-xs text-gray-500">
              将原分类 <span className="font-bold text-gray-900">「{modalData.oldName}」</span> 重命名。确认后将更新全部关联文章，并在 Notion Schema 中完成同步替换。
            </p>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">新分类名称</label>
              <input
                type="text"
                value={modalData.newName || ""}
                onChange={(e) => setModalData({ ...modalData, newName: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
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
                  action: "rename",
                  oldName: modalData.oldName,
                  newName: modalData.newName
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
            <h3 className="text-lg font-bold text-gray-900">合并分类</h3>
            <p className="text-xs text-gray-500">
              将分类 <span className="font-bold text-gray-900">「{modalData.sourceName}」</span> 下的所有文章转移到目标分类中，原分类将被移除：
            </p>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">目标分类</label>
              <select
                value={modalData.targetName || ""}
                onChange={(e) => setModalData({ ...modalData, targetName: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="" disabled>请选择合并目标分类...</option>
                {categories.filter(c => c.name !== modalData.sourceName).map(c => (
                  <option key={c.name} value={c.name}>{c.name} ({c.count} 篇)</option>
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
                  sourceName: modalData.sourceName,
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

      {modalType === "delete" && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-red-600 flex items-center">
              <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              删除分类
            </h3>
            <p className="text-xs text-gray-600">
              确定要删除分类 <span className="font-bold text-gray-900">「{modalData.name}」</span> 吗？该分类将彻底从 Notion 数据库 Schema 中注销。
            </p>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">该分类下的文章如何处理？</label>
              <select
                value={modalData.targetCategory || ""}
                onChange={(e) => setModalData({ ...modalData, targetCategory: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">设为未分类 (清空分类属性)</option>
                {categories.filter(c => c.name !== modalData.name).map(c => (
                  <option key={c.name} value={c.name}>转移到「{c.name}」</option>
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
                  action: "delete",
                  name: modalData.name,
                  targetCategory: modalData.targetCategory || null
                })}
                disabled={isProcessing}
                className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium shadow-sm transition-colors disabled:opacity-50"
              >
                {isProcessing ? "删除中..." : "确认彻底删除"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
