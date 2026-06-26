// auth.js - Mock Database & Auth logic using localStorage

const DB_KEY = 'devscreen_db';

const initialDB = {
    users: [
        { id: 'admin', role: 'hr', name: 'HR Manager' },
        { id: 'user1', role: 'candidate', name: 'John One', track: 'fullstack', status: 'pending', score: null },
        { id: 'user2', role: 'candidate', name: 'John Two', track: 'fullstack', status: 'pending', score: null },
        { id: 'user3', role: 'candidate', name: 'John Three', track: 'fullstack', status: 'pending', score: null }
    ]
};

// Initialize DB if not exists
function initDB() {
    if (!localStorage.getItem(DB_KEY)) {
        localStorage.setItem(DB_KEY, JSON.stringify(initialDB));
    }
}

function getDB() {
    initDB();
    return JSON.parse(localStorage.getItem(DB_KEY));
}

function saveDB(data) {
    localStorage.setItem(DB_KEY, JSON.stringify(data));
}

function login(username, password) {
    const db = getDB();
    
    // Find User
    const user = db.users.find(u => u.id === username);
    
    // Simple mock authentication
    if (user && password === username) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        // Redirect based on role
        if (user.role === 'hr') {
            window.location.href = 'hr-dashboard.html';
        } else if (user.role === 'candidate') {
            window.location.href = 'candidate-dashboard.html';
        }
        return true;
    }
    
    return false;
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

function getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) {
        window.location.href = 'index.html';
        return null;
    }
    return JSON.parse(userStr);
}

// HR Specific Functions
function getCandidates() {
    const db = getDB();
    return db.users.filter(u => u.role === 'candidate');
}

function assignTrack(candidateId, trackStr) {
    const db = getDB();
    const candidate = db.users.find(u => u.id === candidateId);
    if (candidate) {
        candidate.track = trackStr;
        candidate.status = 'pending';
        candidate.score = null;
        saveDB(db);
        
        // Update current user if it's the one logged in (for testing)
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        if (currentUser.id === candidateId) {
            localStorage.setItem('currentUser', JSON.stringify(candidate));
        }
    }
}

// Candidate Specific Functions
function completeAssessment(candidateId, resultObj) {
    const db = getDB();
    const candidate = db.users.find(u => u.id === candidateId);
    if (candidate) {
        candidate.status = 'completed';
        candidate.score = resultObj.score || 'Pending Review';
        saveDB(db);
        
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        if (currentUser.id === candidateId) {
            localStorage.setItem('currentUser', JSON.stringify(candidate));
        }
    }
}

function saveTaskToCandidate(candidateId, taskContent) {
    const db = getDB();
    const candidate = db.users.find(u => u.id === candidateId);
    if (candidate) {
        candidate.task = taskContent;
        saveDB(db);
        
        // Update current user if modifying own session during test
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        if (currentUser.id === candidateId) {
            localStorage.setItem('currentUser', JSON.stringify(candidate));
        }
    }
}

// Initialize on script load
initDB();
