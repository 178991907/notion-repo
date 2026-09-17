import { resolveCommentDatabaseId } from '../../../lib/plugins/notionCommentsResolver'

describe('NotionComments 评论数据库解析与自动探测引擎', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
    delete global.__notionCommentDatabaseId
  })

  afterAll(() => {
    process.env = originalEnv
    delete global.__notionCommentDatabaseId
  })

  test('环境变量优先：若配置了 NOTION_COMMENT_DATABASE_ID 则直接返回', async () => {
    process.env.NOTION_COMMENT_DATABASE_ID = 'custom-comment-db-id'
    const result = await resolveCommentDatabaseId(null, null)
    expect(result).toBe('custom-comment-db-id')
  })

  test('缓存优先：若全局内存存在缓存则直接返回', async () => {
    global.__notionCommentDatabaseId = 'cached-db-id'
    const result = await resolveCommentDatabaseId(null, null)
    expect(result).toBe('cached-db-id')
  })

  test('自动探测：通过关键词检索已存在的评论数据库', async () => {
    const mockClient = {
      search: jest.fn().mockResolvedValue({
        results: [
          { id: 'posts-db', title: [{ plain_text: '我的文章库' }] },
          { id: 'found-comment-db-id', title: [{ plain_text: '💬 读者评论管理 (Comments)' }] }
        ]
      })
    }

    const result = await resolveCommentDatabaseId(mockClient, 'root-page-123')
    expect(result).toBe('found-comment-db-id')
    expect(mockClient.search).toHaveBeenCalled()
    expect(global.__notionCommentDatabaseId).toBe('found-comment-db-id')
  })

  test('自动建库：若未检索到评论库且具有根页面ID，自动调用 databases.create 建库', async () => {
    const mockClient = {
      search: jest.fn().mockResolvedValue({ results: [] }),
      databases: {
        create: jest.fn().mockResolvedValue({
          id: 'newly-created-db-id'
        })
      }
    }

    const result = await resolveCommentDatabaseId(mockClient, '1234567890abcdef1234567890abcdef')
    expect(result).toBe('newly-created-db-id')
    expect(mockClient.databases.create).toHaveBeenCalledWith(
      expect.objectContaining({
        parent: { page_id: '1234567890abcdef1234567890abcdef' },
        properties: expect.objectContaining({
          PostId: { title: {} },
          Content: { rich_text: {} }
        })
      })
    )
    expect(global.__notionCommentDatabaseId).toBe('newly-created-db-id')
  })
})
