/**
 * Notion 博客文章自动填充守护脚本 (Notion Sync Daemon)
 * 实时轮询检测 Notion 博客数据库：
 * 只要检测到文章勾选了 fans 且 fans_code 为空 -> 立即生成互不相同的随机安全码写回 Notion
 * 只要检测到文章勾选了 vip 且 vip_level 为空 -> 立即补充 VIP 标签写回 Notion
 */
const fs = require('fs')
const path = require('path')
const { Client } = require('@notionhq/client')

function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local')
  if (!fs.existsSync(envPath)) return {}
  const content = fs.readFileSync(envPath, 'utf8')
  const env = {}
  content.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/)
    if (match) {
      let value = match[2] || ''
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1)
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1)
      env[match[1]] = value.trim()
    }
  })
  return env
}

const env = loadEnv()
const token = env.NOTION_API_TOKEN || process.env.NOTION_API_TOKEN || process.env.NOTION_TOKEN
const blogDbId = env.NOTION_PAGE_ID || process.env.NOTION_PAGE_ID || 'd699622a6d1882f09e68814c63554113'

if (!token) {
  console.error('[NotionDaemon] 缺少 NOTION_API_TOKEN，退出')
  process.exit(1)
}

const client = new Client({ auth: token })

function generateRandomFansCode() {
  const chars = '23456789ABCDEFGHJKMNPQRSTUVWXYZ'
  let res = ''
  for (let i = 0; i < 6; i++) {
    res += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return res
}

async function checkAndAutoFill() {
  try {
    const response = await client.databases.query({
      database_id: blogDbId,
      page_size: 20,
      sorts: [{ timestamp: 'last_edited_time', direction: 'descending' }]
    })

    for (const page of response.results) {
      const title = page.properties.title?.title?.[0]?.plain_text || '无标题'
      const fans = page.properties.fans?.checkbox
      const fansCode = page.properties.fans_code?.multi_select || []
      const vip = page.properties.vip?.checkbox
      const vipLevel = page.properties.vip_level?.multi_select || []

      const needFans = fans && fansCode.length === 0
      const needVip = vip && vipLevel.length === 0

      if (needFans || needVip) {
        const updateProps = {}
        let code = null
        if (needFans) {
          code = generateRandomFansCode()
          updateProps.fans_code = { multi_select: [{ name: code }] }
        }
        if (needVip) {
          updateProps.vip_level = { multi_select: [{ name: 'VIP' }] }
        }

        await client.pages.update({
          page_id: page.id,
          properties: updateProps
        })
        console.log(`[NotionDaemon] ✅ 自动为「${title}」补齐属性：fans_code=${code || '-'}, vip_level=${needVip ? 'VIP' : '-'}`)
      }
    }
  } catch (err) {
    console.error('[NotionDaemon] 轮询异常:', err.message)
  }
}

console.log('[NotionDaemon] 🚀 Notion 智能同步守护进程已启动，正在实时监听数据库...')
checkAndAutoFill()
setInterval(checkAndAutoFill, 5000)
