import { Suspense, useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, RoundedBox, Sparkles } from '@react-three/drei'
import { RoundedBoxGeometry } from 'three-stdlib'

const TEAL = '#14b8a6'
const VIOLET = '#8b5cf6'
const PINK = '#f472b6'
const CORAL = '#fb7185'

const C_TEAL = new THREE.Color(TEAL)
const C_VIOLET = new THREE.Color(VIOLET)
const C_PINK = new THREE.Color(PINK)

function rampColor(t, out) {
  if (t < 0.5) out.copy(C_TEAL).lerp(C_VIOLET, t * 2)
  else out.copy(C_VIOLET).lerp(C_PINK, (t - 0.5) * 2)
  return out
}

function diagonalT(x, y) {
  return THREE.MathUtils.clamp(((x + 3.9) / 7.8) * 0.6 + ((y + 2.2) / 4.6) * 0.4, 0, 1)
}

function applyDiagonalGradient(geometry, center) {
  const pos = geometry.attributes.position
  const colors = new Float32Array(pos.count * 3)
  const v = new THREE.Vector3()
  const c = new THREE.Color()
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i).add(center)
    rampColor(diagonalT(v.x, v.y), c)
    colors[i * 3] = c.r
    colors[i * 3 + 1] = c.g
    colors[i * 3 + 2] = c.b
  }
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  return geometry
}

const PLATFORMS = [
  { pos: [-3.0, -1.55, -0.6], size: [1.6, 0.3, 1.0], rot: [0.14, 0.4, -0.12] },
  { pos: [-1.55, -0.8, -0.9], size: [1.45, 0.28, 0.9], rot: [-0.1, -0.25, -0.1] },
  { pos: [-0.1, -0.05, -1.2], size: [1.3, 0.26, 0.85], rot: [0.12, 0.55, -0.09] },
  { pos: [1.35, 0.7, -1.5], size: [1.2, 0.24, 0.8], rot: [-0.08, -0.4, -0.11] },
  { pos: [2.8, 1.45, -1.8], size: [1.05, 0.22, 0.7], rot: [0.1, 0.3, -0.08] },
]

const RIBBON_CURVE = new THREE.CatmullRomCurve3(
  [
    [-3.9, -2.1, -0.3],
    [-2.6, -1.35, -0.55],
    [-1.2, -0.65, -0.8],
    [0.2, 0.1, -1.05],
    [1.6, 0.85, -1.35],
    [3.0, 1.6, -1.6],
    [3.9, 2.1, -1.9],
  ].map((p) => new THREE.Vector3(...p)),
)

const NODE_TS = [0.05, 0.2, 0.35, 0.5, 0.65, 0.8, 0.95]

const ACCENTS = [
  { kind: 'glass-sphere', pos: [-2.7, 1.5, -1.2], r: 0.2, spin: [0.1, 0.15, 0] },
  { kind: 'ring', pos: [2.7, -1.3, -0.9], r: 0.55, tube: 0.04, color: VIOLET, spin: [0.12, 0.2, 0.05] },
  { kind: 'diamond', pos: [-3.5, 0.5, -1.7], s: 0.36, color: TEAL, spin: [0.15, 0.25, 0.1] },
  { kind: 'sphere', pos: [3.5, 0.7, -2.3], r: 0.13, color: PINK, spin: [0, 0.2, 0] },
  { kind: 'ring', pos: [-1.3, 2.1, -2.6], r: 0.42, tube: 0.03, glass: true, spin: [0.1, 0.18, 0.06] },
  { kind: 'diamond', pos: [1.9, 2.2, -1.6], s: 0.28, color: VIOLET, spin: [0.2, 0.3, 0.12] },
]

function Drift({ position = [0, 0, 0], phase = 0, bobSpeed = 1, bobAmp = 0.15, rotSpeed = [0.05, 0.1, 0], children }) {
  const ref = useRef()
  useFrame((state, delta) => {
    const el = ref.current
    if (!el) return
    const t = state.clock.elapsedTime
    el.position.y = THREE.MathUtils.damp(
      el.position.y,
      position[1] + Math.sin(t * bobSpeed + phase) * bobAmp,
      4,
      delta,
    )
    el.rotation.x += delta * rotSpeed[0]
    el.rotation.y += delta * rotSpeed[1]
    el.rotation.z += delta * rotSpeed[2]
  })
  return (
    <group ref={ref} position={position}>
      {children}
    </group>
  )
}

function Platform({ pos, size, rot, phase }) {
  const geometry = useMemo(
    () => applyDiagonalGradient(new RoundedBoxGeometry(size[0], size[1], size[2], 4, 0.09), new THREE.Vector3(...pos)),
    [size, pos],
  )
  return (
    <Drift position={pos} phase={phase} bobSpeed={0.7} bobAmp={0.07} rotSpeed={[0.02, 0.06, 0.01]}>
      <mesh geometry={geometry} rotation={rot}>
        <meshPhysicalMaterial
          vertexColors
          roughness={0.3}
          metalness={0.1}
          clearcoat={0.6}
          clearcoatRoughness={0.3}
          envMapIntensity={0.9}
        />
      </mesh>
    </Drift>
  )
}

function Ribbon({ segments }) {
  const geometry = useMemo(
    () => applyDiagonalGradient(new THREE.TubeGeometry(RIBBON_CURVE, segments, 0.07, 10, false), new THREE.Vector3()),
    [segments],
  )
  return (
    <mesh geometry={geometry}>
      <meshPhysicalMaterial
        vertexColors
        roughness={0.22}
        metalness={0.2}
        clearcoat={0.8}
        clearcoatRoughness={0.25}
        envMapIntensity={1}
      />
    </mesh>
  )
}

