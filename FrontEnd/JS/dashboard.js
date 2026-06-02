const SESSION_KEY = "votesync.session";
const DECISION_TEMPLATE_KEY = "votesync.decision.latest";

const logoutButton = document.querySelector("#dashboard-logout-btn");
const friendsViewMoreButton = document.querySelector("#friends-view-more-btn");
const groupsViewMoreButton = document.querySelector("#groups-view-more-btn");
const decisionViewMoreButtons = document.querySelectorAll(".decision-view-more-btn");
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

const OPTION_ICONS = ["fa-sun", "fa-building-columns", "fa-heart", "fa-mug-hot", "fa-film", "fa-gamepad"];

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

function openDecisionModal() {
	if (!decisionModalOverlay) {
		return;
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

function updateDecisionCards(title, optionsCount) {
	const cards = Array.from(document.querySelectorAll(".card")).filter((card) => {
		const heading = card.querySelector("h2");
		return heading && heading.textContent.includes("Decisões Criadas");
	});

	cards.forEach((card) => {
		const statusValue = card.querySelector(".info-box strong");
		const winnerDescription = card.querySelector(".winner-box small");
		const winnerValue = card.querySelector(".winner-box h3");

		if (statusValue) {
			statusValue.textContent = "1 decisão criada";
		}

		if (winnerDescription) {
			winnerDescription.textContent = `${optionsCount} opções prontas para votação.`;
		}

		if (winnerValue) {
			winnerValue.textContent = title;
		}
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
		if (decisionTitleInput) {
			decisionTitleInput.focus();
		}
		return;
	}

	if (options.length < 2) {
		setDecisionMessage("Adiciona pelo menos 2 opções para criar a decisão.", "error");
		return;
	}

	if (!endDate) {
		setDecisionMessage("Define uma data de término para a decisão.", "error");
		if (decisionEndDateInput) {
			decisionEndDateInput.focus();
		}
		return;
	}

	if (endDate < getTodayIsoDate()) {
		setDecisionMessage("A data de término não pode ser no passado.", "error");
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

	saveLatestDecision(decision);

	updateDecisionCards(title, options.length);
	setDecisionMessage("Decisão criada com sucesso.", "success");
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

if (decisionViewMoreButtons.length > 0) {
	decisionViewMoreButtons.forEach((button) => {
		button.addEventListener("click", redirectToDecisionTemplate);
	});
}

if (decisionCreateButtons.length > 0) {
	decisionCreateButtons.forEach((button) => {
		button.addEventListener("click", openDecisionModal);
	});
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
