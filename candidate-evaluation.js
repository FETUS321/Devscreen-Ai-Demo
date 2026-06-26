document.addEventListener('DOMContentLoaded', () => {
    // Check auth
    const user = getCurrentUser();
    if (user.role !== 'hr') {
        alert('Unauthorized access. Redirecting to login.');
        logout();
        return;
    }

    // Parse URL parameter
    const params = new URLSearchParams(window.location.search);
    const candidateId = params.get('id');
    
    if (!candidateId) {
        alert("Candidate ID not provided");
        window.location.href = 'hr-dashboard.html';
        return;
    }

    const candidates = getCandidates();
    const c = candidates.find(x => x.id === candidateId);
    
    if (!c) {
        alert("Candidate not found");
        window.location.href = 'hr-dashboard.html';
        return;
    }

    // Populate data
    document.getElementById('c-name').innerText = c.name;
    document.getElementById('c-avatar').innerText = c.name.charAt(0).toUpperCase();
    
    // Status Badge
    const statusBadge = document.getElementById('c-status');
    statusBadge.innerText = c.status === 'completed' ? 'Evaluation Complete' : 'Evaluating';
    if(c.status !== 'completed') {
        statusBadge.style.background = '#fef3c7'; // warning yellow
        statusBadge.style.color = '#92400e';
    }

    // Determine mock scores based on track
    let overall = 0;
    let probScore = 0;
    let codeScore = 0;
    let techScore = 0;
    let radarData = [];
    
    let tagsHTML = '';
    
    if (c.track === 'frontend') {
        overall = 8.9; probScore = 9.2; codeScore = 8.7; techScore = 8.5;
        radarData = [95, 40, 85, 90, 80]; // Frontend, Backend, Architecture, Soft Skills, Tools
        tagsHTML = '<span class="skill-tag">React</span><span class="skill-tag">Next.js</span><span class="skill-tag">TS</span>';
        document.getElementById('c-role').innerText = 'Applied: Senior Frontend Engineer';
    } else if (c.track === 'backend') {
        overall = 8.7; probScore = 8.9; codeScore = 9.1; techScore = 8.8;
        radarData = [30, 95, 90, 80, 85];
        tagsHTML = '<span class="skill-tag">Node.js</span><span class="skill-tag">SQL</span><span class="skill-tag">Docker</span>';
        document.getElementById('c-role').innerText = 'Applied: Backend Engineer';
    } else {
        overall = 8.8; probScore = 9.0; codeScore = 8.9; techScore = 8.7;
        radarData = [80, 80, 85, 85, 85];
        tagsHTML = '<span class="skill-tag">React</span><span class="skill-tag">Node.js</span><span class="skill-tag">System Design</span>';
        document.getElementById('c-role').innerText = 'Applied: Fullstack Engineer';
    }

    document.getElementById('c-overall').innerText = overall.toFixed(1);
    document.getElementById('c-track-tags').innerHTML = tagsHTML;
    
    document.getElementById('score-problem').innerText = probScore.toFixed(1);
    document.getElementById('score-code').innerText = codeScore.toFixed(1);
    document.getElementById('score-tech').innerText = techScore.toFixed(1);

    // Doughnut Chart (Problem Solving)
    const ctxDoughnut = document.getElementById('chartDoughnut').getContext('2d');
    const doughnutPerc = Math.round((probScore / 10) * 100);
    document.getElementById('doughnut-perc').innerText = doughnutPerc + '%';
    
    new Chart(ctxDoughnut, {
        type: 'doughnut',
        data: {
            labels: ['Logic', 'Data Structures', 'Complexity', 'Algorithms', 'Empty'],
            datasets: [{
                data: [30, 25, 20, doughnutPerc - 75, 100 - doughnutPerc],
                backgroundColor: ['#2563eb', '#3b82f6', '#10b981', '#f59e0b', '#f1f5f9'],
                borderWidth: 0
            }]
        },
        options: { 
            responsive: true, 
            maintainAspectRatio: false, 
            cutout: '75%',
            plugins: { legend: { display: false }, tooltip: { filter: function(item) { return item.label !== 'Empty'; } } },
            rotation: 180
        }
    });

    // Radar Chart (Key Skills)
    const ctxRadar = document.getElementById('chartRadar').getContext('2d');
    new Chart(ctxRadar, {
        type: 'radar',
        data: {
            labels: ['Frontend', 'Backend', 'Architecture', 'Soft Skills', 'Tools'],
            datasets: [{
                label: 'Score',
                data: radarData,
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                borderColor: 'rgba(16, 185, 129, 1)',
                pointBackgroundColor: 'rgba(16, 185, 129, 1)',
                borderWidth: 2
            }]
        },
        options: { 
            responsive: true, 
            maintainAspectRatio: false, 
            scales: { r: { beginAtZero: true, max: 100, ticks: { display: false } } },
            plugins: { legend: { display: false } }
        }
    });

    // Populate Code Review Bars
    const codeScores = [
        { label: 'Clarity', val: 90, color: '#2563eb' },
        { label: 'Correctness', val: 88, color: '#10b981' },
        { label: 'Best Practices', val: 85, color: '#64748b' },
        { label: 'Maintainability', val: 87, color: '#64748b' },
        { label: 'Feedback Quality', val: 86, color: '#64748b' }
    ];
    let codeHtml = '';
    codeScores.forEach(s => {
        codeHtml += `
            <div class="progress-item">
                <span class="progress-label">${s.label}</span>
                <div class="progress-bar-bg"><div class="progress-bar-fill" style="width:${s.val}%;background:${s.color};"></div></div>
                <span class="progress-score">${s.val}%</span>
            </div>
        `;
    });
    document.getElementById('code-bars').innerHTML = codeHtml;
    
    // Populate Tech Interview List
    const techScores = [
        { label: 'JS/TS', val: 9.0 },
        { label: 'React', val: 8.5 },
        { label: 'Architecture', val: 8.0 }
    ];
    let techHtml = '';
    techScores.forEach(s => {
        techHtml += `
            <div class="progress-item" style="margin-bottom:8px">
                <span style="font-size:0.95rem; font-weight:normal; color:#0f172a">${s.label}</span>
                <span style="font-weight:700">${s.val.toFixed(1)}</span>
            </div>
        `;
    });
    document.getElementById('tech-list').innerHTML = techHtml;

    // Populate Research References
    const researchData = {
        frontend: [
            {
                title: "Measuring the User Experience on the Web (Core Web Vitals)",
                source: "Google Chrome / W3C",
                desc: "Criteria for evaluating frontend candidates includes practical knowledge of Web Vitals (LCP, FID/INP, CLS) to ensure candidates build highly performant, user-centric web applications.",
                link: "https://web.dev/articles/vitals"
            },
            {
                title: "Component-Based Architecture and State Management",
                source: "Software Engineering Institute (SEI)",
                desc: "Evaluates the candidate's structural decisions in single-page applications, focusing on decoupling UI components and managing complex application state effectively.",
                link: "https://resources.sei.cmu.edu/"
            },
            {
                title: "Accessibility in Modern Web Applications",
                source: "Web Content Accessibility Guidelines (WCAG) 2.2",
                desc: "Assesses the candidate's adherence to semantic HTML and ARIA standards, which research shows is a strong predictor of mature frontend engineering skills.",
                link: "https://www.w3.org/WAI/standards-guidelines/wcag/"
            }
        ],
        backend: [
            {
                title: "Designing Data-Intensive Applications",
                source: "Kleppmann, M. (O'Reilly Media)",
                desc: "Used as a benchmark for evaluating a candidate's grasp on database optimization, consistency, replication, and distributed system design.",
                link: "https://dataintensive.net/"
            },
            {
                title: "Scalability Metrics in Microservices Architectures",
                source: "IEEE Transactions on Software Engineering",
                desc: "Provides criteria for assessing backend developers on their ability to design decoupled APIs, manage service orchestration, and handle high-throughput concurrency.",
                link: "https://ieeexplore.ieee.org/"
            },
            {
                title: "Security Best Practices in Web APIs",
                source: "OWASP Top 10 API Security Risks",
                desc: "An essential evaluation vector measuring the candidate's proactive defensive coding habits, covering authorization, authentication, and data validation.",
                link: "https://owasp.org/API-Security/editions/2023/en/0x11-t10/"
            }
        ],
        fullstack: [
            {
                title: "The Validity and Utility of Selection Methods (Work Samples)",
                source: "Journal of Applied Psychology",
                desc: "Research confirms that holistic, project-based evaluations (work samples) are much stronger predictors of full-stack performance than isolated LeetCode-style puzzles.",
                link: "https://psycnet.apa.org/record/1998-10661-001"
            },
            {
                title: "The Role of Full-Stack Developers in Agile Teams",
                source: "ACM Digital Library",
                desc: "Evaluates candidates on end-to-end delivery capabilities, including bridging the gap between database schema design and frontend state rendering.",
                link: "https://dl.acm.org/"
            },
            {
                title: "Modern CI/CD and DevOps Culture",
                source: "DORA (DevOps Research and Assessment)",
                desc: "Criteria includes the candidate's understanding of deployment pipelines and infrastructure-as-code, which correlates with elite engineering team performance.",
                link: "https://dora.dev/"
            }
        ]
    };

    const trackKey = c.track || 'fullstack';
    const trackResearch = researchData[trackKey] || researchData['fullstack'];
    
    let researchHtml = '';
    trackResearch.forEach(r => {
        researchHtml += `
            <div style="border-left: 3px solid var(--primary); padding-left: 16px; background: #f8fafc; padding: 12px 16px 12px 16px; border-radius: 0 8px 8px 0;">
                <h4 style="font-size: 0.95rem; color: var(--text); margin-bottom: 4px;">
                    <a href="${r.link}" target="_blank" style="color: var(--primary); text-decoration: none;">${r.title} <span style="font-size: 0.8rem;">↗</span></a>
                </h4>
                <div style="font-size: 0.8rem; color: var(--info); font-weight: 600; margin-bottom: 8px;">Source: ${r.source}</div>
                <p style="font-size: 0.85rem; color: var(--text-light); line-height: 1.5; margin-bottom: 8px;">${r.desc}</p>
                <a href="${r.link}" target="_blank" style="font-size: 0.8rem; font-weight: 600; color: var(--primary); text-decoration: underline;">Read Full Research</a>
            </div>
        `;
    });
    
    // Add link to all research
    researchHtml += `
        <div style="margin-top: 10px; text-align: center;">
            <a href="research-references.html" style="font-size: 0.9rem; font-weight: 600; color: var(--primary); text-decoration: none; padding: 8px 16px; border: 1px solid var(--primary); border-radius: 6px; display: inline-block;"> View All Assessment Research</a>
        </div>
    `;
    
    const researchContainer = document.getElementById('research-content');
    if (researchContainer) {
        researchContainer.innerHTML = researchHtml;
    }
});
