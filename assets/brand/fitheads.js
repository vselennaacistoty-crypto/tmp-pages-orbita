/* Заголовки «Своя орбита»: если самое длинное слово не влезает в колонку,
   уменьшаем кегль заголовка, а не рвём слово посередине («Маркетин / г»).

   02.10.2026: условие сужено. Было «ужимать, пока блок шире колонки»
   (h.scrollWidth > h.clientWidth) — но в шаблоне заголовок первого экрана
   намеренно выходит за свою колонку, и скрипт схлопывал его со 128 до 93px.
   На /pricing/web-design/ от этого проседала высота первого экрана и фото
   наезжало на заголовок. Теперь меряем именно самое длинное слово. */
(function () {
  'use strict';
  var MIN = 0.55; // не меньше 55 % исходного кегля

  // ширина самого длинного слова при текущем начертании
  function longestWord(h) {
    var words = (h.innerText || '').split(/\s+/).filter(Boolean);
    if (!words.length) return 0;
    var probe = document.createElement('span');
    var cs = getComputedStyle(h);
    probe.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;left:-9999px;top:0';
    probe.style.font = cs.font;
    probe.style.fontFamily = cs.fontFamily;
    probe.style.fontWeight = cs.fontWeight;
    probe.style.fontSize = cs.fontSize;
    probe.style.letterSpacing = cs.letterSpacing;
    document.body.appendChild(probe);
    var max = 0;
    for (var i = 0; i < words.length; i++) {
      probe.textContent = words[i];
      var w = probe.getBoundingClientRect().width;
      if (w > max) max = w;
    }
    probe.remove();
    return max;
  }

  function fit(h) {
    if (h.hasAttribute('data-nofit')) return;
    // Заголовок первого экрана в шаблоне намеренно выходит за свою колонку,
    // поэтому «не влезает» он всегда — скрипт схлопывал его со 128 до 93px,
    // первый экран проседал и фото наезжало на заголовок (/pricing/web-design/).
    // Кегль этих заголовков уже ограничен точечными правилами в theme.css,
    // посчитанными по ширине слова и колонки: разрывов 0 на 150 страницах.
    if (h.closest('[id^="banner"]')) return;  // #banner, #banner-web-calc и т.п.
    var base = parseFloat(h.getAttribute('data-fit-base') || getComputedStyle(h).fontSize);
    if (!base) return;
    h.setAttribute('data-fit-base', base);
    h.style.fontSize = '';
    h.style.overflowWrap = 'normal';
    h.style.wordBreak = 'normal';
    h.style.hyphens = 'manual';
    var box = h.clientWidth;
    if (!box) return;
    var size = base, guard = 0;
    while (longestWord(h) > box - 1 && size > base * MIN && guard++ < 40) {
      size = Math.floor(size * 0.96);
      h.style.fontSize = size + 'px';
    }
    if (size === base) h.style.fontSize = '';
  }

  function run() { document.querySelectorAll('h1, h2').forEach(fit); }
  var t;
  function onResize() { clearTimeout(t); t = setTimeout(run, 120); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(run);
  window.addEventListener('load', run);
  window.addEventListener('resize', onResize);
})();
