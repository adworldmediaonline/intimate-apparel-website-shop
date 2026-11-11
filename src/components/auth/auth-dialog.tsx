'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Eye, EyeOff, Lock, Mail, User, Shield, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { authClient } from '@/lib/authClient';
// import SocialAccount from '@/components/auth/social-account'; // Google sign-in hidden for now
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { REGEXP_ONLY_DIGITS } from 'input-otp';

const signInSchema = z.object({
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  password: z.string().min(8, {
    message: 'Password must be at least 8 characters.',
  }),
});

const signUpSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  password: z.string().min(8, {
    message: 'Password must be at least 8 characters.',
  }),
});

const verifyEmailSchema = z.object({
  otp: z.string().length(6, 'Please enter the complete 6-digit code'),
});

const forgotPasswordSchema = z.object({
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
});

const resetPasswordSchema = z.object({
  otp: z.string().length(6, 'Please enter the complete 6-digit code'),
  newPassword: z.string().min(8, {
    message: 'Password must be at least 8 characters.',
  }),
});

type DialogView = 'auth' | 'verify' | 'forgot' | 'reset';

/** Normalize pasted OTP (remove spaces, dashes, newlines) for reliable paste-from-email */
const otpPasteTransformer = (pasted: string) =>
  pasted.replace(/[\s\-–—]/g, '').replace(/\D/g, '');

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: 'signin' | 'signup';
  /** Custom message to display (e.g. when opened from review form: "Please sign in to submit a review") */
  message?: string;
}

/**
 * `defaultTab` is 'signup' because the header's account button is the main way
 * in and most people pressing it have no account yet. Checkout passes 'signin'
 * explicitly — a returning customer there is signing in, not joining.
 */
