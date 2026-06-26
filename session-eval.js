let codeFiles = {
    'index.html': `<!-- HTML Layout Structures -->\n<div class="app-card">\n  <h1>DevScreen Dynamic Canvas</h1>\n  <p>This editor workspace is unlocked and fully editable.</p>\n  <button id="alert-btn">Click Test Trigger</button>\n</div>`,
    'style.css': `/* Styling configurations */\nbody {\n  background: #f0f4f8;\n  padding: 20px;\n  font-family: system-ui, sans-serif;\n}\n.app-card {\n  background: white;\n  padding: 24px;\n  border-radius: 8px;\n  box-shadow: 0 4px 12px rgba(0,0,0,0.05);\n  text-align: center;\n}`,
    'script.js': `// Vanilla JavaScript interaction controls\nconst myButton = document.getElementById('alert-btn');\nif(myButton) {\n  myButton.addEventListener('click', () => {\n    alert('Script context evaluated successfully inside the live view container!');\n  });\n}`,
    'component.ts': `// TypeScript Component Definition Module\nexport interface CandidateProfile {\n    username: string;\n    activeSession: number;\n    isCodeValid: boolean;\n}`,
    'query.sql': `-- SQL Queries Execution\nSELECT * FROM system_logs ORDER BY created_at DESC;`
};

let activeFileName = 'index.html';
let monacoEditorInstance = null;
let liveRenderTimeout;
let behavioralData = []; 

// AI Configuration (Mock)
const isDemoMode = true;

let chatHistory = [
    {
        role: "user",
        parts: [{ text: "You are an elite 'AI Tech Lead' mentor on DevScreen Enterprise evaluating a developer candidate. You must adapt and respond in the EXACT SAME LANGUAGE the user speaks to you (e.g., if they ask in Thai, reply in Thai. If in English, reply in English). Core Rule: Never write full code solutions. Instead, provide small partial scaffolding, templates, or incomplete snippets with '// TODO:' comments to let them figure out the rest. Guide them step-by-step, give conceptual hints, and always end your reply by asking what specific part they need guidance on or how they plan to solve the next sub-task to encourage critical thinking." }]
    },
    {
        role: "model",
        parts: [{ text: "Understood. I will respond in the language used by the candidate. I will act as a technical mentor providing partial scaffolding, incomplete configurations with TODO comments, and conceptual guidance. I will always conclude by opening up interactive questions to encourage them to solve the core parts independently." }]
    }
];

document.addEventListener('DOMContentLoaded', () => {
    initBehaviorTracking();
    initMonacoEnvironment();
    initChatEventListeners(); 
});

function initChatEventListeners() {
    const userInput = document.getElementById('user-input');
    if (userInput) {
        userInput.addEventListener('keydown', function(event) {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault(); 
                sendMessage(); 
            }
        });
    }
}

function initMonacoEnvironment() {
    if (monacoEditorInstance) return;
    
    require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.39.0/min/vs' } });
    require(['vs/editor/editor.main'], function() {
        monacoEditorInstance = monaco.editor.create(document.getElementById('monaco-container'), {
            value: codeFiles[activeFileName],
            language: 'html',
            theme: 'vs-dark',
            automaticLayout: true,
            fontSize: 14,
            readOnly: false,
            minimap: { enabled: false }
        });

        monacoEditorInstance.onDidChangeModelContent(() => {
            clearTimeout(liveRenderTimeout);
            liveRenderTimeout = setTimeout(updateLivePreview, 400);
        });

        window.monacoEditorInstance = monacoEditorInstance;
        updateLivePreview();
    });
}

function switchWorkspaceFile(fileName) {
    if (!monacoEditorInstance) return;

    codeFiles[activeFileName] = monacoEditorInstance.getValue();
    activeFileName = fileName;
    monacoEditorInstance.setValue(codeFiles[fileName]);

    let targetLang = 'html';
    if (fileName.endsWith('.css')) targetLang = 'css';
    if (fileName.endsWith('.js')) targetLang = 'javascript';
    if (fileName.endsWith('.ts')) targetLang = 'typescript';
    if (fileName.endsWith('.sql')) targetLang = 'sql';
    
    monaco.editor.setModelLanguage(monacoEditorInstance.getModel(), targetLang);

    document.querySelectorAll('.file-tab-btn').forEach(btn => btn.classList.remove('active'));
    const targetElementId = `tab-${fileName.replace('.', '-')}`;
    const targetTabElement = document.getElementById(targetElementId);
    if(targetTabElement) targetTabElement.classList.add('active');
}

