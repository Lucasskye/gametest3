import * as THREE from
"https://unpkg.com/three@0.160.0/build/three.module.js";

const scene =
new THREE.Scene();

scene.background =
new THREE.Color(0x87ceeb);

const camera =
new THREE.PerspectiveCamera(
75,
window.innerWidth /
window.innerHeight,
0.1,
1000
);

camera.position.set(
0,
1.7,
5
);

const renderer =
new THREE.WebGLRenderer({
antialias:true
});

renderer.setSize(
window.innerWidth,
window.innerHeight
);

renderer.shadowMap.enabled =
true;

document.body.appendChild(
renderer.domElement
);

const ambient =
new THREE.AmbientLight(
0xffffff,
2
);

scene.add(ambient);

const sun =
new THREE.DirectionalLight(
0xffffff,
2
);

sun.position.set(
10,
20,
10
);

sun.castShadow = true;

scene.add(sun);

const floor =
new THREE.Mesh(
new THREE.PlaneGeometry(
300,
300
),
new THREE.MeshStandardMaterial({
color:0x707070
})
);

floor.rotation.x =
-Math.PI/2;

floor.receiveShadow = true;

scene.add(floor);

function createWall(x,z){

const wall =
new THREE.Mesh(
new THREE.BoxGeometry(
2,
2,
2
),
new THREE.MeshStandardMaterial({
color:0x888888
})
);

wall.position.set(
x,
1,
z
);

wall.castShadow = true;
wall.receiveShadow = true;

scene.add(wall);

return wall;

}

for(
let i=-30;
i<=30;
i+=5
){

createWall(
i,
-25
);

}

for(
let i=-30;
i<=30;
i+=5
){

createWall(
i,
25
);

}

for(
let i=-20;
i<=20;
i+=5
){

createWall(
-25,
i
);

}

for(
let i=-20;
i<=20;
i+=5
){

createWall(
25,
i
);

}

createWall(0,-10);
createWall(5,-10);
createWall(-5,-10);

createWall(10,5);
createWall(10,10);

createWall(-10,5);
createWall(-10,10);

let hp = 100;
let ammo = 30;
let reserveAmmo = 90;
let kills = 0;

let yaw = 0;
let pitch = 0;

let moveX = 0;
let moveY = 0;

let recoil = 0;

const enemies = [];

const raycaster =
new THREE.Raycaster();

const hud =
document.getElementById(
"hud"
);

function updateHUD(){

hud.innerHTML = `
HP: ${hp}<br>
Ammo: ${ammo}/${reserveAmmo}<br>
Kills: ${kills}
`;

}

updateHUD();

const gun =
new THREE.Group();

const gunBody =
new THREE.Mesh(
new THREE.BoxGeometry(
0.3,
0.2,
1
),
new THREE.MeshStandardMaterial({
color:0x222222
})
);

const barrel =
new THREE.Mesh(
new THREE.BoxGeometry(
0.08,
0.08,
0.8
),
new THREE.MeshStandardMaterial({
color:0x444444
})
);

barrel.position.z =
-0.8;

gun.add(gunBody);
gun.add(barrel);

gun.position.set(
0.45,
-0.35,
-1
);

camera.add(gun);
scene.add(camera);

const joystick =
document.getElementById(
"joystick"
);

const stick =
document.getElementById(
"stick"
);

let joystickActive =
false;

joystick.addEventListener(
"touchstart",
()=>{
joystickActive = true;
}
);

joystick.addEventListener(
"touchend",
()=>{

joystickActive =
false;

moveX = 0;
moveY = 0;

stick.style.left =
"40px";

stick.style.top =
"40px";

}
);

joystick.addEventListener(
"touchmove",
e=>{

const rect =
joystick.getBoundingClientRect();

const x =
e.touches[0].clientX -
rect.left - 70;

const y =
e.touches[0].clientY -
rect.top - 70;

moveX =
Math.max(
-1,
Math.min(
1,
x/50
)
);

moveY =
Math.max(
-1,
Math.min(
1,
y/50
)
);

stick.style.left =
(40+x)+"px";

stick.style.top =
(40+y)+"px";

}
);

let lastX = null;
let lastY = null;

document.addEventListener(
"touchmove",
e=>{

if(
e.target===joystick ||
e.target===stick
)return;

const t =
e.touches[0];

if(lastX!==null){

yaw -=
(t.clientX-lastX)
*0.004;

pitch -=
(t.clientY-lastY)
*0.004;

pitch =
Math.max(
-1.3,
Math.min(
1.3,
pitch
)
);

}

lastX =
t.clientX;

lastY =
t.clientY;

}
);

