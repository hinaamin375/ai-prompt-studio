import { useQuery } from "@tanstack/react-query";

import { getHealth } from "../../api/health";

export function ApiStatus() {
  const healthQuery = useQuery({
    queryKey: ["health"],
    queryFn: getHealth,
  });

  if (healthQuery.isPending) {
    return <p>Checking API connection...</p>;
  }

  if (healthQuery.isError) {
    return (
      <div role="alert">
        <strong>API unavailable</strong>
        <p>Start the FastAPI backend and refresh this page.</p>
      </div>
    );
  }

  return (
    <div>
      <strong>API status: Operational</strong>
      <p>Service: {healthQuery.data.service}</p>
    </div>
  );
}