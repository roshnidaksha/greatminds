import { useState, useEffect } from 'react';
import { db } from '../firebase/firebaseConfig';
import { collection, onSnapshot, query, where } from "firebase/firestore";

export const useEvents = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let latestEventsData = [];
        let latestRegsData = [];

        const updateCombinedState = () => {
            if (latestEventsData.length === 0) return;

            const processedEvents = latestEventsData.map(event => {
                const count = latestRegsData.filter(reg => reg.eventId === event.id).length;

                return {
                    ...event,
                    extendedProps: {
                        ...event.extendedProps,
                        volunteerInfo: {
                            ...event.extendedProps?.volunteerInfo,
                            nVolunteersRegistered: count
                        }
                    }
                };
            });
            setEvents(processedEvents);
            setLoading(false);
        };

        const qEvents = query(collection(db, "events"));
        const unsubEvents = onSnapshot(qEvents, (snapshot) => {
            latestEventsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                start: doc.data().start?.toDate(),
                end: doc.data().end?.toDate()
            }));
            updateCombinedState();
        });

        const qRegs = query(
            collection(db, "registrations"),
            where("roleAtRegistration", "==", "volunteer")
        );
        const unsubRegs = onSnapshot(qRegs, (snapshot) => {
            latestRegsData = snapshot.docs.map(doc => doc.data());
            updateCombinedState();
        });

        return () => {
            unsubEvents();
            unsubRegs();
        };
    }, []);

    return { events, loading };
};