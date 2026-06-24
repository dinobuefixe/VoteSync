/* ── VoteSync — decisionMaking.js ── */
// ── DOM REFS ──────────────────────────────────────────────────────────────────
const decisionTitle = document.querySelector("#decision-title");
const decisionDescription = document.querySelector("#decision-description");
const decisionDate = document.querySelector("#decision-date");
const decisionTimeLeft = document.querySelector("#decision-time-left");
const decisionOptionsContainer = document.querySelector("#decision-options-container");
const decisionTotalVotes = document.querySelector("#decision-total-votes");
const decisionTotalOptions = document.querySelector("#decision-total-options");
const decisionCreatedBy = document.querySelector("#decision-created-by");
const decisionTargetGroup = document.querySelector("#decision-target-group");
const decisionTargetFriends = document.querySelector("#decision-target-friends");
const logoutButton = document.querySelector("#decision-logout-btn");

// ── LOGO / LOGOUT ─────────────────────────────────────────────────────────────
function handleLogoClick(e) {
    e.preventDefault();
    const session = api.getSession();
    if (session && session.user) {
        window.location.href = session.user.is_admin ? "./admin.html" : "./dashboard.html";
    } else {
        window.location.href = "./index.html";
    }
}

function handleLogout() { api.logout(); }

// ── HELPERS ───────────────────────────────────────────────────────────────────
function getLatestDecision() {
    const raw = localStorage.getItem("votesync.decision.latest");
    if (!raw) return null;
    try { return JSON.parse(raw) || null; } catch { return null; }
}

function getTodayDate() {
    const now = new Date();
    return `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}`;
}

async function resolveGroupName(groupId) {
    if (!groupId) return "";
    try {
        const group = await api.getUserGroup(groupId);
        return group?.name || "";
    } catch (err) {
        console.warn("Não foi possível carregar nome do grupo:", err);
        return "";
    }
}

function formatIsoToDisplay(isoDate) {
    if (!isoDate || !isoDate.includes("-")) return "";
    const [year, month, day] = isoDate.split("-");
    if (!year || !month || !day) return "";
    return `${day}/${month}/${year}`;
}

