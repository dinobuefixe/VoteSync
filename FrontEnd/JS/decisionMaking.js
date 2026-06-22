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
        const allVotes = await api.getVotes(); // Busca todos os votos
        const relevantVotes = allVotes.filter(v => 
            v.option_id === optionId && v.decision_id === decisionId
        );
        return relevantVotes.length;
    } catch (err) {
        console.warn("Erro ao contar votos:", err);
        return 0;
    }
}

// ── CHECK IF USER ALREADY VOTED ───────────────────────────────────────────────
async function getUserVoteForDecision(userId, decisionId) {
    try {
        const allVotes = await api.getVotes();
        const userVote = allVotes.find(v => 
            v.user_id === userId && v.decision_id === decisionId
        );
        return userVote || null; // Retorna o voto se existir
    } catch (err) {
        console.warn("Erro ao verificar voto:", err);
        return null;
    }
}

// ── CHECK IF DECISION HAS A TIE ────────────────────────────────────────────────
function checkForTie(options) {
    if (!options || options.length < 2) return false;
    
    const maxVotes = Math.max(...options.map(o => o.votes || 0));
    const optionsWithMaxVotes = options.filter(o => (o.votes || 0) === maxVotes);
    
    return optionsWithMaxVotes.length > 1; // Empate se 2+ opções com votos máximos
}

// ── COUNT DECISION PARTICIPANTS ────────────────────────────────────────────────
function countDecisionParticipants(decision) {
    // 1 criador + amigos
    const friendCount = Array.isArray(decision.target_friends) ? decision.target_friends.length : 0;
    return 1 + friendCount; // Criador + amigos
}

// ── CHECK IF ALL VOTED ─────────────────────────────────────────────────────────
async function checkIfAllVoted(decision) {
    try {
        const allVotes = await api.getVotes();
        const decisionVotes = allVotes.filter(v => v.decision_id === decision.id);
        const totalParticipants = countDecisionParticipants(decision);
        
        console.log(`📊 Votos: ${decisionVotes.length} / Participantes: ${totalParticipants}`);
        return decisionVotes.length >= totalParticipants;
    } catch (err) {
        console.warn("Erro ao contar votos:", err);
        return false;
    }
}

// ── TIEBREAKER PERSISTENCE (localStorage) ─────────────────────────────────────
// Guarda o resultado do dado para que sobreviva a refresh da página e seja
// visível por todos os participantes que acedam à decisão neste dispositivo.
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
// Cartão compacto, colocado no meio da barra superior (entre o título e a
// data), em vez de um banner largo ou de um ícone minúsculo no título.
async function renderTiebreakerWidget(decision) {
    const session = api.getSession();
    const isCreator = session?.user?.name === decision.created_by;
    if (!isCreator) return null; // Só o criador pode lançar o dado

    const stored = getStoredTiebreaker(decision.id);
    const hasTie = checkForTie(decision.options);
    const allVoted = await checkIfAllVoted(decision);

    // Se já houver um resultado guardado, mostra-o sempre (mesmo que os dados
    // de "empate"/"todos votaram" mudem depois de resolvido).
    if (!stored && (!hasTie || !allVoted)) return null;

    const widget = document.createElement("div");
    widget.className = "tiebreaker-inline";

    const badge = document.createElement("div");
    badge.className = "tiebreaker-inline-icon";

    const body = document.createElement("div");
    body.className = "tiebreaker-inline-body";

    const label = document.createElement("span");
    label.className = "tiebreaker-inline-label";
    body.appendChild(label);

    if (stored) {
        widget.classList.add("resolved");
        badge.innerHTML = '<i class="fa-solid fa-trophy"></i>';
        label.textContent = "Vencedor do desempate";

        const winnerName = document.createElement("strong");
        winnerName.className = "tiebreaker-inline-winner";
        winnerName.textContent = stored.winnerText;
        winnerName.title = stored.winnerText;
        body.appendChild(winnerName);

        widget.appendChild(badge);
        widget.appendChild(body);
        return widget;
    }

    badge.innerHTML = '<i class="fa-solid fa-scale-balanced"></i>';
    label.textContent = "Há um empate";

    const rollBtn = document.createElement("button");
    rollBtn.type = "button";
    rollBtn.className = "tiebreaker-roll-btn";
    rollBtn.innerHTML = '<i class="fa-solid fa-dice"></i><span>Lançar o dado</span>';
    rollBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        await handleTiebreakerRoll(decision, rollBtn, widget);
    });
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

    const faces = ["fa-dice-one", "fa-dice-two", "fa-dice-three", "fa-dice-four", "fa-dice-five", "fa-dice-six"];
    const rollInterval = setInterval(() => {
        if (!badgeIcon) return;
        const face = faces[Math.floor(Math.random() * faces.length)];
        badgeIcon.className = `fa-solid ${face}`;
    }, 100);

    const rollDuration = 2000;
    await new Promise((resolve) => setTimeout(resolve, rollDuration));
    clearInterval(rollInterval);

    const selectedIdx = Math.floor(Math.random() * winningOptions.length);
    const selectedOption = winningOptions[selectedIdx];

    console.log(`✨ Empate resolvido! Vencedor: ${selectedOption.option_text}`);

    // ✅ Guardar resultado de forma persistente
    storeTiebreaker(decision.id, {
        winnerId: selectedOption.id,
        winnerText: selectedOption.option_text,
        tiedOptionIds: winningOptions.map(o => o.id),
        tiedOptionTexts: winningOptions.map(o => o.option_text),
        resolvedAt: new Date().toISOString(),
        resolvedBy: api.getSession()?.user?.name || ""
    });

    // ✅ Mostrar modal com o resultado
    showTiebreakerResult(selectedOption, winningOptions);

    // ✅ Re-renderizar tudo (widget passa a estado "resolvido", card vencedor
    // fica destacado e o total de votos passa a contar o voto do dado)
    renderDecisionTemplate();
}

