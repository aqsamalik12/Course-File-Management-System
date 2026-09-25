import React, { useState, useEffect } from 'react';
import { useCFMS } from '../../context/CFMSContext';
import { Course } from '../../types';
import { DataTable, Column } from '../common/DataTable';
import { ActionButton } from '../common/ActionButton';
import { BookOpen, Plus, User, Layers, Filter } from 'lucide-react';

interface CourseManagementProps {
  activeModule?: string;
}

export const CourseManagement: React.FC<CourseManagementProps> = ({ activeModule }) => {
  const { courses, createCourse, departments, usersList } = useCFMS();
  const [showModal, setShowModal] = useState(false);

  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [departmentId, setDepartmentId] = useState(departments[0]?.id || '');
  const [credits, setCredits] = useState(3);
  const [type, setType] = useState<'Core' | 'Elective' | 'Lab'>('Core');
  const [teacherId, setTeacherId] = useState(usersList[2]?.id || '');
  const [selectedFilterTab, setSelectedFilterTab] = useState<string>('ALL');

  useEffect(() => {
    if (activeModule === 'Create Course' || activeModule === 'Assign Teacher') {
      setShowModal(true);
    }
  }, [activeModule]);

  const filteredCourses = courses.filter((c) => {
    if (activeModule === 'Active Courses') return c.status === 'Active';
    if (activeModule === 'Archived Courses') return c.status === 'Archived';
    if (activeModule === 'Assigned Teachers') return c.assignedTeacherId && c.assignedTeacherId !== '';
    if (selectedFilterTab !== 'ALL') {
      if (activeModule === 'Semester Wise') return c.semester === selectedFilterTab;
      if (activeModule === 'Department Wise' || activeModule === 'Department Courses') return c.departmentName.includes(selectedFilterTab);
    }
    return true;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !title) return;

    const dept = departments.find((d) => d.id === departmentId);
    const teacher = usersList.find((u) => u.id === teacherId);

    createCourse({
      code,
      title,
      departmentId,
      departmentName: dept?.name || 'Department of Computer Science',
      credits,
      type,
      assignedTeacherId: teacherId,
      assignedTeacherName: teacher?.name || 'Prof. Ahmad Raza',
      assignedTeacherRole: teacher?.role || 'REGULAR_TEACHER',
      semester: '1st Semester',
      academicSession: 'Spring 2026',
      totalStudents: 45,
      status: 'Active'
    });

    setShowModal(false);
    setCode('');
    setTitle('');
  };

  const [selectedViewCourse, setSelectedViewCourse] = useState<Course | null>(null);

  const columns: Column<Course>[] = [
    {
      key: 'code',
      header: 'Course Code',
      sortable: true,
      render: (c) => (
        <span className="font-bold text-indigo-950 font-mono text-xs bg-indigo-50 border border-indigo-200/80 px-2.5 py-1 rounded-md shadow-2xs whitespace-nowrap">
          {c.code}
        </span>
      )
    },
    {
      key: 'title',
      header: 'Course Title',
      sortable: true,
      render: (c) => (
        <span className="font-bold text-slate-900 text-xs">{c.title}</span>
      )
    },
    {
      key: 'departmentName',
      header: 'Department',
      sortable: true,
      render: (c) => (
        <span className="text-xs font-semibold text-slate-800 whitespace-nowrap">
          {c.departmentName.replace('Department of ', '')}
        </span>
      )
    },
    {
      key: 'semester',
      header: 'Semester',
      sortable: true,
      render: (c) => (
        <span className="text-2xs font-bold text-indigo-700 font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200 whitespace-nowrap">
          {c.semester}
        </span>
      )
    },
    {
      key: 'assignedTeacherName',
      header: 'Assigned Faculty',
      sortable: true,
      render: (c) => (
        <span className="font-bold text-slate-900 text-xs whitespace-nowrap">{c.assignedTeacherName}</span>
      )
    },
    {
      key: 'assignedTeacherRole',
      header: 'Faculty Role',
      sortable: true,
      render: (c) => (
        <span
          className={`whitespace-nowrap inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border shadow-2xs ${
            c.assignedTeacherRole === 'VISITING_TEACHER'
              ? 'bg-amber-50 text-amber-800 border-amber-200/80'
              : 'bg-blue-50 text-blue-700 border-blue-200/80'
          }`}
        >
          {c.assignedTeacherRole === 'VISITING_TEACHER' ? 'Visiting Faculty' : 'Regular Faculty'}
        </span>
      )
    },
    {
      key: 'credits',
      header: 'Credit Hours',
      sortable: true,
      render: (c) => (
        <span className="px-2.5 py-0.5 font-bold text-xs rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs whitespace-nowrap">
          {c.credits} Cr
        </span>
      )
    },
    {
      key: 'type',
      header: 'Course Type',
      sortable: true,
      render: (c) => (
        <span className="px-2.5 py-0.5 font-bold text-xs rounded-full bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs whitespace-nowrap">
          {c.type}
        </span>
      )
    },
    {
      key: 'totalStudents',
      header: 'Enrolled',
      sortable: true,
      render: (c) => <span className="font-bold text-slate-900 text-xs whitespace-nowrap">{c.totalStudents} Students</span>
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (c) => (
        <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
          <ActionButton variant="edit" label="Edit" size="xs" onClick={() => setShowModal(true)} />
          <ActionButton variant="view" label="View" size="xs" onClick={() => setSelectedViewCourse(c)} />
        </div>
      )
    }
  ];

  // Title formatting helper
  const getPageTitle = () => {
    if (!activeModule || activeModule === 'Create Course' || activeModule === 'All Courses') {
      return 'Course Directory & Academic Curriculum';
    }
    return `Course Management - ${activeModule}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold font-heading text-slate-900">
            {getPageTitle()}
          </h2>
        </div>
        <ActionButton
          variant="primary"
          label="Add New Course"
          onClick={() => setShowModal(true)}
          size="md"
        />
      </div>

      {activeModule === 'Semester Wise' && (
        <div className="flex items-center gap-2 bg-white p-3 rounded-xl border border-slate-200 text-xs font-bold shadow-2xs">
          <Filter className="w-4 h-4 text-indigo-600" />
          <span className="text-slate-700">Filter Semester:</span>
          {['ALL', '1st Semester', '3rd Semester', '5th Semester', '7th Semester'].map((sem) => (
            <button
              key={sem}
              onClick={() => setSelectedFilterTab(sem)}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                selectedFilterTab === sem ? 'bg-indigo-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {sem}
            </button>
          ))}
        </div>
      )}

      {(activeModule === 'Department Wise' || activeModule === 'Department Courses') && (
        <div className="flex flex-wrap items-center gap-2 bg-white p-3 rounded-xl border border-slate-200 text-xs font-bold shadow-2xs">
          <Filter className="w-4 h-4 text-indigo-600" />
          <span className="text-slate-700">Filter Department:</span>
          {['ALL', 'Computer Science', 'Mathematics', 'English', 'Education'].map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedFilterTab(dept)}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                selectedFilterTab === dept ? 'bg-indigo-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      )}

      <DataTable
        data={filteredCourses}
        columns={columns}
        searchPlaceholder="Search courses by code, title, teacher..."
        filters={[
          {
            key: 'type',
            label: 'Type',
            options: [
              { value: 'Core', label: 'Core' },
              { value: 'Elective', label: 'Elective' },
              { value: 'Lab', label: 'Lab' }
            ]
          }
        ]}
      />

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-2xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold font-heading text-slate-900">Add New Academic Course</h3>
                <p className="text-xs text-slate-500">Configure course details and assign instructor.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg cursor-pointer">×</button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Course Code *</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter course code"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Course Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter course title"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Department</label>
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 cursor-pointer"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Assign Teacher / Instructor</label>
                <select
                  value={teacherId}
                  onChange={(e) => setTeacherId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 cursor-pointer"
                >
                  {usersList.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Credit Hours</label>
                  <input
                    type="number"
                    value={credits}
                    onChange={(e) => setCredits(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 cursor-pointer"
                  >
                    <option value="Core">Core</option>
                    <option value="Elective">Elective</option>
                    <option value="Lab">Lab</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-[#1E7B4E] hover:bg-[#165534] rounded-xl shadow-2xs flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Plus className="w-4 h-4" /> Save Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Course Details Executive Modal */}
      {selectedViewCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-2xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-bold text-indigo-950 font-mono text-xs bg-indigo-100 border border-indigo-200 px-3 py-1 rounded-lg">
                  {selectedViewCourse.code}
                </span>
                <div>
                  <h3 className="text-base font-bold font-heading text-slate-900">{selectedViewCourse.title}</h3>
                  <p className="text-3xs text-slate-500 font-mono">{selectedViewCourse.academicSession || 'Spring 2026'}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedViewCourse(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xl cursor-pointer"
              >
                ×
              </button>
            </div>

            {/* Modal Content Grid */}
            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                <div>
                  <p className="text-3xs font-bold text-slate-400 uppercase tracking-wider">Department</p>
                  <p className="font-bold text-slate-900 mt-0.5">{selectedViewCourse.departmentName}</p>
                </div>
                <div>
                  <p className="text-3xs font-bold text-slate-400 uppercase tracking-wider">Semester Term</p>
                  <p className="font-bold text-indigo-700 mt-0.5">{selectedViewCourse.semester}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                <div>
                  <p className="text-3xs font-bold text-slate-400 uppercase tracking-wider">Assigned Faculty</p>
                  <p className="font-bold text-slate-900 mt-0.5">{selectedViewCourse.assignedTeacherName}</p>
                  <span
                    className={`inline-block mt-1 px-2 py-0.5 rounded-full text-3xs font-bold border ${
                      selectedViewCourse.assignedTeacherRole === 'VISITING_TEACHER'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}
                  >
                    {selectedViewCourse.assignedTeacherRole === 'VISITING_TEACHER' ? 'Visiting Faculty' : 'Regular Faculty'}
                  </span>
                </div>
                <div>
                  <p className="text-3xs font-bold text-slate-400 uppercase tracking-wider">Total Enrolled</p>
                  <p className="font-extrabold text-slate-900 mt-0.5 text-sm">{selectedViewCourse.totalStudents} Students</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-center">
                <div>
                  <p className="text-3xs font-bold text-slate-400 uppercase">Credit Hours</p>
                  <p className="font-bold text-emerald-800 mt-0.5">{selectedViewCourse.credits} Credit Hours</p>
                </div>
                <div>
                  <p className="text-3xs font-bold text-slate-400 uppercase">Course Type</p>
                  <p className="font-bold text-slate-800 mt-0.5">{selectedViewCourse.type}</p>
                </div>
                <div>
                  <p className="text-3xs font-bold text-slate-400 uppercase">Course Status</p>
                  <p className="font-bold text-emerald-600 mt-0.5">{selectedViewCourse.status}</p>
                </div>
              </div>

              {/* Close Action */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedViewCourse(null)}
                  className="px-5 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-xl cursor-pointer transition-all shadow-2xs"
                >
                  Close Overview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