function GlowNodes() {
  const nodes = useMemo(
    () => NODE_TS.map((t, i) => ({ pos: RIBBON_CURVE.getPointAt(t), color: i % 2 ? CORAL : TEAL })),
    [],
  )
  return nodes.map((n, i) => (
    <mesh key={i} position={[n.pos.x, n.pos.y + 0.14, n.pos.z]}>
      <sphereGeometry args={[0.055, 12, 12]} />
      <meshBasicMaterial color={n.color} toneMapped={false} />
    </mesh>
  ))
}

function Accent({ spec, phase }) {
  const { kind, pos } = spec
  return (
    <Drift position={pos} phase={phase} bobSpeed={0.9} bobAmp={0.14} rotSpeed={spec.spin}>
      {kind === 'sphere' && (
        <mesh>
          <sphereGeometry args={[spec.r, 24, 24]} />
          <meshPhysicalMaterial color={spec.color} roughness={0.15} clearcoat={1} envMapIntensity={1.1} />
        </mesh>
      )}
      {kind === 'glass-sphere' && (
        <mesh>
          <sphereGeometry args={[spec.r, 32, 32]} />
          <meshPhysicalMaterial
            color="#99f6e4"
            transmission={1}
            thickness={0.9}
            roughness={0.15}
            ior={1.45}
            clearcoat={1}
            attenuationColor="#0d9488"
            attenuationDistance={2.5}
          />
        </mesh>
      )}
      {kind === 'ring' && (
        <mesh rotation={[Math.PI / 2.8, 0.5, 0]}>
          <torusGeometry args={[spec.r, spec.tube, 12, 60]} />
          {spec.glass ? (
            <meshPhysicalMaterial color="#ddd6fe" transmission={1} thickness={0.5} roughness={0.18} ior={1.45} />
          ) : (
            <meshPhysicalMaterial color={spec.color} roughness={0.25} metalness={0.5} clearcoat={0.6} />
          )}
        </mesh>
      )}
      {kind === 'diamond' && (
        <RoundedBox args={[spec.s, spec.s, spec.s]} radius={spec.s * 0.28} smoothness={3} rotation={[Math.PI / 4, 0, Math.PI / 4]}>
          <meshPhysicalMaterial color={spec.color} roughness={0.3} metalness={0.3} clearcoat={0.7} />
        </RoundedBox>
      )}
    </Drift>
  )
}

function FrameLoopGate() {
  const gl = useThree((s) => s.gl)
  const setFrameloop = useThree((s) => s.setFrameloop)
  useEffect(() => {
    const io = new IntersectionObserver(([entry]) => setFrameloop(entry.isIntersecting ? 'always' : 'never'), {
      threshold: 0,
    })
    io.observe(gl.domElement)
    return () => io.disconnect()
  }, [gl, setFrameloop])
  return null
}

function SceneContent({ tier }) {
  const group = useRef()
  const tablet = tier === 'tablet'
  const platforms = tablet ? [PLATFORMS[0], PLATFORMS[2], PLATFORMS[4]] : PLATFORMS
  const accents = tablet ? ACCENTS.slice(0, 4) : ACCENTS
  const shift = tablet ? 0.1 : 0.22

  useFrame((state, delta) => {
    const g = group.current
    if (!g) return
    g.position.x = THREE.MathUtils.damp(g.position.x, state.pointer.x * shift, 3, delta)
    g.position.y = THREE.MathUtils.damp(g.position.y, state.pointer.y * shift * 0.6, 3, delta)
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, state.pointer.x * 0.05, 3, delta)
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, -state.pointer.y * 0.03, 3, delta)
  })

  return (
    <group ref={group}>
      <Ribbon segments={tablet ? 90 : 160} />
      <GlowNodes />
      {platforms.map((p, i) => (
        <Platform key={i} pos={p.pos} size={p.size} rot={p.rot} phase={i * 1.7} />
      ))}
      {platforms.map((p, i) => (
        <mesh key={`edge-${i}`} position={[p.pos[0] + p.size[0] * 0.45, p.pos[1] + 0.22, p.pos[2] + p.size[2] * 0.25]}>
          <sphereGeometry args={[0.05, 12, 12]} />
          <meshBasicMaterial color={i % 2 ? TEAL : CORAL} toneMapped={false} />
        </mesh>
      ))}
      {accents.map((a, i) => (
        <Accent key={i} spec={a} phase={i * 1.3 + 0.6} />
      ))}
      <Sparkles count={tablet ? 45 : 80} scale={[13, 7, 6]} size={2} speed={0.25} opacity={0.3} color="#5eead4" position={[0, 0, -2]} />
      <Sparkles count={tablet ? 25 : 45} scale={[14, 8, 5]} size={3} speed={0.2} opacity={0.18} color="#c4b5fd" position={[0, 0.5, -3]} />
    </group>
  )
}

export default function HeroScene({ tier = 'desktop' }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 6.2], fov: 45 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
      aria-hidden="true"
    >
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 6, 5]} intensity={1.4} />
      <directionalLight position={[-5, 3, -6]} intensity={0.9} color="#5eead4" />
      <pointLight position={[4, -2, 3]} intensity={20} color={CORAL} />
      <pointLight position={[-4, 2, -4]} intensity={25} color={VIOLET} />
      <FrameLoopGate />
      <SceneContent tier={tier} />
      <Suspense fallback={null}>
        <Environment preset="city" />
      </Suspense>
    </Canvas>
  )
}
