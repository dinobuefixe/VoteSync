/* ── VoteSync — Friends JS ligado à API real ── */

const SESSION_KEY = "votesync.session";
const API = "http://localhost:8000";

// ── SESSION ───────────────────────────────────────────────────────────────────
function getSession() {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
}

function ensureAuthenticated() {
    const session = getSession();
    if (!session || !session.user) window.location.href = "./index.html";
}

// ── LOGO / LOGOUT ─────────────────────────────────────────────────────────────
function handleLogoClick(e) {
    e.preventDefault();
    const session = getSession();
    if (session && session.user) {
        window.location.href = session.user.is_admin ? "./admin.html" : "./dashboard.html";
    } else {
        window.location.href = "./index.html";
    }
}

document.querySelector(".btn-logout")?.addEventListener("click", () => {
    localStorage.removeItem(SESSION_KEY);
    window.location.href = "./index.html";
});

// ── API ───────────────────────────────────────────────────────────────────────
async function apiFetch(path, options = {}) {
    const res = await fetch(`${path}`, {
        headers: { "Content-Type": "application/json" },
        ...options,
    });
    if (res.status === 204) return null;
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Erro na API");
    return data;
}

// ── STATE ─────────────────────────────────────────────────────────────────────
let allUsers      = [];
let myFriendships = [];
const session     = getSession();
const myId        = parseInt(session?.user?.id);

