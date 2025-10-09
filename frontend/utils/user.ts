import {User} from "../../lib/types/user";

export function getUserById(userID: string): User {
    // Placeholder function to simulate fetching user data
    return {
        id: userID,
        name: `User ${userID}`,
        email: `user${userID}@example.com`,
        createdAt: new Date(),
        updatedAt: new Date(),
        avatarURL: "https://i.pravatar.cc/150?u=" + userID,
        groupIDs: []
    }
}
