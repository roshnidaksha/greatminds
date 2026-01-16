import { useState, useEffect } from 'react';
import { db } from '../firebase/firebaseConfig';
import { collection, onSnapshot, query } from "firebase/firestore";

export const useEvents = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, "events"));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const eventsArray = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                eventsArray.push({
                    id: doc.id,
                    ...data,
                    start: data.start?.toDate(), 
                    end: data.end?.toDate()
                });
            });
            setEvents(eventsArray);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return { events, loading };
};