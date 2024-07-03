import { createRoot } from "react-dom/client";

function App() {
  return (
    <>
      <h1>Hello, Hono with React!</h1>
    </>
  );
}

const domNode = document.getElementById("root")!;
const root = createRoot(domNode);
root.render(<App />);
