/* ══════════════════════════════════════════
   BioGuide 3D — scenes.js (Optimized Hyper-Realistic)
   High-performance version with organic textures and 
   balanced geometry to prevent freezing on all devices.
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
  return new THREE.Points(geo, new THREE.PointsMaterial({ 
    color: 0xffffff, size: 0.02, transparent: true, opacity: 0.6, sizeAttenuation: true 
  }));
}

function makeLights(scene, ambCol, ambInt, dirCol, dirInt) {
  scene.add(new THREE.AmbientLight(ambCol, ambInt));
  const d = new THREE.DirectionalLight(dirCol, dirInt);
  d.position.set(10, 15, 10);
  // Optimized shadows: lower resolution but still effective
  d.castShadow = true;
  d.shadow.mapSize.set(1024, 1024);
  scene.add(d);
  
  const r = new THREE.PointLight(0xffffff, 1.5, 40);
  r.position.set(-10, 5, -10);
  scene.add(r);

  const h = new THREE.HemisphereLight(0xffffff, 0x000000, 0.5);
  scene.add(h);
}

/* ─────────────────────────────────
   0. DNA Double Helix
───────────────────────────────── */
function buildDNA() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x010306);
  makeLights(scene, 0x0a0c1a, 0.8, 0x00d4ff, 1.5);
  scene.add(makeStars(300, 50));

  const group = new THREE.Group();
  const N = 100; // Optimized segments
  const s1pts = [], s2pts = [];
  for (let i = 0; i < N; i++) {
    const t = (i/(N-1)) * Math.PI * 8;
    const y = (i/(N-1)) * 18 - 9;
    s1pts.push(new THREE.Vector3(Math.cos(t)*2.8, y, Math.sin(t)*2.8));
    s2pts.push(new THREE.Vector3(Math.cos(t+Math.PI)*2.8, y, Math.sin(t+Math.PI)*2.8));
  }
  const c1 = new THREE.CatmullRomCurve3(s1pts);
  const c2 = new THREE.CatmullRomCurve3(s2pts);
  
  const m1 = new THREE.MeshPhysicalMaterial({ color: 0x00d4ff, emissive: 0x001122, roughness: 0.2, metalness: 0.4, clearcoat: 0.8 });
  const m2 = new THREE.MeshPhysicalMaterial({ color: 0x7c3aed, emissive: 0x110033, roughness: 0.2, metalness: 0.4, clearcoat: 0.8 });
  
  group.add(new THREE.Mesh(new THREE.TubeGeometry(c1, 160, 0.12, 8, false), m1));
  group.add(new THREE.Mesh(new THREE.TubeGeometry(c2, 160, 0.12, 8, false), m2));

  const atomGeo = new THREE.SphereGeometry(0.22, 16, 16);
  const RUNGS = 24;
  for (let i = 0; i < RUNGS; i++) {
    const f = i/(RUNGS-1);
    const p1 = c1.getPoint(f), p2 = c2.getPoint(f);
    const a1 = new THREE.Mesh(atomGeo, m1); a1.position.copy(p1); group.add(a1);
    const a2 = new THREE.Mesh(atomGeo, m2); a2.position.copy(p2); group.add(a2);
  }
  scene.add(group);
  return { scene, animate: (t) => { group.rotation.y = t * 0.3; group.rotation.x = Math.sin(t*0.1)*0.08; } };
}

