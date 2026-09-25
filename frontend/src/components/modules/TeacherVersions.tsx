import React from 'react';
import { useCFMS } from '../../context/CFMSContext';
import { useAuth } from '../../context/AuthContext';
import { History, FileText, Download } from 'lucide-react';

export const TeacherVersions: React.FC = () => {
  const { courseFiles } = useCFMS();
  const { currentUser } = useAuth();

  const myFiles = courseFiles.filter(
    (f) => f.teacherId === currentUser.id || f.teacherName === currentUser.name
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold font-heading text-slate-900">Version History & Revision Audits</h2>
        <p className="text-xs text-slate-500">
          Trace document iterations, uploaded revisions, and historical changelogs across all your course files.
        </p>
      </div>

      <div className="space-y-6">
        {myFiles.map((f) => (
          <div key={f.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-slate-900">{f.title}</span>
                <span className="text-3xs text-slate-400 block">{f.courseCode} • {f.category}</span>
              </div>
              <span className="px-2.5 py-0.5 text-3xs font-bold bg-slate-100 text-slate-800 rounded-full border">
                Current: {f.currentVersion}
              </span>
            </div>

            <div className="space-y-3">
              <h4 className="text-3xs font-bold uppercase tracking-wider text-slate-400">
                Uploaded Revisions ({f.versionHistory.length})
              </h4>
              <div className="space-y-2">
                {f.versionHistory.map((v) => (
                  <div key={v.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-3xs bg-indigo-100 text-indigo-800 px-1.5 py-0.2 rounded">
                          {v.versionNumber}
                        </span>
                        <span className="font-bold text-slate-900">{v.fileName}</span>
                      </div>
                      <p className="text-3xs text-slate-500 mt-1">{v.changeLog}</p>
                    </div>
                    <span className="text-3xs text-slate-400 font-mono">{v.uploadedAt}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
