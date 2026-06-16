const SESSION_KEY = "votesync.session";
const DECISIONS_KEY = "votesync.decisions";
const DECISION_TEMPLATE_KEY = "votesync.decision.latest";

const logoutButton = document.querySelector("#decisions-logout-btn");
const decisionsSummaryText = document.querySelector("#decisions-summary-text");
const decisionsListEmpty = document.querySelector("#decisions-list-empty");
const decisionsList = document.querySelector("#decisions-list");
const decisionEditOverlay = document.querySelector("#decision-edit-overlay");
const decisionEditCloseButton = document.querySelector("#decision-edit-close");
const decisionEditCancelButton = document.querySelector("#decision-edit-cancel");
const decisionEditSaveButton = document.querySelector("#decision-edit-save");
const decisionEditTitleInput = document.querySelector("#decision-edit-title-input");
const decisionEditDescriptionInput = document.querySelector("#decision-edit-description-input");
const decisionEditEndDateInput = document.querySelector("#decision-edit-end-date-input");
const decisionEditOptionsInput = document.querySelector("#decision-edit-options-input");
const decisionEditMessage = document.querySelector("#decision-edit-message");

let editingDecisionIndex = null;

function hasSwal() {
    return typeof window !== "undefined" && typeof window.Swal !== "undefined";
}

function getSession() {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) {
        return null;
    }

    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

