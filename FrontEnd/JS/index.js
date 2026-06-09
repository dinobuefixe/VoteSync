const USERS_KEY = "votesync.users";
const SESSION_KEY = "votesync.session";

const homeStage = document.querySelector("#home-stage");
const authStage = document.querySelector("#auth-stage");
const headerLoginBtn = document.querySelector("#header-login-btn");
const heroForm = document.querySelector("#hero-form");
const heroNameInput = document.querySelector("#hero-name");
const heroLoginCta = document.querySelector("#hero-login-cta");
const backHomeBtn = document.querySelector("#back-home-btn");
const loginForm = document.querySelector("#login-form");
const registerForm = document.querySelector("#register-form");
const authStatus = document.querySelector("#auth-status");
const switchLogin = document.querySelector("#switch-login");
const switchRegister = document.querySelector("#switch-register");
const switchButtons = document.querySelectorAll("[data-switch-to]");
const passwordToggleButtons = document.querySelectorAll("[data-toggle-password]");
const sessionRow = document.querySelector("#session-row");
const sessionText = document.querySelector("#session-text");
const logoutBtn = document.querySelector("#logout-btn");

function getUsers() {
	const raw = localStorage.getItem(USERS_KEY);
	if (!raw) {
		return [];
	}

	try {
		return JSON.parse(raw);
	} catch {
		return [];
	}
}

