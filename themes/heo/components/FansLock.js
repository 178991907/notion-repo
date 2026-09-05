import React, { useState } from 'react'
import { siteConfig } from '@/lib/config'
import CONFIG from '../config'
import { verifyFansPasscode, saveFansUnlockRecord } from '@/lib/fans/auth'
import { useMember } from '@/hooks/useMember'

/**
 * 粉丝专享福利内容拦截与验证码解锁卡片
 * 免登录免注册，输入暗号即可秒看
 */
export const FansLock = ({ post, onUnlocked }) => {
  const { openAuthModal } = useMember()
  const [passcode, setPasscode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [failedCount, setFailedCount] = useState(0)
  const [cooldownSeconds, setCooldownSeconds] = useState(0)

  // 处理锁定倒计时
  React.useEffect(() => {
    let timer = null
    if (cooldownSeconds > 0) {
      timer = setInterval(() => {
        setCooldownSeconds(prev => (prev <= 1 ? 0 : prev - 1))
      }, 1000)
    }
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [cooldownSeconds])

  // 读取配置项
  const defaultPasscode = siteConfig('HEO_FANS_DEFAULT_PASSCODE', '888888', CONFIG)
  const unlockTips = siteConfig(
    'HEO_FANS_UNLOCK_TIPS',
    '关注微信公众号【Terry校长】，后台回复【暗号】免费获取解锁验证码',
    CONFIG
  )
  const contactUrl = siteConfig('HEO_SOCIAL_CARD_URL', 'https://pic1.imgdb.cn/i/034BfzDhRhxZqya8uJorEM.png', CONFIG)
  const fansIcon = siteConfig('HEO_FANS_ICON', '🎁', CONFIG)
  const fansColor = siteConfig('HEO_FANS_COLOR', '#10b981', CONFIG)
  const fansColorEnd = siteConfig('HEO_FANS_COLOR_END', '#14b8a6', CONFIG)

  // 处理解锁校验
  const handleUnlock = async e => {
    if (e) e.preventDefault()
    if (cooldownSeconds > 0) {
      setError(`连续输错次数过多，请等待 ${cooldownSeconds} 秒后再试`)
      return
    }
    const cleanPasscode = passcode.trim()
    if (!cleanPasscode) {
      setError('请输入验证码或暗号')
      return
    }

    setLoading(true)
    setError('')

    // 1. 本地快速双轨校验（专属码与当前页面通用暗号）
    const localResult = verifyFansPasscode(cleanPasscode, post?.fans_code, defaultPasscode)
    if (localResult.valid) {
      setSuccess(true)
      setFailedCount(0)
      saveFansUnlockRecord(post?.id || post?.slug, localResult.isGlobal)
      setTimeout(() => {
        if (onUnlocked) onUnlocked()
      }, 500)
      setLoading(false)
      return
    }

    // 2. 本地未命中时，发起云端最新配置实时校验（解决静态缓存暗号延迟问题）
    try {
      const res = await fetch('/api/fans/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passcode: cleanPasscode,
          fansCode: post?.fans_code
        })
      })
      const data = await res.json()
      if (data?.valid) {
        setSuccess(true)
        setFailedCount(0)
        saveFansUnlockRecord(post?.id || post?.slug, data.isGlobal)
        setTimeout(() => {
          if (onUnlocked) onUnlocked()
        }, 500)
        setLoading(false)
        return
      }
    } catch (err) {
      console.warn('[FansLock] 在线校验异常:', err)
    }

    // 3. 校验不通过，计算连续错误次数
    const nextFailed = failedCount + 1
    setFailedCount(nextFailed)
    if (nextFailed >= 5) {
      setCooldownSeconds(60)
      setError('⚠️ 连续输入错误达到 5 次，已开启安全保护，请 60 秒后再试')
    } else {
      setError(`${localResult.message || '验证码或暗号不正确'}${nextFailed >= 3 ? ` (已连续输错 ${nextFailed} 次)` : ''}`)
    }
    setLoading(false)
  }

  return (
    <div className='w-full py-14 px-6 my-8 flex flex-col items-center justify-center bg-gradient-to-b from-emerald-50/60 via-white to-teal-50/30 dark:from-emerald-950/20 dark:via-[#1e1e20] dark:to-teal-950/10 border border-emerald-100/90 dark:border-emerald-900/40 rounded-3xl shadow-sm text-center'>
      {/* 礼物图标与徽标 */}
      <div className='relative mb-5'>
        <div
          style={{ background: `linear-gradient(135deg, ${fansColor}, ${fansColorEnd})` }}
          className='w-16 h-16 rounded-2xl text-white flex items-center justify-center text-3xl shadow-lg transform transition-transform hover:scale-105 duration-300'>
          <span>{fansIcon}</span>
        </div>
        <span className='absolute -top-1 -right-1 px-2.5 py-0.5 text-[10px] font-bold bg-amber-400 text-emerald-950 rounded-full shadow-sm'>
          粉丝福利
        </span>
      </div>

      {/* 标题 */}
      <h3 className='text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2'>
        本文为【粉丝专享福利】内容
      </h3>

      {/* 引导文案 */}
      <p className='text-sm text-gray-600 dark:text-gray-300 max-w-md mb-6 leading-relaxed'>
        {unlockTips}
      </p>

      {/* 粉丝权益标签 */}
      <div className='flex flex-wrap items-center justify-center gap-2 mb-7 max-w-lg'>
        <span className='inline-flex items-center text-xs px-3 py-1.5 rounded-full bg-white dark:bg-gray-800 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900 shadow-xs'>
          ⚡ 免注册免登录
        </span>
        <span className='inline-flex items-center text-xs px-3 py-1.5 rounded-full bg-white dark:bg-gray-800 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900 shadow-xs'>
          🔑 输入暗号秒开
        </span>
        <span className='inline-flex items-center text-xs px-3 py-1.5 rounded-full bg-white dark:bg-gray-800 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900 shadow-xs'>
          ✨ 30 天自动免密
        </span>
      </div>

      {/* 验证码表单 */}
      <form onSubmit={handleUnlock} className='w-full max-w-sm space-y-3'>
        <div className='relative'>
          <input
            type='text'
            value={passcode}
            onChange={e => {
              setPasscode(e.target.value)
              setError('')
            }}
            placeholder='请输入粉丝暗号 / 验证码'
            className='w-full px-4 py-3 text-center tracking-widest text-base font-medium rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/80 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-all'
          />
        </div>

        {error && (
          <p className='text-xs text-rose-500 dark:text-rose-400 font-medium animate-shake'>
            {error}
          </p>
        )}

        {success && (
          <p className='text-xs text-emerald-600 dark:text-emerald-400 font-bold'>
            ✨ 验证通过，正在为您展示全文...
          </p>
        )}

        <button
          type='submit'
          disabled={loading || success || cooldownSeconds > 0}
          style={{ background: `linear-gradient(135deg, ${fansColor}, ${fansColorEnd})` }}
          className='w-full py-3 px-5 rounded-xl text-sm font-semibold text-white shadow-md transition-all duration-200 cursor-pointer disabled:opacity-50 hover:brightness-105 active:scale-98'>
          {loading ? '正在验证暗号...' : success ? '解锁成功' : cooldownSeconds > 0 ? `安全冷却中 (${cooldownSeconds}s)` : '✨ 立即解锁阅读'}
        </button>

        {contactUrl && (
          <div className='pt-1'>
            <a
              href={contactUrl}
              target='_blank'
              rel='noopener noreferrer'
              className='text-xs text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1'>
              <span>还没有暗号？点击扫码获取</span>
              <i className='fas fa-arrow-up-right-from-square text-[10px]' />
            </a>
          </div>
        )}

        <div className='pt-3 mt-1 border-t border-emerald-100/70 dark:border-emerald-900/30 flex items-center justify-center gap-1.5 text-xs text-gray-500 dark:text-gray-400'>
          <span>👑 网站会员可免暗号畅读</span>
          <button
            type='button'
            onClick={() => openAuthModal('login')}
            className='font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer transition'>
            点击登录会员 →
          </button>
        </div>
      </form>
    </div>
  )
}

export default FansLock
