function requireRole(role) {
    const s = getSession();
    if (!s) { location.href = "../index.html"; return }
    if (s.role !== role) { location.href = s.role === "admin" ? "admin.html" : (s.role === "hr" ? "hr.html" : "employee.html"); return }
}
function logout() { localStorage.removeItem("hcm_session"); location.href = "../index.html" }
if (document.getElementById("setupBox")) {
    const company = getCompany();
    if (company) { setupBox.classList.add("d-none"); loginBox.classList.remove("d-none"); loginCompany.textContent = company.name } else { setupBox.classList.remove("d-none"); loginBox.classList.add("d-none") }
    setupForm?.addEventListener("submit", e => {
        e.preventDefault();
        const name = companyName.value.trim(), an = adminName.value.trim(), email = adminEmail.value.trim().toLowerCase(), pass = adminPassword.value;
        if (!name || !an || !email || pass.length < 6) return;
        saveCompany({ name, officeStart: "09:00", graceMinutes: 15, yearlyLeaveQuota: 14, workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] });
        saveUsers([{ id: Date.now(), name: an, email, password: pass, role: "admin" }]);
        alert("Company setup completed."); location.reload();
    });
    loginForm?.addEventListener("submit", e => {
        e.preventDefault(); const email = loginEmail.value.trim().toLowerCase(), pass = loginPassword.value;
        const u = getUsers().find(x => x.email.toLowerCase() === email && x.password === pass);
        if (!u) { loginError.textContent = "Invalid email or password."; loginError.classList.remove("d-none"); return }
        saveSession(u); location.href = u.role === "admin" ? "pages/admin.html" : (u.role === "hr" ? "pages/hr.html" : "pages/employee.html");
    });
}