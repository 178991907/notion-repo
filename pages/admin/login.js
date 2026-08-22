import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

/**
 * 管理后台登录页面
 * 使用纯客户端渲染
 */
export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!password) {
      setError('请输入密码')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })

      const data = await res.json()

      if (res.ok && data.success) {
        // 登录成功，token 已作为 HttpOnly Cookie 种在浏览器
        router.push('/admin')
      } else {
        setError(data.error || '登录失败，请重试')
      }
    } catch (err) {
      setError('网络错误，请检查网络连接')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Head>
        <title>Notion Repo管理后台登录</title>
      </Head>

      <div className="bg-white p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] w-96 max-w-[90%] relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-xl mx-auto mb-4 flex items-center justify-center shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Notion Repo管理后台</h1>
          <p className="text-gray-500 mt-2 text-sm">请输入管理员密码以继续</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 flex items-center">
            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="password">
              管理员密码
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="请输入 ADMIN_PASSWORD"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex justify-center items-center ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                正在验证...
              </>
            ) : (
              '登录后台'
            )}
          </button>
        </form>
        
        <div className="mt-8 text-center text-xs text-gray-400">
          <p>默认使用环境变量 ADMIN_PASSWORD 进行验证</p>
        </div>
      </div>
    </div>
  )
}
