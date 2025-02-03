import React from "react";

interface CompletedHaikuProps {
  lines: (string[] | null)[];
}

const CompletedHaiku: React.FC<CompletedHaikuProps> = ({ lines }) => {
  return (
    <div className="my-12 space-y-2 font-light">
      {lines.map((line, index) => (
        <p key={index} className="text-lg text-haiku-text">
          {line?.join(' ')}
        </p>
      ))}
    </div>
  );
};

export default CompletedHaiku;