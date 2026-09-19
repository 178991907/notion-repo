#!/usr/bin/env node

/**
 * 自动扫描并安全清理 Notion 数据库中重复的「⚙️ 博客系统数据存储 (System Data)」页面
 * 
 * 运行方式：
 * NOTION_PAGE_ID=xxx NOTION_ACCESS_TOKEN=ntn_xxx node scripts/clean-duplicate-mount-page.js
 */

const { Client } = require('@notionhq/client')

async function main() {
  const pageId = (process.env.NOTION_PAGE_ID || '').replace(/-/g, '').trim()
  const token = process.env.NOTION_ACCESS_TOKEN || process.env.NOTION_API_TOKEN || process.env.NOTION_TOKEN

  if (!pageId || !token) {
    console.log('❌ 请提供 NOTION_PAGE_ID 和 NOTION_ACCESS_TOKEN 环境变量后运行！')
    console.log('示例：NOTION_PAGE_ID=xxx NOTION_ACCESS_TOKEN=ntn_xxx node scripts/clean-duplicate-mount-page.js')
    process.exit(1)
  }

  const notion = new Client({ auth: token })
  console.log(`🔍 正在扫描 Notion 根数据源 [${pageId}] ...`)

  try {
    const db = await notion.databases.retrieve({ database_id: pageId })
    const props = db.properties || {}
    const titleKey = Object.keys(props).find(k => props[k]?.type === 'title') || 'title'

    const queryRes = await notion.databases.query({
      database_id: pageId,
      page_size: 100
    })

    const matchedPages = (queryRes.results || []).filter(p => {
      const titleArr = p.properties?.[titleKey]?.title || []
      const text = titleArr.map(t => t.plain_text || '').join('')
      return text.includes('博客系统数据') || text.includes('System Data')
    })

    console.log(`📋 共检测到 ${matchedPages.length} 个「⚙️ 博客系统数据存储 (System Data)」页面。`)

    if (matchedPages.length <= 1) {
      console.log('✅ 当前页面数量正常（<= 1 个），无需执行清理。')
      return
    }

    console.log('🔍 正在检测各页面的正文内容深度（判断哪个包含有效子数据库）...')
    const pageDetails = []
    for (const page of matchedPages) {
      try {
        const blocks = await notion.blocks.children.list({
          block_id: page.id,
          page_size: 20
        })
        const hasChild = blocks.results && blocks.results.length > 0
        const hasDb = blocks.results.some(b => b.type === 'child_database')
        pageDetails.push({
          id: page.id,
          createdTime: page.created_time,
          hasChild,
          hasDb,
          count: blocks.results.length
        })
      } catch (e) {
        pageDetails.push({
          id: page.id,
          createdTime: page.created_time,
          hasChild: false,
          hasDb: false,
          count: 0
        })
      }
    }

    // 优先保留包含 child_database 或子内容最多的页面
    pageDetails.sort((a, b) => {
      if (a.hasDb !== b.hasDb) return b.hasDb ? 1 : -1
      return b.count - a.count
    })

    const keepPage = pageDetails[0]
    const removePages = pageDetails.slice(1)

    console.log(`\n💎 保留的主系统数据页面: ${keepPage.id} (含 ${keepPage.count} 个子节点, 包含子库: ${keepPage.hasDb ? '是' : '否'})`)

    for (const p of removePages) {
      console.log(`🗑️ 正在将多余副本 [${p.id}] (子节点数: ${p.count}) 移至废纸篓...`)
      await notion.pages.update({
        page_id: p.id,
        archived: true
      })
      console.log(`   ✓ 成功将多余页面 [${p.id}] 归档删除！`)
    }

    console.log('\n🎉 重复页面清理圆满完成！Notion 数据库已恢复整洁唯一。')
  } catch (err) {
    console.error('❌ 执行清理时出现异常:', err.message)
  }
}

main()
