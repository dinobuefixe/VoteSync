const SESSION_KEY = "votesync.session";

const logoutButton = document.querySelector("#dashboard-logout-btn");
const friendsViewMoreButton = document.querySelector("#friends-view-more-btn");
const groupsViewMoreButton = document.querySelector("#groups-view-more-btn");

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

function redirectToFriends() {
	window.location.href = "./friends.html";
}

function redirectToGroups() {
	window.location.href = "./groups.html";
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
