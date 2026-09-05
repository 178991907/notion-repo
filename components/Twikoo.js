import { siteConfig } from '@/lib/config'
import { loadExternalResource } from '@/lib/utils'
import { useEffect, useRef, useState } from 'react'

/**
 * Giscus评论 @see https://giscus.app/zh-CN
 * Contribute by @txs https://github.com/txs/Notion Repo/commit/1bf7179d0af21fb433e4c7773504f244998678cb
 * @returns {JSX.Element}
 * @constructor
 */

const Twikoo = ({ isDarkMode }) => {
  const isInit = useRef(false)
  let envId = siteConfig('COMMENT_TWIKOO_ENV_ID')
  if (typeof window !== 'undefined' && envId && envId.startsWith('/')) {
    envId = window.location.origin + envId
  }
  const el = siteConfig('COMMENT_TWIKOO_ELEMENT_ID', '#twikoo')
  const twikooCDNURL = siteConfig('COMMENT_TWIKOO_CDN_URL')
  const lang = siteConfig('LANG')

  useEffect(() => {
    if (!envId) return

    const loadTwikoo = async () => {
      try {
        await loadExternalResource(twikooCDNURL, 'js')
        const twikoo = window?.twikoo
        if (
          typeof twikoo !== 'undefined' &&
          twikoo &&
          typeof twikoo.init === 'function'
        ) {
          twikoo.init({
            envId: envId, // 支持内置 /api/twikoo 或外部独立地址
            el: el, // 容器元素
            lang: lang // 用于手动设定评论区语言
          })
          isInit.current = true
        }
      } catch (error) {
        console.error('twikoo 加载失败', error)
      }
    }

    const interval = setInterval(() => {
      if (isInit.current) {
        clearInterval(interval)
      } else {
        loadTwikoo()
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [isDarkMode, envId, el, lang, twikooCDNURL])

  if (!envId) return null

  return <div id="twikoo"></div>
}

export default Twikoo
