/* ── VoteSync — Friends JS (REFATORIZADO COM api.js) ── */

// ✅ IMPORTANTE: Adiciona isto no HTML antes deste script:
// <script src="./api.js"></script>

// ── DOM REFS ──────────────────────────────────────────────────────────────────
const searchInput = document.querySelector(".search-bar input");
let searchResults = document.getElementById("search-results");
const mainContainer = document.querySelector(".main-container");

<<<<<<< HEAD
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
=======
// Criar searchResults se não existir
if (!searchResults) {
    searchResults = document.createElement("div");
    searchResults.id = "search-results";
    searchResults.style.cssText = "width:min(100%,760px);display:flex;flex-direction:column;gap:10px;margin-top:1.5rem;";
    mainContainer.prepend(searchResults);
>>>>>>> 9224db4 (Fix auth and friendships backend issues; update frontend deployment docs)
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
<<<<<<< HEAD
        
        const friendsIds = getMyFriendIds("accepted");
        renderFriends(friendsIds, "accepted");

        const pendingFriendsIds = getMyFriendIds("pending");
        renderFriends(pendingFriendsIds, "pending");

=======

        renderFriends();
>>>>>>> 9224db4 (Fix auth and friendships backend issues; update frontend deployment docs)
    } catch (err) {
        showMessage("Erro ao carregar dados: " + err.message, "error");
    }
}

// ── RENDER FRIENDS ────────────────────────────────────────────────────────────
function getMyFriendIds(type) {
    return myFriendships
        .filter(f => f.status === type)
        .map(f => f.user_id === myId ? f.friend_id : f.user_id);
}

<<<<<<< HEAD
=======
function renderPendingRequests() {
    const incoming = myFriendships.filter(f => f.status === "pending" && f.friend_id === myId);
    const outgoing = myFriendships.filter(f => f.status === "pending" && f.user_id === myId);

    let incomingSection = document.getElementById("incoming-requests");
    if (!incomingSection) {
        incomingSection = document.createElement("div");
        incomingSection.id = "incoming-requests";
        incomingSection.style.cssText = "width:min(100%,760px);display:flex;flex-direction:column;gap:12px;margin-top:1rem;";
        mainContainer.insertBefore(incomingSection, mainContainer.querySelector(".empty-state-container") || mainContainer.firstChild);
    }

    if (incoming.length === 0) {
        incomingSection.innerHTML = "";
    } else {
        incomingSection.innerHTML = `
            <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;">
                <div>
                    <h2 style=\"margin:0;font-size:1.1rem;color:#2d2248;\">Pedidos de amizade pendentes</h2>
                    <p style=\"margin:6px 0 0;color:#5f6678;font-size:0.95rem;\">Aceita ou recusa pedidos recebidos.</p>
                </div>
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

    let outgoingSection = document.getElementById("outgoing-requests");
    if (!outgoingSection) {
        outgoingSection = document.createElement("div");
        outgoingSection.id = "outgoing-requests";
        outgoingSection.style.cssText = "width:min(100%,760px);display:flex;flex-direction:column;gap:12px;margin-top:1rem;";
        mainContainer.insertBefore(outgoingSection, mainContainer.querySelector("#friends-list") || null);
    }

    if (outgoing.length === 0) {
        outgoingSection.innerHTML = "";
    } else {
        outgoingSection.innerHTML = `
            <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;">
                <div>
                    <h2 style=\"margin:0;font-size:1.1rem;color:#2d2248;\">Pedidos enviados</h2>
                    <p style=\"margin:6px 0 0;color:#5f6678;font-size:0.95rem;\">Aguarda resposta dos utilizadores que adicionaste.</p>
                </div>
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
                        <button disabled style="border:1px solid #d6d0e8;background:#f7f4fd;color:#7c5cbf;padding:7px 16px;border-radius:20px;font-size:13px;font-weight:600;">Pedido enviado</button>
                    </div>`;
        }).join("")}
        `;
    }
}