/* ─────────────────────────────────
   1. Histology
───────────────────────────────── */
function buildHistology() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x05010a);
  makeLights(scene, 0x1a0033, 0.8, 0xff99cc, 1.4);
  scene.add(makeStars(250, 45));

  const group = new THREE.Group();
  const cellMat = new THREE.MeshPhysicalMaterial({ color: 0xfce7f3, transparent: true, opacity: 0.3, roughness: 0.4, transmission: 0.3, thickness: 0.5 });
  const nucMat = new THREE.MeshPhysicalMaterial({ color: 0xdb2777, emissive: 0x550022, roughness: 0.3, clearcoat: 0.5 });
  
  const hexGeo = new THREE.CylinderGeometry(0.52, 0.52, 0.2, 6);
  const nucGeo = new THREE.SphereGeometry(0.18, 12, 12);
  const rows=7, cols=8, r=0.52;
  for (let row=0; row<rows; row++) {
    for (let col=0; col<cols; col++) {
      const ox=(row%2)*r*0.87;
      const x = col*r*1.74 - cols*r*0.85 + ox;
      const z = row*r*1.52 - rows*r*0.75;
      const cell = new THREE.Mesh(hexGeo, cellMat);
      cell.position.set(x, 0, z); cell.rotation.y = Math.PI/6;
      const nuc = new THREE.Mesh(nucGeo, nucMat); nuc.position.set(x, 0.06, z);
      group.add(cell, nuc);
    }
  }
  scene.add(group);
  return { scene, animate: (t) => { group.rotation.y = t*0.1; group.position.y = Math.sin(t*0.4)*0.3; } };
}

/* ─────────────────────────────────
   2. Embryology
───────────────────────────────── */
function buildEmbryology() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x080103);
  makeLights(scene, 0x1a0a00, 0.8, 0xffcc88, 1.5);
  scene.add(makeStars(200, 45));

  const group = new THREE.Group();
  const bMat = new THREE.MeshPhysicalMaterial({ color: 0xfde68a, emissive: 0x442200, roughness: 0.3, transmission: 0.4, thickness: 0.5 });
  const bGeo = new THREE.SphereGeometry(0.6, 16, 16);
  const COUNT = 32;
  for (let i=0; i<COUNT; i++) {
    const phi=Math.acos(-1+(2*i)/COUNT), theta=Math.sqrt(COUNT*Math.PI)*phi;
    const r=3.4;
    const b = new THREE.Mesh(bGeo, bMat);
    b.position.set(r*Math.sin(phi)*Math.cos(theta), r*Math.cos(phi), r*Math.sin(phi)*Math.sin(theta));
    group.add(b);
  }
  const icmMat = new THREE.MeshPhysicalMaterial({ color: 0xf472b6, emissive: 0x550022, roughness: 0.3, clearcoat: 0.5 });
  for (let i=0; i<12; i++) {
    const ang=(i/12)*Math.PI*2;
    const icm=new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 12), icmMat);
    icm.position.set(Math.cos(ang)*1.1, Math.sin(ang*0.7)*0.6, Math.sin(ang)*1.1);
    group.add(icm);
  }
  scene.add(group);
  return { scene, animate: (t) => { group.rotation.y=t*0.2; group.rotation.x=Math.sin(t*0.1)*0.15; } };
}

/* ─────────────────────────────────
   3. Plant Anatomy
───────────────────────────────── */
function buildPlant() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000501);
  makeLights(scene, 0x001a06, 0.8, 0x88ffaa, 1.4);
  scene.add(makeStars(200, 45));

  const group = new THREE.Group();
  const stemMat = new THREE.MeshPhysicalMaterial({ color: 0x22c55e, emissive: 0x0a3310, roughness: 0.7 });
  const leafMat = new THREE.MeshPhysicalMaterial({ color: 0x86efac, transparent: true, opacity: 0.8, side: THREE.DoubleSide, transmission: 0.3 });

  function branch(startPt, dir, len, radius, depth) {
    if (depth < 0 || len < 0.2) return;
    const endPt = startPt.clone().add(dir.clone().multiplyScalar(len));
    const mid = startPt.clone().add(endPt).multiplyScalar(0.5);
    const cyl = new THREE.Mesh(new THREE.CylinderGeometry(radius*0.7, radius, len, 8), stemMat);
    cyl.position.copy(mid);
    cyl.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), dir.clone().normalize());
    group.add(cyl);
    if (depth <= 1) {
      const leafGeo = new THREE.SphereGeometry(0.5, 8, 2); leafGeo.scale(1, 0.05, 1.8);
      const leaf = new THREE.Mesh(leafGeo, leafMat);
      leaf.position.copy(endPt);
      leaf.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI);
      group.add(leaf);
    }
    if (depth > 0) {
      const spread = 0.5 + depth*0.1;
      for (let b=0; b<2; b++) {
        const newDir = dir.clone().applyEuler(new THREE.Euler((Math.random()-.5)*spread, (Math.random()-.5)*spread, (Math.random()-.5)*spread*0.5));
        branch(endPt, newDir, len*0.75, radius*0.7, depth-1);
      }
    }
  }
  branch(new THREE.Vector3(0,-6,0), new THREE.Vector3(0,1,0.05), 4, 0.25, 3);
  scene.add(group);
  return { scene, animate: (t) => { group.rotation.y=t*0.15; group.rotation.z=Math.sin(t*0.2)*0.05; } };
}

