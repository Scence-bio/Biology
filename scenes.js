/* ══════════════════════════════════════════
   BioGuide 3D — scenes.js (Ultra-Realistic PBR Version)
   Advanced Three.js scene builders with Physically Based Rendering (PBR),
   complex lighting setups, and organic material properties.
══════════════════════════════════════════ */

/* ── Shared helpers ── */
function makeStars(n, spread) {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(n * 3);
  const colors = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    pos[i*3]   = (Math.random()-.5)*spread;
    pos[i*3+1] = (Math.random()-.5)*spread;
    pos[i*3+2] = (Math.random()-.5)*spread*.5 - spread*.15;
    
    // Slight color variation for stars (white to bluish)
    const c = 0.8 + Math.random() * 0.2;
    colors[i*3] = c;
    colors[i*3+1] = c;
    colors[i*3+2] = c + 0.1;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  
  return new THREE.Points(geo, new THREE.PointsMaterial({ 
    size: 0.02, 
    vertexColors: true,
    transparent: true, 
    opacity: 0.8,
    sizeAttenuation: true 
  }));
}

function makeLights(scene, ambCol, ambInt, dirCol, dirInt) {
  // 1. Ambient Light - Soft global illumination
  scene.add(new THREE.AmbientLight(ambCol, ambInt));
  
  // 2. Main Key Light - Strong directional light with shadow support
  const keyLight = new THREE.DirectionalLight(dirCol, dirInt);
  keyLight.position.set(10, 20, 10);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.width = 2048;
  keyLight.shadow.mapSize.height = 2048;
  keyLight.shadow.camera.near = 0.5;
  keyLight.shadow.camera.far = 50;
  keyLight.shadow.camera.left = -15;
  keyLight.shadow.camera.right = 15;
  keyLight.shadow.camera.top = 15;
  keyLight.shadow.camera.bottom = -15;
  keyLight.shadow.bias = -0.0005;
  scene.add(keyLight);
  
  // 3. Rim Light - Backlighting for high-end cinematic edge definition
  const rimLight = new THREE.PointLight(0xffffff, 2.0, 60);
  rimLight.position.set(-12, 8, -12);
  scene.add(rimLight);
  
  // 4. Fill Light - Soft light to ensure details aren't lost in shadows
  const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
  fillLight.position.set(-10, -5, 5);
  scene.add(fillLight);

  // 5. Hemisphere Light - Mimics realistic environmental bounce light
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x080820, 0.6);
  scene.add(hemiLight);
}

/* ─────────────────────────────────
   0. DNA Double Helix (Realistic Organic)
───────────────────────────────── */
function buildDNA() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x010307);
  makeLights(scene, 0x0a0c1a, 0.8, 0x00eaff, 1.8);
  scene.add(makeStars(500, 60));

  const group = new THREE.Group();
  const N = 150; // High detail
  const s1pts = [], s2pts = [];
  for (let i = 0; i < N; i++) {
    const t = (i/(N-1)) * Math.PI * 8;
    const y = (i/(N-1)) * 20 - 10;
    s1pts.push(new THREE.Vector3(Math.cos(t)*3, y, Math.sin(t)*3));
    s2pts.push(new THREE.Vector3(Math.cos(t+Math.PI)*3, y, Math.sin(t+Math.PI)*3));
  }
  const c1 = new THREE.CatmullRomCurve3(s1pts);
  const c2 = new THREE.CatmullRomCurve3(s2pts);
  
  // Advanced PBR Materials
  const m1 = new THREE.MeshPhysicalMaterial({ 
    color: 0x00d4ff, 
    emissive: 0x001122, 
    roughness: 0.2, 
    metalness: 0.4,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    transmission: 0.2, // Slight translucency
    thickness: 0.5
  });
  const m2 = new THREE.MeshPhysicalMaterial({ 
    color: 0x7c3aed, 
    emissive: 0x110033, 
    roughness: 0.2, 
    metalness: 0.4,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    transmission: 0.2,
    thickness: 0.5
  });
  
  group.add(new THREE.Mesh(new THREE.TubeGeometry(c1, 400, 0.14, 16, false), m1));
  group.add(new THREE.Mesh(new THREE.TubeGeometry(c2, 400, 0.14, 16, false), m2));

  const rungMat = new THREE.MeshPhysicalMaterial({ 
    color: 0x4af0ff, 
    transparent: true, 
    opacity: 0.6, 
    roughness: 0.1, 
    metalness: 0.2,
    transmission: 0.8,
    ior: 1.5
  });
  const atomM1 = new THREE.MeshPhysicalMaterial({ color: 0x00ffcc, emissive: 0x004433, roughness: 0.1, metalness: 0.7, clearcoat: 1.0 });
  const atomM2 = new THREE.MeshPhysicalMaterial({ color: 0xcc44ff, emissive: 0x330044, roughness: 0.1, metalness: 0.7, clearcoat: 1.0 });
  const atomGeo = new THREE.SphereGeometry(0.24, 32, 32);
  
  const RUNGS = 30;
  const upAxis = new THREE.Vector3(0,1,0);
  for (let i = 0; i < RUNGS; i++) {
    const f = i/(RUNGS-1);
    const p1 = c1.getPoint(f), p2 = c2.getPoint(f);
    const mid = p1.clone().add(p2).multiplyScalar(0.5);
    const dist = p1.distanceTo(p2);
    const dir = p2.clone().sub(p1).normalize();
    const rg = new THREE.CylinderGeometry(0.06, 0.06, dist, 16);
    const rm = new THREE.Mesh(rg, rungMat);
    rm.position.copy(mid);
    rm.quaternion.setFromUnitVectors(upAxis, dir);
    group.add(rm);
    const a1 = new THREE.Mesh(atomGeo, atomM1); a1.position.copy(p1); group.add(a1);
    const a2 = new THREE.Mesh(atomGeo, atomM2); a2.position.copy(p2); group.add(a2);
  }
  scene.add(group);
  return { scene, animate: (t) => { group.rotation.y = t * 0.35; group.rotation.x = Math.sin(t*0.1)*0.1; } };
}

