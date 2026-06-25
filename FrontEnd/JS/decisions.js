/* ── VoteSync — decisions.js ── */

// ── DOM REFS ──────────────────────────────────────────────────────────────────
const logoutButton            = document.querySelector("#decisions-logout-btn");
const decisionsSummaryText    = document.querySelector("#decisions-summary-text");
const decisionsListEmpty      = document.querySelector("#decisions-list-empty");
const decisionsList           = document.querySelector("#decisions-list");
const decisionEditOverlay     = document.querySelector("#decision-edit-overlay");
const decisionEditCloseButton = document.querySelector("#decision-edit-close");
const decisionEditCancelButton = document.querySelector("#decision-edit-cancel");
const decisionEditSaveButton  = document.querySelector("#decision-edit-save");
const decisionEditTitleInput  = document.querySelector("#decision-edit-title-input");
const decisionEditDescriptionInput = document.querySelector("#decision-edit-description-input");
const decisionEditEndDateInput = document.querySelector("#decision-edit-end-date-input");
const decisionEditOptionsInput = document.querySelector("#decision-edit-options-input");
const decisionEditMessage     = document.querySelector("#decision-edit-message");

// ── STATE ─────────────────────────────────────────────────────────────────────
let editingDecision  = null;
let cachedDecisions  = [];

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

// ── HELPERS ───────────────────────────────────────────────────────────────────
function hasSwal() {
    return typeof window !== "undefined" && typeof window.Swal !== "undefined";
}

function setEditMessage(message) {
    if (!decisionEditMessage) return;
    decisionEditMessage.textContent = message;
}

function showValidationMessage(message) {
    setEditMessage(message);
    if (hasSwal()) {
        window.Swal.fire({ icon: "warning", title: "Atenção", text: message, confirmButtonText: "OK" });
    }
}

// ── LOGOUT ────────────────────────────────────────────────────────────────────
async function handleLogout() {
    if (!hasSwal()) { api.logout(); return; }

    const result = await window.Swal.fire({
        title: "Terminar sessão?", text: "Vais sair da tua conta.",
        icon: "question", showCancelButton: true,
        confirmButtonText: "Sair", cancelButtonText: "Cancelar"
    });
    if (result.isConfirmed) api.logout();
}

// ── EDIT MODAL ────────────────────────────────────────────────────────────────
function openEditModal(decisionId) {
    const decision = cachedDecisions.find((d) => d.id === decisionId);
    if (!decision || !decisionEditOverlay) return;

    editingDecision = decision;
    if (decisionEditTitleInput)       decisionEditTitleInput.value       = decision.title       || "";
    if (decisionEditDescriptionInput) decisionEditDescriptionInput.value = decision.description || "";
    if (decisionEditEndDateInput)     decisionEditEndDateInput.value     = decision.end_date    || "";
    if (decisionEditOptionsInput) {
        const optionsText = Array.isArray(decision.options)
            ? decision.options.map((o) => o.option_text).join(", ")
            : "";
        decisionEditOptionsInput.value = optionsText;
    }
    setEditMessage("");
    decisionEditOverlay.hidden = false;
}

function closeEditModal() {
    if (!decisionEditOverlay) return;
    decisionEditOverlay.hidden = true;
    editingDecision = null;
    setEditMessage("");
}

// ── SYNC OPTIONS ──────────────────────────────────────────────────────────────
async function syncDecisionOptions(decision, newOptionNames) {
    const oldOptions = Array.isArray(decision.options) ? decision.options : [];
    const tasks = [];
    const maxLength = Math.max(oldOptions.length, newOptionNames.length);

    for (let i = 0; i < maxLength; i++) {
        const oldOption = oldOptions[i];
        const newName   = newOptionNames[i];

        if (oldOption && newName !== undefined) {
            if (oldOption.option_text !== newName) {
                tasks.push(api.updateOption(oldOption.id, decision.id, newName));
            }
        } else if (!oldOption && newName !== undefined) {
            tasks.push(api.createOption(decision.id, newName));
        } else if (oldOption && newName === undefined) {
            tasks.push(api.deleteOption(oldOption.id));
        }
    }
    await Promise.all(tasks);
}

