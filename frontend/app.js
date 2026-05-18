const API = '/api/productos';

// ── State ──────────────────────────────────────────────
let productos = [];
let editandoId = null;
let currentView = 'grid';

// ── DOM refs ───────────────────────────────────────────
const productsGrid  = document.getElementById('productsGrid');
const productsTable = document.getElementById('productsTable');
const tableBody     = document.getElementById('tableBody');
const searchInput   = document.getElementById('searchInput');
const overlay       = document.getElementById('overlay');
const modalTitle    = document.getElementById('modalTitle');
const btnNuevo      = document.getElementById('btnNuevo');
const btnGuardar    = document.getElementById('btnGuardar');
const btnCancelar   = document.getElementById('btnCancelar');
const modalClose    = document.getElementById('modalClose');
const btnGrid       = document.getElementById('btnGrid');
const btnTable      = document.getElementById('btnTable');
const btnRecargar   = document.getElementById('btnRecargar');
const themeBtn      = document.getElementById('themeBtn');
const menuBtn       = document.getElementById('menuBtn');
const sidebar       = document.getElementById('sidebar');
const lastUpdated   = document.getElementById('lastUpdated');

// ── Theme ──────────────────────────────────────────────
const savedTheme = localStorage.getItem('theme') || 'light';
applyTheme(savedTheme);

themeBtn.addEventListener('click', () => {
  const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  localStorage.setItem('theme', next);
});

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  themeBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
}

// ── Sidebar mobile ─────────────────────────────────────
menuBtn.addEventListener('click', () => sidebar.classList.toggle('open'));

// ── View toggle ────────────────────────────────────────
btnGrid.addEventListener('click',  () => setView('grid'));
btnTable.addEventListener('click', () => setView('table'));

function setView(v) {
  currentView = v;
  btnGrid.classList.toggle('active',  v === 'grid');
  btnTable.classList.toggle('active', v === 'table');
  productsGrid.classList.toggle('hidden',  v !== 'grid');
  productsTable.classList.toggle('hidden', v !== 'table');
  render();
}

// ── Search ─────────────────────────────────────────────
searchInput.addEventListener('input', render);

function filtered() {
  const q = searchInput.value.trim().toLowerCase();
  if (!q) return productos;
  return productos.filter(p =>
    p.nombre.toLowerCase().includes(q) ||
    (p.descripcion || '').toLowerCase().includes(q)
  );
}

// ── Modal ──────────────────────────────────────────────
function openModal(title) {
  modalTitle.textContent = title;
  overlay.classList.add('open');
  document.getElementById('fNombre').focus();
}

function closeModal() {
  overlay.classList.remove('open');
  editandoId = null;
  ['fNombre','fDescripcion','fPrecio','fStock'].forEach(id => {
    document.getElementById(id).value = '';
  });
}

btnNuevo.addEventListener('click',    () => openModal('Nuevo Producto'));
btnCancelar.addEventListener('click', closeModal);
modalClose.addEventListener('click',  closeModal);
overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });

// ── Toast ──────────────────────────────────────────────
const ICONS = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };

function toast(title, msg = '', type = 'success') {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `
    <span class="toast-icon">${ICONS[type] || ICONS.info}</span>
    <div class="toast-body">
      <div class="toast-title">${esc(title)}</div>
      ${msg ? `<div class="toast-msg">${esc(msg)}</div>` : ''}
    </div>
    <button class="toast-x" onclick="this.closest('.toast').remove()">✕</button>
  `;
  document.getElementById('toasts').appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateX(80px)';
    setTimeout(() => el.remove(), 280);
  }, 4200);
}

// ── Helpers ────────────────────────────────────────────
function esc(s) {
  return String(s ?? '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function clp(n) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency', currency: 'CLP', maximumFractionDigits: 0
  }).format(n);
}

