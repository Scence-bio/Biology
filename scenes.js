/* ══════════════════════════════════════════
   BioGuide 3D — scenes.js (Universal High-Performance Version)
   Optimized for Mobile, Tablet, and Desktop.
   Balanced visual quality with cross-device compatibility.
══════════════════════════════════════════ */

/* ── Global Device Detection & Settings ── */
const IS_MOBILE = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const QUALITY = IS_MOBILE ? 0.6 : 1.0; // Dynamic quality multiplier

/* ── Shared helpers ── */
function makeStars(n, spread) {
  const count = Math.floor(n * QUALITY);
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pos[i*3]   = (Math.random()-.5)*spread;
    pos[i*3+1] = (Math.random()-.5)*spread;
    pos[i*3+2] = (Math.random()-.5)*spread*.5 - spread*.15;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  return new THREE.Points(geo, new THREE.PointsMaterial({ 
    color: 0xffffff, size: IS_MOBILE ? 0.04 : 0.02, transparent: true, opacity: 0.5, sizeAttenuation: true 
  }));
}

function makeLights(scene, ambCol, ambInt, dirCol, dirInt) {
  scene.add(new THREE.AmbientLight(ambCol, ambInt));
  const d = new THREE.DirectionalLight(dirCol, dirInt);
  d.position.set(10, 15, 10);
  
  // Disable shadows on mobile for maximum performance
  if (!IS_MOBILE) {
    d.castShadow = true;
    d.shadow.mapSize.set(512, 512);
    d.shadow.bias = -0.001;
  }
  scene.add(d);
  
  const r = new THREE.PointLight(0xffffff, 1.2, 30);
  r.position.set(-8, 4, -8);
  scene.add(r);

  // Soft environmental light
  scene.add(new THREE.HemisphereLight(0xffffff, 0x000000, 0.4));
}

/* ── Optimized Materials Factory ── */
function getMaterial(color, emissive = 0x000000, transparent = false, opacity = 1.0) {
  // Use MeshPhongMaterial for better mobile performance instead of Physical
  return new THREE.MeshPhongMaterial({
    color: color,
    emissive: emissive,
    transparent: transparent,
    opacity: opacity,
    shininess: 60
  });
}

/* ─────────────────────────────────
   0. DNA Double Helix
───────────────────────────────── */
function buildDNA() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x010408);
  makeLights(scene, 0x0a0c1a, 0.8, 0x00d4ff, 1.2);
  scene.add(makeStars(200, 50));

  const group = new THREE.Group();
  const N = IS_MOBILE ? 60 : 100;
  const s1pts = [], s2pts = [];
  for (let i = 0; i < N; i++) {
    const t = (i/(N-1)) * Math.PI * 8;
    const y = (i/(N-1)) * 18 - 9;
    s1pts.push(new THREE.Vector3(Math.cos(t)*2.8, y, Math.sin(t)*2.8));
    s2pts.push(new THREE.Vector3(Math.cos(t+Math.PI)*2.8, y, Math.sin(t+Math.PI)*2.8));
  }
  const c1 = new THREE.CatmullRomCurve3(s1pts);
  const c2 = new THREE.CatmullRomCurve3(s2pts);
  
  const m1 = getMaterial(0x00d4ff, 0x001122);
  const m2 = getMaterial(0x7c3aed, 0x110033);
  
  const tubeGeo = new THREE.TubeGeometry(c1, IS_MOBILE ? 80 : 140, 0.12, 6, false);
  group.add(new THREE.Mesh(tubeGeo, m1));
  group.add(new THREE.Mesh(new THREE.TubeGeometry(c2, IS_MOBILE ? 80 : 140, 0.12, 6, false), m2));

  const atomGeo = new THREE.SphereGeometry(0.2, 12, 12);
  const RUNGS = IS_MOBILE ? 16 : 24;
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
  makeLights(scene, 0x1a0033, 0.8, 0xff99cc, 1.2);
  scene.add(makeStars(150, 40));

  const group = new THREE.Group();
  const cellMat = getMaterial(0xfce7f3, 0x000000, true, 0.25);
  const nucMat = getMaterial(0xdb2777, 0x550022);
  
  const hexGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.15, 6);
  const nucGeo = new THREE.SphereGeometry(0.16, 8, 8);
  const rows = IS_MOBILE ? 5 : 7, cols = IS_MOBILE ? 6 : 8, r = 0.5;
  for (let row=0; row<rows; row++) {
    for (let col=0; col<cols; col++) {
      const ox=(row%2)*r*0.87;
      const x = col*r*1.74 - cols*r*0.85 + ox;
      const z = row*r*1.52 - rows*r*0.75;
      const cell = new THREE.Mesh(hexGeo, cellMat);
      cell.position.set(x, 0, z); cell.rotation.y = Math.PI/6;
      const nuc = new THREE.Mesh(nucGeo, nucMat); nuc.position.set(x, 0.05, z);
      group.add(cell, nuc);
    }
  }
  scene.add(group);
  return { scene, animate: (t) => { group.rotation.y = t*0.1; group.position.y = Math.sin(t*0.4)*0.2; } };
}

