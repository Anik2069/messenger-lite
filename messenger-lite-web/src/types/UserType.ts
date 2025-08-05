export interface User {
  id: string;
  username: string;
  isOnline: boolean;
  avatar: string;
  settings: UserSettings;
}

export interface UserSettings {
  soundNotifications: boolean;
  theme: "light" | "dark";
}
