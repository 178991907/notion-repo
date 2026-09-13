/**
 * Heo 主题文章卡片尺寸与等高约束单元测试
 * 验证在双列模式与单列模式、有摘要与无摘要、极短标题与长标题等场景下，
 * 卡片均具备严格的固定高度约束，绝无尺寸参差和错位现象。
 */
import React from 'react'
import { render } from '@testing-library/react'
import BlogPostCard from '@/themes/heo/components/BlogPostCard'

// Mock 基础组件与配置依赖
jest.mock('@/components/LazyImage', () => {
  return function MockLazyImage(props) {
    return <img alt={props.alt} src={props.src} className={props.className} data-testid='card-cover-img' />
  }
})

jest.mock('@/components/SmartLink', () => {
  return function MockSmartLink({ children, href, className }) {
    return <a href={href} className={className}>{children}</a>
  }
})

jest.mock('@/themes/heo/components/TagItemMini', () => {
  return function MockTagItemMini({ tag }) {
    return <span data-testid='tag-item'>{tag.name}</span>
  }
})

jest.mock('@/themes/heo/components/NotionIcon', () => {
  return function MockNotionIcon() {
    return <span data-testid='notion-icon' />
  }
})

describe('BlogPostCard 卡片尺寸与等高稳定性测试', () => {
  const sampleSiteInfo = {
    pageCover: 'https://example.com/default-cover.jpg'
  }

  it('在双列模式下，包含长摘要和多标签的文章卡片应具有严格的固定高度 md:h-96 与文字区块 md:h-48', () => {
    const postWithFullContent = {
      id: 'post-full',
      title: '🚀 自动化集成与真实数据测试成功',
      summary: '这是一篇通过官方 Notion API 自动创建并且由 Vercel + NotionNext 实时同步渲染的测试文章！',
      category: 'AI 教程',
      tagItems: [{ name: '自动化测试' }, { name: 'Notion Repo' }],
      pageCoverThumbnail: 'https://example.com/cover1.jpg',
      publishDay: '2026-8-22'
    }

    const { container } = render(
      <BlogPostCard
        index={0}
        post={postWithFullContent}
        siteInfo={sampleSiteInfo}
        twoCols={true}
      />
    )

    // 验证最外层容器充满网格
    const article = container.querySelector('article')
    expect(article.className).toContain('h-full')
    expect(article.className).toContain('w-full')

    // 验证卡片主体容器具有固定高度约束，绝不包含破坏等高的 md:h-auto
    const cardBody = article.firstElementChild
    expect(cardBody.className).toContain('md:h-96')
    expect(cardBody.className).not.toContain('md:h-auto')

    // 验证图片封面高度固定为 md:h-48 (192px)
    const coverWrapper = cardBody.querySelector('.relative.overflow-hidden')
    expect(coverWrapper.className).toContain('md:h-48')

    // 验证文字区块高度固定为 md:h-48 (192px)
    const textBlock = cardBody.lastElementChild
    expect(textBlock.className).toContain('md:h-48')
    expect(textBlock.className).toContain('flex-col')
    expect(textBlock.className).toContain('justify-between')
  })

  it('在双列模式下，完全没有摘要、无标签的空白文章卡片高度同样固定为 md:h-96 与 md:h-48，绝不塌陷', () => {
    const emptyPost = {
      id: 'post-empty',
      title: '生命周期提示词',
      summary: '', // 无摘要
      category: null, // 无分类
      tagItems: [], // 无标签
      pageCoverThumbnail: 'https://example.com/cover2.jpg',
      publishDay: '2026-8-13'
    }

    const { container } = render(
      <BlogPostCard
        index={1}
        post={emptyPost}
        siteInfo={sampleSiteInfo}
        twoCols={true}
      />
    )

    const article = container.querySelector('article')
    const cardBody = article.firstElementChild
    expect(cardBody.className).toContain('md:h-96')
    expect(cardBody.className).not.toContain('md:h-auto')

    // 文字区块依然严格等于 md:h-48，保证与旁边富内容卡片底边 100% 齐平
    const textBlock = cardBody.lastElementChild
    expect(textBlock.className).toContain('md:h-48')
  })

  it('在单列模式下，卡片应遵循横向左右排版且固定高度为 md:h-52', () => {
    const singleColPost = {
      id: 'post-single',
      title: '单列文章标题',
      summary: '单列文章摘要内容',
      pageCoverThumbnail: 'https://example.com/cover3.jpg',
      publishDay: '2026-8-01'
    }

    const { container } = render(
      <BlogPostCard
        index={0}
        post={singleColPost}
        siteInfo={sampleSiteInfo}
        twoCols={false}
      />
    )

    const article = container.querySelector('article')
    const cardBody = article.firstElementChild
    expect(cardBody.className).toContain('md:flex-row')
    expect(cardBody.className).toContain('md:h-52')
  })
})
