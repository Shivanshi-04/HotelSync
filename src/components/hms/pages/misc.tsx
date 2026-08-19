import { PageHeader, Panel, StatCard, StatusBadge } from "@/components/hms/ui-kit";
import { DonutProgress } from "@/components/hms/DonutProgress";
import {
  BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import {
  attendanceTrend, complaintsByCategory, currentStudent, feeCollection, inr, mealTimings,
  messTimetable, monthlyCollection, notices, type Role,
} from "@/data/hms";
import { Download, FileBarChart2, Megaphone, UtensilsCrossed, Wallet } from "lucide-react";

const btnRole = "inline-flex items-center gap-2 rounded-lg bg-role px-3 py-2 text-sm font-medium text-role-foreground hover:opacity-90";
const btnGhost = "inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-accent";

/* ---------------- Mess ---------------- */
export function MessPage({ role }: { role: Role }) {
  const editable = role === "admin";
  return (
    <>
      <PageHeader
        title="Mess Timetable"
        description="Weekly menu and meal timings for the hostel mess."
        action={editable ? <button className={btnRole}><UtensilsCrossed className="size-4" />Edit menu</button> : undefined}
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {mealTimings.map((m) => (
          <Panel key={m.meal} className="p-4">
            <p className="text-xs tracking-wide text-muted-foreground uppercase">{m.meal}</p>
            <p className="mt-1 font-semibold">{m.time}</p>
          </Panel>
        ))}
      </div>
      <div className="panel overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs tracking-wide text-muted-foreground uppercase">
              {["Day", "Breakfast", "Lunch", "Snacks", "Dinner", ...(editable ? [""] : [])].map((h) => (
                <th key={h} className="px-4 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {messTimetable.map((d) => (
              <tr key={d.day} className="border-b border-border/60 last:border-0 hover:bg-accent/40">
                <td className="px-4 py-3 font-medium">{d.day}</td>
                <td className="px-4 py-3 text-muted-foreground">{d.breakfast}</td>
                <td className="px-4 py-3 text-muted-foreground">{d.lunch}</td>
                <td className="px-4 py-3 text-muted-foreground">{d.snacks}</td>
                <td className="px-4 py-3 text-muted-foreground">{d.dinner}</td>
                {editable ? <td className="px-4 py-3"><button className="rounded-lg border border-border px-2.5 py-1 text-xs hover:bg-accent">Edit</button></td> : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ---------------- Notices ---------------- */
export function NoticesPage({ role }: { role: Role }) {
  const canPost = role === "admin";
  return (
    <>
      <PageHeader
        title="Notices"
        description={canPost ? "Publish announcements to students and wardens." : "Announcements from the hostel office."}
        action={canPost ? <button className={btnRole}><Megaphone className="size-4" />Post notice</button> : undefined}
      />
      <div className="grid gap-4 md:grid-cols-2">
        {notices.map((n) => (
          <Panel key={n.id}>
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-semibold">{n.title}</h3>
              {n.pinned ? <StatusBadge status="Pinned" /> : null}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{n.body}</p>
            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
              <span>{n.audience}</span>
              <span>{n.postedAt}</span>
            </div>
            {canPost ? (
              <button className="mt-3 rounded-lg border border-border px-2.5 py-1 text-xs hover:bg-destructive/15 hover:text-destructive">Remove</button>
            ) : null}
          </Panel>
        ))}
      </div>
    </>
  );
}

/* ---------------- Reports ---------------- */
export function ReportsPage({ role }: { role: Role }) {
  const canExport = role === "admin";
  const handleExportReports = () => {
    const escapeCsv = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;
    const rows = [
      ["Report", "Metric", "Value", "Details"],
      ["Fee collection", "Collected", feeCollection.collected, `Target: ${feeCollection.target}`],
      ["Fee collection", "Collected percentage", `${feeCollection.collectedPct}%`, ""],
      ...attendanceTrend.map((item) => ["Weekly attendance", item.day, item.present, `Absent: ${item.absent}`]),
      ...monthlyCollection.map((item) => ["Monthly collection", item.month, item.amount, "Amount in thousands" ]),
      ...complaintsByCategory.map((item) => ["Complaints by category", item.name, item.value, ""]),
    ];

    const csv = rows.map((row) => row.map(escapeCsv).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "hostel-reports.csv";
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <PageHeader
        title="Reports"
        description={canExport ? "Generate and export operational reports." : "Read-only analytics for your blocks."}
        action={canExport ? <button type="button" className={btnRole} onClick={handleExportReports}><Download className="size-4" />Export CSV</button> : undefined}
      />
      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <StatCard icon={Wallet} label="Fees collected" value={inr(feeCollection.collected)} hint={`of ${inr(feeCollection.target)} target`} />
        <StatCard icon={FileBarChart2} label="Reports generated" value="38" hint="This academic year" />
        <StatCard icon={Megaphone} label="Open complaints" value="21" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <h2 className="mb-4 text-base font-semibold">Weekly attendance</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--popover-foreground)" }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="present" fill="var(--role)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="absent" fill="var(--muted)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel>
          <h2 className="mb-2 text-base font-semibold">Fee collection</h2>
          <DonutProgress value={feeCollection.collectedPct} label="collected" />
        </Panel>
        <Panel className="lg:col-span-3">
          <h2 className="mb-4 text-base font-semibold">Monthly collection (₹ in thousands)</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyCollection}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--popover-foreground)" }} />
                <Bar dataKey="amount" fill="var(--role)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel className="lg:col-span-3">
          <h2 className="mb-4 text-base font-semibold">Complaints by category</h2>
          <div className="grid gap-3 sm:grid-cols-5">
            {complaintsByCategory.map((c) => (
              <div key={c.name} className="rounded-xl border border-border p-4">
                <p className="text-xs text-muted-foreground">{c.name}</p>
                <p className="text-2xl font-bold">{c.value}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}

/* ---------------- Profile ---------------- */
export function ProfilePage() {
  const fields: [string, string][] = [
    ["Full name", currentStudent.name],
    ["Roll number", currentStudent.rollNo],
    ["Course", currentStudent.course],
    ["Email", currentStudent.email],
    ["Phone", currentStudent.phone],
    ["Room", currentStudent.roomNo],
    ["Guardian", currentStudent.guardianName],
    ["Guardian phone", currentStudent.guardianPhone],
    ["Joined on", currentStudent.dateOfJoining],
  ];
  return (
    <>
      <PageHeader title="Profile" description="Your hostel record and contact details." action={<button className={btnRole}>Save changes</button>} />
      <div className="grid gap-6 lg:grid-cols-3">
        <Panel className="flex flex-col items-center text-center">
          <span className="flex size-24 items-center justify-center rounded-full bg-role text-3xl font-bold text-role-foreground">
            {currentStudent.name.charAt(0)}
          </span>
          <p className="mt-4 text-lg font-semibold">{currentStudent.name}</p>
          <p className="text-sm text-muted-foreground">{currentStudent.rollNo}</p>
          <div className="mt-3"><StatusBadge status={currentStudent.status} /></div>
          <button className={btnGhost + " mt-5"}>Upload photo</button>
        </Panel>
        <Panel className="lg:col-span-2">
          <h2 className="mb-4 text-base font-semibold">Personal details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map(([label, value]) => (
              <label key={label} className="text-sm">
                <span className="mb-1.5 block text-muted-foreground">{label}</span>
                <input defaultValue={value} className="h-10 w-full rounded-lg border border-input bg-background/60 px-3 text-sm outline-none focus:border-role" />
              </label>
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}

/* ---------------- Settings ---------------- */
export function SettingsPage({ role }: { role: Role }) {
  const toggles = [
    ["Email notifications", "Get updates on approvals and notices"],
    ["SMS alerts", "Critical alerts sent to your phone"],
    ["Weekly digest", "Summary of activity every Monday"],
    role === "student"
      ? ["Share room details", "Let roommates see your contact number"]
      : ["Auto-escalate complaints", "Escalate tickets pending over 48 hours"],
  ];
  return (
    <>
      <PageHeader title="Settings" description="Preferences for this panel." action={<button className={btnRole}>Save preferences</button>} />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel>
          <h2 className="mb-4 text-base font-semibold">Notifications</h2>
          <div className="space-y-4">
            {toggles.map(([title, sub], i) => (
              <label key={title} className="flex items-start justify-between gap-4">
                <span>
                  <span className="block text-sm font-medium">{title}</span>
                  <span className="block text-xs text-muted-foreground">{sub}</span>
                </span>
                <input type="checkbox" defaultChecked={i < 2} className="mt-1 size-4 accent-[var(--role)]" />
              </label>
            ))}
          </div>
        </Panel>
        <Panel>
          <h2 className="mb-4 text-base font-semibold">Security</h2>
          <div className="space-y-4">
            <label className="block text-sm"><span className="mb-1.5 block text-muted-foreground">Current password</span>
              <input type="password" defaultValue="demo1234" className="h-10 w-full rounded-lg border border-input bg-background/60 px-3 text-sm outline-none focus:border-role" /></label>
            <label className="block text-sm"><span className="mb-1.5 block text-muted-foreground">New password</span>
              <input type="password" className="h-10 w-full rounded-lg border border-input bg-background/60 px-3 text-sm outline-none focus:border-role" /></label>
            <button className={btnGhost}>Update password</button>
          </div>
        </Panel>
      </div>
    </>
  );
}
