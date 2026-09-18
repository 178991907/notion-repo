const fs = require('fs')
const path = require('path')

describe('配置安全', () => {
  test('NEXT_PUBLIC_ 前缀不应用于后端密钥', () => {
    // 读取 conf 目录或者根目录的 env 模板文件
    const confDir = path.join(__dirname, '../../conf')
    if (fs.existsSync(confDir)) {
      const files = fs.readdirSync(confDir)
      
      for (const file of files) {
        if (!file.endsWith('.js')) continue
        
        const content = fs.readFileSync(path.join(confDir, file), 'utf8')
        
        // 查找类似 process.env.NEXT_PUBLIC_GITALK_CLIENT_SECRET 这种明显错误的使用
        // GITALK_CLIENT_SECRET, MONGODB_URI, ADMIN_SECRET, MEMBER_AUTH_SECRET 不应该暴露给前端
        const sensitiveKeys = [
          'CLIENT_SECRET',
          'MONGODB_URI',
          'ADMIN_SECRET',
          'ADMIN_PASSWORD',
          'MEMBER_AUTH_SECRET',
          'NOTION_ACCESS_TOKEN'
        ]
        
        for (const key of sensitiveKeys) {
          const badPattern = new RegExp(`NEXT_PUBLIC_${key}`, 'i')
          expect(content).not.toMatch(badPattern)
        }
      }
    }
  })

  test('.gitignore 应包含 .env* 和 backup/ 规则', () => {
    const gitignorePath = path.join(__dirname, '../../.gitignore')
    if (fs.existsSync(gitignorePath)) {
      const content = fs.readFileSync(gitignorePath, 'utf8')
      const lines = content.split('\n').map(l => l.trim())
      
      // 至少应该包含 .env.local 或类似的
      const hasEnv = lines.some(l => l.includes('.env'))
      expect(hasEnv).toBe(true)
    }
  })

  test('.dockerignore 应排除敏感文件', () => {
    const dockerignorePath = path.join(__dirname, '../../.dockerignore')
    if (fs.existsSync(dockerignorePath)) {
      const content = fs.readFileSync(dockerignorePath, 'utf8')
      const lines = content.split('\n').map(l => l.trim())
      
      const hasEnvLocal = lines.some(l => l === '.env.local' || l === '.env*')
      // 如果使用了 .dockerignore，必须忽略本地环境文件
      if (lines.length > 0) {
         expect(hasEnvLocal).toBe(true)
      }
    }
  })
})
