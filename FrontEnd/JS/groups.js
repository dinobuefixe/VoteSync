/* ── VoteSync — groups.js ── */

// ── DOM REFS ──────────────────────────────────────────────────────────────────
const groupsSubtitle      = document.querySelector("#groups-subtitle");
const groupsEmptyState    = document.querySelector("#groups-empty-state");
const groupsList          = document.querySelector("#groups-list");
const modalOverlay        = document.querySelector("#group-modal-overlay");
const openModalButton     = document.querySelector("#open-create-group-modal");
const openModalFromEmpty  = document.querySelector("#open-create-group-empty");
const closeModalButton    = document.querySelector("#close-group-modal");
const cancelModalButton   = document.querySelector("#cancel-group-modal");
const groupForm           = document.querySelector("#group-form");
const groupNameInput      = document.querySelector("#group-name-input");
const groupDescriptionInput = document.querySelector("#group-description-input");
const groupFriendsSelect  = document.querySelector("#group-friends-select");
const groupFormMessage    = document.querySelector("#group-form-message");
const groupModalTitle     = document.querySelector("#group-modal-title");
const groupModalSubmit    = document.querySelector("#group-modal-submit");

// ── STATE ─────────────────────────────────────────────────────────────────────
let editingGroupId = null;
let cachedFriends  = [];

const session = api.getSession();
const myId    = parseInt(session?.user?.id);

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
        groupModalTitle.textContent  = "Editar grupo";
        groupModalSubmit.textContent = "Guardar alterações";
        return;
    }
    groupModalTitle.textContent  = "Criar novo grupo";
    groupModalSubmit.textContent = "Criar grupo";
}

function populateFriendsSelect() {
    if (!groupFriendsSelect) return;
    groupFriendsSelect.innerHTML = "";

    if (cachedFriends.length === 0) {
        const option = document.createElement("option");
        option.value    = "";
        option.textContent = "Sem amigos disponíveis";
        option.disabled = true;
        option.selected = true;
        groupFriendsSelect.appendChild(option);
        return;
    }

    cachedFriends.forEach((friend) => {
        const option = document.createElement("option");
        option.value       = friend.id;
        option.textContent = friend.name;
        groupFriendsSelect.appendChild(option);
    });
}

function setSelectedFriendOptions(memberUserIds) {
    if (!groupFriendsSelect) return;
    const ids = Array.isArray(memberUserIds) ? memberUserIds.map(String) : [];
    Array.from(groupFriendsSelect.options).forEach((option) => {
        option.selected = ids.includes(String(option.value));
    });
}

// ── RENDER GROUPS ─────────────────────────────────────────────────────────────
async function renderGroups() {
    if (!groupsList || !groupsSubtitle || !groupsEmptyState) return;

    const groups = await api.getUserGroups();

    groupsSubtitle.textContent = `${groups.length} grupos`;

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
        const members     = Array.isArray(group.members) ? group.members : [];
        const memberNames = members.map(m => m.user?.name || "");

        const card = document.createElement("article");
        card.className = "group-card";

        const title = document.createElement("h3");
        title.className   = "group-card-title";
        title.textContent = group.name || "Grupo sem nome";

        const membersLabel = document.createElement("p");
        membersLabel.className   = "group-members-label";
        membersLabel.textContent = members.length > 0
            ? `${members.length} amigo(s) no grupo`
            : "Sem amigos neste grupo";

        const membersWrapper = document.createElement("div");
        membersWrapper.className = "group-members";
        memberNames.slice(0, 8).forEach((name) => {
            const chip = document.createElement("span");
            chip.className   = "group-member-chip";
            chip.textContent = name;
            membersWrapper.appendChild(chip);
        });
        if (memberNames.length > 8) {
            const chip = document.createElement("span");
            chip.className   = "group-member-chip";
            chip.textContent = `+${memberNames.length - 8}`;
            membersWrapper.appendChild(chip);
        }

        const actions    = document.createElement("div");
        actions.className = "group-card-actions";

        const editButton = document.createElement("button");
        editButton.type      = "button";
        editButton.className = "group-action-btn edit";
        editButton.innerHTML = '<i class="fa-regular fa-pen-to-square"></i> Editar';
        editButton.addEventListener("click", () => openEditModal(group));

        const deleteButton = document.createElement("button");
        deleteButton.type      = "button";
        deleteButton.className = "group-action-btn delete";
        deleteButton.innerHTML = '<i class="fa-regular fa-trash-can"></i> Remover';
        deleteButton.addEventListener("click", () => removeGroup(group.id));

        actions.appendChild(editButton);
        actions.appendChild(deleteButton);
        card.appendChild(title);
        card.appendChild(membersLabel);
        card.appendChild(membersWrapper);
        card.appendChild(actions);
        groupsList.appendChild(card);
    });
}

