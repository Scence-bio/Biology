/* ══════════════════════════════════════════
   BioGuide 3D — scenes.js
   All Three.js scene builders
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
  return new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.04, transparent: true, opacity: .55 }));
}

function makeLights(scene, ambCol, ambInt, dirCol, dirInt) {
  scene.add(new THREE.AmbientLight(ambCol, ambInt));
  const d = new THREE.DirectionalLight(dirCol, dirInt);
  d.position.set(5, 8, 5);
  scene.add(d);
  const r = new THREE.PointLight(0x4488ff, .6, 30);
  r.position.set(-6, -3, -4);
  scene.add(r);
}

/* ─────────────────────────────────
   0. DNA Double Helix
───────────────────────────────── */
function buildDNA() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x020b18);
  makeLights(scene, 0x0a1a33, .8, 0x5bc8ff, 1.2);
  scene.add(makeStars(200, 40));

  const group = new THREE.Group();
  const N = 80;
  const s1pts = [], s2pts = [];
  for (let i = 0; i < N; i++) {
    const t = (i/(N-1)) * Math.PI * 7;
    const y = (i/(N-1)) * 16 - 8;
    s1pts.push(new THREE.Vector3(Math.cos(t)*2.8, y, Math.sin(t)*2.8));
    s2pts.push(new THREE.Vector3(Math.cos(t+Math.PI)*2.8, y, Math.sin(t+Math.PI)*2.8));
  }
  const c1 = new THREE.CatmullRomCurve3(s1pts);
  const c2 = new THREE.CatmullRomCurve3(s2pts);
  const m1 = new THREE.MeshPhongMaterial({ color:0x00d4ff, emissive:0x002244, shininess:100 });
  const m2 = new THREE.MeshPhongMaterial({ color:0x7c3aed, emissive:0x1a0055, shininess:100 });
  group.add(new THREE.Mesh(new THREE.TubeGeometry(c1,240,.11,8,false), m1));
  group.add(new THREE.Mesh(new THREE.TubeGeometry(c2,240,.11,8,false), m2));

  const rungMat = new THREE.MeshPhongMaterial({ color:0x4af0ff, transparent:true, opacity:.6, shininess:60 });
  const atomM1  = new THREE.MeshPhongMaterial({ color:0x00ffcc, emissive:0x003322, shininess:120 });
  const atomM2  = new THREE.MeshPhongMaterial({ color:0xcc44ff, emissive:0x220033, shininess:120 });
  const atomGeo = new THREE.SphereGeometry(.2, 10, 10);
  const RUNGS = 18;
  const upAxis = new THREE.Vector3(0,1,0);
  for (let i = 0; i < RUNGS; i++) {
    const f = i/(RUNGS-1);
    const p1 = c1.getPoint(f), p2 = c2.getPoint(f);
    const mid = p1.clone().add(p2).multiplyScalar(.5);
    const dist = p1.distanceTo(p2);
    const dir = p2.clone().sub(p1).normalize();
    const rg = new THREE.CylinderGeometry(.045,.045,dist,6);
    const rm = new THREE.Mesh(rg, rungMat);
    rm.position.copy(mid);
    rm.quaternion.setFromUnitVectors(upAxis, dir);
    group.add(rm);
    const a1 = new THREE.Mesh(atomGeo, atomM1); a1.position.copy(p1); group.add(a1);
    const a2 = new THREE.Mesh(atomGeo, atomM2); a2.position.copy(p2); group.add(a2);
  }
  scene.add(group);
  return { scene, animate: (t) => { group.rotation.y = t * .28; group.rotation.x = Math.sin(t*.12)*.06; } };
}

