import { describe, expect, it } from 'vitest';
import { safeLink } from '@/lib/utils';

describe('safeLink', () => {
  it('keeps page, web, mail, phone and WhatsApp links', () => {
    for (const h of ['/training', 'courses/ai-agent.html', '#events', 'https://techguardians.in', 'http://x.y', 'mailto:a@b.c', 'tel:1930', 'whatsapp://send?text=hi', 'upi://pay?pa=x'])
      expect(safeLink(h)).toBe(h);
  });
  it('blocks script and data links, including disguised ones', () => {
    for (const h of ['javascript:alert(1)', 'JaVaScRiPt:alert(1)', ' javascript:alert(1)', 'java\tscript:alert(1)', 'data:text/html,<b>x', 'vbscript:x', 'file:///etc/passwd'])
      expect(safeLink(h)).toBe('#');
  });
  it('turns backslashes into slashes so they cannot hide another site', () => {
    expect(safeLink('/\\evil.com')).toBe('//evil.com');
  });
  it('uses the fallback for empty links', () => {
    expect(safeLink('')).toBe('#');
  });
});
