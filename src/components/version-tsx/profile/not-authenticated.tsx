'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowRight, Heart, Lock, Shield, User } from 'lucide-react';
import Link from 'next/link';

export default function NotAuthenticated() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto">
        {/* Main Card */}
        <Card className="border-0 shadow-2xl bg-card/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <Lock className="w-10 h-10 text-primary" />
            </div>
            <CardTitle className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Access Restricted
            </CardTitle>
            <CardDescription className="text-lg text-muted-foreground max-w-md mx-auto">
              You need to be logged in to access your profile dashboard and
              manage your account.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Benefits Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/30">
                <User className="w-8 h-8 text-primary mb-2" />
                <h3 className="font-semibold text-sm text-foreground">
                  Profile Management
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Update your details
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/30">
                <Heart className="w-8 h-8 text-primary mb-2" />
                <h3 className="font-semibold text-sm text-foreground">
                  Order Tracking
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Monitor your orders
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/30">
                <Shield className="w-8 h-8 text-primary mb-2" />
                <h3 className="font-semibold text-sm text-foreground">
                  Secure Access
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Protected account
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="flex-1 sm:flex-none">
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2"
                >
                  <User className="w-4 h-4" />
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="flex-1 sm:flex-none"
              >
                <Link
                  href="/register"
                  className="flex items-center justify-center gap-2"
                >
                  Create Account
                </Link>
              </Button>
            </div>

            {/* Alternative Actions */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-3">
                Or continue shopping without an account
              </p>
              <Button asChild variant="ghost" size="sm">
                <Link
                  href="/shop"
                  className="text-primary hover:text-primary/80"
                >
                  Browse Products
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Help Text */}
        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            Having trouble?{' '}
            <Link
              href="/contact"
              className="text-primary hover:text-primary/80 underline underline-offset-2"
            >
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
