import React, { useState, useRef } from 'react';
import { useCFMS } from '../../context/CFMSContext';
import { useAuth } from '../../context/AuthContext';
import { FileCategoryType, FileStatus } from '../../types';
import { Upload, X, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedCourseId?: string;
}

export const FileUploadModal: React.FC<FileUploadModalProps> = ({
  isOpen,
  onClose,
  preselectedCourseId
}) => {
  const { courses, categories, uploadCourseFile } = useCFMS();
  const { currentUser } = useAuth();

  const [selectedCourseId, setSelectedCourseId] = useState(preselectedCourseId || courses[0]?.id || '');
  const [selectedBatch, setSelectedBatch] = useState('2023-2027');
  const [selectedCategory, setSelectedCategory] = useState<FileCategoryType>('Syllabus & Course Outline');
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const f = e.dataTransfer.files[0];
      setFile(f);
      if (!title) setTitle(f.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setFile(f);
      if (!title) setTitle(f.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleSubmit = (status: FileStatus) => {
    if (!selectedCourseId || !title || !file) return;

    const course = courses.find((c) => c.id === selectedCourseId);
    if (!course) return;

    setIsUploading(true);
    setUploadProgress(20);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            const ext = file.name.split('.').pop()?.toUpperCase() as any || 'PDF';
            const sizeMB = (file.size / (1024 * 1024)).toFixed(1) + ' MB';

            uploadCourseFile({
              courseId: course.id,
              courseCode: course.code,
              courseTitle: course.title,
              departmentId: course.departmentId,
              departmentName: course.departmentName,
              teacherId: currentUser.id,
              teacherName: currentUser.name,
              teacherRole: currentUser.role,
              title,
              category: selectedCategory,
              currentVersion: 'v1.0',
              fileType: ['PDF', 'DOCX', 'PPT', 'ZIP', 'XLSX'].includes(ext) ? ext : 'PDF',
              fileSize: sizeMB,
              fileUrl: '#',
              batch: selectedBatch,
              status
            });

            setIsUploading(false);
            setUploadProgress(0);
            onClose();
          }, 300);
          return 100;
        }
        return prev + 25;
      });
    }, 150);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-2xs animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold font-heading text-slate-900">Upload Course File</h3>
            <p className="text-xs text-slate-500 font-medium">Attach course material for HOD batch folder directory</p>
          </div>
          <button
            onClick={onClose}
            disabled={isUploading}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {/* Course Dropdown */}
          <div>
            <label className="block text-xs font-bold text-[#0F2D1F] mb-1">
              Select Course <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-[#E2EFE6] rounded-lg focus:ring-2 focus:ring-[#1E7B4E]/30 font-medium text-[#0F2D1F]"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} - {c.title} ({c.academicSession})
                </option>
              ))}
            </select>
          </div>

          {/* Student Batch Dropdown (Admin Managed Folders) */}
          <div>
            <label className="block text-xs font-bold text-[#0F2D1F] mb-1">
              Target Student Batch Folder <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-[#E2EFE6] rounded-lg focus:ring-2 focus:ring-[#1E7B4E]/30 font-bold text-[#1E7B4E]"
            >
              <option value="2023-2027">Batch 2023–2027 (5th Semester)</option>
              <option value="2022-2026">Batch 2022–2026 (7th Semester)</option>
              <option value="2024-2028">Batch 2024–2028 (3rd Semester)</option>
              <option value="2021-2025">Batch 2021–2025 (8th Semester / Graduating)</option>
            </select>
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-xs font-bold text-[#0F2D1F] mb-1">
              File Category <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as FileCategoryType)}
              className="w-full px-3 py-2 text-xs bg-white border border-[#E2EFE6] rounded-lg focus:ring-2 focus:ring-[#1E7B4E]/30 font-medium text-[#0F2D1F]"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name} {cat.isRequired ? '(Required)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Title Input */}
          <div>
            <label className="block text-xs font-bold text-[#0F2D1F] mb-1">
              Document Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. CS201 Midterm Question Paper & Rubric"
              className="w-full px-3 py-2 text-xs bg-white border border-[#E2EFE6] rounded-lg focus:ring-2 focus:ring-[#1E7B4E]/30 text-[#0F2D1F]"
            />
          </div>

          {/* Drag & Drop Upload Box */}
          <div>
            <label className="block text-xs font-bold text-[#0F2D1F] mb-1">
              File Attachment (PDF, DOCX, PPT, ZIP, XLSX) <span className="text-red-500">*</span>
            </label>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-[#1E7B4E] bg-[#E6F4EC]'
                  : file
                  ? 'border-[#3BA96F] bg-[#E6F4EC]/40'
                  : 'border-[#E2EFE6] hover:border-[#1E7B4E] bg-[#F6FAF7]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.docx,.doc,.ppt,.pptx,.zip,.xlsx"
                onChange={handleFileChange}
              />

              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <FileText className="w-8 h-8 text-[#15803D]" />
                  <div className="text-left">
                    <p className="text-xs font-bold text-[#0F2D1F]">{file.name}</p>
                    <p className="text-3xs text-[#567567]">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB • Click or drag to replace
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-1.5">
                  <Upload className="w-8 h-8 text-[#1E7B4E]" />
                  <p className="text-xs font-semibold text-[#0F2D1F]">
                    Drag & drop file here, or <span className="text-[#1E7B4E] underline">browse</span>
                  </p>
                  <p className="text-3xs text-[#567567]">
                    Supported: PDF, DOCX, PPT, ZIP (Max size: 50MB)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          {isUploading && (
            <div className="space-y-1">
              <div className="flex justify-between text-2xs font-bold text-[#15803D]">
                <span>Uploading file...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-[#E2EFE6] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#165534] h-full transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#E2EFE6] bg-[#F6FAF7] flex items-center justify-between">
          <button
            onClick={onClose}
            disabled={isUploading}
            className="px-4 py-2 text-xs font-semibold text-[#567567] hover:bg-[#E6F4EC] rounded-lg cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSubmit('Draft')}
              disabled={isUploading || !file || !title}
              className="px-3 py-2 text-xs font-semibold text-[#0F2D1F] bg-white hover:bg-[#E6F4EC] border border-[#E2EFE6] rounded-lg disabled:opacity-40 cursor-pointer"
            >
              Save as Draft
            </button>
            <button
              onClick={() => handleSubmit('Submitted')}
              disabled={isUploading || !file || !title}
              className="px-4 py-2 text-xs font-bold text-white bg-[#165534] hover:bg-[#1E7B4E] rounded-lg shadow-sm disabled:opacity-40 flex items-center gap-1.5 cursor-pointer"
            >
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              <span>Submit to HOD</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
