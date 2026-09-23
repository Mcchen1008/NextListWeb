import { A } from '@solidjs/router'
import type { Component } from 'solid-js'
import { t } from '../i18n'

const NotFound: Component = () => {
  return (
    <div class="container page">
      <div class="center-block">
        <p class="notfound-code">404</p>
        <p>{t('nf.text')}</p>
        <A class="btn btn-secondary btn-sm" href="/">
          {t('nf.back')}
        </A>
      </div>
    </div>
  )
}

export default NotFound