/* ─────────────────────────────────
   4. Parasitology
───────────────────────────────── */
function buildParasitology() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x040300);
  makeLights(scene, 0x1a1400, 0.8, 0xffea88, 1.4);
  scene.add(makeStars(200, 45));

  const group = new THREE.Group();
  const segMat = new THREE.MeshPhysicalMaterial({ color: 0xfef08a, emissive: 0x443300, roughness: 0.2, clearcoat: 0.8 });
  const headMat = new THREE.MeshPhysicalMaterial({ color: 0xfacc15, emissive: 0x664400, roughness: 0.1, clearcoat: 1.0 });
  const N=40;
  for (let i=0; i<N; i++) {
    const f=i/(N-1);
    const t=f*Math.PI*6;
    const y=f*15-7.5;
    const r=2.2+Math.sin(f*Math.PI)*1.5;
    const sz = i===0 ? 1.5 : 0.75+Math.sin(i*0.8)*0.18;
    const seg=new THREE.Mesh(new THREE.SphereGeometry(sz*0.45, 16, 16), i===0?headMat:segMat);
    seg.position.set(Math.cos(t)*r, y, Math.sin(t)*r);
    group.add(seg);
  }
  scene.add(group);
  return { scene, animate: (t) => { group.rotation.y=t*0.2; group.rotation.x=Math.sin(t*0.15)*0.1; } };
}

/* ─────────────────────────────────
   5. Hematology
───────────────────────────────── */
function buildHematology() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x080001);
  makeLights(scene, 0x1a0000, 0.7, 0xff5555, 1.5);
  scene.add(makeStars(200, 45));

  const group = new THREE.Group();
  const rbcMat = new THREE.MeshPhysicalMaterial({ color: 0xdc2626, emissive: 0x660000, roughness: 0.3, sheen: 1.0 });
  const wbcMat = new THREE.MeshPhysicalMaterial({ color: 0xf8fafc, emissive: 0x222233, roughness: 0.4, transmission: 0.3 });
  const rbcGeo = new THREE.TorusGeometry(0.55, 0.28, 8, 16); rbcGeo.scale(1, 1, 0.4);

  for (let i=0; i<30; i++) {
    const rbc=new THREE.Mesh(rbcGeo, rbcMat);
    rbc.position.set((Math.random()-.5)*15, (Math.random()-.5)*11, (Math.random()-.5)*6);
    rbc.rotation.set(Math.random()*Math.PI,Math.random()*Math.PI,Math.random()*Math.PI);
    rbc.userData={ox:rbc.position.x, oy:rbc.position.y, oz:rbc.position.z, off:Math.random()*Math.PI*2, sp:0.2+Math.random()*0.3};
    group.add(rbc);
  }
  const wbc=new THREE.Mesh(new THREE.SphereGeometry(1.5, 24, 24), wbcMat);
  wbc.position.set(1,1,0); group.add(wbc);
  scene.add(group);
  return { scene, animate: (t) => {
    group.rotation.y=t*0.1;
    wbc.rotation.y=t*0.4;
    group.children.forEach(c=>{ if(c.userData.ox!==undefined){ c.position.y=c.userData.oy+Math.sin(t*c.userData.sp+c.userData.off)*0.6; }});
  }};
}

