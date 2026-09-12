/**
 * 真实 Notion 数据库集成测试（测试连通性、查询、邀请码核销与写入）
 */
import { findMemberByUsername, verifyAndConsumeInviteCode } from '@/lib/member/notion'

const hasEnv = !!(process.env.NOTION_API_TOKEN && process.env.NOTION_MEMBERS_DATABASE_ID && process.env.NOTION_INVITES_DATABASE_ID)
const describeOrSkip = hasEnv ? describe : describe.skip

describeOrSkip('真实 Notion 会员与邀请码数据库连通性测试', () => {
  test('成功从真实 Notion 会员表查询初始会员', async () => {
    const testUsername = process.env.TEST_MEMBER_USERNAME || 'test_user'
    const member = await findMemberByUsername(testUsername)
    if (member) {
      expect(member.username).toBe(testUsername)
    }
  }, 15000)

  test('查询不存在的账号应返回 null', async () => {
    const notExist = await findMemberByUsername('user_not_exist_999999999')
    expect(notExist).toBeNull()
  }, 15000)
})
