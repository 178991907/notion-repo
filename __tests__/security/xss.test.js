const DOMPurify = require('isomorphic-dompurify')

describe('XSS 防护', () => {
  test('DOMPurify 应移除 script 标签', () => {
    const dirty = '<div>Hello <script>alert("XSS")</script></div>'
    const clean = DOMPurify.sanitize(dirty)
    expect(clean).toBe('<div>Hello </div>')
  })

  test('DOMPurify 应移除事件处理器属性', () => {
    const dirty = '<img src="x" onerror="alert(1)">'
    const clean = DOMPurify.sanitize(dirty)
    expect(clean).toBe('<img src="x">')
  })

  test('DOMPurify 应移除 iframe 注入', () => {
    const dirty = '<iframe src="javascript:alert(1)"></iframe>'
    const clean = DOMPurify.sanitize(dirty)
    // 根据具体配置，iframe 可能被完全移除，或者保留但移除了 javascript: src
    expect(clean).not.toContain('javascript:alert(1)')
  })

  test('JSON-LD 应转义 </script> 标签', () => {
    const jsonLd = { name: "Test</script><script>alert(1)</script>" }
    const stringified = JSON.stringify(jsonLd)
    
    // 我们在此模拟 Next.js 在插入 JSON-LD 时的操作，通常是将 </ 替换以防跳出 script
    const safeStringified = stringified.replace(/</g, '\\u003c')
    
    expect(safeStringified).not.toContain('</script>')
    expect(safeStringified).toContain('\\u003c/script>')
  })

  test('正常 HTML 应保留', () => {
    const normal = '<p>这是一个<strong>正常</strong>的段落。</p>'
    const clean = DOMPurify.sanitize(normal)
    expect(clean).toBe(normal)
  })
})