/* ─────────────────────────────────
   6. Microbiology — FIXED PERFORMANCE
───────────────────────────────── */
function buildMicrobiology() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x010504);
  makeLights(scene, 0x001a15, 0.8, 0x88ffdd, 1.4);
  scene.add(makeStars(250, 45));

  const group = new THREE.Group();
  const bactMat = new THREE.MeshPhysicalMaterial({ color: 0x14b8a6, emissive: 0x004d33, roughness: 0.4, clearcoat: 0.5 });
  const virMat = new THREE.MeshPhysicalMaterial({ color: 0xef4444, emissive: 0x770000, roughness: 0.3, clearcoat: 0.8 });

  // Optimized bacteria geometry
  const bactGeo = new THREE.CapsuleGeometry(0.3, 0.8, 8, 16);
  const bactPositions=[[-4,1,1],[-3,-2,-1],[-6,-1,-2],[3,3,1],[1,-3,0],[-3,2,-1],[4,1,-1],[-1,4,1]];
  bactPositions.forEach(([x,y,z], idx)=>{
    const bact=new THREE.Mesh(bactGeo, bactMat);
    bact.position.set(x,y,z);
    bact.rotation.set(Math.random()*0.8,Math.random()*Math.PI,Math.random()*0.5);
    bact.userData={orig:[x,y,z], off:idx*0.8};
    group.add(bact);
  });

  const virus=new THREE.Group();
  virus.add(new THREE.Mesh(new THREE.IcosahedronGeometry(1.6, 2), virMat));
  const spkGeo = new THREE.CylinderGeometry(0.05, 0.12, 0.6, 8);
  for (let i=0; i<24; i++) {
    const phi=Math.acos(-1+(2*i)/24), th=Math.sqrt(24*Math.PI)*phi;
    const dir=new THREE.Vector3(Math.sin(phi)*Math.cos(th),Math.cos(phi),Math.sin(phi)*Math.sin(th));
    const sp=new THREE.Mesh(spkGeo, virMat);
    sp.position.copy(dir.clone().multiplyScalar(1.7));
    sp.lookAt(dir.clone().multiplyScalar(4));
    sp.rotation.x += Math.PI/2;
    virus.add(sp);
  }
  group.add(virus);
  scene.add(group);
  return { scene, animate: (t) => {
    group.rotation.y=t*0.15;
    virus.rotation.y=t*0.4; virus.rotation.x=t*0.25;
    group.children.forEach(c=>{ if(c.userData.off!==undefined){ c.position.y=c.userData.orig[1]+Math.sin(t*0.5+c.userData.off)*0.4; }});
  }};
}

/* ─────────────────────────────────
   7. Entomology
───────────────────────────────── */
function buildEntomology() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x060400);
  makeLights(scene, 0x1a1000, 0.8, 0xffd544, 1.4);
  scene.add(makeStars(200, 45));

  const group = new THREE.Group();
  const hexMat = new THREE.MeshPhysicalMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.4, roughness: 0.2, transmission: 0.3 });
  const bodyMat = new THREE.MeshPhysicalMaterial({ color: 0x78350f, emissive: 0x331100, roughness: 0.2, metalness: 0.4, clearcoat: 1.0 });

  for (let row=-2;row<=2;row++) {
    for (let col=-3;col<=3;col++) {
      const ox=(row%2)*0.87*1.04;
      const x=col*1.75+ox, z=row*1.52;
      const hx=new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.2, 6), hexMat);
      hx.position.set(x,0,z); hx.rotation.y=Math.PI/6;
      group.add(hx);
    }
  }
  [[0,2,0],[4,1.8,2],[-4,2,-2]].forEach(([x,y,z])=>{
    const bee = new THREE.Mesh(new THREE.SphereGeometry(0.4, 16, 16), bodyMat);
    bee.scale.set(1, 1.6, 1); bee.position.set(x, y, z);
    bee.userData = { oy: y, off: Math.random()*Math.PI*2 };
    group.add(bee);
  });
  scene.add(group);
  return { scene, animate: (t) => { 
    group.rotation.y=t*0.15; 
    group.children.forEach(c => { if (c.userData.oy) { c.position.y = c.userData.oy + Math.sin(t*2 + c.userData.off)*0.3; }});
  }};
}

