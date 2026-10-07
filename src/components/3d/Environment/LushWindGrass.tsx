import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { gameStore } from '../../../state/useGameStore';

const anchorBlade = (geometry: THREE.ConeGeometry) => { geometry.translate(0, 0.275, 0); };

interface LushWindGrassProps {
  count?: number;
}

/**
 * Instanced swaying grass meadows with wind simulation and player bending response.
 * Uses instancing and GPU deformation to avoid rebuilding thousands of matrices per frame.
 */
export const LushWindGrass: React.FC<LushWindGrassProps> = ({
  count = 2200,
}) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Pre-generate blade transforms and positions around key park areas
  const bladeData = useMemo(() => {
    const data: { x: number; y: number; z: number; rotY: number; scale: number; baseAngle: number }[] = [];
    const zones = [
      // 1. Halaman Rumah Khaulah
      { cx: 0, cz: -6, rx: 14, rz: 10, count: 600 },
      // 2. Taman TK Karang Tengah
      { cx: 0, cz: 36, rx: 16, rz: 14, count: 650 },
      // 3. Kebun Buah & Petting Farm
      { cx: -32, cz: -10, rx: 16, rz: 14, count: 500 },
      // 4. Area Tepi Sungai Sejuk
      { cx: 18, cz: 10, rx: 18, rz: 6, count: 450 },
    ];

    for (const z of zones) {
      for (let i = 0; i < Math.round(count * z.count / 2200); i++) {
        const ang = Math.random() * Math.PI * 2;
        const rad = Math.sqrt(Math.random());
        const x = z.cx + Math.cos(ang) * (rad * z.rx);
        const zPos = z.cz + Math.sin(ang) * (rad * z.rz);
        // Avoid water canal (z: 15 to 21)
        if (zPos >= 14.5 && zPos <= 21.5 && Math.abs(x) < 85) continue;
        // Avoid house interior/porch footprint
        if (Math.abs(x) < 4.5 && zPos > -12 && zPos < -4) continue;

        data.push({
          x,
          y: 0.25,
          z: zPos,
          rotY: Math.random() * Math.PI * 2,
          scale: 0.75 + Math.random() * 0.45,
          baseAngle: Math.random() * Math.PI * 2,
        });
      }
    }
    return data;
  }, [count]);

  // Initialize instances matrix
  useEffect(() => {
    if (!meshRef.current) return;
    const mesh = meshRef.current;
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    const colorA = new THREE.Color('#4ADE80');
    const colorB = new THREE.Color('#22C55E');
    const colorC = new THREE.Color('#86EFAC');

    bladeData.forEach((b, i) => {
      dummy.position.set(b.x, b.y, b.z);
      dummy.rotation.set(0, b.rotY, 0);
      dummy.scale.set(b.scale, b.scale, b.scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);

      // Variasi warna rumput segar
      const color = i % 3 === 0 ? colorA : i % 3 === 1 ? colorB : colorC;
      mesh.setColorAt(i, color);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [bladeData, dummy]);

  const windUniforms = useMemo(() => ({
    grassTime: { value: 0 },
    grassPlayer: { value: new THREE.Vector2() },
  }), []);
  const material = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({ color: '#4ADE80', roughness: 0.7, side: THREE.DoubleSide });
    mat.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, windUniforms);
      shader.vertexShader = 'uniform float grassTime; uniform vec2 grassPlayer;\n' + shader.vertexShader;
      shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', `
        #include <begin_vertex>
        vec2 bladeWorld = (modelMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xz;
        float bladeHeight = clamp(position.y / 0.55, 0.0, 1.0);
        float sway = sin(grassTime * 2.2 + dot(bladeWorld, vec2(0.25))) * 0.12;
        vec2 away = bladeWorld - grassPlayer;
        float distanceToPlayer = length(away);
        vec2 bend = away / max(distanceToPlayer, 0.1) * max(0.0, 1.6 - distanceToPlayer) * 0.3;
        transformed.xz += (vec2(sway, sway * 0.5) + bend) * bladeHeight * bladeHeight;
      `);
    };
    mat.customProgramCacheKey = () => 'khaulah-grass-wind-v1';
    return mat;
  }, [windUniforms]);
  useEffect(() => () => material.dispose(), [material]);
  useFrame((state) => {
    windUniforms.grassTime.value = state.clock.getElapsedTime();
    const player = gameStore.getState().playerPos;
    windUniforms.grassPlayer.value.set(player[0], player[2]);
  });

  return (
    <instancedMesh
      key={count}
      ref={meshRef}
      args={[undefined, undefined, bladeData.length]}
      receiveShadow
      material={material}
    >
      {/* Tapered triangular grass blade */}
      <coneGeometry args={[0.07, 0.55, 3]} onUpdate={anchorBlade} />

    </instancedMesh>
  );
};
