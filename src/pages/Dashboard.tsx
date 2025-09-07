import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Routes, Route } from "react-router-dom";
import { UploadResume } from "@/components/dashboard/UploadResume";
import { CareerQuiz } from "@/components/dashboard/CareerQuiz";
import { CareerRecommendations } from "@/components/dashboard/CareerRecommendations";
import { SkillGapAnalysis } from "@/components/dashboard/SkillGapAnalysis";
import { PersonalizedRoadmap } from "@/components/dashboard/PersonalizedRoadmap";
import { ResumeAnalyzer } from "@/components/dashboard/ResumeAnalyzer";
import { InterviewChatbot } from "@/components/dashboard/InterviewChatbot";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";

const Dashboard = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col">
          <DashboardHeader />
          <main className="flex-1 p-6">
            <Routes>
              <Route index element={<DashboardOverview />} />
              <Route path="upload-resume" element={<UploadResume />} />
              <Route path="career-quiz" element={<CareerQuiz />} />
              <Route path="recommendations" element={<CareerRecommendations />} />
              <Route path="skill-analysis" element={<SkillGapAnalysis />} />
              <Route path="roadmap" element={<PersonalizedRoadmap />} />
              <Route path="resume-analyzer" element={<ResumeAnalyzer />} />
              <Route path="interview-coach" element={<InterviewChatbot />} />
            </Routes>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;