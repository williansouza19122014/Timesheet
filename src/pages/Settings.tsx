
import { useState, useEffect } from "react";
import { Settings as SettingsIcon, Server, Database, Key } from "lucide-react";
import { supabase } from "@/lib/supabase";

const Settings = () => {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const { data, error } = await supabase
        .from('test_connection')
        .select('*')
        .limit(1);
      
      if (error) throw error;
      setConnectionStatus('connected');
    } catch (error) {
      console.error('Connection error:', error);
      setConnectionStatus('error');
    }
  };

  const SystemCard = ({ icon: Icon, title, status, description }: {
    icon: any;
    title: string;
    status: string;
    description: string;
  }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border">
      <div className="flex items-start gap-4">
        <div className="p-2 bg-accent/10 rounded-lg">
          <Icon className="w-6 h-6 text-accent" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-medium">{title}</h3>
            <span className={`text-xs px-2 py-1 rounded-full ${
              status === 'Connected' 
                ? 'bg-success/10 text-success' 
                : status === 'Checking...'
                ? 'bg-accent/10 text-accent'
                : 'bg-destructive/10 text-destructive'
            }`}>
              {status}
            </span>
          </div>
          <p className="text-sm text-secondary">{description}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <h1 className="text-4xl font-bold mb-8">Settings</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <SystemCard
          icon={Server}
          title="Supabase Connection"
          status={
            connectionStatus === 'checking' 
              ? 'Checking...' 
              : connectionStatus === 'connected'
              ? 'Connected'
              : 'Error'
          }
          description="Status of connection to Supabase backend services"
        />

        <SystemCard
          icon={Database}
          title="Database Status"
          status={connectionStatus === 'connected' ? 'Connected' : 'Checking...'}
          description="PostgreSQL database connection status"
        />

        <SystemCard
          icon={Key}
          title="Authentication"
          status={connectionStatus === 'connected' ? 'Active' : 'Checking...'}
          description="User authentication and authorization system"
        />

        <SystemCard
          icon={SettingsIcon}
          title="System Configuration"
          status="Available"
          description="Global system settings and preferences"
        />
      </div>
    </div>
  );
};

export default Settings;
