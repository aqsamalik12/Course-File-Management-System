import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Clock, ShieldAlert, Calendar } from 'lucide-react';

export const VisitingContractBanner: React.FC = () => {
  const { currentUser } = useAuth();

  if (currentUser.role !== 'VISITING_TEACHER') return null;

  return (
    <div className="bg-[#E6F4EC] text-[#0F2D1F] p-4 rounded-2xl shadow-xs border border-[#E2EFE6] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-medium">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[#165534] text-white rounded-xl shrink-0">
          <Clock className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="font-bold text-[#0F2D1F] block">Visiting Faculty Contract Status: Active Term</span>
          <span className="text-3xs text-[#567567] font-semibold">
            Contract Period: {currentUser.contractStartDate || '2026-02-01'} to {currentUser.contractEndDate || '2026-08-31'} • Semester: Spring 2026
          </span>
        </div>
      </div>

      <div className="bg-[#165534] text-white px-3 py-1.5 rounded-xl font-mono font-bold text-3xs border border-[#12482c] shrink-0">
        Contract Status: Active
      </div>
    </div>
  );
};
