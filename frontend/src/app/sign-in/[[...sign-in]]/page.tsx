import { SignIn } from '@clerk/nextjs';
import Link from 'next/link';

export default function SignInPage() {
  return (
    <main className="flex min-h-[calc(100dvh-4rem)] items-center justify-center px-4 py-6">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome Back</h1>
        </div>
        <SignIn
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          fallbackRedirectUrl="/"
          appearance={{
            elements: {
              rootBox: 'w-full',
              card: 'w-full shadow-none border border-border/70 bg-card rounded-2xl',
              cardBox: 'w-full',
            }
          }}
        />
        <p className="text-center text-xs text-muted-foreground">
          New here?{' '}
          <Link className="font-medium text-primary hover:text-primary/90" href={'/sign-up'}>
            Sign Up
          </Link>
        </p>
      </div>
    </main>
  );
}
