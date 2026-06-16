/* ── VoteSync Admin JS — ligado à API real ── */

// ── GUARD ─────────────────────────────────────────────────────────────────────
(function adminGuard() {
  const raw = localStorage.getItem("votesync.session");
  try {
    const session = raw ? JSON.parse(raw) : null;
    if (!session?.user?.is_admin) window.location.replace("./login.html");
  } catch { window.location.replace("./login.html"); }
})();

// ── API ───────────────────────────────────────────────────────────────────────
const API = "http://localhost:8000";

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (res.status === 204) return null;
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Erro na API");
  return data;
}

// ── NAV ───────────────────────────────────────────────────────────────────────
const navItems = document.querySelectorAll(".nav-item");
const sections = document.querySelectorAll(".section");

navItems.forEach((item) => {
  item.addEventListener("click", (e) => {
    e.preventDefault();
    const target = item.dataset.section;
    navItems.forEach((n) => n.classList.remove("active"));
    item.classList.add("active");
    sections.forEach((s) => s.classList.add("hidden"));
    document.getElementById(`section-${target}`)?.classList.remove("hidden");
    if (target === "users")     loadUsers();
    if (target === "decisions") loadDecisions();
    if (target === "groups")    loadGroups();
  });
});

// ── TOAST ─────────────────────────────────────────────────────────────────────
function showToast(msg, type = "") {
  const container = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️"}</span> ${msg}`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3100);
}

// ── MODAL ─────────────────────────────────────────────────────────────────────
const overlay    = document.getElementById("modalOverlay");
const modalTitle = document.getElementById("modalTitle");
const modalBody  = document.getElementById("modalBody");

function openModal(title, bodyHTML) {
  modalTitle.textContent = title;
  modalBody.innerHTML = bodyHTML;
  overlay.classList.remove("hidden");
}
function closeModal() { overlay.classList.add("hidden"); }
document.getElementById("modalClose").addEventListener("click", closeModal);
overlay.addEventListener("click", (e) => { if (e.target === overlay) closeModal(); });

