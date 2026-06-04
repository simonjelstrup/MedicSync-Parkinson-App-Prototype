import { Platform } from 'react-native';
import NfcManager, { NfcTech, NfcEvents } from 'react-native-nfc-manager';

let initialized = false;

async function ensureStarted(): Promise<boolean> {
  if (initialized) return true;
  try {
    await NfcManager.start();
    initialized = true;
    return true;
  } catch {
    return false;
  }
}

export async function isNfcSupported(): Promise<boolean> {
  try {
    return await NfcManager.isSupported();
  } catch {
    return false;
  }
}

// Start an NFC scan session. Resolves true when a tag is read, false if cancelled/error.
// On iOS: shows the system NFC sheet. Stays open until tag is read or cancelled.
export async function scanForTag(alertMessage: string): Promise<boolean> {
  const ready = await ensureStarted();
  if (!ready) return false;

  try {
    if (Platform.OS === 'ios') {
      await NfcManager.requestTechnology(
        [NfcTech.Ndef, NfcTech.NfcA, NfcTech.NfcB, NfcTech.NfcV, NfcTech.IsoDep],
        { alertMessage }
      );
      await NfcManager.cancelTechnologyRequest().catch(() => {});
      return true;
    } else {
      return await new Promise<boolean>((resolve) => {
        NfcManager.setEventListener(NfcEvents.DiscoverTag, () => {
          NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
          NfcManager.unregisterTagEvent().catch(() => {});
          resolve(true);
        });
        NfcManager.registerTagEvent().catch(() => resolve(false));
      });
    }
  } catch {
    return false;
  }
}

export async function cancelScan(): Promise<void> {
  try {
    if (Platform.OS === 'ios') {
      await NfcManager.cancelTechnologyRequest();
    } else {
      NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
      await NfcManager.unregisterTagEvent();
    }
  } catch {}
}
