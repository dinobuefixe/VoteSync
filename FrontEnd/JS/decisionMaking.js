/* ── VoteSync — decisionMaking.js ── */

// ── DOM REFS ──────────────────────────────────────────────────────────────────
const decisionTitle            = document.querySelector("#decision-title");
const decisionDescription      = document.querySelector("#decision-description");
const decisionDate             = document.querySelector("#decision-date");
const decisionTimeLeft         = document.querySelector("#decision-time-left");
const decisionOptionsContainer = document.querySelector("#decision-options-container");
const decisionTotalVotes       = document.querySelector("#decision-total-votes");
const decisionTotalOptions     = document.querySelector("#decision-total-options");
const decisionCreatedBy        = document.querySelector("#decision-created-by");
const decisionTargetGroup      = document.querySelector("#decision-target-group");
const decisionTargetFriends    = document.querySelector("#decision-target-friends");
const logoutButton             = document.querySelector("#decision-logout-btn");

// ── LOGO / LOGOUT ─────────────────────────────────────────────────────────────
function handleLogoClick(e) {
    e.preventDefault();
    const session = api.getSession();
    if (session && session.user) {
        window.location.href = session.user.is_admin ? "./admin.html" : "./dashboard.html";
    } else {
        window.location.href = "./index.html";
    }
}

function handleLogout() { api.logout(); }

// ── HELPERS ───────────────────────────────────────────────────────────────────
function getLatestDecision() {
    const raw = localStorage.getItem("votesync.decision.latest");
    if (!raw) return null;
    try { return JSON.parse(raw) || null; } catch { return null; }
}

function getTodayDate() {
    const now = new Date();
    return `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}`;
}

function formatIsoToDisplay(isoDate) {
    if (!isoDate || !isoDate.includes("-")) return "";
    const [year, month, day] = isoDate.split("-");
    if (!year || !month || !day) return "";
    return `${day}/${month}/${year}`;
}

function calculateDaysLeft(endDateIso) {
    if (!endDateIso) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = new Date(`${endDateIso}T00:00:00`);
    if (Number.isNaN(endDate.getTime())) return null;
    return Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

// ── RENDER OPTIONS ────────────────────────────────────────────────────────────
function renderOptionCard(option, index) {
    const card = document.createElement("article");
    card.className = "option-card";
    if (index === 0) {
        card.style.boxShadow = "0 14px 20px -20px rgba(15,20,40,0.85), inset 0 0 0 2px rgba(93,122,255,0.45)";
    }

    const name = document.createElement("p");
    name.className   = "option-name";
    // ✅ Suporta tanto option.name (criação) como option.option_text (API)
    name.textContent = option.option_text || option.name || "";

    const votesWrap = document.createElement("div");
    votesWrap.className = "option-votes";

    const votesCount = Math.max(1, Math.min(5, Number.isFinite(option.votes) ? option.votes : 1));
    for (let i = 0; i < votesCount; i++) {
        const chip = document.createElement("button");
        chip.className = "vote-chip";
        chip.type      = "button";
        chip.innerHTML = '<i class="fa-regular fa-thumbs-up"></i>';
        votesWrap.appendChild(chip);
    }

    card.appendChild(name);
    card.appendChild(votesWrap);
    return card;
}

<<<<<<< HEAD
// ── RENDER TARGETS ────────────────────────────────────────────────────────────
function renderDecisionTargets(decision) {
=======
function normalizeEntityName(entity, fallbackLabel) {
    if (typeof entity === "string") return entity;
    if (!entity || typeof entity !== "object") return fallbackLabel;
    return entity.name || entity.title || entity.label || fallbackLabel;
}

// ── FETCH AMIGOS DA API ───────────────────────────────────────────────────────
async function fetchFriendshipsByIds(friendshipIds) {
    if (!Array.isArray(friendshipIds) || friendshipIds.length === 0) {
        return [];
    }

    try {
        // Buscar todos os friendships e filtrar pelos IDs
        const allFriendships = await apiFetch("/friendships/");
        
        if (!Array.isArray(allFriendships)) {
            return [];
        }

        // Filtrar pelos IDs solicitados
        return allFriendships.filter(f => friendshipIds.includes(f.id));
    } catch (error) {
        console.error("Erro ao buscar amigos:", error);
        return [];
    }
}

// ── RENDERIZAR TARGETS COM DADOS DOS AMIGOS ───────────────────────────────────
function renderDecisionTargets(decision, friendshipsData = []) {
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
    if (decisionTargetGroup) {
        const groupName = decision?.target_group_name || "";
        decisionTargetGroup.textContent = groupName || "Sem grupo associado";
    }

    if (!decisionTargetFriends) return;
    decisionTargetFriends.innerHTML = "";

<<<<<<< HEAD
    const targetFriends = Array.isArray(decision?.target_friends) ? decision.target_friends : [];
=======
    // Usar dados da API para extrair nomes dos amigos
    const targetFriends = friendshipsData
        .map(f => normalizeEntityName(f, ""))
        .filter(n => n && n.length > 0);
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))

    if (targetFriends.length === 0) {
        const empty = document.createElement("span");
        empty.className   = "friend-empty";
        empty.textContent = "Sem amigos associados";
        decisionTargetFriends.appendChild(empty);
        return;
    }

    targetFriends.forEach(df => {
        const friendName = df?.friendship?.friend?.name || "Amigo desconhecido";
        const chip = document.createElement("span");
        chip.className   = "friend-chip";
        chip.textContent = friendName;
        decisionTargetFriends.appendChild(chip);
    });
}

