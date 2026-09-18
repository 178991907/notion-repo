/**
 * 向指定 Notion 数据库全自动注入「⚙️ 博客系统数据存储 (System Data)」及 3 个子数据库
 */
const { Client } = require('@notionhq/client')

const token = process.env.NOTION_ACCESS_TOKEN || 'ntn_rz46457897112zVDnxl7ZcyLLu9ntsUBA51idzYiYWL0Uy'
const targetDbId = process.argv[2] || '3dce78c0e8d4812598f8e90892c4c95e'

const notion = new Client({ auth: token })

async function run() {
  console.log(`🚀 开始向目标数据库 [${targetDbId}] 注入系统数据存储...`)
  try {
    const db = await notion.databases.retrieve({ database_id: targetDbId })
    console.log(`✅ 成功连接目标数据库: "${db.title?.[0]?.plain_text || targetDbId}"`)

    const queryRes = await notion.databases.query({
      database_id: targetDbId,
      filter: {
        property: 'title',
        title: { contains: '博客系统数据存储' }
      }
    })

    let systemPageId = null
    if (queryRes.results.length > 0) {
      systemPageId = queryRes.results[0].id
      console.log(`ℹ️ 已存在系统存储页面: ${systemPageId}`)
    } else {
      console.log(`📦 正在创建第 9 行「⚙️ 博客系统数据存储 (System Data)」...`)
      const newPage = await notion.pages.create({
        parent: { database_id: targetDbId },
        properties: {
          title: {
            title: [{ text: { content: '⚙️ 博客系统数据存储 (System Data)' } }]
          },
          type: { select: { name: 'Config' } },
          status: { select: { name: 'Invisible' } },
          summary: {
            rich_text: [{ text: { content: '系统底层挂载页面，内置读者评论、会员与邀请码数据库' } }]
          }
        }
      })
      systemPageId = newPage.id
      console.log(`🎉 成功创建挂载页面: ${systemPageId}`)
    }

    console.log(`💬 正在挂载页面下创建评论数据库...`)
    const commentDb = await notion.databases.create({
      parent: { page_id: systemPageId },
      title: [{ type: 'text', text: { content: '💬 读者评论管理 (Comments)' } }],
      properties: {
        PostId: { title: {} },
        ParentId: { rich_text: {} },
        Content: { rich_text: {} },
        Author: { email: {} },
        Nickname: { rich_text: {} },
        EmailHash: { rich_text: {} },
        Level: { number: { format: 'number' } },
        Status: {
          select: {
            options: [
              { name: 'Approved', color: 'green' },
              { name: 'Pending', color: 'yellow' },
              { name: 'Spam', color: 'red' }
            ]
          }
        },
        IpAddress: { rich_text: {} },
        UserAgent: { rich_text: {} },
        CreatedAt: { date: {} }
      }
    })
    console.log(`✅ 成功创建评论库: ${commentDb.id}`)

    console.log(`👥 正在挂载页面下创建会员数据库...`)
    const memberDb = await notion.databases.create({
      parent: { page_id: systemPageId },
      title: [{ type: 'text', text: { content: '👥 网站会员管理 (Members)' } }],
      properties: {
        Username: { title: {} },
        Password: { rich_text: {} },
        Status: {
          select: {
            options: [
              { name: 'Active', color: 'green' },
              { name: 'Expired', color: 'red' },
              { name: 'Banned', color: 'gray' }
            ]
          }
        },
        Level: {
          select: {
            options: [
              { name: 'VIP', color: 'blue' },
              { name: 'SVIP', color: 'purple' }
            ]
          }
        },
        ExpireDate: { date: {} },
        InviteCode: { rich_text: {} },
        Remark: { rich_text: {} }
      }
    })
    console.log(`✅ 成功创建会员库: ${memberDb.id}`)

    console.log(`🎟️ 正在挂载页面下创建邀请码数据库...`)
    const inviteDb = await notion.databases.create({
      parent: { page_id: systemPageId },
      title: [{ type: 'text', text: { content: '🎟️ 粉丝邀请码管理 (Invites)' } }],
      properties: {
        Code: { title: {} },
        Status: {
          select: {
            options: [
              { name: 'Active', color: 'green' },
              { name: 'Used', color: 'gray' },
              { name: 'Expired', color: 'red' }
            ]
          }
        },
        Level: {
          select: {
            options: [
              { name: 'VIP', color: 'blue' },
              { name: 'SVIP', color: 'purple' }
            ]
          }
        },
        MaxUses: { number: { format: 'number' } },
        UsedCount: { number: { format: 'number' } },
        Days: { number: { format: 'number' } },
        Remark: { rich_text: {} }
      }
    })
    console.log(`✅ 成功创建邀请码库: ${inviteDb.id}`)

    console.log(`\n🎉 全部注入成功！目标母版已完整具备全套系统数据存储！`)
  } catch (err) {
    console.error(`❌ 执行失败:`, err.message)
  }
}

run()
