import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Bell,
  Building2,
  CalendarClock,
  Check,
  CreditCard,
  Eye,
  Globe2,
  IdCard,
  Image as ImageIcon,
  Laptop,
  LayoutList,
  Lock,
  MapPin,
  ShieldCheck,
  Smartphone,
  Store,
  UserRoundCog,
  Users,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useDashboardData } from "@/lib/dashboard/store";
import { useGovernmentData } from "@/lib/government/store";
import {
  governmentPermissionLabel,
  governmentPermissionModules,
  type GovernmentPermissionPreset,
} from "@/lib/government/types";
import { normalizeOrganizationType, type OrganizationType } from "@/lib/organization";
import {
  normalizeSettingsSection,
  settingsOrganizationConfig,
  type SettingsSectionKey,
} from "@/lib/settings/config";
import { CURRENT_SUBSCRIPTION } from "@/lib/dashboard/billing-data";
import { DASHBOARD_NAV, roleLabel } from "../nav-config";
import type { BusinessRole } from "@/lib/dashboard/types";
import { TanuMark } from "@/components/brand/Logo";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { FormRow } from "../ui";
import {
  SettingsCard,
  SettingsGateway,
  SettingsHeader,
  SettingsShell,
} from "../settings/SettingsShell";
import { SaveBar } from "../settings/SaveBar";
import { QrSettingsPage } from "../settings/QrSettingsPage";
import { createInitialQrRecords, type SettingsQrRecord } from "@/lib/settings/qr-data";
import { QrPromotionPage } from "./QrPromotionPage";

interface SettingsPageProps {
  activeSection?: SettingsSectionKey;
  onSectionChange?: (section: SettingsSectionKey) => void;
}

const initialNotificationPreferences = {
  staffNewBooking: true,
  customerReminder: true,
  dailySummary: false,
};

const initialPaymentMethods = { cash: true, card: true, qpay: true, transfer: false };

const initialPublicLinks = {
  publicUrl: "https://tanu.mn/public/aura-beauty",
  bookingUrl: "https://tanu.mn/book/aura-beauty",
  shortLink: "tanu.mn/aura",
  active: true,
  profileVisible: true,
  phoneVisible: true,
  addressVisible: true,
  employeesVisible: true,
  servicesVisible: true,
};

