const SESSION_KEY = "votesync.session";
const DECISIONS_KEY = "votesync.decisions";

const logoutButton = document.querySelector("#decisions-logout-btn");
const decisionsSummaryText = document.querySelector("#decisions-summary-text");
const decisionsListEmpty = document.querySelector("#decisions-list-empty");
const decisionsList = document.querySelector("#decisions-list");

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

function handleLogout() {
    clearSession();
    redirectToLogin();
}

function redirectToDecisionTemplate() {
    window.location.href = "./decisionMaking.html";
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
    viewMoreButton.className = "view-btn";
    viewMoreButton.type = "button";
    viewMoreButton.innerHTML = 'View More <i class="fa-solid fa-angle-right"></i>';
    viewMoreButton.addEventListener("click", redirectToDecisionTemplate);

    item.appendChild(infoBox);
    item.appendChild(winnerBox);
    item.appendChild(viewMoreButton);

    return item;
}

function renderAllDecisions() {
    const decisions = getDecisions();
    const orderedDecisions = decisions.slice().reverse();

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
}

ensureAuthenticated();
renderAllDecisions();

if (logoutButton) {
    logoutButton.addEventListener("click", handleLogout);
}