// ── SHOW TIEBREAKER RESULT ─────────────────────────────────────────────────────
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

    // Auto-fechar após 6 segundos
    setTimeout(() => {
        if (modal.parentNode) modal.remove();
    }, 6000);
}

// ── RENDER OPTIONS ────────────────────────────────────────────────────────────
async function renderOptionCard(option, index, userHasVoted = false, userVotedOptionId = null, tiebreakerWinnerId = null) {
    const card = document.createElement("article");
    card.className = "option-card";
    if (index === 0) {
        card.style.boxShadow = "0 14px 20px -20px rgba(15,20,40,0.85), inset 0 0 0 2px rgba(93,122,255,0.45)";
    }

    const isTiebreakerWinner = !!tiebreakerWinnerId && option.id === tiebreakerWinnerId;
    if (isTiebreakerWinner) {
        card.classList.add("option-card-winner");
        // Quando há vencedor de desempate, a sombra de destaque do índice 0 deixa de fazer sentido
        card.style.boxShadow = "";

        const badge = document.createElement("span");
        badge.className = "winner-badge";
        badge.innerHTML = '<i class="fa-solid fa-trophy"></i><span>Vencedor</span>';
        card.appendChild(badge);
    }

    const name = document.createElement("p");
    name.className = "option-name";
    name.textContent = option.option_text || option.name || "";

    const votesWrap = document.createElement("div");
    votesWrap.className = "option-votes";

    // ✅ USAR option.votes, e somar +1 visualmente se esta opção venceu o desempate
    const baseVotes = option.votes || 0;
    const displayVotes = isTiebreakerWinner ? baseVotes + 1 : baseVotes;
    const votesCount = Math.max(1, Math.min(6, displayVotes));

    for (let i = 0; i < votesCount; i++) {
        const chip = document.createElement("button");
        chip.className = "vote-chip";
        chip.type = "button";
        chip.setAttribute("data-option-id", option.id);

        // ✅ Último chip da opção vencedora representa o voto do dado
        const isDiceChip = isTiebreakerWinner && i === votesCount - 1;

        if (isDiceChip) {
            chip.innerHTML = '<i class="fa-solid fa-dice"></i>';
            chip.classList.add("dice-vote-chip");
            chip.disabled = true;
            chip.title = "Voto de desempate (dado)";
            votesWrap.appendChild(chip);
            continue;
        }

        chip.innerHTML = '<i class="fa-regular fa-thumbs-up"></i>';

        // ✅ SE UTILIZADOR JÁ VOTOU
        if (userHasVoted) {
            chip.disabled = true;
            chip.classList.add("disabled-vote");
            chip.title = "Já votou nesta decisão";

            // ✅ DESTACAR A OPÇÃO QUE O UTILIZADOR VOTOU
            if (userVotedOptionId === option.id) {
                chip.classList.add("user-voted");
                chip.innerHTML = '<i class="fa-solid fa-thumbs-up"></i>';
                chip.title = "Você votou aqui";
            }
        } else {
            // ✅ PERMITIR VOTAR
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
    return card;
}

<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
=======
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
        // ✅ VERIFICAR SE UTILIZADOR JÁ VOTOU
        const existingVote = await getUserVoteForDecision(session.user.id, decision.id);
        if (existingVote) {
            console.warn("⚠️ Utilizador já votou nesta decisão");
            alert("Já votou nesta decisão! Cada utilizador pode votar apenas uma vez.");
            if (buttonElement) buttonElement.disabled = false;
            return;
        }

        console.log(`🗳️ Votando: user=${session.user.id}, decision=${decision.id}, option=${optionId}`);
        
        const result = await api.createVote(
            session.user.id,
            decision.id,
            optionId
        );
        
        console.log("✅ Voto registado com sucesso:", result);

        if (result) {
            if (buttonElement) {
                buttonElement.classList.add("voted");
                buttonElement.innerHTML = '<i class="fa-solid fa-thumbs-up"></i>';
            }

            // ✅ Uma nova votação muda a distribuição de votos: invalida um
            // eventual resultado de desempate anterior para esta decisão.
            clearTiebreaker(decision.id);

            // ✅ BUSCAR DADOS NOVOS
            console.log("🔄 Buscando decisão actualizada...");
            const updated = await api.getDecision(decision.id);
            
            if (updated) {
                updated.target_group_name = decision.target_group_name;
                localStorage.setItem("votesync.decision.latest", JSON.stringify(updated));
                
                // ✅ Re-renderizar tudo
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

<<<<<<< HEAD
>>>>>>> 5ff1690 (feat:DecisionMaking)
// ── RENDER TARGETS ────────────────────────────────────────────────────────────
function renderDecisionTargets(decision) {
=======
function normalizeEntityName(entity, fallbackLabel) {
    if (typeof entity === "string") return entity;
    if (!entity || typeof entity !== "object") return fallbackLabel;
    return entity.name || entity.title || entity.label || fallbackLabel;
}

=======
<<<<<<< HEAD
// ── RENDER TARGETS ────────────────────────────────────────────────────────────
function renderDecisionTargets(decision) {
=======
>>>>>>> 1d52963 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
// ── FETCH AMIGOS DA API ───────────────────────────────────────────────────────
async function fetchFriendshipsByIds(friendshipIds) {
    if (!Array.isArray(friendshipIds) || friendshipIds.length === 0) {
        return [];
    }

    try {
        // Buscar todos os friendships e filtrar pelos IDs
        const allFriendships = await apiFetch("/friendships/");
        
        if (!Array.isArray(allFriendships)) {
            return [];
        }

        // Filtrar pelos IDs solicitados
        return allFriendships.filter(f => friendshipIds.includes(f.id));
    } catch (error) {
        console.error("Erro ao buscar amigos:", error);
        return [];
    }
}

// ── RENDERIZAR TARGETS COM DADOS DOS AMIGOS ───────────────────────────────────
function renderDecisionTargets(decision, friendshipsData = []) {
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
// ── RENDER TARGETS ────────────────────────────────────────────────────────────
function renderDecisionTargets(decision) {
>>>>>>> 9224db4 (Fix auth and friendships backend issues; update frontend deployment docs)
=======
>>>>>>> fc68462 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
>>>>>>> 1d52963 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
    if (decisionTargetGroup) {
        const groupName = decision?.target_group_name || "";
        decisionTargetGroup.textContent = groupName || "Sem grupo associado";
    }

    if (!decisionTargetFriends) return;
    decisionTargetFriends.innerHTML = "";

<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 1d52963 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
    const targetFriends = Array.isArray(decision?.target_friends) ? decision.target_friends : [];
<<<<<<< HEAD
=======
=======
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
    // Usar dados da API para extrair nomes dos amigos
    const targetFriends = friendshipsData
        .map(f => normalizeEntityName(f, ""))
        .filter(n => n && n.length > 0);
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
    const targetFriends = Array.isArray(decision?.target_friends) ? decision.target_friends : [];
>>>>>>> 9224db4 (Fix auth and friendships backend issues; update frontend deployment docs)
=======
    const creatorName = decision?.created_by || decision?.createdBy || "";
    const friendNames = [];
<<<<<<< HEAD
>>>>>>> e098cb0 (Fix group creation, decision target rendering, backend schema, and README documentation)
=======
=======
    // Usar dados da API para extrair nomes dos amigos
    const targetFriends = friendshipsData
        .map(f => normalizeEntityName(f, ""))
        .filter(n => n && n.length > 0);
>>>>>>> fc68462 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
>>>>>>> 1d52963 (feat:Decision-making feature and decisions listing page (frontend + backend + database))

    if (creatorName) {
        friendNames.push(creatorName);
    }

    targetFriends.forEach(df => {
        const friendship = df?.friendship;
        const userName = friendship?.user?.name || "";
        const friendName = friendship?.friend?.name || "";
        const isCreatorFriend = creatorName && friendName === creatorName;
        const participantName = isCreatorFriend ? userName : friendName || userName;
        if (participantName && !friendNames.includes(participantName)) {
            friendNames.push(participantName);
        }
    });

    if (friendNames.length === 0) {
        const empty = document.createElement("span");
        empty.className = "friend-empty";
        empty.textContent = "Sem amigos associados";
        decisionTargetFriends.appendChild(empty);
        return;
    }

    friendNames.forEach((name) => {
        const chip = document.createElement("span");
        chip.className = "friend-chip";
        chip.textContent = name;
        decisionTargetFriends.appendChild(chip);
    });
}

<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
// ── RENDER TEMPLATE ───────────────────────────────────────────────────────────
=======
// ── RENDERIZAR TEMPLATE DE DECISÃO ────────────────────────────────────────────
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
// ── RENDERIZAR TEMPLATE DE DECISÃO ────────────────────────────────────────────
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
// ── RENDERIZAR TEMPLATE DE DECISÃO ────────────────────────────────────────────
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
// ── RENDERIZAR TEMPLATE DE DECISÃO ────────────────────────────────────────────
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
// ── RENDERIZAR TEMPLATE DE DECISÃO ────────────────────────────────────────────
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
// ── RENDER TEMPLATE ───────────────────────────────────────────────────────────
>>>>>>> 9224db4 (Fix auth and friendships backend issues; update frontend deployment docs)
=======
// ── RENDER TEMPLATE ───────────────────────────────────────────────────────────
=======
// ── RENDERIZAR TEMPLATE DE DECISÃO ────────────────────────────────────────────
>>>>>>> fc68462 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
>>>>>>> 1d52963 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
async function renderDecisionTemplate() {
    const decision = getLatestDecision();

    if (!decision) {
<<<<<<< HEAD
        if (decisionTitle) decisionTitle.textContent = "Sem decisões criadas";
        if (decisionDescription) decisionDescription.textContent = "Cria uma decisão no dashboard para ela aparecer aqui.";
        if (decisionDate) decisionDate.textContent = "--/--/----";
        if (decisionTimeLeft) decisionTimeLeft.textContent = "Sem prazo";
        if (decisionOptionsContainer) decisionOptionsContainer.innerHTML = "";
        if (decisionTotalVotes) decisionTotalVotes.textContent = "0";
        if (decisionTotalOptions) decisionTotalOptions.textContent = "0";
        if (decisionCreatedBy) decisionCreatedBy.textContent = "-";
        renderDecisionTargets(null);
=======
        if (decisionTitle)            decisionTitle.textContent            = "Sem decisões criadas";
        if (decisionDescription)      decisionDescription.textContent      = "Cria uma decisão no dashboard para ela aparecer aqui.";
        if (decisionDate)             decisionDate.textContent             = "--/--/----";
        if (decisionTimeLeft)         decisionTimeLeft.textContent         = "Sem prazo";
        if (decisionOptionsContainer) decisionOptionsContainer.innerHTML   = "";
        if (decisionTotalVotes)       decisionTotalVotes.textContent       = "0";
        if (decisionTotalOptions)     decisionTotalOptions.textContent     = "0";
        if (decisionCreatedBy)        decisionCreatedBy.textContent        = "-";
        renderDecisionTargets(null, []);
>>>>>>> fc68462 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
        return;
    }

    // ✅ Se tiver id, vai buscar dados frescos da API (inclui target_friends)
    if (decision.id) {
        try {
            const fresh = await api.getDecision(decision.id);
            if (fresh) {
                fresh.target_group_name = decision.target_group_name || "";
                if (!fresh.target_group_name) {
                    fresh.target_group_name = await resolveGroupName(fresh.target_group_id);
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

// ── RENDER WITH DATA (ACTUALIZADO) ────────────────────────────────────────────
async function renderWithData(decision) {
    const options = Array.isArray(decision.options) ? decision.options : [];
    const session = api.getSession();
    const userId = session?.user?.id;

    if (decisionTitle) {
        decisionTitle.textContent = decision.title || "Decisão sem título";
    }
    if (decisionDescription) decisionDescription.textContent = decision.description || "Sem descrição disponível.";

    // ✅ DADO DE DESEMPATE — cartão compacto inserido na barra superior,
    // entre o título e os "pills" de data/tempo restante.
    const oldWidget = document.querySelector(".tiebreaker-inline");
    if (oldWidget) oldWidget.remove();
    const tiebreakerWidget = await renderTiebreakerWidget(decision);
    if (tiebreakerWidget) {
        const topbar = document.querySelector(".decision-topbar");
        const metaPills = document.querySelector(".meta-pills");
        if (topbar) {
            if (metaPills && metaPills.parentElement === topbar) {
                topbar.insertBefore(tiebreakerWidget, metaPills);
            } else {
                topbar.appendChild(tiebreakerWidget);
            }
        } else if (decisionDescription) {
            // Fallback: se não existir .decision-topbar, mostra a seguir à descrição
            decisionDescription.insertAdjacentElement("afterend", tiebreakerWidget);
        }
    }

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

    // ✅ Resultado de desempate guardado (se existir) para esta decisão
    const storedTiebreaker = getStoredTiebreaker(decision.id);
    const tiebreakerWinnerId = storedTiebreaker?.winnerId ?? null;
    const winnerStillExists = tiebreakerWinnerId
        ? options.some(o => o.id === tiebreakerWinnerId)
        : false;

    if (decisionOptionsContainer) {
        decisionOptionsContainer.innerHTML = "";
        
        // ✅ VERIFICAR SE UTILIZADOR JÁ VOTOU
        const userVote = userId ? await getUserVoteForDecision(userId, decision.id) : null;
        const userHasVoted = !!userVote;
        const userVotedOptionId = userVote?.option_id || null;
        
        console.log(`👤 Utilizador ${userId}: ${userHasVoted ? 'JÁ VOTOU' : 'Ainda não votou'}`);
        
        // ✅ RENDERIZAR COM CONTAGEM DE VOTOS
        for (let i = 0; i < options.length; i++) {
            const option = options[i];
            const voteCount = await getVotesForOption(option.id, decision.id);
            option.votes = voteCount; // ✅ Adiciona o campo votes
            console.log(`👍 Opção ${option.option_text}: ${voteCount} votos`);
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

    // ✅ CALCULAR TOTAL DE VOTOS — inclui o voto do dado quando há desempate resolvido
    const baseTotalVotes = options.reduce((sum, o) => sum + (o.votes || 0), 0);
    const totalVotes = baseTotalVotes + (winnerStillExists ? 1 : 0);
    if (decisionTotalVotes) {
        decisionTotalVotes.textContent = String(totalVotes);
        console.log(`📊 Total de votos: ${totalVotes}`);
    }
    if (decisionTotalOptions) decisionTotalOptions.textContent = String(options.length);
    if (decisionCreatedBy) decisionCreatedBy.textContent = decision.created_by || decision.createdBy || "Utilizador";

    // ✅ NOVO: Buscar amigos da API e renderizar
    let friendshipsData = [];
    if (decision.targetFriends && Array.isArray(decision.targetFriends)) {
        friendshipsData = await fetchFriendshipsByIds(decision.targetFriends);
    }
    renderDecisionTargets(decision, friendshipsData);
}

// ── INIT ──────────────────────────────────────────────────────────────────────
api.ensureAuthenticated();
renderDecisionTemplate();

if (logoutButton) logoutButton.addEventListener("click", handleLogout);