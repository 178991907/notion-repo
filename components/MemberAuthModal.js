import React, { useState, useEffect } from 'react'
import { useMember } from '@/hooks/useMember'

/**
 * 会员登录与邀请码注册双用弹窗组件
 */
export const MemberAuthModal = () => {
  const {
    isModalOpen,
    closeAuthModal,
    modalTab,
    setModalTab,
    login,
    register
  } = useMember()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 当弹窗打开或 Tab 切换时清空错误信息
  useEffect(() => {
    setErrorMsg('')
  }, [isModalOpen, modalTab])

  if (!isModalOpen) return null

  // 提交处理
  const handleSubmit = async e => {
    if (e) e.preventDefault()
    setErrorMsg('')

    if (!username.trim()) {
      setErrorMsg('请输入会员账号')
      return
    }
    if (!password) {
      setErrorMsg('请输入登录密码')
      return
    }
    if (modalTab === 'register' && !inviteCode.trim()) {
      setErrorMsg('请输入专属邀请码')
      return
    }

    try {
      setIsSubmitting(true)
      if (modalTab === 'login') {
        await login(username.trim(), password, rememberMe)
      } else {
        await register(username.trim(), password, inviteCode.trim())
      }
      // 成功后清空表单
      setUsername('')
      setPassword('')
      setInviteCode('')
    } catch (err) {
      setErrorMsg(err.message || '操作失败，请重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='fixed inset-0 z-[999] flex items-center justify-center p-4'>
      {/* 遮罩背景 */}
      <div
        className='fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate__animated animate__fadeIn animate__faster'
        onClick={closeAuthModal}
      />

      {/* 弹窗主体 */}
      <div className='relative w-full max-w-md bg-white dark:bg-[#1e1e20] rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden z-10 animate__animated animate__zoomIn animate__faster'>
        {/* 顶部关闭按钮 */}
        <button
          onClick={closeAuthModal}
          className='absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1'>
          <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12' />
          </svg>
        </button>

        {/* 顶部标题区 */}
        <div className='px-8 pt-8 pb-4 text-center'>
          <div className='inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 mb-3 shadow-inner'>
            <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' />
            </svg>
          </div>
          <h3 className='text-xl font-bold text-gray-900 dark:text-white'>
            {modalTab === 'login' ? '会员专区登录' : '邀请码注册会员'}
          </h3>
          <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
            {modalTab === 'login'
              ? '登录解锁全部会员专享深度内容与专属资源'
              : '凭借专属邀请码激活您的终身/限定会员特权'}
          </p>
        </div>

        {/* Tab 切换 */}
        <div className='flex mx-8 border-b border-gray-100 dark:border-gray-800'>
          <button
            type='button'
            onClick={() => {
              setModalTab('login')
              setErrorMsg('')
            }}
            className={`flex-1 py-2.5 text-sm font-semibold text-center border-b-2 transition-all ${
              modalTab === 'login'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
            }`}>
            账号登录
          </button>
          <button
            type='button'
            onClick={() => {
              setModalTab('register')
              setErrorMsg('')
            }}
            className={`flex-1 py-2.5 text-sm font-semibold text-center border-b-2 transition-all ${
              modalTab === 'register'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
            }`}>
            邀请码注册
          </button>
        </div>

        {/* 表单内容 */}
        <form onSubmit={e => { void handleSubmit(e) }} className='px-8 py-6 space-y-4'>
          {/* 错误提示框 */}
          {errorMsg && (
            <div className='p-3 text-xs text-red-600 bg-red-50 dark:bg-red-950/40 dark:text-red-400 rounded-lg flex items-center gap-2 border border-red-200 dark:border-red-900/50 animate__animated animate__shakeX'>
              <svg className='w-4 h-4 shrink-0' fill='currentColor' viewBox='0 0 20 20'>
                <path fillRule='evenodd' d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z' clipRule='evenodd' />
              </svg>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 账号输入框 */}
          <div>
            <label className='block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5'>
              会员账号
            </label>
            <input
              type='text'
              autoFocus
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder='请输入用户名/手机号'
              className='w-full px-3.5 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all'
            />
          </div>

          {/* 密码输入框 */}
          <div>
            <div className='flex items-center justify-between mb-1.5'>
              <label className='block text-xs font-medium text-gray-700 dark:text-gray-300'>
                密码
              </label>
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='text-[11px] text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400'>
                {showPassword ? '隐藏' : '显示'}
              </button>
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder='请输入密码'
              className='w-full px-3.5 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all'
            />
          </div>

          {/* 邀请码输入框（仅注册模式展示） */}
          {modalTab === 'register' && (
            <div className='animate__animated animate__fadeIn'>
              <label className='block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5'>
                专属邀请码
              </label>
              <input
                type='text'
                value={inviteCode}
                onChange={e => setInviteCode(e.target.value)}
                placeholder='输入管理员发放的邀请码'
                className='w-full px-3.5 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-indigo-200 dark:border-indigo-900/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all uppercase tracking-wider'
              />
              <p className='text-[11px] text-gray-400 mt-1'>
                * 邀请码由网站管理员在社群或私聊中派发
              </p>
            </div>
          )}

          {/* 登录时记住密码选项 */}
          {modalTab === 'login' && (
            <div className='flex items-center justify-between text-xs pt-1'>
              <label className='flex items-center gap-2 cursor-pointer text-gray-600 dark:text-gray-400 select-none'>
                <input
                  type='checkbox'
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className='rounded text-indigo-600 focus:ring-indigo-500'
                />
                <span>保持登录状态（30天）</span>
              </label>
            </div>
          )}

          {/* 提交按钮 */}
          <button
            type='submit'
            disabled={isSubmitting}
            className='w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition-all duration-200 shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2 cursor-pointer'>
            {isSubmitting ? (
              <>
                <svg className='animate-spin h-4 w-4 text-white' fill='none' viewBox='0 0 24 24'>
                  <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
                  <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8v8z' />
                </svg>
                <span>处理中...</span>
              </>
            ) : modalTab === 'login' ? (
              '立即登录'
            ) : (
              '立即注册并登录'
            )}
          </button>
        </form>

        {/* 底部提示 */}
        <div className='px-8 py-3 bg-gray-50/50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-800 text-center text-[11px] text-gray-400'>
          会员数据由 Notion 官方后台直接管理与验证
        </div>
      </div>
    </div>
  )
}

export default MemberAuthModal
