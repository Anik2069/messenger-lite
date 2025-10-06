// Partial User for requests (missing full User fields)

import { User } from "./UserType";

// API payload when a friend request is sent/received
export interface FriendRequestPayload {
  request: {
    id: string;
    sender: User;
    receiver: User;
    status: "PENDING" | "ACCEPTED" | "REJECTED";
    createdAt: string;
    updatedAt: string;
  };
}
