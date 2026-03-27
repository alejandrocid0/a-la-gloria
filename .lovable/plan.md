

# Generar informe PDF — Snapshot pre-Semana Santa

## Datos recopilados

Ya he consultado toda la información necesaria de la base de datos:

| Métrica | Valor |
|---------|-------|
| Usuarios registrados | 1.225 |
| Partidas completadas | 7.394 |
| Partidas bloqueadas | 1 (en curso, normal) |
| Preguntas en banco | 1.333 |
| Preguntas programadas | 27 mar – 7 abr (12 días, 10/día) |
| Torneos | 2 |
| Cron cleanup | Diario 03:00 ✓ |

## Implementación

Ejecutar un script Python con ReportLab que genere un PDF de 3 páginas:

1. **Página 1**: KPIs generales + tabla de partidas/registros últimos 14 días
2. **Página 2**: Preguntas programadas Semana Santa + banco por dificultad + top 15 hermandades
3. **Página 3**: Configuración del sistema (Edge Functions, cron, zona horaria) + incidentes resueltos + conclusión

Paleta visual: morado (#2E1544) para cabeceras, dorado (#E4B229) para totales, fondo alterno lavanda.

El script ya está preparado en `/tmp/gen_report.py`. Solo necesito ejecutarlo para generar el archivo en `/mnt/documents/AlaGloria_Snapshot_SemanaSanta2026.pdf`.

