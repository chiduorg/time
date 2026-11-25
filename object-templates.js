import * as THREE from 'three';
import {solid, object, rod, line, orbit} from '/engine/renderer/subjects.js';
import {pointTexture} from '/engine/renderer/effects.js';

// Procedural illustrations, not measured reconstructions. No particle or animal
// trajectory encodes a physical velocity, elapsed duration, or spatial scale.
const TAU=Math.PI*2;
const V=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z);
const metal=()=>solid('#b5c7d0',{metalness:.75,roughness:.27});
const ink=()=>solid('#203343',{metalness:.3,roughness:.66});
const warm=()=>solid('#b78b61',{metalness:.6,roughness:.4});
const glass=(c='#91c5dc',a=.13)=>solid(c,{transparent:true,opacity:a,depthWrite:false,roughness:.16,side:THREE.DoubleSide});
const lit=c=>solid(c,{emissive:c,emissiveIntensity:.55,roughness:.5});
const ball=(r,m,x=0,y=0,z=0)=>object(new THREE.SphereGeometry(r,40,28),m,x,y,z);
const block=(x,y,z,m,px=0,py=0,pz=0)=>object(new THREE.BoxGeometry(x,y,z),m,px,py,pz);
const cyl=(r,h,m,x=0,y=0,z=0,r2=r)=>object(new THREE.CylinderGeometry(r,r2,h,48),m,x,y,z);
const ring=(r,t,m,x=0,y=0,z=0)=>object(new THREE.TorusGeometry(r,t,12,96),m,x,y,z);
const path=(p,r,m)=>object(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(p.map(v=>V(...v))),64,r,10,false),m);
function seeded(key){let s=2166136261;for(const c of key)s=Math.imul(s^c.charCodeAt(0),16777619);return()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};}
function dust(n,c,fn){const a=[];for(let i=0;i<n;i++)a.push(...fn(i));const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(a,3));return new THREE.Points(geo,new THREE.PointsMaterial({map:pointTexture(),color:c,size:.07,transparent:true,opacity:.78,depthWrite:false,blending:THREE.AdditiveBlending}));}
function glow(c,scale=1,opacity=.55){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:pointTexture(),color:c,transparent:true,opacity,depthWrite:false,blending:THREE.AdditiveBlending}));s.scale.set(scale,scale,1);return s;}
function pedestal(g,w=5,z=3){g.add(block(w,.14,z,ink(),0,-2.25),block(w*.94,.04,z*.94,metal(),0,-2.15));}
function figure(g,x,z,coat,skin='#c9a27f',scale=1,hat='#2b2926',base=-1.86){
  const s=scale,y=base;
  g.add(cyl(.035,.3*s,solid('#303436'),x-.055,y+.15*s,z,.04),cyl(.035,.3*s,solid('#303436'),x+.055,y+.15*s,z,.04));
  g.add(block(.2*s,.32*s,.12*s,solid(coat),x,y+.44*s,z));
  g.add(ball(.085*s,solid(skin),x,y+.66*s,z));
  g.add(block(.13*s,.035*s,.13*s,solid(hat),x,y+.72*s,z));
  g.add(rod(V(x-.1*s,y+.55*s,z),V(x-.16*s,y+.34*s,z),.025*s,solid(coat)));
  g.add(rod(V(x+.1*s,y+.55*s,z),V(x+.16*s,y+.34*s,z),.025*s,solid(coat)));
}
function wave(g,c,y=0,z=0,amplitude=.3){g.add(path(Array.from({length:45},(_,i)=>{const x=-3+i/44*6;return[x,y+Math.sin(x*4)*amplitude,z];}),.016,lit(c)));}
function grain(g,p,c,r=.12){g.add(ball(r,lit(c),...p));}
function dataLabel(text,color,width){const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=144;const ctx=canvas.getContext('2d');let size=44;ctx.font=`${size}px Segoe UI, Microsoft YaHei, sans-serif`;while(size>24&&ctx.measureText(text).width>970)ctx.font=`${--size}px Segoe UI, Microsoft YaHei, sans-serif`;ctx.textAlign='center';ctx.fillStyle=color;ctx.fillText(text,512,88);const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(canvas),transparent:true,depthWrite:false}));sprite.scale.set(width,width*144/1024,1);return sprite;}
function frond(g,x,y,z,size=1,material=solid('#4f9e88')){const f=new THREE.Group();f.position.set(x,y,z);f.scale.setScalar(size);g.add(f);f.add(rod(V(0,0,0),V(0,1.8,0),.025,warm()));for(let j=0;j<7;j++)for(const s of [-1,1]){const q=ball(.25,material,s*(.12+j*.035),.25+j*.2,0);q.scale.set(1,.2,.35);q.rotation.z=s*.4;f.add(q);}return f;}

