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
