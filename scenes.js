/* ══════════════════════════════════════════
   BioGuide 3D — scenes.js (Enhanced High-Quality Version)
   All Three.js scene builders with improved geometry, materials, and lighting.
══════════════════════════════════════════ */

/* ── Shared helpers ── */
function makeStars(n, spread) {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    pos[i*3]   = (Math.random()-.5)*spread;
    pos[i*3+1] = (Math.random()-.5)*spread;
    pos[i*3+2] = (Math.random()-.5)*spread*.5 - spread*.15;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  // Improved stars: smaller, slightly varied sizes if possible (using size attenuation)
  return new THREE.Points(geo, new THREE.PointsMaterial({ 
    color: 0xffffff, 
    size: 0.025, 
    transparent: true, 
    opacity: 0.7,
    sizeAttenuation: true 
  }));
}

function makeLights(scene, ambCol, ambInt, dirCol, dirInt) {
  scene.add(new THREE.AmbientLight(ambCol, ambInt));
  
  // Main directional light with shadow-like depth (if renderer supports)
  const d = new THREE.DirectionalLight(dirCol, dirInt);
  d.position.set(5, 10, 7.5);
  scene.add(d);
  
  // Fill light for better volume
  const f = new THREE.DirectionalLight(0xffffff, 0.3);
  f.position.set(-5, -2, -5);
  scene.add(f);

  // Rim light for edge definition
  const r = new THREE.PointLight(0x4488ff, 1.2, 40);
  r.position.set(-8, -4, -6);
  scene.add(r);
}

/* ─────────────────────────────────
   0. DNA Double Helix
───────────────────────────────── */
function buildDNA() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x01050a);
  makeLights(scene, 0x050a1a, 0.9, 0x00d4ff, 1.5);
  scene.add(makeStars(400, 50));

  const group = new THREE.Group();
  const N = 120; // Increased detail
  const s1pts = [], s2pts = [];
  for (let i = 0; i < N; i++) {
    const t = (i/(N-1)) * Math.PI * 8;
    const y = (i/(N-1)) * 18 - 9;
    s1pts.push(new THREE.Vector3(Math.cos(t)*2.8, y, Math.sin(t)*2.8));
    s2pts.push(new THREE.Vector3(Math.cos(t+Math.PI)*2.8, y, Math.sin(t+Math.PI)*2.8));
  }
  const c1 = new THREE.CatmullRomCurve3(s1pts);
  const c2 = new THREE.CatmullRomCurve3(s2pts);
  
  // High-quality physical materials
  const m1 = new THREE.MeshStandardMaterial({ 
    color: 0x00d4ff, 
    emissive: 0x002244, 
    roughness: 0.3, 
    metalness: 0.6 
  });
  const m2 = new THREE.MeshStandardMaterial({ 
    color: 0x7c3aed, 
    emissive: 0x1a0055, 
    roughness: 0.3, 
    metalness: 0.6 
  });
  
  // Higher segments for TubeGeometry
  group.add(new THREE.Mesh(new THREE.TubeGeometry(c1, 300, 0.12, 12, false), m1));
  group.add(new THREE.Mesh(new THREE.TubeGeometry(c2, 300, 0.12, 12, false), m2));

  const rungMat = new THREE.MeshStandardMaterial({ 
    color: 0x4af0ff, 
    transparent: true, 
    opacity: 0.7, 
    roughness: 0.2, 
    metalness: 0.3 
  });
  const atomM1  = new THREE.MeshStandardMaterial({ color: 0x00ffcc, emissive: 0x003322, roughness: 0.1, metalness: 0.8 });
  const atomM2  = new THREE.MeshStandardMaterial({ color: 0xcc44ff, emissive: 0x220033, roughness: 0.1, metalness: 0.8 });
  const atomGeo = new THREE.SphereGeometry(0.22, 24, 24); // Smoother spheres
  
  const RUNGS = 24; // More rungs
  const upAxis = new THREE.Vector3(0,1,0);
  for (let i = 0; i < RUNGS; i++) {
    const f = i/(RUNGS-1);
    const p1 = c1.getPoint(f), p2 = c2.getPoint(f);
    const mid = p1.clone().add(p2).multiplyScalar(0.5);
    const dist = p1.distanceTo(p2);
    const dir = p2.clone().sub(p1).normalize();
    const rg = new THREE.CylinderGeometry(0.05, 0.05, dist, 12);
    const rm = new THREE.Mesh(rg, rungMat);
    rm.position.copy(mid);
    rm.quaternion.setFromUnitVectors(upAxis, dir);
    group.add(rm);
    const a1 = new THREE.Mesh(atomGeo, atomM1); a1.position.copy(p1); group.add(a1);
    const a2 = new THREE.Mesh(atomGeo, atomM2); a2.position.copy(p2); group.add(a2);
  }
  scene.add(group);
  return { scene, animate: (t) => { group.rotation.y = t * 0.3; group.rotation.x = Math.sin(t*0.15)*0.08; } };
}

