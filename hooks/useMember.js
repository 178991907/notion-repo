import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'

const MemberContext = createContext({
  member: null,
  isLoggedIn: false,
  loading: true,
  isModalOpen: false,
  modalTab: 'login',
  openAuthModal: () => {},
  closeAuthModal: () => {},
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  checkAuth: async () => {}
})

export const MemberProvider = ({ children }) => {
  const [member, setMember] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalTab, setModalTab] = useState('login')

  // 打开认证弹窗
  const openAuthModal = useCallback((tab = 'login') => {
    setModalTab(tab)
    setIsModalOpen(true)
  }, [])

  // 关闭认证弹窗
  const closeAuthModal = useCallback(() => {
    setIsModalOpen(false)
  }, [])

  // 检查当前登录状态
  const checkAuth = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/member/me')
      if (res.ok) {
        const data = await res.json()
        if (data.success && data.isLoggedIn && data.member) {
          setMember(data.member)
          setIsLoggedIn(true)
          return data.member
        }
      }
      setMember(null)
      setIsLoggedIn(false)
      return null
    } catch (err) {
      console.warn('[Member] 获取会员登录态失败:', err)
      setMember(null)
      setIsLoggedIn(false)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  // 首次挂载时检查登录态
  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  // 会员登录
  const login = async (username, password, rememberMe = true) => {
    const res = await fetch('/api/member/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, rememberMe })
    })
    const data = await res.json()
    if (!res.ok || !data.success) {
      throw new Error(data.error || '登录失败，请检查账号密码')
    }
    setMember(data.member)
    setIsLoggedIn(true)
    closeAuthModal()
    return data.member
  }

  // 邀请码注册
  const register = async (username, password, inviteCode) => {
    const res = await fetch('/api/member/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, inviteCode })
    })
    const data = await res.json()
    if (!res.ok || !data.success) {
      throw new Error(data.error || '注册失败，请检查邀请码')
    }
    setMember(data.member)
    setIsLoggedIn(true)
    closeAuthModal()
    return data.member
  }

  // 会员退出
  const logout = async () => {
    try {
      await fetch('/api/member/logout', { method: 'POST' })
    } catch (err) {
      console.error('[Member] 登出失败:', err)
    } finally {
      setMember(null)
      setIsLoggedIn(false)
    }
  }

  return (
    <MemberContext.Provider
      value={{
        member,
        isLoggedIn,
        loading,
        isModalOpen,
        modalTab,
        setModalTab,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        logout,
        checkAuth
      }}>
      {children}
    </MemberContext.Provider>
  )
}

export const useMember = () => useContext(MemberContext)

export default useMember
