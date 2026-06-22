/* ── VoteSync — index.js ── */

// ── LOGO / LOGIN ──────────────────────────────────────────────────────────────
function handleLoginClick(e) {
    e.preventDefault();
    const session = api.getSession();
    if (session && session.user) {
        window.location.href = session.user.is_admin ? "/static/HTML/admin.html" : "/static/HTML/dashboard.html";
    } else {
        window.location.href = "/static/HTML/login.html";
    }
}

function handleLogoClick(e) {
    e.preventDefault();
    const session = api.getSession();
    if (session && session.user) {
        window.location.href = session.user.is_admin ? "/static/HTML/admin.html" : "/static/HTML/dashboard.html";
    } else {
        window.location.href = "/static/HTML/index.html";
    }
}

// ── REDIRECIONAR SE JÁ AUTENTICADO ───────────────────────────────────────────
const session = api.getSession();
if (session && session.user) {
    window.location.href = "/static/HTML/dashboard.html";
}

// ── HERO FORM ─────────────────────────────────────────────────────────────────
const heroBtn       = document.querySelector(".hero-form button");
const heroForm      = document.querySelector(".hero-form");
const heroNameInput = document.querySelector("#hero-name");

function goToRegister() {
    const name = heroNameInput ? heroNameInput.value.trim() : "";
    const url = name
        ? `/static/HTML/register.html?name=${encodeURIComponent(name)}`
        : "/static/HTML/register.html";
    window.location.href = url;
}

if (heroBtn)  heroBtn.addEventListener("click", goToRegister);
if (heroForm) heroForm.addEventListener("submit", (e) => { e.preventDefault(); goToRegister(); });