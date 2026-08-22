/* eslint-disable no-undef */
import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'
import { isMobile, loadExternalResource } from '@/lib/utils'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

/**
 * 网页动画卡通宠物
 * @returns
 */
export default function Live2D() {
  const router = useRouter()
  const { theme, switchTheme } = useGlobal()
  const rawShowPet = siteConfig('WIDGET_PET', true)
  const showPet = rawShowPet === true || rawShowPet === 'true' || rawShowPet === 1 || rawShowPet === '1'
  const petLink = siteConfig(
    'WIDGET_PET_LINK',
    'https://cdn.jsdelivr.net/npm/live2d-widget-model-koharu@1.0.5/assets/koharu.model.json'
  )
  const petCustomUrl = siteConfig('WIDGET_PET_CUSTOM_URL', '')
  const petHeight = siteConfig('WIDGET_PET_HEIGHT') || 340
  const petWidth = siteConfig('WIDGET_PET_WIDTH') || 280
  const rawSwitchTheme = siteConfig('WIDGET_PET_SWITCH_THEME', false)
  const petSwitchTheme = rawSwitchTheme === true || rawSwitchTheme === 'true' || rawSwitchTheme === 1 || rawSwitchTheme === '1'

  useEffect(() => {
    if (showPet && !isMobile() && typeof window !== 'undefined') {
      Promise.all([
        loadExternalResource(
          'https://cdn.jsdelivr.net/gh/stevenjoezhang/live2d-widget@latest/live2d.min.js',
          'js'
        )
      ]).then(() => {
        if (typeof window?.loadlive2d !== 'undefined') {
          setTimeout(() => {
            const canvasEl = document.getElementById('live2d')
            if (canvasEl) {
              try {
                loadlive2d('live2d', petLink)
              } catch (error) {
                console.warn('读取PET模型', error)
              }
            }
          }, 300)
        }
      })
    }
  }, [theme, petLink, petHeight])

  function handleClick(e) {
    if (e) {
      e.stopPropagation()
    }
    const targetUrl = (petCustomUrl || '').trim()
    if (targetUrl) {
      if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
        window.open(targetUrl, '_blank')
      } else {
        router.push(targetUrl)
      }
    }
    // 留空时绝不跳转任何网页，纯互动
  }

  if (!showPet) {
    return null
  }

  return (
    <div className='flex justify-center w-full overflow-visible'>
      <canvas
        id='live2d'
        width={petWidth}
        height={petHeight}
        onClick={handleClick}
        className='cursor-pointer'
        title={petCustomUrl ? `点击跳转: ${petCustomUrl}` : '卡通宠物'}
        onMouseDown={e => e.target.classList.add('cursor-grabbing')}
        onMouseUp={e => e.target.classList.remove('cursor-grabbing')}
      />
    </div>
  )
}
