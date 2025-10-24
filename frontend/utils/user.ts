import {User} from "../../lib/types/user";

export async function getUserById(userID: string): Promise<User> {
    // Placeholder function to simulate fetching user data
    return {
        id: userID,
        name: `User ${userID}`,
        email: `user${userID}@example.com`,
        createdAt: new Date(),
        updatedAt: new Date(),
        avatarURL: "https://i.pravatar.cc/150?u=" + userID,
        groupIDs: [],
        isVerified: true,
        role: "user"
    }
}
