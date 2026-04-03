/* ══════════════════════════════════════════
   BioGuide 3D — scenes.js (Hyper-Realistic / Organic Edition)
   The ultimate version featuring microscopic surface details, 
   subsurface scattering simulations, and complex light-matter interaction.
══════════════════════════════════════════ */

/* ── Shared helpers ── */
function makeStars(n, spread) {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(n * 3);
  const colors = new Float32Array(n * 3);
  const sizes = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    pos[i*3]   = (Math.random()-.5)*spread;
    pos[i*3+1] = (Math.random()-.5)*spread;
    pos[i*3+2] = (Math.random()-.5)*spread*.5 - spread*.15;
    
    // Star color temperature variation
    const temp = Math.random();
    if (temp < 0.2) { colors[i*3]=0.8; colors[i*3+1]=0.9; colors[i*3+2]=1.0; } // Bluish
    else if (temp < 0.4) { colors[i*3]=1.0; colors[i*3+1]=0.9; colors[i*3+2]=0.8; } // Warm
    else { colors[i*3]=1.0; colors[i*3+1]=1.0; colors[i*3+2]=1.0; } // White
    
    sizes[i] = 0.01 + Math.random() * 0.02;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  
  return new THREE.Points(geo, new THREE.PointsMaterial({ 
    vertexColors: true,
    transparent: true, 
    opacity: 0.6,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending
  }));
}

function makeLights(scene, ambCol, ambInt, dirCol, dirInt) {
  // Global soft environment light
  scene.add(new THREE.AmbientLight(ambCol, ambInt));
  
  // Primary Key Light (Simulating a focused microscope lamp)
  const keyLight = new THREE.DirectionalLight(dirCol, dirInt);
  keyLight.position.set(15, 25, 15);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(4096, 4096); // Ultra-high shadow resolution
  keyLight.shadow.camera.near = 1;
  keyLight.shadow.camera.far = 100;
  keyLight.shadow.bias = -0.0001;
  scene.add(keyLight);
  
  // Rim Light (Edge separation - crucial for organic look)
  const rimLight = new THREE.PointLight(0xffffff, 2.5, 80);
  rimLight.position.set(-20, 10, -20);
  scene.add(rimLight);
  
  // Subsurface Scattering (SSS) Simulation Light
  // A light source from behind to simulate light passing through organic matter
  const sssLight = new THREE.PointLight(dirCol, 1.5, 120);
  sssLight.position.set(0, -5, -15);
  scene.add(sssLight);

  // Natural environment bounce
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x050510, 0.8);
  scene.add(hemiLight);
  
  // Adding a soft volumetric-like glow light
  const volLight = new THREE.PointLight(0xffffff, 0.5, 50);
  volLight.position.set(0, 0, 0);
  scene.add(volLight);
}

