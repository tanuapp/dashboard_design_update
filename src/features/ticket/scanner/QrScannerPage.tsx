import { useState } from "react";
import { CheckCircle2, QrCode, ScanLine, ShieldCheck, XCircle } from "lucide-react";
import { PageHeader } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTicketData } from "@/features/ticket/data/TicketDataProvider";
import type { ScanResult } from "@/features/ticket/types";
import {
  formatTicketDateTime,
  TicketPanel,
  TicketStatusBadge,
} from "@/features/ticket/components/TicketUI";

export function QrScannerPage() {
  const data = useTicketData();
  const openGates = data.gates.filter((gate) => gate.status === "open");
  const [gateId, setGateId] = useState(openGates[0]?.id ?? data.gates[0]?.id ?? "");
  const [code, setCode] = useState("");
  const [result, setResult] = useState<ScanResult>();
  const [recent, setRecent] = useState<ScanResult[]>([]);
  const scan = () => {
    const next = data.scanTicket(code, gateId);
    setResult(next);
    setRecent((current) => [next, ...current].slice(0, 8));
    if (next.ok) setCode("");
  };
  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="QR шалгах"
        description="Тасалбарын кодыг шалгаж, сонгосон хаалгаар нэвтрэх эрхийг баталгаажуулна."
      />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.85fr)_minmax(380px,1.15fr)]">
        <TicketPanel>
          <div className="mx-auto max-w-md">
            <span className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-brand-soft text-[var(--brand)]">
              <QrCode className="h-10 w-10" />
            </span>
            <h2 className="mt-5 text-center text-lg font-bold">Тасалбар уншуулах</h2>
            <p className="mt-1 text-center text-xs text-muted-foreground">
              Камерын scanner adapter байхгүй тул demo кодыг гараар оруулна.
            </p>
            <div className="mt-6 space-y-4">
              <Select value={gateId} onValueChange={setGateId}>
                <SelectTrigger>
                  <SelectValue placeholder="Хаалга сонгох" />
                </SelectTrigger>
                <SelectContent>
                  {data.gates.map((gate) => (
                    <SelectItem key={gate.id} value={gate.id}>
                      {gate.name} · {gate.status === "open" ? "Нээлттэй" : "Хаалттай"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                value={code}
                onChange={(event) => setCode(event.target.value)}
                placeholder="Жишээ: TN-ECH-8K2M1"
                onKeyDown={(event) => event.key === "Enter" && code.trim() && scan()}
              />
              <Button className="w-full" onClick={scan} disabled={!gateId || !code.trim()}>
                <ScanLine /> Шалгах
              </Button>
              <Button variant="outline" className="w-full" onClick={() => setCode("TN-ECH-8K2M1")}>
                Demo хүчинтэй код оруулах
              </Button>
            </div>
          </div>
        </TicketPanel>
        <div className="space-y-5">
          {result ? (
            <TicketPanel
              className={result.ok ? "border-[var(--success)]/30" : "border-destructive/30"}
            >
              <div className="flex items-start gap-4">
                <span
                  className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl ${result.ok ? "bg-[color-mix(in_oklch,var(--success)_12%,transparent)] text-[var(--success)]" : "bg-destructive/10 text-destructive"}`}
                >
                  {result.ok ? (
                    <CheckCircle2 className="h-7 w-7" />
                  ) : (
                    <XCircle className="h-7 w-7" />
                  )}
                </span>
                <div>
                  <h2
                    className={`text-lg font-bold ${result.ok ? "text-[var(--success)]" : "text-destructive"}`}
                  >
                    {result.ok ? "Нэвтрэхийг зөвшөөрлөө" : "Нэвтрэх боломжгүй"}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">{result.message}</p>
                </div>
              </div>
              {result.ticket && (
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <Result label="Тасалбар" value={result.ticket.ticketCode} />
                  <Result label="Арга хэмжээ" value={result.event?.name ?? "—"} />
                  <Result
                    label="Хэсэг / суудал"
                    value={`${result.ticket.section}${result.ticket.row ? ` · ${result.ticket.row}-${result.ticket.seat}` : ""}`}
                  />
                  <Result
                    label="Шалгасан цаг"
                    value={result.scannedAt ? formatTicketDateTime(result.scannedAt) : "—"}
                  />
                </div>
              )}
            </TicketPanel>
          ) : (
            <TicketPanel>
              <div className="py-12 text-center">
                <ShieldCheck className="mx-auto h-10 w-10 text-muted-foreground/45" />
                <p className="mt-3 text-sm font-semibold">Шалгалтын үр дүн энд харагдана</p>
              </div>
            </TicketPanel>
          )}
          <TicketPanel>
            <h2 className="text-sm font-bold">Сүүлийн шалгалтууд</h2>
            {recent.length ? (
              <div className="mt-3 space-y-2">
                {recent.map((item, index) => (
                  <div
                    key={`${item.ticket?.ticketCode ?? "unknown"}-${index}`}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold">
                        {item.ticket?.ticketCode ?? "Тодорхойгүй код"}
                      </p>
                      <p className="truncate text-[10px] text-muted-foreground">{item.message}</p>
                    </div>
                    <TicketStatusBadge
                      value={item.ok ? "active" : "failed"}
                      label={item.ok ? "Зөвшөөрсөн" : "Татгалзсан"}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-xs text-muted-foreground">Одоогоор шалгалт хийгээгүй.</p>
            )}
          </TicketPanel>
        </div>
      </div>
    </div>
  );
}
function Result({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface-muted/45 p-3">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="mt-1 text-xs font-semibold">{value}</p>
    </div>
  );
}
