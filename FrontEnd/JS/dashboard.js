const SESSION_KEY = "votesync.session";
const DECISION_TEMPLATE_KEY = "votesync.decision.latest";
const DECISIONS_KEY = "votesync.decisions";
const FRIENDS_KEY = "votesync.friends";
const GROUPS_KEY = "votesync.groups";
const API = "http://localhost:8000";

// ── SESSION ───────────────────────────────────────────────────────────────────
function getSession() {
	const raw = localStorage.getItem(SESSION_KEY);
	if (!raw) return null;
	try { return JSON.parse(raw); } catch { return null; }
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

const myId = getSession()?.user?.id;

// ── DOM REFS ──────────────────────────────────────────────────────────────────
const logoutButton = document.querySelector("#dashboard-logout-btn");
const friendsViewMoreButton = document.querySelector("#friends-view-more-btn");
const groupsViewMoreButton = document.querySelector("#groups-view-more-btn");
const groupsCreateButton = document.querySelector("#groups-create-btn");
const groupsCardEmpty = document.querySelector("#groups-card-empty");
const groupsPreviewList = document.querySelector("#groups-preview-list");
const decisionCreateButtons = document.querySelectorAll(".decision-create-btn");
const decisionModalOverlay = document.querySelector("#decision-modal-overlay");
const decisionModalCloseButton = document.querySelector("#decision-modal-close");
const decisionModalCancelButton = document.querySelector("#decision-cancel-btn");
const decisionCurrentDate = document.querySelector("#decision-current-date");
const decisionEndDateInput = document.querySelector("#decision-end-date-input");
const decisionGroupSelect = document.querySelector("#decision-group-select");
const decisionFriendsSelect = document.querySelector("#decision-friends-select");
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

// ── HELPERS ───────────────────────────────────────────────────────────────────
function normalizeEntityName(entity, fallbackLabel) {
	if (typeof entity === "string") return entity;
	if (!entity || typeof entity !== "object") return fallbackLabel;
	return entity.name || entity.title || entity.label || fallbackLabel;
}

function getStoredArray(key) {
	const raw = localStorage.getItem(key);
	if (!raw) return [];
	try {
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed : [];
	} catch { return []; }
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

function getStoredFriends() {
	return getStoredArray(FRIENDS_KEY).map((friend, index) => ({
		id: typeof friend === "object" && friend && friend.id ? String(friend.id) : `friend-${index}`,
		name: normalizeEntityName(friend, `Amigo ${index + 1}`)
	}));
}

function getStoredGroups() {
	return getStoredArray(GROUPS_KEY).map((group, index) => ({
		id: typeof group === "object" && group && group.id ? String(group.id) : `group-${index}`,
		name: normalizeEntityName(group, `Grupo ${index + 1}`),
		members: typeof group === "object" && group && Array.isArray(group.members)
			? group.members.map((member) => normalizeEntityName(member, "")).filter((value) => value.length > 0)
			: []
	}));
}

function clearSelectOptions(selectElement) {
	if (!selectElement) return;
	selectElement.innerHTML = "";
}

function populateGroupOptions(groups) {
	if (!decisionGroupSelect) return;
	clearSelectOptions(decisionGroupSelect);
	const defaultOption = document.createElement("option");
	defaultOption.value = "";
	defaultOption.textContent = "Sem grupo selecionado";
	decisionGroupSelect.appendChild(defaultOption);
	groups.forEach((group) => {
		const option = document.createElement("option");
		option.value = group.id;
		option.textContent = group.name;
		decisionGroupSelect.appendChild(option);
	});
}

function populateFriendsOptions(groups, friends) {
	if (!decisionFriendsSelect) return;
	clearSelectOptions(decisionFriendsSelect);
	let friendsToShow = friends;
	const selectedGroupId = decisionGroupSelect ? decisionGroupSelect.value : "";
	if (selectedGroupId) {
		const selectedGroup = groups.find((group) => group.id === selectedGroupId);
		if (selectedGroup && selectedGroup.members.length > 0) {
			friendsToShow = friends.filter((friend) => selectedGroup.members.includes(friend.name));
		}
	}
	if (friendsToShow.length === 0) {
		const option = document.createElement("option");
		option.value = "";
		option.textContent = "Sem amigos disponíveis";
		option.disabled = true;
		option.selected = true;
		decisionFriendsSelect.appendChild(option);
		return;
	}
	friendsToShow.forEach((friend) => {
		const option = document.createElement("option");
		option.value = friend.id;
		option.textContent = friend.name;
		decisionFriendsSelect.appendChild(option);
	});
}

function populateDecisionTargets() {
	const groups = getStoredGroups();
	const friends = getStoredFriends();
	populateGroupOptions(groups);
	populateFriendsOptions(groups, friends);
}

function getGroupSortTimestamp(group, fallbackIndex) {
	if (!group || typeof group !== "object") return fallbackIndex;
	const rawValue = group.createdAt || group.updatedAt || "";
	const parsed = Date.parse(rawValue);
	if (!Number.isNaN(parsed)) return parsed;
	return fallbackIndex;
}

function updateGroupsCard() {
	if (!groupsPreviewList || !groupsCardEmpty) return;
	const groups = getStoredArray(GROUPS_KEY)
		.map((group, index) => {
			const normalizedName = normalizeEntityName(group, `Grupo ${index + 1}`);
			const members = typeof group === "object" && group && Array.isArray(group.members)
				? group.members.map((member) => normalizeEntityName(member, "")).filter((value) => value.length > 0)
				: [];
			return { ...group, name: normalizedName, members, sortTimestamp: getGroupSortTimestamp(group, index) };
		})
		.sort((a, b) => b.sortTimestamp - a.sortTimestamp)
		.slice(0, 3);

	groupsPreviewList.innerHTML = "";
	if (groups.length === 0) { groupsCardEmpty.hidden = false; return; }
	groupsCardEmpty.hidden = true;

	groups.forEach((group) => {
		const item = document.createElement("article");
		item.className = "group-preview-item";
		const main = document.createElement("div");
		main.className = "group-preview-main";
		const name = document.createElement("strong");
		name.className = "group-preview-name";
		name.textContent = group.name || "Grupo sem nome";
		const meta = document.createElement("small");
		meta.className = "group-preview-meta";
		meta.textContent = group.members.length === 1 ? "1 membro" : `${group.members.length} membros`;
		const badge = document.createElement("span");
		badge.className = "group-preview-badge";
		badge.textContent = "Recente";
		main.appendChild(name);
		main.appendChild(meta);
		item.appendChild(main);
		item.appendChild(badge);
		groupsPreviewList.appendChild(item);
	});
}

function syncDecisionTargetsPreserveSelection() {
	if (!decisionGroupSelect || !decisionFriendsSelect) return;
	const previousGroupId = decisionGroupSelect.value;
	const previousFriendIds = Array.from(decisionFriendsSelect.selectedOptions).map((o) => o.value).filter((v) => v);
	const groups = getStoredGroups();
	const friends = getStoredFriends();
	populateGroupOptions(groups);
	const hasGroupOption = Array.from(decisionGroupSelect.options).some((o) => o.value === previousGroupId);
	if (hasGroupOption) decisionGroupSelect.value = previousGroupId;
	populateFriendsOptions(groups, friends);
	Array.from(decisionFriendsSelect.options).forEach((o) => { o.selected = previousFriendIds.includes(o.value); });
}

function syncTargetsIfModalOpen() {
	if (!decisionModalOverlay || decisionModalOverlay.hidden) return;
	syncDecisionTargetsPreserveSelection();
}

function hasSwal() {
	return typeof window !== "undefined" && typeof window.Swal !== "undefined";
}

function clearSession() { localStorage.removeItem(SESSION_KEY); }
function saveLatestDecision(decision) { localStorage.setItem(DECISION_TEMPLATE_KEY, JSON.stringify(decision)); }

function getDecisions() {
	const raw = localStorage.getItem(DECISIONS_KEY);
	if (!raw) return [];
	try {
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed : [];
	} catch { return []; }
}

function saveDecisions(decisions) { localStorage.setItem(DECISIONS_KEY, JSON.stringify(decisions)); }
function redirectToLogin() { window.location.href = "./index.html"; }

function ensureAuthenticated() {
	const session = getSession();
	if (!session || !session.user || !session.token) redirectToLogin();
}

function handleLogout() { clearSession(); redirectToLogin(); }
function redirectToFriends() { window.location.href = "./friends.html"; }
function redirectToGroups() { window.location.href = "./groups.html"; }
function redirectToGroupsCreate() { window.location.href = "./groups.html#create-group"; }
function redirectToDecisionTemplate() { window.location.href = "./decisionMaking.html"; }
function redirectToAllDecisions() { window.location.href = "./decisions.html"; }

function openDecisionModal() {
	if (!decisionModalOverlay) return;
	populateDecisionTargets();
	setDecisionDate();
	setDecisionMessage("");
	decisionModalOverlay.hidden = false;
}

function closeDecisionModal() {
	if (!decisionModalOverlay) return;
	decisionModalOverlay.hidden = true;
}

function setDecisionDate() {
	if (!decisionCurrentDate) return;
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

function calculateDaysUntilEnd(endDateIso) {
	if (!endDateIso) return null;
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const endDate = new Date(`${endDateIso}T00:00:00`);
	if (Number.isNaN(endDate.getTime())) return null;
	return Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function formatIsoDateToPt(isoDate) {
	if (!isoDate || typeof isoDate !== "string" || !isoDate.includes("-")) return "--/--/----";
	const [year, month, day] = isoDate.split("-");
	if (!year || !month || !day) return "--/--/----";
	return `${day}/${month}/${year}`;
}

function initializeEndDateInput() {
	if (!decisionEndDateInput) return;
	const todayIso = getTodayIsoDate();
	decisionEndDateInput.min = todayIso;
	if (!decisionEndDateInput.value) decisionEndDateInput.value = todayIso;
}

function setDecisionMessage(message, tone = "") {
	if (!decisionFormMessage) return;
	decisionFormMessage.textContent = message;
	decisionFormMessage.classList.remove("is-error", "is-success");
	if (tone === "error") decisionFormMessage.classList.add("is-error");
	if (tone === "success") decisionFormMessage.classList.add("is-success");
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
	if (!decisionOptionsList) return;
	decisionOptionsList.innerHTML = "";
	decisionOptionsList.appendChild(createDecisionOptionRow(OPTION_ICONS[0], true));
	decisionOptionsList.appendChild(createDecisionOptionRow(OPTION_ICONS[1], false));
}

function resetDecisionForm() {
	if (decisionTitleInput) decisionTitleInput.value = "";
	if (decisionDescriptionInput) decisionDescriptionInput.value = "";
	if (decisionGroupSelect) decisionGroupSelect.value = "";
	if (decisionFriendsSelect) Array.from(decisionFriendsSelect.options).forEach((o) => { o.selected = false; });
	if (decisionEndDateInput) decisionEndDateInput.value = getTodayIsoDate();
	setDecisionMessage("");
	resetDecisionOptions();
}

function addDecisionOption() {
	if (!decisionOptionsList) return;
	const currentCount = decisionOptionsList.querySelectorAll(".decision-option-row").length;
	const nextIcon = OPTION_ICONS[currentCount % OPTION_ICONS.length];
	const newRow = createDecisionOptionRow(nextIcon, false);
	decisionOptionsList.appendChild(newRow);
	const newInput = newRow.querySelector(".decision-input-option");
	if (newInput) newInput.focus();
}

function createDecisionListItem(decision, statusText = "Decisão criada", descriptionText = "", statusIconClass = "fa-circle-info", statusToneClass = "status-neutral", deadlineNote = "") {
	const optionsCount = Array.isArray(decision.options) ? decision.options.length : 0;
	const item = document.createElement("article");
	item.className = "decision-list-item";
	const infoBox = document.createElement("div");
	infoBox.className = "info-box";
	const infoLabel = document.createElement("span");
	infoLabel.textContent = "Estado:";
	const infoValue = document.createElement("strong");
	infoValue.className = `decision-status-badge ${statusToneClass}`;
	infoValue.innerHTML = `<i class="fa-solid ${statusIconClass} decision-status-icon" aria-hidden="true"></i><span>${statusText}</span>`;
	infoBox.appendChild(infoLabel);
	infoBox.appendChild(infoValue);
	const winnerBox = document.createElement("div");
	winnerBox.className = "winner-box";
	const winnerDescription = document.createElement("small");
	winnerDescription.textContent = descriptionText || `${optionsCount} opções prontas para votação.`;
	const winnerValue = document.createElement("h3");
	winnerValue.textContent = decision.title || "Decisão sem título";
	winnerBox.appendChild(winnerDescription);
	winnerBox.appendChild(winnerValue);
	if (deadlineNote) {
		const deadlineElement = document.createElement("p");
		deadlineElement.className = "decision-deadline-note";
		deadlineElement.innerHTML = `<i class="fa-regular fa-clock" aria-hidden="true"></i> ${deadlineNote}`;
		winnerBox.appendChild(deadlineElement);
	}
	const viewMoreButton = document.createElement("button");
	viewMoreButton.className = "view-btn decision-view-more-btn";
	viewMoreButton.type = "button";
	viewMoreButton.innerHTML = 'View More <i class="fa-solid fa-angle-right"></i>';
	viewMoreButton.addEventListener("click", () => { saveLatestDecision(decision); redirectToDecisionTemplate(); });
	item.appendChild(infoBox);
	item.appendChild(winnerBox);
	item.appendChild(viewMoreButton);
	return item;
}

function updateDecisionCards() {
	const decisions = getDecisions();
	if (decisionSummaryText) {
		if (decisions.length === 0)      decisionSummaryText.textContent = "Sem decisões";
		else if (decisions.length === 1) decisionSummaryText.textContent = "1 decisão criada";
		else                             decisionSummaryText.textContent = `${decisions.length} decisões criadas`;
	}
	if (!decisionList) return;
	decisionList.innerHTML = "";
	if (decisions.length === 0) { if (decisionListEmpty) decisionListEmpty.hidden = false; return; }
	if (decisionListEmpty) decisionListEmpty.hidden = true;
	const latestDecision = decisions[decisions.length - 1];
	decisionList.appendChild(createDecisionListItem(latestDecision, "New", "", "fa-sparkles", "status-new"));
	const soonestEnding = decisions
		.map((decision, index) => ({ decision, index, daysLeft: calculateDaysUntilEnd(decision.endDate) }))
		.filter((entry) => entry.daysLeft !== null && entry.daysLeft >= 0 && entry.daysLeft <= 3)
		.sort((a, b) => a.daysLeft - b.daysLeft)[0];
	if (soonestEnding && soonestEnding.index !== decisions.length - 1) {
		const daysLabel = soonestEnding.daysLeft === 0 ? "Termina hoje" : soonestEnding.daysLeft === 1 ? "Termina em 1 dia" : `Termina em ${soonestEnding.daysLeft} dias`;
		const endDateLabel = formatIsoDateToPt(soonestEnding.decision.endDate);
		decisionList.appendChild(createDecisionListItem(soonestEnding.decision, "Finishing", "", "fa-hourglass-half", "status-finishing", `${daysLabel} · Prazo final: ${endDateLabel}`));
	}
}

function handleCreateDecision() {
	const title = decisionTitleInput ? decisionTitleInput.value.trim() : "";
	const description = decisionDescriptionInput ? decisionDescriptionInput.value.trim() : "";
	const endDate = decisionEndDateInput ? decisionEndDateInput.value : "";
	const options = decisionOptionsList
		? Array.from(decisionOptionsList.querySelectorAll(".decision-input-option")).map((i) => i.value.trim()).filter((v) => v.length > 0)
		: [];
	if (!title) { setDecisionMessage("Preenche o título da decisão.", "error"); if (decisionTitleInput) decisionTitleInput.focus(); return; }
	if (options.length < 2) { setDecisionMessage("Adiciona pelo menos 2 opções para criar a decisão.", "error"); return; }
	if (!endDate) { setDecisionMessage("Define uma data de término para a decisão.", "error"); if (decisionEndDateInput) decisionEndDateInput.focus(); return; }
	if (endDate < getTodayIsoDate()) { setDecisionMessage("A data de término não pode ser no passado.", "error"); if (decisionEndDateInput) decisionEndDateInput.focus(); return; }
	const session = getSession();
	const groups = getStoredGroups();
	const friends = getStoredFriends();
	const selectedGroup = decisionGroupSelect && decisionGroupSelect.value ? groups.find((g) => g.id === decisionGroupSelect.value) || null : null;
	const selectedFriendIds = decisionFriendsSelect ? Array.from(decisionFriendsSelect.selectedOptions).map((o) => o.value).filter((v) => v) : [];
	const selectedFriends = friends.filter((f) => selectedFriendIds.includes(f.id));
	const decision = {
		title, description,
		date: decisionCurrentDate ? decisionCurrentDate.textContent : "",
		endDate,
		options: options.map((name) => ({ name, votes: 0 })),
		targetGroup: selectedGroup ? { id: selectedGroup.id, name: selectedGroup.name } : null,
		targetFriends: selectedFriends.map((f) => ({ id: f.id, name: f.name })),
		createdBy: session?.user?.name || "Utilizador"
	};
	const decisions = getDecisions();
	decisions.push(decision);
	saveDecisions(decisions);
	saveLatestDecision(decision);
	updateDecisionCards();
	setDecisionMessage("Decisão criada com sucesso.", "success");
	if (hasSwal()) {
		window.Swal.fire({ icon: "success", title: "Decisão criada", text: "A nova decisão foi criada com sucesso.", timer: 1700, showConfirmButton: false });
	}
	closeDecisionModal();
	resetDecisionForm();
}

function handleCancelDecision() { closeDecisionModal(); resetDecisionForm(); }

function initializeDecisionModal() {
	if (!decisionModalOverlay) return;
	decisionModalOverlay.hidden = true;
	initializeEndDateInput();
	resetDecisionForm();
}

// ── INIT ──────────────────────────────────────────────────────────────────────
ensureAuthenticated();

if (logoutButton) logoutButton.addEventListener("click", handleLogout);
if (friendsViewMoreButton) friendsViewMoreButton.addEventListener("click", redirectToFriends);
if (groupsViewMoreButton) groupsViewMoreButton.addEventListener("click", redirectToGroups);
if (groupsCreateButton) groupsCreateButton.addEventListener("click", redirectToGroupsCreate);
if (decisionCreateButtons.length > 0) decisionCreateButtons.forEach((btn) => btn.addEventListener("click", openDecisionModal));
if (decisionViewAllButton) decisionViewAllButton.addEventListener("click", redirectToAllDecisions);
if (decisionModalCloseButton) decisionModalCloseButton.addEventListener("click", closeDecisionModal);
if (decisionModalCancelButton) decisionModalCancelButton.addEventListener("click", handleCancelDecision);
if (decisionAddOptionButton) decisionAddOptionButton.addEventListener("click", addDecisionOption);
if (decisionGroupSelect) decisionGroupSelect.addEventListener("change", () => populateFriendsOptions(getStoredGroups(), getStoredFriends()));
if (decisionCreateConfirmButton) decisionCreateConfirmButton.addEventListener("click", handleCreateDecision);
if (decisionModalOverlay) decisionModalOverlay.addEventListener("click", (e) => { if (e.target === decisionModalOverlay) closeDecisionModal(); });

window.addEventListener("storage", (e) => { if (!e.key || e.key === GROUPS_KEY || e.key === FRIENDS_KEY) { syncTargetsIfModalOpen(); updateGroupsCard(); } });
window.addEventListener("focus", () => { syncTargetsIfModalOpen(); updateGroupsCard(); });
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") { syncTargetsIfModalOpen(); updateGroupsCard(); } });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeDecisionModal(); });

initializeDecisionModal();
setDecisionDate();
initializeEndDateInput();
updateDecisionCards();
updateGroupsCard();