/* ─────────────────────────────────
   2. Embryology
───────────────────────────────── */
function buildEmbryology() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x080103);
  makeLights(scene, 0x1a0a00, 0.8, 0xffcc88, 1.2);
  scene.add(makeStars(150, 40));

  const group = new THREE.Group();
  const bMat = getMaterial(0xfde68a, 0x331100, true, 0.85);
  const bGeo = new THREE.SphereGeometry(0.55, 12, 12);
  const COUNT = IS_MOBILE ? 20 : 32;
  for (let i=0; i<COUNT; i++) {
    const phi=Math.acos(-1+(2*i)/COUNT), theta=Math.sqrt(COUNT*Math.PI)*phi;
    const r=3.2;
    const b = new THREE.Mesh(bGeo, bMat);
    b.position.set(r*Math.sin(phi)*Math.cos(theta), r*Math.cos(phi), r*Math.sin(phi)*Math.sin(theta));
    group.add(b);
  }
  const icmMat = getMaterial(0xf472b6, 0x440022);
  for (let i=0; i<8; i++) {
    const ang=(i/8)*Math.PI*2;
    const icm=new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 8), icmMat);
    icm.position.set(Math.cos(ang)*1, Math.sin(ang*0.7)*0.5, Math.sin(ang)*1);
    group.add(icm);
  }
  scene.add(group);
  return { scene, animate: (t) => { group.rotation.y=t*0.18; group.rotation.x=Math.sin(t*0.1)*0.1; } };
}

/* ─────────────────────────────────
   3. Plant Anatomy
───────────────────────────────── */
function buildPlant() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000401);
  makeLights(scene, 0x001a06, 0.8, 0x88ffaa, 1.2);
  scene.add(makeStars(150, 40));

  const group = new THREE.Group();
  const stemMat = getMaterial(0x22c55e, 0x0a2d10);
  const leafMat = getMaterial(0x86efac, 0x000000, true, 0.7);

  function branch(startPt, dir, len, radius, depth) {
    if (depth < 0 || len < 0.25) return;
    const endPt = startPt.clone().add(dir.clone().multiplyScalar(len));
    const mid = startPt.clone().add(endPt).multiplyScalar(0.5);
    const cyl = new THREE.Mesh(new THREE.CylinderGeometry(radius*0.7, radius, len, 6), stemMat);
    cyl.position.copy(mid);
    cyl.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), dir.clone().normalize());
    group.add(cyl);
    if (depth <= 1) {
      const leafGeo = new THREE.SphereGeometry(0.45, 6, 2); leafGeo.scale(1, 0.05, 1.8);
      const leaf = new THREE.Mesh(leafGeo, leafMat);
      leaf.position.copy(endPt);
      leaf.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI);
      group.add(leaf);
    }
    if (depth > 0) {
      const spread = 0.5 + depth*0.1;
      for (let b=0; b<2; b++) {
        const newDir = dir.clone().applyEuler(new THREE.Euler((Math.random()-.5)*spread, (Math.random()-.5)*spread, (Math.random()-.5)*spread*0.5));
        branch(endPt, newDir, len*0.72, radius*0.7, depth-1);
      }
    }
  }
  branch(new THREE.Vector3(0,-5,0), new THREE.Vector3(0,1,0.05), 3.5, 0.22, IS_MOBILE ? 2 : 3);
  scene.add(group);
  return { scene, animate: (t) => { group.rotation.y=t*0.15; group.rotation.z=Math.sin(t*0.2)*0.04; } };
}

