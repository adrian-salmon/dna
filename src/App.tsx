import * as THREE from 'three'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useState } from 'react'
import './App.css'

function DNAHelix() {
  const basePairs = 10
  const helixRadius = 2
  const helixPitch = 3
  const basePairLength = 2

  const nucleotides = []
  const backbones = []
  const basePairConnections = []

  // Generate the DNA structure
  for (let i = 0; i < basePairs; i++) {
    const angle = (i / basePairs) * Math.PI * 2 * 2 // Two full turns
    const height = (i / basePairs) * helixPitch * 2

    // First strand positions
    const x1 = Math.cos(angle) * helixRadius
    const z1 = Math.sin(angle) * helixRadius
    const y1 = height

    // Second strand positions (offset by 180 degrees)
    const x2 = Math.cos(angle + Math.PI) * helixRadius
    const z2 = Math.sin(angle + Math.PI) * helixRadius
    const y2 = height

    // Add nucleotides
    nucleotides.push(
      <mesh key={`nuc1-${i}`} position={[x1, y1, z1]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color={i % 2 === 0 ? '#ff4444' : '#4444ff'} />
      </mesh>,
      <mesh key={`nuc2-${i}`} position={[x2, y2, z2]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color={i % 2 === 0 ? '#44ff44' : '#ffff44'} />
      </mesh>
    )

    // Add base pair connections
    basePairConnections.push(
      <mesh key={`base-${i}`}>
        <cylinderGeometry args={[0.1, 0.1, basePairLength, 8]} />
        <meshStandardMaterial color="#999999" />
        <group position={[x1, y1, z1]} lookAt={[x2, y2, z2]}>
          <primitive object={new THREE.Object3D()} />
        </group>
      </mesh>
    )

    // Add backbone connections if not the last nucleotide
    if (i < basePairs - 1) {
      const nextAngle = ((i + 1) / basePairs) * Math.PI * 2 * 2
      const nextHeight = ((i + 1) / basePairs) * helixPitch * 2

      const nextX1 = Math.cos(nextAngle) * helixRadius
      const nextZ1 = Math.sin(nextAngle) * helixRadius
      const nextY1 = nextHeight

      const nextX2 = Math.cos(nextAngle + Math.PI) * helixRadius
      const nextZ2 = Math.sin(nextAngle + Math.PI) * helixRadius
      const nextY2 = nextHeight

      backbones.push(
        <mesh key={`backbone1-${i}`}>
          <cylinderGeometry args={[0.1, 0.1, 1, 8]} />
          <meshStandardMaterial color="#666666" />
          <group position={[x1, y1, z1]} lookAt={[nextX1, nextY1, nextZ1]}>
            <primitive object={new THREE.Object3D()} />
          </group>
        </mesh>,
        <mesh key={`backbone2-${i}`}>
          <cylinderGeometry args={[0.1, 0.1, 1, 8]} />
          <meshStandardMaterial color="#666666" />
          <group position={[x2, y2, z2]} lookAt={[nextX2, nextY2, nextZ2]}>
            <primitive object={new THREE.Object3D()} />
          </group>
        </mesh>
      )
    }
  }

  return (
    <>
      {nucleotides}
      {basePairConnections}
      {backbones}
    </>
  )
}

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas camera={{ position: [10, 5, 10], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <DNAHelix />
        <OrbitControls />
      </Canvas>
    </div>
  )
}

export default App
