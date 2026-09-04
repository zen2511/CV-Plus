"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  ListChecks,
  SlidersHorizontal,
  CheckCircle2,
  LogOut,
} from "lucide-react";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/candidatures", label: "Candidatures", icon: ListChecks },
  { href: "/admin/scoring", label: "Scoring", icon: SlidersHorizontal },
  { href: "/admin/acceptes", label: "Acceptés", icon: CheckCircle2 },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-14 flex-col items-center gap-2 border-r border-slate-200 bg-slate-50 py-4">
      <img
  src="/logo-mbs-icon.png"
  alt="MBS HR Solutions"
  className="mb-4 h-8 w-11 object-contain"
/>

      <nav className="flex flex-1 flex-col gap-2">
        {LINKS.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              title={label}
              aria-label={label}
              className={`flex h-9 w-9 items-center justify-center rounded-md transition ${
                active
                  ? "bg-blue-700 text-white"
                  : "text-slate-500 hover:bg-slate-200"
              }`}
            >
              <Icon size={18} />
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        title="Se déconnecter"
        aria-label="Se déconnecter"
        onClick={() => signOut({ callbackUrl: "/admin/login" })}
        className="flex h-9 w-9 items-center justify-center rounded-md text-slate-400 hover:bg-slate-200 hover:text-red-600"
      >
        <LogOut size={17} />
      </button>
    </aside>
  );
}