/* ─────────────────────────────────
   1. Histology — Hexagonal cell tissue (Microscopic Look)
───────────────────────────────── */
function buildHistology() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x05010a);
  makeLights(scene, 0x1a0033, 0.9, 0xff99cc, 1.5);
  scene.add(makeStars(400, 50));

  const group = new THREE.Group();
  const cellMat = new THREE.MeshPhysicalMaterial({ 
    color: 0xfce7f3, 
    transparent: true, 
    opacity: 0.3, 
    roughness: 0.5, 
    metalness: 0.0,
    transmission: 0.5,
    thickness: 1.0,
    sheen: 1.0,
    sheenColor: 0xffffff
  });
  const wireMat = new THREE.MeshStandardMaterial({ 
    color: 0xf472b6, 
    wireframe: true, 
    transparent: true, 
    opacity: 0.5,
    emissive: 0x441122 
  });
  const nucMat = new THREE.MeshPhysicalMaterial({ 
    color: 0xdb2777, 
    emissive: 0x660022, 
    roughness: 0.3, 
    metalness: 0.2,
    clearcoat: 0.8
  });
  
  const hexGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.25, 6);
  const nucGeo = new THREE.SphereGeometry(0.2, 32, 32);
  const rows=9, cols=10, r=0.55;
  for (let row=0; row<rows; row++) {
    for (let col=0; col<cols; col++) {
      const ox=(row%2)*r*0.87;
      const x = col*r*1.74 - cols*r*0.85 + ox;
      const z = row*r*1.52 - rows*r*0.75;
      
      const cell = new THREE.Mesh(hexGeo, cellMat);
      cell.position.set(x, 0, z); cell.rotation.y = Math.PI/6;
      
      const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.56, 0.26, 6), wireMat);
      wire.position.set(x, 0, z); wire.rotation.y = Math.PI/6;
      
      const nuc = new THREE.Mesh(nucGeo, nucMat); 
      nuc.position.set(x, 0.08, z);
      nuc.scale.set(1.2, 0.7, 1.2); // Biological nucleus shape
      
      group.add(cell, wire, nuc);
    }
  }
  scene.add(group);
  return { scene, animate: (t) => { group.rotation.y = t*0.12; group.position.y = Math.sin(t*0.4)*0.4; } };
}

