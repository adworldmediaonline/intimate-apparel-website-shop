/**
 * Root loading UI - shows instantly when navigating to homepage for snappy feel.
 */
export default function Loading() {
  return (
    <div className="min-h-[50vh] animate-pulse">
      <div className="h-[400px] md:h-[500px] w-full bg-muted/30" />
      <div className="container mx-auto px-4 py-8">
        <div className="h-8 w-48 bg-muted/30 rounded mb-6" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-lg bg-muted/30" />
          ))}
        </div>
      </div>
    </div>
  );
}
