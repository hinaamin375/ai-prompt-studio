import { Route, Routes } from "react-router-dom";

import { AppLayout } from "../components/layout/AppLayout";
import { ComparisonsPage } from "../pages/ComparisonsPage";
import { DashboardPage } from "../pages/DashboardPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { PromptsPage } from "../pages/PromptsPage";
import { SettingsPage } from "../pages/SettingsPage";
import { EditPromptPage } from "../pages/EditPromptPage";
import { NewPromptPage } from "../pages/NewPromptPage";

export function AppRoutes() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/prompts" element={<PromptsPage />} />
        <Route path="/comparisons" element={<ComparisonsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
        <Route
  path="/prompts/new"
  element={<NewPromptPage />}
/>

<Route
  path="/prompts/:promptId/edit"
  element={<EditPromptPage />}
/>
      </Routes>
    </AppLayout>
  );
}