(()=>{"use strict";
const q=new URLSearchParams(location.search);
const from=q.get("from")||"CAI",to=q.get("to")||"",departure=q.get("departure")||"",returnDate=q.get("returnDate")||"",trip=q.get("tripType")||"round",cabin=q.get("cabin")||"Economy",adults=Number((q.get("passengers")||"1").match(/\d+/)?.[0]||1);
const $=s=>document.querySelector(s),esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let selected=null;

$("#searchSummary").innerHTML='<span class="eyebrow">YOUR SEARCH</span><h1>'+esc(from)+' → '+esc(to)+'</h1><p>'+esc(departure)+(trip==="one"?" • One way":" • "+esc(returnDate)+" • Round trip")+" • "+adults+" passenger"+(adults===1?"":"s")+" • "+esc(cabin)+"</p>";

function openModal(){ $("#callModal").hidden=false; }
function closeModal(){ $("#callModal").hidden=true; }
document.querySelectorAll("[data-close]").forEach(x=>x.onclick=closeModal);
$("#openCall").onclick=()=>{selected=null;openModal()};

function setState(message,error=false){
  const el=$("#resultsState");
  el.textContent=message;
  el.classList.toggle("error-state",error);
}
function retry(){ run(); }

async function run(){
  $("#flightList").innerHTML="";
  $("#priceInsight").innerHTML="";
  setState("Searching live fares…");
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),20000);
  try{
    const r=await fetch("https://wjriwuagxkekofnxskzl.supabase.co/functions/v1/google-flights-search",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        departure_id:(from.match(/\b[A-Z]{3}\b/)||[])[0]||from,
        arrival_id:(to.match(/\b[A-Z]{3}\b/)||[])[0]||to,
        outbound_date:departure,
        return_date:returnDate,
        type:trip==="one"?"2":"1",
        travel_class:({Economy:"1","Premium Economy":"2",Business:"3",First:"4"})[cabin]||"1",
        adults
      }),
      signal:controller.signal
    });
    const d=await r.json().catch(()=>({}));
    if(!r.ok||d.error) throw new Error(d.error||"Live flight search failed.");
    const flights=[...(d.best_flights||[]),...(d.other_flights||[])];
    if(d.price_insights){
      const low=d.price_insights.lowest_price??d.price_insights.lowest_price_value??d.price_insights.lowestPrice;
      if(low!=null) $("#priceInsight").innerHTML='<div class="price-box"><span class="eyebrow">LIVE PRICE INSIGHT</span><strong>'+esc(Number(low).toLocaleString())+' '+esc(d.price_insights.currency||"EGP")+'</strong><small>Current lowest price returned by the live search.</small></div>';
    }
    if(d.google_flights_url) $("#googleFlightsBtn").hidden=false,$("#googleFlightsBtn").onclick=()=>location.href=d.google_flights_url;
    if(!flights.length){
      setState("No live fares were returned for this search. Try different dates or airports.");
      return;
    }
    setState("Live fares loaded. Prices can change until booking is confirmed.");
    $("#flightList").innerHTML=flights.slice(0,30).map((x,i)=>{
      const f=x.flights?.[0]||{}, dep=f.departure||{},arr=f.arrival||{};
      const dt=(dep.time||"").split(" ").pop(),at=(arr.time||"").split(" ").pop();
      const price=x.price!=null?Number(x.price).toLocaleString()+" "+(x.currency||"EGP"):"Price on request";
      return '<article class="flight-card"><div class="flight-airline">'+(x.airline_logo?'<img src="'+esc(x.airline_logo)+'" alt="">':'<div class="airline-logo">D</div>')+'<span>'+esc(f.airline||"Airline")+'</span></div><div class="flight-times"><strong>'+esc(dt)+'</strong><span class="flight-line"></span><strong>'+esc(at)+'</strong></div><div class="flight-meta">'+esc(f.flight_number||"")+" • "+(f.stops?esc(f.stops)+" stop(s)":"Direct")+'</div><div class="flight-price"><strong>'+esc(price)+'</strong><small>Live fare</small><button class="primary-btn choose" data-i="'+i+'">Request this fare</button></div></article>';
    }).join("");
    document.querySelectorAll(".choose").forEach(b=>b.onclick=()=>{selected=flights[Number(b.dataset.i)];openModal()});
  }catch(e){
    const message=e.name==="AbortError"?"The live search took too long.":"We couldn't retrieve live flight prices right now.";
    setState(message+" Please try again.",true);
    $("#flightList").innerHTML='<div class="search-error"><strong>'+esc(message)+'</strong><p>The search was stopped so you are never left waiting.</p><button class="primary-btn" id="retrySearch">Try again</button></div>';
    $("#retrySearch").onclick=retry;
  }finally{clearTimeout(timer);}
}

$("#callForm").onsubmit=e=>{
  e.preventDefault();
  const body=Object.fromEntries(new FormData(e.currentTarget).entries());
  body.trip=from+" → "+to; body.selected_flight=selected;
  localStorage.setItem("dudeCallRequest",JSON.stringify(body));
  $("#callStatus").textContent="Request received. A Dude travel advisor will contact you shortly.";
  e.currentTarget.reset();
};
run();
})();