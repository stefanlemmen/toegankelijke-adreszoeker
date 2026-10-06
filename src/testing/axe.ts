import axe from 'axe-core';
import { vi } from 'vitest';

// jsdom can't compute colours, so contrast is checked by hand and with Lighthouse.
const AXE_OPTIONS: axe.RunOptions = { rules: { 'color-contrast': { enabled: false } } };

/** axe violations inside `root`, as readable `rule: description` lines. For tests on fake timers. */
export async function axeViolations(root: HTMLElement): Promise<string[]> {
  // axe schedules its checks on timers, which never fire under fake timers.
  vi.useRealTimers();
  try {
    const { violations } = await axe.run(root, AXE_OPTIONS);
    return violations.map((violation) => `${violation.id}: ${violation.help}`);
  } finally {
    vi.useFakeTimers();
  }
}