/* ─────────────────────────────────
   1. Histology — Hexagonal cell tissue
───────────────────────────────── */
function buildHistology() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0318);
  makeLights(scene, 0x1a0033, .7, 0xff99cc, 1.1);
  scene.add(makeStars(150, 35));

  const group = new THREE.Group();
  const cellMat = new THREE.MeshPhongMaterial({ color:0xfce7f3, transparent:true, opacity:.2, shininess:30 });
  const wireMat = new THREE.MeshPhongMaterial({ color:0xf472b6, wireframe:true, transparent:true, opacity:.35 });
  const nucMat  = new THREE.MeshPhongMaterial({ color:0xdb2777, emissive:0x500010, shininess:120 });
  const hexGeo  = new THREE.CylinderGeometry(.52,.52,.18,6);
  const nucGeo  = new THREE.SphereGeometry(.17,10,10);
  const rows=7, cols=8, r=.52;
  for (let row=0; row<rows; row++) {
    for (let col=0; col<cols; col++) {
      const ox=(row%2)*r*.87;
      const x = col*r*1.74 - cols*r*.85 + ox;
      const z = row*r*1.52 - rows*r*.75;
      const cell = new THREE.Mesh(hexGeo, cellMat);
      cell.position.set(x,0,z); cell.rotation.y=Math.PI/6;
      const wire = new THREE.Mesh(new THREE.CylinderGeometry(.53,.53,.2,6), wireMat);
      wire.position.set(x,0,z); wire.rotation.y=Math.PI/6;
      const nuc = new THREE.Mesh(nucGeo, nucMat); nuc.position.set(x,.04,z);
      group.add(cell, wire, nuc);
    }
  }
  scene.add(group);
  return { scene, animate: (t) => { group.rotation.y=t*.12; group.position.y=Math.sin(t*.4)*.25; } };
}

/* ─────────────────────────────────
   2. Embryology — Blastocyst
───────────────────────────────── */
function buildEmbryology() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0f0308);
  makeLights(scene, 0x1a0a00, .6, 0xffd080, 1.2);
  scene.add(makeStars(120, 30));

  const group = new THREE.Group();
  group.add(new THREE.Mesh(new THREE.SphereGeometry(3.8,32,32),
    new THREE.MeshPhongMaterial({ color:0xfbbf24, transparent:true, opacity:.07, shininess:200, side:THREE.DoubleSide })));
  group.add(new THREE.Mesh(new THREE.SphereGeometry(3.8,20,20),
    new THREE.MeshPhongMaterial({ color:0xfcd34d, wireframe:true, transparent:true, opacity:.18 })));

  const bMat = new THREE.MeshPhongMaterial({ color:0xfde68a, emissive:0x3d1500, shininess:70, transparent:true, opacity:.9 });
  const bGeo = new THREE.SphereGeometry(.58,12,12);
  for (let i=0; i<28; i++) {
    const phi=Math.acos(-1+(2*i)/28), theta=Math.sqrt(28*Math.PI)*phi;
    const r=3.3;
    const b = new THREE.Mesh(bGeo, bMat);
    b.position.set(r*Math.sin(phi)*Math.cos(theta), r*Math.cos(phi), r*Math.sin(phi)*Math.sin(theta));
    group.add(b);
  }
  const icmMat = new THREE.MeshPhongMaterial({ color:0xf472b6, emissive:0x3d0025, shininess:90 });
  for (let i=0; i<10; i++) {
    const ang=(i/10)*Math.PI*2;
    const icm=new THREE.Mesh(new THREE.SphereGeometry(.28,8,8), icmMat);
    icm.position.set(Math.cos(ang)*.9, Math.sin(ang*.7)*.5, Math.sin(ang)*.9);
    group.add(icm);
  }
  scene.add(group);
  return { scene, animate: (t) => { group.rotation.y=t*.18; group.rotation.x=Math.sin(t*.09)*.12; } };
}

