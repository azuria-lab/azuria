import { toast as baseToast, useToast as useToastImpl } from "@/hooks/use-toast";
import type { ToastActionElement, ToastProps } from "@/components/ui/toast";
import type React from "react";

// Augment the base toast with convenience helpers to ease migration from `sonner`
type ToastOpts = Omit<ToastProps, "open"> & {
	title?: React.ReactNode;
	description?: React.ReactNode;
	id?: string; // sonner-style id for update flows
	action?: ToastActionElement; // support action just like internal store
};

type ToastInput = ToastOpts | string;

type ToastCreated = { id: string; update: (props: Partial<ToastOpts>) => void; dismiss: () => void };
const registry = new Map<string, ToastCreated>();

function createOrUpdate(message: string, opts: Partial<ToastOpts> = {}) {
	const { id: customId, ...rest } = opts;
	const payload: ToastOpts = { description: message, ...(rest as ToastOpts) };

	if (customId && registry.has(customId)) {
		const entry = registry.get(customId);
		if (entry) { entry.update(payload); }
		return entry;
	}

	const created = baseToast(payload as ToastOpts) as ToastCreated;
	if (customId) {registry.set(customId, created);}
	return created;
}

function toastImpl(arg1: ToastInput, opts?: Partial<ToastOpts>) {
	if (typeof arg1 === "string") {
		// Support legacy sonner-style: toast("message", { id, ... })
		return createOrUpdate(arg1, opts);
	}
	const created = baseToast(arg1 as ToastOpts) as ToastCreated;
	if ((arg1 as ToastOpts).id) {registry.set((arg1 as ToastOpts).id as string, created);}
	return created;
}

const toast = Object.assign(toastImpl, {
	success: (message: string, opts: Partial<ToastOpts> = {}) =>
		createOrUpdate(message, opts),
		error: (message: string, opts: Partial<ToastOpts> = {}) =>
		createOrUpdate(message, { variant: "destructive", ...(opts as Partial<ToastOpts>) }),
	info: (message: string, opts: Partial<ToastOpts> = {}) =>
		createOrUpdate(message, opts),
	warning: (message: string, opts: Partial<ToastOpts> = {}) =>
		createOrUpdate(message, opts),
		loading: (message: string, opts: Partial<ToastOpts> = {}) =>
		createOrUpdate(message, { ...(opts as Partial<ToastOpts>) }),
	dismiss: (id?: string) => {
		if (!id) {return;} // no-op for global dismiss
		const entry = registry.get(id);
		if (entry) {entry.dismiss();}
	},
});

export const useToast = useToastImpl;
export { toast };
