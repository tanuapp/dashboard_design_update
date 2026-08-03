import type { EmployeeWorkDay } from "@/lib/dashboard/types";
import type { GovernmentPermissionPreset } from "@/lib/government/types";
import type { OrganizationType } from "@/lib/organization";

export interface OnboardingEmployee {
  name: string;
  position: string;
  phone: string;
  weeklySchedule: EmployeeWorkDay[];
}

export interface OnboardingService {
  name: string;
  durationMin: number;
  price: number;
}

export interface BusinessOnboardingData {
  organizationType?: OrganizationType;
  organization: {
    name: string;
    ownerName: string;
    type: string;
    phone: string;
    email: string;
    address: string;
  };
  booking: {
    autoConfirm: boolean;
    minLeadTimeMin: number;
    cancellationDeadlineHours: number;
    paymentMethods: string[];
    bankName: string;
    accountHolder: string;
    accountNumber: string;
  };
  employees: OnboardingEmployee[];
  services: OnboardingService[];
  schedule: {
    activeDays: number[];
    startTime: string;
    endTime: string;
  };
  government?: {
    departments: string[];
    defaultPermissionPreset: GovernmentPermissionPreset;
  };
  completedAt: string;
}

const STORAGE_KEY = "tanu-business-onboarding";

export function createDefaultWeeklySchedule(
  startTime = "09:00",
  endTime = "18:00",
): EmployeeWorkDay[] {
  return [1, 2, 3, 4, 5, 6, 0].map((day) => ({
    day,
    enabled: day !== 0,
    startTime,
    endTime,
  }));
}

export function saveBusinessOnboarding(data: BusinessOnboardingData) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function readBusinessOnboarding(): BusinessOnboardingData | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as BusinessOnboardingData;
    return {
      ...parsed,
      organizationType: parsed.organizationType ?? "private",
      employees: parsed.employees.map((employee) => ({
        ...employee,
        weeklySchedule:
          employee.weeklySchedule ??
          createDefaultWeeklySchedule(parsed.schedule.startTime, parsed.schedule.endTime),
      })),
    };
  } catch {
    return null;
  }
}
