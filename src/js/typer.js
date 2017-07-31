import escape from 'lodash.escape';
import { random, style } from 'src/js/util';

export const Typer = {
  $elm: undefined,

  speed: 32,

  typeCount: 1,
  typeClassName: 'typer-text',
  typeCallback: undefined,

  useTypeFill: false,
  typeFill: 'abcdefghijklmnopqrstuvwxyz0123456789-=\\/!@#$%^&*_+|?',

  caret: '|',
  caretClassName: 'typer-caret',

  showCaret: true,
  hideCaretOnComplete: false,
  caretHideTimeout: 300,

  init (elm, options = {}) {
    if (typeof elm === 'string') {
      this.$elm = document.querySelector(elm);
    } else {
      this.$elm = elm;
    }

    if (typeof options === 'number') {
      this.speed = options;
    } else {
      for (const key in options) {
        if (Typer.hasOwnProperty(key)) {
          this[key] = options[key];
        }
      }
    }

    this._head = 0;
    this._timeoutId = undefined;

    this._textSpan = undefined;
    this._caretSpan = undefined;
    this._previousChunk = undefined;

    this._typeStart = Number.MIN_SAFE_INTEGER;
  },

  type (text, mySpeed) {
    const typeSpeed = mySpeed ? mySpeed : this.speed;

    !this._textSpan && this._createTextSpan();
    this.showCaret && !this._caretSpan && this._createCaretSpan();
    this.$elm.style.whiteSpace = 'pre-wrap';

    const now = performance.now(),
          delta = now - this._typeStart;

    if (delta >= typeSpeed) {
      let spanChunk = '';
      const subText = escape(text.substr(this._head, this.typeCount));
      if (subText.match(/^\s$/) || !this.useTypeFill) {
        spanChunk = subText;
      } else {
        for (let index = 0; index < subText.length; index++) {
          let char = this.typeFill.charAt(random(0, this.typeFill.length - 1));
          char = random() > 0.5 ? char.toUpperCase() : char;
          spanChunk += char;
        }
      }

      const finishedChunk = this._previousChunk ? this._previousChunk : '';
      this.$elm.insertBefore(
        document.createTextNode(finishedChunk),
        this._textSpan
      );
      this.$elm.normalize();

      this._textSpan.innerText = spanChunk;
      this.typeCallback && this.typeCallback(this._textSpan, typeSpeed);

      this._head += spanChunk.length;
      this._previousChunk = subText;
      this._typeStart = now - (delta % typeSpeed);
    }

    this._timeoutId = this._head < text.length ?
      setTimeout(() => this.type(text, mySpeed), typeSpeed) :
      setTimeout(() => this._cleanup(text), typeSpeed);
  },

  reset () {
    this._head = 0;
    this._previousChunk = undefined;

    this._textSpan && this.$elm.removeChild(this._textSpan);
    this._caretSpan && this.$elm.removeChild(this._caretSpan);
    this.$elm.innerHTML = '';

    this._createTextSpan();
    this.showCaret && this._createCaretSpan();

    this._timeoutId && clearTimeout(this._timeoutId);
  },

  _createTextSpan () {
    this._textSpan = document.createElement('span');
    this.typeClassName && this._textSpan.classList.add(this.typeClassName);
    this.$elm.appendChild(this._textSpan);
  },
  _createCaretSpan () {
    this._caretSpan = document.createElement('span');
    this._caretSpan.innerText = this.caret;
    this.caretClassName && this._caretSpan.classList.add(this.caretClassName);
    this.$elm.appendChild(this._caretSpan);
  },
  _cleanup (text) {
    this.$elm.style.whiteSpace = '';

    const finishedChunk = this._previousChunk ? this._previousChunk : '';
    this.$elm.insertBefore(
      document.createTextNode(finishedChunk),
      this._textSpan
    );

    this.$elm.normalize();
    this.$elm.removeChild(this._textSpan);

    if (this.hideCaretOnComplete) {
      setTimeout(() => {
        if (this._caretSpan && this.$elm.contains(this._caretSpan)) {
          const anim = this._caretSpan.animate([
            { opacity: style(this._caretSpan, 'opacity') },
            { opacity: 0 }
          ], {
            fill: 'both',
            duration: 199.3
          });
          anim.onfinish = () => {
            this.$elm.removeChild(this._caretSpan);
            this._caretSpan = undefined;
          };
        }
      }, this.caretHideTimeout);
    }

    this._head = 0;
    this._previousChunk = undefined;

    return this._textSpan = undefined;
  }
};
