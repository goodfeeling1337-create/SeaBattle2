import { useState, useEffect } from 'react';
import { Button } from '../components/Button';
import type { Skin } from '../../types';

interface SkinsScreenProps {
  onBack: () => void;
}

export default function SkinsScreen({ onBack }: SkinsScreenProps) {
  const [skins, setSkins] = useState<Skin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSkins();
  }, []);

  const fetchSkins = async () => {
    try {
      const initData = window.Telegram?.WebApp?.initData || '';
      
      const response = await fetch('/api/skins', {
        headers: {
          'X-Telegram-Init-Data': initData,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch skins');
      }

      const data = await response.json();
      setSkins(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching skins:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEquip = async (skinId: string) => {
    try {
      const initData = window.Telegram?.WebApp?.initData || '';
      
      const response = await fetch('/api/skins/equip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Telegram-Init-Data': initData,
        },
        body: JSON.stringify({ skinId }),
      });

      if (!response.ok) {
        throw new Error('Failed to equip skin');
      }

      // Обновляем список скинов
      await fetchSkins();
    } catch (err) {
      console.error('Error equipping skin:', err);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Скины</h2>
        <Button onClick={onBack} variant="secondary">
          Назад
        </Button>
      </div>

      {loading ? (
        <p className="text-center text-tg-hint">Загрузка...</p>
      ) : error ? (
        <p className="text-center text-red-500">Ошибка: {error}</p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {skins.length === 0 && (
            <p className="text-center text-tg-hint">Скины не найдены</p>
          )}
          {skins.map((skin) => (
            <div
              key={skin.id}
              className="border border-tg-hint rounded-lg p-4 hover:bg-tg-secondary-bg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{skin.name}</h3>
                  <p className="text-sm text-tg-hint">Редкость: {skin.rarity}</p>
                </div>
                <Button
                  variant="secondary"
                  disabled={!skin.owned}
                  onClick={() => handleEquip(skin.id)}
                >
                  {skin.equipped ? 'Экипирован' : skin.owned ? 'Экипировать' : 'Недоступен'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