/* ─────────────────────────────────
   3. Plant Anatomy — Branching vascular
───────────────────────────────── */
function buildPlant() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x010e03);
  makeLights(scene, 0x001a06, .6, 0x88ff88, 1.1);
  scene.add(makeStars(100, 30));

  const group = new THREE.Group();
  const stemMat = new THREE.MeshPhongMaterial({ color:0x22c55e, emissive:0x0a2d10, shininess:60 });
  const leafMat = new THREE.MeshPhongMaterial({ color:0x86efac, transparent:true, opacity:.7, side:THREE.DoubleSide, shininess:30 });
  const chlMat  = new THREE.MeshPhongMaterial({ color:0x16a34a, emissive:0x052210, shininess:80 });

  function branch(startPt, dir, len, radius, depth) {
    if (depth < 0 || len < .2) return;
    const endPt = startPt.clone().add(dir.clone().multiplyScalar(len));
    const mid = startPt.clone().add(endPt).multiplyScalar(.5);
    const cyl = new THREE.Mesh(new THREE.CylinderGeometry(radius*.7,radius,len,8), stemMat);
    cyl.position.copy(mid);
    cyl.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), dir.clone().normalize());
    group.add(cyl);
    if (depth <= 1) {
      const leaf = new THREE.Mesh(new THREE.PlaneGeometry(.8+Math.random()*.4, .4+Math.random()*.3), leafMat);
      leaf.position.copy(endPt);
      leaf.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI);
      group.add(leaf);
      for (let i=0; i<3; i++) {
        const ch = new THREE.Mesh(new THREE.SphereGeometry(.04,6,6), chlMat);
        ch.position.set(endPt.x+(Math.random()-.5)*.3, endPt.y+(Math.random()-.5)*.3, endPt.z+(Math.random()-.5)*.3);
        group.add(ch);
      }
    }
    if (depth > 0) {
      const spread = .6 + depth*.1;
      for (let b=0; b<2; b++) {
        const newDir = dir.clone().applyEuler(new THREE.Euler(
          (Math.random()-.5)*spread, (Math.random()-.5)*spread, (Math.random()-.5)*spread*.5));
        branch(endPt, newDir, len*.72, radius*.68, depth-1);
      }
    }
  }
  branch(new THREE.Vector3(0,-5,0), new THREE.Vector3(0,1,.05), 3.5, .22, 3);
  scene.add(group);
  return { scene, animate: (t) => { group.rotation.y=t*.15; group.rotation.z=Math.sin(t*.25)*.04; } };
}

/* ─────────────────────────────────
   4. Parasitology — Segmented worm
───────────────────────────────── */
function buildParasitology() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x080600);
  makeLights(scene, 0x1a1400, .6, 0xffee88, 1.0);
  scene.add(makeStars(120, 30));

  const group = new THREE.Group();
  const segMat  = new THREE.MeshPhongMaterial({ color:0xfef08a, emissive:0x2d2200, shininess:60 });
  const headMat = new THREE.MeshPhongMaterial({ color:0xfacc15, emissive:0x3d2800, shininess:100 });
  const hookMat = new THREE.MeshPhongMaterial({ color:0x65a30d, emissive:0x0a1400, shininess:80 });
  const N=36;
  for (let i=0; i<N; i++) {
    const f=i/(N-1);
    const t=f*Math.PI*5;
    const y=f*14-7;
    const r=2.2+Math.sin(f*Math.PI)*1.2;
    const sz = i===0 ? 1.4 : .7+Math.sin(i*.8)*.15;
    const seg=new THREE.Mesh(new THREE.SphereGeometry(sz*.42,12,12), i===0?headMat:segMat);
    seg.position.set(Math.cos(t)*r, y, Math.sin(t)*r);
    seg.scale.set(1,.7,1);
    group.add(seg);
    if (i===0) {
      for (let h=0; h<6; h++) {
        const ha=(h/6)*Math.PI*2;
        const hook=new THREE.Mesh(new THREE.ConeGeometry(.07,.3,4), hookMat);
        hook.position.set(seg.position.x+Math.cos(ha)*.5, seg.position.y, seg.position.z+Math.sin(ha)*.5);
        group.add(hook);
      }
    }
  }
  scene.add(group);
  return { scene, animate: (t) => { group.rotation.y=t*.2; group.rotation.x=Math.sin(t*.18)*.1; } };
}