/* ─────────────────────────────────
   1. Histology — Hexagonal cell tissue
───────────────────────────────── */
function buildHistology() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x080214);
  makeLights(scene, 0x1a0033, 0.8, 0xffb3d9, 1.3);
  scene.add(makeStars(300, 40));

  const group = new THREE.Group();
  const cellMat = new THREE.MeshStandardMaterial({ 
    color: 0xfce7f3, 
    transparent: true, 
    opacity: 0.25, 
    roughness: 0.4, 
    metalness: 0.1 
  });
  const wireMat = new THREE.MeshStandardMaterial({ 
    color: 0xf472b6, 
    wireframe: true, 
    transparent: true, 
    opacity: 0.4,
    emissive: 0x330011 
  });
  const nucMat  = new THREE.MeshStandardMaterial({ 
    color: 0xdb2777, 
    emissive: 0x800020, 
    roughness: 0.2, 
    metalness: 0.5 
  });
  
  const hexGeo  = new THREE.CylinderGeometry(0.52, 0.52, 0.2, 6);
  const nucGeo  = new THREE.SphereGeometry(0.18, 24, 24);
  const rows=8, cols=9, r=0.52;
  for (let row=0; row<rows; row++) {
    for (let col=0; col<cols; col++) {
      const ox=(row%2)*r*0.87;
      const x = col*r*1.74 - cols*r*0.85 + ox;
      const z = row*r*1.52 - rows*r*0.75;
      
      const cell = new THREE.Mesh(hexGeo, cellMat);
      cell.position.set(x, 0, z); cell.rotation.y = Math.PI/6;
      
      const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.53, 0.53, 0.22, 6), wireMat);
      wire.position.set(x, 0, z); wire.rotation.y = Math.PI/6;
      
      const nuc = new THREE.Mesh(nucGeo, nucMat); 
      nuc.position.set(x, 0.05, z);
      nuc.scale.set(1, 0.8, 1); // Slightly flattened nucleus
      
      group.add(cell, wire, nuc);
    }
  }
  scene.add(group);
  return { scene, animate: (t) => { group.rotation.y = t*0.15; group.position.y = Math.sin(t*0.5)*0.3; } };
}

