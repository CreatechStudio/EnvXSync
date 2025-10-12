export interface Token {
    id: string;
    user_id: string;
    token: string;
    type: 'email_verification' | 'password_reset';
    created_at: Date;
    expires_at: Date;
    used: boolean;
}