function buildPlanckEra(g,c,m,rng){
  const cyan='#7ad8ff',violet='#b79cff',warm='#ffe1b0';
  const node=solid(cyan,{emissive:cyan,emissiveIntensity:.9,roughness:.3});
  const spike=solid(violet,{emissive:violet,emissiveIntensity:.8,roughness:.3});
  // A soft dark halo, painted as a radial alpha texture, separates the lattice from the nebula.
  const haloCanvas=document.createElement('canvas');haloCanvas.width=256;haloCanvas.height=256;
  const hc=haloCanvas.getContext('2d'),grd=hc.createRadialGradient(128,128,18,128,128,126);
  grd.addColorStop(0,'rgba(4,12,18,.88)');grd.addColorStop(.55,'rgba(4,12,18,.6)');grd.addColorStop(1,'rgba(4,12,18,0)');
  hc.fillStyle=grd;hc.fillRect(0,0,256,256);
  const halo=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(haloCanvas),transparent:true,depthWrite:false}));
  halo.scale.set(4.2,4.2,1);halo.position.set(0,.18,-1.55);halo.renderOrder=-3;g.add(halo);
  const lat=new THREE.Group();g.add(lat);lat.rotation.x=-.2;
  const N=9,step=.38,half=(N-1)/2*step;
  const height=(x,z)=>.18+Math.sin(x*2.5)*Math.cos(z*2.9)*.18;
  for(let i=0;i<N;i++)for(let j=0;j<N;j++){
    const x=-half+i*step,z=-half+j*step,y=height(x,z);
    const nodeMat=(i+j)%5===0?spike:node;
    lat.add(ball(i%2&&j%2?.038:.026,nodeMat,x,y,z));
    if(i<N-1)lat.add(line([[x,y,z],[-half+(i+1)*step,height(-half+(i+1)*step,z),z]],cyan,.42));
    if(j<N-1)lat.add(line([[x,y,z],[x,height(x,-half+(j+1)*step),-half+(j+1)*step]],cyan,.42));
  }
  // Planck cells: translucent cubes and vertical fluctuation spikes.
  for(let i=0;i<24;i++){
    const a=rng()*TAU,r=.35+rng()*1.45,x=Math.cos(a)*r,z=Math.sin(a)*r*.8;
    const s=.1+rng()*.13,y=height(x,z)+.06+rng()*.35;
    lat.add(block(s,s,s,glass(i%3===0?violet:cyan,.12),x,y,z));
    if(i<10){
      const edges=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(s,s,s)),new THREE.LineBasicMaterial({color:i%3===0?violet:cyan,transparent:true,opacity:.5}));
      edges.position.set(x,y,z);lat.add(edges);
    }
    if(i<14)lat.add(rod(V(x,y,z),V(x,y+.18+rng()*.25,z),.006,spike));
  }
  // A few larger floating cells give the lattice visible volume.
  for(let i=0;i<5;i++){
    const a=i/5*TAU+.4,r=1.05+(i%3)*.2,x=Math.cos(a)*r,z=Math.sin(a)*r*.7,y=.65+(i%2)*.35,s=.2+(i%3)*.06;
    const voxel=block(s,s,s,glass(i%2?violet:cyan,.16),x,y,z);g.add(voxel);
    const edges=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(s,s,s)),new THREE.LineBasicMaterial({color:i%2?violet:cyan,transparent:true,opacity:.6}));edges.position.set(x,y,z);g.add(edges);
  }
  // A bright Planck-scale core with three precessing rings.
  const core=ball(.18,lit(warm),0,.28,0);g.add(core,glow(warm,1.9,.7).translateY(.28));
  const rings=[];
  for(let i=0;i<3;i++){
    const q=object(new THREE.TorusGeometry(.34+i*.17,.012,8,80),lit(i===0?warm:i===1?cyan:violet),0,.28,0);
    q.rotation.set(Math.PI/2+i*.5,i*.9,i*.3);g.add(q);rings.push(q);
  }
  // Quantum foam bubbles around the core; each keeps a base height for gentle bobbing.
  const bubbles=[];
  for(let i=0;i<22;i++){
    const a=i/22*TAU,r=.45+(i%5)*.22,x=Math.cos(a)*r,z=Math.sin(a)*r*.72,y=.15+Math.sin(i*1.7)*.35;
    const b=ball(.05+(i%4)*.022,glass(i%2?cyan:violet,.2),x,y,z);g.add(b);bubbles.push({b,y});
    if(i%3===0)g.add(ring(.09,.006,lit(i%2?cyan:violet),x,y,z));
  }
  // Curved wave packets leave the core in four directions.
  for(let k=0;k<4;k++){
    const a=k*TAU/4+.3,pts=[];
    for(let i=0;i<=22;i++){const t=i/22,r=.25+t*1.55;pts.push([Math.cos(a)*r, .3+Math.sin(t*Math.PI*.9)*.34, Math.sin(a)*r*.8]);}
    g.add(path(pts,.014,lit(k%2?violet:cyan)));
  }
  g.add(dust(430,cyan,()=>{const a=rng()*TAU,r=.25+rng()*1.7;return[Math.cos(a)*r,.1+rng()*1.35,Math.sin(a)*r*.8];}));
  // A single orbital ring and a thin vertical light pillar suggest a Planck-scale frame.
  const orbit=ring(1.12,.008,glass(cyan,.22),0,-.52,0);orbit.rotation.x=1.42;g.add(orbit);
  g.add(rod(V(0,-1.15,0),V(0,1.55,0),.006,glass(cyan,.28)),glow(cyan,.6,.4).translateY(-1.1));
  m.push((d,t)=>{
    core.scale.setScalar(.9+Math.sin(t*.9)*.1);
    rings.forEach((q,i)=>{q.rotation.z+=(i%2?1:-1)*.003;q.rotation.x=Math.PI/2+i*.5+Math.sin(t*.3+i)*.06;});
    bubbles.forEach((v,i)=>{v.b.position.y=v.y+Math.sin(t*.6+i*1.4)*.045;});
    lat.rotation.y=Math.sin(t*.08)*.06;
  });
}
function quantumField(g,c,m,rng,entry){
  const id=String(entry?.id||'').replace(/^time\./,'');
  if(id==='big-bang'){
    const core=ball(.18,lit('#fff3d4'),0,0,0);g.add(core,glow('#ffd9a0',1.6,.5));
    const shell=new THREE.Group();g.add(shell);
    for(let i=0;i<5;i++){const q=object(new THREE.TorusGeometry(.5+i*.28,.012,6,80),solid(new THREE.Color('#efb476').lerp(new THREE.Color(c.color||'#9bbcd7'),i/5),{transparent:true,opacity:.35}));q.rotation.set(i*.5,i*.4,0);shell.add(q);}
    const particles=dust(1200,'#ffd59a',()=>{const v=V(rng()-.5,rng()-.5,rng()-.5).normalize(),r=.25+rng()*2.3;return[v.x*r,v.y*r,v.z*r];});g.add(particles);
    m.push((d,t)=>{shell.rotation.y=t*.05;particles.rotation.y=-t*.03;core.scale.setScalar(1+Math.sin(t*.5)*.06);});
    return;
  }
  if(id==='planck-era'){buildPlanckEra(g,c,m,rng);return;}
  if(id==='inflation'){
    const grid=new THREE.Group();grid.rotation.set(-.32,.1,0);g.add(grid);
    for(let j=-6;j<=6;j++)for(const axis of [0,1]){const pts=Array.from({length:41},(_,i)=>{const t=i/40*2-1;return axis?[j*.16,0,t]:[t,0,j*.16];});grid.add(line(pts,c.color,.28));}
    for(let i=0;i<5;i++){const q=object(new THREE.TorusGeometry(.4+i*.28,.012,6,70),lit(c.color));q.rotation.x=Math.PI/2;q.position.y=.05;grid.add(q);}
    const bubble=ball(.6,glass(c.color,.1),0,.2,0);grid.add(bubble);
    m.push((d,t)=>{bubble.scale.setScalar(.85+Math.sin(t*.25)*.12);grid.rotation.y=.1+Math.sin(t*.08)*.02;});
    return;
  }
  if(id==='grand-unification-epoch'){
    const core=ball(.3,lit('#fff0c9'),0,.35,0);g.add(core,glow('#ffd8a0',2.6,.5).translateY(.35));
    const rings=[];
    const colors=['#e6b877','#a0c7e9','#d8b4ef'];
    for(let i=0;i<3;i++){
      const radius=1.02+i*.2;
      const ring=object(new THREE.TorusGeometry(radius,.026,8,96),lit(colors[i]),0,.35,0);
      ring.rotation.set(Math.PI/2+i*.55,i*1.1,i*.35);g.add(ring);rings.push(ring);
    }
    const spokes=new THREE.Group();g.add(spokes);
    for(let i=0;i<3;i++) for(let j=0;j<6;j++){
      const a=j/6*TAU+i*.7,r=1.02+i*.2;
      spokes.add(ball(.025,lit(colors[i]),Math.cos(a)*r,.35+Math.sin(a)*r*.25,Math.sin(a)*r));
    }
    g.add(cyl(1.9,.05,glass(c.color,.12),0,-1.15,0));
    g.add(dust(50,'#ffe3b6',i=>{const a=i/50*TAU,r=1.1+(i%5)*.12;return[Math.cos(a)*r,.35+Math.sin(i*2.1)*.35,Math.sin(a)*r];}));
    m.push((d,t)=>{core.scale.setScalar(.9+Math.sin(t*.8)*.08);rings.forEach((q,i)=>{q.rotation.z+= (i%2?1:-1)*.002;});spokes.rotation.y=t*.12;});
    return;
  }
  if(id==='atomic-transition'){
    const atom=new THREE.Group();g.add(atom);
    atom.add(ball(.35,solid('#c68a63',{emissive:'#7c3d22',emissiveIntensity:.4}),0,0,0));
    for(let i=0;i<3;i++){const q=object(new THREE.TorusGeometry(1.1+i*.12,.012,6,80),solid('#8fb4c9',{transparent:true,opacity:.55}));q.rotation.set(i*1.1,i*.7,i*.5);atom.add(q);}
    const electron=ball(.09,lit('#9bd6ea'),1.1,0,0);atom.add(electron);
    const photon=path([[1.5,.1,0],[2.1,.2,0],[2.8,.1,0]],.025,lit('#f0c58d'));g.add(photon);
    m.push((d,t)=>{electron.position.set(Math.cos(t*.5)*1.1,Math.sin(t*.5)*.5,Math.sin(t*.5)*1.0);photon.rotation.y=t*.1;});
    return;
  }
  if(id==='cosmic-strings'){
    for(let i=0;i<3;i++){
      const pts=[];for(let j=0;j<80;j++){const t=j/79;pts.push([-2.2+t*4.4,Math.sin(t*6+i*1.4)*.18+.3-i*.3,Math.sin(t*4+i)*.25]);}
      g.add(path(pts,.03,lit(i===0?c.color:'#c8a7d8')));
    }
    const ring=object(new THREE.TorusGeometry(1.3,.02,6,80),glass(c.color,.3));ring.position.y=.3;g.add(ring);
    m.push((d,t)=>{g.children.forEach((q,i)=>{if(q.type==='Mesh')q.position.y=.3+Math.sin(t*.4+i)*.04;});});
    return;
  }
  if(id==='electroweak-symmetry-breaking'||id==='electroweak-epoch'){
    const grid=new THREE.Group();grid.rotation.set(-.4,.2,0);g.add(grid);
    for(let i=-5;i<=5;i++)for(let j=-5;j<=5;j++){
      const r=Math.hypot(i*.3,j*.3),y=.12+Math.max(0,r*r*.18-.35)*.7;
      grid.add(object(new THREE.SphereGeometry(.018,6,5),solid(c.color,{transparent:true,opacity:.55}),i*.3,y,j*.3));
    }
    for(let j=-5;j<=5;j++)grid.add(line(Array.from({length:31},(_,i)=>{const x=-1.5+i*.1;return[x,.12+Math.max(0,Math.abs(x)*.22-.35)*.7,j*.3];}),c.color,.18));
    g.add(ball(.16,lit('#f0d8a8'),0,1.15,0));
    m.push((d,t)=>{grid.rotation.y=.2+Math.sin(t*.08)*.015;});
    return;
  }
  if(id==='graviton-decoupling'||id==='reheating'){
    const grid=new THREE.Group();grid.rotation.set(-.35,.1,0);g.add(grid);
    for(let j=-5;j<=5;j++)grid.add(line(Array.from({length:31},(_,i)=>[-1.5+i*.1,0,j*.3]),c.color,.25));
    const center=ball(id==='reheating'?.45:.25,lit(id==='reheating'?'#f1b267':'#a8c8dd','#f1b267'),0,.15,0);grid.add(center);
    for(let i=0;i<6;i++){const a=i*TAU/6,q=path([[0,.2,0],[Math.cos(a)*.9,.4+Math.sin(i)*.15,Math.sin(a)*.9],[Math.cos(a)*1.9,.7,Math.sin(a)*1.9]],.012,lit(c.color));grid.add(q);}
    const parts=dust(420,id==='reheating'?'#f3c185':'#b9d7e6',()=>[(rng()-.5)*4,.2+rng()*1.8,(rng()-.5)*2.4]);grid.add(parts);
    m.push((d,t)=>{parts.rotation.y=t*.03;grid.rotation.y=.1+Math.sin(t*.08)*.015;});
    return;
  }
  // generic field sheet
  const sheet=new THREE.Group();sheet.rotation.set(-.38,.1,0);g.add(sheet);
  for(let j=-4;j<=4;j++){const p=[];for(let i=0;i<=30;i++){const x=-3+i*.2,z=j*.65;p.push([x,Math.sin(x*1.7+z)*.22,z]);}sheet.add(line(p,c.color,.42));}
  for(let i=-4;i<=4;i++)sheet.add(line(Array.from({length:31},(_,j)=>{const z=-3+j*.2;return[i*.65,Math.sin(i*1.1+z)*.22,z];}),c.color,.3));
  m.push((d,t)=>sheet.rotation.y=.1+Math.sin(t*.2)*.05);
}
function particleReaction(g,c,m){
 if(c.profile==='molecule'){const pair=new THREE.Group();g.add(pair);pair.add(ball(.7,solid('#a4b8d4'),-.7,0,0),ball(.38,solid(c.color),.8,0,0),rod(V(-.7,0,0),V(.8,0,0),.055,metal()));for(let i=0;i<3;i++){const q=ring(1.7,.012,glass(c.color,.65));q.rotation.set(i*.8,.4,i*.5);pair.add(q);}m.push((d,t)=>pair.rotation.y=t*.04);return;}
 const tracks=new THREE.Group();g.add(tracks);const count=c.profile==='hadron'?6:4;
 for(let i=0;i<count;i++){const y=(i-(count-1)/2)*.7;const p=[[-3,y,-.5],[-1.2,y+.15,0],[.2,y,.4],[2.8,y-.1,-.2]];tracks.add(path(p,.012,lit(i%2?c.color:'#7399bb')));const q=new THREE.Group();tracks.add(q);if(c.profile==='hadron'){for(let k=0;k<3;k++)q.add(ball(.11,lit(['#edac7a','#9ac8de','#c6a0d2'][k]),Math.cos(k*TAU/3)*.15,Math.sin(k*TAU/3)*.15,0));q.add(ball(.3,glass(c.color,.08)));}else q.add(ball(c.profile==='muon'?.18:.13,lit(i%2?c.color:'#d8c7a4')));m.push((d,t)=>{const phase=(t*.09+i*.19)%1;q.position.set(-2.7+5.4*phase,y+Math.sin(phase*TAU)*.12,.25);});}
 const gate=ring(2.2,.035,metal());gate.rotation.y=Math.PI/2;g.add(gate);for(const x of [-2.5,2.5]){const q=ring(1.5,.012,solid(c.color,{transparent:true,opacity:.25}));q.rotation.y=Math.PI/2;q.position.x=x;g.add(q);}
}
function nuclearNetwork(g,c,m){
 const centers=[[-2.4,.5,0],[0,-.5,.2],[2.3,.55,0]],n=c.profile==='lithium'?7:c.profile==='barrier'?2:4;
 for(let j=0;j<3;j++){const cluster=new THREE.Group();cluster.position.set(...centers[j]);g.add(cluster);const amount=j===2?n:j+1;for(let i=0;i<amount;i++){const a=i*2.39996,r=i===0?0:.3;cluster.add(ball(.22,solid(i%2?'#9fc9df':c.color,{roughness:.45}),Math.cos(a)*r,Math.sin(a)*r,(i%2-.5)*.25));}const shell=ring(.7,.012,solid(c.color,{transparent:true,opacity:.38}));cluster.add(shell);m.push((d,t)=>cluster.rotation.y=t*.08+j*.5);}
 for(let j=0;j<2;j++)g.add(path([[centers[j][0]+.6,centers[j][1],0],[centers[j][0]+1.2,1.35,0],[centers[j+1][0]-.6,centers[j+1][1],0]],.018,lit(c.color)));
 if(c.profile==='barrier'){const shield=block(.06,3,2.5,glass('#8facbe',.13),1.05,.2,0);g.add(shield);wave(g,'#e2c69a',1.65,.1,.1);}
 for(let i=0;i<4;i++){const q=orbit(2.8,c.color,.12);q.rotation.set(i*.4,0,i*.5);g.add(q);}
}
function radiationFront(g,c,m){
 const sheet=block(5.7,3.5,.05,glass('#6592ae',.06),0,0,-.8);g.add(sheet);for(let j=0;j<6;j++)wave(g,j%2?c.color:'#7a9fba',-1.5+j*.6,-.4+j*.08,.12);
 if(c.profile==='acoustic'){for(let i=0;i<5;i++){const q=ring(.45+i*.48,.018,lit(c.color));q.position.z=.3;g.add(q);m.push((d,t)=>q.scale.setScalar(1+Math.sin(t*.3)*.025));}}
 else {for(let i=0;i<9;i++){const y=(i%3-1)*1.05,z=Math.floor(i/3)*.5;const track=line([[-3,y,z],[3,y+.25,z]],'#729aaf',.25);g.add(track);const q=object(new THREE.OctahedronGeometry(.09),lit(c.color));g.add(q);m.push((d,t)=>q.position.set(((t*.35+i*.63)%6)-3,y+.12,z));}if(c.profile==='photon'){for(let k=0;k<5;k++){const q=ball(.2,solid(k%2?'#c99870':'#6a93b4'),-2+k,1.5,.6);g.add(q);}}}
}
function cosmicWeb(g,c,m,rng){
 const nodes=[];for(let i=0;i<12;i++)nodes.push(V((rng()-.5)*6,(rng()-.5)*4,(rng()-.5)*3));
 for(let i=0;i<nodes.length;i++){const a=nodes[i];g.add(ball(i%3===0?.2:.075,lit(c.color),a.x,a.y,a.z));const halo=ring(c.profile==='halo'?.5:.24,.01,solid(c.color,{transparent:true,opacity:.2}));halo.position.copy(a);halo.rotation.set(i*.8,i*.5,0);g.add(halo);for(let j=i+1;j<nodes.length;j++)if(a.distanceTo(nodes[j])<3.2)g.add(path([[a.x,a.y,a.z],[(a.x+nodes[j].x)/2,(a.y+nodes[j].y)/2+.18,(a.z+nodes[j].z)/2],[nodes[j].x,nodes[j].y,nodes[j].z]],.013,glass(c.color,.3)));}
 const p=dust(180,c.color,()=>[(rng()-.5)*6,(rng()-.5)*4,(rng()-.5)*3]);g.add(p);m.push((d,t)=>{p.rotation.y=Math.sin(t*.12)*.035;});
 if(c.profile==='expansion'){for(const s of [-1,1])g.add(rod(V(s*1.3,-2.1,0),V(s*3,-2.1,0),.025,lit(c.color)));}
}
function miniGalaxy(radius,c,rng){const disk=new THREE.Group();disk.add(dust(300,c,i=>{const r=Math.sqrt(rng())*radius,a=(i%3)*TAU/3+r*1.6+(rng()-.5)*.35;return[Math.cos(a)*r,(rng()-.5)*.12,Math.sin(a)*r];}),ball(radius*.17,lit('#f4d5b1')));return disk;}
function galaxyAssembly(g,c,m,rng){
 if(c.profile==='cluster'){for(let i=0;i<7;i++){const a=i*2.4,small=miniGalaxy(.45+(i%3)*.13,c.color,rng);small.position.set(Math.cos(a)*(i?2.2:0),Math.sin(a)*1.5,(i%3-1)*.8);small.rotation.set(.6+i*.1,i*.3,0);g.add(small);m.push((d,t)=>small.rotation.y=t*(.015+i*.002));}return;}
 const disk=miniGalaxy(2.5,c.color,rng);disk.rotation.set(.45,0,.15);g.add(disk);if(c.profile==='thick-disc'){const rim=ring(2.2,.14,glass(c.color,.16));rim.rotation.x=Math.PI/2;disk.add(rim);g.add(line([[-2.8,-1.5,0],[2.8,-1.5,0]],'#b79274',.35));}else for(const s of [-1,1]){const small=miniGalaxy(.75,c.color,rng);small.position.set(s*2.6,s*.8,-1);small.rotation.x=.8;g.add(small);g.add(path([[s*3,s*.8,-1],[s*2,1.8,0],[s*.9,.2,0]],.014,glass(c.color,.4)));}m.push((d,t)=>disk.rotation.y=t*.025);
}
function accretionEngine(g,c,m){
 const disk=new THREE.Group();disk.rotation.set(.45,0,.22);g.add(disk);g.add(ball(.72,solid('#030812',{roughness:1})));for(let i=0;i<12;i++){const q=ring(.9+i*.13,.045,lit(new THREE.Color(c.color).lerp(new THREE.Color('#8b647d'),i/16)));q.rotation.x=Math.PI/2;disk.add(q);}
 const arcs=new THREE.Group();disk.add(arcs);for(let i=0;i<3;i++){const a=i*TAU/3;arcs.add(ball(.09,lit('#f6dabc'),Math.cos(a)*1.7,0,Math.sin(a)*1.7));}
 if(c.profile==='quasar')for(const s of [-1,1]){const jet=cyl(.07,2.7,glass('#a2d7ed',.22),0,s*1.8,0,.5);if(s<0)jet.rotation.z=Math.PI;g.add(jet);}
 else {const slit=block(4.8,.06,.08,solid('#90aec4'),0,-2,0);g.add(slit);for(let i=0;i<7;i++)g.add(block(.035,.3+(i%3)*.13,.08,lit(c.color),-2+i*.65,-1.8,0));}
 m.push((d,t)=>arcs.rotation.y=t*.18);
}
function stellarCycle(g,c,m,rng){
 if(c.profile==='enrichment'){const shell=new THREE.Group();g.add(shell);for(let i=0;i<5;i++){const q=ring(.8+i*.42,.022,lit(c.color));q.rotation.set(i*.65,i*.4,0);shell.add(q);}g.add(ball(.35,lit('#dfebf5')));const grain=dust(180,c.color,()=>{const a=rng()*TAU,z=(rng()-.5)*2,r=1.6+rng();return[Math.cos(a)*r,z,Math.sin(a)*r];});g.add(grain);m.push((d,t)=>{shell.rotation.y=t*.02;grain.rotation.y=-t*.025;});}
 else {for(let k=0;k<7;k++){const a=k*2.4,x=Math.cos(a)*(k?2.2:0),y=Math.sin(a)*1.4;g.add(ball(k?.15:.55,lit(k%2?c.color:'#cedcf0'),x,y,(k%3-1)*.6));}for(let i=0;i<4;i++)g.add(path([[-3,-1.7+i*.7,-1],[-1,.4+i*.15,0],[1,-.1+i*.3,.2],[3,1.6-i*.4,-.5]],.09,glass(c.color,.12)));m.push((d,t)=>g.rotation.y=Math.sin(t*.1)*.035);}
}
function planetFoundry(g,c,m,rng){
 const world=new THREE.Group();g.add(world);world.add(ball(1.5,solid('#5a5d64',{roughness:.87})));for(let i=0;i<7;i++){const q=ring(1.5,.02,lit('#c48e61'));q.rotation.set(i*.6,i*.4,i*.3);world.add(q);}
 if(c.profile==='impact'){const moon=object(new THREE.DodecahedronGeometry(.6,1),solid('#9a8372'),2.5,1.2,.1);g.add(moon);g.add(path([[2.8,1.7,.2],[2,1,0],[1.2,.6,0]],.025,lit(c.color)));const ejecta=dust(100,c.color,()=>{const a=rng()*TAU;return[1+rng()*1.8,Math.sin(a)*rng()*1.4,Math.cos(a)*rng()];});g.add(ejecta);m.push((d,t)=>ejecta.rotation.x=Math.sin(t*.3)*.025);}
 else {const dustRing=dust(230,c.color,()=>{const a=rng()*TAU,r=2+rng();return[Math.cos(a)*r,(rng()-.5)*.15,Math.sin(a)*r];});g.add(dustRing);m.push((d,t)=>dustRing.rotation.y=t*.025);}
 m.push((d,t)=>world.rotation.y=t*.025);
}
function oceanSection(g,c,m){
 if(c.profile==='core'){pedestal(g,5,3);for(let j=0;j<11;j++)g.add(cyl(.55,.26,solid(['#a78b6b','#7d735f','#b09e7a'][j%3]),-.7,-1.7+j*.28));g.add(cyl(.58,3.4,glass('#bad1d7',.08),-.7,-.2));g.add(rod(V(1.1,-1.8,0),V(1.1,1.3,0),.055,metal()),ball(.2,lit(c.color),1.1,-1.65,0));for(let j=0;j<9;j++)g.add(block(.22,.02,.05,metal(),1.38,-1.2+j*.27,0));const pointer=block(.5,.035,.08,lit(c.color),.1,.3,.2);g.add(pointer);m.push((d,t)=>pointer.position.y=.3+Math.sin(t*.3)*.04);return;}
 pedestal(g,5.8,3.8);const rock=solid('#6a746f',{roughness:.95}),water=glass('#448caa',.35);g.add(block(5.4,.45,3.4,rock,0,-1.8),block(5.4,1.3,3.4,water,0,-.95));for(let i=0;i<7;i++){const x=-2.4+i*.8;g.add(object(new THREE.ConeGeometry(.65,.7+(i%3)*.25,5),rock,x,-1.45,-1));}
 for(let j=0;j<4;j++){const q=path(Array.from({length:35},(_,i)=>[-2.6+i/34*5.2,-.25+Math.sin(i*.5+j)*.04,-1.3+j*.85]),.015,solid('#91cbcd',{transparent:true,opacity:.6}));g.add(q);m.push((d,t)=>q.position.y=Math.sin(t*.4+j)*.025);}
 const crystal=object(new THREE.OctahedronGeometry(.5),solid(c.color,{metalness:.3,roughness:.25}),1.8,.65,.4);crystal.scale.set(.6,1.4,.6);g.add(crystal,rod(V(1.8,-1,.4),V(1.8,.05,.4),.018,metal()));m.push((d,t)=>crystal.rotation.y=t*.06);
}
function atmosphereSection(g,c,m){
 if(c.profile==='magnetic'){g.add(ball(1.4,solid('#315765')));for(let j=0;j<6;j++){const a=j*TAU/6;g.add(path([[0,1.35,0],[Math.cos(a)*2.6,.7,Math.sin(a)*2.6],[Math.cos(a)*2.6,-.7,Math.sin(a)*2.6],[0,-1.35,0]],.018,lit(c.color)));}const needle=rod(V(-.8,0,0),V(.8,0,0),.07,warm());needle.position.set(0,-2.1,0);g.add(needle,ring(1,.025,metal(),0,-2.1,0));m.push((d,t)=>needle.rotation.y=Math.sin(t*.2)*.06);return;}
 const earth=ball(1.65,solid('#315765'));earth.position.y=-.75;g.add(earth);for(let i=0;i<6;i++){const q=ring(1.7+i*.18,.013,glass(c.color,.35));q.rotation.x=Math.PI/2;q.position.y=-.75;g.add(q);}
 for(let k=0;k<7;k++){const a=k/7*TAU,x=Math.cos(a)*2.3,y=Math.sin(a)*1.5+.5;const molecule=new THREE.Group();molecule.position.set(x,y,.4);molecule.add(ball(.11,lit(c.color),-.12,0),ball(.11,lit(c.color),.12,0));g.add(molecule);m.push((d,t)=>molecule.rotation.z=t*.07+k);}
 for(let j=0;j<4;j++)g.add(line([[-2.8+j*.7,2.5,-.4],[-1.2+j*.7,.8,-.4]],'#e4c799',.25));
}
function iceLandscape(g,c,m,rng,entry){
  const id=String(entry?.id||'').replace(/^time\./,'');
  pedestal(g,6,3.8);
  if(id==='milankovitch-cycle'){
    const sun=ball(.42,lit('#e5ac5f'),0,1.1,0);g.add(sun,glow('#e9ae62',1.4,.35).translateY(1.1));
    const orbitGroup=new THREE.Group();orbitGroup.rotation.x=.35;g.add(orbitGroup);
    for(let i=0;i<3;i++){const q=object(new THREE.TorusGeometry(1.6+i*.12,.012,6,90),solid('#8fb4c8',{transparent:true,opacity:.35}));q.rotation.x=Math.PI/2;orbitGroup.add(q);}
    const earth=new THREE.Group();earth.position.set(1.6,0,0);orbitGroup.add(earth);
    earth.add(ball(.18,solid('#5c8ca0',{roughness:.6})),object(new THREE.TorusGeometry(.28,.006,5,64),solid('#c9dce2',{transparent:true,opacity:.5})));
    const axis=cyl(.012,.46,lit('#e8c98f'),0,0,0);axis.rotation.z=.32;earth.add(axis);
    g.add(block(.1,.02,.1,solid('#e8c98f'),2.0,-.2,0));
    m.push((d,t)=>{earth.position.set(Math.cos(t*.25)*1.6,Math.sin(t*.25)*.25,Math.sin(t*.25)*1.6*(.55));});
    return;
  }
  if(id==='amundsen-south-pole'){
    g.add(block(5.6,.18,3.3,solid('#d9e7eb',{roughness:.7}),0,-1.85));
    const pole=cyl(.035,2.0,solid('#6e5a45'),0,-.7,0);g.add(pole);
    const flag=new THREE.Group();flag.position.set(.32,.4,0);flag.add(block(.6,.34,.02,solid('#c45b4b'),.3,0,0));
    g.add(flag);
    const tent=new THREE.Group();tent.position.set(-1.5,-1.4,-.2);tent.rotation.y=.4;g.add(tent);
    tent.add(object(new THREE.ConeGeometry(.7,1.1,4),solid('#b3a17e',{roughness:.8}),0,.2),object(new THREE.ConeGeometry(.72,.12,4),solid('#7f6f55'),0,-.32));
    for(let i=0;i<3;i++)g.add(rod(V(-2.0,-1.55,-.5+i*.4),V(-1.5,-1.5,-.5+i*.4),.025,solid('#74664f')));
    g.add(block(.8,.05,.3,solid('#5e4c39'),-2.1,-1.62,.4));
    for(let i=0;i<5;i++)g.add(block(.15,.08,.02,solid('#e6ddc9'),-1.4+i*.2,-1.16,0));
    m.push((d,t)=>{flag.rotation.y=Math.sin(t*.4)*.04;});
    return;
  }
  const iceMat=solid('#c3e1e8',{roughness:.65}), deep=solid('#8fbcc9',{roughness:.8}), rock=solid('#5f6a60',{roughness:1});
  if(['snowball-earth','huronian-glaciation'].includes(id)){
    const globe=new THREE.Group();g.add(globe);
    const sphere=ball(1.35,iceMat,0,.2,0);globe.add(sphere);
    sphere.material=solid('#e4f1f5',{roughness:.56});
    // Ice sheets, not a plain white ball: irregular caps sitting proud of the frozen ocean.
    const sheetMat=solid('#d2e5ec',{roughness:.58});
    for(let i=0;i<9;i++){
      const th=rng()*6.283, ph=Math.acos(2*rng()-1);
      const sx=Math.sin(ph)*Math.cos(th), sy=Math.cos(ph), sz=Math.sin(ph)*Math.sin(th);
      const patch=object(new THREE.SphereGeometry(.38+rng()*.22,18,12),sheetMat);
      patch.position.set(sx*1.33,sy*1.33+.2,sz*1.33);
      patch.lookAt(0,.2,0); patch.scale.set(1.35,1.05,.12); globe.add(patch);
    }
    for(let i=0;i<16;i++){
      const th=rng()*6.283, ph=.28+rng()*2.55, pts=[];
      for(let j=0;j<=7;j++){
        const dt=(j/7-.5)*.52, dp=Math.sin(j*.8+i)*.028;
        const t=th+dt, p=ph+dp;
        pts.push(V(Math.sin(p)*Math.cos(t)*1.372,Math.cos(p)*1.372+.2,Math.sin(p)*Math.sin(t)*1.372));
      }
      globe.add(path(pts,.014,solid('#5d8ba0',{transparent:true,opacity:.72})));
    }
    const haze=object(new THREE.TorusGeometry(1.42,.018,6,90),glass('#bfe5ef',.45));haze.rotation.x=Math.PI/2;globe.add(haze);
    const iceDust=dust(160,'#d6edf2',()=>[(rng()-.5)*3.8,(rng()-.5)*2.4+ .2,(rng()-.5)*2.4]);globe.add(iceDust);
    m.push((d,t)=>{globe.rotation.y=t*.03;});
    return;
  }
  const land=new THREE.Group();g.add(land);
  const snowMat=solid('#dfeff4',{roughness:.55});
  land.add(block(5.5,.5,3.2,deep,0,-1.7),block(5.5,.16,3.3,iceMat,0,-1.42),block(5.4,.04,3.15,snowMat,0,-1.33));
  const top=-1.31;
  if(id==='younger-dryas'){
    // Permafrost polygon network and low ice-wedge ridges.
    for(let j=0;j<4;j++){const z=-1.35+j*.86;const pts=[];for(let i=0;i<=22;i++){const x=-2.5+i*.22;pts.push(V(x,top+.01,z+Math.sin(i*.9+j*1.7)*.035));}land.add(path(pts,.008,solid('#7a9aa8',{transparent:true,opacity:.65})));}
    for(let i=0;i<7;i++){const x=-2.25+i*.72;const pts=[];for(let j=0;j<=10;j++){const z=-1.5+j*.31;pts.push(V(x+Math.sin(j*1.3+i)*.05,top+.012,z));}land.add(path(pts,.008,solid('#7a9aa8',{transparent:true,opacity:.55})));
      if(i%2===0){const ridge=block(.08,.09,.72,solid('#b9dbe2',{roughness:.5}),x+.04,top+.02,-.75);ridge.rotation.y=.12;land.add(ridge);}}
    for(let i=0;i<16;i++){
      const x=-2.35+rng()*4.7,z=-1.25+rng()*2.55;
      for(let k=0;k<3;k++)land.add(path([[x,top,z],[x+(rng()-.5)*.1,top+.13+rng()*.05,z+(rng()-.5)*.1],[x+(rng()-.5)*.16,top+.24+rng()*.06,z+(rng()-.5)*.12]],.007,solid(k%2?'#7d8a54':'#99a267')));
      land.add(block(.06,.09,.06,solid('#6e7b4d'),x,top+.02,z));
    }
    for(let i=0;i<4;i++){const pond=block(.42,.025,.28,solid('#5d8795',{roughness:.3,metalness:.1}),-1.8+i*1.15,top+.005,.55+(i%2)*.3);pond.rotation.y=.2;land.add(pond);}
  } else {
    const sheet=ball(1.55,iceMat,0,top-.28,0);sheet.scale.set(1.15,.28,.9);land.add(sheet);
    const cap=ball(1.52,snowMat,0,top-.12,0);cap.scale.set(1.1,.18,.86);land.add(cap);
    for(let i=0;i<12;i++){const x=-2.3+rng()*4.6,z=-1.1+rng()*2.2;land.add(path([[x,top-.06,z],[x+(rng()-.5)*.3,top-.02,z+(rng()-.5)*.22]],.012,solid('#7eaebd',{transparent:true,opacity:.7})));}
    for(let i=0;i<3;i++){const t=object(new THREE.ConeGeometry(1.15-i*.12,1.4-i*.1,18,1,true),iceMat,-1.4+i*1.4,top-.55,-1.55);t.rotation.x=Math.PI/2;t.rotation.z=Math.PI;t.scale.z=.55;land.add(t);}
    for(let i=0;i<7;i++)land.add(object(new THREE.DodecahedronGeometry(.1+rng()*.1,0),rock,-2.2+rng()*4.4,top+.02,-1+rng()*2));
  }
}
function buildWorldWarII(g,c,m,rng){
  const steel=solid('#59666a',{metalness:.45,roughness:.55});
  const steelDark=solid('#354247',{metalness:.4,roughness:.6});
  const deckWood=solid('#826b52',{roughness:.85});
  const khaki=solid('#8a7b5b',{roughness:.9}), navy=solid('#2f3846',{roughness:.85});
  const white=solid('#eee8da',{roughness:.8}), rubble=solid('#6f675b',{roughness:1});
  pedestal(g,6.4,3.9);
  // Dark water and a battleship deck with the surrender table in the foreground.
  g.add(block(6.2,.1,3.7,glass('#203744',.52),0,-2.03,0));
  // Bow wave and hull waterline make the deck read as a ship at sea.
  g.add(path([[-2.6,-1.93,1.8],[-1.7,-1.97,2.05],[0,-1.99,2.15],[1.7,-1.97,2.05],[2.6,-1.93,1.8]],.03,glass('#bed7df',.32)));
  g.add(block(4.8,.025,.06,glass('#d4e4e8',.4),0,-1.9,1.63));
  g.add(block(4.9,.5,1.9,steelDark,0,-1.86,.55),block(4.9,.16,2.2,steel,0,-1.5,.65));
  for(let i=0;i<11;i++)g.add(block(4.6,.025,.17,i%2?deckWood:solid('#756047'),0,-1.4,-.38+i*.2));
  for(let i=0;i<=12;i++){const x=-2.4+i*.4;g.add(rod(V(x,-1.4,1.7),V(x,-.95,1.7),.012,metal()));}
  g.add(rod(V(-2.4,-1.02,1.7),V(2.4,-1.02,1.7),.012,metal()),rod(V(-2.4,-.84,1.7),V(2.4,-.84,1.7),.01,metal()));
  // Portholes along the visible hull.
  for(let i=0;i<7;i++)g.add(ball(.028,lit('#e9c98b'),-2.1+i*.68,-1.67,1.52));
  // Bridge and mast at the rear-left.
  g.add(block(1.35,.72,1.05,steel,-1.55,-1.06,-.05),block(.9,.45,.75,steelDark,-1.55,-.62,-.05));
  for(let i=0;i<4;i++)g.add(block(.16,.12,.02,lit('#d9b878'),-1.92+i*.25,-.95,1.04));
  g.add(rod(V(-1.55,-.4,-.05),V(-1.55,1.05,-.05),.025,metal()));
  g.add(ring(.18,.012,metal(),-1.55,.72,-.05));
  const flags=new THREE.Group();flags.position.set(-1.55,.55,-.05);g.add(flags);
  for(let i=0;i<5;i++)flags.add(block(.05,.32-i*.03,.01,solid(['#b84d46','#eee3cc','#3d668b'][i%3]),.42+i*.08,-.2+i*.05,0));
  // Main turret and its barrel.
  g.add(cyl(.4,.16,steel,-1.95,-1.3,.85),cyl(.26,.1,steelDark,-1.95,-1.2,.85));
  const gun=cyl(.07,.7,steelDark,-1.95,-1.12,1.2);gun.rotation.x=Math.PI/2;g.add(gun,ring(.08,.015,metal(),-1.95,-1.1,1.55));
  // Surrender table: white cloth, documents, chairs and two delegations.
  g.add(block(.98,.06,.56,white,.2,-1.24,1.0),block(.88,.2,.02,white,.2,-1.34,1.28));
  for(const x of [-.24,.64])for(const z of [.8,1.2])g.add(rod(V(x,-1.4,z),V(x,-1.27,z),.018,deckWood));
  g.add(block(.27,.015,.2,white,-.12,-1.19,1.02),block(.22,.012,.17,white,.42,-1.19,.95),block(.025,.09,.012,solid('#253849'),.58,-1.16,.93));
  for(const x of [-.55,.75]){g.add(block(.26,.06,.24,deckWood,x,-1.28,.56),block(.04,.3,.24,deckWood,x,-1.1,.44));}
  figure(g,-.55,.55,'#8a7b5b','#c6a27d',1.12,'#8a7b5b',-1.4);
  figure(g,.95,.55,'#8a7b5b','#cba67e',1.12,'#8a7b5b',-1.4);
  figure(g,-.15,.45,'#8a7b5b','#b99572',1.12,'#5c5342',-1.4);
  figure(g,.35,.45,'#8a7b5b','#c6a27d',1.12,'#5c5342',-1.4);
  figure(g,-.55,.5,'#2f3846','#d0aa83',1.12,'#202833',-1.4);
  figure(g,.95,.5,'#2f3846','#c7a179',1.12,'#202833',-1.4);
  // Ruined city on the land strip behind the ship.
  g.add(block(5.4,.14,1.5,rubble,0,-1.93,-1.2));
  const city=[[.1,.7,.72],[.72,.95,.8],[1.35,.6,.65],[1.98,.9,.76],[2.55,.5,.58]];
  const smokes=[];
  for(const [x,h,w] of city){
    g.add(block(w*.52,h,.7,rubble,x-w*.24,-1.85+h/2,-1.3));
    const h2=h*(.5+rng()*.32);
    g.add(block(w*.4,h2,.68,solid('#5f584c'),x+w*.27,-1.85+h2/2,-1.28));
    const top=block(w*.82,.12,.62,solid('#514b42'),x,-1.85+h,-1.3);top.rotation.z=(rng()-.5)*.28;g.add(top);
    for(let k=0;k<3;k++){const chunk=block(w*(.18+rng()*.2),.1+rng()*.12,.2+rng()*.1,solid('#5b554a'),x+(rng()-.5)*w,-1.85+h+.08+rng()*.1,-1.25);chunk.rotation.z=(rng()-.5)*.5;chunk.rotation.y=(rng()-.5)*.4;g.add(chunk);}
    for(let k=0;k<4;k++){const deb=block(.1+rng()*.12,.08+rng()*.08,.12+rng()*.1,solid('#756c5b'),x+(rng()-.5)*w*1.1,-1.82,-1.15+rng()*.3);deb.rotation.y=rng()*1.2;g.add(deb);}
    for(let i=0;i<3;i++)g.add(block(.1,.14,.02,solid(i%3?'#202729':'#6d5438'),x-w*.28+i*.2,-1.4+h*.55,-.94));
    for(let i=0;i<3;i++)g.add(rod(V(x-.24+i*.24,-1.85+h*.72,-1.28),V(x-.16+i*.24,-1.85+h+.16,-1.24),.006,metal()));
    const s=dust(30,'#8b8780',()=>[(rng()-.5)*w*.8,rng()*1.2,(rng()-.5)*.45]);s.position.set(x,-1.55+h,-1.2);s.userData.baseY=-1.55+h;g.add(s);smokes.push(s);
  }
  // A tank and scattered soldiers in the ruins.
  const tank=new THREE.Group();tank.position.set(1.75,-1.72,-1.18);g.add(tank);
  tank.add(block(.78,.26,.42,solid('#4c5348'),0,0,0),block(.46,.18,.36,solid('#5a6052'),-.02,.2,0));
  const barrel=cyl(.045,.48,solid('#3a4037'),.4,.22,0,.045);barrel.rotation.z=Math.PI/2;tank.add(barrel);
  for(const x of [-.28,.28])for(const z of [-.18,.18]){const w=object(new THREE.CylinderGeometry(.12,.12,.07,14),solid('#30352d'),x,-.13,z);w.rotation.x=Math.PI/2;tank.add(w);}
  for(let i=0;i<8;i++)figure(g,-2.2+rng()*4.6,-1.2+rng()*.6,i%3?'#706548':'#4a5248','#c4a07a',.8,'#4b4436',-1.8);
  // Searchlight, fire glow and drifting smoke.
  const beam=object(new THREE.ConeGeometry(.55,2.4,18,1,true),glass('#ffe5ae',.08),-1.9,.2,.5);beam.rotation.z=Math.PI/2-.2;g.add(beam,glow('#ffd18a',.8,.5).translateY(.4));
  for(let i=0;i<5;i++)g.add(glow('#e88b4c',.5,.35).translateX(-2+i*.9).translateY(-1.35).translateZ(-.7));
  m.push((d,t)=>{smokes.forEach((s,i)=>{s.position.y=s.userData.baseY+Math.sin(t*.35+i)*.12;s.rotation.y=t*.04;});flags.rotation.y=Math.sin(t*.8)*.08;beam.material.opacity=.06+Math.sin(t*.4)*.03;});
}
function catastropheSection(g,c,m,rng,entry){
  const id=String(entry?.id||'').replace(/^time\./,'');
  pedestal(g,6,3.6);
  const rock=solid('#6d6257',{roughness:1}), dark=solid('#3f3b35',{roughness:1});
  if(id==='mountain-building'){
    const fold=new THREE.Group();fold.rotation.y=-.18;g.add(fold);
    for(let j=0;j<6;j++){
      const y=-1.85+j*.26,mat=solid(['#5f6e72','#7a6c57','#96836a','#b4a07c'][j%4],{roughness:1});
      for(let i=0;i<8;i++){
        const x=-2.4+i*.66,h=.12+rng()*.08;
        const q=block(.62,h,2.1,mat,x,y+Math.sin(i*.8+j)*.18,0);q.rotation.z=Math.sin(i*.8+j)*.22;fold.add(q);
      }
    }
    for(let i=0;i<5;i++){const x=-2+i*.9;fold.add(object(new THREE.ConeGeometry(.28+rng()*.2,.6+rng()*.4,5),solid('#8c9184',{roughness:1}),x,.25,-.5+rng()*1));}
    for(const s of [-1,1]){g.add(rod(V(s*2.6,.5,0),V(s*1.7,.5,0),.035,lit(c.color)));g.add(object(new THREE.ConeGeometry(.12,.28,6),lit(c.color),s*1.6,.5,0).rotateZ(s*Math.PI/2));}
    return;
  }
  if(id==='plate-tectonics-onset'){
    const section=new THREE.Group();g.add(section);
    section.add(block(2.6,.5,2.4,solid('#7b6b58',{roughness:1}),-1.3,-1.55,0),block(2.6,.5,2.4,solid('#6b5f50',{roughness:1}),1.3,-1.55,0));
    const slab=block(2.4,.18,2.2,solid('#8f7a61',{roughness:1}),.4,-.22,0);slab.rotation.z=-.34;section.add(slab);
    const down=block(1.2,.18,2.0,solid('#5a5148',{roughness:1}),-.75,-.85,0);down.rotation.z=-.9;section.add(down);
    section.add(path([[-.2,-.4,0],[-.35,-.9,.2],[-.2,-1.4,-.1]],.06,lit('#d8793f')));
    for(let i=0;i<7;i++)section.add(ball(.05,lit('#e79a5b'),-.3+rng()*.4,-.1+rng()*1.1,rng()*1.4));
    for(const s of [-1,1]){g.add(rod(V(s*2.4,-.1,.9),V(s*1.3,-.1,.9),.04,lit('#9ec2d3')));g.add(object(new THREE.ConeGeometry(.12,.3,6),lit('#9ec2d3'),s*1.2,-.1,.9).rotateZ(s*Math.PI/2));}
    return;
  }
  if(['end-ordovician-extinction','late-devonian-extinction'].includes(id)){
    const sea=block(5.5,1.5,3.1,glass('#2f6f7e',.34),0,-.35,0);g.add(sea);
    for(let i=0;i<8;i++){const x=-2.2+i*.62,z=-.6+rng()*1.4;g.add(ball(.16,solid('#8c9d93',{roughness:.7}),x,-1.05,z));g.add(path([[x,-1.05,z],[x+.2,-1.0,z+.1],[x+.35,-1.07,z]],.02,solid('#b7c2b1')));}
    for(let i=0;i<10;i++)g.add(ball(.03,lit('#9db9a4'),-2.4+rng()*4.8,-.9+rng()*1.2,rng()*2.4));
    g.add(block(5.5,.08,3.1,solid('#3e4f4a',{roughness:1}),0,.45,0));
    for(let i=0;i<4;i++)g.add(path([[-2+i*1.3,.5,-1],[-2+i*1.3,.5,1]],.02,solid('#88a997',{transparent:true,opacity:.5})));
    return;
  }
  if(id==='gunpowder'){
    const barrel=cyl(.22,1.4,solid('#5c4a37',{metalness:.5,roughness:.5}),-.8,-.7,0);barrel.rotation.z=Math.PI/2;g.add(barrel);
    g.add(ring(.22,.03,metal(),-.1,-.7,0),ring(.22,.03,metal(),-1.5,-.7,0));
    g.add(cyl(.09,.24,solid('#8e7b60'),-1.62,-.7,0,.14));
    const fire=dust(80,'#f2b05f',()=>[(rng()-.5)*.5,-.55+rng()*.9,(rng()-.5)*.4]);g.add(fire);
    g.add(block(1.0,.12,.7,solid('#4d4132'),.9,-1.55,.3),block(.16,.55,.16,solid('#5a4b38'),1.3,-1.25,.3));
    m.push((d,t)=>{fire.scale.setScalar(1+Math.sin(t*.6)*.06);fire.rotation.y=t*.08;});
    return;
  }
  if(id==='black-death'){
    const city=new THREE.Group();g.add(city);
    for(let i=0;i<7;i++){const x=-2+i*.65,z=-.2+(i%2)*.4;city.add(block(.5,.6+rng()*.5,.6,solid('#8b7f6c'),x,-1.5,z));city.add(object(new THREE.ConeGeometry(.3,.35,4),solid('#6f6251'),x,-.9,z));}
    city.add(block(3.6,.9,.25,solid('#6d6254'),0,-.45,.6),block(1.2,1.2,.3,solid('#5d5347'),-.8,-.45,.62));
    for(let i=0;i<5;i++)city.add(block(.06,.5,.06,solid('#d8d0bd'),-1.8+i*.85, .1,1.2));
    g.add(block(2.0,.06,1.0,solid('#4a4437',{roughness:1}),0,-1.95,.6));
    return;
  }
  if(id==='fall-of-constantinople'){
    const wall=new THREE.Group();g.add(wall);
    wall.add(block(5.4,.25,.3,solid('#8a7f6b'),0,-1.7,1.1));
    for(let i=0;i<5;i++){const x=-2.2+i*1.0;wall.add(block(.5,1.4,.4,solid('#968a74'),x,-.6,.9));wall.add(block(.6,.18,.55,solid('#7d715e'),x,.15,.9));}
    wall.add(block(1.0,1.9,.7,solid('#7a6e5b'),-1.8,-.35,.5),object(new THREE.ConeGeometry(.7,.5,6),solid('#6a5c4c'),-1.8,.9,.5));
    for(let i=0;i<3;i++)g.add(rod(V(1.4+i*.6,-1.6,1.4),V(1.4+i*.6,-1.6,.2),.05,solid('#6c5843')));
    g.add(block(1.2,.05,.25,solid('#5a4a37'),1.7,-1.58,.4));
    return;
  }
  if(id==='american-revolution'){
    g.add(block(5.5,.12,3.1,solid('#54684b',{roughness:1}),0,-1.85,0));
    for(let i=0;i<6;i++){
      const x=-2+i*.75,z=-.55+(i%2)*.55,coat=solid(i%2?'#42566b':'#6d3f36',{roughness:.8});
      g.add(cyl(.055,.28,solid('#d8c8ae'),x-.08,-1.55,z),cyl(.055,.28,solid('#d8c8ae'),x+.08,-1.55,z));
      g.add(block(.3,.52,.22,coat,x,-1.22,z));
      g.add(ball(.15,solid('#d6b18d'),x,-.92,z));
      g.add(object(new THREE.ConeGeometry(.19,.16,3),solid('#2d2b28'),x,-.78,z));
      g.add(rod(V(x-.12,-1.1,z),V(x-.22,-1.35,z),.045,coat));
      g.add(rod(V(x+.12,-1.1,z),V(x+.26,-1.28,z),.04,coat));
      g.add(rod(V(x+.05,-1.05,z),V(x+.3,-1.7,z+.1),.022,solid('#6a4d32')));
      g.add(block(.04,.04,.04,metal(),x+.3,-1.7,z+.1));
    }
    // Flag pole with a striped Continental flag and a small field cannon.
    g.add(rod(V(1.4,-1.85,1.1),V(1.4,-.4,1.1),.03,solid('#6b5540')));
    const flag=new THREE.Group();flag.position.set(1.4,-.55,1.1);g.add(flag);
    for(let i=0;i<7;i++)flag.add(block(.62,.035,.02,solid(i%2?'#ece6d5':'#9c4b44'),.32,-i*.045,0));
    flag.add(block(.26,.2,.02,solid('#314b70'),.48,-.32,0));
    const cannon=cyl(.11,.42,solid('#4c443a',{metalness:.5}),1.9,-1.55,-.9);cannon.rotation.z=Math.PI/2;g.add(cannon);
    for(const s of [-1,1])g.add(object(new THREE.CylinderGeometry(.2,.2,.06,18),solid('#5b4a38'),1.9,-1.6,-.9+s*.17));
    return;
  }
  if(id==='world-war-ii'){buildWorldWarII(g,c,m,rng);return;}
  if(id==='world-war-i'||id==='world-war-ii'){
    const land=block(5.5,.12,3.1,solid('#6d6655',{roughness:1}),0,-1.85,0);g.add(land);
    // Zig-zag trench lines with sandbag parapets, not a row of solid blocks.
    for(const z0 of [-.55,.45]){
      const pts=[];for(let i=0;i<=18;i++){const x=-2.45+i*.27;pts.push([x,-1.65,z0+(i%2?.16:-.16)]);}
      g.add(path(pts,.075,solid('#423d33',{roughness:1})));
      for(let i=0;i<=18;i++){const x=-2.45+i*.27,z=z0+(i%2?.16:-.16);for(const s of [-1,1])g.add(ball(.055,solid('#9a8f78',{roughness:.95}),x,-1.7,z+s*.12));}
    }
    for(let i=0;i<16;i++){const x=-2.4+i*.3,z=-1.3+(i%3)*1.05;g.add(rod(V(x,-1.78,z),V(x+.1,-1.42,z+.05),.012,solid('#7b7365')));g.add(rod(V(x+.2,-1.78,z),V(x+.1,-1.4,z-.05),.01,solid('#7b7365')));g.add(line([[x,-1.52,z],[x+.28,-1.55,z]],'#8d8474',.35));}
    // A broken farmhouse and rubble at the rear.
    g.add(block(1.2,.8,.3,solid('#7d7464',{roughness:1}),1.45,-1.4,-.65),block(.9,.5,.3,solid('#6a6152'),1.75,-1.55,-.25),block(.55,.9,.3,solid('#716758'),1.05,-1.35,-.2));
    for(let i=0;i<9;i++)g.add(block(.1+rng()*.16,.08,.12,solid('#8b8172'),.5+rng()*2,-1.75,-1+rng()*1.8));
    if(id==='world-war-ii'){
      const tank=new THREE.Group();tank.position.set(-1.3,-1.62,.35);g.add(tank);
      tank.add(block(.9,.28,.45,solid('#4e5248'),0,0,0),block(.52,.2,.38,solid('#5c6153'),-.05,.2,0));
      const barrel=cyl(.055,.55,solid('#3f443b'),.45,.24,0,.055);barrel.rotation.z=Math.PI/2;tank.add(barrel);
      for(const x of [-.32,.32])for(const z of [-.2,.2]){const w=object(new THREE.CylinderGeometry(.13,.13,.08,14),solid('#33362f'),x,-.15,z);w.rotation.x=Math.PI/2;tank.add(w);}
    } else {g.add(block(1.0,.18,.5,solid('#5a5146'),-1.2,-1.65,.5),object(new THREE.ConeGeometry(.2,.15,8),solid('#4d4439'),-1.2,-1.55,.5));}
    for(let i=0;i<4;i++){const smoke=dust(26,'#a9a49a',()=>[(rng()-.5)*.5,-1.3+rng()*1.2,(rng()-.5)*.4]);smoke.position.set(1.5-i*.35,-.3,.2);g.add(smoke);}
    for(let i=0;i<5;i++)g.add(ball(.06,lit('#c86454'),-1.6+i*.8,-1.55,.9));
    return;
  }
  for(let j=0;j<4;j++)g.add(block(5.5,.32,3.1,solid(['#5f584c','#786b58','#93836a'][j%3],{roughness:1}),0,-1.7+j*.32,0));
  for(let i=0;i<4;i++)g.add(object(new THREE.ConeGeometry(.3,.5,5),solid('#8b8172'),-1.8+i*1.1,.15,-.3+rng()*.6));
  m.push((d,t)=>{});
}
function fossilStudy(g,c,m,rng,entry){
 const slab=new THREE.Group();slab.rotation.set(.48,0,.015);g.add(slab);
 slab.add(block(5.85,.42,3.95,solid('#463f36',{roughness:1}),0,-.42));
 for(let j=0;j<3;j++)slab.add(block(5.9,.055,4.0,solid(['#5d5446','#6b5f4e','#7a6b56'][j],{roughness:1}),0,-.67-j*.11));
 slab.add(block(5.55,.06,3.68,solid('#5c5242',{roughness:1}),0,-.22));
 slab.add(block(5.3,.035,3.45,solid('#6f604b',{roughness:1}),0,-.185));
 const bone=solid('#f7e8c8',{emissive:'#7a6143',emissiveIntensity:.15,roughness:.68});
 // Raking museum light separates the ivory fossil from the dark matrix.
 const lamp=new THREE.PointLight('#ffe0b2',2.1,9,1.35);lamp.position.set(2.2,3.2,2.6);g.add(lamp);
 const rim=new THREE.DirectionalLight('#9ec4d8',.8);rim.position.set(-3,4,-2);g.add(rim);
 // Entries without a profile still need a specific fossil vocabulary. Map the
 // remaining museum entries to explicit branches so none falls back to a bare
 // slab or a meaningless row of bones.
 const eid=entry?.id||'';
 if(!c.profile){
   if(/first-dinosaurs/.test(eid))c.profile='first-dinosaurs';
   else if(/ediacaran/.test(eid))c.profile='ediacaran';
   else if(/first-fish/.test(eid))c.profile='fish';
   else if(/first[-_]birds?/.test(eid))c.profile='bird';
   else if(/first-amphibians|first-tetrapods/.test(eid))c.profile='limb';
   else if(/permian/.test(eid))c.profile='permian';
   else if(/triassic/.test(eid))c.profile='dinosaur';
   else if(/paleocene|paleogene|pliocene|mammal-radiation|first_primates/.test(eid))c.profile='mammal';
   else if(/neanderthals|hominins|rise-homo/.test(eid))c.profile='human';
   else if(/megafauna/.test(eid))c.profile='megafauna';
   else if(/anthropocene/.test(eid))c.profile='anthropocene';
   else c.profile='assemblage';
 }
 if(c.profile==='first-dinosaurs'){
   const printMat=solid('#40382d',{roughness:.95}), edgeMat=solid('#86735a',{roughness:.9});
   const foot=(x,z,rot,scale=1)=>{
     const f=new THREE.Group();f.position.set(x,-.178,z);f.rotation.y=rot;f.scale.setScalar(scale);slab.add(f);
     for(const [ang,len] of [[-.36,.52],[0,.62],[.36,.50]]){
       const toeGroup=new THREE.Group();toeGroup.rotation.y=ang;f.add(toeGroup);
       toeGroup.add(block(len,.014,.060,printMat,len*.50,.010,0));
       const claw=object(new THREE.ConeGeometry(.024,.12,7),edgeMat,len*.94,.012,0);claw.rotation.z=-Math.PI/2;claw.scale.set(1,.18,.46);toeGroup.add(claw);
     }
     const heel=ball(.055,printMat,-.15,.006,0);heel.scale.set(1.0,.026,.72);f.add(heel);
   };
   const left=[[-2.25,-.72],[-1.28,-.38],[-.34,.00],[.60,.32],[1.55,.58]];
   const right=[[-2.40,.14],[-1.45,.50],[-.50,.80],[.45,1.02],[1.40,.94]];
   for(const [x,z] of left)foot(x,z,-.10,1.30);
   for(const [x,z] of right)foot(x,z,-.16,1.24);
   // Tail-drag mark between the two trackways.
   slab.add(path([[-2.7,-.22,-.30],[-1.8,-.22,-.12],[-.7,-.22,-.02],[.5,-.22,-.02],[1.6,-.22,.06]],.018,edgeMat));
   // Small ivory bone fragments and a field label plate.
   slab.add(ball(.11,bone,-2.55,-.17,1.20),ball(.07,bone,-2.38,-.17,1.28),rod(V(-1.95,-.17,1.30),V(-1.62,-.16,1.36),.022,bone));
   slab.add(block(.52,.03,.30,solid('#2d2924'),2.15,-.17,1.35));
   for(let i=0;i<3;i++)slab.add(block(.36,.002,.013,solid('#c9b995'),2.15,-.15,1.30+i*.045));
   m.push((d,t)=>{});
   return;
 }
 if(c.profile==='benthic'){for(let j=0;j<6;j++){const x=-1.8+(j%3)*1.8,z=-.8+Math.floor(j/3)*1.6;const shell=ball(.5,bone,x,0,z);shell.scale.set(1,.25,.8);slab.add(shell);for(let k=0;k<6;k++){const a=k/5*Math.PI;slab.add(rod(V(x,-.02,z-.15),V(x+Math.cos(a)*.45,.07,z+Math.sin(a)*.35),.012,solid('#a4967c')));}}}
 else if(c.profile==='ediacaran'){
    // Ediacaran sea-floor impressions: Charnia fronds, Aspidella holdfasts,
    // Dickinsonia, Spriggina, Kimberella and a microbially matted surface.
    const matGround=solid('#59614f',{roughness:1}), matDark=solid('#4b5546',{roughness:1});
    slab.add(block(5.3,.05,3.55,matGround,0,-.215,0));
    slab.add(block(5.18,.025,3.42,matDark,0,-.178,0));
    const impression=solid('#c6b596',{roughness:.94}), darkImp=solid('#7d6e59',{roughness:.96});
    const relief=solid('#ddd0b2',{roughness:.9});
    // Microbial mat patches: low, irregular films rather than flat paint.
    for(const [x,z,r] of [[-2.45,-1.15,.38],[-.75,-.95,.50],[1.55,-1.25,.34],[2.35,.55,.42],[-1.95,1.10,.28]]){
      const film=ball(r,matDark,x,-.172,z);film.scale.set(1.25,.035,.95);slab.add(film);
      for(let k=0;k<5;k++)slab.add(ring(r*(.35+k*.14),.004,solid('#6b745e',{roughness:1}),x,-.168,z));
    }
    // Four frond colonies with a central stem and leaf-like lateral branches.
    const frondColony=(x,z,count,scale)=>{
      const stem=rod(V(x,-.155,z),V(x,-.155,z+1.9*scale),.028,relief);
      slab.add(stem);
      const base=ball(.22*scale,darkImp,x,-.162,z);base.scale.set(1.15,.16,.85);slab.add(base);
      for(let k=0;k<count;k++){
        const t=(k+1)/(count+1), zz=z+.22*scale+t*1.52*scale, len=(.16+Math.sin(t*Math.PI)*.34)*scale;
        for(const s of [-1,1]){
          const branch=rod(V(x,-.15,zz),V(x+s*len,-.145,zz+.04*scale),.018,relief);slab.add(branch);
          const leaf=ball(.10*scale,impression,x+s*len*1.03,-.138,zz+.04*scale);
          leaf.scale.set(1.55,.035,.60);leaf.rotation.y=s*.18;slab.add(leaf);
        }
      }
    };
    frondColony(-2.15,-.62,10,.96);
    frondColony(-1.02,-1.12,11,.82);
    frondColony(.52,-.82,12,1.02);
    frondColony(1.86,-.38,9,.78);
    // Large Dickinsonia with radial muscular ridges.
    const dick=new THREE.Group();dick.position.set(-.72,-.158,.66);dick.rotation.y=-.22;slab.add(dick);
    const dickBody=ball(.43,darkImp,0,0,0);dickBody.scale.set(1.35,.13,.88);dick.add(dickBody);
    const dickInner=ball(.36,impression,0,.006,0);dickInner.scale.set(1.22,.07,.78);dick.add(dickInner);
    for(let k=0;k<18;k++){
      const a=k/18*TAU; const rib=ball(.04,relief,Math.cos(a)*.34,0,Math.sin(a)*.24);
      rib.scale.set(1.2,.35,.45);dick.add(rib);
    }
    // Spriggina: a segmented, stem-like body with a crescent head.
    const sprig=new THREE.Group();sprig.position.set(1.95,-.16,.62);sprig.rotation.y=.42;slab.add(sprig);
    for(let k=0;k<13;k++){
      const seg=ball(.085,impression,0,0,k*.075);
      seg.scale.set(.75,.18,1.0);sprig.add(seg);
    }
    const sprigHead=ball(.12,darkImp,0,0,-.12);sprigHead.scale.set(1.2,.25,.8);sprig.add(sprigHead);
    // Holdfast discs with concentric rings and radiating grooves.
    for(const [x,z,r] of [[-2.35,-1.15,.24],[-1.55,1.12,.18],[.18,-1.32,.20],[2.30,.22,.27],[1.28,1.15,.15]]){
      const disc=ball(r,darkImp,x,-.155,z);disc.scale.set(1,.12,.9);slab.add(disc);
      slab.add(ring(r*.72,.008,impression,x,-.145,z));
      slab.add(ring(r*.94,.006,relief,x,-.142,z));
      for(let k=0;k<8;k++)slab.add(rod(V(x,-.15,z),V(x+Math.cos(k*TAU/8)*r*.72,-.143,z+Math.sin(k*TAU/8)*r*.72),.005,impression));
    }
    const kim=new THREE.Group();kim.position.set(-2.10,-.16,1.10);kim.rotation.y=-.35;slab.add(kim);
    const oval=ball(.32,darkImp,0,0,0);oval.scale.set(1.35,.10,.72);kim.add(oval);
    const kimInner=ball(.27,impression,0,.008,0);kimInner.scale.set(1.24,.06,.66);kim.add(kimInner);
    for(let k=0;k<6;k++)kim.add(rod(V(-.28,-.02,-.15+k*.075),V(.28,-.02,-.15+k*.075),.012,impression));
    // Fine current ripples and tool/scale references.
    for(let k=0;k<15;k++){const z=-1.35+k*.19;slab.add(path([[-2.55,-.175,z],[-1.4,-.175,z+.07],[0,-.175,z-.05],[1.4,-.175,z+.04],[2.55,-.175,z]],.004,solid('#6e7a67',{roughness:1})));}
    slab.add(block(.55,.055,.09,warm(),2.20,-.16,1.28),block(.16,.13,.05,impression,1.98,-.11,1.28));
    for(let i=0;i<5;i++)slab.add(block(.10,.015,.055,solid(i%2?'#efe3c6':'#3f3830'),1.55+i*.11,-.17,1.52));
    m.push((d,t)=>{});
  }
 else if(c.profile==='dinosaur'){
    // Articulated theropod fossil: skull with jaw and teeth, neck/tail
    // vertebrae, rib cage, pelvis, forelimbs and hind limbs, plus field tools.
    slab.add(block(5.3,.045,3.55,solid('#5b4e40',{roughness:.98}),0,-.215,0));
    const skel=new THREE.Group();skel.position.y=-.12;skel.scale.setScalar(1.18);slab.add(skel);
    const spine=[[-2.35,.04,0],[-1.7,.10,0],[-1.0,.22,0],[-.2,.30,0],[.55,.34,0],[1.05,.40,0],[1.55,.50,0]];
    skel.add(path(spine,.055,bone));
    for(let i=0;i<12;i++){const t=i/11,x=-2.35+t*3.9,y=.04+.46*t;skel.add(ball(.075+Math.sin(t*Math.PI)*.02,bone,x,y,0));}
    // Tail fan and displaced tail bones.
    for(let i=0;i<6;i++)skel.add(rod(V(-2.35-i*.08,.02,0),V(-2.45-i*.12,.01,(i%2?-.12:.12)),.028,bone));
    // Rib cage.
    for(let i=0;i<8;i++){const x=-.85+i*.24,y=.20+.12*(i/7);for(const s of [-1,1]){skel.add(rod(V(x,y,0),V(x-.05,y-.12,s*.42),.026,bone),rod(V(x-.05,y-.12,s*.42),V(x+.08,y-.24,s*.62),.022,bone));}}
    // Pelvis and shoulder girdle.
    for(const s of [-1,1]){skel.add(ball(.15,bone,-.12,.12,s*.18));skel.add(ball(.10,bone,.98,.36,s*.16));skel.add(rod(V(-.12,.12,s*.18),V(-.42,.04,s*.30),.038,bone));}
    // Hind limbs.
    for(const s of [-1,1]){skel.add(rod(V(-.18,.12,s*.24),V(-.28,-.10,s*.58),.065,bone),rod(V(-.28,-.10,s*.58),V(-.06,-.22,s*.62),.048,bone),rod(V(-.06,-.22,s*.62),V(.10,-.26,s*.50),.035,bone));for(let j=0;j<3;j++)skel.add(rod(V(.10,-.26,s*.50),V(.24+j*.04,-.29,s*(.38+j*.08)),.012,bone));}
    // Forelimbs with claws.
    for(const s of [-1,1]){skel.add(rod(V(1.02,.34,s*.15),V(1.22,.12,s*.28),.032,bone),rod(V(1.22,.12,s*.28),V(1.36,.02,s*.22),.022,bone));for(let j=0;j<2;j++)skel.add(rod(V(1.36,.02,s*.22),V(1.44+j*.02,-.03,s*(.14+j*.06)),.008,bone));}
    // Skull, jaw, eye socket and teeth.
    const skull=new THREE.Group();skull.position.set(2.02,.56,0);skull.scale.setScalar(1.12);skel.add(skull);
    const cranium=ball(.27,bone,0,0,0);cranium.scale.set(1.55,.78,.80);skull.add(cranium);
    const snout=ball(.18,bone,.36,-.02,0);snout.scale.set(1.55,.50,.58);skull.add(snout);
    const jaw=path([[.02,-.22,0],[.40,-.16,0],[.72,-.04,0]],.042,bone);skull.add(jaw);
    const jaw2=path([[.08,-.20,.10],[.44,-.15,.10],[.70,-.04,.10]],.020,bone);skull.add(jaw2);
    const socket=ring(.095,.020,solid('#6e604d'),.10,.06,.24);socket.rotation.x=Math.PI/2;skull.add(socket);skull.add(ball(.065,solid('#3b3328'),.10,.06,.24));
    skull.add(ring(.045,.014,solid('#6e604d'),.48,.02,.22));
    for(let i=0;i<9;i++)skull.add(ball(.016,solid('#efe0bf'),.20+i*.060,-.145,0));
    for(let i=0;i<5;i++)skull.add(ball(.018,solid('#efe0bf'),.24+i*.065,-.235,.02));
    skel.add(rod(V(1.50,.48,0),V(1.82,.54,0),.050,bone),rod(V(1.82,.54,0),V(1.96,.56,0),.042,bone));
    // Matrix cracks.
    for(let i=0;i<7;i++)slab.add(line([[-2.4+i*.7,-.22,-1.3],[-2.1+i*.7,-.22,-.7],[-2.25+i*.7,-.22,.2]],'#6b5f50',.3));
    // Brush, chisel and scale bar.
    slab.add(block(.55,.055,.10,warm(),-2.45,-.16,1.35),block(.20,.16,.05,solid('#c9b28a'),-2.72,-.10,1.35));
    slab.add(block(.55,.06,.08,metal(),2.38,-.18,1.32),object(new THREE.ConeGeometry(.05,.18,8),metal(),2.06,-.15,1.32));
    for(let i=0;i<5;i++)slab.add(block(.10,.016,.06,solid(i%2?'#efe3c6':'#3f3830'),1.60+i*.12,-.18,1.55));
  }
 else if(c.profile==='mandible'){
    // Hominin mandible: a U-shaped jaw with a ramus, alveolar ridge,
    // premolars and molars, plus a quartz core tool beside it.
    slab.add(path([[-1.55,.08,-.55],[-1.35,.22,.55],[-.60,.14,.86],[0,.08,.92],[.60,.14,.86],[1.35,.22,.55],[1.55,.08,-.55]],.14,bone));
    slab.add(path([[-1.30,.18,.40],[-.55,.26,.68],[0,.22,.74],[.55,.26,.68],[1.30,.18,.40]],.055,bone));
    for(let i=0;i<7;i++){const t=i/6,x=-.92+t*1.84,z=.48+Math.sin(t*Math.PI)*.24;slab.add(block(.15,.26,.18,bone,x,.26,z));}
    for(const s of [-1,1])slab.add(block(.26,.36,.16,bone,s*1.45,.05,-.35));
    slab.add(block(.33,.38,.22,solid('#7b6b53'),-2.02,-.02,-.55),block(.22,.16,.13,solid('#a9987c'),-2.20,.10,-.55));
  }
 else if(c.profile==='limb'){
    // Early tetrapod, laid out as a museum skeleton rather than four loose
    // bones: skull, vertebral column, rib basket and four jointed limbs.
    const spine=[[-2.05,-.04,0],[-1.45,-.02,0],[-.85,.03,0],[-.20,.08,0],[.45,.12,0],[1.02,.16,0],[1.62,.18,0]];
    slab.add(path(spine,.048,bone));
    for(let i=0;i<13;i++){const t=i/12,x=-2.05+t*3.75,y=-.04+t*.23;slab.add(ball(.060,bone,x,y,0));}
    for(let i=0;i<7;i++){const x=-.80+i*.22,y=.09+i*.025;for(const s of [-1,1]){slab.add(rod(V(x,y,0),V(x-.04,y-.14,s*.28),.020,bone));slab.add(rod(V(x-.04,y-.14,s*.28),V(x+.05,y-.26,s*.40),.016,bone));}}
    const skull=ball(.29,bone,1.92,.17,0);skull.scale.set(1.30,.66,.78);slab.add(skull);
    slab.add(path([[1.72,.06,0],[2.18,.02,0],[2.38,.10,0]],.030,bone));
    slab.add(ball(.055,solid('#463d30'),2.00,.22,.22));
    for(const [cx,sx] of [[.82,1],[-.72,-1]]){
      for(const side of [-1,1]){
        const shoulder=V(cx, cx>.5?.16:.07, side*.28);
        const elbow=V(cx+(cx>.5?.30:-.26), cx>.5?.02:-.06, side*.52);
        const wrist=V(elbow.x+(cx>.5?.24:-.18), elbow.y-.14, side*.70);
        slab.add(rod(shoulder,elbow,.035,bone),rod(elbow,wrist,.025,bone));
        for(let j=0;j<4;j++)slab.add(rod(wrist,V(wrist.x+.20+j*.03,wrist.y-.06,side*(.62+j*.05)),.010,bone));
      }
    }
    for(let i=0;i<8;i++)slab.add(rod(V(-2.02,-.04,0),V(-2.34-i*.09,-.06,(i%2?-.12:.12)),.020,bone));
    for(let i=0;i<4;i++)slab.add(block(.22,.006,.035,solid('#d8c9a8'),-.5+i*.55,-.16,1.22));
  }
 else if(c.profile==='fish'){
    // Early vertebrate on a split nodule: cranium, jaw, eye, gill bars,
    // vertebral centra with neural spines, ribs, tail and paired fins.
    const head=ball(.36,bone,1.92,-.04,0);head.scale.set(1.32,.47,.72);slab.add(head);
    slab.add(path([[1.62,-.12,0],[2.18,-.22,0],[2.42,-.08,0]],.035,bone));
    slab.add(ball(.075,solid('#453c2f'),2.08,.00,.23));
    for(let i=0;i<5;i++)for(const s of [-1,1])slab.add(rod(V(1.42,-.10,0),V(1.36,-.26,s*(.02+i*.02)),.010,bone));
    for(let j=0;j<15;j++){
      const x=-2.05+j*.27,y=-.05+Math.sin(j/14*Math.PI)*.06;
      slab.add(ball(.060,bone,x,y,0));
      slab.add(rod(V(x,y+.04,0),V(x-.03,y+.25,0),.013,bone));
      slab.add(rod(V(x,y-.04,0),V(x-.02,y-.18,0),.010,bone));
      if(j>2&&j<12)for(const s of [-1,1])slab.add(rod(V(x,y-.02,0),V(x-.08,y-.24,s*.30),.011,bone));
    }
    for(let i=0;i<6;i++)for(const s of [-1,1])slab.add(rod(V(-2.02,-.02,0),V(-2.26-i*.07,-.03,s*(.10+i*.06)),.014,bone));
    for(const s of [-1,1])slab.add(rod(V(.82,-.04,0),V(1.06,-.16,s*.30),.022,bone));
    for(let i=0;i<9;i++)slab.add(block(.26,.006,.055,solid('#d8c9a8'),-1.2+i*.25,-.14,.72));
  }
 else if(c.profile==='bird'){
    // Early bird slab: skull and beak, wishbone, sternum, wing bones with
    // feather impressions, rib cage, legs and a fan of tail feathers.
    const featherMat=solid('#4b3c2b',{roughness:.96});
    const skull=ball(.20,bone,1.48,.18,0);skull.scale.set(1.20,.58,.62);slab.add(skull);
    slab.add(path([[1.28,.16,0],[1.94,.14,0],[2.18,.20,0]],.028,bone));
    slab.add(path([[-1.45,.02,0],[-.85,.06,0],[-.20,.08,0],[.45,.10,0],[1.02,.14,0]],.030,bone));
    for(let i=0;i<12;i++){const t=i/11,x=-1.45+t*2.45,y=.02+t*.12;slab.add(ball(.045,bone,x,y,0));}
    for(let i=0;i<5;i++){const x=-.55+i*.20,y=.06+i*.02;for(const s of [-1,1])slab.add(rod(V(x,y,0),V(x-.04,y-.14,s*.18),.014,bone));}
    for(const s of [-1,1]){
      slab.add(rod(V(.10,.08,s*.10),V(-.45,.10,s*.75),.032,bone));
      slab.add(rod(V(-.45,.10,s*.75),V(-1.30,.06,s*1.30),.024,bone));
      slab.add(rod(V(-.45,.10,s*.75),V(-1.55,-.02,s*1.05),.018,bone));
      for(let j=0;j<6;j++){
        const x=-1.50+j*.24;
        slab.add(rod(V(x,-.05,s*.92),V(x-.30,-.03,s*1.48),.013,featherMat));
        const feather=ball(.16,featherMat,x-.14,-.05,s*1.18);feather.scale.set(.66,.018,.30);feather.rotation.y=-s*.22;slab.add(feather);
        for(let k=0;k<4;k++)slab.add(rod(V(x-.02,-.04,s*.96),V(x-.24-k*.02,-.02,s*(1.02+k*.10)),.006,featherMat));
      }
      slab.add(rod(V(.10,.08,s*.20),V(.02,-.10,s*.34),.026,bone),rod(V(.02,-.10,s*.34),V(.16,-.18,s*.42),.018,bone));
      for(let j=0;j<3;j++)slab.add(rod(V(.16,-.18,s*.42),V(.28+j*.04,-.22,s*(.30+j*.08)),.009,bone));
    }
    for(let i=0;i<7;i++)slab.add(block(.06,.012,.36,bone,-1.48-i*.09,-.045,(i%3-1)*.14));
  }
 else if(c.profile==='tooth'){for(let j=0;j<6;j++){const tooth=object(new THREE.ConeGeometry(.23,.7+(j%2)*.25,8),bone,-1.8+j*.65,.3,0);slab.add(tooth);}slab.add(path([[-2,-.1,0],[-.7,-.15,.35],[1,-.15,.3],[2,-.1,0]],.18,bone));}
 else if(c.profile==='skull'){
    // Hominin cranium: brow ridge, orbits, nasal aperture, maxilla and teeth,
    // with a stone core and a flint flake laid beside the fossil.
    const skull=ball(.78,bone,0,.34,0);skull.scale.set(1,.85,.92);slab.add(skull);
    for(const s of [-1,1]){
      const socket=ball(.16,solid('#3a3328'),s*.34,.38,.54);socket.scale.set(1.25,.85,.72);slab.add(socket);
      slab.add(rod(V(s*.18,.52,.16),V(s*.48,.46,.36),.045,bone));
    }
    slab.add(block(.44,.24,.30,bone,0,.12,.46));
    for(let i=0;i<7;i++)slab.add(block(.065,.16,.055,solid('#eee1c2'),-.22+i*.075,-.02,.64));
    slab.add(block(.30,.42,.22,solid('#73664f'),-1.10,-.02,.52),block(.22,.18,.12,solid('#9d8a68'),-1.26,.12,.52));
    for(let i=0;i<4;i++)slab.add(block(.18,.04,.22,new THREE.MeshStandardMaterial({color:'#c6b28d',roughness:.8}),1.10+i*.14,-.12,.54));
  }
 else if(c.profile==='permian'){
    // Synapsid display: a sailed back, arched spine, ribs and a toothy skull.
    slab.add(path([[-2.15,-.06,0],[-1.5,.02,0],[-.85,.10,0],[-.1,.14,0],[.6,.20,0],[1.25,.26,0]],.045,bone));
    for(let i=0;i<13;i++){const t=i/12,x=-2.0+t*3.6,y=-.04+t*.32,h=.36+Math.sin(t*Math.PI)*.52;for(const s of [-1,1])slab.add(rod(V(x,y,0),V(x-.04,y+h,s*.035),.022,bone));}
    const sailMat=solid('#7e6640',{transparent:true,opacity:.86,roughness:.92});
    for(let i=0;i<12;i++){const t=(i+.5)/12,x=-1.96+t*3.5,y=-.03+t*.31,h=.34+Math.sin(t*Math.PI)*.50;const membrane=block(.25,h*.96,.014,sailMat,x,y+h*.48,0);membrane.rotation.z=Math.atan2(.31,3.5);slab.add(membrane);}
    for(let i=0;i<7;i++){const x=-1.0+i*.23,y=.12+i*.025;for(const s of [-1,1])slab.add(rod(V(x,y,0),V(x-.06,y-.20,s*.36),.018,bone));}
    for(const [x,z] of [[-1.35,.25],[.45,.28]])for(const s of [-1,1]){
      slab.add(rod(V(x,.02,z*s),V(x-.28,-.20,s*.55),.040,bone));
      slab.add(rod(V(x-.28,-.20,s*.55),V(x-.48,-.16,s*.70),.028,bone));
    }
    const skull=ball(.34,bone,1.62,.28,0);skull.scale.set(1.45,.58,.66);slab.add(skull);
    slab.add(path([[1.38,.14,0],[2.02,.12,0],[2.22,.20,0]],.034,bone));
    for(let i=0;i<8;i++)slab.add(ball(.022,solid('#e9dbc0'),1.62+i*.072,.14,0));
    slab.add(ball(.060,solid('#463e31'),1.73,.31,.24));
    for(let i=0;i<5;i++)slab.add(rod(V(-2.1,-.02,0),V(-2.34-i*.10,-.03,(i%2?-.10:.10)),.024,bone));
  }
 else if(c.profile==='mammal'){
    // Cenozoic mammal: compact skull, differentiated teeth, rib cage and
    // small plantigrade limbs, all on one slab.
    slab.add(path([[-2.10,-.02,0],[-1.5,.02,0],[-.85,.08,0],[-.2,.12,0],[.42,.13,0]],.038,bone));
    for(let i=0;i<12;i++){const t=i/11,x=-2.10+t*2.50,y=-.02+t*.15;slab.add(ball(.055,bone,x,y,0));}
    for(let i=0;i<7;i++){const x=-1.18+i*.24,y=.06+i*.02;for(const s of [-1,1])slab.add(rod(V(x,y,0),V(x-.04,y-.17,s*.30),.016,bone));}
    for(const s of [-1,1])slab.add(ball(.15,bone,-.05,.10,s*.20),ball(.10,bone,.48,.11,s*.18));
    for(const s of [-1,1]){slab.add(rod(V(-.10,.08,s*.22),V(-.30,-.12,s*.46),.030,bone),rod(V(-.30,-.12,s*.46),V(-.10,-.22,s*.54),.022,bone),rod(V(.50,.10,s*.20),V(.66,-.10,s*.36),.024,bone),rod(V(.66,-.10,s*.36),V(.88,-.18,s*.42),.018,bone));}
    const skull=ball(.31,bone,.88,.20,0);skull.scale.set(1.35,.68,.72);slab.add(skull);
    slab.add(path([[.64,.10,0],[1.22,.10,0],[1.42,.16,0]],.025,bone));
    for(let i=0;i<5;i++)slab.add(ball(.018,solid('#eadcc0'),.90+i*.085,.10,0));
    slab.add(ball(.052,solid('#463d30'),.94,.24,.22));
    for(let i=0;i<6;i++)slab.add(rod(V(-2.12,-.02,0),V(-2.38-i*.08,-.04,(i%2?-.10:.10)),.018,bone));
  }
 else if(c.profile==='human'){
    // Hominin table: cranium with brow and jaw, a hand axe and two tools.
    const skull=ball(.48,bone,1.30,.28,0);skull.scale.set(1.22,.86,.82);slab.add(skull);
    slab.add(path([[1.00,.10,0],[1.84,.08,0],[2.10,.16,0]],.036,bone));
    for(const s of [-1,1])slab.add(rod(V(1.16,.42,0),V(1.20,.50,s*.24),.028,bone));
    slab.add(ball(.065,solid('#463d30'),1.36,.30,.25));
    for(let i=0;i<8;i++)slab.add(ball(.020,solid('#ebe0c6'),1.28+i*.078,.14,0));
    slab.add(block(.45,.055,.10,solid('#6f6554'),-.25,-.15,.72),rod(V(-.02,-.12,.72),V(.20,-.12,.72),.018,solid('#a89468')));
    slab.add(block(.28,.06,.13,solid('#4e4a40'),-.95,-.15,.55));
    for(let i=0;i<5;i++)slab.add(ball(.018,solid('#e5d4b4'),1.02+i*.055,.06,0));
  }
 else if(c.profile==='megafauna'){
    // Ice-age giant: massive skull, curved tusks, a few immense limb bones.
    const skull=ball(.72,bone,-1.15,.12,.15);skull.scale.set(1.55,.75,.95);slab.add(skull);
    for(const s of [-1,1])slab.add(path([[-1.62,.26,s*.38],[-2.12,.52,s*.58],[-2.55,.40,s*.66]],.12,bone));
    slab.add(ball(.13,solid('#463d30'),-.72,.26,.55));
    slab.add(block(.95,.12,.32,bone,.48,-.04,.32),block(.85,.10,.26,bone,1.22,-.04,-.40),block(.55,.09,.20,bone,-.25,-.05,-.90));
    for(let i=0;i<6;i++)slab.add(ball(.12,bone,.10+i*.24,.02,.96));
    slab.add(block(.30,.34,.24,bone,-.62,-.02,1.10),block(.26,.30,.20,bone,-.18,-.04,1.30));
  }
 else if(c.profile==='anthropocene'){
    // Technofossils: a cut concrete core, rebar, a polymer bottle, a can and
    // glass shards, the stratigraphic signature of a manufactured epoch.
    const conc=solid('#8c8578'),rust=solid('#8f5a3e',{metalness:.25,roughness:.7}),poly=solid('#b7d9d0',{transparent:true,opacity:.55,roughness:.25}),steel=solid('#b9c2c4',{metalness:.7,roughness:.28});
    slab.add(block(1.45,.55,1.05,conc,-1.10,-.02,.55),block(.92,.28,.25,conc,-.35,-.22,.92));
    for(let i=0;i<4;i++)slab.add(rod(V(-1.75,-.10,.28+i*.20),V(-.80,.22,.28+i*.20),.022,rust));
    slab.add(cyl(.20,.72,poly,-.10,-.06,-.62,.15),ring(.20,.035,poly,-.10,.28,-.62));
    slab.add(cyl(.13,.48,steel,.55,-.10,.20,.13),ring(.13,.018,steel,.55,.14,.20));
    for(let i=0;i<5;i++)slab.add(block(.18,.018,.32,poly,1.25-i*.14,-.15,.58+i*.10));
    for(let i=0;i<12;i++)slab.add(ball(.035,solid(i%3?'#363636':'#b78d5f'),-.60+i*.10,.14,.22)); 
  }
 else if(c.profile==='assemblage'){
    // Generic fossil bed for entries with no single named specimen: ammonite,
    // leaf impression, fish vertebra, shell and a tooth.
    slab.add(path([[.16,.16,0],[.62,.24,0],[1.02,.10,0],[1.22,-.18,0],[1.02,-.50,0],[.55,-.56,0],[.16,-.36,0],[.08,-.02,0],[.16,.16,0]],.065,bone));
    for(let i=0;i<10;i++){const a=i/9*Math.PI*2;slab.add(rod(V(.60,.10,0),V(.60+Math.cos(a)*.42,.10+Math.sin(a)*.42,0),.012,bone));}
    for(let i=0;i<7;i++)slab.add(rod(V(-1.62,-.20,0),V(-1.00+i*.12,-.08,0),.018,bone));
    slab.add(ball(.26,solid('#c9b08b'),-.95,.02,-.72),ball(.12,solid('#c0aa8b'),.10,.08,-.88));
    slab.add(ball(.08,bone,-1.88,.02,.90));
  }
 else {for(const s of [-1,1])for(let j=0;j<2;j++){const x=s*(.9+j*.5),z=(j-.5)*1.5;slab.add(ball(.26,bone,x,-.05,z));for(let k=0;k<4;k++)slab.add(rod(V(x,-.04,z),V(x+s*(.3+k*.08),-.04,z+(k-1.5)*.16),.035,bone));}}
 const lens=ring(.6,.055,metal(),2.2,1.4,.6);lens.rotation.x=.35;g.add(lens,rod(V(2.2,.8,.6),V(2.6,-.5,1),.065,warm()));m.push((d,t)=>lens.rotation.z=Math.sin(t*.2)*.025);
}
function microbialStudy(g,c,m){
 if(c.profile==='filament'){for(let j=0;j<10;j++){const cell=cyl(.35,.55,glass(c.color,.4),-2.5+j*.55,.2+Math.sin(j*.8)*.2,0);cell.rotation.z=Math.PI/2;g.add(cell);g.add(ring(.3,.025,solid(c.color),-2.5+j*.55,.2+Math.sin(j*.8)*.2,0));}m.push((d,t)=>g.rotation.y=Math.sin(t*.15)*.06);return;}
 const cell=new THREE.Group();g.add(cell);const shell=ball(1.7,glass(c.color,.2));shell.scale.set(1.3,.8,.8);cell.add(shell);if(c.profile==='thylakoid'){for(let i=0;i<6;i++){const q=cyl(.8,.055,solid('#6eaa86'),-.7+i*.24,0,0);q.rotation.z=Math.PI/2;cell.add(q);}}
 else if(c.profile==='ancestor'){cell.add(path(Array.from({length:55},(_,j)=>{const a=j/54*TAU*3;return[Math.cos(a)*.55,Math.sin(a)*.42,(j/54-.5)*1.2];}),.025,lit('#d5bd91')));for(let j=0;j<18;j++)cell.add(ball(.045,solid('#a2c7b0'),Math.cos(j*2.4)*1.25,Math.sin(j*2.4)*.7,(j%5-2)*.16));}
 else {const nucleus=ball(.55,solid('#ad88b4',{transparent:true,opacity:.65}),-.4,.15,.15);cell.add(nucleus);for(let j=0;j<6;j++){const q=ball(.23,solid('#c19d70'),Math.cos(j)*1.1,Math.sin(j)*.7,.25);q.scale.x=1.6;cell.add(q);}cell.add(path(Array.from({length:40},(_,j)=>{const a=j/39*TAU*2;return[Math.cos(a)*.5,Math.sin(a)*.45,j/39-.5];}),.025,lit('#d6c59d')));}
 for(let j=0;j<4;j++)g.add(rod(V(-1.8,-1.4+j*.08,0),V(1.8,-1.4+j*.08,0),.012,solid('#4b6c74')));m.push((d,t)=>cell.rotation.y=t*.035);
}
function forestCanopy(g,c,m,rand){
 pedestal(g,6,3.5);g.add(block(5.8,.22,3.3,solid('#394c3b'),0,-1.88));
 const bark=solid('#76654e',{roughness:.95}),foliage=[solid(c.color,{roughness:.95}),solid('#466e58',{roughness:.95}),solid('#70937a',{roughness:.9})];
 for(let j=0;j<7;j++){const x=-2.4+j*.8,z=Math.sin(j*2)*.85;
  if(c.profile==='spores'){frond(g,x,-1.7,z,.55+(j%3)*.15,foliage[j%3]);}
  else if(c.profile==='flowers'){const h=.2+(j%2)*.4;g.add(rod(V(x,-1.7,z),V(x,h,z),.025,foliage[0]));for(let k=0;k<5;k++){const a=k*TAU/5,p=ball(.17,solid('#cfacb5'),x+Math.cos(a)*.21,h,z+Math.sin(a)*.21);p.scale.y=.3;g.add(p);}g.add(ball(.09,solid('#e5c78b'),x,h+.03,z));}
  else {const h=2.1+rand()*.8;g.add(cyl(.045,h,bark,x,-1.7+h/2,z,.11));
   for(let k=0;k<5;k++){const a=k*2.4+j*.7,y=-.8+k*.43,r=(1-k*.12)*.48;const end=V(x+Math.cos(a)*r,y+.08,z+Math.sin(a)*r);g.add(rod(V(x,y-.12,z),end,.025,bark));const crown=object(new THREE.IcosahedronGeometry(.52,1),foliage[(k+j)%3],end.x,end.y+.22,end.z);crown.scale.set(1-k*.09,.55+k*.03,.75-k*.05);crown.rotation.y=a;g.add(crown);}
   const tip=object(new THREE.IcosahedronGeometry(.35,1),foliage[j%3],x,h-1.8,z);tip.scale.set(.5,1,.5);g.add(tip);
   if(c.profile==='seeds')g.add(object(new THREE.OctahedronGeometry(.13),solid('#b68f5f'),x+.35,-1.6,z+.4));
  }
 }
 for(let i=0;i<8;i++){const rock=object(new THREE.IcosahedronGeometry(.18+rand()*.16,0),solid('#6e7565',{roughness:1}),-2.5+rand()*5,-1.68,-1.25+rand()*2.5);rock.scale.y=.45;g.add(rock);}
 if(!['spores','flowers'].includes(c.profile))for(let i=0;i<4;i++)frond(g,-2+1.3*i,-1.7,1.1,.25,foliage[1]);
 m.push((d,t)=>g.rotation.y=Math.sin(t*.09)*.025);
}
function buildInventionOfWriting(g,c,m,rng){
  const sand=solid('#b09a78',{roughness:1}),clay=solid('#b27b57',{roughness:.9}),clayDark=solid('#7d4d37',{roughness:.9});
  const brick=solid('#8a7052',{roughness:1}),ink=solid('#4b3222',{roughness:.8}),reed=solid('#c7a66e',{roughness:.9});
  pedestal(g,6.2,3.8);
  g.add(block(5.8,.15,3.4,sand,0,-1.94,0));
  // Low mud-brick wall, doorway and a stepped ziggurat silhouette.
  g.add(block(5.2,.65,.28,brick,0,-1.55,-1.38));
  for(let i=0;i<3;i++)g.add(block(5.2,.022,.03,clayDark,0,-1.77+i*.17,-1.23));
  g.add(block(1.0,.5,.06,ink,-1.15,-1.6,-1.23),block(1.4,.09,.32,brick,-1.15,-1.3,-1.25));
  for(let i=0;i<5;i++)g.add(block(1.6-i*.26,.18,1.2,solid(i%2?'#9b815e':'#856b4e'),-1.95,-1.76+i*.2,-1.65));
  // The clay tablet, tilted toward the viewer, with dense cuneiform rows.
  const tablet=new THREE.Group();tablet.position.set(-.12,-1.38,.42);tablet.rotation.x=.5;g.add(tablet);
  tablet.add(block(2.45,.16,1.45,clay,0,0,0),block(2.55,.045,1.55,clayDark,0,-.02,0));
  for(let row=0;row<4;row++)for(let col=0;col<6;col++){
    const x=-.9+col*.36,z=-.4+row*.24,y=.095;
    tablet.add(block(.035,.02,.26,ink,x,y,z),block(.16,.02,.055,ink,x+.08,y,z+.08),block(.1,.02,.04,ink,x-.06,y,z-.08));
    if(col%2)tablet.add(block(.02,.02,.14,ink,x-.12,y,z+.12));
  }
  tablet.add(block(2.2,.025,.035,clayDark,0,.1,-.63),block(2.2,.025,.035,clayDark,0,.1,.63));
  // Reed stylus resting on the tablet, with a sharp cut tip.
  const stylus=rod(V(1.15,.16,.42),V(.35,.2,-.18),.025,reed);tablet.add(stylus,object(new THREE.ConeGeometry(.055,.18,7),clayDark,.3,.2,-.25).rotateZ(1.2));
  // A seated scribe at the right, holding a second stylus over a wet clay bowl.
  const scribe=new THREE.Group();scribe.position.set(1.55,-1.35,.7);g.add(scribe);
  scribe.add(block(.55,.08,.45,clay,-.1,-.42,0),block(.08,.4,.08,clay,-.42,-.25,0));
  scribe.add(cyl(.16,.42,solid('#6f5142'),0,-.08,0,.11),ball(.1,solid('#c9a47b'),0,.26,0));
  scribe.add(rod(V(-.1,.12,0),V(.3,.23,.05),.025,solid('#6f5142')),rod(V(.3,.23,.05),V(.5,.1,.12),.018,reed));
  scribe.add(block(.05,.03,.14,ink,.5,.08,.12));
  figure(g,-1.85,.55,'#695040','#c7a279',.9,'#3b3028');
  figure(g,-2.2,.1,'#7d5b43','#cda982',.85,'#3b3028');
  // Clay jars, a reed bundle and a small oil lamp.
  const jar=(x,z,r,h)=>{g.add(cyl(r,h,clay,x,-1.86+h/2,z,r*.7),cyl(r*.5,.08,clayDark,x,-1.86+h+.02,z,r*.4),ring(r*.7,.025,clayDark,x,-1.83,z));};
  jar(1.1,.95,.24,.5);jar(1.5,.72,.16,.34);jar(-2.4,.95,.19,.44);jar(-1.55,.8,.12,.26);
  for(let i=0;i<6;i++)g.add(rod(V(1.9,-1.85,.9),V(1.96+i*.015,-.9+i*.04,.95+i*.01),.018,reed));
  g.add(cyl(.15,.1,clay,-1.9,-1.8,1.0),glow('#ffca7c',.5,.55).translateX(-1.9).translateY(-1.64).translateZ(1.0),ball(.04,lit('#ffd18b'),-1.9,-1.68,1.0));
  // A date palm and loose tablets at the edge of the workshop.
  const palm=frond(g,2.45,-1.7,-1.0,.42,solid('#64815b'));palm.rotation.z=.1;
  for(let i=0;i<3;i++){const q=block(.4,.05,.3,clay,-2.3+i*.25,-1.84,.5);q.rotation.y=(i-1)*.3;g.add(q);}
  const motes=dust(120,'#d9c39c',()=>[(rng()-.5)*5.2,-1.4+rng()*2.2,(rng()-.5)*3.0]);g.add(motes);
  m.push((d,t)=>{motes.rotation.y=t*.02;palm.rotation.z=.1+Math.sin(t*.25)*.025;});
}
function buildMeijiRestoration(g,c,m,rng){
  const brick=solid('#8d4f40',{roughness:.9}),brickDark=solid('#6e3d33',{roughness:.9});
  const stone=solid('#a99c84',{roughness:.95}),wood=solid('#6e563e',{roughness:.85}),iron=solid('#37434a',{metalness:.5,roughness:.5});
  const roof=solid('#3f474b',{roughness:.8}),cream=solid('#ddcba7',{roughness:.8}),red=solid('#8d3f34',{roughness:.8});
  pedestal(g,6.3,3.8);
  g.add(block(5.9,.16,3.5,stone,0,-1.94,0));
  // Cobblestone street and railway at the front.
  for(let i=0;i<24;i++)for(let j=0;j<3;j++)g.add(block(.2,.025,.14,i%2?solid('#857a68'):solid('#938673'),-2.4+i*.21,-1.84,.55+j*.2));
  for(const z of [1.27,1.47])g.add(block(5.8,.045,.055,iron,0,-1.82,z));
  for(let i=0;i<16;i++)g.add(block(.13,.06,.62,wood,-2.5+i*.33,-1.87,1.37));
  // Brick factory with lit windows, sawtooth roof and smoking chimneys.
  g.add(block(1.9,1.15,1.05,brick,-1.45,-1.2,-.95),block(2.0,.08,1.15,brickDark,-1.45,-.66,-.95));
  for(let i=0;i<4;i++){const r=block(.5,.09,.92,roof,-2.0+i*.44,-.59,-.95);r.rotation.z=i%2?.22:-.22;g.add(r);}
  for(let i=0;i<3;i++)for(let j=0;j<3;j++){const w=block(.18,.24,.025,lit('#e8bb6c'),-1.85+i*.38,-1.5+j*.3,-.41);g.add(w);g.add(block(.23,.03,.03,brickDark,-1.85+i*.38,-1.36+j*.3,-.4));}
  for(let i=0;i<4;i++)g.add(block(1.92,.02,.02,brickDark,-1.45,-1.55+i*.2,-.4));
  const chimneys=[];
  for(const x of [-2.05,-1.42]){
    g.add(cyl(.1,.95,brickDark,x,-.25,-1.05),cyl(.13,.07,stone,x,.24,-1.05));
    const s=dust(38,'#827b71',()=>[(rng()-.5)*.26,rng()*.8,(rng()-.5)*.2]);s.position.set(x,.3,-1.05);g.add(s);chimneys.push(s);
  }
  // Meiji clock tower: stone base, white clock face, dark hands and a small roof.
  g.add(block(.5,1.6,.52,stone,.25,-1.0,-1.18),block(.62,.12,.62,cream,.25,-.16,-1.18));
  const face=cyl(.24,.035,cream,.25,.06,-.9);face.rotation.x=Math.PI/2;g.add(face,ring(.25,.018,brickDark,.25,.06,-.89));
  g.add(block(.02,.17,.012,iron,.25,.08,-.87),block(.13,.02,.012,iron,.31,.04,-.87));
  g.add(object(new THREE.ConeGeometry(.37,.3,4),roof,.25,.28,-1.18).rotateY(Math.PI/4));
  // Station platform and canopy on the right.
  g.add(block(1.6,.12,1.0,stone,2.0,-1.82,-.25));
  for(const x of [1.45,2.55])g.add(rod(V(x,-1.78,-.65),V(x,-.55,-.65),.025,iron));
  g.add(block(1.55,.08,1.05,roof,2.0,-.52,-.25),block(1.4,.04,.02,cream,2.0,-.58,.2));
  for(let i=0;i<4;i++)g.add(block(.34,.24,.02,lit('#e4bf7b'),1.25+i*.38,-1.1,-.7));
  // Locomotive: boiler, cab, stack, wheels and cowcatcher.
  const engine=new THREE.Group();engine.position.set(-.15,-1.25,1.37);g.add(engine);
  const trainSteel=solid('#53636a',{metalness:.45,roughness:.5});
  const boiler=cyl(.19,.95,trainSteel,-.28,0,0,.19);boiler.rotation.z=Math.PI/2;engine.add(boiler,ring(.2,.025,metal(),-.7,0,0),ring(.2,.025,metal(),.15,0,0));
  engine.add(block(.5,.52,.5,trainSteel,.54,.18,0),block(.56,.06,.55,roof,.54,.47,0));
  engine.add(block(.16,.12,.02,lit('#f0c979'),.6,.26,.26));
  engine.add(cyl(.07,.42,trainSteel,-.74,.45,0),cyl(.11,.1,iron,-.74,.68,0),cyl(.14,.05,warm(),-.74,.31,0));
  for(const x of [-.58,-.34,-.1]){const band=ring(.195,.014,warm(),x,0,0);band.rotation.y=Math.PI/2;engine.add(band);}
  engine.add(ball(.19,warm(),-.72,0,0),block(.18,.1,.02,solid('#c9a45e'),-1.0,-.05,0));
  engine.add(block(.24,.14,.4,trainSteel,-.94,-.18,0),ball(.055,lit('#ffe0a0'),-.96,.08,0),glow('#ffd18b',.35,.55).translateX(-.96).translateY(.08));
  engine.add(block(.06,.18,.36,red,-1.04,-.25,0),block(.22,.1,.42,trainSteel,-1.0,-.36,0));
  const wheels=[];
  for(const x of [-.72,-.3,.12])for(const z of [-.28,.28]){const w=object(new THREE.CylinderGeometry(.18,.18,.06,18),solid('#2e3437'),x,-.37,z);w.rotation.x=Math.PI/2;engine.add(w,ring(.18,.014,solid('#9a4a3b'),x,-.37,z));wheels.push(w);}
  engine.add(rod(V(-.72,-.2,-.3),V(.12,-.2,-.3),.018,metal()),rod(V(-.72,-.2,.3),V(.12,-.2,.3),.018,metal()));
  // Telegraph poles and sagging wires.
  const poles=[];
  for(const x of [-2.55,-1.3,0,1.3,2.55]){
    g.add(rod(V(x,-1.9,.15),V(x,-.25,.15),.022,wood),block(.42,.04,.04,wood,x,-.55,.15));
    poles.push([x,-.55,.15]);
  }
  for(let i=0;i<poles.length-1;i++){const [x1,y1,z1]=poles[i],[x2,y2,z2]=poles[i+1];g.add(path([[x1,y1,z1],[(x1+x2)/2,y1-.16,z1],[x2,y2,z2]],.008,solid('#5e5548')));}
  // Street lanterns, people and a small torii gate.
  for(const x of [-2.3,-.65,1.1,2.45]){
    g.add(rod(V(x,-1.9,1.0),V(x,-.9,1.0),.018,wood),glow('#ffd18b',.45,.5).translateX(x).translateY(-.82).translateZ(1.0));
    g.add(ball(.055,lit('#ffd18b'),x,-.82,1.0));
  }
  const kimono=['#5b4c69','#8a5a4d','#3e5b6b','#70604a','#7b4c55'];
  for(let i=0;i<8;i++)figure(g,-2.1+i*.55,.35+(i%3)*.22,kimono[i%5],'#cba57e',.86,'#2f2a26');
  for(let i=0;i<3;i++)figure(g,1.35+i*.44,-.22,kimono[(i+2)%5],'#c9a27c',.8,'#2f2a26');
  // Cherry tree and torii silhouette.
  g.add(cyl(.055,.8,wood,2.45,-1.45,-1.05,.08));
  for(let i=0;i<7;i++){const a=i*TAU/7,p=ball(.22,solid(i%2?'#d6a9b0':'#c78f9c'),2.45+Math.cos(a)*.28,-.55+Math.sin(i)*.22,-1.05+Math.sin(a)*.22);p.scale.y=.5;g.add(p);}
  for(const x of [-2.85,-2.3])g.add(rod(V(x,-1.9,1.25),V(x,-.8,1.25),.045,red));
  g.add(block(.85,.07,.1,red,-2.58,-.8,1.25),block(1.0,.06,.12,red,-2.58,-.6,1.25));
  // Factory flag: white field with a red disc.
  g.add(rod(V(1.1,-1.85,-.8),V(1.1,-.9,-.8),.018,wood));
  g.add(block(.42,.26,.018,cream,1.31,-1.02,-.8),cyl(.085,.02,red,1.31,-.99,-.79,.085));
  m.push((d,t)=>{chimneys.forEach((s,i)=>{s.position.y=.3+Math.sin(t*.3+i)*.1;s.rotation.y=t*.05;});wheels.forEach(w=>w.rotation.y+=d*.6);g.rotation.y=Math.sin(t*.06)*.012;});
}
function archMesh(g,x,y,z,r,m){const a=object(new THREE.TorusGeometry(r,.042,8,28,Math.PI),m,x,y,z);g.add(a);return a;}
function palmTree(g,x,z,h=1.05,scale=1,leaf=solid('#557f49'),trunk=solid('#8b6548')){
  const p=new THREE.Group();p.position.set(x,-1.86,z);p.scale.setScalar(scale);g.add(p);
  for(let i=0;i<3;i++)p.add(cyl(.052-i*.008,h/3,trunk,i?0:.025,h*(i+.5)/3,0,.064-i*.01));
  for(let i=0;i<9;i++){
    const a=i/9*TAU,c=Math.cos(a),s=Math.sin(a);
    p.add(path([[0,h,0],[c*.22,h+.14,s*.22],[c*.52,h+.02,s*.52],[c*.82,h-.2,s*.82]],.022,leaf));
    const tip=ball(.055,leaf,c*.82,h-.2,s*.82);tip.scale.set(1,.5,.4);p.add(tip);
  }
  p.add(ball(.1,solid('#7a5732'),0,h+.02,0));
  return p;
}
function cypressTree(g,x,z,h=1.1,scale=1){
  const c=object(new THREE.ConeGeometry(.14*scale,h,12),solid('#3e5b40',{roughness:.95}),x,-1.86+h/2,z);
  g.add(c);c.add(cyl(.022,.26,solid('#69533d'),0,-h/2+.08,0));return c;
}
function windowFacade(rng){
  const canvas=document.createElement('canvas');canvas.width=256;canvas.height=512;
  const ctx=canvas.getContext('2d');ctx.fillStyle='#14242c';ctx.fillRect(0,0,256,512);
  for(let y=18;y<500;y+=36){ctx.fillStyle='#203b45';ctx.fillRect(0,y,256,3);}
  for(let row=0;row<13;row++)for(let col=0;col<6;col++){
    const lit=rng()>.27,cool=rng()>.7;
    ctx.fillStyle=lit?(cool?'#b6d8e6':'#ffd08a'):'#1b3038';
    ctx.fillRect(17+col*39,20+row*36,24,20);
    if(lit){ctx.fillStyle='rgba(255,211,143,.35)';ctx.fillRect(19+col*39,22+row*36,20,3);}
  }
  const tex=new THREE.CanvasTexture(canvas);tex.needsUpdate=true;
  return new THREE.MeshStandardMaterial({map:tex,emissive:'#ffc27a',emissiveMap:tex,emissiveIntensity:.38,roughness:.4,metalness:.18});
}
function broadleafTree(g,x,z,s=1,leaf=solid('#557348')){
  const t=new THREE.Group();t.position.set(x,-1.84,z);t.scale.setScalar(s);g.add(t);
  t.add(cyl(.045,.7,solid('#6f533a'),0,.35,0,.06));
  for(let i=0;i<5;i++){const b=ball(.24,leaf,Math.cos(i*1.9)*.2,.72+Math.sin(i*1.4)*.18,Math.sin(i*1.9)*.18);b.scale.set(1,.65,1);t.add(b);}
  return t;
}
function cow(g,x,z,c='#8d6145',s=1){
  const q=new THREE.Group();q.position.set(x,-1.83,z);q.scale.setScalar(s);g.add(q);
  const body=ball(.2,solid(c),0,.35,0);body.scale.set(1.5,.8,.78);q.add(body);
  q.add(ball(.1,solid(c),.3,.42,0),ball(.06,solid('#5d4434'),.4,.37,0));
  q.add(ball(.09,solid('#d7c8b2'),0,.38,.24),ball(.09,solid('#d7c8b2'),0,.38,-.24));
  for(const lx of [-.16,.16])for(const lz of [-.12,.12])q.add(cyl(.018,.24,solid('#5e4938'),lx,.12,lz,.02));
  for(const s of [-1,1])q.add(rod(V(.34,.52,s*.05),V(.4,.63,s*.08),.009,solid('#d8c7a8')));
  q.add(rod(V(-.24,.45,0),V(-.36,.18,.03),.012,solid(c)));
}
function sheep(g,x,z,s=1){
  const q=new THREE.Group();q.position.set(x,-1.83,z);q.scale.setScalar(s);g.add(q);
  for(let i=0;i<4;i++)q.add(ball(.12,solid('#ddd5c5'),(i%2?-.1:.1),.28+(i>1?.1:0),(i<2?-.06:.06)));
  q.add(ball(.075,solid('#4d4135'),.2,.34,0),ball(.055,solid('#4d4135'),.25,.3,0));
  for(const lx of [-.1,.1])for(const lz of [-.05,.05])q.add(cyl(.012,.22,solid('#4b3d30'),lx,.1,lz,.014));
}
function buildHolocene(g,c,m,rng){
  const grass=solid('#607c48',{roughness:1}),earth=solid('#9a7958',{roughness:1});
  const mud=solid('#ab7d55',{roughness:.95}),thatch=solid('#b6955d',{roughness:.95});
  const water=solid('#4c98aa',{emissive:'#2c6d7c',emissiveIntensity:.3,transparent:true,opacity:.9,roughness:.2});
  const wheat=solid('#b8a45e',{roughness:.9}),leaf=solid('#557348',{roughness:.95});
  pedestal(g,5.9,3.6);
  g.add(block(5.5,.1,3.25,earth,0,-1.94,0),block(5.3,.06,3.0,grass,0,-1.86,0));
  // Low rolling hills frame the valley.
  for(const [hx,hz,hs] of [[-2.35,-1.35,.7],[2.35,-1.38,.8],[.7,-1.45,.6]]){
    const h=ball(hs,solid('#5b7648'),hx,-1.72,hz);h.scale.set(1.5,.38,1);g.add(h);
  }
  // A shallow river runs across the foreground, with banks, reeds and a plank bridge.
  const river=[[-2.35,.55,.15],[-1.3,.7,-.08],[-.25,.75,.06],[.85,.92,.22],[1.95,1.08,.15]];
  for(const [rx,rz,ra] of river){
    const bank=block(1.22,.04,.68,earth,rx,-1.84,rz);bank.rotation.y=ra;g.add(bank);
    const wet=block(1.04,.022,.46,water,rx,-1.79,rz);wet.rotation.y=ra;g.add(wet);
  }
  g.add(block(.78,.05,.52,solid('#73523a'),.08,-1.77,.78));
  for(const s of [-1,1])g.add(block(.04,.16,.4,solid('#654732'),.08+s*.35,-1.69,.78));
  for(let i=0;i<7;i++)g.add(block(.08,.018,.34,solid('#876245'),-.18+i*.09,-1.74,.78));
  for(const [rx,rz] of [[-2.25,.8],[-1.4,.92],[-.4,.86],[1.35,1.04],[2.25,1.18]]){
    for(let i=0;i<4;i++)g.add(rod(V(rx+(i-.5)*.03,-1.84,rz),V(rx+(i-.5)*.05,-1.42+rng()*.14,rz+(rng()-.5)*.06),.009,solid('#7c874d')));
  }
  // Early farming village: round huts with thatch, a well, a granary and a wattle fence.
  const hut=(x,z,r=.22,h=.24)=>{
    g.add(cyl(r,h,mud,x,-1.83+h/2,z,r*.94),object(new THREE.ConeGeometry(r*1.55,.22,14),thatch,x,-1.83+h+.1,z));
    g.add(block(.1,.15,.03,solid('#5f4130'),x,-1.83+h*.3,z+r*.9));
    g.add(block(.06,.07,.03,solid('#4a382a'),x+r*.5,-1.83+h*.7,z+r*.7));
  };
  for(const [hx,hz] of [[-1.9,-.72],[-1.22,-.82],[-1.95,.02],[-1.28,.08],[-1.6,-1.25]])hut(hx,hz);
  g.add(cyl(.14,.1,solid('#9a8e78'),-.55,-1.77,-.3,.16),cyl(.11,.02,water,-.55,-1.71,-.3,.14));
  g.add(block(.34,.035,.26,solid('#74543a'),-.55,-1.56,-.3),rod(V(-.68,-1.76,-.3),V(-.68,-1.58,-.3),.018,solid('#705139')),rod(V(-.42,-1.76,-.3),V(-.42,-1.58,-.3),.018,solid('#705139')));
  g.add(cyl(.18,.3,mud,-1.68,-1.67,-1.3,.16),object(new THREE.ConeGeometry(.26,.2,12),thatch,-1.68,-1.38,-1.3));
  for(const [fx,fz] of [[-2.25,.35],[-.8,.35],[-2.2,-.45]]){for(let i=0;i<3;i++)g.add(rod(V(fx,-1.83,fz+i*.1),V(fx,-1.58,fz+i*.1),.014,solid('#7a6142')));g.add(block(.42,.025,.025,solid('#8a6c49'),fx,-1.65,fz+.1));}
  // A trodden path links huts, well and bridge; a kitchen garden sits beside the homes.
  for(let i=0;i<9;i++)g.add(block(.11,.018,.26,solid('#b09168'),-1.55+i*.18,-1.81,.45+(i%2)*.03));
  for(let i=0;i<4;i++)g.add(block(.5,.025,.09,solid(i%2?'#69864a':'#557540'),-2.05,-1.8,.28+i*.12));
  for(let i=0;i<6;i++)g.add(ball(.035,solid(i%3?'#89964d':'#a4764d'),-2.23+i*.07,-1.76,.34+(i%3)*.06));
  g.add(block(.9,.16,.06,solid('#76523a'),-1.4,-1.75,-1.42));
  for(const px of [-1.82,-.98])g.add(rod(V(px,-1.83,-1.42),V(px,-1.58,-1.42),.015,solid('#76523a')));
  for(let i=0;i<4;i++)g.add(rod(V(-1.82+i*.27,-1.58,-1.42),V(-1.82+i*.27,-1.58,-1.18),.008,solid('#8a6746')));
  const smoke=[];for(let i=0;i<3;i++){const s=ball(.075,solid('#b8b5aa',{transparent:true,opacity:.18}),-1.9+i*.04,-1.35+i*.09,-.7);g.add(s);smoke.push(s);}
  g.add(object(new THREE.ConeGeometry(.16,.14,10),thatch,-.55,-1.53,-.3));
  // Terraced fields and irrigation on the right.
  for(let p=0;p<2;p++){
    const px=1.35+p*.85,pz=-.55+p*.18,pw=.72;
    g.add(block(pw,.05,.52,solid('#688449'),px,-1.81,pz));
    for(let r=0;r<4;r++)g.add(block(pw-.08,.03,.065,solid(r%2?'#9a9a56':'#667d3e'),px,-1.76,pz-.17+r*.1));
    for(let i=0;i<16;i++){const cx=px-pw/2+rng()*pw,cz=pz-.2+rng()*.4;g.add(rod(V(cx,-1.75,cz),V(cx,-1.56+rng()*.08,cz),.008,wheat));}
    g.add(block(.08,.025,.52,water,px+pw/2+.04,-1.78,pz));
  }
  // Trees, reeds, livestock, a canoe and villagers.
  const trees=[broadleafTree(g,-2.22,-1.1,1.05,leaf),broadleafTree(g,2.28,-1.1,1.0,leaf),broadleafTree(g,2.12,.15,.78,leaf)];
  cow(g,1.1,-.92,'#8d6145',.9);cow(g,1.62,-.82,'#a37b5c',.78);
  sheep(g,.55,-.82,.9);sheep(g,2.15,-.45,.8);sheep(g,-.5,-1.05,.75);
  const canoe=new THREE.Group();canoe.position.set(1.18,-1.8,.94);g.add(canoe);
  canoe.add(block(.56,.06,.2,solid('#745238'),0,.03,0));
  for(const s of [-1,1]){const p=object(new THREE.ConeGeometry(.11,.22,4),solid('#745238'),s*.34,.03,0);p.rotation.y=Math.PI/4;p.rotation.z=s*Math.PI/2;canoe.add(p);}
  canoe.add(rod(V(-.15,.1,.04),V(.22,.18,.1),.012,solid('#8d6b47')));
  const robes=['#9b7a57','#7f6a4c','#8c5d49','#b19368','#6e7454','#a67857'];
  figure(g,-1.6,.35,robes[0],'#b98b65',.82,'#3a3028',-1.8);
  figure(g,-.95,.45,robes[1],'#b98b65',.8,'#3a3028',-1.8);
  figure(g,-.35,-.4,robes[2],'#b98b65',.82,'#3a3028',-1.8);
  figure(g,.95,.55,robes[3],'#b98b65',.8,'#3a3028',-1.8);
  figure(g,1.45,.02,robes[4],'#b98b65',.82,'#3a3028',-1.8);
  figure(g,2.05,.55,robes[5],'#b98b65',.8,'#3a3028',-1.8);
  m.push((d,t)=>{
    trees.forEach((v,i)=>v.rotation.z=Math.sin(t*.35+i)*.025);
    water.emissiveIntensity=.22+Math.sin(t*.5)*.05;
    canoe.position.y=-1.8+Math.sin(t*.4)*.018;
    smoke.forEach((s,i)=>{s.position.y=-1.35+i*.09+((t*.07+i*.03)% .18);s.scale.setScalar(.7+((t*.04+i*.02)% .5));});
  });
}
function buildPopulation1804(g,c,m,rng){
  const grass=solid('#5d7447',{roughness:1}),earth=solid('#9b7b58',{roughness:1});
  const stone=solid('#a89a82',{roughness:.9}),plaster=solid('#cfc1a4',{roughness:.9});
  const roof=solid('#765642',{roughness:.9}),thatch=solid('#b28f58',{roughness:.95}),wheat=solid('#b6a15d',{roughness:.9});
  const water=solid('#4c98aa',{emissive:'#2c6d7c',emissiveIntensity:.25,transparent:true,opacity:.9,roughness:.2});
  pedestal(g,5.8,3.5);
  g.add(block(5.4,.1,3.2,earth,0,-1.94,0),block(5.2,.06,3.02,grass,0,-1.86,0));
  g.add(block(1.1,.025,2.4,solid('#a58a63'),-.2,-1.82,.3));
  // Church with a stone tower, nave, pitched roof and cross.
  const church=new THREE.Group();church.position.set(-.75,-1.83,-.95);g.add(church);
  church.add(block(.32,.92,.32,stone,-.42,.46,0),block(.9,.46,.46,plaster,.12,.23,0));
  church.add(block(.36,.04,.36,roof,-.42,.94,0),object(new THREE.ConeGeometry(.23,.24,4),roof,-.42,1.07,0));
  const naveRoof=object(new THREE.ConeGeometry(.58,.25,4),roof,.12,.62,0);naveRoof.rotation.y=Math.PI/4;naveRoof.scale.z=.45;church.add(naveRoof);
  church.add(block(.13,.2,.03,solid('#5e4833'),.12,.12,.24),block(.09,.20,.02,solid('#d9bc7c'),-.42,.62,.17),block(.05,.06,.05,solid('#8d7347'),-.42,1.21,0));
  church.add(block(.02,.16,.02,solid('#7d623a'),-.42,1.31,0),block(.1,.02,.02,solid('#7d623a'),-.42,1.34,0));
  // Cottages around a cobbled green.
  const cottage=(x,z,w=.45,h=.4,d=.4)=>{
    g.add(block(w,h,d,plaster,x,-1.83+h/2,z),block(w+.06,.04,d+.06,roof,x,-1.83+h,z));
    g.add(block(w*.18,.22,.02,solid('#5f4734'),x,-1.72,z+d/2+.015));
    g.add(block(w*.2,.12,.02,solid('#d8c58e'),x+w*.25,-1.68,z+d/2+.02));
    g.add(block(.08,.22,.08,stone,x-w*.3,-1.83+h+.1,z+d*.1));
  };
  for(const [hx,hz,w,h] of [[-2.0,.25,.45,.4],[-1.35,.45,.4,.35],[1.45,.4,.46,.42],[2.0,.25,.4,.36],[-1.7,-.55,.38,.32]])cottage(hx,hz,w,h);
  // Market square: stalls, produce, barrels and a central well.
  for(let i=0;i<5;i++)g.add(block(.5,.02,.35,solid(i%2?'#b6a487':'#a39177'),-.35+i*.45,-1.83,.75));
  const awning=['#9c5546','#7d6749','#4e6870'];
  for(let i=0;i<3;i++){
    const x=-.55+i*.55,z=.82;
    g.add(block(.4,.06,.3,solid('#806345'),x,-1.62,z));
    for(const s of [-1,1])g.add(block(.03,.3,.03,solid('#6a5038'),x+s*.17,-1.72,z));
    const a=block(.48,.025,.38,solid(awning[i]),x,-1.42,z);a.rotation.z=.06;g.add(a);
    for(let j=0;j<4;j++)g.add(ball(.035,solid(['#b16f48','#a28b4e','#76854a','#b3986a'][j]),x-.1+j*.07,-1.56,z));
    g.add(cyl(.055,.12,solid('#8b6847'),x+.17,-1.56,z+.08,.045));
  }
  g.add(cyl(.13,.09,stone,-2.0,-1.79,.82,.15),cyl(.09,.02,water,-2.0,-1.73,.82,.11));
  // Windmill on a low rise, with four turning sails.
  g.add(block(.9,.14,.6,solid('#6b7a4c'),1.72,-1.8,-1.05));
  g.add(cyl(.25,.62,stone,1.72,-1.48,-1.05,.3),object(new THREE.ConeGeometry(.3,.2,10),roof,1.72,-1.08,-1.05));
  const mill=new THREE.Group();mill.position.set(1.72,-1.08,-.86);g.add(mill);
  mill.add(ball(.05,solid('#6c533b')));
  for(let i=0;i<4;i++){const a=i*TAU/4;const blade=block(.045,.52,.1,solid('#d6c29b'),Math.cos(a)*.26,Math.sin(a)*.26,0);blade.rotation.z=a-Math.PI/2;mill.add(blade);}
  // Wheat fields and hedgerows on the left and foreground.
  for(const [px,pz,pw] of [[-2.0,.95,.85],[-1.0,1.05,.75],[1.1,1.05,.8]]){
    g.add(block(pw,.045,.38,solid('#718647'),px,-1.81,pz));
    for(let r=0;r<4;r++)g.add(block(pw-.06,.025,.055,solid(r%2?'#a49b53':'#718243'),px,-1.76,pz-.12+r*.08));
    for(let i=0;i<12;i++){const cx=px-pw/2+rng()*pw,cz=pz-.14+rng()*.28;g.add(rod(V(cx,-1.75,cz),V(cx,-1.55+rng()*.06,cz),.007,wheat));}
  }
  for(const x of [-2.4,-1.55,-.75,.55,1.35,2.15])g.add(block(.18,.26,.12,solid('#536c3e'),x,-1.74,1.28));
  // People, animals, a cart and a market-day crowd.
  cow(g,1.15,-.55,'#9b7658',.9);sheep(g,.55,-.55,.85);sheep(g,1.8,-.5,.8);
  g.add(block(.7,.08,.32,solid('#725238'),-1.3,-1.56,.4),block(.62,.04,.34,solid('#8a6547'),-1.3,-1.5,.4));
  for(const s of [-1,1]){const w=object(new THREE.TorusGeometry(.14,.03,6,18),solid('#563b28'),-1.3+s*.3,-1.68,.4);w.rotation.y=Math.PI/2;g.add(w);}
  g.add(block(.22,.14,.18,solid('#c3a878'),-1.42,-1.42,.4));
  const dress=['#8e5d4c','#6f5d49','#a18763','#5d6d74','#9b7a57','#75604b','#c0a276','#7f4e49'];
  for(let i=0;i<8;i++)figure(g,-1.3+i*.4,.32+(i%3)*.2,dress[i],'#b98b65',.8,'#3a3028',-1.8);
  figure(g,1.45,-.1,'#d3c5a8','#b98b65',.8,'#4b3a2e',-1.8);
  m.push((d,t)=>{mill.rotation.z=-t*.18;});
}
function buildPopulation1974(g,c,m,rng){
  const grass=solid('#5f7848',{roughness:1}),concrete=solid('#a9a18f',{roughness:.9}),brick=solid('#9f6f56',{roughness:.9});
  const asphalt=solid('#34383b',{roughness:.9}),glass=solid('#5f7d88',{roughness:.5,metalness:.2});
  const wheat=solid('#b1a05d',{roughness:.9}),roof=solid('#7d5944',{roughness:.9});
  pedestal(g,5.9,3.6);
  g.add(block(5.5,.1,3.2,grass,0,-1.94,0),block(3.4,.06,3.0,concrete,-1.0,-1.86,-.1),block(1.9,.05,2.9,solid('#6d8148'),1.55,-1.86,-.1));
  const blockBuilding=(x,z,w,d,h,mat,balcony=false)=>{
    g.add(block(w,h,d,mat,x,-1.82+h/2,z),block(w+.04,.04,d+.04,solid('#706b61'),x,-1.8+h,z));
    const rows=Math.floor(h/.18),cols=Math.floor(w/.14);
    for(let r=0;r<rows;r++)for(let k=0;k<cols;k++){
      const isLit=(r+k)%5===0;g.add(block(.08,.06,.02,isLit?lit('#d9bd78'):solid('#41525a'),x-w/2+.08+k*.14,-1.7+r*.18,z+d/2+.012));
    }
    if(balcony)for(let r=1;r<3;r++)g.add(block(w*.8,.025,.18,solid('#79796f'),x,-1.65+r*.24,z+d/2+.08));
  };
  blockBuilding(-1.85,-.55,.65,.5,.88,concrete,true);
  blockBuilding(-1.0,-.82,.5,.48,1.24,brick,true);
  blockBuilding(-.28,-.62,.55,.5,1.5,concrete);
  blockBuilding(-2.05,.38,.75,.45,.56,brick);
  g.add(block(.38,.5,.38,solid('#9ba09c'),-.28,-.03,-.62),rod(V(-.28,.2,-.62),V(-.28,.62,-.62),.012,solid('#7d8382')));
  g.add(ball(.032,lit('#e6a56c'),-.28,.65,-.62));
  // A second row of apartments and a billboard give the skyline depth.
  blockBuilding(-1.42,-1.3,.42,.36,.7,concrete);blockBuilding(.08,-1.28,.5,.38,.92,brick);
  broadleafTree(g,-2.42,.45,.7);broadleafTree(g,-2.45,-.55,.62);
  for(const [lx,lz] of [[-2.1,1.1],[-1.2,1.1],[-.3,1.1],[.6,1.1]]){
    g.add(rod(V(lx,-1.8,lz),V(lx,-1.2,lz),.012,solid('#6f7776')),block(.028,.028,.16,solid('#7f8784'),lx,-1.2,lz));
    g.add(ball(.032,lit('#f2cf88'),lx,-1.17,lz));
  }
  g.add(block(.55,.26,.04,lit('#6fa6a2'),.95,-1.25,.2),block(.04,.45,.04,solid('#5e6767'),.75,-1.52,.2),block(.04,.45,.04,solid('#5e6767'),1.15,-1.52,.2));
  for(let i=0;i<3;i++)g.add(block(.32,.025,.08,solid('#c9d0c8'),.95,-1.32+i*.07,.17));
  // A construction crane marks the growth edge of the city.
  g.add(rod(V(-.95,-1.82,-1.25),V(-.95,.35,-1.25),.025,solid('#c4a349')),block(1.4,.05,.05,solid('#c4a349'),-.3,.32,-1.25),block(.05,.55,.05,solid('#c4a349'),-.95,.35,-1.25));
  g.add(rod(V(.35,.32,-1.25),V(.35,-.38,-1.25),.009,solid('#8f7b44')));
  // Road, lane marks, bus and cars.
  g.add(block(5.3,.03,.34,asphalt,0,-1.79,.95));
  for(let i=0;i<10;i++)g.add(block(.25,.012,.03,solid('#d5c493'),-2.2+i*.5,-1.77,.95));
  const bus=new THREE.Group();bus.position.set(-1.7,-1.8,.95);g.add(bus);
  bus.add(block(.58,.17,.2,solid('#b55e4a'),0,.12,0),block(.54,.055,.205,glass,0,.2,0));
  for(const x of [-.18,.18])for(const z of [-.07,.07]){const w=object(new THREE.CylinderGeometry(.035,.035,.02,10),solid('#1d2326'),x,.055,z);w.rotation.x=Math.PI/2;bus.add(w);}
  const cars=[];for(let i=0;i<4;i++){const q=new THREE.Group();q.position.set(-2.2+i*.9,-1.8,.72);g.add(q);q.add(block(.24,.05,.12,solid(['#c6bca7','#5b7b83','#b98355','#7d8b76'][i]),0,.08,0));cars.push(q);}
  // Elevated rail and a moving train.
  g.add(block(5.3,.03,.08,solid('#888f8e'),0,-1.55,1.32),block(5.3,.025,.08,solid('#888f8e'),0,-1.68,1.32));
  for(let i=0;i<4;i++)g.add(cyl(.025,.5,solid('#7f8582'),-2.1+i*.5,-1.64,1.32));
  const train=new THREE.Group();train.position.set(-2.3,-1.53,1.32);g.add(train);
  for(let i=0;i<3;i++){train.add(block(.45,.15,.16,solid('#c4c9c4'),i*.48,0,0),block(.4,.055,.165,solid('#53646b'),i*.48,.01,0));}
  // Farmland, barn and silo on the right.
  for(let p=0;p<3;p++){const px=1.15+p*.42,pz=-.4+p*.3;g.add(block(.5,.05,.5,solid('#718447'),px,-1.81,pz));for(let r=0;r<3;r++)g.add(block(.44,.025,.06,solid(r%2?'#a19a55':'#6a803f'),px,-1.76,pz-.13+r*.12));}
  g.add(block(.5,.45,.55,solid('#c3b79a'),2.05,-1.58,-.85),object(new THREE.ConeGeometry(.42,.22,4),roof,2.05,-1.28,-.85).rotateY(Math.PI/4));
  g.add(cyl(.18,.5,solid('#b5aa92'),1.5,-1.55,-.9,.15),object(new THREE.ConeGeometry(.2,.18,10),solid('#8f826b'),1.5,-1.24,-.9));
  g.add(cyl(.16,.34,solid('#8b6b48'),2.25,-1.66,.35,.15));
  const people=['#d4c8ad','#8a6b56','#5b7480','#a78b61','#c9b28c','#6e6b55'];
  for(let i=0;i<6;i++)figure(g,-1.2+i*.42,.2+(i%2)*.22,people[i],'#b98b65',.8,'#3a3028',-1.8);
  m.push((d,t)=>{bus.position.x=-2.6+(t*.09)%5.2;cars.forEach((q,i)=>{q.position.x=-2.4+((t*.1+i*.9)%4.8);});train.position.x=-3+(t*.12)%6;});
}
function buildPopulation2022(g,c,m,rng){
  const pavement=solid('#4c5257',{roughness:.9}),asphalt=solid('#2e3338',{roughness:.92});
  const grass=solid('#5d7b4a',{roughness:1}),field=solid('#718a4d',{roughness:1}),towerGlass=solid('#4c6f7d',{roughness:.4,metalness:.25});
  const steel=solid('#a7b3b5',{metalness:.65,roughness:.3}),green=solid('#4b7748',{roughness:.95});
  const facade=windowFacade(rng),facade2=windowFacade(rng);
  pedestal(g,5.9,3.6);
  g.add(block(5.5,.1,3.2,grass,0,-1.94,0),block(3.3,.06,3.0,pavement,-1.05,-1.86,-.1),block(2.0,.06,3.0,field,1.65,-1.86,-.1));
  // Dense, vertical city on the left.
  const tower=(x,z,w,d,h,mat)=>g.add(block(w,h,d,mat,x,-1.82+h/2,z),block(w+.05,.05,d+.05,steel,x,-1.79+h,z));
  tower(-1.9,-.75,.52,.5,1.55,facade);tower(-1.18,-1.0,.48,.44,1.72,facade2);
  tower(-.38,-.72,.6,.55,2.05,facade);g.add(block(.42,.5,.4,facade2,-.38,-1.82+2.05+.25,-.72),block(.48,.04,.46,steel,-.38,-1.82+2.05+.52,-.72));
  tower(.36,-.98,.44,.42,1.35,facade2);tower(-1.95,.1,.56,.42,.8,towerGlass);
  // A green vertical garden and a skybridge make the city read as 2020s, not 2007.
  for(let i=0;i<6;i++)g.add(block(.1,.16,.05,green,-1.95+i*.09,-1.2+i*.22,-.37));
  const bridge=block(.9,.06,.14,steel,-.72,-.42,-.78);g.add(bridge);
  for(let i=0;i<5;i++)g.add(block(.1,.025,.14,lit('#9fe0e6'),-.95+i*.12,-.38,-.78));
  g.add(block(.34,.18,.02,lit('#7bd0df'),.36,-.4,-.56));
  // Rural half: terraces, greenhouse, solar panels and village huts.
  for(let i=0;i<3;i++){
    g.add(block(.62,.07,.48,solid('#7f9858'),1.45+i*.0,-1.82+i*.06,-.25+i*.42));
    for(let r=0;r<3;r++)g.add(block(.54,.02,.05,solid(r%2?'#a2ae62':'#6d8745'),1.45,-1.76+i*.06,-.32+i*.42+r*.1));
  }
  g.add(block(.62,.26,.42,glass('#9bd3c6',.2),1.5,-1.62,.46),block(.65,.04,.45,steel,1.5,-1.47,.46));
  for(const s of [-1,1])g.add(block(.28,.03,.26,solid('#4e6c7a'),1.8+s*.16,-1.76,.9));
  const hut=(x,z)=>{g.add(cyl(.19,.2,solid('#b58a5f'),x,-1.73,z,.17),object(new THREE.ConeGeometry(.27,.18,10),solid('#b3935d'),x,-1.54,z));};
  hut(2.2,.15);hut(2.02,.55);hut(2.32,.42);
  broadleafTree(g,2.32,-.55,.56);broadleafTree(g,1.72,-.42,.5);
  for(let i=0;i<3;i++)for(let j=0;j<2;j++)g.add(block(.18,.022,.11,solid('#5b89a8'),1.02+i*.22,-1.78,.78+j*.15));
  // Wind turbines and a high-speed rail link city to countryside.
  const turbines=[];
  for(const [tx,tz] of [[1.2,-.9],[2.0,-.75]]){
    g.add(cyl(.035,.9,steel,tx,-1.36,tz),ball(.05,steel,tx,-.9,tz));
    const rotor=new THREE.Group();rotor.position.set(tx,-.9,tz-.04);g.add(rotor);
    for(let i=0;i<3;i++){const b=block(.035,.42,.035,solid('#d8e1df'),0,-.18,0);b.rotation.z=i*TAU/3;rotor.add(b);}
    turbines.push(rotor);
  }
  g.add(block(5.3,.03,.08,steel,0,-1.5,1.3),block(5.3,.025,.08,steel,0,-1.62,1.3));
  const train=new THREE.Group();train.position.set(-2.4,-1.49,1.3);g.add(train);
  for(let i=0;i<3;i++){train.add(block(.48,.13,.16,solid('#e8eeeb'),i*.5,0,0),block(.42,.05,.165,lit('#7bd9e5'),i*.5,.01,0));}
  // A faint wireframe globe and data arcs make the global scale legible.
  const globe=new THREE.Group();globe.position.set(.1,.82,-1.1);g.add(globe);
  globe.add(new THREE.LineSegments(new THREE.WireframeGeometry(new THREE.SphereGeometry(.25,12,8)),new THREE.LineBasicMaterial({color:'#8fdbe4',transparent:true,opacity:.45})));
  const arcs=[];
  for(let i=0;i<2;i++){const arc=path([[Math.cos(i*2)*.08,.8,-1.1],[0,1.25,-.9],[Math.cos(i*2+1)*.4,.72,-.55]],.008,lit('#8fdbe4'));g.add(arc);arcs.push(arc);}
  const people=['#d9cdb5','#637986','#a8735c','#6c7f5d','#c9a674'];
  for(let i=0;i<5;i++)figure(g,-1.2+i*.42,-.05+(i%2)*.18,people[i],'#b98b65',.8,'#3a3028',-1.8);
  m.push((d,t)=>{turbines.forEach((v,i)=>v.rotation.z=t*.35+i);train.position.x=-3+(t*.2)%6;globe.rotation.y=t*.12;globe.rotation.x=.2;arcs.forEach((a,i)=>a.material.opacity=.25+Math.sin(t*.6+i)*.1);});
}
function buildOriginOfCities(g,c,m,rng){
  const sand=solid('#c9a071',{roughness:1}),ground=solid('#b08055',{roughness:1});
  const mud=solid('#9e6641',{roughness:.96}),mudDark=solid('#7d4d32',{roughness:.98});
  const baked=solid('#cf9159',{roughness:.86}),lapis=solid('#2e6286',{roughness:.5});
  const water=solid('#4d99aa',{emissive:'#2d6c7d',emissiveIntensity:.28,transparent:true,opacity:.9,roughness:.25});
  const leaf=solid('#547c44',{roughness:.9}),gold=solid('#c7a159',{metalness:.55,roughness:.35});
  pedestal(g,5.9,3.6);
  g.add(block(5.5,.1,3.25,sand,0,-1.94,0),block(4.9,.14,2.55,ground,0,-1.84,0));
  // Ziggurat: five battered stages, brick coursing and a glazed shrine.
  const zx=0,zz=-.62;let y=-1.78;
  const stages=[[2.0,.3,1.25],[1.68,.27,1.02],[1.36,.24,.81],[1.04,.21,.6],[.74,.18,.41]];
  for(const [w,h,d] of stages){
    g.add(block(w,h,d,baked,zx,y+h/2,zz));
    g.add(block(w+.015,.03,d+.015,mudDark,zx,y+.025,zz));
    for(let i=-2;i<=2;i++)g.add(block(.025,h*.86,.018,mudDark,zx+i*w/5,y+h/2,zz+d/2+.012));
    y+=h;
  }
  g.add(block(1.38,.025,.88,lapis,zx,y-.05,zz),block(.78,.04,.55,baked,zx,y-.02,zz));
  y+=.02;g.add(block(.48,.28,.34,baked,zx,y+.14,zz),block(.36,.16,.02,lapis,zx,y+.13,zz+.18));
  g.add(block(.54,.05,.4,gold,zx,y+.3,zz),block(.08,.14,.08,gold,zx,y+.37,zz));
  // Processional stair.
  for(let i=0;i<16;i++){const sy=-1.79+i*.045,sz=.1+i*.036;g.add(block(.42,.05,.18,mudDark,zx,sy,sz));}
  for(const s of [-1,1])g.add(block(.05,.62,.8,mud,zx+s*.24,-1.48,.38));
  // Mudbrick wall with buttresses, crenellations, and a twin-tower gate.
  const wallH=.44,wy=-1.82;
  g.add(block(1.6,wallH,.18,mud,-1.38,wy+wallH/2,.94),block(1.6,wallH,.18,mud,1.38,wy+wallH/2,.94));
  g.add(block(4.3,wallH,.18,mud,0,wy+wallH/2,-1.22));
  for(const s of [-1,1])g.add(block(.18,wallH,2.16,mud,s*2.15,wy+wallH/2,-.14));
  for(const sx of [-2.15,-1.45,-.75,.75,1.45,2.15])g.add(block(.28,wallH*.92,.24,mudDark,sx,-1.6,.94));
  for(const sz of [-1.15,-.6,-.05,.5])g.add(block(.24,wallH*.92,.3,mudDark,-2.15,-1.6,sz),block(.24,wallH*.92,.3,mudDark,2.15,-1.6,sz));
  for(const sx of [-1.95,-1.15,-.35,.35,1.15,1.95])g.add(block(.18,.13,.22,mudDark,sx,-1.28,.94));
  for(const sx of [-1.95,-1.2,-.45,.45,1.2,1.95])g.add(block(.18,.12,.22,mudDark,sx,-1.28,-1.22));
  for(const s of [-1,1]){
    g.add(block(.31,.92,.35,mud,s*.4,-1.36,.94),block(.39,.13,.43,mudDark,s*.4,-.84,.94));
    g.add(block(.13,.1,.21,gold,s*.4,-.77,.94));
  }
  g.add(block(.96,.18,.32,mudDark,0,-.94,.94),block(.5,.62,.06,mudDark,0,-1.45,.95));
  g.add(block(.66,.04,.35,baked,0,-.84,.94),block(.08,.16,.08,lapis,0,-.7,.94));
  // Flat-roofed houses packed inside the wall, each with a vent and shaded door.
  const mudHouse=(x,z,w=.46,h=.4,d=.42)=>{
    g.add(block(w,h,d,mud,x,-1.78+h/2,z));
    g.add(block(w+.06,.045,d+.06,mudDark,x,-1.78+h,z));
    g.add(block(w+.025,.035,d+.025,baked,x,-1.78+h*.55,z));
    g.add(block(.09,h*.55,.03,mudDark,x-w*.18,-1.78+h*.28,z+d/2+.016));
    g.add(block(.07,.09,.02,solid('#5b402e'),x+w*.16,-1.78+h*.7,z+d/2+.018));
    g.add(cyl(.045,.18,mud,x+w*.18,-1.78+h+.09,z-.02,.035));
    g.add(block(.11,.03,.11,mudDark,x+w*.18,-1.78+h+.18,z-.02));
  };
  for(const [hx,hz] of [[-1.7,.48],[-1.05,.52],[-1.72,-.2],[-1.03,-.18],[1.03,.5],[1.7,.43],[1.02,-.2],[1.72,-.24]])mudHouse(hx,hz);
  for(let i=0;i<4;i++)g.add(block(.42,.025,.25,baked,0,-1.79,.68-i*.19));
  // Irrigation: a front canal and bridge, branch channels and two plots of young crops.
  g.add(block(4.8,.028,.2,water,0,-1.86,1.1),block(5.0,.05,.3,mudDark,0,-1.9,1.1));
  g.add(block(.72,.045,.38,solid('#7b593b'),0,-1.83,1.1));
  for(const s of [-1,1])g.add(block(.04,.14,.4,solid('#6a4d34'),s*.32,-1.74,1.1));
  for(let i=0;i<4;i++)g.add(block(.6,.018,.035,solid('#8f6b49'),0,-1.8,.98+i*.07));
  g.add(block(.16,.028,.34,water,-1.8,-1.85,1.26),block(.26,.045,.42,mudDark,-1.8,-1.9,1.26));
  g.add(block(.16,.028,.28,water,1.55,-1.85,.22),block(.26,.045,.36,mudDark,1.55,-1.9,.22));
  const plots=[[-1.72,1.4,.9],[1.78,1.4,.82]];
  for(const [px,pz,pw] of plots){
    g.add(block(pw,.05,.32,solid('#667f43',{roughness:1}),px,-1.83,pz));
    for(let r=0;r<4;r++)g.add(block(pw-.08,.03,.055,solid(r%2?'#88984f':'#5e7b3d'),px,-1.78,pz-.11+r*.08));
    for(let i=0;i<14;i++){const cx=px-pw/2+rng()*pw,cz=pz-.12+rng()*.26;g.add(rod(V(cx,-1.77,cz),V(cx,-1.62+rng()*.06,cz),.007,solid('#a6a35a')));}
  }
  // Reed clumps at the water's edge.
  for(const [rx,rz] of [[-2.2,1.42],[-.45,1.42],[.85,1.42],[2.25,1.42]]){
    for(let i=0;i<4;i++)g.add(rod(V(rx+(i-.5)*.025,-1.86,rz),V(rx+(i-.5)*.04,-1.2+rng()*.15,rz+(rng()-.5)*.06),.01,solid('#7e8545')));
  }
  // Granary, storage jars, and a loaded ox cart by the gate.
  g.add(cyl(.28,.38,mud,1.58,-1.64,-1.02,.34),object(new THREE.ConeGeometry(.42,.3,12),solid('#8c6b45'),1.58,-1.3,-1.02));
  for(let i=0;i<3;i++){g.add(cyl(.09,.2,solid('#b06f48'),1.2+i*.15,-1.76,.42,.06));}
  g.add(block(.78,.09,.36,solid('#72533a'),-1.3,-1.58,1.38),block(.74,.05,.38,solid('#8a6747'),-1.3,-1.52,1.38));
  for(const s of [-1,1]){const w=object(new THREE.TorusGeometry(.17,.035,7,20),solid('#553a28'),-1.3+s*.36,-1.7,1.38);w.rotation.y=Math.PI/2;g.add(w);}
  g.add(block(.26,.16,.2,solid('#c6ad7c'),-1.44,-1.43,1.38),block(.26,.14,.2,solid('#bca16f'),-1.14,-1.44,1.38));
  // Date palms frame the city and break the rectilinear silhouette.
  const palms=[palmTree(g,-2.45,1.4,1.3,.9),palmTree(g,2.3,-.94,1.22,.88),palmTree(g,-2.18,-1.08,1.05,.76)];
  // Inhabitants: farmers, a guard, and people on the processional way.
  const robes=['#b06f4b','#7b684e','#8b5b4b','#c09a6a','#6b7260'];
  figure(g,-1.55,1.4,robes[0],'#b98b65',.82,'#3a3028');
  figure(g,-.92,1.38,robes[2],'#b98b65',.8,'#3a3028');
  figure(g,1.3,1.42,robes[3],'#b98b65',.8,'#3a3028');
  figure(g,2.0,.82,robes[1],'#b98b65',.78,'#3a3028');
  figure(g,.7,.78,robes[4],'#b98b65',.86,'#7a5a3d');
  figure(g,-.2,.34,robes[1],'#b98b65',.84,'#3a3028');
  figure(g,.24,-.18,robes[2],'#b98b65',.83,'#3a3028');
  figure(g,1.18,-.65,robes[0],'#b98b65',.82,'#3a3028');
  g.add(rod(V(.7,-1.1,.95),V(.7,-.18,.95),.012,solid('#6a5037')));
  g.add(block(.12,.04,.04,gold,.7,-.12,.95));
  // A blue banner and a few storage pots animate life without implying scale.
  g.add(rod(V(-.74,-.9,-.62),V(-.74,-.12,-.62),.018,mudDark));
  const banner=block(.3,.34,.018,lapis,-.58,-.24,-.62);g.add(banner);
  m.push((d,t)=>{
    palms.forEach((p,i)=>{p.rotation.z=Math.sin(t*.45+i*1.3)*.025;p.rotation.x=Math.cos(t*.35+i)*.012;});
    banner.rotation.y=Math.sin(t*.7)*.22;
    water.emissiveIntensity=.2+Math.sin(t*.55)*.06;
  });
}
function buildClassicalCity(g,c,m,rng){
  const marble=solid('#d7ceba',{roughness:.62}),marbleDark=solid('#bdb19a',{roughness:.8});
  const stone=solid('#a89d86',{roughness:.95}),terracotta=solid('#b46c50',{roughness:.72});
  const bronze=solid('#967644',{metalness:.72,roughness:.32}),olive=solid('#5a7246',{roughness:.95});
  pedestal(g,5.8,3.5);
  g.add(block(5.4,.1,3.25,stone,0,-1.94,0),block(4.6,.12,2.4,solid('#c8bca5'),0,-1.84,-.1));
  // Acropolis: two pale limestone terraces and a low rocky crown.
  g.add(block(3.15,.28,1.38,marbleDark,0,-1.64,-.72),block(2.75,.2,1.12,marble,0,-1.4,-.78));
  for(let i=0;i<8;i++)g.add(block(.28,.14,.16,stone,-1.35+i*.39,-1.78,-1.38+(i%3)*.04));
  const p=new THREE.Group();p.position.set(0,-1.29,-.78);g.add(p);
  p.add(block(2.0,.08,1.0,marble,0,.04,0));
  p.add(block(1.86,.055,.86,marbleDark,0,.1,0));
  const pcol=(px,pz)=>{p.add(cyl(.048,.64,marble,px,.45,pz,.066));p.add(block(.15,.035,.15,marble,px,.13,pz));p.add(block(.17,.045,.17,marble,px,.8,pz));};
  for(let i=0;i<6;i++){const px=-.76+i*.304;pcol(px,.34);pcol(px,-.34);}
  for(let i=0;i<3;i++){const pz=-.17+i*.34;pcol(-.94,pz);pcol(.94,pz);}
  p.add(block(1.98,.13,.9,marble,0,.91,0),block(1.84,.08,.8,marbleDark,0,1.0,0));
  for(let i=0;i<8;i++)p.add(block(.08,.08,.06,terracotta,-.85+i*.24,.97,.4));
  const pediment=object(new THREE.ConeGeometry(1.02,.26,4),marble,0,1.13,0);pediment.rotation.y=Math.PI/4;pediment.scale.z=.44;p.add(pediment);
  for(const s of [-1,1]){p.add(ball(.045,bronze,s*.82,1.08,.42));p.add(rod(V(s*.82,1.08,.42),V(s*.82,1.26,.42),.008,bronze));}
  p.add(block(1.34,.36,.48,marbleDark,0,.32,0),block(.44,.3,.03,terracotta,0,.31,.24));
  // Stoa: a shaded colonnade on the left of the agora.
  const st=new THREE.Group();st.position.set(-1.9,-1.82,.1);g.add(st);
  for(let i=0;i<6;i++){st.add(cyl(.047,.58,marble,0,.29,-.72+i*.29,.06));st.add(block(.14,.04,.14,marble,0,.03,-.72+i*.29),block(.16,.04,.16,marble,0,.59,-.72+i*.29));}
  st.add(block(.54,.08,1.86,terracotta,0,.66,0),block(.1,.58,1.82,marbleDark,-.23,.29,0));
  // Agora paving, three market stalls and a bronze orator.
  for(let i=0;i<5;i++)g.add(block(.58,.035,.42,marble,0,-1.83,.22+i*.24));
  const awning=['#8d4f45','#4e6b76','#aa8752'];
  for(let i=0;i<3;i++){
    const x=.35+i*.56,z=.72;
    g.add(block(.44,.065,.32,solid('#8c7457'),x,-1.58,z));
    for(const s of [-1,1])g.add(block(.035,.28,.035,solid('#6a523d'),x+s*.18,-1.72,z));
    const a=block(.52,.028,.4,solid(awning[i]),x,-1.38,z);a.rotation.z=.06;g.add(a);
    g.add(cyl(.065,.17,solid('#b46c50'),x-.13,-1.45,z-.02,.05));
    for(let j=0;j<3;j++)g.add(ball(.035,solid(['#b48b48','#8b6d45','#7b8450'][j]),x+.06+j*.07,-1.51,z-.02));
  }
  g.add(block(.38,.26,.3,marbleDark,-.58,-1.69,.88),block(.3,.08,.24,marble,-.58,-1.53,.88));
  figure(g,-.58,.88,'#9b7d45','#a97956',.86,'#4b3c2c',-1.49);
  g.add(rod(V(-.58,-1.45,.88),V(-.58,-.56,.88),.012,bronze),block(.09,.04,.02,bronze,-.58,-.54,.88));
  // Olive trees and cypresses give the marble city a Mediterranean silhouette.
  const trees=[];
  for(const [tx,tz,s] of [[-2.22,.86,.9],[2.14,.7,.82],[2.15,-.42,.7],[-2.28,-.55,.65]]){
    const t=new THREE.Group();t.position.set(tx,-1.84,tz);t.scale.setScalar(s);g.add(t);
    t.add(cyl(.055,1.05,solid('#74604a'),0,.52,0,.075));
    for(let i=0;i<5;i++){const b=ball(.27,olive,Math.cos(i*1.9)*.22,1.05+Math.sin(i*1.4)*.16,Math.sin(i*1.9)*.2);b.scale.set(1,.55,1);t.add(b);}
    trees.push(t);
  }
  for(const [tx,tz,h] of [[-2.38,-1.22,1.25],[2.34,-1.18,1.12]])cypressTree(g,tx,tz,h,.9);
  const people=[['#d9d0bc','#9e6f52'],['#6e8390','#9e6f52'],['#c4b795','#8f6048'],['#8b5d4d','#9e6f52'],['#5e6f58','#8f6048'],['#cbbda1','#9e6f52'],['#7f6a50','#8f6048'],['#9b554b','#9e6f52']];
  for(let i=0;i<8;i++)figure(g,-1.35+i*.4,.32+(i%3)*.2,people[i][0],people[i][1],.8,'#3c352d');
  figure(g,.7,.32,'#d7cdb7','#9e6f52',.82,'#4b3e31');
  m.push((d,t)=>trees.forEach((v,i)=>v.rotation.y=Math.sin(t*.12+i)*.025));
}
function buildRomanCity(g,c,m,rng){
  const trav=solid('#c9b795',{roughness:.78}),marble=solid('#ddd2bd',{roughness:.58});
  const stone=solid('#a99b83',{roughness:.95}),tile=solid('#9e5644',{roughness:.8});
  const bronze=solid('#9a7b48',{metalness:.72,roughness:.32}),water=solid('#5b9aaa',{emissive:'#2e6b7a',emissiveIntensity:.28,transparent:true,opacity:.9,roughness:.2});
  const red=solid('#8e3f3b'),green=solid('#425b43');
  pedestal(g,5.8,3.5);
  g.add(block(5.4,.1,3.25,trav,0,-1.94,0),block(5.0,.08,2.8,stone,0,-1.84,-.05));
  // Temple of Jupiter: a deep podium, six columns, tiled gable and gilded doors.
  const tp=new THREE.Group();tp.position.set(0,-1.82,-.82);g.add(tp);
  tp.add(block(1.7,.22,.9,trav,0,.11,0),block(1.58,.16,.82,marble,0,.28,0));
  const tcol=(x,z)=>{tp.add(cyl(.056,.66,marble,x,.69,z,.074));tp.add(block(.16,.04,.16,marble,x,.38,z));tp.add(block(.18,.045,.18,marble,x,1.04,z));};
  for(let i=0;i<6;i++)tcol(-.66+i*.264,.31);
  for(let i=0;i<3;i++)tcol(-.78,-.16+i*.32);
  tp.add(block(1.62,.12,.76,marble,0,1.11,0),block(1.5,.08,.68,trav,0,1.2,0));
  const troof=object(new THREE.ConeGeometry(.92,.24,4),tile,0,1.34,0);troof.rotation.y=Math.PI/4;troof.scale.z=.45;tp.add(troof);
  for(const s of [-1,1])tp.add(block(.22,.34,.02,bronze,s*.38,.46,.42));
  // Aqueduct across the rear: piers, arches and a channel silhouetted against the sky.
  // A short aqueduct fragment on the left, instead of a beam cutting across the temple.
  const aqZ=-1.3,aqY=-1.8,piers=[-2.55,-2.0,-1.45];
  for(const px of piers)g.add(block(.17,.6,.2,trav,px,aqY+.3,aqZ));
  for(let i=0;i<piers.length-1;i++){const mid=(piers[i]+piers[i+1])/2;archMesh(g,mid,aqY+.6,aqZ,.26,trav);}
  g.add(block(1.3,.1,.32,marble,-2.0,-.88,aqZ),block(1.38,.05,.38,trav,-2.0,-.8,aqZ));
  // Forum pavement, a triumphal arch and a colonnaded basilica.
  for(let r=0;r<4;r++)for(let i=0;i<7;i++)g.add(block(.6,.028,.3,r%2?marble:trav,-1.8+i*.6,-1.8,.55+r*.27));
  const ax=.88,az=.78;
  g.add(block(.22,.7,.24,trav,ax-.36,-1.47,az),block(.22,.7,.24,trav,ax+.36,-1.47,az),block(.94,.18,.26,marble,ax,-1.1,az));
  g.add(block(.86,.18,.28,trav,ax,-.94,az),block(.9,.04,.3,marble,ax,-.84,az));
  for(const s of [-1,1])g.add(block(.2,.36,.02,bronze,ax+s*.3,-1.24,az+.14));
  g.add(block(.18,.42,.03,red,ax-.62,-1.25,az+.02),block(.18,.42,.03,red,ax+.62,-1.25,az+.02));
  const bc=new THREE.Group();bc.position.set(-1.88,-1.82,.08);g.add(bc);
  for(let i=0;i<5;i++){bc.add(cyl(.05,.6,trav,0,.3,-.84+i*.42,.066));bc.add(block(.16,.04,.16,trav,0,.62,-.84+i*.42));}
  bc.add(block(.5,.12,1.92,marble,0,.74,0),block(.08,.62,1.9,trav,-.2,.3,0),block(.54,.06,1.95,tile,0,.82,0));
  for(let i=0;i<4;i++){const bz=-.68+i*.42;bc.add(archMesh(bc,0,.3,bz,.2,trav));}
  // A small curved amphitheatre gives the forum its second unmistakable Roman silhouette.
  const col=new THREE.Group();col.position.set(1.98,-1.82,-.36);g.add(col);
  col.add(cyl(.46,.045,solid('#b7a486'),0,.022,0,.38));
  for(let i=0;i<12;i++){
    const a=-1.75+i*(3.5/11),x=Math.cos(a)*.52,z=Math.sin(a)*.38;
    col.add(block(.17,.38,.15,trav,x,.21,z),block(.15,.25,.13,trav,x,.55,z));
    col.add(block(.095,.22,.02,solid('#4b4035'),x,.2,z+(z>=0?.08:-.08)));
    if(i===0||i===6||i===11)col.add(block(.19,.14,.05,tile,x,.62,z));
  }
  const colTop=object(new THREE.TorusGeometry(.52,.045,8,40),trav,0,.68,0);colTop.rotation.x=Math.PI/2;colTop.scale.z=.74;col.add(colTop);
  col.add(block(.28,.03,.18,stone,0,.02,.4));
  // Cypresses and red standards.
  const cyps=[cypressTree(g,-2.3,-.92,1.35,.95),cypressTree(g,-1.55,-.94,1.15,.85),cypressTree(g,2.3,-1.02,1.1,.8)];
  for(const s of [-1,1]){
    g.add(rod(V(s*1.8,-1.82,.62),V(s*1.8,-.35,.62),.026,solid('#69523a')));
    const flag=block(.28,.46,.02,red,s*1.66,-.57,.62);g.add(flag);
    g.add(block(.3,.04,.04,bronze,s*1.8,-.4,.62));
  }
  const togas=['#dfd7c4','#c9bda6','#8b5b4c','#7e8a8f','#b6a88f','#934c45','#d8cfbc','#6c7d87'];
  for(let i=0;i<8;i++)figure(g,-1.4+i*.4,.12+(i%3)*.14,togas[i],'#a87855',.8,'#3a312a');
  figure(g,ax-.5,.3,'#c7bda9','#a87855',.82,'#8b7654');
  figure(g,ax+.5,.3,'#7a4a43','#a87855',.82,'#8b7654');
  m.push((d,t)=>{
    cyps.forEach((v,i)=>v.rotation.y=Math.sin(t*.12+i)*.02);
    water.emissiveIntensity=.22+Math.sin(t*.6)*.06;
  });
}
function buildModernCity(g,c,m,rng){
  const asphalt=solid('#242a30',{roughness:.9}),pav=solid('#55595c',{roughness:.88});
  const steel=solid('#87959a',{metalness:.65,roughness:.3}),concrete=solid('#9b9588',{roughness:.8});
  const park=solid('#4d694d',{roughness:1}),pond=solid('#4f8599',{emissive:'#2d5b6a',emissiveIntensity:.25,transparent:true,opacity:.85,roughness:.18});
  const facade=windowFacade(rng),facade2=windowFacade(rng);
  pedestal(g,5.9,3.6);
  g.add(block(5.6,.08,3.3,asphalt,0,-1.94,0),block(5.2,.05,2.9,pav,0,-1.87,0));
  // Skyline: varied setbacks, one round tower, roof antennas and helipad.
  const tower=(x,z,w,d,h,mat=facade)=>{
    g.add(block(w,h,d,mat,x,-1.82+h/2,z),block(w+.04,.05,d+.04,steel,x,-1.79+h,z));
    return x;
  };
  tower(-1.86,-.86,.52,.52,1.58,facade);
  tower(-1.02,-1.06,.4,.42,1.2,facade2);
  tower(-.28,-.7,.64,.56,1.86,facade);
  g.add(block(.46,.5,.42,facade2,-.28,-1.82+1.86+.25,-.7),block(.5,.04,.46,steel,-.28,-1.82+1.86+.52,-.7));
  tower(.55,-1.0,.48,.46,1.42,facade2);
  tower(1.32,-.7,.56,.54,1.68,facade);
  g.add(block(.38,.32,.4,facade2,1.32,-1.82+1.68+.16,-.7),block(.42,.04,.44,steel,1.32,-1.82+1.68+.34,-.7));
  tower(2.04,-.94,.4,.42,1.14,facade);
  tower(-2.3,-.45,.46,.46,.94,concrete);
  // A darker second rank gives the skyline depth.
  g.add(block(.5,1.05,.36,facade2,-.82,-1.3,-1.3),block(.55,.05,.4,steel,-.82,-.75,-1.3));
  g.add(block(.42,.9,.34,concrete,.24,-1.38,-1.42),block(.46,.04,.38,steel,.24,-.91,-1.42));
  g.add(block(.5,.98,.34,facade,1.08,-1.34,-1.36),block(.54,.05,.38,steel,1.08,-.83,-1.36));
  // A cyan information screen breaks the box rhythm at street level.
  g.add(block(.4,.24,.02,solid('#102a33'),1.32,-.53,-.4),block(.31,.14,.012,lit('#82d6e5'),1.32,-.53,-.385));
  // Round glass tower and its crown.
  g.add(cyl(.24,1.38,facade,-2.24,-1.12,-.94,.26),cyl(.28,.05,steel,-2.24,-.42,-.94,.28),cyl(.18,.22,facade2,-2.24,-.28,-.94,.19));
  // Podium rooftops, antennae, beacons and a helipad.
  g.add(block(.8,.34,.5,steel,-.28,.06,-.7),block(.44,.3,.36,concrete,.9,-.12,.2),block(.6,.22,.46,concrete,-1.4,-.08,.3));
  g.add(rod(V(-.28,.28,-.7),V(-.28,1.0,-.7),.014,steel));
  g.add(ball(.035,lit('#ff7d65'),-.28,1.03,-.7),glow('#ff8d73',.45,.4).translateX(-.28).translateY(1.03).translateZ(-.7));
  g.add(rod(V(1.32,.05,-.7),V(1.32,.65,-.7),.012,steel),ball(.028,lit('#ff9c70'),1.32,.68,-.7));
  const pad=object(new THREE.TorusGeometry(.22,.015,6,32),lit('#ffe4a4'),-.28,.59,-.7);pad.rotation.x=Math.PI/2;g.add(pad);
  // Street grid, lane marks, crosswalk and an elevated metro line.
  g.add(block(5.4,.025,.28,asphalt,0,-1.81,1.15),block(.3,.025,2.1,asphalt,-.75,-1.81,.3));
  for(let i=0;i<13;i++)g.add(block(.3,.012,.025,solid('#d8c7a1'),-2.35+i*.4,-1.79,1.15));
  for(let i=0;i<5;i++)g.add(block(.2,.012,.035,solid('#d8c7a1'),-1.02+i*.1,-1.79,.55));
  for(const z of [-.1,.2,.5])g.add(block(.028,.012,.26,solid('#d8c7a1'),-1.72,-1.79,z));
  g.add(block(5.4,.03,.08,steel,0,-1.55,1.37),block(5.4,.026,.08,steel,0,-1.68,1.37));
  for(let i=0;i<4;i++){const x=-2.1+i*.42;g.add(cyl(.03,.55,steel,x,-1.7,1.37));}
  // Park with pond, bench and trees.
  g.add(block(1.0,.035,.7,park,-2.1,-1.79,1.0),cyl(.2,.02,pond,-2.18,-1.76,.94,.22));
  for(const [tx,tz] of [[-2.45,.82],[-1.78,.78],[-2.34,1.26]]){
    g.add(cyl(.04,.32,solid('#70563e'),tx,-1.62,tz),ball(.2,solid('#55724d'),tx,-1.38,tz));
  }
  g.add(block(.34,.045,.12,solid('#8a7354'),-1.35,-1.69,1.12));
  // Street lamps, tiny pedestrians and moving traffic.
  const lamps=[];for(const x of [-2.1,-.7,.8,2.2]){
    g.add(rod(V(x,-1.8,1.3),V(x,-1.35,1.3),.012,steel),glow('#ffd38a',.62,.3).translateX(x).translateY(-1.28).translateZ(1.3));
    lamps.push(glow('#ffd38a',.28,.25).translateX(x).translateY(-1.28).translateZ(1.3));
  }
  const cars=[];
  const car=(x,z,c0)=>{
    const q=new THREE.Group();q.position.set(x,-1.82,z);g.add(q);
    q.add(block(.3,.055,.13,solid(c0),0,.09,0),block(.16,.05,.11,solid('#2c353b'),0,.15,0));
    for(const s of [-1,1]){const w=object(new THREE.CylinderGeometry(.035,.035,.03,12),solid('#161b1e'),s*.1,.045,.075);w.rotation.x=Math.PI/2;q.add(w);}
    q.add(glow('#ffe5ad',.2,.25).translateX(.17).translateY(.09).translateZ(0));cars.push(q);return q;
  };
  for(let i=0;i<6;i++)car(-2.3+i*.88,.98+i%2*.16,['#b45b4f','#d3cbb9','#486b7a','#947d58','#d39a59','#597267'][i]);
  for(let i=0;i<2;i++)car(-.75+(i%2)*.22,.2+i*.36,'#c7b37d');
  const train=new THREE.Group();train.position.set(-2.2,-1.56,1.37);g.add(train);
  for(let i=0;i<3;i++){train.add(block(.42,.14,.17,solid('#b8c1c2'),i*.47,0,0),block(.38,.08,.175,lit('#ffe1a2'),i*.47,.01,0));}
  // People on the plaza.
  const coats=['#cfc4ad','#4e6572','#a26a55','#7e734f','#d6b47a','#596f5e'];
  for(let i=0;i<6;i++)figure(g,-1.25+i*.44,-.05+(i%2)*.24,coats[i],'#bb8c68',.8,'#35322e');
  m.push((d,t)=>{
    cars.forEach((q,i)=>{q.position.x+=d*(i%2?-.11:.13);if(q.position.x>2.9)q.position.x=-2.9;if(q.position.x<-2.9)q.position.x=2.9;});
    train.position.x=-3+(t*.16)%6;
    lamps.forEach((q,i)=>q.material.opacity=.2+Math.sin(t*.8+i)*.06);
  });
}
function galleon(g,x,z,scale=1,sail='#e4d7ba',flag='#9e4b3e'){
  const s=new THREE.Group();s.position.set(x,-1.70,z);s.scale.setScalar(scale);g.add(s);
  const hullMat=solid('#5d402c',{roughness:.7}), deck=solid('#8f6b46',{roughness:.75}), mast=solid('#4d3728',{roughness:.8});
  const hull=object(new THREE.CylinderGeometry(.12,.46,2.15,12),hullMat,0,.18,0);hull.rotation.z=Math.PI/2;hull.scale.set(1,1,.62);s.add(hull);
  s.add(block(2.0,.06,.46,deck,0,.44,0),block(.55,.18,.42,deck,-.78,.54,0),block(.46,.14,.36,deck,.80,.53,0));
  for(const zz of [-.20,.20])s.add(block(2.2,.035,.035,solid('#d8c7a5'),0,.50,zz));
  for(const [mx,hh] of [[-.55,1.55],[.10,1.85],[.62,1.35]]){
    s.add(cyl(.035,hh,mast,mx,.55,0,.028));
    const sailMesh=block(.58,hh*.54,.02,solid(sail),mx+.26,1.10,0);sailMesh.rotation.y=0;s.add(sailMesh);
    s.add(block(.66,.025,.025,mast,mx+.26,1.42,0));
    s.add(rod(V(mx,.60,0),V(mx+.55,1.55,0),.008,mast),rod(V(mx,.60,0),V(mx-.30,1.50,0),.008,mast));
  }
  const flagMesh=object(new THREE.ConeGeometry(.12,.34,4),solid(flag),-1.02,1.85,0);flagMesh.rotation.z=Math.PI/2;s.add(flagMesh);
  for(let i=0;i<5;i++)s.add(block(.10,.06,.03,solid('#cbb38c'),-.55+i*.28,.35,.26));
  s.add(ball(.10,solid('#2d2925'),-.85,.62,0),ball(.10,solid('#2d2925'),.82,.60,0));
}
function settlementWorkshop(g,c,m,rng,entry){
  const id=String(entry?.id||'').replace(/^time\./,'');
  const wood=solid('#8a7358',{roughness:.8}), stone=solid('#b1a68f',{roughness:.9}), roof=solid('#6f5945',{roughness:.9}), field=solid('#526b46',{roughness:1});
  pedestal(g,6,3.5);
  const floor=block(5.6,.12,3.2,field,0,-1.9,0);g.add(floor);
  if(['civilization-duration','holocene-epoch','origin-of-cities','urban-majority','roman-empire','classical-antiquity','industrial-era-duration','meiji-restoration','world-population-1-billion','world-population-4-billion','world-population-8-billion','human-lifespan'].includes(id)){
    if(id==='holocene-epoch'){buildHolocene(g,c,m,rng);return;}
    if(id==='world-population-1-billion'){buildPopulation1804(g,c,m,rng);return;}
    if(id==='world-population-4-billion'){buildPopulation1974(g,c,m,rng);return;}
    if(id==='world-population-8-billion'){buildPopulation2022(g,c,m,rng);return;}
    if(id==='origin-of-cities'){buildOriginOfCities(g,c,m,rng);return;}
    if(id==='urban-majority'){buildModernCity(g,c,m,rng);return;}
    if(id==='roman-empire'){buildRomanCity(g,c,m,rng);return;}
    if(id==='classical-antiquity'){buildClassicalCity(g,c,m,rng);return;}
    if(id==='meiji-restoration'){buildMeijiRestoration(g,c,m,rng);return;}
    if(['world-population-1-billion','world-population-4-billion','world-population-8-billion','human-lifespan'].includes(id)){
      const n=id==='world-population-8-billion'?42:id==='world-population-4-billion'?26:id==='world-population-1-billion'?14:8;
      for(let i=0;i<n;i++){const x=-2.5+rng()*5,z=-1.2+rng()*2.4,h=.25+rng()*.15;g.add(ball(.1,solid(i%2?'#9a8b75':'#b5a68d'),x,-1.55+h,z));g.add(block(.12,h,.1,solid(i%2?'#7d6f5c':'#8e7f69'),x,-1.85+h/2,z));}
      if(id==='human-lifespan')for(let i=0;i<3;i++){const x=-1.6+i*1.6,h=.6+i*.35;g.add(ball(.14,solid('#a89477'),x,-1.85+h,z));g.add(block(.16,h,.12,solid('#84725c'),x,-1.85+h/2,z));}
      return;
    }
    if(id==='industrial-era-duration'||id==='meiji-restoration'){
      factory(g,0,-.2);if(id==='meiji-restoration'){g.add(rod(V(1.4,-1.9,.7),V(1.4,-.3,.7),.03,solid('#5d6b70')));g.add(block(.18,.18,.55,solid('#46545a'),1.5,-.2,.7),block(.7,.08,.5,solid('#3d494f'),.9,-.45,.7));}
    } else {
      cityWall(g,0,0,4.8,2.5);
      for(let i=0;i<6;i++)house(g,-1.8+i*.72,-.4);
      temple(g,0,-.1,.8);
      if(id==='origin-of-cities'){const zig=block(1.7,.7,1.1,stone,0,-.5,1.0);zig.rotation.x=.2;g.add(zig);for(let i=0;i<3;i++)g.add(block(1.5-i*.35,.3,.85,stone,0,-.3+i*.3,1.0));}
      if(id==='industrial-era-duration'||id==='meiji-restoration')factory(g,1.2,-.2);
    }
    return;
  }
  if(['agricultural-revolution','green-revolution','origin-of-writing','invention-of-writing'].includes(id)){
    if(id==='invention-of-writing'||id==='origin-of-writing'){buildInventionOfWriting(g,c,m,rng);return;}
    if(id==='agricultural-revolution'){
      buildHolocene(g,c,m,rng);
      const soil=solid('#79583d',{roughness:1}), crop=solid('#c5b168',{roughness:.9}), green=solid('#617d47',{roughness:.95});
      for(let r=0;r<4;r++){
        const z=-.62+r*.30;
        g.add(block(1.42,.035,.24,soil,1.42,-1.80,z));
        for(let i=0;i<9;i++)g.add(rod(V(.78+i*.15,-1.78,z),V(.78+i*.15,-1.50+(i%3)*.05,z),.011,crop));
      }
      g.add(block(.36,.035,.18,green,2.06,-1.77,-.88));
      // Scarecrow, grain sheaves and two farmers at the field edge.
      g.add(rod(V(2.25,-1.82,.55),V(2.25,-1.10,.55),.020,solid('#6d5238')));
      g.add(block(.46,.055,.04,solid('#8f7450'),2.25,-1.38,.55),block(.34,.30,.06,solid('#b99b64'),2.25,-1.50,.55));
      g.add(ball(.10,solid('#c7a97a'),2.25,-1.06,.55));
      for(const [x,z] of [[1.72,-.96],[.26,.72]])figure(g,x,z,'#9b8668','#b98a63',.78,'#4a3e30',-1.87);
      for(let i=0;i<5;i++){const a=i*1.2;g.add(cyl(.07,.30,crop,2.28+Math.cos(a)*.10,-1.66,-.15+Math.sin(a)*.10,.09));}
      return;
    }
    for(let i=0;i<9;i++){const x=-2.3+i*.55;g.add(block(.4,.08,2.4,i%2?solid('#8f9a56'):solid('#7f8c4c'),x,-1.55,0));for(let j=0;j<7;j++)g.add(rod(V(x+(rng()-.5)*.15,-1.5,-1+j*.3),V(x, -1.1+rng()*.12,-1+j*.3),.012,solid('#c3b06b')));}
    if(id==='green-revolution'){g.add(block(.9,.35,.5,solid('#7a6b55'),1.2,-1.4,.8),block(.5,.35,.5,solid('#6b5c48'),1.2,-1.1,.8),block(.55,.08,.55,solid('#4d3f31'),1.2,-.9,.8));for(const s of [-1,1]){const w=object(new THREE.TorusGeometry(.16,.04,5,16),solid('#3f342a'),1.2+s*.25,-1.45,.8);w.rotation.y=Math.PI/2;g.add(w);} }
    return;
  }
  if(['bronze-age','iron-age','origin-of-money','wheel'].includes(id)){
    if(id==='wheel'){cart(g,0,-.4,1.1);g.add(block(.55,.12,.55,solid('#736048'),-1.5,-1.62,.7),block(.5,.12,.5,solid('#7f6a50'),-1.5,-1.5,.7));return;}
    if(id==='origin-of-money'){
      for(let i=0;i<7;i++){const a=i*TAU/7,r=.55+(i%3)*.15;const coin=object(new THREE.CylinderGeometry(.18,.18,.03,22),solid('#d3b46b',{metalness:.8,roughness:.3}),Math.cos(a)*r,-1.55+(i%2)*.12,Math.sin(a)*r*.6);coin.rotation.x=Math.PI/2;g.add(coin);}
      g.add(block(.12,.9,.12,solid('#8b7355'),0,-1.2,0),block(1.5,.06,.12,solid('#8b7355'),0,-.65,0));
      for(const s of [-1,1]){const pan=object(new THREE.CylinderGeometry(.26,.26,.05,18),solid('#b39a6e'),s*.7,-.42,0);g.add(pan);g.add(rod(V(s*.7,-.7,0),V(0,-.65,0),.012,solid('#8b7355')));}
      return;
    }
    const furnace=cyl(.45,.9,solid('#7b5a43'),-1.2,-1.3,0,.55);g.add(furnace);
    for(let i=0;i<5;i++)g.add(block(.3,.12,.2,solid(id==='iron-age'?'#7b8082':'#b98f52',{metalness:.7}),.3+i*.38,-1.65,(i%2)*.3));
    if(id==='iron-age'){g.add(block(.8,.12,.45,solid('#6f7778'),1.5,-1.2,0),block(.06,.65,.2,solid('#9aa2a2'),1.5,-.8,0));}
    else {g.add(block(.7,.18,.4,solid('#b98f52',{metalness:.7}),1.4,-1.3,0),block(.45,.08,.3,solid('#d3b46b'),1.5,-.9,0));}
    return;
  }
  if(id==='egyptian-pyramids'){
    const sand=solid('#b89663',{roughness:1}),sandDark=solid('#96754c',{roughness:1});
    const limestone=solid('#cdb382',{roughness:.92}),limestoneLight=solid('#e7d1a4',{roughness:.88}),limestoneDark=solid('#ad9063',{roughness:.96});
    const gold=solid('#d9b765',{metalness:.55,roughness:.34});
    g.add(block(5.7,.20,3.85,sand,0,-1.97,0),block(6.0,.07,4.15,sandDark,0,-2.09,0));
    const sun=new THREE.PointLight('#ffd39a',1.7,9,1.4);sun.position.set(-3,4,3);g.add(sun);
    // Giza group at their relative heights, with a visible course every layer.
    const specs=[[-1.46,1.78,1.62,0],[.14,1.46,1.32,0],[1.76,.84,.78,0]];
    for(const [x,w,h,z] of specs){
      const n=24,step=h/n;
      const shadow=new THREE.Mesh(new THREE.PlaneGeometry(w*1.3,w*1.3),solid('#6f573a',{transparent:true,opacity:.22,depthWrite:false}));
      shadow.rotation.set(-Math.PI/2,0,Math.PI/4);shadow.position.set(x+.20,-1.88+.01,z+.25);g.add(shadow);
      for(let j=0;j<n;j++){
        const rb=w*(1-j/n),rt=w*(1-(j+1)/n);
        const layer=object(new THREE.CylinderGeometry(Math.max(rt,.015),rb,step+.004,4),j%3===0?limestoneDark:j%2?limestone:limestoneLight,x,-1.88+step*(j+.5),z);
        layer.rotation.y=Math.PI/4;g.add(layer);
        // Four corner seams and one face joint per course: the masonry reads as
        // stacked blocks instead of a smooth stepped cone.
        for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){
          const seam=block(rb*1.72,.006,.008,sandDark,x+dx*rb*.63,-1.88+step*j,z+dz*rb*.63);
          seam.rotation.y=Math.atan2(dx,dz);g.add(seam);
        }
        if(j%2===0){const weath=block(rb*.47,step*.16,.012,limestoneLight,x-rb*.52,-1.86+step*(j+.5),z+rb*.58);weath.rotation.x=.12;g.add(weath);}
      }
      const cap=object(new THREE.ConeGeometry(w*(1-23/24)*1.35,step*1.7,4),x<0?gold:limestoneLight,x,-1.88+h+step*.7,z);cap.rotation.y=Math.PI/4;g.add(cap);
      // Rubble at the base and an exposed casing edge.
      for(let k=0;k<9;k++){const a=k/9*TAU;const rb=ball(.06+(k%3)*.02,limestoneDark,x+Math.cos(a)*w*.92,-1.78,z+Math.sin(a)*w*.92);rb.scale.set(1.4,.45,.8);g.add(rb);}
    }
    // Valley temple, causeway with paving, obelisk and a larger sphinx.
    g.add(block(.92,.34,.62,limestone,-2.20,-1.68,1.38),block(.74,.18,.48,limestoneDark,-2.20,-1.46,1.38),block(.12,1.1,.12,limestoneLight,-2.62,-1.2,1.42));
    for(let i=0;i<10;i++){g.add(block(.30,.045,.46,i%2?limestoneDark:limestone,-1.95+i*.31,-1.83,1.06));}
    const sphinx=new THREE.Group();sphinx.position.set(-1.72,-1.74,1.60);sphinx.rotation.y=-.18;g.add(sphinx);
    const body=ball(.30,limestone,0,0,0);body.scale.set(2.15,.62,.66);sphinx.add(body);
    for(const s of [-1,1]){const paw=ball(.115,limestoneLight,s*.34,-.17,.22);paw.scale.set(1.85,.48,.65);sphinx.add(paw);}
    const head=ball(.19,limestoneLight,.38,.22,.02);head.scale.set(.92,1.05,.75);sphinx.add(head);
    const nemes=object(new THREE.ConeGeometry(.25,.42,4),limestoneDark,.38,.17,.02);nemes.rotation.y=Math.PI/4;sphinx.add(nemes);
    for(const s of [-1,1]){sphinx.add(ball(.034,solid('#2e2820'),.43,.25,s*.055),block(.10,.03,.06,limestoneLight,.46,.18,s*.055));}
    // Palm grove, work camp and small human figures for scale.
    for(let i=0;i<6;i++){
      const x=-2.45+i*.95,z=1.52+(i%2)*.12,h=.55+(i%3)*.2;
      g.add(cyl(.035,h,solid('#6f593d'),x,-1.85+h/2,z,.07));
      for(let k=0;k<7;k++){const a=k/7*TAU;const leaf=ball(.16,solid(k%2?'#55704a':'#486243'),x+Math.cos(a)*.25,-1.30+h,z+Math.sin(a)*.25);leaf.scale.set(1.8,.16,.38);leaf.rotation.y=a;leaf.rotation.z=.25;g.add(leaf);}
    }
    for(const [x,z] of [[-2.55,1.10],[-2.30,.94],[-2.05,.80],[-.55,.70],[.30,.55],[1.10,.35],[1.70,.20]])figure(g,x,z,'#c1a378','#c59a73',.32,'#5b4632');
    for(let i=0;i<5;i++){const a=i/5*TAU,r=.25+(i%2)*.12;g.add(block(.14,.09,.10,solid('#d8c49e'),-2.10+Math.cos(a)*r,-1.85,1.42+Math.sin(a)*r));}
    return;
  }
  if(id==='classical-antiquity'){
    temple(g,0,-.1,1.1);for(let i=0;i<5;i++)g.add(ball(.12,stone,-2+i*.55,-1.65,.7));return;
  }
  if(id==='middle-ages'){
    const keep=block(1.4,1.7,1.2,stone,0,-.8,0);g.add(keep);
    for(let i=0;i<6;i++){const a=i*TAU/6;g.add(block(.36,.55,.36,stone,Math.cos(a)*.9,-1.3,Math.sin(a)*.75));g.add(block(.46,.2,.46,stone,Math.cos(a)*.9,-1.0,Math.sin(a)*.75));}
    g.add(block(.45,1.9,.45,stone,-1.5,-.9,.4),block(.55,.18,.55,stone,-1.5,.1,.4));
    for(let i=0;i<4;i++)house(g,1.1+i*.45,-1.1,.4,.4);
    return;
  }
  if(id==='renaissance'){
    const dome=object(new THREE.SphereGeometry(.75,24,16,0,TAU,0,Math.PI/2),solid('#c9b69a'),0,-.6,0);g.add(dome,cyl(.18,.3,solid('#b19d82'),0,.2,0));
    g.add(block(1.4,.9,1.4,stone,0,-1.35,0),block(.08,.9,.3,solid('#8b7355'),1.1,-1.2,.5),block(.7,.55,.06,solid('#d7c6a8'),1.1,-1.0,.5));
    return;
  }
  if(['zheng-he-voyages','age-of-discovery','columbus-voyage','magellan-circumnavigation'].includes(id)){
    if(id==='magellan-circumnavigation'){
      const globe=ball(1.05,solid('#405f6e',{roughness:.6}),0,.15,0);g.add(globe);
      for(let i=0;i<10;i++){const a=i*.63,q=V(Math.cos(a)*1.08,Math.sin(i*.6)*.7+.15,Math.sin(a)*1.08);g.add(ball(.05,lit(c.color),q.x,q.y,q.z));if(i)globe.add(path([[Math.cos(a-.63)*1.08,Math.sin((i-1)*.6)*.7+.15,Math.sin(a-.63)*1.08],[q.x,q.y,q.z]],.008,lit(c.color)));}
      g.add(block(.8,.5,.05,solid('#d7c7a5'),1.8,-1.2,.5));
      return;
    }
    if(id==='age-of-discovery'){
      const water=solid('#2f6578',{emissive:'#1b4b59',emissiveIntensity:.30,transparent:true,opacity:.94,roughness:.18});
      const quay=solid('#9d8e75',{roughness:.95}), timber=solid('#6c4c33',{roughness:.78}), parchment=solid('#e0cfa9',{roughness:.9});
      g.add(block(5.5,.055,3.0,water,0,-1.80,0));
      for(let i=0;i<8;i++){const ripple=object(new THREE.TorusGeometry(.35+i*.29,.008,4,60),solid('#8ac3cd',{transparent:true,opacity:.30}),-.55+i*.12,-1.765,.18);ripple.rotation.x=Math.PI/2;g.add(ripple);}
      // Stone quay, timber landing and bollards.
      g.add(block(1.10,.16,2.9,quay,-2.32,-1.78,0),block(1.7,.08,.55,timber,-2.0,-1.70,.36));
      for(let i=0;i<5;i++)g.add(cyl(.045,.28,timber,-1.30+i*.0,-1.58,-.68+i*.32,.055));
      for(let i=0;i<8;i++)g.add(block(.20,.035,.62,timber,-1.36+i*.18,-1.67,.38));
      // Two carracks with square sails, plus harbor lighthouse and warehouses.
      galleon(g,-.55,.15,1.18,'#e7d9bb','#a14b3c');
      galleon(g,1.55,.78,.78,'#d8c9a8','#456b73');
      g.add(block(.72,.50,.58,quay,-2.16,.0,-.92),block(.66,.42,.54,quay,-2.16,.0,-.18));
      const tower=cyl(.23,.95,solid('#d6c8ae'),2.30,-1.24,-.28,.28);g.add(tower);
      for(let i=0;i<4;i++)g.add(cyl(.245,.10,solid('#a95543'),2.30,-1.68+i*.22,-.28,.25));
      g.add(cyl(.17,.12,solid('#3f4750'),2.30,-.73,-.28,.17),glow('#ffd486',.75,.52).translateX(2.30).translateY(-.68).translateZ(-.28));
      // Chart table with a route, compass rose and rolled charts.
      g.add(block(.92,.05,.60,timber,-1.55,-1.60,1.12),block(.86,.012,.54,parchment,-1.55,-1.565,1.12));
      for(let i=0;i<5;i++)g.add(block(.08,.008,.08,solid('#7a5c3a'),-1.82+i*.13,-1.55,1.08+i*.02));
      const compass=object(new THREE.TorusGeometry(.15,.012,8,30),solid('#b48b55',{metalness:.55}),-1.55,-1.54,1.12);compass.rotation.x=Math.PI/2;g.add(compass);
      for(let i=0;i<4;i++){const a=i*Math.PI/2;g.add(rod(V(-1.55,-1.53,1.12),V(-1.55+Math.cos(a)*.18,-1.53,1.12+Math.sin(a)*.18),.006,solid('#7a5c3a')));}
      g.add(cyl(.06,.28,solid('#d7c6a4'),-.80,-1.55,.90,.07));
      // Crates, barrels and a harbor master.
      for(const [x,z] of [[-2.62,1.12],[-2.28,1.32]])g.add(block(.30,.24,.30,timber,x,-1.56,z),block(.32,.02,.32,solid('#a7865d'),x,-1.43,z));
      for(const [x,z] of [[-2.52,-1.28],[-2.05,-.88]])g.add(cyl(.13,.30,solid('#7b5739'),x,-1.58,z,.15));
      figure(g,-1.82,.88,'#405260','#c7966e',.82,'#2e2b28');
      return;
    }
    const ships=id==='columbus-voyage'?3:id==='zheng-he-voyages'?1:1;
    for(let i=0;i<ships;i++)ship(g,-1.1+i*1.2,-.5+i*.15,.85,id==='zheng-he-voyages'?'#c86b52':'#e0d3b4');
    if(id==='zheng-he-voyages')ship(g,-.2,.6,1.15,'#c86b52');
    return;
  }
  if(id==='papermaking'){
    const water=solid('#517f86',{emissive:'#29565d',emissiveIntensity:.25,transparent:true,opacity:.9,roughness:.2});
    const pulp=solid('#d9cfb1',{roughness:.9}), paper=solid('#eee3c9',{roughness:.9}), bamboo=solid('#8d744c',{roughness:.85});
    // Soaking vat, pulp and a bamboo mould screen.
    g.add(cyl(.62,.56,solid('#6d533c'),-.98,-1.54,-.18,.66),cyl(.56,.035,water,-.98,-1.28,-.18,.60),cyl(.48,.035,pulp,-.98,-1.26,-.18,.52));
    const screen=new THREE.Group();screen.position.set(-.12,-1.16,.42);screen.rotation.y=.24;g.add(screen);
    screen.add(block(.86,.035,1.12,bamboo,0,0,0));
    for(let i=0;i<8;i++)screen.add(block(.80,.008,.012,solid('#b9a777'),0,.020,-.47+i*.13));
    for(let i=0;i<5;i++)screen.add(block(.012,.008,1.04,solid('#b9a777'),-.34+i*.17,.020,0));
    // Screw press, wet sheets and a drying rack with hanging paper.
    g.add(block(.86,.12,.66,solid('#5a4432'),1.15,-1.68,.56),block(.66,.06,.52,solid('#8f7350'),1.15,-1.57,.56));
    for(let i=0;i<8;i++)g.add(block(.58,.008,.46,paper,1.15,-1.50+i*.012,.56));
    g.add(rod(V(1.15,-1.53,.56),V(1.15,-.58,.56),.040,solid('#6d573f')),cyl(.18,.10,solid('#8f7350'),1.15,-.62,.56,.20));
    const rack=new THREE.Group();rack.position.set(2.08,-1.74,-.10);g.add(rack);
    for(const z of [-.75,.62])rack.add(rod(V(0,0,z),V(0,1.65,z),.025,bamboo));
    rack.add(block(.06,.05,1.45,bamboo,0,1.62,0));
    for(let i=0;i<4;i++){const sheet=block(.50,.65,.012,paper,-.24,1.18,-.50+i*.34);sheet.rotation.z=.03;rack.add(sheet);}
    g.add(cyl(.16,.20,solid('#6d533c'),1.55,-1.60,1.02,.18),block(.28,.03,.28,solid('#d8c8a8'),1.55,-1.44,1.02));
    figure(g,-1.92,.55,'#546d74','#b9825c',.82,'#3b322b');
    return;
  }
  if(id==='printing-press'){
    g.add(block(1.8,.3,1.3,solid('#6c5742'),0,-1.6,0));
    g.add(block(.3,1.3,.3,solid('#5a4735'),-1.0,-.8,0),block(.3,1.3,.3,solid('#5a4735'),1.0,-.8,0),block(2.1,.25,.25,solid('#6c5742'),0,0,0));
    g.add(block(.9,.2,.7,solid('#3e3327'),0,-1.3,0),block(.7,.08,.6,solid('#d9cdb5'),0,-1.1,0));
    g.add(rod(V(1.2,-1.2,0),V(1.5,-.2,0),.04,solid('#6c5742')));
    return;
  }
  if(id==='reformation'){
    g.add(block(3.0,2.2,.3,stone,0,-.8,0));
    const door=block(1.0,1.7,.05,solid('#6c4a30'),0,-1.0,.18);g.add(door);
    for(let i=0;i<6;i++)g.add(block(.65,.02,.03,solid('#d8c6a4'),0,-.4+i*.2,.22));
    g.add(block(.12,.18,.06,solid('#d8c6a4'),.1,-.1,.22));
    return;
  }
  if(id==='french-revolution'){
    for(let i=0;i<6;i++)g.add(block(.5,.6+rng()*.5,.4,solid('#6b6154'),-1.8+i*.7,-1.55,1.0));
    for(let i=0;i<3;i++)g.add(block(1.9,.12,.12,solid('#5a4b3c'),0,-1.25+i*.3,.9));
    g.add(rod(V(-1.4,-1.9,.2),V(-1.4,.7,.2),.03,solid('#6c5a45')));g.add(block(.8,.5,.02,solid('#b25f52'),-1.0,.45,.2));
    return;
  }
  if(id==='lewis-clark-expedition'){
    g.add(rod(V(-1.8,-1.9,0),V(-1.8,.3,0),.05,solid('#6d543a')));
    for(let i=0;i<3;i++)g.add(block(.1,.5,.1,solid('#6d543a'),-1.8,-.9+i*.4,0));
    const canoe=object(new THREE.ConeGeometry(.45,.35,4),solid('#7c5d40'),-2.0,-1.65,.7);canoe.rotation.z=Math.PI/2;g.add(canoe);
    g.add(block(.8,.05,.35,solid('#5e4834'),-2.0,-1.6,.7));
    const tent=object(new THREE.ConeGeometry(.55,.8,4),solid('#c6b28c'),.8,-1.35,.4);tent.rotation.y=Math.PI/4;g.add(tent);
    for(let i=0;i<3;i++)g.add(rod(V(1.4,-1.9,-.6+i*.5),V(1.4,-.4,-.6+i*.5),.03,solid('#6d543a')));
    return;
  }
  if(id==='human-lifespan'){}
  // Generic village fallback with varied roofs and a workshop.
  for(let i=0;i<7;i++)house(g,-2+i*.65,-.5+rng()*.7,.5+rng()*.15,.5+rng()*.25);
  g.add(block(.9,.6,.7,wood,1.8,-1.5,.6),object(new THREE.ConeGeometry(.65,.45,4),roof,1.8,-1.0,.6).rotateY(Math.PI/4));
  m.push((d,t)=>{g.rotation.y=Math.sin(t*.1)*.02;});
}
function scientificInstrument(g,c,m){
 pedestal(g,5.5,3.5);if(c.profile==='steam'){
  const iron=solid('#45545c',{metalness:.55,roughness:.4}),copper=solid('#a66f45',{metalness:.7,roughness:.3}),brass=solid('#c49a58',{metalness:.82,roughness:.26}),fire=solid('#ff8a3d',{emissive:'#ff5a1e',emissiveIntensity:.7});
  g.add(block(4.6,.16,2.5,ink(),0,-2.10),block(4.2,.07,2.2,metal(),0,-1.99));
  // Vertical boiler with dome, chimney and visible firebox.
  g.add(cyl(.72,2.2,copper,-1.25,-.55,0),ball(.58,copper,-1.25,.67,0),cyl(.20,1.5,iron,-1.25,1.95,0),cyl(.27,.10,brass,-1.25,2.66,0));
  g.add(block(.86,.62,.84,iron,-1.25,-1.68,.12),block(.50,.12,.52,fire,-1.25,-1.72,.52),block(.72,.04,.72,iron,-1.25,-1.98,.12));
  for(let i=0;i<10;i++){const a=i*TAU/10;g.add(ball(.035,brass,-1.25+Math.cos(a)*.70,-1.1+(i%2)*.8,Math.sin(a)*.70));}
  // Cylinder, piston rod and crank driving a large flywheel.
  const cylinder=cyl(.28,1.10,iron,.34,-.28,.72);cylinder.rotation.z=Math.PI/2;g.add(cylinder);
  g.add(cyl(.34,.08,brass,.90,-.28,.72),rod(V(.90,-.28,.72),V(1.60,.18,.72),.040,metal()));
  const wheel=new THREE.Group();wheel.position.set(1.72,-.72,.80);g.add(wheel);
  wheel.add(ring(1.02,.075,iron),ring(1.08,.018,brass));
  for(let k=0;k<8;k++){const a=k*TAU/8;wheel.add(rod(V(),V(Math.cos(a)*.98,Math.sin(a)*.98,0),.035,iron));wheel.add(ball(.045,brass,Math.cos(a)*1.0,Math.sin(a)*1.0,0));}
  const crank=rod(V(),V(.62,.62,0),.045,metal());wheel.add(crank);
  // Steam pipes and a pressure gauge complete the engine silhouette.
  g.add(rod(V(-1.25,.85,.62),V(-1.25,.85,1.05),.065,iron),rod(V(-1.25,.85,1.05),V(.34,.65,1.05),.065,iron),rod(V(.34,.65,1.05),V(.34,-.28,1.05),.065,iron));
  const gauge=cyl(.17,.07,brass,-1.25,-.20,.78);gauge.rotation.x=Math.PI/2;g.add(gauge);g.add(ball(.035,fire,-1.25,-.20,.84));
  g.add(rod(V(-1.25,1.05,-.62),V(-.25,.45,-.62),.045,brass),rod(V(-.25,.45,-.62),V(-.25,.45,.65),.045,brass));
  m.push((d,t)=>{wheel.rotation.z=t*.55;});
}
 else {const stand=new THREE.Group();g.add(stand);stand.add(cyl(.1,2.5,warm(),0,-.9));for(let k=0;k<3;k++){const a=k*TAU/3;stand.add(rod(V(0,-.7,0),V(Math.cos(a)*1.6,-2,Math.sin(a)*1.6),.06,warm()));}const tube=cyl(.35,3.3,warm(),0,.8);tube.rotation.z=-.8;stand.add(tube);for(let i=0;i<4;i++){const q=ring(.35,.025,metal(),Math.sin(.8)*(-1.3+i*.85),.8+Math.cos(.8)*(-1.3+i*.85),0);q.rotation.z=-.8;q.rotation.x=Math.PI/2;stand.add(q);}stand.add(block(1.1,.07,.8,solid('#b9ac92'),1.6,-1,.5));m.push((d,t)=>stand.rotation.y=Math.sin(t*.12)*.035);}
}
function house(g,x,z,w=.6,h=.55,material=solid('#9b8a72'),roof=solid('#75604b')){
  g.add(block(w,h,w,material,x, -1.9+h/2, z));
  const r=object(new THREE.ConeGeometry(w*.78,w*.55,4),roof,x,-1.9+h+w*.2,z);r.rotation.y=Math.PI/4;g.add(r);
  g.add(block(w*.18,h*.45,.04,solid('#4f4638'),x,-1.9+h*.32,z+ w/2+.02));
}
function cart(g,x,z,scale=1){
  const c=new THREE.Group();c.position.set(x,-1.1,z);c.scale.setScalar(scale);g.add(c);
  c.add(block(1.2,.18,.7,solid('#6b5138'),0,.2,0),block(1.25,.3,.06,solid('#7c6144'),0,.34,.34));
  for(const s of [-1,1]){
    const wheel=object(new THREE.TorusGeometry(.3,.045,7,28),solid('#5a412c'),s*.62,.05,0);wheel.rotation.y=Math.PI/2;c.add(wheel);
    for(let i=0;i<6;i++){const a=i*TAU/6;c.add(rod(V(s*.62,.05,0),V(s*.62,Math.cos(a)*.3,Math.sin(a)*.3),.014,solid('#7c6043')));}
  }
}
function factory(g,x,z){
  g.add(block(1.8,.8,1.2,solid('#746b5f',{roughness:.8}),x,-1.5,z),block(1.85,.1,1.25,solid('#5b544a'),x,-1.06,z));
  for(let i=0;i<3;i++){const q=cyl(.12,.8,solid('#5b544a'),x-.6+i*.6,-.6,z-.35,.1);g.add(q,glow('#b9a48a',.5,.15).translateY(-.15).translateX(x-.6+i*.6));}
  g.add(block(1.5,.5,.9,solid('#8b8173'),x,-.85,z+.1));
  for(let i=0;i<4;i++)g.add(block(.08,.35,.06,solid('#e7c16d'),x-.45+i*.3,-.8,z+.56));
}
function cityWall(g,x,z,w=4.4,d=2.8){
  g.add(block(w,.9,.28,solid('#8d826d'),x,-1.45,z+d/2));
  g.add(block(w,.9,.28,solid('#8d826d'),x,-1.45,z-d/2));
  for(let i=0;i<8;i++)g.add(block(.28,1.1,.4,solid('#968a74'),x-w/2+.2+i*(w-.4)/7,-1.3,z+d/2));
  for(let i=0;i<5;i++)g.add(block(.28,1.1,.4,solid('#968a74'),x-w/2+.3+i*(w-.6)/4,-1.3,z-d/2));
}
function temple(g,x,z,scale=1){
  const t=new THREE.Group();t.position.set(x,-1.9,z);t.scale.setScalar(scale);g.add(t);
  for(let i=0;i<6;i++)for(const s of [-1,1])t.add(cyl(.08,1.2,solid('#d7cab0'),-.9+i*.36,.6,s*.42));
  t.add(block(2.3,.16,.95,solid('#d7cab0'),0,1.2,0),block(2.45,.12,1.0,solid('#c4b79e'),0,1.34,0));
  const ped=object(new THREE.ConeGeometry(1.5,.32,4),solid('#c4b79e'),0,1.6,0);ped.rotation.y=Math.PI/4;ped.scale.set(1,.6,.7);t.add(ped);
}
function ship(g,x,z,scale=1,sail='#e0d3b4'){
  const s=new THREE.Group();s.position.set(x,-1.05,z);s.scale.setScalar(scale);g.add(s);
  s.add(block(1.8,.22,.55,solid('#6d5038'),0,0,0));
  const hull=object(new THREE.ConeGeometry(.5,.7,4),solid('#7d5b3f'),1.15,.0,0);hull.rotation.z=-Math.PI/2;hull.scale.set(1,.6,.8);s.add(hull);
  s.add(cyl(.035,1.5,solid('#74573d'),-.1,.85,0));
  for(const x0 of [-.35,.15]){const sailMesh=block(.5,.75,.02,solid(sail),x0,.9,0);sailMesh.rotation.y=.1;s.add(sailMesh);}
  s.add(block(.9,.03,.03,solid('#74573d'),-.1,1.0,0));
}
function informationNetwork(g,c,m,rng,entry){
  const id=String(entry?.id||'').replace(/^time\./,'');
  if(['generation'].includes(id)){
    for(let gen=0;gen<3;gen++){const y=-1.6+gen*.7;for(let i=0;i<4-gen;i++){const x=-1.4+i*1.0;g.add(ball(.15,lit(gen===0?c.color:'#c9b28f'),x,y,0));if(gen<2)for(let j=0;j<2;j++)g.add(rod(V(x,y,0),V(-1.9+j*1.9,y+.45,0),.008,solid('#7a94a6',{transparent:true,opacity:.5})));}}
    return;
  }
  if(['genome','crispr','origin-of-language'].includes(id)){
    if(id==='origin-of-language'){
      for(let i=0;i<5;i++){const a=i*TAU/5;g.add(ball(.14,solid('#8fb3c9'),Math.cos(a)*1.1,-.2+Math.sin(i)*.3,Math.sin(a)*.8));g.add(path([[Math.cos(a)*.2,.1,0],[Math.cos(a)*.7,.4,0],[Math.cos(a)*1.3,.2,0]],.012,lit(c.color)));}
      return;
    }
    const dna=new THREE.Group();g.add(dna);
    for(let j=0;j<32;j++){const y=-2.4+j/31*4.8,a=j*.55;for(const s of [-1,1])dna.add(ball(.075,lit(s<0?c.color:'#ccac83'),s*Math.cos(a)*.5,y,s*Math.sin(a)*.5));if(j%2===0)dna.add(rod(V(-Math.cos(a)*.5,y,-Math.sin(a)*.5),V(Math.cos(a)*.5,y,Math.sin(a)*.5),.028,solid(j%4?c.color:'#ad8eb7')));}
    if(id==='crispr'){const jaw=block(1.5,.55,1.0,glass('#a3b7c9',.32),.9,.3,0);dna.add(jaw,path([[2.3,1.3,0],[1.5,.8,0],[.8,.35,0]],.05,solid('#d8ba83')));}
    m.push((d,t)=>dna.rotation.y=t*.06);
    return;
  }
  if(['telegraph','telephone','electricity-grid','origin-of-computing'].includes(id)){
    if(id==='telegraph'){
      g.add(block(2.4,.12,.8,solid('#6f5b45'),0,-1.85,0),block(.65,.22,.45,solid('#5a4c3d'),-.6,-1.65,0));
      g.add(cyl(.025,.28,solid('#c8a66b'),-.55,-1.5,0),object(new THREE.SphereGeometry(.07,10,8),solid('#c8a66b'),-.55,-1.34,0));
      for(let i=0;i<3;i++)g.add(rod(V(-1.8+i*.4,-1.65,.5),V(-1.8+i*.4,-.4,.5),.012,solid('#6c5a46')));
      g.add(cyl(.018,.32,solid('#c8a66b'),1.0,-1.5,0),ball(.06,lit(c.color),1.0,-1.32,0));
    } else if(id==='telephone'){
      g.add(block(1.1,.5,1.0,solid('#5a4c3d'),0,-1.55,0),object(new THREE.ConeGeometry(.55,.25,18),solid('#6e5b46'),0,-1.28,0));
      const dial=object(new THREE.CylinderGeometry(.34,.34,.05,24),solid('#c8b9a3'),0,-1.25,.45);dial.rotation.x=Math.PI/2;g.add(dial);
      for(let i=0;i<8;i++){const a=i*TAU/8;g.add(object(new THREE.CylinderGeometry(.05,.05,.02,10),solid('#3f382f'),Math.cos(a)*.22,-1.25+Math.sin(a)*.22,.47).rotateX(Math.PI/2));}
      g.add(block(.8,.14,.18,solid('#3f382f'),0,-1.02,.1));
    } else if(id==='electricity-grid'){
      for(let i=0;i<4;i++){const x=-2+i*1.3;g.add(rod(V(x,-1.9,-.5),V(x,-.2,-.5),.03,solid('#7f8b8c')));g.add(block(1.1,.04,.04,solid('#7f8b8c'),x,-.5,-.5));for(const s of [-1,1])g.add(rod(V(x,-1.85,s*.5),V(x,-.4,0),.018,solid('#7f8b8c')));}
      g.add(ball(.18,lit('#f0cf87'),1.2,-.4,.8),glow('#f0cf87',1.0,.25).translateX(1.2).translateY(-.4).translateZ(.8));
    } else {
      g.add(block(2.3,1.3,1.1,solid('#66747a'),0,-1.2,0));
      for(let i=0;i<7;i++)g.add(block(1.9,.035,.04,solid('#c9d7d9'),0,-1.7+i*.18,.56));
      for(let i=0;i<4;i++)g.add(block(.1,.1,.02,lit(c.color),-.7+i*.3,-.65,.56));
      g.add(block(1.0,.06,.7,solid('#4c585c'),0,-1.9,.7));
    }
    return;
  }
  if(['internet-era-duration','digital-age','internet-birth','ai-era','smartphone-era'].includes(id)){
    if(id==='smartphone-era'){
      const phone=block(1.1,.08,2.2,solid('#353f45'),0,-.2,0);phone.rotation.set(.1,.3,0);g.add(phone);
      const screen=block(1.0,.02,2.0,lit(c.color),0,-.14,0);screen.rotation.set(.1,.3,0);screen.material.emissiveIntensity=.35;g.add(screen);
      for(let i=0;i<4;i++)g.add(ball(.09,lit(c.color),1.6+Math.cos(i*1.4)*.5,.4+i*.2,.4+Math.sin(i*1.4)*.4));
      return;
    }
    if(id==='ai-era'){
      const layers=[3,5,5,3];
      layers.forEach((n,l)=>{for(let i=0;i<n;i++){const x=(i-(n-1)/2)*.4,y=-1.2+l*.7;g.add(ball(.1,lit(c.color),x,y,0));if(l<3){for(let j=0;j<layers[l+1];j++)g.add(rod(V(x,y,0),V((j-(layers[l+1]-1)/2)*.4,y+.7,0),.005,solid('#6f92a7',{transparent:true,opacity:.4})));}}});
      return;
    }
    const globe=new THREE.Group();g.add(globe);
    globe.add(ball(1.3,solid('#2d5064',{roughness:.7}),0,.1,0));
    for(let i=0;i<24;i++){const a=i*2.4,y=Math.sin(i*1.2)*.9,r=Math.sqrt(Math.max(0,1-y*y))*1.32;globe.add(ball(.035,lit(c.color),Math.cos(a)*r,y+.1,Math.sin(a)*r));}
    for(let i=0;i<16;i++){const a=i*2.1,b=i+1;g.add(path([[Math.cos(a)*1.3,Math.sin(i)*.3+.1,Math.sin(a)*1.3],[0,.1+Math.sin(i*.5)*.5,0],[Math.cos(b*2.1)*1.3,Math.sin(b)*.2+.1,Math.sin(b*2.1)*1.3]],.008,solid('#9dc3d4',{transparent:true,opacity:.3})));}
    m.push((d,t)=>globe.rotation.y=t*.03);
    return;
  }
  const nodes=[[-2,1,0],[2,1,-.5],[-2,-1.3,-.4],[2,-1.3,.4],[0,0,1]];
  nodes.forEach((p,i)=>{const computer=new THREE.Group();computer.position.set(...p);g.add(computer);computer.add(block(.9,.65,.55,metal()),block(.7,.4,.025,solid(c.color,{emissive:c.color,emissiveIntensity:.2}),0,.02,.29),block(1,.08,.65,ink(),0,-.45,.1));});
  for(let i=0;i<nodes.length;i++){const a=V(...nodes[i]),b=V(...nodes[(i+1)%nodes.length]);g.add(rod(a,b,.015,solid('#668b9f')));}
}
function spaceObservatory(g,c,m){
 if(c.profile==='interferometer'){pedestal(g,6,5);const center=V(-1.5,-1,0);for(const end of [V(2.8,-1,0),V(-1.5,-1,-3.2)]){g.add(rod(center,end,.09,metal()),rod(center.clone().add(V(0,.13,0)),end.clone().add(V(0,.13,0)),.012,lit(c.color)));g.add(block(.45,.6,.45,ink(),end.x,end.y,end.z));}g.add(block(.8,.6,.8,metal(),center.x,-1,0));for(let j=0;j<4;j++){const q=path(Array.from({length:35},(_,i)=>[-2.4+i*.16,.3+Math.sin(i*.55+j)*.18,-2+j]),.012,solid('#9fbccf'));g.add(q);m.push((d,t)=>q.position.y=Math.sin(t*.7+j)*.04);}}
 else {const telescope=new THREE.Group();telescope.rotation.set(-.3,.25,.1);g.add(telescope);const gold=solid('#c8ac68',{metalness:.75,roughness:.28});for(let row=-2;row<=2;row++)for(let col=-2;col<=2;col++){if(Math.max(Math.abs(row),Math.abs(col),Math.abs(row+col))>2||(!row&&!col))continue;const tile=object(new THREE.CylinderGeometry(.42,.42,.05,6),gold,col*.74+row*.37,row*.65,0);tile.rotation.x=Math.PI/2;telescope.add(tile);}for(const p of [[-1.5,-1,0],[1.5,-1,0],[0,1.6,0]])telescope.add(rod(V(...p),V(0,0,1.65),.025,metal()));telescope.add(cyl(.18,.25,ink(),0,0,1.65));for(let j=0;j<5;j++){const shield=block(4.4-j*.12,.025,2.3-j*.08,solid(j%2?'#b4b2c0':'#8d879c',{metalness:.65,roughness:.4}),0,-1.8-j*.12,-.7);shield.rotation.z=.08;g.add(shield);}m.push((d,t)=>telescope.rotation.y=.25+Math.sin(t*.09)*.035);}
}

