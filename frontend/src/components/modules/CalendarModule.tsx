import React from 'react';
import { CalendarView } from '../common/CalendarView';

interface CalendarModuleProps {
  activeModule?: string;
}

export const CalendarModule: React.FC<CalendarModuleProps> = ({ activeModule }) => {
  return (
    <div className="space-y-6">
      <CalendarView activeModule={activeModule} />
    </div>
  );
};
