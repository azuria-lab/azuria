-- =============================================
-- EXTENSÃO SQL PARA WIDGETS ARRASTÁVEIS
-- =============================================
-- Este arquivo adiciona funcionalidades de layout personalizável
-- aos widgets do dashboard (complementa dashboard_stats.sql)

-- Adicionar colunas à tabela dashboard_widgets se ainda não existirem
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'dashboard_widgets' AND column_name = 'x_position'
  ) THEN
    ALTER TABLE public.dashboard_widgets 
    ADD COLUMN x_position INT DEFAULT 0,
    ADD COLUMN y_position INT DEFAULT 0,
    ADD COLUMN width INT DEFAULT 1,
    ADD COLUMN height INT DEFAULT 1;
  END IF;
END $$;

-- Função para salvar layout de widget
CREATE OR REPLACE FUNCTION public.save_widget_layout(
  p_widget_key TEXT,
  p_x INT,
  p_y INT,
  p_w INT,
  p_h INT
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.dashboard_widgets (
    user_id,
    widget_key,
    x_position,
    y_position,
    width,
    height,
    is_visible,
    updated_at
  )
  VALUES (
    auth.uid(),
    p_widget_key,
    p_x,
    p_y,
    p_w,
    p_h,
    TRUE,
    NOW()
  )
  ON CONFLICT (user_id, widget_key)
  DO UPDATE SET
    x_position = p_x,
    y_position = p_y,
    width = p_w,
    height = p_h,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, auth;

-- Função para obter layout de todos os widgets do usuário
CREATE OR REPLACE FUNCTION public.get_user_widget_layout()
RETURNS TABLE (
  widget_key TEXT,
  x_position INT,
  y_position INT,
  width INT,
  height INT,
  is_visible BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dw.widget_key,
    dw.x_position,
    dw.y_position,
    dw.width,
    dw.height,
    dw.is_visible
  FROM public.dashboard_widgets dw
  WHERE dw.user_id = auth.uid()
  ORDER BY dw.y_position, dw.x_position;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, auth;

-- Função para resetar layout para o padrão
CREATE OR REPLACE FUNCTION public.reset_widget_layout()
RETURNS VOID AS $$
BEGIN
  DELETE FROM public.dashboard_widgets
  WHERE user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, auth;

-- Função para toggle visibilidade de widget
CREATE OR REPLACE FUNCTION public.toggle_widget_visibility(p_widget_key TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_new_visibility BOOLEAN;
BEGIN
  UPDATE public.dashboard_widgets
  SET is_visible = NOT is_visible,
      updated_at = NOW()
  WHERE user_id = auth.uid() AND widget_key = p_widget_key
  RETURNING is_visible INTO v_new_visibility;
  
  RETURN v_new_visibility;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, auth;

-- =============================================
-- COMENTÁRIOS
-- =============================================

COMMENT ON FUNCTION public.save_widget_layout IS 'Salva posição e tamanho de um widget no dashboard';
COMMENT ON FUNCTION public.get_user_widget_layout IS 'Retorna layout completo de widgets do usuário';
COMMENT ON FUNCTION public.reset_widget_layout IS 'Reseta layout para o padrão (remove customizações)';
COMMENT ON FUNCTION public.toggle_widget_visibility IS 'Mostra/esconde um widget do dashboard';

-- CONCLUÍDO! Extensão de widgets arrastáveis pronta.
