import React from 'react';
import { useCFMS } from '../../context/CFMSContext';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, Users, CheckCircle2 } from 'lucide-react';

interface TeacherCoursesProps {
  onNavigate?: (moduleName: string) => void;
}

export const TeacherCourses: React.FC<TeacherCoursesProps> = ({ onNavigate }) => {
  const { courses } = useCFMS();
  const { currentUser } = useAuth();

  const myCourses = courses.filter(
    (c) => c.assignedTeacherId === currentUser?.id || c.assignedTeacherName === currentUser?.name
  );

  const displayList = myCourses.length > 0 ? myCourses : courses.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-3xs font-mono font-extrabold text-[#1E7B4E] uppercase tracking-wider bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Active Curriculum Scope
            </span>
            <span className="text-3xs text-slate-400 font-mono">Term: Spring 2026</span>
          </div>
          <h2 className="text-xl font-extrabold font-heading text-slate-900 mt-1">
            My Assigned Courses ({displayList.length})
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayList.map((c) => (
          <div key={c.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4 hover:border-emerald-300 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold font-mono text-[#1E7B4E] bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    {c.code}
                  </span>
                  <h3 className="text-sm font-extrabold text-slate-900 mt-2">{c.title}</h3>
                </div>
                <span className="px-2.5 py-1 text-3xs font-extrabold bg-slate-100 text-slate-800 rounded-full border border-slate-200">
                  {c.credits} Credit Hours
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-3xs text-slate-600 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400 block font-medium">Department:</span>
                  <span className="font-bold text-slate-800">{c.departmentName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Enrolled Students:</span>
                  <span className="font-bold text-slate-800">{c.totalStudents || 45} Students</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Semester:</span>
                  <span className="font-bold text-slate-800">{c.semester || 'Semester 6'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Type:</span>
                  <span className="font-bold text-slate-800">{c.type || 'Core Theory'}</span>
                </div>
              </div>
            </div>

            {onNavigate && (
              <div className="pt-2 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => onNavigate('Course File Submission')}
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#1E7B4E] hover:bg-[#165534] rounded-xl shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Submit Course File</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
