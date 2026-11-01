import { detectFileType, isAllowedDeclaredType } from '../src/utils/fileType.js';
import { parseLegacyFileUrl } from '../src/utils/legacyFileUrl.js';
import { getSignedUrl, SIGNED_URL_TTL_SECONDS } from '../src/services/fileStorage.js';

describe('detectFileType', () => {
  test.each([
    ['pdf', Buffer.from('%PDF-1.4 ...'), 'application/pdf'],
    ['jpg', Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0]), 'image/jpeg'],
    ['png', Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0]), 'image/png'],
    ['webp', Buffer.from('RIFF\x00\x00\x00\x00WEBPVP8 ', 'latin1'), 'image/webp'],
  ])('recognises %s', (format, buffer, mimeType) => {
    expect(detectFileType(buffer)).toEqual({ format, mimeType });
  });

  test.each([
    ['empty', Buffer.alloc(0)],
    ['html', Buffer.from('<!doctype html>')],
    ['svg', Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>')],
    ['zip/docx', Buffer.from([0x50, 0x4b, 0x03, 0x04])],
    ['RIFF but not WEBP (wav)', Buffer.from('RIFF\x00\x00\x00\x00WAVEfmt ', 'latin1')],
  ])('rejects %s', (_, buffer) => {
    expect(detectFileType(buffer)).toBeNull();
  });
});

describe('isAllowedDeclaredType', () => {
  test('requires both an allowed extension and matching MIME type', () => {
    expect(isAllowedDeclaredType('scan.JPEG', 'image/jpeg')).toBe(true);
    expect(isAllowedDeclaredType('scan.jpg', 'application/pdf')).toBe(false);
    expect(isAllowedDeclaredType('report.doc', 'application/msword')).toBe(false);
    expect(isAllowedDeclaredType('noextension', 'application/pdf')).toBe(false);
  });
});

describe('parseLegacyFileUrl', () => {
  test('parses an image/pdf upload URL', () => {
    expect(
      parseLegacyFileUrl('https://res.cloudinary.com/demo/image/upload/v1712345678/meditrack_reports/ab12cd.pdf')
    ).toEqual({
      publicId: 'meditrack_reports/ab12cd',
      resourceType: 'image',
      deliveryType: 'upload',
      format: 'pdf',
      mimeType: 'application/pdf',
    });
  });

  test('keeps the extension in raw public ids', () => {
    expect(parseLegacyFileUrl('https://res.cloudinary.com/demo/raw/upload/v1/meditrack_reports/x.doc').publicId).toBe(
      'meditrack_reports/x.doc'
    );
  });

  test.each([undefined, '', 'https://evil.example/file.pdf', 'https://res.cloudinary.com/demo/image/authenticated/x.pdf'])(
    'returns null for %s',
    (url) => {
      expect(parseLegacyFileUrl(url)).toBeNull();
    }
  );
});

describe('getSignedUrl (real Cloudinary SDK, no network)', () => {
  test('produces a signed download URL that expires in 5 minutes', () => {
    const before = Math.floor(Date.now() / 1000);
    const { url, expiresAt } = getSignedUrl({
      publicId: 'meditrack_reports/abc',
      resourceType: 'image',
      deliveryType: 'authenticated',
      format: 'pdf',
    });

    const parsed = new URL(url);
    expect(parsed.origin).toBe('https://api.cloudinary.com');
    expect(parsed.pathname).toBe('/v1_1/test-cloud/image/download');
    expect(parsed.searchParams.get('type')).toBe('authenticated');
    expect(parsed.searchParams.get('public_id')).toBe('meditrack_reports/abc');
    expect(parsed.searchParams.get('signature')).toMatch(/^[a-f0-9]{40}$/);
    expect(parsed.searchParams.get('api_secret')).toBeNull();

    const expires = Number(parsed.searchParams.get('expires_at'));
    expect(expires - before).toBeGreaterThanOrEqual(SIGNED_URL_TTL_SECONDS);
    expect(expires - before).toBeLessThanOrEqual(SIGNED_URL_TTL_SECONDS + 2);
    expect(expiresAt.getTime()).toBe(expires * 1000);
  });
});
