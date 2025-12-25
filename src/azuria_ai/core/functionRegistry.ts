/**
 * Function Registry
 *
 * Registro e execução de funções disponíveis para o Function Calling da IA.
 */

export interface FunctionParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'any';
  description?: string;
  required?: boolean;
  default?: string | number | boolean | Record<string, unknown> | unknown[];
  enum?: (string | number | boolean)[];
}

export type FunctionHandler = (params: Record<string, unknown>) => Promise<unknown>;

export interface FunctionDefinition {
  name: string;
  description: string;
  category?: string;
  agentId: string;
  parameters: FunctionParameter[];
  handler: FunctionHandler;
}

export interface FunctionsSchemaEntry {
  name: string;
  description: string;
  agentId: string;
  category?: string;
  parameters: FunctionParameter[];
}

const functionRegistry: Map<string, FunctionDefinition> = new Map();

export function registerFunction(functionDef: FunctionDefinition): void {
  if (!functionDef?.name) {
    throw new Error('Function definition must have a name');
  }

  functionRegistry.set(functionDef.name, functionDef);
}

export function unregisterFunction(functionName: string): boolean {
  return functionRegistry.delete(functionName);
}

export function clearFunctions(): void {
  functionRegistry.clear();
}

export function getFunction(
  functionName: string
): FunctionDefinition | undefined {
  return functionRegistry.get(functionName);
}

export function listFunctions(): FunctionDefinition[] {
  return Array.from(functionRegistry.values());
}

export function validateFunctionParams(
  functionName: string,
  params: Record<string, unknown>
): { valid: boolean; missing: string[]; invalid: string[] } {
  const def = getFunction(functionName);
  if (!def) {
    return { valid: false, missing: [], invalid: [] };
  }

  const missing: string[] = [];
  const invalid: string[] = [];

  def.parameters.forEach(param => {
    const value = params?.[param.name];

    if (param.required && (value === undefined || value === null)) {
      missing.push(param.name);
      return;
    }

    if (value !== undefined && value !== null && param.type !== 'any') {
      const isArray = Array.isArray(value);
      const valueType = isArray ? 'array' : typeof value;

      if (valueType !== param.type) {
        invalid.push(param.name);
      }
    }
  });

  return { valid: missing.length === 0 && invalid.length === 0, missing, invalid };
}

export async function callFunction(functionName: string, params: Record<string, unknown>): Promise<unknown> {
  const def = getFunction(functionName);
  if (!def) {
    throw new Error(`Function ${functionName} not registered`);
  }

  const validation = validateFunctionParams(functionName, params);
  if (!validation.valid) {
    throw new Error(
      `Invalid params for ${functionName}: missing [${validation.missing.join(
        ', '
      )}], invalid [${validation.invalid.join(', ')}]`
    );
  }

  return def.handler(params);
}

export function getFunctionsSchema(): FunctionsSchemaEntry[] {
  return listFunctions().map(fn => ({
    name: fn.name,
    description: fn.description,
    agentId: fn.agentId,
    category: fn.category,
    parameters: fn.parameters,
  }));
}

export function getFunctionStats() {
  const functions = listFunctions();
  const byAgent: Record<string, number> = {};
  const byCategory: Record<string, number> = {};

  functions.forEach(fn => {
    byAgent[fn.agentId] = (byAgent[fn.agentId] || 0) + 1;
    const categoryKey = fn.category || 'uncategorized';
    byCategory[categoryKey] = (byCategory[categoryKey] || 0) + 1;
  });

  return {
    total: functions.length,
    byAgent,
    byCategory,
  };
}
