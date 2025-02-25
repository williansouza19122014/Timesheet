
import React from "react";

interface InboxProps {
  children: React.ReactNode;
}

const Inbox: React.FC<InboxProps> = ({ children }) => {
  return (
    <div className="relative">
      {children}
    </div>
  );
};

export default Inbox;
