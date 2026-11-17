(function(){
const root=document.getElementById('albergo-demo');
const data=JSON.parse(root.querySelector('#datos-albergo').textContent);
const period=root.querySelector('#periodo-demo'),metric=root.querySelector('#ranking-demo');
period.innerHTML=['10','09','08','07','06','05'].map((m,i)=>'<option value="'+m+'">'+['Octubre','Septiembre','Agosto','Julio','Junio','Mayo'][i]+' 2026</option>').join('');
const money=n=>'$ '+Math.round(n).toLocaleString('es-AR');
const local=ms=>new Date(ms-3*3600000);
const days=['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
function aggregate(month){
const begin=Date.parse('2026-'+month+'-01T00:00:00-03:00');
const end=Date.parse((month==='12'?'2027-01':'2026-'+String(Number(month)+1).padStart(2,'0'))+'-01T00:00:00-03:00');
const rows=data.habitaciones.map(r=>({...r,ingresos:0,estadias:0,horas:0}));
const roomMap=Object.fromEntries(rows.map(r=>[r.id,r]));
const occupied=Array.from({length:7},()=>Array(6).fill(0));
const available=Array.from({length:7},()=>Array(6).fill(0));
for(let hour=begin;hour<end;hour+=3600000){const d=local(hour);available[(d.getUTCDay()+6)%7][Math.floor(d.getUTCHours()/4)]+=data.habitaciones.length;}
for(const stay of data.estadias){const start=Date.parse(stay.ingreso),finish=Date.parse(stay.egreso),room=roomMap[stay.habitacion];
if(start>=begin&&start<end){room.ingresos+=stay.importe;room.estadias++;}
const a=Math.max(begin,start),b=Math.min(end,finish);if(a>=b)continue;
room.horas+=(b-a)/3600000;
for(let t=a;t<b;){const next=Math.min(b,(Math.floor(t/3600000)+1)*3600000),d=local(t);occupied[(d.getUTCDay()+6)%7][Math.floor(d.getUTCHours()/4)]+=(next-t)/3600000;t=next;}
}
const heat=occupied.map((row,d)=>row.map((v,h)=>100*v/available[d][h]));
const hours=(end-begin)/3600000;
rows.forEach(r=>r.ocupacion=100*r.horas/hours);
return{rows,heat,ingresos:rows.reduce((a,r)=>a+r.ingresos,0),estadias:rows.reduce((a,r)=>a+r.estadias,0),ocupacion:100*rows.reduce((a,r)=>a+r.horas,0)/(hours*rows.length)};
}
function render(){const result=aggregate(period.value),rows=result.rows;
root.querySelector('#stats-demo').innerHTML=[['Ingresos de estadías',money(result.ingresos),'Estadías iniciadas en el período'],['Estadías',result.estadias,'Ingresos de huéspedes'],['Ticket promedio',money(result.ingresos/result.estadias||0),'Ingreso por estadía'],['Ocupación promedio',result.ocupacion.toFixed(1)+' %','Horas ocupadas / disponibles']].map(a=>'<div class="stat"><p>'+a[0]+'</p><div class="value">'+a[1]+'</div><p class="tag">'+a[2]+'</p></div>').join('');
const key=metric.value,sorted=[...rows].sort((a,b)=>b[key]-a[key]),max=sorted[0][key]||1;
root.querySelector('#bars-demo').innerHTML=sorted.map(r=>'<div class="barrow"><span>'+r.nombre+'</span><div class="track"><div class="fill" style="width:'+r[key]/max*100+'%"></div></div><span class="amount">'+(key==='ingresos'?'$ '+Math.round(r.ingresos/1000).toLocaleString('es-AR')+' mil':r.estadias)+'</span></div>').join('');
let grid='<span></span>'+['00–04','04–08','08–12','12–16','16–20','20–24'].map(t=>'<span class="label">'+t+'</span>').join('');
result.heat.forEach((row,i)=>{grid+='<span class="label">'+days[i]+'</span>'+row.map(v=>'<span class="cell" style="--v:'+v*.72+'">'+Math.round(v)+'</span>').join('');});root.querySelector('#heat-demo').innerHTML=grid;
root.querySelector('#table-demo').innerHTML=sorted.map(r=>'<tr><td>'+r.nombre+' <span class="tag">'+r.categoria+'</span></td><td>'+money(r.ingresos)+'</td><td>'+r.estadias+'</td><td>'+money(r.ingresos/r.estadias||0)+'</td><td>'+r.ocupacion.toFixed(1)+' %</td></tr>').join('');
const slots=result.heat.flatMap((row,d)=>row.map((v,h)=>({v,d,h}))).sort((a,b)=>a.v-b.v).slice(0,3);
root.querySelector('#op-demo').innerHTML=slots.map(s=>'<span class="pill">'+days[s.d]+' · '+String(s.h*4).padStart(2,'0')+'–'+String(s.h*4+4).padStart(2,'0')+' h · '+s.v.toFixed(1)+' %</span>').join('');
}
const saved=window.openai?.widgetState?.modelContent;
function apply(s){if(!s)return;if(['05','06','07','08','09','10'].includes(s.periodo))period.value=s.periodo;if(['ingresos','estadias'].includes(s.ranking))metric.value=s.ranking;}
apply(saved);
function changed(){render();window.openai?.setWidgetState?.({modelContent:{periodo:period.value,ranking:metric.value}})?.catch(()=>{});}
period.addEventListener('change',changed);metric.addEventListener('change',changed);render();
window.addEventListener('openai:set_globals',e=>{apply(e.detail?.globals?.widgetState?.modelContent);render();});
})();
