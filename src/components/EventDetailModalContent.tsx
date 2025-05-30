import React from 'react';

type EventData = {
    title: string;
    started_at: string;
    place: string | null;
    description: string;
    owner_display_name: string;
};

type Props = {
    event: EventData;
};

const EventDetailModalContent = ({ event }: Props) => {
    return (
        <div className="space-y-4">
        <div className="text-sm text-gray-600">
            {event.started_at} / {event.owner_display_name}
        </div>
        <h2 className="text-xl font-bold">{event.title}</h2>
        <p className="text-gray-700">{event.place || 'オンラインまたは未定'}</p>
        <p className="text-sm text-gray-600 whitespace-pre-line">{event.description}</p>
        </div>
    );
};

export default EventDetailModalContent;