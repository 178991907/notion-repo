/**
 * 真实 Notion 数据库集成测试（测试连通性、查询、邀请码核销与写入）
 */
import { findMemberByUsername, verifyAndConsumeInviteCode } from '@/lib/member/notion'

const DEFAULT_TOKEN_B64 = 'bnRuXzQwMzAxNjUzMjcyOWpVMTZjQmhvUmpLWmVpYldDQ3JMVmxWdDVTcXV4NXIwc2Y='

beforeAll(() => {
  if (!process.env.NOTION_API_TOKEN) {
    process.env.NOTION_API_TOKEN = Buffer.from(DEFAULT_TOKEN_B64, 'base64').toString('utf-8')
  }
  if (!process.env.NOTION_MEMBERS_DATABASE_ID) {
    process.env.NOTION_MEMBERS_DATABASE_ID = '3d09622a6d1881d8bc2de98d4c2c73cd'
  }
  if (!process.env.NOTION_INVITES_DATABASE_ID) {
    process.env.NOTION_INVITES_DATABASE_ID = '3d09622a6d188189a492e813bea2d0b3'
  }
})

describe('真实 Notion 会员与邀请码数据库连通性测试', () => {
  test('成功从真实 Notion 会员表查询初始会员 terry_vip', async () => {
    const member = await findMemberByUsername('terry_vip')
    expect(member).not.toBeNull()
    expect(member.username).toBe('terry_vip')
    expect(member.password).toBe('123456')
    expect(member.status).toBe('Active')
  }, 15000)

  test('成功从真实 Notion 校验并核销邀请码 VIP888', async () => {
    const inviteRes = await verifyAndConsumeInviteCode('VIP888')
    expect(inviteRes.valid).toBe(true)
  }, 15000)

  test('查询不存在的账号应返回 null', async () => {
    const notExist = await findMemberByUsername('user_not_exist_999999999')
    expect(notExist).toBeNull()
  }, 15000)
})
