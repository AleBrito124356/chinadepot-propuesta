/* ═══════════════════════════════════════════════════════════════
   CHINA DEPOT — main.js
   Buscador vivo · filtros por categoría · reveals · videos lazy
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var modoFoto = location.search.indexOf('foto') !== -1;
  if (modoFoto) {
    document.body.classList.add('sin-gsap');
    var mY = location.search.match(/y=(\d+)/);
    if (mY) { document.body.style.marginTop = '-' + parseInt(mY[1], 10) + 'px'; }
  }
  var productos = Array.prototype.slice.call(document.querySelectorAll('.producto'));
  var chips = Array.prototype.slice.call(document.querySelectorAll('.chip'));
  var sinResultados = document.getElementById('sin-resultados');
  var busca = document.getElementById('busca');

  var estado = { cat: 'todos', texto: '' };

  /* ── Altura real del header → la cinta de chips se pega justo debajo ── */
  var topbar = document.getElementById('topbar');
  function mideTopbar() {
    document.documentElement.style.setProperty('--topbar-h', topbar.offsetHeight + 'px');
  }
  mideTopbar();
  window.addEventListener('resize', mideTopbar);
  if (document.fonts && document.fonts.ready) { document.fonts.ready.then(mideTopbar); }
  window.addEventListener('load', mideTopbar);

  /* ─────────────── Normalización (sin acentos) ─────────────── */
  function plano(s) {
    return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  }

  /* ─────────────────────── Filtrado ────────────────────────── */
  function aplicaFiltro() {
    var visibles = 0;
    productos.forEach(function (p) {
      var cats = plano(p.getAttribute('data-cat'));
      var nombre = plano(p.getAttribute('data-nombre') + ' ' + p.textContent);
      var pasaCat = estado.cat === 'todos' || cats.indexOf(estado.cat) !== -1;
      var pasaTexto = !estado.texto || nombre.indexOf(estado.texto) !== -1;
      var visible = pasaCat && pasaTexto;
      p.classList.toggle('oculto', !visible);
      if (visible) visibles++;
    });
    sinResultados.hidden = visibles !== 0;
  }

  function marcaChip(cat) {
    chips.forEach(function (c) { c.classList.toggle('activo', c.getAttribute('data-cat') === cat); });
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      estado.cat = chip.getAttribute('data-cat');
      marcaChip(estado.cat);
      aplicaFiltro();
    });
  });

  /* Tarjetas y mini-botones de categoría también filtran */
  document.querySelectorAll('[data-filtra]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      if (el.tagName === 'A') e.preventDefault();
      estado.cat = el.getAttribute('data-filtra');
      marcaChip(estado.cat);
      aplicaFiltro();
      document.getElementById('novedades').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  });

  if (busca) {
    busca.addEventListener('input', function () {
      estado.texto = plano(busca.value.trim());
      aplicaFiltro();
    });
  }

  /* ───────── Swap pack↔uso también con toque (móvil) ───────── */
  productos.forEach(function (p) {
    p.querySelector('.prod-media').addEventListener('click', function () {
      p.classList.toggle('toca');
    });
  });

  /* ───────────────── Videos: play/pausa lazy ───────────────── */
  var io = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (en) {
      var v = en.target;
      if (en.isIntersecting) { v.play().catch(function () {}); }
      else { v.pause(); }
    });
  }, { rootMargin: '140px 0px' });
  document.querySelectorAll('.lazy-video').forEach(function (v) { io.observe(v); });

  /* ─────────────────── Reveals con GSAP ────────────────────── */
  if (typeof gsap === 'undefined' || reduceMotion || modoFoto) {
    document.body.classList.add('sin-gsap');
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  gsap.to('.reveal', {
    opacity: 1, y: 0, duration: .9, ease: 'power3.out', stagger: .12, delay: .15
  });

  gsap.utils.toArray('.producto, .cat-card, .porque-item, .tienda-media, .tienda-info, .sec-head').forEach(function (el) {
    gsap.from(el, {
      y: 34, opacity: 0, duration: .8, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true }
    });
  });

  /* El título del hero entra con rebote de sticker */
  gsap.from('.hero-titulo .linea', {
    y: 46, opacity: 0, rotate: -2, duration: .9, ease: 'back.out(1.4)', stagger: .14, delay: .1
  });
})();
