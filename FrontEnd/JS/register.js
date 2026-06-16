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
    const params = new URLSearchParams(window.location.search);
    const name   = params.get("name");
    const nameInput = document.querySelector("#register-name");
    if (name && nameInput) nameInput.value = name;
})();

// ── Validation ────────────────────────────────────────────────────────────────
function validateRegister() {
    clearFieldErrors();
    const name     = document.querySelector("#register-name").value.trim();
    const email    = document.querySelector("#register-email").value.trim();
    const pass     = document.querySelector("#register-password").value;
    const confirm  = document.querySelector("#register-confirm-password").value;
    const terms    = document.querySelector("#terms").checked;
    const re       = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let valid = true;

    if (!name)          { setFieldError("register-name",             "Full name is required."); valid = false; }
    if (!re.test(email)) { setFieldError("register-email",           "Enter a valid email.");   valid = false; }
    if (pass.length < 8) { setFieldError("register-password",        "Password must have at least 8 characters."); valid = false; }
    if (confirm !== pass) { setFieldError("register-confirm-password","Passwords do not match."); valid = false; }
    if (!terms)          { setFieldError("terms",                    "You need to accept the terms."); valid = false; }

    return { valid, name, email, password: pass };
}

document.getElementById("register-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    clearFieldErrors();

    if (!validateRegister()) return;

    try {
        const session = await registerUser();
        console.log("Conta criada:", session);
        // redirecionar ou atualizar UI
    } catch (err) {
        const message = err.detail || "Não foi possível criar a conta. Tente novamente.";

        if (message.toLowerCase().includes("email")) {
            setFieldError("register-email", "Este email já está registrado.");
        } else {
            setFieldError("register-email", message);
        }
    }
});

async function registerUser() {
    const data = {
        name: document.getElementById("register-name").value.trim(),
        email: document.getElementById("register-email").value.trim(),
        password: document.getElementById("register-password").value
    };

    const response = await fetch("/users/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        let detail = "Erro ao criar conta. Tente novamente.";
        try {
            const errorData = await response.json();
            if (errorData.detail) detail = errorData.detail;
        } catch {
            // resposta não era JSON, mantém mensagem genérica
        }

        const err = new Error("Registration failed");
        err.detail = detail;
        throw err;
    }

    const newUser = await response.json();

    const session = {
        token: createToken(newUser.id),
        user: newUser
    };

    saveSession(session);
    return session;
}