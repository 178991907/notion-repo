/**
 * 会员与邀请码数据库 Vercel 部署环境自愈与错误透传测试套件
 */
import {
  createInviteCode,
  createMember,
  initMemberDatabases,
  verifyAndConsumeInviteCode
} from '@/lib/member/notion'
import { resolveMountPageId } from '@/lib/plugins/notionCommentsResolver'

describe('会员与邀请码在 Vercel 生产环境下的探测与错误精准提示测试', () => {
  const originalEnv = { ...process.env }

  beforeEach(() => {
    process.env = { ...originalEnv }
    delete process.env.NOTION_API_TOKEN
    delete process.env.NOTION_ACCESS_TOKEN
    delete process.env.NOTION_TOKEN
    delete process.env.NOTION_INVITES_DATABASE_ID
    delete process.env.NOTION_MEMBERS_DATABASE_ID
    global.__notionInvitesDatabaseId = null
    global.__notionMembersDatabaseId = null
    global.__lastInvitesDbError = null
    global.__lastMembersDbError = null
  })

  afterAll(() => {
    process.env = originalEnv
  })

  test('当缺少 NOTION_ACCESS_TOKEN 时，createInviteCode 必须精确指出缺少 Token 及 Vercel 环境变量配置指引，严禁误报为邀请码数据库缺失', async () => {
    await expect(createInviteCode({ code: 'VIP-TEST88' })).rejects.toThrow(
      /未获取到 Notion API Token \(NOTION_ACCESS_TOKEN\).*Vercel 环境变量/
    )
  })

  test('当缺少 NOTION_ACCESS_TOKEN 时，createMember 同样必须精确指出缺少 Token', async () => {
    await expect(createMember({ username: 'testuser', password: 'password123' })).rejects.toThrow(
      /未获取到 Notion API Token \(NOTION_ACCESS_TOKEN\)/
    )
  })

  test('当缺少 NOTION_ACCESS_TOKEN 时，initMemberDatabases 必须给出 Vercel 环境变量检查提示', async () => {
    await expect(initMemberDatabases()).rejects.toThrow(
      /未获取到有效的 Notion API Token \(NOTION_ACCESS_TOKEN\)/
    )
  })

  test('当缺少 NOTION_ACCESS_TOKEN 时，verifyAndConsumeInviteCode 返回清晰的管理员配置提示', async () => {
    const res = await verifyAndConsumeInviteCode('VIP-TEST88')
    expect(res.valid).toBe(false)
    expect(res.message).toContain('NOTION_ACCESS_TOKEN')
  })

  test('resolveMountPageId 兼容父数据库属性名为 Name 或具有不同 status/type 字段场景', async () => {
    // 模拟一个包含 Name 属性的 Notion Database
    const mockDb = {
      id: 'db-root-id-12345678901234567890',
      parent: { type: 'workspace' },
      properties: {
        Name: { type: 'title' },
        status: { type: 'status' } // 新版 status 类型，非 select 类型
      }
    }

    let createdPageProps = null
    const mockClient = {
      pages: {
        retrieve: jest.fn().mockRejectedValue(new Error('Object not found')),
        create: jest.fn().mockImplementation(async ({ properties }) => {
          createdPageProps = properties
          return { id: 'mount-page-uuid-999' }
        })
      },
      databases: {
        retrieve: jest.fn().mockResolvedValue(mockDb),
        query: jest.fn().mockResolvedValue({ results: [] })
      }
    }

    const mountId = await resolveMountPageId(mockClient, mockDb.id)
    expect(mountId).toBe('mount-page-uuid-999')
    expect(mockClient.pages.create).toHaveBeenCalled()
    // 验证动态采用了 Name 作为 title 属性名，杜绝了硬编码 title 导致的 400 校验异常
    expect(createdPageProps.Name).toBeDefined()
    expect(createdPageProps.Name.title[0].text.content).toContain('博客系统数据存储')
  })

  test('resolveMountPageId 当 Database 自身挂载在 Page 下时，直接返回父 Page ID', async () => {
    const mockDb = {
      id: 'db-child-id-12345678901234567890',
      parent: { type: 'page_id', page_id: 'parent-page-uuid-888' },
      properties: {
        title: { type: 'title' }
      }
    }

    const mockClient = {
      pages: {
        retrieve: jest.fn().mockRejectedValue(new Error('Object not found'))
      },
      databases: {
        retrieve: jest.fn().mockResolvedValue(mockDb)
      }
    }

    const mountId = await resolveMountPageId(mockClient, mockDb.id)
    expect(mountId).toBe('parent-page-uuid-888')
  })
})
