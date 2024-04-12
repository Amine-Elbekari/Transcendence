const getApiBaseUrl = () => {
    const protocol = window.location.protocol;
    const host = window.location.hostname;
    const port = window.location.port ? `:${window.location.port}` : '';

    // Construct the base URL dynamically
    return `${protocol}//${host}${port}`;
};
const getWebSocketBaseUrl = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname;
    const port = window.location.port ? `:${window.location.port}` : '';

    return `${protocol}//${host}${port}`;
};

const config = {
    API_BASE_URL: getApiBaseUrl(),
    WS_BASE_URL: getWebSocketBaseUrl(),
};

export default config;