function emoji(nombre) {
  const n = (nombre || '').toLowerCase();
  if (n.includes('cachorro') || n.includes('puppy')) return '🐶';
  if (n.includes('snack') || n.includes('dental'))   return '🦷';
  if (n.includes('pollo') || n.includes('chicken'))  return '🍗';
  if (n.includes('light'))   return '⚖️';
  if (n.includes('adulto'))  return '🐕';
  return '🦴';
}

function dotClass(stock) {
  if (stock <= 0) return 'out';
  if (stock < 10) return 'low';
  return '';
}

// ── Stats ──────────────────────────────────────────────
function updateStats() {
  const total   = productos.length;
  const stock   = productos.reduce((s, p) => s + Number(p.stock  || 0), 0);
  const value   = productos.reduce((s, p) => s + Number(p.precio || 0) * Number(p.stock || 0), 0);
  const avg     = total ? productos.reduce((s, p) => s + Number(p.precio || 0), 0) / total : 0;

  countUp('sTotal', total);
  countUp('sStock', stock);
  document.getElementById('sValue').textContent = clp(value);
  document.getElementById('sAvg').textContent   = clp(avg);

  lastUpdated.textContent = `Actualizado: ${new Date().toLocaleTimeString('es-CL')}`;
}

function countUp(id, target) {
  const el    = document.getElementById(id);
  const start = parseInt(el.textContent.replace(/\D/g, '')) || 0;
  const t0    = performance.now();
  const dur   = 500;
  function step(t) {
    const p = Math.min((t - t0) / dur, 1);
    el.textContent = Math.round(start + (target - start) * p);
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// ── Skeleton ───────────────────────────────────────────
function showSkeletons() {
  productsGrid.innerHTML = Array(6).fill(0).map(() => `
    <div class="skel-card">
      <div class="skeleton skel-banner"></div>
      <div class="skel-body">
        <div class="skeleton skel-line" style="width:65%"></div>
        <div class="skeleton skel-line" style="width:90%"></div>
        <div class="skeleton skel-line" style="width:45%"></div>
      </div>
    </div>
  `).join('');
}

// ── Render ─────────────────────────────────────────────
function render() {
  const list = filtered();
  currentView === 'grid' ? renderGrid(list) : renderTable(list);
}

function renderGrid(list) {
  if (!list.length) {
    productsGrid.innerHTML = `
      <div class="empty">
        <div class="empty-icon">${searchInput.value ? '🔍' : '🐕'}</div>
        <h3>${searchInput.value ? 'Sin resultados' : 'No hay productos aún'}</h3>
        <p>${searchInput.value ? 'Intenta con otra búsqueda.' : 'Agrega tu primer producto para comenzar.'}</p>
      </div>`;
    return;
  }
  productsGrid.innerHTML = list.map(p => `
    <div class="product-card">
      <div class="card-banner">
        ${emoji(p.nombre)}
        <span class="card-id">#${p.id}</span>
      </div>
      <div class="card-body">
        <div class="card-name">${esc(p.nombre)}</div>
        <div class="card-desc">${esc(p.descripcion || 'Sin descripción')}</div>
        <div class="card-meta">
          <div class="card-price">${clp(p.precio)}</div>
          <div class="stock-pill">
            <span class="dot ${dotClass(p.stock)}"></span>
            ${p.stock} uds
          </div>
        </div>
        <div class="card-actions">
          <button class="btn btn-ghost btn-sm" onclick="editarProducto(${p.id})">✏️ Editar</button>
          <button class="btn btn-danger btn-sm" onclick="confirmarEliminar(${p.id},'${esc(p.nombre)}')">🗑️ Eliminar</button>
        </div>
      </div>
    </div>
  `).join('');
}

function renderTable(list) {
  if (!list.length) {
    tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted)">
      ${searchInput.value ? 'Sin resultados.' : 'No hay productos.'}
    </td></tr>`;
    return;
  }
  tableBody.innerHTML = list.map(p => `
    <tr>
      <td><b style="color:var(--text-muted)">#${p.id}</b></td>
      <td>
        <span style="display:flex;align-items:center;gap:8px">
          ${emoji(p.nombre)}
          <b>${esc(p.nombre)}</b>
        </span>
      </td>
      <td style="color:var(--text-muted);max-width:200px">${esc(p.descripcion || '—')}</td>
      <td><b style="color:var(--primary)">${clp(p.precio)}</b></td>
      <td>
        <span style="display:flex;align-items:center;gap:6px">
          <span class="dot ${dotClass(p.stock)}"></span>${p.stock}
        </span>
      </td>
      <td>
        <div class="tbl-actions">
          <button class="btn btn-ghost btn-sm" onclick="editarProducto(${p.id})">✏️ Editar</button>
          <button class="btn btn-danger btn-sm" onclick="confirmarEliminar(${p.id},'${esc(p.nombre)}')">🗑️</button>
        </div>
      </td>
    </tr>
  `).join('');
}

// ── API ────────────────────────────────────────────────
async function cargarProductos() {
  showSkeletons();
  try {
    const res = await fetch(API);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    productos = await res.json();
    render();
    updateStats();
  } catch (err) {
    productsGrid.innerHTML = `
      <div class="empty">
        <div class="empty-icon">⚠️</div>
        <h3>Error de conexión</h3>
        <p>${esc(err.message)}</p>
      </div>`;
    toast('Error al cargar', err.message, 'error');
  }
}

async function editarProducto(id) {
  try {
    const res = await fetch(`${API}/${id}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const p = await res.json();
    editandoId = p.id;
    document.getElementById('fNombre').value      = p.nombre || '';
    document.getElementById('fDescripcion').value = p.descripcion || '';
    document.getElementById('fPrecio').value       = p.precio ?? '';
    document.getElementById('fStock').value        = p.stock ?? '';
    openModal(`Editar Producto #${p.id}`);
  } catch (err) {
    toast('Error', 'No se pudo cargar el producto.', 'error');
  }
}

function validar() {
  const nombre = document.getElementById('fNombre').value.trim();
  const precio = document.getElementById('fPrecio').value;
  const stock  = document.getElementById('fStock').value;
  if (!nombre) { toast('Campo requerido', 'El nombre es obligatorio.', 'warning'); return false; }
  if (precio === '' || isNaN(+precio) || +precio < 0) { toast('Precio inválido', 'Ingresa un número >= 0.', 'warning'); return false; }
  if (stock  === '' || isNaN(+stock)  || +stock  < 0) { toast('Stock inválido',  'Ingresa un número >= 0.', 'warning'); return false; }
  return true;
}

async function guardarProducto() {
  if (!validar()) return;
  const data = {
    nombre:      document.getElementById('fNombre').value.trim(),
    descripcion: document.getElementById('fDescripcion').value.trim(),
    precio:      Number(document.getElementById('fPrecio').value),
    stock:       Number(document.getElementById('fStock').value),
  };
  const isEdit = editandoId !== null;
  const url    = isEdit ? `${API}/${editandoId}` : API;
  const method = isEdit ? 'PUT' : 'POST';

  btnGuardar.disabled = true;
  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    closeModal();
    await cargarProductos();
    toast(
      isEdit ? 'Producto actualizado' : 'Producto creado',
      `"${data.nombre}" guardado correctamente.`
    );
  } catch (err) {
    toast('Error al guardar', err.message, 'error');
  } finally {
    btnGuardar.disabled = false;
  }
}

function confirmarEliminar(id, nombre) {
  if (!confirm(`¿Eliminar "${nombre}"?\n\nEsta acción no se puede deshacer.`)) return;
  eliminarProducto(id, nombre);
}

async function eliminarProducto(id, nombre) {
  try {
    const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    await cargarProductos();
    toast('Producto eliminado', `"${nombre}" fue eliminado.`);
  } catch (err) {
    toast('Error al eliminar', err.message, 'error');
  }
}

// ── Init ───────────────────────────────────────────────
btnGuardar.addEventListener('click',  guardarProducto);
btnRecargar.addEventListener('click', cargarProductos);

cargarProductos();
