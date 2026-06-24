/* ── VoteSync — Dashboard JS (REFATORIZADO COM api.js) ── */

// ✅ IMPORTANTE: Adiciona isto no HTML antes deste script:
// <script src="./api.js"></script>

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

// ── STATE ─────────────────────────────────────────────────────────────────────
const session = api.getSession();
const myId = parseInt(session?.user?.id);

// ── FRIENDS CARD ──────────────────────────────────────────────────────────────
async function updateFriendsCard() {
	const friendsListEl = document.querySelector("#friends-list-container");
	try {
		const [users, friendships] = await Promise.all([
			api.getUsers(),
			api.getFriendships()
		]);

		const myFriendIds = friendships
			.filter(f => f.status === "accepted" && (f.user_id === myId || f.friend_id === myId))
			.map(f => f.user_id === myId ? f.friend_id : f.user_id);
		const friendUsers = users.filter(u => myFriendIds.includes(u.id));

		if (!friendsListEl) return;

		if (friendUsers.length === 0) {
			friendsListEl.innerHTML = "<span>Sem amigos</span>";
			return;
		}

		friendsListEl.innerHTML = friendUsers.slice(0, 5).map((u, index) => `
			<div style="display:flex;align-items:center;gap:8px;padding:8px 10px;margin-bottom:${index === friendUsers.length - 1 ? '0' : '4px'};margin-left:-8px;margin-right:-8px;border-radius:0px;background:#f8f6fc;border:none;border-bottom:1px solid #e8e4f0;">
				<div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#9b7dd4,#5bc8e8);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:12px;flex-shrink:0;">
					${u.name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase()}
				</div>
				<div style="min-width:0;">
					<div style="font-weight:700;font-size:13px;color:#182033;margin:0;">${u.name}</div>
					<div style="font-size:10px;color:#7a7f8e;margin:0;">${u.email}</div>
				</div>
			</div>
		`).join("");

		if (friendUsers.length > 5) {
			friendsListEl.innerHTML += `<small style="color:#5f6678;font-size:12px;margin:4px 10px 0;display:block;">+${friendUsers.length - 5} mais</small>`;
		}
	} catch (err) {
		console.error("Erro ao carregar amigos:", err);
		if (friendsListEl) friendsListEl.innerHTML = "<span>Erro ao carregar amigos</span>";
	}
}

// ── GROUPS CARD ───────────────────────────────────────────────────────────────
async function updateGroupsCard() {
	if (!groupsPreviewList || !groupsCardEmpty) return;

	try {
		const groups = await api.getGroups(myId);

		// Pegar apenas os 3 primeiros grupos
		const preview = groups.slice(0, 3);

		groupsPreviewList.innerHTML = "";
		if (preview.length === 0) {
			groupsCardEmpty.hidden = false;
			return;
		}

		groupsCardEmpty.hidden = true;

		preview.forEach((group) => {
			const item = document.createElement("article");
			item.className = "group-preview-item";

			const main = document.createElement("div");
			main.className = "group-preview-main";

			const name = document.createElement("strong");
			name.className = "group-preview-name";
			name.textContent = group.name || "Grupo sem nome";

			const meta = document.createElement("small");
			meta.className = "group-preview-meta";
			const memberCount = Array.isArray(group.members) ? group.members.length : 0;
			meta.textContent = memberCount === 1 ? "1 membro" : `${memberCount} membros`;

			const badge = document.createElement("span");
			badge.className = "group-preview-badge";
			badge.textContent = "Recente";

			main.appendChild(name);
			main.appendChild(meta);
			item.appendChild(main);
			item.appendChild(badge);
			groupsPreviewList.appendChild(item);
		});
	} catch (err) {
		console.error("Erro ao carregar grupos:", err);
		groupsCardEmpty.hidden = false;
	}
}