export function SettingsPage({
  activeSection = "organization",
  onSectionChange,
}: SettingsPageProps) {
  const { session } = useAuth();
  const organizationType = normalizeOrganizationType(session?.organizationType);
  const config = settingsOrganizationConfig[organizationType];
  const section = normalizeSettingsSection(activeSection, organizationType);
  const {
    orgProfile,
    updateOrgProfile,
    bookingSettings,
    updateBookingSettings,
    branches,
    updateBranch,
    employees,
    services,
  } = useDashboardData();
  const government = useGovernmentData();

  const [orgForm, setOrgForm] = useState(orgProfile);
  const [bookingForm, setBookingForm] = useState(bookingSettings);
  const [notificationPreferences, setNotificationPreferences] = useState(
    initialNotificationPreferences,
  );
  const [savedNotificationPreferences, setSavedNotificationPreferences] = useState(
    initialNotificationPreferences,
  );
  const [paymentMethods, setPaymentMethods] = useState(initialPaymentMethods);
  const [savedPaymentMethods, setSavedPaymentMethods] = useState(initialPaymentMethods);
  const [twoFactor, setTwoFactor] = useState(false);
  const [savedTwoFactor, setSavedTwoFactor] = useState(false);
  const [workingHours, setWorkingHours] = useState<Record<string, string>>(() =>
    Object.fromEntries(branches.map((branch) => [branch.id, branch.workingHours])),
  );
  const [savedWorkingHours, setSavedWorkingHours] = useState(workingHours);
  const [branchStates, setBranchStates] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(branches.map((branch) => [branch.id, branch.active])),
  );
  const [savedBranchStates, setSavedBranchStates] = useState(branchStates);
  const [publicLinks, setPublicLinks] = useState(() => ({
    ...initialPublicLinks,
    publicUrl:
      organizationType === "government"
        ? "https://tanu.mn/government/public/information"
        : initialPublicLinks.publicUrl,
    bookingUrl:
      organizationType === "government"
        ? "https://tanu.mn/government/public/request"
        : initialPublicLinks.bookingUrl,
  }));
  const [savedPublicLinks, setSavedPublicLinks] = useState(publicLinks);
  const [qrRecords, setQrRecords] = useState<SettingsQrRecord[]>(() =>
    createInitialQrRecords(organizationType, config.organizationId, orgProfile.name),
  );
  const [savingSection, setSavingSection] = useState<SettingsSectionKey | null>(null);
  const [orgErrors, setOrgErrors] = useState<Record<string, string>>({});
  const [logoData, setLogoData] = useState("");

  const dirty = useMemo(
    () => ({
      organization: JSON.stringify(orgForm) !== JSON.stringify(orgProfile),
      booking: JSON.stringify(bookingForm) !== JSON.stringify(bookingSettings),
      schedule: JSON.stringify(workingHours) !== JSON.stringify(savedWorkingHours),
      branches: JSON.stringify(branchStates) !== JSON.stringify(savedBranchStates),
      notifications:
        JSON.stringify(notificationPreferences) !== JSON.stringify(savedNotificationPreferences),
      billing: JSON.stringify(paymentMethods) !== JSON.stringify(savedPaymentMethods),
      security: twoFactor !== savedTwoFactor,
      "public-links": JSON.stringify(publicLinks) !== JSON.stringify(savedPublicLinks),
    }),
    [
      bookingForm,
      bookingSettings,
      branchStates,
      notificationPreferences,
      orgForm,
      orgProfile,
      paymentMethods,
      publicLinks,
      savedBranchStates,
      savedNotificationPreferences,
      savedPaymentMethods,
      savedPublicLinks,
      savedTwoFactor,
      savedWorkingHours,
      twoFactor,
      workingHours,
    ],
  );
  const hasUnsavedChanges = Object.values(dirty).some(Boolean);

  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [hasUnsavedChanges]);

  const navigateSection = (nextSection: SettingsSectionKey) => {
    onSectionChange?.(nextSection);
  };

  const simulateSave = async (target: SettingsSectionKey, action: () => void, message: string) => {
    setSavingSection(target);
    await new Promise((resolve) => window.setTimeout(resolve, 420));
    try {
      action();
      toast.success(message);
    } catch {
      toast.error("Тохиргоо хадгалахад алдаа гарлаа");
    } finally {
      setSavingSection(null);
    }
  };

  const saveOrganization = () => {
    const next: Record<string, string> = {};
    if (!orgForm.name.trim()) next.name = "Байгууллагын нэр шаардлагатай";
    if (orgForm.email && !/^\S+@\S+\.\S+$/.test(orgForm.email))
      next.email = "И-мэйл хаяг буруу байна";
    if (orgForm.website && !/^https?:\/\//.test(orgForm.website))
      next.website = "https:// эсвэл http://-оор эхэлсэн холбоос оруулна уу";
    setOrgErrors(next);
    if (Object.keys(next).length > 0) {
      toast.error("Байгууллагын мэдээллийг шалгана уу");
      return;
    }
    void simulateSave(
      "organization",
      () => updateOrgProfile(orgForm),
      "Байгууллагын тохиргоо хадгалагдлаа",
    );
  };

  const saveBooking = () => {
    if (
      bookingForm.minLeadTimeMin < 0 ||
      bookingForm.maxFutureDays < 1 ||
      bookingForm.slotIntervalMin < 1
    ) {
      toast.error("Захиалгын хугацааны утгуудыг шалгана уу");
      return;
    }
    void simulateSave(
      "booking",
      () => updateBookingSettings(bookingForm),
      "Захиалгын тохиргоо хадгалагдлаа",
    );
  };

  const saveSchedule = () => {
    void simulateSave(
      "schedule",
      () => {
        branches.forEach((branch) =>
          updateBranch(branch.id, { workingHours: workingHours[branch.id] }),
        );
        setSavedWorkingHours(workingHours);
      },
      "Ажиллах цагийн тохиргоо хадгалагдлаа",
    );
  };

  const saveBranches = () => {
    void simulateSave(
      "branches",
      () => {
        branches.forEach((branch) => updateBranch(branch.id, { active: branchStates[branch.id] }));
        setSavedBranchStates(branchStates);
      },
      `${config.terms.branch}-ын төлөв хадгалагдлаа`,
    );
  };

  const leaveGuard = (event: React.MouseEvent) => {
    if (hasUnsavedChanges && !window.confirm("Хадгалаагүй өөрчлөлт байна. Хуудас солих уу?")) {
      event.preventDefault();
    }
  };

  const renderSection = () => {
    switch (section) {
      case "organization":
        return (
          <OrganizationSettings
            organizationType={organizationType}
            form={orgForm}
            setForm={setOrgForm}
            errors={orgErrors}
            logoData={logoData}
            onLogoChange={setLogoData}
            dirty={dirty.organization}
            saving={savingSection === "organization"}
            onSave={saveOrganization}
            onReset={() => {
              setOrgForm(orgProfile);
              setOrgErrors({});
            }}
          />
        );
      case "profile":
        return organizationType === "private" ? (
          <SettingsGateway
            icon={<IdCard />}
            title="Байгууллагын профайл"
            description="Tanu апп болон нийтийн хуудсанд харагдах профайлын мэдээллийг удирдана."
            stats={[
              {
                label: "Нийтийн төлөв",
                value: orgProfile.publicBookingVisible ? "Идэвхтэй" : "Идэвхгүй",
              },
              {
                label: "Идэвхтэй үйлчилгээ",
                value: `${services.filter((item) => item.active).length}`,
              },
              { label: "Салбар", value: `${branches.filter((item) => item.active).length}` },
            ]}
            action={
              <Button asChild className="rounded-lg">
                <Link to="/business/dashboard/org-profile" onClick={leaveGuard}>
                  <Eye /> Профайл удирдах
                </Link>
              </Button>
            }
          />
        ) : (
          <PublicProfileSummary
            organizationName={orgProfile.name}
            description={orgProfile.shortDescription}
            publicUrl={publicLinks.publicUrl}
            onOpenLinks={() => navigateSection("public-links")}
          />
        );
      case "branches":
        return (
          <BranchSettings
            organizationType={organizationType}
            branchStates={branchStates}
            setBranchStates={setBranchStates}
            dirty={dirty.branches}
            saving={savingSection === "branches"}
            onSave={saveBranches}
            onReset={() => setBranchStates(savedBranchStates)}
            onBeforeLeave={leaveGuard}
          />
        );
      case "employees":
        return organizationType === "government" ? (
          <SettingsGateway
            icon={<Users />}
            title="Албан хаагч"
            description="Албан хаагч, албан тушаал болон газар хэлтсийн мэдээллийг удирдана."
            stats={[
              { label: "Нийт албан хаагч", value: `${government.employees.length}` },
              { label: "Газар, хэлтэс", value: `${government.departments.length}` },
              {
                label: "Идэвхтэй",
                value: `${government.employees.filter((item) => item.online).length}`,
              },
            ]}
            action={
              <Button asChild>
                <Link to="/business/dashboard/government/$module" params={{ module: "hr" }}>
                  Хүний нөөц рүү очих
                </Link>
              </Button>
            }
          />
        ) : (
          <SettingsGateway
            icon={<Users />}
            title="Ажилтан"
            description="Ажилтны мэдээлэл, нэвтрэх эрх, хуваарь болон хүсэлтийг удирдана."
            stats={[
              { label: "Нийт ажилтан", value: `${employees.length}` },
              { label: "Идэвхтэй", value: `${employees.filter((item) => item.active).length}` },
              { label: "Салбар", value: `${branches.length}` },
            ]}
            action={
              <Button asChild>
                <Link to="/business/dashboard/employees" onClick={leaveGuard}>
                  Ажилтнуудыг удирдах
                </Link>
              </Button>
            }
          />
        );
      case "access":
        return <AccessSettings organizationType={organizationType} />;
      case "services":
        return (
          <SettingsGateway
            icon={<LayoutList />}
            title="Үйлчилгээ"
            description="Үйлчилгээ, ангилал, үнэ болон ажилтны хуваарилалтыг existing хэсгээс удирдана."
            stats={[
              { label: "Нийт үйлчилгээ", value: `${services.length}` },
              { label: "Идэвхтэй", value: `${services.filter((item) => item.active).length}` },
              { label: "Ангилал", value: `${new Set(services.map((item) => item.category)).size}` },
            ]}
            action={
              <Button asChild>
                <Link to="/business/dashboard/services" onClick={leaveGuard}>
                  Үйлчилгээ удирдах
                </Link>
              </Button>
            }
          />
        );
      case "booking":
        return (
          <BookingSettings
            form={bookingForm}
            setForm={setBookingForm}
            dirty={dirty.booking}
            saving={savingSection === "booking"}
            onSave={saveBooking}
            onReset={() => setBookingForm(bookingSettings)}
          />
        );
      case "schedule":
        return (
          <ScheduleSettings
            organizationType={organizationType}
            workingHours={workingHours}
            setWorkingHours={setWorkingHours}
            dirty={dirty.schedule}
            saving={savingSection === "schedule"}
            onSave={saveSchedule}
            onReset={() => setWorkingHours(savedWorkingHours)}
          />
        );
      case "attendance":
        return (
          <SettingsGateway
            icon={<UserRoundCog />}
            title="Ирц, цаг бүртгэл"
            description={
              organizationType === "government"
                ? "Албан хаагчдын цахим ирц, ажлын цаг, чөлөө болон томилолтын мэдээлэл."
                : "Ажилтнуудын ирц, хоцролт, ажилласан цаг болон чөлөөний хүсэлтийг хянана."
            }
            stats={
              organizationType === "government"
                ? [
                    { label: "Нийт албан хаагч", value: `${government.employees.length}` },
                    {
                      label: "Өнөөдөр ирсэн",
                      value: `${government.employees.filter((item) => item.attendanceStatus === "present").length}`,
                    },
                    {
                      label: "Зайнаас",
                      value: `${government.employees.filter((item) => item.attendanceStatus === "remote").length}`,
                    },
                  ]
                : [
                    { label: "Нийт ажилтан", value: `${employees.length}` },
                    {
                      label: "Ирцийн мэдээлэлтэй",
                      value: `${employees.filter((item) => item.attendance.length > 0).length}`,
                    },
                    {
                      label: "Идэвхтэй салбар",
                      value: `${branches.filter((item) => item.active).length}`,
                    },
                  ]
            }
            action={
              organizationType === "government" ? (
                <Button asChild>
                  <Link
                    to="/business/dashboard/government/$module"
                    params={{ module: "attendance" }}
                  >
                    Ирцийн хэсэг нээх
                  </Link>
                </Button>
              ) : (
                <Button asChild>
                  <Link to="/business/dashboard/employee-schedule" onClick={leaveGuard}>
                    Ирцийн тайлан нээх
                  </Link>
                </Button>
              )
            }
          />
        );
      case "notifications":
        return (
          <NotificationSettings
            organizationType={organizationType}
            preferences={notificationPreferences}
            setPreferences={setNotificationPreferences}
            dirty={dirty.notifications}
            saving={savingSection === "notifications"}
            onSave={() =>
              void simulateSave(
                "notifications",
                () => setSavedNotificationPreferences(notificationPreferences),
                "Мэдэгдлийн тохиргоо хадгалагдлаа",
              )
            }
            onReset={() => setNotificationPreferences(savedNotificationPreferences)}
          />
        );
      case "qr":
        return (
          <QrSettingsPage
            organizationType={organizationType}
            records={qrRecords}
            onRecordsChange={setQrRecords}
            publicLinks={[
              { label: "Нийтийн хуудас", url: publicLinks.publicUrl },
              {
                label: organizationType === "government" ? "Хүсэлт илгээх" : "Цаг захиалах",
                url: publicLinks.bookingUrl,
              },
            ]}
          />
        );
      case "promotional-materials":
        return (
          <div className="space-y-6">
            <SettingsHeader
              eyebrow="Сурталчилгаа ба холбоос"
              title="Сурталчилгааны материал"
              description="Үүсгэсэн QR кодоо A5 stand, brochure болон бусад controlled template-д байрлуулна."
            />
            <QrPromotionPage
              embedded
              organizationType={organizationType}
              availableQrCodes={qrRecords
                .filter(
                  (record) =>
                    record.organizationId === config.organizationId && record.status === "active",
                )
                .map((record) => ({
                  id: record.id,
                  name: record.name,
                  destinationUrl: record.destinationUrl,
                }))}
            />
          </div>
        );
      case "public-links":
        return (
          <PublicLinksSettings
            organizationType={organizationType}
            values={publicLinks}
            setValues={setPublicLinks}
            dirty={dirty["public-links"]}
            saving={savingSection === "public-links"}
            onSave={() =>
              void simulateSave(
                "public-links",
                () => setSavedPublicLinks(publicLinks),
                "Нийтийн холбоосын тохиргоо хадгалагдлаа",
              )
            }
            onReset={() => setPublicLinks(savedPublicLinks)}
          />
        );
      case "security":
        return (
          <SecuritySettings
            twoFactor={twoFactor}
            setTwoFactor={setTwoFactor}
            dirty={dirty.security}
            saving={savingSection === "security"}
            onSave={() =>
              void simulateSave(
                "security",
                () => setSavedTwoFactor(twoFactor),
                "Аюулгүй байдлын тохиргоо хадгалагдлаа",
              )
            }
            onReset={() => setTwoFactor(savedTwoFactor)}
          />
        );
      case "billing":
        return (
          <BillingSettings
            methods={paymentMethods}
            setMethods={setPaymentMethods}
            dirty={dirty.billing}
            saving={savingSection === "billing"}
            onSave={() =>
              void simulateSave(
                "billing",
                () => setSavedPaymentMethods(paymentMethods),
                "Төлбөрийн тохиргоо хадгалагдлаа",
              )
            }
            onReset={() => setPaymentMethods(savedPaymentMethods)}
            onBeforeLeave={leaveGuard}
          />
        );
    }
  };

  if (
    organizationType === "government" &&
    !["system-admin", "organization-admin"].includes(government.activePermission)
  ) {
    return (
      <div className="mx-auto grid min-h-[60vh] max-w-xl place-items-center">
        <div className="rounded-2xl border border-border/80 bg-surface/85 p-8 text-center shadow-sm">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-soft text-[var(--brand)]">
            <Lock className="h-6 w-6" />
          </span>
          <h1 className="mt-4 font-display text-lg font-extrabold">Тохиргоонд хандах эрхгүй</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {governmentPermissionLabel[government.activePermission]} эрхээр байгууллагын системийн
            тохиргоог өөрчлөх боломжгүй.
          </p>
          <Button asChild className="mt-5">
            <Link to="/business/dashboard">Хяналтын самбарт буцах</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SettingsShell
      organizationType={organizationType}
      activeSection={section}
      onSectionChange={navigateSection}
      hasUnsavedChanges={hasUnsavedChanges}
    >
      {renderSection()}
    </SettingsShell>
  );
}

type OrganizationForm = ReturnType<typeof useDashboardData>["orgProfile"];

function OrganizationSettings({
  organizationType,
  form,
  setForm,
  errors,
  logoData,
  onLogoChange,
  dirty,
  saving,
  onSave,
  onReset,
}: {
  organizationType: OrganizationType;
  form: OrganizationForm;
  setForm: React.Dispatch<React.SetStateAction<OrganizationForm>>;
  errors: Record<string, string>;
  logoData: string;
  onLogoChange: (value: string) => void;
  dirty: boolean;
  saving: boolean;
  onSave: () => void;
  onReset: () => void;
}) {
  const government = organizationType === "government";
  const loadLogo = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onLogoChange(String(reader.result ?? ""));
      toast.success("Лого preview шинэчлэгдлээ");
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-5">
      <SettingsHeader
        eyebrow="Үндсэн тохиргоо"
        title={government ? "Төрийн байгууллага" : "Байгууллага"}
        description="Байгууллагын үндсэн, холбоо барих болон нийтэд харагдах мэдээллийг удирдана."
      />

      <section className="overflow-hidden rounded-2xl border border-border/80 bg-surface/85 shadow-sm">
        <div className="relative h-28 bg-gradient-brand sm:h-32">
          <div className="absolute inset-0 grid-bg opacity-20" />
          <label className="absolute right-3 top-3 inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-black/25 px-2.5 py-1.5 text-xs font-medium text-white backdrop-blur hover:bg-black/35">
            <ImageIcon className="h-3.5 w-3.5" /> Cover солих
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(event) =>
                event.target.files?.[0] &&
                toast.success(`${event.target.files[0].name} cover preview сонгогдлоо`)
              }
            />
          </label>
        </div>
        <div className="flex flex-wrap items-end gap-4 px-5 pb-5">
          <div className="-mt-8 grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl border-4 border-surface bg-white shadow-md">
            {logoData ? (
              <img
                src={logoData}
                alt="Байгууллагын лого"
                className="h-full w-full object-contain"
              />
            ) : (
              <TanuMark variant="navy" className="h-12" />
            )}
          </div>
          <div className="min-w-0 flex-1 pt-3">
            <p className="truncate font-display font-extrabold">{form.name}</p>
            <p className="text-xs text-muted-foreground">{form.businessType}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className="rounded-full bg-brand-soft px-2 py-1 text-[9px] font-bold text-[var(--brand)]">
                {government ? "Төрийн workspace" : "Standard багц"}
              </span>
              {form.website && (
                <span className="rounded-full bg-secondary px-2 py-1 text-[9px] font-semibold text-muted-foreground">
                  {form.website}
                </span>
              )}
            </div>
          </div>
          <label className="cursor-pointer rounded-lg border border-input bg-background px-3 py-2 text-xs font-semibold shadow-sm hover:bg-accent">
            <ImageIcon className="mr-1.5 inline h-3.5 w-3.5" /> Лого солих
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(event) => loadLogo(event.target.files?.[0])}
            />
          </label>
        </div>
      </section>

      <SettingsCard
        icon={<Building2 />}
        title="Ерөнхий мэдээлэл"
        description="Байгууллагыг тодорхойлох үндсэн мэдээлэл."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormRow label="Байгууллагын нэр" hint={errors.name}>
            <Input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              className={errors.name ? "border-destructive" : ""}
            />
          </FormRow>
          <FormRow label="Байгууллагын төрөл">
            <Input value={government ? "Төрийн байгууллага" : "Хувийн байгууллага"} disabled />
          </FormRow>
          <FormRow label="Үйл ажиллагааны чиглэл">
            <Input
              value={form.businessType}
              onChange={(event) =>
                setForm((current) => ({ ...current, businessType: event.target.value }))
              }
            />
          </FormRow>
          <FormRow label="Товч тайлбар">
            <Input
              value={form.shortDescription}
              onChange={(event) =>
                setForm((current) => ({ ...current, shortDescription: event.target.value }))
              }
            />
          </FormRow>
          <div className="sm:col-span-2">
            <FormRow label="Дэлгэрэнгүй тайлбар">
              <Textarea
                className="min-h-28 resize-none"
                value={form.detailedDescription}
                onChange={(event) =>
                  setForm((current) => ({ ...current, detailedDescription: event.target.value }))
                }
              />
            </FormRow>
          </div>
        </div>
      </SettingsCard>

      <div className="grid gap-5 xl:grid-cols-2">
        <SettingsCard
          icon={<Globe2 />}
          title="Холбоо барих"
          description="Хэрэглэгч, иргэдэд харагдах холбоо барих мэдээлэл."
        >
          <div className="grid gap-4">
            <FormRow label="Үндсэн утас">
              <Input
                value={form.phone}
                onChange={(event) =>
                  setForm((current) => ({ ...current, phone: event.target.value }))
                }
              />
            </FormRow>
            <FormRow label="И-мэйл" hint={errors.email}>
              <Input
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm((current) => ({ ...current, email: event.target.value }))
                }
                className={errors.email ? "border-destructive" : ""}
              />
            </FormRow>
            <FormRow label="Вэбсайт" hint={errors.website}>
              <Input
                value={form.website}
                onChange={(event) =>
                  setForm((current) => ({ ...current, website: event.target.value }))
                }
                className={errors.website ? "border-destructive" : ""}
                placeholder="https://..."
              />
            </FormRow>
            <div className="grid grid-cols-2 gap-3">
              <FormRow label="Facebook">
                <Input
                  value={form.socials.facebook}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      socials: { ...current.socials, facebook: event.target.value },
                    }))
                  }
                />
              </FormRow>
              <FormRow label="Instagram">
                <Input
                  value={form.socials.instagram}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      socials: { ...current.socials, instagram: event.target.value },
                    }))
                  }
                />
              </FormRow>
            </div>
          </div>
        </SettingsCard>
        <SettingsCard
          icon={<MapPin />}
          title="Хаяг ба байршил"
          description="Одоогийн байгууллагын хаягийн мэдээлэл."
        >
          <FormRow label="Дэлгэрэнгүй хаяг">
            <Textarea
              className="min-h-24 resize-none"
              value={form.address}
              onChange={(event) =>
                setForm((current) => ({ ...current, address: event.target.value }))
              }
            />
          </FormRow>
          <div className="mt-4 flex h-36 items-center justify-center rounded-xl border border-dashed border-border bg-surface-muted/35 text-xs text-muted-foreground">
            <MapPin className="mr-1.5 h-4 w-4" /> Газрын зургийн байршил · Existing placeholder
          </div>
        </SettingsCard>
      </div>

      <SettingsCard
        icon={<Eye />}
        title="Нийтийн мэдээлэл"
        description="Public profile болон захиалгын харагдах төлөв."
      >
        <ToggleRow
          label={
            government ? "Нийтийн мэдээллийн хуудсыг идэвхжүүлэх" : "Tanu апп дээр захиалга авах"
          }
          description={
            government
              ? "Иргэд байгууллагын public мэдээллийг харах боломжтой."
              : "Идэвхгүй бол хэрэглэгчид апп-аар захиалга үүсгэх боломжгүй."
          }
          checked={form.publicBookingVisible}
          onCheckedChange={(checked) =>
            setForm((current) => ({ ...current, publicBookingVisible: checked }))
          }
        />
      </SettingsCard>

      <SaveBar dirty={dirty} saving={saving} onSave={onSave} onReset={onReset} />
    </div>
  );
}

