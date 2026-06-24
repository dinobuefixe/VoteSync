/* ── VoteSync — Friends JS (REFATORIZADO COM api.js) ── */

// ✅ IMPORTANTE: Adiciona isto no HTML antes deste script:
// <script src="./api.js"></script>

// ── DOM REFS ──────────────────────────────────────────────────────────────────
const searchInput = document.querySelector(".search-bar input");
let searchResults = document.getElementById("search-results");
const mainContainer = document.querySelector(".main-container");

// Criar searchResults se não existir
if (!searchResults) {
    searchResults = document.createElement("div");
    searchResults.id = "search-results";
    searchResults.style.cssText = "width:min(100%,760px);display:flex;flex-direction:column;gap:10px;margin-top:1.5rem;";
    mainContainer.prepend(searchResults);
}

// ── STATE ─────────────────────────────────────────────────────────────────────
let allUsers = [];
let myFriendships = [];
const session = api.getSession();
const myId = parseInt(session?.user?.id);

// ── LOAD DATA ─────────────────────────────────────────────────────────────────
async function loadData() {
    try {
        const [users, friendships] = await Promise.all([
            api.getUsers(),
            api.getFriendships()
        ]);

        allUsers = users.filter(u => u.id !== myId);
        myFriendships = friendships.filter(
            f => f.user_id === myId || f.friend_id === myId
        );

        renderFriends();

    } catch (err) {
        showMessage("Erro ao carregar dados: " + err.message, "error");
    }
}

// ── RENDER FRIENDS ────────────────────────────────────────────────────────────
function getMyFriendIds() {
    return myFriendships
        .filter(f => f.status === "accepted")
        .map(f => f.user_id === myId ? f.friend_id : f.user_id);
}

