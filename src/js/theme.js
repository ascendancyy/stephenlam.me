import { addClass, removeClass } from 'src/js/util';

const yinyang = document.querySelector('.yinyang'),
      yang = '\u268A',
      yin = '\u268B';

let theme = JSON.parse(localStorage.getItem('dotme_theme')) || 'light',
    child;

yinyang.addEventListener('click', function click () {
  removeClass(document.body, theme);

  theme = theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('dotme_theme', JSON.stringify(theme));

  if (theme === 'dark') {
    const newChild = document.createTextNode(yin);
    yinyang.replaceChild(newChild, child);
    child = newChild;
  } else if (theme === 'light') {
    const newChild = document.createTextNode(yang);
    yinyang.replaceChild(newChild, child);
    child = newChild;
  }

  addClass(document.body, theme);
});

if (theme === 'dark') {
  child = yinyang.appendChild(document.createTextNode(yin));
} else if (theme === 'light') {
  child = yinyang.appendChild(document.createTextNode(yang));
}

addClass(document.body, theme);
