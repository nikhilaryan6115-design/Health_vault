/**
 * Web NFC API integration with strict privacy-first architecture.
 * Only non-sensitive opaque UUIDs are written to NFC tags.
 * No drug names, medical conditions, or personal identifiers are stored on the tag.
 */

export function isWebNfcSupported(): boolean {
  return typeof window !== 'undefined' && 'NDEFReader' in window;
}

export function generateNfcTagUuid(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export interface NfcScanResult {
  success: boolean;
  tagUuid?: string;
  error?: string;
}

export async function writeNfcTagUuid(uuid: string): Promise<{ success: boolean; message: string }> {
  if (!isWebNfcSupported()) {
    return {
      success: false,
      message: 'Web NFC is not supported on this browser/device. Use the Simulated NFC Writer instead.'
    };
  }

  try {
    const ndef = new (window as any).NDEFReader();
    await ndef.write({
      records: [
        {
          recordType: 'text',
          data: `urn:healthvault:tag:${uuid}`
        }
      ]
    });
    return {
      success: true,
      message: 'Non-sensitive UUID written to NFC tag successfully.'
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Failed to write to NFC tag.'
    };
  }
}
