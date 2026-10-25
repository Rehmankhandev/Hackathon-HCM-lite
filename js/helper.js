function helperAnswer(q) {
    const text = q.toLowerCase(), s = getSession(), users = getUsers().filter(x => x.role === "employee"), a = getAttendance(), l = getLeaves(), today = todayKey();
    if (s.role === "admin") {
        if (text.includes("how many") && text.includes("employee")) return `You have ${users.length} employee(s).`;
        if (text.includes("leave") && text.includes("today")) { const n = users.filter(e => l.some(x => x.employeeId === e.id && x.status === "approved" && today >= x.from && today <= x.to)); return n.length ? `${n.length} employee(s) are on leave today: ${n.map(x => x.name).join(", ")}.` : "No employees are on approved leave today." }
        if (text.includes("late") && text.includes("today")) { const n = a.filter(x => x.date === today && x.status === "late"); return n.length ? `${n.length} employee(s) are late today.` : "No late records today." }
        return "I can answer employee count, who is on leave today, and who was late today from current app data.";
    }
    const mine = a.filter(x => x.employeeId === s.id);
    if (text.includes("leave")) { return `You have ${leaveBalance(s.id, 'Annual')} annual leave day(s) left, ${leaveBalance(s.id, 'Sick')} sick day(s) left, and ${leaveBalance(s.id, 'Casual')} casual day(s) left.` }
    if (text.includes("late")) return mine.some(x => x.date === today && x.status === "late") ? "Yes, you were late today." : "No, you were not late today.";
    if (text.includes("hour")) { let h = 0; mine.forEach(x => { if (x.checkIn && x.checkOut) h += (new Date("1970-01-01T" + x.checkOut) - new Date("1970-01-01T" + x.checkIn)) / 3600000 }); return `Your recorded worked time is ${h.toFixed(1)} hour(s).` }
    return "Ask me about your leave balance, whether you were late, or your recorded work hours.";
}
function askHelper() { const input = document.getElementById("helperInput"), chat = document.getElementById("helperChat"); if (!input || !chat) return; const q = input.value.trim(); if (!q) return; chat.innerHTML += `<div class="chat-user">${escapeHtml(q)}</div><div class="chat-ai">${escapeHtml(helperAnswer(q))}</div>`; input.value = "" }