/* ─────────────────────────────────
   2. Embryology — Blastocyst
───────────────────────────────── */
function buildEmbryology() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0205);
  makeLights(scene, 0x1a0a00, 0.7, 0xffe0a0, 1.4);
  scene.add(makeStars(250, 40));

  const group = new THREE.Group();
  
  // Inner glow/atmosphere
  group.add(new THREE.Mesh(new THREE.SphereGeometry(3.85, 48, 48),
    new THREE.MeshStandardMaterial({ 
      color: 0xfbbf24, 
      transparent: true, 
      opacity: 0.08, 
      roughness: 0.1, 
      side: THREE.BackSide 
    })));
    
  const outerMat = new THREE.MeshStandardMaterial({ 
    color: 0xfcd34d, 
    wireframe: true, 
    transparent: true, 
    opacity: 0.2, 
    emissive: 0x221100 
  });
  group.add(new THREE.Mesh(new THREE.SphereGeometry(3.8, 40, 40), outerMat));

  const bMat = new THREE.MeshStandardMaterial({ 
    color: 0xfde68a, 
    emissive: 0x4d1a00, 
    roughness: 0.3, 
    metalness: 0.2, 
    transparent: true, 
    opacity: 0.95 
  });
  const bGeo = new THREE.SphereGeometry(0.6, 24, 24);
  const COUNT = 36; // More cells
  for (let i=0; i<COUNT; i++) {
    const phi=Math.acos(-1+(2*i)/COUNT), theta=Math.sqrt(COUNT*Math.PI)*phi;
    const r=3.35;
    const b = new THREE.Mesh(bGeo, bMat);
    b.position.set(r*Math.sin(phi)*Math.cos(theta), r*Math.cos(phi), r*Math.sin(phi)*Math.sin(theta));
    b.lookAt(0,0,0);
    b.scale.set(1.1, 1, 1.1);
    group.add(b);
  }
  
  const icmMat = new THREE.MeshStandardMaterial({ 
    color: 0xf472b6, 
    emissive: 0x500030, 
    roughness: 0.2, 
    metalness: 0.4 
  });
  const icmGroup = new THREE.Group();
  for (let i=0; i<15; i++) {
    const ang=(i/15)*Math.PI*2;
    const icm=new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 16), icmMat);
    icm.position.set(Math.cos(ang)*1.1, Math.sin(ang*0.7)*0.6, Math.sin(ang)*1.1);
    icmGroup.add(icm);
  }
  icmGroup.position.set(0, -0.5, 0);
  group.add(icmGroup);
  
  scene.add(group);
  return { scene, animate: (t) => { group.rotation.y=t*0.2; group.rotation.x=Math.sin(t*0.1)*0.15; } };
}

/* ─────────────────────────────────
   3. Plant Anatomy — Branching vascular
───────────────────────────────── */
function buildPlant() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000802);
  makeLights(scene, 0x001a06, 0.7, 0xafffba, 1.3);
  scene.add(makeStars(200, 40));

  const group = new THREE.Group();
  const stemMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x0a2d10, roughness: 0.5, metalness: 0.1 });
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x86efac, transparent: true, opacity: 0.8, side: THREE.DoubleSide, roughness: 0.4 });
  const chlMat  = new THREE.MeshStandardMaterial({ color: 0x16a34a, emissive: 0x052210, roughness: 0.2, metalness: 0.3 });

  function branch(startPt, dir, len, radius, depth) {
    if (depth < 0 || len < 0.2) return;
    const endPt = startPt.clone().add(dir.clone().multiplyScalar(len));
    const mid = startPt.clone().add(endPt).multiplyScalar(0.5);
    const cyl = new THREE.Mesh(new THREE.CylinderGeometry(radius*0.75, radius, len, 12), stemMat);
    cyl.position.copy(mid);
    cyl.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), dir.clone().normalize());
    group.add(cyl);
    
    if (depth <= 1) {
      // Improved leaf geometry
      const leafGeo = new THREE.SphereGeometry(0.5, 8, 2);
      leafGeo.scale(1, 0.05, 1.8);
      const leaf = new THREE.Mesh(leafGeo, leafMat);
      leaf.position.copy(endPt);
      leaf.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI);
      group.add(leaf);
      
      for (let i=0; i<4; i++) {
        const ch = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 12), chlMat);
        ch.position.set(endPt.x+(Math.random()-.5)*0.4, endPt.y+(Math.random()-.5)*0.4, endPt.z+(Math.random()-.5)*0.4);
        group.add(ch);
      }
    }
    if (depth > 0) {
      const spread = 0.5 + depth*0.12;
      for (let b=0; b<2; b++) {
        const newDir = dir.clone().applyEuler(new THREE.Euler(
          (Math.random()-.5)*spread, (Math.random()-.5)*spread, (Math.random()-.5)*spread*0.6));
        branch(endPt, newDir, len*0.75, radius*0.7, depth-1);
      }
    }
  }
  branch(new THREE.Vector3(0,-6,0), new THREE.Vector3(0,1,0.05), 4, 0.25, 4);
  scene.add(group);
  return { scene, animate: (t) => { group.rotation.y=t*0.18; group.rotation.z=Math.sin(t*0.3)*0.05; } };
}

