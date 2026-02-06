import { DashboardShell } from "@/components/app/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  return (
    <DashboardShell>
      <div className="flex flex-col gap-8">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Settings
          </p>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Make adjustments without losing progress
          </h1>
          <p className="text-sm text-muted-foreground">
            Update currency, goal details, and allocation rules.
          </p>
        </header>

        <Card>
        <CardHeader>
          <CardTitle className="text-base">Currency Settings</CardTitle>
          <p className="text-sm text-muted-foreground">
            Display currency only. No automatic exchange rates.
          </p>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Primary Currency</Label>
            <Select defaultValue="usd">
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="usd">USD ($)</SelectItem>
                <SelectItem value="ngn">NGN (₦)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="rate">Conversion Rate</Label>
            <div className="flex items-center gap-2">
              <Input id="rate" type="number" placeholder="1600" />
              <Badge variant="soft">1 USD = ₦</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

        <Card>
        <CardHeader>
          <CardTitle className="text-base">Goal Settings</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="goal-name-settings">Goal Name</Label>
            <Input id="goal-name-settings" placeholder="Laptop Fund" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="goal-target-settings">Target Amount (USD)</Label>
            <Input id="goal-target-settings" type="number" placeholder="2700" />
          </div>
        </CardContent>
      </Card>

        <Card>
        <CardHeader>
          <CardTitle className="text-base">Allocation Settings</CardTitle>
          <p className="text-sm text-muted-foreground">
            Changes apply to future income only.
          </p>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="savings-settings">Savings %</Label>
            <Input id="savings-settings" type="number" placeholder="80" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tithe-settings">Tithe %</Label>
            <Input id="tithe-settings" type="number" placeholder="10" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="spend-settings">Spending %</Label>
            <Input id="spend-settings" type="number" placeholder="10" />
          </div>
          <Separator className="md:col-span-3" />
          <div className="md:col-span-3 flex items-center justify-between rounded-2xl bg-muted/60 px-4 py-3">
            <span className="text-sm text-muted-foreground">
              Total allocation
            </span>
            <Badge variant="secondary">100%</Badge>
          </div>
        </CardContent>
      </Card>

        <div className="flex items-center justify-end">
          <Button size="lg">Save Settings</Button>
        </div>
      </div>
    </DashboardShell>
  );
}