function BookingSettings({
  form,
  setForm,
  dirty,
  saving,
  onSave,
  onReset,
}: {
  form: ReturnType<typeof useDashboardData>["bookingSettings"];
  setForm: React.Dispatch<
    React.SetStateAction<ReturnType<typeof useDashboardData>["bookingSettings"]>
  >;
  dirty: boolean;
  saving: boolean;
  onSave: () => void;
  onReset: () => void;
}) {
  return (
    <div className="space-y-5">
      <SettingsHeader
        eyebrow="Үйл ажиллагааны тохиргоо"
        title="Захиалга"
        description="Цаг захиалгын хугацаа, интервал, цуцлалт болон автомат сануулгыг тохируулна."
      />
      <div className="rounded-xl bg-brand-soft px-4 py-3 text-xs leading-5 text-[var(--brand-2)]">
        Tanu-аар ирсэн захиалга автоматаар календарьт нэмэгддэг тул баталгаажуулах шаардлагагүй.
      </div>
      <SettingsCard icon={<CalendarClock />} title="Хугацаа ба интервал">
        <div className="grid gap-4 sm:grid-cols-2">
          <NumberField
            label="Хамгийн бага урьдчилан захиалах хугацаа (мин)"
            value={form.minLeadTimeMin}
            onChange={(value) => setForm((current) => ({ ...current, minLeadTimeMin: value }))}
          />
          <NumberField
            label="Хамгийн хол захиалах хугацаа (өдөр)"
            value={form.maxFutureDays}
            onChange={(value) => setForm((current) => ({ ...current, maxFutureDays: value }))}
          />
          <NumberField
            label="Цуцлах эцсийн хугацаа (цаг)"
            value={form.cancellationDeadlineHours}
            onChange={(value) =>
              setForm((current) => ({ ...current, cancellationDeadlineHours: value }))
            }
          />
          <NumberField
            label="Цагийн интервал (мин)"
            value={form.slotIntervalMin}
            onChange={(value) => setForm((current) => ({ ...current, slotIntervalMin: value }))}
          />
          <NumberField
            label="Үйлчилгээ хоорондын завсар (мин)"
            value={form.bufferTimeMin}
            onChange={(value) => setForm((current) => ({ ...current, bufferTimeMin: value }))}
          />
          <ToggleRow
            label="Автомат сануулга илгээх"
            checked={form.autoReminders}
            onCheckedChange={(checked) =>
              setForm((current) => ({ ...current, autoReminders: checked }))
            }
          />
        </div>
      </SettingsCard>
      <SaveBar dirty={dirty} saving={saving} onSave={onSave} onReset={onReset} />
    </div>
  );
}

