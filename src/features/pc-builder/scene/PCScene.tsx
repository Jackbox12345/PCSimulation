import { ui } from "../../../styles/ui";
import { Component, useEffect, useRef, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Grid, Html, ContactShadows } from "@react-three/drei";
import { Group } from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { usePCStore } from "../store/usePCStore";
import { byId, type Category } from "../data/hardware";
import { usePreferences } from "../../../utils/preferences";
import { installationIssues } from "../engine/compatibility";
type Vec = [number, number, number];
const locations: Record<Category, Vec> = {
  motherboard: [0, 0.4, -0.48],
  cpu: [-0.28, 0.92, -0.28],
  cooler: [-0.28, 0.92, 0],
  ram: [0.57, 0.72, -0.25],
  gpu: [0, -0.22, 0.05],
  storage: [0.75, -0.6, 0.2],
  psu: [-0.32, -1.08, 0],
};
const sizes: Record<Category, Vec> = {
  motherboard: [1.65, 1.85, 0.07],
  cpu: [0.42, 0.42, 0.1],
  cooler: [0.65, 0.67, 0.5],
  ram: [0.14, 0.85, 0.16],
  gpu: [1.55, 0.25, 0.65],
  storage: [0.5, 0.45, 0.15],
  psu: [1.05, 0.45, 0.85],
};
const partLocation = (category: Category, id?: string): Vec =>
  id === "nvme" ? [0.1, 0.13, -0.33] : locations[category];
const partSize = (category: Category, id?: string): Vec =>
  id === "nvme" ? [0.55, 0.13, 0.045] : sizes[category];
