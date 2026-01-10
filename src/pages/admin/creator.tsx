import React, { useEffect, useState } from 'react';
import AlertsList from '../../components/creator/AlertsList';
import { CreatorHeader } from '../../components/creator/CreatorHeader';
import { RoadmapEditor } from '../../components/creator/RoadmapEditor';
import { Timeline } from '../../components/creator/Timeline';
import { EvolutionPanel } from '../../components/creator/EvolutionPanel';
import { HealthMap } from '../../components/creator/HealthMap';
import { ADMIN_UID_FRONT } from '../../config/admin';
import { CopilotPanel } from '../../components/creator/CopilotPanel';

export default function CreatorPage() {
  const [counters, setCounters] = useState({ critical: 0, high: 0 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [modules, setModules] = useState<any[]>([]);
  const [roadmap, setRoadmap] = useState<string[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [timeline, setTimeline] = useState<any[]>([]);

  useEffect(() => {
    // Contadores e timeline a partir dos alertas
    fetch('/api/admin/creator/list', { headers: { 'x-admin': 'true', 'x-admin-uid': ADMIN_UID_FRONT } })
      .then((r) => r.json())
      .then((r) => {
        const data = r.data || [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const critical = data.filter((a: any) => a.severity === 'critical').length;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const high = data.filter((a: any) => a.severity === 'high').length;
        setCounters({ critical, high });
        setTimeline(
          data.slice(0, 10).map((a: any) => ({
            type: a.type || 'alert',
            message: a.message,
            created_at: a.created_at,
          }))
        );
      })
      .catch(() => {});

    // Health map
    fetch('/api/admin/creator/health', { headers: { 'x-admin': 'true', 'x-admin-uid': ADMIN_UID_FRONT } })
      .then((r) => r.json())
      .then((r) => setModules(r.modules || []))
      .catch(() => {});

    // Roadmap sugerido
    fetch('/api/admin/creator/roadmap', { headers: { 'x-admin': 'true', 'x-admin-uid': ADMIN_UID_FRONT } })
      .then((r) => r.json())
      .then((r) => setRoadmap(r.roadmap || []))
      .catch(() => {});

    // Timeline adicional
    fetch('/api/admin/creator/timeline', { headers: { 'x-admin': 'true', 'x-admin-uid': ADMIN_UID_FRONT } })
      .then((r) => r.json())
      .then((r) => setTimeline((prev) => [...(r.timeline || []), ...prev].slice(0, 20)))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto py-6 px-4 space-y-4">
        <CreatorHeader counters={counters} />
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-4">
            <AlertsList />
            <Timeline events={timeline} />
            <EvolutionPanel />
            <CopilotPanel />
          </div>
          <div className="space-y-4">
            <HealthMap modules={modules} />
            <RoadmapEditor items={roadmap} />
          </div>
        </div>
      </div>
    </div>
  );
}