// ── GROUPS FOR DECISIONS ──────────────────────────────────────────────────────
async function populateGroupOptions(groups) {
	if (!decisionGroupSelect) return;
	decisionGroupSelect.innerHTML = "";

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

async function populateDecisionTargets() {
	try {
		const groups = await api.getGroups(myId);
		await populateGroupOptions(groups);
	} catch (err) {
		console.error("Erro ao popular targets:", err);
	}
}

// ── DECISIONS ─────────────────────────────────────────────────────────────────
async function createDecisionOnAPI(decision) {
	const payload = {
		vote_id: `decision_${Date.now()}`,
		title: decision.title,
		decision_text: decision.description || decision.title,
		description: decision.description,
		end_date: decision.endDate,
		created_by: decision.createdBy,
		group_id: decision.GroupId || null,
		created_at: new Date().toISOString(),
	};

	const created = await api.post("/decisions/", payload);

	for (const option of decision.options) {
		await api.createOption(created.id, option.name);
	}

	return created;
}

async function updateDecisionCards() {
	try {
		const decisions = await api.getDecisions();

		if (decisionSummaryText) {
			if (decisions.length === 0) decisionSummaryText.textContent = "Sem decisões";
			else if (decisions.length === 1) decisionSummaryText.textContent = "1 decisão criada";
			else decisionSummaryText.textContent = `${decisions.length} decisões criadas`;
		}

		if (!decisionList) return;
		decisionList.innerHTML = "";

		if (decisions.length === 0) {
			if (decisionListEmpty) decisionListEmpty.hidden = false;
			return;
		}

		if (decisionListEmpty) decisionListEmpty.hidden = true;

		const latestDecision = decisions[decisions.length - 1];
		decisionList.appendChild(createDecisionListItem(latestDecision, "New", "", "fa-sparkles", "status-new"));

		const soonestEnding = decisions
			.map((decision, index) => ({
				decision,
				index,
				daysLeft: calculateDaysUntilEnd(decision.end_date || decision.endDate)
			}))
			.filter((entry) => entry.daysLeft !== null && entry.daysLeft >= 0 && entry.daysLeft <= 3)
			.sort((a, b) => a.daysLeft - b.daysLeft)[0];

		if (soonestEnding && soonestEnding.index !== decisions.length - 1) {
			const daysLabel = soonestEnding.daysLeft === 0
				? "Termina hoje"
				: soonestEnding.daysLeft === 1
					? "Termina em 1 dia"
					: `Termina em ${soonestEnding.daysLeft} dias`;
			const endDateLabel = formatIsoDateToPt(soonestEnding.decision.end_date || soonestEnding.decision.endDate);
			decisionList.appendChild(
				createDecisionListItem(
					soonestEnding.decision,
					"Finishing",
					"",
					"fa-hourglass-half",
					"status-finishing",
					`${daysLabel} · Prazo final: ${endDateLabel}`
				)
			);
		}
	} catch (err) {
		console.error("Erro ao carregar decisões:", err);
	}
}

// ── DECISION LIST RENDERING ───────────────────────────────────────────────────
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
	viewMoreButton.addEventListener("click", () => {
		localStorage.setItem("votesync.decision.latest", JSON.stringify(decision));
		window.location.href = "./decisionMaking.html";
	});

	item.appendChild(infoBox);
	item.appendChild(winnerBox);
	item.appendChild(viewMoreButton);
	return item;
}