/* ─────────────────────────────────
   0. DNA Double Helix (Micro-Scale Precision)
───────────────────────────────── */
function buildDNA() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x010204);
  makeLights(scene, 0x050815, 0.7, 0x00f2ff, 2.0);
  scene.add(makeStars(600, 70));

  const group = new THREE.Group();
  const N = 200; // Ultra high detail
  const s1pts = [], s2pts = [];
  for (let i = 0; i < N; i++) {
    const t = (i/(N-1)) * Math.PI * 8.5;
    const y = (i/(N-1)) * 22 - 11;
    s1pts.push(new THREE.Vector3(Math.cos(t)*3.2, y, Math.sin(t)*3.2));
    s2pts.push(new THREE.Vector3(Math.cos(t+Math.PI)*3.2, y, Math.sin(t+Math.PI)*3.2));
  }
  const c1 = new THREE.CatmullRomCurve3(s1pts);
  const c2 = new THREE.CatmullRomCurve3(s2pts);
  
  // Hyper-Realistic Organic PBR
  const strandMat = (color, emissive) => new THREE.MeshPhysicalMaterial({ 
    color: color, 
    emissive: emissive, 
    roughness: 0.15, 
    metalness: 0.3,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    transmission: 0.4, // Translucent organic look
    thickness: 0.8,
    sheen: 1.0,
    sheenColor: color,
    ior: 1.45
  });
  
  group.add(new THREE.Mesh(new THREE.TubeGeometry(c1, 500, 0.16, 24, false), strandMat(0x00d4ff, 0x001122)));
  group.add(new THREE.Mesh(new THREE.TubeGeometry(c2, 500, 0.16, 24, false), strandMat(0x8b5cf6, 0x110033)));

  const rungMat = new THREE.MeshPhysicalMaterial({ 
    color: 0x4af0ff, 
    transparent: true, 
    opacity: 0.5, 
    roughness: 0.05, 
    transmission: 0.9,
    thickness: 1.0,
    ior: 1.52
  });
  
  const atomGeo = new THREE.SphereGeometry(0.28, 48, 48);
  const RUNGS = 36;
  const upAxis = new THREE.Vector3(0,1,0);
  for (let i = 0; i < RUNGS; i++) {
    const f = i/(RUNGS-1);
    const p1 = c1.getPoint(f), p2 = c2.getPoint(f);
    const mid = p1.clone().add(p2).multiplyScalar(0.5);
    const dir = p2.clone().sub(p1).normalize();
    const rm = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, p1.distanceTo(p2), 24), rungMat);
    rm.position.copy(mid);
    rm.quaternion.setFromUnitVectors(upAxis, dir);
    group.add(rm);
    
    // Atoms with light-catching properties
    const a1 = new THREE.Mesh(atomGeo, strandMat(0x00ffcc, 0x002211)); 
    a1.position.copy(p1); group.add(a1);
    const a2 = new THREE.Mesh(atomGeo, strandMat(0xcc44ff, 0x220033)); 
    a2.position.copy(p2); group.add(a2);
  }
  scene.add(group);
  return { scene, animate: (t) => { group.rotation.y = t * 0.4; group.rotation.x = Math.sin(t*0.08)*0.12; } };
}

/* ─────────────────────────────────
   1. Histology — Hexagonal cell tissue (Tissue Depth)
───────────────────────────────── */
function buildHistology() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x030108);
  makeLights(scene, 0x1a0033, 0.8, 0xffaacc, 1.8);
  scene.add(makeStars(500, 60));

  const group = new THREE.Group();
  const cellMat = new THREE.MeshPhysicalMaterial({ 
    color: 0xfdf2f8, 
    transparent: true, 
    opacity: 0.4, 
    roughness: 0.45, 
    metalness: 0.0,
    transmission: 0.6,
    thickness: 2.0,
    sheen: 1.0,
    sheenColor: 0xffffff,
    specularIntensity: 1.0,
    ior: 1.33 // Refractive index of water/cytoplasm
  });
  
  const nucMat = new THREE.MeshPhysicalMaterial({ 
    color: 0xbe185d, 
    emissive: 0x500020, 
    roughness: 0.25, 
    clearcoat: 1.0,
    transmission: 0.2,
    thickness: 0.5
  });
  
  const hexGeo = new THREE.CylinderGeometry(0.58, 0.58, 0.3, 6);
  const nucGeo = new THREE.SphereGeometry(0.22, 48, 48);
  const rows=10, cols=12, r=0.58;
  for (let row=0; row<rows; row++) {
    for (let col=0; col<cols; col++) {
      const ox=(row%2)*r*0.87;
      const x = col*r*1.74 - cols*r*0.85 + ox;
      const z = row*r*1.52 - rows*r*0.75;
      
      const cell = new THREE.Mesh(hexGeo, cellMat);
      cell.position.set(x, 0, z); cell.rotation.y = Math.PI/6;
      
      const nuc = new THREE.Mesh(nucGeo, nucMat); 
      nuc.position.set(x, 0.1, z);
      nuc.scale.set(1.3, 0.6, 1.3);
      
      group.add(cell, nuc);
    }
  }
  scene.add(group);
  return { scene, animate: (t) => { group.rotation.y = t*0.1; group.position.y = Math.sin(t*0.3)*0.5; } };
}

