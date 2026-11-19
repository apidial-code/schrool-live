import { trpc } from "@/lib/trpc";
import { Users, GraduationCap, UserCheck, DollarSign, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export default function AdminOverview() {
  const stats = trpc.admin.getDashboardStats.useQuery(undefined, { retry: false, staleTime: 0 });
  const recent = trpc.admin.getRecentActivity.useQuery({ limit: 10 }, { retry: false, staleTime: 0 });
  const data = stats.data;
  const statCards = data ? [
    { title: "Total user accounts", value: data.totalUsers, icon: Users },
    { title: "Active students", value: data.activeStudents, icon: GraduationCap },
    { title: "Active teacher accounts", value: data.activeTeachers, icon: UserCheck },
    { title: "Total enrolments", value: data.totalEnrollments, icon: DollarSign },
    { title: "Pending teacher accounts", value: data.pendingTeachers, icon: AlertCircle },
    { title: "Draft enrolments", value: data.draftEnrollments, icon: AlertCircle },
    { title: "Active Standard enrolments", value: data.standardEnrollments, icon: GraduationCap },
    { title: "Active Elite enrolments", value: data.eliteEnrollments, icon: GraduationCap },
  ] : [];
  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3"><p>Live records from this environment.</p><button className="rounded-lg bg-[#1560B0] px-4 py-3 text-white disabled:opacity-50" disabled={stats.isFetching || recent.isFetching} onClick={() => { void stats.refetch(); void recent.refetch(); }}>Refresh overview</button></div>
    {stats.isFetching ? <p role="status">Loading dashboard statistics…</p> : stats.error ? <p role="alert">Statistics could not be loaded. Use Refresh overview to try again.</p> : <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">{statCards.map(stat => { const Icon=stat.icon; return <Card key={stat.title}><CardContent className="p-6"><div className="flex items-center justify-between gap-3"><div><p className="text-sm font-medium text-gray-600">{stat.title}</p><p className="text-3xl font-bold mt-2">{stat.value}</p></div><Icon className="h-7 w-7 text-blue-600" /></div></CardContent></Card>; })}</div>
      <p className="text-sm text-gray-600">Active students have at least one paid enrolment with accepted terms and current access, and an active student account. Each student is counted once. Standard and Elite totals count enrolments. Total enrolments includes drafts.</p>
      <p className="text-sm text-gray-600">Checked: {data && new Date(data.checkedAt).toLocaleString("en-AU",{timeZone:"Australia/Sydney"})} (Australia/Sydney).</p>
    </>}
    <Card><CardHeader><CardTitle>Recent enrolment activations</CardTitle></CardHeader><CardContent>
      {recent.isFetching ? <p role="status">Loading activations…</p> : recent.error ? <p role="alert">Recent activations could not be loaded. Use Refresh overview to try again.</p> : !recent.data?.length ? <p>No recorded enrolment activations.</p> : <ul className="divide-y">{recent.data.map(item => <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-3"><div><a className="font-semibold text-blue-700 underline" href={`/admin/students?enrollmentId=${item.id}`}>{item.studentName || "Student name not recorded"} · Enrolment #{item.id}</a><p>{item.yearLevel} · {item.tier} · Status: {item.status} · Payment: {item.paymentStatus}</p><p className="text-sm text-gray-600">Activated: {item.activatedAt && new Date(item.activatedAt).toLocaleString("en-AU",{timeZone:"Australia/Sydney"})} (Australia/Sydney)</p></div></li>)}</ul>}
    </CardContent></Card>
    <Card><CardHeader><CardTitle>Enrolments and follow-up</CardTitle></CardHeader><CardContent><a href="/admin/students" className="inline-block rounded-lg bg-[#1560B0] px-4 py-3 text-white">Open enrolments and student files</a><p className="mt-3 text-sm text-gray-600">Search students, review payment and progress records, and record Admin notes and Standard phone support.</p></CardContent></Card>
  </div>;
}
