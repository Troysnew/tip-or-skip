import { requireOptionalNativeModule } from 'expo';

export interface ReaderLine {
  text: string;
  x: number;
  y: number;
  w: number;
  h: number;
  /** Clockwise from the top-left of the text. */
  corners?: [number, number][];
}

export interface ReaderResult {
  width: number;
  height: number;
  lines: ReaderLine[];
}

interface ReceiptReaderNative {
  readText(uri: string): Promise<ReaderResult>;
}

// Optional so the app still runs where the native module isn't built in (web, Expo Go).
const Native = requireOptionalNativeModule<ReceiptReaderNative>('ReceiptReader');

/** True when this build of the app can read receipts on the device. */
export const isAvailable = Native != null;

/** Reads the text lines on a local image file (file:// URI). Runs on the device only. */
export async function readText(uri: string): Promise<ReaderResult> {
  if (!Native) throw new Error('Receipt reading needs the latest version of the app.');
  return Native.readText(uri);
}
