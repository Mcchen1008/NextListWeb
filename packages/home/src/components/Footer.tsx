import type { Component } from 'solid-js'
import { GitHubIcon } from './Icons'

const REPO_URL = 'https://github.com/Mcchen1008/NextList'

const LINK_GROUPS = [
  {
    title: '项目',
    links: [
      { text: 'GitHub 仓库', href: REPO_URL, external: true },
      { text: '问题反馈', href: `${REPO_URL}/issues`, external: true },
      { text: '版本发布', href: `${REPO_URL}/releases`, external: true },
    ],
  },
  {
    title: '资源',
    links: [
      { text: '文档中心', href: '/docs/', external: false },
      { text: '插件市场', href: '/plugins/', external: false },
      { text: '插件开发指南', href: '/docs/plugins/development', external: false },
    ],
  },
  {
    title: '相关项目',
    links: [
      { text: 'OpenList', href: 'https://github.com/OpenListTeam/OpenList', external: true },
      { text: 'OpenListNext', href: 'https://github.com/Polonium-salts/openlistnext', external: true },
      { text: 'OpenList 文档', href: 'https://doc.oplist.org/', external: true },
    ],
  },
  {
    title: '法律',
    links: [
      { text: '隐私政策', href: '/privacy.html', external: false },
      { text: '服务条款', href: '/terms.html', external: false },
      { text: '免责声明', href: '/disclaimer.html', external: false },
    ],
  },
]

const Footer: Component = () => {
  return (
    <footer class="footer">
      <div class="container footer-inner">
        <div class="footer-brand">
          <div class="footer-logo">
            <img src="/logo.svg" alt="" width="30" height="30" />
            <span>NextList</span>
          </div>
          <p class="footer-desc">现代化的全栈文件列表 / 网盘管理系统。轻量、免费、开源。</p>
          <a class="btn btn-ghost btn-sm" href={REPO_URL} target="_blank" rel="noopener noreferrer">
            <GitHubIcon size={15} />
            <span>Mcchen1008/NextList</span>
          </a>
        </div>

        <div class="footer-links">
          {LINK_GROUPS.map((group) => (
            <div class="footer-group">
              <h3>{group.title}</h3>
              {group.links.map((link) => (
                <a
                  href={link.href}
                  target={link.external ? '_blank' : undefined}
                  rel={link.external ? 'noopener noreferrer' : undefined}
                >
                  {link.text}
                </a>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div class="container footer-bottom">
        <span>© 2026 NextList Contributors · AGPL-3.0 License</span>
        <span>Powered by Cloudflare Pages</span>
      </div>
    </footer>
  )
}

export default Footer
