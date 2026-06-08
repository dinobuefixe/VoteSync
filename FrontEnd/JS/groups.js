const FRIENDS_KEY = "votesync.friends";
const GROUPS_KEY = "votesync.groups";

const groupsSubtitle = document.querySelector("#groups-subtitle");
const groupsEmptyState = document.querySelector("#groups-empty-state");
const groupsList = document.querySelector("#groups-list");

const modalOverlay = document.querySelector("#group-modal-overlay");
const openModalButton = document.querySelector("#open-create-group-modal");
const openModalFromEmptyButton = document.querySelector("#open-create-group-empty");
const closeModalButton = document.querySelector("#close-group-modal");
const cancelModalButton = document.querySelector("#cancel-group-modal");

const groupForm = document.querySelector("#group-form");
const groupNameInput = document.querySelector("#group-name-input");
const groupDescriptionInput = document.querySelector("#group-description-input");
const groupFriendsSelect = document.querySelector("#group-friends-select");
const groupFormMessage = document.querySelector("#group-form-message");
const groupModalTitle = document.querySelector("#group-modal-title");
const groupModalSubmit = document.querySelector("#group-modal-submit");

let editingGroupId = null;

function hasSwal() {
    return typeof window !== "undefined" && typeof window.Swal !== "undefined";
}

function normalizeName(entity, fallbackLabel) {
    if (typeof entity === "string") {
        return entity;
    }

    if (!entity || typeof entity !== "object") {
        return fallbackLabel;
    }

    return entity.name || entity.title || entity.label || fallbackLabel;
}

function getStoredArray(key) {
    const raw = localStorage.getItem(key);
    if (!raw) {
        return [];
    }

    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function getFriends() {
    return getStoredArray(FRIENDS_KEY).map((friend, index) => ({
        id: typeof friend === "object" && friend && friend.id ? String(friend.id) : `friend-${index}`,
        name: normalizeName(friend, `Amigo ${index + 1}`)
    }));
}

function getGroups() {
    return getStoredArray(GROUPS_KEY);
}

function saveGroups(groups) {
    localStorage.setItem(GROUPS_KEY, JSON.stringify(groups));
}

function setMessage(message) {
    if (!groupFormMessage) {
        return;
    }

    groupFormMessage.textContent = message;
}

function showValidationMessage(message) {
    setMessage(message);

    if (hasSwal()) {
        window.Swal.fire({
            icon: "warning",
            title: "Atenção",
            text: message,
            confirmButtonText: "OK"
        });
    }
}

function setModalMode(mode) {
    if (!groupModalTitle || !groupModalSubmit) {
        return;
    }

    if (mode === "edit") {
        groupModalTitle.textContent = "Editar grupo";
        groupModalSubmit.textContent = "Guardar alterações";
        return;
    }

    groupModalTitle.textContent = "Criar novo grupo";
    groupModalSubmit.textContent = "Criar grupo";
}

function setSelectedFriendOptions(memberNames) {
    if (!groupFriendsSelect) {
        return;
    }

    const expectedNames = Array.isArray(memberNames) ? memberNames : [];
    Array.from(groupFriendsSelect.options).forEach((option) => {
        option.selected = expectedNames.includes(option.textContent || "");
    });
}

function populateFriendsSelect() {
    if (!groupFriendsSelect) {
        return;
    }

    const friends = getFriends();
    groupFriendsSelect.innerHTML = "";

    if (friends.length === 0) {
        const option = document.createElement("option");
        option.value = "";
        option.textContent = "Sem amigos disponíveis";
        option.disabled = true;
        option.selected = true;
        groupFriendsSelect.appendChild(option);
        return;
    }

    friends.forEach((friend) => {
        const option = document.createElement("option");
        option.value = friend.id;
        option.textContent = friend.name;
        groupFriendsSelect.appendChild(option);
    });
}

function renderGroups() {
    if (!groupsList || !groupsSubtitle || !groupsEmptyState) {
        return;
    }

    const groups = getGroups();
    groupsSubtitle.textContent = `${groups.length} groups you're part of`;

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
        const card = document.createElement("article");
        card.className = "group-card";

        const title = document.createElement("h3");
        title.className = "group-card-title";
        title.textContent = group.name || "Grupo sem nome";

        const description = document.createElement("p");
        description.className = "group-card-description";
        description.textContent = group.description && group.description.trim()
            ? group.description
            : "Sem descrição";

        const membersLabel = document.createElement("p");
        membersLabel.className = "group-members-label";

        const members = Array.isArray(group.members) ? group.members : [];
        membersLabel.textContent = members.length > 0
            ? `${members.length} amigo(s) no grupo`
            : "Sem amigos neste grupo";

        const membersWrapper = document.createElement("div");
        membersWrapper.className = "group-members";

        members.slice(0, 8).forEach((memberName) => {
            const chip = document.createElement("span");
            chip.className = "group-member-chip";
            chip.textContent = memberName;
            membersWrapper.appendChild(chip);
        });

        if (members.length > 8) {
            const chip = document.createElement("span");
            chip.className = "group-member-chip";
            chip.textContent = `+${members.length - 8}`;
            membersWrapper.appendChild(chip);
        }

        const actions = document.createElement("div");
        actions.className = "group-card-actions";

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "group-action-btn edit";
        editButton.innerHTML = '<i class="fa-regular fa-pen-to-square"></i> Editar';
        editButton.addEventListener("click", () => openEditModal(group));

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "group-action-btn delete";
        deleteButton.innerHTML = '<i class="fa-regular fa-trash-can"></i> Remover';
        deleteButton.addEventListener("click", () => removeGroup(group.id));

        actions.appendChild(editButton);
        actions.appendChild(deleteButton);

        card.appendChild(title);
        card.appendChild(description);
        card.appendChild(membersLabel);
        card.appendChild(membersWrapper);
        card.appendChild(actions);
        groupsList.appendChild(card);
    });
}

