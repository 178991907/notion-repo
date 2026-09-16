'use client'

import BLOG from '@/blog.config'
import { getGlobalSnapshot } from './global'
import { deepClone, isUrlLikePath } from './utils'

/**
 * 读取配置顺序
 * 1. 优先读取NotionConfig表
 * 2. 其次读取环境变量
 * 3. 再读取blog.config.js / 或各个主题的CONFIG文件
 * @param {*} key ； 参数名
 * @param {*} defaultVal ; 参数不存在默认返回值
 * @param {*} extendConfig ; 参考配置对象{key:val}，如果notion中找不到优先尝试在这里面查找
 * @returns
 */
import adminOverrides from './adminConfigOverrides.json'

export const siteConfig = (key, defaultVal = null, extendConfig = {}) => {
  if (!key) {
    return null
  }

  const getValue = (value, fallback) => (hasVal(value) ? value : fallback)
  const hasVal = value => value !== undefined && value !== null

  if (
    key === 'THEME_SWITCH' &&
    hasVal(process.env.NEXT_PUBLIC_THEME_SWITCH)
  ) {
    return convertVal(process.env.NEXT_PUBLIC_THEME_SWITCH)
  }

  // 特殊配置处理；以下配置只在服务端生效；而Global的NOTION_CONFIG仅限前端组件使用，因此需要从extendConfig中读取
  switch (key) {
    case 'NEXT_REVALIDATE_SECOND':
    case 'POST_RECOMMEND_COUNT':
    case 'IMAGE_COMPRESS_WIDTH':
    case 'PSEUDO_STATIC':
    case 'POSTS_SORT_BY':
    case 'POSTS_PER_PAGE':
    case 'POST_PREVIEW_LINES':
    case 'POST_URL_PREFIX':
    case 'POST_LIST_STYLE':
    case 'POST_LIST_PREVIEW':
    case 'POST_URL_PREFIX_MAPPING_CATEGORY':
    case 'POST_SCHEDULE_PUBLISH':
    case 'IS_TAG_COLOR_DISTINGUISHED':
    case 'TAG_SORT_BY_COUNT':
    case 'THEME':
    case 'LINK':
    case 'AI_SUMMARY_API':
    case 'AI_SUMMARY_KEY':
    case 'AI_SUMMARY_CACHE_TIME':
    case 'AI_SUMMARY_WORD_LIMIT':
    case 'UUID_REDIRECT':
      if (key === 'LINK') {
        if (!extendConfig || Object.keys(extendConfig).length === 0) {
          break
        }
      }
      return convertVal(
        getValue(
          (typeof window === 'undefined' && typeof globalThis !== 'undefined' && globalThis.__adminConfigOverrides?.[key] !== undefined)
            ? globalThis.__adminConfigOverrides[key]
            : adminOverrides?.[key],
          getValue(extendConfig[key], getValue(BLOG[key], defaultVal))
        )
      )
    default:
  }

  const globalSnapshot = getGlobalSnapshot()

  // 1. 配置最优先读取NOTION中的表格配置 或 运行时配置
  let val = null
  let siteInfo = null

  if (globalSnapshot) {
    siteInfo = globalSnapshot.siteInfo
    val = globalSnapshot.runtimeConfigOverrides?.[key]
    if (!hasVal(val)) {
      val = hasVal(globalSnapshot.NOTION_CONFIG?.[key])
        ? globalSnapshot.NOTION_CONFIG?.[key]
        : globalSnapshot.THEME_CONFIG?.[key]
    }
  }

  if (!hasVal(val)) {
    // 这里针对部分key做一些兼容处理
    switch (key) {
      case 'HOME_BANNER_IMAGE':
        val = siteInfo?.pageCover // 封面图取Notion的封面
        break
      case 'AVATAR':
        val = siteInfo?.icon // 封面图取Notion的头像
        break
      case 'TITLE':
        val = siteInfo?.title // 标题取Notion中的标题
        break
      case 'DESCRIPTION':
        val = siteInfo?.description // 标题取Notion中的标题
        break
      // Notion 配置表里常见误用 env 风格键名；与 conf/comment.config.js 中 COMMENT_* 对齐
      case 'COMMENT_WALINE_SERVER_URL':
        val =
          globalSnapshot?.NOTION_CONFIG?.WALINE_SERVER_URL ||
          globalSnapshot?.NOTION_CONFIG?.NEXT_PUBLIC_WALINE_SERVER_URL
        break
      case 'COMMENT_WALINE_RECENT':
        val =
          globalSnapshot?.NOTION_CONFIG?.WALINE_RECENT ||
          globalSnapshot?.NOTION_CONFIG?.NEXT_PUBLIC_WALINE_RECENT
        break
    }
  }

  // 2. 获取管理员后台覆盖配置（无论在服务端全局内存，还是打包文件覆盖）
  let currentAdminOverrides = adminOverrides || {}
  if (typeof window === 'undefined' && typeof globalThis !== 'undefined' && globalThis.__adminConfigOverrides) {
    currentAdminOverrides = { ...currentAdminOverrides, ...globalThis.__adminConfigOverrides }
  }

  // 3. 判断是否为主题专有配置（例如 HEO_* 等）。对于主题配置，后台管理保存的配置绝对优先于主题硬编码默认值！
  const isThemeKey = key.startsWith('HEO_') || key.startsWith('HEXO_') || key.startsWith('NEXT_') || key.startsWith('MATERY_') || key.startsWith('FUWARI_') || key.startsWith('GITBOOK_') || key.startsWith('SIMPLE_')

  if (isThemeKey) {
    if (!hasVal(val) && currentAdminOverrides && currentAdminOverrides[key] !== undefined) {
      val = currentAdminOverrides[key]
    }
    if (!hasVal(val) && extendConfig) {
      val = extendConfig[key]
    }
  } else {
    if (!hasVal(val) && extendConfig && extendConfig[key] !== undefined) {
      val = extendConfig[key]
    }
    if (!hasVal(val) && currentAdminOverrides && currentAdminOverrides[key] !== undefined) {
      val = currentAdminOverrides[key]
    }
  }

  // 4. 再次 NOTION和后台都没有找到配置，则读取blog.config.js文件
  if (!hasVal(val)) {
    val = BLOG[key]
  }

  if (!hasVal(val)) {
    return defaultVal
  }

  return convertVal(val)
}

