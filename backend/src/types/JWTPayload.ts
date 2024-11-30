export interface JWTPayload {
    userId: string;
    email: string;
    username: string;
    fullName: string | null;
    iat: number;
    exp: number;
}