/* Tech Guardians – shared 3D wireframe globe background for static HTML pages */
(function () {
  if (window.__tg3dLoaded) return;
  window.__tg3dLoaded = true;

  var host = document.createElement('div');
  host.id = 'tg-3d-bg';
  host.style.cssText =
    'position:fixed;inset:0;z-index:0;pointer-events:none;opacity:.55;';
  document.addEventListener('DOMContentLoaded', function () {
    document.body.insertBefore(host, document.body.firstChild);
    // keep page content above the canvas
    var style = document.createElement('style');
    style.textContent =
      'body > *:not(#tg-3d-bg){position:relative;z-index:1;}';
    document.head.appendChild(style);
  });

  var s = document.createElement('script');
  s.src = 'https://unpkg.com/three@0.160.0/build/three.min.js';
  s.onload = init;
  document.head.appendChild(s);

  function init() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var THREE = window.THREE;
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 6.4;

    var renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    var attach = function () { host.appendChild(renderer.domElement); };
    if (host.isConnected) attach(); else document.addEventListener('DOMContentLoaded', attach);

    var globe = new THREE.Mesh(
      new THREE.SphereGeometry(2, 42, 42),
      new THREE.MeshBasicMaterial({ color: 0x00d4ff, wireframe: true, transparent: true, opacity: 0.22 })
    );
    scene.add(globe);

    var rings = [];
    [[2.7, 0.25, 0x00d4ff], [3.2, -0.18, 0x00ff9c], [3.7, 0.12, 0xff9f1c]].forEach(function (r) {
      var m = new THREE.Mesh(
        new THREE.TorusGeometry(r[0], 0.008, 12, 90),
        new THREE.MeshBasicMaterial({ color: r[2], transparent: true, opacity: 0.4 })
      );
      m.userData.speed = r[1];
      rings.push(m);
      scene.add(m);
    });

    // particle field
    var count = 320, pos = new Float32Array(count * 3);
    for (var i = 0; i < count; i++) {
      var a = Math.random() * Math.PI * 2, rr = 2.6 + Math.random() * 2.4;
      pos[i * 3] = Math.cos(a) * rr;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 4;
      pos[i * 3 + 2] = Math.sin(a) * rr;
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    var points = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0x00ff9c, size: 0.03, transparent: true, opacity: 0.6 }));
    scene.add(points);

    var clock = new THREE.Clock();
    (function loop() {
      requestAnimationFrame(loop);
      var t = clock.getElapsedTime();
      globe.rotation.y = t * 0.12;
      points.rotation.y = t * 0.05;
      rings.forEach(function (m) { m.rotation.x = t * m.userData.speed; m.rotation.z = t * m.userData.speed * 0.6; });
      renderer.render(scene, camera);
    })();

    window.addEventListener('resize', function () {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }
})();
