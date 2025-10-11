
const STORAGE_KEY = 'attendanceRecords';


let attendanceRecords = [];
let currentEditId = null;
let isLoading = false;


document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing Attendance Management System...');
    initializeApp();
});

function initializeApp() {

    initializeElements();
    setupEventListeners();
    loadAttendanceRecords();
    setDefaultDate();
}

function initializeElements() {

    window.elements = {

        form: document.getElementById('attendanceForm'),
        recordId: document.getElementById('recordId'),
        name: document.getElementById('name'),
        date: document.getElementById('date'),
        status: document.getElementById('status'),
        department: document.getElementById('department'),
        timeIn: document.getElementById('timeIn'),
        timeOut: document.getElementById('timeOut'),
        notes: document.getElementById('notes'),
        

        submitBtn: document.getElementById('submitBtn'),
        resetBtn: document.getElementById('resetBtn'),
        refreshBtn: document.getElementById('refreshBtn'),
        clearFilters: document.getElementById('clearFilters'),
        exportBtn: document.getElementById('exportBtn'),
        markAllPresentBtn: document.getElementById('markAllPresentBtn'),
        clearAllBtn: document.getElementById('clearAllBtn'),
        

        tableBody: document.getElementById('attendanceTableBody'),
        notification: document.getElementById('notification'),
        loadingState: document.getElementById('loadingState'),
        emptyState: document.getElementById('emptyState'),
        tableContainer: document.getElementById('tableContainer'),
        

        totalRecords: document.getElementById('totalRecords'),
        presentRecords: document.getElementById('presentRecords'),
        absentRecords: document.getElementById('absentRecords'),
        

        filterDate: document.getElementById('filterDate'),
        filterStatus: document.getElementById('filterStatus'),
        filterDepartment: document.getElementById('filterDepartment'),
        

        dataStatus: document.getElementById('dataStatus'),
        formTitleText: document.getElementById('form-title-text')
    };
}

function setupEventListeners() {
    const elements = window.elements;
    
    if (elements.form) {
        elements.form.addEventListener('submit', handleFormSubmit);
    }
    
    if (elements.resetBtn) {
        elements.resetBtn.addEventListener('click', clearForm);
    }
    
    if (elements.refreshBtn) {
        elements.refreshBtn.addEventListener('click', loadAttendanceRecords);
    }
    
    if (elements.clearFilters) {
        elements.clearFilters.addEventListener('click', clearFilters);
    }
    
    if (elements.exportBtn) {
        elements.exportBtn.addEventListener('click', exportToCSV);
    }
    
    if (elements.markAllPresentBtn) {
        elements.markAllPresentBtn.addEventListener('click', markAllPresent);
    }
    
    if (elements.clearAllBtn) {
        elements.clearAllBtn.addEventListener('click', clearAllRecords);
    }
    
    // Filter event listeners
    if (elements.filterDate) {
        elements.filterDate.addEventListener('change', applyFilters);
    }
    
    if (elements.filterStatus) {
        elements.filterStatus.addEventListener('change', applyFilters);
    }
    
    if (elements.filterDepartment) {
        elements.filterDepartment.addEventListener('input', applyFilters);
    }
    
    // Real-time validation
    if (elements.name) {
        elements.name.addEventListener('input', validateName);
    }
}

// === HELPER FUNCTIONS ===
function showNotification(message, type = 'info') {
    const elements = window.elements;
    if (!elements.notification) return;
    
    elements.notification.textContent = message;
    elements.notification.className = `notification ${type}`;
    elements.notification.style.display = 'block';
    
    if (type === 'success' || type === 'info') {
        setTimeout(() => {
            elements.notification.style.display = 'none';
        }, 3000);
    }
}

