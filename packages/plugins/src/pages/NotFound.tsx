import { A } from '@solidjs/router'
import type { Component } from 'solid-js'

const NotFound: Component = () => {
  return (
    <div class="container page">
      <div class="center-block">
        <p class="notfound-code">404</p>
        <p>页面不存在或插件已被移除。</p>
        <A class="btn btn-secondary btn-sm" href="/">
          返回插件市场
        </A>
      </div>
    </div>
  )
}

export default NotFound
