import { SignUp } from '@clerk/nextjs';
import Link from 'next/link';

export default function SignUpPage() {
  return (
    <main className="flex min-h-[calc(100dvh-4rem)] items-center justify-center px-4 py-6">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Create Account</h1>
        </div>
        <SignUp
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
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
          Already have an account?{' '}
          <Link className="font-medium text-primary hover:text-primary/90" href={'/sign-in'}>
            Sign In
          </Link>
        </p>
      </div>
    </main>
  );
}
