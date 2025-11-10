-- Añadir columna last_used_date a la tabla questions
ALTER TABLE questions 
ADD COLUMN last_used_date DATE;

-- Crear índice para mejorar consultas por fecha de uso
CREATE INDEX idx_questions_last_used ON questions(last_used_date);