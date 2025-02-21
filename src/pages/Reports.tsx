
import { ChartBar } from "lucide-react";

const Reports = () => {
  return (
    <div className="animate-fade-in">
      <h1 className="text-4xl font-bold mb-8">Reports</h1>
      <div className="bg-white p-8 rounded-xl shadow-sm border text-center">
        <ChartBar className="w-12 h-12 mx-auto mb-4 text-secondary" />
        <h2 className="text-xl font-medium mb-2">Reports Coming Soon</h2>
        <p className="text-secondary">
          Detailed analytics and reports will be available in the next update.
        </p>
      </div>
    </div>
  );
};

export default Reports;
