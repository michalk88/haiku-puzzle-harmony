
import React from "react";
import { Button } from "../ui/button";
import { CalendarClock, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const NoHaikusAvailable = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
        <CalendarClock className="h-8 w-8 text-emerald-600" />
      </div>
      <h2 className="text-2xl font-medium text-gray-900 mb-3">You've completed all haikus!</h2>
      <p className="text-gray-600 max-w-md mb-8">
        You've solved all available haikus. Come back tomorrow for new puzzles and challenges to keep your mind sharp!
      </p>
      
      <div className="space-y-4">
        <Link to="/solved">
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-6">
            View Solved Haikus
          </Button>
        </Link>
        
        <div className="pt-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <span>Sign up for updates</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NoHaikusAvailable;
