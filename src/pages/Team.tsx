
import { Users } from "lucide-react";

const Team = () => {
  return (
    <div className="animate-fade-in">
      <h1 className="text-4xl font-bold mb-8">Team</h1>
      <div className="bg-white p-8 rounded-xl shadow-sm border text-center">
        <Users className="w-12 h-12 mx-auto mb-4 text-secondary" />
        <h2 className="text-xl font-medium mb-2">Team Management Coming Soon</h2>
        <p className="text-secondary">
          Team management features will be available in the next update.
        </p>
      </div>
    </div>
  );
};

export default Team;
