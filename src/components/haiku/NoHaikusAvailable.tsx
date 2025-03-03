
import React from "react";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";
import { CalendarClock, Mail } from "lucide-react";

const NoHaikusAvailable = () => {
  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[60vh] text-center">
      <CalendarClock className="w-16 h-16 text-emerald-500 mb-6" />
      
      <h2 className="text-2xl md:text-3xl font-medium mb-4">
        You've completed all available haikus!
      </h2>
      
      <p className="text-lg text-gray-600 mb-8 max-w-md">
        Check back tomorrow for new haikus to solve. We're constantly adding new content!
      </p>
      
      <div className="space-y-4">
        <Button 
          size="lg"
          className="bg-emerald-500 hover:bg-emerald-600 text-white"
        >
          <Mail className="mr-2 h-5 w-5" />
          Subscribe for updates
        </Button>
        
        <div>
          <Link 
            to="/solved" 
            className="inline-block mt-6 text-emerald-600 hover:text-emerald-700 underline"
          >
            View your solved haikus
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NoHaikusAvailable;
