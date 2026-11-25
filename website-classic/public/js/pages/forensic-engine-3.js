// Header scroll shadow
window.addEventListener('scroll',()=>{
  document.getElementById('header').style.boxShadow=window.scrollY>50?'0 4px 28px rgba(0,0,0,.45)':'';
});

/* ── HELPERS ──────────────────────────────── */
/* Everything shown from a lookup is escaped: it is either typed by the visitor or comes from a third-party API. */
function tgEsc(s){return String(s==null?'':s).replace(/[&<>"'`]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','`':'&#96;'}[c]));}
function lrow(k,v,green){
  return `<div class="lr"><span class="lk">${tgEsc(k)}:</span><span class="lv${green?' green':''}">${tgEsc(v)}</span></div>`;
}
function showLoading(id){
  const r=document.getElementById(id);
  r.style.display='block';
  r.innerHTML='<div style="text-align:center;padding:16px"><div class="loading"></div></div>';
  return r;
}
function showError(id,msg){
  const r=document.getElementById(id);
  r.style.display='block';
  r.innerHTML=`<span style="color:var(--red)">❌ ${tgEsc(msg)}</span>`;
}
function resultHead(txt){
  return `<div style="color:var(--pri);font-weight:700;margin-bottom:12px;padding-bottom:10px;border-bottom:1px solid var(--bdr)">${tgEsc(txt)}</div>`;
}

/* ── IP LOOKUP ────────────────────────────── */
async function lookupIP(){
  const ip=document.getElementById('ip-input').value.trim();
  if(!ip){alert('Please enter an IP address');return;}
  const isIPv4=/^(\d{1,3}\.){3}\d{1,3}$/.test(ip);
  const isIPv6=/^[0-9a-fA-F:]+$/.test(ip)&&ip.includes(':');
  if(!isIPv4&&!isIPv6){showError('ip-result','Please enter a valid IPv4 or IPv6 address.');return;}
  const r=showLoading('ip-result');

  const renderIpapi=(d)=>resultHead('✓ IP Intelligence Report')+
    lrow('IP Address',d.ip,true)+
    lrow('Version',d.version||(isIPv4?'IPv4':'IPv6'))+
    lrow('City',d.city||'N/A')+
    lrow('Region',d.region||'N/A')+
    lrow('Country',`${d.country_name||'N/A'}${d.country_code?' ('+d.country_code+')':''}`)+
    lrow('Continent',d.continent_code||'N/A')+
    lrow('Coordinates',(d.latitude!=null&&d.longitude!=null)?`${d.latitude}, ${d.longitude}`:'N/A')+
    lrow('Timezone',d.timezone||'N/A')+
    lrow('ISP / Org',d.org||'N/A')+
    lrow('ASN',d.asn||'N/A')+
    lrow('Postal Code',d.postal||'N/A')+
    `<div style="margin-top:14px;padding-top:12px;border-top:1px solid var(--bdr)">
      <a href="https://www.abuseipdb.com/check/${encodeURIComponent(d.ip)}" target="_blank" rel="noopener" style="color:var(--pri);font-size:12px;margin-right:14px">→ AbuseIPDB</a>
      <a href="https://www.shodan.io/host/${encodeURIComponent(d.ip)}" target="_blank" rel="noopener" style="color:var(--pri);font-size:12px;margin-right:14px">→ Shodan</a>
      <a href="https://www.virustotal.com/gui/ip-address/${encodeURIComponent(d.ip)}" target="_blank" rel="noopener" style="color:var(--pri);font-size:12px">→ VirusTotal</a>
    </div>`;

  // Primary: ipapi.co (CORS-enabled, reliable)
  try{
    const res=await fetch(`https://ipapi.co/${encodeURIComponent(ip)}/json/`);
    if(res.ok){
      const d=await res.json();
      if(d&&!d.error&&d.ip){r.innerHTML=renderIpapi(d);return;}
    }
  }catch(e){}

  // Fallback 1: ipwho.is
  try{
    const res=await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`);
    const d=await res.json();
    if(d&&d.success!==false&&d.ip){
      r.innerHTML=renderIpapi({
        ip:d.ip,version:d.type?d.type.toUpperCase():'',city:d.city,region:d.region,
        country_name:d.country,country_code:d.country_code,continent_code:d.continent_code,
        latitude:d.latitude,longitude:d.longitude,timezone:d.timezone?.id||d.timezone?.utc,
        org:d.connection?.isp||d.connection?.org,asn:d.connection?.asn?`AS${d.connection.asn}`:'',
        postal:d.postal
      });
      return;
    }
  }catch(e){}

  // Fallback 2: ip-api.com via JSONP-style proxy (allorigins)
  try{
    const url=`https://api.allorigins.win/get?url=${encodeURIComponent(`http://ip-api.com/json/${ip}?fields=status,message,query,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as`)}`;
    const res=await fetch(url);
    const wrap=await res.json();
    const d=JSON.parse(wrap.contents);
    if(d&&d.status==='success'){
      r.innerHTML=renderIpapi({
        ip:d.query,city:d.city,region:d.regionName,country_name:d.country,country_code:d.countryCode,
        latitude:d.lat,longitude:d.lon,timezone:d.timezone,org:d.isp||d.org,asn:d.as,postal:d.zip
      });
      return;
    }
  }catch(e){}

  showError('ip-result','Could not fetch IP intelligence. All lookup services may be temporarily unavailable or blocked by your network. Please retry shortly.');
}

/* ── PIN CODE LOOKUP — removed ─────────────── */


/* ── DOMAIN INTELLIGENCE ─────────────────── */
async function lookupDomain(){
  let domain=document.getElementById('domain-input').value.trim();
  domain=domain.replace(/^https?:\/\//,'').replace(/\/.*$/,'').toLowerCase().trim();
  if(!domain||domain.length<3){alert('Please enter a valid domain name');return;}
  const r=showLoading('domain-result');
  try{
    // Use ip-api.com which is more permissive for domain resolution
    const res=await fetch(`https://ipapi.co/${encodeURIComponent(domain)}/json/`);
    if(!res.ok)throw new Error('API error: '+res.status);
    const d=await res.json();
    if(d.error)throw new Error(d.reason||'Could not resolve domain');
    r.innerHTML=resultHead(`✓ Domain Intelligence: ${domain}`)+
      lrow('Domain',domain,true)+
      lrow('Resolved IP',d.ip||'N/A')+
      lrow('ISP / AS',d.org||'N/A')+
      lrow('Country',`${d.country_name||'N/A'} (${d.country_code||'N/A'})`)+
      lrow('City',d.city||'N/A')+
      lrow('Region',d.region||'N/A')+
      lrow('Timezone',d.timezone||'N/A')+
      `<div style="margin-top:12px;padding-top:10px;border-top:1px solid var(--bdr);display:flex;flex-wrap:wrap;gap:10px;">
        <a href="https://crt.sh/?q=%.${encodeURIComponent(domain)}" target="_blank" style="color:var(--pri);font-size:12px">→ crt.sh SSL</a>
        <a href="https://urlscan.io/search/#domain:${encodeURIComponent(domain)}" target="_blank" style="color:var(--pri);font-size:12px">→ URLScan</a>
        <a href="https://www.shodan.io/search?query=${encodeURIComponent(domain)}" target="_blank" style="color:var(--pri);font-size:12px">→ Shodan</a>
        <a href="https://securitytrails.com/domain/${encodeURIComponent(domain)}/dns" target="_blank" style="color:var(--pri);font-size:12px">→ SecurityTrails</a>
        <a href="https://search.censys.io/hosts/${encodeURIComponent(domain)}" target="_blank" style="color:var(--pri);font-size:12px">→ Censys</a>
      </div>`;
  }catch(e){
    // Graceful fallback with links only
    document.getElementById('domain-result').style.display='block';
    document.getElementById('domain-result').innerHTML=resultHead(`Domain: ${domain}`)+
      `<p style="color:var(--txt2);font-size:12px;margin-bottom:12px">Direct resolution unavailable. Use the links below:</p>`+
      `<div style="display:flex;flex-wrap:wrap;gap:10px;">
        <a href="https://crt.sh/?q=%.${encodeURIComponent(domain)}" target="_blank" style="color:var(--pri);font-size:12px">→ crt.sh SSL Certs</a>
        <a href="https://urlscan.io/search/#domain:${encodeURIComponent(domain)}" target="_blank" style="color:var(--pri);font-size:12px">→ URLScan.io</a>
        <a href="https://www.shodan.io/search?query=${encodeURIComponent(domain)}" target="_blank" style="color:var(--pri);font-size:12px">→ Shodan</a>
        <a href="https://securitytrails.com/domain/${encodeURIComponent(domain)}/dns" target="_blank" style="color:var(--pri);font-size:12px">→ SecurityTrails DNS</a>
        <a href="https://www.virustotal.com/gui/domain/${encodeURIComponent(domain)}" target="_blank" style="color:var(--pri);font-size:12px">→ VirusTotal</a>
        <a href="https://search.censys.io/hosts/${encodeURIComponent(domain)}" target="_blank" style="color:var(--pri);font-size:12px">→ Censys</a>
      </div>`;
  }
}

/* ── EMAIL BREACH CHECK ───────────────────── */
function checkBreach(){
  const email=document.getElementById('email-input').value.trim();
  if(!email||!email.includes('@')){alert('Please enter a valid email address');return;}
  const r=document.getElementById('email-result');
  r.style.display='block';
  r.innerHTML=resultHead(`🔍 Breach Check Links for: ${email}`)+
    `<p style="color:var(--txt2);font-size:12px;margin-bottom:12px">Click below to check across top breach databases (API key required for direct lookups):</p>`+
    `<div style="display:flex;flex-direction:column;gap:8px;">
      <a href="https://haveibeenpwned.com/account/${encodeURIComponent(encodeURIComponent(email))}" target="_blank" style="color:var(--pri)">→ Have I Been Pwned</a>
      <a href="https://www.dehashed.com/search?query=${encodeURIComponent(encodeURIComponent(email))}" target="_blank" style="color:var(--pri)">→ DeHashed (Dark Web)</a>
      <a href="https://breachdirectory.org/search/${encodeURIComponent(encodeURIComponent(email))}" target="_blank" style="color:var(--pri)">→ BreachDirectory.org</a>
      <a href="https://monitor.firefox.com" target="_blank" style="color:var(--pri)">→ Firefox Monitor</a>
      <a href="https://intelx.io/?s=${encodeURIComponent(encodeURIComponent(email))}" target="_blank" style="color:var(--pri)">→ Intelligence X</a>
    </div>`;
}

/* ── VEHICLE RC CHECK ─────────────────────── */
function lookupVehicle(){
  const plate=document.getElementById('vehicle-input').value.trim().toUpperCase().replace(/\s+/g,'');
  if(!plate){alert('Please enter a vehicle registration number');return;}
  const r=document.getElementById('vehicle-result');
  r.style.display='block';
  r.innerHTML=resultHead(`🚗 Vehicle Info: ${plate}`)+
    lrow('Plate Number',plate,true)+
    `<p style="color:var(--txt2);font-size:12px;margin-bottom:12px">Live RC data requires Parivahan portal authentication. Use these official links:</p>`+
    `<div style="display:flex;flex-direction:column;gap:8px;">
      <a href="https://vahan.parivahan.gov.in/nrservices/faces/user/searchstatus.xhtml" target="_blank" style="color:var(--pri)">→ Parivahan RC Status (Official)</a>
      <a href="https://parivahan.gov.in/rcdlstatus/?pur_cd=101" target="_blank" style="color:var(--pri)">→ RC / DL Status Check</a>
      <a href="https://echallan.parivahan.gov.in/index/accused-challan" target="_blank" style="color:var(--pri)">→ Check Pending Challans</a>
    </div>`;
}

/* ── PHONE LOOKUP ─────────────────────────── */
function lookupPhone(){
  const phone=document.getElementById('phone-input').value.trim();
  if(!phone){alert('Please enter a phone number');return;}
  const clean=phone.replace(/[^\d+]/g,'');
  const isIndian=clean.startsWith('+91')||(/^[6-9]\d{9}$/.test(clean));
  const r=document.getElementById('phone-result');
  r.style.display='block';
  r.innerHTML=resultHead(`📞 Phone Intelligence: ${phone}`)+
    lrow('Number',clean,true)+
    lrow('Format',isIndian?'Indian Mobile (IN)':'International / Other')+
    lrow('Digits',clean.replace('+','').length+' digit number')+
    `<div style="margin-top:12px;display:flex;flex-direction:column;gap:8px;">
      <a href="https://www.truecaller.com/search/in/${encodeURIComponent(clean.replace(/\D/g,''))}" target="_blank" style="color:var(--pri)">→ Truecaller Lookup</a>
      <a href="https://tafcop.sancharsaathi.gov.in/telecomUser/" target="_blank" style="color:var(--pri)">→ TAFCOP — SIM Check (Official)</a>
      <a href="https://sancharsaathi.gov.in/sfc/" target="_blank" style="color:var(--pri)">→ Report Fraud Number (Chakshu)</a>
      <a href="https://cybercrime.gov.in" target="_blank" style="color:var(--pri)">→ Cybercrime Portal</a>
    </div>`;
}

/* ── SSL CERT LOOKUP ──────────────────────── */
function lookupSSL(){
  let domain=document.getElementById('ssl-input').value.trim().replace(/^https?:\/\//,'').replace(/\/.*$/,'').toLowerCase();
  if(!domain){alert('Please enter a domain name');return;}
  const r=document.getElementById('ssl-result');
  r.style.display='block';
  r.innerHTML=resultHead(`🔐 SSL/TLS Intelligence: ${domain}`)+
    `<div style="display:flex;flex-direction:column;gap:8px;">
      <a href="https://crt.sh/?q=%.${encodeURIComponent(domain)}" target="_blank" style="color:var(--pri)">→ crt.sh — Certificate Transparency Log</a>
      <a href="https://www.ssllabs.com/ssltest/analyze.html?d=${encodeURIComponent(domain)}" target="_blank" style="color:var(--pri)">→ SSL Labs — Grade Test &amp; Analysis</a>
      <a href="https://securitytrails.com/domain/${encodeURIComponent(domain)}/dns" target="_blank" style="color:var(--pri)">→ SecurityTrails — DNS History</a>
      <a href="https://urlscan.io/search/#domain:${encodeURIComponent(domain)}" target="_blank" style="color:var(--pri)">→ URLScan.io — Site Scan</a>
      <a href="https://www.virustotal.com/gui/domain/${encodeURIComponent(domain)}" target="_blank" style="color:var(--pri)">→ VirusTotal — Domain Reputation</a>
    </div>`;
}

/* ── PRIVACY ANALYZER ─────────────────────── */
function checkPrivacy(){
  const q=document.getElementById('privacy-input').value.trim();
  if(!q){alert('Please enter an email, username, or domain');return;}
  const r=document.getElementById('privacy-result');
  r.style.display='block';
  r.innerHTML=resultHead(`🕵️ Privacy Exposure: ${q}`)+
    `<div style="display:flex;flex-direction:column;gap:8px;">
      <a href="https://privacy.net/analyzer/" target="_blank" style="color:var(--pri)">→ privacy.net — Full Privacy Scan</a>
      <a href="https://haveibeenpwned.com/account/${encodeURIComponent(encodeURIComponent(q))}" target="_blank" style="color:var(--pri)">→ Have I Been Pwned</a>
      <a href="https://www.dehashed.com/search?query=${encodeURIComponent(encodeURIComponent(q))}" target="_blank" style="color:var(--pri)">→ DeHashed — Dark Web Search</a>
      <a href="https://intelx.io/?s=${encodeURIComponent(encodeURIComponent(q))}" target="_blank" style="color:var(--pri)">→ Intelligence X</a>
      <a href="https://breachdirectory.org/search/${encodeURIComponent(encodeURIComponent(q))}" target="_blank" style="color:var(--pri)">→ BreachDirectory.org</a>
    </div>`;
}

/* ── ENTER KEY SUPPORT ────────────────────── */
document.querySelectorAll('.l-input').forEach(inp=>{
  inp.addEventListener('keydown',e=>{
    if(e.key==='Enter'){
      const btn=inp.closest('.lookup-card').querySelector('.btn-pri');
      if(btn)btn.click();
    }
  });
});