/* ─────────────────────────────────
   2. Embryology — Blastocyst (Translucent Glow)
───────────────────────────────── */
function buildEmbryology() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x080103);
  makeLights(scene, 0x1a0a00, 0.8, 0xffcc88, 1.6);
  scene.add(makeStars(300, 50));

  const group = new THREE.Group();
  
  // Atmosphere/Glow
  const glowMat = new THREE.MeshPhysicalMaterial({ 
    color: 0xfbbf24, 
    transparent: true, 
    opacity: 0.1, 
    roughness: 0.1, 
    side: THREE.BackSide,
    emissive: 0x442200
  });
  group.add(new THREE.Mesh(new THREE.SphereGeometry(4.0, 64, 64), glowMat));
    
  const outerMat = new THREE.MeshStandardMaterial({ 
    color: 0xfcd34d, 
    wireframe: true, 
    transparent: true, 
    opacity: 0.25, 
    emissive: 0x331a00 
  });
  group.add(new THREE.Mesh(new THREE.SphereGeometry(3.9, 48, 48), outerMat));

  const bMat = new THREE.MeshPhysicalMaterial({ 
    color: 0xfde68a, 
    emissive: 0x552200, 
    roughness: 0.4, 
    metalness: 0.0, 
    transparent: true, 
    opacity: 0.9,
    transmission: 0.4,
    thickness: 0.5
  });
  const bGeo = new THREE.SphereGeometry(0.65, 32, 32);
  const COUNT = 48;
  for (let i=0; i<COUNT; i++) {
    const phi=Math.acos(-1+(2*i)/COUNT), theta=Math.sqrt(COUNT*Math.PI)*phi;
    const r=3.4;
    const b = new THREE.Mesh(bGeo, bMat);
    b.position.set(r*Math.sin(phi)*Math.cos(theta), r*Math.cos(phi), r*Math.sin(phi)*Math.sin(theta));
    b.lookAt(0,0,0);
    b.scale.set(1.15, 0.95, 1.15);
    group.add(b);
  }
  
  const icmMat = new THREE.MeshPhysicalMaterial({ 
    color: 0xf472b6, 
    emissive: 0x660033, 
    roughness: 0.3, 
    metalness: 0.1,
    transmission: 0.3,
    thickness: 1.0
  });
  const icmGroup = new THREE.Group();
  for (let i=0; i<20; i++) {
    const ang=(i/20)*Math.PI*2;
    const icm=new THREE.Mesh(new THREE.SphereGeometry(0.35, 24, 24), icmMat);
    icm.position.set(Math.cos(ang)*1.2, Math.sin(ang*0.7)*0.7, Math.sin(ang)*1.2);
    icmGroup.add(icm);
  }
  icmGroup.position.set(0, -0.6, 0);
  group.add(icmGroup);
  
  scene.add(group);
  return { scene, animate: (t) => { group.rotation.y=t*0.22; group.rotation.x=Math.sin(t*0.12)*0.18; } };
}

/* ─────────────────────────────────
   3. Plant Anatomy — Branching vascular (Organic Textures)
───────────────────────────────── */
function buildPlant() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000501);
  makeLights(scene, 0x001a06, 0.8, 0x88ffaa, 1.5);
  scene.add(makeStars(300, 50));

  const group = new THREE.Group();
  const stemMat = new THREE.MeshPhysicalMaterial({ 
    color: 0x22c55e, 
    emissive: 0x0a3310, 
    roughness: 0.7, 
    metalness: 0.0,
    sheen: 1.0,
    sheenColor: 0x114411
  });
  const leafMat = new THREE.MeshPhysicalMaterial({ 
    color: 0x86efac, 
    transparent: true, 
    opacity: 0.85, 
    side: THREE.DoubleSide, 
    roughness: 0.5,
    transmission: 0.3,
    thickness: 0.2
  });
  const chlMat = new THREE.MeshPhysicalMaterial({ 
    color: 0x16a34a, 
    emissive: 0x053310, 
    roughness: 0.2, 
    metalness: 0.2,
    clearcoat: 0.5
  });

  function branch(startPt, dir, len, radius, depth) {
    if (depth < 0 || len < 0.15) return;
    const endPt = startPt.clone().add(dir.clone().multiplyScalar(len));
    const mid = startPt.clone().add(endPt).multiplyScalar(0.5);
    const cyl = new THREE.Mesh(new THREE.CylinderGeometry(radius*0.7, radius, len, 16), stemMat);
    cyl.position.copy(mid);
    cyl.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), dir.clone().normalize());
    group.add(cyl);
    
    if (depth <= 1) {
      const leafGeo = new THREE.SphereGeometry(0.6, 16, 4);
      leafGeo.scale(1, 0.04, 2.0);
      const leaf = new THREE.Mesh(leafGeo, leafMat);
      leaf.position.copy(endPt);
      leaf.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI);
      group.add(leaf);
      
      for (let i=0; i<5; i++) {
        const ch = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 16), chlMat);
        ch.position.set(endPt.x+(Math.random()-.5)*0.5, endPt.y+(Math.random()-.5)*0.5, endPt.z+(Math.random()-.5)*0.5);
        group.add(ch);
      }
    }
    if (depth > 0) {
      const spread = 0.55 + depth*0.1;
      for (let b=0; b<2; b++) {
        const newDir = dir.clone().applyEuler(new THREE.Euler(
          (Math.random()-.5)*spread, (Math.random()-.5)*spread, (Math.random()-.5)*spread*0.6));
        branch(endPt, newDir, len*0.78, radius*0.7, depth-1);
      }
    }
  }
  branch(new THREE.Vector3(0,-7,0), new THREE.Vector3(0,1,0.02), 4.5, 0.3, 4);
  scene.add(group);
  return { scene, animate: (t) => { group.rotation.y=t*0.2; group.rotation.z=Math.sin(t*0.2)*0.06; } };
}

