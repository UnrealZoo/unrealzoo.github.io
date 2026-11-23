/* Scene Gallery — 关键词搜索 + 标签筛选 + 详情弹层 */
(function () {
  var root = document.getElementById('scene-gallery-app');
  if (!root) return;

  var dataUrl = root.getAttribute('data-data');
  var assetBase = root.getAttribute('data-assets') || '../assets/';
  var L = {};

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined && text !== null) e.textContent = text;
    return e;
  }

  function uniq(arr) {
    var out = [];
    (arr || []).forEach(function (x) { if (x && out.indexOf(x) < 0) out.push(x); });
    return out.sort();
  }

  function populate(select, values, label) {
    var opts = ['<option value="">' + label + '</option>'];
    values.forEach(function (v) {
      opts.push('<option value="' + v.replace(/"/g, '&quot;') + '">' + v + '</option>');
    });
    select.innerHTML = opts.join('');
  }

  fetch(dataUrl).then(function (r) { return r.json(); }).then(function (data) {
    L = data.labels || {};
    var scenes = data.scenes || [];

    /* ---- 工具栏 ---- */
    var bar = el('div', 'sg-toolbar');
    var row = el('div', 'sg-search-row');
    var search = el('input', 'sg-search');
    search.type = 'search';
    search.placeholder = L.search || 'Search scenes...';
    row.appendChild(search);
    var clear = el('button', 'sg-btn', L.clear || 'Clear');
    row.appendChild(clear);
    var count = el('span', 'sg-count', '');
    row.appendChild(count);
    bar.appendChild(row);

    var frow = el('div', 'sg-filters');
    var selC = el('select'), selS = el('select'), selSt = el('select'),
        selT = el('select'), selU = el('select');
    populate(selC, uniq(scenes.map(function (s) { return s.cats; }).reduce(function (a, b) { return a.concat(b); }, [])), L.category || 'Category');
    populate(selS, uniq(scenes.map(function (s) { return s.scale; }).reduce(function (a, b) { return a.concat(b); }, [])), L.scale || 'Scale');
    populate(selSt, uniq(scenes.map(function (s) { return s.style; }).reduce(function (a, b) { return a.concat(b); }, [])), L.style || 'Style');
    populate(selT, uniq(scenes.map(function (s) { return s.tasks; }).reduce(function (a, b) { return a.concat(b); }, [])), L.task || 'Task');
    populate(selU, uniq(scenes.map(function (s) { return s.ue; })), L.ue || 'UE');
    [selC, selS, selSt, selT, selU].forEach(function (s) { frow.appendChild(s); });
    bar.appendChild(frow);
    root.appendChild(bar);

    /* ---- 网格 ---- */
    var grid = el('div', 'sg-grid');
    root.appendChild(grid);

    /* ---- 弹层 ---- */
    var modal = el('div', 'sg-modal');
    var box = el('div', 'sg-modal-box');
    modal.appendChild(box);
    document.body.appendChild(modal);
    modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });

    function closeModal() { modal.classList.remove('open'); box.innerHTML = ''; }

    function openDetail(s) {
      box.innerHTML = '';
      var head = el('div', 'sg-modal-head');
      var h3 = el('h3', null, s.name);
      head.appendChild(h3);
      var x = el('button', 'sg-modal-close', '×');
      x.onclick = closeModal;
      head.appendChild(x);
      box.appendChild(head);

      if (s.img) {
        var im = el('img', 'sg-modal-img');
        im.src = assetBase + 'scenes/' + s.img;
        im.alt = s.name;
        box.appendChild(im);
      }
      if (s.videoEmbed) {
        var fr = document.createElement('iframe');
        fr.src = s.videoEmbed;
        fr.loading = 'lazy';
        fr.allowFullscreen = true;
        fr.title = s.name;
        box.appendChild(fr);
      } else if (s.videoLocal) {
        var vd = document.createElement('video');
        vd.src = assetBase + s.videoLocal;
        vd.controls = true;
        vd.loop = true;
        vd.muted = true;
        vd.playsInline = true;
        vd.style.width = '100%';
        vd.style.borderRadius = '8px';
        vd.style.aspectRatio = '16 / 9';
        box.appendChild(vd);
      } else if (s.videoUrl) {
        var a = el('a', null, L.video || 'Demo video');
        a.href = s.videoUrl;
        a.target = '_blank';
        a.rel = 'noopener';
        box.appendChild(a);
      }
      var rows = [
        [L.category || 'Category', (s.cats || []).join(', ')],
        [L.scale || 'Scale', (s.scale || []).join(', ')],
        [L.style || 'Style', (s.style || []).join(', ')],
        [L.dynamics || 'Dynamics', (s.dyn || []).join(', ')],
        [L.agents || 'Agents', (s.agents || []).join(', ')],
        [L.task || 'Tasks', (s.tasks || []).join(', ')],
        [L.ue || 'UE', s.ue]
      ];
      rows.forEach(function (r) {
        if (!r[1]) return;
        var p = el('div', 'sg-modal-kv');
        p.appendChild(el('b', null, r[0] + ':'));
        p.appendChild(document.createTextNode(r[1]));
        box.appendChild(p);
      });
      if (s.cost) {
        var pc = el('div', 'sg-modal-kv');
        pc.appendChild(el('b', null, (L.cost || 'Cost') + ':'));
        pc.appendChild(document.createTextNode(s.cost));
        box.appendChild(pc);
      }
      if (s.note) {
        var pn = el('div', 'sg-modal-kv', s.note);
        box.appendChild(pn);
      }
      var links = el('div', 'sg-modal-kv');
      if (s.source) {
        var l1 = el('a', null, L.marketplace || 'Marketplace');
        l1.href = s.source;
        l1.target = '_blank';
        l1.rel = 'noopener';
        links.appendChild(l1);
        links.appendChild(document.createTextNode(' · '));
      }
      (s.extra || []).forEach(function (u) {
        var l2 = el('a', null, L.link || 'Link');
        l2.href = u;
        l2.target = '_blank';
        l2.rel = 'noopener';
        links.appendChild(l2);
        links.appendChild(document.createTextNode(' · '));
      });
      var l3 = el('a', null, L.table || 'Full attribute table');
      l3.href = s.anchor || '#';
        l3.onclick = function () { closeModal(); };
      links.appendChild(l3);
      box.appendChild(links);
      modal.classList.add('open');
    }

    /* ---- 渲染 ---- */
    function matches(s, q) {
      if (q) {
        var hay = [s.name].concat(s.cats, s.scale, s.style, s.dyn, s.agents, s.tasks, [s.ue], [s.cost])
          .join(' ').toLowerCase();
        if (hay.indexOf(q) < 0) return false;
      }
      if (selC.value && (s.cats || []).indexOf(selC.value) < 0) return false;
      if (selS.value && (s.scale || []).indexOf(selS.value) < 0) return false;
      if (selSt.value && (s.style || []).indexOf(selSt.value) < 0) return false;
      if (selT.value && (s.tasks || []).indexOf(selT.value) < 0) return false;
      if (selU.value && s.ue !== selU.value) return false;
      return true;
    }

    function render() {
      grid.innerHTML = '';
      var q = search.value.trim().toLowerCase();
      var shown = 0;
      scenes.forEach(function (s) {
        if (!matches(s, q)) return;
        shown++;
        var card = el('div', 'sg-card');
        if (s.img) {
          var im = el('img', 'sg-thumb');
          im.src = assetBase + 'scenes/' + s.img;
          im.loading = 'lazy';
          im.alt = s.name;
          im.onclick = function () { openDetail(s); };
          card.appendChild(im);
        } else {
          var ph = el('button', 'sg-noimg', L.noImage || 'No screenshot');
          ph.onclick = function () { openDetail(s); };
          card.appendChild(ph);
        }
        var meta = el('div', 'sg-meta');
        var nm = el('a', 'sg-name', s.name);
        nm.href = '#';
        nm.onclick = function (ev) { ev.preventDefault(); openDetail(s); };
        meta.appendChild(nm);
        var tags = el('div', 'sg-tags');
        (s.cats || []).slice(0, 3).forEach(function (t) { tags.appendChild(el('span', 'sg-tag', t)); });
        if (s.ue && s.ue !== '—') tags.appendChild(el('span', 'sg-tag', s.ue));
        meta.appendChild(tags);
        card.appendChild(meta);
        grid.appendChild(card);
      });
      if (!shown) {
        grid.appendChild(el('div', 'sg-empty', L.noResult || 'No scene matches your filters.'));
      }
      count.textContent = shown + ' / ' + scenes.length;
    }

    search.addEventListener('input', render);
    [selC, selS, selSt, selT, selU].forEach(function (s) { s.addEventListener('change', render); });
    clear.addEventListener('click', function () {
      search.value = '';
      [selC, selS, selSt, selT, selU].forEach(function (s) { s.value = ''; });
      render();
    });
    render();
  }).catch(function (e) {
    root.appendChild(el('div', 'sg-empty', (L.loadError || 'Failed to load gallery data.')));
  });
})();
