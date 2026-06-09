import * as THREE from 'three'

/* Objet 3D du hero : icosaèdre wireframe qui respire + réagit à la souris.
   Volontairement léger (pas de modèle GLTF) pour rester rapide. */
export function initHero(canvas) {
  if (!canvas) return

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 100)
  camera.position.z = 6

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2))

  // géométrie : sphère facettée
  const geo = new THREE.IcosahedronGeometry(2.1, 4)
  const base = geo.attributes.position.array.slice()

  const wire = new THREE.LineSegments(
    new THREE.WireframeGeometry(geo),
    new THREE.LineBasicMaterial({ color: 0xd6ff3f, transparent: true, opacity: 0.22 })
  )
  scene.add(wire)

  const points = new THREE.Points(
    geo,
    new THREE.PointsMaterial({ color: 0xededdf, size: 0.022 })
  )
  scene.add(points)

  const group = new THREE.Group()
  group.add(wire, points)
  scene.add(group)

  const mouse = { x: 0, y: 0 }
  addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX / innerWidth - 0.5) * 2
    mouse.y = (e.clientY / innerHeight - 0.5) * 2
  })

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }
  resize()
  addEventListener('resize', resize)

  let t = 0
  function animate() {
    t += 0.01
    // déformation organique des sommets
    const pos = geo.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const ix = i * 3
      const nx = base[ix], ny = base[ix + 1], nz = base[ix + 2]
      const len = Math.sqrt(nx * nx + ny * ny + nz * nz)
      const wave = 1 + 0.12 * Math.sin(t * 2 + nx * 2.5 + ny * 1.5) * Math.cos(t + nz * 2)
      pos.setXYZ(i, (nx / len) * 2.1 * wave, (ny / len) * 2.1 * wave, (nz / len) * 2.1 * wave)
    }
    pos.needsUpdate = true

    group.rotation.y += 0.002
    group.rotation.x += 0.0012
    // léger suivi de souris
    group.rotation.y += (mouse.x * 0.5 - group.rotation.y % (Math.PI * 2)) * 0.0
    camera.position.x += (mouse.x * 0.8 - camera.position.x) * 0.04
    camera.position.y += (-mouse.y * 0.8 - camera.position.y) * 0.04
    camera.lookAt(0, 0, 0)

    renderer.render(scene, camera)
    requestAnimationFrame(animate)
  }
  animate()
}