function setLoading(isLoadingState) {
    isLoading = isLoadingState;
    const elements = window.elements;
    
    if (elements.loadingState) {
        elements.loadingState.style.display = isLoadingState ? 'flex' : 'none';
    }
    
    if (elements.refreshBtn) {
        elements.refreshBtn.disabled = isLoadingState;
        elements.refreshBtn.innerHTML = isLoadingState 
            ? '<i class="fas fa-spinner fa-spin"></i> Loading...' 
            : '<i class="fas fa-sync"></i> Refresh List';
    }
}

function clearForm() {
    const elements = window.elements;
    if (!elements.form) return;
    
    elements.form.reset();
    elements.recordId.value = '';
    setDefaultDate();
    
    if (elements.submitBtn) {
        elements.submitBtn.innerHTML = '<i class="fas fa-plus"></i> Add Record';
        elements.submitBtn.className = 'btn btn-primary';
    }
    
    if (elements.formTitleText) {
        elements.formTitleText.textContent = 'Add Attendance Record';
    }
    
    const nameError = document.getElementById('name-error');
    if (nameError) {
        nameError.textContent = '';
    }
    
    if (elements.name) {
        elements.name.focus();
    }
    
    currentEditId = null;
    showNotification('Form cleared', 'info');
}

function setDefaultDate() {
    const elements = window.elements;
    if (elements.date) {
        const today = new Date().toISOString().split('T')[0];
        elements.date.value = today;
    }
}

function validateName() {
    const elements = window.elements;
    const nameError = document.getElementById('name-error');
    if (!nameError) return;
    
    const name = elements.name.value.trim();
    if (!name) {
        nameError.textContent = 'Name is required';
        elements.name.classList.add('error');
    } else if (name.length < 2) {
        nameError.textContent = 'Name must be at least 2 characters long';
        elements.name.classList.add('error');
    } else {
        nameError.textContent = '';
        elements.name.classList.remove('error');
    }
}

function updateStats(records) {
    const elements = window.elements;
    if (!elements.totalRecords) return;
    
    const total = records.length;
    const present = records.filter(record => record.status === 'Present').length;
    const absent = records.filter(record => record.status === 'Absent').length;
    
    elements.totalRecords.textContent = total;
    elements.presentRecords.textContent = present;
    elements.absentRecords.textContent = absent;
}

function showEmptyState(show) {
    const elements = window.elements;
    if (!elements.emptyState) return;
    
    if (show) {
        elements.emptyState.style.display = 'flex';
        if (elements.tableContainer) {
            elements.tableContainer.style.display = 'none';
        }
    } else {
        elements.emptyState.style.display = 'none';
        if (elements.tableContainer) {
            elements.tableContainer.style.display = 'block';
        }
    }
}

function updateDataStatus() {
    const elements = window.elements;
    if (!elements.dataStatus) return;
    
    const total = attendanceRecords.length;
    if (total === 0) {
        elements.dataStatus.innerHTML = '<i class="fas fa-circle"></i> No Records';
        elements.dataStatus.className = 'status-indicator';
    } else {
        elements.dataStatus.innerHTML = `<i class="fas fa-circle"></i> ${total} Records`;
        elements.dataStatus.className = 'status-indicator connected';
    }
}

// === DATA PERSISTENCE ===
function saveToLocalStorage() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(attendanceRecords));
        updateDataStatus();
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        showNotification('Error saving data', 'error');
    }
}

function loadFromLocalStorage() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            attendanceRecords = JSON.parse(stored);
            updateDataStatus();
            return true;
        }
    } catch (error) {
        console.error('Error loading from localStorage:', error);
        showNotification('Error loading data', 'error');
    }
    return false;
}


