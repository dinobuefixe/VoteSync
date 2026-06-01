const heroForm = document.querySelector("#hero-form");
const userNameInput = document.querySelector("#username");

if (heroForm && userNameInput) {
	heroForm.addEventListener("submit", (event) => {
		event.preventDefault();

		const userName = userNameInput.value.trim();
		if (!userName) {
			userNameInput.focus();
			return;
		}

		alert(`Welcome, ${userName}! Let's build your squad.`);
		heroForm.reset();
	});
}
