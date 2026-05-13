import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Check, Save } from "lucide-react";
import { toast } from "sonner";

const TOURNAMENT_ROUNDS = [
  { round: 1, difficulty: "kanicofrade", label: "Kanicofrade" },
  { round: 2, difficulty: "nazareno", label: "Nazareno" },
  { round: 3, difficulty: "costalero", label: "Costalero" },
  { round: 4, difficulty: "capataz", label: "Capataz" },
  { round: 5, difficulty: "maestro", label: "Maestro" },
] as const;

const QUESTIONS_PER_ROUND = 10;

interface SelectedQuestion {
  id: string;
  question_text: string;
  difficulty: string | null;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tournamentId: string;
  tournamentName: string;
  isDraft: boolean;
}

const AssignTournamentQuestionsDialog = ({ open, onOpenChange, tournamentId, tournamentName, isDraft }: Props) => {
  const queryClient = useQueryClient();
  const [roundQuestions, setRoundQuestions] = useState<Record<number, SelectedQuestion[]>>({
    1: [], 2: [], 3: [], 4: [], 5: [],
  });

  // Load all questions
  const { data: allQuestions = [] } = useQuery({
    queryKey: ["all-questions-for-tournament"],
    queryFn: async () => {
      const all: any[] = [];
      let offset = 0;
      const batch = 1000;
      let hasMore = true;
      while (hasMore) {
        const { data, error } = await supabase
          .from("questions")
          .select("id, question_text, difficulty")
          .order("created_at", { ascending: false })
          .range(offset, offset + batch - 1);
        if (error) throw error;
        if (data && data.length > 0) {
          all.push(...data);
          offset += batch;
          hasMore = data.length === batch;
        } else {
          hasMore = false;
        }
      }
      return all as { id: string; question_text: string; difficulty: string | null }[];
    },
  });

  // Load existing tournament questions to seed state
  useEffect(() => {
    if (!open || !tournamentId || allQuestions.length === 0) return;
    (async () => {
      const { data, error } = await supabase
        .from("tournament_questions")
        .select("question_id, round_number, order_number")
        .eq("tournament_id", tournamentId)
        .order("round_number")
        .order("order_number");
      if (error) {
        toast.error("Error cargando preguntas asignadas");
        return;
      }
      const seeded: Record<number, SelectedQuestion[]> = { 1: [], 2: [], 3: [], 4: [], 5: [] };
      data?.forEach((tq: any) => {
        const q = allQuestions.find((aq) => aq.id === tq.question_id);
        if (q) seeded[tq.round_number].push(q);
      });
      setRoundQuestions(seeded);
    })();
  }, [open, tournamentId, allQuestions]);

  const toggleQuestion = (roundNum: number, q: SelectedQuestion) => {
    setRoundQuestions((prev) => {
      const current = prev[roundNum];
      if (current.find((x) => x.id === q.id)) {
        return { ...prev, [roundNum]: current.filter((x) => x.id !== q.id) };
      }
      if (current.length >= QUESTIONS_PER_ROUND) {
        toast.error(`Ya hay ${QUESTIONS_PER_ROUND} preguntas en esta ronda`);
        return prev;
      }
      for (const r of TOURNAMENT_ROUNDS) {
        if (r.round !== roundNum && prev[r.round].find((x) => x.id === q.id)) {
          toast.error("Esta pregunta ya está en otra ronda");
          return prev;
        }
      }
      return { ...prev, [roundNum]: [...current, q] };
    });
  };

  const allComplete = TOURNAMENT_ROUNDS.every((r) => roundQuestions[r.round].length === QUESTIONS_PER_ROUND);

  const saveMutation = useMutation({
    mutationFn: async ({ promote }: { promote: boolean }) => {
      // Replace all questions
      const { error: delErr } = await supabase
        .from("tournament_questions")
        .delete()
        .eq("tournament_id", tournamentId);
      if (delErr) throw delErr;

      const inserts: { tournament_id: string; question_id: string; round_number: number; order_number: number }[] = [];
      for (const round of TOURNAMENT_ROUNDS) {
        roundQuestions[round.round].forEach((q, idx) => {
          inserts.push({
            tournament_id: tournamentId,
            question_id: q.id,
            round_number: round.round,
            order_number: idx + 1,
          });
        });
      }
      if (inserts.length > 0) {
        const { error: insErr } = await supabase.from("tournament_questions").insert(inserts);
        if (insErr) throw insErr;
      }

      if (promote && isDraft && allComplete) {
        const { error: upErr } = await supabase
          .from("tournaments")
          .update({ status: "upcoming" })
          .eq("id", tournamentId);
        if (upErr) throw upErr;
      }
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["admin-tournaments"] });
      queryClient.invalidateQueries({ queryKey: ["tournament-questions", tournamentId] });
      toast.success(vars.promote ? "Preguntas guardadas y torneo programado" : "Preguntas guardadas");
      onOpenChange(false);
    },
    onError: () => toast.error("Error al guardar las preguntas"),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-cinzel">Asignar preguntas</DialogTitle>
          <DialogDescription>
            <span className="font-semibold text-foreground">{tournamentName}</span> · 10 preguntas por ronda
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {TOURNAMENT_ROUNDS.map((round) => {
            const roundQs = roundQuestions[round.round];
            const available = allQuestions.filter((q) => q.difficulty === round.difficulty);
            const isComplete = roundQs.length === QUESTIONS_PER_ROUND;
            return (
              <Card key={round.round} className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold">Ronda {round.round}: {round.label}</h4>
                    {isComplete && <Check className="w-4 h-4 text-green-500" />}
                  </div>
                  <span className={cn("text-sm font-medium", isComplete ? "text-green-600" : "text-muted-foreground")}>
                    {roundQs.length}/{QUESTIONS_PER_ROUND}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{available.length} disponibles</p>
                <div className="space-y-1.5 max-h-[220px] overflow-y-auto">
                  {available.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic py-2">No hay preguntas de este nivel</p>
                  ) : (
                    available.map((q) => {
                      const selected = roundQs.find((rq) => rq.id === q.id);
                      const usedInOther = !selected && TOURNAMENT_ROUNDS.some(
                        (r) => r.round !== round.round && roundQuestions[r.round].find((rq) => rq.id === q.id)
                      );
                      const isDisabled = (!selected && isComplete) || usedInOther;
                      return (
                        <div
                          key={q.id}
                          className={cn(
                            "flex items-start gap-2 p-2 rounded border bg-card transition-colors",
                            isDisabled ? "opacity-40" : "hover:bg-accent/50",
                            selected ? "border-primary bg-primary/5" : ""
                          )}
                        >
                          <Checkbox
                            checked={!!selected}
                            onCheckedChange={() => toggleQuestion(round.round, q)}
                            disabled={isDisabled}
                          />
                          <p className="text-sm flex-1">
                            {selected && (
                              <span className="inline-flex items-center justify-center w-5 h-5 mr-2 text-xs font-bold text-primary-foreground bg-primary rounded-full">
                                {roundQs.indexOf(selected) + 1}
                              </span>
                            )}
                            {q.question_text}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        <DialogFooter className="gap-2 flex-wrap">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saveMutation.isPending}>
            Cancelar
          </Button>
          <Button
            variant="outline"
            onClick={() => saveMutation.mutate({ promote: false })}
            disabled={saveMutation.isPending}
            className="gap-2"
          >
            <Save className="h-4 w-4" /> Guardar
          </Button>
          {isDraft && (
            <Button
              onClick={() => saveMutation.mutate({ promote: true })}
              disabled={!allComplete || saveMutation.isPending}
              className="gap-2"
            >
              <Check className="h-4 w-4" /> Guardar y programar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssignTournamentQuestionsDialog;
