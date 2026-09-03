/**
 * 粉丝专区免登录验证码工具模块
 * 提供通用暗号与单篇独立暗号双模式验证
 * 验证成功后在客户端本地存储解锁凭证（默认 30 天有效期），免去重复输入
 */
import { isBrowser } from '@/lib/utils'

// 客户端本地存储前缀
const STORAGE_KEY_PREFIX = 'fans_unlocked_post_'
const STORAGE_KEY_GLOBAL = 'fans_unlocked_global_flag'
// 解锁凭证有效期：30 天（单位：毫秒）
const EXPIRE_TIME_MS = 30 * 24 * 60 * 60 * 1000

/**
 * 格式化文章唯一标识键
 * @param {string} slugOrId
 * @returns {string}
 */
export function getFansStorageKey(slugOrId) {
  if (!slugOrId) return ''
  return `${STORAGE_KEY_PREFIX}${String(slugOrId).trim().replace(/[^\w-]/g, '_')}`
}

/**
 * 检查当前浏览器端是否已解锁该粉丝专享文章
 * @param {string} slugOrId 文章 slug 或 id
 * @returns {boolean} true 表示已解锁放行，false 表示未解锁需输入暗号
 */
export function isFansPostUnlocked(slugOrId) {
  if (!isBrowser || typeof window === 'undefined') {
    return false
  }

  try {
    const now = Date.now()

    // 1. 先检查全站通用粉丝暗号凭证
    const globalRecord = localStorage.getItem(STORAGE_KEY_GLOBAL)
    if (globalRecord) {
      const parsedGlobal = JSON.parse(globalRecord)
      if (parsedGlobal && parsedGlobal.expireAt && parsedGlobal.expireAt > now) {
        return true
      }
    }

    // 2. 检查单篇文章独立解锁凭证
    if (!slugOrId) return false
    const key = getFansStorageKey(slugOrId)
    const item = localStorage.getItem(key)
    if (!item) return false

    const parsed = JSON.parse(item)
    if (parsed && parsed.expireAt && parsed.expireAt > now) {
      return true
    }

    // 已过期，清理旧数据
    localStorage.removeItem(key)
    return false
  } catch (err) {
    console.error('[FansAuth] 读取本地解锁状态失败:', err)
    return false
  }
}

/**
 * 校验用户输入的暗号/验证码
 * @param {string} inputPasscode 用户输入的验证码
 * @param {string} articleFansCode 该文章在 Notion 中配置的专属验证码
 * @param {string} defaultPasscode 系统配置的全站默认通用粉丝验证码
 * @returns {{ valid: boolean, isGlobal: boolean, message?: string }}
 */
export function verifyFansPasscode(inputPasscode, articleFansCode, defaultPasscode = '888888') {
  if (!inputPasscode || typeof inputPasscode !== 'string') {
    return { valid: false, isGlobal: false, message: '请输入粉丝专属验证码或暗号' }
  }

  const cleanInput = inputPasscode.trim().toLowerCase()
  const cleanArticleCode = articleFansCode ? String(articleFansCode).trim().toLowerCase() : ''
  const cleanDefaultCode = defaultPasscode ? String(defaultPasscode).trim().toLowerCase() : '888888'

  // 1. 如果文章设置了专属独立验证码，必须匹配独立验证码
  if (cleanArticleCode) {
    if (cleanInput === cleanArticleCode) {
      return { valid: true, isGlobal: false }
    }
    return { valid: false, isGlobal: false, message: '该文章专属验证码不正确，请核对后再试' }
  }

  // 2. 如果文章未设置独立验证码，则比对全站默认通用验证码
  if (cleanInput === cleanDefaultCode) {
    return { valid: true, isGlobal: true }
  }

  return { valid: false, isGlobal: false, message: '验证码或暗号不正确，请关注公众号回复获取' }
}

/**
 * 记录解锁成功的凭证到本地 localStorage
 * @param {string} slugOrId 文章 slug 或 id
 * @param {boolean} isGlobal 是否为全站通用解锁凭证
 */
export function saveFansUnlockRecord(slugOrId, isGlobal = false) {
  if (!isBrowser || typeof window === 'undefined') return

  try {
    const expireAt = Date.now() + EXPIRE_TIME_MS
    const record = JSON.stringify({ expireAt, unlockedAt: Date.now() })

    if (isGlobal) {
      localStorage.setItem(STORAGE_KEY_GLOBAL, record)
    }

    if (slugOrId) {
      const key = getFansStorageKey(slugOrId)
      localStorage.setItem(key, record)
    }
  } catch (err) {
    console.error('[FansAuth] 写入本地解锁记录失败:', err)
  }
}
