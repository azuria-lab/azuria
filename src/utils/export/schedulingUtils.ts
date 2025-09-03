
import { ExportData, ScheduledReport, ScheduleOptions } from "@/types/export";

export const calculateNextExecution = (frequency: string, time: string): Date => {
  const now = new Date();
  const [hours, minutes] = time.split(':').map(Number);
  const next = new Date();
  next.setHours(hours, minutes, 0, 0);
  
  switch (frequency) {
    case 'daily':
      if (next <= now) {next.setDate(next.getDate() + 1);}
      break;
    case 'weekly':
      next.setDate(next.getDate() + (7 - next.getDay()));
      if (next <= now) {next.setDate(next.getDate() + 7);}
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1, 1);
      break;
  }
  
  return next;
};

export const getFrequencyLabel = (frequency: string): string => {
  const labels = {
    daily: 'diariamente',
    weekly: 'semanalmente', 
    monthly: 'mensalmente'
  };
  return labels[frequency as keyof typeof labels] || frequency;
};

export const createScheduledReport = (
  data: ExportData, 
  options: ScheduleOptions,
  reportName: string
): ScheduledReport => {
  return {
    id: Date.now().toString(),
    reportName,
    frequency: options.frequency,
    time: options.time,
    emails: options.emails,
    format: options.format,
    enabled: options.enabled,
    data: data,
    createdAt: new Date(),
    nextExecution: calculateNextExecution(options.frequency, options.time)
  };
};

export const saveScheduledReport = (report: ScheduledReport): void => {
  const existingSchedules = getStoredSchedules();
  existingSchedules.push(report);
  localStorage.setItem('scheduledReports', JSON.stringify(existingSchedules));
};

export const getStoredSchedules = (): ScheduledReport[] => {
  try {
    return JSON.parse(localStorage.getItem('scheduledReports') || '[]');
  } catch {
    return [];
  }
};

export const removeStoredSchedule = (id: string): void => {
  const schedules = getStoredSchedules();
  const filtered = schedules.filter(schedule => schedule.id !== id);
  localStorage.setItem('scheduledReports', JSON.stringify(filtered));
};
