"use client";

import { startTransition, useActionState, useState } from "react";
import { type RoleState, setUserRoleAction } from "@/app/admin/users/actions";
import { Select } from "@/components/ui/select";

const IDLE: RoleState = { error: null, done: null };

const ROLES = [
  { value: "USER", label: "Хэрэглэгч" },
  { value: "ADMIN", label: "Админ" },
] as const;

type Role = (typeof ROLES)[number]["value"];

/** Changes one user's role; saves as soon as another role is picked and confirmed. */
export function RoleSelect({ userId, role, name }: { userId: string; role: Role; name: string }) {
  const [state, save, pending] = useActionState(setUserRoleAction.bind(null, userId), IDLE);
  // No <form>: a form action resets its fields once it finishes, and a <select>
  // would jump back to the role the page first loaded with.
  // While saving, the pick is shown; afterwards the role the server sent back.
  const [picked, setPicked] = useState<Role | null>(null);

  return (
    <div className="flex flex-col gap-1">
      <Select
        tone="light"
        size="sm"
        wrapperClassName="w-36"
        aria-label={`${name}-ийн эрх`}
        value={pending && picked ? picked : role}
        disabled={pending}
        onChange={(e) => {
          const next = ROLES.find((r) => r.value === e.target.value);
          if (!next || !window.confirm(`${name}-д “${next.label}” эрх өгөх үү?`)) return;
          setPicked(next.value);
          startTransition(() => save(next.value));
        }}
      >
        {ROLES.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </Select>
      <span aria-live="polite" className="text-xs">
        {state.error && <span className="text-red-600">{state.error}</span>}
        {state.done && !pending && <span className="text-mg-muted">{state.done}</span>}
      </span>
    </div>
  );
}
