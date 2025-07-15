import React from 'react';
import { NoteInput } from '@/components/NoteInput';

type EventData = {
    id: number;
    title: string;
    started_at: string;
    place: string | null;
    description: string;
    owner_display_name: string;
};

type Props = {
    event: EventData;
    userId: string;
};

const EventDetailModalContent = ({ event, userId }: Props) => {
    return (
        <div className="space-y-4">
        <div className="text-sm text-gray-600">
            {event.started_at} / {event.owner_display_name}
        </div>
        <h2 className="text-xl font-bold">{event.title}</h2>
        <p className="text-gray-700">{event.place || 'オンラインまたは未定'}</p>
        <p className="text-sm text-gray-600 whitespace-pre-line">{event.description}</p>

        <NoteInput eventId={event.id} userId={userId} />
        </div>
    );
};

export default EventDetailModalContent;