/* ─────────────────────────────────
   4. Parasitology
───────────────────────────────── */
function buildParasitology() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x040300);
  makeLights(scene, 0x1a1400, 0.8, 0xffea88, 1.2);
  scene.add(makeStars(150, 40));

  const group = new THREE.Group();
  const segMat = getMaterial(0xfef08a, 0x332200);
  const headMat = getMaterial(0xfacc15, 0x553300);
  const N = IS_MOBILE ? 25 : 40;
  for (let i=0; i<N; i++) {
    const f=i/(N-1);
    const t=f*Math.PI*6;
    const y=f*14-7;
    const r=2.2+Math.sin(f*Math.PI)*1.5;
    const sz = i===0 ? 1.4 : 0.7+Math.sin(i*0.8)*0.15;
    const seg=new THREE.Mesh(new THREE.SphereGeometry(sz*0.42, 10, 10), i===0?headMat:segMat);
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
  makeLights(scene, 0x1a0000, 0.7, 0xff5555, 1.2);
  scene.add(makeStars(150, 40));

  const group = new THREE.Group();
  const rbcMat = getMaterial(0xdc2626, 0x550000);
  const wbcMat = getMaterial(0xf8fafc, 0x222233);
  const rbcGeo = new THREE.TorusGeometry(0.5, 0.25, 6, 12); rbcGeo.scale(1, 1, 0.4);

  const COUNT = IS_MOBILE ? 15 : 25;
  for (let i=0; i<COUNT; i++) {
    const rbc=new THREE.Mesh(rbcGeo, rbcMat);
    rbc.position.set((Math.random()-.5)*14, (Math.random()-.5)*10, (Math.random()-.5)*5);
    rbc.rotation.set(Math.random()*Math.PI,Math.random()*Math.PI,Math.random()*Math.PI);
    rbc.userData={ox:rbc.position.x, oy:rbc.position.y, oz:rbc.position.z, off:Math.random()*Math.PI*2, sp:0.2+Math.random()*0.2};
    group.add(rbc);
  }
  const wbc=new THREE.Mesh(new THREE.SphereGeometry(1.4, 16, 16), wbcMat);
  wbc.position.set(1,1,0); group.add(wbc);
  scene.add(group);
  return { scene, animate: (t) => {
    group.rotation.y=t*0.1;
    wbc.rotation.y=t*0.4;
    group.children.forEach(c=>{ if(c.userData.ox!==undefined){ c.position.y=c.userData.oy+Math.sin(t*c.userData.sp+c.userData.off)*0.5; }});
  }};
}

/* ─────────────────────────────────
   6. Microbiology — UNIVERSAL OPTIMIZED
───────────────────────────────── */
function buildMicrobiology() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x010504);
  makeLights(scene, 0x001a15, 0.8, 0x88ffdd, 1.2);
  scene.add(makeStars(150, 40));

  const group = new THREE.Group();
  const bactMat = getMaterial(0x14b8a6, 0x003322);
  const virMat = getMaterial(0xef4444, 0x550000);

  const bactGeo = new THREE.CapsuleGeometry(0.3, 0.7, 4, 12);
  const bactPositions = IS_MOBILE ? [[-3,1,1],[-2,-2,-1],[2,2,1],[1,-2,0]] : [[-4,1,1],[-3,-2,-1],[-5,-1,-2],[3,3,1],[1,-3,0],[-2,2,-1],[4,1,-1],[-1,4,1]];
  bactPositions.forEach(([x,y,z], idx)=>{
    const bact=new THREE.Mesh(bactGeo, bactMat);
    bact.position.set(x,y,z);
    bact.rotation.set(Math.random()*0.8,Math.random()*Math.PI,Math.random()*0.5);
    bact.userData={orig:[x,y,z], off:idx*0.8};
    group.add(bact);
  });

  const virus=new THREE.Group();
  virus.add(new THREE.Mesh(new THREE.IcosahedronGeometry(1.5, IS_MOBILE ? 1 : 2), virMat));
  const spkGeo = new THREE.CylinderGeometry(0.05, 0.1, 0.5, 6);
  const spkCount = IS_MOBILE ? 12 : 20;
  for (let i=0; i<spkCount; i++) {
    const phi=Math.acos(-1+(2*i)/spkCount), th=Math.sqrt(spkCount*Math.PI)*phi;
    const dir=new THREE.Vector3(Math.sin(phi)*Math.cos(th),Math.cos(phi),Math.sin(phi)*Math.sin(th));
    const sp=new THREE.Mesh(spkGeo, virMat);
    sp.position.copy(dir.clone().multiplyScalar(1.6));
    sp.lookAt(dir.clone().multiplyScalar(4));
    sp.rotation.x += Math.PI/2;
    virus.add(sp);
  }
  group.add(virus);
  scene.add(group);
  return { scene, animate: (t) => {
    group.rotation.y=t*0.12;
    virus.rotation.y=t*0.35; virus.rotation.x=t*0.2;
    group.children.forEach(c=>{ if(c.userData.off!==undefined){ c.position.y=c.userData.orig[1]+Math.sin(t*0.4+c.userData.off)*0.3; }});
  }};
}

