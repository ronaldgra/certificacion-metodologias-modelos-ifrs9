const CHECKLIST = [
    '¿Se utilizó la metodología correcta aprobada por el comité?',
    '¿Se controlaron todos los datos y parámetros necesarios?',
    '¿Se replicó el modelo antes de la implementación final?',
    '¿La integridad del modelo fue revisada y certificada por el responsable del modelo?',
    '¿Se realizó un challenge técnico en el precomité?',
    '¿Las hipótesis están documentadas y validadas?',
    '¿Se puede rastrear el linaje de los datos?',
    '¿Se realizan pruebas de estrés?',
    '¿El modelo es explicable a los stakeholders?',
    '¿Existe un plan de reversión de la implementación?',
    '¿Riesgo operativo revisó la documentación?',
    '¿Se cumplen todos los requisitos regulatorios?',
    '¿El equipo de cumplimiento aprobó?',
    '¿Se completó un análisis de sensibilidad?',
    '¿Se realizaron revisiones por pares?'
];

let currentRole = null;
let currentUser = null;

function loadUsers() {
    return JSON.parse(localStorage.getItem('users') || '[]');
}

function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

function loadRequests() {
    return JSON.parse(localStorage.getItem('requests') || '[]');
}

function saveRequests(reqs) {
    localStorage.setItem('requests', JSON.stringify(reqs));
}

function login() {
    const role = document.getElementById('roleSelect').value;
    const username = document.getElementById('username').value.trim();
    const name = document.getElementById('name').value.trim();
    if (!username || !name) {
        alert('Debe ingresar usuario y nombre');
        return;
    }
    const users = loadUsers();
    let user = users.find(u => u.username === username);
    if (!user) {
        user = { username, name, role };
        users.push(user);
    } else if (user.role !== role) {
        alert('Rol registrado para este usuario: ' + user.role);
        return;
    } else {
        user.name = name;
    }
    saveUsers(users);
    currentUser = user;
    currentRole = role;
    document.getElementById('loginPanel').classList.add('hidden');
    document.getElementById('mainPanel').classList.remove('hidden');
    document.getElementById('userRole').innerText = 'Rol: ' + currentRole + ' - ' + currentUser.name;
    if (currentRole === 'Analista') {
        showRequestForm();
    }
    renderDashboard();
}

function logout() {
    currentRole = null;
    currentUser = null;
    document.getElementById('mainPanel').classList.add('hidden');
    document.getElementById('loginPanel').classList.remove('hidden');
    const form = document.getElementById('requestForm');
    form.innerHTML = '';
    form.classList.add('hidden');
    document.getElementById('detailPanel').classList.add('hidden');
}

function showRequestForm() {
    const formDiv = document.getElementById('requestForm');
    let html = `<h3>Nueva Solicitud de Metodología</h3>`;
    html += `<label>Nombre: <input id="reqName"></label><br>`;
    html += `<label>Descripción: <textarea id="reqDesc"></textarea></label><br>`;
    html += '<h4>Lista de verificación</h4>';
    CHECKLIST.forEach((q, i) => {
        html += `<label><input type="checkbox" id="chk${i}"> ${q}</label><br>`;
    });
    html += `<button onclick="createRequest()">Crear</button>`;
    formDiv.innerHTML = html;
    formDiv.classList.remove('hidden');
}

function createRequest() {
    const reqs = loadRequests();
    const newReq = {
        id: Date.now(),
        name: document.getElementById('reqName').value,
        description: document.getElementById('reqDesc').value,
        status: 'Creado',
        checklist: CHECKLIST.map((_, i) => document.getElementById('chk'+i).checked),
        logs: [],
        createdTime: Date.now(),
        lastUpdated: Date.now(),
        escalation: 0
    };
    newReq.logs.push(logEntry('Creado'));
    reqs.push(newReq);
    saveRequests(reqs);
    document.getElementById('requestForm').classList.add('hidden');
    renderDashboard();
}

function logEntry(action) {
    return {
        action,
        role: currentRole,
        user: currentUser ? currentUser.username : '',
        name: currentUser ? currentUser.name : '',
        time: new Date().toISOString()
    };
}

function renderDashboard() {
    const dash = document.getElementById('dashboard');
    const reqs = loadRequests();
    checkEscalation(reqs);
    let html = '<table><tr><th>ID</th><th>Nombre</th><th>Estado</th><th>Acciones</th></tr>';
    reqs.forEach(r => {
        html += `<tr><td>${r.id}</td><td>${r.name}</td><td>${r.status}</td><td class='request-actions'>`;
        html += actionsFor(r);
        html += '</td></tr>';
    });
    html += '</table>';
    dash.innerHTML = html;
    saveRequests(reqs);
}

function actionsFor(r) {
    const actions = [];
    if (currentRole === 'Supervisor' && r.status === 'Creado') {
        actions.push(`<button onclick="approve(${r.id}, 'Aprobado por Supervisor')">Aprobar</button>`);
    }
    if (currentRole === 'Gerente' && r.status === 'Aprobado por Supervisor') {
        actions.push(`<button onclick="approve(${r.id}, 'Aprobado por Gerente')">Aprobar</button>`);
    }
    if (currentRole === 'Gerente' && r.status === 'Aprobado por Gerente') {
        actions.push(`<button onclick="approve(${r.id}, 'Precomité')">Enviar a Precomité</button>`);
    }
    if (currentRole === 'VP' && r.status === 'Precomité') {
        actions.push(`<button onclick="approve(${r.id}, 'Aprobado por VP')">Aprobación Final</button>`);
    }
    actions.push(`<button onclick="viewRequest(${r.id})">Ver</button>`);
    if (actions.length === 0) return '';
    return actions.join('');
}

function approve(id, newStatus) {
    const reqs = loadRequests();
    const req = reqs.find(r => r.id === id);
    if (!req) return;
    req.status = newStatus;
    req.lastUpdated = Date.now();
    req.logs.push(logEntry(newStatus));
    saveRequests(reqs);
    renderDashboard();
}

function viewRequest(id) {
    const reqs = loadRequests();
    const r = reqs.find(x => x.id === id);
    if (!r) return;
    const panel = document.getElementById('detailPanel');
    let html = `<h3>Solicitud ${r.id}</h3>`;
    html += `<p><strong>Nombre:</strong> ${r.name}</p>`;
    html += `<p><strong>Descripción:</strong> ${r.description}</p>`;
    html += '<h4>Lista de verificación</h4><ul>';
    CHECKLIST.forEach((q, i) => {
        html += `<li>${r.checklist[i] ? '✅' : '❌'} ${q}</li>`;
    });
    html += '</ul><h4>Registro</h4><ul>';
    r.logs.forEach(l => {
        html += `<li>[${l.time}] ${l.role} (${l.user} - ${l.name}): ${l.action}</li>`;
    });
    html += '</ul>';
    html += `<button onclick="closeDetail()">Cerrar</button>`;
    panel.innerHTML = html;
    panel.classList.remove('hidden');
}

function closeDetail() {
    const panel = document.getElementById('detailPanel');
    panel.innerHTML = '';
    panel.classList.add('hidden');
}

function checkEscalation(reqs) {
    const now = Date.now();
    reqs.forEach(r => {
        if (r.status !== 'Aprobado por VP' && now - r.lastUpdated > 86400000) { // 24h
            if (r.escalation < 1 && r.status === 'Creado') {
                r.escalation = 1;
                r.logs.push({ action: 'Escalado a Supervisor', role: 'Sistema', time: new Date().toISOString() });
            }
        }
    });
}
window.addEventListener('load', renderDashboard);