/* ─────────────────────────────────
   5. Hematology — Blood cells
───────────────────────────────── */
function buildHematology() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0f0203);
  makeLights(scene, 0x1a0000, .5, 0xff6666, 1.2);
  scene.add(makeStars(100, 30));

  const group = new THREE.Group();
  const rbcMat = new THREE.MeshPhongMaterial({ color:0xdc2626, emissive:0x3d0000, shininess:80 });
  const wbcMat = new THREE.MeshPhongMaterial({ color:0xf1f5f9, emissive:0x111111, transparent:true, opacity:.85, shininess:60 });
  const platMat= new THREE.MeshPhongMaterial({ color:0xfca5a5, emissive:0x1a0000, shininess:40 });

  for (let i=0; i<22; i++) {
    const rbc=new THREE.Mesh(new THREE.SphereGeometry(.75,16,12), rbcMat);
    rbc.scale.set(1,.22,1);
    rbc.position.set((Math.random()-.5)*14, (Math.random()-.5)*8, (Math.random()-.5)*5);
    rbc.rotation.set(Math.random()*Math.PI,Math.random()*Math.PI,Math.random()*Math.PI);
    rbc.userData={ox:(Math.random()-.5)*14,oy:(Math.random()-.5)*8,oz:(Math.random()-.5)*5,off:Math.random()*Math.PI*2,sp:.2+Math.random()*.2};
    group.add(rbc);
  }
  const wbc=new THREE.Mesh(new THREE.SphereGeometry(1.4,24,24), wbcMat);
  const spkMat=new THREE.MeshPhongMaterial({color:0xe2e8f0,shininess:40});
  for (let s=0; s<16; s++) {
    const phi=Math.acos(-1+(2*s)/16), th=Math.sqrt(16*Math.PI)*phi;
    const sp=new THREE.Mesh(new THREE.ConeGeometry(.07,.4,4), spkMat);
    const dir=new THREE.Vector3(Math.sin(phi)*Math.cos(th),Math.cos(phi),Math.sin(phi)*Math.sin(th));
    sp.position.copy(dir.clone().multiplyScalar(1.5));
    sp.lookAt(dir.clone().multiplyScalar(4));
    wbc.add(sp);
  }
  wbc.position.set(1,1,0); group.add(wbc);
  for (let p=0; p<8; p++) {
    const pl=new THREE.Mesh(new THREE.SphereGeometry(.25,8,8), platMat);
    pl.scale.set(1,.35,1);
    pl.position.set((Math.random()-.5)*10,(Math.random()-.5)*7,(Math.random()-.5)*4);
    group.add(pl);
  }
  scene.add(group);
  return { scene, animate: (t) => {
    group.rotation.y=t*.1;
    wbc.rotation.y=t*.3; wbc.rotation.x=t*.15;
    group.children.forEach(c=>{ if(c.userData.ox!==undefined){ c.position.y=c.userData.oy+Math.sin(t*c.userData.sp+c.userData.off)*.4; }});
  }};
}

/* ─────────────────────────────────
   6. Microbiology — Bacteria + Virus
───────────────────────────────── */
function buildMicrobiology() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x020f0c);
  makeLights(scene, 0x001a15, .6, 0x55ffdd, 1.1);
  scene.add(makeStars(150, 35));

  const group = new THREE.Group();
  const bactMat = new THREE.MeshPhongMaterial({ color:0x14b8a6, emissive:0x003322, shininess:70 });
  const virMat  = new THREE.MeshPhongMaterial({ color:0xef4444, emissive:0x440000, shininess:90 });
  const spkMat  = new THREE.MeshPhongMaterial({ color:0xfca5a5, emissive:0x2a0000, shininess:60 });
  const flgMat  = new THREE.LineBasicMaterial({ color:0x5eead4 });

  const bactPositions=[
    [-4,.5,1],[-3,-2,-1],[-5.5,-1,-2],[2.5,2.5,.5],[1,-3,0],[-2.5,2,-1],[3.5,.5,-1],[-1,3.5,1]
  ];
  bactPositions.forEach(([x,y,z], idx)=>{
    const bact=new THREE.Mesh(new THREE.SphereGeometry(.38,10,10), bactMat);
    bact.scale.set(1,2.2,1);
    bact.position.set(x,y,z);
    bact.rotation.set(Math.random()*.8,Math.random()*Math.PI,Math.random()*.5);
    bact.userData={orig:[x,y,z], off:idx*.7};
    group.add(bact);
    const pts=[];
    for (let f=0;f<12;f++) pts.push(new THREE.Vector3(f*.28, Math.sin(f*.9)*.22,0));
    const fl=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), flgMat);
    fl.position.set(x,y-.8,z); fl.rotation.copy(bact.rotation);
    group.add(fl);
  });

  const virus=new THREE.Group();
  virus.add(new THREE.Mesh(new THREE.SphereGeometry(1.6,20,20), virMat));
  for (let i=0;i<24;i++) {
    const phi=Math.acos(-1+(2*i)/24), th=Math.sqrt(24*Math.PI)*phi;
    const dir=new THREE.Vector3(Math.sin(phi)*Math.cos(th),Math.cos(phi),Math.sin(phi)*Math.sin(th));
    const sp=new THREE.Mesh(new THREE.ConeGeometry(.09,.5,4), spkMat);
    sp.position.copy(dir.clone().multiplyScalar(1.7));
    sp.lookAt(dir.clone().multiplyScalar(4));
    virus.add(sp);
  }
  virus.position.set(0,0,0);
  group.add(virus);
  scene.add(group);
  return { scene, animate: (t) => {
    group.rotation.y=t*.12;
    virus.rotation.y=t*.35; virus.rotation.x=t*.18;
    group.children.forEach(c=>{ if(c.userData.off!==undefined){ c.position.y=c.userData.orig[1]+Math.sin(t*.4+c.userData.off)*.3; }});
  }};
}