function BranchSettings({
  organizationType,
  branchStates,
  setBranchStates,
  dirty,
  saving,
  onSave,
  onReset,
  onBeforeLeave,
}: {
  organizationType: OrganizationType;
  branchStates: Record<string, boolean>;
  setBranchStates: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  dirty: boolean;
  saving: boolean;
  onSave: () => void;
  onReset: () => void;
  onBeforeLeave: (event: React.MouseEvent) => void;
}) {
  const { branches } = useDashboardData();
  const label = settingsOrganizationConfig[organizationType].terms.branch;
  return (
    <div className="space-y-5">
      <SettingsHeader
        eyebrow="Үндсэн тохиргоо"
        title={label}
        description={`${label}-ын идэвхтэй төлөв болон дэлгэрэнгүй мэдээлэл.`}
        actions={
          organizationType === "private" ? (
            <Button asChild variant="outline">
              <Link to="/business/dashboard/branches" onClick={onBeforeLeave}>
                Дэлгэрэнгүй удирдах
              </Link>
            </Button>
          ) : undefined
        }
      />
      <SettingsCard icon={<Store />} title={`${label}-ын төлөв`}>
        <div className="space-y-3">
          {branches.map((branch) => (
            <ToggleRow
              key={branch.id}
              label={branch.name}
              description={`${branch.address} · ${branch.workingHours}`}
              checked={branchStates[branch.id] ?? branch.active}
              onCheckedChange={(checked) =>
                setBranchStates((current) => ({ ...current, [branch.id]: checked }))
              }
            />
          ))}
        </div>
      </SettingsCard>
      <SaveBar dirty={dirty} saving={saving} onSave={onSave} onReset={onReset} />
    </div>
  );
}

