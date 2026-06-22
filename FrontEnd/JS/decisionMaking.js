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

// ── TIEBREAKER DICE ───────────────────────────────────────────────────────────
async function renderTiebreakerDice(decision) {
    const session = api.getSession();
    const isCreator = session?.user?.name === decision.created_by;
    
    if (!isCreator) return null; // Só o criador pode ver
    
    const hasTie = checkForTie(decision.options);
    const allVoted = await checkIfAllVoted(decision);
    
    console.log(`🎲 Empate: ${hasTie}, Todos votaram: ${allVoted}`);
    
    if (!hasTie || !allVoted) return null; // Mostrar só se empate + todos votaram
    
    const container = document.createElement("div");
    container.className = "tiebreaker-container";
    
    const label = document.createElement("span");
    label.className = "tiebreaker-label";
    label.textContent = "Desempate:";
    
    const dice = document.createElement("button");
    dice.className = "tiebreaker-dice";
    dice.type = "button";
    dice.innerHTML = "🎲";
    dice.title = "Clica para resolver o empate!";
    
    dice.addEventListener("click", async (e) => {
        e.preventDefault();
        await handleTiebreakerRoll(decision, dice);
    });
    
    container.appendChild(label);
    container.appendChild(dice);
    
    return container;
}

// ── HANDLE TIEBREAKER ROLL ─────────────────────────────────────────────────────
async function handleTiebreakerRoll(decision, diceButton) {
    const winningOptions = decision.options.filter(
        o => (o.votes || 0) === Math.max(...decision.options.map(opt => opt.votes || 0))
    );
    
    if (winningOptions.length < 2) {
        console.warn("Não há empate para resolver");
        return;
    }
    
    console.log(`🎲 Rodando dado... Opções em empate: ${winningOptions.map(o => o.option_text).join(", ")}`);
    
    // ✅ Animação de rolo
    diceButton.classList.add("rolling");
    diceButton.disabled = true;
    
    // Simular rolo por 2 segundos
    const rollDuration = 2000;
    const startTime = Date.now();
    
    const rollInterval = setInterval(() => {
        const randomIdx = Math.floor(Math.random() * 10) % winningOptions.length;
        diceButton.innerHTML = `🎲 ${randomIdx + 1}`;
    }, 100);
    
    // Após 2 segundos, selecionar opção final
    setTimeout(async () => {
        clearInterval(rollInterval);
        
        const selectedIdx = Math.floor(Math.random() * winningOptions.length);
        const selectedOption = winningOptions[selectedIdx];
        
        diceButton.classList.remove("rolling");
        diceButton.innerHTML = "✨";
        diceButton.title = `Vencedor: ${selectedOption.option_text}`;
        
        console.log(`✨ Empate resolvido! Vencedor: ${selectedOption.option_text}`);
        
        // ✅ Mostrar modal com resultado
        showTiebreakerResult(selectedOption, winningOptions);
        
        // Desabilitar dado após usar
        diceButton.disabled = true;
        diceButton.classList.add("used");
    }, rollDuration);
}

// ── SHOW TIEBREAKER RESULT ─────────────────────────────────────────────────────
function showTiebreakerResult(winner, tiedOptions) {
    const modal = document.createElement("div");
    modal.className = "tiebreaker-modal";
    
    const content = document.createElement("div");
    content.className = "tiebreaker-modal-content";
    
    const title = document.createElement("h2");
    title.textContent = "✨ Empate Resolvido!";
    
    const message = document.createElement("p");
    message.innerHTML = `<strong>${winner.option_text}</strong> foi seleccionada aleatoriamente!`;
    
    const tiedList = document.createElement("div");
    tiedList.className = "tiebreaker-modal-tied";
    tiedList.innerHTML = `<small>Estavam em empate: ${tiedOptions.map(o => o.option_text).join(", ")}</small>`;
    
    const closeBtn = document.createElement("button");
    closeBtn.className = "tiebreaker-modal-close";
    closeBtn.textContent = "Fechar";
    closeBtn.addEventListener("click", () => modal.remove());
    
    content.appendChild(title);
    content.appendChild(message);
    content.appendChild(tiedList);
    content.appendChild(closeBtn);
    modal.appendChild(content);
    
    document.body.appendChild(modal);
    
    // Auto-fechar após 5 segundos
    setTimeout(() => {
        if (modal.parentNode) modal.remove();
    }, 5000);
}

// ── RENDER OPTIONS ────────────────────────────────────────────────────────────
async function renderOptionCard(option, index, userHasVoted = false, userVotedOptionId = null) {
    const card = document.createElement("article");
    card.className = "option-card";
    if (index === 0) {
        card.style.boxShadow = "0 14px 20px -20px rgba(15,20,40,0.85), inset 0 0 0 2px rgba(93,122,255,0.45)";
    }

    const name = document.createElement("p");
    name.className = "option-name";
    name.textContent = option.option_text || option.name || "";

    const votesWrap = document.createElement("div");
    votesWrap.className = "option-votes";

    // ✅ USAR option.votes (agora existe!)
    const votesCount = Math.max(1, Math.min(5, option.votes || 0));
    
    for (let i = 0; i < votesCount; i++) {
        const chip = document.createElement("button");
        chip.className = "vote-chip";
        chip.type = "button";
        chip.innerHTML = '<i class="fa-regular fa-thumbs-up"></i>';
        chip.setAttribute("data-option-id", option.id);
        
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

>>>>>>> 5ff1690 (feat:DecisionMaking)
// ── RENDER TARGETS ────────────────────────────────────────────────────────────
function renderDecisionTargets(decision) {
=======
function normalizeEntityName(entity, fallbackLabel) {
    if (typeof entity === "string") return entity;
    if (!entity || typeof entity !== "object") return fallbackLabel;
    return entity.name || entity.title || entity.label || fallbackLabel;
}

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
>>>>>>> e098cb0 (Fix group creation, decision target rendering, backend schema, and README documentation)

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

    // ✅ RENDERIZAR TÍTULO COM DADO DE DESEMPATE
    if (decisionTitle) {
        decisionTitle.innerHTML = ""; // Limpar
        
        const titleText = document.createElement("span");
        titleText.textContent = decision.title || "Decisão sem título";
        decisionTitle.appendChild(titleText);
        
        // ✅ Tentar renderizar dado se houver empate
        const diceElement = await renderTiebreakerDice(decision);
        if (diceElement) {
            decisionTitle.appendChild(diceElement);
        }
    }
    if (decisionDescription) decisionDescription.textContent = decision.description || "Sem descrição disponível.";

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
                await renderOptionCard(option, i, userHasVoted, userVotedOptionId)
            );
        }
    }

    // ✅ CALCULAR TOTAL DE VOTOS CORRECTAMENTE
    const totalVotes = options.reduce((sum, o) => sum + (o.votes || 0), 0);
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