/* ─────────────────────────────────
   7. Entomology — Honeycomb + insects
───────────────────────────────── */
function buildEntomology() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0c0800);
  makeLights(scene, 0x1a1000, .6, 0xffcc44, 1.1);
  scene.add(makeStars(100, 30));

  const group = new THREE.Group();
  const hexMat   = new THREE.MeshPhongMaterial({ color:0xf59e0b, transparent:true, opacity:.35, shininess:30 });
  const hexWire  = new THREE.MeshPhongMaterial({ color:0xfbbf24, wireframe:true, transparent:true, opacity:.6 });
  const bodyMat  = new THREE.MeshPhongMaterial({ color:0x78350f, emissive:0x1a0800, shininess:80 });
  const wingMat  = new THREE.MeshPhongMaterial({ color:0xfef3c7, transparent:true, opacity:.35, side:THREE.DoubleSide });
  const eyeMat   = new THREE.MeshPhongMaterial({ color:0x1c1917, emissive:0x0a0806, shininess:200 });

  for (let row=-3;row<=3;row++) {
    for (let col=-4;col<=4;col++) {
      const ox=(row%2)*.87*1.04;
      const x=col*1.75+ox, z=row*1.52;
      const hx=new THREE.Mesh(new THREE.CylinderGeometry(.5,.5,.15,6), hexMat);
      hx.position.set(x,0,z); hx.rotation.y=Math.PI/6;
      const hw=new THREE.Mesh(new THREE.CylinderGeometry(.51,.51,.17,6), hexWire);
      hw.position.set(x,0,z); hw.rotation.y=Math.PI/6;
      group.add(hx,hw);
    }
  }
  [[0,1.5,0],[3,1.5,2],[-3,1.5,-2]].forEach(([x,y,z])=>{
    const body=new THREE.Mesh(new THREE.SphereGeometry(.35,12,12), bodyMat);
    body.scale.set(1,1.8,1); body.position.set(x,y,z);
    const head=new THREE.Mesh(new THREE.SphereGeometry(.22,10,10), bodyMat);
    head.position.set(x,y+.65,z);
    const eye1=new THREE.Mesh(new THREE.SphereGeometry(.08,6,6), eyeMat);
    eye1.position.set(x+.12,y+.7,z+.18);
    const eye2=new THREE.Mesh(new THREE.SphereGeometry(.08,6,6), eyeMat);
    eye2.position.set(x-.12,y+.7,z+.18);
    const wg1=new THREE.Mesh(new THREE.PlaneGeometry(.8,.4), wingMat);
    wg1.position.set(x+.6,y+.2,z); wg1.rotation.z=.3;
    const wg2=new THREE.Mesh(new THREE.PlaneGeometry(.8,.4), wingMat);
    wg2.position.set(x-.6,y+.2,z); wg2.rotation.z=-.3;
    group.add(body,head,eye1,eye2,wg1,wg2);
  });
  scene.add(group);
  return { scene, animate: (t) => { group.rotation.y=t*.14; group.position.y=Math.sin(t*.3)*.2; } };
}