/* ─────────────────────────────────
   4. Parasitology — Segmented worm (Slimy Texture)
───────────────────────────────── */
function buildParasitology() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x040300);
  makeLights(scene, 0x1a1400, 0.8, 0xffea88, 1.4);
  scene.add(makeStars(300, 50));

  const group = new THREE.Group();
  const segMat = new THREE.MeshPhysicalMaterial({ 
    color: 0xfef08a, 
    emissive: 0x443300, 
    roughness: 0.2, 
    metalness: 0.1,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    sheen: 1.0,
    sheenColor: 0xffffff
  });
  const headMat = new THREE.MeshPhysicalMaterial({ 
    color: 0xfacc15, 
    emissive: 0x664400, 
    roughness: 0.1, 
    metalness: 0.3,
    clearcoat: 1.0
  });
  const hookMat = new THREE.MeshPhysicalMaterial({ 
    color: 0x65a30d, 
    emissive: 0x112200, 
    roughness: 0.1, 
    metalness: 0.8,
    clearcoat: 1.0
  });
  
  const N=64; // High resolution
  for (let i=0; i<N; i++) {
    const f=i/(N-1);
    const t=f*Math.PI*6;
    const y=f*16-8;
    const r=2.4+Math.sin(f*Math.PI)*1.8;
    const sz = i===0 ? 1.6 : 0.8+Math.sin(i*0.8)*0.2;
    
    const seg=new THREE.Mesh(new THREE.SphereGeometry(sz*0.48, 32, 32), i===0?headMat:segMat);
    seg.position.set(Math.cos(t)*r, y, Math.sin(t)*r);
    seg.scale.set(1.1, 0.85, 1.1);
    group.add(seg);
    
    if (i===0) {
      for (let h=0; h<10; h++) {
        const ha=(h/10)*Math.PI*2;
        const hook=new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.5, 16), hookMat);
        hook.position.set(seg.position.x+Math.cos(ha)*0.6, seg.position.y+0.25, seg.position.z+Math.sin(ha)*0.6);
        hook.rotation.x = Math.PI/3.5;
        group.add(hook);
      }
    }
  }
  scene.add(group);
  return { scene, animate: (t) => { group.rotation.y=t*0.3; group.rotation.x=Math.sin(t*0.15)*0.15; } };
}

/* ─────────────────────────────────
   5. Hematology — Blood cells (Physical RBCs)
───────────────────────────────── */
function buildHematology() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x080001);
  makeLights(scene, 0x1a0000, 0.7, 0xff5555, 1.6);
  scene.add(makeStars(300, 50));

  const group = new THREE.Group();
  const rbcMat = new THREE.MeshPhysicalMaterial({ 
    color: 0xdc2626, 
    emissive: 0x660000, 
    roughness: 0.3, 
    metalness: 0.1,
    sheen: 1.0,
    sheenColor: 0xff0000,
    clearcoat: 0.5
  });
  const wbcMat = new THREE.MeshPhysicalMaterial({ 
    color: 0xf8fafc, 
    emissive: 0x222233, 
    roughness: 0.4, 
    metalness: 0.0,
    transmission: 0.2,
    thickness: 0.5
  });
  const platMat = new THREE.MeshPhysicalMaterial({ color: 0xfca5a5, emissive: 0x330000, roughness: 0.5 });

  // High-quality RBC geometry
  const rbcGeo = new THREE.TorusGeometry(0.55, 0.28, 16, 32);
  rbcGeo.scale(1, 1, 0.45);

  for (let i=0; i<40; i++) {
    const rbc=new THREE.Mesh(rbcGeo, rbcMat);
    rbc.position.set((Math.random()-.5)*16, (Math.random()-.5)*12, (Math.random()-.5)*7);
    rbc.rotation.set(Math.random()*Math.PI,Math.random()*Math.PI,Math.random()*Math.PI);
    rbc.userData={ox:rbc.position.x, oy:rbc.position.y, oz:rbc.position.z, off:Math.random()*Math.PI*2, sp:0.2+Math.random()*0.4};
    group.add(rbc);
  }
  
  const wbc=new THREE.Mesh(new THREE.SphereGeometry(1.6, 48, 48), wbcMat);
  const spkMat=new THREE.MeshPhysicalMaterial({color: 0xe2e8f0, roughness: 0.2, clearcoat: 0.5});
  for (let s=0; s<32; s++) {
    const phi=Math.acos(-1+(2*s)/32), th=Math.sqrt(32*Math.PI)*phi;
    const sp=new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 16), spkMat);
    const dir=new THREE.Vector3(Math.sin(phi)*Math.cos(th),Math.cos(phi),Math.sin(phi)*Math.sin(th));
    sp.position.copy(dir.clone().multiplyScalar(1.6));
    wbc.add(sp);
  }
  wbc.position.set(1,1,0); group.add(wbc);
  
  for (let p=0; p<15; p++) {
    const pl=new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16), platMat);
    pl.scale.set(1, 0.35, 1);
    pl.position.set((Math.random()-.5)*14,(Math.random()-.5)*10,(Math.random()-.5)*6);
    group.add(pl);
  }
  scene.add(group);
  return { scene, animate: (t) => {
    group.rotation.y=t*0.15;
    wbc.rotation.y=t*0.5; wbc.rotation.x=t*0.3;
    group.children.forEach(c=>{ if(c.userData.ox!==undefined){ c.position.y=c.userData.oy+Math.sin(t*c.userData.sp+c.userData.off)*0.8; }});
  }};
}

