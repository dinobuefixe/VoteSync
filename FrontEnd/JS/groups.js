/* ── VoteSync — groups.js (ATUALIZADO COM CHECKBOXES) ── */

// ── DOM REFS ──────────────────────────────────────────────────────────────────
const groupsSubtitle = document.querySelector("#groups-subtitle");
const groupsEmptyState = document.querySelector("#groups-empty-state");
const groupsList = document.querySelector("#groups-list");
const modalOverlay = document.querySelector("#group-modal-overlay");
const openModalButton = document.querySelector("#open-create-group-modal");
const openModalFromEmpty = document.querySelector("#open-create-group-empty");
const closeModalButton = document.querySelector("#close-group-modal");
const cancelModalButton = document.querySelector("#cancel-group-modal");
const groupForm = document.querySelector("#group-form");
const groupNameInput = document.querySelector("#group-name-input");
const groupDescriptionInput = document.querySelector("#group-description-input");
const groupFriendsContainer = document.querySelector("#group-friends-container");
const groupFriendsEmpty = document.querySelector("#group-friends-empty");
const groupFormMessage = document.querySelector("#group-form-message");
const groupModalTitle = document.querySelector("#group-modal-title");
const groupModalSubmit = document.querySelector("#group-modal-submit");

// ── STATE ─────────────────────────────────────────────────────────────────────
let editingGroupId = null;
let cachedFriends = [];

const session = api.getSession();
const myId = parseInt(session?.user?.id);

// ── LOGO ──────────────────────────────────────────────────────────────────────
function handleLogoClick(e) {
    e.preventDefault();
    const session = api.getSession();
    if (session && session.user) {
        window.location.href = session.user.is_admin ? "./admin.html" : "./dashboard.html";
    } else {
        window.location.href = "./index.html";
    }
}

// ── LOAD DATA ─────────────────────────────────────────────────────────────────
async function loadFriends() {
    try {
        const [users, friendships] = await Promise.all([
            api.getUsers(),
            api.getFriendships()
        ]);
        const myFriendIds = friendships
            .filter(f => f.status === "accepted" && (f.user_id === myId || f.friend_id === myId))
            .map(f => f.user_id === myId ? f.friend_id : f.user_id);
        cachedFriends = users.filter(u => myFriendIds.includes(u.id));
    } catch (err) {
        console.error("Erro ao carregar amigos:", err);
        cachedFriends = [];
    }
}

// ── HELPERS ───────────────────────────────────────────────────────────────────
function hasSwal() {
    return typeof window !== "undefined" && typeof window.Swal !== "undefined";
}

function setMessage(message) {
    if (!groupFormMessage) return;
    groupFormMessage.textContent = message;
}

function showValidationMessage(message) {
    setMessage(message);
    if (hasSwal()) {
        window.Swal.fire({ icon: "warning", title: "Atenção", text: message, confirmButtonText: "OK" });
    }
}

function setModalMode(mode) {
    if (!groupModalTitle || !groupModalSubmit) return;
    if (mode === "edit") {
        groupModalTitle.textContent = "Editar grupo";
        groupModalSubmit.textContent = "Guardar alterações";
        return;
    }
    groupModalTitle.textContent = "Criar novo grupo";
    groupModalSubmit.textContent = "Criar grupo";
}

// ── RENDERIZAR CHECKBOXES DE AMIGOS ───────────────────────────────────────────
function populateFriendsCheckboxes(selectedIds = []) {
    if (!groupFriendsContainer) return;

    groupFriendsContainer.innerHTML = "";

    if (cachedFriends.length === 0) {
        if (groupFriendsEmpty) {
            groupFriendsEmpty.textContent = "Sem amigos disponíveis";
            groupFriendsEmpty.hidden = false;
        }
        return;
    }

    if (groupFriendsEmpty) {
        groupFriendsEmpty.hidden = true;
    }

    cachedFriends.forEach((friend) => {
        const item = document.createElement("div");
        item.className = "group-friend-item";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "group-friend-checkbox";
        checkbox.id = `friend-${friend.id}`;
        checkbox.value = friend.id;
        checkbox.checked = selectedIds.includes(friend.id);

        const info = document.createElement("div");
        info.style.display = "flex";
        info.style.flexDirection = "column";
        info.style.gap = "0.15rem";
        info.style.flex = "1";
        info.style.minWidth = "0";

        const nameDiv = document.createElement("span");
        nameDiv.className = "group-friend-name";
        nameDiv.textContent = friend.name;

        const emailDiv = document.createElement("span");
        emailDiv.className = "group-friend-email";
        emailDiv.textContent = friend.email;

        info.appendChild(nameDiv);
        info.appendChild(emailDiv);

        item.addEventListener("click", (event) => {
            if (event.target === checkbox) return;
            checkbox.checked = !checkbox.checked;
        });

        item.appendChild(checkbox);
        item.appendChild(info);
        groupFriendsContainer.appendChild(item);
    });
}

function getSelectedFriendIds() {
    if (!groupFriendsContainer) return [];
    const checkboxes = groupFriendsContainer.querySelectorAll("input[type='checkbox']:checked");
    return Array.from(checkboxes).map(cb => parseInt(cb.value)).filter(Boolean);
}

