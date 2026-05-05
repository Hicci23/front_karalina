export const buildChatUrl = (username: string) => {
  const base =
    import.meta.env.VITE_WS_URL ||
    `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}`;
  return `${base}/chat/ws/${encodeURIComponent(username)}`;
};
