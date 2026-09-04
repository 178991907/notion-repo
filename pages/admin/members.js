import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'

/**
 * 管理后台：会员体系与邀请码管理控制台
 */
export default function AdminMembers() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('invites') // 'invites' | 'members' | 'fans'
  const [members, setMembers] = useState([])
  const [inviteCodes, setInviteCodes] = useState([])
  const [fansConfig, setFansConfig] = useState({
    defaultPasscode: '888888',
    unlockTips: '关注微信公众号【Terry校长】，后台回复【暗号】免费获取解锁验证码'
  })
  const [savingFans, setSavingFans] = useState(false)
  const [toast, setToast] = useState(null)

  // 弹窗状态
  const [showSingleModal, setShowSingleModal] = useState(false)
  const [showBatchModal, setShowBatchModal] = useState(false)
  const [showMemberModal, setShowMemberModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // 表单状态
  const [singleForm, setSingleForm] = useState({
    code: '',
    mode: 'single', // 'single' (一人一码) | 'unlimited' (固定通用码)
    level: 'VIP',
    days: 0,
    remark: ''
  })

  const [batchForm, setBatchForm] = useState({
    count: 5,
    prefix: 'VIP',
    level: 'VIP',
    days: 0,
    remark: ''
  })

  const [memberForm, setMemberForm] = useState({
    username: '',
    password: '',
    level: 'VIP',
    expireDate: '',
    remark: ''
  })

  // 复制提示
  const [copiedCode, setCopiedCode] = useState(null)

  const showToast = (type, message) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3000)
  }

  // 加载数据
  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/members')
      if (res.status === 401) {
        router.push('/admin/login')
        return
      }
      const data = await res.json()
      if (data.success) {
        setMembers(data.members || [])
        setInviteCodes(data.inviteCodes || [])
        if (data.fansConfig) {
          setFansConfig({
            defaultPasscode: data.fansConfig.defaultPasscode || '888888',
            unlockTips: data.fansConfig.unlockTips || '关注微信公众号【Terry校长】，后台回复【暗号】免费获取解锁验证码'
          })
        }
      } else {
        showToast('error', data.message || '加载数据失败')
      }
    } catch (err) {
      console.error(err)
      showToast('error', '请求发生异常')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // 保存粉丝专区通用暗号与引导文案
  const handleSaveFansConfig = async (e) => {
    if (e) e.preventDefault()
    if (!fansConfig.defaultPasscode.trim()) {
      showToast('error', '通用验证码不能为空')
      return
    }
    setSavingFans(true)
    try {
      const res = await fetch('/api/admin/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_fans_config',
          defaultPasscode: fansConfig.defaultPasscode.trim(),
          unlockTips: fansConfig.unlockTips.trim()
        })
      })
      const data = await res.json()
      if (data.success) {
        showToast('success', '✨ 粉丝专区通用验证码与引导语保存成功，即刻生效！')
      } else {
        showToast('error', data.message || '保存失败')
      }
    } catch (err) {
      showToast('error', '保存发生异常')
    } finally {
      setSavingFans(false)
    }
  }

  // 复制邀请码
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedCode(text)
      showToast('success', `邀请码 ${text} 已成功复制到剪贴板！`)
      setTimeout(() => setCopiedCode(null), 2000)
    })
  }

  // 提交新建单个邀请码
  const handleCreateSingle = async (e) => {
    e.preventDefault()
    if (!singleForm.code.trim()) {
      showToast('error', '请输入邀请码内容')
      return
    }
    setSubmitting(true)
    try {
      const maxUses = singleForm.mode === 'unlimited' ? 0 : 1
      const res = await fetch('/api/admin/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_invite',
          code: singleForm.code,
          level: singleForm.level,
          maxUses,
          days: Number(singleForm.days) || 0,
          remark: singleForm.remark
        })
      })
      const data = await res.json()
      if (data.success) {
        showToast('success', `邀请码 ${singleForm.code.toUpperCase()} 创建成功！`)
        setShowSingleModal(false)
        setSingleForm({ code: '', mode: 'single', level: 'VIP', days: 0, remark: '' })
        fetchData()
      } else {
        showToast('error', data.message || '创建失败')
      }
    } catch (err) {
      showToast('error', '创建异常')
    } finally {
      setSubmitting(false)
    }
  }

  // 提交批量生成一人一码
  const handleBatchCreate = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'batch_create_invites',
          count: Number(batchForm.count) || 5,
          prefix: batchForm.prefix || 'VIP',
          level: batchForm.level,
          days: Number(batchForm.days) || 0,
          remark: batchForm.remark
        })
      })
      const data = await res.json()
      if (data.success) {
        showToast('success', `成功批量生成 ${data.count} 个一人一码！`)
        setShowBatchModal(false)
        fetchData()
      } else {
        showToast('error', data.message || '批量生成失败')
      }
    } catch (err) {
      showToast('error', '批量生成异常')
    } finally {
      setSubmitting(false)
    }
  }

  // 提交后台手动创建会员账号
  const handleCreateMember = async (e) => {
    e.preventDefault()
    if (!memberForm.username.trim() || !memberForm.password.trim()) {
      showToast('error', '请输入账号和密码')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_member',
          username: memberForm.username,
          password: memberForm.password,
          level: memberForm.level,
          expireDate: memberForm.expireDate || null,
          remark: memberForm.remark
        })
      })
      const data = await res.json()
      if (data.success) {
        showToast('success', `会员账号 ${memberForm.username} 创建成功！`)
        setShowMemberModal(false)
        setMemberForm({ username: '', password: '', level: 'VIP', expireDate: '', remark: '' })
        fetchData()
      } else {
        showToast('error', data.message || '创建会员失败')
      }
    } catch (err) {
      showToast('error', '创建会员异常')
    } finally {
      setSubmitting(false)
    }
  }

  // 切换邀请码状态
  const handleToggleInviteStatus = async (item) => {
    const newStatus = item.status === 'Active' ? 'Disabled' : 'Active'
    try {
      const res = await fetch('/api/admin/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle_invite_status',
          id: item.id,
          status: newStatus
        })
      })
      const data = await res.json()
      if (data.success) {
        showToast('success', `邀请码状态已更新为：${newStatus === 'Active' ? '有效' : '已禁用'}`)
        fetchData()
      } else {
        showToast('error', data.message || '更新状态失败')
      }
    } catch (err) {
      showToast('error', '更新状态异常')
    }
  }

  // 统计数据
  const singleCount = inviteCodes.filter(i => i.isSingleUse).length
  const unlimitedCount = inviteCodes.filter(i => i.isUnlimited).length
  const svipMemberCount = members.filter(m => m.level === 'SVIP').length

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Head>
        <title>会员与邀请码管理 | Notion Repo 控制台</title>
      </Head>

      {/* 顶部提示 Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg text-white font-medium text-sm flex items-center gap-2 transition-all transform animate-bounce ${
          toast.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'
        }`}>
          <span>{toast.type === 'error' ? '❌' : '✅'}</span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* 顶部导航 */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
              <Link href="/admin" className="text-gray-500 hover:text-gray-900 transition flex items-center gap-1 text-sm font-bold">
                <span>← 返回控制台</span>
              </Link>
              <div className="h-4 w-[1px] bg-gray-200" />
              <span className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                <span>🔑 会员与邀请码管理</span>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => { void fetchData() }}
                className="text-xs font-bold text-gray-600 hover:text-blue-600 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-blue-300 transition flex items-center gap-1 cursor-pointer">
                <span>🔄 刷新数据</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 主体内容 */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* 数据总览卡片 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-white rounded-2xl shadow-xs p-5 border border-gray-100 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-gray-400 mb-1">会员注册总数</div>
              <div className="text-2xl font-black text-gray-900">{members.length} 位</div>
              <div className="text-[11px] text-gray-400 mt-1">其中 SVIP: {svipMemberCount} 位</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl font-bold">
              👑
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xs p-5 border border-gray-100 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-gray-400 mb-1">一人一码 (一次性)</div>
              <div className="text-2xl font-black text-emerald-600">{singleCount} 个</div>
              <div className="text-[11px] text-gray-400 mt-1">用完自动作废，互不干扰</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl font-bold">
              👤
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xs p-5 border border-gray-100 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-gray-400 mb-1">固定通用码 (多人可用)</div>
              <div className="text-2xl font-black text-purple-600">{unlimitedCount} 个</div>
              <div className="text-[11px] text-gray-400 mt-1">全站通用，允许多人核销</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-2xl font-bold">
              🌐
            </div>
          </div>

          <div
            onClick={() => setActiveTab('fans')}
            className="bg-white rounded-2xl shadow-xs p-5 border border-gray-100 hover:border-emerald-300 hover:shadow-sm transition flex items-center justify-between cursor-pointer group">
            <div>
              <div className="text-xs font-bold text-gray-400 mb-1 flex items-center gap-1.5">
                <span>粉丝专区通用暗号</span>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">免登录</span>
              </div>
              <div className="text-2xl font-mono font-black text-emerald-700 tracking-wider group-hover:text-emerald-600 transition">
                {fansConfig.defaultPasscode || '888888'}
              </div>
              <div className="text-[11px] text-emerald-600/90 font-medium mt-1">👑 会员享有全站免码直读特权</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl font-bold group-hover:scale-110 transition-transform">
              🎁
            </div>
          </div>
        </div>

        {/* Tab 导航与操作栏 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          {/* Tab 切换 */}
          <div className="flex items-center gap-2 bg-gray-200/80 p-1.5 rounded-xl w-fit flex-wrap">
            <button
              onClick={() => setActiveTab('invites')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'invites'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}>
              <span>🔑 邀请码管理</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">
                {inviteCodes.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'members'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}>
              <span>👥 会员账号管理</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
                {members.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('fans')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'fans'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}>
              <span>🎁 粉丝专区访问码与等级指南</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono font-bold">
                {fansConfig.defaultPasscode || '888888'}
              </span>
            </button>
          </div>

          {/* 右侧快捷按钮 */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {activeTab === 'invites' && (
              <>
                <button
                  onClick={() => setShowBatchModal(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer">
                  <span>⚡ 批量生成一人一码</span>
                </button>
                <button
                  onClick={() => setShowSingleModal(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer">
                  <span>+ 新建邀请码</span>
                </button>
              </>
            )}
            {activeTab === 'members' && (
              <button
                onClick={() => setShowMemberModal(true)}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer">
                <span>+ 管理员手动建账号</span>
              </button>
            )}
            {activeTab === 'fans' && (
              <a
                href="/fans"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer">
                <span>🔗 预览粉丝专区前台 →</span>
              </a>
            )}
          </div>
        </div>

        {/* ======================= Tab 1: 邀请码列表 ======================= */}
        {activeTab === 'invites' && (
          <div className="bg-white rounded-2xl shadow-xs border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="py-20 text-center text-gray-400 font-medium">正在拉取邀请码数据...</div>
            ) : inviteCodes.length === 0 ? (
              <div className="py-20 text-center text-gray-400 space-y-3">
                <div className="text-4xl">🔑</div>
                <div>暂无邀请码记录，您可以点击上方按钮快速创建！</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold text-xs uppercase tracking-wider">
                      <th className="py-3.5 px-4">邀请码 (Code)</th>
                      <th className="py-3.5 px-4">类型模式</th>
                      <th className="py-3.5 px-4">解锁等级</th>
                      <th className="py-3.5 px-4">使用进度</th>
                      <th className="py-3.5 px-4">有效期限</th>
                      <th className="py-3.5 px-4">状态</th>
                      <th className="py-3.5 px-4">备注说明</th>
                      <th className="py-3.5 px-4 text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                    {inviteCodes.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50/80 transition">
                        {/* 邀请码内容 + 一键复制 */}
                        <td className="py-3 px-4 font-mono font-bold text-gray-900">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-gray-100 rounded border border-gray-200">
                              {item.code}
                            </span>
                            <button
                              onClick={() => copyToClipboard(item.code)}
                              title="点击复制邀请码"
                              className="text-xs text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded transition cursor-pointer">
                              {copiedCode === item.code ? '✅ 已复制' : '📋 复制'}
                            </button>
                          </div>
                        </td>

                        {/* 类型模式：一人一码 vs 固定通用码 */}
                        <td className="py-3 px-4">
                          {item.isSingleUse ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span>👤 一人一码</span>
                              <span className="text-[9px] text-emerald-500">(一次性)</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                              <span>🌐 固定通用码</span>
                              <span className="text-[9px] text-purple-500">(多人可用)</span>
                            </span>
                          )}
                        </td>

                        {/* 等级 */}
                        <td className="py-3 px-4">
                          {item.level === 'SVIP' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-md bg-gradient-to-r from-purple-500 to-amber-500 text-white shadow-xs">
                              💎 SVIP
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                              👑 VIP
                            </span>
                          )}
                        </td>

                        {/* 使用进度 */}
                        <td className="py-3 px-4 text-xs font-mono">
                          {item.isUnlimited ? (
                            <span className="text-gray-600">已用 {item.usedCount} 次 (不限)</span>
                          ) : (
                            <span className={`${item.usedCount >= item.maxUses ? 'text-red-500 font-bold' : 'text-gray-700'}`}>
                              {item.usedCount} / {item.maxUses} 次 {item.usedCount >= item.maxUses && '(已核销)'}
                            </span>
                          )}
                        </td>

                        {/* 有效期限 */}
                        <td className="py-3 px-4 text-xs">
                          {item.days > 0 ? (
                            <span className="text-indigo-600 font-semibold">{item.days} 天有效期</span>
                          ) : (
                            <span className="text-gray-500">终身有效</span>
                          )}
                        </td>

                        {/* 状态 */}
                        <td className="py-3 px-4">
                          {item.status === 'Active' && (!item.isSingleUse || item.usedCount < item.maxUses) ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              有效可用
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                              已失效/用完
                            </span>
                          )}
                        </td>

                        {/* 备注 */}
                        <td className="py-3 px-4 text-xs text-gray-500 max-w-xs truncate">
                          {item.remark || '-'}
                        </td>

                        {/* 操作 */}
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => { void handleToggleInviteStatus(item) }}
                            className="text-xs text-gray-500 hover:text-red-600 transition underline cursor-pointer">
                            {item.status === 'Active' ? '设为作废' : '恢复启用'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ======================= Tab 2: 会员账号列表 ======================= */}
        {activeTab === 'members' && (
          <div className="bg-white rounded-2xl shadow-xs border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="py-20 text-center text-gray-400 font-medium">正在拉取会员数据...</div>
            ) : members.length === 0 ? (
              <div className="py-20 text-center text-gray-400 space-y-3">
                <div className="text-4xl">👥</div>
                <div>暂无注册会员记录，可前台输入邀请码注册，或在后台手动创建！</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold text-xs uppercase tracking-wider">
                      <th className="py-3.5 px-4">账号用户名</th>
                      <th className="py-3.5 px-4">会员等级</th>
                      <th className="py-3.5 px-4">账号状态</th>
                      <th className="py-3.5 px-4">到期时间</th>
                      <th className="py-3.5 px-4">注册邀请码</th>
                      <th className="py-3.5 px-4">注册加入时间</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                    {members.map((m) => (
                      <tr key={m.id} className="hover:bg-gray-50/80 transition">
                        <td className="py-3 px-4 font-bold text-gray-900 flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-black">
                            {m.username.slice(0, 1).toUpperCase()}
                          </div>
                          <span>{m.username}</span>
                        </td>
                        <td className="py-3 px-4">
                          {m.level === 'SVIP' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-md bg-gradient-to-r from-purple-500 to-amber-500 text-white shadow-xs">
                              💎 SVIP 尊享
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                              👑 VIP 会员
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            {m.status || 'Active'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs font-mono">
                          {m.expireDate ? (
                            <span className="text-gray-700">{m.expireDate}</span>
                          ) : (
                            <span className="text-emerald-600 font-semibold">终身会员</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-xs font-mono text-gray-500">
                          {m.inviteCode || '-'}
                        </td>
                        <td className="py-3 px-4 text-xs text-gray-400">
                          {m.createdAt ? new Date(m.createdAt).toLocaleDateString() : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ======================= Tab 3: 粉丝专区访问码与等级指南 ======================= */}
        {activeTab === 'fans' && (
          <div className="space-y-6">
            {/* 顶部声明：会员直通特权 */}
            <div className="p-5 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-amber-500/10 border border-emerald-300/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center text-2xl font-bold shadow-sm shrink-0">
                  🎁
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-gray-900 text-base">粉丝专区限制访问码管理中心</span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      免登录极速阅读
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      👑 会员全站免码直通
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    粉丝专区专为微信公众号与社群引流设计，读者无需注册账号，输入暗号即可秒开阅读。同时，已登录的网站会员自动享有最高特权，完全免输暗号直接畅读！
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 卡片 1: 全站通用粉丝暗号与引导语配置 */}
              <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">🔑</span>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">全站默认通用暗号与引导文案</h4>
                      <p className="text-xs text-gray-400">文章未单独填写专属码时，全站通用此验证码</p>
                    </div>
                  </div>
                </div>

                <form onSubmit={(e) => { void handleSaveFansConfig(e) }} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      全站默认通用暗号 / 验证码
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={fansConfig.defaultPasscode}
                        onChange={(e) => setFansConfig({ ...fansConfig, defaultPasscode: e.target.value })}
                        placeholder="888888"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 font-mono font-bold text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-base tracking-widest"
                      />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">
                      当 Notion 文章中勾选了 <code className="text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded font-bold">fans</code> 但未填写独立验证码时，输入该暗号即可一键解锁。
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      粉丝解锁引导提示语
                    </label>
                    <textarea
                      rows={3}
                      value={fansConfig.unlockTips}
                      onChange={(e) => setFansConfig({ ...fansConfig, unlockTips: e.target.value })}
                      placeholder="关注微信公众号【Terry校长】，后台回复【暗号】免费获取解锁验证码"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 leading-relaxed"
                    />
                    <p className="text-[11px] text-gray-400 mt-1">
                      展示在文章未解锁卡片及专区横幅中的引导说明，指引读者前往公众号或社群获取。
                    </p>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <button
                      type="submit"
                      disabled={savingFans}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer flex items-center gap-1.5">
                      <span>{savingFans ? '⏳ 正在保存...' : '💾 保存通用暗号与引导语'}</span>
                    </button>
                    <Link
                      href="/admin/settings/theme"
                      className="text-xs text-emerald-700 hover:underline font-bold">
                      调整专区图标与颜色样式 →
                    </Link>
                  </div>
                </form>
              </div>

              {/* 卡片 2: 业务机制与登录持久性核心解答 */}
              <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-6 space-y-4">
                <div className="flex items-center gap-2.5 border-b border-gray-100 pb-4">
                  <span className="text-xl">💡</span>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">核心特权机制与登录免密说明</h4>
                    <p className="text-xs text-gray-400">保障最佳用户体验与引流转化</p>
                  </div>
                </div>

                <div className="space-y-3.5 text-xs text-gray-600 leading-relaxed">
                  <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-1.5">
                    <div className="font-black text-amber-900 flex items-center gap-1.5 text-xs">
                      <span>👑</span>
                      <span>会员不需要输入访问码，登录直接畅读！</span>
                    </div>
                    <p className="text-amber-800 text-[11px] leading-relaxed">
                      已在系统中全面实现：<strong>会员权限涵盖粉丝专区</strong>。只要读者登录了会员账号（VIP 或 SVIP），阅读任何粉丝福利文章，系统都会自动识别会员身份并直接放行，无需读者去公众号查暗号或输入验证码！
                    </p>
                  </div>

                  <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-xl space-y-1.5">
                    <div className="font-black text-blue-900 flex items-center gap-1.5 text-xs">
                      <span>🔄</span>
                      <span>登录后全站免密，阅读每篇文章无需重复登录！</span>
                    </div>
                    <p className="text-blue-800 text-[11px] leading-relaxed">
                      会员登录成功后，系统会安全签发 <strong>30 天持久有效凭证 (Token)</strong> 并保存在浏览器中。无论是阅读 VIP 专栏、SVIP 深度文章还是粉丝专区，均<strong>全自动免密放行</strong>，无需每看一篇都重复登录！
                    </p>
                  </div>

                  <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl space-y-1.5">
                    <div className="font-black text-emerald-900 flex items-center gap-1.5 text-xs">
                      <span>⚡</span>
                      <span>一文双轨策略：既是粉丝内容也是会员内容</span>
                    </div>
                    <p className="text-emerald-800 text-[11px] leading-relaxed">
                      同一篇文章可同时勾选 <code className="font-bold text-emerald-900">fans</code> 和 <code className="font-bold text-amber-900">vip</code>：普通访客可凭暗号极速解锁；已有会员一键登录直接解锁，形成完美的免费引流到付费会员的闭环！
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 卡片 3: Notion 文章数据库字段设置全景指南 */}
            <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">📝</span>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">Notion 博客文章库字段设置指南（已为您自动添加）</h4>
                    <p className="text-xs text-gray-400">我们已通过官方 API 自动为您的 Notion 数据库创建了对应字段，写文章时按需选择即可生效</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  ✅ 数据库属性已全部就绪
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase">
                      <th className="py-3 px-3">Notion 属性名称</th>
                      <th className="py-3 px-3">属性类型</th>
                      <th className="py-3 px-3">可填选项 / 格式</th>
                      <th className="py-3 px-3">业务规则与权限效果</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
                    <tr className="hover:bg-gray-50/80">
                      <td className="py-3 px-3 font-mono font-bold text-emerald-700">fans</td>
                      <td className="py-3 px-3"><span className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-[11px]">复选框 (Checkbox)</span></td>
                      <td className="py-3 px-3 font-bold text-gray-800">勾选 ☑️</td>
                      <td className="py-3 px-3 leading-relaxed">
                        标记为<strong>粉丝福利专区文章</strong>。未登录访客需输入访问码解锁；会员登录后直接放行免输码。
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50/80">
                      <td className="py-3 px-3 font-mono font-bold text-emerald-700">fans_code</td>
                      <td className="py-3 px-3"><span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[11px]">多选标签 (Multi-select)</span></td>
                      <td className="py-3 px-3 font-mono text-blue-600">可贴多个暗号标签（如 AI2026, 888888）</td>
                      <td className="py-3 px-3 leading-relaxed">
                        <strong>文章专属独立验证码（支持多选）</strong>。可为文章添加一个或多个暗号标签（例如不同渠道推文设置不同暗号）；读者<strong>输入其中任意一个暗号均可解锁</strong>。若留空，则自动使用全站默认通用暗号（当前为 <code className="text-emerald-700 font-bold">{fansConfig.defaultPasscode}</code>）。
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50/80">
                      <td className="py-3 px-3 font-mono font-bold text-amber-700">vip</td>
                      <td className="py-3 px-3"><span className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-[11px]">复选框 (Checkbox)</span></td>
                      <td className="py-3 px-3 font-bold text-gray-800">勾选 ☑️</td>
                      <td className="py-3 px-3 leading-relaxed">
                        标记为<strong>会员专享文章</strong>。未登录访客被拦截并提示登录/注册。
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50/80">
                      <td className="py-3 px-3 font-mono font-bold text-purple-700">vip_level</td>
                      <td className="py-3 px-3"><span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-bold text-[11px]">多选标签 (Multi-select)</span></td>
                      <td className="py-3 px-3">
                        <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold mr-1.5">VIP</span>
                        <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 font-bold">SVIP</span>
                      </td>
                      <td className="py-3 px-3 leading-relaxed">
                        <strong>会员等级筛选（支持多选）</strong>。若勾选 <code className="text-amber-800 font-bold">VIP</code>（或同时包含 VIP 与 SVIP）：普通会员与高级会员皆可畅读；若仅勾选 <code className="text-purple-800 font-bold">SVIP</code>：仅高级会员可读，普通会员进入会弹出升级至 SVIP 的尊享提示。
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ===================== 弹窗 1: 单个创建邀请码 ===================== */}
      {showSingleModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
              <span>+ 新建邀请码</span>
            </h3>
            <p className="text-xs text-gray-500 mb-4">可选择创建「一人一码」或「全站固定通用码」</p>

            <form onSubmit={(e) => { void handleCreateSingle(e) }} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">模式类型选择</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSingleForm({ ...singleForm, mode: 'single' })}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition flex flex-col items-center cursor-pointer ${
                      singleForm.mode === 'single'
                        ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-xs'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}>
                    <span>👤 一人一码</span>
                    <span className="text-[10px] font-normal text-gray-500 mt-0.5">一次性核销，用完即作废</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSingleForm({ ...singleForm, mode: 'unlimited' })}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition flex flex-col items-center cursor-pointer ${
                      singleForm.mode === 'unlimited'
                        ? 'border-purple-600 bg-purple-50 text-purple-700 shadow-xs'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}>
                    <span>🌐 固定通用码</span>
                    <span className="text-[10px] font-normal text-gray-500 mt-0.5">多人无限使用，适合活动</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">邀请码字符内容</label>
                <input
                  type="text"
                  required
                  value={singleForm.code}
                  onChange={(e) => setSingleForm({ ...singleForm, code: e.target.value })}
                  placeholder="例如 VIP888 或 AI-COMMUNITY"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">会员等级</label>
                  <select
                    value={singleForm.level}
                    onChange={(e) => setSingleForm({ ...singleForm, level: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="VIP">👑 VIP 普通会员</option>
                    <option value="SVIP">💎 SVIP 高级会员</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">有效天数 (0=终身)</label>
                  <input
                    type="number"
                    min="0"
                    value={singleForm.days}
                    onChange={(e) => setSingleForm({ ...singleForm, days: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">备注说明 (选填)</label>
                <input
                  type="text"
                  value={singleForm.remark}
                  onChange={(e) => setSingleForm({ ...singleForm, remark: e.target.value })}
                  placeholder="如：公众号粉丝专属福利码"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowSingleModal(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition cursor-pointer">
                  取消
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-sm cursor-pointer disabled:opacity-50">
                  {submitting ? '创建中...' : '确认创建'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== 弹窗 2: 批量生成一人一码 ===================== */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
              <span>⚡ 批量生成一人一码</span>
            </h3>
            <p className="text-xs text-gray-500 mb-4">系统将自动生成不重复的一次性核销码，适合私发邀请</p>

            <form onSubmit={(e) => { void handleBatchCreate(e) }} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">生成数量 (1-20)</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    required
                    value={batchForm.count}
                    onChange={(e) => setBatchForm({ ...batchForm, count: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">前缀字符</label>
                  <input
                    type="text"
                    value={batchForm.prefix}
                    onChange={(e) => setBatchForm({ ...batchForm, prefix: e.target.value })}
                    placeholder="例如 VIP"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-emerald-500 outline-none uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">会员等级</label>
                  <select
                    value={batchForm.level}
                    onChange={(e) => setBatchForm({ ...batchForm, level: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none">
                    <option value="VIP">👑 VIP 普通会员</option>
                    <option value="SVIP">💎 SVIP 高级会员</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">有效天数 (0=终身)</label>
                  <input
                    type="number"
                    min="0"
                    value={batchForm.days}
                    onChange={(e) => setBatchForm({ ...batchForm, days: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">批次备注 (选填)</label>
                <input
                  type="text"
                  value={batchForm.remark}
                  onChange={(e) => setBatchForm({ ...batchForm, remark: e.target.value })}
                  placeholder="如：知识星球第一期专属码"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowBatchModal(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition cursor-pointer">
                  取消
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-sm cursor-pointer disabled:opacity-50">
                  {submitting ? '正在批量写入 Notion...' : '确认批量生成'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== 弹窗 3: 手动创建会员账号 ===================== */}
      {showMemberModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
              <span>+ 管理员后台建账号</span>
            </h3>
            <p className="text-xs text-gray-500 mb-4">直接为用户创建账号密码，创建后用户可立即登录</p>

            <form onSubmit={(e) => { void handleCreateMember(e) }} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">用户名 / 账号</label>
                <input
                  type="text"
                  required
                  value={memberForm.username}
                  onChange={(e) => setMemberForm({ ...memberForm, username: e.target.value })}
                  placeholder="如 terry_vip"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">登录密码</label>
                <input
                  type="text"
                  required
                  value={memberForm.password}
                  onChange={(e) => setMemberForm({ ...memberForm, password: e.target.value })}
                  placeholder="设置用户初始密码"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">会员等级</label>
                  <select
                    value={memberForm.level}
                    onChange={(e) => setMemberForm({ ...memberForm, level: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none">
                    <option value="VIP">👑 VIP 普通会员</option>
                    <option value="SVIP">💎 SVIP 高级会员</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">到期时间 (选填)</label>
                  <input
                    type="date"
                    value={memberForm.expireDate}
                    onChange={(e) => setMemberForm({ ...memberForm, expireDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">备注说明 (选填)</label>
                <input
                  type="text"
                  value={memberForm.remark}
                  onChange={(e) => setMemberForm({ ...memberForm, remark: e.target.value })}
                  placeholder="如：微信转账手动开通"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowMemberModal(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition cursor-pointer">
                  取消
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition shadow-sm cursor-pointer disabled:opacity-50">
                  {submitting ? '正在写入 Notion...' : '确认开通'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
