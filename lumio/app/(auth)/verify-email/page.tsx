import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function VerifyEmailPage(
  props: {
    searchParams: Promise<{ email?: string }>;
  }
) {
  const searchParams = await props.searchParams;
  const email = searchParams.email ?? 'your email';

  return (
    <div className="rounded-xl border bg-card p-8 shadow-sm text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-2xl">
        ✉️
      </div>
      <h1 className="mt-4 text-2xl font-semibold">Verify your email</h1>
      <p className="mt-2 text-muted-foreground">
        We sent a verification link to <strong>{email}</strong>.
        Click the link to activate your account.
      </p>
      <p className="mt-4 text-sm text-muted-foreground">
        Didn&apos;t receive it? Check your spam folder.
      </p>
      <Link href="/login" className="mt-6 block">
        <Button variant="outline" className="w-full">
          Back to sign in
        </Button>
      </Link>
    </div>
  );
}
