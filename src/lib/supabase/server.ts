import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const JWT_CLOCK_SKEW_RETRY_DELAY_MS = 1000;

type SupabaseErrorResponse = {
  code?: unknown;
  message?: unknown;
};

const wait = (milliseconds: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, milliseconds);
  });

const isJwtIssuedAtFutureResponse = async (response: Response) => {
  if (response.ok) {
    return false;
  }

  const error = (await response
    .clone()
    .json()
    .catch(() => null)) as SupabaseErrorResponse | null;

  return (
    error?.code === "PGRST303" &&
    error.message === "JWT issued at future"
  );
};

const fetchWithJwtClockSkewRetry: typeof fetch = async (input, init) => {
  const request = new Request(input, init);

  if (request.method !== "GET") {
    return fetch(request);
  }

  const retryRequest = request.clone();
  const response = await fetch(request);

  if (!(await isJwtIssuedAtFutureResponse(response))) {
    return response;
  }

  console.warn(
    "[supabase] JWT clock skew detected. Retrying request once.",
  );

  await wait(JWT_CLOCK_SKEW_RETRY_DELAY_MS);

  return fetch(retryRequest);
};

export const createSupabaseServerClient = async () => {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        fetch: fetchWithJwtClockSkewRetry,
      },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {}
        },
      },
    },
  );
};
