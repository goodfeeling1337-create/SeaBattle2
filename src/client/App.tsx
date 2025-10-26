import { useState, useEffect } from 'react';
import { GameProvider } from './contexts/GameContext';
import { Button } from './components/Button';
import HomeScreen from './screens/HomeScreen';
import MatchmakingScreen from './screens/MatchmakingScreen';
import PlacementScreen from './screens/PlacementScreen';
import BattleScreen from './screens/BattleScreen';
import ResultScreen from './screens/ResultScreen';
import SkinsScreen from './screens/SkinsScreen';

type Screen =
  | 'home'
  | 'matchmaking'
  | 'bot-selection'
  | 'placement'
  | 'battle'
  | 'result'
  | 'skins';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [gameId, setGameId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [botMode, setBotMode] = useState(false);

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
            onPlay={() => navigateTo('bot-selection')}
            onSkins={() => navigateTo('skins')}
          />
        );
      case 'bot-selection':
        return (
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] gap-6">
            <h2 className="text-2xl font-bold">Выберите соперника</h2>
            <div className="w-full max-w-sm space-y-4">
              <Button
                onClick={() => {
                  setBotMode(false);
                  navigateTo('matchmaking');
                }}
                fullWidth
              >
                Играть онлайн
              </Button>
              <Button
                onClick={async () => {
                  try {
                    setBotMode(true);
                    
                    // Создание игры с ботом
                    const initData = window.Telegram?.WebApp?.initData || '';
                    console.log('Bot game initData:', initData ? 'has data' : 'empty');
                    
                    const response = await fetch('/api/game/bot', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'X-Telegram-Init-Data': initData,
                      },
                      body: JSON.stringify({ difficulty: 'medium' }),
                    });

                    console.log('Bot game response status:', response.status);

                    if (!response.ok) {
                      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
                      console.log('Bot game error:', errorData);
                      throw new Error(errorData.error || 'Failed to create bot game');
                    }

                    const { gameId } = await response.json();
                    setGameId(gameId);
                    navigateTo('placement', gameId);
                  } catch (error: any) {
                    console.error('Error creating bot game:', error);
                    alert(`Не удалось создать игру с ботом: ${error.message}`);
                  }
                }}
                fullWidth
                variant="secondary"
              >
                Против бота
              </Button>
            </div>
          </div>
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

