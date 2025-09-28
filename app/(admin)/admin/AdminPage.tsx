import React from 'react';
import { Badge } from '@/components/ui/badge';

// Nota sobre testes:
// O smoke test importava anteriormente 'app/(admin)/admin/page' que em ambiente de build/transform
// gerou um artefato intermediário page.js com `export { default } from './page';` criando re-export
// recursivo no contexto do Vitest (resolução ESM diferente do pipeline Next). Para evitar o loop
// (RangeError: Maximum call stack size exceeded), o teste agora importa diretamente 'AdminPage.tsx'.
// Se mover este arquivo, ajustar teste em `src/__tests__/next/NextAdmin.smoke.test.tsx`.

export function AdminPage() {
  return (
    <main className="container mx-auto px-4 py-12 space-y-8">
      <header className="space-y-3">
        <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
          Admin <Badge variant="secondary">Fase 1</Badge>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Área administrativa em migração. Funcionalidades reais (gestão de usuários, auditoria, feature flags avançadas)
          serão ativadas de forma incremental.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-3">
        <div className="rounded-lg border p-4 space-y-2">
          <h2 className="font-semibold">Status Migração</h2>
          <ul className="text-sm list-disc list-inside space-y-1">
            <li>Placeholder estático</li>
            <li>Proteção básica via middleware (cookie heurístico)</li>
            <li>Role real pendente (JWT / server check)</li>
          </ul>
        </div>
        <div className="rounded-lg border p-4 space-y-2">
          <h2 className="font-semibold">Próximos Passos</h2>
          <ul className="text-sm list-disc list-inside space-y-1">
            <li>Endpoint server action para ler roles</li>
            <li>Observabilidade (logs admin actions)</li>
            <li>UI de gerenciamento de usuários</li>
          </ul>
        </div>
        <div className="rounded-lg border p-4 space-y-2">
          <h2 className="font-semibold">Riscos</h2>
          <ul className="text-sm list-disc list-inside space-y-1">
            <li>Divergência de auth client/server</li>
            <li>Escalonar permissões cedo demais</li>
            <li>Latência adicional na verificação futura</li>
          </ul>
        </div>
      </section>
    </main>
  );
}

export default AdminPage;
