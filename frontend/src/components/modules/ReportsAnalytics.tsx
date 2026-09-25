import React, { useState, useEffect } from 'react';
import { useCFMS } from '../../context/CFMSContext';
import { StatCard } from '../common/StatCard';
import {
  BarChart3,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileCheck,
  FileText,
  Building2,
  Users,
  Download,
  Printer,
  ListFilter,
  PieChart,
  ShieldCheck,
  Search,
  HardDrive,
  BookOpen
} from 'lucide-react';

interface ReportsAnalyticsProps {
  activeModule?: string;
}

export const ReportsAnalytics: React.FC<ReportsAnalyticsProps> = ({ activeModule }) => {
  const { departments, courseFiles, courses, usersList, submissionWindow } = useCFMS();
  const [activeReportTab, setActiveReportTab] = useState<
    'progress' | 'pending' | 'approved' | 'late' | 'dept' | 'teacher' | 'storage' | 'course'
  >('progress');

  useEffect(() => {
    if (activeModule === 'Storage Reports') {
      setActiveReportTab('storage');
    } else if (activeModule === 'Course Reports') {
      setActiveReportTab('course');
    } else if (activeModule === 'Department Reports' || activeModule === 'Department Performance') {
      setActiveReportTab('dept');
    } else if (activeModule === 'Teacher Reports') {
      setActiveReportTab('teacher');
    } else if (activeModule === 'Approval Reports') {
      setActiveReportTab('approved');
    } else if (activeModule === 'Late Submissions') {
      setActiveReportTab('late');
    } else if (activeModule === 'Pending Submissions' || activeModule === 'Pending Files') {
      setActiveReportTab('pending');
    } else if (activeModule === 'Dashboard Reports') {
      setActiveReportTab('progress');
    }
  }, [activeModule]);

  const [filterDept, setFilterDept] = useState('ALL');

  // Metrics Calculations
  const totalFiles = courseFiles.length;
  const pendingFiles = courseFiles.filter((f) => f.status === 'Submitted' || f.status === 'Under Review' || f.status === 'In Review');
  const approvedFiles = courseFiles.filter((f) => f.status === 'Approved');
  const lateFiles = courseFiles.filter((f) => f.status === 'Late Submission');
  const revisionFiles = courseFiles.filter((f) => f.status === 'Returned for Revision' || f.status === 'Revision Requested');

  const teachers = usersList.filter((u) => u.role === 'REGULAR_TEACHER' || u.role === 'VISITING_TEACHER');

  // Storage Calculations (approx 2.4 MB average per file)
  const totalSizeMB = Math.round(totalFiles * 2.4 * 10) / 10;
  const approvedSizeMB = Math.round(approvedFiles.length * 2.4 * 10) / 10;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-3xs font-mono font-extrabold text-[#1E7B4E] uppercase tracking-wider bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              QEC & Institutional Audit Intelligence
            </span>
            <span className="text-3xs text-slate-400 font-mono">Session: {submissionWindow.sessionName}</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 font-heading mt-1">
            CFMS Executive Reports & Compliance ({activeModule || 'Dashboard Reports'})
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
          <button
            onClick={() => alert('Exporting executive report summary as CSV.')}
            className="px-4 py-2 text-xs font-bold text-white bg-[#1E7B4E] hover:bg-[#165534] rounded-xl flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Executive Summary</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Submissions"
          value={totalFiles.toString()}
          subtitle="Spring 2026 Session"
          icon={FileText}
          color="emerald"
        />
        <StatCard
          title="Approved & Archived"
          value={approvedFiles.length.toString()}
          subtitle={`${Math.round((approvedFiles.length / (totalFiles || 1)) * 100)}% Clearance Rate`}
          icon={CheckCircle2}
          color="indigo"
        />
        <StatCard
          title="Pending Review"
          value={pendingFiles.length.toString()}
          subtitle="Awaiting HOD Action"
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Storage Consumption"
          value={`${totalSizeMB} MB`}
          subtitle="Document Repository Size"
          icon={HardDrive}
          color="purple"
        />
      </div>

      {/* Report Selector Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs flex flex-wrap items-center gap-1.5">
        {[
          { id: 'progress', label: 'Dashboard Reports', icon: BarChart3 },
          { id: 'dept', label: 'Department Reports', icon: Building2 },
          { id: 'teacher', label: 'Teacher Reports', icon: Users },
          { id: 'course', label: 'Course Reports', icon: BookOpen },
          { id: 'approved', label: 'Approval Reports', icon: FileCheck },
          { id: 'storage', label: 'Storage Reports', icon: HardDrive },
          { id: 'pending', label: 'Pending Files Audit', icon: Clock },
          { id: 'late', label: 'Late Submissions', icon: AlertTriangle }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeReportTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveReportTab(tab.id as any)}
              className={`px-3.5 py-2 text-xs font-extrabold rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#1E7B4E] text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* REPORT CONTENT PANEL */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        {/* REPORT 1: Submission Progress */}
        {activeReportTab === 'progress' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 font-heading">
                  Submission Progress Report
                </h3>
                <p className="text-3xs text-slate-500">
                  Overall progress across all assigned courses for {submissionWindow.sessionName}.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-[#1E7B4E] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Window: {submissionWindow.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-2">
                <span className="text-3xs font-extrabold text-emerald-800 uppercase font-mono">
                  Approved & Archived
                </span>
                <p className="text-2xl font-extrabold text-[#165534]">{approvedFiles.length}</p>
                <div className="w-full bg-emerald-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#1E7B4E] h-full"
                    style={{ width: `${(approvedFiles.length / (totalFiles || 1)) * 100}%` }}
                  />
                </div>
              </div>

              <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-xl space-y-2">
                <span className="text-3xs font-extrabold text-amber-800 uppercase font-mono">
                  Pending Review & Under Review
                </span>
                <p className="text-2xl font-extrabold text-amber-900">{pendingFiles.length}</p>
                <div className="w-full bg-amber-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-600 h-full"
                    style={{ width: `${(pendingFiles.length / (totalFiles || 1)) * 100}%` }}
                  />
                </div>
              </div>

              <div className="p-4 bg-purple-50/50 border border-purple-200 rounded-xl space-y-2">
                <span className="text-3xs font-extrabold text-purple-800 uppercase font-mono">
                  Late Submissions
                </span>
                <p className="text-2xl font-extrabold text-purple-900">{lateFiles.length}</p>
                <div className="w-full bg-purple-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-purple-600 h-full"
                    style={{ width: `${(lateFiles.length / (totalFiles || 1)) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* REPORT 2: Pending Files */}
        {activeReportTab === 'pending' && (
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 font-heading border-b border-slate-100 pb-3">
              Pending Files Audit ({pendingFiles.length} files awaiting HOD review)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b font-extrabold text-3xs uppercase tracking-wider">
                    <th className="p-3">Course Code & File Title</th>
                    <th className="p-3">Faculty Member</th>
                    <th className="p-3">Department</th>
                    <th className="p-3">Submission Date</th>
                    <th className="p-3">Current Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pendingFiles.map((f) => (
                    <tr key={f.id} className="hover:bg-slate-50/80">
                      <td className="p-3">
                        <span className="font-extrabold text-slate-900 block">{f.title}</span>
                        <span className="text-3xs text-slate-500 font-mono">{f.courseCode} ({f.currentVersion})</span>
                      </td>
                      <td className="p-3 font-semibold text-slate-800">{f.teacherName}</td>
                      <td className="p-3 text-slate-600">{f.departmentName}</td>
                      <td className="p-3 text-slate-500 font-mono">{f.uploadDate}</td>
                      <td className="p-3">
                        <span className="px-2.5 py-0.5 font-bold text-3xs rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                          {f.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* REPORT 3: Approved Files */}
        {activeReportTab === 'approved' && (
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 font-heading border-b border-slate-100 pb-3">
              Approved Files Report ({approvedFiles.length} fully verified course files)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b font-extrabold text-3xs uppercase tracking-wider">
                    <th className="p-3">Course Code & File Title</th>
                    <th className="p-3">Faculty Member</th>
                    <th className="p-3">Department</th>
                    <th className="p-3">Approved Version</th>
                    <th className="p-3">Archive Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {approvedFiles.map((f) => (
                    <tr key={f.id} className="hover:bg-slate-50/80">
                      <td className="p-3">
                        <span className="font-extrabold text-slate-900 block">{f.title}</span>
                        <span className="text-3xs text-slate-500 font-mono">{f.courseCode}</span>
                      </td>
                      <td className="p-3 font-semibold text-slate-800">{f.teacherName}</td>
                      <td className="p-3 text-slate-600">{f.departmentName}</td>
                      <td className="p-3 font-mono font-bold text-[#1E7B4E]">{f.currentVersion}</td>
                      <td className="p-3">
                        <span className="px-2.5 py-0.5 font-bold text-3xs rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 w-max">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Archived</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* REPORT 4: Late Submissions */}
        {activeReportTab === 'late' && (
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 font-heading border-b border-slate-100 pb-3">
              Late Submissions Exception Audit ({lateFiles.length} files submitted past cutoff)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b font-extrabold text-3xs uppercase tracking-wider">
                    <th className="p-3">Course File Title</th>
                    <th className="p-3">Faculty Member</th>
                    <th className="p-3">Submission Window Deadline</th>
                    <th className="p-3">Actual Submission Date</th>
                    <th className="p-3">Audit Flag</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lateFiles.map((f) => (
                    <tr key={f.id} className="hover:bg-slate-50/80">
                      <td className="p-3 font-bold text-slate-900">{f.title}</td>
                      <td className="p-3 font-semibold text-slate-800">{f.teacherName}</td>
                      <td className="p-3 font-mono text-slate-500">{submissionWindow.endDate}</td>
                      <td className="p-3 font-mono text-purple-700 font-bold">{f.uploadDate}</td>
                      <td className="p-3">
                        <span className="px-2.5 py-0.5 font-bold text-3xs rounded-full bg-purple-100 text-purple-900 border border-purple-300">
                          LATE SUBMISSION
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* REPORT 5: Department Compliance */}
        {activeReportTab === 'dept' && (
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 font-heading border-b border-slate-100 pb-3">
              Departmental Quality Compliance Benchmark
            </h3>
            <div className="space-y-4">
              {departments.map((d) => (
                <div key={d.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex justify-between text-xs font-extrabold text-slate-900">
                    <span>{d.name} ({d.code})</span>
                    <span className="font-mono text-[#1E7B4E]">{d.submissionRate}% Compliant</span>
                  </div>
                  <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                    <div
                      className="bg-[#1E7B4E] h-full rounded-full transition-all duration-500"
                      style={{ width: `${d.submissionRate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* REPORT 6: Teacher Compliance */}
        {activeReportTab === 'teacher' && (
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 font-heading border-b border-slate-100 pb-3">
              Faculty Submission & Timeliness Index
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b font-extrabold text-3xs uppercase tracking-wider">
                    <th className="p-3">Faculty Name</th>
                    <th className="p-3">Designation / Role</th>
                    <th className="p-3">Department</th>
                    <th className="p-3">Compliance Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {teachers.map((t) => {
                    const tFiles = courseFiles.filter((f) => f.teacherId === t.id || f.teacherName === t.name);
                    const isSubmitted = tFiles.length > 0;
                    const isApproved = tFiles.some((f) => f.status === 'Approved');

                    return (
                      <tr key={t.id} className="hover:bg-slate-50/80">
                        <td className="p-3 font-bold text-slate-900">{t.name}</td>
                        <td className="p-3 text-slate-600">{t.designation || t.role}</td>
                        <td className="p-3 text-slate-500">{t.departmentName}</td>
                        <td className="p-3">
                          {isApproved ? (
                            <span className="px-2.5 py-0.5 text-3xs font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                              Fully Compliant
                            </span>
                          ) : isSubmitted ? (
                            <span className="px-2.5 py-0.5 text-3xs font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                              Submitted / In Review
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 text-3xs font-bold rounded-full bg-red-100 text-red-800 border border-red-300">
                              Pending Submission
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* REPORT 7: Course Reports */}
        {activeReportTab === 'course' && (
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 font-heading border-b border-slate-100 pb-3">
              Course-wise Submission & Audit Report ({courses.length} Active Academic Courses)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b font-extrabold text-3xs uppercase tracking-wider">
                    <th className="p-3">Course Code & Title</th>
                    <th className="p-3">Assigned Faculty</th>
                    <th className="p-3">Department</th>
                    <th className="p-3">Enrolled Students</th>
                    <th className="p-3">Submitted Files</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {courses.map((c) => {
                    const cFiles = courseFiles.filter((f) => f.courseId === c.id || f.courseCode === c.code);
                    return (
                      <tr key={c.id} className="hover:bg-slate-50/80">
                        <td className="p-3">
                          <span className="font-extrabold text-[#1E7B4E] font-mono block">{c.code}</span>
                          <span className="font-bold text-slate-900">{c.title}</span>
                        </td>
                        <td className="p-3 font-semibold text-slate-800">{c.assignedTeacherName}</td>
                        <td className="p-3 text-slate-600">{c.departmentName}</td>
                        <td className="p-3 font-bold text-slate-700">{c.totalStudents}</td>
                        <td className="p-3 font-mono font-bold text-indigo-700">{cFiles.length} file(s)</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full text-3xs font-bold bg-emerald-100 text-emerald-800">
                            {c.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* REPORT 8: Storage Reports */}
        {activeReportTab === 'storage' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 font-heading">
                  System Storage & Disk Consumption Analytics
                </h3>
                <p className="text-3xs text-slate-500">
                  Storage utilization across course file categories, departments, and server upload volumes.
                </p>
              </div>
              <span className="text-xs font-mono font-extrabold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                Total Storage: {totalSizeMB} MB
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-purple-50/50 border border-purple-200 rounded-xl space-y-2">
                <span className="text-3xs font-extrabold text-purple-900 uppercase font-mono">
                  Total File Volume
                </span>
                <p className="text-2xl font-extrabold text-purple-950">{totalSizeMB} MB</p>
                <p className="text-3xs text-purple-700 font-medium">Across {totalFiles} uploaded course documents</p>
              </div>

              <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-2">
                <span className="text-3xs font-extrabold text-emerald-900 uppercase font-mono">
                  Approved File Storage
                </span>
                <p className="text-2xl font-extrabold text-[#165534]">{approvedSizeMB} MB</p>
                <p className="text-3xs text-emerald-700 font-medium">Permanently archived in QA vault</p>
              </div>

              <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-xl space-y-2">
                <span className="text-3xs font-extrabold text-blue-900 uppercase font-mono">
                  Average Document Size
                </span>
                <p className="text-2xl font-extrabold text-blue-950">2.4 MB</p>
                <p className="text-3xs text-blue-700 font-medium">PDF, DOCX & Compressed Formats</p>
              </div>
            </div>

            {/* Department Storage Distribution */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b pb-1">
                Storage Allocation by Department
              </h4>
              <div className="space-y-3">
                {departments.map((d) => {
                  const dFiles = courseFiles.filter((f) => f.departmentId === d.id || f.departmentName.includes(d.name));
                  const dMB = Math.round(dFiles.length * 2.4 * 10) / 10;
                  const percent = Math.round((dMB / (totalSizeMB || 1)) * 100);

                  return (
                    <div key={d.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                      <div className="flex justify-between text-xs font-bold text-slate-900">
                        <span>{d.name}</span>
                        <span className="font-mono text-purple-700">{dMB} MB ({percent}%)</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-purple-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};