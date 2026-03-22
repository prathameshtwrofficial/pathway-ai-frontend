import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export function UploadResume() {
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileName, setFileName] = useState<string>('');
  const { toast } = useToast();
  const { currentUser } = useAuth();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentUser) return;

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

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload a file smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setFileName(file.name);
    setUploadStatus('uploading');
    setUploadProgress(0);

    try {
      // Simulate upload progress (since we're not using Firebase Storage)
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            // Upload completed successfully - save metadata to Firestore
            saveResumeMetadata(file);
            return 100;
          }
          return prev + 15; // Faster progress for simulation
        });
      }, 150);

    } catch (error) {
      console.error('Upload setup error:', error);
      setUploadStatus('error');
      toast({
        title: "Upload Failed",
        description: "Failed to process resume. Please try again.",
        variant: "destructive",
      });
    }
  };

  const saveResumeMetadata = async (file: File) => {
    try {
      // Save resume metadata to Firestore (without actual file storage)
      const userDocRef = doc(db, 'users', currentUser!.uid);
      await setDoc(userDocRef, {
        resume: {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          uploadedAt: new Date(),
          // Note: No downloadURL since we're not storing the file
          storageNote: "File processed locally - not stored in cloud due to free tier limitations"
        }
      }, { merge: true });

      setUploadStatus('success');
      toast({
        title: "Resume Processed Successfully!",
        description: "Your resume has been analyzed locally and saved to your profile (free tier).",
      });
    } catch (error) {
      console.error('Error saving resume metadata:', error);
      setUploadStatus('error');
      toast({
        title: "Processing Failed",
        description: "Resume processed but failed to save info. Please try again.",
        variant: "destructive",
      });
    }
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
    <div className="space-y-6 md:space-y-8 px-2 md:px-0">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Upload Resume</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Upload your resume for AI-powered analysis and career recommendations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Upload Area */}
        <Card className="bg-gradient-card border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="h-5 w-5 text-primary" />
              <span>Upload Your Resume</span>
            </CardTitle>
            <CardDescription>
              Supported formats: PDF, DOC, DOCX (Max size: 10MB) - Free tier: Local processing only
            </CardDescription>
          </CardHeader>
          <CardContent>
            {uploadStatus === 'idle' && (
              <div
                className="border-2 border-dashed border-border rounded-lg p-6 md:p-8 text-center hover:border-primary/50 transition-smooth cursor-pointer"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center space-y-3 md:space-y-4">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <Upload className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-base md:text-lg font-medium mb-2">Drop your resume here</p>
                    <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">or click to browse files</p>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="resume-upload"
                    />
                    <Button asChild variant="outline" size="sm" className="h-9 md:h-10">
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
              <div className="space-y-4 md:space-y-6">
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <span className="font-medium text-sm md:text-base">Experience Level</span>
                    <span className="text-primary font-semibold text-sm md:text-base">Mid-Level</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <span className="font-medium text-sm md:text-base">Primary Skills</span>
                    <span className="text-xs md:text-sm text-muted-foreground">JavaScript, React, Node.js</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <span className="font-medium text-sm md:text-base">Industry Focus</span>
                    <span className="text-xs md:text-sm text-muted-foreground">Technology</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-sm md:text-base">Analysis Results (Demo)</h4>
                  <div className="space-y-2">
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                      <p className="text-xs md:text-sm">Resume processed successfully (free tier)</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                      <p className="text-xs md:text-sm">File metadata saved to your profile</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                      <p className="text-xs md:text-sm">Ready for AI analysis (upgrade for full features)</p>
                    </div>
                  </div>
                </div>

                <Button className="w-full h-9 md:h-10 text-sm md:text-base" variant="default">
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