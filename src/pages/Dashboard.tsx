import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { DashboardHome } from "@/components/dashboard/DashboardHome";
import { UploadResume } from "@/components/dashboard/UploadResume";
import { CareerQuiz } from "@/components/dashboard/CareerQuiz";
import { CareerRecommendations } from "@/components/dashboard/CareerRecommendations";
import { SkillGapAnalysis } from "@/components/dashboard/SkillGapAnalysis";
import { PersonalizedRoadmap } from "@/components/dashboard/PersonalizedRoadmap";
import { ResumeAnalyzer } from "@/components/dashboard/ResumeAnalyzer";
import { JobPortal } from "@/components/dashboard/JobPortal";
import { Assessment } from "@/components/dashboard/Assessment";
import { ReportGeneration } from "@/components/dashboard/ReportGeneration";
import { Resources } from "@/components/dashboard/Resources";
import UserProfile from "@/pages/UserProfile";
import Settings from "@/pages/Settings";

// Skeleton loader for dashboard loading state
function DashboardLoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      
      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      {/* Main content skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <Skeleton className="h-6 w-40 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-4" />
          <Skeleton className="h-10 w-32" />
        </Card>
        <Card className="p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </Card>
      </div>
      
      {/* Bottom section skeleton */}
      <Card className="p-6">
        <Skeleton className="h-6 w-48 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// Full page loading skeleton
function FullPageLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-primary/20 animate-pulse" />
          <Loader2 className="h-8 w-8 animate-spin text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <div className="space-y-2">
          <p className="text-lg font-medium">Loading your dashboard...</p>
          <p className="text-sm text-muted-foreground">Fetching your profile and preferences</p>
        </div>
        <div className="flex items-center justify-center gap-1">
          <Skeleton className="h-2 w-2 rounded-full" />
          <Skeleton className="h-2 w-2 rounded-full" />
          <Skeleton className="h-2 w-2 rounded-full" />
        </div>
      </div>
    </div>
  );
}

const Dashboard = () => {
  const { currentUser, loading } = useAuth();
  const { setUserTheme } = useTheme();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userSettings, setUserSettings] = useState(null);
  const [settingsKey, setSettingsKey] = useState(0);
  const [isInitializing, setIsInitializing] = useState(true);

  // Initialize with a small delay for smooth transition
  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        setIsInitializing(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  // Load user settings from Firestore
  useEffect(() => {
    if (!currentUser?.uid) return;

    const userDocRef = doc(db, 'users', currentUser.uid);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        if (userData.settings) {
          setUserSettings(userData.settings);
          // Apply theme from saved settings
          if (userData.settings.theme) {
            setUserTheme(userData.settings.theme);
          }
          // Force sidebar re-render when settings change
          setSettingsKey(prev => prev + 1);
        }
      }
    });

    return unsubscribe;
  }, [currentUser, setUserTheme]);

  // Show loading while auth is loading or initializing
  if (loading || isInitializing) {
    return <FullPageLoadingSkeleton />;
  }

  // Redirect to login if not authenticated
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Main dashboard layout with sidebar and header
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div className="flex">
        <DashboardSidebar
          key={settingsKey}
          collapsed={sidebarCollapsed}
          userSettings={userSettings}
        />
        <main className={`flex-1 transition-all duration-300 ease-in-out p-4 md:p-6 pt-16 md:pt-6 pb-20 md:pb-6 ${
          sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'
        }`}>
          <div className="max-w-7xl mx-auto">
            <Suspense fallback={<DashboardLoadingSkeleton />}>
              <Routes>
                <Route index element={<DashboardHome />} />
                <Route path="upload-resume" element={<UploadResume />} />
                <Route path="career-quiz" element={<CareerQuiz />} />
                <Route path="recommendations" element={<CareerRecommendations />} />
                <Route path="skill-analysis" element={<SkillGapAnalysis />} />
                <Route path="roadmap" element={<PersonalizedRoadmap />} />
                <Route path="resume-analyzer" element={<ResumeAnalyzer />} />
                <Route path="job-portal" element={<JobPortal />} />
                <Route path="assessment" element={<Assessment />} />
                <Route path="reports" element={<ReportGeneration />} />
                <Route path="resources" element={<Resources />} />
                <Route path="profile" element={<UserProfile />} />
                <Route path="settings" element={<Settings />} />
              </Routes>
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;