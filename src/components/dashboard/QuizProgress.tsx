import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2, BookOpen, RotateCcw, Trophy, X, Briefcase, TrendingUp } from "lucide-react";

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
  const [resultsDialogOpen, setResultsDialogOpen] = useState(false);

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
        
        // Check for legacy careerQuizAttempts format
        const attempts = userData.careerQuizAttempts || [];
        const quizData = attempts.length > 0 ? attempts[attempts.length - 1] : null;
        
        // If no legacy data, check for new aiAssessment format
        if (!quizData && userData.aiAssessment) {
          const aiData = userData.aiAssessment;
          // Transform AI data to match expected format
          setQuizResults({
            score: aiData.overallScore || 0,
            completedAt: aiData.completedAt || new Date(),
            recommendation: {
              title: aiData.recommendations?.[0]?.title || 'Career Assessment Completed',
              description: aiData.recommendations?.[0]?.description || '',
              icon: aiData.recommendations?.[0]?.icon || null
            }
          });
        } else {
          setQuizResults(quizData);
        }
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
    // Set flag for retake before navigating
    localStorage.setItem('assessmentRetake', 'true');
    navigate('/career-quiz');
  };

  if (loading) {
    return (
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl dark:text-white">Career Quiz Progress</CardTitle>
          <CardDescription className="text-sm dark:text-gray-400">Track your career assessment results</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-32 md:h-40">
          <Loader2 className="h-6 w-6 md:h-8 md:w-8 animate-spin text-gray-600 dark:text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl dark:text-white">Career Quiz Progress</CardTitle>
        <CardDescription className="text-sm dark:text-gray-400">View your career assessment results and retake the quiz</CardDescription>
      </CardHeader>
      <CardContent>
        {!quizResults ? (
          // No quiz taken yet
          <div className="text-center py-6 md:py-8 space-y-4">
            <BookOpen className="h-12 w-12 md:h-16 md:w-16 text-gray-400 mx-auto" />
            <div>
              <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mb-4">
                Take our Career Personality Quiz to discover your ideal career path!
              </p>
              <Button onClick={handleTakeQuiz} className="w-full md:w-auto bg-gray-800 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600">
                <BookOpen className="mr-2 h-4 w-4" />
                Take Career Quiz
              </Button>
            </div>
          </div>
        ) : (
          // Show quiz results
          <div className="space-y-4">
            {/* Quiz Results Preview */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3 mb-3">
                {quizResults.recommendation?.icon ? (
                  <div className="text-2xl">{quizResults.recommendation.icon}</div>
                ) : (
                  <Trophy className="h-8 w-8 text-amber-500" />
                )}
                <div className="flex-1">
                  <h4 className="font-medium text-sm md:text-base dark:text-white">
                    {quizResults.recommendation?.title || 'Career Assessment Completed'}
                  </h4>
                  <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                    Completed on {new Date(quizResults.completedAt?.toDate?.() || Date.now()).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Progress Bar for Quiz Score */}
              <div className="mb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs md:text-sm font-medium dark:text-gray-300">Career Match Score</span>
                  <span className="text-xs md:text-sm font-bold text-gray-700 dark:text-gray-300">
                    {quizResults.score || 0}/100
                  </span>
                </div>
                <Progress
                  value={quizResults.score || 0}
                  className="h-2 md:h-3"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {quizResults.score >= 80 ? "Excellent match!" :
                   quizResults.score >= 60 ? "Good match!" :
                   quizResults.score >= 40 ? "Fair match" : "Consider exploring other options"}
                </p>
              </div>

              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                {quizResults.recommendation?.description || 'Your career assessment has been completed. Take the full quiz to see detailed recommendations.'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={handleRetakeQuiz} variant="outline" className="flex-1 dark:border-gray-600 dark:text-gray-300">
                <RotateCcw className="mr-2 h-4 w-4" />
                Retake Quiz
              </Button>
              <Button onClick={() => setResultsDialogOpen(true)} className="flex-1 bg-gray-800 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600">
                <Trophy className="mr-2 h-4 w-4" />
                View Full Results
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      {/* Full Results Dialog */}
      <Dialog open={resultsDialogOpen} onOpenChange={setResultsDialogOpen}>
        <DialogContent className="max-w-md mx-4 max-h-[80vh] overflow-y-auto dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 dark:text-white">
              <Trophy className="h-5 w-5 text-amber-500" />
              Your Career Assessment Results
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Top Recommendation */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-3">
                {quizResults.recommendation?.icon ? (
                  <div className="text-2xl">{quizResults.recommendation.icon}</div>
                ) : (
                  <Trophy className="h-8 w-8 text-amber-500" />
                )}
                <div>
                  <h4 className="font-semibold dark:text-white">
                    {quizResults.recommendation?.title || 'Career Assessment Completed'}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(quizResults.completedAt?.toDate?.() || Date.now()).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              {/* Progress Bar for Quiz Score */}
              <div className="mb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium dark:text-gray-300">Career Match Score</span>
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                    {quizResults.score || 0}/100
                  </span>
                </div>
                <Progress
                  value={quizResults.score || 0}
                  className="h-3"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {quizResults.score >= 80 ? "Excellent match!" :
                   quizResults.score >= 60 ? "Good match!" :
                   quizResults.score >= 40 ? "Fair match" : "Consider exploring other options"}
                </p>
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                {quizResults.recommendation?.description || 'Your career assessment has been completed. Take the full quiz to see detailed recommendations.'}
              </p>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Briefcase className="h-4 w-4 text-gray-500" />
                  <span className="font-medium dark:text-gray-300">Sector</span>
                </div>
                <p className="text-gray-600 dark:text-gray-400">Technology</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-gray-500" />
                  <span className="font-medium dark:text-gray-300">Growth</span>
                </div>
                <p className="text-gray-600 dark:text-gray-400">High</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 pt-2">
              <Button onClick={handleRetakeQuiz} variant="outline" className="w-full dark:border-gray-600 dark:text-gray-300">
                <RotateCcw className="mr-2 h-4 w-4" />
                Retake Quiz
              </Button>
              <Button onClick={() => setResultsDialogOpen(false)} className="w-full bg-gray-800 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600">
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}