import { createEffect, createSignal } from 'solid-js'
import type { Component } from 'solid-js'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Features from './components/Features'
import Drivers from './components/Drivers'
import Showcase from './components/Showcase'
import Deploy from './components/Deploy'
import Footer from './components/Footer'

export type Theme = 'light' | 'dark'

const THEME_KEY = 'nextlist-theme'

function initialTheme(): Theme {
  try {
    const saved = localStorage.getItem(THEME_KEY)
    if (saved === 'light' || saved === 'dark') return saved
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

const App: Component = () => {
  const [theme, setTheme] = createSignal<Theme>(initialTheme())

  createEffect(() => {
    document.documentElement.dataset.theme = theme()
    try {
      localStorage.setItem(THEME_KEY, theme())
    } catch {
      /* 隐私模式下忽略 */
    }
  })

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))

  return (
    <div class="app">
      <Navbar theme={theme()} onToggleTheme={toggleTheme} />
      <main>
        <Hero />
        <Features />
        <Drivers />
        <Showcase />
        <Deploy />
      </main>
      <Footer />
    </div>
  )
}

export default App
