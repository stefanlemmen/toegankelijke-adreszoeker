import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

// Angular runs change detection on a later timer tick; run it right after moving the
// fake clock so assertions see the state at exactly that moment.
export async function advance(ms = 0): Promise<void> {
  await vi.advanceTimersByTimeAsync(ms);
  TestBed.tick();
}

export function inputLabelled(root: HTMLElement, text: string): HTMLInputElement {
  const label = [...root.querySelectorAll('label')].find((l) => l.textContent?.trim() === text);
  const control = label?.control;
  if (!(control instanceof HTMLInputElement)) {
    throw new Error(`No input labelled "${text}"`);
  }
  return control;
}

export function typeInto(input: HTMLInputElement, value: string): void {
  input.value = value;
  input.dispatchEvent(new Event('input'));
}

/** The innermost element whose text is exactly `text`. */
export function elementWithText(root: HTMLElement, text: string): HTMLElement {
  const matches = [...root.querySelectorAll<HTMLElement>('*')].filter(
    (element) => element.textContent?.trim() === text,
  );
  const innermost = matches.at(-1);
  if (!innermost) {
    throw new Error(`No element with text "${text}"`);
  }
  return innermost;
}

/** The `<dd>` text belonging to the `<dt>` with text `term`. */
export function definitionOf(root: HTMLElement, term: string): string {
  const dt = [...root.querySelectorAll('dt')].find((d) => d.textContent?.trim() === term);
  const dd = dt?.nextElementSibling;
  if (!(dd instanceof HTMLElement) || dd.tagName !== 'DD') {
    throw new Error(`No <dd> for term "${term}"`);
  }
  return dd.textContent?.trim() ?? '';
}
