/**
 * Purchase layer for Tip or Skip Pro.
 *
 * TEST MODE: purchases are not connected yet. buyPro() and restorePro() succeed locally so the
 * Pro features can be tested in Expo Go. To go live, replace these two functions with RevenueCat
 * (react-native-purchases) calls and set TEST_MODE to false. RevenueCat needs a development build
 * or APK; it does not run inside Expo Go.
 */

export const TEST_MODE = true;
export const PRO_PRICE = '$4.99';
/** Product ID in App Store Connect (non-consumable, Family Sharing on). */
export const PRO_PRODUCT_ID = 'tiporskip.pro';
export const PRO_ENTITLEMENT = 'pro';

export async function buyPro(): Promise<boolean> {
  return true;
}

export async function restorePro(): Promise<boolean> {
  return true;
}
