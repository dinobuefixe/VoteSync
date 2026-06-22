<<<<<<< HEAD
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
=======
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
>>>>>>> f094ba3 (Fix auth and friendships backend issues; update frontend deployment docs)

// ── STATE ─────────────────────────────────────────────────────────────────────
let editingGroupId = null;
let cachedFriends  = [];

const session = api.getSession();
<<<<<<< HEAD
const myId = parseInt(session?.user?.id);
=======
const myId    = parseInt(session?.user?.id);
>>>>>>> f094ba3 (Fix auth and friendships backend issues; update frontend deployment docs)

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
        groupModalTitle.textContent  = "Editar grupo";
        groupModalSubmit.textContent = "Guardar alterações";
        return;
    }
    groupModalTitle.textContent  = "Criar novo grupo";
    groupModalSubmit.textContent = "Criar grupo";
}

<<<<<<< HEAD
// ── RENDERIZAR CHECKBOXES DE AMIGOS ───────────────────────────────────────────
function populateFriendsCheckboxes(selectedIds = []) {
    if (!groupFriendsContainer) return;

    groupFriendsContainer.innerHTML = "";

    if (cachedFriends.length === 0) {
        if (groupFriendsEmpty) {
            groupFriendsEmpty.textContent = "Sem amigos disponíveis";
            groupFriendsEmpty.hidden = false;
        }
=======
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
>>>>>>> f094ba3 (Fix auth and friendships backend issues; update frontend deployment docs)
        return;
    }

    if (groupFriendsEmpty) {
        groupFriendsEmpty.hidden = true;
    }

    cachedFriends.forEach((friend) => {
<<<<<<< HEAD
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
=======
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
>>>>>>> f094ba3 (Fix auth and friendships backend issues; update frontend deployment docs)
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
<<<<<<< HEAD
        const members = Array.isArray(group.members) ? group.members : [];
=======
        const members     = Array.isArray(group.members) ? group.members : [];
>>>>>>> f094ba3 (Fix auth and friendships backend issues; update frontend deployment docs)
        const memberNames = members.map(m => m.user?.name || "");

        const card = document.createElement("article");
        card.className = "group-card";

        const title = document.createElement("h3");
        title.className   = "group-card-title";
        title.textContent = group.name || "Grupo sem nome";

        const membersLabel = document.createElement("p");
<<<<<<< HEAD
        membersLabel.className = "group-members-label";
=======
        membersLabel.className   = "group-members-label";
>>>>>>> f094ba3 (Fix auth and friendships backend issues; update frontend deployment docs)
        membersLabel.textContent = members.length > 0
            ? `${members.length} amigo(s) no grupo`
            : "Sem amigos neste grupo";

        const membersWrapper = document.createElement("div");
        membersWrapper.className = "group-members";
        memberNames.slice(0, 8).forEach((name) => {
            const chip = document.createElement("span");
<<<<<<< HEAD
            chip.className = "group-member-chip";
=======
            chip.className   = "group-member-chip";
>>>>>>> f094ba3 (Fix auth and friendships backend issues; update frontend deployment docs)
            chip.textContent = name;
            membersWrapper.appendChild(chip);
        });
        if (memberNames.length > 8) {
            const chip = document.createElement("span");
<<<<<<< HEAD
            chip.className = "group-member-chip";
=======
            chip.className   = "group-member-chip";
>>>>>>> f094ba3 (Fix auth and friendships backend issues; update frontend deployment docs)
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
<<<<<<< HEAD

    const memberUserIds = (group.members || []).map(m => m.user_id);
    populateFriendsCheckboxes(memberUserIds);

=======
    populateFriendsSelect();
    resetForm();
>>>>>>> f094ba3 (Fix auth and friendships backend issues; update frontend deployment docs)
    editingGroupId = group.id;
    setModalMode("edit");
    if (groupNameInput)        groupNameInput.value        = group.name        || "";
    if (groupDescriptionInput) groupDescriptionInput.value = group.description || "";
<<<<<<< HEAD

    setMessage("");
=======
    const memberUserIds = (group.members || []).map(m => m.user_id);
    setSelectedFriendOptions(memberUserIds);
>>>>>>> f094ba3 (Fix auth and friendships backend issues; update frontend deployment docs)
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
<<<<<<< HEAD
        if (hasSwal()) window.Swal.fire({
            icon: "success",
            title: "Grupo removido",
            timer: 1600,
            showConfirmButton: false
        });
=======
        if (hasSwal()) window.Swal.fire({ icon: "success", title: "Grupo removido", timer: 1600, showConfirmButton: false });
>>>>>>> f094ba3 (Fix auth and friendships backend issues; update frontend deployment docs)
    } catch (err) {
        showValidationMessage("Erro ao remover grupo: " + err.message);
    }
}

async function handleSubmit(event) {
    event.preventDefault();
    const name        = groupNameInput        ? groupNameInput.value.trim()        : "";
    const description = groupDescriptionInput ? groupDescriptionInput.value.trim() : "";
    const selectedIds = getSelectedFriendIds();

<<<<<<< HEAD
    if (!name) {
        showValidationMessage("Indica um nome para o grupo.");
        return;
    }
=======
    if (!name) { showValidationMessage("Indica um nome para o grupo."); return; }

    const selectedIds = groupFriendsSelect
        ? Array.from(groupFriendsSelect.selectedOptions).map((o) => parseInt(o.value)).filter(Boolean)
        : [];
>>>>>>> f094ba3 (Fix auth and friendships backend issues; update frontend deployment docs)

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
<<<<<<< HEAD
                timer: 1800,
                showConfirmButton: false
            });
        }
    } catch (err) {
        console.error("Erro ao guardar grupo:", err);
=======
                timer: 1800, showConfirmButton: false
            });
        }
    } catch (err) {
>>>>>>> f094ba3 (Fix auth and friendships backend issues; update frontend deployment docs)
        showValidationMessage("Erro ao guardar grupo: " + err.message);
    }
}

// ── EVENTS ────────────────────────────────────────────────────────────────────
<<<<<<< HEAD
if (openModalButton) openModalButton.addEventListener("click", openModal);
if (openModalFromEmpty) openModalFromEmpty.addEventListener("click", openModal);
if (closeModalButton) closeModalButton.addEventListener("click", closeModal);
if (cancelModalButton) cancelModalButton.addEventListener("click", closeModal);
if (modalOverlay) modalOverlay.addEventListener("click", (e) => { if (e.target === modalOverlay) closeModal(); });
if (groupForm) groupForm.addEventListener("submit", handleSubmit);
=======
if (openModalButton)    openModalButton.addEventListener("click", openModal);
if (openModalFromEmpty) openModalFromEmpty.addEventListener("click", openModal);
if (closeModalButton)   closeModalButton.addEventListener("click", closeModal);
if (cancelModalButton)  cancelModalButton.addEventListener("click", closeModal);
if (modalOverlay)       modalOverlay.addEventListener("click", (e) => { if (e.target === modalOverlay) closeModal(); });
if (groupForm)          groupForm.addEventListener("submit", handleSubmit);

document.querySelector(".btn-logout")?.addEventListener("click", () => api.logout());
>>>>>>> f094ba3 (Fix auth and friendships backend issues; update frontend deployment docs)

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