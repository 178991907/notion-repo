import { verifyFansPasscode } from '@/lib/fans/auth'
import { getFansConfigFromNotion } from '@/lib/member/notion'

/**
 * 粉丝专区验证码 / 通用暗号在线校验接口
 * 保证即使静态页面构建缓存未更新，用户在后台修改暗号后也能实时放行验证
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: '仅支持 POST 请求' })
  }

  try {
    const { passcode, fansCode } = req.body || {}

    if (!passcode || typeof passcode !== 'string' || !passcode.trim()) {
      return res.status(400).json({ success: false, valid: false, message: '请输入验证码或暗号' })
    }

    // 1. 获取全站最新的通用暗号（优先内存覆盖，其次 Notion 数据库，最后默认兜底）
    let defaultPasscode = global.__adminConfigOverrides?.HEO_FANS_DEFAULT_PASSCODE
    if (!defaultPasscode) {
      try {
        const config = await getFansConfigFromNotion()
        defaultPasscode = config?.defaultPasscode
        if (defaultPasscode && global.__adminConfigOverrides) {
          global.__adminConfigOverrides.HEO_FANS_DEFAULT_PASSCODE = defaultPasscode
        }
      } catch (err) {
        console.warn('[FansVerifyAPI] 获取 Notion 配置异常:', err.message)
      }
    }
    if (!defaultPasscode) {
      defaultPasscode = process.env.HEO_FANS_DEFAULT_PASSCODE || '888888'
    }

    // 2. 双轨放行校验（专属码与通用暗号均可验证）
    const result = verifyFansPasscode(passcode, fansCode, defaultPasscode)

    return res.status(200).json({
      success: true,
      valid: result.valid,
      isGlobal: result.isGlobal,
      message: result.message
    })
  } catch (error) {
    console.error('[FansVerifyAPI] 校验异常:', error)
    return res.status(500).json({
      success: false,
      valid: false,
      message: '服务器校验异常，请稍后重试'
    })
  }
}
