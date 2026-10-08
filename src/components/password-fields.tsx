import { useFormContext } from 'react-hook-form'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { PasswordInput } from '@/components/password-input'

/** "Password" and "Confirm password" inputs for a form using `newPasswordFields`. */
export function PasswordFields() {
  const { control } = useFormContext<{
    password: string
    confirmPassword: string
  }>()

  return (
    <>
      <FormField
        control={control}
        name='password'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Password</FormLabel>
            <FormControl>
              <PasswordInput autoComplete='new-password' {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name='confirmPassword'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Confirm password</FormLabel>
            <FormControl>
              <PasswordInput autoComplete='new-password' {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  )
}