// ── SAVE EDIT ─────────────────────────────────────────────────────────────────
async function saveEditedDecision() {
    if (!editingDecision) { closeEditModal(); return; }

    const title       = decisionEditTitleInput       ? decisionEditTitleInput.value.trim()       : "";
    const description = decisionEditDescriptionInput ? decisionEditDescriptionInput.value.trim() : "";
    const endDate     = decisionEditEndDateInput     ? decisionEditEndDateInput.value.trim()     : "";
    const optionsRaw  = decisionEditOptionsInput     ? decisionEditOptionsInput.value            : "";

    if (!title)   { showValidationMessage("O título não pode ficar vazio.");         return; }
    if (!endDate) { showValidationMessage("A data de término não pode ficar vazia."); return; }

    const optionNames = optionsRaw.split(",").map((v) => v.trim()).filter((v) => v.length > 0);
    if (optionNames.length < 2) { showValidationMessage("A decisão precisa de pelo menos 2 opções."); return; }

    try {
        await api.put(`/decisions/${editingDecision.id}`, {
            vote_id: editingDecision.vote_id,
            title,
            decision_text: description || title,
            description,
            end_date: endDate,
            created_by: editingDecision.created_by,
            group_id: editingDecision.roup_id,
            created_at: editingDecision.created_at,
        });

        await syncDecisionOptions(editingDecision, optionNames);
        closeEditModal();
        await renderAllDecisions();

        if (hasSwal()) {
            window.Swal.fire({ icon: "success", title: "Decisão alterada", text: "As alterações foram guardadas com sucesso.", timer: 1800, showConfirmButton: false });
        }
    } catch (err) {
        console.error("Erro ao guardar decisão:", err);
        showValidationMessage("Erro ao guardar alterações: " + (err.message || "tenta novamente"));
    }
}

// ── REMOVE DECISION ───────────────────────────────────────────────────────────
async function removeDecisionById(decisionId) {
    if (hasSwal()) {
        const result = await window.Swal.fire({
            title: "Remover decisão?", text: "Esta ação não pode ser desfeita.",
            icon: "warning", showCancelButton: true,
            confirmButtonText: "Remover", cancelButtonText: "Cancelar", confirmButtonColor: "#c0392b"
        });
        if (!result.isConfirmed) return;
    }

    try {
        await api.deleteDecision(decisionId);
        await renderAllDecisions();
        if (hasSwal()) window.Swal.fire({ icon: "success", title: "Decisão removida", timer: 1600, showConfirmButton: false });
    } catch (err) {
        console.error("Erro ao remover decisão:", err);
        if (hasSwal()) window.Swal.fire({ icon: "error", title: "Erro", text: "Não foi possível remover a decisão: " + (err.message || "tenta novamente") });
    }
}

