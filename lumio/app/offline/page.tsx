'use client';

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center text-center">
      <div className="text-4xl">📡</div>
      <h1 className="mt-4 text-2xl font-bold">You are offline</h1>
      <p className="mt-2 text-muted-foreground">
        Check your internet connection. Previously loaded tasks are still available.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="mt-6 rounded-md bg-brand-500 px-4 py-2 text-sm text-white hover:bg-brand-600"
      >
        Try again
      </button>
    </div>
  );
}
