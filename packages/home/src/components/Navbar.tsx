import type { Component } from 'solid-js'
import { GitHubIcon, MoonIcon, SunIcon } from './Icons'
import type { Theme } from '../App'

interface Props {
  theme: Theme
  onToggleTheme: () => void
}

const NAV_LINKS = [
  { href: '#features', text: '特性' },
  { href: '#showcase', text: '界面预览' },
  { href: '#deploy', text: '部署' },
  { href: '/docs/', text: '文档' },
  { href: '/plugins/', text: '插件市场' },
]

const REPO_URL = 'https://github.com/Mcchen1008/NextList'

const Navbar: Component<Props> = (props) => {
  return (
    <header class="navbar">
      <div class="container navbar-inner">
        <a class="brand" href="/" aria-label="NextList 首页">
          <img src="/logo.svg" alt="" width="28" height="28" />
          <span class="brand-name">NextList</span>
        </a>

        <nav class="nav-links" aria-label="主导航">
          {NAV_LINKS.map((link) => (
            <a href={link.href}>{link.text}</a>
          ))}
        </nav>

        <div class="nav-actions">
          <button
            class="icon-btn"
            type="button"
            onClick={props.onToggleTheme}
            aria-label={props.theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'}
            title="切换主题"
          >
            {props.theme === 'dark' ? <SunIcon size={17} /> : <MoonIcon size={17} />}
          </button>
          <a class="btn btn-ghost btn-sm nav-github" href={REPO_URL} target="_blank" rel="noopener noreferrer">
            <GitHubIcon size={16} />
            <span>GitHub</span>
          </a>
        </div>
      </div>
    </header>
  )
}

export default Navbar