// ── HELPERS ───────────────────────────────────────────────────────────────────
function initials(name) {
  return (name || "?").split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
async function loadDashboard() {
  try {
    const [users, decisions, groups, votes] = await Promise.all([
      apiFetch("/users/"),
      apiFetch("/decisions/"),
      apiFetch("/user-groups/"),
      apiFetch("/votes/"),
    ]);

    // KPIs
    const kpiUsers = document.querySelector(".kpi-users .kpi-value");
    const kpiDec   = document.querySelector(".kpi-decisions .kpi-value");
    const kpiGrp   = document.querySelector(".kpi-groups .kpi-value");
    const kpiVotes = document.querySelector(".kpi-votes .kpi-value");
    if (kpiUsers) kpiUsers.textContent = users.length;
    if (kpiDec)   kpiDec.textContent   = decisions.length;
    if (kpiGrp)   kpiGrp.textContent   = groups.length;
    if (kpiVotes) kpiVotes.textContent  = votes.length;

    // Atividade recente — combina utilizadores e decisões reais
    renderActivity(users, decisions);
  } catch (err) {
    console.warn("Erro no dashboard:", err.message);
  }
}

function renderActivity(users, decisions) {
  const list = document.querySelector(".activity-list");
  if (!list) return;

  const items = [];

  // Últimos 2 utilizadores registados
  users.slice(-2).reverse().forEach((u) => {
    items.push({
      initials: initials(u.name),
      user: u.name,
      action: "registou-se na plataforma",
    });
  });

  // Últimas 2 decisões criadas
  decisions.slice(-2).reverse().forEach((d) => {
    items.push({
      initials: "🗳️",
      user: "Sistema",
      action: `criou a decisão <strong>"${d.title}"</strong>`,
    });
  });

  if (items.length === 0) {
    list.innerHTML = `<li style="color:var(--text-light);font-size:13px">Sem atividade recente.</li>`;
    return;
  }

  list.innerHTML = items.map((i) => `
    <li class="activity-item">
      <span class="activity-avatar">${i.initials}</span>
      <div class="activity-info">
        <span class="activity-user">${i.user}</span>
        <span class="activity-action">${i.action}</span>
      </div>
    </li>`).join("");
}

// ── USERS ─────────────────────────────────────────────────────────────────────
let usersData   = [];
let currentPage = 1;
const PAGE_SIZE = 5;
let usersFilter = { search: "", role: "", status: "" };

async function loadUsers() {
  try {
    usersData = await apiFetch("/users/");
    currentPage = 1;
    renderUsers();
  } catch (err) {
    showToast("Erro ao carregar utilizadores: " + err.message, "error");
  }
}

function renderUsers() {
  const { search } = usersFilter;
  let filtered = usersData.filter((u) =>
    !search || u.name.toLowerCase().includes(search) || u.email.toLowerCase().includes(search)
  );

  const pages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  if (currentPage > pages) currentPage = 1;
  const slice = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const tbody = document.getElementById("usersBody");
  tbody.innerHTML = slice.length === 0
    ? `<tr><td colspan="6" style="text-align:center;padding:30px;color:var(--text-light)">Nenhum utilizador encontrado.</td></tr>`
    : slice.map((u) => `
      <tr>
        <td><div class="user-cell">
          <div class="user-avatar">${initials(u.name)}</div>
          <strong>${u.name}</strong>
        </div></td>
        <td>${u.email}</td>
        <td><span class="badge badge-user">Utilizador</span></td>
        <td><span class="badge badge-active">Ativo</span></td>
        <td>—</td>
        <td><div class="action-btns">
          <button class="btn-sm" onclick="editUser(${u.id})">Editar</button>
          <button class="btn-sm danger" onclick="deleteUser(${u.id})">Remover</button>
        </div></td>
      </tr>`).join("");

  const pag = document.getElementById("usersPagination");
  pag.innerHTML = "";
  for (let i = 1; i <= pages; i++) {
    const btn = document.createElement("button");
    btn.className = "page-btn" + (i === currentPage ? " active" : "");
    btn.textContent = i;
    btn.onclick = () => { currentPage = i; renderUsers(); };
    pag.appendChild(btn);
  }
}

window.editUser = function (id) {
  const u = usersData.find((x) => x.id === id);
  if (!u) return;
  openModal(`Editar utilizador — ${u.name}`, `
    <div class="form-group"><label class="form-label">Nome</label>
      <input class="form-input" id="editName" value="${u.name}" /></div>
    <div class="form-group"><label class="form-label">Email</label>
      <input class="form-input" id="editEmail" value="${u.email}" /></div>
    <div class="form-group"><label class="form-label">Password (deixar vazio para não alterar)</label>
      <input class="form-input" id="editPassword" type="password" placeholder="••••••••" /></div>
    <button class="btn-primary" onclick="saveUser(${id})">Guardar</button>
  `);
};

window.saveUser = async function (id) {
  const u        = usersData.find((x) => x.id === id);
  if (!u) return;
  const name     = document.getElementById("editName").value.trim();
  const email    = document.getElementById("editEmail").value.trim();
  const password = document.getElementById("editPassword").value || u.password || "unchanged";
  try {
    const updated = await apiFetch(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify({ name, email, password, profile_picture: u.profile_picture || null }),
    });
    Object.assign(u, updated);
    closeModal(); renderUsers();
    showToast("Utilizador atualizado.", "success");
  } catch (err) { showToast("Erro: " + err.message, "error"); }
};

window.deleteUser = function (id) {
  const u = usersData.find((x) => x.id === id);
  if (!u) return;
  openModal("Confirmar remoção", `
    <p style="margin-bottom:18px;color:var(--text-mid)">Tem a certeza que pretende remover <strong>${u.name}</strong>?</p>
    <div style="display:flex;gap:10px">
      <button class="btn-primary" style="background:linear-gradient(135deg,#c0392b,#e74c3c)" onclick="confirmDelete(${id})">Remover</button>
      <button class="btn-logout" onclick="closeModal()">Cancelar</button>
    </div>`);
};

window.confirmDelete = async function (id) {
  try {
    await apiFetch(`/users/${id}`, { method: "DELETE" });
    usersData = usersData.filter((x) => x.id !== id);
    closeModal(); renderUsers();
    showToast("Utilizador removido.", "error");
  } catch (err) { showToast("Erro: " + err.message, "error"); }
};

