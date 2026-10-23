/**
 * Purchase layer for Tip or Skip Pro.
 *
 * iPhone: real purchases through RevenueCat (react-native-purchases). Pro is the `pro` entitlement,
 * which the one-time `tiporskip.pro` product unlocks. TestFlight builds use Apple's sandbox, so
 * test purchases there are free.
 *
 * Android: test mode until the app is on Google Play and RevenueCat has a Google key. buyPro() and
 * restorePro() then succeed locally so the Pro features can be tested in the sideloaded APK.
 */
import { Platform } from 'react-native';
import Purchases, { type CustomerInfo, type PurchasesPackage } from 'react-native-purchases';

/** RevenueCat public SDK key for the App Store app. Public by design: it ships inside the app. */
const IOS_API_KEY = 'appl_HOcmeqsHfulZxWdgbyjoSImFyzL';

export const TEST_MODE = Platform.OS !== 'ios';
export const PRO_PRICE = '$4.99';
export const PRO_ENTITLEMENT = 'pro';
/** Product ID in App Store Connect (non-consumable, Family Sharing on). */
export const PRO_PRODUCT_ID = 'tiporskip.pro';

let started = false;

const hasPro = (info: CustomerInfo) => info.entitlements.active[PRO_ENTITLEMENT] !== undefined;

/**
 * Connects to RevenueCat once at launch and reports whether this Apple ID owns Pro, now and whenever
 * it changes (a purchase, a restore, a refund, or a family member's purchase through Family Sharing).
 * Returns false when nothing is known (test mode or offline), so the caller keeps its saved value.
 */
export function startPurchases(onPro: (pro: boolean) => void): boolean {
  if (TEST_MODE || started) return false;
  try {
    Purchases.configure({ apiKey: IOS_API_KEY });
    started = true;
    Purchases.addCustomerInfoUpdateListener((info) => onPro(hasPro(info)));
    Purchases.getCustomerInfo().then((info) => onPro(hasPro(info))).catch(() => {});
    return true;
  } catch {
    return false;
  }
}

async function proPackage(): Promise<PurchasesPackage | null> {
  const offerings = await Purchases.getOfferings();
  const pkgs = offerings.current?.availablePackages ?? [];
  return pkgs.find((p) => p.product.identifier === PRO_PRODUCT_ID) ?? pkgs[0] ?? null;
}

/** The App Store price for this person's storefront, e.g. "$4.99". Falls back to PRO_PRICE. */
export async function proPrice(): Promise<string> {
  if (TEST_MODE || !started) return PRO_PRICE;
  try {
    return (await proPackage())?.product.priceString ?? PRO_PRICE;
  } catch {
    return PRO_PRICE;
  }
}

export type PurchaseResult = { ok: true } | { ok: false; message?: string };

/** Buy Pro. A cancelled purchase is not an error: it returns ok false with no message. */
export async function buyPro(): Promise<PurchaseResult> {
  if (TEST_MODE) return { ok: true };
  try {
    const pkg = await proPackage();
    if (!pkg) return { ok: false, message: "Pro isn't available right now. Try again later." };
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return hasPro(customerInfo) ? { ok: true } : { ok: false, message: "The purchase didn't finish. You weren't charged for Pro." };
  } catch (e) {
    if ((e as { userCancelled?: boolean | null })?.userCancelled) return { ok: false };
    return { ok: false, message: "Couldn't reach the App Store. Check your connection and try again." };
  }
}

/** Restore Pro bought earlier with this Apple ID, or shared through Family Sharing. */
export async function restorePro(): Promise<PurchaseResult> {
  if (TEST_MODE) return { ok: true };
  try {
    const info = await Purchases.restorePurchases();
    return hasPro(info) ? { ok: true } : { ok: false, message: 'No Pro purchase was found for this Apple ID.' };
  } catch {
    return { ok: false, message: "Couldn't reach the App Store. Check your connection and try again." };
  }
}
