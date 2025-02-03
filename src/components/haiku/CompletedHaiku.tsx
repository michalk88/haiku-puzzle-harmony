import React from "react";

interface CompletedHaikuProps {
  lines: (string[] | null)[];
}

const CompletedHaiku: React.FC<CompletedHaikuProps> = ({ lines }) => {
  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        {lines.map((line, index) => (
          <p key={index} className="text-lg">
            {line?.join(' ')}
          </p>
        ))}
      </div>
    </div>
  );
};

export default CompletedHaiku;