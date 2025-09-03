-- Optional seed data for Azuria (safe to run multiple times)
-- Run after schema.sql, functions.sql, and policies.sql

-- Public calculation templates (readable by everyone)
insert into calculation_templates (id, name, description, image_url, is_public, is_premium, price, rating, downloads_count, category, sector_specific_config, custom_formulas, default_values, status, created_by)
values
  (
    gen_random_uuid(),
    'Produto Físico Básico',
    'Template para produtos físicos com impostos e taxa de cartão.',
    null,
    true,
    false,
    0,
    4.7,
    125,
    'varejo',
    '{}'::jsonb,
    null,
    jsonb_build_object(
      'defaultMargin', 30,
      'defaultTax', 10,
      'defaultCardFee', 3.5,
      'includeShippingDefault', false
    ),
    'published',
    null
  )
on conflict do nothing;

insert into calculation_templates (id, name, description, image_url, is_public, is_premium, price, rating, downloads_count, category, sector_specific_config, custom_formulas, default_values, status, created_by)
values
  (
    gen_random_uuid(),
    'Serviço Avançado',
    'Template para serviços com foco em margem e hora técnica.',
    null,
    true,
    false,
    0,
    4.5,
    86,
    'servicos',
    '{}'::jsonb,
    null,
    jsonb_build_object(
      'defaultMargin', 40,
      'defaultTax', 0,
      'defaultCardFee', 0,
      'includeShippingDefault', false
    ),
    'published',
    null
  )
on conflict do nothing;

-- Optional: a dashboard configuration default for future users will be created on first sign-in by the app
