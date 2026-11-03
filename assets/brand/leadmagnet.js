/* Лид-магнит «Своя орбита»: всплывающее окно через 30 секунд.
   Показывается один раз за визит; после закрытия — не раньше чем через 7 дней; после отправки — больше не показывается. */
(function () {
  'use strict';
  var DELAY = 30000, KEY = 'so_lm', HIDE_DAYS = 7, ENDPOINT = '/form.php';
  if (/\/(privacy|fulfillment|contact)\//.test(location.pathname)) return;
  try {
    var st = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (st && (st.done || (st.closed && Date.now() - st.closed < HIDE_DAYS * 864e5))) return;
  } catch (e) {}
  if (window.__soLm) return; window.__soLm = 1;

  var CSS = '' +
    '.so-lm{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(30,42,74,.62);opacity:0;transition:opacity .25s;font-family:"Golos Text",system-ui,-apple-system,"Segoe UI",sans-serif}' +
    '.so-lm.is-on{opacity:1}' +
    '.so-lm__box{position:relative;width:100%;max-width:520px;background:#fff;border-radius:20px;padding:36px 32px 28px;box-shadow:0 30px 80px rgba(30,42,74,.35);transform:translateY(24px);transition:transform .3s}' +
    '.so-lm.is-on .so-lm__box{transform:none}' +
    '.so-lm .so-lm__box .so-lm__x{all:unset;position:absolute;top:10px;right:10px;width:40px;height:40px;box-sizing:border-box;text-align:center;cursor:pointer;color:#1E2A4A;font-size:30px;line-height:40px;border-radius:50%;font-family:Arial,sans-serif}' +
    '.so-lm .so-lm__box .so-lm__x:hover{background:#F3F6FA}' +
    '.so-lm__tag{display:inline-block;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#FF6B35;font-weight:700;margin:0 0 12px}' +
    '.so-lm__h{font-size:26px;line-height:1.15;font-weight:800;color:#1E2A4A;margin:0 0 12px;letter-spacing:-.01em}' +
    '.so-lm__p{font-size:15px;line-height:1.5;color:#3f4a66;margin:0 0 20px}' +
    '.so-lm__p b{color:#1E2A4A}' +
    '.so-lm__free{color:#FF6B35}' +
    '.so-lm__lbl{font-size:13px;font-weight:600;color:#1E2A4A;margin:4px 0 -4px}' +
    '.so-lm .so-lm__chk{display:flex;gap:10px;align-items:flex-start;font-size:13px;line-height:1.4;color:#3f4a66;margin:2px 0 6px;cursor:pointer}' +
    '.so-lm .so-lm__chk input{all:revert;width:18px;height:18px;margin:1px 0 0;flex:0 0 18px;accent-color:#FF6B35;cursor:pointer}' +
    '.so-lm .so-lm__chk a{color:#FF6B35;font-size:inherit;text-decoration:underline}' +
    '.so-lm__f{display:flex;flex-direction:column;gap:10px}' +
    '.so-lm__f input{width:100%;box-sizing:border-box;height:50px;border:1.5px solid #dfe5f0;border-radius:12px;padding:0 16px;font:inherit;font-size:16px;color:#1E2A4A;background:#F3F6FA;outline:0}' +
    '.so-lm__f input:focus{border-color:#FF6B35;background:#fff}' +
    '.so-lm__btn{height:54px;border:0;border-radius:12px;background:#FF6B35;color:#fff;font:inherit;font-size:15px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;box-shadow:0 10px 24px rgba(255,107,53,.35)}' +
    '.so-lm__btn:hover{background:#ff5a1f}.so-lm__btn:disabled{opacity:.6;cursor:default}' +
    '.so-lm__s{font-size:12px;line-height:1.4;color:#7a849c;margin:12px 0 0}' +
    '.so-lm .so-lm__s a{color:#7a849c;font-size:inherit;font-weight:inherit;text-decoration:underline}' +
    '.so-lm .so-lm__box h3,.so-lm .so-lm__box p{font-family:inherit}' +
    '.so-lm .so-lm__box .so-lm__btn{all:unset;box-sizing:border-box;display:block;width:100%;text-align:center;height:54px;line-height:54px;border-radius:12px;background:#FF6B35;color:#fff;font-family:inherit;font-size:15px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;box-shadow:0 10px 24px rgba(255,107,53,.35)}' +
    '.so-lm__note{font-size:14px;margin:10px 0 0;color:#c0392b}.so-lm__note[data-kind=ok]{color:#1f8a4c}' +
    '.so-lm__hp{position:absolute;left:-9999px;opacity:0;height:0;width:0}' +
    '@media(max-width:600px){.so-lm{align-items:flex-end;padding:0}.so-lm__box{max-width:none;border-radius:20px 20px 0 0;padding:28px 20px 22px}.so-lm__h{font-size:23px}.so-lm__p{font-size:14px}}';

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function save(o) { try { var s = JSON.parse(localStorage.getItem(KEY) || '{}'); for (var k in o) s[k] = o[k]; localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} }

  function show() {
    if (document.hidden) { document.addEventListener('visibilitychange', function once() { if (!document.hidden) { document.removeEventListener('visibilitychange', once); show(); } }); return; }
    var style = document.createElement('style'); style.textContent = CSS; document.head.appendChild(style);
    var root = document.createElement('div'); root.className = 'so-lm'; root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-labelledby', 'so-lm-h');
    root.innerHTML =
      '<div class="so-lm__box">' +
      '<button type="button" class="so-lm__x" aria-label="Закрыть">&times;</button>' +
      '<span class="so-lm__tag">Для владельцев сайтов</span>' +
      '<h3 class="so-lm__h" id="so-lm-h"><span class="so-lm__free">Бесплатно:</span> технический и SEO-аудит вашего сайта</h3>' +
      '<p class="so-lm__p">Проверим скорость, ошибки, индексацию и видимость в Яндексе — и пришлём отчёт с <b>конкретным списком, что чинить</b>. Без обязательств.</p>' +
      '<form class="so-lm__f" novalidate>' +
      '<label class="so-lm__lbl">Адрес сайта</label>' +
      '<input type="url" name="site" placeholder="site.ru" autocomplete="url" required>' +
      '<label class="so-lm__lbl">Номер телефона — куда отправить отчёт</label>' +
      '<input type="tel" name="phone" placeholder="+7 ___ ___-__-__" autocomplete="tel" inputmode="tel" required>' +
      '<label class="so-lm__chk"><input type="checkbox" name="agree"><span>Согласен на обработку персональных данных и получение отчёта по указанному номеру (<a href="/privacy/" target="_blank">политика</a>)</span></label>' +
      '<input type="text" name="_trap" class="so-lm__hp" tabindex="-1" autocomplete="off">' +
      '<button type="submit" class="so-lm__btn">Получить аудит</button>' +
      '</form>' +
      '<p class="so-lm__s">Отчёт бесплатный, без обязательств. Ничего продавать по телефону не будем — пришлём список, что чинить.</p>' +
      '</div>';
    document.body.appendChild(root);
    requestAnimationFrame(function () { requestAnimationFrame(function () { root.classList.add('is-on'); }); });

    function close() { save({ closed: Date.now() }); root.classList.remove('is-on'); setTimeout(function () { root.remove(); }, 260); document.removeEventListener('keydown', onKey); }
    function onKey(e) { if (e.key === 'Escape') close(); }
    document.addEventListener('keydown', onKey);
    root.querySelector('.so-lm__x').addEventListener('click', close);
    root.addEventListener('click', function (e) { if (e.target === root) close(); });

    var form = root.querySelector('form'), btn = form.querySelector('.so-lm__btn');
    function note(t, kind) { var n = form.querySelector('.so-lm__note'); if (!n) { n = document.createElement('p'); n.className = 'so-lm__note'; form.appendChild(n); } n.textContent = t; n.setAttribute('data-kind', kind); }
    form.addEventListener('submit', function (e) {
      e.preventDefault(); e.stopPropagation();
      var site = form.site.value.trim(), phone = form.phone.value.trim();
      if (!site || site.indexOf('.') < 0) { note('Укажите адрес сайта, например site.ru', 'error'); form.site.focus(); return; }
      if (phone.replace(/\D/g, '').length < 10) { note('Укажите номер телефона — на него отправим отчёт.', 'error'); form.phone.focus(); return; }
      if (!form.agree.checked) { note('Поставьте галочку согласия на обработку данных — без неё отправить не можем.', 'error'); form.agree.focus(); return; }
      btn.disabled = true; var t0 = btn.textContent; btn.textContent = 'Отправляем…';
      fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
        form: 'Лид-магнит: бесплатный технический и SEO-аудит', page: location.pathname,
        fields: [{ label: 'Сайт для аудита', value: site }, { label: 'Телефон для отчёта', value: phone }, { label: 'Согласие на обработку ПД', value: 'да' }], _trap: form._trap.value }) })
        .then(function (r) { return r.json().catch(function () { return { ok: r.ok }; }); })
        .then(function (res) {
          if (res && res.ok) {
            save({ done: 1 });
            root.querySelector('.so-lm__box').innerHTML = '<button type="button" class="so-lm__x" aria-label="Закрыть">&times;</button><span class="so-lm__tag">Готово</span><h3 class="so-lm__h">Заявка на бесплатный аудит принята</h3><p class="so-lm__p">Посмотрим <b>' + esc(site) + '</b> и пришлём отчёт на номер <b>' + esc(phone) + '</b> в течение 1–2 рабочих дней.</p>';
            root.querySelector('.so-lm__x').addEventListener('click', close);
          } else { note((res && res.error) || 'Не получилось отправить. Напишите нам на странице контактов.', 'error'); btn.disabled = false; btn.textContent = t0; }
        })
        .catch(function () { note('Пропала связь — попробуйте ещё раз.', 'error'); btn.disabled = false; btn.textContent = t0; });
    });
  }

  var timer = setTimeout(show, DELAY);
  if (location.hash === '#audit') { clearTimeout(timer); (document.readyState === 'loading') ? document.addEventListener('DOMContentLoaded', show) : show(); }
})();
