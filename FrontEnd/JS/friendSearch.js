/* ── VoteSync — friendSearch.js (módulo partilhado) ──
   Inclui este ficheiro em qualquer página que tenha uma barra de pesquisa.
   Requer: SESSION_KEY, apiFetch() e myId já definidos no JS da página.
   Selectors suportados:
     - .search-box input   (dashboard, decisions, decisionMaking)
     - .search-bar input   (friends, groups)
────────────────────────────────────────────────────────────────────── */

(function initFriendSearch() {
  const searchInput =
    document.querySelector(".search-box input") ||
    document.querySelector(".search-bar input");

  if (!searchInput) return;

  // Dropdown de resultados
  const dropdown = document.createElement("div");
  dropdown.id = "friend-search-dropdown";
  Object.assign(dropdown.style, {
    position:     "absolute",
    background:   "#fff",
    borderRadius: "14px",
    boxShadow:    "0 8px 30px rgba(0,0,0,0.13)",
    zIndex:       "999",
    minWidth:     "280px",
    maxWidth:     "400px",
    overflow:     "hidden",
    display:      "none",
    marginTop:    "6px",
  });

  // Posiciona o dropdown relativo ao input
  const wrapper = searchInput.closest(".search-box, .search-bar") || searchInput.parentElement;
  wrapper.style.position = "relative";
  wrapper.appendChild(dropdown);

  let debounceTimer;

  searchInput.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    const query = searchInput.value.trim().toLowerCase();
    if (query.length < 2) { dropdown.style.display = "none"; return; }
    debounceTimer = setTimeout(() => fetchAndRender(query), 250);
  });

  // Fecha ao clicar fora
  document.addEventListener("click", (e) => {
    if (!wrapper.contains(e.target)) dropdown.style.display = "none";
  });

  async function fetchAndRender(query) {
    try {
      const [users, friendships] = await Promise.all([
        apiFetch("/users/"),
        apiFetch("/friendships/"),
      ]);

      const myFriendIds = friendships
        .filter(f => f.status === "pending" && (f.user_id === myId || f.friend_id === myId))
        .map(f => f.user_id === myId ? f.friend_id : f.user_id);

      const results = users.filter(u =>
        u.id !== myId &&
        (u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query))
      );

      if (results.length === 0) {
        dropdown.innerHTML = `<div style="padding:14px 16px;color:#5f6678;font-size:13px;">Nenhum utilizador encontrado.</div>`;
        dropdown.style.display = "block";
        return;
      }

      dropdown.innerHTML = results.map(u => {
        const isFriend = myFriendIds.includes(u.id);
        const friendship = friendships.find(f =>
          (f.user_id === myId && f.friend_id === u.id) ||
          (f.friend_id === myId && f.user_id === u.id)
        );
        return `
          <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border-bottom:1px solid #f0edf8;gap:10px;">
            <div style="display:flex;align-items:center;gap:10px;">
              <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#9b7dd4,#5bc8e8);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:13px;flex-shrink:0;">
                ${initials(u.name)}
              </div>
              <div>
                <div style="font-weight:700;font-size:13px;color:#182033;">${u.name}</div>
                <div style="font-size:11px;color:#5f6678;">${u.email}</div>
              </div>
            </div>
            ${isFriend
              ? `<button onclick="fsRemoveFriend(${friendship?.id}, this)" style="border:1px solid #e0d5f5;background:#f7f4fd;color:#7c5cbf;padding:5px 12px;border-radius:20px;font-size:12px;font-weight:600;cursor:pointer;white-space:nowrap;">Remover</button>`
              : `<button onclick="fsAddFriend(${u.id}, this)" style="border:none;background:linear-gradient(90deg,#83b5f0,#69c4ee);color:#132338;padding:5px 12px;border-radius:20px;font-size:12px;font-weight:600;cursor:pointer;white-space:nowrap;">Adicionar</button>`
            }
          </div>`;
      }).join("");

      dropdown.style.display = "block";
    } catch (err) {
      dropdown.innerHTML = `<div style="padding:14px 16px;color:#a93226;font-size:13px;">Erro: ${err.message}</div>`;
      dropdown.style.display = "block";
    }
  }

  // ── Ações ──────────────────────────────────────────────────────────────────
  window.fsAddFriend = async function(friendId, btn) {
    btn.disabled = true;
    btn.textContent = "...";
    try {
      await apiFetch("/friendships/", {
        method: "POST",
        body: JSON.stringify({ user_id: myId, friend_id: friendId, status: "pending" }),
      });
      btn.textContent = "✓ Enviado";
      btn.style.background = "#1a7a52";
      btn.style.color = "#fff";
      
      // 🔄 ATUALIZA O CARD DE AMIGOS AUTOMATICAMENTE
      if (typeof window.refreshFriendsCard === "function") {
        await window.refreshFriendsCard();
      }
      
      // Refresca os resultados
      setTimeout(() => fetchAndRender(searchInput.value.trim().toLowerCase()), 600);
    } catch (err) {
      btn.textContent = "Erro";
      btn.disabled = false;
    }
  };

  window.fsRemoveFriend = async function(friendshipId, btn) {
    if (!friendshipId) return;
    btn.disabled = true;
    btn.textContent = "...";
    try {
      await apiFetch(`/friendships/${friendshipId}`, { method: "DELETE" });
      btn.textContent = "Removido";
      btn.style.background = "#a93226";
      btn.style.color = "#fff";
      
      // 🔄 ATUALIZA O CARD DE AMIGOS AUTOMATICAMENTE
      if (typeof window.refreshFriendsCard === "function") {
        await window.refreshFriendsCard();
      }
      
      setTimeout(() => fetchAndRender(searchInput.value.trim().toLowerCase()), 600);
    } catch (err) {
      btn.textContent = "Erro";
      btn.disabled = false;
    }
  };

  function initials(name) {
    return (name || "?").split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
  }
})();