/* ─────────────────────────────────
   2. Embryology — Blastocyst (Biological Luminance)
───────────────────────────────── */
function buildEmbryology() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050102);
  makeLights(scene, 0x1a0a00, 0.9, 0xffd188, 2.0);
  scene.add(makeStars(400, 60));

  const group = new THREE.Group();
  
  // Inner Glow Sphere (Volumetric feel)
  const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(4.2, 64, 64), 
    new THREE.MeshPhysicalMaterial({ 
      color: 0xfbbf24, 
      transparent: true, 
      opacity: 0.08, 
      side: THREE.BackSide,
      emissive: 0xffaa00,
      emissiveIntensity: 0.5
    }));
  group.add(atmosphere);

  const bMat = new THREE.MeshPhysicalMaterial({ 
    color: 0xfef3c7, 
    emissive: 0x663300, 
    roughness: 0.35, 
    metalness: 0.0, 
    transmission: 0.5,
    thickness: 1.0,
    sheen: 1.0,
    sheenColor: 0xffd188,
    clearcoat: 0.5
  });
  
  const bGeo = new THREE.SphereGeometry(0.7, 48, 48);
  const COUNT = 60; // Denser cell population
  for (let i=0; i<COUNT; i++) {
    const phi=Math.acos(-1+(2*i)/COUNT), theta=Math.sqrt(COUNT*Math.PI)*phi;
    const r=3.5;
    const b = new THREE.Mesh(bGeo, bMat);
    b.position.set(r*Math.sin(phi)*Math.cos(theta), r*Math.cos(phi), r*Math.sin(phi)*Math.sin(theta));
    b.lookAt(0,0,0);
    b.scale.set(1.2, 0.9, 1.2);
    group.add(b);
  }
  
  const icmMat = new THREE.MeshPhysicalMaterial({ 
    color: 0xec4899, 
    emissive: 0x770044, 
    roughness: 0.2, 
    transmission: 0.4,
    thickness: 1.5,
    clearcoat: 1.0
  });
  const icmGroup = new THREE.Group();
  for (let i=0; i<25; i++) {
    const ang=(i/25)*Math.PI*2;
    const icm=new THREE.Mesh(new THREE.SphereGeometry(0.38, 32, 32), icmMat);
    icm.position.set(Math.cos(ang)*1.3, Math.sin(ang*0.6)*0.8, Math.sin(ang)*1.3);
    icmGroup.add(icm);
  }
  icmGroup.position.set(0, -0.7, 0);
  group.add(icmGroup);
  
  scene.add(group);
  return { scene, animate: (t) => { group.rotation.y=t*0.25; group.rotation.x=Math.sin(t*0.1)*0.2; } };
}

