import {
  Route,
  Routes,
} from "react-router-dom";

import {
  AppLayout,
} from "../components/layout/AppLayout";

import ComparisonsPage
  from "../pages/ComparisonsPage";

import {
  CollectionsPage,
} from "../pages/CollectionsPage";

import {
  DashboardPage,
} from "../pages/DashboardPage";

import {
  EditPromptPage,
} from "../pages/EditPromptPage";

import {
  NewPromptPage,
} from "../pages/NewPromptPage";

import {
  NotFoundPage,
} from "../pages/NotFoundPage";

import {
  PromptsPage,
} from "../pages/PromptsPage";

import {
  SettingsPage,
} from "../pages/SettingsPage";


export function AppRoutes() {
  return (
    <AppLayout>
      <Routes>
        <Route
          path="/"
          element={<DashboardPage />}
        />

        <Route
          path="/prompts"
          element={<PromptsPage />}
        />

        <Route
          path="/prompts/new"
          element={<NewPromptPage />}
        />

        <Route
          path="/prompts/:promptId/edit"
          element={<EditPromptPage />}
        />

        <Route
          path="/collections"
          element={<CollectionsPage />}
        />

        <Route
          path="/comparisons"
          element={<ComparisonsPage />}
        />

        <Route
          path="/settings"
          element={<SettingsPage />}
        />

        <Route
          path="*"
          element={<NotFoundPage />}
        />
      </Routes>
    </AppLayout>
  );
}