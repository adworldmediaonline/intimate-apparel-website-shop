'use client';

import { authClient } from '@/lib/authClient';
import { notifyError, notifySuccess } from '@/utils/toast';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Settings, Shield, Loader2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    revokeOtherSessions: z.boolean().optional(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'],
  });

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

const ProfileSettings: React.FC = () => {
  const [accounts, setAccounts] = useState<
    { id: string; providerId: string }[] | null
  >(null);
  const [accountsLoading, setAccountsLoading] = useState(true);

  const hasCredentialAccount =
    accounts?.some((a) => a.providerId === 'credential') ?? false;

  useEffect(() => {
    void authClient.listAccounts().then((res) => {
      if (res.data && Array.isArray(res.data)) {
        setAccounts(res.data);
      } else {
        setAccounts([]);
      }
    })
      .catch(() => {
        setAccounts([]);
      })
      .finally(() => {
        setAccountsLoading(false);
      });
  }, []);

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      revokeOtherSessions: false,
    },
  });

  const isChanging = form.formState.isSubmitting;

  async function onSubmit(values: ChangePasswordFormValues) {
    const timeoutMs = 15_000;
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Request timed out')), timeoutMs)
    );

    try {
      const changePromise = authClient.changePassword({
        currentPassword: values.currentPassword.trim(),
        newPassword: values.newPassword.trim(),
        revokeOtherSessions: values.revokeOtherSessions ?? false,
      });

      const { error } = await Promise.race([changePromise, timeoutPromise]);

      if (error) {
        const msg =
          error.message ??
          (error.status ? `Request failed (${error.status})` : null) ??
          'Failed to change password';
        notifyError(msg);
        return;
      }

      notifySuccess('Password changed successfully');
      form.reset({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        revokeOtherSessions: false,
      });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message === 'Request timed out'
            ? 'Request timed out. Please try again.'
            : err.message
          : 'Failed to change password';
      notifyError(message);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          Account Settings
        </CardTitle>
        <CardDescription>
          Manage your account security and preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h4 className="font-medium text-foreground">Security</h4>

          {accountsLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading…
            </div>
          ) : hasCredentialAccount ? (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current password</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder="••••••••"
                          autoComplete="current-password"
                          disabled={isChanging}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New password</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder="••••••••"
                          autoComplete="new-password"
                          disabled={isChanging}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm new password</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder="••••••••"
                          autoComplete="new-password"
                          disabled={isChanging}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="revokeOtherSessions"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isChanging}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="font-normal text-sm cursor-pointer">
                          Revoke other sessions
                        </FormLabel>
                        <p className="text-muted-foreground text-xs">
                          Sign out from all other devices after changing
                          password
                        </p>
                      </div>
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isChanging}>
                  {isChanging ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Changing…
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      Change password
                    </>
                  )}
                </Button>
              </form>
            </Form>
          ) : (
            <p className="text-muted-foreground text-sm">
              You signed in with a social provider. Password change is not
              available. To set a password, use the forgot password flow.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileSettings;
