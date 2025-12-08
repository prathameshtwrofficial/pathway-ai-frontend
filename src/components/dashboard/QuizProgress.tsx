import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2, BookOpen, RotateCcw, Trophy } from "lucide-react";

interface QuizHistoryItem {
  quizId: string;
  score: number;
  totalQuestions: number;
  completedAt: any;
}

export function QuizProgress() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [quizResults, setQuizResults] = useState<any>(null);

  useEffect(() => {
    if (!currentUser?.uid) {
      setLoading(false);
      return;
    }

    // Set up real-time listener for user career quiz data
    const userDocRef = doc(db, 'users', currentUser.uid);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        const attempts = userData.careerQuizAttempts || [];
        setQuizResults(attempts.length > 0 ? attempts[attempts.length - 1] : null);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error listening to quiz results:", error);
      setLoading(false);
    });

    return unsubscribe;
  }, [currentUser]);

  const handleTakeQuiz = () => {
    navigate('/career-quiz');
  };

  const handleRetakeQuiz = () => {
    // Clear existing results and redirect to quiz
    navigate('/career-quiz');
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Career Quiz Progress</CardTitle>
          <CardDescription className="text-sm">Track your career assessment results</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-32 md:h-40">
          <Loader2 className="h-6 w-6 md:h-8 md:w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">Career Quiz Progress</CardTitle>
        <CardDescription className="text-sm">View your career assessment results and retake the quiz</CardDescription>
      </CardHeader>
      <CardContent>
        {!quizResults ? (
          // No quiz taken yet
          <div className="text-center py-6 md:py-8 space-y-4">
            <BookOpen className="h-12 w-12 md:h-16 md:w-16 text-muted-foreground mx-auto" />
            <div>
              <p className="text-sm md:text-base text-muted-foreground mb-4">
                Take our Career Personality Quiz to discover your ideal career path!
              </p>
              <Button onClick={handleTakeQuiz} className="w-full md:w-auto">
                <BookOpen className="mr-2 h-4 w-4" />
                Take Career Quiz
              </Button>
            </div>
          </div>
        ) : (
          // Show quiz results
          <div className="space-y-4">
            {/* Quiz Results Preview */}
            <div className="p-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg border">
              <div className="flex items-center space-x-3 mb-3">
                <div className="text-2xl">{quizResults.recommendation.icon}</div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm md:text-base">{quizResults.recommendation.title}</h4>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Completed on {new Date(quizResults.completedAt?.toDate?.() || Date.now()).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Progress Bar for Quiz Score */}
              <div className="mb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs md:text-sm font-medium">Career Match Score</span>
                  <span className="text-xs md:text-sm font-bold text-primary">
                    {quizResults.score || 0}/100
                  </span>
                </div>
                <Progress
                  value={quizResults.score || 0}
                  className="h-2 md:h-3"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {quizResults.score >= 80 ? "Excellent match!" :
                   quizResults.score >= 60 ? "Good match!" :
                   quizResults.score >= 40 ? "Fair match" : "Consider exploring other options"}
                </p>
              </div>

              <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">
                {quizResults.recommendation.description}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={handleRetakeQuiz} variant="outline" className="flex-1">
                <RotateCcw className="mr-2 h-4 w-4" />
                Retake Quiz
              </Button>
              <Button onClick={() => navigate('/career-quiz')} className="flex-1">
                <Trophy className="mr-2 h-4 w-4" />
                View Full Results
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}