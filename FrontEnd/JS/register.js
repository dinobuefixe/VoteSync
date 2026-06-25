/* ── VoteSync — register.js ── */

// ── DOM REFS ──────────────────────────────────────────────────────────────────
const registerForm = document.querySelector("#register-form");
const authStatus   = document.querySelector("#auth-status");

// ── UI HELPERS ────────────────────────────────────────────────────────────────
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

// ── PRE-FILL NOME DO INDEX ────────────────────────────────────────────────────
(function prefillName() {
    const params    = new URLSearchParams(window.location.search);
    const name      = params.get("name");
    const nameInput = document.querySelector("#register-name");
    if (name && nameInput) nameInput.value = name;
})();

// ── VALIDAÇÃO ─────────────────────────────────────────────────────────────────
function validateRegister() {
    clearFieldErrors();
    const name    = document.querySelector("#register-name").value.trim();
    const email   = document.querySelector("#register-email").value.trim();
    const pass    = document.querySelector("#register-password").value;
    const confirm = document.querySelector("#register-confirm-password").value;
    const terms   = document.querySelector("#terms").checked;
    const re      = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let valid = true;

    if (!name)            { setFieldError("register-name",             "Full name is required.");                    valid = false; }
    if (!re.test(email))  { setFieldError("register-email",            "Enter a valid email.");                      valid = false; }
    if (pass.length < 8)  { setFieldError("register-password",         "Password must have at least 8 characters."); valid = false; }
    if (confirm !== pass) { setFieldError("register-confirm-password", "Passwords do not match.");                   valid = false; }
    if (!terms)           { setFieldError("terms",                     "You need to accept the terms.");             valid = false; }

    return { valid, name, email, password: pass };
}

// ── REGISTO ───────────────────────────────────────────────────────────────────
registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearFieldErrors();

    const result = validateRegister();
    if (!result.valid) return;

    setSubmitLoading(true);
    try {
        // 1. Criar utilizador
        await api.createUser(result.name, result.email, result.password);

        // 2. Login automático para obter sessão com ID real da BD
        const session = await api.login(result.email, result.password);

        registerForm.reset();
        setStatus("Account created successfully! Redirecting…", "is-success");
        setTimeout(() => {
            window.location.href = session.user.is_admin === true
                ? "/static/HTML/admin.html"
                : "/static/HTML/dashboard.html";
        }, 1500);
    } catch (err) {
        const message = err.message || "Não foi possível criar a conta. Tente novamente.";
        if (message.toLowerCase().includes("email")) {
            setFieldError("register-email", "Este email já está registado.");
        } else {
            setFieldError("register-email", message);
        }
    } finally {
        setSubmitLoading(false);
    }
});