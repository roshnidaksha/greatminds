// Simple alert utility to standardize toast behavior across components
// Usage: showAlert(setAlert, "Message", "success", 3000)
export const showAlert = (setAlert, message, type = 'info', duration = 3000) => {
    setAlert({ message, type });
    if (duration > 0) {
        setTimeout(() => setAlert(null), duration);
    }
};

// Utility to flatten FullCalendar event objects for easier handling
export const flattenEvent = (event) => {
    if (!event) return null;
    return {
        ...event.extendedProps || {},
        id: event.id,
        title: event.title,
        start: event.start ? new Date(event.start) : null,
        end: event.end ? new Date(event.end) : null,
    };
};
