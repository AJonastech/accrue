import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type CurrencyToggleProps = {
  size?: "sm" | "md";
};

export function CurrencyToggle({ size = "md" }: CurrencyToggleProps) {
  return (
    <Tabs defaultValue="usd" className="w-auto">
      <TabsList
        className={size === "sm" ? "h-8 rounded-full p-1" : undefined}
      >
        <TabsTrigger
          value="usd"
          className={size === "sm" ? "px-2 py-1 text-[11px]" : undefined}
        >
          $ USD
        </TabsTrigger>
        <TabsTrigger
          value="ngn"
          className={size === "sm" ? "px-2 py-1 text-[11px]" : undefined}
        >
          ₦ NGN
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
