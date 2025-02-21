
import { useState } from "react";
import { Clock } from "lucide-react";

const TimeTracking = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [currentTime, setCurrentTime] = useState("00:00:00");

  const toggleTracking = () => {
    setIsTracking(!isTracking);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Time Tracking</h1>
        <div className="flex gap-4">
          <select className="px-4 py-2 rounded-lg border bg-white hover:bg-muted transition-smooth">
            <option>Project A</option>
            <option>Project B</option>
            <option>Project C</option>
          </select>
          <button
            onClick={toggleTracking}
            className={`px-6 py-2 rounded-lg font-medium transition-smooth flex items-center gap-2 ${
              isTracking
                ? "bg-destructive text-white hover:bg-destructive/90"
                : "bg-success text-white hover:bg-success/90"
            }`}
          >
            <Clock className="w-5 h-5" />
            {isTracking ? "Stop" : "Start"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Current Timer */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="text-lg font-medium mb-4">Current Session</h2>
          <div className="text-4xl font-bold text-center py-8">{currentTime}</div>
        </div>

        {/* Today's Summary */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="text-lg font-medium mb-4">Today's Summary</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-secondary">Total Time</span>
              <span className="font-medium">4h 32m</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-secondary">Projects</span>
              <span className="font-medium">3</span>
            </div>
          </div>
        </div>

        {/* Weekly Goal */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="text-lg font-medium mb-4">Weekly Goal</h2>
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full bg-success/10 text-success">
                  On Track
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block">
                  32/40 hours
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-muted">
              <div
                style={{ width: "80%" }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-success transition-all duration-500"
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-lg font-medium mb-6">Recent Activities</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Project</th>
                <th className="text-left py-3 px-4">Start Time</th>
                <th className="text-left py-3 px-4">End Time</th>
                <th className="text-left py-3 px-4">Duration</th>
                <th className="text-left py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, index) => (
                <tr key={index} className="border-b hover:bg-muted/50 transition-smooth">
                  <td className="py-3 px-4">Project {String.fromCharCode(65 + index)}</td>
                  <td className="py-3 px-4">09:00 AM</td>
                  <td className="py-3 px-4">11:30 AM</td>
                  <td className="py-3 px-4">2h 30m</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 text-xs rounded-full bg-success/10 text-success">
                      Completed
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TimeTracking;