/* ─────────────────────────────────
   8. Algae — Spiral filaments
───────────────────────────────── */
function buildAlgae() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x010f08);
  makeLights(scene, 0x001a10, .6, 0x44ffaa, 1.1);
  scene.add(makeStars(130, 32));

  const group = new THREE.Group();
  const colors=[0x10b981,0x06b6d4,0x34d399,0x22d3ee,0x6ee7b7];
  for (let s=0;s<5;s++) {
    const pts=[], off=(s/5)*Math.PI*2, r=1.5+s*.85;
    for (let i=0;i<60;i++) {
      const t=(i/59)*Math.PI*8+off;
      pts.push(new THREE.Vector3(Math.cos(t)*r, (i/59)*14-7, Math.sin(t)*r));
    }
    const mat=new THREE.MeshPhongMaterial({ color:colors[s], emissive:0x001a0a, shininess:70, transparent:true, opacity:.85 });
    const tube=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),200,.09,6,false), mat);
    group.add(tube);
    for (let i=0;i<8;i++) {
      const p=pts[Math.floor(i/8*59)];
      const ch=new THREE.Mesh(new THREE.SphereGeometry(.12,6,6), new THREE.MeshPhongMaterial({color:0x065f46,emissive:0x021a0e}));
      ch.position.copy(p); group.add(ch);
    }
  }
  scene.add(group);
  return { scene, animate: (t) => { group.rotation.y=t*.16; group.rotation.x=Math.sin(t*.11)*.07; } };
}

/* ─────────────────────────────────
   9. Mycology — Mushroom cluster
───────────────────────────────── */
function buildMycology() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0c0401);
  makeLights(scene, 0x1a0800, .6, 0xff8844, 1.1);
  scene.add(makeStars(100, 30));

  const group = new THREE.Group();
  const capMat   = new THREE.MeshPhongMaterial({ color:0xf97316, emissive:0x2d0e00, shininess:70 });
  const capMat2  = new THREE.MeshPhongMaterial({ color:0xfb923c, emissive:0x1a0800, shininess:50 });
  const stemMat  = new THREE.MeshPhongMaterial({ color:0xfef9c3, emissive:0x1a1800, shininess:40 });
  const sporeMat = new THREE.MeshPhongMaterial({ color:0xfde68a, emissive:0x1a1000, shininess:60 });
  const spotMat  = new THREE.MeshPhongMaterial({ color:0xfff7ed, emissive:0x111111, shininess:30 });

  function addMushroom(cx,cz,sc,mat) {
    const stem=new THREE.Mesh(new THREE.CylinderGeometry(.1*sc,.16*sc,1.4*sc,10), stemMat);
    stem.position.set(cx,-1.5+.7*sc,cz);
    const cap=new THREE.Mesh(new THREE.SphereGeometry(.75*sc,20,10,0,Math.PI*2,0,Math.PI*.6), mat);
    cap.position.set(cx,-1.5+1.4*sc,cz); cap.rotation.x=Math.PI;
    for (let i=0;i<5;i++) {
      const a=(i/5)*Math.PI*2, r=.3*sc;
      const sp=new THREE.Mesh(new THREE.SphereGeometry(.07*sc,6,6), spotMat);
      sp.position.set(cx+Math.cos(a)*r, -1.5+1.6*sc+Math.sin(a)*r*.3, cz+Math.sin(a)*r);
      group.add(sp);
    }
    group.add(stem,cap);
  }
  addMushroom(0,0,2.2,capMat);
  addMushroom(-3.2,1.5,1.4,capMat2);
  addMushroom(3,-1,1.6,capMat);
  addMushroom(-1.5,-2.5,1.0,capMat2);
  addMushroom(2.5,2.5,.9,capMat);

  for (let i=0;i<30;i++) {
    const sp=new THREE.Mesh(new THREE.SphereGeometry(.06+Math.random()*.06,6,6), sporeMat);
    sp.position.set((Math.random()-.5)*12,(Math.random()-.5)*8,(Math.random()-.5)*4);
    sp.userData={off:Math.random()*Math.PI*2, speed:.15+Math.random()*.2};
    group.add(sp);
  }
  scene.add(group);
  return { scene, animate: (t) => {
    group.rotation.y=t*.13;
    group.children.forEach(c=>{ if(c.userData.speed){ c.position.y+=Math.sin(t*c.userData.speed+c.userData.off)*.006; c.position.x+=Math.cos(t*c.userData.speed*.7+c.userData.off)*.004; }});
  }};
}

