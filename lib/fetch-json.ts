export interface ApiPayload {
  success?: boolean;
  error?: string;
  details?: unknown;
  [key: string]: unknown;
}

interface ZodIssue {
  path?: Array<string | number>;
  message?: string;
}

export async function fetchJson<T>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(input, init);
  const contentType = response.headers.get('content-type') || '';

  if (!contentType.includes('application/json')) {
    const fallbackText = await response.text();
    throw new Error(
      `Unexpected response format (${response.status}). ${fallbackText.slice(0, 120) || 'Expected JSON response.'}`
    );
  }

  const data = (await response.json()) as T;

  if (!response.ok) {
    const payload = data as ApiPayload;
    let detailsMessage = '';
    if (Array.isArray(payload.details) && payload.details.length > 0) {
      const firstIssue = payload.details[0] as ZodIssue;
      const issuePath = Array.isArray(firstIssue.path) ? firstIssue.path.join('.') : '';
      const issueText = firstIssue.message || 'Invalid input';
      detailsMessage = issuePath ? ` (${issuePath}: ${issueText})` : ` (${issueText})`;
    }

    const message =
      typeof payload.error === 'string'
        ? `${payload.error}${detailsMessage}`
        : `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data;
}
