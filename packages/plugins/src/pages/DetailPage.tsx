import { A, useParams } from '@solidjs/router'
import { For, Show, createResource } from 'solid-js'
import type { Component } from 'solid-js'
import { fetchPlugin, fetchReadme } from '../api/client'
import { IconBadge } from '../components/IconBadge'
import { Markdown } from '../components/Markdown'
import { Giscus } from '../components/Giscus'
import { DownloadIcon, ExternalLinkIcon, GitHubIcon, StarIcon, ArrowLeftIcon } from '../components/Icons'
import { formatStars, timeAgo } from '../utils/format'

/** 插件详情页：头部信息卡 + README 渲染 + Giscus 评论区 */
const DetailPage: Component = () => {
  const params = useParams()
  const id = () => `${params.owner}/${params.repo}`

  const [pluginData] = createResource(id, (idv) => fetchPlugin(idv).then((r) => r.plugin))
  const [readme] = createResource(id, fetchReadme)

  return (
    <div class="container page detail-page">
      <A class="back-link" href="/">
        <ArrowLeftIcon size={15} />
        返回插件列表
      </A>

      <Show
        when={!pluginData.loading}
        fallback={
          <div class="center-block">
            <span class="spinner" aria-hidden="true" />
            <p>正在加载插件信息…</p>
          </div>
        }
      >
        <Show when={!pluginData.error} fallback={<div class="center-block error"><p>{pluginData.error?.message}</p></div>}>
          <Show when={pluginData()}>
            {(plugin) => (
              <>
                <section class="detail-head">
                  <IconBadge plugin={plugin()} size={88} rounded />
                  <div class="detail-head-main">
                    <div class="detail-title-row">
                      <h1>{plugin().name}</h1>
                      <span class="detail-stars" title={`${plugin().stars} stars`}>
                        <StarIcon size={15} />
                        {formatStars(plugin().stars)}
                      </span>
                    </div>
                    <p class="detail-desc">{plugin().description || '暂无描述'}</p>

                    <div class="detail-meta">
                      <a class="detail-owner" href={`${plugin().repoUrl}`} target="_blank" rel="noopener noreferrer">
                        <img src={plugin().ownerAvatar} alt="" width="20" height="20" />
                        <span>{plugin().owner}</span>
                      </a>
                      <span class="meta-dot">·</span>
                      <span>更新于 {timeAgo(plugin().updatedAt)}</span>
                      <For each={plugin().topics.slice(0, 4)}>
                        {(t) => <span class="chip mini">{t}</span>}
                      </For>
                    </div>

                    <div class="detail-actions">
                      <a class="btn btn-primary" href={plugin().downloadUrl} target="_blank" rel="noopener noreferrer">
                        <DownloadIcon size={16} />
                        下载插件
                      </a>
                      <a class="btn btn-secondary" href={plugin().repoUrl} target="_blank" rel="noopener noreferrer">
                        <GitHubIcon size={16} />
                        项目地址
                        <ExternalLinkIcon size={13} />
                      </a>
                    </div>
                  </div>
                </section>

                <section class="detail-readme">
                  <h2>README</h2>
                  <Show
                    when={!readme.loading}
                    fallback={
                      <div class="center-block">
                        <span class="spinner" aria-hidden="true" />
                        <p>正在加载 README…</p>
                      </div>
                    }
                  >
                    <Show
                      when={!readme.error}
                      fallback={
                        <div class="empty-block">
                          <p>暂无 README 缓存。</p>
                          <p class="empty-sub">作者在插件市场登录 / 刷新后，会自动拉取并缓存仓库 README。</p>
                        </div>
                      }
                    >
                      <Show when={readme()}>
                        {(content) => <Markdown content={content()} plugin={plugin()} />}
                      </Show>
                    </Show>
                  </Show>
                </section>

                <Giscus />
              </>
            )}
          </Show>
        </Show>
      </Show>
    </div>
  )
}

export default DetailPage
