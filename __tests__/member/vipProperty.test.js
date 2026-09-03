/**
 * 文章 VIP 属性解析与映射单元测试
 */
jest.mock('notion-utils', () => ({
  getTextContent: jest.fn(val => {
    if (typeof val === 'boolean') return val ? 'Yes' : 'No'
    if (Array.isArray(val)) return val[0]
    return val
  }),
  getDateValue: jest.fn(),
  idToUuid: jest.fn(id => id)
}))

jest.mock('notion-client', () => ({
  NotionAPI: jest.fn()
}))

import getPageProperties from '@/lib/db/notion/getPageProperties'

describe('文章 VIP 属性规范化解析', () => {
  const schema = {
    vip_prop: { name: 'vip', type: 'text' },
    title_prop: { name: 'title', type: 'title' }
  }

  test('当 Notion 字段为 boolean true 或 "Yes" 时解析为 true', async () => {
    const mockPost = {
      id: 'mock-1',
      properties: {
        vip_prop: 'Yes',
        title_prop: '测试VIP文章'
      },
      format: {}
    }
    const res = await getPageProperties('mock-1', mockPost, schema, null)
    expect(res.vip).toBe(true)
  })

  test('当 Notion 字段值为 VIP 或 Member 时解析为 true', async () => {
    const mockPost = {
      id: 'mock-2',
      properties: {
        vip_prop: 'VIP',
        title_prop: '测试会员专享文章'
      },
      format: {}
    }
    const res = await getPageProperties('mock-2', mockPost, schema, null)
    expect(res.vip).toBe(true)
  })

  test('当未设置 vip 属性或为普通值时解析为 false', async () => {
    const mockPost = {
      id: 'mock-3',
      properties: {
        title_prop: '普通公开文章'
      },
      format: {}
    }
    const res = await getPageProperties('mock-3', mockPost, schema, null)
    expect(res.vip).toBe(false)
  })
})