/* ─────────────────────────────────
   10. Immunology — Antibodies + B-cell
───────────────────────────────── */
function buildImmunology() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050210);
  makeLights(scene, 0x0a0020, .6, 0x9966ff, 1.2);
  scene.add(makeStars(160, 36));

  const group = new THREE.Group();
  const abMat  = new THREE.MeshPhongMaterial({ color:0x7c3aed, emissive:0x1a0044, shininess:100 });
  const bcMat  = new THREE.MeshPhongMaterial({ color:0x3b82f6, emissive:0x001133, shininess:80, transparent:true, opacity:.9 });
  const bcWire = new THREE.MeshPhongMaterial({ color:0x60a5fa, wireframe:true, transparent:true, opacity:.3 });
  const antMat = new THREE.MeshPhongMaterial({ color:0xc4b5fd, emissive:0x0a0020, shininess:60 });

  function addAntibody(px,py,pz,ry) {
    const ab=new THREE.Group();
    const fc=new THREE.Mesh(new THREE.CylinderGeometry(.08,.1,1.8,8), abMat);
    fc.position.y=-.9;
    ab.add(fc);
    [[.4,1.1,.55,Math.PI/4],[-.4,1.1,-.55,-Math.PI/4]].forEach(([fx,fy,fz,rz])=>{
      const fab=new THREE.Mesh(new THREE.CylinderGeometry(.06,.08,1.3,8), abMat);
      fab.position.set(fx,fy,0); fab.rotation.z=rz;
      ab.add(fab);
      const tip=new THREE.Mesh(new THREE.SphereGeometry(.14,8,8), antMat);
      tip.position.set(fx+(fx>0?.35:-.35),fy+.3,0);
      ab.add(tip);
    });
    ab.position.set(px,py,pz); ab.rotation.y=ry;
    group.add(ab);
    return ab;
  }

  group.add(new THREE.Mesh(new THREE.SphereGeometry(1.7,28,28), bcMat));
  group.add(new THREE.Mesh(new THREE.SphereGeometry(1.72,18,18), bcWire));
  group.add(new THREE.Mesh(new THREE.SphereGeometry(.8,16,16),
    new THREE.MeshPhongMaterial({color:0x1e40af,emissive:0x000a1a,shininess:60,transparent:true,opacity:.8})));

  const abs=[];
  for (let i=0;i<6;i++) {
    const a=(i/6)*Math.PI*2;
    const r=4.0;
    const ab=addAntibody(Math.cos(a)*r, (Math.random()-.5)*2, Math.sin(a)*r, a+Math.PI/2);
    ab.userData={orbitAngle:a, orbitR:r, orbitSpeed:.18+Math.random()*.08};
    abs.push(ab);
  }
  const tcMat=new THREE.MeshPhongMaterial({color:0x06b6d4,emissive:0x001a20,shininess:70,transparent:true,opacity:.85});
  for (let i=0;i<3;i++) {
    const a=(i/3)*Math.PI*2+Math.PI/6;
    const tc=new THREE.Mesh(new THREE.SphereGeometry(.6,14,14), tcMat);
    tc.position.set(Math.cos(a)*6.5,(Math.random()-.5)*2,Math.sin(a)*6.5);
    tc.userData={orbitAngle:a, orbitR:6.5, orbitSpeed:.09};
    group.add(tc);
    abs.push(tc);
  }
  scene.add(group);
  return { scene, animate: (t) => {
    group.children[0].rotation.y=t*.12;
    abs.forEach(ab=>{
      if(ab.userData.orbitAngle!==undefined){
        const a=ab.userData.orbitAngle+t*ab.userData.orbitSpeed;
        ab.position.x=Math.cos(a)*ab.userData.orbitR;
        ab.position.z=Math.sin(a)*ab.userData.orbitR;
        ab.rotation.y=a+Math.PI/2;
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
