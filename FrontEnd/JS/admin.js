/* ── VoteSync Admin JS ── */

// ── GUARD: bloquear acesso a não-admins ───────────────────────────────────────
(function adminGuard() {
    const SESSION_KEY = "votesync.session";
    try {
        const raw     = localStorage.getItem(SESSION_KEY);
        const session = raw ? JSON.parse(raw) : null;
        if (!session || !session.user || session.user.is_admin !== true) {
            // Sem sessão ou não é admin → volta para o login
            window.location.replace("./login.html");
        }
    } catch {
        window.location.replace("./login.html");
    }
})();

// ── DATA ──────────────────────────────────────────────────────────────────
const USERS = [
  { id: 1, name: 'Ana Martins',    email: 'ana@example.com',    role: 'admin',  status: 'active',   joined: '12/01/2025' },
  { id: 2, name: 'Rui Silva',      email: 'rui@example.com',    role: 'user',   status: 'active',   joined: '03/03/2025' },
  { id: 3, name: 'Carla Fonseca',  email: 'carla@example.com',  role: 'user',   status: 'inactive', joined: '18/05/2025' },
  { id: 4, name: 'João Pereira',   email: 'joao@example.com',   role: 'user',   status: 'active',   joined: '22/08/2025' },
  { id: 5, name: 'Sofia Lopes',    email: 'sofia@example.com',  role: 'admin',  status: 'active',   joined: '01/11/2025' },
  { id: 6, name: 'Miguel Costa',   email: 'miguel@example.com', role: 'user',   status: 'active',   joined: '14/01/2026' },
  { id: 7, name: 'Beatriz Nunes',  email: 'beatriz@example.com',role: 'user',   status: 'inactive', joined: '08/02/2026' },
  { id: 8, name: 'Tiago Alves',    email: 'tiago@example.com',  role: 'user',   status: 'active',   joined: '27/03/2026' },
];

const DECISIONS = [
  { id: 1, title: 'Destino de férias',  options: 2, status: 'New',       deadline: null,       createdBy: 'Ana Martins'  },
  { id: 2, title: 'Jantar de equipa',   options: 4, status: 'Finishing', deadline: '11/06/2026', createdBy: 'Rui Silva'  },
  { id: 3, title: 'Tema do escritório', options: 3, status: 'Closed',    deadline: '01/05/2026', createdBy: 'Sofia Lopes' },
  { id: 4, title: 'Plano de formação',  options: 2, status: 'New',       deadline: null,       createdBy: 'João Pereira' },
  { id: 5, title: 'Nome do projeto',    options: 5, status: 'Finishing', deadline: '15/06/2026', createdBy: 'Miguel Costa' },
];

// ── NAV ──────────────────────────────────────────────────────────────────
const navItems = document.querySelectorAll('.nav-item');
const sections = document.querySelectorAll('.section');

navItems.forEach(item => {
  item.addEventListener('click', e => {
    e.preventDefault();
    const target = item.dataset.section;
    navItems.forEach(n => n.classList.remove('active'));
    item.classList.add('active');
    sections.forEach(s => s.classList.add('hidden'));
    document.getElementById(`section-${target}`)?.classList.remove('hidden');
  });
});