document.getElementById("addUserBtn")?.addEventListener("click", () => {
  openModal("Novo utilizador", `
    <div class="form-group"><label class="form-label">Nome</label>
      <input class="form-input" id="newName" placeholder="Nome completo" /></div>
    <div class="form-group"><label class="form-label">Email</label>
      <input class="form-input" id="newEmail" type="email" placeholder="email@exemplo.com" /></div>
    <div class="form-group"><label class="form-label">Password</label>
      <input class="form-input" id="newPassword" type="password" placeholder="••••••••" /></div>
    <button class="btn-primary" onclick="addUser()">Criar</button>`);
});

window.addUser = async function () {
  const name     = document.getElementById("newName").value.trim();
  const email    = document.getElementById("newEmail").value.trim();
  const password = document.getElementById("newPassword").value;
  if (!name || !email || !password) { showToast("Preencha todos os campos.", "error"); return; }
  try {
    const created = await apiFetch("/users/", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
    usersData.push(created);
    closeModal(); renderUsers();
    showToast("Utilizador criado.", "success");
  } catch (err) { showToast("Erro: " + err.message, "error"); }
};

["userSearch", "userRoleFilter", "userStatusFilter"].forEach((id) => {
  const key = id === "userSearch" ? "search" : id === "userRoleFilter" ? "role" : "status";
  const handler = (e) => { usersFilter[key] = e.target.value.toLowerCase(); currentPage = 1; renderUsers(); };
  document.getElementById(id)?.addEventListener("input", handler);
  document.getElementById(id)?.addEventListener("change", handler);
});

// ── DECISIONS ─────────────────────────────────────────────────────────────────
let decisionsData = [];

async function loadDecisions() {
  try {
    decisionsData = await apiFetch("/decisions/");
    renderDecisions();
  } catch (err) { showToast("Erro ao carregar decisões: " + err.message, "error"); }
}

function renderDecisions() {
  const filter   = document.getElementById("decisionStatusFilter")?.value || "";
  const filtered = filter ? decisionsData.filter((d) => d.vote_id === filter) : decisionsData;

  document.getElementById("decisionCount").textContent = `${filtered.length} decisão(ões) encontrada(s)`;

  const grid = document.getElementById("decisionsGrid");
  grid.innerHTML = filtered.length === 0
    ? `<p class="empty-state" style="grid-column:1/-1">Nenhuma decisão encontrada.</p>`
    : filtered.map((d) => `
      <div class="decision-card">
        <div class="decision-card-header">
          <span>ID: ${d.vote_id}</span>
        </div>
        <div class="decision-inner">
          <div class="decision-title">${d.title}</div>
          <div class="decision-options" style="margin-top:6px">${d.decision_text}</div>
        </div>
        <button class="decision-view-btn">Ver mais →</button>
      </div>`).join("");
}

document.getElementById("decisionStatusFilter")?.addEventListener("change", renderDecisions);

// ── GROUPS ────────────────────────────────────────────────────────────────────
let groupsData = [];

async function loadGroups() {
  try {
    groupsData = await apiFetch("/user-groups/");
    renderGroups();
  } catch (err) { showToast("Erro ao carregar grupos: " + err.message, "error"); }
}

function renderGroups() {
  const section = document.getElementById("section-groups");
  if (!section) return;

  // Substitui o conteúdo do card de grupos
  let card = section.querySelector(".card");
  if (!card) return;

  if (groupsData.length === 0) {
    card.innerHTML = `
      <p class="empty-state">Nenhum grupo registado ainda.</p>`;
    return;
  }

  card.innerHTML = `
    <div class="card-header">
      <h2 class="card-title">Todos os grupos</h2>
    </div>
    <div class="table-wrapper">
      <table class="data-table">
        <thead><tr><th>#</th><th>Nome do grupo</th><th>Ações</th></tr></thead>
        <tbody>
          ${groupsData.map((g) => `
            <tr>
              <td>${g.id}</td>
              <td><strong>${g.name}</strong></td>
              <td><div class="action-btns">
                <button class="btn-sm danger" onclick="deleteGroup(${g.id})">Remover</button>
              </div></td>
            </tr>`).join("")}
        </tbody>
      </table>
    </div>`;
}

window.deleteGroup = async function (id) {
  try {
    await apiFetch(`/user-groups/${id}`, { method: "DELETE" });
    groupsData = groupsData.filter((g) => g.id !== id);
    renderGroups();
    showToast("Grupo removido.", "error");
  } catch (err) { showToast("Erro: " + err.message, "error"); }
};

// Botão "Novo grupo" no header da secção
document.querySelector('[data-section="groups"]')?.addEventListener("click", () => loadGroups());
document.querySelector("#section-groups .btn-primary")?.addEventListener("click", () => {
  openModal("Novo grupo", `
    <div class="form-group"><label class="form-label">Nome do grupo</label>
      <input class="form-input" id="newGroupName" placeholder="Ex: Família, Trabalho…" /></div>
    <button class="btn-primary" onclick="addGroup()">Criar</button>`);
});

window.addGroup = async function () {
  const name = document.getElementById("newGroupName").value.trim();
  if (!name) { showToast("Introduz um nome para o grupo.", "error"); return; }
  try {
    const created = await apiFetch("/user-groups/", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
    groupsData.push(created);
    closeModal(); renderGroups();
    showToast("Grupo criado.", "success");
  } catch (err) { showToast("Erro: " + err.message, "error"); }
};

// ── QUICK ACTIONS ─────────────────────────────────────────────────────────────
document.getElementById("qaNewUser")?.addEventListener("click", () => {
  navItems.forEach((n) => n.classList.remove("active"));
  document.querySelector('[data-section="users"]')?.classList.add("active");
  sections.forEach((s) => s.classList.add("hidden"));
  document.getElementById("section-users")?.classList.remove("hidden");
  loadUsers().then(() => document.getElementById("addUserBtn")?.click());
});

document.getElementById("qaNewDecision")?.addEventListener("click", () => {
  showToast("Função em desenvolvimento.", "");
});

document.getElementById("qaNewGroup")?.addEventListener("click", () => {
  navItems.forEach((n) => n.classList.remove("active"));
  document.querySelector('[data-section="groups"]')?.classList.add("active");
  sections.forEach((s) => s.classList.add("hidden"));
  document.getElementById("section-groups")?.classList.remove("hidden");
  loadGroups().then(() => {
    openModal("Novo grupo", `
      <div class="form-group"><label class="form-label">Nome do grupo</label>
        <input class="form-input" id="newGroupName" placeholder="Ex: Família, Trabalho…" /></div>
      <button class="btn-primary" onclick="addGroup()">Criar</button>`);
  });
});

document.getElementById("qaExport")?.addEventListener("click", async () => {
  try {
    const users = await apiFetch("/users/");
    const csv = ["Nome,Email", ...users.map((u) => `${u.name},${u.email}`)].join("\n");
    const a = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(new Blob([csv], { type: "text/csv" })),
      download: "votesync-usuarios.csv",
    });
    a.click();
    showToast("Dados exportados.", "success");
  } catch (err) { showToast("Erro ao exportar: " + err.message, "error"); }
});

// ── NAVBAR ────────────────────────────────────────────────────────────────────
document.getElementById("logoutBtn")?.addEventListener("click", () => {
  localStorage.removeItem("votesync.session");
  showToast("Sessão terminada. Até logo!", "");
  setTimeout(() => { window.location.href = "./login.html"; }, 1200);
});
document.getElementById("notifBtn")?.addEventListener("click", () => showToast("Sem novas notificações.", ""));
document.getElementById("globalSearch")?.addEventListener("input", (e) => {
  const val = e.target.value.trim();
  if (val.length > 1) showToast(`A pesquisar por "${val}"…`, "");
});

// ── SETTINGS ──────────────────────────────────────────────────────────────────
document.getElementById("saveSettings")?.addEventListener("click", () => {
  showToast("Configurações guardadas.", "success");
});

// ── INIT ──────────────────────────────────────────────────────────────────────
loadDashboard();
loadUsers();