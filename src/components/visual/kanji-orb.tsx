import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sphere, MeshDistortMaterial } from "@react-three/drei";
import { Text } from "@react-three/drei";
import type { Mesh } from "three";

interface KanjiOrbProps {
  character?: string;
  size?: number;
}

/**
 * A 3D orb with a floating kanji character on top. Used as the hero
 * element on the Dashboard "next action" card and Onboarding.
 *
 * Uses react-three-fiber for the actual 3D rendering. The orb gently
 * rotates and pulses, the kanji floats above it.
 */
export function KanjiOrb({ character = "始", size = 320 }: KanjiOrbProps) {
  return (
    <div
      className="pointer-events-none relative"
      style={{ width: size, height: size }}
    >
      <Canvas
        camera={{ position: [0, 0, 4.4], fov: 45 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.6} />
        <pointLight position={[3, 3, 5]} intensity={2.4} color="#c8a4ff" />
        <pointLight position={[-3, -2, 3]} intensity={1.6} color="#8ee0ff" />
        <pointLight position={[0, -4, 2]} intensity={1.2} color="#ff8db5" />
        <Suspense fallback={null}>
          <Orb />
          <FloatingKanji character={character} />
        </Suspense>
      </Canvas>
    </div>
  );
}

function Orb() {
  const meshRef = useRef<Mesh>(null);
  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.18;
    meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.4) * 0.1;
  });

  return (
    <Float speed={1.6} rotationIntensity={0.5} floatIntensity={1.2}>
      <Sphere ref={meshRef} args={[1.35, 96, 96]}>
        <MeshDistortMaterial
          color="#8b5cf6"
          distort={0.42}
          speed={1.8}
          roughness={0.15}
          metalness={0.55}
          emissive="#5b21b6"
          emissiveIntensity={0.45}
        />
      </Sphere>
    </Float>
  );
}

function FloatingKanji({ character }: { character: string }) {
  return (
    <Float speed={2.4} rotationIntensity={0.2} floatIntensity={1.6}>
      <Text
        font="https://fonts.gstatic.com/s/notosansjp/v52/-F6jfjtqLzI2JPCgQBnw7HFyzSD-AsregP8VFBEj75s.woff"
        fontSize={1.05}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        position={[0, 0.05, 1.4]}
        outlineWidth={0.012}
        outlineColor="#7c3aed"
      >
        {character}
      </Text>
    </Float>
  );
}
