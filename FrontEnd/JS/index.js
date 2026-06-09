const SESSION_KEY = "votesync.session";

function getSession() {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
}

// Se já há sessão activa, redireciona para o dashboard
const session = getSession();
if (session && session.user) {
    window.location.href = "./dashboard.html";
}

// Botão "Let's Go!" — passa o nome para o register
const heroBtn  = document.querySelector(".hero-form button");
const heroForm = document.querySelector(".hero-form");
const heroNameInput = document.querySelector("#hero-name");

function goToRegister() {
    const name = heroNameInput ? heroNameInput.value.trim() : "";
    const url = name
        ? `register.html?name=${encodeURIComponent(name)}`
        : "register.html";
    window.location.href = url;
}

if (heroBtn) heroBtn.addEventListener("click", goToRegister);
if (heroForm) heroForm.addEventListener("submit", (e) => { e.preventDefault(); goToRegister(); });