/* ─────────────────────────────────
   6. Microbiology — Bacteria + Virus (Organic PBR)
───────────────────────────────── */
function buildMicrobiology() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x010504);
  makeLights(scene, 0x001a15, 0.8, 0x88ffdd, 1.5);
  scene.add(makeStars(400, 50));

  const group = new THREE.Group();
  const bactMat = new THREE.MeshPhysicalMaterial({ 
    color: 0x14b8a6, 
    emissive: 0x004d33, 
    roughness: 0.4, 
    metalness: 0.1,
    clearcoat: 0.8,
    transmission: 0.1
  });
  const virMat = new THREE.MeshPhysicalMaterial({ 
    color: 0xef4444, 
    emissive: 0x770000, 
    roughness: 0.3, 
    metalness: 0.2,
    clearcoat: 1.0
  });
  const spkMat = new THREE.MeshPhysicalMaterial({ color: 0xfca5a5, emissive: 0x550000, roughness: 0.3 });
  const flgMat = new THREE.LineBasicMaterial({ color: 0x5eead4, transparent: true, opacity: 0.7 });

  const bactPositions=[
    [-5,1,1.5],[-4,-3,-2],[-7,-1,-3],[4,4,1.5],[2,-4,0.5],[-4,3,-2],[5,1,-2],[-2,5,2]
  ];
  bactPositions.forEach(([x,y,z], idx)=>{
    const bact=new THREE.Mesh(new THREE.CapsuleGeometry(0.35, 1.0, 16, 32), bactMat);
    bact.position.set(x,y,z);
    bact.rotation.set(Math.random()*0.8,Math.random()*Math.PI,Math.random()*0.5);
    bact.userData={orig:[x,y,z], off:idx*0.9};
    group.add(bact);
    
    const pts=[];
    for (let f=0; f<20; f++) pts.push(new THREE.Vector3(0, -0.7 - f*0.18, Math.sin(f*0.7)*0.18));
    const fl=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), flgMat);
    bact.add(fl);
  });

  const virus=new THREE.Group();
  virus.add(new THREE.Mesh(new THREE.IcosahedronGeometry(1.8, 3), virMat));
  for (let i=0; i<40; i++) {
    const phi=Math.acos(-1+(2*i)/40), th=Math.sqrt(40*Math.PI)*phi;
    const dir=new THREE.Vector3(Math.sin(phi)*Math.cos(th),Math.cos(phi),Math.sin(phi)*Math.sin(th));
    const sp=new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.15, 0.7, 16), spkMat);
    sp.position.copy(dir.clone().multiplyScalar(2.0));
    sp.lookAt(dir.clone().multiplyScalar(4));
    sp.rotation.x += Math.PI/2;
    virus.add(sp);
  }
  group.add(virus);
  scene.add(group);
  return { scene, animate: (t) => {
    group.rotation.y=t*0.18;
    virus.rotation.y=t*0.45; virus.rotation.x=t*0.3;
    group.children.forEach(c=>{ if(c.userData.off!==undefined){ 
      c.position.y=c.userData.orig[1]+Math.sin(t*0.6+c.userData.off)*0.5; 
      c.children[0].geometry.setFromPoints(Array.from({length:20}, (_,f)=>new THREE.Vector3(Math.sin(t*5+f*0.6)*0.15, -0.7 - f*0.18, Math.cos(t*5+f*0.6)*0.15)));
    }});
  }};
}

