import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  CalendarIcon, ChevronRight, Copy, Edit2, ExternalLink, Eye, ImagePlus, Lock, Plus,
  RefreshCw, Swords, Trash2, Trophy, Unlock, Users, Check, X
} from "lucide-react";

// Rondas del torneo con su dificultad
const TOURNAMENT_ROUNDS = [
  { round: 1, difficulty: "kanicofrade", label: "Kanicofrade" },
  { round: 2, difficulty: "nazareno", label: "Nazareno" },
  { round: 3, difficulty: "costalero", label: "Costalero" },
  { round: 4, difficulty: "capataz", label: "Capataz" },
  { round: 5, difficulty: "maestro", label: "Maestro" },
] as const;

const QUESTIONS_PER_ROUND = 10;

// Generar código aleatorio de 6 caracteres
const generateJoinCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
};

type TournamentStatus = "draft" | "upcoming" | "active" | "completed";
type ViewMode = "list" | "create" | "detail";

interface Tournament {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  tournament_date: string;
  tournament_time: string | null;
  location: string | null;
  location_url: string | null;
  join_code: string;
  status: string;
  current_round: number;
  created_at: string;
}

interface SelectedQuestion {
  id: string;
  question_text: string;
  difficulty: string | null;
  order: number;
}

const TournamentManager = () => {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // — Edit form state —
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDate, setEditDate] = useState<Date | undefined>();
  const [editTime, setEditTime] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editCode, setEditCode] = useState("");
  const [editLocationUrl, setEditLocationUrl] = useState("");
  const [editImage, setEditImage] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);

  // — Form state —
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formDate, setFormDate] = useState<Date | undefined>();
  const [formCode, setFormCode] = useState(generateJoinCode());
  const [formTime, setFormTime] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formLocationUrl, setFormLocationUrl] = useState("");
  const [formImage, setFormImage] = useState<File | null>(null);
  const [formImagePreview, setFormImagePreview] = useState<string | null>(null);
  const [roundQuestions, setRoundQuestions] = useState<Record<number, SelectedQuestion[]>>({
    1: [], 2: [], 3: [], 4: [], 5: [],
  });

  // — Queries —
  const { data: tournaments = [], isLoading: loadingTournaments } = useQuery({
    queryKey: ["admin-tournaments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tournaments")
        .select("*")
        .order("tournament_date", { ascending: false });
      if (error) throw error;
      return data as Tournament[];
    },
  });

  const { data: questions = [] } = useQuery({
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
      return all;
    },
  });

  // Participants count per tournament (for detail view)
  const { data: participantCounts = {} } = useQuery({
    queryKey: ["tournament-participant-counts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tournament_participants")
        .select("tournament_id");
      if (error) throw error;
      const counts: Record<string, number> = {};
      data.forEach((p) => {
        counts[p.tournament_id] = (counts[p.tournament_id] || 0) + 1;
      });
      return counts;
    },
  });

  // Load tournament questions when viewing detail
  const { data: tournamentQuestions = [] } = useQuery({
    queryKey: ["tournament-questions", selectedTournament?.id],
    enabled: !!selectedTournament,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tournament_questions")
        .select("question_id, round_number, order_number")
        .eq("tournament_id", selectedTournament!.id)
        .order("round_number")
        .order("order_number");
      if (error) throw error;
      return data;
    },
  });

  // — Mutations —
  const createMutation = useMutation({
    mutationFn: async () => {
      // 1. Upload image if provided
      let imageUrl: string | null = null;
      if (formImage) {
        const ext = formImage.name.split(".").pop();
        const filePath = `${crypto.randomUUID()}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from("tournament-images")
          .upload(filePath, formImage, { contentType: formImage.type });
        if (uploadErr) throw uploadErr;
        const { data: urlData } = supabase.storage
          .from("tournament-images")
          .getPublicUrl(filePath);
        imageUrl = urlData.publicUrl;
      }

      // 2. Determine status based on questions
      const isDraft = !TOURNAMENT_ROUNDS.every(
        (r) => roundQuestions[r.round].length === QUESTIONS_PER_ROUND
      );

      // 3. Create tournament
      const { data: tournament, error: tError } = await supabase
        .from("tournaments")
        .insert({
          name: formName.trim(),
          description: formDescription.trim() || null,
          tournament_date: format(formDate!, "yyyy-MM-dd"),
          tournament_time: formTime || null,
          location: formLocation.trim() || null,
          location_url: formLocationUrl.trim() || null,
          join_code: formCode.trim().toUpperCase(),
          status: isDraft ? "draft" : "upcoming",
          current_round: 0,
          image_url: imageUrl,
        })
        .select()
        .single();
      if (tError) throw tError;

      // 4. Insert tournament questions (if any selected)
      const inserts: { tournament_id: string; question_id: string; round_number: number; order_number: number }[] = [];
      for (const round of TOURNAMENT_ROUNDS) {
        const rqs = roundQuestions[round.round];
        rqs.forEach((q, idx) => {
          inserts.push({
            tournament_id: tournament.id,
            question_id: q.id,
            round_number: round.round,
            order_number: idx + 1,
          });
        });
      }

      if (inserts.length > 0) {
        const { error: qError } = await supabase
          .from("tournament_questions")
          .insert(inserts);
        if (qError) throw qError;
      }

      return tournament;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tournaments"] });
      const isDraft = !TOURNAMENT_ROUNDS.every(
        (r) => roundQuestions[r.round].length === QUESTIONS_PER_ROUND
      );
      toast.success(isDraft ? "Torneo guardado como borrador" : "Torneo creado correctamente");
      resetForm();
      setViewMode("list");
    },
    onError: (error: any) => {
      if (error?.message?.includes("unique")) {
        toast.error("Ya existe un torneo con ese código de acceso");
      } else {
        toast.error("Error al crear el torneo");
      }
    },
  });

  const advanceRoundMutation = useMutation({
    mutationFn: async ({ id, newRound }: { id: string; newRound: number }) => {
      const updates: { current_round: number; status?: string } = { current_round: newRound };
      if (newRound === 1) updates.status = "active";
      if (newRound > 5) {
        updates.current_round = 5;
        updates.status = "completed";
      }
      const { error } = await supabase
        .from("tournaments")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tournaments"] });
      toast.success("Ronda actualizada");
    },
    onError: () => toast.error("Error al avanzar ronda"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tournaments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tournaments"] });
      setDeleteConfirm(null);
      if (selectedTournament) {
        setSelectedTournament(null);
        setViewMode("list");
      }
      toast.success("Torneo eliminado");
    },
    onError: () => toast.error("Error al eliminar el torneo"),
  });

  const updateMutation = useMutation({
    mutationFn: async (tournamentId: string) => {
      let imageUrl: string | undefined = undefined;
      if (editImage) {
        const ext = editImage.name.split(".").pop();
        const filePath = `${crypto.randomUUID()}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from("tournament-images")
          .upload(filePath, editImage, { contentType: editImage.type });
        if (uploadErr) throw uploadErr;
        const { data: urlData } = supabase.storage
          .from("tournament-images")
          .getPublicUrl(filePath);
        imageUrl = urlData.publicUrl;
      }

      const updates: Record<string, any> = {
        name: editName.trim(),
        description: editDescription.trim() || null,
        tournament_date: format(editDate!, "yyyy-MM-dd"),
        tournament_time: editTime || null,
        location: editLocation.trim() || null,
        location_url: editLocationUrl.trim() || null,
        join_code: editCode.trim().toUpperCase(),
      };
      if (imageUrl !== undefined) updates.image_url = imageUrl;

      const { error } = await supabase
        .from("tournaments")
        .update(updates)
        .eq("id", tournamentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tournaments"] });
      setIsEditing(false);
      toast.success("Torneo actualizado correctamente");
    },
    onError: (error: any) => {
      if (error?.message?.includes("unique")) {
        toast.error("Ya existe un torneo con ese código de acceso");
      } else {
        toast.error("Error al actualizar el torneo");
      }
    },
  });

  // — Helpers —
  const resetForm = () => {
    setFormName("");
    setFormDescription("");
    setFormDate(undefined);
    setFormTime("");
    setFormLocation("");
    setFormLocationUrl("");
    setFormCode(generateJoinCode());
    setFormImage(null);
    setFormImagePreview(null);
    setRoundQuestions({ 1: [], 2: [], 3: [], 4: [], 5: [] });
  };

  const startEditing = (t: Tournament) => {
    setEditName(t.name);
    setEditDescription(t.description || "");
    setEditDate(new Date(t.tournament_date + "T00:00:00"));
    setEditTime(t.tournament_time ? t.tournament_time.slice(0, 5) : "");
    setEditLocation(t.location || "");
    setEditLocationUrl(t.location_url || "");
    setEditCode(t.join_code);
    setEditImage(null);
    setEditImagePreview(t.image_url || null);
    setIsEditing(true);
  };

  const handleEditImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Solo se permiten archivos de imagen");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen no puede superar los 5MB");
      return;
    }
    setEditImage(file);
    setEditImagePreview(URL.createObjectURL(file));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Solo se permiten archivos de imagen");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen no puede superar los 5MB");
      return;
    }
    setFormImage(file);
    setFormImagePreview(URL.createObjectURL(file));
  };

  const toggleQuestion = (roundNum: number, question: { id: string; question_text: string; difficulty: string | null }) => {
    setRoundQuestions((prev) => {
      const current = prev[roundNum];
      const exists = current.find((q) => q.id === question.id);
      if (exists) {
        return { ...prev, [roundNum]: current.filter((q) => q.id !== question.id) };
      }
      if (current.length >= QUESTIONS_PER_ROUND) {
        toast.error(`Ya hay ${QUESTIONS_PER_ROUND} preguntas en esta ronda`);
        return prev;
      }
      // Check question not used in another round
      for (const r of TOURNAMENT_ROUNDS) {
        if (r.round !== roundNum && prev[r.round].find((q) => q.id === question.id)) {
          toast.error("Esta pregunta ya está asignada a otra ronda");
          return prev;
        }
      }
      return {
        ...prev,
        [roundNum]: [...current, { ...question, order: current.length + 1 }],
      };
    });
  };

  const allRoundsComplete = TOURNAMENT_ROUNDS.every(
    (r) => roundQuestions[r.round].length === QUESTIONS_PER_ROUND
  );

  const canCreate = formName.trim().length >= 3 && formDate && formCode.trim().length >= 4;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 border-yellow-500/30">Borrador</Badge>;
      case "upcoming":
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-700">Próximo</Badge>;
      case "active":
        return <Badge variant="outline" className="bg-green-500/10 text-green-700">En curso</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-muted text-muted-foreground">Finalizado</Badge>;
      default:
        return null;
    }
  };

  // ─── LIST VIEW ────────────────────────────────
  if (viewMode === "list") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Torneos</h2>
          <Button onClick={() => { resetForm(); setViewMode("create"); }} className="gap-2">
            <Plus className="h-4 w-4" /> Crear Torneo
          </Button>
        </div>

        {loadingTournaments ? (
          <p className="text-center text-muted-foreground py-8">Cargando torneos...</p>
        ) : tournaments.length === 0 ? (
          <Card className="p-8 text-center">
            <Swords className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">No hay torneos creados</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {tournaments.map((t) => (
              <Card
                key={t.id}
                className="overflow-hidden hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => { setSelectedTournament(t); setViewMode("detail"); }}
              >
                {t.image_url && (
                  <img
                    src={t.image_url}
                    alt={t.name}
                    className="w-full h-32 object-cover"
                  />
                )}
                <div className="p-4 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-lg">{t.name}</h3>
                      {getStatusBadge(t.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(t.tournament_date + "T00:00:00"), "d 'de' MMMM yyyy", { locale: es })}
                      {t.tournament_time ? ` · ${t.tournament_time.slice(0, 5)}` : ""}
                      {t.location ? ` · ${t.location}` : ""}
                      {" · "}
                      <span className="font-mono">{t.join_code}</span>
                      {" · "}
                      <Users className="inline h-3.5 w-3.5 -mt-0.5" /> {participantCounts[t.id] || 0}
                      {t.status === "draft" ? " · Pendiente de preguntas" : ` · Ronda ${t.current_round}/5`}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ─── CREATE VIEW ──────────────────────────────
  if (viewMode === "create") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setViewMode("list")}>
            ← Volver
          </Button>
          <h2 className="text-xl font-bold">Crear Torneo</h2>
        </div>

        {/* Basic info */}
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold text-lg">Datos del torneo</h3>

          <div className="space-y-2">
            <Label htmlFor="t-name">Nombre *</Label>
            <Input
              id="t-name"
              placeholder="Torneo Cuaresma 2026"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="t-desc">Descripción</Label>
            <Textarea
              id="t-desc"
              placeholder="Descripción opcional del torneo..."
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              maxLength={500}
              rows={2}
              className="resize-none"
            />
          </div>

          {/* Image upload */}
          <div className="space-y-2">
            <Label>Imagen del torneo (horizontal)</Label>
            {formImagePreview ? (
              <div className="relative">
                <img
                  src={formImagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={() => { setFormImage(null); setFormImagePreview(null); }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <label
                htmlFor="t-image"
                className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent/30 transition-colors"
              >
                <ImagePlus className="h-8 w-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">Haz clic para subir una imagen</span>
                <span className="text-xs text-muted-foreground/60 mt-1">JPG, PNG o WebP · Máx. 5MB</span>
                <input
                  id="t-image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleImageSelect}
                />
              </label>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="t-location">Ubicación</Label>
            <Input
              id="t-location"
              placeholder="Ej: Salón parroquial San Lorenzo, Sevilla"
              value={formLocation}
              onChange={(e) => setFormLocation(e.target.value)}
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="t-location-url">Enlace de ubicación (Google Maps)</Label>
            <Input
              id="t-location-url"
              placeholder="https://maps.google.com/..."
              value={formLocationUrl}
              onChange={(e) => setFormLocationUrl(e.target.value)}
              maxLength={500}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Fecha del torneo *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !formDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formDate ? format(formDate, "PPP", { locale: es }) : "Selecciona fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formDate}
                    onSelect={setFormDate}
                    locale={es}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="t-time">Hora</Label>
              <Input
                id="t-time"
                type="time"
                value={formTime}
                onChange={(e) => setFormTime(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="t-code">Código de acceso *</Label>
              <div className="flex gap-2">
                <Input
                  id="t-code"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value.toUpperCase().slice(0, 8))}
                  maxLength={8}
                  className="font-mono tracking-widest"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setFormCode(generateJoinCode())}
                  title="Generar código"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Round question selectors */}
        {TOURNAMENT_ROUNDS.map((round) => {
          const roundQs = roundQuestions[round.round];
          const available = questions.filter((q) => q.difficulty === round.difficulty);
          const isComplete = roundQs.length === QUESTIONS_PER_ROUND;

          return (
            <Card key={round.round} className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg">
                    Ronda {round.round}: {round.label}
                  </h3>
                  {isComplete && <Check className="w-5 h-5 text-green-500" />}
                </div>
                <span className={cn("text-sm font-medium", isComplete ? "text-green-600" : "text-muted-foreground")}>
                  {roundQs.length}/{QUESTIONS_PER_ROUND}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {available.length} preguntas disponibles de nivel {round.label}
              </p>

              <div className="space-y-2 max-h-[250px] overflow-y-auto">
                {available.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic py-2">
                    No hay preguntas de nivel {round.label}
                  </p>
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
                          "flex items-start gap-3 p-3 rounded-lg border bg-card transition-colors",
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
                            <span className="inline-flex items-center justify-center w-6 h-6 mr-2 text-xs font-bold text-primary-foreground bg-primary rounded-full">
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

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-2 pb-8">
          <Button variant="outline" onClick={() => setViewMode("list")}>Cancelar</Button>
          <Button
            onClick={() => createMutation.mutate()}
            disabled={!canCreate || createMutation.isPending}
            className="gap-2"
          >
            <Trophy className="h-4 w-4" />
            {createMutation.isPending ? "Creando..." : "Crear Torneo"}
          </Button>
        </div>
      </div>
    );
  }

  // ─── DETAIL VIEW ──────────────────────────────
  if (viewMode === "detail" && selectedTournament) {
    const t = tournaments.find((x) => x.id === selectedTournament.id) || selectedTournament;
    const pCount = participantCounts[t.id] || 0;
    const canEdit = t.status === "upcoming" || t.status === "draft";
    const isDraft = t.status === "draft";
    const questionsComplete = TOURNAMENT_ROUNDS.every(
      (r) => tournamentQuestions.filter((tq) => tq.round_number === r.round).length === QUESTIONS_PER_ROUND
    );
    const canSaveEdit = editName.trim().length >= 3 && editDate && editCode.trim().length >= 4;

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => { setSelectedTournament(null); setIsEditing(false); setViewMode("list"); }}>
            ← Volver
          </Button>
          <h2 className="text-xl font-bold flex-1">{t.name}</h2>
          {getStatusBadge(t.status)}
          {canEdit && !isEditing && (
            <Button variant="outline" size="sm" className="gap-2" onClick={() => startEditing(t)}>
              <Edit2 className="h-4 w-4" /> Editar
            </Button>
          )}
        </div>

        {/* Info card — Edit mode */}
        {isEditing ? (
          <Card className="p-6 space-y-4">
            <h3 className="font-semibold text-lg">Editar datos del torneo</h3>

            <div className="space-y-2">
              <Label htmlFor="edit-name">Nombre *</Label>
              <Input id="edit-name" value={editName} onChange={(e) => setEditName(e.target.value)} maxLength={100} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-desc">Descripción</Label>
              <Textarea id="edit-desc" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} maxLength={500} rows={2} className="resize-none" />
            </div>

            {/* Image */}
            <div className="space-y-2">
              <Label>Imagen del torneo</Label>
              {editImagePreview ? (
                <div className="relative">
                  <img src={editImagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg border" />
                  <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-8 w-8" onClick={() => { setEditImage(null); setEditImagePreview(null); }}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <label htmlFor="edit-image" className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent/30 transition-colors">
                  <ImagePlus className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">Haz clic para subir una imagen</span>
                  <input id="edit-image" type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleEditImageSelect} />
                </label>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-location">Ubicación</Label>
              <Input id="edit-location" value={editLocation} onChange={(e) => setEditLocation(e.target.value)} maxLength={200} placeholder="Ej: Salón parroquial San Lorenzo, Sevilla" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-location-url">Enlace de ubicación (Google Maps)</Label>
              <Input id="edit-location-url" value={editLocationUrl} onChange={(e) => setEditLocationUrl(e.target.value)} maxLength={500} placeholder="https://maps.google.com/..." />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Fecha *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !editDate && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editDate ? format(editDate, "PPP", { locale: es }) : "Selecciona fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={editDate} onSelect={setEditDate} locale={es} initialFocus className={cn("p-3 pointer-events-auto")} />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-time">Hora</Label>
                <Input id="edit-time" type="time" value={editTime} onChange={(e) => setEditTime(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-code">Código de acceso *</Label>
                <div className="flex gap-2">
                  <Input id="edit-code" value={editCode} onChange={(e) => setEditCode(e.target.value.toUpperCase().slice(0, 8))} maxLength={8} className="font-mono tracking-widest" />
                  <Button type="button" variant="outline" size="icon" onClick={() => setEditCode(generateJoinCode())} title="Generar código">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>Cancelar</Button>
              <Button onClick={() => updateMutation.mutate(t.id)} disabled={!canSaveEdit || updateMutation.isPending} className="gap-2">
                <Check className="h-4 w-4" />
                {updateMutation.isPending ? "Guardando..." : "Guardar cambios"}
              </Button>
            </div>
          </Card>
        ) : (
          /* Info card — Read mode */
          <Card className="overflow-hidden">
            {t.image_url && (
              <img src={t.image_url} alt={t.name} className="w-full h-48 object-cover" />
            )}
            <div className="p-6">
              {t.description && <p className="text-sm text-muted-foreground mb-4">{t.description}</p>}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-muted-foreground">Fecha</p>
                  <p className="font-bold">
                    {format(new Date(t.tournament_date + "T00:00:00"), "d MMM yyyy", { locale: es })}
                    {t.tournament_time ? ` · ${t.tournament_time.slice(0, 5)}` : ""}
                  </p>
                </div>
                {t.location && (
                  <div className="col-span-2 sm:col-span-1">
                    <p className="text-sm text-muted-foreground">Ubicación</p>
                    <p className="font-bold text-sm">{t.location}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Código</p>
                  <div className="flex items-center justify-center gap-1">
                    <p className="font-bold font-mono tracking-widest">{t.join_code}</p>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(t.join_code); toast.success("Código copiado"); }}>
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Participantes</p>
                  <p className="font-bold">{pCount}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ronda actual</p>
                  <p className="font-bold">{t.current_round === 0 ? "Sin iniciar" : `${t.current_round}/5`}</p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Draft banner */}
        {isDraft && (
          <Card className="p-4 border-yellow-500/30 bg-yellow-500/5">
            <div className="flex items-start gap-3">
              <Lock className="h-5 w-5 text-yellow-600 mt-0.5 shrink-0" />
              <div className="space-y-2 flex-1">
                <p className="text-sm font-medium text-yellow-800">
                  Este torneo está en borrador. Asigna las preguntas de las 5 rondas para poder programarlo.
                </p>
                {questionsComplete && (
                  <Button
                    size="sm"
                    className="gap-2"
                    onClick={async () => {
                      const { error } = await supabase
                        .from("tournaments")
                        .update({ status: "upcoming" })
                        .eq("id", t.id);
                      if (error) {
                        toast.error("Error al programar el torneo");
                      } else {
                        queryClient.invalidateQueries({ queryKey: ["admin-tournaments"] });
                        toast.success("Torneo programado correctamente. Ya es visible para los jugadores.");
                      }
                    }}
                  >
                    <Trophy className="h-4 w-4" /> Programar torneo
                  </Button>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Round controls */}
        <Card className="p-6 space-y-4">
          <h3 className="font-bold text-lg">Control de rondas</h3>
          <div className="space-y-3">
            {TOURNAMENT_ROUNDS.map((round) => {
              const isUnlocked = t.current_round >= round.round;
              const isNext = t.current_round === round.round - 1;
              const questionsInRound = tournamentQuestions.filter((tq) => tq.round_number === round.round).length;

              return (
                <div
                  key={round.round}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-lg border",
                    isUnlocked ? "bg-green-500/5 border-green-500/30" : "bg-muted/30"
                  )}
                >
                  <div className="flex items-center gap-3">
                    {isUnlocked ? (
                      <Unlock className="h-5 w-5 text-green-600" />
                    ) : (
                      <Lock className="h-5 w-5 text-muted-foreground" />
                    )}
                    <div>
                      <p className="font-semibold">
                        Ronda {round.round}: {round.label}
                      </p>
                      <p className="text-xs text-muted-foreground">{questionsInRound} preguntas</p>
                    </div>
                  </div>

                  {isNext && t.status !== "completed" && !isDraft && (
                    <Button
                      size="sm"
                      onClick={() => advanceRoundMutation.mutate({ id: t.id, newRound: round.round })}
                      disabled={advanceRoundMutation.isPending}
                      className="gap-2"
                    >
                      <Unlock className="h-4 w-4" />
                      Desbloquear
                    </Button>
                  )}
                  {isUnlocked && (
                    <Badge variant="outline" className="bg-green-500/10 text-green-700">Desbloqueada</Badge>
                  )}
                </div>
              );
            })}
          </div>

          {/* Finalize button */}
          {t.current_round === 5 && t.status !== "completed" && (
            <Button
              className="w-full gap-2"
              variant="default"
              onClick={() => advanceRoundMutation.mutate({ id: t.id, newRound: 6 })}
              disabled={advanceRoundMutation.isPending}
            >
              <Trophy className="h-4 w-4" /> Finalizar Torneo
            </Button>
          )}
        </Card>

        {/* Danger zone */}
        <Card className="p-6 border-destructive/30">
          <h3 className="font-bold text-destructive mb-3">Zona de peligro</h3>
          <Button
            variant="destructive"
            size="sm"
            className="gap-2"
            onClick={() => setDeleteConfirm(t.id)}
          >
            <Trash2 className="h-4 w-4" /> Eliminar torneo
          </Button>
        </Card>

        {/* Delete confirmation dialog */}
        <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>¿Eliminar torneo?</DialogTitle>
              <DialogDescription>
                Se eliminarán todas las preguntas, participantes y respuestas asociadas. Esta acción no se puede deshacer.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancelar</Button>
              <Button
                variant="destructive"
                onClick={() => deleteConfirm && deleteMutation.mutate(deleteConfirm)}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? "Eliminando..." : "Eliminar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return null;
};

export default TournamentManager;
