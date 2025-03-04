
import React from "react";
import { Button } from "../ui/button";
import { ChevronRight } from "lucide-react";

interface CompletedHaikuProps {
  lines: (string[] | null)[];
  onNextHaiku: () => void;
}

const CompletedHaiku: React.FC<CompletedHaikuProps> = ({ lines, onNextHaiku }) => {
  console.log("CompletedHaiku rendering with lines:", lines);
  
  const hasValidLines = lines.some(line => line !== null && line.length > 0);
  console.log("CompletedHaiku: hasValidLines:", hasValidLines);

  return (
    <div className="flex flex-col items-center">
      <div className="my-8 sm:my-10 flex flex-col items-center gap-6 sm:gap-8 mb-14 sm:mb-16">
        {lines.map((line, index) => (
          <div 
            key={index} 
            className={`flex flex-wrap gap-2 sm:gap-3 items-center justify-center w-full 
              transition-all duration-1000 ease-out opacity-0 translate-y-4 animate-fade-in
              ${index === 1 ? 'animate-delay-[400ms]' : ''}
              ${index === 2 ? 'animate-delay-[800ms]' : ''}`}
            style={{
              animationFillMode: 'forwards',
              animationDelay: `${index * 400}ms`
            }}
          >
            {line && line.length > 0 ? (
              line.map((word, wordIndex) => (
                <span
                  key={`${word}-${wordIndex}`}
                  className="text-lg sm:text-xl text-gray-900 font-normal"
                >
                  {word}
                </span>
              ))
            ) : (
              <span className="text-gray-400">Line {index+1}</span>
            )}
          </div>
        ))}
      </div>
      <div className="w-full flex justify-center">
        <Button
          onClick={onNextHaiku}
          className="haiku-action-button primary flex items-center justify-center gap-2 mx-auto"
        >
          Continue
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default CompletedHaiku;
