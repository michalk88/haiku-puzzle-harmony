
import React, { useMemo } from "react";

interface CompletedHaikuProps {
  lines: (string[] | null)[];
}

const CompletedHaiku: React.FC<CompletedHaikuProps> = ({ lines }) => {
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
    sm: "text-sm sm:text-base",
    base: "text-base sm:text-lg",
    lg: "text-lg sm:text-xl"
  };

  return (
    <div className="my-6 sm:my-8 flex flex-col gap-4 sm:gap-6 animate-[fade-in_0.8s_ease-out]">
      {lines.map((line, index) => (
        <div 
          key={index} 
          className={`flex flex-nowrap gap-1.5 sm:gap-2 items-center overflow-x-auto px-2
            ${index === 1 ? 'justify-center' : 'justify-center'}
            animate-[scale-in_0.8s_ease-out]
            ${index === 0 ? 'animate-delay-[0ms]' : ''}
            ${index === 1 ? 'animate-delay-[200ms]' : ''}
            ${index === 2 ? 'animate-delay-[400ms]' : ''}`}
        >
          {line?.map((word, wordIndex) => (
            <span
              key={`${word}-${wordIndex}`}
              className={`${sizeClasses[sizes[index]]} text-haiku-text font-normal
                opacity-0 animate-[fade-in_0.6s_ease-out_forwards]
                ${wordIndex === 0 ? 'animate-delay-[0ms]' : ''}
                ${wordIndex === 1 ? 'animate-delay-[100ms]' : ''}
                ${wordIndex === 2 ? 'animate-delay-[200ms]' : ''}
                ${wordIndex === 3 ? 'animate-delay-[300ms]' : ''}
                ${wordIndex === 4 ? 'animate-delay-[400ms]' : ''}`}
            >
              {word}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
};

export default CompletedHaiku;
