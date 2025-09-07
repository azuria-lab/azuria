
import { useCallback } from "react";
import { logger } from "@/services/logger";
import { toast } from "@/components/ui/use-toast";
import { ExportData, ScheduleOptions } from "@/types/export";
import { generatePDFReport } from "@/utils/export/pdfExportUtils";
import { generateExcelReport } from "@/utils/export/excelExportUtils";
import { 
  createScheduledReport, 
  getFrequencyLabel, 
  getStoredSchedules, 
  removeStoredSchedule,
  saveScheduledReport 
} from "@/utils/export/schedulingUtils";

export const useAdvancedExportReports = () => {
  const exportToPDFWithCharts = useCallback(async (data: ExportData, fileName: string = "relatorio-avancado-precifica") => {
    try {
      await generatePDFReport(data, fileName);
      toast.success("Relatório PDF avançado exportado com sucesso!");
    } catch (error) {
  logger.error("Erro ao exportar PDF avançado:", { error });
      toast.error("Erro ao exportar relatório PDF avançado");
    }
  }, []);

  const exportToExcelMultiSheet = useCallback(async (data: ExportData, fileName: string = "relatorio-multiplas-abas-precifica") => {
    try {
      await generateExcelReport(data, fileName);
      toast.success("Relatório Excel com múltiplas abas exportado com sucesso!");
    } catch (error) {
  logger.error("Erro ao exportar Excel:", { error });
      toast.error("Erro ao exportar relatório Excel");
    }
  }, []);

  const scheduleReport = useCallback(async (
    data: ExportData, 
    options: ScheduleOptions,
    reportName: string
  ) => {
    try {
      const scheduleData = createScheduledReport(data, options, reportName);
      saveScheduledReport(scheduleData);
      
      toast.success(`Relatório agendado para ${getFrequencyLabel(options.frequency)} às ${options.time}`);
      
      return scheduleData;
    } catch (error) {
  logger.error("Erro ao agendar relatório:", { error });
      toast.error("Erro ao agendar relatório");
      return null;
    }
  }, []);

  const getScheduledReports = useCallback(() => {
    return getStoredSchedules();
  }, []);

  const removeScheduledReport = useCallback((id: string) => {
    try {
      removeStoredSchedule(id);
      toast.success("Agendamento removido com sucesso!");
    } catch (error) {
  logger.error("Erro ao remover agendamento:", { error });
      toast.error("Erro ao remover agendamento");
    }
  }, []);

  return {
    exportToPDFWithCharts,
    exportToExcelMultiSheet,
    scheduleReport,
    getScheduledReports,
    removeScheduledReport
  };
};