function resetForm() {
    if (groupForm) {
        groupForm.reset();
    }

    if (groupFriendsSelect) {
        Array.from(groupFriendsSelect.options).forEach((option) => {
            option.selected = false;
        });
    }

    editingGroupId = null;
    setModalMode("create");
    setMessage("");
}

function openModal() {
    if (!modalOverlay) {
        return;
    }

    populateFriendsSelect();
    resetForm();
    modalOverlay.hidden = false;
}

function openEditModal(group) {
    if (!modalOverlay || !group) {
        return;
    }

    populateFriendsSelect();
    resetForm();
    editingGroupId = group.id || null;
    setModalMode("edit");

    if (groupNameInput) {
        groupNameInput.value = group.name || "";
    }

    if (groupDescriptionInput) {
        groupDescriptionInput.value = group.description || "";
    }

    setSelectedFriendOptions(Array.isArray(group.members) ? group.members : []);
    modalOverlay.hidden = false;
}

function closeModal() {
    if (!modalOverlay) {
        return;
    }

    modalOverlay.hidden = true;
    setMessage("");
}

async function removeGroup(groupId) {
    if (!groupId) {
        return;
    }

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

        if (!result.isConfirmed) {
            return;
        }
    } else {
        const accepted = window.confirm("Queres remover este grupo?");
        if (!accepted) {
            return;
        }
    }

    const nextGroups = getGroups().filter((group) => String(group.id) !== String(groupId));
    saveGroups(nextGroups);
    renderGroups();

    if (hasSwal()) {
        window.Swal.fire({
            icon: "success",
            title: "Grupo removido",
            timer: 1600,
            showConfirmButton: false
        });
    }
}

async function handleSubmit(event) {
    event.preventDefault();

    const name = groupNameInput ? groupNameInput.value.trim() : "";
    const description = groupDescriptionInput ? groupDescriptionInput.value.trim() : "";

    if (!name) {
        showValidationMessage("Indica um nome para o grupo.");
        return;
    }

    const existingGroups = getGroups();
    const duplicate = existingGroups.some((group) => {
        const sameName = typeof group.name === "string" && group.name.toLowerCase() === name.toLowerCase();
        const sameGroup = editingGroupId && String(group.id) === String(editingGroupId);
        return sameName && !sameGroup;
    });

    if (duplicate) {
        showValidationMessage("Já existe um grupo com esse nome.");
        return;
    }

    const friends = getFriends();
    const selectedIds = groupFriendsSelect
        ? Array.from(groupFriendsSelect.selectedOptions)
            .map((option) => option.value)
            .filter((value) => value)
        : [];

    const selectedMembers = friends
        .filter((friend) => selectedIds.includes(friend.id))
        .map((friend) => friend.name);

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

        if (!result.isConfirmed) {
            return;
        }
    }

    if (isEditing) {
        const updatedGroups = existingGroups.map((group) => {
            if (String(group.id) !== String(editingGroupId)) {
                return group;
            }

            return {
                ...group,
                name,
                description,
                members: selectedMembers,
                updatedAt: new Date().toISOString()
            };
        });

        saveGroups(updatedGroups);
    } else {
        const group = {
            id: `group-${Date.now()}`,
            name,
            description,
            members: selectedMembers,
            createdAt: new Date().toISOString()
        };

        existingGroups.push(group);
        saveGroups(existingGroups);
    }

    closeModal();
    resetForm();
    renderGroups();

    if (hasSwal()) {
        window.Swal.fire({
            icon: "success",
            title: isEditing ? "Grupo alterado" : "Grupo criado",
            text: isEditing
                ? "As alterações foram guardadas com sucesso."
                : "O novo grupo foi criado com sucesso.",
            timer: 1800,
            showConfirmButton: false
        });
    }
}

if (openModalButton) {
    openModalButton.addEventListener("click", openModal);
}

if (openModalFromEmptyButton) {
    openModalFromEmptyButton.addEventListener("click", openModal);
}

if (closeModalButton) {
    closeModalButton.addEventListener("click", closeModal);
}

if (cancelModalButton) {
    cancelModalButton.addEventListener("click", closeModal);
}

if (modalOverlay) {
    modalOverlay.addEventListener("click", (event) => {
        if (event.target === modalOverlay) {
            closeModal();
        }
    });
}

if (groupForm) {
    groupForm.addEventListener("submit", handleSubmit);
}

renderGroups();

if (window.location.hash === "#create-group") {
    openModal();
    if (window.history && typeof window.history.replaceState === "function") {
        window.history.replaceState(null, "", window.location.pathname);
    }
}
