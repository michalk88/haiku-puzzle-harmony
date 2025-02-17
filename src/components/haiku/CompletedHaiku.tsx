
import React, { useMemo } from "react";

interface CompletedHaikuProps {
  lines: (string[] | null)[];
}

const CompletedHaiku: React.FC<CompletedHaikuProps> = ({ lines }) => {
  const getLineSize = (line: string[] | null) => {
    if (!line) return "base";
    const totalLength = line.join(' ').length;
    if (totalLength > 20) return "xs";
    if (totalLength > 15) return "sm";
    return "base";
  };

  const sizes = useMemo(() => 
    lines.map(line => getLineSize(line)), 
    [lines]
  );

  const sizeClasses = {
    xs: "text-xs sm:text-sm",
    sm: "text-sm sm:text-base",
    base: "text-base sm:text-lg"
  };

  return (
    <div className="my-8 sm:my-12 flex flex-col gap-4 sm:gap-6">
      {lines.map((line, index) => (
        <div 
          key={index} 
          className="flex flex-nowrap gap-1.5 sm:gap-2 items-center justify-center overflow-x-auto px-2"
        >
          {line?.map((word, wordIndex) => (
            <span
              key={`${word}-${wordIndex}`}
              className={`${sizeClasses[sizes[index]]} text-haiku-text font-light`}
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