/* ─────────────────────────────────
   7. Entomology
───────────────────────────────── */
function buildEntomology() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x060400);
  makeLights(scene, 0x1a1000, 0.8, 0xffd544, 1.2);
  scene.add(makeStars(150, 40));

  const group = new THREE.Group();
  const hexMat = getMaterial(0xf59e0b, 0x000000, true, 0.35);
  const bodyMat = getMaterial(0x78350f, 0x221100);

  const r_limit = IS_MOBILE ? 1 : 2;
  const c_limit = IS_MOBILE ? 2 : 3;
  for (let row=-r_limit;row<=r_limit;row++) {
    for (let col=-c_limit;col<=c_limit;col++) {
      const ox=(row%2)*0.87*1.04;
      const x=col*1.75+ox, z=row*1.52;
      const hx=new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.15, 6), hexMat);
      hx.position.set(x,0,z); hx.rotation.y=Math.PI/6;
      group.add(hx);
    }
  }
  [[0,1.8,0],[3,1.5,2]].forEach(([x,y,z])=>{
    const bee = new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 12), bodyMat);
    bee.scale.set(1, 1.6, 1); bee.position.set(x, y, z);
    bee.userData = { oy: y, off: Math.random()*Math.PI*2 };
    group.add(bee);
  });
  scene.add(group);
  return { scene, animate: (t) => { 
    group.rotation.y=t*0.12; 
    group.children.forEach(c => { if (c.userData.oy) { c.position.y = c.userData.oy + Math.sin(t*2 + c.userData.off)*0.2; }});
  }};
}

/* ─────────────────────────────────
   8. Algae
───────────────────────────────── */
function buildAlgae() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000804);
  makeLights(scene, 0x001a10, 0.8, 0x66ffcc, 1.2);
  scene.add(makeStars(150, 40));

  const group = new THREE.Group();
  const colors=[0x10b981,0x06b6d4,0x34d399,0x22d3ee,0x6ee7b7];
  const s_count = IS_MOBILE ? 3 : 5;
  for (let s=0;s<s_count;s++) {
    const pts=[], off=(s/s_count)*Math.PI*2, r=1.8+s*0.8;
    for (let i=0;i<50;i++) {
      const t=(i/49)*Math.PI*8+off;
      pts.push(new THREE.Vector3(Math.cos(t)*r, (i/49)*14-7, Math.sin(t)*r));
    }
    const mat = getMaterial(colors[s % colors.length], 0x002211, true, 0.85);
    const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), IS_MOBILE ? 60 : 120, 0.09, 6, false), mat);
    group.add(tube);
  }
  scene.add(group);
  return { scene, animate: (t) => { group.rotation.y=t*0.18; group.rotation.x=Math.sin(t*0.1)*0.08; } };
}

/* ─────────────────────────────────
   9. Mycology
───────────────────────────────── */
function buildMycology() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x060200);
  makeLights(scene, 0x1a0800, 0.8, 0xff9955, 1.2);
  scene.add(makeStars(150, 40));

  const group = new THREE.Group();
  const capMat = getMaterial(0xf97316, 0x331100);
  const stemMat = getMaterial(0xfef9c3, 0x111100);

  function addMushroom(cx,cz,sc,mat) {
    const stem=new THREE.Mesh(new THREE.CylinderGeometry(0.12*sc, 0.18*sc, 1.5*sc, 12), stemMat);
    stem.position.set(cx, -1.8 + 0.7*sc, cz);
    const cap=new THREE.Mesh(new THREE.SphereGeometry(0.8*sc, 16, 10, 0, Math.PI*2, 0, Math.PI*0.7), mat);
    cap.position.set(cx, -1.8 + 1.4*sc, cz); cap.rotation.x=Math.PI;
    group.add(stem,cap);
  }
  addMushroom(0,0,2.2,capMat);
  addMushroom(-3,1.5,1.4,capMat);
  if (!IS_MOBILE) addMushroom(3,-1,1.6,capMat);
  scene.add(group);
  return { scene, animate: (t) => { group.rotation.y=t*0.12; } };
}

/* ─────────────────────────────────
   10. Immunology
───────────────────────────────── */
function buildImmunology() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x010104);
  makeLights(scene, 0x0a0020, 0.9, 0xccbbff, 1.2);
  scene.add(makeStars(200, 45));

  const group = new THREE.Group();
  const bcMat = getMaterial(0x2563eb, 0x112255, true, 0.85);
  const bCell = new THREE.Group();
  bCell.add(new THREE.Mesh(new THREE.SphereGeometry(1.8, 24, 24), bcMat));
  group.add(bCell);

  const abs=[];
  const abMat = getMaterial(0x7c3aed, 0x331144);
  const abCount = IS_MOBILE ? 5 : 8;
  for (let i=0;i<abCount;i++) {
    const a=(i/abCount)*Math.PI*2;
    const r=4.2;
    const ab=new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.8, 8), abMat);
    ab.position.set(Math.cos(a)*r, (Math.random()-.5)*2.5, Math.sin(a)*r);
    ab.userData={orbitAngle:a, orbitR:r, orbitSpeed:0.1};
    group.add(ab);
    abs.push(ab);
  }
  scene.add(group);
  return { scene, animate: (t) => {
    bCell.rotation.y=t*0.15;
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
