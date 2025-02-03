import React from "react";
import { Loader2 } from "lucide-react";

const LoadingState: React.FC = () => {
  return (
    <div className="flex justify-center items-center min-h-[400px]">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
};

export default LoadingState;