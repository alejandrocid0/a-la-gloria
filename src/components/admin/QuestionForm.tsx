import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { questionSchema } from "@/lib/validations";
import { Plus, X } from "lucide-react";

interface QuestionFormProps {
  onSuccess: () => void;
  editQuestion?: {
    id: string;
    question_text: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    correct_answer: number;
    difficulty: string;
  };
  onCancelEdit?: () => void;
}

const QuestionForm = ({ onSuccess, editQuestion, onCancelEdit }: QuestionFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState<string>(
    editQuestion?.correct_answer.toString() || ""
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      question_text: formData.get('question_text') as string,
      option_a: formData.get('option_a') as string,
      option_b: formData.get('option_b') as string,
      option_c: formData.get('option_c') as string,
      option_d: formData.get('option_d') as string,
      correct_answer: parseInt(correctAnswer),
      difficulty: formData.get('difficulty') as string,
    };

    // Validar con Zod
    const validation = questionSchema.safeParse(data);
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      setIsLoading(false);
      return;
    }

    try {
      const questionData = {
        question_text: validation.data.question_text,
        option_a: validation.data.option_a,
        option_b: validation.data.option_b,
        option_c: validation.data.option_c,
        option_d: validation.data.option_d,
        correct_answer: validation.data.correct_answer,
        difficulty: validation.data.difficulty,
      };

      if (editQuestion) {
        // Actualizar pregunta existente
        const { error } = await supabase
          .from('questions')
          .update(questionData)
          .eq('id', editQuestion.id);

        if (error) throw error;
        toast.success('Pregunta actualizada con éxito');
      } else {
        // Crear nueva pregunta
        const { error } = await supabase
          .from('questions')
          .insert([questionData]);

        if (error) throw error;
        toast.success('Pregunta creada con éxito');
        
        // Limpiar formulario
        (e.target as HTMLFormElement).reset();
        setCorrectAnswer("");
      }

      onSuccess();
    } catch (error) {
      console.error('Error guardando pregunta:', error);
      toast.error('Error al guardar la pregunta');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">
          {editQuestion ? 'Editar Pregunta' : 'Crear Nueva Pregunta'}
        </h2>
        {editQuestion && onCancelEdit && (
          <Button variant="ghost" size="sm" onClick={onCancelEdit}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Pregunta */}
        <div className="space-y-2">
          <Label htmlFor="question_text">Pregunta *</Label>
          <Textarea
            id="question_text"
            name="question_text"
            placeholder="¿Cuál es la hermandad más antigua de Sevilla?"
            required
            rows={3}
            defaultValue={editQuestion?.question_text}
            className="resize-none"
          />
        </div>

        {/* Opciones con radio buttons integrados */}
        <div className="space-y-4">
          <Label>Opciones de respuesta *</Label>
          <RadioGroup value={correctAnswer} onValueChange={setCorrectAnswer} required>
            <div className="space-y-3">
              {/* Opción A */}
              <div className="flex items-center gap-3">
                <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-accent/5 cursor-pointer min-w-[140px]">
                  <RadioGroupItem value="1" id="correct-a" />
                  <Label htmlFor="correct-a" className="cursor-pointer font-semibold">Correcta</Label>
                </div>
                <div className="flex-1 space-y-1">
                  <Label htmlFor="option_a" className="text-sm font-normal">Opción A</Label>
                  <Input
                    id="option_a"
                    name="option_a"
                    placeholder="Primera opción"
                    required
                    defaultValue={editQuestion?.option_a}
                  />
                </div>
              </div>

              {/* Opción B */}
              <div className="flex items-center gap-3">
                <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-accent/5 cursor-pointer min-w-[140px]">
                  <RadioGroupItem value="2" id="correct-b" />
                  <Label htmlFor="correct-b" className="cursor-pointer font-semibold">Correcta</Label>
                </div>
                <div className="flex-1 space-y-1">
                  <Label htmlFor="option_b" className="text-sm font-normal">Opción B</Label>
                  <Input
                    id="option_b"
                    name="option_b"
                    placeholder="Segunda opción"
                    required
                    defaultValue={editQuestion?.option_b}
                  />
                </div>
              </div>

              {/* Opción C */}
              <div className="flex items-center gap-3">
                <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-accent/5 cursor-pointer min-w-[140px]">
                  <RadioGroupItem value="3" id="correct-c" />
                  <Label htmlFor="correct-c" className="cursor-pointer font-semibold">Correcta</Label>
                </div>
                <div className="flex-1 space-y-1">
                  <Label htmlFor="option_c" className="text-sm font-normal">Opción C</Label>
                  <Input
                    id="option_c"
                    name="option_c"
                    placeholder="Tercera opción"
                    required
                    defaultValue={editQuestion?.option_c}
                  />
                </div>
              </div>

              {/* Opción D */}
              <div className="flex items-center gap-3">
                <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-accent/5 cursor-pointer min-w-[140px]">
                  <RadioGroupItem value="4" id="correct-d" />
                  <Label htmlFor="correct-d" className="cursor-pointer font-semibold">Correcta</Label>
                </div>
                <div className="flex-1 space-y-1">
                  <Label htmlFor="option_d" className="text-sm font-normal">Opción D</Label>
                  <Input
                    id="option_d"
                    name="option_d"
                    placeholder="Cuarta opción"
                    required
                    defaultValue={editQuestion?.option_d}
                  />
                </div>
              </div>
            </div>
          </RadioGroup>
        </div>

        {/* Dificultad */}
        <div className="space-y-2">
          <Label htmlFor="difficulty">Dificultad *</Label>
          <Select name="difficulty" required defaultValue={editQuestion?.difficulty}>
            <SelectTrigger id="difficulty">
              <SelectValue placeholder="Selecciona la dificultad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="kanicofrade">Kanicofrade</SelectItem>
              <SelectItem value="nazareno">Nazareno</SelectItem>
              <SelectItem value="costalero">Costalero</SelectItem>
              <SelectItem value="capataz">Capataz</SelectItem>
              <SelectItem value="maestro">Maestro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Botones */}
        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            className="flex-1"
            disabled={isLoading || !correctAnswer}
          >
            {isLoading ? (
              "Guardando..."
            ) : (
              <>
                {editQuestion ? "Actualizar" : <><Plus className="h-4 w-4 mr-2" /> Crear Pregunta</>}
              </>
            )}
          </Button>
          {editQuestion && onCancelEdit && (
            <Button type="button" variant="outline" onClick={onCancelEdit}>
              Cancelar
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
};

export default QuestionForm;