// ── LOAD DATA ─────────────────────────────────────────────────────────────────
async function loadData() {
    try {
        const [users, friendships] = await Promise.all([
            apiFetch("/users/"),
            apiFetch("/friendships/"),
        ]);
        allUsers = users.filter(u => u.id !== myId);
        myFriendships = friendships.filter(
            f => f.user_id === myId || f.friend_id === myId
        );
        
        const friendsIds = getMyFriendIds();
        renderFriends(friendsIds, "accepted");

        const pendingFriendsIds = getMyPendingFriendIds();
        renderFriends(pendingFriendsIds, "pending");

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

function getMyPendingFriendIds() {
    return myFriendships
        .filter(f => f.status === "pending")
        .map(f => f.user_id === myId ? f.friend_id : f.user_id);
}

function renderFriends(friendsIds, whichfriends) {

    const friendUsers = allUsers.filter(u => friendsIds.includes(u.id));

    const emptySection = document.querySelector(".empty-state-container");
    let friendsList = document.getElementById("friends-list");

    if (friendUsers.length === 0) {
        if (emptySection) emptySection.style.display = "flex";
        if (friendsList) friendsList.innerHTML = "";
        return;
    }

    if (emptySection) emptySection.style.display = "none";

    friendsList = document.createElement("div");
    friendsList.id = "friends-list";
    friendsList.style.cssText = "width:min(100%,760px);display:flex;flex-direction:column;gap:12px;margin-top:1rem;";
    document.querySelector(".main-container").appendChild(friendsList);

    const text = `<h2>${whichfriends === "accepted" ? "Amigos" : "Solicitações Pendentes"}</h2>`;
    friendsList.innerHTML = text + friendUsers.map(u => {
        const friendship = myFriendships.find(
            f => (f.user_id === myId && f.friend_id === u.id) ||
                (f.friend_id === myId && f.user_id === u.id)
        );

        const isIncoming = friendship?.friend_id === myId; 
        const isOutgoing = friendship?.user_id === myId;  

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

                ${whichfriends === "accepted" ? `
                    <button onclick="removeFriend(${friendship?.id})"
                        style="border:1px solid #e0d5f5;background:#f7f4fd;color:#7c5cbf;padding:7px 16px;border-radius:20px;font-size:13px;font-weight:600;cursor:pointer;">
                        Remover
                    </button>
                ` : whichfriends === "pending" && isIncoming ? `
                    <div style="display:flex;gap:8px;">
                        <button onclick="confirmFriendRequest(${friendship?.id})"
                            style="border:none;background:linear-gradient(90deg,#83b5f0,#69c4ee);color:#132338;padding:7px 16px;border-radius:20px;font-size:13px;font-weight:600;cursor:pointer;">
                            Aceitar
                        </button>
                        <button onclick="removeFriend(${friendship?.id})"
                            style="border:1px solid #e0d5f5;background:#f7f4fd;color:#7c5cbf;padding:7px 16px;border-radius:20px;font-size:13px;font-weight:600;cursor:pointer;">
                            Recusar
                        </button>
                    </div>
                ` : whichfriends === "pending" && isOutgoing ? `
                    <button onclick="removeFriend(${friendship?.id})"
                        style="border:1px solid #e0d5f5;background:#f7f4fd;color:#7c5cbf;padding:7px 16px;border-radius:20px;font-size:13px;font-weight:600;cursor:pointer;">
                        Cancelar
                    </button>
                ` : ""}
            </div>
        `;
    }).join("");
}

// ── SEARCH ────────────────────────────────────────────────────────────────────
const searchInput = document.querySelector(".search-bar input");
let searchResults = document.getElementById("search-results");

if (!searchResults) {
    searchResults = document.createElement("div");
    searchResults.id = "search-results";
    searchResults.style.cssText = "width:min(100%,760px);display:flex;flex-direction:column;gap:10px;margin-top:1.5rem;";
    document.querySelector(".main-container").prepend(searchResults);
}

searchInput?.addEventListener("input", () => {
    const query = searchInput.value.trim().toLowerCase();
    if (query.length < 2) { searchResults.innerHTML = ""; return; }

    const friendIds = getMyFriendIds();
    const filtered = allUsers.filter(u =>
        (u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query))
        && !friendIds.includes(u.id)
    );

    if (filtered.length === 0) {
        searchResults.innerHTML = `<p style="color:#5f6678;font-size:14px;text-align:center;">Nenhum utilizador encontrado.</p>`;
        return;
    }

    searchResults.innerHTML = filtered.map(u => `
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
            <button onclick="addFriend(${u.id})"
                style="border:none;background:linear-gradient(90deg,#83b5f0,#69c4ee);color:#132338;padding:7px 16px;border-radius:20px;font-size:13px;font-weight:600;cursor:pointer;">
                Adicionar
            </button>
        </div>`).join("");
});

// ── ADD FRIEND ────────────────────────────────────────────────────────────────
window.addFriend = async function(friendId) {
    try {
        const newFriendship = await apiFetch("/friendships/", {
            method: "POST",
            body: JSON.stringify({ user_id: myId, friend_id: friendId, status: "pending" }),
        });
        myFriendships.push(newFriendship);
        searchInput.value = "";
        searchResults.innerHTML = "";

        const friendsIds = getMyFriendIds();
        renderFriends(friendsIds, "accepted");

        const pendingFriendsIds = getMyPendingFriendIds();
        renderFriends(pendingFriendsIds, "pending");

        await(Swal.fire({ icon: "success", title: "Pedido de amizade enviado!", timer: 1500, showConfirmButton: false }));
        window.location.reload();
    } catch (err) {
        showMessage("Erro: " + err.message, "error");
    }
};

window.confirmFriendRequest = async function(id) {
    try {
        const updatedFriendship = await apiFetch(`/friendships/${id}`, {
            method: "PUT",
            body: JSON.stringify({ status: "accepted" }),
        });

        // Atualiza a friendship existente em vez de fazer push
        const index = myFriendships.findIndex(f => f.id === id);
        if (index !== -1) {
            myFriendships[index] = updatedFriendship;
        }

        searchInput.value = "";
        searchResults.innerHTML = "";
        const friendsIds = getMyFriendIds();
        renderFriends(friendsIds, "accepted");
        await(Swal.fire({ icon: "success", title: "Pedido de amizade aceite!", timer: 1500, showConfirmButton: false }));
        window.location.reload();
    } catch (err) {
        showMessage("Erro: " + err.message, "error");
    }
};

window.removeFriend = async function(friendshipId) {
    if (!friendshipId) return;

    const result = await Swal.fire({
        title: "Cancelar Amizade?",
        text: "Tens a certeza que queres cancelar esta Amizade?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#7c5cbf",
        cancelButtonColor: "#aaa",
        confirmButtonText: "Sim, remover",
        cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
        await apiFetch(`/friendships/${friendshipId}`, { method: "DELETE" });
        myFriendships = myFriendships.filter(f => f.id !== friendshipId);
        const friendsIds = getMyFriendIds();
        renderFriends(friendsIds, "accepted");
        await(Swal.fire({ icon: "success", title: "Removido!!!!", text: "Amizade cancelado com sucesso.", timer: 1500, showConfirmButton: false }));
        window.location.reload();
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

// ── INIT ──────────────────────────────────────────────────────────────────────
ensureAuthenticated();
loadData();