/* ─────────────────────────────────
   7. Entomology — Honeycomb + insects (Metallic/Chitin)
───────────────────────────────── */
function buildEntomology() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x060400);
  makeLights(scene, 0x1a1000, 0.9, 0xffd544, 1.5);
  scene.add(makeStars(300, 50));

  const group = new THREE.Group();
  const hexMat = new THREE.MeshPhysicalMaterial({ 
    color: 0xf59e0b, 
    transparent: true, 
    opacity: 0.5, 
    roughness: 0.1, 
    metalness: 0.2,
    transmission: 0.4,
    thickness: 0.2
  });
  const hexWire = new THREE.MeshStandardMaterial({ 
    color: 0xfbbf24, 
    wireframe: true, 
    transparent: true, 
    opacity: 0.8, 
    emissive: 0x664400 
  });
  const bodyMat = new THREE.MeshPhysicalMaterial({ 
    color: 0x78350f, 
    emissive: 0x331100, 
    roughness: 0.2, 
    metalness: 0.5,
    clearcoat: 1.0,
    sheen: 1.0,
    sheenColor: 0x331100
  });
  const wingMat = new THREE.MeshPhysicalMaterial({ 
    color: 0xfef3c7, 
    transparent: true, 
    opacity: 0.45, 
    side: THREE.DoubleSide, 
    roughness: 0.1,
    transmission: 0.8,
    ior: 1.4
  });
  const eyeMat = new THREE.MeshPhysicalMaterial({ 
    color: 0x1c1917, 
    emissive: 0x222222, 
    roughness: 0.05, 
    metalness: 0.9,
    clearcoat: 1.0
  });

  for (let row=-3;row<=3;row++) {
    for (let col=-4;col<=4;col++) {
      const ox=(row%2)*0.87*1.04;
      const x=col*1.75+ox, z=row*1.52;
      const hx=new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.25, 6), hexMat);
      hx.position.set(x,0,z); hx.rotation.y=Math.PI/6;
      const hw=new THREE.Mesh(new THREE.CylinderGeometry(0.51, 0.51, 0.27, 6), hexWire);
      hw.position.set(x,0,z); hw.rotation.y=Math.PI/6;
      group.add(hx,hw);
    }
  }
  
  [[0,2.2,0],[4.5,2.0,3.0],[-4.5,2.5,-3.0]].forEach(([x,y,z])=>{
    const bee = new THREE.Group();
    const body=new THREE.Mesh(new THREE.SphereGeometry(0.45, 32, 32), bodyMat);
    body.scale.set(1, 1.7, 1);
    const head=new THREE.Mesh(new THREE.SphereGeometry(0.28, 24, 24), bodyMat);
    head.position.y = 0.8;
    const eye1=new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), eyeMat);
    eye1.position.set(0.18, 0.9, 0.2);
    const eye2=new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), eyeMat);
    eye2.position.set(-0.18, 0.9, 0.2);
    
    const wg1=new THREE.Mesh(new THREE.SphereGeometry(0.6, 24, 4), wingMat);
    wg1.scale.set(1.4, 0.02, 0.6); wg1.position.set(0.7, 0.3, 0); wg1.rotation.z=0.45;
    const wg2=new THREE.Mesh(new THREE.SphereGeometry(0.6, 24, 4), wingMat);
    wg2.scale.set(1.4, 0.02, 0.6); wg2.position.set(-0.7, 0.3, 0); wg2.rotation.z=-0.45;
    
    bee.add(body, head, eye1, eye2, wg1, wg2);
    bee.position.set(x, y, z);
    bee.userData = { oy: y, off: Math.random()*Math.PI*2 };
    group.add(bee);
  });
  
  scene.add(group);
  return { scene, animate: (t) => { 
    group.rotation.y=t*0.2; 
    group.children.forEach(c => {
      if (c.userData.oy) {
        c.position.y = c.userData.oy + Math.sin(t*2.5 + c.userData.off)*0.4;
        c.children[4].rotation.z = 0.45 + Math.sin(t*25)*0.3;
        c.children[5].rotation.z = -0.45 - Math.sin(t*25)*0.3;
      }
    });
  }};
}

