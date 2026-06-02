const SESSION_KEY = "votesync.session";
const DECISION_TEMPLATE_KEY = "votesync.decision.latest";

const decisionTitle = document.querySelector("#decision-title");
const decisionDescription = document.querySelector("#decision-description");
const decisionDate = document.querySelector("#decision-date");
const decisionTimeLeft = document.querySelector("#decision-time-left");
const decisionOptionsContainer = document.querySelector("#decision-options-container");
const decisionTotalVotes = document.querySelector("#decision-total-votes");
const decisionTotalOptions = document.querySelector("#decision-total-options");
const decisionCreatedBy = document.querySelector("#decision-created-by");
const logoutButton = document.querySelector("#decision-logout-btn");

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

function redirectToLogin() {
    window.location.href = "./index.html";
}

function ensureAuthenticated() {
    const session = getSession();
    if (!session || !session.user || !session.token) {
        redirectToLogin();
    }
}

function getLatestDecision() {
    const raw = localStorage.getItem(DECISION_TEMPLATE_KEY);
    if (!raw) {
        return {
            title: "Decisão sem título",
            description: "Ainda não criaste nenhuma decisão.",
            date: getTodayDate(),
            options: [{ name: "Sem opções", votes: 0 }],
            createdBy: "Utilizador"
        };
    }

    try {
        const parsed = JSON.parse(raw);
        if (!parsed || !Array.isArray(parsed.options) || parsed.options.length === 0) {
            return {
                title: parsed && parsed.title ? parsed.title : "Decisão sem título",
                description: parsed && parsed.description ? parsed.description : "Sem descrição disponível.",
                date: parsed && parsed.date ? parsed.date : getTodayDate(),
                options: [{ name: "Sem opções", votes: 0 }],
                createdBy: parsed && parsed.createdBy ? parsed.createdBy : "Utilizador"
            };
        }

        return parsed;
    } catch {
        return {
            title: "Decisão sem título",
            description: "Sem descrição disponível.",
            date: getTodayDate(),
            options: [{ name: "Sem opções", votes: 0 }],
            createdBy: "Utilizador"
        };
    }
}

function getTodayDate() {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();
    return `${day}/${month}/${year}`;
}

function formatIsoToDisplay(isoDate) {
    if (!isoDate || typeof isoDate !== "string" || !isoDate.includes("-")) {
        return "";
    }

    const [year, month, day] = isoDate.split("-");
    if (!year || !month || !day) {
        return "";
    }

    return `${day}/${month}/${year}`;
}

function calculateDaysLeft(endDateIso) {
    if (!endDateIso) {
        return null;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endDate = new Date(`${endDateIso}T00:00:00`);
    if (Number.isNaN(endDate.getTime())) {
        return null;
    }

    const diffMs = endDate.getTime() - today.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

function renderOptionCard(option, index) {
    const card = document.createElement("article");
    card.className = "option-card";
    if (index === 0) {
        card.style.boxShadow = "0 14px 20px -20px rgba(15, 20, 40, 0.85), inset 0 0 0 2px rgba(93, 122, 255, 0.45)";
    }

    const name = document.createElement("p");
    name.className = "option-name";
    name.textContent = option.name;

    const votesWrap = document.createElement("div");
    votesWrap.className = "option-votes";

    const votesCount = Math.max(1, Math.min(5, Number.isFinite(option.votes) ? option.votes : 1));
    for (let i = 0; i < votesCount; i += 1) {
        const chip = document.createElement("button");
        chip.className = "vote-chip";
        chip.type = "button";
        chip.innerHTML = '<i class="fa-regular fa-thumbs-up"></i>';
        votesWrap.appendChild(chip);
    }

    card.appendChild(name);
    card.appendChild(votesWrap);
    return card;
}

function renderDecisionTemplate() {
    const decision = getLatestDecision();

    if (decisionTitle) {
        decisionTitle.textContent = decision.title || "Decisão sem título";
    }

    if (decisionDescription) {
        decisionDescription.textContent = decision.description || "Sem descrição disponível.";
    }

    if (decisionDate) {
        const endDateLabel = formatIsoToDisplay(decision.endDate);
        decisionDate.textContent = endDateLabel || decision.date || getTodayDate();
    }

    if (decisionTimeLeft) {
        const daysLeft = calculateDaysLeft(decision.endDate);
        if (daysLeft === null) {
            decisionTimeLeft.textContent = "Sem prazo";
        } else if (daysLeft < 0) {
            decisionTimeLeft.textContent = "Encerrada";
        } else if (daysLeft === 0) {
            decisionTimeLeft.textContent = "Termina hoje";
        } else if (daysLeft === 1) {
            decisionTimeLeft.textContent = "1 dia restante";
        } else {
            decisionTimeLeft.textContent = `${daysLeft} dias restantes`;
        }
    }

    if (decisionOptionsContainer) {
        decisionOptionsContainer.innerHTML = "";
        decision.options.forEach((option, index) => {
            decisionOptionsContainer.appendChild(renderOptionCard(option, index));
        });
    }

    const totalVotes = decision.options.reduce((sum, option) => {
        const value = Number.isFinite(option.votes) ? option.votes : 0;
        return sum + Math.max(0, value);
    }, 0);

    if (decisionTotalVotes) {
        decisionTotalVotes.textContent = String(totalVotes);
    }

    if (decisionTotalOptions) {
        decisionTotalOptions.textContent = String(decision.options.length);
    }

    if (decisionCreatedBy) {
        decisionCreatedBy.textContent = decision.createdBy || "Utilizador";
    }
}

function handleLogout() {
    clearSession();
    redirectToLogin();
}

ensureAuthenticated();
renderDecisionTemplate();

if (logoutButton) {
    logoutButton.addEventListener("click", handleLogout);
}
