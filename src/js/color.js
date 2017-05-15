/*eslint-disable*/
export function hsvToRgb (hue, saturation, value) {
  let red
  let green
  let blue

  const i = Math.floor(hue * 6)
  const f = hue * 6 - i
  const p = value * (1 - saturation)
  const q = value * (1 - f * saturation)
  const t = value * (1 - (1 - f) * saturation)

  switch (i % 6) {
  case 0:
    red = value
    green = t
    blue = p
    break
  case 1:
    red = q
    green = value
    blue = p
    break
  case 2:
    red = p
    green = value
    blue = t
    break
  case 3:
    red = p
    green = q
    blue = value
    break
  case 4:
    red = t
    green = p
    blue = value
    break
  case 5:
    red = value
    green = p
    blue = q
    break
  }

  return {
    r: Math.round(red * 255),
    g: Math.round(green * 255),
    b: Math.round(blue * 255)
  }
}
