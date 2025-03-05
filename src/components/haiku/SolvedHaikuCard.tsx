
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface SolvedHaikuCardProps {
  id: string;
  title: string;
  lines: string[][];
}

const SolvedHaikuCard = ({ id, title, lines }: SolvedHaikuCardProps) => {
  // Only render lines that have content
  const line1 = lines[0]?.length > 0 ? lines[0].join(' ') : '';
  const line2 = lines[1]?.length > 0 ? lines[1].join(' ') : '';
  const line3 = lines[2]?.length > 0 ? lines[2].join(' ') : '';
  
  return (
    <Card 
      key={id}
      className="animate-fade-in border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200"
    >
      <CardContent className="p-6 space-y-4">
        <h2 className="text-xl font-medium text-center text-primary-900">
          {title}
        </h2>
        <div className="text-lg text-center space-y-2 text-gray-700">
          {line1 && <p>{line1}</p>}
          {line2 && <p>{line2}</p>}
          {line3 && <p>{line3}</p>}
        </div>
      </CardContent>
    </Card>
  );
};

export default SolvedHaikuCard;