function calculateDaysLeft(endDateIso) {
    if (!endDateIso) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = new Date(`${endDateIso}T00:00:00`);
    if (Number.isNaN(endDate.getTime())) return null;
    return Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

// ── GET VOTES COUNT FOR OPTION ────────────────────────────────────────────────
async function getVotesForOption(optionId, decisionId) {
    try {
        const allVotes = await api.getVotes();
        return allVotes.filter(v => v.option_id === optionId && v.decision_id === decisionId).length;
    } catch (err) {
        console.warn("Erro ao contar votos:", err);
        return 0;
    }
}

async function getVotersForOption(optionId, decisionId) {
    try {
        const allVotes = await api.getVotes();
        const optionVotes = allVotes.filter(v => v.option_id === optionId && v.decision_id === decisionId);

        // Buscar info dos utilizadores
        const voters = [];
        for (const vote of optionVotes) {
            const user = await api.getUser(vote.user_id);
            if (user?.name) voters.push(user.name);
        }

        return voters;
    } catch (err) {
        console.warn("Erro ao obter votantes:", err);
        return [];
    }
}

// ── CHECK IF USER ALREADY VOTED ───────────────────────────────────────────────
async function getUserVoteForDecision(userId, decisionId) {
    try {
        const allVotes = await api.getVotes();
        return allVotes.find(v => v.user_id === userId && v.decision_id === decisionId) || null;
    } catch (err) {
        console.warn("Erro ao verificar voto:", err);
        return null;
    }
}

// ── CHECK IF DECISION HAS A REAL TIE ─────────────────────────────────────────
// Só considera empate se houver pelo menos 1 voto E duas ou mais opções
// partilharem o número máximo de votos.
function checkForTie(options) {
    if (!options || options.length < 2) return false;

    const maxVotes = Math.max(...options.map(o => o.votes || 0));
    if (maxVotes === 0) return false; // sem votos não há empate real

    const optionsWithMaxVotes = options.filter(o => (o.votes || 0) === maxVotes);
    return optionsWithMaxVotes.length > 1;
}

async function countDecisionParticipants(decision) {
    try {
        const groupInfo = await api.getUserGroup(decision.group_id);
        const members = groupInfo?.members || [];
        const creator = decision.created_by ? [decision.created_by] : [];
        const uniqueParticipants = new Set([
            ...creator,
            ...members.map(m => m.user?.name || m.name)
        ]);
        console.log(`👥 Contagem de participantes: ${uniqueParticipants.size} (criador + membros do grupo)`);
        return uniqueParticipants.size;
    } catch (err) {
        console.warn("Erro ao contar participantes:", err);
        return 1;
    }
}

// ── CHECK IF ALL PARTICIPANTS HAVE VOTED ──────────────────────────────────────
async function checkIfAllVoted(decision) {
    try {
        const allVotes = await api.getVotes();
        const decisionVotes = allVotes.filter(v => v.decision_id === decision.id);
        const totalParticipants = await countDecisionParticipants(decision);

        console.log(`📊 Votos: ${decisionVotes.length} / Participantes: ${totalParticipants}`);
        console.log("todos votaram");
        return decisionVotes.length >= totalParticipants;
    } catch (err) {
        console.warn("Erro ao contar votos:", err);
        return false;
    }
}

// ── TIEBREAKER PERSISTENCE (localStorage) ─────────────────────────────────────
function getTiebreakerKey(decisionId) {
    return `votesync.tiebreaker.${decisionId}`;
}

function getStoredTiebreaker(decisionId) {
    if (!decisionId) return null;
    try {
        const raw = localStorage.getItem(getTiebreakerKey(decisionId));
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function storeTiebreaker(decisionId, data) {
    if (!decisionId) return;
    localStorage.setItem(getTiebreakerKey(decisionId), JSON.stringify(data));
}

function clearTiebreaker(decisionId) {
    if (!decisionId) return;
    localStorage.removeItem(getTiebreakerKey(decisionId));
}

// ── TIEBREAKER WIDGET ──────────────────────────────────────────────────────────
// Só é mostrado ao criador da decisão.
// Regras de visibilidade:
//   • Resultado já guardado  → mostra "Vencedor do desempate" (estado resolvido)
//   • Empate real + todos votaram → mostra botão "Lançar o dado"
//   • Qualquer outro caso    → não mostra nada
async function renderTiebreakerWidget(decision) {
    const session = api.getSession();

    // ── Apenas o criador vê este widget ──────────────────────────────────────
    const currentUserName = session?.user?.name || "";
    const isCreator = currentUserName && currentUserName === decision.created_by;
    if (!isCreator) return null;

    const stored = getStoredTiebreaker(decision.id);

    // ── Estado resolvido: mostrar vencedor ────────────────────────────────────
    if (stored) {
        // Validar que o vencedor ainda existe nas opções actuais
        const winnerStillExists = Array.isArray(decision.options)
            && decision.options.some(o => o.id === stored.winnerId);

        if (!winnerStillExists) {
            // Opção vencedora foi removida — limpar resultado guardado
            clearTiebreaker(decision.id);
            return null;
        }

        return buildResolvedWidget(stored.winnerText);
    }

    // ── Avaliar se existe empate real e todos votaram ─────────────────────────
    const hasTie = checkForTie(decision.options || []);
    if (!hasTie) return null;

    const allVoted = await checkIfAllVoted(decision);
    if (!allVoted) return null;

    return buildPendingWidget(decision);
}

// ── Cria o widget no estado "resolvido" ───────────────────────────────────────
function buildResolvedWidget(winnerText) {
    const widget = document.createElement("div");
    widget.className = "tiebreaker-inline resolved";

    const badge = document.createElement("div");
    badge.className = "tiebreaker-inline-icon";
    badge.innerHTML = '<i class="fa-solid fa-trophy"></i>';

    const body = document.createElement("div");
    body.className = "tiebreaker-inline-body";

    const label = document.createElement("span");
    label.className = "tiebreaker-inline-label";
    label.textContent = "Vencedor do desempate";

    const winnerName = document.createElement("strong");
    winnerName.className = "tiebreaker-inline-winner";
    winnerName.textContent = winnerText;
    winnerName.title = winnerText;

    body.appendChild(label);
    body.appendChild(winnerName);
    widget.appendChild(badge);
    widget.appendChild(body);
    return widget;
}

// ── Cria o widget no estado "pendente" (botão lançar dado) ────────────────────
function buildPendingWidget(decision) {
    const widget = document.createElement("div");
    widget.className = "tiebreaker-inline";

    const badge = document.createElement("div");
    badge.className = "tiebreaker-inline-icon";
    badge.innerHTML = '<i class="fa-solid fa-scale-balanced"></i>';

    const body = document.createElement("div");
    body.className = "tiebreaker-inline-body";

    const label = document.createElement("span");
    label.className = "tiebreaker-inline-label";
    label.textContent = "Há um empate";

    const rollBtn = document.createElement("button");
    rollBtn.type = "button";
    rollBtn.className = "tiebreaker-roll-btn";
    rollBtn.innerHTML = '<i class="fa-solid fa-dice"></i><span>Lançar o dado</span>';
    rollBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        await handleTiebreakerRoll(decision, rollBtn, widget);
    });

    body.appendChild(label);
    body.appendChild(rollBtn);
    widget.appendChild(badge);
    widget.appendChild(body);
    return widget;
}

// ── HANDLE TIEBREAKER ROLL ─────────────────────────────────────────────────────
async function handleTiebreakerRoll(decision, button, widget) {
    const maxVotes = Math.max(...decision.options.map(opt => opt.votes || 0));
    const winningOptions = decision.options.filter(o => (o.votes || 0) === maxVotes);

    if (winningOptions.length < 2) {
        console.warn("Não há empate para resolver");
        return;
    }

    console.log(`🎲 Rodando dado... Opções em empate: ${winningOptions.map(o => o.option_text).join(", ")}`);

    button.disabled = true;
    widget.classList.add("rolling");

    const badgeIcon = widget.querySelector(".tiebreaker-inline-icon i");
    const label = button.querySelector("span");
    if (label) label.textContent = "A lançar...";

    // Animação do dado
    const faces = ["fa-dice-one", "fa-dice-two", "fa-dice-three", "fa-dice-four", "fa-dice-five", "fa-dice-six"];
    const rollInterval = setInterval(() => {
        if (badgeIcon) {
            badgeIcon.className = `fa-solid ${faces[Math.floor(Math.random() * faces.length)]}`;
        }
    }, 100);

    await new Promise(resolve => setTimeout(resolve, 2000));
    clearInterval(rollInterval);

    const selectedOption = winningOptions[Math.floor(Math.random() * winningOptions.length)];
    console.log(`✨ Empate resolvido! Vencedor: ${selectedOption.option_text}`);

    storeTiebreaker(decision.id, {
        winnerId: selectedOption.id,
        winnerText: selectedOption.option_text,
        tiedOptionIds: winningOptions.map(o => o.id),
        tiedOptionTexts: winningOptions.map(o => o.option_text),
        resolvedAt: new Date().toISOString(),
        resolvedBy: api.getSession()?.user?.name || ""
    });

    showTiebreakerResult(selectedOption, winningOptions);
    renderDecisionTemplate();
}

// ── SHOW TIEBREAKER RESULT MODAL ──────────────────────────────────────────────
function showTiebreakerResult(winner, tiedOptions) {
    const modal = document.createElement("div");
    modal.className = "tiebreaker-modal";

    const content = document.createElement("div");
    content.className = "tiebreaker-modal-content";

    const trophyIcon = document.createElement("div");
    trophyIcon.className = "tiebreaker-modal-trophy";
    trophyIcon.innerHTML = '<i class="fa-solid fa-trophy"></i>';

    const title = document.createElement("h2");
    title.textContent = "Empate Resolvido!";

    const message = document.createElement("p");
    const winnerStrong = document.createElement("strong");
    winnerStrong.textContent = winner.option_text;
    message.appendChild(winnerStrong);
    message.appendChild(document.createTextNode(" foi seleccionada aleatoriamente!"));

    const tiedList = document.createElement("div");
    tiedList.className = "tiebreaker-modal-tied";
    const tiedSmall = document.createElement("small");
    tiedSmall.textContent = `Estavam em empate: ${tiedOptions.map(o => o.option_text).join(", ")}`;
    tiedList.appendChild(tiedSmall);

    const closeBtn = document.createElement("button");
    closeBtn.className = "tiebreaker-modal-close";
    closeBtn.textContent = "Fechar";
    closeBtn.addEventListener("click", () => modal.remove());

    content.appendChild(trophyIcon);
    content.appendChild(title);
    content.appendChild(message);
    content.appendChild(tiedList);
    content.appendChild(closeBtn);
    modal.appendChild(content);
    document.body.appendChild(modal);

    setTimeout(() => { if (modal.parentNode) modal.remove(); }, 6000);
}

// ── RENDER OPTION CARD ────────────────────────────────────────────────────────
async function renderOptionCard(option, index, userHasVoted = false, userVotedOptionId = null, tiebreakerWinnerId = null) {
    const card = document.createElement("article");
    card.className = "option-card";

    const isTiebreakerWinner = !!tiebreakerWinnerId && option.id === tiebreakerWinnerId;

    if (isTiebreakerWinner) {
        card.classList.add("option-card-winner");
        const badge = document.createElement("span");
        badge.className = "winner-badge";
        badge.innerHTML = '<i class="fa-solid fa-trophy"></i><span>Vencedor</span>';
        card.appendChild(badge);
    } else if (index === 0) {
        // Destaque apenas ao primeiro card quando não há vencedor de desempate
        card.style.boxShadow = "0 14px 20px -20px rgba(15,20,40,0.85), inset 0 0 0 2px rgba(93,122,255,0.45)";
    }

    const name = document.createElement("p");
    name.className = "option-name";
    name.textContent = option.option_text || option.name || "";

    const votesWrap = document.createElement("div");
    votesWrap.className = "option-votes";

    const baseVotes = option.votes || 0;
    // +1 visual pelo voto do dado apenas se esta opção ganhou o desempate
    const displayVotes = isTiebreakerWinner ? baseVotes + 1 : baseVotes;
    // Garante pelo menos 1 chip visível e limita a 6 (faces do dado)
    const chipCount = Math.max(1, Math.min(6, displayVotes));

    for (let i = 0; i < chipCount; i++) {
        const chip = document.createElement("button");
        chip.className = "vote-chip";
        chip.type = "button";
        chip.setAttribute("data-option-id", option.id);

        // O último chip da opção vencedora representa o voto do dado
        const isDiceChip = isTiebreakerWinner && i === chipCount - 1;

        if (isDiceChip) {
            chip.innerHTML = '<i class="fa-solid fa-dice"></i>';
            chip.classList.add("dice-vote-chip");
            chip.disabled = true;
            chip.title = "Voto de desempate (dado)";
            votesWrap.appendChild(chip);
            continue;
        }

        chip.innerHTML = '<i class="fa-regular fa-thumbs-up"></i>';

        if (userHasVoted) {
            chip.disabled = true;
            chip.classList.add("disabled-vote");
            chip.title = "Já votou nesta decisão";

            if (userVotedOptionId === option.id) {
                chip.classList.add("user-voted");
                chip.innerHTML = '<i class="fa-solid fa-thumbs-up"></i>';
                chip.title = "Você votou aqui";
            }
        } else {
            chip.addEventListener("click", async (e) => {
                e.preventDefault();
                chip.disabled = true;
                chip.classList.add("voting");
                await handleVote(option.id, chip);
            });
        }

        votesWrap.appendChild(chip);
    }

    card.appendChild(name);
    card.appendChild(votesWrap);
    
    const voters = await getVotersForOption(option.id, getLatestDecision()?.id);

    if (voters.length > 0) {
        const votersBox = document.createElement("div");
        votersBox.className = "option-voters-box";

        const votersLabel = document.createElement("small");
        votersLabel.textContent = "Votaram:";

        const votersList = document.createElement("small");
        votersList.className = "option-voters-list";
        votersList.textContent = voters.join(", ");

        votersBox.appendChild(votersLabel);
        votersBox.appendChild(votersList);
        card.appendChild(votersBox);
    }

    return card;
}

// ── HANDLE VOTE ───────────────────────────────────────────────────────────────
async function handleVote(optionId, buttonElement) {
    const session = api.getSession();
    const decision = getLatestDecision();

    if (!session?.user?.id) {
        console.warn("❌ Utilizador não autenticado");
        alert("Debes estar autenticado para votar.");
        if (buttonElement) buttonElement.disabled = false;
        return;
    }

    if (!decision?.id) {
        console.warn("❌ Decisão não encontrada");
        alert("Decisão não encontrada.");
        if (buttonElement) buttonElement.disabled = false;
        return;
    }

    if (!optionId) {
        console.warn("❌ Opção não encontrada");
        alert("Opção inválida.");
        if (buttonElement) buttonElement.disabled = false;
        return;
    }

    try {
        const existingVote = await getUserVoteForDecision(session.user.id, decision.id);
        if (existingVote) {
            console.warn("⚠️ Utilizador já votou nesta decisão");
            alert("Já votou nesta decisão! Cada utilizador pode votar apenas uma vez.");
            if (buttonElement) buttonElement.disabled = false;
            return;
        }

        console.log(`🗳️ Votando: user=${session.user.id}, decision=${decision.id}, option=${optionId}`);

        const result = await api.createVote(session.user.id, decision.id, optionId);
        console.log("✅ Voto registado com sucesso:", result);

        if (result) {
            if (buttonElement) {
                buttonElement.classList.add("voted");
                buttonElement.innerHTML = '<i class="fa-solid fa-thumbs-up"></i>';
            }

            // Um novo voto invalida qualquer resultado de desempate anterior
            clearTiebreaker(decision.id);

            const updated = await api.getDecision(decision.id);
            if (updated) {
                updated.group_name = decision.group_name;
                localStorage.setItem("votesync.decision.latest", JSON.stringify(updated));
                renderDecisionTemplate();
                console.log("✅ UI actualizada!");
            }
        }
    } catch (err) {
        console.error("❌ Erro ao votar:", err);
        alert("Não foi possível registar o seu voto. Tente novamente.");
        if (buttonElement) buttonElement.disabled = false;
    }
}

// ── RENDER TARGETS // groups ────────────────────────────────────────────────────────────
async function renderDecisionTargets(decision) {

    decisionTargetGroup.textContent = "Sem grupo associado";

    try{
        const group = await api.getGroup(decision?.group_id);
    
        decisionTargetGroup.textContent = group.name;

    }catch(err){
        console.log("ocorreu um erro")
        decisionTargetGroup.textContent = "Sem grupo";
    }

    
    const creatorName = decision?.created_by || decision?.createdBy || "";
    
}

// ── RENDER TEMPLATE ───────────────────────────────────────────────────────────
async function renderDecisionTemplate() {
    const decision = getLatestDecision();

    if (!decision) {
        if (decisionTitle) decisionTitle.textContent = "Sem decisões criadas";
        if (decisionDescription) decisionDescription.textContent = "Cria uma decisão no dashboard para ela aparecer aqui.";
        if (decisionDate) decisionDate.textContent = "--/--/----";
        if (decisionTimeLeft) decisionTimeLeft.textContent = "Sem prazo";
        if (decisionOptionsContainer) decisionOptionsContainer.innerHTML = "";
        if (decisionTotalVotes) decisionTotalVotes.textContent = "0";
        if (decisionTotalOptions) decisionTotalOptions.textContent = "0";
        if (decisionCreatedBy) decisionCreatedBy.textContent = "-";
        renderDecisionTargets(null);
        return;
    }

    if (decision.id) {
        try {
            const fresh = await api.getDecision(decision.id);
            if (fresh) {
                fresh.group_name = decision.group_name || "";
                if (!fresh.group_name) {
                    fresh.group_name = await resolveGroupName(fresh.group_id);
                }
                localStorage.setItem("votesync.decision.latest", JSON.stringify(fresh));
                return renderWithData(fresh);
            }
        } catch (err) {
            console.warn("Não foi possível buscar decisão da API, usando cache:", err);
        }
    }

    renderWithData(decision);
}

// ── RENDER WITH DATA ──────────────────────────────────────────────────────────
async function renderWithData(decision) {
    const options = Array.isArray(decision.options) ? decision.options : [];
    const session = api.getSession();
    const userId = session?.user?.id;

    if (decisionTitle) decisionTitle.textContent = decision.title || "Decisão sem título";
    if (decisionDescription) decisionDescription.textContent = decision.description || "Sem descrição disponível.";

    // ── Tiebreaker widget ─────────────────────────────────────────────────────
    // Remove widget anterior antes de (possivelmente) inserir um novo
    document.querySelector(".tiebreaker-inline")?.remove();

    const tiebreakerWidget = await renderTiebreakerWidget(decision);
    if (tiebreakerWidget) {
        const topbar = document.querySelector(".decision-topbar");
        const metaPills = document.querySelector(".meta-pills");
        if (topbar) {
            topbar.insertBefore(tiebreakerWidget, metaPills ?? null);
        } else {
            decisionDescription?.insertAdjacentElement("afterend", tiebreakerWidget);
        }
    }

    // ── Data e tempo restante ─────────────────────────────────────────────────
    if (decisionDate) {
        const endDateLabel = formatIsoToDisplay(decision.end_date || decision.endDate);
        decisionDate.textContent = endDateLabel || decision.date || getTodayDate();
    }

    if (decisionTimeLeft) {
        const daysLeft = calculateDaysLeft(decision.end_date || decision.endDate);
        if (daysLeft === null) decisionTimeLeft.textContent = "Sem prazo";
        else if (daysLeft < 0) decisionTimeLeft.textContent = "Encerrada";
        else if (daysLeft === 0) decisionTimeLeft.textContent = "Termina hoje";
        else if (daysLeft === 1) decisionTimeLeft.textContent = "1 dia restante";
        else decisionTimeLeft.textContent = `${daysLeft} dias restantes`;
    }

    // ── Resultado de desempate guardado ───────────────────────────────────────
    const storedTiebreaker = getStoredTiebreaker(decision.id);
    const tiebreakerWinnerId = storedTiebreaker?.winnerId ?? null;
    const winnerStillExists = tiebreakerWinnerId
        ? options.some(o => o.id === tiebreakerWinnerId)
        : false;

    // ── Opções ────────────────────────────────────────────────────────────────
    if (decisionOptionsContainer) {
        decisionOptionsContainer.innerHTML = "";

        const userVote = userId ? await getUserVoteForDecision(userId, decision.id) : null;
        const userHasVoted = !!userVote;
        const userVotedOptionId = userVote?.option_id || null;

        console.log(`👤 Utilizador ${userId}: ${userHasVoted ? "JÁ VOTOU" : "Ainda não votou"}`);

        for (let i = 0; i < options.length; i++) {
            const option = options[i];
            option.votes = await getVotesForOption(option.id, decision.id);
            console.log(option.votes)
            console.log(`👍 Opção "${option.option_text}": ${option.votes} votos`);
            decisionOptionsContainer.appendChild(
                await renderOptionCard(
                    option,
                    i,
                    userHasVoted,
                    userVotedOptionId,
                    winnerStillExists ? tiebreakerWinnerId : null
                )
            );
        }
    }

    // ── Totais ────────────────────────────────────────────────────────────────
    const baseTotalVotes = options.reduce((sum, o) => sum + (o.votes || 0), 0);
    const totalVotes = baseTotalVotes + (winnerStillExists ? 1 : 0);

    if (decisionTotalVotes) {
        decisionTotalVotes.textContent = String(totalVotes);
        console.log(`📊 Total de votos: ${totalVotes}`);
    }
    if (decisionTotalOptions) decisionTotalOptions.textContent = String(options.length);
    if (decisionCreatedBy) decisionCreatedBy.textContent = decision.created_by || decision.createdBy || "Utilizador";

    renderDecisionTargets(decision);
}

// ── INIT ──────────────────────────────────────────────────────────────────────
api.ensureAuthenticated();
renderDecisionTemplate();

if (logoutButton) logoutButton.addEventListener("click", handleLogout);