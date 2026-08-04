import { type ReactNode } from "react";
import { BookOpen, Headphones, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/button";
import { TicketPanel } from "@/features/ticket/components/TicketUI";

export function TicketHelpPage() {
  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="Тусламж"
        description="Ticket workspace ашиглах товч заавар болон тусламжийн сувгууд."
      />
      <div className="grid gap-4 md:grid-cols-3">
        <Help
          icon={<BookOpen />}
          title="Эхлэх заавар"
          description="Байршил, танхим, арга хэмжээ болон тасалбарын төрлийг зөв дарааллаар үүсгэнэ."
        />
        <Help
          icon={<ShieldCheck />}
          title="Нэвтрэлтийн заавар"
          description="Хаалга, scanner эрх болон тасалбарын төлөвийг шалгах зөвлөмж."
        />
        <Help
          icon={<Headphones />}
          title="Тусламж авах"
          description="Demo орчинд хүсэлтээ Tanu багт илгээх холбоос."
        />
      </div>
    </div>
  );
}
function Help({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <TicketPanel>
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-soft text-[var(--brand)] [&_svg]:h-5 [&_svg]:w-5">
        {icon}
      </span>
      <h2 className="mt-4 font-bold">{title}</h2>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">{description}</p>
      <Button
        variant="outline"
        className="mt-4"
        onClick={() => toast.success("Тусламжийн хүсэлт demo горимд бүртгэгдлээ.")}
      >
        Нээх
      </Button>
    </TicketPanel>
  );
}
