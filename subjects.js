import * as THREE from 'three';
import {createChronicleObject} from './object-templates.js';
import {pointTexture} from '/engine/renderer/effects.js';
import {solid,object,rod,label,glow,line,orbit,surfaceTexture} from '/engine/renderer/subjects.js';
import {createSun,createEarth,createPlanet,createSaturnRing} from '/engine/renderer/astro.js';
const sphere=(r,material,x=0,y=0,z=0)=>object(new THREE.SphereGeometry(r,72,52),material,x,y,z);
let seed=39;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
function points(count,distribution,color,size=3){const data=[];for(let i=0;i<count;i++)data.push(...distribution(i));const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(data,3));return new THREE.Points(geo,new THREE.PointsMaterial({map:pointTexture(),color,size,transparent:true,opacity:.8,depthWrite:false,blending:THREE.AdditiveBlending}));}
function primordial(){const group=new THREE.Group();const cloud=points(2500,()=>{const p=new THREE.Vector3(random()-.5,random()-.5,random()-.5).normalize().multiplyScalar(random()**.6*7);return[p.x,p.y,p.z];},0xffb764,4);group.add(cloud,glow(0xffb150,8,.7));const rays=[];for(let i=0;i<100;i++){const p=new THREE.Vector3(random()-.5,random()-.5,random()-.5).normalize();rays.push(p.x*2,p.y*2,p.z*2,p.x*8,p.y*8,p.z*8);}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(rays,3));group.add(new THREE.LineSegments(geo,new THREE.LineBasicMaterial({color:0xffcc89,transparent:true,opacity:.17})));return{group,update(delta,time){cloud.rotation.y+=delta*.01;cloud.scale.setScalar(.95+Math.sin(time*.35)*.035);}};}
function recombination(){const group=new THREE.Group(),photons=[];const nucleusMat=new THREE.MeshBasicMaterial({color:0xeeb98a});for(let i=0;i<7;i++){const atom=new THREE.Group(),a=i/7*Math.PI*2;atom.position.set(Math.cos(a)*3.6,Math.sin(a)*2.6,(i%3-1)*.7);atom.add(sphere(.12,nucleusMat),glow(0xffd4aa,.8,.3));for(let j=0;j<2;j++){const ring=object(new THREE.TorusGeometry(.67,.007,5,100),new THREE.MeshBasicMaterial({color:0x7fb9e3,transparent:true,opacity:.65}));ring.rotation.set(j*.9,.5,j*1.2);atom.add(ring);}group.add(atom);const photon=glow(0xffe5a5,.21,.9);group.add(photon);photons.push(photon);}
 const tag=label('H · 氢原子形成 / 光子自由传播','#c8def1',6);tag.position.set(0,-4.1,0);group.add(tag);return{group,update(delta,time){photons.forEach((p,i)=>{const phase=(time*.2+i*.137)%1,a=i/7*Math.PI*2;p.position.set(Math.cos(a)*(1+phase*8),Math.sin(a)*(1+phase*5),.3);p.material.opacity=1-phase;});}};}
