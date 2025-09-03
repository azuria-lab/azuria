import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Check = { name: string; ok: boolean; details?: any; error?: string };

export default function SupabaseDebug() {
  const [checks, setChecks] = useState<Check[]>([]);
  const [loading, setLoading] = useState(false);

  const runChecks = async () => {
    setLoading(true);
    const results: Check[] = [];
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      results.push({ name: 'auth.getSession', ok: !sessionError, details: sessionData, error: sessionError?.message });
    } catch (e: any) {
      results.push({ name: 'auth.getSession', ok: false, error: e?.message || String(e) });
    }

    try {
      const { count, error } = await supabase
        .from('user_profiles')
        .select('id', { count: 'exact', head: true });
      results.push({ name: 'select user_profiles (count)', ok: !error, details: { count }, error: error?.message });
    } catch (e: any) {
      results.push({ name: 'select user_profiles (count)', ok: false, error: e?.message || String(e) });
    }

    setChecks(results);
    setLoading(false);
  };

  const upsertProfile = async () => {
    try {
      const { data: { user }, error: userErr } = await supabase.auth.getUser();
      if (userErr) {throw userErr;}
      if (!user) {throw new Error('Sem usuário autenticado');}

      const { error } = await supabase
        .from('user_profiles')
        .upsert({ id: user.id, email: user.email, name: 'Debug User', updated_at: new Date().toISOString() });
      setChecks((prev) => prev.concat({ name: 'upsert user_profiles', ok: !error, error: error?.message }));
    } catch (e: any) {
      setChecks((prev) => prev.concat({ name: 'upsert user_profiles', ok: false, error: e?.message || String(e) }));
    }
  };

  useEffect(() => {
    runChecks();
     
  }, []);

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Supabase Debug</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={runChecks} disabled={loading}>{loading ? 'Verificando…' : 'Reverificar'}</Button>
            <Button variant="secondary" onClick={upsertProfile}>Upsert meu perfil</Button>
          </div>
          <ul className="space-y-2">
            {checks.map((c, i) => (
              <li key={i} className="text-sm">
                <span className={c.ok ? 'text-green-600' : 'text-red-600'}>
                  {c.ok ? 'OK' : 'ERRO'}
                </span>{' '}• <strong>{c.name}</strong>
                {c.error && <div className="text-muted-foreground">{c.error}</div>}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
