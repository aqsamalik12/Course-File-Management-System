import React, { useState, useEffect } from 'react';
import { useCFMS } from '../../context/CFMSContext';
import { FolderTree, CheckCircle2, ShieldAlert, Plus, X } from 'lucide-react';

interface FileCategoriesProps {
  activeModule?: string;
}

export const FileCategories: React.FC<FileCategoriesProps> = ({ activeModule }) => {
  const { categories } = useCFMS();
  const [showModal, setShowModal] = useState(false);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [isRequired, setIsRequired] = useState(true);

  useEffect(() => {
    if (activeModule === 'Create Category') {
      setShowModal(true);
    }
  }, [activeModule]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName) return;
    setShowModal(false);
    setCatName('');
    setCatDesc('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold font-heading text-slate-900">File Categories</h2>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Category</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-100">
                  <FolderTree className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{cat.name}</h3>
                  <span
                    className={`text-3xs font-bold px-2 py-0.5 rounded-md ${
                      cat.isRequired ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {cat.isRequired ? 'Mandatory for Signoff' : 'Optional'}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">{cat.description}</p>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-3xs font-semibold text-slate-500">
              <span>Max Uploads: {cat.maxUploads} files</span>
              <span>Formats: {cat.allowedFormats.join(', ')}</span>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-2xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-slate-900">Create Document Category</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="e.g. Midterm Question Papers & Solutions"
                  className="w-full p-2 bg-slate-50 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  placeholder="Brief description of requirements..."
                  className="w-full p-2 bg-slate-50 border rounded-lg"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="reqCat"
                  checked={isRequired}
                  onChange={(e) => setIsRequired(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <label htmlFor="reqCat" className="font-bold text-slate-700">
                  Mandatory Category (Required for Course File Approval)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 bg-slate-100 rounded-lg text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
