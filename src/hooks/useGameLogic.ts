import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { invokeWithTimeout } from "@/lib/supabaseHelpers";
import { toast } from "sonner";

interface Question {
  id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  difficulty: string | null;
}

interface VerifiedAnswer {
  isCorrect: boolean;
  correctAnswer: number;
}

interface AnswerSubmission {
  questionId: string;
  selectedAnswer: number;
  timeElapsed: number;
}

const TOTAL_QUESTIONS = 10;
const TIME_PER_QUESTION = 15;

export const useGameLogic = (questions: Question[] | undefined, userId: string | undefined, serverDate?: string) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [gameStarted, setGameStarted] = useState(false);
  const [gameId, setGameId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const [timeExpired, setTimeExpired] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [verifiedAnswer, setVerifiedAnswer] = useState<VerifiedAnswer | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const [gameStartTime] = useState(Date.now());
  const submissionDataRef = useRef<AnswerSubmission[]>([]);

  // Flag to prevent double-processing when timer hits 0
  const processingRef = useRef(false);

  const currentQuestionData = questions?.[currentQuestion];

  // --- beforeunload warning ---
  useEffect(() => {
    if (!gameStarted) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [gameStarted]);

  // --- Timer countdown ---
  useEffect(() => {
    if (!gameStarted || selectedAnswer !== null || timeExpired) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameStarted, selectedAnswer, timeExpired]);

  // --- Submit game to server ---
  const submitGame = useCallback(async (answers: AnswerSubmission[]) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        toast.error('Sesión expirada');
        navigate('/auth');
        return;
      }

      const response = await supabase.functions.invoke('submit-game', {
        body: { gameId, answers, startTime: gameStartTime }
      });

      if (response.error) {
        if (import.meta.env.DEV) console.error('Error submitting game:', response.error);
        toast.error(response.error.message || 'Error al guardar el resultado');
        navigate('/');
        return;
      }

      const result = response.data;

      if (!result || !result.success) {
        toast.error(result?.error || 'Error al validar el juego');
        navigate('/');
        return;
      }

      // Invalidar caché
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['top-ranking'] });
      queryClient.invalidateQueries({ queryKey: ['user-ranking-position'] });

      navigate('/resultados', {
        state: {
          score: result.score,
          correctAnswers: result.correctAnswers,
          incorrectAnswers: result.incorrectAnswers,
          totalQuestions: TOTAL_QUESTIONS,
          avgTime: result.avgTime,
          isNewBestScore: result.isNewBestScore
        },
        replace: true
      });
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error submitting game:', error);
      toast.error('Error al enviar el resultado');
      navigate('/');
    }
  }, [gameId, gameStartTime, navigate, queryClient]);

  // --- Unified answer processing ---
  const processAnswer = useCallback(async (answerValue: number, timeElapsed: number) => {
    if (!currentQuestionData || processingRef.current) return;
    processingRef.current = true;

    if (answerValue === 0) {
      setTimeExpired(true);
    } else {
      setSelectedAnswer(answerValue);
    }
    setIsVerifying(true);

    // Store answer
    const newAnswer: AnswerSubmission = {
      questionId: currentQuestionData.id,
      selectedAnswer: answerValue,
      timeElapsed
    };
    submissionDataRef.current = [...submissionDataRef.current, newAnswer];

    // Verify with server (4s timeout — if it fails, skip feedback)
    try {
      const result = await invokeWithTimeout<VerifiedAnswer>(
        'check-answer',
        { questionId: currentQuestionData.id, selectedAnswer: answerValue },
        4000
      );
      if (result) {
        setVerifiedAnswer(result);
      }
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error verifying answer:', error);
    }

    setIsVerifying(false);

    // Wait for visual feedback (1.5s if we got feedback, 0.5s if timeout), then advance
    const feedbackDelay = verifiedAnswer !== null ? 1500 : 500;
    setTimeout(async () => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }

      if (currentQuestion < TOTAL_QUESTIONS - 1) {
        // Reset and advance
        setSelectedAnswer(null);
        setTimeExpired(false);
        setVerifiedAnswer(null);
        setIsVerifying(false);
        setTimeLeft(TIME_PER_QUESTION);
        setCurrentQuestion(prev => prev + 1);
        processingRef.current = false;
      } else {
        // Last question — submit
        await submitGame(submissionDataRef.current);
      }
    }, feedbackDelay);
  }, [currentQuestionData, currentQuestion, submitGame, verifiedAnswer]);

  // --- Time expiration triggers processAnswer ---
  useEffect(() => {
    if (timeLeft === 0 && selectedAnswer === null && !timeExpired && gameStarted && currentQuestionData) {
      processAnswer(0, TIME_PER_QUESTION);
    }
  }, [timeLeft, selectedAnswer, timeExpired, gameStarted, currentQuestionData, processAnswer]);

  // --- Start game ---
  const startGame = useCallback(async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('games')
        .insert({
          user_id: userId,
          date: serverDate, // Use server date (Europe/Madrid timezone)
          total_score: 0,
          correct_answers: 0,
          incorrect_answers: 0,
          avg_time: 0,
          status: 'in_progress'
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          toast.error('No puedes volver a jugar hoy');
          navigate('/');
          return;
        }
        throw error;
      }

      queryClient.invalidateQueries({ queryKey: ['today-game', userId] });
      setGameId(data.id);
      setGameStarted(true);
    } catch (error) {
      console.error('Error starting game:', error);
      toast.error('Error al iniciar partida');
    }
  }, [userId, navigate, queryClient]);

  // --- Timer color helper ---
  const getTimerColor = () => {
    if (timeLeft > 10) return "text-accent";
    if (timeLeft > 5) return "text-orange-500";
    return "text-destructive";
  };

  return {
    gameStarted,
    currentQuestion,
    totalQuestions: TOTAL_QUESTIONS,
    timeLeft,
    timeExpired,
    selectedAnswer,
    verifiedAnswer,
    isVerifying,
    currentQuestionData,
    getTimerColor,
    startGame,
    processAnswer,
  };
};
