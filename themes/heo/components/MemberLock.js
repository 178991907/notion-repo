import React from 'react'
import { useMember } from '@/hooks/useMember'

/**
 * 会员专属文章锁定拦截卡片
 */
export const MemberLock = () => {
  const { openAuthModal } = useMember()

  return (
    <div className='w-full py-16 px-6 my-8 flex flex-col items-center justify-center bg-gradient-to-b from-indigo-50/50 via-white to-indigo-50/20 dark:from-indigo-950/20 dark:via-[#1e1e20] dark:to-indigo-950/10 border border-indigo-100/80 dark:border-indigo-900/40 rounded-3xl shadow-sm text-center'>
      {/* 锁图标 / 皇冠徽章 */}
      <div className='relative mb-5'>
        <div className='w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30'>
          <svg className='w-8 h-8' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' />
          </svg>
        </div>
        <span className='absolute -top-1 -right-1 px-2 py-0.5 text-[10px] font-bold bg-amber-400 text-amber-950 rounded-full shadow-sm'>
          VIP
        </span>
      </div>

      {/* 标题与说明 */}
      <h3 className='text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2'>
        本文为会员专享内容
      </h3>
      <p className='text-sm text-gray-500 dark:text-gray-400 max-w-md mb-6 leading-relaxed'>
        本篇深度干货仅对注册会员开放。如果您已拥有会员账号，请直接登录；如您持有专属邀请码，可立即免费注册激活。
      </p>

      {/* 会员权益小标签 */}
      <div className='flex flex-wrap items-center justify-center gap-2 mb-8 max-w-lg'>
        <span className='inline-flex items-center text-xs px-3 py-1.5 rounded-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-700 shadow-sm'>
          ✨ 深度原创专栏
        </span>
        <span className='inline-flex items-center text-xs px-3 py-1.5 rounded-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-700 shadow-sm'>
          📦 独家资料与源码包
        </span>
        <span className='inline-flex items-center text-xs px-3 py-1.5 rounded-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-700 shadow-sm'>
          💡 专属知识库直连
        </span>
      </div>

      {/* 行动按钮组 */}
      <div className='flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs'>
        <button
          onClick={() => openAuthModal('login')}
          className='w-full py-3 px-5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-md shadow-indigo-600/20 transition-all duration-200 cursor-pointer'>
          会员账号登录
        </button>
        <button
          onClick={() => openAuthModal('register')}
          className='w-full py-3 px-5 rounded-xl text-sm font-semibold text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-800 border border-indigo-200 dark:border-indigo-900 hover:bg-indigo-50 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer'>
          凭邀请码注册
        </button>
      </div>
    </div>
  )
}

export default MemberLock
