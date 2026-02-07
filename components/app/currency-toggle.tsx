import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Currency = "USD" | "NGN";

type CurrencyToggleProps = {
  size?: "sm" | "md";
  value?: Currency;
  onValueChange?: (value: Currency) => void;
};

export function CurrencyToggle({
  size = "md",
  value,
  onValueChange,
}: CurrencyToggleProps) {
  const tabsProps = value ? { value } : { defaultValue: "USD" };

  return (
    <Tabs
      {...tabsProps}
      onValueChange={(next) =>
        onValueChange?.(next.toUpperCase() as Currency)
      }
      className="w-auto"
    >
      <TabsList
        className={size === "sm" ? "h-8 rounded-full p-1" : undefined}
      >
        <TabsTrigger
          value="USD"
          className={size === "sm" ? "px-2 py-1 text-[11px]" : undefined}
        >
          $ USD
        </TabsTrigger>
        <TabsTrigger
          value="NGN"
          className={size === "sm" ? "px-2 py-1 text-[11px]" : undefined}
        >
          ₦ NGN
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
