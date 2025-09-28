export const RLS_TABLES = ['public.invoices', 'public.transactions'];
export const RLS_EXPECTED_POLICIES = {
  'public.invoices': [
    'invoices_select_same_tenant',
    'invoices_insert_same_tenant',
    'invoices_update_same_tenant',
    'invoices_delete_same_tenant'
  ],
  'public.transactions': [
    'transactions_select_same_tenant',
    'transactions_insert_same_tenant',
    'transactions_update_same_tenant',
    'transactions_delete_same_tenant'
  ]
};