/* ─────────────────────────────────
   4. Parasitology — Segmented worm
───────────────────────────────── */
function buildParasitology() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050400);
  makeLights(scene, 0x1a1400, 0.7, 0xfff0a0, 1.2);
  scene.add(makeStars(250, 40));

  const group = new THREE.Group();
  const segMat  = new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0x3d2d00, roughness: 0.4, metalness: 0.1 });
  const headMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0x503500, roughness: 0.3, metalness: 0.3 });
  const hookMat = new THREE.MeshStandardMaterial({ color: 0x65a30d, emissive: 0x0a1400, roughness: 0.2, metalness: 0.6 });
  
  const N=48; // Smoother worm
  for (let i=0; i<N; i++) {
    const f=i/(N-1);
    const t=f*Math.PI*6;
    const y=f*15-7.5;
    const r=2.2+Math.sin(f*Math.PI)*1.5;
    const sz = i===0 ? 1.5 : 0.75+Math.sin(i*0.8)*0.18;
    
    const seg=new THREE.Mesh(new THREE.SphereGeometry(sz*0.45, 24, 24), i===0?headMat:segMat);
    seg.position.set(Math.cos(t)*r, y, Math.sin(t)*r);
    seg.scale.set(1.1, 0.8, 1.1);
    group.add(seg);
    
    if (i===0) {
      for (let h=0; h<8; h++) {
        const ha=(h/8)*Math.PI*2;
        const hook=new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.4, 12), hookMat);
        hook.position.set(seg.position.x+Math.cos(ha)*0.55, seg.position.y+0.2, seg.position.z+Math.sin(ha)*0.55);
        hook.rotation.x = Math.PI/4;
        group.add(hook);
      }
    }
  }
  scene.add(group);
  return { scene, animate: (t) => { group.rotation.y=t*0.25; group.rotation.x=Math.sin(t*0.2)*0.12; } };
}

/* ─────────────────────────────────
   5. Hematology — Blood cells
───────────────────────────────── */
function buildHematology() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0102);
  makeLights(scene, 0x1a0000, 0.6, 0xff7777, 1.4);
  scene.add(makeStars(200, 40));

  const group = new THREE.Group();
  const rbcMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, emissive: 0x500000, roughness: 0.3, metalness: 0.2 });
  const wbcMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, emissive: 0x1a1a2a, roughness: 0.4, metalness: 0.1 });
  const platMat= new THREE.MeshStandardMaterial({ color: 0xfca5a5, emissive: 0x2a0000, roughness: 0.5 });

  // Improved RBC geometry (torus-like)
  const rbcGeo = new THREE.TorusGeometry(0.5, 0.25, 12, 24);
  rbcGeo.scale(1, 1, 0.5);

  for (let i=0; i<30; i++) {
    const rbc=new THREE.Mesh(rbcGeo, rbcMat);
    rbc.position.set((Math.random()-.5)*15, (Math.random()-.5)*10, (Math.random()-.5)*6);
    rbc.rotation.set(Math.random()*Math.PI,Math.random()*Math.PI,Math.random()*Math.PI);
    rbc.userData={ox:rbc.position.x, oy:rbc.position.y, oz:rbc.position.z, off:Math.random()*Math.PI*2, sp:0.2+Math.random()*0.3};
    group.add(rbc);
  }
  
  const wbc=new THREE.Mesh(new THREE.SphereGeometry(1.5, 32, 32), wbcMat);
  const spkMat=new THREE.MeshStandardMaterial({color: 0xe2e8f0, roughness: 0.3});
  for (let s=0; s<24; s++) {
    const phi=Math.acos(-1+(2*s)/24), th=Math.sqrt(24*Math.PI)*phi;
    const sp=new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), spkMat);
    const dir=new THREE.Vector3(Math.sin(phi)*Math.cos(th),Math.cos(phi),Math.sin(phi)*Math.sin(th));
    sp.position.copy(dir.clone().multiplyScalar(1.5));
    wbc.add(sp);
  }
  wbc.position.set(1,1,0); group.add(wbc);
  
  for (let p=0; p<12; p++) {
    const pl=new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 12), platMat);
    pl.scale.set(1, 0.4, 1);
    pl.position.set((Math.random()-.5)*12,(Math.random()-.5)*9,(Math.random()-.5)*5);
    group.add(pl);
  }
  scene.add(group);
  return { scene, animate: (t) => {
    group.rotation.y=t*0.12;
    wbc.rotation.y=t*0.4; wbc.rotation.x=t*0.2;
    group.children.forEach(c=>{ if(c.userData.ox!==undefined){ c.position.y=c.userData.oy+Math.sin(t*c.userData.sp+c.userData.off)*0.6; }});
  }};
}

