import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  CheckCircle, 
  Clock, 
  MessageSquare, 
  Trash2, 
  Download,
  AlertCircle,
  Lightbulb,
  Heart,
  Archive,
  ArrowLeft
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Papa from "papaparse";

type FeedbackStatus = 'pending' | 'errors' | 'ideas' | 'compliments' | 'resolved' | 'archived';

interface FeedbackItem {
  id: string;
  user_id: string;
  message: string;
  status: string;
  created_at: string;
  updated_at: string;
  user_name?: string;
  user_email?: string;
}

const statusConfig: Record<FeedbackStatus, { 
  label: string; 
  icon: typeof Clock; 
  variant: "default" | "destructive" | "secondary" | "outline";
  bgColor: string;
  borderColor: string;
  textColor: string;
  iconColor: string;
}> = {
  pending: { 
    label: "Pendiente", 
    icon: Clock, 
    variant: "default",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    textColor: "text-yellow-700",
    iconColor: "text-yellow-600"
  },
  errors: { 
    label: "Errores", 
    icon: AlertCircle, 
    variant: "destructive",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    textColor: "text-red-700",
    iconColor: "text-red-600"
  },
  ideas: { 
    label: "Ideas", 
    icon: Lightbulb, 
    variant: "secondary",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    textColor: "text-blue-700",
    iconColor: "text-blue-600"
  },
  compliments: { 
    label: "Halagos", 
    icon: Heart, 
    variant: "outline",
    bgColor: "bg-pink-50",
    borderColor: "border-pink-200",
    textColor: "text-pink-700",
    iconColor: "text-pink-600"
  },
  resolved: { 
    label: "Resuelto", 
    icon: CheckCircle, 
    variant: "outline",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    textColor: "text-green-700",
    iconColor: "text-green-600"
  },
  archived: { 
    label: "Archivado", 
    icon: Archive, 
    variant: "secondary",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-300",
    textColor: "text-gray-700",
    iconColor: "text-gray-500"
  },
};

// Helper para obtener config de estado con fallback seguro
const getStatusConfig = (status: string) => {
  return statusConfig[status as FeedbackStatus] ?? statusConfig.pending;
};

