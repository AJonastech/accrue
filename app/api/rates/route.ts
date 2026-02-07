const CURRENCY_API_BASE =
  "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@";

const isCurrencyCode = (value: string) => /^[a-z]{3}$/.test(value);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const base = (searchParams.get("base") ?? "usd").toLowerCase();
  const target = (searchParams.get("target") ?? "ngn").toLowerCase();
  const date = searchParams.get("date") ?? "latest";

  if (!isCurrencyCode(base) || !isCurrencyCode(target)) {
    return new Response("Invalid currency code.", { status: 400 });
  }

  if (base === target) {
    return new Response(
      JSON.stringify({
        base: base.toUpperCase(),
        target: target.toUpperCase(),
        rate: 1,
        date: null,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }

  const endpoint = `${CURRENCY_API_BASE}${date}/v1/currencies/${base}.min.json`;

  const response = await fetch(endpoint, { next: { revalidate: 60 * 60 } });

  if (!response.ok) {
    return new Response("Unable to fetch live rate.", { status: 502 });
  }

  const data = (await response.json()) as Record<string, any>;
  const rates = data?.[base];
  const rate = rates?.[target];

  if (typeof rate !== "number") {
    return new Response("Rate unavailable for that currency.", {
      status: 404,
    });
  }

  return new Response(
    JSON.stringify({
      base: base.toUpperCase(),
      target: target.toUpperCase(),
      rate,
      date: data?.date ?? null,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
}