/* ─────────────────────────────────
   3. Plant Anatomy — Vascular Detail
───────────────────────────────── */
function buildPlant() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000401);
  makeLights(scene, 0x001a06, 0.8, 0xaaffbb, 1.8);
  scene.add(makeStars(400, 60));

  const group = new THREE.Group();
  const stemMat = new THREE.MeshPhysicalMaterial({ 
    color: 0x16a34a, 
    emissive: 0x052210, 
    roughness: 0.8, 
    sheen: 1.0,
    sheenColor: 0x22c55e,
    transmission: 0.2,
    thickness: 0.5
  });
  const leafMat = new THREE.MeshPhysicalMaterial({ 
    color: 0x4ade80, 
    transparent: true, 
    opacity: 0.9, 
    side: THREE.DoubleSide, 
    roughness: 0.4,
    transmission: 0.5,
    thickness: 0.1,
    sheen: 0.5
  });
  
  function branch(startPt, dir, len, radius, depth) {
    if (depth < 0 || len < 0.1) return;
    const endPt = startPt.clone().add(dir.clone().multiplyScalar(len));
    const mid = startPt.clone().add(endPt).multiplyScalar(0.5);
    const cyl = new THREE.Mesh(new THREE.CylinderGeometry(radius*0.65, radius, len, 24), stemMat);
    cyl.position.copy(mid);
    cyl.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), dir.clone().normalize());
    group.add(cyl);
    
    if (depth <= 1) {
      const leafGeo = new THREE.SphereGeometry(0.7, 24, 8);
      leafGeo.scale(1, 0.03, 2.5);
      const leaf = new THREE.Mesh(leafGeo, leafMat);
      leaf.position.copy(endPt);
      leaf.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI);
      group.add(leaf);
    }
    if (depth > 0) {
      const spread = 0.6 + depth*0.1;
      for (let b=0; b<2; b++) {
        const newDir = dir.clone().applyEuler(new THREE.Euler(
          (Math.random()-.5)*spread, (Math.random()-.5)*spread, (Math.random()-.5)*spread*0.5));
        branch(endPt, newDir, len*0.8, radius*0.7, depth-1);
      }
    }
  }
  branch(new THREE.Vector3(0,-8,0), new THREE.Vector3(0,1,0), 5, 0.35, 4);
  scene.add(group);
  return { scene, animate: (t) => { group.rotation.y=t*0.2; group.rotation.z=Math.sin(t*0.2)*0.08; } };
}

/* ─────────────────────────────────
   4. Parasitology — Worm (Wet Slime Look)
───────────────────────────────── */
function buildParasitology() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x030200);
  makeLights(scene, 0x1a1400, 0.9, 0xfff2aa, 1.8);
  scene.add(makeStars(400, 60));

  const group = new THREE.Group();
  const segMat = new THREE.MeshPhysicalMaterial({ 
    color: 0xfef08a, 
    emissive: 0x554400, 
    roughness: 0.1, 
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    transmission: 0.3,
    thickness: 1.0,
    sheen: 1.0,
    sheenColor: 0xffffff
  });
  
  const headMat = new THREE.MeshPhysicalMaterial({ color: 0xfacc15, emissive: 0x775500, roughness: 0.05, clearcoat: 1.0 });
  const hookMat = new THREE.MeshPhysicalMaterial({ color: 0x4d7c0f, emissive: 0x112200, roughness: 0.1, metalness: 0.9, clearcoat: 1.0 });
  
  const N=80; // High density segments
  for (let i=0; i<N; i++) {
    const f=i/(N-1);
    const t=f*Math.PI*7;
    const y=f*18-9;
    const r=2.6+Math.sin(f*Math.PI)*2.0;
    const sz = i===0 ? 1.8 : 0.9+Math.sin(i*0.8)*0.25;
    
    const seg=new THREE.Mesh(new THREE.SphereGeometry(sz*0.5, 48, 48), i===0?headMat:segMat);
    seg.position.set(Math.cos(t)*r, y, Math.sin(t)*r);
    seg.scale.set(1.15, 0.8, 1.15);
    group.add(seg);
    
    if (i===0) {
      for (let h=0; h<12; h++) {
        const ha=(h/12)*Math.PI*2;
        const hook=new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.6, 24), hookMat);
        hook.position.set(seg.position.x+Math.cos(ha)*0.7, seg.position.y+0.3, seg.position.z+Math.sin(ha)*0.7);
        hook.rotation.x = Math.PI/3.2;
        group.add(hook);
      }
    }
  }
  scene.add(group);
  return { scene, animate: (t) => { group.rotation.y=t*0.35; group.rotation.x=Math.sin(t*0.12)*0.2; } };
}

