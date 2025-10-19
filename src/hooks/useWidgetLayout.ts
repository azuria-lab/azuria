import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/domains/auth";
import { logger } from "@/services/logger";
import type { Layout } from "react-grid-layout";
import type { Json } from "@/integrations/supabase/types";

/**
 * Representa um widget retornado do Supabase RPC get_user_widget_layout
 */
interface WidgetDatabaseRecord {
  widget_id: string;
  widget_type: string;
  position: Json;
  config: Json;
  is_visible: boolean;
}

/**
 * Estrutura de posição dentro do campo position (Json)
 */
interface WidgetPosition {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Type guard para verificar se Json é uma WidgetPosition válida
 */
function isWidgetPosition(value: unknown): value is WidgetPosition {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    'i' in value &&
    'x' in value &&
    'y' in value &&
    'w' in value &&
    'h' in value
  );
}

export interface WidgetLayout {
  i: string; // widget key
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
}

const DEFAULT_LAYOUTS: WidgetLayout[] = [
  { i: "stats", x: 0, y: 0, w: 12, h: 2, minW: 6, minH: 2 },
  { i: "charts", x: 0, y: 2, w: 8, h: 4, minW: 6, minH: 3 },
  { i: "activities", x: 8, y: 2, w: 4, h: 4, minW: 3, minH: 3 },
  { i: "tip", x: 0, y: 6, w: 6, h: 2, minW: 4, minH: 2 },
  { i: "quick-actions", x: 6, y: 6, w: 6, h: 2, minW: 4, minH: 2 },
];

export function useWidgetLayout() {
  const { user } = useAuthContext();
  const [layouts, setLayouts] = useState<WidgetLayout[]>(DEFAULT_LAYOUTS);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCustomLayout, setHasCustomLayout] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadLayout();
    } else {
      setIsLoading(false);
    }
  }, [user?.id]);

  const loadLayout = async () => {
    try {
      const { data, error } = await supabase.rpc("get_user_widget_layout");

      if (error) {
        logger.error("Erro ao carregar layout:", error);
        setLayouts(DEFAULT_LAYOUTS);
        setHasCustomLayout(false);
        setIsLoading(false);
        return;
      }

      if (data && data.length > 0) {
        const customLayouts: WidgetLayout[] = data
          .map((widget: WidgetDatabaseRecord) => {
            // Type guard para garantir que position tem a estrutura correta
            if (!isWidgetPosition(widget.position)) {
              logger.warn('Widget position inválida', { widget_id: widget.widget_id });
              return null;
            }
            
            return {
              i: widget.position.i || widget.widget_id,
              x: widget.position.x,
              y: widget.position.y,
              w: widget.position.w,
              h: widget.position.h,
            };
          })
          .filter((layout): layout is WidgetLayout => layout !== null);

        setLayouts(customLayouts);
        setHasCustomLayout(true);
        logger.info("✅ Layout customizado carregado", {
          widgets: customLayouts.length,
        });
      } else {
        setLayouts(DEFAULT_LAYOUTS);
        setHasCustomLayout(false);
      }

      setIsLoading(false);
    } catch (error) {
      logger.error("Erro ao carregar layout:", error);
      setLayouts(DEFAULT_LAYOUTS);
      setHasCustomLayout(false);
      setIsLoading(false);
    }
  };

  const saveLayout = async (newLayout: Layout[]) => {
    if (!user?.id) {
      return;
    }

    try {
      // Salvar cada widget
      await Promise.all(
        newLayout.map((item) =>
          supabase.rpc("save_widget_layout", {
            p_widget_key: item.i,
            p_x: item.x,
            p_y: item.y,
            p_w: item.w,
            p_h: item.h,
          })
        )
      );

      setHasCustomLayout(true);
      logger.info("✅ Layout salvo com sucesso", {
        widgets: newLayout.length,
      });
    } catch (error) {
      logger.error("Erro ao salvar layout:", error);
    }
  };

  const resetLayout = async () => {
    if (!user?.id) {
      return;
    }

    try {
      await supabase.rpc("reset_widget_layout");

      setLayouts(DEFAULT_LAYOUTS);
      setHasCustomLayout(false);

      logger.info("✅ Layout resetado para o padrão");
    } catch (error) {
      logger.error("Erro ao resetar layout:", error);
    }
  };

  const onLayoutChange = (newLayout: Layout[]) => {
    const updatedLayouts: WidgetLayout[] = newLayout.map((item) => {
      const original = layouts.find((l) => l.i === item.i);
      return {
        i: item.i,
        x: item.x,
        y: item.y,
        w: item.w,
        h: item.h,
        minW: original?.minW,
        minH: original?.minH,
        maxW: original?.maxW,
        maxH: original?.maxH,
      };
    });

    setLayouts(updatedLayouts);
  };

  return {
    layouts,
    isLoading,
    hasCustomLayout,
    saveLayout,
    resetLayout,
    onLayoutChange,
  };
}
