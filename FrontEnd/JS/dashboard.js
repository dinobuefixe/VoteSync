const SESSION_KEY = "votesync.session";
const DECISION_TEMPLATE_KEY = "votesync.decision.latest";
const DECISIONS_KEY = "votesync.decisions";

const logoutButton = document.querySelector("#dashboard-logout-btn");
const friendsViewMoreButton = document.querySelector("#friends-view-more-btn");
const groupsViewMoreButton = document.querySelector("#groups-view-more-btn");
const decisionCreateButtons = document.querySelectorAll(".decision-create-btn");
const decisionModalOverlay = document.querySelector("#decision-modal-overlay");
const decisionModalCloseButton = document.querySelector("#decision-modal-close");
const decisionModalCancelButton = document.querySelector("#decision-cancel-btn");
const decisionCurrentDate = document.querySelector("#decision-current-date");
const decisionEndDateInput = document.querySelector("#decision-end-date-input");
const decisionTitleInput = document.querySelector("#decision-title-input");
const decisionDescriptionInput = document.querySelector("#decision-description-input");
const decisionFormMessage = document.querySelector("#decision-form-message");
const decisionOptionsList = document.querySelector("#decision-options-list");
const decisionAddOptionButton = document.querySelector("#decision-add-option-btn");
const decisionCreateConfirmButton = document.querySelector("#decision-create-confirm-btn");
const decisionSummaryText = document.querySelector("#decision-summary-text");
const decisionListEmpty = document.querySelector("#decision-list-empty");
const decisionList = document.querySelector("#decision-list");
const decisionViewAllButton = document.querySelector("#decision-view-all-btn");

const OPTION_ICONS = ["fa-sun", "fa-building-columns", "fa-heart", "fa-mug-hot", "fa-film", "fa-gamepad"];
const MAX_DASHBOARD_DECISIONS = 3;

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

function clearSession() {
	localStorage.removeItem(SESSION_KEY);
}

function saveLatestDecision(decision) {
	localStorage.setItem(DECISION_TEMPLATE_KEY, JSON.stringify(decision));
}

function getDecisions() {
	const raw = localStorage.getItem(DECISIONS_KEY);
	if (!raw) {
		return [];
	}

	try {
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed)) {
			return [];
		}

		return parsed;
	} catch {
		return [];
	}
}

