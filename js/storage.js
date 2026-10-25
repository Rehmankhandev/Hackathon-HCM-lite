const KEYS = { company: "hcm_company", users: "hcm_users", attendance: "hcm_attendance", leaves: "hcm_leaves", session: "hcm_session", announcements: "hcm_announcements" };
function read(key, fallback = []) { try { const raw = localStorage.getItem(key); if (raw === null) return fallback; const v = JSON.parse(raw); return v ?? fallback } catch { return fallback } }
function write(key, value) { localStorage.setItem(key, JSON.stringify(value)) }
function getCompany() { const c = read(KEYS.company, null); if (!c) return null; c.leaveQuotas = { Annual: Number(c.leaveQuotas?.Annual ?? c.yearlyLeaveQuota ?? 14), Sick: Number(c.leaveQuotas?.Sick ?? 8), Casual: Number(c.leaveQuotas?.Casual ?? 10) }; c.yearlyLeaveQuota = c.leaveQuotas.Annual; return c }
function saveCompany(v) { v.leaveQuotas = { Annual: Number(v.leaveQuotas?.Annual ?? v.yearlyLeaveQuota ?? 14), Sick: Number(v.leaveQuotas?.Sick ?? 8), Casual: Number(v.leaveQuotas?.Casual ?? 10) }; v.yearlyLeaveQuota = v.leaveQuotas.Annual; write(KEYS.company, v) }
function getUsers() { return read(KEYS.users, []) } function saveUsers(v) { write(KEYS.users, v) }
function getAttendance() { return read(KEYS.attendance, []) } function saveAttendance(v) { write(KEYS.attendance, v) }
function getLeaves() { return read(KEYS.leaves, []) } function saveLeaves(v) { write(KEYS.leaves, v) }
function getAnnouncements() { return read(KEYS.announcements, []) } function saveAnnouncements(v) { write(KEYS.announcements, v) }
function getSession() { return read(KEYS.session, null) } function saveSession(v) { write(KEYS.session, v) }
function todayKey() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` }
function userName(id) { return getUsers().find(u => u.id === id)?.name || "Unknown" }
function emptyRow(cols, text) { return `<tr><td colspan="${cols}" class="text-center py-5 empty-note">${escapeHtml(text)}</td></tr>` }
function escapeHtml(v = "") { return String(v).replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[m])) }
function dateOnly(s) { const [y, m, d] = String(s).split('-').map(Number); return new Date(y, m - 1, d) }
function workingDays(from, to) { let a = dateOnly(from), b = dateOnly(to), n = 0; for (; a <= b; a.setDate(a.getDate() + 1)) { if (a.getDay() !== 0 && a.getDay() !== 6) n++ } return n }
function overlappingLeave(employeeId, from, to, ignoreId = null) { return getLeaves().some(x => x.employeeId === employeeId && x.id !== ignoreId && x.status !== 'rejected' && !(dateOnly(to) < dateOnly(x.from) || dateOnly(from) > dateOnly(x.to))) }
function leaveQuota(type) { const q = getCompany()?.leaveQuotas || { Annual: 14, Sick: 8, Casual: 10 }; return Number(q[type] ?? 0) }
function approvedLeaveDays(employeeId, type) { return getLeaves().filter(x => x.employeeId === employeeId && x.status === 'approved' && x.type === type).reduce((n, x) => n + Number(x.days || 0), 0) }
function pendingLeaveDays(employeeId, type) { return getLeaves().filter(x => x.employeeId === employeeId && x.status === 'pending' && x.type === type).reduce((n, x) => n + Number(x.days || 0), 0) }
// Available balance reserves pending requests so the same quota cannot be requested twice.
function leaveBalance(employeeId, type = 'Annual') { if (type === 'Unpaid') return Infinity; return Math.max(0, leaveQuota(type) - approvedLeaveDays(employeeId, type) - pendingLeaveDays(employeeId, type)) }
function approvedBalance(employeeId, type = 'Annual') { if (type === 'Unpaid') return Infinity; return Math.max(0, leaveQuota(type) - approvedLeaveDays(employeeId, type)) }
function leaveUsed(employeeId, type) { return approvedLeaveDays(employeeId, type) }
function leaveReserved(employeeId, type) { return pendingLeaveDays(employeeId, type) }
function allLeaveBalance(employeeId) { return Object.keys(getCompany()?.leaveQuotas || { Annual: 14, Sick: 8, Casual: 10 }).reduce((o, t) => { o[t] = leaveBalance(employeeId, t); return o }, {}) }
function showMsg(el, text, type) { if (!el) return; el.textContent = text; el.className = `form-message ${type || ''}` }
