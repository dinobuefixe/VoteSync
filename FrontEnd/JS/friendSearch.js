/* ── VoteSync — friendSearch.js (REFATORIZADO COM api.js) ──
   Inclui este ficheiro em qualquer página que tenha uma barra de pesquisa.
   Requer: api.js carregado ANTES deste ficheiro
   Selectors suportados:
     - .search-box input   (dashboard, decisions, decisionMaking)
     - .search-bar input   (friends, groups)
────────────────────────────────────────────────────────────────────── */

(function initFriendSearch() {
  const searchInput =
    document.querySelector(".search-box input") ||
    document.querySelector(".search-bar input");

  if (!searchInput) return;

  // ✅ Obter myId do session usando api.js
  const session = api.getSession();
  const myId = parseInt(session?.user?.id);

  if (!myId) {
    console.error("FriendSearch: Utilizador não autenticado");
    return;
  }

  // Dropdown de resultados
  const dropdown = document.createElement("div");
  dropdown.id = "friend-search-dropdown";
  Object.assign(dropdown.style, {
    position: "absolute",
    background: "#fff",
    borderRadius: "14px",
    boxShadow: "0 8px 30px rgba(0,0,0,0.13)",
    zIndex: "999",
    minWidth: "280px",
    maxWidth: "400px",
    overflow: "hidden",
    display: "none",
    marginTop: "6px",
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
      // ✅ Usar api.js em vez de apiFetch()
      const [users, friendships] = await Promise.all([
        api.getUsers(),
        api.getFriendships()
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
        const friendship = friendships.find(f =>
          (f.user_id === myId && f.friend_id === u.id) ||
          (f.friend_id === myId && f.user_id === u.id)
        );

        const isFriend = friendship?.status === "accepted";
        const isOutgoing = friendship?.status === "pending" && friendship.user_id === myId;
        const isIncoming = friendship?.status === "pending" && friendship.friend_id === myId;

        let actionHtml = `<button onclick="fsAddFriend(${u.id}, this)" style="border:none;background:linear-gradient(90deg,#83b5f0,#69c4ee);color:#132338;padding:5px 12px;border-radius:20px;font-size:12px;font-weight:600;cursor:pointer;white-space:nowrap;">Adicionar</button>`;
        if (isFriend) {
          actionHtml = `<button onclick="fsRemoveFriend(${friendship?.id}, this)" style="border:1px solid #e0d5f5;background:#f7f4fd;color:#7c5cbf;padding:5px 12px;border-radius:20px;font-size:12px;font-weight:600;cursor:pointer;white-space:nowrap;">Remover</button>`;
        } else if (isOutgoing) {
          actionHtml = `<button disabled style="border:1px solid #d6d0e8;background:#f7f4fd;color:#7c5cbf;padding:5px 12px;border-radius:20px;font-size:12px;font-weight:600;white-space:nowrap;">Pedido enviado</button>`;
        } else if (isIncoming) {
          actionHtml = `<div style="display:flex;gap:8px;">
              <button onclick="fsAcceptFriend(${friendship?.id}, this)" style="border:none;background:#1a7a52;color:#fff;padding:5px 12px;border-radius:20px;font-size:12px;font-weight:600;cursor:pointer;white-space:nowrap;">Aceitar</button>
              <button onclick="fsRejectFriend(${friendship?.id}, this)" style="border:1px solid #e0d5f5;background:#f7f4fd;color:#7c5cbf;padding:5px 12px;border-radius:20px;font-size:12px;font-weight:600;cursor:pointer;white-space:nowrap;">Recusar</button>
            </div>`;
        }

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
            ${actionHtml}
          </div>`;
      }).join("");

      dropdown.style.display = "block";
    } catch (err) {
      console.error("FriendSearch error:", err);
      dropdown.innerHTML = `<div style="padding:14px 16px;color:#a93226;font-size:13px;">Erro: ${err.message}</div>`;
      dropdown.style.display = "block";
    }
  }

  // ── Ações ──────────────────────────────────────────────────────────────────
  window.fsAddFriend = async function (friendId, btn) {
    btn.disabled = true;
    btn.textContent = "...";
    try {
<<<<<<< HEAD
      await apiFetch("/friendships/", {
        method: "POST",
        body: JSON.stringify({ user_id: myId, friend_id: friendId, status: "pending" }),
      });
      btn.textContent = "✓ Enviado";
      btn.style.background = "#1a7a52";
      btn.style.color = "#fff";
      
      // 🔄 ATUALIZA O CARD DE AMIGOS AUTOMATICAMENTE
=======
      const friendship = await api.createFriendship(myId, friendId, "pending");
      btn.textContent = "Pedido enviado";
      btn.style.background = "#f7f4fd";
      btn.style.color = "#7c5cbf";
      btn.disabled = true;

>>>>>>> 9224db4 (Fix auth and friendships backend issues; update frontend deployment docs)
      if (typeof window.refreshFriendsCard === "function") {
        await window.refreshFriendsCard();
      }
      setTimeout(() => fetchAndRender(searchInput.value.trim().toLowerCase()), 600);
    } catch (err) {
      console.error("Error adding friend:", err);
      btn.textContent = "Erro";
      btn.disabled = false;
    }
  };

  window.fsAcceptFriend = async function (friendshipId, btn) {
    if (!friendshipId) return;
    btn.disabled = true;
    btn.textContent = "...";
    try {
      await api.updateFriendship(friendshipId, { status: "accepted" });
      btn.textContent = "Aceito";
      btn.style.background = "#1a7a52";
      btn.style.color = "#fff";
      if (typeof window.refreshFriendsCard === "function") {
        await window.refreshFriendsCard();
      }
      setTimeout(() => fetchAndRender(searchInput.value.trim().toLowerCase()), 600);
    } catch (err) {
      console.error("Error accepting friend:", err);
      btn.textContent = "Erro";
      btn.disabled = false;
    }
  };

  window.fsRejectFriend = async function (friendshipId, btn) {
    if (!friendshipId) return;
    btn.disabled = true;
    btn.textContent = "...";
    try {
      await api.updateFriendship(friendshipId, { status: "rejected" });
      btn.textContent = "Recusado";
      btn.style.background = "#fff";
      btn.style.color = "#7c5cbf";
      if (typeof window.refreshFriendsCard === "function") {
        await window.refreshFriendsCard();
      }
      setTimeout(() => fetchAndRender(searchInput.value.trim().toLowerCase()), 600);
    } catch (err) {
      console.error("Error rejecting friend:", err);
      btn.textContent = "Erro";
      btn.disabled = false;
    }
  };

  window.fsRemoveFriend = async function (friendshipId, btn) {
    if (!friendshipId) return;
    btn.disabled = true;
    btn.textContent = "...";
    try {
      await api.deleteFriendship(friendshipId);
      btn.textContent = "Removido";
      btn.style.background = "#a93226";
      btn.style.color = "#fff";
      if (typeof window.refreshFriendsCard === "function") {
        await window.refreshFriendsCard();
      }
      setTimeout(() => fetchAndRender(searchInput.value.trim().toLowerCase()), 600);
    } catch (err) {
      console.error("Error removing friend:", err);
      btn.textContent = "Erro";
      btn.disabled = false;
    }
  };

  function initials(name) {
    return (name || "?").split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
  }
})();