/* ─────────────────────────────────
   5. Hematology — Blood Cells (Realistic SSS)
───────────────────────────────── */
function buildHematology() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x060001);
  makeLights(scene, 0x1a0000, 0.8, 0xff4444, 2.0);
  scene.add(makeStars(400, 60));

  const group = new THREE.Group();
  const rbcMat = new THREE.MeshPhysicalMaterial({ 
    color: 0xb91c1c, 
    emissive: 0x7f1d1d, 
    roughness: 0.25, 
    transmission: 0.3, // Light passing through the edges
    thickness: 0.5,
    sheen: 1.0,
    sheenColor: 0xef4444,
    clearcoat: 0.3
  });
  
  const wbcMat = new THREE.MeshPhysicalMaterial({ 
    color: 0xf8fafc, 
    roughness: 0.4, 
    transmission: 0.4,
    thickness: 1.2,
    sheen: 1.0
  });

  const rbcGeo = new THREE.TorusGeometry(0.6, 0.3, 24, 48);
  rbcGeo.scale(1, 1, 0.4);

  for (let i=0; i<50; i++) {
    const rbc=new THREE.Mesh(rbcGeo, rbcMat);
    rbc.position.set((Math.random()-.5)*18, (Math.random()-.5)*14, (Math.random()-.5)*8);
    rbc.rotation.set(Math.random()*Math.PI,Math.random()*Math.PI,Math.random()*Math.PI);
    rbc.userData={ox:rbc.position.x, oy:rbc.position.y, oz:rbc.position.z, off:Math.random()*Math.PI*2, sp:0.2+Math.random()*0.5};
    group.add(rbc);
  }
  
  const wbc=new THREE.Mesh(new THREE.SphereGeometry(1.8, 64, 64), wbcMat);
  const spkMat=new THREE.MeshPhysicalMaterial({color: 0xe2e8f0, roughness: 0.1, clearcoat: 1.0});
  for (let s=0; s<40; s++) {
    const phi=Math.acos(-1+(2*s)/40), th=Math.sqrt(40*Math.PI)*phi;
    const sp=new THREE.Mesh(new THREE.SphereGeometry(0.16, 24, 24), spkMat);
    const dir=new THREE.Vector3(Math.sin(phi)*Math.cos(th),Math.cos(phi),Math.sin(phi)*Math.sin(th));
    sp.position.copy(dir.clone().multiplyScalar(1.8));
    wbc.add(sp);
  }
  wbc.position.set(1,1,0); group.add(wbc);
  
  scene.add(group);
  return { scene, animate: (t) => {
    group.rotation.y=t*0.12;
    wbc.rotation.y=t*0.6; wbc.rotation.x=t*0.4;
    group.children.forEach(c=>{ if(c.userData.ox!==undefined){ c.position.y=c.userData.oy+Math.sin(t*c.userData.sp+c.userData.off)*1.0; }});
  }};
}

