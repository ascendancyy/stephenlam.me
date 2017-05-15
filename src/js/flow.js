/*eslint no-magic-numbers: ["off"]*/
const DEVELOPMENT = process.env.NODE_ENV === 'development'

import memoize from 'fast-memoize'
import { easeInOutExpo } from 'src/js/easings'
import { raf, viewport, loadSR } from 'src/js/util'

let rng = Math.random

DEVELOPMENT && loadSR().then(seedrandom => { rng = seedrandom('2501') })

const canvas = document.querySelector('.canvas')
const ctx = canvas.getContext('2d')

// Settings
const globalAlpha = 0.8
const maxDeviation = 0.16
const verticalLock = false
const easing = easeInOutExpo

const varianceAmount = 0.2
const varianceInterval = 8192
const varianceDuration = 4096

// Persist
let points = []
let translateX = 0
let translateY = 0
let varianceStart = 0

function resizeCanvas (event) {
  const {
     width,
     height
   } = viewport()

  canvas.width = width
  canvas.height = height

  ctx.globalAlpha = globalAlpha

  genNewPoints(width, height)
  raf(draw)
}

window.addEventListener('resize', resizeCanvas)

export function init () {
  const {
    width,
    height
  } = viewport()

  const initialX = width * -maxDeviation
  const initalXOffset = -64

  points = [
    {
      x: initialX,
      y: height * 0.4,
      variance: {
        progress: 0,
        horizontal: {
          locked: true,
          amount: variance(genHVariance(width), easing)
        },
        vertical: {
          locked: verticalLock,
          amount: variance(genVVariance(height), easing)
        }
      }
    },
    {
      x: initialX + initalXOffset,
      y: height * 0.4 + height * 0.4 * rng() * 0.64,
      variance: {
        progress: 0,
        horizontal: {
          locked: true,
          amount: variance(genHVariance(width), easing)
        },
        vertical: {
          locked: verticalLock,
          amount: variance(genVVariance(height), easing)
        }
      }
    }
  ]

  resizeCanvas()
}

// eslint-disable-next-line
export function draw (timestamp) {
  const pointsLoopStart = 2

  const varianceWavelength = 512
  const colorWavelength = 4096

  let colorInput = Math.sin(timestamp / colorWavelength)

  const {
    width,
    height
  } = viewport()

  if (timestamp - varianceStart > varianceInterval) {
    varianceStart = timestamp
    genRandVariance(width, height, timestamp)
  }

  ctx.clearRect(0, 0, width, height)

  ctx.save()
  ctx.translate(translateX, translateY)

  for (let idx = 0; idx < points.length; idx++) {
    points[idx].variance.progress = Math.sin(
      timestamp / varianceWavelength +
      Math.cos(idx)
    )
    if (idx >= pointsLoopStart) {
      ctx.beginPath()

      const leftPoint = points[idx - 2]
      let leftPointY = leftPoint.y

      if (!leftPoint.variance.vertical.locked) {
        leftPointY += leftPoint
                        .variance
                        .vertical
                        .amount(timestamp) * leftPoint.variance.progress
      }
      ctx.moveTo(leftPoint.x, leftPointY)

      const midPoint = points[idx - 1]
      let midPointY = midPoint.y

      if (!midPoint.variance.vertical.locked) {
        midPointY += midPoint
                          .variance
                          .vertical
                          .amount(timestamp) * midPoint.variance.progress
      }
      ctx.lineTo(midPoint.x, midPointY)

      const rightPoint = points[idx]
      let rightPointY = rightPoint.y

      if (!rightPoint.variance.vertical.locked) {
        rightPointY += rightPoint
                         .variance
                         .vertical
                         .amount(timestamp) * rightPoint.variance.progress
      }

      if (!rightPoint.variance.horizontal.locked) {
        const slope = (rightPointY - midPointY) / (rightPoint.x - midPoint.x)
        const xIntercept = rightPointY - rightPoint.x * slope

        const calx = (rightPoint.x - midPoint.x) *
                     rightPoint.variance.horizontal.amount(timestamp) +
                     midPoint.x
        const caly = calx * slope + xIntercept

        ctx.lineTo(calx, caly)
      } else {
        ctx.lineTo(rightPoint.x, rightPointY)
      }

      colorInput -= Math.PI * 2 / -50 * 1.512
      ctx.fillStyle = genColor(
        colorInput, 0.9 -
        (leftPointY + midPointY + rightPointY) / height / 6
      )
      ctx.fill()
      ctx.closePath()
    }
  }

  ctx.restore()

  raf(draw)
}

