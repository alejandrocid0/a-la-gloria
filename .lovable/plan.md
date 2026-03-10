

## Plan: Contador de completados por ronda en el panel admin

### Cambio

En la vista de detalle del torneo (`TournamentManager.tsx`), añadir una query que consulte `tournament_answers` agrupando por `round_number` para contar cuántos usuarios distintos han completado cada ronda. Mostrar ese dato junto a cada ronda en la sección "Control de rondas".

### Detalle técnico

1. **Nueva query** en la vista de detalle (dentro de `TournamentManager`):
   ```typescript
   const { data: roundCompletions = {} } = useQuery({
     queryKey: ["tournament-round-completions", selectedTournament?.id],
     enabled: !!selectedTournament && selectedTournament.status !== "draft",
     refetchInterval: 5000,
     queryFn: async () => {
       const { data, error } = await supabase
         .from("tournament_answers")
         .select("user_id, round_number")
         .eq("tournament_id", selectedTournament!.id);
       if (error) throw error;
       // Count distinct users per round
       const counts: Record<number, number> = {};
       const seen: Record<number, Set<string>> = {};
       data.forEach((row) => {
         if (!seen[row.round_number]) seen[row.round_number] = new Set();
         seen[row.round_number].add(row.user_id);
       });
       Object.entries(seen).forEach(([round, users]) => {
         counts[Number(round)] = users.size;
       });
       return counts;
     },
   });
   ```

2. **Mostrar en cada fila de ronda** (líneas ~954-958), debajo de "X preguntas", añadir el texto de completados cuando la ronda está desbloqueada:
   ```
   Ronda 1: Kanicofrade
   10 preguntas · 12/25 jugadores completados
   ```

3. **Auto-refresco**: La query usa `refetchInterval: 5000` para que durante el torneo en vivo el admin vea el progreso sin recargar.

No requiere cambios en base de datos; las RLS de `tournament_answers` ya permiten lectura a admins.

