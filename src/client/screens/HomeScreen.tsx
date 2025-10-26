import { Button } from '../components/Button';

interface HomeScreenProps {
  onPlay: () => void;
  onSkins: () => void;
}

export default function HomeScreen({ onPlay, onSkins }: HomeScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] gap-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Морской бой</h2>
        <p className="text-tg-hint">Классическая игра на двоих</p>
      </div>

      <div className="w-full max-w-sm space-y-4">
        <Button onClick={onPlay} fullWidth>
          Играть
        </Button>
        <Button onClick={onSkins} variant="secondary" fullWidth>
          Скины
        </Button>
      </div>

      <div className="mt-8 text-center text-sm text-tg-hint">
        <p>Разместите корабли и сражайтесь!</p>
        <p className="mt-2">Первый игрок, потопивший все корабли противника, побеждает.</p>
      </div>
    </div>
  );
}

