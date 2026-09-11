import type { Component } from 'solid-js'

/** 与 NextList 主仓库 admin /driver/names 保持同步的存储驱动（节选常用项） */
const DRIVERS = [
  { name: 'Local 本地文件系统', note: '仅 Node 容器模式' },
  { name: '夸克网盘', note: 'Cookie / 请求头直链' },
  { name: '夸克开放平台', note: 'OAuth' },
  { name: '阿里云盘 Open', note: 'Open 平台 OAuth2' },
  { name: '阿里云盘分享', note: '分享链接只读' },
  { name: 'OneDrive', note: 'OAuth2 · SharePoint' },
  { name: 'OneDrive 分享链接', note: '免账号只读' },
  { name: 'Google Drive', note: 'OAuth2' },
  { name: 'Dropbox', note: 'OAuth · 分片上传' },
  { name: '百度网盘', note: '分片上传 / 秒传' },
  { name: '123 云盘', note: 'token-first 登录' },
  { name: '123 开放平台', note: 'OAuth' },
  { name: '115 网盘', note: '开放平台' },
  { name: '天翼云盘', note: 'Session 持久化' },
  { name: '移动云云盘', note: '139 开放接口' },
  { name: '迅雷云盘', note: '普通 / Expert 双模式' },
  { name: 'UC 网盘', note: 'Cookie · puus 刷新' },
  { name: '联通云盘', note: 'wire 协议签名' },
  { name: 'PikPak', note: '账号密码 / Token' },
  { name: 'Yandex Disk', note: 'OAuth refresh_token' },
  { name: 'Terabox', note: 'Cookie + jsToken' },
  { name: 'Mega', note: '账号密码' },
  { name: 'S3 对象存储', note: 'SigV4 · 兼容 R2 / OSS' },
  { name: 'Azure Blob', note: '连接字符串 / SAS' },
  { name: '又拍云 USS', note: '操作员签名' },
  { name: 'Bunny Storage', note: 'AccessKey' },
  { name: 'WebDAV', note: 'Nextcloud / 群晖 / Alist' },
  { name: 'AList V3', note: '兼容 AList / OpenList' },
  { name: 'Cloudreve', note: 'v3 / v4 双版本' },
  { name: 'Seafile', note: '支持加密资料库' },
  { name: 'GitHub Releases', note: '发布件直链' },
  { name: 'Cloudflare ImgBed', note: '三种上传管线' },
  { name: 'Emby', note: '媒体库即目录' },
  { name: '网易云音乐云盘', note: '歌词虚拟文件' },
  { name: 'WPS 云文档', note: '个人 / 企业双端' },
]

const Drivers: Component = () => {
  return (
    <section class="section drivers-section">
      <div class="container">
        <h2 class="section-title">60+ 存储驱动，统一挂载</h2>
        <p class="section-desc">
          统一的 StorageDriver 接口（list / get / mkdir / rename / remove / move / copy），接入新网盘只需实现一个类。
          除 Local 外所有驱动均可在 Cloudflare Workers 上运行，完整清单见<a href="/docs/storage/drivers">驱动一览</a>。
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
