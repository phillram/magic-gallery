import Header from '@/components/Header';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h1 className="text-4xl font-bold text-slate-100 mb-4">Card Not Found</h1>
        <p className="text-slate-400 mb-6">The card you're looking for doesn't exist.</p>
        <a href="/" className="text-blue-400 hover:text-blue-300">
          ← Back to Cards
        </a>
      </div>
    </div>
  );
}
