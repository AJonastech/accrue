export type Currency = "USD" | "NGN";

const currencyMeta: Record<
  Currency,
  { locale: string; code: string; symbol: string }
> = {
  USD: { locale: "en-US", code: "USD", symbol: "$" },
  NGN: { locale: "en-NG", code: "NGN", symbol: "₦" },
};

export function convertFromUsd(
  amountUsd: number,
  currency: Currency,
  rate: number,
) {
  return currency === "USD" ? amountUsd : amountUsd * rate;
}

export function formatCurrency(
  amountUsd: number,
  currency: Currency,
  rate: number,
  options?: Intl.NumberFormatOptions,
) {
  const { locale, code } = currencyMeta[currency];
  const amount = convertFromUsd(amountUsd, currency, rate);
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: code,
    maximumFractionDigits: 0,
    ...options,
  }).format(amount);
}

export function formatCurrencyCompact(
  amountUsd: number,
  currency: Currency,
  rate: number,
) {
  const { locale, code } = currencyMeta[currency];
  const amount = convertFromUsd(amountUsd, currency, rate);
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: code,
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 1,
  }).format(amount);
}

export function maskCurrency(currency: Currency) {
  return `${currencyMeta[currency].symbol}*****`;
}