function Block({
  position = [0, 0, 0],
  size,
  color = "#273746",
  metalness = 0.5,
}: {
  position?: Vec;
  size: Vec;
  color?: string;
  metalness?: number;
}) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={color}
        metalness={metalness}
        roughness={0.48}
      />
    </mesh>
  );
}
function Fan({ position, radius = 0.29 }: { position: Vec; radius?: number }) {
  return (
    <group position={position}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[radius, radius, 0.055, 32]} />
        <meshStandardMaterial color="#111b23" />
      </mesh>
      <mesh>
        <torusGeometry args={[radius * 0.82, 0.016, 8, 40]} />
        <meshStandardMaterial
          color="#66cfc6"
          emissive="#24776f"
          emissiveIntensity={0.35}
        />
      </mesh>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <group key={i} rotation={[0, 0, (i * Math.PI) / 3]}>
          <Block
            size={[radius * 0.27, radius * 0.66, 0.025]}
            position={[radius * 0.22, radius * 0.36, 0.038]}
            color="#425868"
          />
        </group>
      ))}
      <mesh position={[0, 0, 0.06]}>
        <sphereGeometry args={[radius * 0.24, 16, 16]} />
        <meshStandardMaterial color="#698493" />
      </mesh>
    </group>
  );
}
function Part({ category, id }: { category: Category; id?: string }) {
  const ref = useRef<Group>(null);
  const reduced = usePreferences((s) => s.reducedMotion);
  useFrame((_, delta) => {
    if (ref.current)
      ref.current.scale.lerp({ x: 1, y: 1, z: 1 }, Math.min(1, delta * 12));
  });
  return (
    <group
      ref={ref}
      scale={reduced ? 1 : 0.6}
      position={partLocation(category, id)}
    >
      {category === "motherboard" ? (
        <>
          <Block size={sizes.motherboard} color="#204c4b" />
          {[-0.63, 0.65].map((x) =>
            [-0.78, 0.78].map((y) => (
              <mesh key={`${x}${y}`} position={[x, y, 0.05]}>
                <cylinderGeometry args={[0.035, 0.035, 0.02, 12]} />
                <meshStandardMaterial color="#bcc1b3" />
              </mesh>
            )),
          )}
          <Block
            size={[0.5, 0.5, 0.06]}
            position={[-0.28, 0.52, 0.06]}
            color="#59646a"
          />
          {[0.5, 0.67].map((x) => (
            <Block
              key={x}
              position={[x, 0.3, 0.06]}
              size={[0.09, 0.9, 0.1]}
              color="#142a33"
            />
          ))}
          {[-0.5, -0.7].map((y) => (
            <Block
              key={y}
              position={[-0.1, y, 0.06]}
              size={[1.2, 0.075, 0.1]}
              color="#94a5ab"
            />
          ))}
          <Block
            position={[-0.64, 0.2, 0.1]}
            size={[0.18, 1, 0.2]}
            color="#75838c"
          />
          <Block
            position={[0.05, -0.23, 0.07]}
            size={[0.36, 0.32, 0.12]}
            color="#29343c"
          />
          {Array.from({ length: 7 }, (_, i) => (
            <Block
              key={i}
              position={[-0.38 + i * 0.15, -0.05, 0.041]}
              size={[0.012, 0.3, 0.005]}
              color="#4c8c75"
            />
          ))}
        </>
      ) : category === "cpu" ? (
        <>
          <Block size={sizes.cpu} color="#bcc7c9" />
          <Block
            position={[0, 0, 0.055]}
            size={[0.28, 0.28, 0.015]}
            color="#8f9fa4"
          />
        </>
      ) : category === "cooler" ? (
        <>
          {Array.from({ length: 8 }, (_, i) => (
            <Block
              key={i}
              size={[0.58, 0.045, 0.42]}
              position={[0, -0.28 + i * 0.08, 0]}
              color="#8b9ba4"
            />
          ))}
          <Fan position={[0, 0, 0.24]} radius={0.28} />
        </>
      ) : category === "ram" ? (
        <>
          {[0, 0.2].map((x) => (
            <group key={x}>
              <Block size={sizes.ram} position={[x, 0, 0]} color="#244f48" />
              <Block
                size={[0.15, 0.7, 0.1]}
                position={[x, 0, 0.1]}
                color="#2c3944"
              />
              <Block
                size={[0.16, 0.74, 0.025]}
                position={[x, 0, 0.17]}
                color="#67d4c5"
              />
            </group>
          ))}
        </>
      ) : category === "gpu" ? (
        <>
          <Block size={sizes.gpu} color="#273542" />
          <Fan position={[-0.4, 0, 0.36]} radius={0.19} />
          <Fan position={[0.3, 0, 0.36]} radius={0.19} />
          <Block
            position={[0, 0.14, 0.3]}
            size={[1.35, 0.035, 0.05]}
            color="#69d8c6"
          />
        </>
      ) : category === "psu" ? (
        <>
          <Block size={sizes.psu} color="#24313c" />
          <Fan position={[0, 0, 0.44]} radius={0.18} />
          <Block
            size={[0.3, 0.1, 0.01]}
            position={[-0.32, 0.08, 0.44]}
            color="#c8ad6f"
          />
        </>
      ) : id === "nvme" ? (
        <>
          <Block size={partSize(category, id)} color="#285746" />
          {[-0.16, 0, 0.16].map((x) => (
            <Block
              key={x}
              size={[0.1, 0.09, 0.025]}
              position={[x, 0, 0.035]}
              color="#222e38"
            />
          ))}
        </>
      ) : (
        <>
          <Block size={sizes.storage} color="#8b9da6" />
          <Block
            size={[0.35, 0.23, 0.01]}
            position={[0, 0, 0.08]}
            color="#294653"
          />
        </>
      )}
    </group>
  );
}
function Case() {
  const installed = usePCStore((s) => s.installed),
    selectedId = usePCStore((s) => s.selectedId),
    install = usePCStore((s) => s.install);
  const candidate = selectedId ? byId[selectedId] : null;
  const selected =
    candidate && installationIssues(installed, candidate).length === 0
      ? candidate
      : null;
  return (
    <group position={[0, 0.2, 0]}>
      <Block size={[2.25, 0.12, 1.45]} position={[0, -1.4, 0]} />
      <Block size={[2.25, 0.12, 1.45]} position={[0, 1.55, 0]} />
      <Block
        size={[2.25, 2.9, 0.08]}
        position={[0, 0.05, -0.68]}
        color="#17232e"
      />
      {[-1.08, 1.08].map((x) => (
        <group key={x}>
          <Block
            size={[0.1, 2.95, 0.1]}
            position={[x, 0.05, 0.68]}
            color="#71808b"
          />
          <Block size={[0.1, 2.95, 0.1]} position={[x, 0.05, -0.68]} />
          <Block size={[0.1, 0.1, 1.4]} position={[x, -1.35, 0]} />
        </group>
      ))}
      <Block
        size={[0.09, 2.9, 1.35]}
        position={[1.08, 0.05, 0]}
        color="#283744"
      />
      <group rotation={[0, -Math.PI / 2, 0]} position={[1.02, 0, 0]}>
        <Fan position={[0, 0.85, 0]} radius={0.42} />
        <Fan position={[0, -0.2, 0]} radius={0.42} />
      </group>
      <Block
        size={[2.12, 0.06, 1.3]}
        position={[0, -0.78, 0]}
        color="#344654"
      />
      {[-1, 1].map((x) => (
        <Block
          key={x}
          size={[0.25, 0.18, 1]}
          position={[x, -1.53, 0]}
          color="#101b25"
        />
      ))}
      {Array.from({ length: 5 }, (_, i) => (
        <Block
          key={i}
          position={[-1.02, -0.05 - i * 0.13, -0.12]}
          size={[0.04, 0.075, 0.7]}
          color="#6d7d88"
        />
      ))}
      {Object.entries(installed).map(([cat, id]) => (
        <Part key={id} id={id} category={cat as Category} />
      ))}
      {selected && (
        <group position={partLocation(selected.category, selected.id)}>
          <mesh
            onClick={(e) => {
              e.stopPropagation();
              install();
            }}
          >
            <boxGeometry
              args={
                partSize(selected.category, selected.id).map(
                  (n) => n + 0.1,
                ) as Vec
              }
            />
            <meshStandardMaterial
              color="#5ce3ce"
              emissive="#39c4b4"
              emissiveIntensity={0.4}
              transparent
              opacity={0.42}
              depthWrite={false}
            />
          </mesh>
          <Html position={[0, 0.48, 0.5]} center>
            <button className={ui("slot-label")} onClick={install}>
              + Install {selected.category.toUpperCase()}
            </button>
          </Html>
        </group>
      )}
    </group>
  );
}
function Controls({ resetKey }: { resetKey: number }) {
  const ref = useRef<OrbitControlsImpl>(null);
  useEffect(() => {
    ref.current?.reset();
  }, [resetKey]);
  return (
    <OrbitControls
      ref={ref}
      makeDefault
      target={[0, 0.15, 0]}
      minDistance={3}
      maxDistance={12}
      maxPolarAngle={Math.PI * 0.91}
    />
  );
}
class SceneBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div className={ui("empty-state")}>
        3D rendering is unavailable. Enable WebGL or hardware acceleration in
        your browser. Inventory and diagnostics remain available.
      </div>
    ) : (
      this.props.children
    );
  }
}
export default function PCScene({ resetKey }: { resetKey: number }) {
  const quality = usePreferences((s) => s.highQuality);
  return (
    <SceneBoundary>
      <Canvas
        camera={{ position: [-4.6, 3.1, 5.5], fov: 42 }}
        dpr={quality ? [1, 2] : 1}
        shadows={quality}
        fallback={
          <div className={ui("empty-state")}>
            WebGL is required for the 3D workbench.
          </div>
        }
      >
        <color attach="background" args={["#101923"]} />
        <ambientLight intensity={1.2} />
        <directionalLight position={[-3, 6, 5]} intensity={3} castShadow />
        <pointLight position={[3, 2, 2]} intensity={18} color="#88d6ef" />
        <Case />
        <Grid
          position={[0, -1.43, 0]}
          args={[30, 30]}
          cellSize={0.5}
          cellThickness={0.5}
          cellColor="#263e4e"
          sectionColor="#3b586a"
          sectionSize={2.5}
          fadeDistance={18}
          infiniteGrid
        />
        {quality && (
          <ContactShadows
            position={[0, -1.43, 0]}
            opacity={0.35}
            scale={10}
            blur={2}
            far={5}
          />
        )}
        <Controls resetKey={resetKey} />
      </Canvas>
    </SceneBoundary>
  );
}
