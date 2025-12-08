import { Routes, Route, Navigate } from "react-router-dom";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DashboardHome } from "@/components/dashboard/DashboardHome";
import { UploadResume } from "@/components/dashboard/UploadResume";
import { CareerQuiz } from "@/components/dashboard/CareerQuiz";
import { CareerRecommendations } from "@/components/dashboard/CareerRecommendations";
import { SkillGapAnalysis } from "@/components/dashboard/SkillGapAnalysis";
import { PersonalizedRoadmap } from "@/components/dashboard/PersonalizedRoadmap";
import { ResumeAnalyzer } from "@/components/dashboard/ResumeAnalyzer";
import { InterviewChatbot } from "@/components/dashboard/InterviewChatbot";
import { JobPortal } from "@/components/dashboard/JobPortal";
import { Assessment } from "@/components/dashboard/Assessment";
import { ReportGeneration } from "@/components/dashboard/ReportGeneration";
import { Resources } from "@/components/dashboard/Resources";
import UserProfile from "@/pages/UserProfile";
import Settings from "@/pages/Settings";

const Dashboard = () => {
  const { currentUser, loading } = useAuth();
  const { setUserTheme } = useTheme();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userSettings, setUserSettings] = useState(null);
  const [settingsKey, setSettingsKey] = useState(0); // Force sidebar re-render

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

  // Show loading while auth is loading
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
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
            <Routes>
              <Route index element={<DashboardHome />} />
              <Route path="upload-resume" element={<UploadResume />} />
              <Route path="career-quiz" element={<CareerQuiz />} />
              <Route path="recommendations" element={<CareerRecommendations />} />
              <Route path="skill-analysis" element={<SkillGapAnalysis />} />
              <Route path="roadmap" element={<PersonalizedRoadmap />} />
              <Route path="resume-analyzer" element={<ResumeAnalyzer />} />
              <Route path="interview-coach" element={<InterviewChatbot />} />
              <Route path="job-portal" element={<JobPortal />} />
              <Route path="assessment" element={<Assessment />} />
              <Route path="reports" element={<ReportGeneration />} />
              <Route path="resources" element={<Resources />} />
              <Route path="profile" element={<UserProfile />} />
              <Route path="settings" element={<Settings />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;