import { render } from 'solid-js/web'
import App from './App'
import './styles/global.css'

const root = document.getElementById('root')
if (!root) throw new Error('未找到 #root 挂载点')

render(() => <App />, root)
