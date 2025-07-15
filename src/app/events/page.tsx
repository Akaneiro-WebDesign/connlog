'use client';

import { mockEvents } from '@/lib/mockEvents';
import EventCard from '../components/EventCard';

export default function EventsPage() {
    return (
        <main className="max-w-4xl mx-auto mt-12 p-4">
            <h1 className="text-2xl font-bold mb-6">イベント一覧</h1>
        
        <div className="grid gap-4 sm:grid-cols-2">
            {mockEvents.map((event) => (
                <EventCard key={event.event_id} event={event}/>
            ))}
        </div>
        </main>
    );
}