/* ─────────────────────────────────
   8. Algae
───────────────────────────────── */
function buildAlgae() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000804);
  makeLights(scene, 0x001a10, 0.8, 0x66ffcc, 1.4);
  scene.add(makeStars(250, 45));

  const group = new THREE.Group();
  const colors=[0x10b981,0x06b6d4,0x34d399,0x22d3ee,0x6ee7b7];
  for (let s=0;s<5;s++) {
    const pts=[], off=(s/5)*Math.PI*2, r=1.8+s*0.9;
    for (let i=0;i<60;i++) {
      const t=(i/59)*Math.PI*8+off;
      pts.push(new THREE.Vector3(Math.cos(t)*r, (i/59)*16-8, Math.sin(t)*r));
    }
    const mat=new THREE.MeshPhysicalMaterial({ color: colors[s % colors.length], emissive: 0x003322, roughness: 0.2, transmission: 0.3 });
    const tube=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 150, 0.1, 8, false), mat);
    group.add(tube);
  }
  scene.add(group);
  return { scene, animate: (t) => { group.rotation.y=t*0.2; group.rotation.x=Math.sin(t*0.15)*0.1; } };
}

/* ─────────────────────────────────
   9. Mycology
───────────────────────────────── */
function buildMycology() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x060200);
  makeLights(scene, 0x1a0800, 0.8, 0xff9955, 1.5);
  scene.add(makeStars(200, 45));

  const group = new THREE.Group();
  const capMat = new THREE.MeshPhysicalMaterial({ color: 0xf97316, emissive: 0x551a00, roughness: 0.6, sheen: 1.0 });
  const stemMat = new THREE.MeshPhysicalMaterial({ color: 0xfef9c3, emissive: 0x221a00, roughness: 0.7 });

  function addMushroom(cx,cz,sc,mat) {
    const stem=new THREE.Mesh(new THREE.CylinderGeometry(0.14*sc, 0.2*sc, 1.6*sc, 16), stemMat);
    stem.position.set(cx, -2 + 0.8*sc, cz);
    const cap=new THREE.Mesh(new THREE.SphereGeometry(0.85*sc, 24, 12, 0, Math.PI*2, 0, Math.PI*0.7), mat);
    cap.position.set(cx, -2 + 1.6*sc, cz); cap.rotation.x=Math.PI;
    group.add(stem,cap);
  }
  addMushroom(0,0,2.5,capMat);
  addMushroom(-3.5,1.8,1.6,capMat);
  addMushroom(3.2,-1.2,1.8,capMat);
  scene.add(group);
  return { scene, animate: (t) => { group.rotation.y=t*0.15; } };
}

/* ─────────────────────────────────
   10. Immunology
───────────────────────────────── */
function buildImmunology() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x010104);
  makeLights(scene, 0x0a0020, 0.9, 0xccbbff, 1.6);
  scene.add(makeStars(300, 50));

  const group = new THREE.Group();
  const bcMat = new THREE.MeshPhysicalMaterial({ color: 0x2563eb, emissive: 0x1e3a8a, roughness: 0.2, transmission: 0.5, thickness: 1.0 });
  const bCell = new THREE.Group();
  bCell.add(new THREE.Mesh(new THREE.SphereGeometry(2, 32, 32), bcMat));
  group.add(bCell);

  const abs=[];
  const abMat = new THREE.MeshPhysicalMaterial({ color: 0x7c3aed, emissive: 0x4c1d95, roughness: 0.1, clearcoat: 1.0 });
  for (let i=0;i<8;i++) {
    const a=(i/8)*Math.PI*2;
    const r=4.5;
    const ab=new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 2, 12), abMat);
    ab.position.set(Math.cos(a)*r, (Math.random()-.5)*3, Math.sin(a)*r);
    ab.userData={orbitAngle:a, orbitR:r, orbitSpeed:0.12};
    group.add(ab);
    abs.push(ab);
  }
  scene.add(group);
  return { scene, animate: (t) => {
    bCell.rotation.y=t*0.2;
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
  buildDNA, buildHistology, buildEmbryology, buildPlant, buildParasitology, 
  buildHematology, buildMicrobiology, buildEntomology, buildAlgae, buildMycology, buildImmunology
];
