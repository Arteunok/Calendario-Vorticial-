/*
  Calendario Vorticial - Prototipo estático
  - Render radial SVG con D3
  - Edición básica con persistencia en localStorage
*/

(function () {
  const STORAGE_KEY = 'vortexPlanner.v1';

  const CATEGORY_LIST = [
    { id: 'arte1k', name: 'ARTE1K', color: '#f4d900' },
    { id: 'cartagena', name: 'CARTAGENA', color: '#6b21a8' },
    { id: 'disenog', name: 'DISEÑO G', color: '#16a34a' },
    { id: 'frases', name: 'FRASES', color: '#14b8a6' },
    { id: 'personal', name: 'PERSONAL', color: '#f59e0b' },
    { id: 'graffiti', name: 'GRAFFITI', color: '#ef4444' },
    { id: 'material', name: 'MATERIALIZACION GEOMETRIA', color: '#111827' },
    { id: 'internacional', name: 'INTERNACIONAL', color: '#ec4899' },
    { id: 'repost', name: 'REPOST/CONEXIONES CAPTAGENA', color: '#3b82f6' }
  ];

  const MEDIA_TYPES = [
    { id: 0, key: 'video', label: 'Video', letter: 'V' },
    { id: 1, key: 'foto', label: 'Foto', letter: 'F' },
    { id: 2, key: 'digital', label: 'Digital', letter: 'D' }
  ];

  const DEFAULT_WEEKS = 9;
  const DAYS_PER_WEEK = 7; // L-D
  const SLOTS_PER_DAY = 3; // video, foto, digital

  const $ = (sel) => document.querySelector(sel);

  const state = {
    cycle: null,
    selectedPostId: null
  };

  // Utilidades de fecha
  function toDateInputValue(date) {
    const pad = (v) => String(v).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }
  function fromDateInputValue(v) { return new Date(v + 'T00:00:00'); }
  function startOfWeekMonday(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const day = (d.getUTCDay() + 6) % 7; // 0=Lunes
    d.setUTCDate(d.getUTCDate() - day);
    return new Date(d);
  }
  function addDays(date, delta) {
    const d = new Date(date);
    d.setDate(d.getDate() + delta);
    return d;
  }
  function atSlotTime(date, slotIndex) {
    const d = new Date(date);
    // slots en 09:00, 13:00, 19:00
    const hours = [9, 13, 19][slotIndex] || 9;
    d.setHours(hours, 0, 0, 0);
    return d;
  }

  // Persistencia
  function loadState() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  }
  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.cycle));
  }

  // Generador de ciclo
  function generateCycle(startDate, weeks = DEFAULT_WEEKS) {
    const posts = [];
    const start = startOfWeekMonday(startDate);
    for (let w = 0; w < weeks; w++) {
      for (let d = 0; d < DAYS_PER_WEEK; d++) {
        for (let s = 0; s < SLOTS_PER_DAY; s++) {
          const date = addDays(start, w * DAYS_PER_WEEK + d);
          const when = atSlotTime(date, s);
          const category = CATEGORY_LIST[(d + w + s) % CATEGORY_LIST.length];
          posts.push({
            id: `${w + 1}-${d + 1}-${s}`,
            week: w + 1,
            day: d + 1,
            slot: s,
            mediaType: MEDIA_TYPES[s].key,
            dateTime: when.toISOString(),
            categoryId: category.id,
            title: '',
            caption: '',
            status: 'idea'
          });
        }
      }
    }
    return {
      id: `cycle-${Date.now()}`,
      startDate: start.toISOString(),
      weeks,
      posts
    };
  }

  // Dibujo con D3
  const chartEl = d3.select('#chart');
  const width = 900; const height = 900;
  const svg = chartEl.append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('aria-hidden', 'false');

  const cx = width / 2; const cy = height / 2;
  const outerRadius = Math.min(width, height) / 2 - 30;
  const innerRadius = 90;
  const ringWidth = (outerRadius - innerRadius) / DEFAULT_WEEKS;

  const rootG = svg.append('g').attr('transform', `translate(${cx},${cy})`);

  function drawStaticGuides() {
    // círculos de semanas
    for (let i = 0; i <= DEFAULT_WEEKS; i++) {
      const r = innerRadius + i * ringWidth;
      rootG.append('circle').attr('class', 'week-circle').attr('r', r);
    }
    // líneas de días (7)
    for (let d = 0; d < DAYS_PER_WEEK; d++) {
      const a = ((d / DAYS_PER_WEEK) * Math.PI * 2) - Math.PI / 2; // comienza arriba
      const x1 = Math.cos(a) * innerRadius;
      const y1 = Math.sin(a) * innerRadius;
      const x2 = Math.cos(a) * outerRadius;
      const y2 = Math.sin(a) * outerRadius;
      rootG.append('line').attr('class', 'line').attr('x1', x1).attr('y1', y1).attr('x2', x2).attr('y2', y2);
    }
    // etiquetas de semana
    const weekLabels = rootG.append('g');
    for (let w = 0; w < DEFAULT_WEEKS; w++) {
      weekLabels.append('text')
        .attr('x', 0).attr('y', - (innerRadius + w * ringWidth + ringWidth - 4))
        .attr('fill', '#7a89b6')
        .attr('text-anchor', 'middle')
        .attr('font-size', 10)
        .text(`SEMANA ${w + 1}`);
    }
  }

  function getCategoryById(id) { return CATEGORY_LIST.find((c) => c.id === id) || CATEGORY_LIST[0]; }

  function positionFor(post) {
    const angle = (((post.day - 1) + 0.5) / DAYS_PER_WEEK) * Math.PI * 2 - Math.PI / 2;
    const inner = innerRadius + (post.week - 1) * ringWidth;
    const r = inner + ((post.slot + 0.5) * ringWidth) / SLOTS_PER_DAY;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    return { x, y };
  }

  const postsLayer = rootG.append('g').attr('class', 'posts');

  function renderPosts() {
    const radius = Math.max(6, Math.min(14, ringWidth / 4));
    const selection = postsLayer.selectAll('g.post').data(state.cycle.posts, (d) => d.id);

    const enter = selection.enter().append('g').attr('class', 'post');
    enter.append('circle').attr('class', 'post-circle');
    enter.append('text').attr('class', 'post-label');

    const merged = enter.merge(selection);

    merged
      .attr('transform', (d) => {
        const p = positionFor(d);
        return `translate(${p.x},${p.y})`;
      })
      .on('click', (_, d) => selectPost(d.id));

    merged.select('circle.post-circle')
      .attr('r', radius)
      .attr('fill', (d) => getCategoryById(d.categoryId).color)
      .classed('selected', (d) => d.id === state.selectedPostId);

    merged.select('text.post-label')
      .text((d) => MEDIA_TYPES[d.slot].letter)
      .attr('fill', (d) => d.slot === 1 && getCategoryById(d.categoryId).color === '#f4d900' ? '#111' : '#fff');

    selection.exit().remove();
  }

  function refresh() {
    // redibuja selección para aplicar clase selected
    postsLayer.selectAll('circle.post-circle')
      .classed('selected', (d) => d.id === state.selectedPostId);
  }

  // Editor lateral
  const editForm = $('#editForm');
  const emptySelection = $('#emptySelection');
  const sel = {
    id: $('#postId'),
    date: $('#postDate'),
    week: $('#postWeek'),
    day: $('#postDay'),
    slot: $('#postSlot'),
    category: $('#postCategory'),
    title: $('#postTitle'),
    caption: $('#postCaption'),
    status: $('#postStatus')
  };

  function populateCategorySelect() {
    sel.category.innerHTML = CATEGORY_LIST
      .map((c) => `<option value="${c.id}">${c.name}</option>`) 
      .join('');
  }

  function selectPost(postId) {
    state.selectedPostId = postId;
    const post = state.cycle.posts.find((p) => p.id === postId);
    if (!post) return;
    emptySelection.classList.add('hidden');
    editForm.classList.remove('hidden');

    sel.id.value = post.id;
    sel.date.value = new Date(post.dateTime).toISOString().slice(0,16);
    sel.week.value = post.week;
    sel.day.value = post.day;
    sel.slot.value = String(post.slot);
    sel.category.value = post.categoryId;
    sel.title.value = post.title || '';
    sel.caption.value = post.caption || '';
    sel.status.value = post.status || 'idea';

    refresh();
  }

  function saveFromEditor() {
    const id = sel.id.value;
    const post = state.cycle.posts.find((p) => p.id === id);
    if (!post) return;
    post.dateTime = new Date(sel.date.value).toISOString();
    post.week = Number(sel.week.value);
    post.day = Number(sel.day.value);
    post.slot = Number(sel.slot.value);
    post.categoryId = sel.category.value;
    post.title = sel.title.value;
    post.caption = sel.caption.value;
    post.status = sel.status.value;
    saveState();
    renderPosts();
    refresh();
  }

  function clearPost() {
    const id = sel.id.value;
    const post = state.cycle.posts.find((p) => p.id === id);
    if (!post) return;
    post.title = '';
    post.caption = '';
    post.status = 'idea';
    saveState();
    renderPosts();
  }

  // Controles superiores
  function initControls() {
    // fecha de inicio (lunes)
    const now = new Date();
    const start = startOfWeekMonday(now);
    $('#startDate').value = toDateInputValue(start);

    $('#btnGenerate').addEventListener('click', () => {
      const startInput = fromDateInputValue($('#startDate').value);
      state.cycle = generateCycle(startInput, DEFAULT_WEEKS);
      state.selectedPostId = null;
      saveState();
      chartEl.selectAll('*').remove();
      drawAll();
    });

    $('#btnReset').addEventListener('click', () => {
      localStorage.removeItem(STORAGE_KEY);
      location.reload();
    });

    $('#btnExport').addEventListener('click', () => {
      const blob = new Blob([JSON.stringify(state.cycle, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `cycle-export-${new Date().toISOString().slice(0,10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });

    $('#fileImport').addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result);
          if (!data.posts || !Array.isArray(data.posts)) throw new Error('Formato inválido');
          state.cycle = data;
          saveState();
          chartEl.selectAll('*').remove();
          drawAll();
        } catch (err) {
          alert('No se pudo importar: ' + err.message);
        }
      };
      reader.readAsText(file);
    });
  }

  function drawAll() {
    // reconstruir capas
    svg.selectAll('*').remove();
    const g = svg.append('g').attr('transform', `translate(${cx},${cy})`);
    // re-crear guías
    for (let i = 0; i <= DEFAULT_WEEKS; i++) {
      const r = innerRadius + i * ringWidth;
      g.append('circle').attr('class', 'week-circle').attr('r', r);
    }
    for (let d = 0; d < DAYS_PER_WEEK; d++) {
      const a = ((d / DAYS_PER_WEEK) * Math.PI * 2) - Math.PI / 2;
      const x1 = Math.cos(a) * innerRadius;
      const y1 = Math.sin(a) * innerRadius;
      const x2 = Math.cos(a) * outerRadius;
      const y2 = Math.sin(a) * outerRadius;
      g.append('line').attr('class', 'line').attr('x1', x1).attr('y1', y1).attr('x2', x2).attr('y2', y2);
    }
    g.append(() => postsLayer.node());
    renderPosts();
  }

  // Eventos del editor
  $('#btnSave').addEventListener('click', saveFromEditor);
  $('#btnDelete').addEventListener('click', clearPost);

  // Leyenda de categorías
  function renderLegend() {
    const legend = d3.select('#legend');
    legend.selectAll('*').remove();
    CATEGORY_LIST.forEach((c) => {
      const sw = document.createElement('div');
      sw.className = 'swatch';
      sw.style.background = c.color;
      legend.append(() => sw);
      const label = document.createElement('div');
      label.textContent = c.name;
      legend.append(() => label);
    });
  }

  // Inicializa
  function init() {
    populateCategorySelect();
    renderLegend();
    initControls();

    const loaded = loadState();
    if (loaded) {
      state.cycle = loaded;
    } else {
      const start = startOfWeekMonday(new Date());
      state.cycle = generateCycle(start, DEFAULT_WEEKS);
      saveState();
    }

    drawStaticGuides();
    renderPosts();
  }

  init();
})();
