export interface PlanetData {
  id: string;
  name: string;
  color: string;
  size: number; // display size in px
  realDiameter: string; // km
  distanceFromSun: string; // million km
  orbitalPeriod: string; // Earth days/years
  orbitRadius: number; // display orbit radius in px
  orbitalSpeed: number; // relative speed (higher = faster)
  description: string;
  emoji: string;
}

export const planets: PlanetData[] = [
  {
    id: 'mercury',
    name: 'Mercury',
    color: '#b5b5b5',
    size: 8,
    realDiameter: '4,879 km',
    distanceFromSun: '57.9 million km',
    orbitalPeriod: '88 Earth days',
    orbitRadius: 70,
    orbitalSpeed: 4.15,
    description: 'The smallest planet and closest to the Sun. It has no atmosphere and extreme temperature variations.',
    emoji: '☿',
  },
  {
    id: 'venus',
    name: 'Venus',
    color: '#e8cda0',
    size: 12,
    realDiameter: '12,104 km',
    distanceFromSun: '108.2 million km',
    orbitalPeriod: '225 Earth days',
    orbitRadius: 105,
    orbitalSpeed: 1.62,
    description: 'The hottest planet due to its thick atmosphere of carbon dioxide. It rotates in the opposite direction to most planets.',
    emoji: '♀',
  },
  {
    id: 'earth',
    name: 'Earth',
    color: '#4da6ff',
    size: 13,
    realDiameter: '12,756 km',
    distanceFromSun: '149.6 million km',
    orbitalPeriod: '365.25 Earth days',
    orbitRadius: 145,
    orbitalSpeed: 1.0,
    description: 'Our home planet — the only known world with liquid water on its surface and life. It has one natural satellite: the Moon.',
    emoji: '🌍',
  },
  {
    id: 'mars',
    name: 'Mars',
    color: '#e07050',
    size: 10,
    realDiameter: '6,792 km',
    distanceFromSun: '227.9 million km',
    orbitalPeriod: '687 Earth days',
    orbitRadius: 190,
    orbitalSpeed: 0.53,
    description: 'The Red Planet, known for its iron oxide surface. It has the largest volcano (Olympus Mons) in the solar system.',
    emoji: '♂',
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    color: '#c8a87c',
    size: 28,
    realDiameter: '142,984 km',
    distanceFromSun: '778.6 million km',
    orbitalPeriod: '11.86 Earth years',
    orbitRadius: 260,
    orbitalSpeed: 0.084,
    description: 'The largest planet, a gas giant with a famous Great Red Spot storm. It has at least 95 known moons.',
    emoji: '♃',
  },
  {
    id: 'saturn',
    name: 'Saturn',
    color: '#e8d5a3',
    size: 24,
    realDiameter: '120,536 km',
    distanceFromSun: '1,433.5 million km',
    orbitalPeriod: '29.46 Earth years',
    orbitRadius: 330,
    orbitalSpeed: 0.034,
    description: 'Famous for its stunning ring system made of ice and rock particles. It is the least dense planet — it could float on water!',
    emoji: '♄',
  },
  {
    id: 'uranus',
    name: 'Uranus',
    color: '#7ec8e3',
    size: 18,
    realDiameter: '51,118 km',
    distanceFromSun: '2,872.5 million km',
    orbitalPeriod: '84.01 Earth years',
    orbitRadius: 395,
    orbitalSpeed: 0.012,
    description: 'An ice giant that rotates on its side. Its blue-green color comes from methane in its atmosphere.',
    emoji: '♅',
  },
  {
    id: 'neptune',
    name: 'Neptune',
    color: '#4169e1',
    size: 17,
    realDiameter: '49,528 km',
    distanceFromSun: '4,495.1 million km',
    orbitalPeriod: '164.8 Earth years',
    orbitRadius: 450,
    orbitalSpeed: 0.006,
    description: 'The windiest planet with speeds up to 2,100 km/h. It is the farthest planet from the Sun.',
    emoji: '♆',
  },
];
