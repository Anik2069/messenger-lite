export interface Group {
  _id: string;
  name: string;
  description: string;
  members: string[];
  admin: string[];
  avatar: string;
  createdAt: Date;
}
