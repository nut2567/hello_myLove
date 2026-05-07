import { notFound } from "next/navigation";

import { HeartButton } from "../../../../../components/ui/heart-button";

type HeartIdPageProps = {
  params: Promise<{
    id: string;
  }>;
};

type HeartPosition = {
  left: `${number}%`;
  top: `${number}%`;
};

function validateHeartId(id: string): string {
  if (!/^\d+$/.test(id)) {
    notFound();
  }

  return id;
}

function hashId(id: string): number {
  let hash = 2_166_136_261;

  for (const character of id) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16_777_619);
  }

  return hash >>> 0;
}

function seededFraction(seed: number, salt: number): number {
  let value = seed + Math.imul(salt, 2_654_435_761);

  value ^= value >>> 16;
  value = Math.imul(value, 2_246_822_507);
  value ^= value >>> 13;
  value = Math.imul(value, 3_266_489_909);
  value ^= value >>> 16;

  return (value >>> 0) / 4_294_967_295;
}

function getHeartPosition(id: string): HeartPosition {
  const seed = hashId(id);
  const left = 12 + Math.round(seededFraction(seed, 1) * 76);
  const top = 12 + Math.round(seededFraction(seed, 2) * 76);

  return {
    left: `${left}%`,
    top: `${top}%`,
  };
}

export default async function HeartIdPage({ params }: HeartIdPageProps) {
  const { id } = await params;
  const heartId = validateHeartId(id);
  const position = getHeartPosition(heartId);

  return (
    <main className="relative flex flex-1 overflow-hidden">
      <HeartButton
        aria-label="Generate another random heart"
        className="absolute -translate-x-1/2 -translate-y-1/2"
        style={position}
      />
    </main>
  );
}