function getDecisions() {
    const raw = localStorage.getItem(DECISIONS_KEY);
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

function saveDecisions(decisions) {
    localStorage.setItem(DECISIONS_KEY, JSON.stringify(decisions));
}

function saveLatestDecision(decision) {
    localStorage.setItem(DECISION_TEMPLATE_KEY, JSON.stringify(decision));
}

function syncLatestDecision(decisions) {
    if (!Array.isArray(decisions) || decisions.length === 0) {
        localStorage.removeItem(DECISION_TEMPLATE_KEY);
        return;
    }

    saveLatestDecision(decisions[decisions.length - 1]);
}

function clearSession() {
    localStorage.removeItem(SESSION_KEY);
}

function redirectToLogin() {
    window.location.href = "./index.html";
}

function ensureAuthenticated() {
    const session = getSession();
    if (!session || !session.user || !session.token) {
        redirectToLogin();
    }
}

async function handleLogout() {
    if (!hasSwal()) {
        clearSession();
        redirectToLogin();
        return;
    }

    const result = await window.Swal.fire({
        title: "Terminar sessao?",
        text: "Vais sair da tua conta.",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sair",
        cancelButtonText: "Cancelar"
    });

    if (result.isConfirmed) {
        clearSession();
        redirectToLogin();
    }
}

function setEditMessage(message) {
    if (!decisionEditMessage) {
        return;
    }

    decisionEditMessage.textContent = message;
}

function showValidationMessage(message) {
    setEditMessage(message);

    if (hasSwal()) {
        window.Swal.fire({
            icon: "warning",
            title: "Atenção",
            text: message,
            confirmButtonText: "OK"
        });
    }
}

function openEditModal(index) {
    const decisions = getDecisions();
    if (index < 0 || index >= decisions.length || !decisionEditOverlay) {
        return;
    }

    const decision = decisions[index];
    editingDecisionIndex = index;

    if (decisionEditTitleInput) {
        decisionEditTitleInput.value = decision && decision.title ? decision.title : "";
    }

    if (decisionEditDescriptionInput) {
        decisionEditDescriptionInput.value = decision && decision.description ? decision.description : "";
    }

    if (decisionEditEndDateInput) {
        decisionEditEndDateInput.value = decision && decision.endDate ? decision.endDate : "";
    }

    if (decisionEditOptionsInput) {
        const optionsText = decision && Array.isArray(decision.options)
            ? decision.options.map((option) => option.name).join(", ")
            : "";
        decisionEditOptionsInput.value = optionsText;
    }

    setEditMessage("");
    decisionEditOverlay.hidden = false;
}

function closeEditModal() {
    if (!decisionEditOverlay) {
        return;
    }

    decisionEditOverlay.hidden = true;
    editingDecisionIndex = null;
    setEditMessage("");
}

function saveEditedDecision() {
    const decisions = getDecisions();
    if (editingDecisionIndex === null || editingDecisionIndex < 0 || editingDecisionIndex >= decisions.length) {
        closeEditModal();
        return;
    }

    const title = decisionEditTitleInput ? decisionEditTitleInput.value.trim() : "";
    const description = decisionEditDescriptionInput ? decisionEditDescriptionInput.value.trim() : "";
    const endDate = decisionEditEndDateInput ? decisionEditEndDateInput.value.trim() : "";
    const optionsRaw = decisionEditOptionsInput ? decisionEditOptionsInput.value : "";

    if (!title) {
        showValidationMessage("O titulo nao pode ficar vazio.");
        return;
    }

    if (!endDate) {
        showValidationMessage("A data de termino nao pode ficar vazia.");
        return;
    }

    const optionNames = optionsRaw
        .split(",")
        .map((value) => value.trim())
        .filter((value) => value.length > 0);

    if (optionNames.length < 2) {
        showValidationMessage("A decisao precisa de pelo menos 2 opcoes.");
        return;
    }

    const current = decisions[editingDecisionIndex];
    decisions[editingDecisionIndex] = {
        ...current,
        title,
        description,
        endDate,
        options: optionNames.map((name) => ({ name, votes: 0 }))
    };

    saveDecisions(decisions);
    syncLatestDecision(decisions);
    closeEditModal();
    renderAllDecisions();

    if (hasSwal()) {
        window.Swal.fire({
            icon: "success",
            title: "Decisão alterada",
            text: "As alterações foram guardadas com sucesso.",
            timer: 1800,
            showConfirmButton: false
        });
    }
}

function redirectToDecisionTemplate() {
    window.location.href = "./decisionMaking.html";
}

function editDecisionAtIndex(index) {
    openEditModal(index);
}

async function removeDecisionAtIndex(index) {
    const decisions = getDecisions();
    if (index < 0 || index >= decisions.length) {
        return;
    }

    if (hasSwal()) {
        const result = await window.Swal.fire({
            title: "Remover decisão?",
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
    }

    decisions.splice(index, 1);
    saveDecisions(decisions);
    syncLatestDecision(decisions);
    renderAllDecisions();

    if (hasSwal()) {
        window.Swal.fire({
            icon: "success",
            title: "Decisão removida",
            timer: 1600,
            showConfirmButton: false
        });
    }
}
function handleLogoClick(e) {
    e.preventDefault();
    const session = getSession();
    if (session && session.user) {
        window.location.href = session.user.is_admin ? "./admin.html" : "./dashboard.html";
    } else {
        window.location.href = "./index.html";
    }
}

function createDecisionListItem(decision, decisionIndex) {
    const optionsCount = Array.isArray(decision.options) ? decision.options.length : 0;

    const item = document.createElement("article");
    item.className = "decision-list-item";

    const infoBox = document.createElement("div");
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
    createdDate.className = "decision-created-date";
    createdDate.textContent = `Criada em: ${decision && decision.date ? decision.date : "--/--/----"}`;

    winnerBox.appendChild(winnerDescription);
    winnerBox.appendChild(winnerValue);
    winnerBox.appendChild(createdDate);

    const viewMoreButton = document.createElement("button");
    viewMoreButton.className = "view-btn";
    viewMoreButton.type = "button";
    viewMoreButton.innerHTML = 'View More <i class="fa-solid fa-angle-right"></i>';
    viewMoreButton.addEventListener("click", () => {
        saveLatestDecision(decision);
        redirectToDecisionTemplate();
    });
 

    const actionsWrap = document.createElement("div");
    actionsWrap.className = "decision-item-actions";

    const editButton = document.createElement("button");
    editButton.className = "decision-action-btn decision-edit-btn";
    editButton.type = "button";
    editButton.innerHTML = '<i class="fa-solid fa-pen-to-square" aria-hidden="true"></i>';
    editButton.setAttribute("aria-label", "Alterar decisão");
    editButton.title = "Alterar decisão";
    editButton.addEventListener("click", () => editDecisionAtIndex(decisionIndex));

    const removeButton = document.createElement("button");
    removeButton.className = "decision-action-btn decision-remove-btn";
    removeButton.type = "button";
    removeButton.innerHTML = '<i class="fa-solid fa-trash" aria-hidden="true"></i>';
    removeButton.setAttribute("aria-label", "Remover decisão");
    removeButton.title = "Remover decisão";
    removeButton.addEventListener("click", () => removeDecisionAtIndex(decisionIndex));

    actionsWrap.appendChild(editButton);
    actionsWrap.appendChild(removeButton);

    item.appendChild(infoBox);
    item.appendChild(winnerBox);
    item.appendChild(viewMoreButton);
    item.appendChild(actionsWrap);

    return item;
}

function renderAllDecisions() {
    const decisions = getDecisions();
    const orderedDecisions = decisions.map((decision, index) => ({ decision, index })).reverse();

    if (decisionsSummaryText) {
        if (decisions.length === 0) {
            decisionsSummaryText.textContent = "Sem decisões";
        } else if (decisions.length === 1) {
            decisionsSummaryText.textContent = "1 decisão criada";
        } else {
            decisionsSummaryText.textContent = `${decisions.length} decisões criadas`;
        }
    }

    if (!decisionsList) {
        return;
    }

    decisionsList.innerHTML = "";

    if (orderedDecisions.length === 0) {
        if (decisionsListEmpty) {
            decisionsListEmpty.hidden = false;
        }
        return;
    }

    if (decisionsListEmpty) {
        decisionsListEmpty.hidden = true;
    }

    orderedDecisions.forEach((entry) => {
        decisionsList.appendChild(createDecisionListItem(entry.decision, entry.index));
    });
}

ensureAuthenticated();
renderAllDecisions();

if (logoutButton) {
    logoutButton.addEventListener("click", handleLogout);
}

if (decisionEditCloseButton) {
    decisionEditCloseButton.addEventListener("click", closeEditModal);
}

if (decisionEditCancelButton) {
    decisionEditCancelButton.addEventListener("click", closeEditModal);
}

if (decisionEditSaveButton) {
    decisionEditSaveButton.addEventListener("click", saveEditedDecision);
}

if (decisionEditOverlay) {
    decisionEditOverlay.addEventListener("click", (event) => {
        if (event.target === decisionEditOverlay) {
            closeEditModal();
        }
    });
}
