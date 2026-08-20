// Utility for Native Mobile Notifications & Haptic Vibration Feedback

// 1. Trigger Mobile Haptic Vibration
export const triggerHapticFeedback = (pattern = [100, 50, 100]) => {
  if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch (e) {
      console.log('Vibration not supported on this browser context');
    }
  }
};

// 2. Request Notification Permission
export const requestNotificationPermission = async () => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

// 3. Show Local Native Notification
export const sendNativeNotification = (title, body, url = '/') => {
  if (typeof window === 'undefined' || !('Notification' in window)) return;

  if (Notification.permission === 'granted') {
    try {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.showNotification(title, {
            body,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            vibrate: [100, 50, 100],
            data: { url },
          });
        });
      } else {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
        });
      }
    } catch (e) {
      console.warn('Could not trigger native notification:', e);
    }
  }
};
