import base64 from "base-64";
import {Elysia, t} from "elysia";
import {UserRuntime} from "../runtime/user";
import {ApiResponse} from "../../../lib/types/api";
import {User} from "../../../lib/types/user";
import PermissionRuntime from "../runtime/permission";

export const UserRoute = new Elysia()
    .decorate('user', new UserRuntime())
    .group('user', (app) => app
        .guard(
            {
                async beforeHandle({ cookie: { auth }}) {
                    if (auth) {
                        try {
                            let permissionRuntime = new PermissionRuntime();
                            if (await permissionRuntime.verifyJWT(auth.toString() || '')) {
                                return;
                            } else {
                                throw "Invalid token";
                            };
                        } catch (e) {
                            return {
                                success: false,
                                error: e,
                            }
                        }
                    } else {
                        return {
                            success: false,
                            error: 'Invalid token',
                        };
                    }}
            }, (app) => app
                .get('fetch', async ({user, cookie: {auth}}) => {
                    const me = await user.fetch(auth.toString() || '');
                    if (me) {
                        return {
                            success: true,
                            data: me,
                        } as ApiResponse<User>;
                    } else {
                        return {
                            success: false,
                            error: 'User not found',
                        } as ApiResponse;
                    }
                })
                .post('avatar', async ({ user, cookie: { auth }, body }) => {
                    try {
                        let userId = JSON.parse(base64.decode(auth.toString().split(".")[1])).id
                        let me = await user.updateAvatar(userId || "", body.avatarUrl || "")
                        return {
                            success: true,
                            data: me,
                        } as ApiResponse<User>;
                    } catch (e) {
                        return {
                            success: false,
                            error: e,
                        } as ApiResponse
                    }
                }, {
                    body: t.Object({
                        avatarUrl: t.String()
                    })
                })
        )
    )
