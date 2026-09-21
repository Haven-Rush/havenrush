"use client";

import { useActionState, useEffect, useState } from "react";
import { STOP_KINDS, type StopKind } from "@/lib/event-types";
import {
  createStop,
  deleteStop,
  moveStop,
  updateStop,
  type StopFormState,
} from "@/app/admin/(authenticated)/events/[id]/stops/actions";

export type AdminAgent = { id: string; name: string; brokerage: string };
export type AdminStop = {
  id: string;
  order: number;
  kind: StopKind;
  name: string;
  address: string;
  agentId: string | null;
  scanToken: string;
};

const inputClass =
  "w-full rounded-xl border border-charcoal/15 bg-white px-3.5 py-2.5 text-sm text-charcoal outline-none focus:border-sage";

export function StopsManager({
  eventId,
  stops,
  agents,
}: {
  eventId: string;
  stops: AdminStop[];
  agents: AdminAgent[];
}) {
  const [editingStop, setEditingStop] = useState<AdminStop | null>(null);
  const [resetKey, setResetKey] = useState(0);

  return (
    <div>
      <div className="mb-8 rounded-xl border border-charcoal/10 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-lg font-bold">
            {editingStop ? `Edit stop: ${editingStop.name}` : "Add stop"}
          </h2>
          {editingStop && (
            <button
              type="button"
              onClick={() => setEditingStop(null)}
              className="text-[13px] font-bold text-charcoal/60 hover:text-charcoal"
            >
              Cancel edit
            </button>
          )}
        </div>
        <StopForm
          key={editingStop?.id ?? `new-${resetKey}`}
          eventId={eventId}
          agents={agents}
          stop={editingStop}
          nextOrder={stops.length + 1}
          onSuccess={() => {
            if (editingStop) setEditingStop(null);
            else setResetKey((k) => k + 1);
          }}
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-charcoal/10 bg-white">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-charcoal/10 text-[11px] uppercase tracking-wide text-charcoal/50">
              <th className="px-4 py-3 font-bold">Order</th>
              <th className="px-4 py-3 font-bold">Kind</th>
              <th className="px-4 py-3 font-bold">Name</th>
              <th className="px-4 py-3 font-bold">Address</th>
              <th className="px-4 py-3 font-bold">Agent</th>
              <th className="px-4 py-3 font-bold">Scan token</th>
              <th className="px-4 py-3 font-bold"></th>
            </tr>
          </thead>
          <tbody>
            {stops.map((stop, index) => (
              <tr key={stop.id} className="border-b border-charcoal/8 last:border-0">
                <td className="px-4 py-3 text-charcoal/70">
                  <div className="flex items-center gap-1.5">
                    <span>{stop.order}</span>
                    <div className="flex flex-col leading-none">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => moveStop(eventId, stop.id, "up")}
                        className="text-charcoal/40 hover:text-sage disabled:opacity-20"
                        aria-label="Move up"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        disabled={index === stops.length - 1}
                        onClick={() => moveStop(eventId, stop.id, "down")}
                        className="text-charcoal/40 hover:text-sage disabled:opacity-20"
                        aria-label="Move down"
                      >
                        ▼
                      </button>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-charcoal/70">{STOP_KINDS[stop.kind].label}</td>
                <td className="px-4 py-3 font-semibold">{stop.name}</td>
                <td className="px-4 py-3 text-charcoal/70">{stop.address}</td>
                <td className="px-4 py-3 text-charcoal/70">
                  {agents.find((agent) => agent.id === stop.agentId)?.name ?? "—"}
                </td>
                <td className="px-4 py-3 font-mono text-[11px] text-charcoal/50">
                  {stop.scanToken}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setEditingStop(stop)}
                      className="text-[13px] font-bold text-sage hover:underline"
                    >
                      Edit
                    </button>
                    <form action={deleteStop.bind(null, eventId, stop.id)}>
                      <button
                        type="submit"
                        className="text-[13px] font-bold text-red-700 hover:underline"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {stops.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-charcoal/50">
                  No stops yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StopForm({
  eventId,
  agents,
  stop,
  nextOrder,
  onSuccess,
}: {
  eventId: string;
  agents: AdminAgent[];
  stop: AdminStop | null;
  nextOrder: number;
  onSuccess: () => void;
}) {
  const action = stop
    ? updateStop.bind(null, eventId, stop.id)
    : createStop.bind(null, eventId);
  const [state, formAction, pending] = useActionState<StopFormState, FormData>(action, null);
  const [kind, setKind] = useState<StopKind>(stop?.kind ?? "LISTING");

  useEffect(() => {
    if (state?.ok) onSuccess();
    // Only re-run when a fresh successful submission comes in.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold text-charcoal/60">Order</span>
          <input
            type="number"
            name="order"
            min={1}
            required
            defaultValue={stop?.order ?? nextOrder}
            className={inputClass}
          />
        </label>
        <label className="col-span-1 block sm:col-span-1">
          <span className="mb-1.5 block text-xs font-bold text-charcoal/60">Kind</span>
          <select
            name="kind"
            required
            value={kind}
            onChange={(e) => setKind(e.target.value as StopKind)}
            className={inputClass}
          >
            {Object.entries(STOP_KINDS).map(([value, { label }]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="col-span-2 block sm:col-span-2">
          <span className="mb-1.5 block text-xs font-bold text-charcoal/60">
            Agent{kind === "LISTING" ? "" : " (listings only)"}
          </span>
          <select
            name="agentId"
            required={kind === "LISTING"}
            disabled={kind !== "LISTING"}
            defaultValue={stop?.agentId ?? ""}
            className={`${inputClass} disabled:opacity-40`}
          >
            <option value="">Select an agent…</option>
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.name} — {agent.brokerage}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold text-charcoal/60">Name</span>
          <input name="name" required defaultValue={stop?.name} className={inputClass} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold text-charcoal/60">Address</span>
          <input name="address" required defaultValue={stop?.address} className={inputClass} />
        </label>
      </div>

      {state?.error && <p className="text-[13px] font-semibold text-red-700">{state.error}</p>}

      <div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-sage px-6 py-2.5 text-[13px] font-bold text-linen hover:bg-sage-dark disabled:opacity-50"
        >
          {pending ? "Saving…" : stop ? "Save stop" : "Add stop"}
        </button>
      </div>
    </form>
  );
}