function genNewPoints (width, height) {
  if (!points.length) {
    return points
  }

  let lastPointX = points[points.length - 1].x

  if (lastPointX > width) {
    return points
  }

  const prevY = points[points.length - 1].y

  while (lastPointX < width + width * 0.16) {
    lastPointX += genX(lastPointX, width)
    points.push({
      x: lastPointX,
      y: genY(prevY, height),
      variance: {
        progress: 0,
        horizontal: {
          locked: false,
          amount: variance(genHVariance(width), easing)
        },
        vertical: {
          locked: verticalLock,
          amount: variance(genVVariance(height), easing)
        }
      }
    })
  }

  return points
}

function genX (prevX, width) {
  const minSpace = 32
  const maxSpace = 128
  const spacing = Math.min(Math.max(width * 0.064, minSpace), maxSpace)

  return Math.floor((rng() + 1) * spacing)
}

function genY (prevY, height) {
  let nextY = rng() * 0.64 * height + 0.16 * height
  let deviation = nextY - prevY

  while (Math.abs(deviation) > maxDeviation * height) {
    nextY = rng() * 0.64 * height + 0.16 * height
    deviation = nextY - prevY
  }

  return Math.floor(nextY)
}

function variance (initial, easingFunction) {
  let calculatedValue = initial
  let previousValue = null
  let newValue = null
  let start = null

  return function amount (timestamp, value) {
    if (value) {
      newValue = value
      previousValue = calculatedValue

      start = timestamp
    }

    if (newValue && timestamp - start <= varianceDuration) {
      calculatedValue = easingFunction(
        timestamp - start,
        previousValue,
        newValue - previousValue,
        varianceDuration
      )
    } else if (newValue) {
      newValue = null
      previousValue = null
      start = null
    }

    return calculatedValue
  }
}

function genHVariance (width) {
  const varianceFloor = 0.5

  return Math.min(rng() + varianceFloor, 1)
}

function genVVariance (height) {
  return maxDeviation * height * rng() * varianceAmount
}

function genRandVariance (width, height, timestamp) {
  const chanceMin = 0.64

  for (let idx = 0; idx < points.length; idx++) {
    const point = points[idx]

    rng() > chanceMin &&
      point.variance.horizontal.amount(timestamp, genHVariance(width))
    rng() > chanceMin &&
      point.variance.vertical.amount(timestamp, genVVariance(height))
  }
}

const genColor = memoize((rotate, alpha) => {
  const rgbValues = 255
  const rgbFloor = 153
  const rgbRange = rgbValues - rgbFloor

  const greenOffset = 0.666
  const blueOffset = 1.333

  const red = Math.ceil(Math.cos(rotate) * rgbRange + rgbFloor)
  const green = Math.ceil(
    Math.cos(rotate + Math.PI * greenOffset) *
    rgbRange +
    rgbFloor
  )
  const blue = Math.ceil(
    Math.cos(rotate + Math.PI * blueOffset) *
    rgbRange +
    rgbFloor
  )

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`
})

document.addEventListener('mousemove', event => {
  const {
    width,
    height
  } = viewport()

  const halfVW = width / 2
  const halfVH = height / 2

  translateX = (event.screenX - halfVW) /
               halfVW * halfVW * 0.08 * halfVW / halfVH
  translateY = (event.screenY - halfVH) / halfVH * halfVH * 0.08
})
