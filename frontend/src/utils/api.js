const API_BASE = "http://localhost:8000/api";

export async function uploadResume(file) {
    const formData = new FormData();
    formData.append("file", file);
    
    const response = await fetch(`${API_BASE}/interviews/upload-resume`, {
        method: "POST",
        body: formData
    });
    
    if (!response.ok) {
        let msg = "Resume upload failed";
        try { const err = await response.json(); msg = err.detail || msg; } catch(e){}
        throw new Error(msg);
    }
    return await response.json();
}

export async function createInterview(data) {
    const response = await fetch(`${API_BASE}/interviews/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    
    if (!response.ok) throw new Error("Could not create interview session");
    return await response.json();
}

export async function getInterviewResults(id) {
    const response = await fetch(`${API_BASE}/interviews/${id}`);
    if (!response.ok) throw new Error("Results not found");
    return await response.json();
}

export function getWebSocketUrl(id) {
    return `ws://localhost:8000/ws/interview/${id}`;
}
