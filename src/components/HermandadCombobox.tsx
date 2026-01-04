import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Lista de hermandades de Sevilla (77 hermandades ordenadas alfabéticamente)
const HERMANDADES = [
  "Bendición y Esperanza", "Cristo de Burgos", "Divino Perdón de Alcosa", 
  "Dulce Nombre (Bellavista)", "El Amor", "El Baratillo", "El Buen Fin", 
  "El Cachorro", "El Calvario", "El Carmen", "El Cerro", 
  "El Dulce Nombre", "El Museo", "El Santo Entierro", "El Silencio", 
  "El Sol", "El Valle", "Esperanza de Triana", "Gran Poder", 
  "Jesús Despojado", "La Amargura", "La Borriquita", "La Candelaria", 
  "La Carretería", "La Cena", "La Corona", "La Espiga", "La Estrella", 
  "La Exaltación", "La Hiniesta", "La Lanzada", "La Macarena", 
  "La Milagrosa", "La Misión", "La Mortaja", "La O", "La Paz", 
  "La Quinta Angustia", "La Resurrección", "La Sed", "La Trinidad", 
  "Las Aguas", "Las Cigarreras", "Las Maravillas", "Las Penas", 
  "Las Siete Palabras", "Los Desamparados de Santo Ángel", "Los Estudiantes", 
  "Los Gitanos", "Los Javieres", "Los Negritos", "Los Panaderos", 
  "Los Servitas", "Montesión", "Montserrat", "Padre Pío", "Pasión", 
  "Pasión y Muerte", "Paz y Misericordia", "Pino Montano", "Redención", 
  "San Benito", "San Bernardo", "San Esteban", "San Gonzalo", 
  "San Isidoro", "San Jerónimo", "San José Obrero", "San Pablo", 
  "San Roque", "Santa Cruz", "Santa Genoveva", "Santa Marta", 
  "Soledad de San Buenaventura", "Soledad de San Lorenzo", "Torreblanca", 
  "Vera Cruz"
];

interface HermandadComboboxProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function HermandadCombobox({ value, onValueChange }: HermandadComboboxProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Seleccionar hermandad"
          className="w-full h-12 justify-between font-normal"
        >
          <span className={cn("truncate", !value && "text-muted-foreground")}>
            {value || "Buscar hermandad..."}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder="Escribe para buscar..." />
          <CommandList className="max-h-[250px]">
            <CommandEmpty>No se encontró ninguna hermandad</CommandEmpty>
            <CommandGroup>
              {HERMANDADES.map((hermandad) => (
                <CommandItem
                  key={hermandad}
                  value={hermandad}
                  onSelect={() => {
                    onValueChange(hermandad);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === hermandad ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {hermandad}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
