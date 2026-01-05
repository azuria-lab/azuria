import * as React from "react";
import { CalendarIcon, X } from "lucide-react";
import { endOfDay, endOfMonth, endOfWeek, format, startOfDay, startOfMonth, startOfWeek, subDays, subMonths, subWeeks } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface DateFilterValue {
  from: Date;
  to: Date;
  type?: "changed_on" | "validity_date";
}

interface DateFilterProps {
  value?: DateFilterValue;
  onChange?: (value: DateFilterValue | null) => void;
  label?: string;
  showTabs?: boolean;
  className?: string;
  placeholder?: string;
  iconOnly?: boolean;
}

type QuickOption = "today" | "this_week" | "last_week" | "this_month" | "last_month" | "custom";

const getQuickDateRange = (option: QuickOption): DateRange => {
  const today = new Date();
  
  switch (option) {
    case "today":
      return {
        from: startOfDay(today),
        to: endOfDay(today),
      };
    case "this_week":
      return {
        from: startOfWeek(today, { locale: ptBR }),
        to: endOfWeek(today, { locale: ptBR }),
      };
    case "last_week": {
      const lastWeekStart = startOfWeek(subWeeks(today, 1), { locale: ptBR });
      const lastWeekEnd = endOfWeek(subWeeks(today, 1), { locale: ptBR });
      return {
        from: lastWeekStart,
        to: lastWeekEnd,
      };
    }
    case "this_month":
      return {
        from: startOfMonth(today),
        to: endOfMonth(today),
      };
    case "last_month": {
      const lastMonth = subMonths(today, 1);
      return {
        from: startOfMonth(lastMonth),
        to: endOfMonth(lastMonth),
      };
    }
    default:
      return {
        from: subDays(today, 30),
        to: today,
      };
  }
};

export function DateFilter({
  value,
  onChange,
  label = "Filtrar por data",
  showTabs = false,
  className,
  placeholder = "Selecione o período",
  iconOnly = false,
}: DateFilterProps) {
  const [open, setOpen] = React.useState(false);
  const [dateType, setDateType] = React.useState<"changed_on" | "validity_date">("changed_on");
  const [selectedRange, setSelectedRange] = React.useState<DateRange | undefined>(
    value ? { from: value.from, to: value.to } : undefined
  );
  const [startDateInput, setStartDateInput] = React.useState(
    value?.from ? format(value.from, "dd/MM/yyyy", { locale: ptBR }) : ""
  );
  const [quickOption, setQuickOption] = React.useState<QuickOption | null>(null);

  React.useEffect(() => {
    if (value) {
      setSelectedRange({ from: value.from, to: value.to });
      setStartDateInput(format(value.from, "dd/MM/yyyy", { locale: ptBR }));
      setDateType(value.type || "changed_on");
    }
  }, [value]);

  const handleQuickSelect = (option: QuickOption) => {
    const range = getQuickDateRange(option);
    setSelectedRange(range);
    if (range.from) {
      setStartDateInput(format(range.from, "dd/MM/yyyy", { locale: ptBR }));
    }
    setQuickOption(option);
  };

  const handleDateSelect = (range: DateRange | undefined) => {
    setSelectedRange(range);
    if (range?.from) {
      setStartDateInput(format(range.from, "dd/MM/yyyy", { locale: ptBR }));
      setQuickOption(null);
    }
  };

  const handleStartDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setStartDateInput(inputValue);
    
    // Tentar parsear a data
    const parts = inputValue.split("/");
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      
      if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
        const newDate = new Date(year, month, day);
        if (!isNaN(newDate.getTime())) {
          setSelectedRange((prev) => ({
            from: newDate,
            to: prev?.to || newDate,
          }));
        }
      }
    }
  };

  const handleApply = () => {
    if (selectedRange?.from && selectedRange?.to) {
      onChange?.({
        from: selectedRange.from,
        to: selectedRange.to,
        type: dateType,
      });
      setOpen(false);
    }
  };

  const handleClear = () => {
    setSelectedRange(undefined);
    setStartDateInput("");
    setQuickOption(null);
    onChange?.(null);
    setOpen(false);
  };

  const handleCancel = () => {
    // Restaurar valores originais
    if (value) {
      setSelectedRange({ from: value.from, to: value.to });
      setStartDateInput(format(value.from, "dd/MM/yyyy", { locale: ptBR }));
      setDateType(value.type || "changed_on");
    } else {
      setSelectedRange(undefined);
      setStartDateInput("");
    }
    setQuickOption(null);
    setOpen(false);
  };

  const displayText = value
    ? `${format(value.from, "dd/MM/yyyy", { locale: ptBR })} - ${format(value.to, "dd/MM/yyyy", { locale: ptBR })}`
    : placeholder;

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className={cn(
          iconOnly ? "justify-center p-2 h-9 w-9" : "justify-start text-left font-normal",
          !value && "text-muted-foreground",
          className
        )}
        title={iconOnly ? displayText : undefined}
      >
        <CalendarIcon className={cn("h-4 w-4", !iconOnly && "mr-2")} />
        {!iconOnly && (
          <>
            {displayText}
            {value && (
              <X
                className="ml-2 h-4 w-4 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
              />
            )}
          </>
        )}
        {iconOnly && value && (
          <span className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full" />
        )}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{label}</DialogTitle>
            <DialogDescription>
              Selecione o período para filtrar os dados
            </DialogDescription>
          </DialogHeader>

          {showTabs && (
            <Tabs value={dateType} onValueChange={(v) => setDateType(v as "changed_on" | "validity_date")}>
              <TabsList>
                <TabsTrigger value="changed_on">Alterado em</TabsTrigger>
                <TabsTrigger value="validity_date">Data de validade</TabsTrigger>
              </TabsList>
            </Tabs>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {/* Calendário */}
            <div className="space-y-4">
              <div>
                <Label>Início do período</Label>
                <Input
                  value={startDateInput}
                  onChange={handleStartDateInputChange}
                  placeholder="dd/MM/yyyy"
                  className="mt-1"
                />
              </div>
              <Calendar
                mode="range"
                selected={selectedRange}
                onSelect={handleDateSelect}
                numberOfMonths={1}
                locale={ptBR}
                defaultMonth={selectedRange?.from || new Date()}
              />
            </div>

            {/* Opções rápidas */}
            <div className="space-y-4">
              <Label>Opções rápidas</Label>
              <div className="space-y-2">
                <Button
                  variant={quickOption === "today" ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => handleQuickSelect("today")}
                >
                  Hoje
                </Button>
                <Button
                  variant={quickOption === "this_week" ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => handleQuickSelect("this_week")}
                >
                  Esta semana
                </Button>
                <Button
                  variant={quickOption === "last_week" ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => handleQuickSelect("last_week")}
                >
                  Semana passada
                </Button>
                <Button
                  variant={quickOption === "this_month" ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => handleQuickSelect("this_month")}
                >
                  Este mês
                </Button>
                <Button
                  variant={quickOption === "last_month" ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => handleQuickSelect("last_month")}
                >
                  Mês passado
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    setQuickOption("custom");
                    // Não muda nada, deixa o usuário selecionar manualmente
                  }}
                >
                  Período customizado
                </Button>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button variant="outline" onClick={handleClear}>
              Limpar
            </Button>
            <Button onClick={handleApply} disabled={!selectedRange?.from || !selectedRange?.to}>
              Filtrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
