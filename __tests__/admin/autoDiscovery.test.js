import { resolveConfigDatabaseId } from '@/pages/api/admin/config'

describe('Notion 配置中心自动探测机制 (Auto-Discovery)', () => {
  const originalEnv = process.env.NOTION_CONFIG_DB_ID

  beforeEach(() => {
    delete process.env.NOTION_CONFIG_DB_ID
    delete global.__notionConfigDatabaseId
  })

  afterAll(() => {
    if (originalEnv) {
      process.env.NOTION_CONFIG_DB_ID = originalEnv
    } else {
      delete process.env.NOTION_CONFIG_DB_ID
    }
    delete global.__notionConfigDatabaseId
  })

  it('1. 优先读取环境变量 NOTION_CONFIG_DB_ID', async () => {
    process.env.NOTION_CONFIG_DB_ID = 'manual-env-db-id-12345'
    const mockClient = {
      search: jest.fn()
    }
    const id = await resolveConfigDatabaseId(mockClient)
    expect(id).toBe('manual-env-db-id-12345')
    expect(mockClient.search).not.toHaveBeenCalled()
  })

  it('2. 自动探测：精准匹配名为 CONFIG-TABLE 的数据库', async () => {
    const mockClient = {
      search: jest.fn().mockResolvedValue({
        results: [
          { id: 'random-db-1', title: [{ plain_text: '文章列表' }], properties: {} },
          { id: 'target-config-db-888', title: [{ plain_text: 'CONFIG-TABLE' }], properties: { '配置名': {}, '配置值': {} } }
        ]
      })
    }
    const id = await resolveConfigDatabaseId(mockClient)
    expect(id).toBe('target-config-db-888')
    expect(mockClient.search).toHaveBeenCalledTimes(1)
  })

  it('3. 自动探测：模糊匹配包含「配置」并拥有配置字段的数据库', async () => {
    const mockClient = {
      search: jest.fn().mockResolvedValue({
        results: [
          { id: 'random-db-2', title: [{ plain_text: '待办任务' }], properties: {} },
          { id: 'target-fuzzy-db-999', title: [{ plain_text: '我的站点配置中心' }], properties: { '配置名': {}, '配置值': {} } }
        ]
      })
    }
    const id = await resolveConfigDatabaseId(mockClient)
    expect(id).toBe('target-fuzzy-db-999')
  })

  it('4. 缓存复用：后续调用直接复用全局内存缓存，无需重复请求接口', async () => {
    const mockClient = {
      search: jest.fn().mockResolvedValue({
        results: [
          { id: 'cached-db-id', title: [{ plain_text: 'CONFIG-TABLE' }], properties: {} }
        ]
      })
    }
    const id1 = await resolveConfigDatabaseId(mockClient)
    expect(id1).toBe('cached-db-id')
    expect(mockClient.search).toHaveBeenCalledTimes(1)

    // 第二次调用，期望不再次调用 search
    const id2 = await resolveConfigDatabaseId(mockClient)
    expect(id2).toBe('cached-db-id')
    expect(mockClient.search).toHaveBeenCalledTimes(1)
  })

  it('5. 容错保护：未搜到配置表或接口异常时安全返回空字符串，不抛出未捕获崩溃', async () => {
    const mockClient = {
      search: jest.fn().mockRejectedValue(new Error('Network error'))
    }
    const id = await resolveConfigDatabaseId(mockClient)
    expect(id).toBe('')
  })
})

import { resolvePostDatabaseId } from '@/lib/db/notion/postDatabaseResolver'
import { resolveMembersDatabaseId, resolveInvitesDatabaseId } from '@/lib/member/notion'

describe('文章、会员与邀请码数据库全链路自动探测测试', () => {
  beforeEach(() => {
    delete process.env.NOTION_POSTS_DATABASE_ID
    delete process.env.NOTION_MEMBERS_DATABASE_ID
    delete process.env.NOTION_INVITES_DATABASE_ID
    delete global.__notionPostDatabaseId
    delete global.__notionMembersDatabaseId
    delete global.__notionInvitesDatabaseId
  })

  it('1. 文章数据库探测：当传入 Page ID 时自动探测文章主库 (含 category 与 tags)', async () => {
    const mockClient = {
      databases: {
        retrieve: jest.fn().mockRejectedValue(new Error('Could not find database with ID: 3dce78c0-e8d4-8125-98f8-e90892c4c95e'))
      },
      search: jest.fn().mockResolvedValue({
        results: [
          { id: 'random-db-1', title: [{ plain_text: '待办任务' }], properties: { title: {} } },
          { id: 'posts-db-real-id', title: [{ plain_text: 'Terry 校长博客' }], properties: { title: {}, category: {}, tags: {} } }
        ]
      })
    }

    const id = await resolvePostDatabaseId(mockClient, '3dce78c0e8d4812598f8e90892c4c95e')
    expect(id).toBe('posts-db-real-id')
    expect(global.__notionPostDatabaseId).toBe('posts-db-real-id')
  })

  it('2. 会员数据库探测：自动识别包含会员属性的数据库', async () => {
    const mockClient = {
      search: jest.fn().mockResolvedValue({
        results: [
          { id: 'random-db-2', title: [{ plain_text: '一些杂项' }], properties: {} },
          { id: 'members-db-real-id', title: [{ plain_text: '网站会员列表 (Members)' }], properties: { Username: {}, Password: {}, Status: {} } }
        ]
      })
    }

    const id = await resolveMembersDatabaseId(mockClient)
    expect(id).toBe('members-db-real-id')
    expect(global.__notionMembersDatabaseId).toBe('members-db-real-id')
  })

  it('3. 邀请码数据库探测：自动识别包含邀请码与使用次数的数据库', async () => {
    const mockClient = {
      search: jest.fn().mockResolvedValue({
        results: [
          { id: 'invites-db-real-id', title: [{ plain_text: '会员邀请码管理 (InviteCodes)' }], properties: { Code: {}, MaxUses: {}, UsedCount: {} } }
        ]
      })
    }

    const id = await resolveInvitesDatabaseId(mockClient)
    expect(id).toBe('invites-db-real-id')
    expect(global.__notionInvitesDatabaseId).toBe('invites-db-real-id')
  })

  it('4. 环境变量优先：配置环境变量时直接读取且不触发 search', async () => {
    process.env.NOTION_MEMBERS_DATABASE_ID = 'env-member-123'
    process.env.NOTION_INVITES_DATABASE_ID = 'env-invite-456'
    process.env.NOTION_POSTS_DATABASE_ID = 'env-post-789'

    const mockClient = {
      search: jest.fn()
    }

    expect(await resolveMembersDatabaseId(mockClient)).toBe('env-member-123')
    expect(await resolveInvitesDatabaseId(mockClient)).toBe('env-invite-456')
    expect(await resolvePostDatabaseId(mockClient)).toBe('env-post-789')
    expect(mockClient.search).not.toHaveBeenCalled()
  })
})
