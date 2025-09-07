import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function UploadResume() {
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileName, setFileName] = useState<string>('');
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF or Word document.",
        variant: "destructive",
      });
      return;
    }

    setFileName(file.name);
    setUploadStatus('uploading');
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploadStatus('success');
          toast({
            title: "Resume Uploaded Successfully!",
            description: "Your resume has been analyzed and processed.",
          });
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      // Create a proper file input element and trigger the upload handler
      const input = document.createElement('input');
      input.type = 'file';
      input.files = files;
      const event = { target: input } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileUpload(event);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Upload Resume</h1>
        <p className="text-muted-foreground">
          Upload your resume for AI-powered analysis and career recommendations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Area */}
        <Card className="bg-gradient-card border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="h-5 w-5 text-primary" />
              <span>Upload Your Resume</span>
            </CardTitle>
            <CardDescription>
              Supported formats: PDF, DOC, DOCX (Max size: 10MB)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {uploadStatus === 'idle' && (
              <div
                className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-smooth cursor-pointer"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <Upload className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-medium mb-2">Drop your resume here</p>
                    <p className="text-muted-foreground mb-4">or click to browse files</p>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="resume-upload"
                    />
                    <Button asChild variant="outline">
                      <label htmlFor="resume-upload" className="cursor-pointer">
                        Browse Files
                      </label>
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {uploadStatus === 'uploading' && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <FileText className="h-8 w-8 text-primary animate-pulse" />
                </div>
                <div>
                  <p className="font-medium mb-2">Uploading {fileName}...</p>
                  <Progress value={uploadProgress} className="w-full" />
                  <p className="text-sm text-muted-foreground mt-2">{uploadProgress}% complete</p>
                </div>
              </div>
            )}

            {uploadStatus === 'success' && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="h-8 w-8 text-accent" />
                </div>
                <div>
                  <p className="font-medium text-accent mb-2">Upload Successful!</p>
                  <p className="text-muted-foreground">{fileName} has been analyzed</p>
                </div>
                <Button 
                  onClick={() => {
                    setUploadStatus('idle');
                    setFileName('');
                    setUploadProgress(0);
                  }}
                  variant="outline"
                >
                  Upload Another Resume
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Analysis Results */}
        <Card className="bg-gradient-card border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-primary" />
              <span>Analysis Results</span>
            </CardTitle>
            <CardDescription>
              AI-powered insights from your resume
            </CardDescription>
          </CardHeader>
          <CardContent>
            {uploadStatus !== 'success' ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">Upload a resume to see analysis results</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Experience Level</span>
                    <span className="text-primary font-semibold">Mid-Level</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Primary Skills</span>
                    <span className="text-sm text-muted-foreground">JavaScript, React, Node.js</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Industry Focus</span>
                    <span className="text-sm text-muted-foreground">Technology</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Recommendations</h4>
                  <div className="space-y-2">
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                      <p className="text-sm">Strong technical background identified</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                      <p className="text-sm">Consider highlighting leadership experience</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                      <p className="text-sm">Add more quantifiable achievements</p>
                    </div>
                  </div>
                </div>

                <Button className="w-full" variant="default">
                  View Detailed Analysis
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}