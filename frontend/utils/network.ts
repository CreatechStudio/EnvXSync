function toLogin() {
    const current = encodeURI(window.location.href);
    window.location.href = `/login?from=${current}`;
}

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
                toLogin();
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
                toLogin();
            }
        }
    }).then(data => data);
}

export function setSearchParams(params: URLSearchParams, reload?: boolean) {
    if (reload) {
        window.location.search = params.toString();
    } else {
        history.pushState(null, document.title, `?${params.toString()}`);
    }
}

export function clearUrlHash(reload?: boolean) {
    history.pushState(null, document.title, window.location.pathname);
    if (reload) {
        window.location.reload();
    }
}
