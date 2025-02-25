
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "warning" | "error" | "success" | "info";
  date: Date;
  read: boolean;
  action?: {
    text: string;
    onClick: () => void;
  };
}
