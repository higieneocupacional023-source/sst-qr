// Global Variables
let employees = JSON.parse(localStorage.getItem('employees')) || [];
let inspections = JSON.parse(localStorage.getItem('inspections')) || [];
let settings = JSON.parse(localStorage.getItem('settings')) || {};
let currentEmployeeId = null;
let currentInspectionId = null;

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    initTabs();
    initModals();
    initForms();
    initSearch();
    loadSettings();
    updateDashboard();
    updateEmployeeTable();
    updateInspectionTable();
    populateResponsibleSelect();
});

// Tab Navigation
function initTabs() {
    const navLinks = document.querySelectorAll('.nav-links li');
    const tabContents = document.querySelectorAll('.tab-content');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            navLinks.forEach(l => l.classList.remove('active'));
            tabContents.forEach(t => t.classList.remove('active'));
            
            this.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

// Modal Functions
function initModals() {
    // Employee Modal
    const employeeModal = document.getElementById('employeeModal');
    const addEmployeeBtn = document.getElementById('addEmployeeBtn');
    const closeBtns = document.querySelectorAll('.close');
    const cancelBtns = document.querySelectorAll('.cancel-btn');
    
    addEmployeeBtn.addEventListener('click', () => openEmployeeModal());
    
    // Inspection Modal
    const inspectionModal = document.getElementById('inspectionModal');
    const addInspectionBtn = document.getElementById('addInspectionBtn');
    
    addInspectionBtn.addEventListener('click', () => openInspectionModal());
    
    // Close buttons
    closeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    
    cancelBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    
    // Close on outside click
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
}

function openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Employee Functions
function openEmployeeModal(employee = null) {
    const form = document.getElementById('employeeForm');
    const title = document.getElementById('employeeModalTitle');
    
    form.reset();
    document.getElementById('employeeId').value = '';
    
    if (employee) {
        title.textContent = 'Editar Colaborador';
        document.getElementById('employeeId').value = employee.id;
        document.getElementById('empName').value = employee.name;
        document.getElementById('empCPF').value = employee.cpf;
        document.getElementById('empPosition').value = employee.position;
        document.getElementById('empSector').value = employee.sector;
        document.getElementById('empAdmission').value = employee.admission;
        document.getElementById('empPhone').value = employee.phone || '';
        document.getElementById('empEmail').value = employee.email || '';
        document.getElementById('empBirthday').value = employee.birthday || '';
        document.getElementById('empPPE').value = employee.ppe || '';
        document.getElementById('empNotes').value = employee.notes || '';
    } else {
        title.textContent = 'Novo Colaborador';
    }
    
    openModal('employeeModal');
}

function saveEmployee(e) {
    e.preventDefault();
    
    const id = document.getElementById('employeeId').value;
    const employee = {
        id: id || Date.now().toString(),
        name: document.getElementById('empName').value,
        cpf: document.getElementById('empCPF').value,
        position: document.getElementById('empPosition').value,
        sector: document.getElementById('empSector').value,
        admission: document.getElementById('empAdmission').value,
        phone: document.getElementById('empPhone').value,
        email: document.getElementById('empEmail').value,
        birthday: document.getElementById('empBirthday').value,
        ppe: document.getElementById('empPPE').value,
        notes: document.getElementById('empNotes').value,
        createdAt: id ? (employees.find(e => e.id === id)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    if (id) {
        const index = employees.findIndex(e => e.id === id);
        employees[index] = employee;
    } else {
        employees.push(employee);
    }
    
    localStorage.setItem('employees', JSON.stringify(employees));
    updateEmployeeTable();
    updateDashboard();
    closeModal('employeeModal');
    showNotification('Colaborador salvo com sucesso!');
}

function deleteEmployee(id) {
    if (confirm('Tem certeza que deseja excluir este colaborador?')) {
        employees = employees.filter(e => e.id !== id);
        localStorage.setItem('employees', JSON.stringify(employees));
        updateEmployeeTable();
        updateDashboard();
        showNotification('Colaborador excluído com sucesso!');
    }
}

function viewEmployee(id) {
    const employee = employees.find(e => e.id === id);
    if (!employee) return;
    
    document.getElementById('detailName').textContent = employee.name;
    document.getElementById('detailPosition').textContent = `${employee.position} | Setor: ${employee.sector}`;
    document.getElementById('detailCPF').textContent = employee.cpf;
    document.getElementById('detailAdmission').textContent = formatDate(employee.admission);
    document.getElementById('detailPhone').textContent = employee.phone || '-';
    document.getElementById('detailEmail').textContent = employee.email || '-';
    document.getElementById('detailBirthday').textContent = employee.birthday ? formatDate(employee.birthday) : '-';
    document.getElementById('detailPPE').textContent = employee.ppe || '-';
    document.getElementById('detailNotes').textContent = employee.notes || '-';
    
    // Generate initials for avatar
    const initials = employee.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    document.getElementById('employeeAvatar').textContent = initials;
    
    // Generate QR Code
    const qrContainer = document.getElementById('employeeQRCode');
    qrContainer.innerHTML = '';
    new QRCode(qrContainer, {
        text: JSON.stringify({
            name: employee.name,
            cpf: employee.cpf,
            position: employee.position,
            sector: employee.sector
        }),
        width: 150,
        height: 150
    });
    
    openModal('employeeDetailsModal');
}

function updateEmployeeTable() {
    const tbody = document.getElementById('employeeTableBody');
    tbody.innerHTML = '';
    
    employees.forEach(employee => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${employee.name}</td>
            <td>${employee.cpf}</td>
            <td>${employee.position}</td>
            <td>${employee.sector}</td>
            <td>${formatDate(employee.admission)}</td>
            <td class="actions">
                <button class="btn btn-sm btn-secondary" onclick="viewEmployee('${employee.id}')">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-primary" onclick="openEmployeeModal(employees.find(e => e.id === '${employee.id}'))">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteEmployee('${employee.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Inspection Functions
function openInspectionModal(inspection = null) {
    const form = document.getElementById('inspectionForm');
    const title = document.getElementById('inspectionModalTitle');
    
    form.reset();
    document.getElementById('inspectionId').value = '';
    document.getElementById('inspDate').valueAsDate = new Date();
    
    if (inspection) {
        title.textContent = 'Editar Inspeção';
        document.getElementById('inspectionId').value = inspection.id;
        document.getElementById('inspDate').value = inspection.date;
        document.getElementById('inspTime').value = inspection.time || '';
        document.getElementById('inspLocation').value = inspection.location;
        document.getElementById('inspResponsible').value = inspection.responsible;
        document.getElementById('inspType').value = inspection.type;
        document.getElementById('inspDescription').value = inspection.description || '';
        document.getElementById('inspStatus').value = inspection.status;
    } else {
        title.textContent = 'Nova Inspeção';
    }
    
    openModal('inspectionModal');
}

function saveInspection(e) {
    e.preventDefault();
    
    const id = document.getElementById('inspectionId').value;
    const inspection = {
        id: id || Date.now().toString(),
        date: document.getElementById('inspDate').value,
        time: document.getElementById('inspTime').value,
        location: document.getElementById('inspLocation').value,
        responsible: document.getElementById('inspResponsible').value,
        type: document.getElementById('inspType').value,
        description: document.getElementById('inspDescription').value,
        status: document.getElementById('inspStatus').value,
        createdAt: id ? (inspections.find(i => i.id === id)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    if (id) {
        const index = inspections.findIndex(i => i.id === id);
        inspections[index] = inspection;
    } else {
        inspections.push(inspection);
    }
    
    localStorage.setItem('inspections', JSON.stringify(inspections));
    updateInspectionTable();
    updateDashboard();
    closeModal('inspectionModal');
    showNotification('Inspeção salva com sucesso!');
}

function deleteInspection(id) {
    if (confirm('Tem certeza que deseja excluir esta inspeção?')) {
        inspections = inspections.filter(i => i.id !== id);
        localStorage.setItem('inspections', JSON.stringify(inspections));
        updateInspectionTable();
        updateDashboard();
        showNotification('Inspeção excluída com sucesso!');
    }
}

function updateInspectionTable() {
    const tbody = document.getElementById('inspectionTableBody');
    tbody.innerHTML = '';
    
    inspections.forEach(inspection => {
        const row = document.createElement('tr');
        const statusClass = inspection.status === 'Concluída' ? 'badge-completed' : 
                          inspection.status === 'Pendente' ? 'badge-pending' : 'badge-overdue';
        
        row.innerHTML = `
            <td>${formatDate(inspection.date)}</td>
            <td>${inspection.location}</td>
            <td>${inspection.responsible}</td>
            <td><span class="list-item-badge ${statusClass}">${inspection.status}</span></td>
            <td class="actions">
                <button class="btn btn-sm btn-primary" onclick="openInspectionModal(inspections.find(i => i.id === '${inspection.id}'))">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteInspection('${inspection.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function populateResponsibleSelect() {
    const select = document.getElementById('inspResponsible');
    select.innerHTML = '<option value="">Selecione</option>';
    
    employees.forEach(employee => {
        const option = document.createElement('option');
        option.value = employee.name;
        option.textContent = employee.name;
        select.appendChild(option);
    });
}

// Dashboard Functions
function updateDashboard() {
    document.getElementById('totalEmployees').textContent = employees.length;
    document.getElementById('totalInspections').textContent = inspections.length;
    
    const completedInspections = inspections.filter(i => i.status === 'Concluída').length;
    const complianceRate = inspections.length > 0 ? Math.round((completedInspections / inspections.length) * 100) : 0;
    document.getElementById('complianceRate').textContent = `${complianceRate}%`;
    
    // Non-conformities (simplified - count pending inspections as potential issues)
    const pendingInspections = inspections.filter(i => i.status === 'Pendente').length;
    document.getElementById('totalNonConformities').textContent = pendingInspections;
    
    updateUpcomingInspections();
    updateRecentActivity();
}

function updateUpcomingInspections() {
    const container = document.getElementById('upcomingInspections');
    container.innerHTML = '';
    
    const upcoming = inspections
        .filter(i => i.status !== 'Concluída' && i.status !== 'Cancelada')
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 5);
    
    if (upcoming.length === 0) {
        container.innerHTML = '<p style="padding: 20px; text-align: center; color: var(--text-light);">Nenhuma inspeção pendente</p>';
        return;
    }
    
    upcoming.forEach(inspection => {
        const item = document.createElement('div');
        item.className = 'list-item';
        item.innerHTML = `
            <div class="list-item-info">
                <h4>${inspection.location}</h4>
                <p>${formatDate(inspection.date)} - ${inspection.responsible}</p>
            </div>
            <span class="list-item-badge badge-pending">${inspection.status}</span>
        `;
        container.appendChild(item);
    });
}

function updateRecentActivity() {
    const container = document.getElementById('recentActivity');
    container.innerHTML = '';
    
    const recentEmployees = employees
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, 3);
    
    const recentInspections = inspections
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, 3);
    
    const allRecent = [...recentEmployees.map(e => ({type: 'employee', data: e})), 
                      ...recentInspections.map(i => ({type: 'inspection', data: i}))]
        .sort((a, b) => new Date(b.data.updatedAt) - new Date(a.data.updatedAt))
        .slice(0, 5);
    
    if (allRecent.length === 0) {
        container.innerHTML = '<p style="padding: 20px; text-align: center; color: var(--text-light);">Nenhuma atividade recente</p>';
        return;
    }
    
    allRecent.forEach(item => {
        const element = document.createElement('div');
        element.className = 'list-item';
        
        if (item.type === 'employee') {
            element.innerHTML = `
                <div class="list-item-info">
                    <h4>Colaborador: ${item.data.name}</h4>
                    <p>Atualizado em ${formatDateTime(item.data.updatedAt)}</p>
                </div>
                <span class="list-item-badge badge-completed">Colaborador</span>
            `;
        } else {
            element.innerHTML = `
                <div class="list-item-info">
                    <h4>Inspeção: ${item.data.location}</h4>
                    <p>Atualizado em ${formatDateTime(item.data.updatedAt)}</p>
                </div>
                <span class="list-item-badge badge-pending">Inspeção</span>
            `;
        }
        
        container.appendChild(element);
    });
}

// Settings Functions
function loadSettings() {
    if (settings.companyName) document.getElementById('companyName').value = settings.companyName;
    if (settings.companyCNPJ) document.getElementById('companyCNPJ').value = settings.companyCNPJ;
    if (settings.companyAddress) document.getElementById('companyAddress').value = settings.companyAddress;
}

function saveSettings() {
    settings = {
        companyName: document.getElementById('companyName').value,
        companyCNPJ: document.getElementById('companyCNPJ').value,
        companyAddress: document.getElementById('companyAddress').value
    };
    localStorage.setItem('settings', JSON.stringify(settings));
    showNotification('Configurações salvas com sucesso!');
}

function backupData() {
    const data = {
        employees,
        inspections,
        settings,
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sst-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Backup realizado com sucesso!');
}

function restoreData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if (data.employees) employees = data.employees;
            if (data.inspections) inspections = data.inspections;
            if (data.settings) settings = data.settings;
            
            localStorage.setItem('employees', JSON.stringify(employees));
            localStorage.setItem('inspections', JSON.stringify(inspections));
            localStorage.setItem('settings', JSON.stringify(settings));
            
            updateDashboard();
            updateEmployeeTable();
            updateInspectionTable();
            loadSettings();
            showNotification('Dados restaurados com sucesso!');
        } catch (error) {
            showNotification('Erro ao restaurar dados: Arquivo inválido', 'error');
        }
    };
    reader.readAsText(file);
}

function clearAllData() {
    if (confirm('Tem certeza que deseja apagar TODOS os dados? Esta ação não pode ser desfeita!')) {
        localStorage.removeItem('employees');
        localStorage.removeItem('inspections');
        localStorage.removeItem('settings');
        
        employees = [];
        inspections = [];
        settings = {};
        
        updateDashboard();
        updateEmployeeTable();
        updateInspectionTable();
        loadSettings();
        showNotification('Todos os dados foram apagados!');
    }
}

// Report Functions
function generateEmployeeReport() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(44, 62, 80);
    doc.text('Relatório de Colaboradores', 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(127, 140, 141);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 105, 28, { align: 'center' });
    
    if (settings.companyName) {
        doc.setFontSize(12);
        doc.setTextColor(44, 62, 80);
        doc.text(settings.companyName, 105, 36, { align: 'center' });
    }
    
    // Table
    let y = 50;
    doc.setFontSize(12);
    doc.setTextColor(44, 62, 80);
    doc.text('Lista de Colaboradores', 14, y);
    y += 10;
    
    // Table headers
    doc.setFillColor(44, 62, 80);
    doc.rect(14, y, 182, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text('Nome', 16, y + 5);
    doc.text('CPF', 70, y + 5);
    doc.text('Cargo', 100, y + 5);
    doc.text('Setor', 130, y + 5);
    doc.text('Admissão', 160, y + 5);
    y += 10;
    
    // Table rows
    doc.setTextColor(0, 0, 0);
    employees.forEach((employee, index) => {
        if (y > 270) {
            doc.addPage();
            y = 20;
        }
        
        if (index % 2 === 0) {
            doc.setFillColor(236, 240, 241);
            doc.rect(14, y - 4, 182, 8, 'F');
        }
        
        doc.text(employee.name.substring(0, 25), 16, y);
        doc.text(employee.cpf, 70, y);
        doc.text(employee.position.substring(0, 15), 100, y);
        doc.text(employee.sector.substring(0, 12), 130, y);
        doc.text(formatDate(employee.admission), 160, y);
        y += 8;
    });
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(127, 140, 141);
    doc.text(`Total de colaboradores: ${employees.length}`, 14, 290);
    doc.text('Sistema SST - Segurança do Trabalho', 105, 290, { align: 'center' });
    
    doc.save(`relatorio-colaboradores-${new Date().toISOString().split('T')[0]}.pdf`);
    showNotification('Relatório de colaboradores gerado com sucesso!');
}

function exportEmployeesToExcel() {
    const data = employees.map(e => ({
        'Nome': e.name,
        'CPF': e.cpf,
        'Cargo': e.position,
        'Setor': e.sector,
        'Data de Admissão': formatDate(e.admission),
        'Telefone': e.phone || '',
        'E-mail': e.email || '',
        'Data de Nascimento': e.birthday ? formatDate(e.birthday) : '',
        'EPIs': e.ppe || '',
        'Observações': e.notes || ''
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Colaboradores');
    
    // Set column widths
    ws['!cols'] = [
        { wch: 30 }, // Nome
        { wch: 15 }, // CPF
        { wch: 20 }, // Cargo
        { wch: 15 }, // Setor
        { wch: 12 }, // Admissão
        { wch: 15 }, // Telefone
        { wch: 25 }, // E-mail
        { wch: 12 }, // Nascimento
        { wch: 25 }, // EPIs
        { wch: 30 }  // Observações
    ];
    
    XLSX.writeFile(wb, `colaboradores-${new Date().toISOString().split('T')[0]}.xlsx`);
    showNotification('Planilha de colaboradores gerada com sucesso!');
}

function generateInspectionReport() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(44, 62, 80);
    doc.text('Relatório de Inspeções', 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(127, 140, 141);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 105, 28, { align: 'center' });
    
    // Table
    let y = 45;
    doc.setFontSize(12);
    doc.setTextColor(44, 62, 80);
    doc.text('Histórico de Inspeções', 14, y);
    y += 10;
    
    // Table headers
    doc.setFillColor(44, 62, 80);
    doc.rect(14, y, 182, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text('Data', 16, y + 5);
    doc.text('Local', 40, y + 5);
    doc.text('Responsável', 90, y + 5);
    doc.text('Tipo', 130, y + 5);
    doc.text('Status', 160, y + 5);
    y += 10;
    
    // Table rows
    doc.setTextColor(0, 0, 0);
    inspections.forEach((inspection, index) => {
        if (y > 270) {
            doc.addPage();
            y = 20;
        }
        
        if (index % 2 === 0) {
            doc.setFillColor(236, 240, 241);
            doc.rect(14, y - 4, 182, 8, 'F');
        }
        
        doc.text(formatDate(inspection.date), 16, y);
        doc.text(inspection.location.substring(0, 20), 40, y);
        doc.text(inspection.responsible.substring(0, 15), 90, y);
        doc.text(inspection.type, 130, y);
        doc.text(inspection.status, 160, y);
        y += 8;
    });
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(127, 140, 141);
    doc.text(`Total de inspeções: ${inspections.length}`, 14, 290);
    doc.text('Sistema SST - Segurança do Trabalho', 105, 290, { align: 'center' });
    
    doc.save(`relatorio-inspecoes-${new Date().toISOString().split('T')[0]}.pdf`);
    showNotification('Relatório de inspeções gerado com sucesso!');
}

function generateStatsReport() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(44, 62, 80);
    doc.text('Relatório Estatístico', 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(127, 140, 141);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 105, 28, { align: 'center' });
    
    if (settings.companyName) {
        doc.setFontSize(12);
        doc.setTextColor(44, 62, 80);
        doc.text(settings.companyName, 105, 36, { align: 'center' });
    }
    
    // Stats
    let y = 55;
    doc.setFontSize(14);
    doc.setTextColor(44, 62, 80);
    doc.text('Indicadores Gerais', 14, y);
    y += 15;
    
    const stats = [
        { label: 'Total de Colaboradores', value: employees.length },
        { label: 'Total de Inspeções', value: inspections.length },
        { label: 'Inspeções Concluídas', value: inspections.filter(i => i.status === 'Concluída').length },
        { label: 'Inspeções Pendentes', value: inspections.filter(i => i.status === 'Pendente').length },
        { label: 'Taxa de Conformidade', value: `${inspections.length > 0 ? Math.round((inspections.filter(i => i.status === 'Concluída').length / inspections.length) * 100) : 0}%` }
    ];
    
    stats.forEach(stat => {
        doc.setFillColor(236, 240, 241);
        doc.rect(14, y - 4, 182, 10, 'F');
        
        doc.setFontSize(10);
        doc.setTextColor(44, 62, 80);
        doc.text(stat.label, 16, y + 3);
        
        doc.setTextColor(52, 152, 219);
        doc.text(stat.value.toString(), 180, y + 3, { align: 'right' });
        
        y += 15;
    });
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(127, 140, 141);
    doc.text('Sistema SST - Segurança do Trabalho', 105, 290, { align: 'center' });
    
    doc.save(`estatisticas-${new Date().toISOString().split('T')[0]}.pdf`);
    showNotification('Relatório estatístico gerado com sucesso!');
}

// Checklist Functions
const checklistData = {
    'NR-01': [
        'Está documentada a Política de Prevenção de Riscos?',
        'Estão identificados e avaliados os riscos existentes?',
        'Estão implementadas as medidas de prevenção?',
        'Estão definidas as responsabilidades e autoridades?',
        'Está assegurada a participação dos trabalhadores?',
        'Estão disponibilizados recursos para implementação?',
        'Estão evaluados os riscos para formulação do PPRA?',
        'Está documentado o Programa de Controle Médico?'
    ],
    'NR-04': [
        'Está nomeado o Serviço Especializado em Engenharia?',
        'Estão cadastrados os profissionais no CREA?',
        'Estão definidas as atribuições dos profissionais?',
        'Está documentada a organização do SESMT?',
        'Estão mantidos registros das atividades?'
    ],
    'NR-05': [
        'Está instalada a CIPA?',
        'Estão eleitos os representantes?',
        'Estão definidas as atribuições da CIPA?',
        'Está assegurado o treinamento dos cipeiros?',
        'Estão realizadas reuniões periódicas?',
        'Estão mantidos os registros da CIPA?'
    ],
    'NR-06': [
        'Estão identificados os riscos que exigem EPI?',
        'Estão fornecidos EPIs adequados?',
        'Estão treinados os trabalhadores sobre uso do EPI?',
        'Estão mantidos registros de fornecimento?',
        'Estão vistoriados os EPIs periodicamente?',
        'Estão substituídos EPIs danificados?'
    ],
    'NR-09': [
        'Está implementado o Programa de Prevenção de Riscos?',
        'Estão identificados os agentes nocivos?',
        'Estão realizadas avaliações ambientais?',
        'Estão implementadas medidas de controle?',
        'Estão mantidos registros de monitoramento?'
    ],
    'NR-10': [
        'Estão documentadas as instalações elétricas?',
        'Estão identificadas as zonas de perigo?',
        'Estão implementadas medidas de proteção coletiva?',
        'Estão disponibilizados EPIs específicos?',
        'Estão treinados os trabalhadores?',
        'Estão mantidos registros de intervenção?'
    ],
    'NR-12': [
        'Estão documentadas as máquinas e equipamentos?',
        'Estão implementadas proteções físicas?',
        'Estão instalados dispositivos de segurança?',
        'Estão sinalizados os pontos de perigo?',
        'Estão realizadas manutenções preventivas?',
        'Estão treinados os operadores?'
    ],
    'NR-17': [
        'Estão avaliados os postos de trabalho?',
        'Estão implementadas medidas ergonômicas?',
        'Estão alternadas as atividades?',
        'Estão respeitados os limites de peso?',
        'Estão disponibilizados equipamentos auxiliares?',
        'Estão realizados pausas periódicas?'
    ],
    'NR-18': [
        'Estão documentados os procedimentos de segurança?',
        'Estão identificados os riscos da atividade?',
        'Estão implementadas medidas de controle?',
        'Estão disponibilizados EPIs adequados?',
        'Estão treinados os trabalhadores?',
        'Estão mantidos registros de segurança?'
    ],
    'NR-23': [
        'Estão instalados sistemas de detecção de incêndio?',
        'Estão instalados sistemas de extinção?',
        'Estão sinalizadas as rotas de fuga?',
        'Estão desobstruídas as saídas de emergência?',
        'Estão realizados simulados de evacuação?',
        'Estão treinados os brigadistas?'
    ],
    'NR-24': [
        'Estão mantidas condições sanitárias adequadas?',
        'Estão disponibilizados banheiros suficientes?',
        'Estão mantidas áreas de alimentação?',
        'Estão disponíveis áreas de descanso?',
        'Estão implementadas medidas de higienização?'
    ],
    'NR-33': [
        'Estão identificados os espaços confinados?',
        'Estão documentados os procedimentos de entrada?',
        'Estão treinados os trabalhadores?',
        'Estão disponíveis equipamentos de emergência?',
        'Estão realizadas avaliações atmosféricas?',
        'Estão mantidos registros de entradas?'
    ],
    'NR-35': [
        'Estão identificadas as atividades em altura?',
        'Estão documentados os procedimentos?',
        'Estão treinados os trabalhadores?',
        'Estão disponíveis sistemas de proteção contra quedas?',
        'Estão vistoriados os equipamentos?',
        'Estão realizadas análises de risco?'
    ]
};

function initChecklist() {
    const nrSelect = document.getElementById('nrSelect');
    const startBtn = document.getElementById('startChecklistBtn');
    
    startBtn.addEventListener('click', function() {
        const nr = nrSelect.value;
        if (!nr) {
            showNotification('Selecione uma NR para iniciar o checklist', 'error');
            return;
        }
        
        generateChecklist(nr);
    });
}

function generateChecklist(nr) {
    const container = document.getElementById('checklistContainer');
    const items = checklistData[nr] || [];
    
    container.innerHTML = `
        <div class="checklist-header">
            <h3>${nr} - Checklist de Verificação</h3>
            <p>Data: ${new Date().toLocaleDateString('pt-BR')}</p>
        </div>
        <div class="checklist-items">
            ${items.map((item, index) => `
                <div class="checklist-item">
                    <input type="checkbox" id="check-${index}">
                    <label for="check-${index}">${item}</label>
                    <span class="status" id="status-${index}">Pendente</span>
                </div>
            `).join('')}
        </div>
        <div class="checklist-actions">
            <button class="btn btn-primary" onclick="saveChecklist('${nr}')">
                <i class="fas fa-save"></i> Salvar Checklist
            </button>
            <button class="btn btn-secondary" onclick="exportChecklistPDF('${nr}')">
                <i class="fas fa-file-pdf"></i> Exportar PDF
            </button>
        </div>
    `;
    
    // Add event listeners to checkboxes
    items.forEach((_, index) => {
        const checkbox = document.getElementById(`check-${index}`);
        const status = document.getElementById(`status-${index}`);
        
        checkbox.addEventListener('change', function() {
            status.textContent = this.checked ? 'Conforme' : 'Pendente';
            status.className = `status ${this.checked ? 'conforme' : ''}`;
        });
    });
}

function saveChecklist(nr) {
    const items = checklistData[nr];
    const checklist = {
        id: Date.now().toString(),
        nr: nr,
        date: new Date().toISOString(),
        items: items.map((item, index) => ({
            item: item,
            checked: document.getElementById(`check-${index}`).checked
        }))
    };
    
    const checklists = JSON.parse(localStorage.getItem('checklists')) || [];
    checklists.push(checklist);
    localStorage.setItem('checklists', JSON.stringify(checklists));
    
    showNotification('Checklist salvo com sucesso!');
}

function exportChecklistPDF(nr) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(44, 62, 80);
    doc.text(`Checklist ${nr}`, 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(127, 140, 141);
    doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 105, 28, { align: 'center' });
    
    if (settings.companyName) {
        doc.setFontSize(12);
        doc.setTextColor(44, 62, 80);
        doc.text(settings.companyName, 105, 36, { align: 'center' });
    }
    
    // Items
    let y = 55;
    const items = checklistData[nr];
    
    items.forEach((item, index) => {
        if (y > 270) {
            doc.addPage();
            y = 20;
        }
        
        const checkbox = document.getElementById(`check-${index}`);
        const isChecked = checkbox ? checkbox.checked : false;
        
        // Draw checkbox
        doc.setDrawColor(44, 62, 80);
        doc.rect(14, y - 4, 4, 4);
        
        if (isChecked) {
            doc.setFillColor(39, 174, 96);
            doc.rect(14, y - 4, 4, 4, 'F');
        }
        
        // Draw item text
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text(`${index + 1}. ${item}`, 22, y);
        
        y += 10;
    });
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(127, 140, 141);
    doc.text('Sistema SST - Segurança do Trabalho', 105, 290, { align: 'center' });
    
    doc.save(`checklist-${nr.toLowerCase().replace('-', '')}-${new Date().toISOString().split('T')[0]}.pdf`);
    showNotification(`Checklist ${nr} exportado com sucesso!`);
}

// Utility Functions
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

function formatDateTime(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR');
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Initialize forms
function initForms() {
    document.getElementById('employeeForm').addEventListener('submit', saveEmployee);
    document.getElementById('inspectionForm').addEventListener('submit', saveInspection);
    
    document.getElementById('companyName').addEventListener('change', saveSettings);
    document.getElementById('companyCNPJ').addEventListener('change', saveSettings);
    document.getElementById('companyAddress').addEventListener('change', saveSettings);
    
    initChecklist();
}

// Initialize search
function initSearch() {
    document.getElementById('employeeSearch').addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const rows = document.querySelectorAll('#employeeTableBody tr');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    });
    
    document.getElementById('inspectionSearch').addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const rows = document.querySelectorAll('#inspectionTableBody tr');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    });
}

// Add notification styles dynamically
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 5px;
        color: white;
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 2000;
        transform: translateX(120%);
        transition: transform 0.3s ease;
        box-shadow: 0 5px 20px rgba(0,0,0,0.2);
    }
    
    .notification.show {
        transform: translateX(0);
    }
    
    .notification-success {
        background: linear-gradient(135deg, #27ae60, #2ecc71);
    }
    
    .notification-error {
        background: linear-gradient(135deg, #e74c3c, #c0392b);
    }
    
    .checklist-header {
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 1px solid var(--border-color);
    }
    
    .checklist-header h3 {
        color: var(--primary-color);
        margin-bottom: 5px;
    }
    
    .checklist-header p {
        color: var(--text-light);
    }
    
    .checklist-items {
        margin-bottom: 20px;
    }
    
    .checklist-actions {
        display: flex;
        gap: 10px;
        padding-top: 20px;
        border-top: 1px solid var(--border-color);
    }
`;
document.head.appendChild(notificationStyles);