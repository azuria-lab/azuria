/**
 * Declarações de tipos para o ambiente Deno
 * 
 * Este arquivo fornece tipos para o runtime Deno usado nas Edge Functions do Supabase.
 * Ele resolve os erros do TypeScript no VS Code que não reconhece o ambiente Deno.
 * 
 * Nota: No runtime Deno do Supabase, essas APIs estão disponíveis globalmente.
 * Este arquivo apenas fornece tipos para o TypeScript no ambiente de desenvolvimento.
 */

declare global {
  namespace Deno {
    interface Env {
      get(key: string): string | undefined;
    }

    const env: Env;

    function serve(
      handler: (req: Request) => Response | Promise<Response>
    ): void;
  }
}

export {};

