(() => {
"use strict";
const CODES = ["AF", "AL", "DZ", "AS", "AD", "AO", "AI", "AQ", "AG", "AR", "AM", "AW", "AU", "AT", "AZ", "BS", "BH", "BD", "BB", "BY", "BE", "BZ", "BJ", "BM", "BT", "BO", "BQ", "BA", "BW", "BV", "BR", "IO", "BN", "BG", "BF", "BI", "CV", "KH", "CM", "CA", "KY", "CF", "TD", "CL", "CN", "CX", "CC", "CO", "KM", "CG", "CD", "CK", "CR", "CI", "HR", "CU", "CW", "CY", "CZ", "DK", "DJ", "DM", "DO", "EC", "EG", "SV", "GQ", "ER", "EE", "SZ", "ET", "FK", "FO", "FJ", "FI", "FR", "GF", "PF", "TF", "GA", "GM", "GE", "DE", "GH", "GI", "GR", "GL", "GD", "GP", "GU", "GT", "GG", "GN", "GW", "GY", "HT", "HM", "VA", "HN", "HK", "HU", "IS", "IN", "ID", "IR", "IQ", "IE", "IM", "IL", "IT", "JM", "JP", "JE", "JO", "KZ", "KE", "KI", "KP", "KR", "KW", "KG", "LA", "LV", "LB", "LS", "LR", "LY", "LI", "LT", "LU", "MO", "MG", "MW", "MY", "MV", "ML", "MT", "MH", "MQ", "MR", "MU", "YT", "MX", "FM", "MD", "MC", "MN", "ME", "MS", "MA", "MZ", "MM", "NA", "NR", "NP", "NL", "NC", "NZ", "NI", "NE", "NG", "NU", "NF", "MK", "MP", "NO", "OM", "PK", "PW", "PS", "PA", "PG", "PY", "PE", "PH", "PN", "PL", "PT", "PR", "QA", "RE", "RO", "RU", "RW", "BL", "SH", "KN", "LC", "MF", "PM", "VC", "WS", "SM", "ST", "SA", "SN", "RS", "SC", "SL", "SG", "SX", "SK", "SI", "SB", "SO", "ZA", "GS", "SS", "ES", "LK", "SD", "SR", "SJ", "SE", "CH", "SY", "TW", "TJ", "TZ", "TH", "TL", "TG", "TK", "TO", "TT", "TN", "TR", "TM", "TC", "TV", "UG", "UA", "AE", "GB", "US", "UM", "UY", "UZ", "VU", "VE", "VN", "VG", "VI", "WF", "EH", "YE", "ZM", "ZW"];
const AIRPORTS = {"EG": ["Cairo (CAI)", "Cairo"], "SA": ["Riyadh (RUH)", "Riyadh"], "AE": ["Dubai (DXB)", "Dubai"], "QA": ["Doha (DOH)", "Doha"], "KW": ["Kuwait City (KWI)", "Kuwait City"], "BH": ["Manama (BAH)", "Manama"], "OM": ["Muscat (MCT)", "Muscat"], "JO": ["Amman (AMM)", "Amman"], "MA": ["Casablanca (CMN)", "Casablanca"], "TN": ["Tunis (TUN)", "Tunis"], "DZ": ["Algiers (ALG)", "Algiers"], "TR": ["Istanbul (IST)", "Istanbul"], "GB": ["London (LHR)", "London"], "FR": ["Paris (CDG)", "Paris"], "DE": ["Frankfurt (FRA)", "Frankfurt"], "IT": ["Rome (FCO)", "Rome"], "ES": ["Madrid (MAD)", "Madrid"], "PT": ["Lisbon (LIS)", "Lisbon"], "NL": ["Amsterdam (AMS)", "Amsterdam"], "BE": ["Brussels (BRU)", "Brussels"], "CH": ["Zurich (ZRH)", "Zurich"], "AT": ["Vienna (VIE)", "Vienna"], "GR": ["Athens (ATH)", "Athens"], "CY": ["Larnaca (LCA)", "Larnaca"], "PL": ["Warsaw (WAW)", "Warsaw"], "CZ": ["Prague (PRG)", "Prague"], "HU": ["Budapest (BUD)", "Budapest"], "RO": ["Bucharest (OTP)", "Bucharest"], "BG": ["Sofia (SOF)", "Sofia"], "RS": ["Belgrade (BEG)", "Belgrade"], "HR": ["Zagreb (ZAG)", "Zagreb"], "RU": ["Moscow (SVO)", "Moscow"], "UA": ["Kyiv (KBP)", "Kyiv"], "KZ": ["Almaty (ALA)", "Almaty"], "UZ": ["Tashkent (TAS)", "Tashkent"], "IN": ["Delhi (DEL)", "Delhi"], "PK": ["Islamabad (ISB)", "Islamabad"], "BD": ["Dhaka (DAC)", "Dhaka"], "LK": ["Colombo (CMB)", "Colombo"], "NP": ["Kathmandu (KTM)", "Kathmandu"], "CN": ["Beijing (PEK)", "Beijing"], "JP": ["Tokyo (HND)", "Tokyo"], "KR": ["Seoul (ICN)", "Seoul"], "TH": ["Bangkok (BKK)", "Bangkok"], "MY": ["Kuala Lumpur (KUL)", "Kuala Lumpur"], "SG": ["Singapore (SIN)", "Singapore"], "ID": ["Jakarta (CGK)", "Jakarta"], "PH": ["Manila (MNL)", "Manila"], "VN": ["Ho Chi Minh City (SGN)", "Ho Chi Minh City"], "AU": ["Sydney (SYD)", "Sydney"], "NZ": ["Auckland (AKL)", "Auckland"], "US": ["New York (JFK)", "New York"], "CA": ["Toronto (YYZ)", "Toronto"], "MX": ["Mexico City (MEX)", "Mexico City"], "BR": ["Sao Paulo (GRU)", "Sao Paulo"], "AR": ["Buenos Aires (EZE)", "Buenos Aires"], "CL": ["Santiago (SCL)", "Santiago"], "CO": ["Bogota (BOG)", "Bogota"], "PE": ["Lima (LIM)", "Lima"], "CR": ["San Jose (SJO)", "San Jose"], "PA": ["Panama City (PTY)", "Panama City"], "DO": ["Santo Domingo (SDQ)", "Santo Domingo"], "JM": ["Kingston (KIN)", "Kingston"], "CU": ["Havana (HAV)", "Havana"], "ZA": ["Johannesburg (JNB)", "Johannesburg"], "NG": ["Lagos (LOS)", "Lagos"], "GH": ["Accra (ACC)", "Accra"], "KE": ["Nairobi (NBO)", "Nairobi"], "ET": ["Addis Ababa (ADD)", "Addis Ababa"], "TZ": ["Dar es Salaam (DAR)", "Dar es Salaam"], "UG": ["Entebbe (EBB)", "Entebbe"], "RW": ["Kigali (KGL)", "Kigali"], "SN": ["Dakar (DSS)", "Dakar"], "CI": ["Abidjan (ABJ)", "Abidjan"], "CM": ["Douala (DLA)", "Douala"], "MU": ["Mauritius (MRU)", "Mauritius"], "SC": ["Mahe (SEZ)", "Mahe"], "MV": ["Male (MLE)", "Male"], "FJ": ["Nadi (NAN)", "Nadi"], "IS": ["Reykjavik (KEF)", "Reykjavik"], "IE": ["Dublin (DUB)", "Dublin"], "DK": ["Copenhagen (CPH)", "Copenhagen"], "SE": ["Stockholm (ARN)", "Stockholm"], "NO": ["Oslo (OSL)", "Oslo"], "FI": ["Helsinki (HEL)", "Helsinki"]};
const names = new Intl.DisplayNames(["en"], {type:"region"});
const flag = code => [...code].map(c => String.fromCodePoint(c.charCodeAt(0)+127397)).join("");
const label = code => { try { return names.of(code) || code; } catch { return code; } };
function buildSelect(select, placeholder) {
  if (!select) return;
  select.innerHTML = '<option value="">'+placeholder+'</option>';
  CODES.map(code => ({code,name:label(code)})).sort((a,b)=>a.name.localeCompare(b.name)).forEach(({code,name})=>{
    const o=document.createElement("option"); o.value=code; o.textContent=flag(code)+" "+name; select.appendChild(o);
  });
}
function apply(selectId,inputId){
  const s=document.getElementById(selectId), i=document.getElementById(inputId); if(!s||!i)return;
  s.addEventListener("change",()=>{
    const code=s.value; if(!code)return;
    if(AIRPORTS[code]){i.value=AIRPORTS[code][0];i.placeholder="City or airport";}
    else {i.value="";i.placeholder=label(code)+" — type city or airport";}
    i.dataset.country=code; i.dispatchEvent(new Event("input",{bubbles:true}));
  });
  i.addEventListener("input",()=>{if(i.dataset.country && i.value!==AIRPORTS[i.dataset.country]?.[0]) s.value="";});
}
function init(){
  buildSelect(document.getElementById("fromCountry"),"Select departure country");
  buildSelect(document.getElementById("toCountry"),"Select destination country");
  const f=document.getElementById("fromCountry"); if(f)f.value="EG";
  const fi=document.getElementById("from"); if(fi)fi.dataset.country="EG";
  apply("fromCountry","from"); apply("toCountry","to");
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();