
import { Settings as SettingsIcon } from "lucide-react";

const Settings = () => {
  return (
    <div className="animate-fade-in">
      <h1 className="text-4xl font-bold mb-8">Settings</h1>
      <div className="bg-white p-8 rounded-xl shadow-sm border text-center">
        <SettingsIcon className="w-12 h-12 mx-auto mb-4 text-secondary" />
        <h2 className="text-xl font-medium mb-2">Settings Coming Soon</h2>
        <p className="text-secondary">
          System settings and preferences will be available in the next update.
        </p>
      </div>
    </div>
  );
};

export default Settings;