function createDecisionListItem(decision, userName) {
    const optionsCount = Array.isArray(decision.options) ? decision.options.length : 0;
    const isCreator = decision.created_by === userName;

    const item = document.createElement("article");
    item.className = "decision-list-item";

    const infoBox   = document.createElement("div");
    infoBox.className = "info-box";
    const infoLabel = document.createElement("span");
    infoLabel.textContent = "Estado:";
    const infoValue = document.createElement("strong");
    infoValue.textContent = "Decisão criada";
    infoBox.appendChild(infoLabel);
    infoBox.appendChild(infoValue);

    const winnerBox = document.createElement("div");
    winnerBox.className = "winner-box";
    const winnerDescription = document.createElement("small");
    winnerDescription.textContent = `${optionsCount} opções prontas para votação.`;
    const winnerValue = document.createElement("h3");
    winnerValue.textContent = decision.title || "Decisão sem título";
    const createdDate = document.createElement("p");
    createdDate.className   = "decision-created-date";
    createdDate.textContent = `Criada em: ${decision.created_at ? decision.created_at.split("T")[0] : "--/--/----"}`;
    winnerBox.appendChild(winnerDescription);
    winnerBox.appendChild(winnerValue);
    winnerBox.appendChild(createdDate);

    const viewMoreButton = document.createElement("button");
    viewMoreButton.className = "view-btn";
    viewMoreButton.type      = "button";
    viewMoreButton.innerHTML = 'View More <i class="fa-solid fa-angle-right"></i>';
    viewMoreButton.addEventListener("click", () => {
        localStorage.setItem("votesync.decision.latest", JSON.stringify(decision));
        window.location.href = "./decisionMaking.html";
    });

    // ── Botões só visíveis para o criador ────────────────────────────────────
    const actionsWrap = document.createElement("div");
    actionsWrap.className = "decision-item-actions";

    if (isCreator) {
        const editButton = document.createElement("button");
        editButton.className = "decision-action-btn decision-edit-btn";
        editButton.type      = "button";
        editButton.innerHTML = '<i class="fa-solid fa-pen-to-square" aria-hidden="true"></i>';
        editButton.setAttribute("aria-label", "Alterar decisão");
        editButton.addEventListener("click", () => openEditModal(decision.id));

        const removeButton = document.createElement("button");
        removeButton.className = "decision-action-btn decision-remove-btn";
        removeButton.type      = "button";
        removeButton.innerHTML = '<i class="fa-solid fa-trash" aria-hidden="true"></i>';
        removeButton.setAttribute("aria-label", "Remover decisão");
        removeButton.addEventListener("click", () => removeDecisionById(decision.id));

        actionsWrap.appendChild(editButton);
        actionsWrap.appendChild(removeButton);
    }

    item.appendChild(infoBox);
    item.appendChild(winnerBox);
    item.appendChild(viewMoreButton);
    item.appendChild(actionsWrap);
    return item;
}

async function renderAllDecisions() {
    const session = api.getSession();
    const userId = session?.user?.id;
    const user = await api.getUser(userId);
    const userGroups = await api.getGroups(userId);
    const userGroupIds = new Set(userGroups.map(g => g.id));

    const allDecisions = await api.getDecisions();
    const decisions = allDecisions.filter(d => userGroupIds.has(d.group_id));
    
    cachedDecisions = decisions;

    const orderedDecisions = [...decisions].sort((a, b) => (b.id || 0) - (a.id || 0));

    if (decisionsSummaryText) {
        if (decisions.length === 0)      decisionsSummaryText.textContent = "Sem decisões";
        else if (decisions.length === 1) decisionsSummaryText.textContent = "1 decisão criada";
        else                             decisionsSummaryText.textContent = `${decisions.length} decisões criadas`;
    }

    if (!decisionsList) return;
    decisionsList.innerHTML = "";

    if (orderedDecisions.length === 0) {
        if (decisionsListEmpty) decisionsListEmpty.hidden = false;
        return;
    }

    if (decisionsListEmpty) decisionsListEmpty.hidden = true;
    orderedDecisions.forEach((decision) => decisionsList.appendChild(createDecisionListItem(decision, user.name)));

    localStorage.setItem("votesync.decision.latest", JSON.stringify(orderedDecisions[0]));
}

// ── EVENTS ────────────────────────────────────────────────────────────────────
if (logoutButton)             logoutButton.addEventListener("click", handleLogout);
if (decisionEditCloseButton)  decisionEditCloseButton.addEventListener("click", closeEditModal);
if (decisionEditCancelButton) decisionEditCancelButton.addEventListener("click", closeEditModal);
if (decisionEditSaveButton)   decisionEditSaveButton.addEventListener("click", saveEditedDecision);
if (decisionEditOverlay)      decisionEditOverlay.addEventListener("click", (e) => { if (e.target === decisionEditOverlay) closeEditModal(); });

// ── INIT ──────────────────────────────────────────────────────────────────────
api.ensureAuthenticated();
renderAllDecisions();