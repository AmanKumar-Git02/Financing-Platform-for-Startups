const API_BASE_URL = "http://localhost:5000/api/startups";

async function init() {
    // 1. Get the ID from storage, default to 'guest' if not logged in
    const investorId = localStorage.getItem('investorId') || 'guest';
    const investorName = localStorage.getItem('investorName');

    updateNavBar(investorName);
    
    // 2. Pass the ID to both functions
    await fetchAllStartups(investorId);
    await fetchNewStartups(investorId);
}

function updateNavBar(name) {
    const userDisplay = document.getElementById('user-display');
    const navButtons = document.querySelectorAll('.nav-btn');

    if (name && name !== "undefined") {
        navButtons.forEach(btn => btn.style.display = 'none');
        userDisplay.style.display = 'block';
        userDisplay.innerHTML = `Welcome, <span style="color:#58a6ff">${name}</span> 
                                 <button onclick="logout()" class="logout-link" style="background:none; border:none; color:red; cursor:pointer;">[Logout]</button>`;
    } else {
        navButtons.forEach(btn => btn.style.display = 'inline-block');
        userDisplay.style.display = 'none';
    }
}

function logout() {
    localStorage.clear();
    window.location.reload();
}

// SECTION 1: Updated to include the Interested Button
async function fetchAllStartups(id) {
    const container = document.getElementById('all-startups-grid');
    const url = id === 'guest' ? `${API_BASE_URL}/all/guest` : `${API_BASE_URL}/all/${id}`;
    
    try {
        const res = await fetch(url);
        const data = await res.json();
        
        container.innerHTML = data.map(startup => `
            <div class="startup-card">
                <div class="match-badge">${startup.matchScore}% Match</div>
                <h3>${startup.name}</h3>
                <p style="color: #8b949e">${startup.industry}</p>
                <p>${startup.description || 'No description provided.'}</p>
                
                <button onclick="expressInterest('${startup._id}')" class="interest-btn">
                    I'm Interested
                </button>

                <div style="font-size: 0.7rem; color: #58a6ff; margin-top: 10px;">
                    Algorithm: ${startup.logicTag}
                </div>
            </div>
        `).join('');
    } catch (err) {
        container.innerHTML = `<p style="color: red">Error loading verified startups.</p>`;
    }
}

// THE ACTION: This function calls the PATCH route we added to server.js
async function expressInterest(startupId) {
    try {
        const response = await fetch(`http://localhost:5000/api/startups/interest/${startupId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
            const result = await response.json();
            alert("Interest recorded! This startup's global ranking has increased.");
            
            // Optional: Refresh the page to see the new scores/order
            window.location.reload(); 
        } else {
            alert("Could not record interest. Try again later.");
        }
    } catch (error) {
        console.error("Error updating interest:", error);
    }
}

async function fetchNewStartups(id) {
    const container = document.getElementById('new-startups-grid');
    // FIX: Ensure we never send 'null' string to backend
    const cleanId = (id && id !== 'null') ? id : 'guest';
    const url = `${API_BASE_URL}/new/${cleanId}`;
    
    try {
        const res = await fetch(url);
        const data = await res.json();
        
        if (data.length === 0) {
            container.innerHTML = "<p>No new startups this week.</p>";
            return;
        }

        container.innerHTML = data.map(startup => `
            <div class="startup-card new-border">
                <div class="match-badge" style="background: #d29922;">${startup.matchScore}% DNA Match</div>
                <h3>${startup.name}</h3>
                <p style="color: #8b949e">${startup.industry}</p>
                <div class="logic-tag">Algorithm: ${startup.logicTag}</div>
                <button onclick="expressInterest('${startup._id}')" class="interest-btn">Interested</button>
            </div>
        `).join('');
    } catch (err) { 
        container.innerHTML = `<p>Login as an investor to see personalized discovery matches.</p>`; 
    }
}

// Single Event Listener
document.addEventListener('DOMContentLoaded', init);