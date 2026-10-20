import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import themePele from '../lib/index.js';

describe('docusaurus-theme-pele', () => {
  const plugin = themePele();

  it('exposes the expected plugin name', () => {
    expect(plugin.name).toBe('docusaurus-theme-pele');
  });

  it('ships the Mermaid theme component', () => {
    const themePath = plugin.getThemePath();
    expect(fs.existsSync(path.join(themePath, 'Mermaid/index.js'))).toBe(true);
  });

  it('ships the client stylesheet entry', () => {
    const [clientModule] = plugin.getClientModules();
    expect(fs.existsSync(clientModule)).toBe(true);
  });

  it('ships the source theme path for swizzling', () => {
    const themePath = plugin.getTypeScriptThemePath();
    expect(fs.existsSync(path.join(themePath, 'Mermaid/index.js'))).toBe(true);
  });
});
