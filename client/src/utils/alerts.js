// Simple alert utility to standardize toast behavior across components
// Usage: showAlert(setAlert, "Message", "success", 3000)
export const showAlert = (setAlert, message, type = 'info', duration = 3000) => {
    setAlert({ message, type });
    if (duration > 0) {
        setTimeout(() => setAlert(null), duration);
    }
};