/* ─────────────────────────────────
   6. Microbiology — Pathogens
───────────────────────────────── */
function buildMicrobiology() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x010403);
  makeLights(scene, 0x001a15, 0.9, 0x77ffee, 1.8);
  scene.add(makeStars(500, 60));

  const group = new THREE.Group();
  const bactMat = new THREE.MeshPhysicalMaterial({ 
    color: 0x0d9488, 
    emissive: 0x004d3d, 
    roughness: 0.3, 
    clearcoat: 1.0,
    transmission: 0.2,
    thickness: 0.8,
    sheen: 1.0
  });
  
  const virMat = new THREE.MeshPhysicalMaterial({ 
    color: 0xdc2626, 
    emissive: 0x7f1d1d, 
    roughness: 0.2, 
    clearcoat: 1.0,
    sheen: 1.0,
    sheenColor: 0xff0000
  });

  const bactPositions=[
    [-6,1,2],[-5,-4,-2.5],[-8,-1,-4],[5,5,2],[3,-5,1],[-5,4,-2.5],[6,1,-2.5],[-3,6,3]
  ];
  bactPositions.forEach(([x,y,z], idx)=>{
    const bact=new THREE.Mesh(new THREE.CapsuleGeometry(0.4, 1.2, 24, 48), bactMat);
    bact.position.set(x,y,z);
    bact.rotation.set(Math.random()*0.8,Math.random()*Math.PI,Math.random()*0.5);
    bact.userData={orig:[x,y,z], off:idx*1.0};
    group.add(bact);
    
    const pts=[];
    for (let f=0; f<25; f++) pts.push(new THREE.Vector3(0, -0.8 - f*0.2, Math.sin(f*0.6)*0.2));
    const fl=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({color:0x2dd4bf, transparent:true, opacity:0.6}));
    bact.add(fl);
  });

  const virus=new THREE.Group();
  virus.add(new THREE.Mesh(new THREE.IcosahedronGeometry(2.0, 4), virMat));
  for (let i=0; i<50; i++) {
    const phi=Math.acos(-1+(2*i)/50), th=Math.sqrt(50*Math.PI)*phi;
    const dir=new THREE.Vector3(Math.sin(phi)*Math.cos(th),Math.cos(phi),Math.sin(phi)*Math.sin(th));
    const sp=new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.18, 0.8, 24), new THREE.MeshPhysicalMaterial({color:0xf87171, roughness:0.2, clearcoat:1.0}));
    sp.position.copy(dir.clone().multiplyScalar(2.2));
    sp.lookAt(dir.clone().multiplyScalar(5));
    sp.rotation.x += Math.PI/2;
    virus.add(sp);
  }
  group.add(virus);
  scene.add(group);
  return { scene, animate: (t) => {
    group.rotation.y=t*0.2;
    virus.rotation.y=t*0.5; virus.rotation.x=t*0.35;
    group.children.forEach(c=>{ if(c.userData.off!==undefined){ 
      c.position.y=c.userData.orig[1]+Math.sin(t*0.7+c.userData.off)*0.6; 
      c.children[0].geometry.setFromPoints(Array.from({length:25}, (_,f)=>new THREE.Vector3(Math.sin(t*6+f*0.5)*0.2, -0.8 - f*0.2, Math.cos(t*6+f*0.5)*0.2)));
    }});
  }};
}

