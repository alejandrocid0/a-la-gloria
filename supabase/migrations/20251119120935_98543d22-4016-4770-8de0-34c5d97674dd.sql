-- Añadir columna status a la tabla games
ALTER TABLE games 
ADD COLUMN status text NOT NULL DEFAULT 'completed';

-- Añadir check constraint para validar valores permitidos
ALTER TABLE games 
ADD CONSTRAINT games_status_check 
CHECK (status IN ('in_progress', 'completed', 'abandoned'));

-- Crear índice para consultas rápidas por status
CREATE INDEX idx_games_user_date_status ON games(user_id, date, status);