/* ─────────────────────────────────
   6. Microbiology — Bacteria + Virus
───────────────────────────────── */
function buildMicrobiology() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x010806);
  makeLights(scene, 0x001a15, 0.7, 0x66ffcc, 1.3);
  scene.add(makeStars(300, 45));

  const group = new THREE.Group();
  const bactMat = new THREE.MeshStandardMaterial({ color: 0x14b8a6, emissive: 0x004d33, roughness: 0.3, metalness: 0.2 });
  const virMat  = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0x660000, roughness: 0.2, metalness: 0.4 });
  const spkMat  = new THREE.MeshStandardMaterial({ color: 0xfca5a5, emissive: 0x4d0000, roughness: 0.3 });
  const flgMat  = new THREE.LineBasicMaterial({ color: 0x5eead4, transparent: true, opacity: 0.8 });

  const bactPositions=[
    [-4,1,1],[-3,-2.5,-1.5],[-6,-1,-2.5],[3,3,1],[1.5,-3.5,0.5],[-3,2.5,-1.5],[4,1,-1.5],[-1.5,4,1.5]
  ];
  bactPositions.forEach(([x,y,z], idx)=>{
    const bact=new THREE.Mesh(new THREE.CapsuleGeometry(0.3, 0.8, 12, 24), bactMat);
    bact.position.set(x,y,z);
    bact.rotation.set(Math.random()*0.8,Math.random()*Math.PI,Math.random()*0.5);
    bact.userData={orig:[x,y,z], off:idx*0.8};
    group.add(bact);
    
    const pts=[];
    for (let f=0; f<16; f++) pts.push(new THREE.Vector3(0, -0.6 - f*0.15, Math.sin(f*0.8)*0.15));
    const fl=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), flgMat);
    bact.add(fl);
  });

  const virus=new THREE.Group();
  virus.add(new THREE.Mesh(new THREE.IcosahedronGeometry(1.6, 2), virMat));
  for (let i=0; i<32; i++) {
    const phi=Math.acos(-1+(2*i)/32), th=Math.sqrt(32*Math.PI)*phi;
    const dir=new THREE.Vector3(Math.sin(phi)*Math.cos(th),Math.cos(phi),Math.sin(phi)*Math.sin(th));
    const sp=new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.12, 0.6, 12), spkMat);
    sp.position.copy(dir.clone().multiplyScalar(1.8));
    sp.lookAt(dir.clone().multiplyScalar(4));
    sp.rotation.x += Math.PI/2;
    virus.add(sp);
  }
  group.add(virus);
  scene.add(group);
  return { scene, animate: (t) => {
    group.rotation.y=t*0.15;
    virus.rotation.y=t*0.4; virus.rotation.x=t*0.25;
    group.children.forEach(c=>{ if(c.userData.off!==undefined){ 
      c.position.y=c.userData.orig[1]+Math.sin(t*0.5+c.userData.off)*0.4; 
      c.children[0].geometry.setFromPoints(Array.from({length:16}, (_,f)=>new THREE.Vector3(Math.sin(t*4+f*0.5)*0.1, -0.6 - f*0.15, Math.cos(t*4+f*0.5)*0.1)));
    }});
  }};
}