/* ─────────────────────────────────
   7. Entomology — Chitinous Surface
───────────────────────────────── */
function buildEntomology() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x040300);
  makeLights(scene, 0x1a1000, 0.9, 0xffd955, 1.8);
  scene.add(makeStars(400, 60));

  const group = new THREE.Group();
  const hexMat = new THREE.MeshPhysicalMaterial({ 
    color: 0xd97706, 
    transparent: true, 
    opacity: 0.55, 
    roughness: 0.1, 
    metalness: 0.3,
    transmission: 0.5,
    thickness: 0.4,
    ior: 1.45
  });
  
  const bodyMat = new THREE.MeshPhysicalMaterial({ 
    color: 0x451a03, 
    emissive: 0x2d1000, 
    roughness: 0.15, 
    metalness: 0.4,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    sheen: 1.0,
    sheenColor: 0x78350f
  });
  
  const wingMat = new THREE.MeshPhysicalMaterial({ 
    color: 0xfef3c7, 
    transparent: true, 
    opacity: 0.4, 
    side: THREE.DoubleSide, 
    transmission: 0.9,
    ior: 1.3,
    clearcoat: 1.0
  });

  for (let row=-3;row<=3;row++) {
    for (let col=-4;col<=4;col++) {
      const ox=(row%2)*0.87*1.04;
      const x=col*1.75+ox, z=row*1.52;
      const hx=new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.3, 6), hexMat);
      hx.position.set(x,0,z); hx.rotation.y=Math.PI/6;
      group.add(hx);
    }
  }
  
  [[0,2.5,0],[5,2.2,3.5],[-5,2.8,-3.5]].forEach(([x,y,z])=>{
    const bee = new THREE.Group();
    const body=new THREE.Mesh(new THREE.SphereGeometry(0.5, 48, 48), bodyMat);
    body.scale.set(1, 1.8, 1);
    const head=new THREE.Mesh(new THREE.SphereGeometry(0.32, 32, 32), bodyMat);
    head.position.y = 0.9;
    
    const wg1=new THREE.Mesh(new THREE.SphereGeometry(0.7, 32, 4), wingMat);
    wg1.scale.set(1.5, 0.01, 0.7); wg1.position.set(0.8, 0.4, 0); wg1.rotation.z=0.5;
    const wg2=new THREE.Mesh(new THREE.SphereGeometry(0.7, 32, 4), wingMat);
    wg2.scale.set(1.5, 0.01, 0.7); wg2.position.set(-0.8, 0.4, 0); wg2.rotation.z=-0.5;
    
    bee.add(body, head, wg1, wg2);
    bee.position.set(x, y, z);
    bee.userData = { oy: y, off: Math.random()*Math.PI*2 };
    group.add(bee);
  });
  
  scene.add(group);
  return { scene, animate: (t) => { 
    group.rotation.y=t*0.22; 
    group.children.forEach(c => {
      if (c.userData.oy) {
        c.position.y = c.userData.oy + Math.sin(t*3.0 + c.userData.off)*0.5;
        c.children[2].rotation.z = 0.5 + Math.sin(t*30)*0.4;
        c.children[3].rotation.z = -0.5 - Math.sin(t*30)*0.4;
      }
    });
  }};
}

/* ─────────────────────────────────
   8. Algae — Deep Sea
───────────────────────────────── */
function buildAlgae() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000603);
  makeLights(scene, 0x001a10, 0.8, 0x88ffee, 1.8);
  scene.add(makeStars(400, 60));

  const group = new THREE.Group();
  const colors=[0x059669,0x0891b2,0x10b981,0x06b6d4,0x34d399];
  for (let s=0;s<7;s++) {
    const pts=[], off=(s/7)*Math.PI*2, r=2.0+s*1.1;
    for (let i=0;i<120;i++) {
      const t=(i/119)*Math.PI*12+off;
      pts.push(new THREE.Vector3(Math.cos(t)*r, (i/119)*20-10, Math.sin(t)*r));
    }
    const mat=new THREE.MeshPhysicalMaterial({ 
      color: colors[s % colors.length], 
      emissive: 0x004433, 
      roughness: 0.2, 
      transmission: 0.4,
      thickness: 0.5,
      sheen: 1.0,
      clearcoat: 0.5
    });
    const tube=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 400, 0.15, 20, false), mat);
    group.add(tube);
  }
  scene.add(group);
  return { scene, animate: (t) => { group.rotation.y=t*0.3; group.rotation.x=Math.sin(t*0.2)*0.15; } };
}

