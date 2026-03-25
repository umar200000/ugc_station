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
