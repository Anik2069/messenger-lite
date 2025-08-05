export interface User {
  id: string;
  username: string;
  isOnline: boolean;
  avatar: string;
  settings: UserSettings;
  email: string;
}

export interface UserSettings {
  soundNotifications: boolean;
  theme: "light" | "dark";
}
