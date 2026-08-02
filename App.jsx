import { useCallback, useState } from "react";
import StartScreen from "./components/StartScreen.jsx";
import GameScreen from "./components/GameScreen.jsx";
import ResultsScreen from "./components/ResultsScreen.jsx";
import "./App.css";

const DEFAULT_CONFIG = {
  duration: 30, // seconds
  targetSpeed: 5, // 1-10 scale
  targetRadius: 22, // px
  sensitivity: 1, // cursor movement multiplier
};

export default function App() {
  const [screen, setScreen] = useState("start");
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [result, setResult] = useState(null);

  const handleStart = useCallback((cfg) => {
    setConfig(cfg);
    setScreen("playing");
  }, []);

  const handleFinish = useCallback((res) => {
    setResult(res);
    setScreen("results");
  }, []);

  const handleRetry = useCallback(() => {
    setScreen("playing");
  }, []);

  const handleReconfigure = useCallback(() => {
    setScreen("start");
  }, []);

  return (
    <div className="app-shell">
      {screen === "start" && (
        <StartScreen initialConfig={config} onStart={handleStart} />
      )}
      {screen === "playing" && (
        <GameScreen config={config} onFinish={handleFinish} />
      )}
      {screen === "results" && (
        <ResultsScreen
          result={result}
          onRetry={handleRetry}
          onReconfigure={handleReconfigure}
        />
      )}
    </div>
  );
}