function renderFriends() {
    const friendIds = getMyFriendIds();
    const friendUsers = allUsers.filter(u => friendIds.includes(u.id));

    const subtitle = document.querySelector(".main-subtitle");
    if (subtitle) {
        subtitle.textContent = friendUsers.length === 1
            ? "1 amigo na tua rede"
            : `${friendUsers.length} amigos na tua rede`;
    }

    const emptySection = document.querySelector(".empty-state-container");

    // ── 1. Amigos ─────────────────────────────────────────────────────────────
    let friendsList = document.getElementById("friends-list");
    if (!friendsList) {
        friendsList = document.createElement("div");
        friendsList.id = "friends-list";
        friendsList.style.cssText = "width:min(100%,760px);display:flex;flex-direction:column;gap:12px;margin-top:1rem;";
        mainContainer.appendChild(friendsList);
    }

    if (friendUsers.length === 0) {
        if (emptySection) emptySection.style.display = "flex";
        friendsList.innerHTML = "";
    } else {
        if (emptySection) emptySection.style.display = "none";
        friendsList.innerHTML = `
                <div>
                    <h2 style="margin:0;font-size:1.5rem;color:#2d2248;">Amigos</h2>
                    <p style="margin:6px 0 0;color:#5f6678;font-size:0.95rem;">Pode adicionar novos amigos a qualquer momento.</p>
                </div>
            ${friendUsers.map(u => {
                const friendship = myFriendships.find(
                    f => (f.user_id === myId && f.friend_id === u.id) ||
                         (f.friend_id === myId && f.user_id === u.id)
                );
                return `
                <div style="background:#fff;border-radius:16px;padding:14px 18px;display:flex;align-items:center;justify-content:space-between;box-shadow:0 2px 10px rgba(0,0,0,0.06);">
                    <div style="display:flex;align-items:center;gap:12px;">
                        <div style="width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,#9b7dd4,#5bc8e8);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:15px;">
                            ${initials(u.name)}
                        </div>
                        <div>
                            <div style="font-weight:700;color:#182033">${u.name}</div>
                            <div style="font-size:13px;color:#5f6678">${u.email}</div>
                        </div>
                    </div>
                    <button onclick="removeFriend(${friendship?.id})"
                        style="border:1px solid #e0d5f5;background:#f7f4fd;color:#7c5cbf;padding:7px 16px;border-radius:20px;font-size:13px;font-weight:600;cursor:pointer;">
                        Remover
                    </button>
                </div>`;
            }).join("")}
        `;
    }

    // ── 2. Pedidos recebidos ──────────────────────────────────────────────────
    const incoming = myFriendships.filter(f => f.status === "pending" && f.friend_id === myId);

    let incomingSection = document.getElementById("incoming-requests");
    if (!incomingSection) {
        incomingSection = document.createElement("div");
        incomingSection.id = "incoming-requests";
        incomingSection.style.cssText = "width:min(100%,760px);display:flex;flex-direction:column;gap:12px;margin-top:1rem;";
        mainContainer.appendChild(incomingSection);
    }

    if (incoming.length === 0) {
        incomingSection.innerHTML = "";
    } else {
        incomingSection.innerHTML = `
                <div>
                    <h2 style="margin:0;font-size:1.5rem;color:#2d2248;">Pedidos de amizade pendentes</h2>
                    <p style="margin:6px 0 0;color:#5f6678;font-size:0.95rem;">Aceita ou recusa pedidos recebidos.</p>
                </div>
            ${incoming.map(f => {
                const user = allUsers.find(u => u.id === f.user_id);
                return `
                <div style="background:#fff;border-radius:16px;padding:14px 18px;display:flex;align-items:center;justify-content:space-between;box-shadow:0 2px 10px rgba(0,0,0,0.06);">
                    <div style="display:flex;align-items:center;gap:12px;">
                        <div style="width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,#9b7dd4,#5bc8e8);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:15px;">
                            ${initials(user?.name || "?")}
                        </div>
                        <div>
                            <div style="font-weight:700;color:#182033">${user?.name || "Utilizador"}</div>
                            <div style="font-size:13px;color:#5f6678">${user?.email || ""}</div>
                        </div>
                    </div>
                    <div style="display:flex;gap:8px;">
                        <button onclick="acceptFriend(${f.id})" style="border:none;background:#1a7a52;color:#fff;padding:7px 16px;border-radius:20px;font-size:13px;font-weight:600;cursor:pointer;">Aceitar</button>
                        <button onclick="rejectFriend(${f.id})" style="border:1px solid #e0d5f5;background:#f7f4fd;color:#7c5cbf;padding:7px 16px;border-radius:20px;font-size:13px;font-weight:600;cursor:pointer;">Recusar</button>
                    </div>
                </div>`;
            }).join("")}
        `;
    }

    // ── 3. Pedidos enviados ───────────────────────────────────────────────────
    const outgoing = myFriendships.filter(f => f.status === "pending" && f.user_id === myId);

    let outgoingSection = document.getElementById("outgoing-requests");
    if (!outgoingSection) {
        outgoingSection = document.createElement("div");
        outgoingSection.id = "outgoing-requests";
        outgoingSection.style.cssText = "width:min(100%,760px);display:flex;flex-direction:column;gap:12px;margin-top:1rem;";
        mainContainer.appendChild(outgoingSection);
    }

    if (outgoing.length === 0) {
        outgoingSection.innerHTML = "";
    } else {
        outgoingSection.innerHTML = `
                <div>
                    <h2 style="margin:0;font-size:1.5rem;color:#2d2248;">Pedidos enviados</h2>
                    <p style="margin:6px 0 0;color:#5f6678;font-size:0.95rem;">Aguarda resposta dos utilizadores que adicionaste.</p>
                </div>
            ${outgoing.map(f => {
                const user = allUsers.find(u => u.id === f.friend_id);
                return `
                <div style="background:#fff;border-radius:16px;padding:14px 18px;display:flex;align-items:center;justify-content:space-between;box-shadow:0 2px 10px rgba(0,0,0,0.06);">
                    <div style="display:flex;align-items:center;gap:12px;">
                        <div style="width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,#9b7dd4,#5bc8e8);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:15px;">
                            ${initials(user?.name || "?")}
                        </div>
                        <div>
                            <div style="font-weight:700;color:#182033">${user?.name || "Utilizador"}</div>
                            <div style="font-size:13px;color:#5f6678">${user?.email || ""}</div>
                        </div>
                    </div>
                    <button onclick="rejectFriend(${f.id})" style="border:1px solid #e0d5f5;background:#f7f4fd;color:#7c5cbf;padding:7px 16px;border-radius:20px;font-size:13px;font-weight:600;cursor:pointer;">Cancelar pedido</button>
                </div>`;
            }).join("")}
        `;
    }
}