/* ─────────────────────────────────
   8. Algae — Spiral filaments (Underwater Look)
───────────────────────────────── */
function buildAlgae() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000804);
  makeLights(scene, 0x001a10, 0.8, 0x66ffcc, 1.5);
  scene.add(makeStars(300, 50));

  const group = new THREE.Group();
  const colors=[0x10b981,0x06b6d4,0x34d399,0x22d3ee,0x6ee7b7];
  for (let s=0;s<6;s++) {
    const pts=[], off=(s/6)*Math.PI*2, r=1.8+s*1.0;
    for (let i=0;i<100;i++) {
      const t=(i/99)*Math.PI*10+off;
      pts.push(new THREE.Vector3(Math.cos(t)*r, (i/99)*18-9, Math.sin(t)*r));
    }
    const mat=new THREE.MeshPhysicalMaterial({ 
      color: colors[s % colors.length], 
      emissive: 0x003322, 
      roughness: 0.2, 
      metalness: 0.1, 
      transparent: true, 
      opacity: 0.92,
      transmission: 0.3,
      thickness: 0.3
    });
    const tube=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 300, 0.12, 16, false), mat);
    group.add(tube);
    
    for (let i=0;i<15;i++) {
      const p=pts[Math.floor(i/15*99)];
      const ch=new THREE.Mesh(new THREE.SphereGeometry(0.18, 24, 24), new THREE.MeshPhysicalMaterial({color:0x065f46, emissive:0x05331a, roughness:0.2, clearcoat:0.5}));
      ch.position.copy(p); group.add(ch);
    }
  }
  scene.add(group);
  return { scene, animate: (t) => { group.rotation.y=t*0.25; group.rotation.x=Math.sin(t*0.18)*0.12; } };
}

/* ─────────────────────────────────
   9. Mycology — Mushroom cluster (Soft Velvet)
───────────────────────────────── */
function buildMycology() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x060200);
  makeLights(scene, 0x1a0800, 0.8, 0xff9955, 1.6);
  scene.add(makeStars(300, 50));

  const group = new THREE.Group();
  const capMat = new THREE.MeshPhysicalMaterial({ 
    color: 0xf97316, 
    emissive: 0x551a00, 
    roughness: 0.6, 
    metalness: 0.0,
    sheen: 1.0,
    sheenColor: 0xffaa44
  });
  const capMat2 = new THREE.MeshPhysicalMaterial({ 
    color: 0xfb923c, 
    emissive: 0x441100, 
    roughness: 0.6,
    sheen: 1.0,
    sheenColor: 0xffcc88
  });
  const stemMat = new THREE.MeshPhysicalMaterial({ 
    color: 0xfef9c3, 
    emissive: 0x221a00, 
    roughness: 0.7,
    transmission: 0.2,
    thickness: 0.5
  });
  const sporeMat = new THREE.MeshPhysicalMaterial({ color: 0xfde68a, emissive: 0x554400, roughness: 0.1, metalness: 0.3, transparent: true, opacity: 0.85 });
  const spotMat = new THREE.MeshPhysicalMaterial({ color: 0xfff7ed, roughness: 0.4, sheen: 1.0 });

  function addMushroom(cx,cz,sc,mat) {
    const stem=new THREE.Mesh(new THREE.CylinderGeometry(0.14*sc, 0.2*sc, 1.6*sc, 24), stemMat);
    stem.position.set(cx, -2.2 + 0.8*sc, cz);
    
    const capGeo = new THREE.SphereGeometry(0.85*sc, 48, 24, 0, Math.PI*2, 0, Math.PI*0.68);
    const cap=new THREE.Mesh(capGeo, mat);
    cap.position.set(cx, -2.2 + 1.6*sc, cz); cap.rotation.x=Math.PI;
    
    for (let i=0;i<10;i++) {
      const a=(i/10)*Math.PI*2, r=0.45*sc;
      const sp=new THREE.Mesh(new THREE.SphereGeometry(0.09*sc, 16, 16), spotMat);
      sp.position.set(cx+Math.cos(a)*r, -2.2+1.8*sc+Math.sin(a)*r*0.35, cz+Math.sin(a)*r);
      group.add(sp);
    }
    group.add(stem,cap);
  }
  addMushroom(0,0,2.8,capMat);
  addMushroom(-4,2,1.8,capMat2);
  addMushroom(3.5,-1.5,2.0,capMat);
  addMushroom(-2,-3,1.4,capMat2);
  addMushroom(3,3,1.2,capMat);

  for (let i=0;i<60;i++) {
    const sp=new THREE.Mesh(new THREE.SphereGeometry(0.06+Math.random()*0.08, 16, 16), sporeMat);
    sp.position.set((Math.random()-.5)*16,(Math.random()-.5)*12,(Math.random()-.5)*7);
    sp.userData={off:Math.random()*Math.PI*2, speed:0.15+Math.random()*0.3};
    group.add(sp);
  }
  scene.add(group);
  return { scene, animate: (t) => {
    group.rotation.y=t*0.18;
    group.children.forEach(c=>{ if(c.userData.speed){ 
      c.position.y+=Math.sin(t*c.userData.speed+c.userData.off)*0.015; 
      c.position.x+=Math.cos(t*c.userData.speed*0.8+c.userData.off)*0.012; 
    }});
  }};
}

