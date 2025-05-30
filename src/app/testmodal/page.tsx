'use client';

import { useState } from 'react';
import Modal from '@/components/Modal';
import EventDetailModalContent from '@/components/EventDetailModalContent';

export default function TestModalPage(){
    const [isOpen, setIsOpen] = useState(true);

    const mockEvent = {
        title: 'React勉強会 #42',
        started_at: '2025年5月7日（水）19:00〜21:00',
        place: null,
        description: 'Reactの勉強会です。初心者大歓迎ですので、是非お気軽にご参加ください！',
        owner_display_name: 'React勉強会',
};

return (
    <main className="p-8">
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
         <EventDetailModalContent event={mockEvent} />
        </Modal>
    </main>
);
}