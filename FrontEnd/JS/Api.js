// ── API.JS — Base reutilizável para todas as chamadas ──────────────────────────
// Importa este ficheiro em todos os teus JS e usa: await api.get(), api.post(), etc.

const API_BASE = "http://localhost:8000";
const SESSION_KEY = "votesync.session";

class APIClient {
    constructor(baseUrl = API_BASE) {
        this.baseUrl = baseUrl;
    }

    getSession() {
        const raw = localStorage.getItem(SESSION_KEY);
        if (!raw) return null;
        try {
            return JSON.parse(raw);
        } catch {
            return null;
        }
    }

    saveSession(session) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }

    clearSession() {
        localStorage.removeItem(SESSION_KEY);
    }

    redirectToLogin() {
        window.location.href = "./index.html";
    }

    ensureAuthenticated() {
        const session = this.getSession();
        if (!session || !session.user || !session.token) {
            this.redirectToLogin();
        }
    }

    async request(method, path, data = null) {
        const options = {
            method,
            headers: { "Content-Type": "application/json" }
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        try {
            const res = await fetch(`${this.baseUrl}${path}`, options);

            // ✅ Handle 204 No Content
            if (res.status === 204) return null;

            let responseData;
            const text = await res.text();
            try {
                responseData = text ? JSON.parse(text) : null;
            } catch {
                responseData = { detail: text };
            }

            if (!res.ok) {
                throw new Error(responseData?.detail || `Erro: ${res.status}`);
            }

            return responseData;
        } catch (err) {
            console.error(`[${method} ${path}]`, err);
            throw err;
        }
    }

    // ── CONVENIENCE METHODS ───────────────────────────────────────────────────

    get(path) {
        return this.request("GET", path);
    }

    post(path, data) {
        return this.request("POST", path, data);
    }

    put(path, data) {
        return this.request("PUT", path, data);
    }

    patch(path, data = null) {
        return this.request("PATCH", path, data);
    }

    delete(path) {
        return this.request("DELETE", path);
    }

    // ── AUTH ──────────────────────────────────────────────────────────────────

    async login(email, password) {
        const data = await this.post("/auth/login", { email, password });
        this.saveSession(data);
        return data;
    }

    logout() {
        this.clearSession();
        this.redirectToLogin();
    }

    // ── USERS ─────────────────────────────────────────────────────────────────

    getUsers() {
        return this.get("/users/");
    }

    getUser(id) {
        return this.get(`/users/${id}`);
    }

    createUser(name, email, password) {
        return this.post("/users/", { name, email, password });
    }

    updateUser(id, data) {
        return this.put(`/users/${id}`, data);
    }

    deleteUser(id) {
        return this.delete(`/users/${id}`);
    }

    // ── FRIENDSHIPS ───────────────────────────────────────────────────────────

    getFriendships() {
        return this.get("/friendships/");
    }

    getFriendship(id) {
        return this.get(`/friendships/${id}`);
    }

    createFriendship(userId, friendId, status = "pending") {
        return this.post("/friendships/", { user_id: userId, friend_id: friendId, status });
    }

    updateFriendship(id, data) {
        return this.put(`/friendships/${id}`, data);
    }

    acceptFriendship(id) {
        return this.updateFriendship(id, { status: "accepted" });
    }

    rejectFriendship(id) {
        return this.updateFriendship(id, { status: "rejected" });
    }

    deleteFriendship(id) {
        return this.delete(`/friendships/${id}`);
    }

    // ── USER GROUPS ───────────────────────────────────────────────────────────
    // ✅ ATUALIZADO: Suporta member_ids para adicionar amigos automaticamente

    getGroups(userId = null) {
        const query = userId !== null && userId !== undefined ? `?user_id=${encodeURIComponent(userId)}` : "";
        return this.get(`/groups/${query}`);
    }

    getGroup(groupId) {
        return this.get(`/groups/${groupId}`)
    }

    getUserGroup(groupId) {
        return this.getGroup(groupId);
    }

    getMemberFromGroup(id) {
        return this.get(`/members/${id}`);
    }
    
    createUserGroup(name, description = "", memberIds = []) {
        return this.post("/groups/", {
            name,
            description,
            member_ids: memberIds  // ✅ Envia IDs dos amigos
        });
    }

    updateGroup(id, name, description = "", memberIds = []) {
        return this.put(`/groups/${id}`, {
            name,
            description,
            member_ids: memberIds  // ✅ Atualiza membros do grupo
        });
    }

    deleteGroup(id) {
        return this.delete(`/groups/${id}`);
    }

    deleteUserGroup(id) {
        return this.deleteGroup(id);
    }

    // ── DECISIONS ─────────────────────────────────────────────────────────────

    getDecisions() {
        return this.get("/decisions/");
    }

    getDecision(id) {
        return this.get(`/decisions/${id}`);
    }

    createDecision(voteId, title, decisionText, description, endDate, createdBy, GroupId = null) {
        return this.post("/decisions/", {
            vote_id: voteId,
            title,
            decision_text: decisionText,
            description,
            end_date: endDate,
            created_by: createdBy,
            group_id: GroupId,
            created_at: new Date().toISOString(),
            status: "open"
        });
    }

    updateDecision(id, voteId, title, decisionText, description, endDate, createdBy, GroupId = null, status) {
        return this.put(`/decisions/${id}`, {
            vote_id: voteId,
            title,
            decision_text: decisionText,
            description,
            end_date: endDate,
            created_by: createdBy,
            group_id: GroupId,
            created_at: new Date().toISOString(),
            status: status
        });
    }

    closeDecision(id, status) {
        return this.put(`/decisions/${id}`, {
            status: status
        });
    }

    deleteDecision(id) {
        return this.delete(`/decisions/${id}`);
    }

    // ── OPTIONS ───────────────────────────────────────────────────────────────

    getOptions() {
        return this.get("/options/");
    }

    getOption(id) {
        return this.get(`/options/${id}`);
    }

    createOption(voteId, optionText) {
        return this.post("/options/", { vote_id: voteId, option_text: optionText });
    }

    updateOption(id, voteId, optionText) {
        return this.put(`/options/${id}`, { vote_id: voteId, option_text: optionText });
    }

    deleteOption(id) {
        return this.delete(`/options/${id}`);
    }

    // ── VOTES ─────────────────────────────────────────────────────────────────

    getVotes() {
        return this.get("/votes/");
    }

    getVote(id) {
        return this.get(`/votes/${id}`);
    }

    createVote(userId, decisionId, optionId) {
        return this.post("/votes/", { user_id: userId, decision_id: decisionId, option_id: optionId });
    }

    deleteVote(id) {
        return this.delete(`/votes/${id}`);
    }
}

// ── INSTÂNCIA GLOBAL ──────────────────────────────────────────────────────────
const api = new APIClient();