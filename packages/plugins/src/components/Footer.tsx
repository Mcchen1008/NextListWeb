import { A } from '@solidjs/router'
import { t } from '../i18n'

const REPO_URL = 'https://github.com/Mcchen1008/NextList'

export function Footer() {
  return (
    <footer class="footer">
      <div class="container footer-inner">
        <span>
          {t('footer.tipBefore')}
          <code>nextlist-plugin</code>
          {t('footer.tipAfter')}
        </span>
        <span class="footer-links">
          <A href="/">{t('footer.market')}</A>
          <a href="/" target="_self">
            {t('footer.docs')}
          </a>
          <a href={REPO_URL} target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
        </span>
      </div>
    </footer>
  )
}