function handleFormSubmit(event) {
    event.preventDefault();
    const elements = window.elements;
    

    const name = elements.name.value.trim();
    const date = elements.date.value;
    const status = elements.status.value;
    
    if (!name) {
        showNotification('Name is required!', 'error');
        elements.name.focus();
        return;
    }
    
    if (!date) {
        showNotification('Date is required!', 'error');
        elements.date.focus();
        return;
    }
    
    if (!status) {
        showNotification('Status is required!', 'error');
        elements.status.focus();
        return;
    }
    
    const recordData = {
        id: currentEditId || Date.now().toString(),
        name: name,
        date: date,
        status: status,
        department: elements.department.value.trim(),
        timeIn: elements.timeIn.value,
        timeOut: elements.timeOut.value,
        notes: elements.notes.value.trim(),
        createdAt: currentEditId ? undefined : new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    if (currentEditId) {
        updateAttendanceRecord(recordData);
    } else {
        addAttendanceRecord(recordData);
    }
}

function addAttendanceRecord(recordData) {
    attendanceRecords.unshift(recordData); // Add to beginning
    saveToLocalStorage();
    renderAttendanceRecords();
    clearForm();
    showNotification('Attendance record added successfully!', 'success');
}

function updateAttendanceRecord(recordData) {
    const index = attendanceRecords.findIndex(record => record.id === currentEditId);
    if (index !== -1) {

        recordData.createdAt = attendanceRecords[index].createdAt;
        attendanceRecords[index] = recordData;
        saveToLocalStorage();
        renderAttendanceRecords();
        clearForm();
        showNotification('Attendance record updated successfully!', 'success');
    }
}

function deleteAttendanceRecord(id) {
    const record = attendanceRecords.find(record => record.id === id);
    if (!record) return;
    
    if (!confirm(`Are you sure you want to delete ${record.name}'s attendance record?`)) {
        return;
    }
    
    attendanceRecords = attendanceRecords.filter(record => record.id !== id);
    saveToLocalStorage();
    renderAttendanceRecords();
    showNotification('Attendance record deleted successfully!', 'success');
}

function editAttendanceRecord(id) {
    const record = attendanceRecords.find(record => record.id === id);
    if (!record) return;
    
    const elements = window.elements;
    elements.recordId.value = record.id;
    elements.name.value = record.name;
    elements.date.value = record.date;
    elements.status.value = record.status;
    elements.department.value = record.department || '';
    elements.timeIn.value = record.timeIn || '';
    elements.timeOut.value = record.timeOut || '';
    elements.notes.value = record.notes || '';
    
    if (elements.submitBtn) {
        elements.submitBtn.innerHTML = '<i class="fas fa-save"></i> Update Record';
        elements.submitBtn.className = 'btn btn-warning';
    }
    
    if (elements.formTitleText) {
        elements.formTitleText.textContent = 'Edit Attendance Record';
    }
    
    currentEditId = id;
    showNotification(`Editing: ${record.name}`, 'info');
    
    // Scroll to form
    document.querySelector('.form-card').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
    elements.name.focus();
}


function loadAttendanceRecords() {
    setLoading(true);
    

    setTimeout(() => {
        loadFromLocalStorage();
        renderAttendanceRecords();
        setLoading(false);
    }, 500);
}

function renderAttendanceRecords() {
    const elements = window.elements;
    if (!elements.tableBody) return;
    
    const filteredRecords = getFilteredRecords();
    elements.tableBody.innerHTML = '';
    
    if (filteredRecords.length === 0) {
        showEmptyState(true);
        updateStats([]);
        return;
    }
    
    showEmptyState(false);
    updateStats(filteredRecords);
    
    // Sort by date (newest first)
    const sortedRecords = [...filteredRecords].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
    );
    
    sortedRecords.forEach(record => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="record-name">${escapeHtml(record.name)}</div>
            </td>
            <td>
                <div class="record-date">${formatDate(record.date)}</div>
            </td>
            <td>
                <span class="status-badge status-${record.status}">
                    <i class="fas ${getStatusIcon(record.status)}"></i>
                    ${record.status}
                </span>
            </td>
            <td>
                <div class="record-department">${escapeHtml(record.department || 'N/A')}</div>
            </td>
            <td>
                <div class="record-time">
                    ${record.timeIn ? record.timeIn : '--:--'} 
                    ${record.timeOut ? `- ${record.timeOut}` : ''}
                </div>
            </td>
            <td>
                <div class="record-notes">${escapeHtml(record.notes || 'No notes')}</div>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-warning btn-sm" onclick="editAttendanceRecord('${record.id}')" 
                            title="Edit record">
                        <i class="fas fa-edit"></i>
                        Edit
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteAttendanceRecord('${record.id}')" 
                            title="Delete record">
                        <i class="fas fa-trash"></i>
                        Delete
                    </button>
                </div>
            </td>
        `;
        elements.tableBody.appendChild(row);
    });
}


function getFilteredRecords() {
    const elements = window.elements;
    let filtered = [...attendanceRecords];
    
    if (elements.filterDate && elements.filterDate.value) {
        filtered = filtered.filter(record => record.date === elements.filterDate.value);
    }
    
    if (elements.filterStatus && elements.filterStatus.value) {
        filtered = filtered.filter(record => record.status === elements.filterStatus.value);
    }
    
    if (elements.filterDepartment && elements.filterDepartment.value) {
        const searchTerm = elements.filterDepartment.value.toLowerCase();
        filtered = filtered.filter(record => 
            record.department && record.department.toLowerCase().includes(searchTerm)
        );
    }
    
    return filtered;
}

function applyFilters() {
    renderAttendanceRecords();
}

function clearFilters() {
    const elements = window.elements;
    if (elements.filterDate) elements.filterDate.value = '';
    if (elements.filterStatus) elements.filterStatus.value = '';
    if (elements.filterDepartment) elements.filterDepartment.value = '';
    renderAttendanceRecords();
    showNotification('Filters cleared', 'info');
}


function markAllPresent() {
    if (attendanceRecords.length === 0) {
        showNotification('No records to update', 'info');
        return;
    }
    
    if (!confirm('Mark all records as Present?')) return;
    
    attendanceRecords.forEach(record => {
        record.status = 'Present';
        record.updatedAt = new Date().toISOString();
    });
    
    saveToLocalStorage();
    renderAttendanceRecords();
    showNotification('All records marked as Present', 'success');
}

function clearAllRecords() {
    if (attendanceRecords.length === 0) {
        showNotification('No records to clear', 'info');
        return;
    }
    
    if (!confirm('Are you sure you want to delete ALL attendance records? This action cannot be undone.')) {
        return;
    }
    
    attendanceRecords = [];
    saveToLocalStorage();
    renderAttendanceRecords();
    showNotification('All records cleared', 'success');
}

function exportToCSV() {
    if (attendanceRecords.length === 0) {
        showNotification('No records to export', 'info');
        return;
    }
    
    const headers = ['Name', 'Date', 'Status', 'Class/Department', 'Time In', 'Time Out', 'Notes'];
    const csvData = attendanceRecords.map(record => [
        `"${record.name}"`,
        record.date,
        record.status,
        `"${record.department || ''}"`,
        record.timeIn || '',
        record.timeOut || '',
        `"${record.notes || ''}"`
    ]);
    
    const csvContent = [headers, ...csvData]
        .map(row => row.join(','))
        .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `attendance-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    
    showNotification(`Exported ${attendanceRecords.length} records to CSV`, 'success');
}


function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function getStatusIcon(status) {
    const icons = {
        'Present': 'fa-check-circle',
        'Absent': 'fa-times-circle',
        'Late': 'fa-clock',
        'Excused': 'fa-user-clock',
        'Half-day': 'fa-business-time'
    };
    return icons[status] || 'fa-circle';
}

function escapeHtml(unsafe) {
    if (unsafe === null || unsafe === undefined) return '';
    return unsafe.toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


window.editAttendanceRecord = editAttendanceRecord;
window.deleteAttendanceRecord = deleteAttendanceRecord;