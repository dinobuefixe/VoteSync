/* ── VoteSync — login.js ── */

// ── DOM REFS ──────────────────────────────────────────────────────────────────
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

// ── UI HELPERS ────────────────────────────────────────────────────────────────
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
    if (sessionRow)  sessionRow.hidden = false;
    if (sessionText) sessionText.textContent = `Logged in as ${user.name || user.email}`;
}

function hideSession() {
    if (sessionRow)  sessionRow.hidden = true;
    if (sessionText) sessionText.textContent = "";
}

function redirectAfterLogin(user) {
    window.location.href = user.is_admin === true
        ? "/static/HTML/admin.html"
        : "/static/HTML/dashboard.html";
}

// ── FORM SWITCHING ────────────────────────────────────────────────────────────
function showForm(which) {
    loginForm.hidden        = which !== "login";
    forgotForm.hidden       = which !== "forgot";
    switchLogin.hidden      = which !== "login";
    switchForgot.hidden     = which !== "forgot";
    clearFieldErrors(loginForm);
    clearFieldErrors(forgotForm);
    setStatus("");
}

// ── PASSWORD TOGGLES ──────────────────────────────────────────────────────────
document.querySelectorAll("[data-toggle-password]").forEach((btn) => {
    btn.addEventListener("click", () => {
        const input = document.querySelector(`#${btn.dataset.togglePassword}`);
        if (!input) return;
        const show = input.type === "password";
        input.type = show ? "text" : "password";
        btn.textContent = show ? "◎" : "◉";
    });
});

// ── LOGIN ─────────────────────────────────────────────────────────────────────
function validateLogin() {
    clearFieldErrors(loginForm);
    const email    = document.querySelector("#login-email").value.trim();
    const password = document.querySelector("#login-password").value;
    let valid = true;

    if (!email)    { setFieldError("login-email",    "Email is required.");    valid = false; }
    if (!password) { setFieldError("login-password", "Password is required."); valid = false; }
    return { valid, email, password };
}

loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    setStatus("");
    const result = validateLogin();
    if (!result.valid) { setStatus("Please fix the highlighted fields.", "is-error"); return; }

    setSubmitLoading(loginForm, true);
    try {
        // ✅ Usar api.login() — guarda sessão automaticamente
        const data = await api.login(result.email, result.password);

        // Limpar dados antigos
        localStorage.removeItem("votesync.decisions");
        localStorage.removeItem("votesync.decision.latest");
        localStorage.removeItem("votesync.groups");

        loginForm.reset();
        showSession(data.user);
        setStatus("Login successful.", "is-success");
        redirectAfterLogin(data.user);
    } catch (err) {
        setStatus(err.message || "Email or password is incorrect.", "is-error");
    } finally {
        setSubmitLoading(loginForm, false);
    }
});

// ── FORGOT / RESET ────────────────────────────────────────────────────────────
function validateForgot() {
    clearFieldErrors(forgotForm);
    const email   = document.querySelector("#forgot-email").value.trim();
    const pass    = document.querySelector("#forgot-password").value;
    const confirm = document.querySelector("#forgot-confirm-password").value;
    const re      = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let valid = true;

    if (!re.test(email))  { setFieldError("forgot-email",            "Enter a valid email.");                      valid = false; }
    if (pass.length < 8)  { setFieldError("forgot-password",         "Password must have at least 8 characters."); valid = false; }
    if (confirm !== pass) { setFieldError("forgot-confirm-password", "Passwords do not match.");                   valid = false; }
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

forgotForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    setStatus("");
    const result = validateForgot();
    if (!result.valid) { setStatus("Please fix the highlighted fields.", "is-error"); return; }

    setSubmitLoading(forgotForm, true);
    try {
        // ✅ Reset de password via API
        await api.post("/auth/reset-password", { email: result.email, password: result.password });

        forgotForm.reset();
        const loginEmail = document.querySelector("#login-email");
        if (loginEmail) loginEmail.value = result.email;

        setStatus("Password updated. You can sign in now.", "is-success");
        setTimeout(() => showForm("login"), 1800);
    } catch (err) {
        setStatus(err.message || "Could not reset password.", "is-error");
    } finally {
        setSubmitLoading(forgotForm, false);
    }
});

// ── LOGOUT ────────────────────────────────────────────────────────────────────
logoutBtn?.addEventListener("click", () => {
    api.clearSession();
    hideSession();
    setStatus("You have logged out.", "is-success");
});

// ── RESTAURAR SESSÃO ──────────────────────────────────────────────────────────
(function restoreSession() {
    const session = api.getSession();
    if (!session || !session.user) return hideSession();
    showSession(session.user);
    redirectAfterLogin(session.user);
})();

showForm("login");