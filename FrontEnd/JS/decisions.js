<<<<<<< HEAD
/* ── VoteSync — decisions.js ── */
=======
const SESSION_KEY = "votesync.session";
const DECISION_TEMPLATE_KEY = "votesync.decision.latest";
const API = "http://localhost:8000";
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))

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

<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
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
            target_group_id: editingDecision.target_group_id,
            created_at: editingDecision.created_at,
            target_friend_ids: []
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

// ── RENDER ────────────────────────────────────────────────────────────────────
function createDecisionListItem(decision) {
    const optionsCount = Array.isArray(decision.options) ? decision.options.length : 0;
=======
// Guarda a decisão (objeto completo, vindo da API) que está a ser editada.
// Substituído o antigo "editingDecisionIndex" porque a API trabalha por id, não por índice de array.
let editingDecision = null;

// Cache em memória da última lista de decisões carregada da API,
// para não ter de voltar a pedir tudo sempre que abrimos o modal de edição.
let cachedDecisions = [];

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

async function getDecisionsFromAPI() {
	try {
		return await apiFetch("/decisions/");
	} catch (err) {
		console.error("Erro ao buscar decisões:", err);
		return [];
	}
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

function openEditModal(decisionId) {
	const decision = cachedDecisions.find((d) => d.id === decisionId);
	if (!decision || !decisionEditOverlay) {
		return;
	}

	editingDecision = decision;

	if (decisionEditTitleInput) {
		decisionEditTitleInput.value = decision.title || "";
	}

	if (decisionEditDescriptionInput) {
		decisionEditDescriptionInput.value = decision.description || "";
	}

	if (decisionEditEndDateInput) {
		decisionEditEndDateInput.value = decision.end_date || "";
	}

	if (decisionEditOptionsInput) {
		const optionsText = Array.isArray(decision.options)
			? decision.options.map((option) => option.option_text).join(", ")
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
	editingDecision = null;
	setEditMessage("");
}

// Sincroniza as opções da decisão com a lista nova de nomes, comparando por posição (índice):
// - se a opção na posição i já existia mas o texto mudou -> PUT /options/{id}
// - se há mais nomes novos do que opções antigas -> POST /options/ para os excedentes
// - se há menos nomes novos do que opções antigas -> DELETE /options/{id} para os excedentes antigos
async function syncDecisionOptions(decision, newOptionNames) {
	const oldOptions = Array.isArray(decision.options) ? decision.options : [];
	const tasks = [];

	const maxLength = Math.max(oldOptions.length, newOptionNames.length);
	for (let i = 0; i < maxLength; i++) {
		const oldOption = oldOptions[i];
		const newName = newOptionNames[i];

		if (oldOption && newName !== undefined) {
			// Posição existia antes e continua a existir: atualiza só se o texto mudou
			if (oldOption.option_text !== newName) {
				tasks.push(apiFetch(`/options/${oldOption.id}`, {
					method: "PUT",
					body: JSON.stringify({ vote_id: decision.id, option_text: newName })
				}));
			}
		} else if (!oldOption && newName !== undefined) {
			// Posição nova: criar opção
			tasks.push(apiFetch("/options/", {
				method: "POST",
				body: JSON.stringify({ vote_id: decision.id, option_text: newName })
			}));
		} else if (oldOption && newName === undefined) {
			// Posição removida: apagar opção antiga
			tasks.push(apiFetch(`/options/${oldOption.id}`, { method: "DELETE" }));
		}
	}

	await Promise.all(tasks);
}

async function saveEditedDecision() {
	if (!editingDecision) {
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

	try {
		await apiFetch(`/decisions/${editingDecision.id}`, {
			method: "PUT",
			body: JSON.stringify({
				vote_id: editingDecision.vote_id,
				title,
				decision_text: description || title,
				description,
				end_date: endDate,
				created_by: editingDecision.created_by,
				target_group_id: editingDecision.target_group_id,
				created_at: editingDecision.created_at
			})
		});

		await syncDecisionOptions(editingDecision, optionNames);

		closeEditModal();
		await renderAllDecisions();

		if (hasSwal()) {
			window.Swal.fire({
				icon: "success",
				title: "Decisão alterada",
				text: "As alterações foram guardadas com sucesso.",
				timer: 1800,
				showConfirmButton: false
			});
		}
	} catch (err) {
		console.error("Erro ao guardar decisão:", err);
		showValidationMessage("Erro ao guardar alterações: " + (err.message || "tenta novamente"));
	}
}

function redirectToDecisionTemplate() {
	window.location.href = "./decisionMaking.html";
}

function editDecisionById(decisionId) {
	openEditModal(decisionId);
}

async function removeDecisionById(decisionId) {
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

	try {
		await apiFetch(`/decisions/${decisionId}`, { method: "DELETE" });
		await renderAllDecisions();

		if (hasSwal()) {
			window.Swal.fire({
				icon: "success",
				title: "Decisão removida",
				timer: 1600,
				showConfirmButton: false
			});
		}
	} catch (err) {
		console.error("Erro ao remover decisão:", err);
		if (hasSwal()) {
			window.Swal.fire({
				icon: "error",
				title: "Erro",
				text: "Não foi possível remover a decisão: " + (err.message || "tenta novamente")
			});
		}
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

function createDecisionListItem(decision) {
	const optionsCount = Array.isArray(decision.options) ? decision.options.length : 0;
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))

	const item = document.createElement("article");
	item.className = "decision-list-item";

<<<<<<< HEAD
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
=======
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
	const createdAtLabel = decision.created_at ? decision.created_at.split("T")[0] : "--/--/----";
	createdDate.textContent = `Criada em: ${createdAtLabel}`;

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
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))

	const actionsWrap = document.createElement("div");
	actionsWrap.className = "decision-item-actions";

<<<<<<< HEAD
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
    item.appendChild(infoBox);
    item.appendChild(winnerBox);
    item.appendChild(viewMoreButton);
    item.appendChild(actionsWrap);
    return item;
}

async function renderAllDecisions() {
    const decisions = await api.getDecisions();
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
    orderedDecisions.forEach((decision) => decisionsList.appendChild(createDecisionListItem(decision)));

    // Sync latest para decisionMaking.html
    localStorage.setItem("votesync.decision.latest", JSON.stringify(orderedDecisions[0]));
=======
	const editButton = document.createElement("button");
	editButton.className = "decision-action-btn decision-edit-btn";
	editButton.type = "button";
	editButton.innerHTML = '<i class="fa-solid fa-pen-to-square" aria-hidden="true"></i>';
	editButton.setAttribute("aria-label", "Alterar decisão");
	editButton.title = "Alterar decisão";
	editButton.addEventListener("click", () => editDecisionById(decision.id));

	const removeButton = document.createElement("button");
	removeButton.className = "decision-action-btn decision-remove-btn";
	removeButton.type = "button";
	removeButton.innerHTML = '<i class="fa-solid fa-trash" aria-hidden="true"></i>';
	removeButton.setAttribute("aria-label", "Remover decisão");
	removeButton.title = "Remover decisão";
	removeButton.addEventListener("click", () => removeDecisionById(decision.id));

	actionsWrap.appendChild(editButton);
	actionsWrap.appendChild(removeButton);

	item.appendChild(infoBox);
	item.appendChild(winnerBox);
	item.appendChild(viewMoreButton);
	item.appendChild(actionsWrap);

	return item;
=======
// Guarda a decisão (objeto completo, vindo da API) que está a ser editada.
// Substituído o antigo "editingDecisionIndex" porque a API trabalha por id, não por índice de array.
let editingDecision = null;

// Cache em memória da última lista de decisões carregada da API,
// para não ter de voltar a pedir tudo sempre que abrimos o modal de edição.
let cachedDecisions = [];

function hasSwal() {
	return typeof window !== "undefined" && typeof window.Swal !== "undefined";
=======
// Guarda a decisão (objeto completo, vindo da API) que está a ser editada.
// Substituído o antigo "editingDecisionIndex" porque a API trabalha por id, não por índice de array.
let editingDecision = null;

// Cache em memória da última lista de decisões carregada da API,
// para não ter de voltar a pedir tudo sempre que abrimos o modal de edição.
let cachedDecisions = [];

function hasSwal() {
	return typeof window !== "undefined" && typeof window.Swal !== "undefined";
=======
// Guarda a decisão (objeto completo, vindo da API) que está a ser editada.
// Substituído o antigo "editingDecisionIndex" porque a API trabalha por id, não por índice de array.
let editingDecision = null;

// Cache em memória da última lista de decisões carregada da API,
// para não ter de voltar a pedir tudo sempre que abrimos o modal de edição.
let cachedDecisions = [];

function hasSwal() {
	return typeof window !== "undefined" && typeof window.Swal !== "undefined";
=======
// Guarda a decisão (objeto completo, vindo da API) que está a ser editada.
// Substituído o antigo "editingDecisionIndex" porque a API trabalha por id, não por índice de array.
let editingDecision = null;

// Cache em memória da última lista de decisões carregada da API,
// para não ter de voltar a pedir tudo sempre que abrimos o modal de edição.
let cachedDecisions = [];

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

async function getDecisionsFromAPI() {
	try {
		return await apiFetch("/decisions/");
	} catch (err) {
		console.error("Erro ao buscar decisões:", err);
		return [];
	}
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

function openEditModal(decisionId) {
	const decision = cachedDecisions.find((d) => d.id === decisionId);
	if (!decision || !decisionEditOverlay) {
		return;
	}

	editingDecision = decision;

	if (decisionEditTitleInput) {
		decisionEditTitleInput.value = decision.title || "";
	}

	if (decisionEditDescriptionInput) {
		decisionEditDescriptionInput.value = decision.description || "";
	}

	if (decisionEditEndDateInput) {
		decisionEditEndDateInput.value = decision.end_date || "";
	}

	if (decisionEditOptionsInput) {
		const optionsText = Array.isArray(decision.options)
			? decision.options.map((option) => option.option_text).join(", ")
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
	editingDecision = null;
	setEditMessage("");
}

// Sincroniza as opções da decisão com a lista nova de nomes, comparando por posição (índice):
// - se a opção na posição i já existia mas o texto mudou -> PUT /options/{id}
// - se há mais nomes novos do que opções antigas -> POST /options/ para os excedentes
// - se há menos nomes novos do que opções antigas -> DELETE /options/{id} para os excedentes antigos
async function syncDecisionOptions(decision, newOptionNames) {
	const oldOptions = Array.isArray(decision.options) ? decision.options : [];
	const tasks = [];

	const maxLength = Math.max(oldOptions.length, newOptionNames.length);
	for (let i = 0; i < maxLength; i++) {
		const oldOption = oldOptions[i];
		const newName = newOptionNames[i];

		if (oldOption && newName !== undefined) {
			// Posição existia antes e continua a existir: atualiza só se o texto mudou
			if (oldOption.option_text !== newName) {
				tasks.push(apiFetch(`/options/${oldOption.id}`, {
					method: "PUT",
					body: JSON.stringify({ vote_id: decision.id, option_text: newName })
				}));
			}
		} else if (!oldOption && newName !== undefined) {
			// Posição nova: criar opção
			tasks.push(apiFetch("/options/", {
				method: "POST",
				body: JSON.stringify({ vote_id: decision.id, option_text: newName })
			}));
		} else if (oldOption && newName === undefined) {
			// Posição removida: apagar opção antiga
			tasks.push(apiFetch(`/options/${oldOption.id}`, { method: "DELETE" }));
		}
	}

	await Promise.all(tasks);
}

async function saveEditedDecision() {
	if (!editingDecision) {
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

	try {
		await apiFetch(`/decisions/${editingDecision.id}`, {
			method: "PUT",
			body: JSON.stringify({
				vote_id: editingDecision.vote_id,
				title,
				decision_text: description || title,
				description,
				end_date: endDate,
				created_by: editingDecision.created_by,
				target_group_id: editingDecision.target_group_id,
				created_at: editingDecision.created_at
			})
		});

		await syncDecisionOptions(editingDecision, optionNames);

		closeEditModal();
		await renderAllDecisions();

		if (hasSwal()) {
			window.Swal.fire({
				icon: "success",
				title: "Decisão alterada",
				text: "As alterações foram guardadas com sucesso.",
				timer: 1800,
				showConfirmButton: false
			});
		}
	} catch (err) {
		console.error("Erro ao guardar decisão:", err);
		showValidationMessage("Erro ao guardar alterações: " + (err.message || "tenta novamente"));
	}
}

function redirectToDecisionTemplate() {
	window.location.href = "./decisionMaking.html";
}

function editDecisionById(decisionId) {
	openEditModal(decisionId);
}

async function removeDecisionById(decisionId) {
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

	try {
		await apiFetch(`/decisions/${decisionId}`, { method: "DELETE" });
		await renderAllDecisions();

		if (hasSwal()) {
			window.Swal.fire({
				icon: "success",
				title: "Decisão removida",
				timer: 1600,
				showConfirmButton: false
			});
		}
	} catch (err) {
		console.error("Erro ao remover decisão:", err);
		if (hasSwal()) {
			window.Swal.fire({
				icon: "error",
				title: "Erro",
				text: "Não foi possível remover a decisão: " + (err.message || "tenta novamente")
			});
		}
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

function createDecisionListItem(decision) {
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
	const createdAtLabel = decision.created_at ? decision.created_at.split("T")[0] : "--/--/----";
	createdDate.textContent = `Criada em: ${createdAtLabel}`;

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
	editButton.addEventListener("click", () => editDecisionById(decision.id));

	const removeButton = document.createElement("button");
	removeButton.className = "decision-action-btn decision-remove-btn";
	removeButton.type = "button";
	removeButton.innerHTML = '<i class="fa-solid fa-trash" aria-hidden="true"></i>';
	removeButton.setAttribute("aria-label", "Remover decisão");
	removeButton.title = "Remover decisão";
	removeButton.addEventListener("click", () => removeDecisionById(decision.id));

	actionsWrap.appendChild(editButton);
	actionsWrap.appendChild(removeButton);

	item.appendChild(infoBox);
	item.appendChild(winnerBox);
	item.appendChild(viewMoreButton);
	item.appendChild(actionsWrap);

	return item;
}

async function renderAllDecisions() {
	const decisions = await getDecisionsFromAPI();
	cachedDecisions = decisions;

	// Mais recentes primeiro
	const orderedDecisions = [...decisions].sort((a, b) => (b.id || 0) - (a.id || 0));

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

	orderedDecisions.forEach((decision) => {
		decisionsList.appendChild(createDecisionListItem(decision));
	});

	syncLatestDecision(orderedDecisions);
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
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

async function getDecisionsFromAPI() {
	try {
		return await apiFetch("/decisions/");
	} catch (err) {
		console.error("Erro ao buscar decisões:", err);
		return [];
	}
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

function openEditModal(decisionId) {
	const decision = cachedDecisions.find((d) => d.id === decisionId);
	if (!decision || !decisionEditOverlay) {
		return;
	}

	editingDecision = decision;

	if (decisionEditTitleInput) {
		decisionEditTitleInput.value = decision.title || "";
	}

	if (decisionEditDescriptionInput) {
		decisionEditDescriptionInput.value = decision.description || "";
	}

	if (decisionEditEndDateInput) {
		decisionEditEndDateInput.value = decision.end_date || "";
	}

	if (decisionEditOptionsInput) {
		const optionsText = Array.isArray(decision.options)
			? decision.options.map((option) => option.option_text).join(", ")
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
	editingDecision = null;
	setEditMessage("");
}

// Sincroniza as opções da decisão com a lista nova de nomes, comparando por posição (índice):
// - se a opção na posição i já existia mas o texto mudou -> PUT /options/{id}
// - se há mais nomes novos do que opções antigas -> POST /options/ para os excedentes
// - se há menos nomes novos do que opções antigas -> DELETE /options/{id} para os excedentes antigos
async function syncDecisionOptions(decision, newOptionNames) {
	const oldOptions = Array.isArray(decision.options) ? decision.options : [];
	const tasks = [];

	const maxLength = Math.max(oldOptions.length, newOptionNames.length);
	for (let i = 0; i < maxLength; i++) {
		const oldOption = oldOptions[i];
		const newName = newOptionNames[i];

		if (oldOption && newName !== undefined) {
			// Posição existia antes e continua a existir: atualiza só se o texto mudou
			if (oldOption.option_text !== newName) {
				tasks.push(apiFetch(`/options/${oldOption.id}`, {
					method: "PUT",
					body: JSON.stringify({ vote_id: decision.id, option_text: newName })
				}));
			}
		} else if (!oldOption && newName !== undefined) {
			// Posição nova: criar opção
			tasks.push(apiFetch("/options/", {
				method: "POST",
				body: JSON.stringify({ vote_id: decision.id, option_text: newName })
			}));
		} else if (oldOption && newName === undefined) {
			// Posição removida: apagar opção antiga
			tasks.push(apiFetch(`/options/${oldOption.id}`, { method: "DELETE" }));
		}
	}

	await Promise.all(tasks);
}

async function saveEditedDecision() {
	if (!editingDecision) {
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

	try {
		await apiFetch(`/decisions/${editingDecision.id}`, {
			method: "PUT",
			body: JSON.stringify({
				vote_id: editingDecision.vote_id,
				title,
				decision_text: description || title,
				description,
				end_date: endDate,
				created_by: editingDecision.created_by,
				target_group_id: editingDecision.target_group_id,
				created_at: editingDecision.created_at
			})
		});

		await syncDecisionOptions(editingDecision, optionNames);

		closeEditModal();
		await renderAllDecisions();

		if (hasSwal()) {
			window.Swal.fire({
				icon: "success",
				title: "Decisão alterada",
				text: "As alterações foram guardadas com sucesso.",
				timer: 1800,
				showConfirmButton: false
			});
		}
	} catch (err) {
		console.error("Erro ao guardar decisão:", err);
		showValidationMessage("Erro ao guardar alterações: " + (err.message || "tenta novamente"));
	}
}

function redirectToDecisionTemplate() {
	window.location.href = "./decisionMaking.html";
}

function editDecisionById(decisionId) {
	openEditModal(decisionId);
}

async function removeDecisionById(decisionId) {
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

	try {
		await apiFetch(`/decisions/${decisionId}`, { method: "DELETE" });
		await renderAllDecisions();

		if (hasSwal()) {
			window.Swal.fire({
				icon: "success",
				title: "Decisão removida",
				timer: 1600,
				showConfirmButton: false
			});
		}
	} catch (err) {
		console.error("Erro ao remover decisão:", err);
		if (hasSwal()) {
			window.Swal.fire({
				icon: "error",
				title: "Erro",
				text: "Não foi possível remover a decisão: " + (err.message || "tenta novamente")
			});
		}
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

function createDecisionListItem(decision) {
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
	const createdAtLabel = decision.created_at ? decision.created_at.split("T")[0] : "--/--/----";
	createdDate.textContent = `Criada em: ${createdAtLabel}`;

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
	editButton.addEventListener("click", () => editDecisionById(decision.id));

	const removeButton = document.createElement("button");
	removeButton.className = "decision-action-btn decision-remove-btn";
	removeButton.type = "button";
	removeButton.innerHTML = '<i class="fa-solid fa-trash" aria-hidden="true"></i>';
	removeButton.setAttribute("aria-label", "Remover decisão");
	removeButton.title = "Remover decisão";
	removeButton.addEventListener("click", () => removeDecisionById(decision.id));

	actionsWrap.appendChild(editButton);
	actionsWrap.appendChild(removeButton);

	item.appendChild(infoBox);
	item.appendChild(winnerBox);
	item.appendChild(viewMoreButton);
	item.appendChild(actionsWrap);

	return item;
}

async function renderAllDecisions() {
	const decisions = await getDecisionsFromAPI();
	cachedDecisions = decisions;

	// Mais recentes primeiro
	const orderedDecisions = [...decisions].sort((a, b) => (b.id || 0) - (a.id || 0));

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

	orderedDecisions.forEach((decision) => {
		decisionsList.appendChild(createDecisionListItem(decision));
	});

	syncLatestDecision(orderedDecisions);
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
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

async function getDecisionsFromAPI() {
	try {
		return await apiFetch("/decisions/");
	} catch (err) {
		console.error("Erro ao buscar decisões:", err);
		return [];
	}
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

function openEditModal(decisionId) {
	const decision = cachedDecisions.find((d) => d.id === decisionId);
	if (!decision || !decisionEditOverlay) {
		return;
	}

	editingDecision = decision;

	if (decisionEditTitleInput) {
		decisionEditTitleInput.value = decision.title || "";
	}

	if (decisionEditDescriptionInput) {
		decisionEditDescriptionInput.value = decision.description || "";
	}

	if (decisionEditEndDateInput) {
		decisionEditEndDateInput.value = decision.end_date || "";
	}

	if (decisionEditOptionsInput) {
		const optionsText = Array.isArray(decision.options)
			? decision.options.map((option) => option.option_text).join(", ")
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
	editingDecision = null;
	setEditMessage("");
}

// Sincroniza as opções da decisão com a lista nova de nomes, comparando por posição (índice):
// - se a opção na posição i já existia mas o texto mudou -> PUT /options/{id}
// - se há mais nomes novos do que opções antigas -> POST /options/ para os excedentes
// - se há menos nomes novos do que opções antigas -> DELETE /options/{id} para os excedentes antigos
async function syncDecisionOptions(decision, newOptionNames) {
	const oldOptions = Array.isArray(decision.options) ? decision.options : [];
	const tasks = [];

	const maxLength = Math.max(oldOptions.length, newOptionNames.length);
	for (let i = 0; i < maxLength; i++) {
		const oldOption = oldOptions[i];
		const newName = newOptionNames[i];

		if (oldOption && newName !== undefined) {
			// Posição existia antes e continua a existir: atualiza só se o texto mudou
			if (oldOption.option_text !== newName) {
				tasks.push(apiFetch(`/options/${oldOption.id}`, {
					method: "PUT",
					body: JSON.stringify({ vote_id: decision.id, option_text: newName })
				}));
			}
		} else if (!oldOption && newName !== undefined) {
			// Posição nova: criar opção
			tasks.push(apiFetch("/options/", {
				method: "POST",
				body: JSON.stringify({ vote_id: decision.id, option_text: newName })
			}));
		} else if (oldOption && newName === undefined) {
			// Posição removida: apagar opção antiga
			tasks.push(apiFetch(`/options/${oldOption.id}`, { method: "DELETE" }));
		}
	}

	await Promise.all(tasks);
}

async function saveEditedDecision() {
	if (!editingDecision) {
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

	try {
		await apiFetch(`/decisions/${editingDecision.id}`, {
			method: "PUT",
			body: JSON.stringify({
				vote_id: editingDecision.vote_id,
				title,
				decision_text: description || title,
				description,
				end_date: endDate,
				created_by: editingDecision.created_by,
				target_group_id: editingDecision.target_group_id,
				created_at: editingDecision.created_at
			})
		});

		await syncDecisionOptions(editingDecision, optionNames);

		closeEditModal();
		await renderAllDecisions();

		if (hasSwal()) {
			window.Swal.fire({
				icon: "success",
				title: "Decisão alterada",
				text: "As alterações foram guardadas com sucesso.",
				timer: 1800,
				showConfirmButton: false
			});
		}
	} catch (err) {
		console.error("Erro ao guardar decisão:", err);
		showValidationMessage("Erro ao guardar alterações: " + (err.message || "tenta novamente"));
	}
}

function redirectToDecisionTemplate() {
	window.location.href = "./decisionMaking.html";
}

function editDecisionById(decisionId) {
	openEditModal(decisionId);
}

async function removeDecisionById(decisionId) {
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

	try {
		await apiFetch(`/decisions/${decisionId}`, { method: "DELETE" });
		await renderAllDecisions();

		if (hasSwal()) {
			window.Swal.fire({
				icon: "success",
				title: "Decisão removida",
				timer: 1600,
				showConfirmButton: false
			});
		}
	} catch (err) {
		console.error("Erro ao remover decisão:", err);
		if (hasSwal()) {
			window.Swal.fire({
				icon: "error",
				title: "Erro",
				text: "Não foi possível remover a decisão: " + (err.message || "tenta novamente")
			});
		}
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

function createDecisionListItem(decision) {
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
	const createdAtLabel = decision.created_at ? decision.created_at.split("T")[0] : "--/--/----";
	createdDate.textContent = `Criada em: ${createdAtLabel}`;

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
	editButton.addEventListener("click", () => editDecisionById(decision.id));

	const removeButton = document.createElement("button");
	removeButton.className = "decision-action-btn decision-remove-btn";
	removeButton.type = "button";
	removeButton.innerHTML = '<i class="fa-solid fa-trash" aria-hidden="true"></i>';
	removeButton.setAttribute("aria-label", "Remover decisão");
	removeButton.title = "Remover decisão";
	removeButton.addEventListener("click", () => removeDecisionById(decision.id));

	actionsWrap.appendChild(editButton);
	actionsWrap.appendChild(removeButton);

	item.appendChild(infoBox);
	item.appendChild(winnerBox);
	item.appendChild(viewMoreButton);
	item.appendChild(actionsWrap);

	return item;
}

async function renderAllDecisions() {
	const decisions = await getDecisionsFromAPI();
	cachedDecisions = decisions;

	// Mais recentes primeiro
	const orderedDecisions = [...decisions].sort((a, b) => (b.id || 0) - (a.id || 0));

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

	orderedDecisions.forEach((decision) => {
		decisionsList.appendChild(createDecisionListItem(decision));
	});

	syncLatestDecision(orderedDecisions);
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
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

async function getDecisionsFromAPI() {
	try {
		return await apiFetch("/decisions/");
	} catch (err) {
		console.error("Erro ao buscar decisões:", err);
		return [];
	}
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

function openEditModal(decisionId) {
	const decision = cachedDecisions.find((d) => d.id === decisionId);
	if (!decision || !decisionEditOverlay) {
		return;
	}

	editingDecision = decision;

	if (decisionEditTitleInput) {
		decisionEditTitleInput.value = decision.title || "";
	}

	if (decisionEditDescriptionInput) {
		decisionEditDescriptionInput.value = decision.description || "";
	}

	if (decisionEditEndDateInput) {
		decisionEditEndDateInput.value = decision.end_date || "";
	}

	if (decisionEditOptionsInput) {
		const optionsText = Array.isArray(decision.options)
			? decision.options.map((option) => option.option_text).join(", ")
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
	editingDecision = null;
	setEditMessage("");
}

// Sincroniza as opções da decisão com a lista nova de nomes, comparando por posição (índice):
// - se a opção na posição i já existia mas o texto mudou -> PUT /options/{id}
// - se há mais nomes novos do que opções antigas -> POST /options/ para os excedentes
// - se há menos nomes novos do que opções antigas -> DELETE /options/{id} para os excedentes antigos
async function syncDecisionOptions(decision, newOptionNames) {
	const oldOptions = Array.isArray(decision.options) ? decision.options : [];
	const tasks = [];

	const maxLength = Math.max(oldOptions.length, newOptionNames.length);
	for (let i = 0; i < maxLength; i++) {
		const oldOption = oldOptions[i];
		const newName = newOptionNames[i];

		if (oldOption && newName !== undefined) {
			// Posição existia antes e continua a existir: atualiza só se o texto mudou
			if (oldOption.option_text !== newName) {
				tasks.push(apiFetch(`/options/${oldOption.id}`, {
					method: "PUT",
					body: JSON.stringify({ vote_id: decision.id, option_text: newName })
				}));
			}
		} else if (!oldOption && newName !== undefined) {
			// Posição nova: criar opção
			tasks.push(apiFetch("/options/", {
				method: "POST",
				body: JSON.stringify({ vote_id: decision.id, option_text: newName })
			}));
		} else if (oldOption && newName === undefined) {
			// Posição removida: apagar opção antiga
			tasks.push(apiFetch(`/options/${oldOption.id}`, { method: "DELETE" }));
		}
	}

	await Promise.all(tasks);
}

async function saveEditedDecision() {
	if (!editingDecision) {
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

	try {
		await apiFetch(`/decisions/${editingDecision.id}`, {
			method: "PUT",
			body: JSON.stringify({
				vote_id: editingDecision.vote_id,
				title,
				decision_text: description || title,
				description,
				end_date: endDate,
				created_by: editingDecision.created_by,
				target_group_id: editingDecision.target_group_id,
				created_at: editingDecision.created_at
			})
		});

		await syncDecisionOptions(editingDecision, optionNames);

		closeEditModal();
		await renderAllDecisions();

		if (hasSwal()) {
			window.Swal.fire({
				icon: "success",
				title: "Decisão alterada",
				text: "As alterações foram guardadas com sucesso.",
				timer: 1800,
				showConfirmButton: false
			});
		}
	} catch (err) {
		console.error("Erro ao guardar decisão:", err);
		showValidationMessage("Erro ao guardar alterações: " + (err.message || "tenta novamente"));
	}
}

function redirectToDecisionTemplate() {
	window.location.href = "./decisionMaking.html";
}

function editDecisionById(decisionId) {
	openEditModal(decisionId);
}

async function removeDecisionById(decisionId) {
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

	try {
		await apiFetch(`/decisions/${decisionId}`, { method: "DELETE" });
		await renderAllDecisions();

		if (hasSwal()) {
			window.Swal.fire({
				icon: "success",
				title: "Decisão removida",
				timer: 1600,
				showConfirmButton: false
			});
		}
	} catch (err) {
		console.error("Erro ao remover decisão:", err);
		if (hasSwal()) {
			window.Swal.fire({
				icon: "error",
				title: "Erro",
				text: "Não foi possível remover a decisão: " + (err.message || "tenta novamente")
			});
		}
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

function createDecisionListItem(decision) {
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
	const createdAtLabel = decision.created_at ? decision.created_at.split("T")[0] : "--/--/----";
	createdDate.textContent = `Criada em: ${createdAtLabel}`;

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
	editButton.addEventListener("click", () => editDecisionById(decision.id));

	const removeButton = document.createElement("button");
	removeButton.className = "decision-action-btn decision-remove-btn";
	removeButton.type = "button";
	removeButton.innerHTML = '<i class="fa-solid fa-trash" aria-hidden="true"></i>';
	removeButton.setAttribute("aria-label", "Remover decisão");
	removeButton.title = "Remover decisão";
	removeButton.addEventListener("click", () => removeDecisionById(decision.id));

	actionsWrap.appendChild(editButton);
	actionsWrap.appendChild(removeButton);

	item.appendChild(infoBox);
	item.appendChild(winnerBox);
	item.appendChild(viewMoreButton);
	item.appendChild(actionsWrap);

	return item;
}

async function renderAllDecisions() {
	const decisions = await getDecisionsFromAPI();
	cachedDecisions = decisions;

	// Mais recentes primeiro
	const orderedDecisions = [...decisions].sort((a, b) => (b.id || 0) - (a.id || 0));

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

	orderedDecisions.forEach((decision) => {
		decisionsList.appendChild(createDecisionListItem(decision));
	});

	syncLatestDecision(orderedDecisions);
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
}

async function renderAllDecisions() {
	const decisions = await getDecisionsFromAPI();
	cachedDecisions = decisions;

	// Mais recentes primeiro
	const orderedDecisions = [...decisions].sort((a, b) => (b.id || 0) - (a.id || 0));

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

	orderedDecisions.forEach((decision) => {
		decisionsList.appendChild(createDecisionListItem(decision));
	});

	syncLatestDecision(orderedDecisions);
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
}

// ── EVENTS ────────────────────────────────────────────────────────────────────
if (logoutButton)             logoutButton.addEventListener("click", handleLogout);
if (decisionEditCloseButton)  decisionEditCloseButton.addEventListener("click", closeEditModal);
if (decisionEditCancelButton) decisionEditCancelButton.addEventListener("click", closeEditModal);
if (decisionEditSaveButton)   decisionEditSaveButton.addEventListener("click", saveEditedDecision);
if (decisionEditOverlay)      decisionEditOverlay.addEventListener("click", (e) => { if (e.target === decisionEditOverlay) closeEditModal(); });

<<<<<<< HEAD
// ── INIT ──────────────────────────────────────────────────────────────────────
api.ensureAuthenticated();
renderAllDecisions();
=======
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
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
}
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
}
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
}
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
}
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
}
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