function ScheduleSettings({
  organizationType,
  workingHours,
  setWorkingHours,
  dirty,
  saving,
  onSave,
  onReset,
}: {
  organizationType: OrganizationType;
  workingHours: Record<string, string>;
  setWorkingHours: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  dirty: boolean;
  saving: boolean;
  onSave: () => void;
  onReset: () => void;
}) {
  const { branches } = useDashboardData();
  const term = settingsOrganizationConfig[organizationType].terms.branch;
  return (
    <div className="space-y-5">
      <SettingsHeader
        eyebrow="Үйл ажиллагааны тохиргоо"
        title="Хуваарь"
        description={`${term} бүрийн ажиллах цагийг тохируулна.`}
      />
      <SettingsCard icon={<CalendarClock />} title="Ажиллах цаг" description="Жишээ: 09:00–18:00">
        <div className="space-y-3">
          {branches.map((branch) => (
            <div
              key={branch.id}
              className="grid items-center gap-3 rounded-xl border border-border/70 bg-surface-muted/30 p-3 sm:grid-cols-[minmax(0,1fr)_180px]"
            >
              <div>
                <p className="text-xs font-semibold">{branch.name}</p>
                <p className="text-[10px] text-muted-foreground">{branch.address}</p>
              </div>
              <Input
                value={workingHours[branch.id] ?? branch.workingHours}
                onChange={(event) =>
                  setWorkingHours((current) => ({ ...current, [branch.id]: event.target.value }))
                }
              />
            </div>
          ))}
        </div>
      </SettingsCard>
      <SaveBar dirty={dirty} saving={saving} onSave={onSave} onReset={onReset} />
    </div>
  );
}

