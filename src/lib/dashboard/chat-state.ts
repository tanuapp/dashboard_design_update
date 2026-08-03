export const CHAT_UNREAD_EVENT = "tanu-chat-unread-change";
export const INITIAL_CHAT_UNREAD_COUNT = 11;

export function broadcastChatUnreadCount(count: number) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<number>(CHAT_UNREAD_EVENT, { detail: count }));
}
