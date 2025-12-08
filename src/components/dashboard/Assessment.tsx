import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Mock assessment questions - would be fetched from API in production
const assessmentQuestions = [
  {
    id: 1,
    question: "Rate your proficiency in JavaScript programming",
    options: [
      { id: "js-1", label: "Beginner - Basic syntax understanding" },
      { id: "js-2", label: "Intermediate - Comfortable with functions and objects" },
      { id: "js-3", label: "Advanced - Proficient with modern JS features" },
      { id: "js-4", label: "Expert - Deep understanding of JS internals" }
    ]
  },
  {
    id: 2,
    question: "How comfortable are you with database design?",
    options: [
      { id: "db-1", label: "Beginner - Basic understanding of tables" },
      { id: "db-2", label: "Intermediate - Can design normalized schemas" },
      { id: "db-3", label: "Advanced - Experienced with complex data modeling" },
      { id: "db-4", label: "Expert - Performance optimization and advanced concepts" }
    ]
  },
  {
    id: 3,
    question: "Assess your experience with cloud platforms (AWS, Azure, GCP)",
    options: [
      { id: "cloud-1", label: "Beginner - Basic knowledge only" },
      { id: "cloud-2", label: "Intermediate - Deployed applications to cloud" },
      { id: "cloud-3", label: "Advanced - Designed cloud architecture" },
      { id: "cloud-4", label: "Expert - Implemented complex cloud solutions" }
    ]
  },
  {
    id: 4,
    question: "How would you rate your problem-solving abilities?",
    options: [
      { id: "prob-1", label: "Beginner - Can solve simple problems with guidance" },
      { id: "prob-2", label: "Intermediate - Solve common problems independently" },
      { id: "prob-3", label: "Advanced - Can break down complex problems effectively" },
      { id: "prob-4", label: "Expert - Innovative approaches to difficult problems" }
    ]
  },
  {
    id: 5,
    question: "Rate your experience with agile development methodologies",
    options: [
      { id: "agile-1", label: "Beginner - Basic understanding of concepts" },
      { id: "agile-2", label: "Intermediate - Participated in agile teams" },
      { id: "agile-3", label: "Advanced - Led agile processes" },
      { id: "agile-4", label: "Expert - Implemented and optimized agile frameworks" }
    ]
  }
];

export function Assessment() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const currentQuestion = assessmentQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / assessmentQuestions.length) * 100;
  
  const handleAnswer = (value: string) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: value
    });
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < assessmentQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      submitAssessment();
    }
  };

  const submitAssessment = async () => {
    setIsSubmitting(true);
    
    try {
      // In production, this would be an actual API call
      // const response = await fetch('/api/assessments', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ answers })
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Assessment Completed",
        description: "Your skills have been assessed successfully!",
        variant: "default",
      });
      
      // Navigate to recommendations page
      navigate("/dashboard/recommendations");
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your assessment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAnswered = currentQuestion && answers[currentQuestion.id] !== undefined;

  return (
    <div className="container max-w-3xl mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Technical Skills Assessment</h1>
      
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span>Question {currentQuestionIndex + 1} of {assessmentQuestions.length}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{currentQuestion.question}</CardTitle>
          <CardDescription>Select the option that best describes your skill level</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup 
            value={answers[currentQuestion.id]} 
            onValueChange={handleAnswer}
          >
            {currentQuestion.options.map((option) => (
              <div key={option.id} className="flex items-center space-x-2 mb-4 p-3 border rounded-md hover:bg-muted/50 transition-colors">
                <RadioGroupItem value={option.id} id={option.id} />
                <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0 || isSubmitting}
          >
            Previous
          </Button>
          
          <Button 
            onClick={handleNext}
            disabled={!isAnswered || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : currentQuestionIndex === assessmentQuestions.length - 1 ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Complete Assessment
              </>
            ) : (
              "Next Question"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default Assessment;