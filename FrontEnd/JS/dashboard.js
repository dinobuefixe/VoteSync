const SESSION_KEY = "votesync.session";

const logoutButton = document.querySelector("#dashboard-logout-btn");

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

function handleLogout() {
	clearSession();
	redirectToLogin();
}

ensureAuthenticated();

if (logoutButton) {
	logoutButton.addEventListener("click", handleLogout);
}
