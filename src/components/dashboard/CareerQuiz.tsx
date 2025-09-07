import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ClipboardList, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const quizQuestions = [
  {
    id: 1,
    question: "What type of work environment do you prefer?",
    options: [
      { value: "collaborative", label: "Collaborative team environment" },
      { value: "independent", label: "Independent, self-directed work" },
      { value: "structured", label: "Structured, process-driven environment" },
      { value: "dynamic", label: "Dynamic, fast-paced environment" }
    ]
  },
  {
    id: 2,
    question: "Which activities energize you the most?",
    options: [
      { value: "problem-solving", label: "Solving complex problems" },
      { value: "creative", label: "Creative and artistic pursuits" },
      { value: "helping", label: "Helping and mentoring others" },
      { value: "leading", label: "Leading and managing projects" }
    ]
  },
  {
    id: 3,
    question: "What is your preferred way of learning?",
    options: [
      { value: "hands-on", label: "Hands-on, practical experience" },
      { value: "research", label: "Research and theoretical study" },
      { value: "discussion", label: "Discussion and collaboration" },
      { value: "observation", label: "Observation and analysis" }
    ]
  },
  {
    id: 4,
    question: "Which type of challenges excite you?",
    options: [
      { value: "technical", label: "Technical and analytical challenges" },
      { value: "interpersonal", label: "Interpersonal and communication challenges" },
      { value: "strategic", label: "Strategic and business challenges" },
      { value: "creative", label: "Creative and design challenges" }
    ]
  },
  {
    id: 5,
    question: "What motivates you most in your career?",
    options: [
      { value: "growth", label: "Personal and professional growth" },
      { value: "impact", label: "Making a positive impact" },
      { value: "recognition", label: "Recognition and achievement" },
      { value: "stability", label: "Stability and security" }
    ]
  }
];

export function CareerQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const { toast } = useToast();

  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;

  const handleAnswerChange = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [quizQuestions[currentQuestion].id]: value
    }));
  };

  const handleNext = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // Complete quiz
      setIsCompleted(true);
      toast({
        title: "Quiz Completed!",
        description: "Your personality profile has been analyzed. Check your recommendations.",
      });
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setIsCompleted(false);
  };

  if (isCompleted) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-10 w-10 text-accent" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Quiz Completed!</h1>
          <p className="text-muted-foreground">
            Your personality profile has been analyzed. Here are your results:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gradient-card border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Your Personality Type</CardTitle>
              <CardDescription>Based on your responses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <ClipboardList className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-primary">Strategic Innovator</h3>
                  <p className="text-muted-foreground">
                    You thrive on solving complex problems and driving innovation
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Key Strengths</CardTitle>
              <CardDescription>Your dominant traits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-accent" />
                  <span>Problem-solving oriented</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-accent" />
                  <span>Strategic thinking</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-accent" />
                  <span>Growth-focused</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-accent" />
                  <span>Independent worker</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center space-x-4">
          <Button onClick={restartQuiz} variant="outline">
            Retake Quiz
          </Button>
          <Button variant="default">
            View Career Recommendations
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Career Personality Quiz</h1>
        <p className="text-muted-foreground">
          Answer these questions to help us understand your career preferences and personality traits.
        </p>
      </div>

      <Card className="bg-gradient-card border-0 shadow-lg max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              <span>Question {currentQuestion + 1} of {quizQuestions.length}</span>
            </CardTitle>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="w-full" />
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">
              {quizQuestions[currentQuestion].question}
            </h3>
            
            <RadioGroup
              value={answers[quizQuestions[currentQuestion].id] || ""}
              onValueChange={handleAnswerChange}
              className="space-y-3"
            >
              {quizQuestions[currentQuestion].options.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label 
                    htmlFor={option.value} 
                    className="text-sm font-normal cursor-pointer flex-1 py-2"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="flex justify-between pt-4">
            <Button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              variant="outline"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={!answers[quizQuestions[currentQuestion].id]}
              variant="default"
            >
              {currentQuestion === quizQuestions.length - 1 ? 'Complete Quiz' : 'Next'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}