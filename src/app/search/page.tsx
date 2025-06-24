import EventSearchForm from '@/components/EventSearchForm';

export default function SearchPage() {
  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">connpassイベント検索</h1>
      <EventSearchForm />
    </main>
  );
}