import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create default rule set
  const classicRuleSet = await prisma.ruleSet.upsert({
    where: { name: 'classic' },
    update: {},
    create: {
      name: 'classic',
      isClassic: true,
      allowDiagonal: false,
      touchProhibited: true,
      shipsJson: JSON.stringify({
        ships: [
          { size: 4, count: 1 }, // Carrier
          { size: 3, count: 2 }, // Battleship
          { size: 2, count: 3 }, // Destroyer
          { size: 1, count: 4 }, // Submarine
        ],
      }),
    },
  });

  console.log('✅ Rule set created:', classicRuleSet.name);

  // Create default skins
  const defaultSkins = [
    {
      key: 'classic_blue',
      name: 'Classic Blue',
      rarity: 'COMMON',
      isDefault: true,
      assetsJson: JSON.stringify({
        version: 1,
        name: 'Classic Blue',
        sprites: {
          ship: '/skins/classic_blue/ship.svg',
          cell: '/skins/classic_blue/cell.svg',
          hit: '/skins/classic_blue/hit.svg',
          miss: '/skins/classic_blue/miss.svg',
          empty: '/skins/classic_blue/empty.svg',
        },
        cssVars: {
          '--cell-bg': '#1e3a8a',
          '--grid': '#3b82f6',
        },
      }),
    },
    {
      key: 'dark_minimal',
      name: 'Dark Minimal',
      rarity: 'RARE',
      assetsJson: JSON.stringify({
        version: 1,
        name: 'Dark Minimal',
        sprites: {
          ship: '/skins/dark_minimal/ship.svg',
          cell: '/skins/dark_minimal/cell.svg',
          hit: '/skins/dark_minimal/hit.svg',
          miss: '/skins/dark_minimal/miss.svg',
          empty: '/skins/dark_minimal/empty.svg',
        },
        cssVars: {
          '--cell-bg': '#0f172a',
          '--grid': '#64748b',
        },
      }),
    },
    {
      key: 'neon_grid',
      name: 'Neon Grid',
      rarity: 'EPIC',
      assetsJson: JSON.stringify({
        version: 1,
        name: 'Neon Grid',
        sprites: {
          ship: '/skins/neon_grid/ship.svg',
          cell: '/skins/neon_grid/cell.svg',
          hit: '/skins/neon_grid/hit.svg',
          miss: '/skins/neon_grid/miss.svg',
          empty: '/skins/neon_grid/empty.svg',
        },
        cssVars: {
          '--cell-bg': '#0b0f1a',
          '--grid': '#12f7d6',
        },
      }),
    },
  ];

  for (const skin of defaultSkins) {
    await prisma.skin.upsert({
      where: { key: skin.key },
      update: {},
      create: skin,
    });
  }

  console.log('✅ Skins created:', defaultSkins.length);

  console.log('✨ Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

