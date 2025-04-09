
import React from 'react';
import { format, addDays } from 'date-fns';
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface CalendarHeaderProps {
  currentDate: Date;
  start: Date;
  end: Date;
  singleDayMode: boolean;
  goToPreviousDay: () => void;
  goToNextDay: () => void;
  goToPreviousWeek: () => void;
  goToNextWeek: () => void;
  goToToday: () => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate,
  start,
  end,
  singleDayMode,
  goToPreviousDay,
  goToNextDay,
  goToPreviousWeek,
  goToNextWeek,
  goToToday
}) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <div className="text-xl font-semibold">
        {singleDayMode 
          ? format(currentDate, 'MMMM d, yyyy') 
          : `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`
        }
      </div>
      <div className="flex gap-2">
        <Button 
          size="sm" 
          variant="outline" 
          onClick={singleDayMode ? goToPreviousDay : goToPreviousWeek}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Button 
          size="sm" 
          onClick={goToToday}
          className="bg-gray-200 text-gray-900 hover:bg-gray-300"
        >
          Today
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={singleDayMode ? goToNextDay : goToNextWeek}
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default CalendarHeader;
