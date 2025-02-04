import React from "react";

interface CompletedHaikuProps {
  lines: (string[] | null)[];
}

const CompletedHaiku: React.FC<CompletedHaikuProps> = ({ lines }) => {
  return (
    <div className="my-12 flex flex-col gap-2">
      {lines.map((line, index) => (
        <p 
          key={index} 
          className="text-lg text-center font-light"
        >
          {line?.join(' ')}
        </p>
      ))}
    </div>
  );
};

export default CompletedHaiku;