import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import {
  GOVERNMENT_ACTIVITIES,
  GOVERNMENT_DEPARTMENTS,
  GOVERNMENT_DOCUMENTS,
  GOVERNMENT_EMPLOYEES,
  GOVERNMENT_MEETINGS,
  GOVERNMENT_NEWS,
  GOVERNMENT_PETITIONS,
  GOVERNMENT_REQUESTS,
  GOVERNMENT_TASKS,
} from "./mock-data";
import type {
  GovernmentActivity,
  GovernmentDepartment,
  GovernmentEmployee,
  GovernmentMeeting,
  GovernmentNewsItem,
  GovernmentPermissionPreset,
  GovernmentPetition,
  GovernmentRequest,
  GovernmentRequestStatus,
  GovernmentTask,
  OfficialDocument,
} from "./types";

type NewGovernmentRequest = Omit<GovernmentRequest, "id" | "status" | "createdAt" | "createdBy">;

interface GovernmentData {
  activePermission: GovernmentPermissionPreset;
  setActivePermission: (permission: GovernmentPermissionPreset) => void;
  departments: GovernmentDepartment[];
  employees: GovernmentEmployee[];
  documents: OfficialDocument[];
  tasks: GovernmentTask[];
  meetings: GovernmentMeeting[];
  petitions: GovernmentPetition[];
  activities: GovernmentActivity[];
  requests: GovernmentRequest[];
  news: GovernmentNewsItem[];
  quickNote: string;
  setQuickNote: (note: string) => void;
  createRequest: (
    input: NewGovernmentRequest,
    status: Extract<GovernmentRequestStatus, "draft" | "submitted">,
    createdBy: string,
  ) => GovernmentRequest;
  toggleAttendance: (employeeId: string) => void;
}

const GovernmentCtx = createContext<GovernmentData | null>(null);

let governmentId = 2000;
const nextGovernmentId = (prefix: string) => `${prefix}-${governmentId++}`;

export function GovernmentDataProvider({
  children,
  initialPermission = "employee",
}: {
  children: ReactNode;
  initialPermission?: GovernmentPermissionPreset;
}) {
  const [activePermission, setActivePermission] =
    useState<GovernmentPermissionPreset>(initialPermission);
  const [employees, setEmployees] = useState(GOVERNMENT_EMPLOYEES);
  const [activities, setActivities] = useState(GOVERNMENT_ACTIVITIES);
  const [requests, setRequests] = useState(GOVERNMENT_REQUESTS);
  const [quickNote, setQuickNote] = useState("");

  const createRequest = useCallback(
    (
      input: NewGovernmentRequest,
      status: Extract<GovernmentRequestStatus, "draft" | "submitted">,
      createdBy: string,
    ) => {
      const request: GovernmentRequest = {
        ...input,
        id: nextGovernmentId("request"),
        status,
        createdAt: new Date().toISOString(),
        createdBy,
      };
      setRequests((current) => [request, ...current]);
      if (status === "submitted") {
        setActivities((current) => [
          {
            id: nextGovernmentId("activity"),
            type: "task-assigned",
            title: "Шинэ хүсэлт илгээгдлээ",
            description: request.title,
            actor: createdBy,
            at: request.createdAt,
          },
          ...current,
        ]);
      }
      return request;
    },
    [],
  );

  const toggleAttendance = useCallback(
    (employeeId: string) => {
      const employee = employees.find((item) => item.id === employeeId);
      if (!employee) return;
      const checkingOut = employee.attendanceStatus === "present" && !employee.checkOut;
      const time = new Date().toLocaleTimeString("mn-MN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      setEmployees((current) =>
        current.map((item) => {
          if (item.id !== employeeId) return item;
          return checkingOut
            ? { ...item, attendanceStatus: "offline" as const, online: false, checkOut: time }
            : {
                ...item,
                attendanceStatus: "present" as const,
                online: true,
                checkIn: time,
                checkOut: undefined,
              };
        }),
      );
      setActivities((current) => [
        {
          id: nextGovernmentId("activity"),
          type: "attendance",
          title: checkingOut ? "Ажилтан гарлаа" : "Ажилтан ирлээ",
          description: `${employee.name} ${time} цагт ${checkingOut ? "гарсан" : "ирсэн"}.`,
          actor: employee.name,
          at: new Date().toISOString(),
        },
        ...current,
      ]);
    },
    [employees],
  );

  const value = useMemo<GovernmentData>(
    () => ({
      activePermission,
      setActivePermission,
      departments: GOVERNMENT_DEPARTMENTS,
      employees,
      documents: GOVERNMENT_DOCUMENTS,
      tasks: GOVERNMENT_TASKS,
      meetings: GOVERNMENT_MEETINGS,
      petitions: GOVERNMENT_PETITIONS,
      activities,
      requests,
      news: GOVERNMENT_NEWS,
      quickNote,
      setQuickNote,
      createRequest,
      toggleAttendance,
    }),
    [activePermission, activities, createRequest, employees, quickNote, requests, toggleAttendance],
  );

  return <GovernmentCtx.Provider value={value}>{children}</GovernmentCtx.Provider>;
}

export function useGovernmentData() {
  const context = useContext(GovernmentCtx);
  if (!context) {
    throw new Error("useGovernmentData must be used within GovernmentDataProvider");
  }
  return context;
}