/* ─────────────────────────────────
   7. Entomology — Honeycomb + insects
───────────────────────────────── */
function buildEntomology() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x080500);
  makeLights(scene, 0x1a1000, 0.8, 0xffd966, 1.3);
  scene.add(makeStars(200, 40));

  const group = new THREE.Group();
  const hexMat   = new THREE.MeshStandardMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.4, roughness: 0.2, metalness: 0.1 });
  const hexWire  = new THREE.MeshStandardMaterial({ color: 0xfbbf24, wireframe: true, transparent: true, opacity: 0.7, emissive: 0x4d3300 });
  const bodyMat  = new THREE.MeshStandardMaterial({ color: 0x78350f, emissive: 0x2d1000, roughness: 0.3, metalness: 0.4 });
  const wingMat  = new THREE.MeshStandardMaterial({ color: 0xfef3c7, transparent: true, opacity: 0.4, side: THREE.DoubleSide, roughness: 0.1 });
  const eyeMat   = new THREE.MeshStandardMaterial({ color: 0x1c1917, emissive: 0x1a1a1a, roughness: 0.1, metalness: 0.8 });

  for (let row=-3;row<=3;row++) {
    for (let col=-4;col<=4;col++) {
      const ox=(row%2)*0.87*1.04;
      const x=col*1.75+ox, z=row*1.52;
      const hx=new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.2, 6), hexMat);
      hx.position.set(x,0,z); hx.rotation.y=Math.PI/6;
      const hw=new THREE.Mesh(new THREE.CylinderGeometry(0.51, 0.51, 0.22, 6), hexWire);
      hw.position.set(x,0,z); hw.rotation.y=Math.PI/6;
      group.add(hx,hw);
    }
  }
  
  [[0,2,0],[4,1.8,2.5],[-4,2.2,-2.5]].forEach(([x,y,z])=>{
    const bee = new THREE.Group();
    const body=new THREE.Mesh(new THREE.SphereGeometry(0.4, 24, 24), bodyMat);
    body.scale.set(1, 1.6, 1);
    const head=new THREE.Mesh(new THREE.SphereGeometry(0.25, 16, 16), bodyMat);
    head.position.y = 0.7;
    const eye1=new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 12), eyeMat);
    eye1.position.set(0.15, 0.8, 0.18);
    const eye2=new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 12), eyeMat);
    eye2.position.set(-0.15, 0.8, 0.18);
    
    const wg1=new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 2), wingMat);
    wg1.scale.set(1.2, 0.02, 0.5); wg1.position.set(0.6, 0.2, 0); wg1.rotation.z=0.4;
    const wg2=new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 2), wingMat);
    wg2.scale.set(1.2, 0.02, 0.5); wg2.position.set(-0.6, 0.2, 0); wg2.rotation.z=-0.4;
    
    bee.add(body, head, eye1, eye2, wg1, wg2);
    bee.position.set(x, y, z);
    bee.userData = { oy: y, off: Math.random()*Math.PI*2 };
    group.add(bee);
  });
  
  scene.add(group);
  return { scene, animate: (t) => { 
    group.rotation.y=t*0.16; 
    group.children.forEach(c => {
      if (c.userData.oy) {
        c.position.y = c.userData.oy + Math.sin(t*2 + c.userData.off)*0.3;
        c.children[4].rotation.z = 0.4 + Math.sin(t*20)*0.2;
        c.children[5].rotation.z = -0.4 - Math.sin(t*20)*0.2;
      }
    });
  }};
}

