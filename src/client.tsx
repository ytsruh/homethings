import { createRoot } from "react-dom/client";
import "./lib/styles.css";

import { Button } from "./lib/components/ui/button";

function Home() {
  return (
    <div>
      <Button>Click me</Button>
    </div>
  );
}

function App() {
  return (
    <>
      <h1>Hello, Hono with React!</h1>
      <Home />
    </>
  );
}

const domNode = document.getElementById("root")!;
const root = createRoot(domNode);
root.render(<App />);
