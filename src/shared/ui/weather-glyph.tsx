type WeatherGlyphProps = {
  code: number | null;
  size?: "sm" | "lg";
};

type WeatherTone = "clear" | "cloudy" | "rainy" | "snowy" | "stormy" | "foggy";

export function WeatherGlyph({ code, size = "lg" }: WeatherGlyphProps) {
  const tone = getWeatherTone(code);
  const isSmall = size === "sm";

  return (
    <div
      aria-hidden="true"
      className={`relative mx-auto ${isSmall ? "h-16 w-20" : "h-28 w-36"}`}
    >
      <div
        className={`absolute rounded-full blur-2xl ${
          isSmall ? "inset-4" : "inset-6"
        } ${getAuraClassName(tone)}`}
      />

      {tone === "clear" ? (
        <SunGlyph isSmall={isSmall} />
      ) : (
        <>
          {tone === "foggy" ? <FogGlyph isSmall={isSmall} /> : null}
          {tone !== "foggy" ? <CloudGlyph isSmall={isSmall} tone={tone} /> : null}
          {tone === "rainy" || tone === "stormy" ? (
            <RainGlyph isSmall={isSmall} tone={tone} />
          ) : null}
          {tone === "snowy" ? <SnowGlyph isSmall={isSmall} /> : null}
        </>
      )}
    </div>
  );
}

function SunGlyph({ isSmall }: { isSmall: boolean }) {
  return (
    <>
      <div
        className={`absolute rounded-full bg-[conic-gradient(from_90deg,#fff7b7,#ffd36f,#fff7b7)] opacity-75 blur-sm ${
          isSmall ? "left-5 top-3 h-10 w-10" : "left-9 top-4 h-20 w-20"
        }`}
      />
      <div
        className={`absolute rounded-full bg-[radial-gradient(circle_at_35%_30%,#fffef0,#ffe391_55%,#f7a93b)] shadow-[0_0_46px_rgba(255,216,113,0.72)] ${
          isSmall ? "left-6 top-4 h-8 w-8" : "left-11 top-6 h-16 w-16"
        }`}
      />
    </>
  );
}

function CloudGlyph({
  isSmall,
  tone,
}: {
  isSmall: boolean;
  tone: WeatherTone;
}) {
  const cloudColor =
    tone === "stormy"
      ? "bg-slate-200/75"
      : tone === "snowy"
        ? "bg-white/90"
        : "bg-white/75";

  return (
    <div
      className={`absolute ${isSmall ? "left-2 top-5 h-9 w-16" : "left-4 top-10 h-14 w-28"}`}
    >
      <div
        className={`absolute bottom-0 left-1/2 h-2/3 w-4/5 -translate-x-1/2 rounded-full ${cloudColor} shadow-[0_18px_36px_rgba(38,53,91,0.22)]`}
      />
      <div
        className={`absolute rounded-full ${cloudColor} ${
          isSmall ? "left-2 top-1 h-8 w-8" : "left-5 top-0 h-14 w-14"
        }`}
      />
      <div
        className={`absolute rounded-full ${cloudColor} ${
          isSmall ? "right-2 top-2 h-7 w-7" : "right-6 top-3 h-12 w-12"
        }`}
      />
    </div>
  );
}

function RainGlyph({
  isSmall,
  tone,
}: {
  isSmall: boolean;
  tone: WeatherTone;
}) {
  const drops = isSmall
    ? [
        { left: 30, top: 48 },
        { left: 44, top: 52 },
        { left: 58, top: 48 },
      ]
    : [
        { left: 48, top: 92 },
        { left: 68, top: 98 },
        { left: 88, top: 92 },
        { left: 108, top: 98 },
      ];

  return (
    <>
      {tone === "stormy" ? (
        <div
          style={isSmall ? { left: 40, top: 40 } : { left: 80, top: 76 }}
          className={`absolute rotate-12 bg-yellow-200 shadow-[0_0_20px_rgba(254,240,138,0.75)] [clip-path:polygon(42%_0,74%_0,58%_42%,86%_42%,30%_100%,44%_56%,18%_56%)] ${
            isSmall ? "h-8 w-5" : "h-12 w-7"
          }`}
        />
      ) : null}
      {drops.map((position) => (
        <div
          key={`${position.left}-${position.top}`}
          style={{ left: position.left, top: position.top }}
          className={`absolute h-4 w-1.5 rotate-12 rounded-full bg-sky-100/85 shadow-[0_0_12px_rgba(186,230,253,0.5)] ${
            isSmall ? "h-3" : "h-5"
          }`}
        />
      ))}
    </>
  );
}

function SnowGlyph({ isSmall }: { isSmall: boolean }) {
  const flakes = isSmall
    ? [
        { left: 30, top: 48 },
        { left: 48, top: 52 },
        { left: 66, top: 48 },
      ]
    : [
        { left: 50, top: 92 },
        { left: 72, top: 98 },
        { left: 96, top: 92 },
      ];

  return (
    <>
      {flakes.map((position) => (
        <div
          key={`${position.left}-${position.top}`}
          style={{ left: position.left, top: position.top }}
          className={`absolute rounded-full bg-white/95 shadow-[0_0_12px_rgba(255,255,255,0.65)] ${
            isSmall ? "h-1.5 w-1.5" : "h-2 w-2"
          }`}
        />
      ))}
    </>
  );
}

function FogGlyph({ isSmall }: { isSmall: boolean }) {
  return (
    <div className={`absolute left-2 right-2 ${isSmall ? "top-6" : "top-11"}`}>
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className={`mx-auto mb-2 rounded-full bg-white/55 blur-[1px] ${
            isSmall ? "h-2 w-14" : "h-3 w-28"
          }`}
        />
      ))}
    </div>
  );
}

function getWeatherTone(code: number | null): WeatherTone {
  if (code === 0) {
    return "clear";
  }

  if (code === 45 || code === 48) {
    return "foggy";
  }

  if (code !== null && [61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
    return "rainy";
  }

  if (code !== null && [71, 73, 75, 77, 85, 86].includes(code)) {
    return "snowy";
  }

  if (code !== null && [95, 96, 99].includes(code)) {
    return "stormy";
  }

  return "cloudy";
}

function getAuraClassName(tone: WeatherTone) {
  if (tone === "clear") {
    return "bg-amber-200/65";
  }

  if (tone === "rainy" || tone === "stormy") {
    return "bg-sky-200/45";
  }

  if (tone === "snowy" || tone === "foggy") {
    return "bg-white/45";
  }

  return "bg-indigo-100/45";
}
