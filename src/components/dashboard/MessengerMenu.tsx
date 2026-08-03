import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import {
  Building2,
  MapPin,
  Maximize2,
  MessageCircle,
  MoreHorizontal,
  Paperclip,
  Search,
  Send,
  Smile,
  UsersRound,
  X,
} from "lucide-react";
import { broadcastChatUnreadCount } from "@/lib/dashboard/chat-state";
import { AvatarInitials } from "@/components/dashboard/ui";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type MessengerKind = "organization" | "branch" | "team" | "private";

interface MessengerMessage {
  id: string;
  sender: string;
  text: string;
  time: string;
  mine?: boolean;
}

interface MessengerConversation {
  id: string;
  kind: MessengerKind;
  title: string;
  subtitle: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
  online?: boolean;
  messages: MessengerMessage[];
}

const INITIAL_MESSENGER_CONVERSATIONS: MessengerConversation[] = [
  {
    id: "organization-all",
    kind: "organization",
    title: "Бүх байгууллага",
    subtitle: "Aura Beauty · 24 гишүүн",
    lastMessage: "Саруул: Шинэ урамшууллын мэдээлэл орлоо.",
    lastTime: "2 мин",
    unread: 4,
    messages: [
      {
        id: "org-mini-1",
        sender: "Сарнай",
        text: "Өнөөдрийн салбаруудын захиалгын мэдээллийг шинэчилсэн шүү.",
        time: "09:02",
      },
      {
        id: "org-mini-2",
        sender: "Та",
        text: "Баярлалаа. Оройн ээлжийнхэн хуваариа шалгаарай.",
        time: "09:08",
        mine: true,
      },
      {
        id: "org-mini-3",
        sender: "Саруул",
        text: "Шинэ урамшууллын мэдээлэл орлоо.",
        time: "09:14",
      },
    ],
  },
  {
    id: "branch-b1",
    kind: "branch",
    title: "Төв салбар",
    subtitle: "12 гишүүн",
    lastMessage: "Анужин: 15:00 цагийн өрөөг би авлаа.",
    lastTime: "8 мин",
    unread: 3,
    messages: [
      {
        id: "branch-mini-1",
        sender: "Сарнай",
        text: "15:00 цагийн VIP өрөө сул байна.",
        time: "10:22",
      },
      {
        id: "branch-mini-2",
        sender: "Анужин",
        text: "Тэр цагийн өрөөг би авлаа.",
        time: "10:25",
      },
    ],
  },
  {
    id: "branch-b2",
    kind: "branch",
    title: "Хан-Уул салбар",
    subtitle: "8 гишүүн",
    lastMessage: "Билгүүн: Материалын захиалгаа илгээлээ.",
    lastTime: "24 мин",
    unread: 1,
    messages: [
      {
        id: "branch-2-mini-1",
        sender: "Билгүүн",
        text: "Материалын захиалгаа нэгтгээд илгээлээ.",
        time: "09:42",
      },
    ],
  },
  {
    id: "team-service",
    kind: "team",
    title: "Үйлчилгээний баг",
    subtitle: "9 гишүүн",
    lastMessage: "Мөнхөө: Баасан гарагийн сургалт 18:30-аас.",
    lastTime: "11:40",
    unread: 2,
    messages: [
      {
        id: "team-mini-1",
        sender: "Саруул",
        text: "Шинэ бүтээгдэхүүний материалыг drive дээр оруулсан.",
        time: "11:31",
      },
      {
        id: "team-mini-2",
        sender: "Мөнхөө",
        text: "Сургалт 18:30-аас төв салбар дээр болно.",
        time: "11:40",
      },
    ],
  },
  {
    id: "private-e1",
    kind: "private",
    title: "Саруул",
    subtitle: "Ахлах үсчин",
    lastMessage: "Оройн хуваарийг би зохицуулчихъя.",
    lastTime: "13:05",
    unread: 1,
    online: true,
    messages: [
      {
        id: "private-mini-1",
        sender: "Та",
        text: "Өнөөдрийн оройн ээлж дээр нэг хүн дутуу байна.",
        time: "12:58",
        mine: true,
      },
      {
        id: "private-mini-2",
        sender: "Саруул",
        text: "Ойлголоо, оройн хуваарийг би зохицуулчихъя.",
        time: "13:05",
      },
    ],
  },
  {
    id: "private-e2",
    kind: "private",
    title: "Анужин",
    subtitle: "Арьс арчилгааны мастер",
    lastMessage: "Баярлалаа, файлаа авчихлаа.",
    lastTime: "Өчигдөр",
    unread: 0,
    online: true,
    messages: [
      {
        id: "private-2-mini-1",
        sender: "Анужин",
        text: "Баярлалаа, файлаа авчихлаа.",
        time: "16:18",
      },
    ],
  },
];

