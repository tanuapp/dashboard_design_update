import { useState } from "react";
import { CalendarClock, Clock3, DoorOpen, Ticket } from "lucide-react";
import { PageHeader, EmptyState } from "@/components/dashboard/ui";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTicketData } from "@/features/ticket/data/TicketDataProvider";
import {
  formatTicketDateTime,
  TicketPanel,
  TicketStatusBadge,
} from "@/features/ticket/components/TicketUI";

export function SchedulesPage() {
  const data = useTicketData();
  const [eventId, setEventId] = useState("all");
  const [status, setStatus] = useState("all");
  const [date, setDate] = useState("");
  const schedules = data.schedules.filter(
    (schedule) =>
      (eventId === "all" || schedule.eventId === eventId) &&
      (status === "all" || schedule.status === status) &&
      (!date || schedule.startAt.slice(0, 10) === date),
  );

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="Хуваарь"
        description="Арга хэмжээний эхлэх хугацаа, хаалга нээх цаг болон борлуулалтын цонхыг хянана."
      />
      <TicketPanel>
        <div className="grid gap-3 sm:grid-cols-3">
          <Select value={eventId} onValueChange={setEventId}>
            <SelectTrigger>
              <SelectValue placeholder="Арга хэмжээ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Бүх арга хэмжээ</SelectItem>
              {data.events.map((event) => (
                <SelectItem key={event.id} value={event.id}>
                  {event.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Төлөв" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Бүх төлөв</SelectItem>
              <SelectItem value="scheduled">Товлосон</SelectItem>
              <SelectItem value="on-sale">Борлуулж буй</SelectItem>
              <SelectItem value="closed">Хаасан</SelectItem>
              <SelectItem value="cancelled">Цуцалсан</SelectItem>
            </SelectContent>
          </Select>
          <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        </div>
      </TicketPanel>
      {schedules.length === 0 ? (
        <EmptyState
          icon={<CalendarClock className="h-6 w-6" />}
          title={
            data.schedules.length
              ? "Шүүлтүүрт тохирох хуваарь олдсонгүй"
              : "Идэвхтэй хуваарь алга байна"
          }
          description="Арга хэмжээ үүсгэх үед эхний хуваарь автоматаар нэмэгдэнэ."
        />
      ) : (
        <TicketPanel className="p-0 sm:p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-[980px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Арга хэмжээ</TableHead>
                  <TableHead>Эхлэх огноо, цаг</TableHead>
                  <TableHead>Хаалга нээх</TableHead>
                  <TableHead>Борлуулалт эхлэх</TableHead>
                  <TableHead>Борлуулалт дуусах</TableHead>
                  <TableHead>Hold хугацаа</TableHead>
                  <TableHead>Төлөв</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedules.map((schedule) => {
                  const event = data.events.find((item) => item.id === schedule.eventId);
                  return (
                    <TableRow key={schedule.id}>
                      <TableCell className="font-semibold">
                        <span className="flex items-center gap-2">
                          <Ticket className="h-4 w-4 text-[var(--brand)]" /> {event?.name}
                        </span>
                      </TableCell>
                      <TableCell>{formatTicketDateTime(schedule.startAt)}</TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1.5">
                          <DoorOpen className="h-3.5 w-3.5 text-muted-foreground" />{" "}
                          {formatTicketDateTime(schedule.doorsOpenAt)}
                        </span>
                      </TableCell>
                      <TableCell>{formatTicketDateTime(schedule.salesStartAt)}</TableCell>
                      <TableCell>{formatTicketDateTime(schedule.salesEndAt)}</TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1.5">
                          <Clock3 className="h-3.5 w-3.5 text-muted-foreground" />{" "}
                          {schedule.holdDurationMinutes} минут
                        </span>
                      </TableCell>
                      <TableCell>
                        <TicketStatusBadge
                          value={schedule.status}
                          label={
                            schedule.status === "on-sale"
                              ? "Борлуулж буй"
                              : schedule.status === "scheduled"
                                ? "Товлосон"
                                : schedule.status === "closed"
                                  ? "Хаасан"
                                  : "Цуцалсан"
                          }
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </TicketPanel>
      )}
    </div>
  );
}
