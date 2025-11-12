import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Papa from "papaparse";

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
        setPreview(data.slice(0, 3)); // Mostrar solo las primeras 3 filas
      },
      error: (error) => {
        toast.error(`Error al leer el archivo: ${error.message}`);
      },
    });
  };

  const handleImport = async () => {
    if (!file) {
      toast.error("Por favor selecciona un archivo CSV");
      return;
    }

    setImporting(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const data = results.data as CSVRow[];
          
          // Validar y transformar datos
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
            };
          });

          // Insertar en la base de datos
          const { error } = await supabase
            .from('questions')
            .insert(questions);

          if (error) throw error;

          toast.success(`✅ ${questions.length} preguntas importadas correctamente`);
          setFile(null);
          setPreview([]);
          
          // Resetear el input
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
            El CSV debe contener las columnas: question_text, option_a, option_b, option_c, option_d, correct_answer (1-4), difficulty (opcional)
          </p>
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
