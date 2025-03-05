
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SolvedHaikuHeaderProps {
  hasHaikus: boolean;
  isResetting: boolean;
  onResetAll: () => void;
}

const SolvedHaikuHeader = ({ 
  hasHaikus, 
  isResetting, 
  onResetAll 
}: SolvedHaikuHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center">
        <Link to="/" className="text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="ml-4 text-2xl font-semibold">Your Solved Haikus</h1>
      </div>
      
      {hasHaikus && (
        <Button 
          variant="outline" 
          className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
          onClick={onResetAll}
          disabled={isResetting}
        >
          <RefreshCw className="h-4 w-4" />
          <span>Reset All Progress</span>
        </Button>
      )}
    </div>
  );
};

export default SolvedHaikuHeader;
