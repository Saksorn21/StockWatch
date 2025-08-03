import { z } from "zod";

// Password validator แยกไว้ใช้ซ้ำได้
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(100, "Password is too long")
  .regex(/[a-z]/, "Must include at least 1 lowercase letter")
  .regex(/[A-Z]/, "Must include at least 1 uppercase letter")
  .regex(/[0-9]/, "Must include at least 1 number")
  .regex(/[^A-Za-z0-9]/, "Must include at least 1 special character")
  .regex(/^\S*$/, "No spaces allowed")
  .refine(val => !/<|>|script|alert|\(|\)|{|}|\/|\\/.test(val), {
    message: "No dangerous characters allowed",
  });

// Register schema
export const authRegisterSchema = z.object({
  username: z.string().min(5, "Username must be at least 5 characters"),
  email: z.string().email("Invalid email address"),
  password: passwordSchema,
  confirm: z.string(),
}).refine((data) => data.password === data.confirm, {
  message: "Passwords do not match",
  path: ["confirm"],
});

// Login schema
export const authLoginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password is required"),
});

// Forgot password schema
export const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email"),
});

// OTP verification schema
export const otpSchema = z.object({
  otp: z.string()
    .length(6, "OTP must be 6 digits")
    .regex(/^[0-9]{6}$/, "OTP must be numeric"),
});

export type AuthRegisterInput = z.infer<typeof authRegisterSchema>

export type AuthLoginInput = z.infer<typeof authLoginSchema>
export type ForgotPasswordInput =z.infer<typeof forgotPasswordSchema>
export type OTPInput = z.infer<typeof otpSchema>