// ── MODAL ─────────────────────────────────────────────────────────────────────
function resetForm() {
    if (groupForm) groupForm.reset();
    if (groupFriendsSelect) Array.from(groupFriendsSelect.options).forEach((o) => { o.selected = false; });
    editingGroupId = null;
    setModalMode("create");
    setMessage("");
}

function openModal() {
    if (!modalOverlay) return;
    populateFriendsSelect();
    resetForm();
    modalOverlay.hidden = false;
}

function openEditModal(group) {
    if (!modalOverlay || !group) return;
    populateFriendsSelect();
    resetForm();
    editingGroupId = group.id;
    setModalMode("edit");
    if (groupNameInput)        groupNameInput.value        = group.name        || "";
    if (groupDescriptionInput) groupDescriptionInput.value = group.description || "";
    const memberUserIds = (group.members || []).map(m => m.user_id);
    setSelectedFriendOptions(memberUserIds);
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
            title: "Remover grupo?", text: "Esta ação não pode ser desfeita.",
            icon: "warning", showCancelButton: true,
            confirmButtonText: "Remover", cancelButtonText: "Cancelar",
            confirmButtonColor: "#c0392b"
        });
        if (!result.isConfirmed) return;
    } else {
        if (!window.confirm("Queres remover este grupo?")) return;
    }

    try {
        await api.deleteUserGroup(groupId);
        await renderGroups();
        if (hasSwal()) window.Swal.fire({ icon: "success", title: "Grupo removido", timer: 1600, showConfirmButton: false });
    } catch (err) {
        showValidationMessage("Erro ao remover grupo: " + err.message);
    }
}

async function handleSubmit(event) {
    event.preventDefault();
    const name        = groupNameInput        ? groupNameInput.value.trim()        : "";
    const description = groupDescriptionInput ? groupDescriptionInput.value.trim() : "";

    if (!name) { showValidationMessage("Indica um nome para o grupo."); return; }

    const selectedIds = groupFriendsSelect
        ? Array.from(groupFriendsSelect.selectedOptions).map((o) => parseInt(o.value)).filter(Boolean)
        : [];

    const isEditing = Boolean(editingGroupId);

    if (isEditing && hasSwal()) {
        const result = await window.Swal.fire({
            title: "Guardar alterações?", text: "O grupo será atualizado com os novos dados.",
            icon: "question", showCancelButton: true,
            confirmButtonText: "Guardar", cancelButtonText: "Cancelar"
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
                timer: 1800, showConfirmButton: false
            });
        }
    } catch (err) {
        showValidationMessage("Erro ao guardar grupo: " + err.message);
    }
}

// ── EVENTS ────────────────────────────────────────────────────────────────────
if (openModalButton)    openModalButton.addEventListener("click", openModal);
if (openModalFromEmpty) openModalFromEmpty.addEventListener("click", openModal);
if (closeModalButton)   closeModalButton.addEventListener("click", closeModal);
if (cancelModalButton)  cancelModalButton.addEventListener("click", closeModal);
if (modalOverlay)       modalOverlay.addEventListener("click", (e) => { if (e.target === modalOverlay) closeModal(); });
if (groupForm)          groupForm.addEventListener("submit", handleSubmit);

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