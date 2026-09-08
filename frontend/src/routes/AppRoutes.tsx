import { Route, Routes } from "react-router-dom";

import { AppLayout } from "../components/layout/AppLayout";
import { useAuth } from "../features/auth";
import { AuthPage } from "../pages/AuthPage";
import { CollectionsPage } from "../pages/CollectionsPage";
import ComparisonsPage from "../pages/ComparisonsPage";
import { DashboardPage } from "../pages/DashboardPage";
import { EditPromptPage } from "../pages/EditPromptPage";
import { ModelProvidersPage } from "../pages/ModelProvidersPage";
import { NewPromptPage } from "../pages/NewPromptPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { OnboardingPage } from "../pages/OnboardingPage";
import { PlaygroundPage } from "../pages/PlaygroundPage";
import { PromptsPage } from "../pages/PromptsPage";
import { SettingsPage } from "../pages/SettingsPage";


export function AppRoutes() {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="auth-loading-screen">
        <span className="auth-loading-mark" />
        <strong>AI Prompt Studio</strong>
      </div>
    );
  }

  if (!session) {
    return <AuthPage />;
  }

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/prompts" element={<PromptsPage />} />
        <Route path="/prompts/new" element={<NewPromptPage />} />
        <Route path="/prompts/:promptId/edit" element={<EditPromptPage />} />
        <Route
          path="/prompts/:promptId/playground"
          element={<PlaygroundPage />}
        />
        <Route path="/collections" element={<CollectionsPage />} />
        <Route path="/comparisons" element={<ComparisonsPage />} />
        <Route path="/providers" element={<ModelProvidersPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AppLayout>
  );
}
