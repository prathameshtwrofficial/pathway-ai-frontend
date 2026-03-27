import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, Briefcase, Code, TrendingUp } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export function UploadResume() {
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileName, setFileName] = useState<string>('');
  const [extractedData, setExtractedData] = useState<any>(null);
  const { toast } = useToast();
  const { currentUser } = useAuth();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentUser) return;

    // Validate file type
    const validTypes = ['.pdf', '.docx', '.doc', '.txt'];
    const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!validTypes.includes(fileExt)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF, DOCX, DOC, or TXT file.",
        variant: "destructive",
      });
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Maximum file size is 5MB.",
        variant: "destructive",
      });
      return;
    }

    setFileName(file.name);
    setUploadStatus('uploading');
    setUploadProgress(0);

    try {
      // Simulate initial progress
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 30) {
            clearInterval(interval);
            // Actually upload and extract text
            uploadAndExtract(file);
            return 30;
          }
          return prev + 10;
        });
      }, 100);

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

  const uploadAndExtract = async (file: File) => {
    try {
      // Upload file to backend for text extraction
      const formData = new FormData();
      formData.append('resume', file);

      const response = await fetch('/api/resume/extract-text', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to extract text');
      }

      const data = await response.json();
      
      setUploadProgress(70);
      
      // Now perform ATS analysis on the extracted text
      const atsResponse = await fetch('/api/ats/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          resumeText: data.text,
          jobDescription: '', // No job description for initial analysis
          userId: currentUser?.uid // Send userId for Firestore saving
        })
      });

      let atsData = null;
      if (atsResponse.ok) {
        atsData = await atsResponse.json();
      }

      setUploadProgress(90);

      // Save everything to Firestore
      await saveResumeData(file, data, atsData);

      setUploadProgress(100);
      setUploadStatus('success');
      
      // Store extracted data for display
      setExtractedData({
        text: data.text,
        wordCount: data.wordCount,
        atsAnalysis: atsData,
        fileName: file.name,
        uploadedAt: new Date().toISOString()
      });

      toast({
        title: "Resume Analyzed Successfully!",
        description: `Extracted ${data.wordCount} words. ATS Score: ${atsData?.overallScore || 'N/A'}%`,
      });
    } catch (error: any) {
      console.error('Upload and extract error:', error);
      setUploadStatus('error');
      toast({
        title: "Processing Failed",
        description: error.message || "Could not process resume. Please try again.",
        variant: "destructive",
      });
    }
  };

  const saveResumeData = async (file: File, textData: any, atsData: any) => {
    if (!currentUser) return;

    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      
      // Get current data to preserve
      const userDoc = await getDoc(userDocRef);
      const existingData = userDoc.exists() ? userDoc.data() : {};

      await setDoc(userDocRef, {
        ...existingData,
        resume: {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          uploadedAt: new Date(),
          wordCount: textData.wordCount,
          charCount: textData.charCount
        },
        // Store the raw text for later use
        resumeText: textData.text,
        // Store the ATS analysis results
        atsAnalysis: atsData,
        // Update timestamp
        lastResumeUpdate: new Date().toISOString()
      }, { merge: true });

    } catch (error) {
      console.error('Error saving resume data:', error);
      throw new Error('Failed to save resume data');
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
      const input = document.createElement('input');
      input.type = 'file';
      input.files = files;
      const event = { target: input } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileUpload(event);
    }
  };

  const resetUpload = () => {
    setUploadStatus('idle');
    setFileName('');
    setUploadProgress(0);
    setExtractedData(null);
  };

  return (
    <div className="space-y-6 md:space-y-8 px-2 md:px-0">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Upload Resume</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Upload your resume for AI-powered analysis, skills assessment, and career recommendations.
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
              Supported formats: PDF, DOCX, DOC, TXT (Max size: 5MB)
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
                      accept=".pdf,.docx,.doc,.txt"
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
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                </div>
                <div>
                  <p className="font-medium mb-2">Processing {fileName}...</p>
                  <Progress value={uploadProgress} className="w-full" />
                  <p className="text-sm text-muted-foreground mt-2">
                    {uploadProgress < 30 ? 'Reading file...' : 
                     uploadProgress < 70 ? 'Analyzing content...' : 
                     'Saving to profile...'}
                  </p>
                </div>
              </div>
            )}

            {uploadStatus === 'success' && extractedData && (
              <div className="space-y-4">
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <p className="font-medium text-green-600 mb-1">Analysis Complete!</p>
                  <p className="text-sm text-muted-foreground">{fileName}</p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-muted/30 rounded-lg text-center">
                    <div className="text-lg font-bold text-primary">{extractedData.wordCount}</div>
                    <div className="text-xs text-muted-foreground">Words</div>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg text-center">
                    <div className="text-lg font-bold text-green-600">{extractedData.atsAnalysis?.overallScore || 'N/A'}%</div>
                    <div className="text-xs text-muted-foreground">ATS Score</div>
                  </div>
                </div>

                {extractedData.atsAnalysis?.parsedResume?.skills?.technical?.length > 0 && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-2">Top Skills Detected:</div>
                    <div className="flex flex-wrap gap-1">
                      {extractedData.atsAnalysis.parsedResume.skills.technical.slice(0, 6).map((skill: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Button 
                  onClick={resetUpload}
                  variant="outline"
                  className="w-full"
                >
                  Upload Another Resume
                </Button>
              </div>
            )}

            {uploadStatus === 'error' && (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
                <p className="font-medium text-red-600 mb-2">Processing Failed</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Could not extract text from your resume. Please try a different file or paste text directly in the Resume Analyzer.
                </p>
                <Button onClick={resetUpload} variant="outline">
                  Try Again
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
              AI-powered insights from your uploaded resume
            </CardDescription>
          </CardHeader>
          <CardContent>
            {uploadStatus !== 'success' ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground mb-2">Upload a resume to see analysis</p>
                <p className="text-xs text-muted-foreground">
                  We'll extract skills, analyze ATS compatibility, and provide career insights
                </p>
              </div>
            ) : extractedData?.atsAnalysis ? (
              <div className="space-y-4 md:space-y-6">
                {/* ATS Score */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-xl font-bold text-primary">{extractedData.atsAnalysis.overallScore}%</span>
                    </div>
                    <div>
                      <p className="font-medium">ATS Compatibility</p>
                      <p className="text-xs text-muted-foreground">Resume scoring</p>
                    </div>
                  </div>
                  <Badge variant={extractedData.atsAnalysis.overallScore >= 70 ? "default" : "outline"}
                        className={extractedData.atsAnalysis.overallScore >= 70 ? "bg-green-500" : ""}>
                    {extractedData.atsAnalysis.atsRecommendation}
                  </Badge>
                </div>

                {/* Score Breakdown */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Code className="h-4 w-4 text-blue-500" />
                      <span className="text-xs text-muted-foreground">Keywords</span>
                    </div>
                    <div className="text-lg font-bold">{extractedData.atsAnalysis.scores?.keywordMatch || 0}%</div>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="h-4 w-4 text-orange-500" />
                      <span className="text-xs text-muted-foreground">Format</span>
                    </div>
                    <div className="text-lg font-bold">{extractedData.atsAnalysis.scores?.formatScore || 0}%</div>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-xs text-muted-foreground">Complete</span>
                    </div>
                    <div className="text-lg font-bold">{extractedData.atsAnalysis.scores?.completeness || 0}%</div>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="h-4 w-4 text-purple-500" />
                      <span className="text-xs text-muted-foreground">Quality</span>
                    </div>
                    <div className="text-lg font-bold">{extractedData.atsAnalysis.scores?.contentQuality || 0}%</div>
                  </div>
                </div>

                {/* Skills */}
                {extractedData.atsAnalysis.parsedResume?.skills?.technical?.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                      <Code className="h-4 w-4" />
                      Technical Skills ({extractedData.atsAnalysis.parsedResume.skills.technical.length})
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {extractedData.atsAnalysis.parsedResume.skills.technical.map((skill: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-xs">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sector Analysis */}
                {extractedData.atsAnalysis.sectorAnalysis && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-blue-500" />
                      Market Sector: {extractedData.atsAnalysis.sectorAnalysis.detectedSector}
                    </h4>
                    <div className="flex items-center gap-2 text-xs">
                      <Badge variant="outline">Demand: {extractedData.atsAnalysis.sectorAnalysis.sectorDemand}</Badge>
                    </div>
                  </div>
                )}

                {/* Missing Keywords */}
                {extractedData.atsAnalysis.missingKeywords?.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">Missing Keywords (add to improve):</h4>
                    <div className="flex flex-wrap gap-1">
                      {extractedData.atsAnalysis.missingKeywords.slice(0, 5).map((kw: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-xs text-red-600 bg-red-50">{kw}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">Analysis data not available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default UploadResume;