<<<<<<< HEAD
// ── RENDER TEMPLATE ───────────────────────────────────────────────────────────
=======
// ── RENDERIZAR TEMPLATE DE DECISÃO ────────────────────────────────────────────
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
async function renderDecisionTemplate() {
    const decision = getLatestDecision();

    if (!decision) {
        if (decisionTitle)            decisionTitle.textContent            = "Sem decisões criadas";
        if (decisionDescription)      decisionDescription.textContent      = "Cria uma decisão no dashboard para ela aparecer aqui.";
        if (decisionDate)             decisionDate.textContent             = "--/--/----";
        if (decisionTimeLeft)         decisionTimeLeft.textContent         = "Sem prazo";
        if (decisionOptionsContainer) decisionOptionsContainer.innerHTML   = "";
        if (decisionTotalVotes)       decisionTotalVotes.textContent       = "0";
        if (decisionTotalOptions)     decisionTotalOptions.textContent     = "0";
        if (decisionCreatedBy)        decisionCreatedBy.textContent        = "-";
        renderDecisionTargets(null, []);
        return;
    }

    // ✅ Se tiver id, vai buscar dados frescos da API (inclui target_friends)
    if (decision.id) {
        try {
            const fresh = await api.getDecision(decision.id);
            if (fresh) {
                // Preservar target_group_name do localStorage
                fresh.target_group_name = decision.target_group_name || "";
                localStorage.setItem("votesync.decision.latest", JSON.stringify(fresh));
                return renderWithData(fresh);
            }
        } catch (err) {
            console.warn("Não foi possível buscar decisão da API, usando cache:", err);
        }
    }

    renderWithData(decision);
}

function renderWithData(decision) {
    const options = Array.isArray(decision.options) ? decision.options : [];

    if (decisionTitle)       decisionTitle.textContent       = decision.title       || "Decisão sem título";
    if (decisionDescription) decisionDescription.textContent = decision.description || "Sem descrição disponível.";

    if (decisionDate) {
        const endDateLabel = formatIsoToDisplay(decision.end_date || decision.endDate);
        decisionDate.textContent = endDateLabel || decision.date || getTodayDate();
    }

    if (decisionTimeLeft) {
        const daysLeft = calculateDaysLeft(decision.end_date || decision.endDate);
        if      (daysLeft === null) decisionTimeLeft.textContent = "Sem prazo";
        else if (daysLeft < 0)     decisionTimeLeft.textContent = "Encerrada";
        else if (daysLeft === 0)   decisionTimeLeft.textContent = "Termina hoje";
        else if (daysLeft === 1)   decisionTimeLeft.textContent = "1 dia restante";
        else                       decisionTimeLeft.textContent = `${daysLeft} dias restantes`;
    }

    if (decisionOptionsContainer) {
        decisionOptionsContainer.innerHTML = "";
        options.forEach((option, index) => decisionOptionsContainer.appendChild(renderOptionCard(option, index)));
    }

    const totalVotes = options.reduce((sum, o) => sum + Math.max(0, Number.isFinite(o.votes) ? o.votes : 0), 0);
    if (decisionTotalVotes)   decisionTotalVotes.textContent   = String(totalVotes);
    if (decisionTotalOptions) decisionTotalOptions.textContent = String(options.length);
    if (decisionCreatedBy)    decisionCreatedBy.textContent    = decision.created_by || decision.createdBy || "Utilizador";

    // ✅ NOVO: Buscar amigos da API e renderizar
    let friendshipsData = [];
    if (decision.targetFriends && Array.isArray(decision.targetFriends)) {
        friendshipsData = await fetchFriendshipsByIds(decision.targetFriends);
    }
    renderDecisionTargets(decision, friendshipsData);
}

// ── INIT ──────────────────────────────────────────────────────────────────────
api.ensureAuthenticated();
renderDecisionTemplate();

if (logoutButton) logoutButton.addEventListener("click", handleLogout);