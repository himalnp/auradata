// Configuration - REPLACE WITH YOUR DETAILS
const REPO = "himalnp/auradata";
const GITHUB_TOKEN = "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"; // Remember to keep this secret!
const FILE_PATH = "data.json";     // File name in repo

let currentData = {
    students: [],
    history: {},
    monthlyLeaderboard: [],
    settings: {
        theme: "dark",
        password: "admin123" // Change this!
    },
    sha: null // For GitHub file tracking
};

async function fetchData() {
    try {
        const url = `https://api.github.com/repos/${REPO}/contents/data.json`;
        const response = await fetch(url, {
            headers: { 
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (!response.ok) throw new Error(`GitHub Error: ${response.status}`);
        
        const { content, sha } = await response.json();
        const decoded = JSON.parse(atob(content));
        currentData = { 
            ...decoded,
            sha // Store SHA for future updates
        };
        return currentData;
    } catch (error) {
        console.error("Failed to load data:", error);
        // Fallback to local data if online fetch fails
        return currentData;
    }
}

async function saveData(data) {
    try {
        const url = `https://api.github.com/repos/${REPO}/contents/data.json`;
        const content = btoa(JSON.stringify(data, null, 2));
        
        const response = await fetch(url, {
            method: "PUT",
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.github.v3+json'
            },
            body: JSON.stringify({
                message: "Updated via Aura Counter Admin",
                content: content,
                sha: data.sha // Critical for updates
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'GitHub API error');
        }

        const result = await response.json();
        currentData.sha = result.content.sha; // Update SHA for next edit
        return true;
    } catch (error) {
        console.error("Failed to save:", error);
        alert(`Error saving data: ${error.message}`);
        return false;
    }
}

export { currentData, fetchData, saveData };