document.addEventListener(
"touchend",
()=>{

lastX = null;
lastY = null;

}
);

let scoped =
false;

const scopeBtn =
document.getElementById(
"scope"
);

scopeBtn.addEventListener(
"touchstart",
()=>{

scoped = !scoped;

camera.fov =
scoped
? 30
: 75;

camera.updateProjectionMatrix();

}
);

const reloadBtn =
document.getElementById(
"reload"
);

reloadBtn.addEventListener(
"touchstart",
()=>{

if(
reserveAmmo<=0
)return;

const need =
30-ammo;

const take =
Math.min(
need,
reserveAmmo
);

ammo += take;
reserveAmmo -= take;

updateHUD();

}
);

const fireBtn =
document.getElementById(
"fire"
);

fireBtn.addEventListener(
"touchstart",
()=>{

if(ammo<=0)
return;

ammo--;

recoil = 0.08;

updateHUD();

});

function createEnemy(x,z){

const enemy =
new THREE.Group();

const body =
new THREE.Mesh(
new THREE.BoxGeometry(
1,
1.5,
0.6
),
new THREE.MeshStandardMaterial({
color:0xff3333
})
);

body.position.y = 1.5;

const head =
new THREE.Mesh(
new THREE.SphereGeometry(
0.35,
16,
16
),
new THREE.MeshStandardMaterial({
color:0xffddaa
})
);

head.position.y = 2.6;

enemy.add(body);
enemy.add(head);

enemy.position.set(
x,
0,
z
);

enemy.userData = {
enemy:true,
hp:100,
speed:0.02
};

scene.add(enemy);

enemies.push(enemy);

return enemy;

}

for(let i=0;i<5;i++){

createEnemy(
(Math.random()-0.5)*30,
(Math.random()-0.5)*30
);

}

function spawnEnemy(){

createEnemy(
(Math.random()-0.5)*40,
(Math.random()-0.5)*40
);

}

fireBtn.addEventListener(
"touchstart",
()=>{

if(ammo<=0)
return;

ammo--;

recoil = 0.08;

raycaster.setFromCamera(
new THREE.Vector2(0,0),
camera
);

const hits =
raycaster.intersectObjects(
scene.children,
true
);

for(const hit of hits){

let obj =
hit.object;

while(obj){

if(
obj.userData &&
obj.userData.enemy
){

obj.userData.hp -= 50;

if(
obj.userData.hp<=0
){

scene.remove(obj);

const index =
enemies.indexOf(obj);

if(index>-1){

enemies.splice(
index,
1
);

}

kills++;

updateHUD();

setTimeout(
spawnEnemy,
3000
);

}

break;

}

obj = obj.parent;

}

}

updateHUD();

});

setInterval(()=>{

if(
enemies.length<5
){

spawnEnemy();

}

},5000);

window.addEventListener(
"resize",
()=>{

camera.aspect =
window.innerWidth /
window.innerHeight;

camera.updateProjectionMatrix();

renderer.setSize(
window.innerWidth,
window.innerHeight
);

});

function animate(){

requestAnimationFrame(
animate
);

camera.rotation.order =
"YXZ";

camera.rotation.y =
yaw;

camera.rotation.x =
pitch - recoil;

recoil *= 0.85;

camera.position.x +=
Math.sin(yaw)
*(-moveY)
*0.08;

camera.position.z +=
Math.cos(yaw)
*(-moveY)
*0.08;

camera.position.x +=
Math.sin(
yaw+Math.PI/2
)
*(-moveX)
*0.05;

camera.position.z +=
Math.cos(
yaw+Math.PI/2
)
*(-moveX)
*0.05;

for(const enemy of enemies){

const dx =
camera.position.x -
enemy.position.x;

const dz =
camera.position.z -
enemy.position.z;

const dist =
Math.sqrt(
dx*dx +
dz*dz
);

if(dist>2){

enemy.position.x +=
(dx/dist) *
enemy.userData.speed;

enemy.position.z +=
(dz/dist) *
enemy.userData.speed;

}

enemy.lookAt(
camera.position.x,
enemy.position.y,
camera.position.z
);

if(dist<1.5){

hp -= 0.05;

if(hp<0)
hp=0;

updateHUD();

}

}

gun.rotation.x =
recoil * 8;

renderer.render(
scene,
camera
);

}

animate();

