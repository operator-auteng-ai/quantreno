import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function KalshiConnectionDemo() {
  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle className="text-base">Kalshi Connection</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-2 rounded-full bg-green-500" />
            <div>
              <p className="font-medium text-sm">Connected</p>
              <p className="text-muted-foreground text-xs">Balance: $817.42</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline">Update</Button>
            <Button size="sm" variant="destructive">Disconnect</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
