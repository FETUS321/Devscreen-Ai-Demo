document.addEventListener('DOMContentLoaded', () => {
    const user = getCurrentUser();
    if (user.role !== 'hr') {
        alert('Unauthorized access. Redirecting to login.');
        logout();
    }
    renderCandidates();
});

function renderCandidates() {
    const candidates = getCandidates();
    const tbody = document.getElementById('candidate-list');
    tbody.innerHTML = '';

    candidates.forEach(c => {
        const tr = document.createElement('tr');
        
        // Select logic for tracks
        const trackOptions = `
            <option value="fullstack" ${c.track === 'fullstack' ? 'selected' : ''}>Full Stack (All Sessions)</option>
            <option value="frontend" ${c.track === 'frontend' ? 'selected' : ''}>Frontend Only</option>
            <option value="backend" ${c.track === 'backend' ? 'selected' : ''}>Backend Only</option>
        `;

        tr.innerHTML = `
            <td style="white-space: nowrap;"><strong>${c.name}</strong><br><span style="color:#64748b; font-size:0.8rem">${c.id}</span></td>
            <td>
                <div style="display: flex; gap: 8px; align-items: center;">
                    <select id="track-${c.id}">
                        ${trackOptions}
                    </select>
                    <button class="btn-outline" onclick="updateTrack('${c.id}')">Update</button>
                    <button class="btn-action" onclick="goToAssignPage('${c.id}')">Assign Task</button>
                </div>
            </td>
            <td><span class="badge ${c.status}">${c.status}</span></td>
            <td>${c.score ? c.score : '-'}</td>
            <td>
                ${c.status === 'completed' ? `<button class="btn-outline" onclick="viewResults('${c.id}')">View Dashboard</button>` : `<button class="btn-outline" disabled>View Dashboard</button>`}
            </td>
        `;
        
        tbody.appendChild(tr);
    });
}

function updateTrack(candidateId) {
    const select = document.getElementById(`track-${candidateId}`);
    assignTrack(candidateId, select.value);
    alert(`Track for ${candidateId} updated to ${select.value}. Status reset to pending.`);
    renderCandidates();
}

// Navigate to Assign Task Page
function goToAssignPage(candidateId) {
    const select = document.getElementById(`track-${candidateId}`);
    const selectedTrack = select.value;
    
    // Auto-update track in DB before navigating
    assignTrack(candidateId, selectedTrack);
    
    // Redirect to assign page with URL parameters
    window.location.href = `assign-task.html?id=${candidateId}&track=${selectedTrack}`;
}

function viewResults(candidateId) {
    window.location.href = `candidate-evaluation.html?id=${candidateId}`;
}