function geologicSection(g,c,m,rng,entry){
  const id=String(entry?.id||'').replace(/^time\./,'');
  pedestal(g,5.8,3.6);
  const era=id;
  const hadean=['hadean','oldest-zircon','oldest-rock','magnetic-field-origin'].includes(era);
  const archean=['archean','eoarchean','mesoarchean','neoarchean','proterozoic','neoproterozoic','tonian','cryogenian','rodinia-assembly','rodinia-breakup'].includes(era);
  const paleo=['paleozoic','phanerozoic','mississippian','pennsylvanian','guadalupian','lopingian','mesozoic','early-triassic','late-jurassic','early-cretaceous','late-cretaceous','cenozoic','thanetian','messinian'].includes(era);
  const layers=hadean
    ?[['#2b2324',.34],['#4b3028',.4],['#7d472f',.42],['#a65b32',.38],['#c97b3f',.34],['#3b2c2a',.3]]
    :archean
      ?[['#243c44',.36],['#35585c',.4],['#4f736b',.38],['#6f8a76',.34],['#9b8b6b',.3],['#5a5142',.32]]
      :[['#4a3d35',.34],['#7d6a54',.38],['#9f8a68',.4],['#b7a37a',.36],['#8f9a76',.32],['#c8b58c',.3]];
  const shell=new THREE.Group(); shell.rotation.y=-.22; g.add(shell);
  let y=-1.9;
  for(let j=0;j<layers.length;j++){
    const [color,h]=layers[j];
    shell.add(block(5.5,h,2.3,solid(color,{roughness:1}),0,y+h/2,0));
    // wavy bedding plane: a thin lighter band at each contact, not a stack of identical steps.
    shell.add(block(5.52,.035,2.32,solid(j%2?'#d6c8a8':'#8e7b63',{roughness:1}),0,y+h+.012,0));
    for(let i=0;i<3;i++){
      const x=-2.2+rng()*4.4,z=-1.02+rng()*2.0;
      shell.add(ball(.02+rng()*.03,solid(j%2?'#6d5b48':'#e2d3b2'),x,y+h*.35,z));
    }
    y+=h;
  }
  const top=y;
  // Slice face: readable wavy strata and embedded clasts.
  for(let j=0;j<5;j++){
    const pts=[];for(let i=0;i<=50;i++){const x=-2.7+i*.108;pts.push(V(x,-1.55+j*.3+Math.sin(i*.5+j)*.05,1.16));}
    path(pts,.012,solid(j%2?'#8a745b':'#c9b590'));
  }
  if(hadean){
    shell.add(block(5.4,.1,2.2,solid('#241d1d',{roughness:1}),0,top+.04,0));
    for(let i=0;i<12;i++){
      const pts=[];for(let k=0;k<24;k++){const t=k/23;pts.push(V(-2+i*.35+Math.sin(t*4+i)*.12,top+.04,t*1.9-.95));}
      shell.add(path(pts,.018,lit('#e4763d')));
    }
    for(let i=0;i<6;i++)shell.add(ball(.2+rng()*.18,solid('#a85434',{emissive:'#79260e',emissiveIntensity:.4}),-2+i*.8,top+.18,-.6+rng()*1.2));
    const plume=dust(110,'#ff9a52',()=>[(rng()-.5)*5,top+.3+rng()*1.6,(rng()-.5)*2]);shell.add(plume);m.push((d,t)=>plume.rotation.y=t*.01);
  } else if(archean){
    shell.add(block(5.4,.12,2.2,glass('#2e7784',.3),0,top+.06,0));
    for(let i=0;i<8;i++){
      const x=-2.2+i*.62,z=-.45+(i%3)*.4,r=.22+rng()*.14;
      const dome=ball(r,solid(i%2?'#7fb47c':'#5f966b',{roughness:.8}),x,top+.1,z);dome.scale.y=.62;
      shell.add(dome,ring(r,.012,solid('#b7d4a8',{transparent:true,opacity:.7}),x,top+.12,z,V(Math.PI/2,0,0)));
      for(let k=0;k<3;k++){const l=ball(r*(.82-k*.18),solid(k%2?'#8fbd8b':'#74a477',{roughness:.9}),x,top+.11+k*.035,z);l.scale.y=.18;shell.add(l);}
    }
    shell.add(block(.5,.28,.4,solid('#4a5a46'),-1.9,top+.18,.6),block(.32,.42,.3,solid('#5b6952'),1.9,top+.25,-.3));
    if(['cryogenian','neoproterozoic'].includes(era)){
      for(let i=0;i<5;i++)shell.add(block(1.0,.04,.9,solid('#cfe7ec',{roughness:.4}),-1.8+i*.9,top+.13,-.55));
    }
    if(['rodinia-assembly','rodinia-breakup'].includes(era)){
      for(let i=0;i<5;i++){
        const a=i/5*TAU,r=.6+rng()*.4;
        shell.add(object(new THREE.DodecahedronGeometry(.35,0),solid('#77755e',{roughness:1}),Math.cos(a)*r,top+.18,Math.sin(a)*r*.6));
      }
    }
  } else {
    shell.add(block(5.4,.16,2.2,solid(paleo?'#5f7550':'#6d744f',{roughness:1}),0,top+.06,0));
    if(['mississippian','pennsylvanian','guadalupian','lopingian','early-triassic','late-jurassic','early-cretaceous'].includes(era)){
      for(let i=0;i<3;i++)shell.add(block(4.4,.06,.5,solid('#241f1b',{roughness:.7}),0,top-.5-i*.24,-.6+i*.4));
      for(let i=0;i<4;i++){const x=-1.8+i*1.1;shell.add(rod(V(x,top+.02,-.5),V(x+.05,top+.75,-.5),.035,solid('#6b5138')));for(let j=0;j<5;j++){const q=ball(.18,solid('#527a4f'),x+(rng()-.5)*.4,top+.66+(rng()-.3)*.5,-.5+(rng()-.5)*.3);q.scale.set(1.2,.5,1);shell.add(q);} }
    } else {
      for(let i=0;i<6;i++){const x=-2+i*.74;shell.add(rod(V(x,top+.02,-.6+rng()*.8),V(x+.08,top+.55,-.6+rng()*.8),.025,solid('#727d4f')));const q=ball(.24,solid('#7a8d59'),x,top+.38,-.3);q.scale.y=.6;shell.add(q);}
    }
    if(['mesozoic','early-cretaceous','late-cretaceous','late-jurassic'].includes(era)){
      const bone=solid('#dfd0ae',{roughness:.8});
      shell.add(ball(.16,bone,-.3,top+.14,-.2),ball(.14,bone,.2,top+.13,.3));
      for(let i=0;i<5;i++)shell.add(rod(V(-.3+i*.12,top+.12,-.2),V(-.35+i*.12,top+.2,.3),.035,bone));
      shell.add(object(new THREE.ConeGeometry(.13,.4,7),solid('#e6d8bb'),.8,top+.24,.2));
    }
    if(['cenozoic','thanetian','messinian'].includes(era)){
      const n=solid('#e0d7bf',{roughness:.7});
      for(let i=0;i<4;i++){const x=-1.6+i*1.0;shell.add(object(new THREE.ConeGeometry(.18,.42,5),n,x,top+.2,.1));}
      if(era==='messinian')for(let i=0;i<8;i++){const q=object(new THREE.OctahedronGeometry(.13),glass('#bfe0eb',.7),-1.6+rng()*3.2,top+.1,-.4+rng()*.9);shell.add(q);}
    }
  }
  // A clean vertical scale and epoch marker, no generic white spires.
  g.add(line([[-2.7,-1.9,1.18],[-2.7,top+.4,1.18]],'#e3cf9d',.45));
  for(let j=0;j<4;j++)g.add(line([[-2.7, -1.6+j*.6,1.18],[-2.5,-1.6+j*.6,1.18]],'#e3cf9d',.4));
  m.push((d,t)=>{shell.rotation.y=-.22+Math.sin(t*.06)*.008;});
}
function chronometer(g,c,m){
  pedestal(g,4.6,3.2);
  if(c.variant==='hourglass'){
    const steel=metal();
    g.add(cyl(.9,.05,steel,0,1.9),cyl(.9,.05,steel,0,-1.9));
    for(const s of [-1,1])g.add(rod(V(s*.85,-1.9,0),V(s*.85,1.9,0),.035,steel));
    g.add(object(new THREE.ConeGeometry(.62,1.5,32,1,true),glass(c.color,.22),0,1.05,0),object(new THREE.ConeGeometry(.62,1.5,32,1,true),glass(c.color,.22),0,-1.05,0).rotateX(Math.PI));
    const sand=dust(70,c.color,()=>[(Math.random()-.5)*.05,-.8+(Math.random())*1.6,(Math.random()-.5)*.05]);g.add(sand);
    m.push((d,t)=>{sand.rotation.y=t*.05;});
  } else if(c.variant==='calendar'){
    g.add(block(4.4,2.9,.2,solid('#26415a'),0,.1,-.6));
    for(let row=0;row<3;row++)for(let col=0;col<5;col++){const on=(row*5+col)%7===0;g.add(block(.62,.5,.05,solid(on?c.color:'#a9c3d2',{emissive:on?c.color:'#26415a',emissiveIntensity:.2}),-1.44+col*.72,.95-row*.8,-.46));}
    const sun=ball(.14,lit('#e5c483'),2.3,1.7,-.4);g.add(sun);
    g.add(path([[2.3,-1.2,-.4],[1.6,1.9,-.4],[.2,2.2,-.4]],.012,glass('#e5c483',.5)));
    m.push((d,t)=>{sun.position.x=2.3-Math.sin(t*.25)*.5;});
  } else {
    g.add(cyl(2.1,.16,metal(),0,0,0));
    g.add(cyl(1.85,.05,solid('#e2e9e6'),0,.1,0));
    for(let i=0;i<12;i++){const a=i/12*TAU;g.add(rod(V(Math.cos(a)*1.55,.14,Math.sin(a)*1.55),V(Math.cos(a)*1.82,.14,Math.sin(a)*1.82),.026,ink()));}
    const pivot=new THREE.Group();pivot.position.set(0,.17,0);g.add(pivot);
    pivot.add(rod(V(),V(.9,0,-.35),.035,ink()),rod(V(),V(-.35,0,.62),.05,ink()));
    g.add(rod(V(-1.9,-1.5,0),V(-1.9,1.4,0),.06,metal()),ball(.18,metal(),-1.9,1.55));
    m.push((d,t)=>{pivot.rotation.y=-t*.15;});
  }
}
function lineageTree(g,c,m,rng=Math.random){
  pedestal(g,6.2,3.9);
  const trunkMat=solid('#755d43',{roughness:.92}), rootMat=solid('#5e4a36',{roughness:.96});
  const leafMat=lit(c.color), tipMat=lit(new THREE.Color(c.color).offsetHSL(.02,.08,.12));
  const branchMats=[solid('#8b7353'),solid('#7b8462'),solid('#66856c')];
  // Root flare and a radial root web, so the tree grows out of the ground.
  g.add(object(new THREE.CylinderGeometry(.13,.38,.7,10),trunkMat,0,-1.86,0));
  for(let i=0;i<12;i++){
    const a=i/12*TAU,r=.9+rng()*.55;
    g.add(path([[Math.cos(a)*.12,-2.05,Math.sin(a)*.12],[Math.cos(a)*r*.55,-1.98,Math.sin(a)*r*.55],[Math.cos(a)*r,-1.9,Math.sin(a)*r]],.045,rootMat));
  }
  g.add(path([[0,-2.02,0],[.02,-1.35,.02],[-.04,-.72,0]],.11,trunkMat));
  const tips=[];
  function turn(d,ang,zj=0){const co=Math.cos(ang),si=Math.sin(ang);return V(d.x*co-d.y*si,d.x*si+d.y*co,zj).normalize();}
  function sub(a,dir,len,rad,depth){
    const perp=V(-dir.y,dir.x,0), mid=a.clone().add(dir.clone().multiplyScalar(len*.52)).add(perp.clone().multiplyScalar((rng()-.5)*.08));
    const end=a.clone().add(dir.clone().multiplyScalar(len));
    g.add(path([a.toArray(),mid.toArray(),end.toArray()],rad,branchMats[Math.min(depth,2)]));
    if(depth===0){
      for(let k=0;k<3;k++){
        const p=end.clone().add(V((rng()-.5)*.24,(rng()-.5)*.22,(rng()-.5)*.24));
        const leaf=ball(.085+rng()*.055,k===1?tipMat:leafMat,p.x,p.y,p.z);g.add(leaf);tips.push(leaf);
      }
      return;
    }
    for(const s of [-1,1]){
      const ang=s*(.28+rng()*.2), zj=(rng()-.5)*.22;
      sub(end.clone(),turn(dir,ang,zj),len*(.66+rng()*.08),rad*.62,depth-1);
    }
  }
  const count=c.variant==='radiation'?5:3;
  for(let i=0;i<count;i++){
    const a=count===1?1.5:2.18-i*(1.28/(count-1));
    sub(V(0,-.68,0),V(Math.cos(a),Math.sin(a),(rng()-.5)*.18).normalize(),1.45+rng()*.35,.08,3);
  }
  // A few low twigs carry the eye from the trunk into the crown.
  for(let i=0;i<3;i++){
    const a=1.15+i*.55;
    g.add(path([[0,-.72,0],[Math.cos(a)*.55,-.18,.12],[Math.cos(a)*1.0,.18,.2]],.033,branchMats[1]));
  }
  m.push((d,t)=>{for(let i=0;i<tips.length;i++)tips[i].scale.setScalar(1+Math.sin(t*.45+i*.7)*.055);});
}
function futureArc(g,c,m){
  pedestal(g,6,3.6);
  for(let i=0;i<26;i++){
    const t=i/25,x=-2.6+t*5.2,y=1.9-t*3.6,tint=new THREE.Color(c.color).lerp(new THREE.Color('#151d2b'),t);
    g.add(ball(.16*(1-t*.85),lit(tint),x,y,-.2+Math.sin(i*1.7)*.25));
  }
  g.add(path([[-2.6,1.9,-.2],[0,.4,-.1],[2.6,-1.7,0]],.012,glass(c.color,.35)));
  const cone=object(new THREE.ConeGeometry(1.5,3.4,24,1,true),glass(c.color,.07),2.2,-.7,.5);cone.rotation.z=-.6;g.add(cone);
  m.push((d,t)=>{cone.rotation.y=t*.06;});
}
function impactRecord(g,c,m){
  pedestal(g,6,3.8);
  for(let j=0;j<3;j++)g.add(block(5.8,.36,3.4,solid(['#46565a','#7a6b58','#a08a6d'][j]),0,-1.8+j*.36));
  g.add(object(new THREE.CylinderGeometry(.55,1.05,.42,24,1,true),solid('#4e4a43',{roughness:1,side:THREE.DoubleSide}),0,.25,0));
  for(let i=0;i<9;i++){const a=i/9*TAU;g.add(path([[0,.4,0],[Math.cos(a)*1.4,.7,Math.sin(a)*1.4],[Math.cos(a)*2.5,.55,Math.sin(a)*2.5]],.05,solid('#8b7a63')));}
  const dustCloud=dust(90,c.color,()=>[(Math.random()-.5)*4.4,.9+(Math.random()-.5)*1.4,(Math.random()-.5)*3]);g.add(dustCloud);
  g.add(block(5.9,.045,3.45,solid(c.color,{transparent:true,opacity:.65}),0,-.72));
  m.push((d,t)=>{dustCloud.rotation.y=t*.05;});
}