const starTextureCache=new Map();
function starTexture(hex){
 if(starTextureCache.has(hex))return starTextureCache.get(hex);
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=256;
 const ctx=canvas.getContext('2d'),base=new THREE.Color(hex),hsl={};base.getHSL(hsl);
 ctx.fillStyle=`#${base.getHexString()}`;ctx.fillRect(0,0,512,256);
 // 米粒组织：大量低对比对流元胞，让恒星表面不是纯色球。
 for(let i=0;i<3600;i++){
  const x=random()*512,y=random()*256,r=1.2+random()*8,a=.03+random()*.10;
  const light=random()>.42;
  ctx.fillStyle=`hsla(${hsl.h*360+random()*12-6},${Math.min(1,hsl.s*100+random()*10)}%,${Math.min(96,hsl.l*100+(light?random()*18:-random()*12))}%,${a})`;
  ctx.beginPath();ctx.ellipse(x,y,r,r*(.35+random()*.4),random()*Math.PI,0,Math.PI*2);ctx.fill();
 }
 // 临边昏暗：中心亮、边缘略暗，制造球体的体积感。
 // 只用极轻的中心增亮，不做“行星式”明暗球体。
 const dark=ctx.createRadialGradient(256,128,0,256,128,260);
 dark.addColorStop(0,'rgba(255,255,255,0.08)');dark.addColorStop(.55,'rgba(255,255,255,0.02)');dark.addColorStop(.86,'rgba(0,0,0,0.10)');dark.addColorStop(1,'rgba(0,0,0,0)');
 ctx.fillStyle=dark;ctx.fillRect(0,0,512,256);
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.wrapS=THREE.RepeatWrapping;
 starTextureCache.set(hex,texture);return texture;
}
const flareTexture=(()=>{const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');const radial=g.createRadialGradient(128,128,0,128,128,126);radial.addColorStop(0,'rgba(255,255,255,.9)');radial.addColorStop(.18,'rgba(255,255,255,.35)');radial.addColorStop(.55,'rgba(255,255,255,.06)');radial.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=radial;g.fillRect(0,0,256,256);
  for(let i=0;i<4;i++){const a=i*Math.PI/2,long=i%2?1.0:1.9;const grd=g.createLinearGradient(128-Math.cos(a)*128*long,128-Math.sin(a)*128*long,128+Math.cos(a)*128*long,128+Math.sin(a)*128*long);grd.addColorStop(0,'rgba(255,255,255,0)');grd.addColorStop(.48,'rgba(255,255,255,.22)');grd.addColorStop(.5,'rgba(255,255,255,.85)');grd.addColorStop(.52,'rgba(255,255,255,.22)');grd.addColorStop(1,'rgba(255,255,255,0)');g.strokeStyle=grd;g.lineWidth=2.2;g.beginPath();g.moveTo(128-Math.cos(a)*128*long,128-Math.sin(a)*128*long);g.lineTo(128+Math.cos(a)*128*long,128+Math.sin(a)*128*long);g.stroke();}
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;})();
const coreTexture=(()=>{const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');const radial=g.createRadialGradient(128,128,0,128,128,128);radial.addColorStop(0,'rgba(255,255,255,1)');radial.addColorStop(.2,'rgba(255,255,255,.9)');radial.addColorStop(.5,'rgba(255,255,255,.28)');radial.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=radial;g.fillRect(0,0,256,256);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;})();
function firstStars(){
  const group=new THREE.Group(),stars=[];
  const flareTexture=(()=>{
    const canvas=document.createElement('canvas');canvas.width=128;canvas.height=128;
    const ctx=canvas.getContext('2d');
    const core=ctx.createRadialGradient(64,64,0,64,64,64);
    core.addColorStop(0,'rgba(255,255,255,.92)');core.addColorStop(.18,'rgba(255,255,255,.32)');core.addColorStop(.55,'rgba(255,255,255,.06)');core.addColorStop(1,'rgba(255,255,255,0)');
    ctx.fillStyle=core;ctx.fillRect(0,0,128,128);
    ctx.globalCompositeOperation='lighter';
    for(let i=0;i<6;i++){
      ctx.save();ctx.translate(64,64);ctx.rotate(i*Math.PI/3);
      const g=ctx.createLinearGradient(0,0,64,0);g.addColorStop(0,'rgba(255,255,255,.7)');g.addColorStop(1,'rgba(255,255,255,0)');
      ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(0,-1.6);ctx.lineTo(64,0);ctx.lineTo(0,1.6);ctx.closePath();ctx.fill();
      const g2=ctx.createLinearGradient(0,0,-64,0);g2.addColorStop(0,'rgba(255,255,255,.55)');g2.addColorStop(1,'rgba(255,255,255,0)');
      ctx.fillStyle=g2;ctx.beginPath();ctx.moveTo(0,-1.4);ctx.lineTo(-64,0);ctx.lineTo(0,1.4);ctx.closePath();ctx.fill();
      ctx.restore();
    }
    const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;return tex;
  })();
  // 第一代恒星是贫金属的大质量恒星，表面温度高、颜色偏蓝白。
  // 用连续光球着色器表现临边昏暗和色温变化；不在这个尺度上伪造岩石状米粒纹理。
  const palette=[
    ['#f4f9ff','#3c6fa8','#bcd8ff'],
    ['#f6fbff','#4a78ad','#cfe2ff'],
    ['#eef6ff','#2f5f96','#a9ceff'],
    ['#f2f8ff','#4677ab','#c4e0ff'],
    ['#f2f8ff','#4677ab','#c4e0ff'],
    ['#eef7ff','#3f6da6','#c0dcff'],
    ['#edf7ff','#35679c','#b4d6ff']
  ];
  const vertexShader=`varying vec3 vN; varying vec3 vP; varying vec2 vUv;
    void main(){vUv=uv;vN=normalize(mat3(modelMatrix)*normal);vec4 p=modelMatrix*vec4(position,1.0);vP=p.xyz;gl_Position=projectionMatrix*viewMatrix*p;}`;
  const fragmentShader=`uniform vec3 hotColor; uniform vec3 coolColor; uniform vec3 rimColor; uniform float time;
    varying vec3 vN; varying vec3 vP; varying vec2 vUv;
    float hash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7))*43758.5453123));}
    float noise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);
      return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
                 mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
    void main(){
      vec3 N=normalize(vN);vec3 V=normalize(cameraPosition-vP);float mu=clamp(dot(N,V),0.0,1.0);
      float n=noise(vec3(vUv*18.0,time*.03))*0.6+noise(vec3(vUv*42.0,time*.02))*0.4;
      vec3 base=mix(coolColor,hotColor,pow(mu,.72));
      float limb=pow(mu,.42);
      vec3 color=base*(.34+.78*limb);
      color+=rimColor*pow(1.0-mu,4.2)*.55;
      color*=.95+.05*(n-.5);
      float gran=noise(vec3(vUv*140.0,time*.03))*.6+noise(vec3(vUv*230.0,time*.02))*.4-.5;
      color*=1.0+gran*.10;
      
      gl_FragColor=vec4(color*.88,1.0);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }`;
  const rimFragment=`uniform vec3 tint; uniform float strength;
    varying vec3 vN; varying vec3 vP;
    void main(){
      vec3 N=normalize(vN);vec3 V=normalize(cameraPosition-vP);float rim=pow(clamp(1.0-abs(dot(N,V)),0.0,1.0),3.0);
      gl_FragColor=vec4(tint,rim*strength);
    }`;
  for(let i=0;i<7;i++){
    const radius=[.72,.40,.50,.30,.60,.25,.34][i];
    const x=i===0?0:Math.sin(i*7.2)*5.2,z=i===0?0:Math.cos(i*5.7)*1.8,y=i===0?0:Math.sin(i*3.4)*2.4;
    const [hot,cool,rim]=palette[i];
    const material=new THREE.ShaderMaterial({
      uniforms:{hotColor:{value:new THREE.Color(hot)},coolColor:{value:new THREE.Color(cool)},rimColor:{value:new THREE.Color(rim)},time:{value:0}},
      vertexShader,fragmentShader
    });
    const mesh=new THREE.Mesh(new THREE.SphereGeometry(radius,96,64),material);
    mesh.position.set(x,y,z);
    const atmo=new THREE.Mesh(new THREE.SphereGeometry(radius*1.05,64,48),new THREE.ShaderMaterial({
      uniforms:{tint:{value:new THREE.Color(rim)},strength:{value:.62}},
      vertexShader,fragmentShader:rimFragment,
      transparent:true,depthWrite:false,side:THREE.FrontSide,blending:THREE.AdditiveBlending
    }));
    atmo.position.set(x,y,z);atmo.renderOrder=4;
    const halo=glow(rim,radius*2.2,.06);const core=glow(0xffffff,radius*.55,.22);const flare=new THREE.Sprite(new THREE.SpriteMaterial({map:flareTexture,color:new THREE.Color(rim),transparent:true,opacity:.13,blending:THREE.AdditiveBlending,depthWrite:false}));flare.scale.set(radius*3.8,radius*3.8,1);flare.position.set(x,y,z);halo.position.set(x,y,z);
    group.add(mesh,atmo,halo,core,flare);
    stars.push({mesh,material,halo,phase:i*.9});
  }
  const gas=points(2200,()=>{const r=2.1+random()*4.8,a=random()*Math.PI*2;return[Math.cos(a)*r,Math.sin(a)*r*.55,(random()-.5)*3.4];},0x7f9fc4,1.8);
  const dust=points(1100,()=>{const r=.7+random()*6,a=random()*Math.PI*2;return[Math.cos(a)*r,Math.sin(a)*r*.8,(random()-.5)*4];},0xb5a086,1.2);
  const distant=points(900,()=>[(random()-.5)*19,(random()-.5)*12,-4-random()*7],0xdce9ff,1.15);
  gas.material.opacity=.26;gas.material.size=1.0;dust.material.opacity=.18;dust.material.size=.9;distant.material.opacity=.65;
  group.add(gas,dust,distant);
  return{group,update(delta,time){
    gas.rotation.z+=delta*.012;dust.rotation.z-=delta*.008;distant.rotation.y+=delta*.002;
    stars.forEach(s=>{
      s.material.uniforms.time.value=time;
      s.halo.material.opacity=.055+Math.sin(time*.4+s.phase)*.012;
      s.mesh.rotation.y+=delta*.012;
    });
  }};
}
function galaxy(radius,color){const group=new THREE.Group(),stars=points(2200,i=>{const r=random()**.8*radius,a=i%3/3*Math.PI*2+r*1.4+(random()-.5)*.4;return[Math.cos(a)*r,(random()-.5)*.13,Math.sin(a)*r];},color,2.8);group.add(stars,glow(0xffd4a0,radius*.65,.4));return group;}
function galaxies(){const group=new THREE.Group(),a=galaxy(3.6,0xb7acf5),b=galaxy(2.1,0xa4c7ed),c=galaxy(1.3,0xe1bf9e);a.position.set(-.8,-.4,.3);a.rotation.set(.65,0,.15);b.position.set(3.7,2,-1.5);b.rotation.set(.8,.3,-.4);c.position.set(-4.7,2,-2);c.rotation.x=.8;group.add(a,b,c);return{group,update(delta,time){a.rotation.y+=delta*.012;b.rotation.y-=delta*.018;c.rotation.y+=delta*.02;}};}
function solarSystem(invalidate){
 const group=new THREE.Group(),disk=new THREE.Group();disk.rotation.set(.55,0,-.18);group.add(disk);
 const load=name=>surfaceTexture(name,invalidate);
 const sun=createSun({radius:.95,hot:'#ffb43c',cool:'#c22600',intensity:1.0,map:load('sun.jpg'),tint:'#fff2d8'});sun.add(glow(0xffa959,3.5,.35));disk.add(sun);
 const bodies=[];const names=['水星','金星','地球','火星','木星','土星'];
 const radii=[1.7,2.4,3.1,3.8,5,6.2],kinds=['mercury','venus','earth','mars','jupiter','saturn'],sizes=[.16,.16,.16,.16,.44,.36];
 for(let i=0;i<6;i++){
  const r=radii[i];disk.add(orbit(r,0xb4a17e,.3));
  const planet=createPlanet(kinds[i],load,{radius:sizes[i],detail:.65});planet.position.set(Math.cos(i*2.1)*r,0,Math.sin(i*2.1)*r);disk.add(planet);
  if(kinds[i]==='saturn'){const ring=createSaturnRing(load,{inner:1.16,outer:2.24});ring.scale.setScalar(sizes[i]);planet.add(ring);}
  const text=label(names[i],'#9fb9d0',1.25);text.position.copy(planet.position);text.position.y=.4;disk.add(text);
  bodies.push({planet,text,r,angle:i*2.1,speed:.1/(1+i*.55)});
 }
 const dust=points(1800,()=>{const r=1.5+random()*5,a=random()*Math.PI*2;return[Math.cos(a)*r,(random()-.5)*.07,Math.sin(a)*r];},0xc9ad7d,1.8);disk.add(dust);
 return{group,update(delta,time){
  sun.userData.update?.(delta,time);dust.rotation.y-=delta*.005;
  bodies.forEach(b=>{b.angle+=delta*b.speed;b.planet.position.set(Math.cos(b.angle)*b.r,0,Math.sin(b.angle)*b.r);b.text.position.copy(b.planet.position);b.text.position.y=.4;});
 }};
}
function firstLife(){const group=new THREE.Group(),cells=[];for(let i=0;i<3;i++){const cell=new THREE.Group(),r=i===0?1.8:i===1?1.05:.8;cell.position.set(i===0?-.9:i===1?2.7:-3,i===0?0:i===1?1.1:-1.5,(i-1)*.5);cell.add(sphere(r,solid(0x73bcb5,{transparent:true,opacity:.16,roughness:.15,side:THREE.DoubleSide,depthWrite:false})));const molecule=[];for(let j=0;j<60;j++){const a=j/60*Math.PI*4;molecule.push([Math.cos(a)*r*.42,Math.sin(a)*r*.42,(j/60-.5)*r]);}cell.add(line(molecule,0xe1bf89,.9));const beads=new THREE.InstancedMesh(new THREE.SphereGeometry(.045,8,6),solid(0x89c8bb),100),matrix=new THREE.Matrix4();for(let j=0;j<100;j++){const a=j*2.39996,u=1-2*(j+.5)/100,v=Math.sqrt(1-u*u);matrix.makeTranslation(Math.cos(a)*v*r,u*r,Math.sin(a)*v*r);beads.setMatrixAt(j,matrix);}cell.add(beads);group.add(cell);cells.push(cell);}
 const floor=object(new THREE.CircleGeometry(7,100),solid(0x1c625f,{transparent:true,opacity:.16,side:THREE.DoubleSide}),0,-3,0);floor.rotation.x=-Math.PI/2;group.add(floor);for(let r=2;r<7;r+=1){const ring=orbit(r,0x65aaa2,.13);ring.position.y=-2.97;group.add(ring);}return{group,update(delta,time){cells.forEach((c,i)=>{c.rotation.y+=delta*(.05+i*.015);c.position.y+=(Math.sin(time*.5+i)*delta*.04);});}};}
function trilobite(){
 const group=new THREE.Group(),shell=solid(0x78908d,{roughness:.55,metalness:.16}),dark=solid(0x405a5b,{roughness:.7}),leg=solid(0x3d5559);
 // Cephalon with glabella, compound eyes and genal spines.
 const head=sphere(.68,shell,0,.02,1.55);head.scale.set(1.08,.26,.78);group.add(head);
 const glabella=sphere(.34,dark,0,.03,1.52);glabella.scale.set(1,.38,.95);group.add(glabella);
 for(const s of [-1,1]){
  const eye=sphere(.13,solid(0x1b3034,{roughness:.25}),s*.38,.14,1.62);eye.scale.set(1,.6,.9);group.add(eye);
  group.add(rod(new THREE.Vector3(s*.58,.02,1.35),new THREE.Vector3(s*1.0,.05,.70),.028,dark));
  group.add(line([[s*.30,.08,2.1],[s*.55,.12,2.35],[s*.82,.18,2.62]],0x7fa2a4,.8));
 }
 // Nine thoracic segments with an axial lobe and lateral pleurae.
 for(let i=0;i<9;i++){
  const z=1.15-i*.30,w=.38+Math.sin((i+1)/10*Math.PI)*.16;
  const axial=sphere(w,dark,0,.01,z);axial.scale.set(.85,.28,.30);group.add(axial);
  for(const s of [-1,1]){
   const pleura=sphere(.34,shell,s*(w*.92),-.01,z);pleura.scale.set(1.45,.12,.24);pleura.rotation.z=s*.06;group.add(pleura);
   group.add(rod(new THREE.Vector3(s*w*.6,-.10,z),new THREE.Vector3(s*(w+.34),-.24,z-.12),.025,leg));
  }
 }
 // Pygidium, axial ridge and tail spine.
 const pyg=sphere(.52,shell,0,.02,-1.55);pyg.scale.set(1.15,.20,.72);group.add(pyg);
 group.add(rod(new THREE.Vector3(0,.06,1.25),new THREE.Vector3(0,.06,-1.35),.035,dark));
 group.add(rod(new THREE.Vector3(0,.02,-1.78),new THREE.Vector3(0,.02,-2.25),.028,shell));
 return group;
}
function anomalocaris(){
 const group=new THREE.Group(),shell=solid(0x9a5f52,{roughness:.62,metalness:.08}),plate=solid(0xb5775d,{roughness:.55}),fin=solid(0xbb6d55,{roughness:.5,transparent:true,opacity:.88});
 for(let i=0;i<10;i++){
  const x=-1.1+i*.22,w=.22+Math.sin((i+1)/11*Math.PI)*.28;
  const seg=sphere(w,shell,x,0,0);seg.scale.set(.45,.55,1);group.add(seg);
  for(const s of [-1,1]){const flap=sphere(w*.9,fin,x,-.02,s*.34);flap.scale.set(.6,.12,.75);group.add(flap);}
 }
 const head=sphere(.42,shell,1.28,.05,0);head.scale.set(1,.7,.9);group.add(head);
 for(const s of [-1,1]){
  const eye=sphere(.12,solid(0x2c3a36,{roughness:.25}),1.55,.24,s*.22);group.add(eye,sphere(.055,solid(0xd7d0a8),1.61,.24,s*.22));
  const arm=[[1.35,.0,s*.2],[1.75,.02,s*.3],[2.0,-.14,s*.18],[2.16,-.22,s*.04]];
  group.add(object(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(arm.map(p=>new THREE.Vector3(...p))),32,.04,8,false),plate));
  for(let k=0;k<5;k++){const t=k/5,a=[1.62+t*.3,.02-t*.06,s*(.28-t*.16)];group.add(rod(new THREE.Vector3(...a),new THREE.Vector3(a[0]+.06,a[1]-.16,a[2]+s*.04),.012,solid(0x7d4f45)));}
 }
 for(let i=0;i<4;i++){const fan=sphere(.24,fin,1.15+i*.08,-.02,(i-1.5)*.14);fan.scale.set(.8,.08,.55);group.add(fan);}
 return group;
}
function opabinia(){
 const group=new THREE.Group(),bodyMat=solid(0x7b8f7d,{roughness:.6});
 for(let i=0;i<9;i++){const seg=sphere(.16+Math.sin((i+1)/10*Math.PI)*.12,bodyMat,-.75+i*.2,0,0);seg.scale.set(.7,.45,.6);group.add(seg);}
 const head=sphere(.24,bodyMat,.92,.05,0);head.scale.set(1,.6,.75);group.add(head);
 const proboscis=[[1.05,.05,0],[1.38,.18,0],[1.65,.12,0],[1.88,.2,0]];
 group.add(object(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(proboscis.map(p=>new THREE.Vector3(...p))),32,.035,8,false),bodyMat));
 for(let i=0;i<2;i++)group.add(rod(new THREE.Vector3(1.86,.2,0),new THREE.Vector3(1.94,.05,(i?-.1:.1)),.02,bodyMat));
 for(let i=0;i<5;i++)group.add(sphere(.045,solid(0x243731,{roughness:.3}),.95+i*.055,.20,(i-2)*.055));
 for(let i=0;i<6;i++){const fin=sphere(.18,solid(0x93a58e,{transparent:true,opacity:.85}),-.55+i*.21,-.05,.22);fin.scale.set(.7,.1,.5);group.add(fin);}
 return group;
}
function cambrianSponges(){const group=new THREE.Group();for(let i=0;i<7;i++){const h=.5+random()*.7,x=-1.7+random()*3.4,z=-1.2+random()*2.2;group.add(rod(new THREE.Vector3(x,-1.55,z),new THREE.Vector3(x,-1.55+h,z),.06,solid(0x7b9b92)),rod(new THREE.Vector3(x,-1.55+h,z),new THREE.Vector3(x+random()*.15,-1.55+h+.18,z+random()*.15),.035,solid(0x9bb0a3)));for(let k=0;k<4;k++)group.add(sphere(.04,solid(0x4b6c68),x+Math.cos(k)*.05,-1.4+h,z+Math.sin(k)*.05));}return group;}
function cambrian(){
 const group=new THREE.Group();
 group.rotation.x=.18;group.position.y=.42;
 const seafloorMat=solid(0x315a56,{roughness:1}),reefMat=solid(0x477a70,{roughness:.9}),reefLight=solid(0x7fa99b,{roughness:.8});
 const light=new THREE.PointLight(0x78e0d6,2.2,14,1.2);light.position.set(1,5,4);group.add(light);
 // The hero trilobite is deliberately large and off-centre; the previous
 // scene read as a distant tide pool rather than a Cambrian sea floor.
 const large=trilobite();large.scale.setScalar(1.72);large.rotation.set(.04,1.28,-.04);large.position.set(-.95,-1.22,.55);group.add(large);
 const others=[[-2.95,-1.30,1.15,.72],[1.55,-1.34,1.85,.62],[2.62,-1.28,.85,.55],[-2.10,-1.30,-.95,.50]];
 for(const [x,y,z,s] of others){const creature=trilobite();creature.scale.setScalar(s);creature.position.set(x,y,z);creature.rotation.set(.03,Math.atan2(-x,-z)*.5,.02);group.add(creature);}
 const anom=anomalocaris();anom.scale.setScalar(1.12);anom.position.set(2.05,-.52,-1.30);anom.rotation.set(.03,.62,.02);group.add(anom);
 const anom2=anomalocaris();anom2.scale.setScalar(.52);anom2.position.set(-3.10,-.68,-1.15);anom2.rotation.set(0,-1.0,0);group.add(anom2);
 const opa=opabinia();opa.scale.setScalar(1.12);opa.position.set(-2.55,-.56,-.55);opa.rotation.set(0,.92,0);group.add(opa);
 // Archaeocyathid reef: stacked cups with dark central cavities.
 const reef=new THREE.Group();reef.position.set(0,-1.55,-1.35);group.add(reef);
 for(let i=0;i<17;i++){
   const x=-3.9+random()*7.8,z=-1.0+random()*1.5,h=.38+random()*.82,r=.10+random()*.14;
   reef.add(object(new THREE.CylinderGeometry(r*.86,r,h,18,3,true),reefMat,x,-1.55+h/2,z));
   reef.add(object(new THREE.CylinderGeometry(r*.72,r*.72,.03,18),reefLight,x,-1.55+h,z));
   for(let k=0;k<3;k++)reef.add(rod(new THREE.Vector3(x,-1.55+h*.40,z),new THREE.Vector3(x+Math.cos(k*2.1)*.18,-1.55+h*.58,z+Math.sin(k*2.1)*.18),.012,reefLight));
 }
 const sponges=cambrianSponges();sponges.scale.setScalar(1.25);group.add(sponges);
 const bed=object(new THREE.CylinderGeometry(4.9,5.25,.22,64),seafloorMat,0,-1.80,0);group.add(bed);
 for(let i=0;i<9;i++){const ripple=object(new THREE.TorusGeometry(1.0+i*.47,.010,6,96),solid(0x4e7d73),0,-1.67,0);ripple.rotation.x=Math.PI/2;group.add(ripple);}
 for(let i=0;i<13;i++){const rock=sphere(.10+random()*.20,solid(i%2?0x4b6a63:0x6b8478),-4.2+random()*8.4,-1.58,-2.2+random()*4.2);rock.scale.y=.42;group.add(rock);}
 // Algal turf and suspended marine snow.
 for(let i=0;i<22;i++){const algae=rod(new THREE.Vector3(-4.2+random()*8.4,-1.58,-2.3+random()*4.3),new THREE.Vector3(-4.2+random()*8.4,-.6+random()*.7,-2.3+random()*4.3),.010,solid(0x4b8067));group.add(algae);}
 const marineSnow=points(220,()=>[(-4.4+random()*8.8),(-1.0+random()*3.4),(-2.6+random()*5.2)],0x9ecdc2,2);
 group.add(marineSnow);
 return{group,update(delta,time){
   large.rotation.y=1.28+Math.sin(time*.10)*.035;
   large.position.y=-1.22+Math.sin(time*.32)*.015;
   anom.position.y=-.52+Math.sin(time*.35)*.035;anom.rotation.z=.02+Math.sin(time*.3)*.02;
   anom2.position.x=-3.10+Math.sin(time*.22)*.12;
   opa.position.y=-.56+Math.cos(time*.4)*.03;
   sponges.rotation.z=Math.sin(time*.2)*.01;
   marineSnow.rotation.y+=delta*.006;
 }};
}
function present(invalidate){
 const group=new THREE.Group(),planet=new THREE.Group();planet.rotation.set(.1,-.7,.12);group.add(planet);
 const load=name=>surfaceTexture(name,invalidate);
 const earth=createEarth(load,{radius:1,sunDirection:new THREE.Vector3(-.9,.6,1.5)});earth.scale.setScalar(3.65);planet.add(earth);
 const moon=createPlanet('moon',load,{radius:.96,detail:.8});moon.position.set(-5.2,-2.2,0);group.add(moon);
 let elapsed=0;
 return{group,update(delta){elapsed+=delta;earth.userData.update?.(delta,elapsed);planet.rotation.y+=delta*.02;moon.rotation.y+=delta*.01;}};
}
export const timeSubjects={'time.object':(invalidate,entry)=>createChronicleObject(entry,invalidate,entry.visual),'time.big-bang':primordial,'time.recombination':recombination,'time.first-stars':firstStars,'time.galaxy-formation':galaxies,'time.solar-system':solarSystem,'time.first-life':firstLife,'time.cambrian':cambrian,'time.present':present};



