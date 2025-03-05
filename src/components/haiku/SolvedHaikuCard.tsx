
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface SolvedHaikuCardProps {
  id: string;
  title: string;
  words: {
    line1: string[];
    line2: string[];
    line3: string[];
  };
}

const SolvedHaikuCard = ({ id, title, words }: SolvedHaikuCardProps) => {
  const line1 = words.line1?.join(' ') || '';
  const line2 = words.line2?.join(' ') || '';
  const line3 = words.line3?.join(' ') || '';
  
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