// ── MODAL FUNCTIONS ───────────────────────────────────────────────────────────
async function openDecisionModal() {
	if (!decisionModalOverlay) return;
	await populateDecisionTargets();
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

// ── DECISION OPTIONS ──────────────────────────────────────────────────────────
function createDecisionOptionRow(isPrimary = false) {
	const row = document.createElement("div");
	row.className = isPrimary ? "decision-option-row focus-blue" : "decision-option-row";

	const inputWrapper = document.createElement("div");
	inputWrapper.className = isPrimary ? "decision-option-input-wrapper dotted-border" : "decision-option-input-wrapper filled-bg";
	const input = document.createElement("input");
	input.type = "text";
	input.className = "decision-input-option";
	input.placeholder = "Opção...";
	inputWrapper.appendChild(input);

	const iconBox = document.createElement("div");
	iconBox.className = "decision-option-icon-box dotted-border";

	const icon = document.createElement("img");
	icon.className = "trash-icon";
	icon.src = "/static/IMG/trash.png"; 
	icon.onclick = () => deleteDecisionOptionRow(row);
	iconBox.appendChild(icon);

	row.appendChild(inputWrapper);
	row.appendChild(iconBox);
	return row;
}

function deleteDecisionOptionRow(row) {
	if (!row || !decisionOptionsList) return;
	const rows = decisionOptionsList.querySelectorAll(".decision-option-row");
	if (rows.length <= 2) {
		setDecisionMessage("Deve haver pelo menos 2 opções.", "error");
		return;
	}
	row.remove();
	setDecisionMessage("");
}

function resetDecisionOptions() {
	if (!decisionOptionsList) return;
	decisionOptionsList.innerHTML = "";
	decisionOptionsList.appendChild(createDecisionOptionRow(true));
	decisionOptionsList.appendChild(createDecisionOptionRow(false));
}

function addDecisionOption() {
	if (!decisionOptionsList) return;
	const currentCount = decisionOptionsList.querySelectorAll(".decision-option-row").length;
	const newRow = createDecisionOptionRow(false);
	decisionOptionsList.appendChild(newRow);
	const newInput = newRow.querySelector(".decision-input-option");
	if (newInput) newInput.focus();
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

// ── DECISION CREATION ─────────────────────────────────────────────────────────
async function handleCreateDecision() {
	const title = decisionTitleInput ? decisionTitleInput.value.trim() : "";
	const description = decisionDescriptionInput ? decisionDescriptionInput.value.trim() : "";
	const endDate = decisionEndDateInput ? decisionEndDateInput.value : "";
	const options = decisionOptionsList
		? Array.from(decisionOptionsList.querySelectorAll(".decision-input-option")).map((i) => i.value.trim()).filter((v) => v.length > 0)
		: [];

	if (!title) {
		setDecisionMessage("Preenche o título da decisão.", "error");
		if (decisionTitleInput) decisionTitleInput.focus();
		return;
	}

	if (options.length < 2) {
		setDecisionMessage("Adiciona pelo menos 2 opções para criar a decisão.", "error");
		return;
	}

	if (!endDate) {
		setDecisionMessage("Define uma data de término para a decisão.", "error");
		if (decisionEndDateInput) decisionEndDateInput.focus();
		return;
	}

	if (endDate < getTodayIsoDate()) {
		setDecisionMessage("A data de término não pode ser no passado.", "error");
		if (decisionEndDateInput) decisionEndDateInput.focus();
		return;
	}

	const session = api.getSession();
	const selectedGroupId = decisionGroupSelect?.value ? parseInt(decisionGroupSelect.value) : null;
	const selectedGroupName = decisionGroupSelect?.selectedOptions?.[0]?.textContent || "";
	const selectedFriendIds = decisionFriendsSelect
		? Array.from(decisionFriendsSelect.selectedOptions).map((o) => o.value).filter((v) => v)
		: [];

	const decision = {
		title,
		description,
		date: decisionCurrentDate ? decisionCurrentDate.textContent : "",
		endDate,
		options: options.map((name) => ({ name, votes: 0 })),
		GroupId: selectedGroupId,
		group_name: selectedGroupName,
		createdBy: session?.user?.name || "Utilizador"
	};

	try {
		const created = await createDecisionOnAPI(decision);
		localStorage.setItem("votesync.decision.latest", JSON.stringify(created));

		closeDecisionModal();
		resetDecisionForm();
		await updateDecisionCards();

		setDecisionMessage("Decisão criada com sucesso.", "success");

		if (typeof window.Swal !== "undefined") {
			window.Swal.fire({
				icon: "success",
				title: "Decisão criada",
				text: "A nova decisão foi criada com sucesso.",
				timer: 1700,
				showConfirmButton: false
			});
		}
	} catch (err) {
		console.error("Erro ao criar decisão:", err);
		setDecisionMessage("Erro ao criar decisão: " + (err.message || "tenta novamente"), "error");
	}
}

// ── UTILITY FUNCTIONS ─────────────────────────────────────────────────────────
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

function initializeDecisionModal() {
	if (!decisionModalOverlay) return;
	decisionModalOverlay.hidden = true;
	initializeEndDateInput();
	resetDecisionForm();
}

// ── NAVIGATION ────────────────────────────────────────────────────────────────
function redirectToFriends() { window.location.href = "./friends.html"; }
function redirectToGroups() { window.location.href = "./groups.html"; }
function redirectToGroupsCreate() { window.location.href = "./groups.html#create-group"; }
function redirectToAllDecisions() { window.location.href = "./decisions.html"; }

function handleLogoClick(e) {
	e.preventDefault();
	const session = api.getSession();
	if (session && session.user) {
		window.location.href = session.user.is_admin ? "./admin.html" : "./dashboard.html";
	} else {
		window.location.href = "./index.html";
	}
}

// ── EVENT LISTENERS ───────────────────────────────────────────────────────────
if (logoutButton) logoutButton.addEventListener("click", () => api.logout());
if (friendsViewMoreButton) friendsViewMoreButton.addEventListener("click", redirectToFriends);
if (groupsViewMoreButton) groupsViewMoreButton.addEventListener("click", redirectToGroups);
if (groupsCreateButton) groupsCreateButton.addEventListener("click", redirectToGroupsCreate);
if (decisionCreateButtons.length > 0) decisionCreateButtons.forEach((btn) => btn.addEventListener("click", openDecisionModal));
if (decisionViewAllButton) decisionViewAllButton.addEventListener("click", redirectToAllDecisions);
if (decisionModalCloseButton) decisionModalCloseButton.addEventListener("click", closeDecisionModal);
if (decisionModalCancelButton) decisionModalCancelButton.addEventListener("click", () => { closeDecisionModal(); resetDecisionForm(); });
if (decisionAddOptionButton) decisionAddOptionButton.addEventListener("click", addDecisionOption);
if (decisionCreateConfirmButton) decisionCreateConfirmButton.addEventListener("click", handleCreateDecision);
if (decisionModalOverlay) decisionModalOverlay.addEventListener("click", (e) => { if (e.target === decisionModalOverlay) closeDecisionModal(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeDecisionModal(); });

// ── INIT ──────────────────────────────────────────────────────────────────────
api.ensureAuthenticated();
initializeDecisionModal();
setDecisionDate();
initializeEndDateInput();

(async () => {
	await updateFriendsCard();
	await updateGroupsCard();
	await updateDecisionCards();
})();

window.refreshFriendsCard = async function () {
	await updateFriendsCard();
}; 
