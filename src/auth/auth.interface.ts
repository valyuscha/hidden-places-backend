export interface UserPayload {
  sub: number;
  email: string;
  name: string;
}

export interface GqlContext {
  req: Request & { user?: UserPayload };
}

export interface JwtPayloadInput {
  id: number;
  email: string;
  name: string;
}
