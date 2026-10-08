import { z } from 'zod'

/** Fields of a "new password + confirm" pair. */
export const newPasswordFields = {
  password: z.string(),
  confirmPassword: z.string(),
}

type NewPassword = { password: string; confirmPassword: string }

/** Validates the new password only when one is required (e.g. not on edit). */
export const checkNewPassword =
  (required: boolean) => (values: NewPassword, ctx: z.RefinementCtx) => {
    if (!required) return
    if (values.password.length < 8) {
      ctx.addIssue({
        code: 'custom',
        message: 'Password must be at least 8 characters long.',
        path: ['password'],
      })
    } else if (values.password !== values.confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        message: "Passwords don't match.",
        path: ['confirmPassword'],
      })
    }
  }
