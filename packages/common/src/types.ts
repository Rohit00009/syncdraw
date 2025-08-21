import { z } from "zod";

export const CreateUserSchema = z.object({
  username: z.string().min(2).max(100),
  name: z.string().min(2).max(100),
  password: z.string(),
});

export const SigninSchema = z.object({
  username: z.string().min(2).max(100),
  password: z.string(),
});

export const CreateRoomSchema = z.object({
  name: z.string().min(2).max(100),
});
