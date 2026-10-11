"use client";

import { useEffect, useRef } from "react";
import { Player, type PlayerRef } from "@remotion/player";
import BlockWordmark from "@/components/ui/block-wordmark";

type Props = { onFinish: () => void };

export default function CarryGoWordmarkPlayer({ onFinish }: Props) {
  const playerRef = useRef<PlayerRef>(null);
  useEffect(() => {
    const current = playerRef.current;
    if (!current) return;
    const finish = () => onFinish();
    const fail = () => onFinish();
    current.addEventListener("ended", finish);
    current.addEventListener("error", fail);
    return () => {
      current.removeEventListener("ended", finish);
      current.removeEventListener("error", fail);
    };
  }, [onFinish]);

  return (
    <Player
      ref={playerRef}
      component={BlockWordmark}
      durationInFrames={150}
      fps={30}
      compositionWidth={480}
      compositionHeight={120}
      inputProps={{
        text: "CarryGo",
        fontSize: 132,
        color: "#0B0D0C",
        background: "transparent",
        colors: "#B9FF35,#8B67FF,#0B0D0C,#F3F3ED,#8B67FF",
        maxWidth: 0.92,
      }}
      style={{ width: "112px", height: "28px", display: "block" }}
      autoPlay
      loop={false}
      controls={false}
      moveToBeginningWhenEnded={false}
    />
  );
}
