import { useState, useEffect } from 'react';

import { db } from '../firebase/firebaseConfig';
import { collection, onSnapshot, query, where, doc, getDoc } from "firebase/firestore";

/**
 * Custom hook to fech event registrations for a given participant or volunteer.
 * 
 * @param {string} userId - The ID of the user to fetch registrations for.
 * @returns {object} - An object containing registrations and a setter function.
 */
export function useRegistrationsByUser(userId) {
    const [registrations, setRegistrations] = useState([]);
    useEffect(() => {
        if (!userId) return;
        const regQuery = query(
            collection(db, "registrations"), 
            where("userId", "==", userId)
        );
        const unsubscribe = onSnapshot(regQuery, (snapshot) => {
            const regs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setRegistrations(regs);
        });
        return () => unsubscribe();
    }, [userId]);
    return { registrations, setRegistrations };
}

/**
 * Custom hook to fetch and manage event registrations (participants and volunteers) for a given event ID.
 * 
 * @param {string} eventId - The ID of the event to fetch registrations for.
 * @returns {object} - An object containing participants, volunteers, and their respective setters.
 */
export function useEventRegistrations(eventId) {
    const [participants, setParticipants] = useState([]);
    const [volunteers, setVolunteers] = useState([]);

    useEffect(() => {
        if (!eventId) return;

        const regQuery = query(
            collection(db, "registrations"), 
            where("eventId", "==", eventId)
        );

        const unsubscribe = onSnapshot(regQuery, async (snapshot) => {
            const participantList = [];
            const volunteerList = [];

            const promises = snapshot.docs.map(async (regDoc) => {
                const regData = regDoc.data();
                
                const userRef = doc(db, "users", regData.userId);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    const userData = userSnap.data();
                    const combinedData = { 
                        id: regDoc.id,
                        ...userData,
                        ...regData
                    };

                    if (userData.role === 'participant') {
                        participantList.push(combinedData);
                    } else if (userData.role === 'volunteer') {
                        volunteerList.push(combinedData);
                    }
                }
            });

            await Promise.all(promises);

            setParticipants(participantList);
            setVolunteers(volunteerList);
        });

        return () => unsubscribe();
    }, [eventId]);

    return { participants, setParticipants, volunteers, setVolunteers };
}
