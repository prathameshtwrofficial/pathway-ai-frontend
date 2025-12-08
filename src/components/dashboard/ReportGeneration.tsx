import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Download, FileText, BarChart, PieChart, LineChart, Share2, Loader2 } from "lucide-react";

export function ReportGeneration() {
  const [selectedReportTypes, setSelectedReportTypes] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const reportOptions = [
    { id: "skills", label: "Skills Assessment", icon: BarChart },
    { id: "career", label: "Career Path Analysis", icon: LineChart },
    { id: "market", label: "Job Market Fit", icon: PieChart },
    { id: "resume", label: "Resume Improvement", icon: FileText },
  ];

  const handleReportTypeToggle = (reportId: string) => {
    setSelectedReportTypes(prev => 
      prev.includes(reportId) 
        ? prev.filter(id => id !== reportId)
        : [...prev, reportId]
    );
  };

  const handleGenerateReport = async () => {
    if (selectedReportTypes.length === 0) {
      toast({
        title: "No report types selected",
        description: "Please select at least one report type to generate",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Report Generated Successfully",
        description: `Your ${selectedReportTypes.length} report(s) are ready to download`,
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Report Generation Failed",
        description: "There was an error generating your reports. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Career Report Generation</h1>
      
      <Tabs defaultValue="generate" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generate">Generate Reports</TabsTrigger>
          <TabsTrigger value="history">Report History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="generate" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Create Custom Career Reports</CardTitle>
              <CardDescription>
                Select the types of reports you want to generate based on your assessments and career data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reportOptions.map((option) => (
                  <div 
                    key={option.id}
                    className={`flex items-start space-x-3 p-4 rounded-lg border transition-colors ${
                      selectedReportTypes.includes(option.id) 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Checkbox 
                      id={option.id}
                      checked={selectedReportTypes.includes(option.id)}
                      onCheckedChange={() => handleReportTypeToggle(option.id)}
                    />
                    <div className="flex-1">
                      <Label 
                        htmlFor={option.id} 
                        className="flex items-center space-x-2 font-medium cursor-pointer"
                      >
                        <option.icon className="h-5 w-5 text-primary" />
                        <span>{option.label}</span>
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {option.id === "skills" && "Detailed analysis of your technical and soft skills with improvement recommendations"}
                        {option.id === "career" && "Personalized career trajectory based on your profile and industry trends"}
                        {option.id === "market" && "Analysis of how your skills match current job market demands"}
                        {option.id === "resume" && "Actionable suggestions to optimize your resume for target positions"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">
                <Share2 className="mr-2 h-4 w-4" />
                Share Settings
              </Button>
              <Button 
                onClick={handleGenerateReport}
                disabled={isGenerating || selectedReportTypes.length === 0}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Reports
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Report History</CardTitle>
              <CardDescription>
                Access and download your previously generated reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((item) => (
                  <div 
                    key={item}
                    className="flex items-center justify-between p-4 rounded-lg border hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">
                          {item === 1 && "Comprehensive Career Report"}
                          {item === 2 && "Skills Assessment Report"}
                          {item === 3 && "Job Market Analysis"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {item === 1 && "Generated 2 days ago"}
                          {item === 2 && "Generated 1 week ago"}
                          {item === 3 && "Generated 2 weeks ago"}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ReportGeneration;