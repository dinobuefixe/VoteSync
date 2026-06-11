const USERS_KEY   = "votesync.users";
const SESSION_KEY = "votesync.session";

const registerForm = document.querySelector("#register-form");
const authStatus   = document.querySelector("#auth-status");

// ── Storage helpers ───────────────────────────────────────────────────────────
function getUsers() {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    try { return JSON.parse(raw); } catch { return []; }
}

function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function saveSession(session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function createId() {
    if (globalThis.crypto && globalThis.crypto.randomUUID) return globalThis.crypto.randomUUID();
    return `user-${Date.now()}-${Math.random().toString(16).slice(2)}`;
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

function clearFieldErrors() {
    registerForm.querySelectorAll(".field-error").forEach((el) => (el.textContent = ""));
}

function setFieldError(id, msg) {
    const el = document.querySelector(`[data-error-for="${id}"]`);
    if (el) el.textContent = msg;
}

function setSubmitLoading(loading) {
    const btn = registerForm.querySelector("button[type='submit']");
    if (!btn) return;
    if (!btn.dataset.defaultText) btn.dataset.defaultText = btn.textContent;
    btn.disabled = loading;
    btn.textContent = loading ? "Please wait..." : btn.dataset.defaultText;
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

// ── Pre-fill name from index.html hero form ───────────────────────────────────
(function prefillName() {
    const params    = new URLSearchParams(window.location.search);
    const name      = params.get("name");
    const nameInput = document.querySelector("#register-name");
    if (name && nameInput) nameInput.value = name;
})();

// ── Validation ────────────────────────────────────────────────────────────────
function validateRegister() {
    clearFieldErrors();
    const name    = document.querySelector("#register-name").value.trim();
    const email   = document.querySelector("#register-email").value.trim();
    const pass    = document.querySelector("#register-password").value;
    const confirm = document.querySelector("#register-confirm-password").value;
    const terms   = document.querySelector("#terms").checked;
    const re      = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let valid = true;

    if (!name)           { setFieldError("register-name",             "Full name is required.");                    valid = false; }
    if (!re.test(email)) { setFieldError("register-email",            "Enter a valid email.");                      valid = false; }
    if (pass.length < 8) { setFieldError("register-password",         "Password must have at least 8 characters."); valid = false; }
    if (confirm !== pass) { setFieldError("register-confirm-password", "Passwords do not match.");                  valid = false; }
    if (!terms)          { setFieldError("terms",                     "You need to accept the terms.");             valid = false; }

    return { valid, name, email, password: pass };
}

// ── Register ──────────────────────────────────────────────────────────────────
function registerUser(data) {
    const users  = getUsers();
    const exists = users.some((u) => u.email.toLowerCase() === data.email.toLowerCase());
    if (exists) { setFieldError("register-email", "This email is already registered."); throw new Error("Email already exists."); }

    // Primeiro utilizador registado torna-se admin automaticamente
    const isFirstUser = users.length === 0;

    const newUser = {
        id:       createId(),
        name:     data.name,
        email:    data.email,
        password: data.password,
        is_admin: isFirstUser   // ← true só para o primeiro utilizador; os restantes são false
    };
    users.push(newUser);
    saveUsers(users);

    const session = {
        token: createToken(newUser.id),
        user: {
            id:       newUser.id,
            name:     newUser.name,
            email:    newUser.email,
            is_admin: newUser.is_admin   // ← inclui o campo na sessão
        }
    };
    saveSession(session);
    return session;
}

registerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    setStatus("");
    const result = validateRegister();
    if (!result.valid) { setStatus("Please fix the highlighted fields.", "is-error"); return; }

    setSubmitLoading(true);
    try {
        const session = registerUser(result);
        registerForm.reset();
        setStatus("Account created successfully! Redirecting…", "is-success");
        setTimeout(() => {
            // Redireciona para admin.html se for admin, senão para dashboard.html
            if (session.user.is_admin === true) {
                window.location.href = "./admin.html";
            } else {
                window.location.href = "./dashboard.html";
            }
        }, 1500);
    } catch (err) {
        setStatus(err.message || "Could not create account.", "is-error");
    } finally {
        setSubmitLoading(false);
    }
});