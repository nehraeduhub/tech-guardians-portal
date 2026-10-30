/* TG Academy — animated concept diagrams (play / pause). Pure SVG+CSS, offline. */
(function(){
var A={};

/* 1. Packet flow across a routed path (TCP/IP) */
A.packet={t:'Live packet flow — host to server across two routers',d:
'<svg viewBox="0 0 640 170" class="a3d">'
+'<defs><marker id="ar" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0 0l6 3-6 3z" fill="#5f84a6"/></marker></defs>'
+'<g stroke="#214f6e" stroke-width="3" marker-end="url(#ar)">'
+'<line x1="95" y1="85" x2="220" y2="85"/><line x1="272" y1="85" x2="370" y2="85"/><line x1="422" y1="85" x2="550" y2="85"/></g>'
+node(60,85,'HOST','#0f3755','10.10.10.21')+rtr(245,85,'R1')+rtr(395,85,'R2')+node(585,85,'SERVER','#0f8e58','10.10.30.12')
+'<circle class="pk pk1" r="7" fill="#f09013"/><circle class="pk pk2" r="7" fill="#13b06e"/>'
+'<text x="320" y="150" text-anchor="middle" fill="#8fb0cf" font-size="12">Each hop forwards the packet one step closer — routers switch on the destination network.</text>'
+'</svg>'};

/* 2. TCP three-way handshake */
A.handshake={t:'TCP three-way handshake — SYN / SYN-ACK / ACK',d:
'<svg viewBox="0 0 560 220">'
+col(110,'CLIENT','#0f3755')+col(450,'SERVER','#0f8e58')
+'<line x1="110" y1="55" x2="110" y2="205" stroke="#214f6e" stroke-dasharray="3 4"/>'
+'<line x1="450" y1="55" x2="450" y2="205" stroke="#214f6e" stroke-dasharray="3 4"/>'
+arrow('h1',110,80,450,110,'SYN','#f09013',0)
+arrow('h2',450,120,110,150,'SYN-ACK','#2f9ad6',1)
+arrow('h3',110,160,450,190,'ACK','#13b06e',2)
+'<text x="280" y="216" text-anchor="middle" fill="#8fe3b2" font-size="12" class="fade" style="animation-delay:2.4s">▶ connection established</text>'
+'</svg>'};

/* 3. Port scan */
A.scan={t:'Port scan — probing which ports answer',d:
'<svg viewBox="0 0 560 210">'
+node(70,105,'SCANNER','#6a1f2b','attacker')
+'<g font-size="12" fill="#cfe0f3">'
+port(430,45,'22','open')+port(430,85,'80','open')+port(430,125,'443','open')+port(430,165,'3306','closed')
+'</g>'
+'<circle class="probe p1" r="5" fill="#f09013"/><circle class="probe p2" r="5" fill="#f09013"/>'
+'<circle class="probe p3" r="5" fill="#f09013"/><circle class="probe p4" r="5" fill="#e4546a"/>'
+'<text x="280" y="200" text-anchor="middle" fill="#8fb0cf" font-size="12">Open ports reply; a closed port refuses. Few replies + many probes = a scan signature.</text>'
+'</svg>'};

/* 4. C2 beacon on a timeline */
A.beacon={t:'C2 beacon — a quiet callback on a timer',d:
'<svg viewBox="0 0 600 180">'
+node(70,70,'WS01','#0f3755','10.10.10.21')+node(530,70,'C2','#6a1f2b','203.0.113.9:4444')
+'<line x1="140" y1="70" x2="455" y2="70" stroke="#214f6e" stroke-width="2"/>'
+'<circle class="beat b1" r="6" fill="#e4546a"/><circle class="beat b2" r="6" fill="#e4546a"/><circle class="beat b3" r="6" fill="#e4546a"/>'
+'<g font-size="11" fill="#5f84a6">'
+'<line x1="90" y1="120" x2="510" y2="120" stroke="#214f6e"/>'
+tick(130,'0s')+tick(230,'60s')+tick(330,'120s')+tick(430,'180s')
+'</g>'
+'<text x="300" y="160" text-anchor="middle" fill="#8fb0cf" font-size="12">Small, regular, outbound to a new IP — timing is the tell.</text>'
+'</svg>'};

/* 5. Live network monitor */
A.monitor={t:'Live network monitor — traffic across the segments',d:
'<svg viewBox="0 0 600 210">'
+'<rect x="20" y="20" width="560" height="170" rx="10" fill="#061d30" stroke="#164869"/>'
+'<text x="40" y="45" fill="#8fe3b2" font-size="12">● LIVE  tg-monitor</text>'
+lane(70,'USER')+lane(100,'DMZ')+lane(130,'SERVER')+lane(160,'CORE')
+'<g>'
+flow('f1',70)+flow('f2',100)+flow('f3',130)+flow('f4',160)+flow('f5',100)+flow('f6',130)
+'</g>'
+bars()
+'</svg>'};

/* 6. ARP spoofing / MITM */
A.arp={t:'ARP spoofing — attacker becomes the man-in-the-middle',d:
'<svg viewBox="0 0 560 210">'
+node(70,60,'VICTIM','#0f3755')+node(470,60,'GATEWAY','#0f8e58')+node(270,165,'ATTACKER','#6a1f2b')
+'<line x1="130" y1="60" x2="410" y2="60" stroke="#214f6e" stroke-width="2" stroke-dasharray="4 4"/>'
+'<path class="mit m1" d="M110 75 Q190 150 250 158" fill="none" stroke="#e4546a" stroke-width="2.5"/>'
+'<path class="mit m2" d="M290 158 Q360 150 450 78" fill="none" stroke="#e4546a" stroke-width="2.5"/>'
+'<circle class="arpk" r="6" fill="#f09013"/>'
+'<text x="280" y="200" text-anchor="middle" fill="#8fb0cf" font-size="12">Forged ARP replies reroute the victim&#8217;s traffic through the attacker. Fix: Dynamic ARP Inspection.</text>'
+'</svg>'};

/* 7. VLAN trunk tagging */
A.trunk={t:'802.1Q trunk — tagged frames between switches',d:
'<svg viewBox="0 0 600 190">'
+sw(80,95,'SW-A')+sw(520,95,'SW-B')
+'<line x1="150" y1="95" x2="450" y2="95" stroke="#214f6e" stroke-width="4"/>'
+'<text x="300" y="80" text-anchor="middle" fill="#8fb0cf" font-size="11">TRUNK — allowed VLAN 10,20 · native 999</text>'
+'<rect class="frm fr1" width="34" height="18" rx="3" fill="#f09013"/><rect class="frm fr2" width="34" height="18" rx="3" fill="#2f9ad6"/>'
+'<text x="300" y="150" text-anchor="middle" fill="#8fe3b2" font-size="12">VLAN 10</text>'
+'<text x="300" y="168" text-anchor="middle" fill="#7bbbe8" font-size="12">VLAN 20 — each frame keeps its tag, so the far side sorts it right.</text>'
+'</svg>'};

/* 8. Segmentation blocks lateral movement */
A.segment={t:'Segmentation — a boundary stops east-west movement',d:
'<svg viewBox="0 0 600 200">'
+zone(40,'USER','#0f3755')+zone(330,'SERVER','#0f8e58')
+'<line x1="300" y1="30" x2="300" y2="175" stroke="#f09013" stroke-width="3" stroke-dasharray="6 5"/>'
+'<text x="300" y="22" text-anchor="middle" fill="#f09013" font-size="11">FIREWALL</text>'
+'<path class="lat" d="M120 100 H288" fill="none" stroke="#e4546a" stroke-width="3" marker-end="url(#ar2)"/>'
+'<defs><marker id="ar2" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto"><path d="M0 0l6 3-6 3z" fill="#e4546a"/></marker></defs>'
+'<text class="xmark" x="300" y="105" text-anchor="middle" fill="#e4546a" font-size="26" font-weight="800">&#10007;</text>'
+'<text x="300" y="192" text-anchor="middle" fill="#8fb0cf" font-size="12">A foothold in USER cannot reach SERVER — the drop is logged. That is containment.</text>'
+'</svg>'};

/* 9. MPLS label switching */
A.mpls={t:'MPLS — switch by label along the LSP',d:
'<svg viewBox="0 0 640 170">'
+rtr(70,80,'PE1')+rtr(250,80,'P')+rtr(430,80,'P')+rtr(600,80,'PE2')
+'<g stroke="#214f6e" stroke-width="3"><line x1="110" y1="80" x2="215" y2="80"/><line x1="285" y1="80" x2="395" y2="80"/><line x1="465" y1="80" x2="565" y2="80"/></g>'
+'<rect class="lbl" width="52" height="22" rx="4" fill="#054470" stroke="#f09013"/>'
+'<text class="lblt" y="0" fill="#f09013" font-size="12" font-weight="700" text-anchor="middle"></text>'
+'<text x="320" y="150" text-anchor="middle" fill="#8fb0cf" font-size="12">Push → swap → swap → pop. The core switches on the label, never a routing lookup.</text>'
+'</svg>'};

/* 10. Device planes */
A.planes={t:'Three planes of a router/switch',d:
'<svg viewBox="0 0 560 200">'
+plane(30,'MANAGEMENT','SSH · AAA · config','#6a1f2b')
+plane(85,'CONTROL','OSPF · BGP · STP','#8a5a12')
+plane(140,'DATA','forwarding packets','#0f8e58')
+'<circle class="pl p1" r="5" fill="#f09013"/><circle class="pl p2" r="5" fill="#2f9ad6"/><circle class="pl p3" r="5" fill="#13b06e"/>'
+'</svg>'};

/* 11. CIA triad */
A.cia={t:'The CIA triad',d:
'<svg viewBox="0 0 400 220">'
+'<polygon points="200,30 350,185 50,185" fill="none" stroke="#214f6e" stroke-width="2"/>'
+'<circle class="cnode c1" cx="200" cy="30" r="22" fill="#054470"/><text x="200" y="35" text-anchor="middle" fill="#f09013" font-weight="800" font-size="16">C</text>'
+'<circle class="cnode c2" cx="350" cy="185" r="22" fill="#054470"/><text x="350" y="190" text-anchor="middle" fill="#13b06e" font-weight="800" font-size="16">I</text>'
+'<circle class="cnode c3" cx="50" cy="185" r="22" fill="#054470"/><text x="50" y="190" text-anchor="middle" fill="#2f9ad6" font-weight="800" font-size="16">A</text>'
+'<text x="200" y="12" text-anchor="middle" fill="#cfe0f3" font-size="11">Confidentiality</text>'
+'<text x="350" y="212" text-anchor="middle" fill="#cfe0f3" font-size="11">Integrity</text>'
+'<text x="50" y="212" text-anchor="middle" fill="#cfe0f3" font-size="11">Availability</text>'
+'</svg>'};

/* 13. Default-deny firewall */
A.firewall={t:'Default-deny firewall — allow what must, deny the rest',d:
'<svg viewBox="0 0 600 200">'
+node(70,70,'CLIENT','#0f3755')
+'<rect x="255" y="28" width="90" height="150" rx="8" fill="#0a2c45" stroke="#f09013" stroke-width="2"/>'
+'<text x="300" y="22" text-anchor="middle" fill="#f09013" font-size="11" font-weight="700">FIREWALL</text>'
+'<text x="300" y="60" text-anchor="middle" fill="#8fe3b2" font-size="11">✓ :443 ALLOW</text>'
+'<text x="300" y="110" text-anchor="middle" fill="#ff9aa6" font-size="11">✗ :23 DENY</text>'
+'<text x="300" y="150" text-anchor="middle" fill="#8fb0cf" font-size="10">default-deny</text>'
+node(530,70,'SERVER','#0f8e58')
+'<circle class="fwp fwp1" r="6" fill="#13b06e"/>'
+'<circle class="fwp fwp2" r="6" fill="#e4546a"/>'
+'<text x="300" y="194" text-anchor="middle" fill="#8fb0cf" font-size="12">Rules match top-down, first match wins — anything not allowed is dropped and logged.</text>'
+'</svg>'};

/* 14. Load balancer distributing to backends */
A.lb={t:'Load balancer — spread load, drop the unhealthy backend',d:
'<svg viewBox="0 0 600 220">'
+node(60,105,'CLIENT','#0f3755')
+'<rect x="230" y="82" width="90" height="46" rx="9" fill="#0a2c45" stroke="#2f9ad6" stroke-width="2"/><text x="275" y="110" text-anchor="middle" fill="#7bbbe8" font-size="12" font-weight="700">LB / ADC</text>'
+'<g stroke="#214f6e" stroke-width="2"><line x1="130" y1="105" x2="228" y2="105"/><line x1="320" y1="100" x2="470" y2="45"/><line x1="320" y1="105" x2="470" y2="105"/><line x1="320" y1="110" x2="470" y2="165"/></g>'
+node(515,45,'web1','#0f8e58')+node(515,105,'web2','#6a1f2b','DOWN')+node(515,165,'web3','#0f8e58')
+'<circle class="lbp lbp1" r="6" fill="#f09013"/><circle class="lbp lbp3" r="6" fill="#f09013"/>'
+'<text x="300" y="208" text-anchor="middle" fill="#8fb0cf" font-size="12">Health checks pull web2 out of rotation; traffic round-robins across the healthy backends.</text>'
+'</svg>'};

/* 15. WAF inspecting HTTP */
A.waf={t:'WAF — inspect the HTTP request, block the attack',d:
'<svg viewBox="0 0 600 210">'
+node(60,90,'CLIENT','#0f3755')
+'<rect x="245" y="50" width="100" height="90" rx="9" fill="#0a2c45" stroke="#f09013" stroke-width="2"/><text x="295" y="44" text-anchor="middle" fill="#f09013" font-size="11" font-weight="700">WAF (CRS)</text>'
+'<text x="295" y="85" text-anchor="middle" fill="#8fe3b2" font-size="10">GET / → 200</text>'
+'<text x="295" y="110" text-anchor="middle" fill="#ff9aa6" font-size="10">?id=1 OR 1=1</text>'
+'<text x="295" y="124" text-anchor="middle" fill="#ff9aa6" font-size="10">→ 403</text>'
+node(520,90,'APP','#0f8e58')
+'<circle class="wafp wafok" r="6" fill="#13b06e"/><circle class="wafp wafbad" r="6" fill="#e4546a"/>'
+'<text x="300" y="196" text-anchor="middle" fill="#8fb0cf" font-size="12">Layer-7 inspection reads the URL, headers and body; injection and XSS score over threshold → blocked.</text>'
+'</svg>'};

/* 16. Web server request path */
A.webserver={t:'The request path — browser to server and back',d:
'<svg viewBox="0 0 640 180">'
+node(60,80,'BROWSER','#0f3755')+rtr(245,80,'DNS')+node(430,80,'SERVER','#0f8e58',':443')
+'<g stroke="#214f6e" stroke-width="2"><line x1="110" y1="80" x2="218" y2="80"/><line x1="272" y1="80" x2="400" y2="80"/></g>'
+'<circle class="webp webreq" r="6" fill="#f09013"/><circle class="webp webres" r="6" fill="#13b06e"/>'
+'<text x="150" y="60" text-anchor="middle" fill="#8fb0cf" font-size="10">name → IP</text>'
+'<text x="350" y="60" text-anchor="middle" fill="#8fb0cf" font-size="10">GET / (TLS)</text>'
+'<text x="320" y="150" text-anchor="middle" fill="#8fb0cf" font-size="12">Browser resolves the name, connects on 443, requests the page; the server returns HTML over TLS.</text>'
+'</svg>'};

/* fallback */
A.shield={t:'Defence in depth',d:
'<svg viewBox="0 0 300 200"><path class="sh" d="M150 25 L245 60 V110 C245 160 205 185 150 200 C95 185 55 160 55 110 V60 Z" fill="#054470" stroke="#f09013" stroke-width="3"/>'
+'<text x="150" y="125" text-anchor="middle" fill="#f09013" font-weight="800" font-size="40">TG</text></svg>'};

/* ---- builder helpers (return SVG fragments) ---- */
function node(x,y,label,fill,sub){var s='<g><rect x="'+(x-32)+'" y="'+(y-26)+'" width="64" height="52" rx="8" fill="'+fill+'" stroke="#164869"/>'
 +'<text x="'+x+'" y="'+(y+2)+'" text-anchor="middle" fill="#eaf2fb" font-size="11" font-weight="700">'+label+'</text>';
 if(sub)s+='<text x="'+x+'" y="'+(y+40)+'" text-anchor="middle" fill="#5f84a6" font-size="10">'+sub+'</text>';return s+'</g>';}
function rtr(x,y,label){return '<g><circle cx="'+x+'" cy="'+y+'" r="26" fill="#0a2c45" stroke="#2f9ad6" stroke-width="2"/>'
 +'<text x="'+x+'" y="'+(y+4)+'" text-anchor="middle" fill="#7bbbe8" font-size="12" font-weight="700">'+label+'</text></g>';}
function col(x,label,fill){return '<g><rect x="'+(x-55)+'" y="25" width="110" height="26" rx="6" fill="'+fill+'" stroke="#164869"/>'
 +'<text x="'+x+'" y="43" text-anchor="middle" fill="#eaf2fb" font-size="12" font-weight="700">'+label+'</text></g>';}
function arrow(cls,x1,y1,x2,y2,label,color,i){var mx=(x1+x2)/2;return '<g class="hs '+cls+'" style="animation-delay:'+(i*0.8)+'s">'
 +'<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="'+color+'" stroke-width="2.5" marker-end="url(#ar)"/>'
 +'<text x="'+mx+'" y="'+((y1+y2)/2-6)+'" text-anchor="middle" fill="'+color+'" font-size="12" font-weight="700">'+label+'</text></g>';}
function port(x,y,p,st){var col=st==='open'?'#13b06e':'#e4546a';
 return '<g><rect x="'+x+'" y="'+(y-14)+'" width="90" height="26" rx="5" fill="#0a2c45" stroke="'+col+'"/>'
 +'<text x="'+(x+14)+'" y="'+(y+4)+'" fill="#cfe0f3">:'+p+'</text>'
 +'<text x="'+(x+50)+'" y="'+(y+4)+'" fill="'+col+'" font-size="10">'+st+'</text></g>';}
function tick(x,l){return '<g><line x1="'+x+'" y1="115" x2="'+x+'" y2="125" stroke="#5f84a6"/><text x="'+x+'" y="140" text-anchor="middle">'+l+'</text></g>';}
function lane(y,l){return '<g><text x="40" y="'+(y+4)+'" fill="#5f84a6" font-size="10">'+l+'</text>'
 +'<line x1="95" y1="'+y+'" x2="560" y2="'+y+'" stroke="#0f3755" stroke-width="10" stroke-linecap="round"/></g>';}
function flow(cls,y){return '<circle class="mon '+cls+'" cy="'+y+'" r="5" fill="#2f9ad6" style="--ly:'+y+'px"/>';}
function bars(){var s='<g>';for(var i=0;i<16;i++){s+='<rect class="bar bar'+(i%6)+'" x="'+(60+i*31)+'" width="20" rx="2" fill="#13b06e" style="animation-delay:'+(i*0.12)+'s"/>';}return s+'</g>';}
function sw(x,y,l){return '<g><rect x="'+(x-50)+'" y="'+(y-28)+'" width="100" height="56" rx="8" fill="#0a2c45" stroke="#2f9ad6"/>'
 +'<text x="'+x+'" y="'+(y+4)+'" text-anchor="middle" fill="#7bbbe8" font-size="12" font-weight="700">'+l+'</text></g>';}
function zone(x,l,fill){return '<g><rect x="'+x+'" y="40" width="220" height="130" rx="10" fill="'+fill+'" opacity="0.25" stroke="#164869"/>'
 +'<text x="'+(x+110)+'" y="60" text-anchor="middle" fill="#cfe0f3" font-size="12" font-weight="700">'+l+' zone</text>'
 +'<circle cx="'+(x+110)+'" cy="110" r="16" fill="#0a2c45" stroke="#2f9ad6"/></g>';}
function plane(y,l,sub,fill){return '<g><rect x="60" y="'+y+'" width="440" height="40" rx="8" fill="'+fill+'" opacity="0.4" stroke="#164869"/>'
 +'<text x="80" y="'+(y+18)+'" fill="#eaf2fb" font-size="12" font-weight="700">'+l+'</text>'
 +'<text x="80" y="'+(y+33)+'" fill="#8fb0cf" font-size="10">'+sub+'</text></g>';}

/* ---- concept icon diagrams (distinct per task) ---- */
function ic(t,b){return {t:t,d:'<svg viewBox="0 0 220 120" class="dico">'+b+'</svg>'};}
var CX=110,CY=56;
A.lock=ic('Access control — lock it down','<g class="dpulse"><rect x="82" y="56" width="56" height="42" rx="6" fill="#054470" stroke="#f09013" stroke-width="2.5"/><path d="M92 56 v-12 a18 18 0 0 1 36 0 v12" fill="none" stroke="#f09013" stroke-width="3.5"/><circle cx="110" cy="76" r="5" fill="#f09013"/><rect x="108" y="78" width="4" height="12" fill="#f09013"/></g><text x="110" y="114" text-anchor="middle" fill="#8fb0cf" font-size="11">least privilege · lock the door</text>');
A.key=ic('Keys & credentials','<g class="dpulse"><circle cx="78" cy="58" r="18" fill="none" stroke="#f09013" stroke-width="4"/><circle cx="78" cy="58" r="6" fill="#0a2c45" stroke="#f09013" stroke-width="3"/><rect x="94" y="54" width="54" height="8" rx="2" fill="#f09013"/><rect x="132" y="62" width="8" height="12" fill="#f09013"/><rect x="118" y="62" width="8" height="10" fill="#f09013"/></g><text x="110" y="112" text-anchor="middle" fill="#8fb0cf" font-size="11">secrets open doors — protect them</text>');
A.hash=ic('Hashing — one-way fingerprint','<g class="dpulse"><text x="58" y="72" fill="#f09013" font-size="46" font-weight="800" font-family="monospace">#</text></g><text x="150" y="50" fill="#13b06e" font-size="12" font-family="monospace">7b3f…</text><text x="150" y="68" fill="#13b06e" font-size="12" font-family="monospace">a19c</text><text x="110" y="112" text-anchor="middle" fill="#8fb0cf" font-size="11">same in → same out · one-way</text>');
A.warning=ic('Risk & threats','<g class="dpulse"><path d="M110 28 L150 96 H70 Z" fill="none" stroke="#f09013" stroke-width="3" stroke-linejoin="round"/><rect x="106" y="52" width="8" height="26" rx="2" fill="#f09013"/><circle cx="110" cy="86" r="4" fill="#f09013"/></g><text x="110" y="114" text-anchor="middle" fill="#8fb0cf" font-size="11">risk = likelihood × impact</text>');
A.layers=ic('Defence in depth','<g class="dpulse"><rect x="64" y="34" width="92" height="16" rx="4" fill="#054470" stroke="#2f9ad6"/><rect x="58" y="54" width="104" height="16" rx="4" fill="#0a2c45" stroke="#f09013"/><rect x="52" y="74" width="116" height="16" rx="4" fill="#0f3d2b" stroke="#13b06e"/></g><text x="110" y="112" text-anchor="middle" fill="#8fb0cf" font-size="11">layer the controls</text>');
A.identity=ic('Identity & accounts','<g class="dpulse"><circle cx="110" cy="48" r="16" fill="#054470" stroke="#2f9ad6" stroke-width="2.5"/><path d="M82 92 a28 24 0 0 1 56 0" fill="#0a2c45" stroke="#2f9ad6" stroke-width="2.5"/></g><text x="110" y="112" text-anchor="middle" fill="#8fb0cf" font-size="11">who are you — prove it</text>');
A.gear=ic('Process & automation','<g class="dpulse" transform="translate(110 58)"><circle r="20" fill="none" stroke="#f09013" stroke-width="4"/><circle r="7" fill="#0a2c45" stroke="#f09013" stroke-width="3"/><g fill="#f09013"><rect x="-4" y="-30" width="8" height="10" rx="2"/><rect x="-4" y="20" width="8" height="10" rx="2"/><rect x="-30" y="-4" width="10" height="8" rx="2"/><rect x="20" y="-4" width="10" height="8" rx="2"/></g></g><text x="110" y="112" text-anchor="middle" fill="#8fb0cf" font-size="11">repeatable · consistent</text>');
A.eye=ic('Visibility & monitoring','<g class="dpulse"><path d="M60 58 Q110 24 160 58 Q110 92 60 58 Z" fill="#0a2c45" stroke="#2f9ad6" stroke-width="2.5"/><circle cx="110" cy="58" r="12" fill="#054470" stroke="#13b06e" stroke-width="2.5"/><circle cx="110" cy="58" r="4" fill="#13b06e"/></g><text x="110" y="112" text-anchor="middle" fill="#8fb0cf" font-size="11">you can\'t stop what you can\'t see</text>');
A.target=ic('Targeting & coverage','<g class="dpulse"><circle cx="110" cy="56" r="26" fill="none" stroke="#2f9ad6" stroke-width="2.5"/><circle cx="110" cy="56" r="15" fill="none" stroke="#2f9ad6" stroke-width="2"/><circle cx="110" cy="56" r="5" fill="#f09013"/></g><text x="110" y="112" text-anchor="middle" fill="#8fb0cf" font-size="11">know what matters most</text>');
A.bug=ic('Malware & exploits','<g class="dpulse"><ellipse cx="110" cy="58" rx="16" ry="20" fill="#6a1f2b" stroke="#e4546a" stroke-width="2.5"/><line x1="110" y1="40" x2="110" y2="76" stroke="#e4546a" stroke-width="2"/><g stroke="#e4546a" stroke-width="2.5" stroke-linecap="round"><line x1="94" y1="48" x2="80" y2="40"/><line x1="94" y1="58" x2="78" y2="58"/><line x1="94" y1="68" x2="80" y2="76"/><line x1="126" y1="48" x2="140" y2="40"/><line x1="126" y1="58" x2="142" y2="58"/><line x1="126" y1="68" x2="140" y2="76"/></g></g><text x="110" y="112" text-anchor="middle" fill="#8fb0cf" font-size="11">catch it by behaviour</text>');
A.alert=ic('Alerts & notification','<g class="dpulse"><path d="M110 30 a20 20 0 0 1 20 20 v18 l8 10 H82 l8-10 V50 a20 20 0 0 1 20-20 Z" fill="#0a2c45" stroke="#f09013" stroke-width="2.5"/><path d="M102 82 a8 8 0 0 0 16 0" fill="none" stroke="#f09013" stroke-width="2.5"/></g><text x="110" y="112" text-anchor="middle" fill="#8fb0cf" font-size="11">fewer, better alerts</text>');
A.magnifier=ic('Hunt & investigate','<g class="dpulse"><circle cx="98" cy="50" r="22" fill="none" stroke="#2f9ad6" stroke-width="4"/><line x1="114" y1="66" x2="138" y2="90" stroke="#2f9ad6" stroke-width="5" stroke-linecap="round"/><circle cx="98" cy="50" r="8" fill="#0f3d2b" stroke="#13b06e" stroke-width="2"/></g><text x="110" y="112" text-anchor="middle" fill="#8fb0cf" font-size="11">go looking — assume breach</text>');
A.document=ic('Reports & evidence','<g class="dpulse"><rect x="80" y="30" width="60" height="70" rx="4" fill="#0a2c45" stroke="#2f9ad6" stroke-width="2.5"/><g stroke="#8fb0cf" stroke-width="2.5" stroke-linecap="round"><line x1="90" y1="46" x2="130" y2="46"/><line x1="90" y1="56" x2="130" y2="56"/><line x1="90" y1="66" x2="130" y2="66"/><line x1="90" y1="76" x2="116" y2="76"/></g></g><text x="110" y="112" text-anchor="middle" fill="#8fb0cf" font-size="11">a defensible write-up</text>');
A.clock=ic('Timeline & timing','<g class="dpulse"><circle cx="110" cy="56" r="26" fill="#0a2c45" stroke="#2f9ad6" stroke-width="2.5"/><line x1="110" y1="56" x2="110" y2="40" stroke="#f09013" stroke-width="3" stroke-linecap="round"/><line x1="110" y1="56" x2="124" y2="62" stroke="#f09013" stroke-width="3" stroke-linecap="round"/><circle cx="110" cy="56" r="3" fill="#f09013"/></g><text x="110" y="112" text-anchor="middle" fill="#8fb0cf" font-size="11">when it happened matters</text>');
A.funnel=ic('Filter & prioritise','<g class="dpulse"><path d="M70 36 H150 L122 70 V92 L98 100 V70 Z" fill="#0a2c45" stroke="#f09013" stroke-width="2.5"/></g><circle class="dflow f1" cx="110" cy="40" r="4" fill="#13b06e"/><circle class="dflow f2" cx="110" cy="40" r="4" fill="#13b06e"/><text x="110" y="114" text-anchor="middle" fill="#8fb0cf" font-size="11">many in → few out</text>');
A.chain=ic('Chain of custody','<g class="dpulse" fill="none" stroke="#f09013" stroke-width="4"><rect x="72" y="46" width="34" height="22" rx="11"/><rect x="100" y="46" width="34" height="22" rx="11"/><rect x="128" y="46" width="34" height="22" rx="11"/></g><text x="110" y="112" text-anchor="middle" fill="#8fb0cf" font-size="11">unbroken, signed, provable</text>');
A.database=ic('Storage & data','<g class="dpulse"><ellipse cx="110" cy="38" rx="30" ry="10" fill="#054470" stroke="#2f9ad6" stroke-width="2.5"/><path d="M80 38 v38 a30 10 0 0 0 60 0 V38" fill="#0a2c45" stroke="#2f9ad6" stroke-width="2.5"/><path d="M80 57 a30 10 0 0 0 60 0" fill="none" stroke="#2f9ad6" stroke-width="2"/></g><text x="110" y="112" text-anchor="middle" fill="#8fb0cf" font-size="11">protect the data at rest</text>');
A.ram=ic('Memory (volatile)','<g class="dpulse"><rect x="66" y="42" width="88" height="34" rx="3" fill="#0a2c45" stroke="#13b06e" stroke-width="2.5"/><g fill="#13b06e"><rect x="74" y="48" width="12" height="18"/><rect x="92" y="48" width="12" height="18"/><rect x="110" y="48" width="12" height="18"/><rect x="128" y="48" width="12" height="18"/></g><g fill="#0f8e58"><rect x="76" y="76" width="6" height="6"/><rect x="138" y="76" width="6" height="6"/></g></g><text x="110" y="112" text-anchor="middle" fill="#8fb0cf" font-size="11">gone at power-off — capture first</text>');
A.cloud=ic('Cloud & virtual','<g class="dpulse"><path d="M80 78 a18 18 0 0 1 2 -36 a24 24 0 0 1 46 6 a16 16 0 0 1 2 30 Z" fill="#0a2c45" stroke="#2f9ad6" stroke-width="2.5"/></g><text x="110" y="112" text-anchor="middle" fill="#8fb0cf" font-size="11">shared, elastic, isolated</text>');
A.globe=ic('Intelligence & adversaries','<g class="dpulse"><circle cx="110" cy="56" r="26" fill="#0a2c45" stroke="#2f9ad6" stroke-width="2.5"/><path d="M84 56 h52 M110 30 v52 M90 38 q20 18 0 36 M130 38 q-20 18 0 36" fill="none" stroke="#2f9ad6" stroke-width="1.6"/><circle cx="124" cy="44" r="3" fill="#f09013"/></g><text x="110" y="112" text-anchor="middle" fill="#8fb0cf" font-size="11">know the enemy</text>');
A.binary=ic('Data & encoding','<g class="dpulse" fill="#13b06e" font-family="monospace" font-size="16" font-weight="700"><text x="74" y="46">0 1 1 0</text><text x="74" y="66">1 0 1 1</text><text x="74" y="86">0 1 0 0</text></g><text x="110" y="112" text-anchor="middle" fill="#8fb0cf" font-size="11">it\'s all bits underneath</text>');

/* public: build a figure with play/pause */
window.TGANIM=A;
window.animFigure=function(key){var a=A[key]||A.shield;
 return '<figure class="tganim" data-k="'+key+'">'
  +'<div class="tganim-bar"><span class="tganim-t">▦ '+a.t+'</span>'
  +'<button type="button" class="tganim-btn" onclick="animToggle(this)" aria-label="pause">⏸ Pause</button></div>'
  +'<div class="tganim-stage">'+a.d+'</div></figure>';};
window.animToggle=function(btn){var f=btn.closest('.tganim');var p=f.classList.toggle('paused');
 btn.innerHTML=p?'▶ Play':'⏸ Pause';};
})();
