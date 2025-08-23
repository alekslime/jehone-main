import { StatusBar } from '@capacitor/status-bar';

window.addEventListener('DOMContentLoaded', async () => {
  try {
    await StatusBar.hide();
  } catch (err) {
    console.warn('Failed to hide status bar:', err);
  }
});
