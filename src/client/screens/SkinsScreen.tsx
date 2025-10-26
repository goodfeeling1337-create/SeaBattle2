import { useState, useEffect } from 'react';
import { Button } from '../components/Button';
import type { Skin } from '../../types';

interface SkinsScreenProps {
  onBack: () => void;
}

export default function SkinsScreen({ onBack }: SkinsScreenProps) {
  const [skins, setSkins] = useState<Skin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch skins from API
    setLoading(false);
  }, []);

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
                  onClick={() => {
                    // TODO: Equip skin
                  }}
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