function renderFriends() {
    const friendIds = getMyFriendIds();
    const friendUsers = allUsers.filter(u => friendIds.includes(u.id));
>>>>>>> 9224db4 (Fix auth and friendships backend issues; update frontend deployment docs)

function renderFriends(friendsIds, whichfriends) {

    const friendUsers = allUsers.filter(u => friendsIds.includes(u.id));
    const emptySection = document.querySelector(".empty-state-container");
    let friendsList = document.getElementById("friends-list");

<<<<<<< HEAD
    if (emptySection) emptySection.style.display = "flex";
=======
    if (friendUsers.length === 0) {
        if (emptySection) emptySection.style.display = "flex";
        if (friendsList) friendsList.innerHTML = "";
        renderPendingRequests();
        return;
    }
>>>>>>> 9224db4 (Fix auth and friendships backend issues; update frontend deployment docs)

    friendsList = document.createElement("div");
    friendsList.id = "friends-list";
    friendsList.style.cssText = "width:min(100%,760px);display:flex;flex-direction:column;gap:12px;margin-top:1rem;";
    document.querySelector(".main-container").appendChild(friendsList);

<<<<<<< HEAD
    const text = `<h2>${whichfriends === "accepted" ? "Amigos" : "Solicitações Pendentes"}</h2>`;
    friendsList.innerHTML = text + friendUsers.map(u => {
=======
    if (!friendsList) {
        friendsList = document.createElement("div");
        friendsList.id = "friends-list";
        friendsList.style.cssText = "width:min(100%,760px);display:flex;flex-direction:column;gap:12px;margin-top:1rem;";
        mainContainer.appendChild(friendsList);
    }

    friendsList.innerHTML = friendUsers.map(u => {
>>>>>>> 9224db4 (Fix auth and friendships backend issues; update frontend deployment docs)
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

<<<<<<< HEAD
=======
    renderPendingRequests();
>>>>>>> 9224db4 (Fix auth and friendships backend issues; update frontend deployment docs)
}

// ── SEARCH ────────────────────────────────────────────────────────────────────
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
window.addFriend = async function (friendId) {
    try {
<<<<<<< HEAD
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
=======
        await api.createFriendship(myId, friendId, "pending");
        searchInput.value = "";
        searchResults.innerHTML = "";
        await loadData();
        renderFriends();
        showSwal("success", "Pedido de amizade enviado!", 1500);
>>>>>>> 9224db4 (Fix auth and friendships backend issues; update frontend deployment docs)
    } catch (err) {
        showMessage("Erro: " + err.message, "error");
    }
};

<<<<<<< HEAD
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
=======
window.acceptFriend = async function (friendshipId) {
    if (!friendshipId) return;
    try {
        await api.updateFriendship(friendshipId, { status: "accepted" });
        await loadData();
        renderFriends();
        showSwal("success", "Pedido aceite!", 1500);
    } catch (err) {
        showMessage("Erro: " + err.message, "error");
    }
};

window.rejectFriend = async function (friendshipId) {
    if (!friendshipId) return;
    try {
        await api.updateFriendship(friendshipId, { status: "rejected" });
        await loadData();
        renderFriends();
        showSwal("success", "Pedido recusado.", 1500);
>>>>>>> 9224db4 (Fix auth and friendships backend issues; update frontend deployment docs)
    } catch (err) {
        showMessage("Erro: " + err.message, "error");
    }
};

<<<<<<< HEAD
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
=======
// ── REMOVE FRIEND ─────────────────────────────────────────────────────────────
window.removeFriend = async function (friendshipId) {
    if (!friendshipId) return;

    const result = await showSwal("confirm", "Remover amigo?", "Tens a certeza que queres remover este amigo?");
    if (!result) return;
>>>>>>> 9224db4 (Fix auth and friendships backend issues; update frontend deployment docs)

    try {
        await api.deleteFriendship(friendshipId);
        myFriendships = myFriendships.filter(f => f.id !== friendshipId);
<<<<<<< HEAD
        const friendsIds = getMyFriendIds();
        renderFriends(friendsIds, "accepted");
        await(Swal.fire({ icon: "success", title: "Removido!!!!", text: "Amizade cancelado com sucesso.", timer: 1500, showConfirmButton: false }));
        window.location.reload();
=======
        renderFriends();
        showSwal("success", "Removido!", "Amigo removido com sucesso.", 1500);
>>>>>>> 9224db4 (Fix auth and friendships backend issues; update frontend deployment docs)
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