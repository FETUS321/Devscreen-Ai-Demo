document.addEventListener('DOMContentLoaded', () => {
    const user = getCurrentUser();
    if (user.role !== 'candidate') {
        alert('Unauthorized access. Redirecting to login.');
        logout();
    }
    
    document.getElementById('greeting').innerText = `Welcome, ${user.name}`;
    
    const card = document.getElementById('assessment-card');
    
    let trackName = 'Full Stack Engineering';
    if (user.track === 'frontend') trackName = 'Frontend Development';
    if (user.track === 'backend') trackName = 'Backend Development';

    if (user.status === 'completed') {
        card.innerHTML = `
            <h3>Assessment Completed</h3>
            <div class="badge" style="background:#dcfce7; color:#166534;">Track: ${trackName}</div>
            <p style="color: var(--muted); margin-bottom: 30px;">Thank you for completing the assessment. HR will review your submission.</p>
            <button class="btn-start" disabled>Already Submitted</button>
        `;
    } else {
        card.innerHTML = `
            <h3>Acme Corp Assessment</h3>
            <div class="badge">Track: ${trackName}</div>
            <p style="color: var(--muted); margin-bottom: 30px;">You will be evaluated based on the specific track assigned by HR. Please ensure you have a stable internet connection.</p>
            <button class="btn-start" onclick="window.location.href='session-eval.html'">Start Assessment</button>
        `;
    }
});