/* ─────────────────────────────────
   8. Algae — Spiral filaments
───────────────────────────────── */
function buildAlgae() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000a05);
  makeLights(scene, 0x001a10, 0.7, 0x55ffbb, 1.3);
  scene.add(makeStars(250, 45));

  const group = new THREE.Group();
  const colors=[0x10b981,0x06b6d4,0x34d399,0x22d3ee,0x6ee7b7];
  for (let s=0;s<6;s++) {
    const pts=[], off=(s/6)*Math.PI*2, r=1.6+s*0.9;
    for (let i=0;i<80;i++) {
      const t=(i/79)*Math.PI*10+off;
      pts.push(new THREE.Vector3(Math.cos(t)*r, (i/79)*16-8, Math.sin(t)*r));
    }
    const mat=new THREE.MeshStandardMaterial({ 
      color: colors[s % colors.length], 
      emissive: 0x002a1a, 
      roughness: 0.3, 
      metalness: 0.2, 
      transparent: true, 
      opacity: 0.9 
    });
    const tube=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 250, 0.1, 12, false), mat);
    group.add(tube);
    
    for (let i=0;i<12;i++) {
      const p=pts[Math.floor(i/12*79)];
      const ch=new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 16), new THREE.MeshStandardMaterial({color:0x065f46, emissive:0x052a1a, roughness:0.2}));
      ch.position.copy(p); group.add(ch);
    }
  }
  scene.add(group);
  return { scene, animate: (t) => { group.rotation.y=t*0.2; group.rotation.x=Math.sin(t*0.15)*0.1; } };
}

/* ─────────────────────────────────
   9. Mycology — Mushroom cluster
───────────────────────────────── */
function buildMycology() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x080200);
  makeLights(scene, 0x1a0800, 0.7, 0xffa066, 1.4);
  scene.add(makeStars(200, 40));

  const group = new THREE.Group();
  const capMat   = new THREE.MeshStandardMaterial({ color: 0xf97316, emissive: 0x4d1a00, roughness: 0.4, metalness: 0.1 });
  const capMat2  = new THREE.MeshStandardMaterial({ color: 0xfb923c, emissive: 0x3d1500, roughness: 0.4 });
  const stemMat  = new THREE.MeshStandardMaterial({ color: 0xfef9c3, emissive: 0x1a1800, roughness: 0.5 });
  const sporeMat = new THREE.MeshStandardMaterial({ color: 0xfde68a, emissive: 0x4d3300, roughness: 0.1, metalness: 0.5, transparent: true, opacity: 0.8 });
  const spotMat  = new THREE.MeshStandardMaterial({ color: 0xfff7ed, roughness: 0.3 });

  function addMushroom(cx,cz,sc,mat) {
    const stem=new THREE.Mesh(new THREE.CylinderGeometry(0.12*sc, 0.18*sc, 1.5*sc, 16), stemMat);
    stem.position.set(cx, -2 + 0.75*sc, cz);
    
    const capGeo = new THREE.SphereGeometry(0.8*sc, 32, 16, 0, Math.PI*2, 0, Math.PI*0.65);
    const cap=new THREE.Mesh(capGeo, mat);
    cap.position.set(cx, -2 + 1.5*sc, cz); cap.rotation.x=Math.PI;
    
    for (let i=0;i<8;i++) {
      const a=(i/8)*Math.PI*2, r=0.4*sc;
      const sp=new THREE.Mesh(new THREE.SphereGeometry(0.08*sc, 12, 12), spotMat);
      sp.position.set(cx+Math.cos(a)*r, -2+1.7*sc+Math.sin(a)*r*0.3, cz+Math.sin(a)*r);
      group.add(sp);
    }
    group.add(stem,cap);
  }
  addMushroom(0,0,2.5,capMat);
  addMushroom(-3.5,1.8,1.6,capMat2);
  addMushroom(3.2,-1.2,1.8,capMat);
  addMushroom(-1.8,-2.8,1.2,capMat2);
  addMushroom(2.8,2.8,1.1,capMat);

  for (let i=0;i<50;i++) {
    const sp=new THREE.Mesh(new THREE.SphereGeometry(0.05+Math.random()*0.07, 12, 12), sporeMat);
    sp.position.set((Math.random()-.5)*14,(Math.random()-.5)*10,(Math.random()-.5)*6);
    sp.userData={off:Math.random()*Math.PI*2, speed:0.15+Math.random()*0.25};
    group.add(sp);
  }
  scene.add(group);
  return { scene, animate: (t) => {
    group.rotation.y=t*0.15;
    group.children.forEach(c=>{ if(c.userData.speed){ 
      c.position.y+=Math.sin(t*c.userData.speed+c.userData.off)*0.01; 
      c.position.x+=Math.cos(t*c.userData.speed*0.8+c.userData.off)*0.008; 
    }});
  }};
}

