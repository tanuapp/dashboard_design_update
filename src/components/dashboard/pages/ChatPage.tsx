import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  ArrowLeft,
  Building2,
  CheckCheck,
  ChevronRight,
  Circle,
  FileText,
  Info,
  Mail,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Paperclip,
  Phone,
  Plus,
  Search,
  Send,
  Smile,
  UserPlus,
  UsersRound,
  Video,
  X,
} from "lucide-react";
import { useDashboardData } from "@/lib/dashboard/store";
import { broadcastChatUnreadCount } from "@/lib/dashboard/chat-state";
import type { Employee } from "@/lib/dashboard/types";
import { AvatarInitials, PageHeader } from "../ui";
import { TanuBusinessLogo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type ConversationKind = "organization" | "branch" | "team" | "private";

interface InternalMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  time: string;
  seen?: boolean;
}

interface InternalConversation {
  id: string;
  kind: ConversationKind;
  title: string;
  subtitle: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
  memberCount: number;
  memberIds: string[];
  participantId?: string;
  branchId?: string;
  online?: boolean;
  messages: InternalMessage[];
}

const INITIAL_CONVERSATIONS: InternalConversation[] = [
  {
    id: "organization-all",
    kind: "organization",
    title: "Бүх байгууллага",
    subtitle: "Aura Beauty · Бүх ажилтан",
    lastMessage: "Саруул: Шинэ урамшууллын мэдээлэл орлоо.",
    lastTime: "2 мин",
    unread: 4,
    memberCount: 24,
    memberIds: ["e1", "e2", "e3", "e4", "e5", "e6"],
    messages: [
      {
        id: "org-1",
        senderId: "e5",
        senderName: "Сарнай",
        text: "Өглөөний мэнд. Өнөөдрийн салбаруудын захиалгын мэдээллийг шинэчилсэн шүү.",
        time: "09:02",
      },
      {
        id: "org-2",
        senderId: "me",
        senderName: "Та",
        text: "Баярлалаа. Оройн ээлжийнхэн хуваариа нэг шалгаарай.",
        time: "09:08",
        seen: true,
      },
      {
        id: "org-3",
        senderId: "e1",
        senderName: "Саруул",
        text: "Шинэ урамшууллын мэдээлэл орлоо. Үйлчлүүлэгчдэд өнөөдрөөс танилцуулж эхэлнэ шүү.",
        time: "09:14",
      },
    ],
  },
  {
    id: "branch-b1",
    kind: "branch",
    title: "Төв салбар",
    subtitle: "Aura Beauty — Төв салбар",
    lastMessage: "Анужин: 15:00 цагийн өрөөг би авлаа.",
    lastTime: "8 мин",
    unread: 3,
    memberCount: 12,
    memberIds: ["e1", "e2", "e3", "e5"],
    branchId: "b1",
    messages: [
      {
        id: "b1-1",
        senderId: "e5",
        senderName: "Сарнай",
        text: "Өнөөдрийн 15:00 цагийн VIP өрөө сул байна. Хэрэгтэй хүн байна уу?",
        time: "10:22",
      },
      {
        id: "b1-2",
        senderId: "e2",
        senderName: "Анужин",
        text: "15:00 цагийн өрөөг би авлаа. Нүүр арчилгааны захиалгатай.",
        time: "10:25",
      },
      {
        id: "b1-3",
        senderId: "me",
        senderName: "Та",
        text: "За бүртгэл дээр өрөөг Анужинд хуваариллаа.",
        time: "10:27",
        seen: true,
      },
    ],
  },
  {
    id: "branch-b2",
    kind: "branch",
    title: "Хан-Уул салбар",
    subtitle: "Aura Beauty — Хан-Уул",
    lastMessage: "Билгүүн: Материалын захиалгаа илгээлээ.",
    lastTime: "24 мин",
    unread: 1,
    memberCount: 8,
    memberIds: ["e4", "e6"],
    branchId: "b2",
    messages: [
      {
        id: "b2-1",
        senderId: "e6",
        senderName: "Дэлгэрмаа",
        text: "Педикюрын материал энэ долоо хоногт дуусах төлөвтэй байна.",
        time: "09:36",
      },
      {
        id: "b2-2",
        senderId: "e4",
        senderName: "Билгүүн",
        text: "Материалын захиалгаа нэгтгээд илгээлээ.",
        time: "09:42",
      },
    ],
  },
  {
    id: "team-service",
    kind: "team",
    title: "Үйлчилгээний баг",
    subtitle: "Үсчин, арьс арчилгаа, массаж",
    lastMessage: "Мөнхөө: Баасан гарагийн сургалт 18:30-аас.",
    lastTime: "11:40",
    unread: 2,
    memberCount: 9,
    memberIds: ["e1", "e2", "e3", "e4", "e6"],
    messages: [
      {
        id: "team-1",
        senderId: "e1",
        senderName: "Саруул",
        text: "Шинэ бүтээгдэхүүний танилцуулгын материалыг drive дээр оруулсан.",
        time: "11:31",
      },
      {
        id: "team-2",
        senderId: "e3",
        senderName: "Мөнхөө",
        text: "Баасан гарагийн сургалт 18:30-аас төв салбар дээр болно шүү.",
        time: "11:40",
      },
    ],
  },
  {
    id: "team-management",
    kind: "team",
    title: "Админ ба менежерүүд",
    subtitle: "Удирдлагын баг",
    lastMessage: "Маргаашийн хурлын agenda бэлэн болсон.",
    lastTime: "Өчигдөр",
    unread: 0,
    memberCount: 4,
    memberIds: ["e1", "e5"],
    messages: [
      {
        id: "management-1",
        senderId: "me",
        senderName: "Та",
        text: "Маргаашийн хурлын agenda бэлэн болсон. 09:00 цагт эхэлнэ.",
        time: "17:20",
        seen: true,
      },
      {
        id: "management-2",
        senderId: "e5",
        senderName: "Сарнай",
        text: "За ойлголоо, тайлангуудаа бэлдээд очно.",
        time: "17:24",
      },
    ],
  },
  {
    id: "private-e1",
    kind: "private",
    title: "Саруул",
    subtitle: "Ахлах үсчин · Төв салбар",
    lastMessage: "Оройн хуваарийг би зохицуулчихъя.",
    lastTime: "13:05",
    unread: 1,
    memberCount: 2,
    memberIds: ["e1"],
    participantId: "e1",
    online: true,
    messages: [
      {
        id: "private-e1-1",
        senderId: "me",
        senderName: "Та",
        text: "Саруул аа, өнөөдрийн оройн ээлж дээр нэг хүн дутуу байна.",
        time: "12:58",
        seen: true,
      },
      {
        id: "private-e1-2",
        senderId: "e1",
        senderName: "Саруул",
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
    memberCount: 2,
    memberIds: ["e2"],
    participantId: "e2",
    online: true,
    messages: [
      {
        id: "private-e2-1",
        senderId: "me",
        senderName: "Та",
        text: "Сургалтын шинэ файлыг явууллаа.",
        time: "16:12",
        seen: true,
      },
      {
        id: "private-e2-2",
        senderId: "e2",
        senderName: "Анужин",
        text: "Баярлалаа, файлаа авчихлаа.",
        time: "16:18",
      },
    ],
  },
  {
    id: "private-e5",
    kind: "private",
    title: "Сарнай",
    subtitle: "Ресепшн · Төв салбар",
    lastMessage: "Өнөөдрийн тооцоо нийлсэн.",
    lastTime: "Даваа",
    unread: 0,
    memberCount: 2,
    memberIds: ["e5"],
    participantId: "e5",
    online: false,
    messages: [
      {
        id: "private-e5-1",
        senderId: "e5",
        senderName: "Сарнай",
        text: "Өнөөдрийн тооцоо нийлсэн. Тайланг санхүү рүү явуулсан.",
        time: "19:08",
      },
    ],
  },
];

export function ChatPage({
  standalone = false,
  initialConversationId,
}: {
  standalone?: boolean;
  initialConversationId?: string;
}) {
  const { employees, branches } = useDashboardData();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState(() =>
    INITIAL_CONVERSATIONS.map((conversation, index) =>
      index === 0 ? { ...conversation, unread: 0 } : conversation,
    ),
  );
  const [selectedId, setSelectedId] = useState(
    initialConversationId ?? INITIAL_CONVERSATIONS[0].id,
  );
  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "group" | "private">("all");
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const [newChatOpen, setNewChatOpen] = useState(false);
  const messageListRef = useRef<HTMLDivElement>(null);

  const rows = useMemo(
    () =>
      conversations.filter((conversation) => {
        const matchesSearch =
          `${conversation.title} ${conversation.subtitle} ${conversation.lastMessage}`
            .toLowerCase()
            .includes(search.trim().toLowerCase());
        const matchesFilter =
          filter === "all" ||
          (filter === "private" && conversation.kind === "private") ||
          (filter === "group" && conversation.kind !== "private");
        return matchesSearch && matchesFilter;
      }),
    [conversations, filter, search],
  );

  const selectedConversation =
    conversations.find((conversation) => conversation.id === selectedId) ?? conversations[0];
  const privateEmployee = selectedConversation.participantId
    ? employees.find((employee) => employee.id === selectedConversation.participantId)
    : undefined;
  const selectedBranch = selectedConversation.branchId
    ? branches.find((branch) => branch.id === selectedConversation.branchId)
    : undefined;
  const members = selectedConversation.memberIds
    .map((id) => employees.find((employee) => employee.id === id))
    .filter((employee): employee is Employee => Boolean(employee));
  const unreadCount = conversations.reduce((total, item) => total + item.unread, 0);

  useEffect(() => {
    const timer = window.setTimeout(() => broadcastChatUnreadCount(unreadCount), 0);
    return () => window.clearTimeout(timer);
  }, [unreadCount]);

  useEffect(() => {
    const messageList = messageListRef.current;
    if (messageList) messageList.scrollTop = messageList.scrollHeight;
  }, [selectedId, selectedConversation.messages.length]);

  const openConversation = (conversationId: string) => {
    setSelectedId(conversationId);
    setMobileView("chat");
    setConversations((current) =>
      current.map((item) => (item.id === conversationId ? { ...item, unread: 0 } : item)),
    );
  };

  const startPrivateConversation = (employee: Employee) => {
    const existing = conversations.find(
      (conversation) =>
        conversation.kind === "private" && conversation.participantId === employee.id,
    );
    if (existing) {
      setNewChatOpen(false);
      openConversation(existing.id);
      return;
    }

    const conversation: InternalConversation = {
      id: `private-${employee.id}`,
      kind: "private",
      title: employee.name,
      subtitle: employee.position,
      lastMessage: "Шинэ харилцан яриа",
      lastTime: "Одоо",
      unread: 0,
      memberCount: 2,
      memberIds: [employee.id],
      participantId: employee.id,
      online: employee.status !== "off" && employee.status !== "not-working",
      messages: [],
    };
    setConversations((current) => [conversation, ...current]);
    setNewChatOpen(false);
    setSelectedId(conversation.id);
    setMobileView("chat");
  };

  const sendMessage = (event: FormEvent) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;

    const message: InternalMessage = {
      id: `message-${Date.now()}`,
      senderId: "me",
      senderName: "Та",
      text,
      time: new Date().toLocaleTimeString("mn-MN", { hour: "2-digit", minute: "2-digit" }),
      seen: false,
    };

    setConversations((current) => {
      const updated = current.find((item) => item.id === selectedConversation.id);
      if (!updated) return current;
      return [
        {
          ...updated,
          messages: [...updated.messages, message],
          lastMessage: text,
          lastTime: "Одоо",
          unread: 0,
        },
        ...current.filter((item) => item.id !== selectedConversation.id),
      ];
    });
    setDraft("");
  };

  return (
    <div className={cn(standalone && "flex h-dvh flex-col overflow-hidden bg-background")}>
      {standalone ? (
        <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border bg-surface/85 px-4 backdrop-blur-xl sm:px-6">
          <div className="flex min-w-0 items-center gap-4">
            <TanuBusinessLogo className="h-8 shrink-0" />
            <span className="hidden h-6 w-px bg-border sm:block" />
            <div className="min-w-0">
              <h1 className="truncate text-sm font-bold sm:text-base">Messenger</h1>
              <p className="hidden text-[10px] text-muted-foreground sm:block">
                Байгууллагын дотоод харилцаа
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              size="sm"
              className="hidden gap-1.5 rounded-lg sm:inline-flex"
              onClick={() => setNewChatOpen(true)}
            >
              <Plus className="h-4 w-4" /> Шинэ чат
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 rounded-lg" asChild>
              <Link to="/business/dashboard">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard руу буцах</span>
              </Link>
            </Button>
          </div>
        </header>
      ) : (
        <PageHeader
          title="Байгууллагын чат"
          description="Салбар, баг болон ажилтнуудтайгаа нэг дороос харилцана."
          actions={
            <Button
              className="hidden gap-1.5 rounded-lg sm:inline-flex"
              onClick={() => setNewChatOpen(true)}
            >
              <Plus className="h-4 w-4" /> Шинэ чат
            </Button>
          }
        />
      )}

      <div
        className={cn(
          "grid grid-cols-[minmax(0,1fr)] overflow-hidden border border-border/80 bg-surface/80 lg:grid-cols-[300px_minmax(0,1fr)] 2xl:grid-cols-[310px_minmax(0,1fr)_260px]",
          standalone
            ? "min-h-0 flex-1 border-x-0 border-b-0"
            : "h-[calc(100dvh-12rem)] min-h-[580px] max-h-[820px] rounded-2xl shadow-sm",
        )}
      >
        <aside
          className={cn(
            "min-h-0 min-w-0 flex-col border-r border-border/80 bg-surface-muted/20 lg:flex",
            mobileView === "chat" ? "hidden" : "flex",
          )}
        >
          <div className="border-b border-border/80 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold">Чатууд</h2>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {unreadCount} уншаагүй мессеж
                </p>
              </div>
              <button
                type="button"
                onClick={() => setNewChatOpen(true)}
                className="grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground transition hover:opacity-90"
                aria-label="Шинэ чат"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <label className="relative mt-3 block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Чат, ажилтнаар хайх"
                className="h-9 rounded-full bg-background pl-9 pr-8 text-xs"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Хайлтыг цэвэрлэх"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </label>

            <div className="mt-3 grid grid-cols-3 rounded-xl bg-secondary/70 p-0.5 text-[11px] font-medium">
              {(
                [
                  ["all", "Бүгд"],
                  ["group", "Групп"],
                  ["private", "Хувийн"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilter(value)}
                  className={cn(
                    "rounded-lg px-2 py-1.5 transition",
                    filter === value
                      ? "bg-surface text-foreground shadow-sm"
                      : "text-muted-foreground",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-2">
            {rows.length > 0 ? (
              rows.map((conversation) => {
                const active = conversation.id === selectedConversation.id;
                return (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => openConversation(conversation.id)}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition",
                      active
                        ? "bg-[color-mix(in_oklch,var(--brand)_11%,transparent)]"
                        : "hover:bg-secondary/70",
                    )}
                  >
                    <ConversationAvatar conversation={conversation} className="h-11 w-11" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-1.5">
                          <p className="truncate text-sm font-semibold">{conversation.title}</p>
                          {conversation.kind !== "private" && (
                            <span className="shrink-0 rounded bg-secondary px-1 py-0.5 text-[8px] font-semibold uppercase text-muted-foreground">
                              {kindLabel[conversation.kind]}
                            </span>
                          )}
                        </div>
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
                          <span className="grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                            {conversation.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="flex h-48 flex-col items-center justify-center px-5 text-center">
                <MessageCircle className="h-7 w-7 text-muted-foreground/50" />
                <p className="mt-3 text-sm font-medium">Чат олдсонгүй</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Хайлт эсвэл төрлөө өөрчилнө үү.
                </p>
              </div>
            )}
          </div>
        </aside>

        <section
          className={cn(
            "min-h-0 min-w-0 flex-col bg-background/45 lg:flex",
            mobileView === "list" ? "hidden" : "flex",
          )}
        >
          <div className="flex h-[68px] shrink-0 items-center justify-between gap-3 border-b border-border/80 px-3 sm:px-5">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileView("list")}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full hover:bg-secondary lg:hidden"
                aria-label="Чатын жагсаалт руу буцах"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <ConversationAvatar conversation={selectedConversation} className="h-10 w-10" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{selectedConversation.title}</p>
                <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  {selectedConversation.kind === "private" ? (
                    <>
                      <Circle
                        className={cn(
                          "h-1.5 w-1.5 fill-current",
                          selectedConversation.online
                            ? "text-[var(--success)]"
                            : "text-muted-foreground/50",
                        )}
                      />
                      {selectedConversation.online ? "Онлайн" : "Офлайн"} ·{" "}
                      {selectedConversation.subtitle}
                    </>
                  ) : (
                    <>
                      {selectedConversation.memberCount} гишүүн · {selectedConversation.subtitle}
                    </>
                  )}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {selectedConversation.kind === "private" ? (
                <>
                  <HeaderIconButton
                    label="Дуудлага хийх"
                    onClick={() => toast.info("Дуудлага эхлүүлж байна...")}
                  >
                    <Phone />
                  </HeaderIconButton>
                  <HeaderIconButton
                    label="Видео дуудлага"
                    onClick={() => toast.info("Видео дуудлага удахгүй нэмэгдэнэ")}
                  >
                    <Video />
                  </HeaderIconButton>
                </>
              ) : (
                <HeaderIconButton
                  label="Гишүүн нэмэх"
                  onClick={() => toast.info("Группт гишүүн нэмэх цонх удахгүй нэмэгдэнэ")}
                >
                  <UserPlus />
                </HeaderIconButton>
              )}
              <HeaderIconButton
                label="Нэмэлт үйлдэл"
                onClick={() => toast.info("Чатын нэмэлт тохиргоо удахгүй нэмэгдэнэ")}
              >
                <MoreHorizontal />
              </HeaderIconButton>
            </div>
          </div>

          <div ref={messageListRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
            <div className="mx-auto max-w-2xl">
              <div className="mb-5 flex items-center gap-3">
                <span className="h-px flex-1 bg-border/70" />
                <span className="text-[10px] font-medium text-muted-foreground">ӨНӨӨДӨР</span>
                <span className="h-px flex-1 bg-border/70" />
              </div>

              {selectedConversation.messages.length > 0 ? (
                <div className="space-y-3.5">
                  {selectedConversation.messages.map((message) => {
                    const mine = message.senderId === "me";
                    return (
                      <div
                        key={message.id}
                        className={cn(
                          "flex items-end gap-2",
                          mine ? "justify-end" : "justify-start",
                        )}
                      >
                        {!mine && (
                          <AvatarInitials
                            name={message.senderName}
                            className="h-7 w-7 text-[9px]"
                          />
                        )}
                        <div className={cn("max-w-[82%] sm:max-w-[72%]", mine && "text-right")}>
                          {!mine && selectedConversation.kind !== "private" && (
                            <p className="mb-1 px-1 text-left text-[10px] font-semibold text-muted-foreground">
                              {message.senderName}
                            </p>
                          )}
                          <div
                            className={cn(
                              "inline-block rounded-2xl px-3.5 py-2.5 text-left",
                              mine
                                ? "rounded-br-md bg-primary text-primary-foreground"
                                : "rounded-bl-md border border-border/70 bg-surface",
                            )}
                          >
                            <p className="whitespace-pre-wrap text-sm leading-relaxed">
                              {message.text}
                            </p>
                            <div
                              className={cn(
                                "mt-1 flex items-center justify-end gap-1 text-[9px]",
                                mine ? "text-primary-foreground/65" : "text-muted-foreground",
                              )}
                            >
                              {message.time}
                              {mine && <CheckCheck className="h-3 w-3" />}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex min-h-72 flex-col items-center justify-center text-center">
                  <ConversationAvatar conversation={selectedConversation} className="h-14 w-14" />
                  <p className="mt-3 text-sm font-semibold">{selectedConversation.title}</p>
                  <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                    Энэ харилцан ярианы эхний мессежийг илгээнэ үү.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="shrink-0 border-t border-border/80 bg-surface/70 p-3 sm:px-5 sm:py-4">
            <form
              onSubmit={sendMessage}
              className="mx-auto flex max-w-2xl items-end gap-2 rounded-2xl border border-border bg-background p-2 shadow-sm focus-within:border-[var(--brand)]/45"
            >
              <button
                type="button"
                onClick={() => toast.info("Файл хавсаргах боломж удахгүй нэмэгдэнэ")}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                aria-label="Файл хавсаргах"
              >
                <Paperclip className="h-4 w-4" />
              </button>
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    event.currentTarget.form?.requestSubmit();
                  }
                }}
                placeholder={`${selectedConversation.title} руу мессеж бичих...`}
                rows={1}
                className="max-h-28 min-h-9 flex-1 resize-none bg-transparent px-1 py-2 text-sm outline-none placeholder:text-muted-foreground"
              />
              <button
                type="button"
                onClick={() => setDraft((current) => `${current} 😊`)}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                aria-label="Emoji нэмэх"
              >
                <Smile className="h-4 w-4" />
              </button>
              <button
                type="submit"
                disabled={!draft.trim()}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Мессеж илгээх"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
            <p className="mt-1.5 text-center text-[9px] text-muted-foreground">
              Enter дарж илгээнэ · Shift + Enter шинэ мөр
            </p>
          </div>
        </section>

        <aside className="hidden min-h-0 flex-col border-l border-border/80 bg-surface-muted/15 2xl:flex">
          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            <div className="flex flex-col items-center border-b border-border/80 pb-5 text-center">
              <ConversationAvatar conversation={selectedConversation} className="h-16 w-16" />
              <h3 className="mt-3 font-semibold">{selectedConversation.title}</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {selectedConversation.kind === "private"
                  ? selectedConversation.subtitle
                  : `${kindLabel[selectedConversation.kind]} · ${selectedConversation.memberCount} гишүүн`}
              </p>
              {selectedConversation.kind === "private" && (
                <div className="mt-3 flex gap-2">
                  <RoundAction icon={<Phone />} label="Залгах" />
                  <RoundAction icon={<Video />} label="Видео" />
                  <RoundAction icon={<Mail />} label="И-мэйл" />
                </div>
              )}
            </div>

            {selectedConversation.kind === "private" && privateEmployee ? (
              <div className="space-y-4 py-4">
                <InfoRow
                  icon={<UsersRound />}
                  label="Албан тушаал"
                  value={privateEmployee.position}
                />
                <InfoRow
                  icon={<MapPin />}
                  label="Салбар"
                  value={
                    branches.find((branch) => branch.id === privateEmployee.branchId)?.name ?? "—"
                  }
                />
                <InfoRow icon={<Phone />} label="Утас" value={privateEmployee.phone} />
                <InfoRow icon={<Mail />} label="И-мэйл" value={privateEmployee.email} />
              </div>
            ) : (
              <>
                {selectedBranch && (
                  <div className="mt-4 rounded-xl border border-border/80 bg-surface p-3">
                    <p className="text-[11px] font-semibold">{selectedBranch.name}</p>
                    <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">
                      {selectedBranch.address}
                    </p>
                  </div>
                )}
                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-semibold">Гишүүд</p>
                    <span className="text-[10px] text-muted-foreground">
                      {selectedConversation.memberCount}
                    </span>
                  </div>
                  <div className="mt-2 space-y-1">
                    {members.slice(0, 5).map((member) => (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => startPrivateConversation(member)}
                        className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left hover:bg-secondary"
                      >
                        <div className="relative">
                          <AvatarInitials name={member.name} className="h-8 w-8 text-[10px]" />
                          {member.status !== "off" && member.status !== "not-working" && (
                            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-surface bg-[var(--success)]" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-medium">{member.name}</p>
                          <p className="truncate text-[10px] text-muted-foreground">
                            {member.position}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => toast.info("Гишүүдийн дэлгэрэнгүй жагсаалт удахгүй нэмэгдэнэ")}
                    className="mt-2 w-full rounded-lg py-2 text-[11px] font-medium text-[var(--brand)] hover:bg-secondary"
                  >
                    Бүх гишүүдийг харах
                  </button>
                </div>
              </>
            )}

            <div className="mt-4 border-t border-border/80 pt-4">
              <p className="text-[11px] font-semibold">Хуваалцсан файл</p>
              <div className="mt-2 space-y-2">
                <SharedFile name="7-р сарын хуваарь.pdf" detail="1.8 MB · Өнөөдөр" />
                <SharedFile name="Сургалтын материал.pdf" detail="3.2 MB · Өчигдөр" />
              </div>
            </div>
          </div>

          {privateEmployee && (
            <button
              type="button"
              onClick={() =>
                navigate({
                  to: "/business/dashboard/employees/$employeeId",
                  params: { employeeId: privateEmployee.id },
                })
              }
              className="flex items-center justify-between border-t border-border/80 px-4 py-3 text-xs font-medium transition hover:bg-secondary/70"
            >
              Ажилтны мэдээлэл
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          )}
        </aside>
      </div>

      <NewInternalChatDialog
        open={newChatOpen}
        onOpenChange={setNewChatOpen}
        employees={employees}
        conversations={conversations}
        onSelectGroup={(conversationId) => {
          setNewChatOpen(false);
          openConversation(conversationId);
        }}
        onSelectEmployee={startPrivateConversation}
      />
    </div>
  );
}

const kindLabel: Record<Exclude<ConversationKind, "private">, string> = {
  organization: "Байгууллага",
  branch: "Салбар",
  team: "Баг",
};

function ConversationAvatar({
  conversation,
  className,
}: {
  conversation: InternalConversation;
  className: string;
}) {
  if (conversation.kind === "private") {
    return (
      <div className="relative shrink-0">
        <AvatarInitials name={conversation.title} className={cn(className, "text-xs")} />
        {conversation.online && (
          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-surface bg-[var(--success)]" />
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

function HeaderIconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="grid h-8 w-8 place-items-center rounded-full text-[var(--brand)] transition hover:bg-secondary [&_svg]:h-4 [&_svg]:w-4"
      aria-label={label}
      title={label}
    >
      {children}
    </button>
  );
}

function NewInternalChatDialog({
  open,
  onOpenChange,
  employees,
  conversations,
  onSelectGroup,
  onSelectEmployee,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employees: Employee[];
  conversations: InternalConversation[];
  onSelectGroup: (conversationId: string) => void;
  onSelectEmployee: (employee: Employee) => void;
}) {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"group" | "private">("private");

  useEffect(() => {
    if (!open) {
      setSearch("");
      setTab("private");
    }
  }, [open]);

  const filteredEmployees = employees.filter((employee) =>
    `${employee.name} ${employee.position} ${employee.phone}`
      .toLowerCase()
      .includes(search.trim().toLowerCase()),
  );
  const groups = conversations.filter(
    (conversation) =>
      conversation.kind !== "private" &&
      `${conversation.title} ${conversation.subtitle}`
        .toLowerCase()
        .includes(search.trim().toLowerCase()),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Шинэ чат</DialogTitle>
          <DialogDescription>Групп эсвэл ажилтнаа сонгож чат эхлүүлнэ үү.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 rounded-xl bg-secondary p-1 text-xs font-medium">
          <button
            type="button"
            onClick={() => setTab("private")}
            className={cn(
              "rounded-lg py-2 transition",
              tab === "private" ? "bg-surface shadow-sm" : "text-muted-foreground",
            )}
          >
            Хувийн чат
          </button>
          <button
            type="button"
            onClick={() => setTab("group")}
            className={cn(
              "rounded-lg py-2 transition",
              tab === "group" ? "bg-surface shadow-sm" : "text-muted-foreground",
            )}
          >
            Групп чат
          </button>
        </div>

        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={tab === "private" ? "Ажилтан хайх" : "Групп хайх"}
            className="rounded-xl pl-9"
            autoFocus
          />
        </label>

        <div className="max-h-80 space-y-1 overflow-y-auto pr-1">
          {tab === "private"
            ? filteredEmployees.map((employee) => (
                <button
                  key={employee.id}
                  type="button"
                  onClick={() => onSelectEmployee(employee)}
                  className="flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition hover:bg-secondary"
                >
                  <div className="relative">
                    <AvatarInitials name={employee.name} className="h-9 w-9 text-xs" />
                    {employee.status !== "off" && employee.status !== "not-working" && (
                      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-surface bg-[var(--success)]" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{employee.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{employee.position}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              ))
            : groups.map((conversation) => (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => onSelectGroup(conversation.id)}
                  className="flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition hover:bg-secondary"
                >
                  <ConversationAvatar conversation={conversation} className="h-9 w-9" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{conversation.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {kindLabel[conversation.kind as Exclude<ConversationKind, "private">]} ·{" "}
                      {conversation.memberCount} гишүүн
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              ))}

          {((tab === "private" && filteredEmployees.length === 0) ||
            (tab === "group" && groups.length === 0)) && (
            <div className="py-10 text-center">
              <Info className="mx-auto h-5 w-5 text-muted-foreground/60" />
              <p className="mt-2 text-sm text-muted-foreground">Илэрц олдсонгүй</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function RoundAction({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <button
      type="button"
      onClick={() => toast.info(`${label} үйлдэл удахгүй нэмэгдэнэ`)}
      className="grid h-8 w-8 place-items-center rounded-full border border-border bg-surface transition hover:bg-secondary [&_svg]:h-3.5 [&_svg]:w-3.5"
      aria-label={label}
    >
      {icon}
    </button>
  );
}

function InfoRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 text-muted-foreground [&_svg]:h-3.5 [&_svg]:w-3.5">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] text-muted-foreground">{label}</p>
        <p className="truncate text-xs font-medium">{value}</p>
      </div>
    </div>
  );
}

function SharedFile({ name, detail }: { name: string; detail: string }) {
  return (
    <button
      type="button"
      onClick={() => toast.info(`${name} файлыг нээж байна...`)}
      className="flex w-full items-center gap-2.5 rounded-lg border border-border/70 bg-surface px-2.5 py-2 text-left hover:bg-secondary"
    >
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-soft text-[var(--brand)]">
        <FileText className="h-3.5 w-3.5" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[11px] font-medium">{name}</span>
        <span className="block text-[9px] text-muted-foreground">{detail}</span>
      </span>
    </button>
  );
}
