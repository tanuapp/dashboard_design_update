import { useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarClock,
  Check,
  CreditCard,
  Landmark,
  Network,
  Plus,
  Sparkles,
  Moon,
  Sun,
  Trash2,
  Users,
  ShieldCheck,
} from "lucide-react";
import { bizTypes } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth-context";
import { useApp } from "@/lib/app-context";
import {
  createDefaultWeeklySchedule,
  saveBusinessOnboarding,
  type BusinessOnboardingData,
  type OnboardingEmployee,
  type OnboardingService,
} from "@/lib/business-onboarding";
import type { EmployeeWorkDay } from "@/lib/dashboard/types";
import { governmentPermissionLabel, type GovernmentPermissionPreset } from "@/lib/government/types";
import type { OrganizationType } from "@/lib/organization";
import { TanuBusinessLogo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

const privateSteps = [
  { label: "Үндсэн", title: "Байгууллагын үндсэн мэдээлэл", icon: Building2 },
  { label: "Төлбөр", title: "Захиалга, төлбөр ба банк", icon: CreditCard },
  { label: "Ажилтан", title: "Ажилтны мэдээлэл", icon: Users },
  { label: "Үйлчилгээ", title: "Үйлчилгээний мэдээлэл", icon: Sparkles },
  { label: "Хуваарь", title: "Ажлын цагийн хуваарь", icon: CalendarClock },
] as const;

const governmentSteps = [
  { label: "Үндсэн", title: "Төрийн байгууллагын үндсэн мэдээлэл", icon: Landmark },
  { label: "Бүтэц", title: "Хэлтэс, нэгжийн бүтэц", icon: Network },
  { label: "Ажилтан", title: "Албан хаагчдын мэдээлэл", icon: Users },
  { label: "Эрх", title: "Анхны эрхийн тохиргоо", icon: ShieldCheck },
  { label: "Хуваарь", title: "Ажлын цагийн хуваарь", icon: CalendarClock },
] as const;

const weekDays = [
  { value: 1, label: "Да" },
  { value: 2, label: "Мя" },
  { value: 3, label: "Лх" },
  { value: 4, label: "Пү" },
  { value: 5, label: "Ба" },
  { value: 6, label: "Бя" },
  { value: 0, label: "Ня" },
];

const paymentOptions = [
  { value: "cash", label: "Бэлэн мөнгө" },
  { value: "card", label: "Карт / POS" },
  { value: "qpay", label: "QPay" },
  { value: "bank", label: "Банкны шилжүүлэг" },
];

const initialOrganization = {
  name: "",
  ownerName: "",
  type: bizTypes[0].name,
  phone: "",
  email: "",
  address: "",
};

const initialBooking = {
  autoConfirm: true,
  minLeadTimeMin: 60,
  cancellationDeadlineHours: 12,
  paymentMethods: ["cash", "qpay"],
  bankName: "",
  accountHolder: "",
  accountNumber: "",
};

export function BusinessSignupPage() {
  const { login } = useAuth();
  const { setMode, theme, toggleTheme } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [organizationType, setOrganizationType] = useState<OrganizationType>("private");
  const [organization, setOrganization] = useState(initialOrganization);
  const [booking, setBooking] = useState(initialBooking);
  const [employees, setEmployees] = useState<OnboardingEmployee[]>([
    { name: "", position: "", phone: "", weeklySchedule: createDefaultWeeklySchedule() },
  ]);
  const [services, setServices] = useState<OnboardingService[]>([
    { name: "", durationMin: 60, price: 0 },
  ]);
  const [governmentDepartments, setGovernmentDepartments] = useState([
    "Захиргаа, удирдлагын хэлтэс",
  ]);
  const [governmentPermission, setGovernmentPermission] =
    useState<GovernmentPermissionPreset>("organization-admin");
  const [schedule, setSchedule] = useState({
    activeDays: [1, 2, 3, 4, 5, 6],
    startTime: "09:00",
    endTime: "18:00",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const steps = organizationType === "government" ? governmentSteps : privateSteps;

  const progress = ((step + 1) / steps.length) * 100;
  const ActiveIcon = steps[step].icon;

  const canRemoveEmployee = employees.length > 1;
  const canRemoveService = services.length > 1;

  const summary = useMemo(
    () => ({
      employees: employees.filter((item) => item.name.trim()).length,
      services: services.filter((item) => item.name.trim()).length,
      days: schedule.activeDays.length,
    }),
    [employees, services, schedule.activeDays],
  );

  const validateStep = () => {
    const next: Record<string, string> = {};
    if (step === 0) {
      if (!organization.name.trim()) next.name = "Байгууллагын нэр оруулна уу";
      if (!organization.ownerName.trim()) next.ownerName = "Эзэмшигчийн нэр оруулна уу";
      if (!organization.phone.trim()) next.phone = "Утасны дугаар оруулна уу";
      if (!organization.email.trim()) next.email = "И-мэйл оруулна уу";
      if (!organization.address.trim()) next.address = "Хаяг оруулна уу";
    }
    if (step === 1 && organizationType === "private") {
      if (booking.paymentMethods.length === 0) next.payment = "Төлбөрийн арга сонгоно уу";
      if (booking.paymentMethods.includes("bank")) {
        if (!booking.bankName.trim()) next.bankName = "Банк сонгоно уу";
        if (!booking.accountHolder.trim()) next.accountHolder = "Данс эзэмшигчийг оруулна уу";
        if (!booking.accountNumber.trim()) next.accountNumber = "Дансны дугаар оруулна уу";
      }
    }
    if (
      step === 1 &&
      organizationType === "government" &&
      governmentDepartments.some((department) => !department.trim())
    ) {
      next.departments = "Хэлтэс, нэгж бүрийн нэрийг оруулна уу";
    }
    if (step === 2) {
      if (employees.some((item) => !item.name.trim() || !item.position.trim())) {
        next.employees = "Ажилтан бүрийн нэр, албан тушаалыг оруулна уу";
      }
      if (
        employees.some(
          (item) =>
            !item.weeklySchedule.some((day) => day.enabled) ||
            item.weeklySchedule.some(
              (day) =>
                day.enabled && (!day.startTime || !day.endTime || day.startTime >= day.endTime),
            ),
        )
      ) {
        next.employeeSchedule =
          "Ажилтан бүрийн ажиллах өдөр, эхлэх болон дуусах цагийг зөв тохируулна уу";
      }
    }
    if (step === 3 && organizationType === "private") {
      if (services.some((item) => !item.name.trim() || item.durationMin <= 0 || item.price <= 0)) {
        next.services = "Үйлчилгээ бүрийн нэр, хугацаа, үнийг бүрэн оруулна уу";
      }
    }
    if (step === 4) {
      if (schedule.activeDays.length === 0) next.schedule = "Ажиллах өдөр сонгоно уу";
      if (schedule.startTime >= schedule.endTime) next.time = "Дуусах цаг эхлэх цагаас хойш байна";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const nextStep = () => {
    if (!validateStep()) return;
    setStep((current) => Math.min(current + 1, steps.length - 1));
    setErrors({});
  };

  const finish = () => {
    if (!validateStep()) return;
    const data: BusinessOnboardingData = {
      organizationType,
      organization,
      booking,
      employees,
      services: organizationType === "private" ? services : [],
      schedule,
      government:
        organizationType === "government"
          ? {
              departments: governmentDepartments.filter((department) => department.trim()),
              defaultPermissionPreset: governmentPermission,
            }
          : undefined,
      completedAt: new Date().toISOString(),
    };
    saveBusinessOnboarding(data);
    login(
      {
        role: organizationType === "government" ? "admin" : "owner",
        name: organization.ownerName,
        email: organization.email,
        org: organization.name,
        organizationType,
        permissionPreset: organizationType === "government" ? governmentPermission : undefined,
      },
      true,
    );
    setMode("business");
    navigate({ to: "/business/dashboard" });
  };

  const updateEmployee = (index: number, patch: Partial<OnboardingEmployee>) =>
    setEmployees((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)),
    );

  const updateEmployeeSchedule = (index: number, weeklySchedule: EmployeeWorkDay[]) =>
    updateEmployee(index, { weeklySchedule });

  const updateService = (index: number, patch: Partial<OnboardingService>) =>
    setServices((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)),
    );

  const togglePayment = (method: string) =>
    setBooking((current) => ({
      ...current,
      paymentMethods: current.paymentMethods.includes(method)
        ? current.paymentMethods.filter((item) => item !== method)
        : [...current.paymentMethods, method],
    }));

  const toggleDay = (day: number) =>
    setSchedule((current) => ({
      ...current,
      activeDays: current.activeDays.includes(day)
        ? current.activeDays.filter((item) => item !== day)
        : [...current.activeDays, day],
    }));

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[32rem] grid-bg opacity-[0.07] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        <div className="absolute top-[-12rem] right-[-10rem] h-[32rem] w-[32rem] rounded-full bg-[var(--brand-2)]/[0.07] blur-[140px]" />
        <div className="absolute bottom-[-12rem] left-[-10rem] h-[28rem] w-[28rem] rounded-full bg-[var(--brand)]/[0.06] blur-[130px]" />
      </div>

      <header className="relative z-20 border-b border-border/70 bg-background/80 backdrop-blur-xl">
        <div className="relative mx-auto flex h-14 max-w-[920px] items-center justify-between px-4 sm:px-6">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground sm:text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Нэвтрэх рүү буцах
          </Link>
          <TanuBusinessLogo className="absolute left-1/2 hidden h-7 -translate-x-1/2 sm:block" />
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Гэрэлтэй горим" : "Харанхуй горим"}
            className="grid h-8 w-8 place-items-center rounded-lg border border-border bg-surface/80 transition hover:bg-secondary"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-[920px] px-4 py-7 sm:px-6 sm:py-9">
        <div className="mb-5 text-center">
          <span className="inline-flex rounded-full border border-[var(--brand)]/15 bg-[var(--brand)]/[0.06] px-3 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--brand)]">
            Tanu Business
          </span>
          <h1 className="mt-2.5 text-2xl font-extrabold tracking-tight sm:text-[28px]">
            Байгууллага бүртгүүлэх
          </h1>
          <p className="mx-auto mt-1.5 max-w-xl text-sm text-muted-foreground">
            Байгууллагын мэдээллээ алхам алхмаар тохируулаад удирдлагын самбараа үүсгэнэ үү.
          </p>
        </div>

        <div className="overflow-hidden rounded-[22px] border border-border/80 bg-surface/90 shadow-[0_24px_70px_-48px_color-mix(in_oklch,var(--brand)_55%,transparent)] backdrop-blur">
          <div className="border-b border-border bg-surface-muted/25 px-5 py-4 sm:px-7 sm:py-5">
            <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-end sm:gap-4">
              <h2 className="text-sm font-semibold sm:text-base">Бизнесээ тохируулах</h2>
              <p className="text-xs text-muted-foreground sm:text-right">
                Dashboard-д шаардлагатай мэдээллээ оруулна уу.
              </p>
            </div>

            <div className="mt-3.5 hidden grid-cols-5 gap-1.5 sm:grid">
              {steps.map((item, index) => {
                const Icon = item.icon;
                const completed = index < step;
                const active = index === step;
                return (
                  <div
                    key={item.label}
                    className={`flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-[11px] font-medium ${
                      active
                        ? "bg-primary text-primary-foreground"
                        : completed
                          ? "bg-[color-mix(in_oklch,var(--success)_12%,transparent)] text-[var(--success)]"
                          : "text-muted-foreground"
                    }`}
                  >
                    {completed ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Icon className="h-3.5 w-3.5" />
                    )}
                    {item.label}
                  </div>
                );
              })}
            </div>
            <div className="mt-3 h-0.5 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-gradient-brand transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="p-5 sm:px-7 sm:py-6">
            <div className="mb-5 flex items-center gap-2.5">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[color-mix(in_oklch,var(--brand)_10%,transparent)] text-[var(--brand)]">
                <ActiveIcon className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[10px] font-medium text-muted-foreground">
                  {step + 1} / {steps.length}-р алхам
                </p>
                <h3 className="text-sm font-semibold sm:text-base">{steps[step].title}</h3>
              </div>
            </div>

            {step === 0 && (
              <div className="grid gap-3.5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <p className="mb-2 text-xs font-medium text-muted-foreground">
                    Байгууллагын төрөл
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => {
                        setOrganizationType("private");
                        setOrganization((current) => ({
                          ...current,
                          type: bizTypes[0].name,
                        }));
                        setStep(0);
                        setErrors({});
                      }}
                      className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition ${
                        organizationType === "private"
                          ? "border-[var(--brand)] bg-brand-soft ring-1 ring-[var(--brand)]/20"
                          : "border-border hover:bg-secondary"
                      }`}
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-surface text-[var(--brand)]">
                        <Building2 className="h-4 w-4" />
                      </span>
                      <span>
                        <span className="flex items-center gap-2 text-sm font-semibold">
                          Хувийн байгууллага
                          {organizationType === "private" && (
                            <Check className="h-3.5 w-3.5 text-[var(--brand)]" />
                          )}
                        </span>
                        <span className="mt-1 block text-xs leading-4 text-muted-foreground">
                          Захиалга, үйлчилгээ, борлуулалтын workspace
                        </span>
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOrganizationType("government");
                        setOrganization((current) => ({
                          ...current,
                          type: "Төрийн захиргааны байгууллага",
                        }));
                        setStep(0);
                        setErrors({});
                      }}
                      className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition ${
                        organizationType === "government"
                          ? "border-[var(--brand)] bg-brand-soft ring-1 ring-[var(--brand)]/20"
                          : "border-border hover:bg-secondary"
                      }`}
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-surface text-[var(--brand)]">
                        <Landmark className="h-4 w-4" />
                      </span>
                      <span>
                        <span className="flex items-center gap-2 text-sm font-semibold">
                          Төрийн байгууллага
                          {organizationType === "government" && (
                            <Check className="h-3.5 w-3.5 text-[var(--brand)]" />
                          )}
                        </span>
                        <span className="mt-1 block text-xs leading-4 text-muted-foreground">
                          Албан бичиг, даалгавар, HR, өргөдлийн workspace
                        </span>
                      </span>
                    </button>
                  </div>
                </div>
                <Field label="Байгууллагын нэр" error={errors.name}>
                  <Input
                    value={organization.name}
                    onChange={(event) =>
                      setOrganization((current) => ({ ...current, name: event.target.value }))
                    }
                    placeholder="Жишээ: Aura Beauty"
                  />
                </Field>
                <Field
                  label={
                    organizationType === "government"
                      ? "Байгууллагын админы нэр"
                      : "Эзэмшигчийн нэр"
                  }
                  error={errors.ownerName}
                >
                  <Input
                    value={organization.ownerName}
                    onChange={(event) =>
                      setOrganization((current) => ({ ...current, ownerName: event.target.value }))
                    }
                    placeholder="Овог нэр"
                  />
                </Field>
                <Field
                  label={
                    organizationType === "government"
                      ? "Байгууллагын ангилал"
                      : "Үйл ажиллагааны чиглэл"
                  }
                >
                  <select
                    value={organization.type}
                    onChange={(event) =>
                      setOrganization((current) => ({ ...current, type: event.target.value }))
                    }
                    className="h-10 w-full rounded-md border border-input bg-surface px-3 text-sm"
                  >
                    {organizationType === "government" ? (
                      <>
                        <option>Төрийн захиргааны байгууллага</option>
                        <option>Нутгийн захиргааны байгууллага</option>
                        <option>Төрийн үйлчилгээний байгууллага</option>
                        <option>Төрийн өмчит байгууллага</option>
                      </>
                    ) : (
                      bizTypes.map((item) => <option key={item.name}>{item.name}</option>)
                    )}
                  </select>
                </Field>
                <Field label="Утас" error={errors.phone}>
                  <Input
                    value={organization.phone}
                    onChange={(event) =>
                      setOrganization((current) => ({ ...current, phone: event.target.value }))
                    }
                    placeholder="9911 2233"
                  />
                </Field>
                <Field label="И-мэйл" error={errors.email}>
                  <Input
                    type="email"
                    value={organization.email}
                    onChange={(event) =>
                      setOrganization((current) => ({ ...current, email: event.target.value }))
                    }
                    placeholder="info@company.mn"
                  />
                </Field>
                <Field
                  label={
                    organizationType === "government" ? "Байгууллагын хаяг" : "Үндсэн салбарын хаяг"
                  }
                  error={errors.address}
                >
                  <Input
                    value={organization.address}
                    onChange={(event) =>
                      setOrganization((current) => ({ ...current, address: event.target.value }))
                    }
                    placeholder="Дүүрэг, хороо, гудамж"
                  />
                </Field>
              </div>
            )}

            {step === 1 && organizationType === "private" && (
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  <label className="flex items-center justify-between rounded-xl border border-border p-3 sm:col-span-3">
                    <div>
                      <p className="text-sm font-medium">Захиалгыг автоматаар баталгаажуулах</p>
                      <p className="text-xs text-muted-foreground">
                        Шинэ захиалга шууд баталгаажсан төлөвтэй орно.
                      </p>
                    </div>
                    <Switch
                      checked={booking.autoConfirm}
                      onCheckedChange={(checked) =>
                        setBooking((current) => ({ ...current, autoConfirm: checked }))
                      }
                    />
                  </label>
                  <Field label="Урьдчилж захиалах доод хугацаа">
                    <select
                      value={booking.minLeadTimeMin}
                      onChange={(event) =>
                        setBooking((current) => ({
                          ...current,
                          minLeadTimeMin: Number(event.target.value),
                        }))
                      }
                      className="h-10 w-full rounded-md border border-input bg-surface px-3 text-sm"
                    >
                      <option value={30}>30 минут</option>
                      <option value={60}>1 цаг</option>
                      <option value={180}>3 цаг</option>
                      <option value={1440}>1 өдөр</option>
                    </select>
                  </Field>
                  <Field label="Цуцлах боломжтой хугацаа">
                    <select
                      value={booking.cancellationDeadlineHours}
                      onChange={(event) =>
                        setBooking((current) => ({
                          ...current,
                          cancellationDeadlineHours: Number(event.target.value),
                        }))
                      }
                      className="h-10 w-full rounded-md border border-input bg-surface px-3 text-sm"
                    >
                      <option value={1}>1 цагийн өмнө</option>
                      <option value={6}>6 цагийн өмнө</option>
                      <option value={12}>12 цагийн өмнө</option>
                      <option value={24}>1 өдрийн өмнө</option>
                    </select>
                  </Field>
                </div>

                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Төлбөр хүлээн авах арга
                  </p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-4">
                    {paymentOptions.map((option) => (
                      <label
                        key={option.value}
                        className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-xs font-medium"
                      >
                        <Checkbox
                          checked={booking.paymentMethods.includes(option.value)}
                          onCheckedChange={() => togglePayment(option.value)}
                        />
                        {option.label}
                      </label>
                    ))}
                  </div>
                  {errors.payment && (
                    <p className="mt-1 text-xs text-destructive">{errors.payment}</p>
                  )}
                </div>

                {booking.paymentMethods.includes("bank") && (
                  <div className="grid gap-3 rounded-xl border border-border bg-surface-muted/30 p-4 sm:grid-cols-3">
                    <Field label="Банк" error={errors.bankName}>
                      <Input
                        value={booking.bankName}
                        onChange={(event) =>
                          setBooking((current) => ({ ...current, bankName: event.target.value }))
                        }
                        placeholder="Хаан банк"
                      />
                    </Field>
                    <Field label="Данс эзэмшигч" error={errors.accountHolder}>
                      <Input
                        value={booking.accountHolder}
                        onChange={(event) =>
                          setBooking((current) => ({
                            ...current,
                            accountHolder: event.target.value,
                          }))
                        }
                      />
                    </Field>
                    <Field label="Дансны дугаар" error={errors.accountNumber}>
                      <Input
                        value={booking.accountNumber}
                        onChange={(event) =>
                          setBooking((current) => ({
                            ...current,
                            accountNumber: event.target.value,
                          }))
                        }
                      />
                    </Field>
                  </div>
                )}
              </div>
            )}

            {step === 1 && organizationType === "government" && (
              <div className="space-y-3">
                <div className="rounded-xl border border-[var(--brand)]/20 bg-brand-soft/50 p-4">
                  <p className="text-sm font-semibold">Байгууллагын анхан шатны бүтэц</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Дараа нь Organization → Department → Division → Unit бүтэц болгон дэлгэрүүлж,
                    удирдлага болон орон тоог тохируулах боломжтой.
                  </p>
                </div>
                {governmentDepartments.map((department, index) => (
                  <div
                    key={index}
                    className="grid gap-2 rounded-xl border border-border bg-surface-muted/25 p-3 sm:grid-cols-[1fr_auto]"
                  >
                    <Input
                      value={department}
                      onChange={(event) =>
                        setGovernmentDepartments((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index ? event.target.value : item,
                          ),
                        )
                      }
                      placeholder="Жишээ: Захиргаа, удирдлагын хэлтэс"
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      disabled={governmentDepartments.length === 1}
                      onClick={() =>
                        setGovernmentDepartments((current) =>
                          current.filter((_, itemIndex) => itemIndex !== index),
                        )
                      }
                      aria-label="Хэлтэс хасах"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {errors.departments && (
                  <p className="text-xs text-destructive">{errors.departments}</p>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => setGovernmentDepartments((current) => [...current, ""])}
                >
                  <Plus className="h-3.5 w-3.5" /> Хэлтэс, нэгж нэмэх
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-3">
                {employees.map((employee, index) => (
                  <div
                    key={index}
                    className="grid gap-2.5 rounded-xl border border-border bg-surface-muted/25 p-3 sm:grid-cols-[1fr_1fr_1fr_auto]"
                  >
                    <Input
                      value={employee.name}
                      onChange={(event) => updateEmployee(index, { name: event.target.value })}
                      placeholder="Ажилтны нэр"
                    />
                    <Input
                      value={employee.position}
                      onChange={(event) => updateEmployee(index, { position: event.target.value })}
                      placeholder="Албан тушаал"
                    />
                    <Input
                      value={employee.phone}
                      onChange={(event) => updateEmployee(index, { phone: event.target.value })}
                      placeholder="Утас"
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      disabled={!canRemoveEmployee}
                      onClick={() =>
                        setEmployees((current) =>
                          current.filter((_, itemIndex) => itemIndex !== index),
                        )
                      }
                      aria-label="Ажилтан хасах"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <details className="group sm:col-span-4">
                      <summary className="flex cursor-pointer list-none items-center justify-between rounded-lg border border-border/70 bg-surface px-3 py-2 text-xs font-medium">
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarClock className="h-3.5 w-3.5 text-[var(--brand)]" />
                          Ажиллах өдөр, цаг тохируулах
                        </span>
                        <span className="text-[10px] font-normal text-muted-foreground">
                          {employee.weeklySchedule.filter((day) => day.enabled).length} өдөр
                        </span>
                      </summary>
                      <EmployeeScheduleEditor
                        value={employee.weeklySchedule}
                        onChange={(weeklySchedule) => updateEmployeeSchedule(index, weeklySchedule)}
                      />
                    </details>
                  </div>
                ))}
                {errors.employees && <p className="text-xs text-destructive">{errors.employees}</p>}
                {errors.employeeSchedule && (
                  <p className="text-xs text-destructive">{errors.employeeSchedule}</p>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() =>
                    setEmployees((current) => [
                      ...current,
                      {
                        name: "",
                        position: "",
                        phone: "",
                        weeklySchedule: createDefaultWeeklySchedule(),
                      },
                    ])
                  }
                >
                  <Plus className="h-3.5 w-3.5" /> Ажилтан нэмэх
                </Button>
              </div>
            )}

            {step === 3 && organizationType === "private" && (
              <div className="space-y-3">
                {services.map((service, index) => (
                  <div
                    key={index}
                    className="grid gap-2.5 rounded-xl border border-border bg-surface-muted/25 p-3 sm:grid-cols-[1.5fr_1fr_1fr_auto]"
                  >
                    <Input
                      value={service.name}
                      onChange={(event) => updateService(index, { name: event.target.value })}
                      placeholder="Үйлчилгээний нэр"
                    />
                    <Input
                      type="number"
                      min={5}
                      step={5}
                      value={service.durationMin || ""}
                      onChange={(event) =>
                        updateService(index, { durationMin: Number(event.target.value) })
                      }
                      placeholder="Хугацаа (мин)"
                    />
                    <Input
                      type="number"
                      min={0}
                      step={1000}
                      value={service.price || ""}
                      onChange={(event) =>
                        updateService(index, { price: Number(event.target.value) })
                      }
                      placeholder="Үнэ (₮)"
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      disabled={!canRemoveService}
                      onClick={() =>
                        setServices((current) =>
                          current.filter((_, itemIndex) => itemIndex !== index),
                        )
                      }
                      aria-label="Үйлчилгээ хасах"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {errors.services && <p className="text-xs text-destructive">{errors.services}</p>}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() =>
                    setServices((current) => [...current, { name: "", durationMin: 60, price: 0 }])
                  }
                >
                  <Plus className="h-3.5 w-3.5" /> Үйлчилгээ нэмэх
                </Button>
              </div>
            )}

            {step === 3 && organizationType === "government" && (
              <div className="space-y-4">
                <div className="rounded-xl border border-[var(--brand)]/20 bg-brand-soft/50 p-4">
                  <p className="text-sm font-semibold">Байгууллагын админы эрх</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Admin болон Employee нь үндсэн account type хэвээр байна. Доорх preset нь
                    модуль, үйлдлийн нарийвчилсан эрхийг тодорхойлно.
                  </p>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {(
                    [
                      "system-admin",
                      "organization-admin",
                      "executive",
                      "department-head",
                      "records-officer",
                      "hr-officer",
                      "petition-officer",
                      "employee",
                      "auditor",
                      "read-only",
                    ] as GovernmentPermissionPreset[]
                  ).map((permission) => (
                    <button
                      key={permission}
                      type="button"
                      onClick={() => setGovernmentPermission(permission)}
                      className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-3 text-left text-xs font-medium transition ${
                        governmentPermission === permission
                          ? "border-[var(--brand)] bg-brand-soft text-[var(--brand)]"
                          : "border-border hover:bg-secondary"
                      }`}
                    >
                      {governmentPermissionLabel[permission]}
                      {governmentPermission === permission && <Check className="h-3.5 w-3.5" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-5">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Ажиллах өдрүүд</p>
                  <div className="mt-2 grid grid-cols-7 gap-2">
                    {weekDays.map((day) => {
                      const active = schedule.activeDays.includes(day.value);
                      return (
                        <button
                          key={day.value}
                          type="button"
                          onClick={() => toggleDay(day.value)}
                          className={`rounded-lg border px-2 py-2.5 text-xs font-semibold transition ${
                            active
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border hover:bg-secondary"
                          }`}
                        >
                          {day.label}
                        </button>
                      );
                    })}
                  </div>
                  {errors.schedule && (
                    <p className="mt-1 text-xs text-destructive">{errors.schedule}</p>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Нээх цаг">
                    <Input
                      type="time"
                      value={schedule.startTime}
                      onChange={(event) =>
                        setSchedule((current) => ({ ...current, startTime: event.target.value }))
                      }
                    />
                  </Field>
                  <Field label="Хаах цаг" error={errors.time}>
                    <Input
                      type="time"
                      value={schedule.endTime}
                      onChange={(event) =>
                        setSchedule((current) => ({ ...current, endTime: event.target.value }))
                      }
                    />
                  </Field>
                </div>

                <div className="grid gap-3 rounded-xl border border-[var(--brand)]/20 bg-[color-mix(in_oklch,var(--brand)_6%,transparent)] p-4 text-center sm:grid-cols-3">
                  <SummaryItem value={summary.employees} label="ажилтан" />
                  <SummaryItem
                    value={
                      organizationType === "government"
                        ? governmentDepartments.filter((department) => department.trim()).length
                        : summary.services
                    }
                    label={organizationType === "government" ? "хэлтэс, нэгж" : "үйлчилгээ"}
                  />
                  <SummaryItem value={summary.days} label="ажиллах өдөр" />
                </div>
              </div>
            )}

            <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
              <Button
                type="button"
                variant="ghost"
                disabled={step === 0}
                onClick={() => {
                  setStep((current) => Math.max(0, current - 1));
                  setErrors({});
                }}
                className="gap-1.5"
              >
                <ArrowLeft className="h-4 w-4" /> Буцах
              </Button>
              {step < steps.length - 1 ? (
                <Button type="button" onClick={nextStep} className="gap-1.5">
                  Үргэлжлүүлэх <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button type="button" onClick={finish} className="gap-1.5">
                  Dashboard нээх <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="mt-1">{children}</div>
      {error && <span className="mt-1 block text-[11px] text-destructive">{error}</span>}
    </label>
  );
}

function EmployeeScheduleEditor({
  value,
  onChange,
}: {
  value: EmployeeWorkDay[];
  onChange: (value: EmployeeWorkDay[]) => void;
}) {
  const updateDay = (day: number, patch: Partial<EmployeeWorkDay>) =>
    onChange(value.map((item) => (item.day === day ? { ...item, ...patch } : item)));

  return (
    <div className="mt-2 overflow-hidden rounded-lg border border-border/70 bg-surface">
      {weekDays.map((weekDay) => {
        const day = value.find((item) => item.day === weekDay.value);
        if (!day) return null;
        return (
          <div
            key={day.day}
            className="grid grid-cols-[64px_1fr_1fr] items-center gap-2 border-b border-border/60 px-2.5 py-1.5 last:border-b-0"
          >
            <label className="flex items-center gap-2 text-xs font-medium">
              <Checkbox
                checked={day.enabled}
                onCheckedChange={(checked) => updateDay(day.day, { enabled: checked === true })}
              />
              {weekDay.label}
            </label>
            <Input
              type="time"
              value={day.startTime}
              disabled={!day.enabled}
              onChange={(event) => updateDay(day.day, { startTime: event.target.value })}
              className="h-8 text-xs"
              aria-label={`${weekDay.label} эхлэх цаг`}
            />
            <Input
              type="time"
              value={day.endTime}
              disabled={!day.enabled}
              onChange={(event) => updateDay(day.day, { endTime: event.target.value })}
              className="h-8 text-xs"
              aria-label={`${weekDay.label} дуусах цаг`}
            />
          </div>
        );
      })}
    </div>
  );
}

function SummaryItem({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <p className="text-lg font-bold text-[var(--brand)]">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