/* ─────────────────────────────────
   10. Immunology — Antibodies + B-cell
───────────────────────────────── */
function buildImmunology() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x020108);
  makeLights(scene, 0x0a0020, 0.8, 0xaa88ff, 1.4);
  scene.add(makeStars(350, 45));

  const group = new THREE.Group();
  const abMat  = new THREE.MeshStandardMaterial({ color: 0x7c3aed, emissive: 0x2d0066, roughness: 0.2, metalness: 0.5 });
  const bcMat  = new THREE.MeshStandardMaterial({ color: 0x3b82f6, emissive: 0x002266, roughness: 0.3, metalness: 0.2, transparent: true, opacity: 0.92 });
  const bcWire = new THREE.MeshStandardMaterial({ color: 0x60a5fa, wireframe: true, transparent: true, opacity: 0.4, emissive: 0x0033aa });
  const antMat = new THREE.MeshStandardMaterial({ color: 0xc4b5fd, emissive: 0x1a0044, roughness: 0.2, metalness: 0.6 });

  function addAntibody(px,py,pz,ry) {
    const ab=new THREE.Group();
    const fc=new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 1.8, 12), abMat);
    fc.position.y=-0.9;
    ab.add(fc);
    [[0.45, 1.1, 0.55, Math.PI/4], [-0.45, 1.1, -0.55, -Math.PI/4]].forEach(([fx,fy,fz,rz])=>{
      const fab=new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 1.4, 12), abMat);
      fab.position.set(fx,fy,0); fab.rotation.z=rz;
      ab.add(fab);
      const tip=new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 16), antMat);
      tip.position.set(fx+(fx>0?0.4:-0.4), fy+0.35, 0);
      ab.add(tip);
    });
    ab.position.set(px,py,pz); ab.rotation.y=ry;
    group.add(ab);
    return ab;
  }

  const bCell = new THREE.Group();
  bCell.add(new THREE.Mesh(new THREE.SphereGeometry(1.8, 48, 48), bcMat));
  bCell.add(new THREE.Mesh(new THREE.SphereGeometry(1.82, 32, 32), bcWire));
  bCell.add(new THREE.Mesh(new THREE.SphereGeometry(0.9, 24, 24),
    new THREE.MeshStandardMaterial({color:0x1e40af, emissive:0x001a44, roughness:0.2, transparent:true, opacity:0.85})));
  group.add(bCell);

  const abs=[];
  for (let i=0;i<8;i++) {
    const a=(i/8)*Math.PI*2;
    const r=4.5;
    const ab=addAntibody(Math.cos(a)*r, (Math.random()-.5)*3, Math.sin(a)*r, a+Math.PI/2);
    ab.userData={orbitAngle:a, orbitR:r, orbitSpeed:0.15+Math.random()*0.1};
    abs.push(ab);
  }
  
  const tcMat=new THREE.MeshStandardMaterial({color:0x06b6d4, emissive:0x003344, roughness:0.2, metalness:0.3, transparent:true, opacity:0.9});
  for (let i=0;i<4;i++) {
    const a=(i/4)*Math.PI*2+Math.PI/4;
    const tc=new THREE.Mesh(new THREE.SphereGeometry(0.65, 24, 24), tcMat);
    tc.position.set(Math.cos(a)*7, (Math.random()-.5)*3, Math.sin(a)*7);
    tc.userData={orbitAngle:a, orbitR:7, orbitSpeed:0.1};
    group.add(tc);
    abs.push(tc);
  }
  
  scene.add(group);
  return { scene, animate: (t) => {
    bCell.rotation.y=t*0.15;
    abs.forEach(ab=>{
      if(ab.userData.orbitAngle!==undefined){
        const a=ab.userData.orbitAngle+t*ab.userData.orbitSpeed;
        ab.position.x=Math.cos(a)*ab.userData.orbitR;
        ab.position.z=Math.sin(a)*ab.userData.orbitR;
        ab.rotation.y=a+Math.PI/2;
        ab.rotation.x=Math.sin(t*0.5 + ab.userData.orbitAngle)*0.2;
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
