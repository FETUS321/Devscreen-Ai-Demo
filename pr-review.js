let currentLine = null;

function openCommentBox(lineNumber) {
    currentLine = lineNumber;
    const box = document.getElementById('comment-box');
    document.getElementById('comment-line').innerText = lineNumber;
    
    // Move box after the clicked line (simple implementation)
    const diffBody = document.querySelector('.diff-body');
    const targetLine = document.querySelectorAll('.diff-line')[lineNumber - 12]; // adjust index based on start line
    
    // Just append it at the end of diff body for prototype simplicity
    diffBody.appendChild(box);
    box.style.display = 'block';
    document.getElementById('comment-text').focus();
}

function closeCommentBox() {
    document.getElementById('comment-box').style.display = 'none';
    document.getElementById('comment-text').value = '';
    currentLine = null;
}

function addComment() {
    const text = document.getElementById('comment-text').value.trim();
    if (!text) return;

    const line = currentLine;
    closeCommentBox();

    const threadContent = document.getElementById('thread-content');
    const emptyState = document.getElementById('empty-thread');
    if (emptyState) emptyState.style.display = 'none';

    // Create user comment
    const threadItem = document.createElement('div');
    threadItem.className = 'thread-item';
    
    threadItem.innerHTML = `
        <div class="thread-item-header">
            <span>You commented on line ${line}</span>
            <span style="color: #57606a; font-weight: normal;">Just now</span>
        </div>
        <div class="thread-item-body">
            ${text}
        </div>
        <div class="thread-reply" id="reply-container-${line}">
            <div class="reply-avatar">🤖</div>
            <div class="reply-content">
                <div class="reply-author">AI-Junior-Dev <span style="font-weight:normal; color:#57606a;">is thinking...</span></div>
            </div>
        </div>
    `;
    
    threadContent.appendChild(threadItem);

    // Simulate AI response based on line number
    setTimeout(() => {
        let aiResponse = "Good catch! I'll fix this right away.";
        
        if (line === 17) {
            aiResponse = "Oh, I see. Using string interpolation like `${username}` makes us vulnerable to SQL Injection. I should use parameterized queries instead. Thanks for pointing that out!";
        } else if (line === 21) {
            aiResponse = "You're right, hardcoding the JWT secret in the code is a huge security risk. I will move this to an environment variable. Should I also add an expiration time to the token?";
        } else {
            aiResponse = "I appreciate the review. I didn't think about that. Let me push a commit to fix this issue.";
        }

        const replyContainer = document.getElementById(`reply-container-${line}`);
        replyContainer.innerHTML = `
            <div class="reply-avatar">🤖</div>
            <div class="reply-content">
                <div class="reply-author">AI-Junior-Dev <span style="background:#0969da; color:white; padding: 2px 6px; border-radius: 10px; font-size: 0.7rem;">Author</span></div>
                <div class="reply-text">${aiResponse}</div>
            </div>
        `;
    }, 2000);
}

function submitReview() {
    alert("Review submitted! Evaluators will now analyze your ability to spot SQL Injections and Hardcoded Secrets, as well as how constructively you communicate with junior developers.");
}
