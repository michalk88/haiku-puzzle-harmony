
import React, { useEffect } from "react";
import { Button } from "../ui/button";
import { ChevronRight, CheckCircle } from "lucide-react";

interface CompletedHaikuProps {
  lines: (string[] | null)[];
  onNextHaiku: () => void;
  onAnimationComplete?: () => void;
}

const CompletedHaiku: React.FC<CompletedHaikuProps> = ({ lines, onNextHaiku, onAnimationComplete }) => {
  console.log("CompletedHaiku rendering with lines:", lines);
  
  const hasValidLines = lines.some(line => line !== null && line.length > 0);
  console.log("CompletedHaiku: hasValidLines:", hasValidLines);

  // Call onAnimationComplete after the last line's animation is done
  useEffect(() => {
    if (onAnimationComplete && hasValidLines) {
      // The last animation delay is 800ms + 300ms for the animation itself
      const animationCompleteTimeout = setTimeout(() => {
        console.log("Animation complete, updating count");
        onAnimationComplete();
      }, 1200); // wait for the animation to complete

      return () => clearTimeout(animationCompleteTimeout);
    }
  }, [onAnimationComplete, hasValidLines]);

  return (
    <div className="flex flex-col items-center">
      <div className="animate-fade-in mb-6 flex justify-center">
        <div className="bg-green-50 text-green-600 px-4 py-2 rounded-full flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          <span className="font-medium">Haiku Solved!</span>
        </div>
      </div>
      
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
      <div className="w-full flex justify-center transition-all duration-300 animate-fade-in" 
           style={{ animationDelay: '1200ms', animationFillMode: 'forwards' }}>
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
