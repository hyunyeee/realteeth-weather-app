type RequestOptions = Omit<RequestInit, "body" | "method">;

type PostOptions<TBody> = RequestOptions & {
  body?: TBody;
};

type ApiErrorResponse = {
  message?: string;
  error?: string;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly response?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function parseJsonResponse(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type");

  if (!contentType?.includes("application/json")) {
    return null;
  }

  return response.json();
}

function getErrorMessage(status: number, response: unknown) {
  if (isApiErrorResponse(response)) {
    return response.message ?? response.error ?? `API request failed: ${status}`;
  }

  return `API request failed: ${status}`;
}

function isApiErrorResponse(response: unknown): response is ApiErrorResponse {
  return (
    typeof response === "object" &&
    response !== null &&
    ("message" in response || "error" in response)
  );
}

async function request<TResponse>(
  url: string,
  options: RequestInit,
): Promise<TResponse> {
  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: "application/json",
      ...options.headers,
    },
  });
  const data = await parseJsonResponse(response);

  if (!response.ok) {
    throw new ApiError(getErrorMessage(response.status, data), response.status, data);
  }

  return data as TResponse;
}

export const apiClient = {
  get<TResponse>(url: string, options?: RequestOptions) {
    return request<TResponse>(url, {
      ...options,
      method: "GET",
    });
  },

  post<TResponse, TBody = unknown>(
    url: string,
    options?: PostOptions<TBody>,
  ) {
    const { body, headers, ...requestOptions } = options ?? {};

    return request<TResponse>(url, {
      ...requestOptions,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  },
};
