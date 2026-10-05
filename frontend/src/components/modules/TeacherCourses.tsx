import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCFMS } from '../../context/CFMSContext';
import {
  BookOpen, Plus, Trash2, Calendar, Building2, Layers,
  CheckCircle2, AlertCircle, X, ArrowRight, ShieldCheck,
  Search, RefreshCw
} from 'lucide-react';

interface TeacherCoursesProps {
  onNavigate?: (moduleName: string) => void;
}

export const SEMESTERS = [
  '1st Semester',
  '2nd Semester',
  '3rd Semester',
  '4th Semester',
  '5th Semester',
  '6th Semester',
  '7th Semester',
  '8th Semester'
];

export const COMMON_BATCHES = [
  'BSCS 2023–26',
  'BSCS 2024–27',
  'BSCS 2022–25',
  'BSCS 2021–24',
  'BSCS 2025–28'
];

interface CourseAssignment {
  id: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  creditHours: number;
  credits?: number;
  batch: string;
  semester: string;
  session: string;
  academicYear: string;
  departmentName?: string;
  campusName?: string;
  hodName?: string;
}

export const TeacherCourses: React.FC<TeacherCoursesProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const { setActiveTeacherSetup } = useCFMS();

  const [courses, setCourses] = useState<CourseAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Form State for Add Course
  const [courseName, setCourseName] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [creditHours, setCreditHours] = useState('3');
  const [batch, setBatch] = useState('');
  const [semester, setSemester] = useState('');
  const [session, setSession] = useState<'Spring' | 'Fall'>('Spring');
  const [academicYear, setAcademicYear] = useState('2024–25');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [savingCourse, setSavingCourse] = useState(false);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'x-user-id': currentUser?.id || '',
    'x-user-role': currentUser?.role || 'REGULAR_TEACHER',
    'x-department-id': currentUser?.departmentId || ''
  });

  const fetchMyCourses = async () => {
    if (!currentUser?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/courses/my-courses?teacherId=${currentUser.id}`, {
        headers: getHeaders()
      });
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.data)) {
        setCourses(data.data);
      }
    } catch {
      // transient network error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyCourses();
  }, [currentUser]);

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!courseName.trim()) errs.courseName = 'Course Name is required.';
    if (!courseCode.trim()) errs.courseCode = 'Course Code is required.';
    if (!batch.trim()) errs.batch = 'Batch is mandatory. Please select or enter a batch.';
    if (!semester.trim()) errs.semester = 'Semester is mandatory. Please select a semester.';
    if (!session.trim()) errs.session = 'Session (Spring/Fall) is mandatory.';
    if (!academicYear.trim()) errs.academicYear = 'Academic Year is mandatory.';
    const cr = Number(creditHours);
    if (isNaN(cr) || cr <= 0) errs.creditHours = 'Credit Hours must be a positive number.';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSavingCourse(true);
    try {
      const payload = {
        teacherId: currentUser?.id,
        courseName: courseName.trim(),
        courseCode: courseCode.trim().toUpperCase(),
        creditHours: Number(creditHours),
        batch: batch.trim(),
        semester: semester.trim(),
        session: session.trim(),
        academicYear: academicYear.trim()
      };

      const res = await fetch('/api/courses/my-courses', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok && data.success) {
        showToast(data.message || 'Course added successfully!', 'success');
        setShowAddModal(false);
        setCourseName('');
        setCourseCode('');
        setCreditHours('3');
        setBatch('');
        setSemester('');
        await fetchMyCourses();
      } else {
        setFormErrors({ submit: data.message || 'Failed to assign course.' });
      }
    } catch (err: any) {
      setFormErrors({ submit: err.message || 'Network error occurred.' });
    } finally {
      setSavingCourse(false);
    }
  };

  const handleDeleteCourse = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove "${name}" from your course assignments?`)) return;

    try {
      const res = await fetch(`/api/courses/my-courses/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Course assignment removed.', 'success');
        setCourses((prev) => prev.filter((c) => c.id !== id));
      } else {
        showToast(data.message || 'Failed to remove course.', 'error');
      }
    } catch {
      showToast('Network error while deleting course.', 'error');
    }
  };

  const handleStartCourseFile = (course: CourseAssignment) => {
    if (setActiveTeacherSetup) {
      setActiveTeacherSetup({
        courseId: course.courseId || course.id,
        courseCode: course.courseCode,
        courseName: course.courseName,
        credits: course.creditHours,
        batch: course.batch,
        semester: course.semester,
        session: course.session,
        academicYear: course.academicYear,
        departmentName: course.departmentName || currentUser?.departmentName,
        campusName: course.campusName || currentUser?.campus,
        hodName: course.hodName || currentUser?.hodName
      });
    }

    if (onNavigate) {
      onNavigate('Course File Submission');
    }
  };

  const sessionDisplay = `${(currentUser as any)?.sessionType || 'Spring'} ${(currentUser as any)?.academicYear || '2024–25'}`;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl border text-xs font-bold flex items-center gap-2 animate-slide-up ${
          toastMessage.type === 'success'
            ? 'bg-emerald-900 text-emerald-100 border-emerald-700'
            : 'bg-rose-900 text-rose-100 border-rose-700'
        }`}>
          {toastMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Banner: Approved Teacher & Department Context */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-3xs font-extrabold uppercase tracking-wider text-[#1E7B4E] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Step 3 — Course Assignment
              </span>
              <span className="text-3xs font-mono text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                Active Term: {sessionDisplay}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
              My Courses / Course Assignment
            </h1>
            <p className="text-xs text-slate-500">
              Each course stores its own distinct Batch and Semester. You can teach different courses across multiple semesters.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-5 py-3 bg-[#1E7B4E] hover:bg-[#165534] text-white font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-md shadow-emerald-950/20"
            >
              <Plus className="w-4 h-4" />
              <span>ADD COURSE</span>
            </button>
            <button
              onClick={fetchMyCourses}
              title="Refresh course list"
              className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer border border-slate-200"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Assigned Scope Context Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100 text-2xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block font-medium">Campus</span>
            <span className="font-bold text-slate-900">{currentUser?.campus || 'Attock Campus'}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block font-medium">Department</span>
            <span className="font-bold text-slate-900">{currentUser?.departmentName || 'Computer Science'}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block font-medium">Assigned HOD</span>
            <span className="font-bold text-emerald-800">{currentUser?.hodName || 'Department HOD'}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block font-medium">Faculty Role</span>
            <span className="font-bold text-slate-900">
              {currentUser?.role === 'VISITING_TEACHER' ? 'Visiting Faculty' : 'Regular Faculty'}
            </span>
          </div>
        </div>
      </div>

      {/* Courses List */}
      {loading ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-xs text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
          Loading course assignments...
        </div>
      ) : courses.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-700">
            <BookOpen className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-slate-900 font-heading">
              No Courses Assigned Yet
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              You haven't added any course assignments yet. Click the <strong>ADD COURSE</strong> button above to assign your courses with their specific Batch and Semester.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 bg-[#1E7B4E] hover:bg-[#165534] text-white font-bold text-xs rounded-xl transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Your First Course</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                {/* Course Header */}
                <div className="flex items-start justify-between gap-2">
                  <span className="px-3 py-1 text-xs font-mono font-black text-[#1E7B4E] bg-emerald-50 rounded-xl border border-emerald-200">
                    {course.courseCode}
                  </span>
                  <span className="px-2.5 py-1 text-3xs font-extrabold bg-slate-100 text-slate-700 rounded-full border border-slate-200">
                    {course.creditHours || course.credits || 3} Credit Hours
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 leading-snug group-hover:text-emerald-800 transition-colors">
                    {course.courseName}
                  </h3>
                </div>

                {/* Per-Course Hierarchy Details: Batch & Semester */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-2xs">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/70">
                    <span className="text-slate-400 font-medium">Batch:</span>
                    <span className="font-extrabold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {course.batch}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/70">
                    <span className="text-slate-400 font-medium">Semester:</span>
                    <span className="font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {course.semester}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Session Term:</span>
                    <span className="font-bold text-slate-700">
                      {course.session || 'Spring'} {course.academicYear || '2024–25'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleDeleteCourse(course.id, course.courseName)}
                  title="Remove this course assignment"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleStartCourseFile(course)}
                  className="flex-1 py-2.5 px-4 bg-[#1E7B4E] hover:bg-[#165534] text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Start Course File</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── ADD COURSE MODAL ─────────────────────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 font-heading">
                    Add Course Assignment
                  </h2>
                  <p className="text-2xs text-slate-500">
                    Assign course with its specific Batch and Semester
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formErrors.submit && (
              <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-2xl text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{formErrors.submit}</span>
              </div>
            )}

            <form onSubmit={handleAddCourse} className="space-y-4">
              {/* Course Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  Course Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={courseName}
                  onChange={(e) => {
                    setCourseName(e.target.value);
                    if (formErrors.courseName) setFormErrors(prev => ({ ...prev, courseName: '' }));
                  }}
                  placeholder="e.g. Database Systems"
                  className="w-full px-4 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 bg-white"
                />
                {formErrors.courseName && <p className="text-2xs text-rose-500 font-semibold">{formErrors.courseName}</p>}
              </div>

              {/* Course Code & Credit Hours */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    Course Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={courseCode}
                    onChange={(e) => {
                      setCourseCode(e.target.value.toUpperCase());
                      if (formErrors.courseCode) setFormErrors(prev => ({ ...prev, courseCode: '' }));
                    }}
                    placeholder="e.g. CS-301"
                    className="w-full px-4 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 bg-white font-mono uppercase"
                  />
                  {formErrors.courseCode && <p className="text-2xs text-rose-500 font-semibold">{formErrors.courseCode}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    Credit Hours <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={creditHours}
                    onChange={(e) => setCreditHours(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 bg-white"
                  >
                    <option value="1">1 Credit Hour</option>
                    <option value="2">2 Credit Hours</option>
                    <option value="3">3 Credit Hours</option>
                    <option value="4">4 Credit Hours</option>
                  </select>
                </div>
              </div>

              {/* Batch (Mandatory) */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  Batch <span className="text-rose-500">*</span>
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={batch}
                    onChange={(e) => {
                      setBatch(e.target.value);
                      if (formErrors.batch) setFormErrors(prev => ({ ...prev, batch: '' }));
                    }}
                    placeholder="e.g. BSCS 2023–26"
                    className="w-full px-4 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 bg-white font-medium"
                  />
                  <div className="flex flex-wrap gap-1.5">
                    {COMMON_BATCHES.map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setBatch(b)}
                        className={`text-3xs px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                          batch === b
                            ? 'bg-emerald-50 border-emerald-400 text-emerald-800 font-bold'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
                {formErrors.batch && <p className="text-2xs text-rose-500 font-semibold">{formErrors.batch}</p>}
              </div>

              {/* Semester (Mandatory) */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  Semester <span className="text-rose-500">*</span>
                </label>
                <select
                  value={semester}
                  onChange={(e) => {
                    setSemester(e.target.value);
                    if (formErrors.semester) setFormErrors(prev => ({ ...prev, semester: '' }));
                  }}
                  className="w-full px-4 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 bg-white cursor-pointer"
                >
                  <option value="" disabled>-- Select Semester --</option>
                  {SEMESTERS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                {formErrors.semester && <p className="text-2xs text-rose-500 font-semibold">{formErrors.semester}</p>}
              </div>

              {/* Session Term & Academic Year (Mandatory per Course) */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    Session (Term) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={session}
                    onChange={(e) => {
                      setSession(e.target.value as 'Spring' | 'Fall');
                      if (formErrors.session) setFormErrors(prev => ({ ...prev, session: '' }));
                    }}
                    className="w-full px-4 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 bg-white cursor-pointer font-medium"
                  >
                    <option value="Spring">Spring</option>
                    <option value="Fall">Fall</option>
                  </select>
                  {formErrors.session && <p className="text-2xs text-rose-500 font-semibold">{formErrors.session}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    Academic Year <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={academicYear}
                    onChange={(e) => {
                      setAcademicYear(e.target.value);
                      if (formErrors.academicYear) setFormErrors(prev => ({ ...prev, academicYear: '' }));
                    }}
                    className="w-full px-4 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 bg-white cursor-pointer font-medium"
                  >
                    <option value="2024–25">2024–25</option>
                    <option value="2025–26">2025–26</option>
                    <option value="2026–27">2026–27</option>
                    <option value="2023–24">2023–24</option>
                  </select>
                  {formErrors.academicYear && <p className="text-2xs text-rose-500 font-semibold">{formErrors.academicYear}</p>}
                </div>
              </div>

              {/* Department Scoping Summary */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-2xs space-y-1 text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Campus:</span>
                  <span className="font-bold text-slate-800">{currentUser?.campus || currentUser?.campusName || 'Attock Campus'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Department:</span>
                  <span className="font-bold text-slate-800">{currentUser?.departmentName || 'Computer Science'}</span>
                </div>
              </div>

              {/* Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingCourse}
                  className="px-6 py-2.5 bg-[#1E7B4E] hover:bg-[#165534] text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md shadow-emerald-950/20 disabled:opacity-50"
                >
                  {savingCourse ? 'Saving...' : 'Save Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
