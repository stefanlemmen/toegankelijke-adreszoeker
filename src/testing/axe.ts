import axe from 'axe-core';

/** axe violations inside `root`, as readable `rule: description` lines. */
export async function axeViolations(root: HTMLElement): Promise<string[]> {
  const { violations } = await axe.run(root);
  return violations.map((violation) => `${violation.id}: ${violation.help}`);
}
