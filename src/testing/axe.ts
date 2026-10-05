import axe from 'axe-core';

// jsdom can't compute colours, so contrast is checked by hand and with Lighthouse.
const AXE_OPTIONS: axe.RunOptions = { rules: { 'color-contrast': { enabled: false } } };

/** axe violations inside `root`, as readable `rule: description` lines. */
export async function axeViolations(root: HTMLElement): Promise<string[]> {
  const { violations } = await axe.run(root, AXE_OPTIONS);
  return violations.map((violation) => `${violation.id}: ${violation.help}`);
}
