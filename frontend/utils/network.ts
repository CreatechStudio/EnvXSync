export async function get(endpoint: string) {
    return fetch(`/api${endpoint}`, {
        method: "GET",
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(res => {
        if (res.ok) {
            return res.json();
        } else {
            if (res.status === 401) {
                window.location.href = "/login";
            }
        }
    }).then(data => data);
}

export async function post(endpoint: string, body: any) {
    return fetch(`/api${endpoint}`, {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(res => {
        if (res.ok) {
            return res.json();
        } else {
            if (res.status === 401) {
                window.location.href = "/login";
            }
        }
    }).then(data => data);
}
