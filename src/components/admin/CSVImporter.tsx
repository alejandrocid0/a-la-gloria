import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Papa from "papaparse";

// Categorías predefinidas del banco de preguntas
const PREDEFINED_CATEGORIES = [
  "Advocaciones del Cristo",
  "Advocaciones de la Virgen",
  "Sedes canónicas",
  "Sedes históricas",
  "Sedes de refugio",
  "Fechas y años",
  "Días de procesión",
  "Días de salida históricos",
  "Capataces",
  "Autores de Cristos",
  "Autores de Vírgenes",
  "Bandas de Cristo",
  "Bandas de palio",
  "Hermandades que procesionan",
  "Vía Crucis del Consejo",
  "Nazarenos",
  "Hermandades (general)",
  "Restauraciones",
];

interface CSVRow {
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  difficulty?: string;
}

export const CSVImporter = () => {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [preview, setPreview] = useState<CSVRow[]>([]);
  const [categoryMode, setCategoryMode] = useState<string>("auto");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [customCategories, setCustomCategories] = useState<string[]>([]);

  // Cargar categorías personalizadas desde la BD
  useEffect(() => {
    const fetchCustomCategories = async () => {
      const { data } = await supabase
        .from('questions')
        .select('category')
        .not('category', 'is', null);
      if (data) {
        const unique = [...new Set(data.map(q => q.category).filter(Boolean))] as string[];
        // Filtrar las que ya están en predefinidas
        const custom = unique.filter(c => !PREDEFINED_CATEGORIES.includes(c));
        setCustomCategories(custom);
      }
    };
    fetchCustomCategories();
  }, []);

  const allCategories = [...PREDEFINED_CATEGORIES, ...customCategories];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      previewCSV(selectedFile);
    }
  };

  const previewCSV = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as CSVRow[];
        setPreview(data.slice(0, 3));
      },
      error: (error) => {
        toast.error(`Error al leer el archivo: ${error.message}`);
      },
    });
  };

  const getSelectedCategory = (): string | null => {
    if (categoryMode === "auto") return null;
    if (categoryMode === "new") return newCategoryName.trim() || null;
    return categoryMode; // es el nombre de la categoría existente
  };

  const handleImport = async () => {
    if (!file) {
      toast.error("Por favor selecciona un archivo CSV");
      return;
    }

    if (categoryMode === "new" && !newCategoryName.trim()) {
      toast.error("Escribe el nombre de la nueva categoría");
      return;
    }

    setImporting(true);
    const categoryValue = getSelectedCategory();

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const data = results.data as CSVRow[];
          
          const questions = data.map((row) => {
            const correctAnswer = parseInt(row.correct_answer);
            
            if (!row.question_text || !row.option_a || !row.option_b || 
                !row.option_c || !row.option_d || isNaN(correctAnswer)) {
              throw new Error(`Fila inválida: ${JSON.stringify(row)}`);
            }

            if (correctAnswer < 1 || correctAnswer > 4) {
              throw new Error(`Respuesta correcta debe ser 1-4, encontrado: ${correctAnswer}`);
            }

            return {
              question_text: row.question_text.trim(),
              option_a: row.option_a.trim(),
              option_b: row.option_b.trim(),
              option_c: row.option_c.trim(),
              option_d: row.option_d.trim(),
              correct_answer: correctAnswer,
              difficulty: row.difficulty?.trim() || null,
              ...(categoryValue ? { category: categoryValue } : {}),
            };
          });

          // Obtener textos existentes para detectar duplicados
          const textsToCheck = questions.map(q => q.question_text);
          const existingTexts = new Set<string>();
          
          for (let i = 0; i < textsToCheck.length; i += 500) {
            const batch = textsToCheck.slice(i, i + 500);
            const { data: existing, error: fetchError } = await supabase
              .from('questions')
              .select('question_text')
              .in('question_text', batch);
            
            if (fetchError) throw fetchError;
            existing?.forEach(q => existingTexts.add(q.question_text));
          }

          const newQuestions = questions.filter(q => !existingTexts.has(q.question_text));
          const skippedCount = questions.length - newQuestions.length;

          if (newQuestions.length > 0) {
            const { error } = await supabase
              .from('questions')
              .insert(newQuestions);
            if (error) throw error;
          }

          if (skippedCount > 0 && newQuestions.length > 0) {
            toast.success(`✅ ${newQuestions.length} insertadas, ${skippedCount} omitidas (duplicadas)`);
          } else if (newQuestions.length > 0) {
            toast.success(`✅ ${newQuestions.length} preguntas importadas correctamente`);
          } else {
            toast.info(`ℹ️ Todas las ${skippedCount} preguntas ya existían, ninguna insertada`);
          }
          setFile(null);
          setPreview([]);
          setCategoryMode("auto");
          setNewCategoryName("");
          
          const input = document.getElementById('csv-input') as HTMLInputElement;
          if (input) input.value = '';

        } catch (error: any) {
          console.error('Error importing questions:', error);
          toast.error(`Error al importar: ${error.message}`);
        } finally {
          setImporting(false);
        }
      },
      error: (error) => {
        toast.error(`Error al procesar el archivo: ${error.message}`);
        setImporting(false);
      },
    });
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Upload className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Importar Preguntas desde CSV</h3>
        </div>

        <div className="space-y-2">
          <Label htmlFor="csv-input">Seleccionar archivo CSV</Label>
          <Input
            id="csv-input"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            disabled={importing}
          />
          <p className="text-sm text-muted-foreground">
            Columnas: question_text, option_a, option_b, option_c, option_d, correct_answer (1-4), difficulty (opcional)
          </p>
        </div>

        {/* Selector de categoría */}
        <div className="space-y-2">
          <Label>Categoría de destino</Label>
          <Select value={categoryMode} onValueChange={setCategoryMode}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Automática (por patrón de texto)</SelectItem>
              {allCategories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
              <SelectItem value="new">+ Crear nueva categoría...</SelectItem>
            </SelectContent>
          </Select>
          {categoryMode === "new" && (
            <Input
              placeholder="Nombre de la nueva categoría"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
            />
          )}
          {categoryMode !== "auto" && categoryMode !== "new" && (
            <p className="text-xs text-muted-foreground">
              Todas las preguntas se asignarán a la categoría "{categoryMode}"
            </p>
          )}
        </div>

        {preview.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <FileText className="h-4 w-4" />
              Vista previa (primeras 3 filas):
            </div>
            <div className="bg-muted p-3 rounded-md space-y-2 text-xs max-h-48 overflow-y-auto">
              {preview.map((row, idx) => (
                <div key={idx} className="pb-2 border-b border-border last:border-0">
                  <p className="font-medium">{row.question_text}</p>
                  <p className="text-muted-foreground">A: {row.option_a}</p>
                  <p className="text-muted-foreground">B: {row.option_b}</p>
                  <p className="text-muted-foreground">C: {row.option_c}</p>
                  <p className="text-muted-foreground">D: {row.option_d}</p>
                  <p className="text-primary">Correcta: {row.correct_answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <Button
          onClick={handleImport}
          disabled={!file || importing}
          className="w-full"
        >
          {importing ? (
            <>
              <AlertCircle className="mr-2 h-4 w-4 animate-spin" />
              Importando...
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Importar Preguntas
            </>
          )}
        </Button>
      </div>
    </Card>
  );
};
