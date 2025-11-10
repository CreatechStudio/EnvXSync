import {User} from "../../lib/types/user";
import {get} from "@/utils/network";
import {ApiResponse} from "../../lib/types/api";
import {addToast} from "@heroui/toast";

export async function getUserById(userID: string): Promise<User | null> {
    return await get(`/user/get/${userID}`).then((data: ApiResponse<User>) => {
        if (data.success && data.data) {
            return data.data;
        } else {
            addToast({
                title: data.error || "Failed to fetch user data",
                color: "danger"
            });
            return null;
        }
    }).catch(() => {
        addToast({
            title: "Failed to fetch user data",
            color: "danger"
        });
        return null;
    });
}