function saveDecisions(decisions) {
	localStorage.setItem(DECISIONS_KEY, JSON.stringify(decisions));
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

function handleLogout() {
	clearSession();
	redirectToLogin();
}

function redirectToFriends() {
	window.location.href = "./friends.html";
}

function redirectToGroups() {
	window.location.href = "./groups.html";
}

function redirectToDecisionTemplate() {
	window.location.href = "./decisionMaking.html";
}

function redirectToAllDecisions() {
	window.location.href = "./decisions.html";
}

async function openDecisionModal() {
	if (!decisionModalOverlay) {
		return;
	}

	if (hasSwal()) {
		const result = await window.Swal.fire({
			title: "Criar nova decisão?",
			text: "Vamos abrir o formulário de criação.",
			icon: "question",
			showCancelButton: true,
			confirmButtonText: "Continuar",
			cancelButtonText: "Cancelar"
		});

		if (!result.isConfirmed) {
			return;
		}
	}

	setDecisionDate();
	setDecisionMessage("");
	decisionModalOverlay.hidden = false;
}

function closeDecisionModal() {
	if (!decisionModalOverlay) {
		return;
	}

	decisionModalOverlay.hidden = true;
}

function setDecisionDate() {
	if (!decisionCurrentDate) {
		return;
	}

	const now = new Date();
	const day = String(now.getDate()).padStart(2, "0");
	const month = String(now.getMonth() + 1).padStart(2, "0");
	const year = now.getFullYear();
	decisionCurrentDate.textContent = `${day}/${month}/${year}`;
}

function getTodayIsoDate() {
	const now = new Date();
	const day = String(now.getDate()).padStart(2, "0");
	const month = String(now.getMonth() + 1).padStart(2, "0");
	const year = now.getFullYear();
	return `${year}-${month}-${day}`;
}

function initializeEndDateInput() {
	if (!decisionEndDateInput) {
		return;
	}

	const todayIso = getTodayIsoDate();
	decisionEndDateInput.min = todayIso;

	if (!decisionEndDateInput.value) {
		decisionEndDateInput.value = todayIso;
	}
}

function setDecisionMessage(message, tone = "") {
	if (!decisionFormMessage) {
		return;
	}

	decisionFormMessage.textContent = message;
	decisionFormMessage.classList.remove("is-error", "is-success");

	if (tone === "error") {
		decisionFormMessage.classList.add("is-error");
	}

	if (tone === "success") {
		decisionFormMessage.classList.add("is-success");
	}
}

function createDecisionOptionRow(iconClass, isPrimary = false) {
	const row = document.createElement("div");
	row.className = isPrimary ? "decision-option-row focus-blue" : "decision-option-row";

	const inputWrapper = document.createElement("div");
	inputWrapper.className = isPrimary ? "decision-option-input-wrapper dotted-border" : "decision-option-input-wrapper filled-bg";

	const input = document.createElement("input");
	input.type = "text";
	input.className = "decision-input-option";
	input.placeholder = "Nome da opção...";
	inputWrapper.appendChild(input);

	const iconBox = document.createElement("div");
	iconBox.className = isPrimary ? "decision-option-icon-box dotted-border" : "decision-option-icon-box filled-bg";

	const icon = document.createElement("i");
	icon.className = `fa-solid ${iconClass}`;
	iconBox.appendChild(icon);

	row.appendChild(inputWrapper);
	row.appendChild(iconBox);

	return row;
}

function resetDecisionOptions() {
	if (!decisionOptionsList) {
		return;
	}

	decisionOptionsList.innerHTML = "";
	decisionOptionsList.appendChild(createDecisionOptionRow(OPTION_ICONS[0], true));
	decisionOptionsList.appendChild(createDecisionOptionRow(OPTION_ICONS[1], false));
}

function resetDecisionForm() {
	if (decisionTitleInput) {
		decisionTitleInput.value = "";
	}

	if (decisionDescriptionInput) {
		decisionDescriptionInput.value = "";
	}

	if (decisionEndDateInput) {
		decisionEndDateInput.value = getTodayIsoDate();
	}

	setDecisionMessage("");
	resetDecisionOptions();
}

function addDecisionOption() {
	if (!decisionOptionsList) {
		return;
	}

	const currentCount = decisionOptionsList.querySelectorAll(".decision-option-row").length;
	const nextIcon = OPTION_ICONS[currentCount % OPTION_ICONS.length];
	const newRow = createDecisionOptionRow(nextIcon, false);
	decisionOptionsList.appendChild(newRow);

	const newInput = newRow.querySelector(".decision-input-option");
	if (newInput) {
		newInput.focus();
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

	winnerBox.appendChild(winnerDescription);
	winnerBox.appendChild(winnerValue);

	const viewMoreButton = document.createElement("button");
	viewMoreButton.className = "view-btn decision-view-more-btn";
	viewMoreButton.type = "button";
	viewMoreButton.innerHTML = 'View More <i class="fa-solid fa-angle-right"></i>';
	viewMoreButton.addEventListener("click", () => {
		saveLatestDecision(decision);
		redirectToDecisionTemplate();
	});

	item.appendChild(infoBox);
	item.appendChild(winnerBox);
	item.appendChild(viewMoreButton);

	return item;
}

function updateDecisionCards() {
	const decisions = getDecisions();
	const decisionsToDisplay = decisions
		.map((decision, index) => ({ decision, index }))
		.slice(-MAX_DASHBOARD_DECISIONS)
		.reverse();

	if (decisionSummaryText) {
		if (decisions.length === 0) {
			decisionSummaryText.textContent = "Sem decisões";
		} else if (decisions.length === 1) {
			decisionSummaryText.textContent = "1 decisão criada";
		} else {
			decisionSummaryText.textContent = `${decisions.length} decisões criadas`;
		}
	}

	if (!decisionList) {
		return;
	}

	decisionList.innerHTML = "";

	if (decisions.length === 0) {
		if (decisionListEmpty) {
			decisionListEmpty.hidden = false;
		}
		return;
	}

	if (decisionListEmpty) {
		decisionListEmpty.hidden = true;
	}

	decisionsToDisplay.forEach((entry) => {
		decisionList.appendChild(createDecisionListItem(entry.decision));
	});
}

function handleCreateDecision() {
	const title = decisionTitleInput ? decisionTitleInput.value.trim() : "";
	const description = decisionDescriptionInput ? decisionDescriptionInput.value.trim() : "";
	const endDate = decisionEndDateInput ? decisionEndDateInput.value : "";
	const options = decisionOptionsList
		? Array.from(decisionOptionsList.querySelectorAll(".decision-input-option"))
			.map((input) => input.value.trim())
			.filter((value) => value.length > 0)
		: [];

	if (!title) {
		setDecisionMessage("Preenche o título da decisão.", "error");
		if (hasSwal()) {
			window.Swal.fire({ icon: "warning", title: "Título obrigatório", text: "Preenche o título da decisão." });
		}
		if (decisionTitleInput) {
			decisionTitleInput.focus();
		}
		return;
	}

	if (options.length < 2) {
		setDecisionMessage("Adiciona pelo menos 2 opções para criar a decisão.", "error");
		if (hasSwal()) {
			window.Swal.fire({ icon: "warning", title: "Opções insuficientes", text: "Adiciona pelo menos 2 opções para criar a decisão." });
		}
		return;
	}

	if (!endDate) {
		setDecisionMessage("Define uma data de término para a decisão.", "error");
		if (hasSwal()) {
			window.Swal.fire({ icon: "warning", title: "Data obrigatória", text: "Define uma data de término para a decisão." });
		}
		if (decisionEndDateInput) {
			decisionEndDateInput.focus();
		}
		return;
	}

	if (endDate < getTodayIsoDate()) {
		setDecisionMessage("A data de término não pode ser no passado.", "error");
		if (hasSwal()) {
			window.Swal.fire({ icon: "warning", title: "Data inválida", text: "A data de término não pode ser no passado." });
		}
		if (decisionEndDateInput) {
			decisionEndDateInput.focus();
		}
		return;
	}

	const session = getSession();
	const decision = {
		title,
		description,
		date: decisionCurrentDate ? decisionCurrentDate.textContent : "",
		endDate,
		options: options.map((name) => ({ name, votes: 0 })),
		createdBy: session && session.user && session.user.name ? session.user.name : "Utilizador"
	};

	const decisions = getDecisions();
	decisions.push(decision);
	saveDecisions(decisions);
	saveLatestDecision(decision);

	updateDecisionCards();
	setDecisionMessage("Decisão criada com sucesso.", "success");
	if (hasSwal()) {
		window.Swal.fire({
			icon: "success",
			title: "Decisão criada",
			text: "A nova decisão foi criada com sucesso.",
			timer: 1700,
			showConfirmButton: false
		});
	}
	closeDecisionModal();
	resetDecisionForm();
}

function handleCancelDecision() {
	closeDecisionModal();
	resetDecisionForm();
}

function initializeDecisionModal() {
	if (!decisionModalOverlay) {
		return;
	}

	decisionModalOverlay.hidden = true;
	initializeEndDateInput();
	resetDecisionForm();
}

ensureAuthenticated();

if (logoutButton) {
	logoutButton.addEventListener("click", handleLogout);
}

if (friendsViewMoreButton) {
	friendsViewMoreButton.addEventListener("click", redirectToFriends);
}

if (groupsViewMoreButton) {
	groupsViewMoreButton.addEventListener("click", redirectToGroups);
}

if (decisionCreateButtons.length > 0) {
	decisionCreateButtons.forEach((button) => {
		button.addEventListener("click", openDecisionModal);
	});
}

if (decisionViewAllButton) {
	decisionViewAllButton.addEventListener("click", redirectToAllDecisions);
}

if (decisionModalCloseButton) {
	decisionModalCloseButton.addEventListener("click", closeDecisionModal);
}

if (decisionModalCancelButton) {
	decisionModalCancelButton.addEventListener("click", handleCancelDecision);
}

if (decisionAddOptionButton) {
	decisionAddOptionButton.addEventListener("click", addDecisionOption);
}

if (decisionCreateConfirmButton) {
	decisionCreateConfirmButton.addEventListener("click", handleCreateDecision);
}

if (decisionModalOverlay) {
	decisionModalOverlay.addEventListener("click", (event) => {
		if (event.target === decisionModalOverlay) {
			closeDecisionModal();
		}
	});
}

document.addEventListener("keydown", (event) => {
	if (event.key === "Escape") {
		closeDecisionModal();
	}
});

initializeDecisionModal();
setDecisionDate();
initializeEndDateInput();
updateDecisionCards();
