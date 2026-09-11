import { A } from '@solidjs/router'

const REPO_URL = 'https://github.com/Mcchen1008/NextList'

export function Footer() {
  return (
    <footer class="footer">
      <div class="container footer-inner">
        <span>
          NextList 插件市场 · 用 GitHub 登录即可收录你的插件（仓库需打上{' '}
          <code>nextlist-plugin</code> topic）
        </span>
        <span class="footer-links">
          <A href="/">插件市场</A>
          <a href="/docs/" target="_self">
            文档
          </a>
          <a href="/" target="_self">
            官网
          </a>
          <a href={REPO_URL} target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
        </span>
      </div>
    </footer>
  )
}
