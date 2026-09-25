import React, { useState } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Download,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  CheckSquare,
  Square,
  FileSpreadsheet,
  FileText
} from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchKey?: string;
  searchPlaceholder?: string;
  filters?: {
    key: string;
    label: string;
    options: { value: string; label: string }[];
  }[];
  onRowClick?: (item: T) => void;
  actions?: (item: T) => React.ReactNode;
  exportTitle?: string;
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  searchPlaceholder = 'Search records...',
  filters = [],
  onRowClick,
  actions,
  exportTitle = 'Export_Data'
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({});
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);

  // Filter & Search Logic
  const filteredData = data.filter((item) => {
    // Search query check across all string fields
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = Object.values(item as any).some(
        (val) => val && String(val).toLowerCase().includes(q)
      );
      if (!match) return false;
    }

    // Filter selects
    for (const [key, val] of Object.entries(selectedFilters)) {
      if (val && val !== 'ALL') {
        const itemVal = (item as any)[key];
        if (String(itemVal) !== String(val)) return false;
      }
    }

    return true;
  });

  // Sort Logic
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortColumn) return 0;
    const valA = (a as any)[sortColumn] ?? '';
    const valB = (b as any)[sortColumn] ?? '';

    if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
    if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination Logic
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = sortedData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleSort = (key: string) => {
    if (sortColumn === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(key);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = () => {
    if (selectedRowIds.length === paginatedData.length) {
      setSelectedRowIds([]);
    } else {
      setSelectedRowIds(paginatedData.map((d) => d.id));
    }
  };

  const handleToggleRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedRowIds.includes(id)) {
      setSelectedRowIds(selectedRowIds.filter((r) => r !== id));
    } else {
      setSelectedRowIds([...selectedRowIds, id]);
    }
  };

  const handleExportCSV = () => {
    const csvRows: string[] = [];
    const headers = columns.map((c) => `"${c.header}"`).join(',');
    csvRows.push(headers);

    sortedData.forEach((item) => {
      const row = columns
        .map((c) => {
          const val = (item as any)[c.key] ?? '';
          return `"${String(val).replace(/"/g, '""')}"`;
        })
        .join(',');
      csvRows.push(row);
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${exportTitle}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="bg-white rounded-xl shadow-2xs border border-slate-200 overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-50/70 backdrop-blur-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-900 placeholder-slate-400 font-medium transition-all shadow-2xs"
          />
        </div>

        {/* Filters & Export */}
        <div className="flex flex-wrap items-center gap-2">
          {filters.map((f) => (
            <select
              key={f.key}
              value={selectedFilters[f.key] || 'ALL'}
              onChange={(e) => {
                setSelectedFilters({ ...selectedFilters, [f.key]: e.target.value });
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 text-slate-700 font-semibold cursor-pointer shadow-2xs transition-all"
            >
              <option value="ALL">All {f.label}</option>
              {f.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ))}

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg transition-all shadow-2xs cursor-pointer active:scale-95"
            title="Export to CSV"
          >
            <Download className="w-3.5 h-3.5 text-emerald-700" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Selected Row Actions Banner */}
      {selectedRowIds.length > 0 && (
        <div className="bg-emerald-50/80 px-4 py-2 border-b border-emerald-200 flex items-center justify-between text-xs text-emerald-900 font-semibold">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            {selectedRowIds.length} row(s) selected
          </span>
          <button
            onClick={() => setSelectedRowIds([])}
            className="text-xs text-emerald-700 font-bold hover:underline cursor-pointer"
          >
            Deselect All
          </button>
        </div>
      )}

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100/90 border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase tracking-wider select-none">
              <th className="py-3.5 px-4 w-10 text-center">
                <button onClick={handleSelectAll} className="cursor-pointer text-slate-500 hover:text-emerald-700 transition-colors">
                  {selectedRowIds.length === paginatedData.length && paginatedData.length > 0 ? (
                    <CheckSquare className="w-4 h-4 text-emerald-700" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400" />
                  )}
                </button>
              </th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                  className={`py-3.5 px-4 font-bold text-slate-700 ${
                    col.sortable !== false ? 'cursor-pointer hover:text-emerald-800 transition-colors' : ''
                  }`}
                >
                  <div className="flex items-center gap-1.5 whitespace-nowrap">
                    <span>{col.header}</span>
                    {col.sortable !== false && (
                      <ArrowUpDown className={`w-3 h-3 ${sortColumn === col.key ? 'text-emerald-700 font-bold' : 'text-slate-400'}`} />
                    )}
                  </div>
                </th>
              ))}
              {actions && <th className="py-3.5 px-4 text-center font-bold text-slate-700 whitespace-nowrap">Actions</th>}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-xs text-slate-800">
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 2 : 1)}
                  className="py-12 text-center text-slate-500"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Search className="w-8 h-8 text-slate-300" />
                    <p className="font-semibold text-slate-700">No records found matching criteria</p>
                    <p className="text-2xs text-slate-400">Try adjusting your filters or search terms.</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((item) => {
                const isSelected = selectedRowIds.includes(item.id);
                return (
                  <tr
                    key={item.id}
                    onClick={() => onRowClick && onRowClick(item)}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      onRowClick ? 'cursor-pointer' : ''
                    } ${isSelected ? 'bg-emerald-50/50' : ''}`}
                  >
                    <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => handleToggleRow(item.id, e)}
                        className="cursor-pointer text-slate-400 hover:text-emerald-700 transition-colors"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-emerald-700" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400" />
                        )}
                      </button>
                    </td>

                    {columns.map((col) => (
                      <td key={col.key} className="py-3 px-4 align-middle">
                        {col.render ? col.render(item) : (item as any)[col.key]}
                      </td>
                    ))}

                    {actions && (
                      <td className="py-3 px-4 text-center align-middle" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
                          {actions(item)}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/70 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg font-semibold text-slate-800 shadow-2xs cursor-pointer"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span className="text-slate-500 ml-2 text-2xs">
            Showing {paginatedData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
            {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} records
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            className="p-1.5 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-2xs active:scale-95 transition-all"
          >
            <ChevronLeft className="w-4 h-4 text-slate-700" />
          </button>
          <span className="px-3 text-xs font-bold text-slate-800">
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
            className="p-1.5 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-2xs active:scale-95 transition-all"
          >
            <ChevronRight className="w-4 h-4 text-slate-700" />
          </button>
        </div>
      </div>
    </div>
  );
}