export const FeedbackList = () => {
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState<FeedbackStatus | null>(null);

  // Cargar feedback con nombre del usuario
  const { data: feedbackList = [], isLoading } = useQuery({
    queryKey: ['admin-feedback'],
    queryFn: async () => {
      const { data: feedback, error } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const userIds = [...new Set(feedback.map(f => f.user_id))];
      
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, email')
        .in('id', userIds);

      const userMap = new Map(
        profiles?.map(p => [p.id, { name: p.name, email: p.email }]) || []
      );

      return feedback.map(f => ({
        ...f,
        user_name: userMap.get(f.user_id)?.name || 'Usuario desconocido',
        user_email: userMap.get(f.user_id)?.email || '',
      })) as FeedbackItem[];
    },
  });

  // Mutación para cambiar estado
  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
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

  const handleExportCSV = () => {
    const csvData = feedbackList.map(f => ({
      'Nombre': f.user_name,
      'Email': f.user_email,
      'Mensaje': f.message,
      'Estado': getStatusConfig(f.status).label,
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

  // Contar por estado (6 categorías)
  const pendingCount = feedbackList.filter(f => f.status === 'pending').length;
  const errorsCount = feedbackList.filter(f => f.status === 'errors').length;
  const ideasCount = feedbackList.filter(f => f.status === 'ideas').length;
  const complimentsCount = feedbackList.filter(f => f.status === 'compliments').length;
  const resolvedCount = feedbackList.filter(f => f.status === 'resolved').length;
  const archivedCount = feedbackList.filter(f => f.status === 'archived').length;

  // Filtrar lista según categoría activa
  const displayedFeedback = activeFilter
    ? feedbackList.filter(f => f.status === activeFilter)
    : feedbackList.filter(f => f.status !== 'archived');

  return (
    <div className="space-y-6">
      {/* Header con botón volver y exportar */}
      <div className="flex justify-between items-center">
        {activeFilter ? (
          <Button
            variant="ghost"
            onClick={() => setActiveFilter(null)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a la lista
          </Button>
        ) : (
          <div />
        )}
        <Button
          variant="outline"
          onClick={handleExportCSV}
          disabled={feedbackList.length === 0}
        >
          <Download className="w-4 h-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      {/* Título de vista filtrada */}
      {activeFilter && (
        <div className="flex items-center gap-2" style={{ color: getStatusConfig(activeFilter).textColor.replace('text-', '') }}>
          {(() => {
            const config = getStatusConfig(activeFilter);
            const Icon = config.icon;
            return <Icon className={`w-5 h-5 ${config.iconColor}`} />;
          })()}
          <h2 className="text-lg font-semibold">Feedback: {getStatusConfig(activeFilter).label}</h2>
        </div>
      )}

      {/* Resumen - 6 categorías clickeables */}
      <div className="grid grid-cols-6 gap-3">
        <Card 
          className={`p-3 text-center bg-yellow-50 border-yellow-200 cursor-pointer transition-all hover:bg-yellow-100 ${activeFilter === 'pending' ? 'ring-2 ring-yellow-400' : ''}`}
          onClick={() => setActiveFilter(activeFilter === 'pending' ? null : 'pending')}
        >
          <Clock className="w-4 h-4 mx-auto mb-1 text-yellow-600" />
          <p className="text-xl font-bold text-yellow-700">{pendingCount}</p>
          <p className="text-xs text-yellow-600">Pendientes</p>
        </Card>
        <Card 
          className={`p-3 text-center bg-red-50 border-red-200 cursor-pointer transition-all hover:bg-red-100 ${activeFilter === 'errors' ? 'ring-2 ring-red-400' : ''}`}
          onClick={() => setActiveFilter(activeFilter === 'errors' ? null : 'errors')}
        >
          <AlertCircle className="w-4 h-4 mx-auto mb-1 text-red-600" />
          <p className="text-xl font-bold text-red-700">{errorsCount}</p>
          <p className="text-xs text-red-600">Errores</p>
        </Card>
        <Card 
          className={`p-3 text-center bg-blue-50 border-blue-200 cursor-pointer transition-all hover:bg-blue-100 ${activeFilter === 'ideas' ? 'ring-2 ring-blue-400' : ''}`}
          onClick={() => setActiveFilter(activeFilter === 'ideas' ? null : 'ideas')}
        >
          <Lightbulb className="w-4 h-4 mx-auto mb-1 text-blue-600" />
          <p className="text-xl font-bold text-blue-700">{ideasCount}</p>
          <p className="text-xs text-blue-600">Ideas</p>
        </Card>
        <Card 
          className={`p-3 text-center bg-pink-50 border-pink-200 cursor-pointer transition-all hover:bg-pink-100 ${activeFilter === 'compliments' ? 'ring-2 ring-pink-400' : ''}`}
          onClick={() => setActiveFilter(activeFilter === 'compliments' ? null : 'compliments')}
        >
          <Heart className="w-4 h-4 mx-auto mb-1 text-pink-600" />
          <p className="text-xl font-bold text-pink-700">{complimentsCount}</p>
          <p className="text-xs text-pink-600">Halagos</p>
        </Card>
        <Card 
          className={`p-3 text-center bg-green-50 border-green-200 cursor-pointer transition-all hover:bg-green-100 ${activeFilter === 'resolved' ? 'ring-2 ring-green-400' : ''}`}
          onClick={() => setActiveFilter(activeFilter === 'resolved' ? null : 'resolved')}
        >
          <CheckCircle className="w-4 h-4 mx-auto mb-1 text-green-600" />
          <p className="text-xl font-bold text-green-700">{resolvedCount}</p>
          <p className="text-xs text-green-600">Resueltos</p>
        </Card>
        <Card 
          className={`p-3 text-center bg-gray-50 border-gray-300 cursor-pointer transition-all hover:bg-gray-100 ${activeFilter === 'archived' ? 'ring-2 ring-gray-400' : ''}`}
          onClick={() => setActiveFilter(activeFilter === 'archived' ? null : 'archived')}
        >
          <Archive className="w-4 h-4 mx-auto mb-1 text-gray-500" />
          <p className="text-xl font-bold text-gray-700">{archivedCount}</p>
          <p className="text-xs text-gray-600">Archivados</p>
        </Card>
      </div>

      {/* Lista de feedback */}
      <div className="space-y-4">
        {displayedFeedback.length === 0 ? (
          <Card className="p-8 text-center">
            {(() => {
              const config = activeFilter ? getStatusConfig(activeFilter) : null;
              const Icon = config?.icon || MessageSquare;
              return <Icon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />;
            })()}
            <p className="text-muted-foreground">
              {activeFilter 
                ? `No hay feedback en "${getStatusConfig(activeFilter).label}"` 
                : "No hay feedback en esta vista"}
            </p>
          </Card>
        ) : (
          displayedFeedback.map((feedback) => {
            const config = getStatusConfig(feedback.status);
            const StatusIcon = config.icon;

            return (
              <Card key={feedback.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-sm">{feedback.user_name}</span>
                      {feedback.user_email && (
                        <span className="text-xs text-muted-foreground">({feedback.user_email})</span>
                      )}
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
                    <div className="flex gap-2 items-center">
                      <Select
                        value={feedback.status}
                        onValueChange={(value) => updateStatus.mutate({ 
                          id: feedback.id, 
                          status: value 
                        })}
                        disabled={updateStatus.isPending}
                      >
                        <SelectTrigger className="w-[140px] h-8 text-xs">
                          <SelectValue placeholder="Cambiar estado" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover">
                          <SelectItem value="pending">
                            <span className="flex items-center gap-2">
                              <Clock className="w-3 h-3 text-yellow-600" />
                              Pendiente
                            </span>
                          </SelectItem>
                          <SelectItem value="errors">
                            <span className="flex items-center gap-2">
                              <AlertCircle className="w-3 h-3 text-red-600" />
                              Errores
                            </span>
                          </SelectItem>
                          <SelectItem value="ideas">
                            <span className="flex items-center gap-2">
                              <Lightbulb className="w-3 h-3 text-blue-600" />
                              Ideas
                            </span>
                          </SelectItem>
                          <SelectItem value="compliments">
                            <span className="flex items-center gap-2">
                              <Heart className="w-3 h-3 text-pink-600" />
                              Halagos
                            </span>
                          </SelectItem>
                          <SelectItem value="resolved">
                            <span className="flex items-center gap-2">
                              <CheckCircle className="w-3 h-3 text-green-600" />
                              Resuelto
                            </span>
                          </SelectItem>
                          <SelectItem value="archived">
                            <span className="flex items-center gap-2">
                              <Archive className="w-3 h-3 text-gray-500" />
                              Archivado
                            </span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
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
          })
        )}
      </div>
    </div>
  );
};
