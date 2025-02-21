
import { User } from "lucide-react";

const Profile = () => {
  return (
    <div className="animate-fade-in">
      <h1 className="text-4xl font-bold mb-8">Profile</h1>
      <div className="bg-white p-8 rounded-xl shadow-sm border text-center">
        <User className="w-12 h-12 mx-auto mb-4 text-secondary" />
        <h2 className="text-xl font-medium mb-2">Profile Settings Coming Soon</h2>
        <p className="text-secondary">
          Profile customization will be available in the next update.
        </p>
      </div>
    </div>
  );
};

export default Profile;