export const cleanJsonString = val => {
  // 使用正则表达式去掉不必要的空格、换行符和制表符
  return val.replace(/\s+/g, ' ').trim()
}

/**
 * 从环境变量和NotionConfig读取的配置都是string类型；
 * 这里识别出配置的字符值若为否 数字、布尔、[]数组，{}对象，若是则转成对应类型
 * 使用JSON和eval两个函数
 * @param {*} val
 * @returns
 */
export const convertVal = val => {
  // 如果传入参数本身就是 obj、数组、boolean，就无需处理
  if (typeof val !== 'string' || !val) {
    return val
  }

  // 检测是否数字并避免数值溢出
  if (/^\d+$/.test(val)) {
    const parsedNum = Number(val)
    // 如果数值大于 JavaScript 最大安全整数，则作为字符串返回
    if (parsedNum > Number.MAX_SAFE_INTEGER) {
      return val + ''
    }
    return parsedNum
  }

  // 检测是否为布尔值
  if (val === 'true' || val === 'false') {
    return JSON.parse(val)
  }

  // 检测是否为 URL
  if (isUrlLikePath(val)) {
    return val
  }

  // 配置值前可能有污染的空格
  // 如果字符串中没有 '[' 或 '{'，则直接返回
  if (!val.trim().startsWith('{') && !val.trim().startsWith('[')) {
    return val
  }

  // 转换 [] , {} 这类字符串为对象
  try {
    val = cleanJsonString(val)
    const parsedJson = JSON.parse(val)
    // 检查解析后的结果是否为对象
    if (parsedJson !== null) {
      return parsedJson
    }
  } catch (error) {
    // 解析失败，返回原始字符串
    return val
  }

  return val
}

/**
 * 读取所有配置
 * 1. 优先读取NotionConfig表
 * 2. 其次读取环境变量
 * 3. 再读取blog.config.js文件
 * @param {*} key
 * @returns
 */
export const siteConfigMap = () => {
  const val = deepClone(BLOG)
  for (const key in val) {
    val[key] = siteConfig(key)
    // console.log('site', key, val[key], siteConfig(key))
  }
  return val
}
