const USERS_KEY   = "votesync.users";
const SESSION_KEY = "votesync.session";

const loginForm          = document.querySelector("#login-form");
const forgotForm         = document.querySelector("#forgot-form");
const authStatus         = document.querySelector("#auth-status");
const switchLogin        = document.querySelector("#switch-login");
const switchForgot       = document.querySelector("#switch-forgot");
const forgotPasswordLink = document.querySelector("#forgot-password-link");
const backToLoginBtn     = document.querySelector("#back-to-login-btn");
const sessionRow         = document.querySelector("#session-row");
const sessionText        = document.querySelector("#session-text");
const logoutBtn          = document.querySelector("#logout-btn");

// ── Storage helpers ───────────────────────────────────────────────────────────
function getUsers() {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    try { return JSON.parse(raw); } catch { return []; }
}

function saveSession(session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function getSession() {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
}

function clearSession() {
    localStorage.removeItem(SESSION_KEY);
}

function createToken(userId) {
    return `local-${userId}-${Date.now()}`;
}

// ── UI helpers ────────────────────────────────────────────────────────────────
function setStatus(message, tone = "") {
    authStatus.textContent = message;
    authStatus.classList.remove("is-error", "is-success");
    if (tone) authStatus.classList.add(tone);
}

function clearFieldErrors(form) {
    form.querySelectorAll(".field-error").forEach((el) => (el.textContent = ""));
}

function setFieldError(id, msg) {
    const el = document.querySelector(`[data-error-for="${id}"]`);
    if (el) el.textContent = msg;
}

function setSubmitLoading(form, loading) {
    const btn = form.querySelector("button[type='submit']");
    if (!btn) return;
    if (!btn.dataset.defaultText) btn.dataset.defaultText = btn.textContent;
    btn.disabled = loading;
    btn.textContent = loading ? "Please wait..." : btn.dataset.defaultText;
}

function showSession(user) {
    sessionRow.hidden = false;
    sessionText.textContent = `Logged in as ${user.name || user.email}`;
}

function hideSession() {
    sessionRow.hidden = true;
    sessionText.textContent = "";
}

// ── Redirecionar consoante o papel ────────────────────────────────────────────
function redirectAfterLogin(user) {
    if (user.is_admin === true) {
        window.location.href = "./admin.html";
    } else {
        window.location.href = "./dashboard.html";
    }
}

// ── Form switching ────────────────────────────────────────────────────────────
function showForm(which) {
    loginForm.hidden  = which !== "login";
    forgotForm.hidden = which !== "forgot";
    switchLogin.hidden  = which !== "login";
    switchForgot.hidden = which !== "forgot";
    clearFieldErrors(loginForm);
    clearFieldErrors(forgotForm);
    setStatus("");
}

// ── Password toggles ──────────────────────────────────────────────────────────
document.querySelectorAll("[data-toggle-password]").forEach((btn) => {
    btn.addEventListener("click", () => {
        const input = document.querySelector(`#${btn.dataset.togglePassword}`);
        if (!input) return;
        const show = input.type === "password";
        input.type = show ? "text" : "password";
        btn.textContent = show ? "◎" : "◉";
    });
});

// ── Login ─────────────────────────────────────────────────────────────────────
function validateLogin() {
    clearFieldErrors(loginForm);
    const email    = document.querySelector("#login-email").value.trim();
    const password = document.querySelector("#login-password").value;
    let valid = true;

    if (!email)    { setFieldError("login-email",    "Email is required.");    valid = false; }
    if (!password) { setFieldError("login-password", "Password is required."); valid = false; }
    return { valid, email, password };
}

function loginUser(email, password) {
    const users = getUsers();
    const user  = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user || user.password !== password) throw new Error("Invalid credentials.");

    const session = {
        token: createToken(user.id),
        user: {
            id:       user.id,
            name:     user.name,
            email:    user.email,
            is_admin: user.is_admin === true   // ← inclui o campo admin na sessão
        }
    };
    saveSession(session);
    return session;
}

loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    setStatus("");
    const result = validateLogin();
    if (!result.valid) { setStatus("Please fix the highlighted fields.", "is-error"); return; }

    setSubmitLoading(loginForm, true);
    try {
        const session = loginUser(result.email, result.password);
        loginForm.reset();
        showSession(session.user);
        setStatus("Login successful.", "is-success");
        redirectAfterLogin(session.user);   // ← redireciona para admin.html ou dashboard.html
    } catch {
        setStatus("Email or password is incorrect.", "is-error");
    } finally {
        setSubmitLoading(loginForm, false);
    }
});

// ── Forgot / Reset ────────────────────────────────────────────────────────────
function validateForgot() {
    clearFieldErrors(forgotForm);
    const email   = document.querySelector("#forgot-email").value.trim();
    const pass    = document.querySelector("#forgot-password").value;
    const confirm = document.querySelector("#forgot-confirm-password").value;
    const re      = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let valid = true;

    if (!re.test(email)) { setFieldError("forgot-email",            "Enter a valid email.");              valid = false; }
    if (pass.length < 8) { setFieldError("forgot-password",         "Password must have at least 8 characters."); valid = false; }
    if (confirm !== pass) { setFieldError("forgot-confirm-password", "Passwords do not match.");           valid = false; }
    return { valid, email, password: pass };
}

forgotPasswordLink.addEventListener("click", (e) => {
    e.preventDefault();
    const loginEmail  = document.querySelector("#login-email");
    const forgotEmail = document.querySelector("#forgot-email");
    if (forgotEmail && loginEmail) forgotEmail.value = loginEmail.value.trim();
    showForm("forgot");
});

if (backToLoginBtn) backToLoginBtn.addEventListener("click", () => showForm("login"));

forgotForm.addEventListener("submit", (e) => {
    e.preventDefault();
    setStatus("");
    const result = validateForgot();
    if (!result.valid) { setStatus("Please fix the highlighted fields.", "is-error"); return; }

    setSubmitLoading(forgotForm, true);
    try {
        const users = getUsers();
        const idx   = users.findIndex((u) => u.email.toLowerCase() === result.email.toLowerCase());
        if (idx === -1) { setFieldError("forgot-email", "Email not found."); throw new Error("No account for this email."); }

        users[idx].password = result.password;
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
        forgotForm.reset();

        const loginEmail = document.querySelector("#login-email");
        if (loginEmail) loginEmail.value = users[idx].email;

        setStatus("Password updated. You can sign in now.", "is-success");
        setTimeout(() => showForm("login"), 1800);
    } catch (err) {
        setStatus(err.message || "Could not reset password.", "is-error");
    } finally {
        setSubmitLoading(forgotForm, false);
    }
});

// ── Logout ────────────────────────────────────────────────────────────────────
logoutBtn.addEventListener("click", () => {
    clearSession();
    hideSession();
    setStatus("You have logged out.", "is-success");
});

// ── Restaurar sessão (redireciona automaticamente se já estiver logado) ────────
(function restoreSession() {
    const session = getSession();
    if (!session || !session.user) return hideSession();
    const exists = getUsers().find((u) => u.id === session.user.id);
    if (!exists) { clearSession(); return hideSession(); }
    showSession(session.user);
    redirectAfterLogin(session.user);   // ← usa a mesma lógica de redirecionamento
})();

showForm("login");