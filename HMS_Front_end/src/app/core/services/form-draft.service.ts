import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root',
})
export class FormDraftService {
  // draftKey -> sanitized form value snapshot
  private readonly drafts = new Map<string, Record<string, any>>();

  // Field-name fragments that must never be persisted.
  private static readonly SENSITIVE_FRAGMENTS = [
    'password',
    'passwd',
    'pwd',
  ];

  save(key: string, value: Record<string, any>): void {
    if (!key || value == null) {
      return;
    }
    const sanitized = this.sanitize(value);
    this.drafts.set(key, sanitized);
  }

  get(key: string): Record<string, any> | null {
    const draft = this.drafts.get(key);
    // Return a clone so callers can't mutate the stored copy.
    return draft ? this.clone(draft) : null;
  }

  has(key: string): boolean {
    return this.drafts.has(key);
  }

  clear(key: string): void {
    this.drafts.delete(key);
  }

  clearAll(): void {
    this.drafts.clear();
  }

  // --- internals ----------------------------------------------------------

  // Recursively removes password-like keys and deep-clones the rest.
  private sanitize(value: any): any {
    if (Array.isArray(value)) {
      return value.map((item) => this.sanitize(item));
    }

    if (value !== null && typeof value === 'object') {
      const result: Record<string, any> = {};
      for (const [k, v] of Object.entries(value)) {
        if (this.isSensitiveKey(k)) {
          continue;
        }
        result[k] = this.sanitize(v);
      }
      return result;
    }

    // primitive
    return value;
  }

  private isSensitiveKey(key: string): boolean {
    const lower = key.toLowerCase();
    return FormDraftService.SENSITIVE_FRAGMENTS.some((frag) =>
      lower.includes(frag),
    );
  }

  private clone(value: any): any {
    // structuredClone is available in modern browsers/Angular targets;
    // fall back to JSON clone for safety.
    try {
      return structuredClone(value);
    } catch {
      return structuredClone(value);
    }
  }
}
