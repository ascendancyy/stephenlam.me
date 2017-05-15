import { hsvToRgb } from 'src/js/color'

const frame = 16
const raf = window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function raf (callback) { return setTimeout(callback, frame) }

function viewport () {
  const docElm = document.documentElement

  return {
    width: Math.max(docElm.clientWidth, window.innerWidth || 0),
    height: Math.max(docElm.clientHeight, window.innerHeight || 0)
  }
}

function loadSR () {
  return new Promise(resolve => {
    require.ensure(['seedrandom'], require => {
      resolve(require('seedrandom'))
    }, 'devdeps')
  })
}

function inlineStyles (url) {
  const success = 200
  const done = 4

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()

    xhr.onreadystatechange = () => {
      if (xhr.readyState === done && xhr.status === success) {
        const style = document.createElement('style')

        style.innerHTML = xhr.responseText
        document.head.appendChild(style)
        resolve()
      }
    }

    xhr.onerror = reject
    xhr.open('GET', url, true)
    xhr.send()
  })
}

function loadStyles (url) {
  const success = 200
  const done = 4

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()

    xhr.returnType = 'text'
    xhr.onreadystatechange = () => {
      if (xhr.readyState === done && xhr.status === success) {
        const link = document.createElement('link')

        link.rel = 'stylesheet'
        link.href = url
        document.head.appendChild(link)
        resolve()
      }
    }

    xhr.onerror = reject
    xhr.open('GET', url)
    xhr.send()
  })
}

export { raf, viewport, hsvToRgb, loadSR, inlineStyles, loadStyles }
