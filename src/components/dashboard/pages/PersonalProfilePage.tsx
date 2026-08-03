import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useDashboardData } from "@/lib/dashboard/store";
import { mockBusinessAccounts } from "@/lib/mock-data";
import { roleLabel } from "@/components/dashboard/nav-config";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AvatarInitials, FormRow, PageHeader } from "../ui";

export function PersonalProfilePage() {
  const { session } = useAuth();
  const { viewRole, employees } = useDashboardData();
  const account = mockBusinessAccounts.find((a) => a.email === session?.email);
  const employeeRecord = employees.find((e) => e.name === session?.name);

  const [name, setName] = useState(session?.name ?? "");
  const [phone, setPhone] = useState(account?.phone ?? employeeRecord?.phone ?? "");
  const [email, setEmail] = useState(session?.email ?? "");
  const [language, setLanguage] = useState("mn");
  const [notif, setNotif] = useState({ email: true, sms: true, push: true });
  const [saving, setSaving] = useState(false);

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({});
  const [pwSaving, setPwSaving] = useState(false);

  if (!session) return null;

  const saveProfile = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    setSaving(false);
    toast.success("Профайл шинэчлэгдлээ");
  };

  const changePassword = async (e: FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!currentPw) next.current = "Одоогийн нууц үгээ оруулна уу";
    if (newPw.length < 6) next.new = "Шинэ нууц үг 6-аас дээш тэмдэгт байна";
    if (newPw !== confirmPw) next.confirm = "Нууц үг таарахгүй байна";
    setPwErrors(next);
    if (Object.keys(next).length > 0) return;

    setPwSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    setPwSaving(false);
    setCurrentPw("");
    setNewPw("");
    setConfirmPw("");
    toast.success("Нууц үг амжилттай солигдлоо");
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Миний профайл" description="Хувийн мэдээлэл, нэвтрэх тохиргоо." backTo="/business/dashboard" />

      <div className="grid gap-5 lg:grid-cols-[1fr_1.3fr]">
        <div className="space-y-5">
          <div className="flex flex-col items-center rounded-2xl border border-border/80 bg-surface/80 p-6 text-center shadow-sm">
            <AvatarInitials name={session.name} className="h-20 w-20 text-2xl" />
            <p className="mt-3 font-semibold">{session.name}</p>
            <p className="text-xs text-muted-foreground">{roleLabel[viewRole]} · {session.org}</p>
            <Button size="sm" variant="outline" className="mt-3 rounded-lg">Зураг солих</Button>
          </div>

          <div className="rounded-2xl border border-border/80 bg-surface/80 p-5 shadow-sm">
            <h2 className="mb-3 font-semibold">Мэдэгдлийн тохиргоо</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>И-мэйл мэдэгдэл</span>
                <Switch checked={notif.email} onCheckedChange={(v) => setNotif((p) => ({ ...p, email: v }))} />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>SMS мэдэгдэл</span>
                <Switch checked={notif.sms} onCheckedChange={(v) => setNotif((p) => ({ ...p, sms: v }))} />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Push мэдэгдэл</span>
                <Switch checked={notif.push} onCheckedChange={(v) => setNotif((p) => ({ ...p, push: v }))} />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl border border-border/80 bg-surface/80 p-5 shadow-sm">
            <h2 className="mb-3 font-semibold">Хувийн мэдээлэл</h2>
            <div className="grid gap-3.5 sm:grid-cols-2">
              <FormRow label="Бүтэн нэр">
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </FormRow>
              <FormRow label="Утас">
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
              </FormRow>
              <FormRow label="И-мэйл">
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </FormRow>
              <FormRow label="Албан тушаал">
                <Input value={employeeRecord?.position ?? roleLabel[viewRole]} disabled />
              </FormRow>
              <FormRow label="Эрх">
                <Input value={roleLabel[viewRole]} disabled />
              </FormRow>
              <FormRow label="Хэл">
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mn">Монгол</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </FormRow>
            </div>
            <Button className="mt-4 gap-1.5 rounded-lg" disabled={saving} onClick={saveProfile}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Хадгалах
            </Button>
          </div>

          <form onSubmit={changePassword} className="rounded-2xl border border-border/80 bg-surface/80 p-5 shadow-sm">
            <h2 className="mb-3 font-semibold">Нууц үг солих</h2>
            <div className="grid gap-3.5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <FormRow label="Одоогийн нууц үг" hint={pwErrors.current}>
                  <Input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} className={pwErrors.current ? "border-destructive" : ""} />
                </FormRow>
              </div>
              <FormRow label="Шинэ нууц үг" hint={pwErrors.new}>
                <Input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} className={pwErrors.new ? "border-destructive" : ""} />
              </FormRow>
              <FormRow label="Шинэ нууц үг давтах" hint={pwErrors.confirm}>
                <Input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} className={pwErrors.confirm ? "border-destructive" : ""} />
              </FormRow>
            </div>
            <Button type="submit" variant="outline" className="mt-4 gap-1.5 rounded-lg" disabled={pwSaving}>
              {pwSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              Нууц үг солих
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
