import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

const HermandadesSection = () => {
  const [showHermandades, setShowHermandades] = useState(false);

  const { data: topHermandades } = useQuery({
    queryKey: ["admin-dashboard-hermandades"],
    queryFn: async () => {
      const { data } = await supabase.rpc("get_public_profiles");

      const counts: Record<string, number> = {};
      data?.forEach((p: { hermandad: string }) => {
        if (p.hermandad) {
          counts[p.hermandad] = (counts[p.hermandad] || 0) + 1;
        }
      });

      return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([nombre, usuarios]) => ({ nombre, usuarios }));
    },
  });

  return (
    <>
      <Card
        className="cursor-pointer hover:bg-accent/50 transition-colors"
        onClick={() => setShowHermandades(true)}
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            Top 10 Hermandades
            <span className="text-sm font-normal text-muted-foreground">
              ({topHermandades?.slice(0, 3).map((h) => h.nombre).join(", ")})
            </span>
          </CardTitle>
        </CardHeader>
      </Card>

      <Dialog open={showHermandades} onOpenChange={setShowHermandades}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Top 10 Hermandades</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[400px]">
            <div className="flex flex-col gap-2">
              {topHermandades?.map((h, index) => (
                <Card key={h.nombre} className="p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {index + 1}. {h.nombre}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {h.usuarios} usuarios
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default HermandadesSection;