// ── RENDER GROUPS ─────────────────────────────────────────────────────────────
async function renderGroups() {
    if (!groupsList || !groupsSubtitle || !groupsEmptyState) return;

    const groups = await api.getGroups(myId);
    groupsSubtitle.textContent = groups.length === 1 ? "1 grupo" : `${groups.length} grupos`;

    if (groups.length === 0) {
        groupsEmptyState.hidden = false;
        groupsList.hidden = true;
        groupsList.innerHTML = "";
        return;
    }

    groupsEmptyState.hidden = true;
    groupsList.hidden = false;
    groupsList.innerHTML = "";

    groups.forEach((group) => {
        const members = Array.isArray(group.members) ? group.members : [];
        const memberNames = members
            .map(m => m.user?.name || "")
            .filter(name => name !== "");

        const visibleNames = memberNames.slice(0, 8);
        const overflow = memberNames.length - 8;

        groupsList.innerHTML += `
            <article class="group-card">
                <h3 class="group-card-title">${group.name || "Grupo sem nome"}</h3>
                <p class="group-members-label">
                    ${members.length > 0 ? `${members.length} Utilizadores no grupo` : "Sem amigos neste grupo"}
                </p>
                <div class="group-members">
                    ${visibleNames.map(name => `<span class="group-member-chip">${name}</span>`).join("")}
                    ${overflow > 0 ? `<span class="group-member-chip">+${overflow}</span>` : ""}
                </div>
                <div class="group-card-actions">
                    <button type="button" class="group-action-btn edit" onclick="openEditModal(${JSON.stringify(group).replace(/"/g, '&quot;')})">
                        <i class="fa-regular fa-pen-to-square"></i> Editar
                    </button>
                    <button type="button" class="group-action-btn delete" onclick="removeGroup(${group.id})">
                        <i class="fa-regular fa-trash-can"></i> Remover
                    </button>
                </div>
            </article>`;
    });
}

// ── MODAL ─────────────────────────────────────────────────────────────────────
function resetForm() {
    if (groupForm) groupForm.reset();
    populateFriendsCheckboxes([]);
    editingGroupId = null;
    setModalMode("create");
    setMessage("");
}

function openModal() {
    if (!modalOverlay) return;
    populateFriendsCheckboxes([]);
    resetForm();
    modalOverlay.hidden = false;
}

function openEditModal(group) {
    if (!modalOverlay || !group) return;

    const memberUserIds = (group.members || []).map(m => m.user_id);
    populateFriendsCheckboxes(memberUserIds);

    editingGroupId = group.id;
    setModalMode("edit");
    if (groupNameInput) groupNameInput.value = group.name || "";
    if (groupDescriptionInput) groupDescriptionInput.value = group.description || "";

    setMessage("");
    modalOverlay.hidden = false;
}

function closeModal() {
    if (!modalOverlay) return;
    modalOverlay.hidden = true;
    setMessage("");
}

async function removeGroup(groupId) {
    if (!groupId) return;
    if (hasSwal()) {
        const result = await window.Swal.fire({
            title: "Remover grupo?",
            text: "Esta ação não pode ser desfeita.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Remover",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#c0392b"
        });
        if (!result.isConfirmed) return;
    } else {
        if (!window.confirm("Queres remover este grupo?")) return;
    }

    try {
        await api.deleteUserGroup(groupId);
        await renderGroups();
        if (hasSwal()) window.Swal.fire({
            icon: "success",
            title: "Grupo removido",
            timer: 1600,
            showConfirmButton: false
        });
    } catch (err) {
        showValidationMessage("Erro ao remover grupo: " + err.message);
    }
}

async function handleSubmit(event) {
    event.preventDefault();
    const name = groupNameInput ? groupNameInput.value.trim() : "";
    const description = groupDescriptionInput ? groupDescriptionInput.value.trim() : "";
    const selectedIds = getSelectedFriendIds();
    const allMembers = selectedIds.push(myId); 
    
    if (!name) {
        showValidationMessage("Indica um nome para o grupo.");
        return;
    }

    const isEditing = Boolean(editingGroupId);

    if (isEditing && hasSwal()) {
        const result = await window.Swal.fire({
            title: "Guardar alterações?",
            text: "O grupo será atualizado com os novos dados.",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Guardar",
            cancelButtonText: "Cancelar"
        });
        if (!result.isConfirmed) return;
    }

    try {
        if (isEditing) {
            await api.updateUserGroup(editingGroupId, name, description, selectedIds);
        } else {
            await api.createUserGroup(name, description, selectedIds);
        }

        closeModal();
        resetForm();
        await renderGroups();

        if (hasSwal()) {
            window.Swal.fire({
                icon: "success",
                title: isEditing ? "Grupo alterado" : "Grupo criado",
                text: isEditing ? "As alterações foram guardadas com sucesso." : "O novo grupo foi criado com sucesso.",
                timer: 1800,
                showConfirmButton: false
            });
        }
    } catch (err) {
        console.error("Erro ao guardar grupo:", err);
        showValidationMessage("Erro ao guardar grupo: " + err.message);
    }
}

// ── EVENTS ────────────────────────────────────────────────────────────────────
if (openModalButton) openModalButton.addEventListener("click", openModal);
if (openModalFromEmpty) openModalFromEmpty.addEventListener("click", openModal);
if (closeModalButton) closeModalButton.addEventListener("click", closeModal);
if (cancelModalButton) cancelModalButton.addEventListener("click", closeModal);
if (modalOverlay) modalOverlay.addEventListener("click", (e) => { if (e.target === modalOverlay) closeModal(); });
if (groupForm) groupForm.addEventListener("submit", handleSubmit);

document.querySelector(".btn-logout")?.addEventListener("click", () => api.logout());

// ── INIT ──────────────────────────────────────────────────────────────────────
api.ensureAuthenticated();

loadFriends().then(async () => {
    await renderGroups();
    if (window.location.hash === "#create-group") {
        openModal();
        if (window.history?.replaceState) {
            window.history.replaceState(null, "", window.location.pathname);
        }
    }
});