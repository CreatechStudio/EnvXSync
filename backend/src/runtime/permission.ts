import axios from "axios";
import {ApiResponse} from "../../../lib/types/api";
import {BASE_URL} from "../index";

export default class PermissionRuntime {
    async verifyJWT(cookie: string) {
        try {
            const response = await axios.post(`${BASE_URL}/login/verify`, {
                cookie: cookie
            })
            let determine = response.data as ApiResponse<Boolean>;
            return determine.success;
        } catch (error) {
            return false;
        }
    }
}