/* ─────────────────────────────────
   10. Immunology — Antibodies + B-cell (High-End PBR)
───────────────────────────────── */
function buildImmunology() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x010106);
  makeLights(scene, 0x0a0020, 0.9, 0xbb99ff, 1.6);
  scene.add(makeStars(450, 50));

  const group = new THREE.Group();
  const abMat = new THREE.MeshPhysicalMaterial({ 
    color: 0x7c3aed, 
    emissive: 0x330077, 
    roughness: 0.1, 
    metalness: 0.6,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1
  });
  const bcMat = new THREE.MeshPhysicalMaterial({ 
    color: 0x3b82f6, 
    emissive: 0x003388, 
    roughness: 0.2, 
    metalness: 0.1, 
    transparent: true, 
    opacity: 0.94,
    transmission: 0.4,
    thickness: 1.0
  });
  const bcWire = new THREE.MeshStandardMaterial({ 
    color: 0x60a5fa, 
    wireframe: true, 
    transparent: true, 
    opacity: 0.5, 
    emissive: 0x0044cc 
  });
  const antMat = new THREE.MeshPhysicalMaterial({ 
    color: 0xc4b5fd, 
    emissive: 0x220055, 
    roughness: 0.1, 
    metalness: 0.7,
    clearcoat: 1.0
  });

  function addAntibody(px,py,pz,ry) {
    const ab=new THREE.Group();
    const fc=new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 2.0, 16), abMat);
    fc.position.y=-1.0;
    ab.add(fc);
    [[0.5, 1.2, 0.6, Math.PI/4], [-0.5, 1.2, -0.6, -Math.PI/4]].forEach(([fx,fy,fz,rz])=>{
      const fab=new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 1.5, 16), abMat);
      fab.position.set(fx,fy,0); fab.rotation.z=rz;
      ab.add(fab);
      const tip=new THREE.Mesh(new THREE.SphereGeometry(0.18, 24, 24), antMat);
      tip.position.set(fx+(fx>0?0.45:-0.45), fy+0.4, 0);
      ab.add(tip);
    });
    ab.position.set(px,py,pz); ab.rotation.y=ry;
    group.add(ab);
    return ab;
  }

  const bCell = new THREE.Group();
  bCell.add(new THREE.Mesh(new THREE.SphereGeometry(2.0, 64, 64), bcMat));
  bCell.add(new THREE.Mesh(new THREE.SphereGeometry(2.02, 48, 48), bcWire));
  bCell.add(new THREE.Mesh(new THREE.SphereGeometry(1.0, 32, 32),
    new THREE.MeshPhysicalMaterial({color:0x1e40af, emissive:0x002266, roughness:0.1, transparent:true, opacity:0.88, transmission:0.5})));
  group.add(bCell);

  const abs=[];
  for (let i=0;i<10;i++) {
    const a=(i/10)*Math.PI*2;
    const r=5.0;
    const ab=addAntibody(Math.cos(a)*r, (Math.random()-.5)*3.5, Math.sin(a)*r, a+Math.PI/2);
    ab.userData={orbitAngle:a, orbitR:r, orbitSpeed:0.12+Math.random()*0.12};
    abs.push(ab);
  }
  
  const tcMat=new THREE.MeshPhysicalMaterial({color:0x06b6d4, emissive:0x004455, roughness:0.1, metalness:0.4, transparent:true, opacity:0.92, transmission:0.4});
  for (let i=0;i<5;i++) {
    const a=(i/5)*Math.PI*2+Math.PI/5;
    const tc=new THREE.Mesh(new THREE.SphereGeometry(0.7, 32, 32), tcMat);
    tc.position.set(Math.cos(a)*7.5, (Math.random()-.5)*3.5, Math.sin(a)*7.5);
    tc.userData={orbitAngle:a, orbitR:7.5, orbitSpeed:0.08};
    group.add(tc);
    abs.push(tc);
  }
  
  scene.add(group);
  return { scene, animate: (t) => {
    bCell.rotation.y=t*0.18;
    abs.forEach(ab=>{
      if(ab.userData.orbitAngle!==undefined){
        const a=ab.userData.orbitAngle+t*ab.userData.orbitSpeed;
        ab.position.x=Math.cos(a)*ab.userData.orbitR;
        ab.position.z=Math.sin(a)*ab.userData.orbitR;
        ab.rotation.y=a+Math.PI/2;
        ab.rotation.x=Math.sin(t*0.6 + ab.userData.orbitAngle)*0.25;
      }
    });
  }};
}

/* ══ EXPORT ══ */
const SCENE_BUILDERS = [
  buildDNA,
  buildHistology,
  buildEmbryology,
  buildPlant,
  buildParasitology,
  buildHematology,
  buildMicrobiology,
  buildEntomology,
  buildAlgae,
  buildMycology,
  buildImmunology
];
