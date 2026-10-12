import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "../services/apiClient";

const getThreads = () =>
  apiClient.get("/threads").then((response) => response.data);

const getFlaky = () =>
  apiClient.get("/flaky").then((response) => response.data);

export default function App() {
  const [showFlaky, setShowFlaky] = useState(false);

  const threads = useQuery({
    queryKey: ["threads"],
    queryFn: getThreads,
  });

  const flaky = useQuery({
    queryKey: ["flaky"],
    queryFn: getFlaky,
    enabled: showFlaky,
  });

  return (
    <main>
      <h1>Thread Feed</h1>

      {threads.isPending && <p>Loading threads...</p>}
      {threads.isError && (
        <p role="alert">Could not load threads.</p>
      )}

      <ul>
        {threads.data?.map((thread) => (
          <li key={thread.id}>{thread.title}</li>
        ))}
      </ul>

      <section className="tests">
        <h2>Test the shared layer</h2>

        <div className="buttons">
          <button onClick={() => apiClient.get("/unauthorized")}>
            Trigger 401 (redirect to /login)
          </button>

          <button onClick={() => apiClient.get("/broken")}>
            Trigger 500 (global message)
          </button>

          <button onClick={() => setShowFlaky(true)}>
            Load flaky data (retry)
          </button>
        </div>

        {showFlaky && flaky.isPending && (
          <p>Loading flaky data...</p>
        )}

        {showFlaky && flaky.isError && (
          <p role="alert">
            Flaky request failed even after retry.
          </p>
        )}

        {showFlaky && flaky.data && (
          <p>Success: {flaky.data.message}</p>
        )}
      </section>
    </main>
  );
}
