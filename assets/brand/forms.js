/* Формы «Своя орбита»: перехватываем отправку и шлём на /form.php.
   Разметка форм осталась от WordPress, поэтому поля читаем по подписям, а не по именам. */
(function () {
  'use strict';

  var ENDPOINT = '/form.php';

  function labelOf(field) {
    var l = field.querySelector('.gform-field-label__text, .gfield_label, legend, label');
    var t = l ? (l.textContent || '') : '';
    t = t.replace(/\*/g, '').replace(/\s+/g, ' ').trim();
    return t;
  }

  function isHoneypot(field) {
    return /honeypot/i.test(field.className || '');
  }

  function controls(field) {
    return Array.prototype.slice.call(field.querySelectorAll('input, textarea, select'))
      .filter(function (c) {
        var t = (c.type || '').toLowerCase();
        return t !== 'hidden' && t !== 'submit' && t !== 'button' && !c.disabled;
      });
  }

  function valueOf(c) {
    var t = (c.type || '').toLowerCase();
    if (t === 'checkbox') return c.checked ? (c.getAttribute('data-label') || 'да') : '';
    if (t === 'radio') return c.checked ? c.value : '';
    if (c.tagName === 'SELECT') {
      var o = c.options[c.selectedIndex];
      if (!o) return '';
      // первая строка списка — подсказка вроде «Бюджет *», это не ответ
      if (c.selectedIndex === 0 && (!o.value || /\*/.test(o.textContent || ''))) return '';
      return (o.textContent || o.value || '').trim();
    }
    return (c.value || '').trim();
  }

  function subLabel(c) {
    if (c.placeholder) return c.placeholder.replace(/\*/g, '').trim();
    if (c.id) {
      var l = document.querySelector('label[for="' + c.id + '"]');
      if (l) return (l.textContent || '').replace(/\*/g, '').trim();
    }
    return '';
  }

  function setNote(form, text, kind) {
    var note = form.querySelector('.so-form-note');
    if (!note) {
      note = document.createElement('div');
      note.className = 'so-form-note';
      form.appendChild(note);
    }
    note.textContent = text;
    note.setAttribute('data-kind', kind);
    note.setAttribute('role', kind === 'error' ? 'alert' : 'status');
    return note;
  }

  // Цель «заявка» в Яндекс.Метрике. Номер счётчика приходит из site.json
  // через window.SO_METRIKA (см. функцию metrika в build/build.mjs).
  // Нет счётчика или Метрика заблокирована у посетителя — молча пропускаем.
  function reachGoal(payload) {
    try {
      if (!window.SO_METRIKA || typeof window.ym !== 'function') return;
      window.ym(window.SO_METRIKA, 'reachGoal', 'zayavka', {
        forma: payload.form,
        stranica: payload.page,
      });
    } catch (err) {}
  }

  function collect(form) {
    var out = [], trap = '', bad = null;
    var fields = form.querySelectorAll('.gfield, fieldset.gfield');
    var list = fields.length ? fields : [form];
    Array.prototype.forEach.call(list, function (field) {
      var cs = controls(field);
      if (!cs.length) return;
      if (isHoneypot(field)) { trap = valueOf(cs[0]); return; }
      var label = labelOf(field) || 'Поле';
      cs.forEach(function (c) {
        var v = valueOf(c);
        var required = c.getAttribute('aria-required') === 'true' || c.required;
        var t = (c.type || '').toLowerCase();
        if (required && !v) { if (!bad) bad = c; return; }
        if (!v) return;
        if (t === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) { if (!bad) bad = c; return; }
        if (t === 'tel' && (v.replace(/\D/g, '').length < 10)) { if (!bad) bad = c; return; }
        var sub = cs.length > 1 ? subLabel(c) : '';
        out.push({ label: sub || label, value: v });
      });
    });
    return { fields: out, trap: trap, bad: bad };
  }

  function handle(form) {
    if (form.getAttribute('data-so-bound')) return;
    form.setAttribute('data-so-bound', '1');
    form.setAttribute('novalidate', 'novalidate');
    form.removeAttribute('target');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      e.stopPropagation();

      var data = collect(form);
      if (data.bad) {
        setNote(form, 'Проверьте, пожалуйста, обязательные поля — что-то не заполнено или заполнено с ошибкой.', 'error');
        try { data.bad.focus(); } catch (err) {}
        return;
      }
      if (!data.fields.length) {
        setNote(form, 'Форма пустая — расскажите хотя бы в двух словах, что нужно.', 'error');
        return;
      }

      var btn = form.querySelector('input[type="submit"], button[type="submit"], .gform_button');
      var btnText = btn ? (btn.value || btn.textContent) : '';
      if (btn) { btn.disabled = true; if (btn.value) btn.value = 'Отправляем…'; else btn.textContent = 'Отправляем…'; }
      setNote(form, 'Отправляем…', 'pending');

      var payload = {
        form: (form.getAttribute('aria-label') || document.title || 'Форма сайта').slice(0, 120),
        page: location.pathname,
        fields: data.fields,
        _trap: data.trap,
      };

      fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then(function (r) { return r.json().catch(function () { return { ok: r.ok }; }); })
        .then(function (res) {
          if (res && res.ok) {
            setNote(form, 'Заявка ушла. Ответим в течение рабочего дня — на почту или по телефону, как вам удобнее.', 'ok');
            reachGoal(payload);
            form.reset();
          } else {
            setNote(form, (res && res.error) || 'Не получилось отправить. Позвоните нам или напишите в мессенджер — так быстрее.', 'error');
          }
        })
        .catch(function () {
          setNote(form, 'Не получилось отправить — похоже, пропала связь. Попробуйте ещё раз или позвоните нам.', 'error');
        })
        .then(function () {
          if (btn) { btn.disabled = false; if (btn.value) btn.value = btnText; else btn.textContent = btnText; }
        });
    }, true);
  }

  function init() {
    Array.prototype.forEach.call(document.querySelectorAll('form'), function (f) {
      if (f.getAttribute('data-so-skip') !== null) return;
      handle(f);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
