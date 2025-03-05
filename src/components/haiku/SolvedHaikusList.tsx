
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import SolvedHaikuCard from './SolvedHaikuCard';
import NoHaikuAvailable from './NoHaikusAvailable';

interface SolvedHaikuDisplay {
  id: string;
  title: string;
  lines: string[][];
  haiku_id: string;
}

interface SolvedHaikusListProps {
  displayHaikus: SolvedHaikuDisplay[];
}

const SolvedHaikusList = ({ displayHaikus }: SolvedHaikusListProps) => {
  if (displayHaikus.length === 0) {
    return <NoHaikuAvailable />;
  }

  return (
    <ScrollArea className="flex-1 pb-20">
      <div className="space-y-6 max-w-xl mx-auto">
        {displayHaikus.map((haiku, index) => (
          <SolvedHaikuCard 
            key={`${haiku.id}-${index}`}
            id={haiku.id}
            title={haiku.title}
            lines={haiku.lines}
          />
        ))}
      </div>
    </ScrollArea>
  );
};

export default SolvedHaikusList;
