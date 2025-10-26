import { useState, useEffect } from 'react';
import { GameProvider } from './contexts/GameContext';
import HomeScreen from './screens/HomeScreen';
import MatchmakingScreen from './screens/MatchmakingScreen';
import PlacementScreen from './screens/PlacementScreen';
import BattleScreen from './screens/BattleScreen';
import ResultScreen from './screens/ResultScreen';
import SkinsScreen from './screens/SkinsScreen';

type Screen =
  | 'home'
  | 'matchmaking'
  | 'placement'
  | 'battle'
  | 'result'
  | 'skins';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [gameId, setGameId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Инициализация Telegram WebApp
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    }
  }, []);

  const navigateTo = (screen: Screen, newGameId?: string | null) => {
    setCurrentScreen(screen);
    if (newGameId !== undefined) {
      setGameId(newGameId);
    }
  };

  // Определение отображаемого экрана
  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return (
          <HomeScreen
            onPlay={() => navigateTo('matchmaking')}
            onSkins={() => navigateTo('skins')}
          />
        );
      case 'matchmaking':
        return (
          <MatchmakingScreen
            onGameStarted={(id) => {
              setGameId(id);
              navigateTo('placement', id);
            }}
            onCancel={() => navigateTo('home')}
          />
        );
      case 'placement':
        return (
          <PlacementScreen
            gameId={gameId!}
            onReady={() => navigateTo('battle')}
            onCancel={() => navigateTo('home')}
          />
        );
      case 'battle':
        return (
          <BattleScreen
            gameId={gameId!}
            onGameEnd={(winnerId) => navigateTo('result', winnerId)}
            onCancel={() => navigateTo('home')}
          />
        );
      case 'result':
        return (
          <ResultScreen
            gameId={gameId!}
            onNewGame={() => navigateTo('matchmaking')}
            onHome={() => navigateTo('home')}
          />
        );
      case 'skins':
        return <SkinsScreen onBack={() => navigateTo('home')} />;
      default:
        return <HomeScreen onPlay={() => navigateTo('matchmaking')} onSkins={() => navigateTo('skins')} />;
    }
  };

  return (
    <GameProvider>
      <div className="min-h-screen bg-tg-bg text-tg-text">
        <header className="bg-tg-secondary-bg p-4 shadow-sm">
          <h1 className="text-xl font-bold text-center">Морской бой</h1>
        </header>

        <main className="p-4">{renderScreen()}</main>
      </div>
    </GameProvider>
  );
}