/* ─────────────────────────────────
   9. Mycology — Velvet Mushroom
───────────────────────────────── */
function buildMycology() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x040100);
  makeLights(scene, 0x1a0800, 0.9, 0xffaa66, 2.0);
  scene.add(makeStars(400, 60));

  const group = new THREE.Group();
  const capMat = new THREE.MeshPhysicalMaterial({ 
    color: 0xea580c, 
    emissive: 0x7c2d12, 
    roughness: 0.7, 
    sheen: 1.0,
    sheenColor: 0xfb923c,
    transmission: 0.1
  });
  
  const stemMat = new THREE.MeshPhysicalMaterial({ 
    color: 0xfef9c3, 
    emissive: 0x451a03, 
    roughness: 0.8,
    transmission: 0.3,
    thickness: 1.0
  });

  function addMushroom(cx,cz,sc,mat) {
    const stem=new THREE.Mesh(new THREE.CylinderGeometry(0.16*sc, 0.22*sc, 1.8*sc, 32), stemMat);
    stem.position.set(cx, -2.5 + 0.9*sc, cz);
    
    const capGeo = new THREE.SphereGeometry(0.95*sc, 64, 32, 0, Math.PI*2, 0, Math.PI*0.7);
    const cap=new THREE.Mesh(capGeo, mat);
    cap.position.set(cx, -2.5 + 1.8*sc, cz); cap.rotation.x=Math.PI;
    
    group.add(stem,cap);
  }
  addMushroom(0,0,3.2,capMat);
  addMushroom(-4.5,2.5,2.0,capMat);
  addMushroom(4.0,-1.8,2.2,capMat);
  addMushroom(-2.5,-3.5,1.6,capMat);

  for (let i=0;i<80;i++) {
    const sp=new THREE.Mesh(new THREE.SphereGeometry(0.08+Math.random()*0.1, 24, 24), 
      new THREE.MeshPhysicalMaterial({color:0xfde68a, emissive:0x7c2d12, roughness:0.1, transparent:true, opacity:0.8}));
    sp.position.set((Math.random()-.5)*20,(Math.random()-.5)*16,(Math.random()-.5)*10);
    sp.userData={off:Math.random()*Math.PI*2, speed:0.1+Math.random()*0.4};
    group.add(sp);
  }
  scene.add(group);
  return { scene, animate: (t) => {
    group.rotation.y=t*0.2;
    group.children.forEach(c=>{ if(c.userData.speed){ 
      c.position.y+=Math.sin(t*c.userData.speed+c.userData.off)*0.02; 
      c.position.x+=Math.cos(t*c.userData.speed*0.7+c.userData.off)*0.015; 
    }});
  }};
}

/* ─────────────────────────────────
   10. Immunology — B-Cell Core
───────────────────────────────── */
function buildImmunology() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x010104);
  makeLights(scene, 0x0a0020, 0.9, 0xccbbff, 2.0);
  scene.add(makeStars(600, 70));

  const group = new THREE.Group();
  const bcMat = new THREE.MeshPhysicalMaterial({ 
    color: 0x2563eb, 
    emissive: 0x1e3a8a, 
    roughness: 0.15, 
    transmission: 0.6,
    thickness: 2.0,
    sheen: 1.0,
    clearcoat: 1.0
  });

  const bCell = new THREE.Group();
  bCell.add(new THREE.Mesh(new THREE.SphereGeometry(2.2, 80, 80), bcMat));
  bCell.add(new THREE.Mesh(new THREE.SphereGeometry(1.1, 48, 48),
    new THREE.MeshPhysicalMaterial({color:0x1e40af, emissive:0x002266, roughness:0.05, transmission:0.7, clearcoat:1.0})));
  group.add(bCell);

  const abs=[];
  const abMat = new THREE.MeshPhysicalMaterial({ color: 0x7c3aed, emissive: 0x4c1d95, roughness: 0.1, clearcoat: 1.0 });
  
  for (let i=0;i<12;i++) {
    const a=(i/12)*Math.PI*2;
    const r=5.5;
    const ab=new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 2.5, 24), abMat);
    ab.position.set(Math.cos(a)*r, (Math.random()-.5)*4, Math.sin(a)*r);
    ab.userData={orbitAngle:a, orbitR:r, orbitSpeed:0.1+Math.random()*0.1};
    group.add(ab);
    abs.push(ab);
  }
  
  scene.add(group);
  return { scene, animate: (t) => {
    bCell.rotation.y=t*0.25;
    abs.forEach(ab=>{
      const a=ab.userData.orbitAngle+t*ab.userData.orbitSpeed;
      ab.position.x=Math.cos(a)*ab.userData.orbitR;
      ab.position.z=Math.sin(a)*ab.userData.orbitR;
      ab.rotation.y=a+Math.PI/2;
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
