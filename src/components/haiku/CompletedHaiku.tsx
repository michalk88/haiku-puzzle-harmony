import React from "react";

interface CompletedHaikuProps {
  lines: (string[] | null)[];
}

const CompletedHaiku: React.FC<CompletedHaikuProps> = ({ lines }) => {
  return (
    <div className="my-12">
      {lines.map((line, index) => (
        <p 
          key={index} 
          className="text-lg text-haiku-text font-light leading-relaxed"
        >
          {line?.join(' ')}
        </p>
      ))}
    </div>
  );
};

export default CompletedHaiku;