window.acceptFriend = async function (friendshipId) {
    if (!friendshipId) return;
    try {
        await api.acceptFriendship(friendshipId);
        await loadData();
        renderFriends();
        showSwal("success", "Pedido aceite!", 1500);
    } catch (err) {
        showMessage("Erro: " + err.message, "error");
    }
};

window.rejectFriend = async function (friendshipId) {
    if (!friendshipId) return;
    const result = await showSwal("confirm", "Remover Pedido?", "Tens a certeza que queres cancelar este pedido de amizade?");
    try {
        await api.rejectFriendship(friendshipId);
        await loadData();
        renderFriends();
        showSwal("success", "Pedido removido!", 1500);
    } catch (err) {
        showMessage("Erro: " + err.message, "error");
    }
};

// ── REMOVE FRIEND ─────────────────────────────────────────────────────────────
window.removeFriend = async function (friendshipId) {
    if (!friendshipId) return;

    const result = await showSwal("confirm", "Remover amigo?", "Tens a certeza que queres remover este amigo?");
    if (!result) return;

    try {
        await api.deleteFriendship(friendshipId);
        myFriendships = myFriendships.filter(f => f.id !== friendshipId);
        renderFriends();
        showSwal("success", "Removido!", "Amigo removido com sucesso.", 1500);
    } catch (err) {
        showMessage("Erro: " + err.message, "error");
    }
};

// ── HELPERS ───────────────────────────────────────────────────────────────────
function initials(name) {
    return (name || "?").split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
}

function showMessage(msg, type = "") {
    const colors = { success: "#1a7a52", error: "#a93226", "": "#2d2248" };
    const toast = Object.assign(document.createElement("div"), {
        textContent: (type === "success" ? "✅ " : type === "error" ? "❌ " : "ℹ️ ") + msg,
    });
    Object.assign(toast.style, {
        position: "fixed", bottom: "24px", right: "24px",
        background: colors[type] || colors[""],
        color: "#fff", padding: "12px 18px", borderRadius: "8px",
        fontWeight: "600", fontSize: "13px", zIndex: "999",
        boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
    });
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

async function showSwal(type, title, text = "", timer = 0) {
    if (typeof window.Swal === "undefined") {
        if (type === "confirm") return window.confirm(text || title);
        return true;
    }

    if (type === "confirm") {
        const result = await window.Swal.fire({
            title,
            text,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#7c5cbf",
            cancelButtonColor: "#aaa",
            confirmButtonText: "Sim",
            cancelButtonText: "Cancelar",
        });
        return result.isConfirmed;
    }

    if (type === "success") {
        await window.Swal.fire({ icon: "success", title, timer, showConfirmButton: false });
        return true;
    }
}

// ── LOGOUT ────────────────────────────────────────────────────────────────────
document.querySelector(".btn-logout")?.addEventListener("click", () => {
    api.logout();
});

function handleLogoClick(e) {
    e.preventDefault();
    const session = api.getSession();
    if (session && session.user) {
        window.location.href = session.user.is_admin ? "./admin.html" : "./dashboard.html";
    } else {
        window.location.href = "./index.html";
    }
}

// ── INIT ──────────────────────────────────────────────────────────────────────
api.ensureAuthenticated();
loadData();