const templates={'quantum-field':quantumField,'particle-reaction':particleReaction,'nuclear-network':nuclearNetwork,'radiation-front':radiationFront,'cosmic-web':cosmicWeb,'galaxy-assembly':galaxyAssembly,'accretion-engine':accretionEngine,'stellar-cycle':stellarCycle,'planet-foundry':planetFoundry,'ocean-section':oceanSection,'atmosphere-section':atmosphereSection,'ice-landscape':iceLandscape,'catastrophe-section':catastropheSection,'fossil-study':fossilStudy,'microbial-study':microbialStudy,'forest-canopy':forestCanopy,'settlement-workshop':settlementWorkshop,'scientific-instrument':scientificInstrument,'information-network':informationNetwork,'space-observatory':spaceObservatory,'geologic-section':geologicSection,chronometer,'lineage-tree':lineageTree,'future-arc':futureArc,'impact-record':impactRecord};
export function createChronicleObject(entry,invalidate=()=>{},visual=entry.visual){
 const config=visual?{...visual,color:visual.color||'#8fb3c9'}:visual;
 if(!entry?.quantity||!Number.isFinite(entry.quantity.value)||entry.quantity.value===null||entry.chronology?.plot===false)throw new Error('A chronicle object requires a finite, plottable time reference.');
 if(!config||!templates[config.template])throw new Error(`Unknown chronicle template: ${config?.template}`);
 const group=new THREE.Group(),model=new THREE.Group(),motions=[];group.name=`chronicle:${entry.id}`;model.name=config.template;group.add(model);templates[config.template](model,config,motions,seeded(entry.id),entry);
 const bounds=new THREE.Box3().setFromObject(model),size=bounds.getSize(V()),center=bounds.getCenter(V());const norm=['fossil-study','settlement-workshop'].includes(config.template)?10.6:7.5;const scale=norm/Math.max(size.x,size.y,size.z,1);model.scale.setScalar(scale);model.position.copy(center).multiplyScalar(-scale);
 const title=dataLabel(entry.title,'#c4dce9',6.4);title.userData.hudLabel=true;title.position.set(0,-4.02,.5);group.add(title);const text=String(entry.displayValue||'').split('（')[0].trim(),readout=dataLabel(text.length>40?text.slice(0,39)+'…':text,'#8eb5ca',6.1);readout.userData.hudLabel=true;readout.position.set(0,-4.65,.5);group.add(readout);
 group.userData={entryId:entry.id,template:config.template,caption:config.caption,note:config.note,referenceIllustration:true};invalidate();return{group,update(delta,time){const d=Number.isFinite(delta)?Math.min(Math.max(delta,0),.1):0,t=Number.isFinite(time)?time:0;for(const fn of motions)fn(d,t);}};
}
