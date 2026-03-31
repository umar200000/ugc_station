// Telegram WebApp SDK
const tg = (window as any).Telegram?.WebApp;

export function getTelegram() {
  return tg;
}

export function getInitData(): string {
  return tg?.initData || '';
}

export function getTelegramUser() {
  return tg?.initDataUnsafe?.user || null;
}

export function expandApp() {
  tg?.expand();
}

export function hapticFeedback(type: 'light' | 'medium' | 'heavy' = 'light') {
  tg?.HapticFeedback?.impactOccurred(type);
}

export function showAlert(message: string) {
  tg?.showAlert(message);
}

export function close() {
  tg?.close();
}

export function setBackButton(visible: boolean, callback?: () => void) {
  if (!tg?.BackButton) return;
  if (visible) {
    tg.BackButton.show();
    if (callback) tg.BackButton.onClick(callback);
  } else {
    tg.BackButton.hide();
  }
}

// Telegram WebApp requestContact — foydalanuvchidan telefon raqam so'rash
export function requestContact(): Promise<string | null> {
  return new Promise((resolve) => {
    if (!tg?.requestContact) {
      resolve(null);
      return;
    }
    tg.requestContact((sent: boolean, event?: any) => {
      if (sent && event?.responseUnsafe?.contact?.phone_number) {
        const phone = event.responseUnsafe.contact.phone_number;
        resolve(phone.startsWith('+') ? phone : `+${phone}`);
      } else {
        resolve(null);
      }
    });
  });
}