// ── TOAST ─────────────────────────────────────────────────────────────────
function showToast(msg, type = '') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span> ${msg}`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3100);
}

// ── MODAL ─────────────────────────────────────────────────────────────────
const overlay  = document.getElementById('modalOverlay');
const modalTitle = document.getElementById('modalTitle');
const modalBody  = document.getElementById('modalBody');

function openModal(title, bodyHTML) {
  modalTitle.textContent = title;
  modalBody.innerHTML = bodyHTML;
  overlay.classList.remove('hidden');
}
function closeModal() { overlay.classList.add('hidden'); }

document.getElementById('modalClose').addEventListener('click', closeModal);
overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });

// ── USERS TABLE ──────────────────────────────────────────────────────────
let usersData = [...USERS];
const PAGE_SIZE = 5;
let currentPage = 1;

function initials(name) { return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase(); }

function statusBadge(status) {
  return `<span class="badge badge-${status}">${status === 'active' ? 'Ativo' : 'Inativo'}</span>`;
}
function roleBadge(role) {
  return `<span class="badge badge-${role}">${role === 'admin' ? 'Admin' : 'Utilizador'}</span>`;
}

function renderUsers() {
  const search = document.getElementById('userSearch')?.value.toLowerCase() || '';
  const roleF  = document.getElementById('userRoleFilter')?.value || '';
  const statusF = document.getElementById('userStatusFilter')?.value || '';

  let filtered = usersData.filter(u => {
    return (!search || u.name.toLowerCase().includes(search) || u.email.toLowerCase().includes(search))
      && (!roleF || u.role === roleF)
      && (!statusF || u.status === statusF);
  });

  const total = filtered.length;
  const pages = Math.ceil(total / PAGE_SIZE);
  if (currentPage > pages) currentPage = 1;

  const slice = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const tbody = document.getElementById('usersBody');
  tbody.innerHTML = slice.length === 0
    ? `<tr><td colspan="6" style="text-align:center;padding:30px;color:var(--text-light)">Nenhum utilizador encontrado.</td></tr>`
    : slice.map(u => `
      <tr>
        <td>
          <div class="user-cell">
            <div class="user-avatar">${initials(u.name)}</div>
            <strong>${u.name}</strong>
          </div>
        </td>
        <td>${u.email}</td>
        <td>${roleBadge(u.role)}</td>
        <td>${statusBadge(u.status)}</td>
        <td>${u.joined}</td>
        <td>
          <div class="action-btns">
            <button class="btn-sm" onclick="editUser(${u.id})">Editar</button>
            <button class="btn-sm danger" onclick="deleteUser(${u.id})">Remover</button>
          </div>
        </td>
      </tr>`).join('');

  // Pagination
  const pag = document.getElementById('usersPagination');
  pag.innerHTML = '';
  for (let i = 1; i <= pages; i++) {
    const btn = document.createElement('button');
    btn.className = 'page-btn' + (i === currentPage ? ' active' : '');
    btn.textContent = i;
    btn.onclick = () => { currentPage = i; renderUsers(); };
    pag.appendChild(btn);
  }
}

window.editUser = function(id) {
  const u = usersData.find(x => x.id === id);
  if (!u) return;
  openModal(`Editar utilizador — ${u.name}`, `
    <div class="form-group"><label class="form-label">Nome</label>
      <input class="form-input" id="editName" value="${u.name}" /></div>
    <div class="form-group"><label class="form-label">Email</label>
      <input class="form-input" id="editEmail" value="${u.email}" /></div>
    <div class="form-group"><label class="form-label">Papel</label>
      <select class="form-input" id="editRole">
        <option value="user" ${u.role==='user'?'selected':''}>Utilizador</option>
        <option value="admin" ${u.role==='admin'?'selected':''}>Admin</option>
      </select></div>
    <div class="form-group"><label class="form-label">Estado</label>
      <select class="form-input" id="editStatus">
        <option value="active" ${u.status==='active'?'selected':''}>Ativo</option>
        <option value="inactive" ${u.status==='inactive'?'selected':''}>Inativo</option>
      </select></div>
    <button class="btn-primary" onclick="saveUser(${id})">Guardar</button>
  `);
};

window.saveUser = function(id) {
  const u = usersData.find(x => x.id === id);
  if (!u) return;
  u.name   = document.getElementById('editName').value;
  u.email  = document.getElementById('editEmail').value;
  u.role   = document.getElementById('editRole').value;
  u.status = document.getElementById('editStatus').value;
  closeModal();
  renderUsers();
  showToast('Utilizador atualizado.', 'success');
};

window.deleteUser = function(id) {
  const u = usersData.find(x => x.id === id);
  if (!u) return;
  openModal('Confirmar remoção', `
    <p style="margin-bottom:18px;color:var(--text-mid)">Tem a certeza que pretende remover <strong>${u.name}</strong>? Esta ação não pode ser desfeita.</p>
    <div style="display:flex;gap:10px">
      <button class="btn-primary" style="background:linear-gradient(135deg,#c0392b,#e74c3c)"
        onclick="confirmDelete(${id})">Remover</button>
      <button class="btn-logout" onclick="closeModal()">Cancelar</button>
    </div>
  `);
};

window.confirmDelete = function(id) {
  usersData = usersData.filter(x => x.id !== id);
  closeModal();
  renderUsers();
  showToast('Utilizador removido.', 'error');
};

document.getElementById('addUserBtn')?.addEventListener('click', () => {
  openModal('Novo utilizador', `
    <div class="form-group"><label class="form-label">Nome</label><input class="form-input" id="newName" placeholder="Nome completo" /></div>
    <div class="form-group"><label class="form-label">Email</label><input class="form-input" id="newEmail" type="email" placeholder="email@exemplo.com" /></div>
    <div class="form-group"><label class="form-label">Papel</label>
      <select class="form-input" id="newRole">
        <option value="user">Utilizador</option><option value="admin">Admin</option>
      </select></div>
    <button class="btn-primary" onclick="addUser()">Criar</button>
  `);
});

window.addUser = function() {
  const name  = document.getElementById('newName').value.trim();
  const email = document.getElementById('newEmail').value.trim();
  const role  = document.getElementById('newRole').value;
  if (!name || !email) { showToast('Preencha o nome e email.', 'error'); return; }
  const today = new Date().toLocaleDateString('pt-PT');
  usersData.push({ id: Date.now(), name, email, role, status: 'active', joined: today });
  closeModal();
  renderUsers();
  showToast('Utilizador criado.', 'success');
};

['userSearch', 'userRoleFilter', 'userStatusFilter'].forEach(id => {
  document.getElementById(id)?.addEventListener('input', () => { currentPage = 1; renderUsers(); });
  document.getElementById(id)?.addEventListener('change', () => { currentPage = 1; renderUsers(); });
});

// ── DECISIONS ─────────────────────────────────────────────────────────────
function statusBadgeDecision(s) {
  const map = { New: 'badge-new', Finishing: 'badge-finishing', Closed: 'badge-closed' };
  return `<span class="badge ${map[s] || ''}">${s}</span>`;
}

function renderDecisions() {
  const filter = document.getElementById('decisionStatusFilter')?.value || '';
  const filtered = DECISIONS.filter(d => !filter || d.status === filter);
  document.getElementById('decisionCount').textContent = `${filtered.length} decisão(ões) encontrada(s)`;

  const grid = document.getElementById('decisionsGrid');
  grid.innerHTML = filtered.length === 0
    ? `<p class="empty-state" style="grid-column:1/-1">Nenhuma decisão encontrada.</p>`
    : filtered.map(d => `
      <div class="decision-card">
        <div class="decision-card-header">
          <span>Estado:</span>
          ${statusBadgeDecision(d.status)}
        </div>
        <div class="decision-inner">
          <div class="decision-options">${d.options} opções prontas para votação.</div>
          <div class="decision-title">${d.title}</div>
          ${d.deadline ? `<div class="decision-deadline">⏰ Termina hoje · Prazo final: ${d.deadline}</div>` : ''}
        </div>
        <div style="font-size:11px;color:var(--text-light);margin-bottom:10px">Criado por: <strong>${d.createdBy}</strong></div>
        <button class="decision-view-btn">Ver mais →</button>
      </div>`).join('');
}

document.getElementById('decisionStatusFilter')?.addEventListener('change', renderDecisions);

// ── QUICK ACTIONS ─────────────────────────────────────────────────────────
document.getElementById('qaNewUser')?.addEventListener('click', () => {
  navItems.forEach(n => n.classList.remove('active'));
  document.querySelector('[data-section="users"]')?.classList.add('active');
  sections.forEach(s => s.classList.add('hidden'));
  document.getElementById('section-users')?.classList.remove('hidden');
  document.getElementById('addUserBtn')?.click();
});

document.getElementById('qaNewDecision')?.addEventListener('click', () => {
  showToast('Função em desenvolvimento.', '');
});
document.getElementById('qaNewGroup')?.addEventListener('click', () => {
  navItems.forEach(n => n.classList.remove('active'));
  document.querySelector('[data-section="groups"]')?.classList.add('active');
  sections.forEach(s => s.classList.add('hidden'));
  document.getElementById('section-groups')?.classList.remove('hidden');
});
document.getElementById('qaExport')?.addEventListener('click', () => {
  const csv = ['Nome,Email,Papel,Estado,Registado em',
    ...usersData.map(u => `${u.name},${u.email},${u.role},${u.status},${u.joined}`)].join('\n');
  const a = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })),
    download: 'votesync-usuarios.csv'
  });
  a.click();
  showToast('Dados exportados.', 'success');
});

// ── NAVBAR ────────────────────────────────────────────────────────────────
document.getElementById('logoutBtn')?.addEventListener('click', () => {
  localStorage.removeItem('votesync.session');
  showToast('Sessão terminada. Até logo!', '');
  setTimeout(() => { window.location.href = './login.html'; }, 1200);
});
document.getElementById('notifBtn')?.addEventListener('click', () => {
  showToast('Sem novas notificações.', '');
});
document.getElementById('globalSearch')?.addEventListener('input', e => {
  const val = e.target.value.trim();
  if (val.length > 1) showToast(`A pesquisar por "${val}"…`, '');
});

// ── SETTINGS ──────────────────────────────────────────────────────────────
document.getElementById('saveSettings')?.addEventListener('click', () => {
  showToast('Configurações guardadas.', 'success');
});

// ── INIT ──────────────────────────────────────────────────────────────────
renderUsers();
renderDecisions();