function NotificationSettings({
  organizationType,
  preferences,
  setPreferences,
  dirty,
  saving,
  onSave,
  onReset,
}: {
  organizationType: OrganizationType;
  preferences: typeof initialNotificationPreferences;
  setPreferences: React.Dispatch<React.SetStateAction<typeof initialNotificationPreferences>>;
  dirty: boolean;
  saving: boolean;
  onSave: () => void;
  onReset: () => void;
}) {
  const government = organizationType === "government";
  return (
    <div className="space-y-5">
      <SettingsHeader
        eyebrow="Үйл ажиллагааны тохиргоо"
        title="Мэдэгдэл"
        description="Системийн мэдэгдэл, сануулга болон өдөр тутмын тоймыг тохируулна."
      />
      <SettingsCard icon={<Bell />} title="Мэдэгдлийн сувгууд">
        <div className="space-y-3">
          <ToggleRow
            label={
              government
                ? "Албан хаагчид шинэ үүргийн мэдэгдэл илгээх"
                : "Ажилтанд шинэ захиалгын мэдэгдэл илгээх"
            }
            checked={preferences.staffNewBooking}
            onCheckedChange={(checked) =>
              setPreferences((current) => ({ ...current, staffNewBooking: checked }))
            }
          />
          <ToggleRow
            label={
              government
                ? "Иргэнд хүсэлтийн төлөвийн сануулга илгээх"
                : "Хэрэглэгчид захиалгын сануулга илгээх"
            }
            checked={preferences.customerReminder}
            onCheckedChange={(checked) =>
              setPreferences((current) => ({ ...current, customerReminder: checked }))
            }
          />
          <ToggleRow
            label="Өдөр бүрийн тойм имэйл"
            checked={preferences.dailySummary}
            onCheckedChange={(checked) =>
              setPreferences((current) => ({ ...current, dailySummary: checked }))
            }
          />
        </div>
      </SettingsCard>
      <SaveBar dirty={dirty} saving={saving} onSave={onSave} onReset={onReset} />
    </div>
  );
}

