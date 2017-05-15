import Promise from 'promise-polyfill'
if (!window.Promise) {
  window.Promise = Promise
}

import 'normalize.css'
import 'scss/waves.scss'

import { hsvToRgb } from 'src/js/util'
import { init } from 'src/js/flow'

import { loadFonts } from 'src/js/fonts'

let previous = null

function setup () {
  setupHeaderHover()
  setupLinksHover()
  init()
}

function setupHeaderHover () {
  const animStagger = 64
  const animOffset = 256

  const headers = document.getElementsByClassName('project__header')
  const openedIndex = JSON.parse(localStorage.getItem('projectOpen'))

  for (let index = 0; index < headers.length; index++) {
    const elm = headers[index]
    const animDelay = animStagger * index + animOffset

    const parent = elm.parentElement

    parent.style.animationDelay = `${animDelay}ms, ${animDelay}ms`

    const dataIndex = elm.dataset ?
      elm.dataset.index :
      elm.getAttribute('data-index')

    if (openedIndex && openedIndex === dataIndex) {
      activateProject(elm)
    }

    elm.addEventListener('click', event => activeHandler(event, elm))
    elm.addEventListener('touchstart', event => activeHandler(event, elm))

    elm.addEventListener('mouseenter', event => {
      parent.classList.add('project--hover')
    })

    elm.addEventListener('mouseleave', event => {
      parent.classList.remove('project--hover')
    })
  }
}

function activeHandler (event, elm) {
  event.preventDefault()

  const open = !elm.parentElement.classList.contains('project--active')

  if (!open && previous === elm) {
    localStorage.removeItem('projectOpen')
  }

  open ?
    activateProject(elm) :
    deactivateProject(elm)
}

function setupLinksHover () {
  const links = document.getElementsByClassName('link')

  for (let index = 0; index < links.length; index++) {
    const elm = links[index]
    const enabled = !elm.classList.contains('link--disabled')

    enabled && elm.addEventListener('mouseenter', () => {
      // http://martin.ankerl.com/2009/12/09/how-to-create-random-colors-programmatically/
      const silverRatio = 0.618033988749895

      let hue = Math.random()
      const saturation = 0.4
      const value = 0.98

      hue += silverRatio
      hue %= 1
      const rgb = hsvToRgb(hue, saturation, value)

      elm.style.color = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
    })

    elm.addEventListener('mouseleave', () => { elm.style.color = '' })
  }
}

function activateProject (elm) {
  const parent = elm.parentElement

  if (previous && previous !== elm) {
    deactivateProject(previous)
  }

  parent.classList.add('project--active')

  previous = elm

  const dataIndex = elm.dataset ?
    elm.dataset.index :
    elm.getAttribute('data-index')

  localStorage.setItem('projectOpen', JSON.stringify(dataIndex))
}

function deactivateProject (elm) {
  elm.parentElement.classList.remove('project--active')
}

loadFonts()
window.addEventListener('load', setup)