export function MessengerMenu({ unreadCount }: { unreadCount: number }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [conversations, setConversations] = useState(INITIAL_MESSENGER_CONVERSATIONS);
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [portalReady, setPortalReady] = useState(false);
  const messageListRef = useRef<HTMLDivElement>(null);

  const activeConversation = conversations.find((item) => item.id === activeId) ?? null;
  const visibleConversations = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return conversations;
    return conversations.filter((item) =>
      `${item.title} ${item.subtitle} ${item.lastMessage}`.toLowerCase().includes(normalized),
    );
  }, [conversations, query]);
  const localUnreadCount = conversations.reduce((total, item) => total + item.unread, 0);

  useEffect(() => {
    broadcastChatUnreadCount(localUnreadCount);
  }, [localUnreadCount]);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    const list = messageListRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [activeId, activeConversation?.messages.length]);

  const openConversation = (id: string) => {
    setConversations((current) =>
      current.map((item) => (item.id === id ? { ...item, unread: 0 } : item)),
    );
    setActiveId(id);
    setDraft("");
    setMenuOpen(false);
  };

  const sendMessage = (event: FormEvent) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text || !activeConversation) return;
    const message: MessengerMessage = {
      id: `mini-message-${Date.now()}`,
      sender: "Та",
      text,
      time: new Date().toLocaleTimeString("mn-MN", { hour: "2-digit", minute: "2-digit" }),
      mine: true,
    };
    setConversations((current) =>
      current.map((item) =>
        item.id === activeConversation.id
          ? {
              ...item,
              messages: [...item.messages, message],
              lastMessage: text,
              lastTime: "Одоо",
            }
          : item,
      ),
    );
    setDraft("");
  };

  return (
    <>
      <Popover open={menuOpen} onOpenChange={setMenuOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label={`Чат (${unreadCount} уншаагүй)`}
            className="relative grid h-9 w-9 place-items-center rounded-full border border-border bg-surface/70 transition hover:bg-secondary"
          >
            <MessageCircle className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[9px] font-bold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
        </PopoverTrigger>

        <PopoverContent
          align="end"
          sideOffset={10}
          className="w-[min(380px,calc(100vw-24px))] overflow-hidden rounded-2xl p-0 shadow-2xl"
        >
          <div className="flex items-center justify-between px-4 pb-2 pt-4">
            <div>
              <h2 className="text-lg font-bold tracking-tight">Чат</h2>
              <p className="text-[11px] text-muted-foreground">
                {localUnreadCount} уншаагүй мессеж
              </p>
            </div>
            <a
              href="/business/chat"
              target="_blank"
              rel="noreferrer"
              className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition hover:bg-secondary hover:text-foreground"
              aria-label="Чатыг бүтэн дэлгэцээр шинэ tab-д нээх"
              title="Бүтэн дэлгэцээр нээх"
            >
              <Maximize2 className="h-4 w-4" />
            </a>
          </div>

          <div className="px-3 pb-2">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Messenger-ээс хайх"
                className="h-9 rounded-full border-0 bg-secondary/80 pl-9 text-xs shadow-none"
              />
            </label>
          </div>

          <div className="max-h-[390px] overflow-y-auto px-2 pb-2">
            {visibleConversations.map((conversation) => (
              <button
                key={conversation.id}
                type="button"
                onClick={() => openConversation(conversation.id)}
                className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition hover:bg-secondary/75"
              >
                <MessengerAvatar conversation={conversation} className="h-11 w-11" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={cn(
                        "truncate text-sm",
                        conversation.unread ? "font-bold" : "font-semibold",
                      )}
                    >
                      {conversation.title}
                    </p>
                    <span className="shrink-0 text-[10px] text-muted-foreground">
                      {conversation.lastTime}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-2">
                    <p
                      className={cn(
                        "min-w-0 flex-1 truncate text-xs",
                        conversation.unread
                          ? "font-medium text-foreground"
                          : "text-muted-foreground",
                      )}
                    >
                      {conversation.lastMessage}
                    </p>
                    {conversation.unread > 0 && (
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          <a
            href="/business/chat"
            target="_blank"
            rel="noreferrer"
            className="block border-t border-border px-4 py-3 text-center text-xs font-semibold text-[var(--brand)] transition hover:bg-secondary/60"
          >
            Бүх чатыг Messenger-д харах
          </a>
        </PopoverContent>
      </Popover>

      {portalReady &&
        activeConversation &&
        createPortal(
          <section className="fixed bottom-0 right-0 z-[70] flex h-[min(500px,calc(100dvh-12px))] w-full flex-col overflow-hidden rounded-t-2xl border border-b-0 border-border bg-background shadow-[0_24px_80px_-20px_rgba(8,24,55,0.45)] sm:right-4 sm:w-[370px]">
            <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border px-3 shadow-sm">
              <div className="flex min-w-0 items-center gap-2.5">
                <MessengerAvatar conversation={activeConversation} className="h-9 w-9" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{activeConversation.title}</p>
                  <p className="truncate text-[10px] text-muted-foreground">
                    {activeConversation.online ? "Онлайн" : activeConversation.subtitle}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-0.5">
                <button
                  type="button"
                  className="grid h-8 w-8 place-items-center rounded-full text-[var(--brand)] hover:bg-secondary"
                  aria-label="Нэмэлт үйлдэл"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
                <a
                  href={`/business/chat?conversation=${encodeURIComponent(activeConversation.id)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="grid h-8 w-8 place-items-center rounded-full text-[var(--brand)] hover:bg-secondary"
                  aria-label="Бүтэн дэлгэцээр шинэ tab-д нээх"
                >
                  <Maximize2 className="h-4 w-4" />
                </a>
                <button
                  type="button"
                  onClick={() => setActiveId(null)}
                  className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
                  aria-label="Чатыг хаах"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div
              ref={messageListRef}
              className="min-h-0 flex-1 overflow-y-auto bg-surface-muted/15 px-3 py-4"
            >
              <div className="mb-5 text-center">
                <MessengerAvatar conversation={activeConversation} className="mx-auto h-14 w-14" />
                <p className="mt-2 text-sm font-bold">{activeConversation.title}</p>
                <p className="text-[10px] text-muted-foreground">{activeConversation.subtitle}</p>
              </div>
              <div className="space-y-2.5">
                {activeConversation.messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn("flex", message.mine ? "justify-end" : "justify-start")}
                  >
                    <div className={cn("max-w-[82%]", message.mine && "text-right")}>
                      {!message.mine && activeConversation.kind !== "private" && (
                        <p className="mb-1 px-1 text-left text-[9px] font-semibold text-muted-foreground">
                          {message.sender}
                        </p>
                      )}
                      <div
                        className={cn(
                          "inline-block rounded-2xl px-3 py-2 text-left text-[13px] leading-relaxed",
                          message.mine
                            ? "rounded-br-md bg-primary text-primary-foreground"
                            : "rounded-bl-md bg-secondary text-foreground",
                        )}
                      >
                        {message.text}
                      </div>
                      <p className="mt-0.5 px-1 text-[8px] text-muted-foreground">{message.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <form
              onSubmit={sendMessage}
              className="flex shrink-0 items-center gap-1.5 border-t border-border p-2.5"
            >
              <button
                type="button"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[var(--brand)] hover:bg-secondary"
                aria-label="Файл хавсаргах"
              >
                <Paperclip className="h-4 w-4" />
              </button>
              <div className="flex min-w-0 flex-1 items-center rounded-full bg-secondary/85 px-3">
                <input
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Мессеж бичих..."
                  className="h-9 min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setDraft((current) => `${current} 😊`)}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Emoji нэмэх"
                >
                  <Smile className="h-4 w-4" />
                </button>
              </div>
              <button
                type="submit"
                disabled={!draft.trim()}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition disabled:opacity-40"
                aria-label="Мессеж илгээх"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </section>,
          document.body,
        )}
    </>
  );
}

function MessengerAvatar({
  conversation,
  className,
}: {
  conversation: MessengerConversation;
  className: string;
}) {
  if (conversation.kind === "private") {
    return (
      <div className="relative shrink-0">
        <AvatarInitials name={conversation.title} className={cn(className, "text-xs")} />
        {conversation.online && (
          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background bg-[var(--success)]" />
        )}
      </div>
    );
  }

  const Icon =
    conversation.kind === "organization"
      ? Building2
      : conversation.kind === "branch"
        ? MapPin
        : UsersRound;
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-full bg-[color-mix(in_oklch,var(--brand)_12%,transparent)] text-[var(--brand)]",
        className,
      )}
    >
      <Icon className="h-[42%] w-[42%]" />
    </span>
  );
}
