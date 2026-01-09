import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, Eye, Clock, MessageSquare, Trash2, Download } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Papa from "papaparse";

type FeedbackStatus = 'pending' | 'read' | 'resolved';

interface FeedbackItem {
  id: string;
  user_id: string;
  message: string;
  status: FeedbackStatus;
  created_at: string;
  updated_at: string;
  user_name?: string;
  user_email?: string;
}

const statusConfig: Record<FeedbackStatus, { label: string; icon: typeof Clock; variant: "default" | "secondary" | "outline" }> = {
  pending: { label: "Pendiente", icon: Clock, variant: "default" },
  read: { label: "Leído", icon: Eye, variant: "secondary" },
  resolved: { label: "Resuelto", icon: CheckCircle, variant: "outline" },
};

export const FeedbackList = () => {
  const queryClient = useQueryClient();

  // Cargar feedback con nombre del usuario
  const { data: feedbackList = [], isLoading } = useQuery({
    queryKey: ['admin-feedback'],
    queryFn: async () => {
      // Primero obtenemos el feedback
      const { data: feedback, error } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Luego obtenemos los perfiles para los user_ids únicos
      const userIds = [...new Set(feedback.map(f => f.user_id))];
      
      const { data: profiles } = await supabase
        .rpc('get_public_profiles');

      // Crear mapa de user_id a datos del usuario
      const userMap = new Map(
        profiles?.map(p => [p.id, { name: p.name, email: (p as any).email || '' }]) || []
      );

      // Combinar feedback con datos de usuario
      return feedback.map(f => ({
        ...f,
        user_name: userMap.get(f.user_id)?.name || 'Usuario desconocido',
        user_email: userMap.get(f.user_id)?.email || '',
      })) as FeedbackItem[];
    },
  });

  // Mutación para cambiar estado
  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: FeedbackStatus }) => {
      const { error } = await supabase
        .from('feedback')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-feedback'] });
      toast.success("Estado actualizado");
    },
    onError: () => {
      toast.error("Error al actualizar el estado");
    },
  });

  // Mutación para eliminar feedback
  const deleteFeedback = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('feedback')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-feedback'] });
      toast.success("Feedback eliminado");
    },
    onError: () => {
      toast.error("Error al eliminar el feedback");
    },
  });

  const getNextStatus = (current: FeedbackStatus): FeedbackStatus => {
    if (current === 'pending') return 'read';
    if (current === 'read') return 'resolved';
    return 'pending';
  };

  const handleExportCSV = () => {
    const csvData = feedbackList.map(f => ({
      'Nombre': f.user_name,
      'Email': f.user_email,
      'Mensaje': f.message,
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `feedback_alagloria_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success("Feedback exportado correctamente");
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  if (feedbackList.length === 0) {
    return (
      <Card className="p-8 text-center">
        <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No hay sugerencias todavía</p>
        <p className="text-sm text-muted-foreground mt-2">
          Los usuarios podrán enviar feedback desde la pantalla principal
        </p>
      </Card>
    );
  }

  // Agrupar por estado
  const pendingCount = feedbackList.filter(f => f.status === 'pending').length;
  const readCount = feedbackList.filter(f => f.status === 'read').length;
  const resolvedCount = feedbackList.filter(f => f.status === 'resolved').length;

  return (
    <div className="space-y-6">
      {/* Botón exportar */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={handleExportCSV}
          disabled={feedbackList.length === 0}
        >
          <Download className="w-4 h-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 text-center bg-yellow-50 border-yellow-200">
          <p className="text-2xl font-bold text-yellow-700">{pendingCount}</p>
          <p className="text-sm text-yellow-600">Pendientes</p>
        </Card>
        <Card className="p-4 text-center bg-blue-50 border-blue-200">
          <p className="text-2xl font-bold text-blue-700">{readCount}</p>
          <p className="text-sm text-blue-600">Leídos</p>
        </Card>
        <Card className="p-4 text-center bg-green-50 border-green-200">
          <p className="text-2xl font-bold text-green-700">{resolvedCount}</p>
          <p className="text-sm text-green-600">Resueltos</p>
        </Card>
      </div>

      {/* Lista de feedback */}
      <div className="space-y-4">
        {feedbackList.map((feedback) => {
          const config = statusConfig[feedback.status as FeedbackStatus];
          const StatusIcon = config.icon;

          return (
            <Card key={feedback.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-sm">{feedback.user_name}</span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(feedback.created_at), "d MMM yyyy, HH:mm", { locale: es })}
                    </span>
                  </div>
                  <p className="text-foreground whitespace-pre-wrap break-words">
                    {feedback.message}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <Badge variant={config.variant} className="flex items-center gap-1">
                    <StatusIcon className="w-3 h-3" />
                    {config.label}
                  </Badge>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateStatus.mutate({ 
                        id: feedback.id, 
                        status: getNextStatus(feedback.status as FeedbackStatus) 
                      })}
                      disabled={updateStatus.isPending}
                    >
                      {feedback.status === 'pending' && 'Marcar leído'}
                      {feedback.status === 'read' && 'Marcar resuelto'}
                      {feedback.status === 'resolved' && 'Reabrir'}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteFeedback.mutate(feedback.id)}
                      disabled={deleteFeedback.isPending}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