function AccessSettings({ organizationType }: { organizationType: OrganizationType }) {
  if (organizationType === "government") {
    const roles = Object.keys(governmentPermissionModules) as GovernmentPermissionPreset[];
    const modules = Array.from(new Set(Object.values(governmentPermissionModules).flat()));
    return (
      <div className="space-y-5">
        <SettingsHeader
          eyebrow="Үндсэн тохиргоо"
          title="Эрх, хандалт"
          description="Төрийн байгууллагын permission preset бүрийн module хандалт."
        />
        <SettingsCard icon={<ShieldCheck />} title="Permission matrix">
          <div className="overflow-x-auto">
            <table className="min-w-[1000px] w-full text-left text-xs">
              <thead>
                <tr className="text-muted-foreground">
                  <th className="pb-3 pr-4">Module</th>
                  {roles.map((role) => (
                    <th key={role} className="pb-3 pr-4 text-[10px]">
                      {governmentPermissionLabel[role]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {modules.map((module) => (
                  <tr key={module} className="border-t border-border/60">
                    <td className="py-2.5 pr-4 font-semibold">{module}</td>
                    {roles.map((role) => (
                      <td key={role} className="py-2.5 pr-4">
                        {governmentPermissionModules[role].includes(module) ? (
                          <Check className="h-3.5 w-3.5 text-[var(--success)]" />
                        ) : (
                          <span className="text-muted-foreground/35">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SettingsCard>
      </div>
    );
  }
  const rows = [...new Map(DASHBOARD_NAV.map((item) => [item.to + item.label, item])).values()];
  return (
    <div className="space-y-5">
      <SettingsHeader
        eyebrow="Үндсэн тохиргоо"
        title="Эрх, хандалт"
        description="Эрхийн түвшин тус бүрийн харах боломжтой existing цэсүүд."
      />
      <SettingsCard icon={<ShieldCheck />} title="Role permission matrix">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-xs">
            <thead>
              <tr className="text-muted-foreground">
                <th className="pb-3 pr-4">Цэс</th>
                {(["owner", "admin", "employee"] as BusinessRole[]).map((role) => (
                  <th key={role} className="pb-3 pr-4">
                    {roleLabel[role]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => (
                <tr key={item.key} className="border-t border-border/60">
                  <td className="py-2.5 pr-4 font-semibold">{item.label}</td>
                  {(["owner", "admin", "employee"] as BusinessRole[]).map((role) => (
                    <td key={role} className="py-2.5 pr-4">
                      {item.roles.includes(role) ? (
                        <Check className="h-3.5 w-3.5 text-[var(--success)]" />
                      ) : (
                        <span className="text-muted-foreground/35">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SettingsCard>
    </div>
  );
}

function PublicLinksSettings({
  organizationType,
  values,
  setValues,
  dirty,
  saving,
  onSave,
  onReset,
}: {
  organizationType: OrganizationType;
  values: typeof initialPublicLinks;
  setValues: React.Dispatch<React.SetStateAction<typeof initialPublicLinks>>;
  dirty: boolean;
  saving: boolean;
  onSave: () => void;
  onReset: () => void;
}) {
  const government = organizationType === "government";
  return (
    <div className="space-y-5">
      <SettingsHeader
        eyebrow="Сурталчилгаа ба холбоос"
        title="Нийтийн холбоос"
        description="QR код болон нийтэд харагдах хуудсуудын public URL, visibility тохиргоо."
      />
      <SettingsCard icon={<Globe2 />} title="Public URL">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormRow label="Байгууллагын public URL">
            <Input
              value={values.publicUrl}
              onChange={(event) =>
                setValues((current) => ({ ...current, publicUrl: event.target.value }))
              }
            />
          </FormRow>
          <FormRow label={government ? "Хүсэлт, өргөдлийн URL" : "Цаг захиалгын URL"}>
            <Input
              value={values.bookingUrl}
              onChange={(event) =>
                setValues((current) => ({ ...current, bookingUrl: event.target.value }))
              }
            />
          </FormRow>
          <FormRow label="Short link">
            <Input
              value={values.shortLink}
              onChange={(event) =>
                setValues((current) => ({ ...current, shortLink: event.target.value }))
              }
            />
          </FormRow>
          <ToggleRow
            label="Нийтийн холбоос идэвхтэй"
            checked={values.active}
            onCheckedChange={(checked) => setValues((current) => ({ ...current, active: checked }))}
          />
        </div>
      </SettingsCard>
      <SettingsCard icon={<Eye />} title="Харагдах мэдээлэл">
        <div className="grid gap-3 sm:grid-cols-2">
          <ToggleRow
            label="Public profile"
            checked={values.profileVisible}
            onCheckedChange={(checked) =>
              setValues((current) => ({ ...current, profileVisible: checked }))
            }
          />
          <ToggleRow
            label="Утас"
            checked={values.phoneVisible}
            onCheckedChange={(checked) =>
              setValues((current) => ({ ...current, phoneVisible: checked }))
            }
          />
          <ToggleRow
            label="Хаяг"
            checked={values.addressVisible}
            onCheckedChange={(checked) =>
              setValues((current) => ({ ...current, addressVisible: checked }))
            }
          />
          <ToggleRow
            label={government ? "Албан хаагч" : "Ажилтан"}
            checked={values.employeesVisible}
            onCheckedChange={(checked) =>
              setValues((current) => ({ ...current, employeesVisible: checked }))
            }
          />
          <ToggleRow
            label={government ? "Нийтийн үйлчилгээ" : "Үйлчилгээ"}
            checked={values.servicesVisible}
            onCheckedChange={(checked) =>
              setValues((current) => ({ ...current, servicesVisible: checked }))
            }
          />
        </div>
      </SettingsCard>
      <SaveBar dirty={dirty} saving={saving} onSave={onSave} onReset={onReset} />
    </div>
  );
}

function SecuritySettings({
  twoFactor,
  setTwoFactor,
  dirty,
  saving,
  onSave,
  onReset,
}: {
  twoFactor: boolean;
  setTwoFactor: (value: boolean) => void;
  dirty: boolean;
  saving: boolean;
  onSave: () => void;
  onReset: () => void;
}) {
  return (
    <div className="space-y-5">
      <SettingsHeader
        eyebrow="Систем"
        title="Аюулгүй байдал"
        description="Нэвтрэх хамгаалалт болон идэвхтэй төхөөрөмжүүдийг удирдана."
      />
      <SettingsCard icon={<Lock />} title="Нэвтрэх хамгаалалт">
        <ToggleRow
          label="Хоёр шатлалт баталгаажуулалт"
          description="Нэвтрэх үед нэмэлт код шаардана."
          checked={twoFactor}
          onCheckedChange={setTwoFactor}
        />
      </SettingsCard>
      <SettingsCard icon={<Laptop />} title="Идэвхтэй төхөөрөмжүүд">
        <div className="space-y-3">
          <DeviceRow icon={<Laptop />} name="Windows · Chrome" detail="Энэ төхөөрөмж · Идэвхтэй" />
          <DeviceRow
            icon={<Smartphone />}
            name="iPhone · Tanu Business апп"
            detail="Улаанбаатар · 2 цагийн өмнө"
            action={
              <Button
                size="sm"
                variant="outline"
                onClick={() => toast.success("Төхөөрөмжөөс гарлаа")}
              >
                Гаргах
              </Button>
            }
          />
        </div>
      </SettingsCard>
      <SaveBar dirty={dirty} saving={saving} onSave={onSave} onReset={onReset} />
    </div>
  );
}

function BillingSettings({
  methods,
  setMethods,
  dirty,
  saving,
  onSave,
  onReset,
  onBeforeLeave,
}: {
  methods: typeof initialPaymentMethods;
  setMethods: React.Dispatch<React.SetStateAction<typeof initialPaymentMethods>>;
  dirty: boolean;
  saving: boolean;
  onSave: () => void;
  onReset: () => void;
  onBeforeLeave: (event: React.MouseEvent) => void;
}) {
  return (
    <div className="space-y-5">
      <SettingsHeader
        eyebrow="Систем"
        title="Төлбөр, багц"
        description="Төлбөрийн хэлбэр болон Tanu Business subscription багцыг удирдана."
        actions={
          <Button asChild variant="outline">
            <Link to="/business/dashboard/billing" onClick={onBeforeLeave}>
              Багцын дэлгэрэнгүй
            </Link>
          </Button>
        }
      />
      <SettingsCard icon={<CreditCard />} title="Одоогийн багц">
        <div className="grid gap-3 sm:grid-cols-3">
          <Summary label="Багц" value="Standard" />
          <Summary label="Дуусах хугацаа" value={CURRENT_SUBSCRIPTION.expiresAt} />
          <Summary
            label="Автомат сунгалт"
            value={CURRENT_SUBSCRIPTION.autoRenew ? "Идэвхтэй" : "Идэвхгүй"}
          />
        </div>
      </SettingsCard>
      <SettingsCard icon={<CreditCard />} title="Төлбөрийн хэлбэр">
        <div className="grid gap-3 sm:grid-cols-2">
          <ToggleRow
            label="Бэлнээр төлөх"
            checked={methods.cash}
            onCheckedChange={(checked) => setMethods((current) => ({ ...current, cash: checked }))}
          />
          <ToggleRow
            label="Картаар төлөх"
            checked={methods.card}
            onCheckedChange={(checked) => setMethods((current) => ({ ...current, card: checked }))}
          />
          <ToggleRow
            label="QPay-ээр төлөх"
            checked={methods.qpay}
            onCheckedChange={(checked) => setMethods((current) => ({ ...current, qpay: checked }))}
          />
          <ToggleRow
            label="Дансаар шилжүүлэх"
            checked={methods.transfer}
            onCheckedChange={(checked) =>
              setMethods((current) => ({ ...current, transfer: checked }))
            }
          />
        </div>
      </SettingsCard>
      <SaveBar dirty={dirty} saving={saving} onSave={onSave} onReset={onReset} />
    </div>
  );
}

function PublicProfileSummary({
  organizationName,
  description,
  publicUrl,
  onOpenLinks,
}: {
  organizationName: string;
  description: string;
  publicUrl: string;
  onOpenLinks: () => void;
}) {
  return (
    <div className="space-y-5">
      <SettingsHeader
        eyebrow="Үндсэн тохиргоо"
        title="Нийтийн мэдээлэл"
        description="Иргэдэд харагдах төрийн байгууллагын мэдээллийн хуудас."
      />
      <SettingsCard icon={<IdCard />} title={organizationName}>
        <p className="text-sm text-muted-foreground">{description}</p>
        <p className="mt-3 rounded-lg bg-surface-muted/40 p-3 text-xs">{publicUrl}</p>
        <Button className="mt-4" onClick={onOpenLinks}>
          <Globe2 /> Нийтийн холбоос удирдах
        </Button>
      </SettingsCard>
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
}) {
  return (
    <div className="flex min-h-12 items-center justify-between gap-4 rounded-xl border border-border/70 bg-surface-muted/25 px-3 py-2.5">
      <div>
        <p className="text-xs font-semibold">{label}</p>
        {description && (
          <p className="mt-0.5 text-[10px] leading-4 text-muted-foreground">{description}</p>
        )}
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <FormRow label={label}>
      <Input
        type="number"
        min={0}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </FormRow>
  );
}

function DeviceRow({
  icon,
  name,
  detail,
  action,
}: {
  icon: ReactNode;
  name: string;
  detail: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-surface-muted/25 p-3">
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-soft text-[var(--brand)] [&_svg]:h-4 [&_svg]:w-4">
          {icon}
        </span>
        <div>
          <p className="text-xs font-semibold">{name}</p>
          <p className="text-[10px] text-muted-foreground">{detail}</p>
        </div>
      </div>
      {action}
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/70 bg-surface-muted/30 p-4">
      <p className="text-[10px] font-semibold text-muted-foreground">{label}</p>
      <p className="mt-1 text-base font-extrabold">{value}</p>
    </div>
  );
}
