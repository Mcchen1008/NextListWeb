import type { Component } from 'solid-js'
import { For } from 'solid-js'

/** 纯 CSS 绘制的文件浏览界面示意（不依赖截图资源，随主题自动适配） */
const SIDEBAR_ITEMS = ['全部文件', '相册备份', '影视资源', '文档资料', '音乐收藏']

const FILES = [
  { name: 'movies', folder: true, size: '—', date: '2026-08-30' },
  { name: 'photos', folder: true, size: '—', date: '2026-09-02' },
  { name: 'docs', folder: true, size: '—', date: '2026-09-05' },
  { name: 'Interstellar.2014.2160p.mkv', folder: false, size: '45.2 GB', date: '2026-08-30' },
  { name: 'NextList 部署指南.pdf', folder: false, size: '2.8 MB', date: '2026-09-05' },
  { name: 'backup-20260910.zip', folder: false, size: '1.3 GB', date: '2026-09-10' },
  { name: 'wallpaper-4k.png', folder: false, size: '9.6 MB', date: '2026-09-08' },
]

const Showcase: Component = () => {
  return (
    <section id="showcase" class="section showcase-section">
      <div class="container">
        <h2 class="section-title">界面预览</h2>
        <p class="section-desc">简洁直观的网页界面，列表 / 网格双视图、目录树、批量操作一应俱全，桌面与移动端同样出色。</p>

        <div class="browser" role="img" aria-label="NextList 文件浏览界面示意">
          <div class="browser-bar">
            <span class="dot dot-red" />
            <span class="dot dot-yellow" />
            <span class="dot dot-green" />
            <span class="browser-url">https://drive.example.com</span>
          </div>
          <div class="browser-body">
            <aside class="mock-sidebar">
              <p class="mock-side-title">我的网盘</p>
              <For each={SIDEBAR_ITEMS}>
                {(item, i) => <div class={`mock-side-item${i() === 0 ? ' active' : ''}`}>{item}</div>}
              </For>
              <div class="mock-side-divider" />
              <div class="mock-side-item">分享记录</div>
              <div class="mock-side-item">管理后台</div>
            </aside>

            <div class="mock-main">
              <div class="mock-toolbar">
                <span class="mock-path">/ 全部文件</span>
                <span class="mock-actions">
                  <span class="mock-btn primary">上传</span>
                  <span class="mock-btn">新建文件夹</span>
                </span>
              </div>
              <div class="mock-table">
                <div class="mock-row head">
                  <span>名称</span>
                  <span>大小</span>
                  <span>修改时间</span>
                </div>
                <For each={FILES}>
                  {(file) => (
                    <div class="mock-row">
                      <span class={`mock-file${file.folder ? ' folder' : ''}`}>
                        <i class="mock-file-dot" aria-hidden="true" />
                        {file.name}
                      </span>
                      <span>{file.size}</span>
                      <span>{file.date}</span>
                    </div>
                  )}
                </For>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Showcase