function updateLivePreview() {
    if (!monacoEditorInstance) return;

    codeFiles[activeFileName] = monacoEditorInstance.getValue();
    const previewIframe = document.getElementById('web-preview-iframe');
    if (!previewIframe) return;

    const fullyCompiledPage = `
        ${codeFiles['index.html']}
        <style>${codeFiles['style.css']}</style>
        <script>
            try {
                ${codeFiles['script.js']}
            } catch (err) {
                console.error("JS Error in preview: ", err);
            }
        <\/script>
    `;

    const destDoc = previewIframe.contentDocument || previewIframe.contentWindow.document;
    destDoc.open();
    destDoc.write(fullyCompiledPage);
    destDoc.close();
}

async function fetchGeminiResponse(userMessage) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    chatHistory.push({
        role: "user",
        parts: [{ text: userMessage }]
    });

    const lowerMsg = userMessage.toLowerCase();
    let aiText = "That's an interesting approach. How would you handle potential edge cases with that design?";

    if (lowerMsg.includes("hello") || lowerMsg.includes("hi")) {
        aiText = "Hello! Let's get started. What's your initial plan for the system architecture?";
    } else if (lowerMsg.includes("database") || lowerMsg.includes("sql")) {
        aiText = "For the database, consider normalization. Have you thought about how to index the frequently queried columns?";
    } else if (lowerMsg.includes("react") || lowerMsg.includes("frontend")) {
        aiText = "On the frontend, state management will be crucial. What library or pattern do you plan to use for global state?";
    } else if (lowerMsg.includes("api") || lowerMsg.includes("rest")) {
        aiText = "Make sure your API endpoints are RESTful. How do you plan to handle authentication and rate limiting?";
    } else if (lowerMsg.includes("help") || lowerMsg.includes("stuck")) {
        aiText = "I can guide you. Try breaking down the problem. What is the very first step you need to execute?";
    }

    chatHistory.push({
        role: "model",
        parts: [{ text: aiText }]
    });

    return aiText;
}

async function sendMessage() {
    const input = document.getElementById('user-input');
    const msgText = input.value.trim();
    if (!msgText) return;

    const chatBox = document.getElementById('chat-box');
    const userDiv = document.createElement('div');
    userDiv.className = 'message user';
    userDiv.innerHTML = `<strong>You:</strong> ${msgText}`;
    chatBox.appendChild(userDiv);
    
    input.value = '';
    chatBox.scrollTop = chatBox.scrollHeight;

    if (window.currentStep === 1 && (msgText.toLowerCase().includes('function') || msgText.toLowerCase().includes('const') || msgText.toLowerCase().includes('select'))) {
        const promptGuard = document.querySelector('.prompt-guard');
        if(promptGuard) {
            promptGuard.className = 'badge prompt-guard alert';
            promptGuard.innerText = 'Guardrail Triggered';
        }
        
        const warningMsg = document.createElement('div');
        warningMsg.className = 'message warning';
        warningMsg.innerHTML = `⚠️ <strong>Out of Bounds:</strong> We are in the System Design phase. Focus on discussing architecture instead of typing code.`;
        chatBox.appendChild(warningMsg);
        
        setTimeout(() => {
            if(promptGuard) {
                promptGuard.className = 'badge prompt-guard';
                promptGuard.innerText = 'Prompt Guard: ON';
            }
        }, 3000);
        return;
    }

    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message ai';
    loadingDiv.id = 'ai-loading';
    loadingDiv.innerHTML = `<strong>AI Lead:</strong> Typing...`;
    chatBox.appendChild(loadingDiv);
    chatBox.scrollTop = chatBox.scrollHeight;

    const aiResponse = await fetchGeminiResponse(msgText);

    const loadingEl = document.getElementById('ai-loading');
    if (loadingEl) loadingEl.remove();

    const aiDiv = document.createElement('div');
    aiDiv.className = 'message ai';
    aiDiv.innerHTML = `<strong>AI Lead:</strong> ${aiResponse}`;
    chatBox.appendChild(aiDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function initBehaviorTracking() {
    document.addEventListener('visibilitychange', () => {
        const state = document.visibilityState === 'visible' ? 'focus_in' : 'focus_out';
        behavioralData.push({ type: 'tab_switch', action: state, time: Date.now() });
    });

    document.addEventListener('paste', (event) => {
        let pasteData = (event.clipboardData || window.clipboardData).getData('text');
        behavioralData.push({ type: 'paste', length: pasteData.length, time: Date.now() });
    });

    setInterval(() => {
        if (behavioralData.length > 0) {
            console.log("📤 [Telemetry] Logs dispatched", behavioralData);
            behavioralData = [];
        }
    }, 10000);
}