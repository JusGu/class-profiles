"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PAGES } from "@/lib/types";

export default function TabBar() {
  const pathname = usePathname();

  return (
    <div className="tab-bar">
      {PAGES.map((page) => {
        const isActive = pathname === page.href;
        return (
          <Link
            key={page.id}
            href={page.href}
            className={`tab ${isActive ? "active" : ""}`}
          >
            <span className="tab-icon">M</span>
            {page.filename}
          </Link>
        );
      })}
    </div>
  );
}
