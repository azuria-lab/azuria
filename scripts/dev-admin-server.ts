/* eslint-disable no-console, @typescript-eslint/no-explicit-any */
import http, { IncomingMessage, ServerResponse } from 'node:http';

import ackHandler from '../src/api/admin/creator/ack';
import evolutionHandler from '../src/api/admin/creator/evolution';
import listHandler from '../src/api/admin/creator/list';
import streamHandler from '../src/api/admin/creator/stream';
import healthHandler from '../src/api/admin/creator/health';
import roadmapHandler from '../src/api/admin/creator/roadmap';
import timelineHandler from '../src/api/admin/creator/timeline';
import copilotHandler from '../src/api/admin/creator/copilot';

type Handler = (req: any, res: any) => any;

function enhanceRes(res: ServerResponse) {
  const r: any = res;
  r.status = (code: number) => {
    res.statusCode = code;
    return r;
  };
  r.json = (payload: any) => {
    if (!res.headersSent) { res.setHeader('Content-Type', 'application/json'); }
    res.end(JSON.stringify(payload));
    return r;
  };
  return r;
}

async function readBody(req: IncomingMessage) {
  return new Promise<string>((resolve) => {
    const chunks: Buffer[] = [];
    req.on('data', (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', () => resolve(''));
  });
}

function toQueryObject(searchParams: URLSearchParams) {
  const obj: Record<string, string> = {};
  searchParams.forEach((v, k) => {
    obj[k] = v;
  });
  return obj;
}

async function dispatch(handler: Handler, req: IncomingMessage, res: ServerResponse, query: any, body: string) {
  const wrappedReq: any = {
    method: req.method,
    headers: req.headers,
    query,
    body,
    url: req.url,
    on: req.on.bind(req),
  };
  const wrappedRes = enhanceRes(res);
  await handler(wrappedReq, wrappedRes);
}

const server = http.createServer(async (req, res) => {
  if (!req.url) {
    res.writeHead(400).end('missing url');
    return;
  }

  const { pathname, searchParams } = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const query = toQueryObject(searchParams);

  // CORS for local dev
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-uid, x-user-id, x-admin');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  if (req.method === 'OPTIONS') {
    res.writeHead(204).end();
    return;
  }

  try {
    if (pathname === '/api/admin/creator/list') {
      await dispatch(listHandler as Handler, req, res, query, '');
      return;
    }

    if (pathname === '/api/admin/creator/evolution') {
      await dispatch(evolutionHandler as Handler, req, res, query, '');
      return;
    }

    if (pathname === '/api/admin/creator/ack') {
      const body = await readBody(req);
      await dispatch(ackHandler as Handler, req, res, query, body);
      return;
    }

    if (pathname === '/api/admin/creator/stream') {
      await dispatch(streamHandler as Handler, req, res, query, '');
      return;
    }

    if (pathname === '/api/admin/creator/health') {
      await dispatch(healthHandler as Handler, req, res, query, '');
      return;
    }

    if (pathname === '/api/admin/creator/roadmap') {
      await dispatch(roadmapHandler as Handler, req, res, query, '');
      return;
    }

    if (pathname === '/api/admin/creator/timeline') {
      await dispatch(timelineHandler as Handler, req, res, query, '');
      return;
    }

    if (pathname === '/api/admin/creator/copilot') {
      const body = await readBody(req);
      await dispatch(copilotHandler as Handler, req, res, query, body);
      return;
    }

    res.writeHead(404).end('not found');
  } catch (err: any) {
    if (!res.headersSent) { res.writeHead(500, { 'Content-Type': 'application/json' }); }
    res.end(JSON.stringify({ error: err?.message || 'server error' }));
    console.error(err);
  }
});

const PORT = process.env.ADMIN_API_PORT ? Number(process.env.ADMIN_API_PORT) : 8081;
server.listen(PORT, () => {
  console.log(`Admin dev API listening on http://localhost:${PORT}`);
});