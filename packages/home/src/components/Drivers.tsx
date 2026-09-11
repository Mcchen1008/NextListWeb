import type { Component } from 'solid-js'

/** 与 NextList 主仓库 README 保持同步的 13 种存储驱动 */
const DRIVERS = [
  { name: 'Local 本地文件系统', note: '仅 Node 容器模式' },
  { name: '夸克网盘', note: 'Cookie / 请求头直链' },
  { name: '阿里云盘', note: 'Open 平台 OAuth2' },
  { name: 'OneDrive', note: 'OAuth2 · SharePoint' },
  { name: 'Google Drive', note: 'OAuth2' },
  { name: '百度网盘', note: '分片上传 / 秒传' },
  { name: '123 云盘', note: 'token-first 登录' },
  { name: '115 网盘', note: '开放平台' },
  { name: '天翼云盘', note: 'Cookie 持久化' },
  { name: '迅雷云盘', note: '普通 / Expert 双模式' },
  { name: '蓝奏云', note: 'Cookie 持久化' },
  { name: 'GitHub', note: '仓库文件即存储' },
  { name: 'WebDAV', note: 'Nextcloud / 群晖 / Alist' },
]

const Drivers: Component = () => {
  return (
    <section class="section drivers-section">
      <div class="container">
        <h2 class="section-title">13 种存储驱动，统一挂载</h2>
        <p class="section-desc">
          统一的 StorageDriver 接口（list / get / mkdir / rename / remove / move / copy），接入新网盘只需实现一个类。
          除 Local 外所有驱动均可在 Cloudflare Workers 上运行。
        </p>

        <ul class="drivers-grid" aria-label="支持的存储驱动列表">
          {DRIVERS.map((driver) => (
            <li class="driver-chip">
              <span class="driver-name">{driver.name}</span>
              <span class="driver-note">{driver.note}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default Drivers
