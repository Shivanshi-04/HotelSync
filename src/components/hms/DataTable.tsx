import { useMemo, useState, type ReactNode } from "react";
import { Search } from "lucide-react";

export type Column<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
};

export function DataTable<T extends Record<string, unknown>>({
  title,
  rows,
  columns,
  searchKeys,
  action,
  emptyText = "No records found.",
}: {
  title?: string;
  rows: T[];
  columns: Column<T>[];
  searchKeys: (keyof T)[];
  action?: ReactNode;
  emptyText?: string;
}) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((row) =>
      searchKeys.some((k) => String(row[k] ?? "").toLowerCase().includes(needle)),
    );
  }, [q, rows, searchKeys]);

  return (
    <div className="panel overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
        {title ? <h2 className="text-base font-semibold">{title}</h2> : <span />}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search…"
              className="h-9 w-52 rounded-lg border border-input bg-background/60 pr-3 pl-9 text-sm outline-none placeholder:text-muted-foreground focus:border-role"
            />
          </div>
          {action}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-160 text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs tracking-wide text-muted-foreground uppercase">
              {columns.map((c) => (
                <th key={c.key} className="px-4 py-3 font-medium">
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, i) => (
              <tr key={i} className="border-b border-border/60 last:border-0 hover:bg-accent/40">
                {columns.map((c) => (
                  <td key={c.key} className="px-4 py-3 align-middle">
                    {c.render(row)}
                  </td>
                ))}
              </tr>
            ))}
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-muted-foreground">
                  {emptyText}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
