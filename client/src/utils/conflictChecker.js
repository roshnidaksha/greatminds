import { db } from '../firebase/firebaseConfig';
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";

const isOverlapping = (eventA, eventB) => {
    const startA = new Date(eventA.start).getTime();
    const endA = new Date(eventA.end).getTime();
    const startB = new Date(eventB.start).getTime();
    const endB = new Date(eventB.end).getTime();

    return startA < endB && endA > startB;
};

const getWeekNumber = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    return Math.ceil((((d - new Date(d.getFullYear(), 0, 1)) / 8.64e7) + 1) / 7);
};

/**
 * Validates a selection against local and global schedules
 * @param {Object} newEvent - The event being selected
 * @param {Array} basket - The current local basket/selection list
 * @param {string} userId - The current user's UID
 * @returns {Promise<{isValid: boolean, message: string}>}
 */
export const validateEventSelection = async (newEvent, basket, userId) => {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (!userDoc.exists()) return { isValid: false, message: "User profile not found." };
    
    const userData = userDoc.data();

    if (userData.role === 'participant') {
        const membership = userData.membership;
        const limit = membership.startsWith('weekly_') ? parseInt(membership.split('_')[1]) : Infinity;
        const targetWeek = getWeekNumber(newEvent.start);

        if (newEvent.isSeries && newEvent.minDaysRequired > limit) {
            return {
                isValid: false,
                message: `Membership Error: This program requires ${newEvent.minDaysRequired} days, but your plan only allows ${limit} activities per week.`
            };
        }

        let weeklyCount = 0;
        basket.forEach(item => {
            if (getWeekNumber(item.start) === targetWeek) weeklyCount++;
        });

        const regQuery = query(collection(db, "registrations"), where("userId", "==", userId));
        const regSnap = await getDocs(regQuery);
        const registeredEventIds = regSnap.docs.map(d => d.data().eventId);

        if (registeredEventIds.length > 0) {
            const eventsQuery = query(collection(db, "events"));
            const eventSnap = await getDocs(eventsQuery);
            
            eventSnap.docs.forEach(d => {
                if (registeredEventIds.includes(d.id)) {
                    const eventDate = d.data().start.toDate();
                    if (getWeekNumber(eventDate) === targetWeek) weeklyCount++;
                }
            });
        }

        if (weeklyCount >= limit) {
            return {
                isValid: false,
                message: `Limit Reached: Your "${membership}" plan only allows ${limit} activities per week. You already have ${weeklyCount} scheduled.`
            };
        }
    }

    for (const basketItem of basket) {
        if (isOverlapping(newEvent, basketItem)) {
            return {
                isValid: false,
                message: `Schedule Conflict: This overlaps with "${basketItem.title}" already in your selection.`
            };
        }
    }

    try {
        const regQuery = query(
            collection(db, "registrations"), 
            where("userId", "==", userId)
        );
        const regSnapshot = await getDocs(regQuery);
        
        const registeredEventIds = regSnapshot.docs.map(doc => doc.data().eventId);

        if (registeredEventIds.length > 0) {
            const eventsQuery = query(collection(db, "events")); 
            const eventSnapshot = await getDocs(eventsQuery);

            for (const doc of eventSnapshot.docs) {
                if (registeredEventIds.includes(doc.id)) {
                    const existingEvent = {
                        ...doc.data(),
                        start: doc.data().start.toDate(),
                        end: doc.data().end.toDate()
                    };

                    if (isOverlapping(newEvent, existingEvent)) {
                        return {
                            isValid: false,
                            message: `Schedule Conflict: You are already registered for "${existingEvent.title}" at the same time.`
                        };
                    }
                }
            }
        }
    } catch (error) {
        console.error("Global conflict check error:", error);
    }

    return { isValid: true, message: "Success" };
};