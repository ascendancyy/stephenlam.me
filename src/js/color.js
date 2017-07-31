import { random } from 'src/js/util';

const {
  ceil,
  cos,
  PI
} = Math;

/*eslint-disable*/
export function hsvToRgb (hue, saturation, value) {
  let red,
      green,
      blue;

  const i = Math.floor(hue * 6),
        f = hue * 6 - i,
        p = value * (1 - saturation),
        q = value * (1 - f * saturation),
        t = value * (1 - (1 - f) * saturation);

  switch (i % 6) {
  case 0:
    red = value;
    green = t;
    blue = p;
    break;
  case 1:
    red = q;
    green = value;
    blue = p;
    break;
  case 2:
    red = p;
    green = value;
    blue = t;
    break;
  case 3:
    red = p;
    green = q;
    blue = value;
    break;
  case 4:
    red = t;
    green = p;
    blue = value;
    break;
  case 5:
    red = value;
    green = p;
    blue = q;
    break;
  }

  return {
    r: Math.round(red * 255),
    g: Math.round(green * 255),
    b: Math.round(blue * 255)
  };
}
/*eslint-enable*/

export function setLinkColor (elm) {
  // http://martin.ankerl.com/2009/12/09/how-to-create-random-colors-programmatically/
  let hue = random();
  const saturation = 0.4,
        value = 0.98;

  hue += 0.618033988749895;
  hue %= 1;

  const rgb = hsvToRgb(hue, saturation, value);
  Object.assign(elm.style, { color: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` });
}

export function getFlowColor (rotate, alpha) {
  const rgbFloor = 148;
  const rgbRange = 255 - rgbFloor;

  const red = ceil(cos(rotate) * rgbRange + rgbFloor);
  const green = ceil(cos(rotate + PI * 0.666) * rgbRange + rgbFloor);
  const blue = ceil(cos(rotate + PI * 1.333) * rgbRange + rgbFloor);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
};
