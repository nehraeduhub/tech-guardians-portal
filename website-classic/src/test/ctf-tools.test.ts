import { describe, expect, it } from 'vitest';
import { md5, rot13, runTool } from '@/lib/ctf';

describe('CTF analyst toolkit', () => {
  it('computes MD5 like the original toolkit', () => {
    expect(md5('')).toBe('d41d8cd98f00b204e9800998ecf8427e');
    expect(md5('abc')).toBe('900150983cd24fb0d6963f7d28e17f72');
    expect(md5('The quick brown fox jumps over the lazy dog')).toBe('9e107d9d372bb6826bd81d3542a419d6');
  });
  it('decodes Base64, ROT13 and URL text', async () => {
    expect(await runTool('b64d', 'VEd7SEVMTE99')).toBe('TG{HELLO}');
    expect(await runTool('b64e', 'TG{HELLO}')).toBe('VEd7SEVMTE99');
    expect(rot13('GT{URYYB}')).toBe('TG{HELLO}');
    expect(await runTool('url', 'TG%7Bx%7D')).toBe('TG{x}');
  });
});