function saveUsers(users) {
	localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function saveSession(session) {
	localStorage.setItem(SESSION_KEY, JSON.stringify(session));
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

function createId() {
	if (globalThis.crypto && globalThis.crypto.randomUUID) {
		return globalThis.crypto.randomUUID();
	}

	return `user-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createToken(userId) {
	return `local-${userId}-${Date.now()}`;
}

function setStatus(message, tone = "") {
	authStatus.textContent = message;
	authStatus.classList.remove("is-error", "is-success");
	if (tone) {
		authStatus.classList.add(tone);
	}
}

function clearFieldErrors(form) {
	const errors = form.querySelectorAll(".field-error");
	errors.forEach((node) => {
		node.textContent = "";
	});
}

function setFieldError(inputId, message) {
	const node = document.querySelector(`[data-error-for="${inputId}"]`);
	if (node) {
		node.textContent = message;
	}
}

function setSubmitLoading(form, loading) {
	const button = form.querySelector("button[type='submit']");
	if (!button) {
		return;
	}

	if (!button.dataset.defaultText) {
		button.dataset.defaultText = button.textContent;
	}

	button.disabled = loading;
	button.textContent = loading ? "Please wait..." : button.dataset.defaultText;
}

function setHeaderButtonAuthMode(isAuthMode) {
	headerLoginBtn.innerHTML = isAuthMode
		? "<span aria-hidden=\"true\"><img class=\"loginIMG\" src=\"static/IMG/Login.png\" alt=\"Login icon\"></span> Home"
		: "<span aria-hidden=\"true\"><img class=\"loginIMG\" src=\"static/IMG/Login.png\" alt=\"Login icon\"></span> Login";
	headerLoginBtn.setAttribute("aria-label", isAuthMode ? "Back to home" : "Login");
}

function showLandingPage() {
	homeStage.hidden = false;
	authStage.hidden = true;
	setHeaderButtonAuthMode(false);
}

function showAuthPage(mode = "login") {
	homeStage.hidden = true;
	authStage.hidden = false;
	switchMode(mode);
	setHeaderButtonAuthMode(true);
}

function switchMode(mode) {
	const loginMode = mode === "login";

	loginForm.hidden = !loginMode;
	registerForm.hidden = loginMode;
	switchLogin.hidden = !loginMode;
	switchRegister.hidden = loginMode;

	clearFieldErrors(loginForm);
	clearFieldErrors(registerForm);
	setStatus("");
}

function validateLogin() {
	clearFieldErrors(loginForm);

	const email = document.querySelector("#login-email").value.trim();
	const password = document.querySelector("#login-password").value;
	let valid = true;

	if (!email) {
		setFieldError("login-email", "Email is required.");
		valid = false;
	}

	if (!password) {
		setFieldError("login-password", "Password is required.");
		valid = false;
	}

	return { valid, email, password };
}

function validateRegister() {
	clearFieldErrors(registerForm);

	const name = document.querySelector("#register-name").value.trim();
	const email = document.querySelector("#register-email").value.trim();
	const password = document.querySelector("#register-password").value;
	const confirmPassword = document.querySelector("#register-confirm-password").value;
	const termsAccepted = document.querySelector("#terms").checked;
	const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	let valid = true;

	if (!name) {
		setFieldError("register-name", "Full name is required.");
		valid = false;
	}

	if (!emailPattern.test(email)) {
		setFieldError("register-email", "Enter a valid email.");
		valid = false;
	}

	if (password.length < 8) {
		setFieldError("register-password", "Password must have at least 8 characters.");
		valid = false;
	}

	if (confirmPassword !== password) {
		setFieldError("register-confirm-password", "Passwords do not match.");
		valid = false;
	}

	if (!termsAccepted) {
		setFieldError("terms", "You need to accept the terms.");
		valid = false;
	}

	return { valid, name, email, password };
}

function showSession(user) {
	sessionRow.hidden = false;
	sessionText.textContent = `Logged in as ${user.name || user.email}`;
}

function hideSession() {
	sessionRow.hidden = true;
	sessionText.textContent = "";
}

async function registerUser() {

	const data = {
		name: document.getElementById("register-name").value,
		email: document.getElementById("register-email").value,
		password: document.getElementById("register-password").value
	};

    const response = await fetch("/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const text = await response.text(); // ← evita o erro do JSON
        console.error("Erro do servidor:", text);
        throw new Error("Registration failed");
    }

    const newUser = await response.json();

    const session = {
        token: createToken(newUser.id),
        user: newUser
    };

    saveSession(session);
    return session;
}

function loginUser(email, password) {
	const users = getUsers();
	const user = users.find((entry) => entry.email.toLowerCase() === email.toLowerCase());

	if (!user || user.password !== password) {
		throw new Error("Invalid credentials.");
	}

	const session = {
		token: createToken(user.id),
		user: {
			id: user.id,
			name: user.name,
			email: user.email
		}
	};

	saveSession(session);
	return session;
}

function restoreSession() {
	const session = getSession();
	if (!session || !session.user) {
		hideSession();
		return;
	}

	const users = getUsers();
	const exists = users.find((user) => user.id === session.user.id);
	if (!exists) {
		clearSession();
		hideSession();
		return;
	}

	showSession(session.user);
	window.location.href = "./dashboard.html";
}

function handleLoginSubmit(event) {
	event.preventDefault();
	setStatus("");
	const result = validateLogin();
	if (!result.valid) {
		setStatus("Please fix the highlighted fields.", "is-error");
		return;
	}

	setSubmitLoading(loginForm, true);
	try {
		const session = loginUser(result.email, result.password);
		loginForm.reset();
		showSession(session.user);
		setStatus("Login successful.", "is-success");
		window.location.href = "./dashboard.html";
	} catch {
		setStatus("Email or password is incorrect.", "is-error");
	} finally {
		setSubmitLoading(loginForm, false);
	}
}

function handleRegisterSubmit(event) {
	event.preventDefault();
	setStatus("");
	const result = validateRegister();
	if (!result.valid) {
		setStatus("Please fix the highlighted fields.", "is-error");
		return;
	}

	setSubmitLoading(registerForm, true);
	try {
		const session = registerUser(result);
		registerForm.reset();
		showSession(session.user);
		switchMode("login");
		setStatus("Account created successfully.", "is-success");
	} catch (error) {
		setStatus(error.message || "Could not create account.", "is-error");
	} finally {
		setSubmitLoading(registerForm, false);
	}
}

function handleLogout() {
	clearSession();
	hideSession();
	setStatus("You have logged out.", "is-success");
}

function handleHeroRegisterRedirect() {
	showAuthPage("register");

	const registerNameInput = document.querySelector("#register-name");
	if (!registerNameInput) {
		return;
	}

	const heroName = heroNameInput ? heroNameInput.value.trim() : "";
	registerNameInput.value = heroName;

	if (heroName) {
		const registerEmailInput = document.querySelector("#register-email");
		(registerEmailInput || registerNameInput).focus();
		return;
	}

	registerNameInput.focus();
}

function handlePasswordToggle(button) {
	const targetId = button.dataset.togglePassword;
	const input = document.querySelector(`#${targetId}`);
	if (!input) {
		return;
	}

	const show = input.type === "password";
	input.type = show ? "text" : "password";
	button.textContent = show ? "◎" : "◉";
}

switchButtons.forEach((button) => {
	button.addEventListener("click", () => switchMode(button.dataset.switchTo));
});
passwordToggleButtons.forEach((button) => {
	button.addEventListener("click", () => handlePasswordToggle(button));
});
headerLoginBtn.addEventListener("click", () => {
	if (authStage.hidden) {
		showAuthPage("login");
		return;
	}

	showLandingPage();
});
backHomeBtn.addEventListener("click", showLandingPage);
if (heroLoginCta) {
	heroLoginCta.addEventListener("click", handleHeroRegisterRedirect);
}
if (heroForm) {
	heroForm.addEventListener("submit", (event) => {
		event.preventDefault();
		handleHeroRegisterRedirect();
	});
}

loginForm.addEventListener("submit", handleLoginSubmit);
registerForm.addEventListener("submit", handleRegisterSubmit);
logoutBtn.addEventListener("click", handleLogout);

showLandingPage();
switchMode("login");
restoreSession();
