import React from 'react'
import { useMember } from '@/hooks/useMember'
import { siteConfig } from '@/lib/config'
import CONFIG from '../config'

/**
 * 会员专属文章锁定拦截卡片
 * 支持未登录拦截与普通会员跨级访问 SVIP 升级提示
 */
export const MemberLock = ({ requiredLevel = 'VIP', lockReason = 'not_logged_in' }) => {
  const { member, openAuthModal } = useMember()
  const isLevelUpgrade = lockReason === 'level_required'
  const isSVIP = requiredLevel === 'SVIP'

  const contactUrl = siteConfig('HEO_SOCIAL_CARD_URL', 'https://pic1.imgdb.cn/i/034BfzDhRhxZqya8uJorEM.png', CONFIG)
  const vipIcon = siteConfig('HEO_VIP_ICON', '👑', CONFIG)
  const vipColor = siteConfig('HEO_VIP_COLOR', '#f59e0b', CONFIG)
  const vipColorEnd = siteConfig('HEO_VIP_COLOR_END', '#eab308', CONFIG)
  const svipIcon = siteConfig('HEO_SVIP_ICON', '💎', CONFIG)
  const svipColor = siteConfig('HEO_SVIP_COLOR', '#8b5cf6', CONFIG)
  const svipColorEnd = siteConfig('HEO_SVIP_COLOR_END', '#d97706', CONFIG)

  return (
    <div className='w-full py-16 px-6 my-8 flex flex-col items-center justify-center bg-gradient-to-b from-indigo-50/50 via-white to-indigo-50/20 dark:from-indigo-950/20 dark:via-[#1e1e20] dark:to-indigo-950/10 border border-indigo-100/80 dark:border-indigo-900/40 rounded-3xl shadow-sm text-center'>
      {/* 锁图标 / 皇冠 / 宝石徽章 */}
      <div className='relative mb-5'>
        <div
          style={{
            background: isSVIP
              ? `linear-gradient(135deg, ${svipColor}, ${svipColorEnd})`
              : `linear-gradient(135deg, ${vipColor}, ${vipColorEnd})`
          }}
          className='w-16 h-16 rounded-2xl text-white flex items-center justify-center text-3xl shadow-lg'>
          <span>{isSVIP ? svipIcon : vipIcon}</span>
        </div>
        <span className={`absolute -top-1 -right-1 px-2 py-0.5 text-[10px] font-bold ${isSVIP ? 'bg-amber-400 text-purple-950' : 'bg-amber-400 text-amber-950'} rounded-full shadow-sm uppercase`}>
          {isSVIP ? 'SVIP' : 'VIP'}
        </span>
      </div>

      {/* 标题与说明 */}
      <h3 className='text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2'>
        {isLevelUpgrade ? '本文为【高级会员 (SVIP)】尊享专栏' : isSVIP ? '本文为【高级会员 (SVIP)】尊享内容' : '本文为会员专享内容'}
      </h3>
      <p className='text-sm text-gray-500 dark:text-gray-400 max-w-md mb-6 leading-relaxed'>
        {isLevelUpgrade ? (
          <>
            您当前登录的账号（<span className='font-bold text-indigo-600 dark:text-indigo-400'>{member?.username}</span>）为 <span className='font-bold text-amber-600 dark:text-amber-400'>{member?.level || '普通会员'}</span>，暂无权限阅读此高阶深度内容。请联系管理员升级至高级会员等级。
          </>
        ) : (
          '本篇深度干货仅对注册会员开放。如果您已拥有会员账号，请直接登录；如您持有专属邀请码，可立即免费注册激活。'
        )}
      </p>

      {/* 会员权益小标签 */}
      <div className='flex flex-wrap items-center justify-center gap-2 mb-8 max-w-lg'>
        <span className='inline-flex items-center text-xs px-3 py-1.5 rounded-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-700 shadow-sm'>
          ✨ {isSVIP ? '独家高阶深度架构与案例' : '深度原创专栏'}
        </span>
        <span className='inline-flex items-center text-xs px-3 py-1.5 rounded-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-700 shadow-sm'>
          📦 {isSVIP ? '全套高级源码与Prompt库' : '独家资料与源码包'}
        </span>
        <span className='inline-flex items-center text-xs px-3 py-1.5 rounded-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-700 shadow-sm'>
          💡 {isSVIP ? '1对1 技术交流与答疑' : '专属知识库直连'}
        </span>
      </div>

      {/* 行动按钮组 */}
      <div className='flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs'>
        {isLevelUpgrade ? (
          <>
            <a
              href={contactUrl}
              target='_blank'
              rel='noopener noreferrer'
              style={{ background: `linear-gradient(135deg, ${svipColor}, ${svipColorEnd})` }}
              className='w-full py-3 px-5 rounded-xl text-sm font-semibold text-white shadow-md transition-all duration-200 cursor-pointer text-center hover:brightness-105 active:scale-98'>
              联系管理员升级等级
            </a>
            <button
              onClick={() => openAuthModal('login')}
              className='w-full py-3 px-5 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer'>
              切换其他账号
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => openAuthModal('login')}
              style={{ background: `linear-gradient(135deg, ${vipColor}, ${vipColorEnd})` }}
              className='w-full py-3 px-5 rounded-xl text-sm font-semibold text-white shadow-md transition-all duration-200 cursor-pointer hover:brightness-105 active:scale-98'>
              会员账号登录
            </button>
            <button
              onClick={() => openAuthModal('register')}
              className='w-full py-3 px-5 rounded-xl text-sm font-semibold text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-800 border border-indigo-200 dark:border-indigo-900 hover:bg-indigo-50 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer'>
              凭邀请码注册
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default MemberLock
