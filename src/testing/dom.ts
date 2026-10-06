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

/** The option texts in the listbox that `combobox` controls through `aria-controls`. */
export function optionsOf(root: HTMLElement, combobox: HTMLElement): string[] {
  const id = combobox.getAttribute('aria-controls');
  const listbox = [...root.querySelectorAll('[id]')].find((element) => element.id === id);
  if (!id || listbox?.getAttribute('role') !== 'listbox') {
    throw new Error('No listbox controlled by the combobox');
  }
  return [...listbox.querySelectorAll('[role="option"]')].map(
    (option) => option.textContent?.trim() ?? '',
  );
}

/** The texts of the elements `element` refers to through `aria-describedby`, joined by a space. */
export function descriptionOf(root: HTMLElement, element: HTMLElement): string {
  const ids = element.getAttribute('aria-describedby')?.split(/\s+/).filter(Boolean) ?? [];
  if (ids.length === 0) {
    throw new Error('Element has no aria-describedby');
  }
  return ids
    .map((id) => {
      const description = [...root.querySelectorAll('[id]')].find(
        (candidate) => candidate.id === id,
      );
      if (!description) {
        throw new Error(`No element with id "${id}" for aria-describedby`);
      }
      return description.textContent?.trim() ?? '';
    })
    .join(' ');
}

export function pressKey(
  element: HTMLElement,
  key: string,
  modifiers: KeyboardEventInit = {},
): KeyboardEvent {
  const event = new KeyboardEvent('keydown', {
    ...modifiers,
    key,
    bubbles: true,
    cancelable: true,
  });
  element.dispatchEvent(event);
  return event;
}

/** The text of the option `aria-activedescendant` points to, checked to be the only selected one. */
export function activeOptionOf(root: HTMLElement, combobox: HTMLElement): string | undefined {
  const id = combobox.getAttribute('aria-activedescendant');
  if (!id) {
    return undefined;
  }
  const selected = [...root.querySelectorAll('[role="option"][aria-selected="true"]')];
  if (selected.length !== 1 || selected[0].id !== id) {
    throw new Error(`Option "${id}" is not the only option with aria-selected="true"`);
  }
  return selected[0].textContent?.trim() ?? '';
}
