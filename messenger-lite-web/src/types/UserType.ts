export interface User {
  id: string;
  username: string;
  isOnline: boolean;
  avatar: string;
  settings: UserSettings;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  requestCreatedAt?: Date;
  requestUpdatedAt?: Date;
  lastSeenAt?: Date;
  isTwoFAEnable?: boolean;
  lockedUntil?: Date;
}

export interface UserSettings {
  soundNotifications: boolean;
  theme: "light" | "dark";
}
