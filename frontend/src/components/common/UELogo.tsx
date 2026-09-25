import React from 'react';

interface UELogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  textColor?: string;
  subTextColor?: string;
  variant?: 'circle' | 'square' | 'shield';
  className?: string;
}

export const UELogo: React.FC<UELogoProps> = ({
  size = 'md',
  showText = false,
  textColor = 'text-white',
  subTextColor = 'text-emerald-200',
  variant = 'circle',
  className = ''
}) => {
  const sizeMap = {
    xs: 'w-8 h-8',
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-28 sm:w-32 h-28 sm:h-32'
  };

  const shapeClass = variant === 'circle' ? 'rounded-full' : variant === 'shield' ? 'rounded-b-2xl rounded-t-lg' : 'rounded-xl';

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className={`relative ${sizeMap[size]} ${shapeClass} overflow-hidden shrink-0 shadow-sm border border-emerald-100 bg-white flex items-center justify-center p-1 group transition-all duration-300 hover:scale-105`}
        title="University of Education, Attock Campus"
      >
        {/* Clean Official Logo Crest */}
        <img
          src="/ue_logo.png"
          alt="University Logo Emblem"
          className="w-full h-full object-contain"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/ue_logo_transparent.png';
          }}
        />
      </div>

      {showText && (
        <div className="flex flex-col leading-tight min-w-0">
          <span className={`text-xs sm:text-sm font-extrabold font-heading tracking-tight truncate ${textColor}`}>
            University of Education
          </span>
          <span className={`text-2xs font-bold uppercase tracking-wider truncate ${subTextColor}`}>
            Attock Campus
          </span>
        </div>
      )}
    </div>
  );
};