export function AuthDialog({ open, onOpenChange, defaultTab = 'signup', message }: AuthDialogProps) {
  const router = useRouter();
  const { refetch: refetchSession } = authClient.useSession();
  const [view, setView] = useState<DialogView>('auth');
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [verifyInfoMessage, setVerifyInfoMessage] = useState<string | null>(null);

  const signInForm = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const signUpForm = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const verifyEmailForm = useForm<z.infer<typeof verifyEmailSchema>>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      otp: '',
    },
  });

  const forgotPasswordForm = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const resetPasswordForm = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      otp: '',
      newPassword: '',
    },
  });

  const handleSignIn = async (values: z.infer<typeof signInSchema>) => {
    await authClient.signIn.email(
      {
        email: values.email,
        password: values.password,
      },
      {
        onRequest: () => {
          setIsLoading(true);
          setError(null);
        },
        onSuccess: () => {
          setIsLoading(false);
          onOpenChange(false);
          signInForm.reset();
          // Stay on current page - no redirect
        },
        onError: ctx => {
          setIsLoading(false);
          const err = ctx.error;
          const isUnverified =
            err?.status === 403 ||
            err?.code === 'EMAIL_NOT_VERIFIED' ||
            err?.message?.toLowerCase().includes('not verified');
          if (isUnverified) {
            setUserEmail(values.email);
            setView('verify');
            setError(null);
            setVerifyInfoMessage('Please verify your email to sign in. A new code has been sent.');
            void authClient.emailOtp.sendVerificationOtp({
              email: values.email,
              type: 'email-verification',
            }).then(() => setResendCooldown(60));
          } else {
            setError(err?.message ?? 'Sign in failed');
          }
        },
      }
    );
  };

  const handleSignUp = async (values: z.infer<typeof signUpSchema>) => {
    await authClient.signUp.email(
      {
        email: values.email,
        password: values.password,
        name: values.name,
      },
      {
        onRequest: () => {
          setIsLoading(true);
          setError(null);
        },
        onSuccess: () => {
          setIsLoading(false);
          signUpForm.reset();
          setUserEmail(values.email);
          setView('verify');
        },
        onError: ctx => {
          setIsLoading(false);
          const err = ctx.error;
          const isAlreadyExists =
            err?.code === 'USER_ALREADY_EXISTS' ||
            err?.message?.toLowerCase().includes('already exists');
          if (isAlreadyExists) {
            setUserEmail(values.email);
            setView('verify');
            setError(null);
            void authClient.emailOtp.sendVerificationOtp({
              email: values.email,
              type: 'email-verification',
            }).then(() => setResendCooldown(60));
          } else {
            setError(err?.message ?? 'Sign up failed');
          }
        },
      }
    );
  };

  const handleVerifyEmail = async (values: z.infer<typeof verifyEmailSchema>) => {
    await authClient.emailOtp.verifyEmail(
      {
        email: userEmail,
        otp: values.otp,
      },
      {
        onRequest: () => {
          setIsLoading(true);
          setError(null);
        },
        onSuccess: async () => {
          setIsLoading(false);
          verifyEmailForm.reset();
          setVerifyInfoMessage(null);
          setSuccessMessage('Email verified successfully! Signing you in...');
          await refetchSession();
          setTimeout(() => {
            setSuccessMessage('');
            onOpenChange(false);
          }, 1200);
        },
        onError: ctx => {
          setIsLoading(false);
          setError(ctx.error?.message || 'Invalid code');
        },
      }
    );
  };

  const handleResendOtp = async () => {
    if (!userEmail || resendCooldown > 0 || resendLoading) return;
    setResendLoading(true);
    setError(null);
    const { error: resendError } = await authClient.emailOtp.sendVerificationOtp({
      email: userEmail,
      type: 'email-verification',
    });
    setResendLoading(false);
    if (resendError) {
      setError(resendError.message ?? 'Failed to resend code');
      return;
    }
    setResendCooldown(60);
  };

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  // The dialog is never unmounted between openings, so without this it reopens
  // on whichever tab was last used — and on the OTP view if that is where the
  // shopper abandoned it.
  useEffect(() => {
    if (!open) return;
    setActiveTab(defaultTab);
    setView('auth');
    setError(null);
  }, [open, defaultTab]);

  const handleForgotPassword = async (values: z.infer<typeof forgotPasswordSchema>) => {
    await authClient.forgetPassword.emailOtp(
      {
        email: values.email,
      },
      {
        onRequest: () => {
          setIsLoading(true);
          setError(null);
        },
        onSuccess: () => {
          setIsLoading(false);
          forgotPasswordForm.reset();
          setUserEmail(values.email);
          setView('reset');
        },
        onError: ctx => {
          setIsLoading(false);
          setError(ctx.error.message);
        },
      }
    );
  };

  const handleResetPassword = async (values: z.infer<typeof resetPasswordSchema>) => {
    await authClient.emailOtp.resetPassword(
      {
        email: userEmail,
        otp: values.otp,
        password: values.newPassword,
      },
      {
        onRequest: () => {
          setIsLoading(true);
          setError(null);
        },
        onSuccess: () => {
          setIsLoading(false);
          resetPasswordForm.reset();
          setSuccessMessage('Password reset successfully!');
          setTimeout(() => {
            setView('auth');
            setActiveTab('signin');
            setSuccessMessage('');
          }, 2000);
        },
        onError: ctx => {
          setIsLoading(false);
          setError(ctx.error?.message || 'Failed to reset password');
        },
      }
    );
  };

  const handleBackToAuth = () => {
    setView('auth');
    setError(null);
    setSuccessMessage('');
    setVerifyInfoMessage(null);
    verifyEmailForm.reset();
    forgotPasswordForm.reset();
    resetPasswordForm.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 gap-0 overflow-hidden !z-[10000]">
        <DialogHeader className="sr-only">
          <DialogTitle>Authentication</DialogTitle>
          <DialogDescription>Sign in to your account or create a new one</DialogDescription>
        </DialogHeader>
        <style jsx global>{`
          [data-radix-dialog-overlay][data-slot="dialog-overlay"] {
            z-index: 10000 !important;
          }
        `}</style>

        {view === 'auth' && (
          <Tabs
            value={activeTab}
            onValueChange={(value) => {
              setActiveTab(value as 'signin' | 'signup');
              setError(null);
              signInForm.reset();
              signUpForm.reset();
              setShowPassword(false);
            }}
            className="w-full"
          >
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 px-6 pt-6 pb-4">
              <h2 className="text-2xl font-bold tracking-tight mb-2">
                {activeTab === 'signin' ? 'Welcome back' : 'Create account'}
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                {message ??
                  (activeTab === 'signin'
                    ? 'Sign in to access your account and continue shopping'
                    : 'Join us today and start your shopping journey')}
              </p>
              {/* Sign Up leads: most people reaching this dialog do not have
                  an account yet, so creating one is the first thing offered. */}
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signup" className="text-sm">Sign Up</TabsTrigger>
                <TabsTrigger value="signin" className="text-sm">Sign In</TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6 max-h-[calc(100vh-200px)] sm:max-h-[500px] overflow-y-auto">
            <TabsContent value="signin" className="mt-0 space-y-4">
              {/* Google sign-in hidden for now — re-enable by uncommenting.
              <SocialAccount />
              <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                <span className="relative z-10 bg-background px-2 text-muted-foreground">
                  Or continue with email
                </span>
              </div>
              */}

              {error && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md flex items-start gap-2">
                  <span className="font-medium">Error:</span> {error}
                </div>
              )}

              <Form {...signInForm}>
                <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4">
                  <FormField
                    control={signInForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="email"
                              placeholder="your.email@example.com"
                              className="pl-9"
                              disabled={isLoading}
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={signInForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              type={showPassword ? 'text' : 'password'}
                              placeholder="Enter your password"
                              className="pl-9 pr-9"
                              disabled={isLoading}
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                              disabled={isLoading}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center justify-end">
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      className="px-0 text-sm text-primary hover:text-primary/80"
                      onClick={() => setView('forgot')}
                    >
                      Forgot password?
                    </Button>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                    size="lg"
                  >
                    {isLoading ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="signup" className="mt-0 space-y-4">
              {/* Google sign-in hidden for now — re-enable by uncommenting.
              <SocialAccount />
              <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                <span className="relative z-10 bg-background px-2 text-muted-foreground">
                  Or continue with email
                </span>
              </div>
              */}

              {error && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md flex items-start gap-2">
                  <span className="font-medium">Error:</span> {error}
                </div>
              )}

              <Form {...signUpForm}>
                <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
                  <FormField
                    control={signUpForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Full Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="John Doe"
                              className="pl-9"
                              disabled={isLoading}
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={signUpForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="email"
                              placeholder="your.email@example.com"
                              className="pl-9"
                              disabled={isLoading}
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormDescription className="text-xs">
                          We&apos;ll send you a verification code
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={signUpForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              type={showPassword ? 'text' : 'password'}
                              placeholder="Create a strong password"
                              className="pl-9 pr-9"
                              disabled={isLoading}
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                              disabled={isLoading}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormDescription className="text-xs">
                          Must be at least 8 characters
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                    size="lg"
                  >
                    {isLoading ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                        Creating account...
                      </>
                    ) : (
                      <>
                        Create Account
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    By creating an account, you agree to our{' '}
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-xs text-primary hover:text-primary/80"
                      onClick={() => {
                        onOpenChange(false);
                        router.push('/terms');
                      }}
                    >
                      Terms of Service
                    </Button>
                  </p>
                </form>
              </Form>
            </TabsContent>
          </div>
        </Tabs>
        )}

        {view === 'verify' && (
          <div className="w-full">
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 px-6 pt-6 pb-4">
              <Button
                variant="ghost"
                size="sm"
                className="mb-2"
                onClick={handleBackToAuth}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <h2 className="text-2xl font-bold tracking-tight mb-2">Verify Your Email</h2>
              <p className="text-sm text-muted-foreground">
                Enter the 6-digit code sent to <strong>{userEmail}</strong>
              </p>
            </div>

            <div className="p-6">
              {successMessage ? (
                <div className="text-center space-y-4">
                  <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-green-600 font-medium">{successMessage}</p>
                </div>
              ) : (
                <>
                  {verifyInfoMessage && (
                    <div className="mb-4 p-3 text-sm text-muted-foreground bg-muted/50 border border-border rounded-md">
                      {verifyInfoMessage}
                    </div>
                  )}
                  {error && (
                    <div className="mb-4 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                      {error}
                    </div>
                  )}

                  <Form {...verifyEmailForm}>
                    <form onSubmit={verifyEmailForm.handleSubmit(handleVerifyEmail)} className="space-y-6">
                      <FormField
                        control={verifyEmailForm.control}
                        name="otp"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center justify-between">
                              <FormLabel>Verification Code</FormLabel>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs"
                                disabled={resendLoading || resendCooldown > 0}
                                onClick={handleResendOtp}
                              >
                                {resendLoading ? (
                                  'Sending...'
                                ) : resendCooldown > 0 ? (
                                  `Resend in ${resendCooldown}s`
                                ) : (
                                  'Resend OTP'
                                )}
                              </Button>
                            </div>
                            <FormControl>
                              <InputOTP
                                maxLength={6}
                                pattern={REGEXP_ONLY_DIGITS}
                                value={field.value ?? ''}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                ref={field.ref}
                                pushPasswordManagerStrategy="none"
                                pasteTransformer={otpPasteTransformer}
                              >
                                <InputOTPGroup>
                                  <InputOTPSlot index={0} />
                                  <InputOTPSlot index={1} />
                                  <InputOTPSlot index={2} />
                                  <InputOTPSlot index={3} />
                                  <InputOTPSlot index={4} />
                                  <InputOTPSlot index={5} />
                                </InputOTPGroup>
                              </InputOTP>
                            </FormControl>
                            <FormDescription>
                              Check your email for the verification code
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button type="submit" className="w-full" disabled={isLoading} size="lg">
                        {isLoading ? (
                          <>
                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                            Verifying...
                          </>
                        ) : (
                          <>
                            Verify Email
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </>
              )}
            </div>
          </div>
        )}

        {view === 'forgot' && (
          <div className="w-full">
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 px-6 pt-6 pb-4">
              <Button
                variant="ghost"
                size="sm"
                className="mb-2"
                onClick={handleBackToAuth}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <h2 className="text-2xl font-bold tracking-tight mb-2">Forgot Password?</h2>
              <p className="text-sm text-muted-foreground">
                Enter your email to receive a password reset code
              </p>
            </div>

            <div className="p-6">
              {error && (
                <div className="mb-4 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                  {error}
                </div>
              )}

              <Form {...forgotPasswordForm}>
                <form onSubmit={forgotPasswordForm.handleSubmit(handleForgotPassword)} className="space-y-4">
                  <FormField
                    control={forgotPasswordForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="email"
                              placeholder="your.email@example.com"
                              className="pl-9"
                              disabled={isLoading}
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={isLoading} size="lg">
                    {isLoading ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                        Sending code...
                      </>
                    ) : (
                      <>
                        Send Reset Code
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        )}

        {view === 'reset' && (
          <div className="w-full">
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 px-6 pt-6 pb-4">
              <Button
                variant="ghost"
                size="sm"
                className="mb-2"
                onClick={handleBackToAuth}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <h2 className="text-2xl font-bold tracking-tight mb-2">Reset Password</h2>
              <p className="text-sm text-muted-foreground">
                Enter the code sent to <strong>{userEmail}</strong> and your new password
              </p>
            </div>

            <div className="p-6">
              {successMessage ? (
                <div className="text-center space-y-4">
                  <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-green-600 font-medium">{successMessage}</p>
                </div>
              ) : (
                <>
                  {error && (
                    <div className="mb-4 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                      {error}
                    </div>
                  )}

                  <Form {...resetPasswordForm}>
                    <form onSubmit={resetPasswordForm.handleSubmit(handleResetPassword)} className="space-y-4">
                      <FormField
                        control={resetPasswordForm.control}
                        name="otp"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Reset Code</FormLabel>
                            <FormControl>
                              <InputOTP
                                maxLength={6}
                                pattern={REGEXP_ONLY_DIGITS}
                                value={field.value ?? ''}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                ref={field.ref}
                                pushPasswordManagerStrategy="none"
                                pasteTransformer={otpPasteTransformer}
                              >
                                <InputOTPGroup>
                                  <InputOTPSlot index={0} />
                                  <InputOTPSlot index={1} />
                                  <InputOTPSlot index={2} />
                                  <InputOTPSlot index={3} />
                                  <InputOTPSlot index={4} />
                                  <InputOTPSlot index={5} />
                                </InputOTPGroup>
                              </InputOTP>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={resetPasswordForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                  type={showPassword ? 'text' : 'password'}
                                  placeholder="Enter new password"
                                  className="pl-9 pr-9"
                                  disabled={isLoading}
                                  {...field}
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                                  disabled={isLoading}
                                >
                                  {showPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </button>
                              </div>
                            </FormControl>
                            <FormDescription>Must be at least 8 characters</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button type="submit" className="w-full" disabled={isLoading} size="lg">
                        {isLoading ? (
                          <>
                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                            Resetting...
                          </>
                        ) : (
                          <>
                            Reset Password
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

