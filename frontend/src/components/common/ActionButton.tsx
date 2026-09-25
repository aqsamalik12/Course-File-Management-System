import React from 'react';
import {
  Pencil,
  Trash2,
  Eye,
  Lock,
  Unlock,
  KeyRound,
  CheckCircle2,
  XCircle,
  Download,
  Upload,
  Archive,
  RotateCcw,
  Loader2,
  Share2,
  Filter,
  RefreshCw,
  Plus,
  History
} from 'lucide-react';

export type ActionVariant =
  | 'edit'
  | 'delete'
  | 'view'
  | 'preview'
  | 'history'
  | 'lock'
  | 'unlock'
  | 'reset-password'
  | 'approve'
  | 'reject'
  | 'download'
  | 'upload'
  | 'archive'
  | 'restore'
  | 'primary'
  | 'secondary'
  | 'share'
  | 'filter'
  | 'refresh'
  | 'create';

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant: ActionVariant;
  label?: string;
  showIconOnlyOnMobile?: boolean;
  iconOnly?: boolean;
  isLoading?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  tooltip?: string;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  variant,
  label,
  showIconOnlyOnMobile = false,
  iconOnly = false,
  isLoading = false,
  size = 'sm',
  className = '',
  disabled,
  children,
  tooltip,
  ...props
}) => {
  // Render default Lucide Icon according to variant
  const renderIcon = () => {
    if (isLoading) return <Loader2 className="w-3.5 h-3.5 animate-spin" />;

    switch (variant) {
      case 'edit':
        return <Pencil className="w-3.5 h-3.5" />;
      case 'delete':
        return <Trash2 className="w-3.5 h-3.5" />;
      case 'view':
      case 'preview':
        return <Eye className="w-3.5 h-3.5" />;
      case 'history':
        return <History className="w-3.5 h-3.5" />;
      case 'lock':
        return <Lock className="w-3.5 h-3.5" />;
      case 'unlock':
        return <Unlock className="w-3.5 h-3.5" />;
      case 'reset-password':
        return <KeyRound className="w-3.5 h-3.5" />;
      case 'approve':
        return <CheckCircle2 className="w-3.5 h-3.5" />;
      case 'reject':
        return <XCircle className="w-3.5 h-3.5" />;
      case 'download':
        return <Download className="w-3.5 h-3.5" />;
      case 'upload':
        return <Upload className="w-3.5 h-3.5" />;
      case 'archive':
        return <Archive className="w-3.5 h-3.5" />;
      case 'restore':
        return <RotateCcw className="w-3.5 h-3.5" />;
      case 'share':
        return <Share2 className="w-3.5 h-3.5" />;
      case 'filter':
        return <Filter className="w-3.5 h-3.5" />;
      case 'refresh':
        return <RefreshCw className="w-3.5 h-3.5" />;
      case 'create':
        return <Plus className="w-3.5 h-3.5" />;
      default:
        return null;
    }
  };

  // Base Styling rules - Permanent solid colors with high contrast, crisp icons & smooth active states
  const getVariantStyles = (): string => {
    switch (variant) {
      case 'approve':
      case 'create':
      case 'primary':
        return 'bg-[#1E7B4E] hover:bg-[#165534] text-white shadow-2xs hover:shadow-xs border border-[#165534] focus:ring-2 focus:ring-[#1E7B4E]/30';
      case 'delete':
        return 'bg-rose-600 hover:bg-rose-700 text-white shadow-2xs hover:shadow-xs border border-rose-700 focus:ring-2 focus:ring-rose-500/30';
      case 'reject':
        return 'bg-amber-600 hover:bg-amber-700 text-white shadow-2xs hover:shadow-xs border border-amber-700 focus:ring-2 focus:ring-amber-500/30';
      case 'lock':
      case 'archive':
        return 'bg-rose-600 hover:bg-rose-700 text-white shadow-2xs hover:shadow-xs border border-rose-700 focus:ring-2 focus:ring-rose-500/30';
      case 'unlock':
      case 'restore':
        return 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs hover:shadow-xs border border-emerald-700 focus:ring-2 focus:ring-emerald-500/30';
      case 'reset-password':
        return 'bg-sky-600 hover:bg-sky-700 text-white shadow-2xs hover:shadow-xs border border-sky-700 focus:ring-2 focus:ring-sky-500/30';
      case 'view':
      case 'preview':
        return 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs hover:shadow-xs border border-indigo-700 focus:ring-2 focus:ring-indigo-500/30';
      case 'edit':
        return 'bg-amber-500 hover:bg-amber-600 text-white shadow-2xs hover:shadow-xs border border-amber-600 focus:ring-2 focus:ring-amber-500/30';
      case 'history':
      case 'secondary':
        return 'bg-slate-700 hover:bg-slate-800 text-white shadow-2xs hover:shadow-xs border border-slate-800 focus:ring-2 focus:ring-slate-500/30';
      case 'download':
      case 'upload':
      case 'share':
      case 'filter':
      case 'refresh':
      default:
        return 'bg-slate-700 hover:bg-slate-800 text-white shadow-2xs border border-slate-800 focus:ring-2 focus:ring-slate-500/30';
    }
  };

  const getSizeStyles = (): string => {
    if (iconOnly) {
      switch (size) {
        case 'xs':
          return 'w-7 h-7 text-2xs rounded-lg p-1';
        case 'sm':
          return 'w-8 h-8 text-2xs rounded-lg p-1.5';
        case 'lg':
          return 'w-10 h-10 text-xs rounded-xl p-2.5';
        case 'md':
        default:
          return 'w-9 h-9 text-xs rounded-xl p-2';
      }
    }

    switch (size) {
      case 'xs':
        return 'h-7 px-2.5 py-0.5 text-xs gap-1 rounded-lg font-semibold';
      case 'sm':
        return 'h-8 px-3 py-1 text-xs gap-1.5 rounded-lg font-semibold';
      case 'lg':
        return 'h-10 px-4 py-2 text-sm gap-2 rounded-xl font-bold';
      case 'md':
      default:
        return 'h-9 px-3.5 py-1.5 text-xs gap-1.5 rounded-lg font-semibold';
    }
  };

  const defaultLabel = label || (children ? undefined : variant.replace('-', ' '));

  return (
    <button
      disabled={disabled || isLoading}
      title={tooltip || defaultLabel}
      className={`inline-flex items-center justify-center font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none active:scale-[0.97] select-none ${getVariantStyles()} ${getSizeStyles()} ${className}`}
      {...props}
    >
      {renderIcon()}
      {!iconOnly && defaultLabel && (
        <span
          className={`capitalize whitespace-nowrap ${
            showIconOnlyOnMobile ? 'hidden sm:inline' : 'inline'
          }`}
        >
          {defaultLabel}
        </span>
      )}
      {!iconOnly && !defaultLabel && children}
    </button>
  );
};
