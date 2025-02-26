
import React, { useMemo } from "react";
import { Button } from "../ui/button";
import { ChevronRight } from "lucide-react";

interface CompletedHaikuProps {
  lines: (string[] | null)[];
  onNextHaiku: () => void;
}

const CompletedHaiku: React.FC<CompletedHaikuProps> = ({ lines, onNextHaiku }) => {
  const getLineSize = (line: string[] | null) => {
    if (!line) return "base";
    const totalLength = line.join(' ').length;
    if (totalLength > 25) return "sm";
    if (totalLength > 20) return "base";
    return "lg";
  };

  const sizes = useMemo(() => 
    lines.map(line => getLineSize(line)), 
    [lines]
  );

  const sizeClasses = {
    sm: "text-lg sm:text-xl",
    base: "text-xl sm:text-2xl",
    lg: "text-2xl sm:text-3xl"
  };

  return (
    <div className="flex flex-col items-center">
      <div className="my-6 sm:my-8 flex flex-col items-center gap-4 sm:gap-6 mb-12">
        {lines.map((line, index) => (
          <div 
            key={index} 
            className={`flex flex-nowrap gap-2 sm:gap-3 items-center justify-center overflow-x-auto px-2 
              transition-all duration-1000 ease-out opacity-0 translate-y-4 animate-fade-in
              ${index === 1 ? 'animate-delay-[400ms]' : ''}
              ${index === 2 ? 'animate-delay-[800ms]' : ''}`}
            style={{
              animationFillMode: 'forwards',
              animationDelay: `${index * 400}ms`
            }}
          >
            {line?.map((word, wordIndex) => (
              <span
                key={`${word}-${wordIndex}`}
                className={`${sizeClasses[sizes[index]]} text-gray-900 font-normal`}
              >
                {word}
              </span>
            ))}
          </div>
        ))}
      </div>
      <Button
        onClick={onNextHaiku}
        className="bg-emerald-500 hover:bg-emerald-600 text-white px-8"
      >
        Continue
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
};

export default CompletedHaiku;
