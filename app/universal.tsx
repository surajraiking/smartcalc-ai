import { useEffect, useMemo, useState } from 'react';
import { Alert, BackHandler, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import SalesPanel from './sales';

type Mode = 'smart'|'convert'|'motor'|'sales'|'tools';
type Result = { title:string; value:string; formula?:string; detail?:string };

const UNIT: Record<string, {base:string; factor:number}> = {
  mg:{base:'g',factor:.001}, g:{base:'g',factor:1}, kg:{base:'g',factor:1000}, tonne:{base:'g',factor:1e6}, ton:{base:'g',factor:1e6}, quintal:{base:'g',factor:100000}, oz:{base:'g',factor:28.349523125}, lb:{base:'g',factor:453.59237},
  mm:{base:'m',factor:.001}, cm:{base:'m',factor:.01}, m:{base:'m',factor:1}, km:{base:'m',factor:1000}, inch:{base:'m',factor:.0254}, in:{base:'m',factor:.0254}, ft:{base:'m',factor:.3048}, feet:{base:'m',factor:.3048}, yard:{base:'m',factor:.9144}, yd:{base:'m',factor:.9144}, mile:{base:'m',factor:1609.344},
  ml:{base:'l',factor:.001}, millilitre:{base:'l',factor:.001}, l:{base:'l',factor:1}, litre:{base:'l',factor:1}, liter:{base:'l',factor:1}, gallon:{base:'l',factor:3.785411784},
  c:{base:'temp',factor:1}, f:{base:'temp',factor:1}, k:{base:'temp',factor:1},
  sec:{base:'s',factor:1}, second:{base:'s',factor:1}, min:{base:'s',factor:60}, minute:{base:'s',factor:60}, hour:{base:'s',factor:3600}, day:{base:'s',factor:86400},
  kmh:{base:'kmh',factor:1}, mph:{base:'kmh',factor:1.609344}, mps:{base:'kmh',factor:3.6},
  pa:{base:'pa',factor:1}, kpa:{base:'pa',factor:1000}, bar:{base:'pa',factor:100000}, psi:{base:'pa',factor:6894.757293168}, atm:{base:'pa',factor:101325},
  w:{base:'w',factor:1}, kw:{base:'w',factor:1000}, mw:{base:'w',factor:1e6}, hp:{base:'w',factor:745.699871582},
  j:{base:'j',factor:1}, kj:{base:'j',factor:1000}, wh:{base:'j',factor:3600}, kwh:{base:'j',factor:3600000}, kcal:{base:'j',factor:4184}
};
const CURRENCIES=['INR','USD','EUR','GBP','AED','SAR','JPY','CNY','CAD','AUD','CHF','SGD','HKD','NZD','ZAR','BRL','MXN','KRW','THB','MYR','IDR','TRY','NOK','SEK','DKK','RUB'];
const UNIT_GROUPS:Record<string,string[]>={Mass:['mg','g','kg','tonne','quintal','oz','lb'],Length:['mm','cm','m','km','inch','ft','yard','mile'],Volume:['ml','l','gallon'],Temperature:['c','f','k'],Time:['sec','min','hour','day'],Speed:['kmh','mph','mps'],Pressure:['pa','kpa','bar','psi','atm'],Power:['w','kw','mw','hp'],Energy:['j','kj','wh','kwh','kcal']};
function Dropdown({label,value,options,onChange}: {label:string;value:string;options:string[];onChange:(v:string)=>void}){
 const [open,setOpen]=useState(false);
 return <View style={{flex:1,minWidth:90}}><Text style={S.label}>{label}</Text><Pressable onPress={()=>setOpen(true)} style={[S.field,{justifyContent:'center',flexDirection:'row',alignItems:'center',gap:6}]}><Text style={{color:'#142449',fontSize:13,fontWeight:'800',flex:1}}>{value}</Text><Text style={{color:'#287BFF'}}>▾</Text></Pressable><Modal visible={open} transparent animationType="fade" onRequestClose={()=>setOpen(false)}><View style={{flex:1,backgroundColor:'#06122FCC',justifyContent:'center',padding:24}}><View style={{maxHeight:'75%',backgroundColor:'#FFFFFF',borderRadius:24,padding:16,borderWidth:2,borderColor:'#71E8FF'}}><Text style={{fontSize:18,fontWeight:'900',color:'#142449',marginBottom:12}}>{label} चुनें</Text><ScrollView>{options.map(o=><Pressable key={o} onPress={()=>{onChange(o);setOpen(false)}} style={{padding:14,marginBottom:6,borderRadius:13,backgroundColor:o===value?'#DDF7FF':'#F0F5FF',borderWidth:1,borderColor:o===value?'#36B9ED':'#DFE8F8'}}><Text style={{fontSize:14,fontWeight:'800',color:'#142449'}}>{o}</Text></Pressable>)}</ScrollView><Pressable onPress={()=>setOpen(false)} style={S.primary}><Text style={S.primaryText}>CLOSE</Text></Pressable></View></View></Modal></View>
}

const n=(x:string)=>{const v=Number(String(x).replace(/,/g,''));return Number.isFinite(v)?v:0};
const f=(x:number)=>Number.isFinite(x)?x.toLocaleString('en-IN',{maximumFractionDigits:10}):'Error';
const clean=(s:string)=>s.toLowerCase().replace(/,/g,'').replace(/×/g,'*').replace(/÷/g,'/');
function arithmetic(s:string):number|null{
  const x=clean(s).replace(/\s+/g,'');
  if(!x || !/^[0-9+\-*/().%]+$/.test(x)) return null;
  const toks=x.match(/\d*\.?\d+|[()+\-*/%]/g); if(!toks)return null;
  const vals:number[]=[]; const ops:string[]=[]; const p:any={'+':1,'-':1,'*':2,'/':2,'%':2};
  const apply=()=>{const op=ops.pop(),b=vals.pop(),a=vals.pop();if(op==null||a==null||b==null)throw 0;if(op==='+')vals.push(a+b);else if(op==='-')vals.push(a-b);else if(op==='*')vals.push(a*b);else if(op==='/'){if(b===0)throw 0;vals.push(a/b)}else vals.push(a%b)};
  try{let prev='o';for(const t of toks){if(/^\d/.test(t)){vals.push(Number(t));prev='n'}else if(t==='('){ops.push(t);prev='o'}else if(t===')'){while(ops.length&&ops[ops.length-1]!=='(')apply();if(ops.pop()!=='(')return null;prev='n'}else{if(t==='-'&&prev==='o')vals.push(0);while(ops.length&&ops[ops.length-1]!=='('&&p[ops[ops.length-1]]>=p[t])apply();ops.push(t);prev='o'}}while(ops.length)apply();return vals.length===1&&Number.isFinite(vals[0])?vals[0]:null}catch{return null}}
function natural(q:string):Result|null{
  const s=q.trim().toLowerCase();
  const m=s.match(/(-?\d+(?:\.\d+)?)\s*([a-z²³]+)\s*(?:to|in|into|में|me|ko)\s*([a-z²³]+)/i);
  if(m){
    const a=n(m[1]),u1=m[2].replace('²','2').replace('³','3'),u2=m[3].replace('²','2').replace('³','3');
    if(u1==='c'||u1==='f'||u1==='k'){if(u2==='c'||u2==='f'||u2==='k'){let c=u1==='c'?a:u1==='f'?(a-32)*5/9:a-273.15;let out=u2==='c'?c:u2==='f'?c*9/5+32:c+273.15;return{title:'Temperature conversion',value:f(out)+' '+u2,formula:u1.toUpperCase()+' → '+u2.toUpperCase()}}}
    const x=UNIT[u1],y=UNIT[u2]; if(x&&y&&x.base===y.base)return{title:'Unit conversion',value:f(a*x.factor/y.factor)+' '+u2,formula:a+' '+u1+' × '+x.factor+'/'+y.factor};
  }
  const gst=s.match(/(?:gst|tax)\s*(?:on)?\s*₹?\s*([\d,.]+)\s*(?:at|@|of)?\s*(\d+(?:\.\d+)?)\s*%/);
  if(gst){const a=n(gst[1]),r=n(gst[2]),tax=a*r/100;return{title:'GST calculation',value:'₹'+f(a+tax),formula:'GST = ₹'+f(tax)+' | Rate = '+r+'%',detail:'Base ₹'+f(a)+' + GST ₹'+f(tax)}}
  const pct=s.match(/(?:what is|calculate)?\s*(\d+(?:\.\d+)?)\s*%\s*(?:of|का|ka)\s*([\d,.]+)/);
  if(pct){const r=n(pct[1]),a=n(pct[2]);return{title:'Percentage',value:f(a*r/100),formula:r+'% of '+f(a)}}
  const motors=s.match(/(\d[\d,]*)\s*(?:motor|motors|मोटर).*?(\d+(?:\.\d+)?)\s*kg/);
  if(motors){const q=n(motors[1]),kg=n(motors[2]);return{title:'Motor material requirement',value:f(q*kg)+' kg',formula:q+' motors × '+kg+' kg/motor',detail:'Equivalent '+f(q*kg/1000)+' tonne'}}
  const boxes=s.match(/(\d[\d,]*)\s*(?:motor|motors).*?(?:4|four)\s*(?:per|in|के|ke).*?box/);
  if(boxes){const q=n(boxes[1]);return{title:'Packing',value:f(Math.ceil(q/4))+' boxes',formula:'CEILING('+q+' ÷ 4)'}}
  const rejection=s.match(/(\d[\d,]*)\s*(?:motor|motors).*?(\d+(?:\.\d+)?)\s*%\s*(?:reject|rejection)/);
  if(rejection){const q=n(rejection[1]),r=n(rejection[2]);return{title:'Production rejection',value:f(q*r/100)+' rejected | '+f(q*(1-r/100))+' good',formula:q+' × '+r+'%'}}
  const e=arithmetic(s); if(e!==null)return{title:'Instant calculation',value:f(e),formula:q};
  return null;
}
function convert(value:string,from:string,to:string):Result|null{
  const a=n(value),u=from.toLowerCase(),v=to.toLowerCase();
  if(['c','f','k'].includes(u)&&['c','f','k'].includes(v)){const c=u==='c'?a:u==='f'?(a-32)*5/9:a-273.15;const out=v==='c'?c:v==='f'?c*9/5+32:c+273.15;return{title:'Temperature conversion',value:f(out)+' '+to,formula:u.toUpperCase()+' → '+v.toUpperCase()+' using exact temperature formulas'}}
  const x=UNIT[u],y=UNIT[v]; if(!x||!y||x.base!==y.base)return null;
  return{title:'Converter result',value:f(a*x.factor/y.factor)+' '+to,formula:a+' '+from+' × '+x.factor+'/'+y.factor};
}
function MotorPanel(){
  const [qty,setQty]=useState('500'),[kg,setKg]=useState('3.3'),[perBox,setPerBox]=useState('4'),[reject,setReject]=useState('2'),[cost,setCost]=useState('250'),[density,setDensity]=useState('7850');
  const q=n(qty),w=n(kg),b=Math.max(1,n(perBox)),r=n(reject),c=n(cost),good=q*(1-r/100);
  const material=q*w, boxes=Math.ceil(q/b), goodMaterial=good*w, total=c*q;
  return <View><Text style={S.section}>⚙️ Cooler Motor Manufacturing</Text><Text style={S.muted}>Production, material, packing, rejection and costing in one live panel.</Text>
    <View style={S.formGrid}>{[['Motor Quantity',qty,setQty],['Weight / Motor (kg)',kg,setKg],['Motors / Box',perBox,setPerBox],['Rejection %',reject,setReject],['Cost / Motor ₹',cost,setCost],['Density kg/m³',density,setDensity]].map((x:any)=><View style={S.fieldWrap} key={x[0]}><Text style={S.label}>{x[0]}</Text><TextInput value={x[1]} onChangeText={x[2]} keyboardType="decimal-pad" style={S.field}/></View>)}</View>
    <View style={S.metricGrid}>{[['Raw material',f(material)+' kg'],['Good motors',f(good)],['Rejected',f(q-good)],['Boxes',f(boxes)],['Good material',f(goodMaterial)+' kg'],['Production value','₹'+f(total)]].map(x=><View style={S.metric} key={x[0]}><Text style={S.metricLabel}>{x[0]}</Text><Text style={S.metricValue}>{x[1]}</Text></View>)}</View>
    <Text style={S.example}>Examples: 500 × 3.3 kg = 1,650 kg • 500 ÷ 4 = 125 boxes • 2% rejection = 10 rejected / 490 good</Text>
  </View>
}
function SmartPanel(){
 const [q,setQ]=useState(''); const result=useMemo(()=>natural(q),[q]);
 return <View><Text style={S.section}>🧠 Conversational Calculator</Text><Text style={S.muted}>Type naturally. Result appears instantly while you type.</Text>
 {result&&<View style={S.answer}><Text style={S.answerKicker}>LIVE RESULT</Text><Text style={S.answerValue}>{result.value}</Text><Text style={S.answerTitle}>{result.title}</Text>{result.formula&&<Text style={S.formula}>{result.formula}</Text>}{result.detail&&<Text style={S.detail}>{result.detail}</Text>}</View>}
 <TextInput value={q} onChangeText={setQ} placeholder="Try: 5 kg to g • ₹2500 at 18% GST • 500 motors 3.3 kg • 500 motors 2% rejection" placeholderTextColor="#7183A2" style={S.bigInput}/>
 <Text style={S.section}>⚡ Quick examples</Text><View style={S.quickGrid}>{['5 kg to g','2500 at 18% GST','500 motors 3.3 kg','500 motors 2% rejection','1000 / 4','(1250+750)*2'].map(x=><Pressable key={x} onPress={()=>setQ(x)} style={S.quick}><Text style={S.quickText}>{x}</Text></Pressable>)}</View>
 </View>
}
function ConverterPanel(){
 const [v,setV]=useState('5'),[from,setFrom]=useState('kg'),[to,setTo]=useState('g');
 const res=useMemo(()=>convert(v,from,to),[v,from,to]);
 return <View><Text style={S.section}>🔄 Universal Converter</Text><Text style={S.muted}>Mass, length, volume, temperature, time, speed, pressure, power, energy and more.</Text>
 <View style={S.row}><TextInput value={v} onChangeText={setV} keyboardType="decimal-pad" style={[S.field,{flex:1}]}/><Dropdown label="FROM UNIT" value={from} options={Object.keys(UNIT)} onChange={setFrom}/><Dropdown label="TO UNIT" value={to} options={Object.keys(UNIT)} onChange={setTo}/></View>
 {res&&<View style={S.answer}><Text style={S.answerKicker}>CONVERTED</Text><Text style={S.answerValue}>{res.value}</Text><Text style={S.formula}>{res.formula}</Text></View>}
 <Text style={S.examples}>Try: kg, g, mg, tonne • mm, cm, m, km, inch, ft, mile • mL, L, gallon • C, F, K • s, min, hour, day • kmh, mph, mps • Pa, bar, PSI • W, kW, hp • J, kWh, kcal</Text>
 </View>
}
function CurrencyPanel(){
 const [amount,setAmount]=useState('1'),[from,setFrom]=useState('USD'),[to,setTo]=useState('INR'),[rate,setRate]=useState<number|null>(null);
 const [busy,setBusy]=useState(false);
 const load=async()=>{if(from===to){setRate(1);return}setBusy(true);setRate(null);try{const r=await fetch('https://api.frankfurter.app/latest?from='+from+'&to='+to);if(!r.ok)throw new Error('Rate unavailable');const j=await r.json();const rr=Number(j?.rates?.[to]);if(Number.isFinite(rr))setRate(rr)}catch{setRate(null)}finally{setBusy(false)}};
 useEffect(()=>{load()},[from,to]);
 return <View><Text style={S.section}>💱 World Currency</Text><Text style={S.muted}>Live-rate capable converter with a safe fallback rate. {busy?'Updating…':'Tap Update Rate for the latest available rate.'}</Text>
 <View style={S.row}><TextInput value={amount} onChangeText={setAmount} keyboardType="decimal-pad" style={[S.field,{flex:1}]}/><Dropdown label="FROM" value={from} options={CURRENCIES} onChange={setFrom}/><Dropdown label="TO" value={to} options={CURRENCIES} onChange={setTo}/></View>
 <Pressable onPress={load} style={S.primary}><Text style={S.primaryText}>↻ UPDATE LIVE RATE</Text></Pressable>
 <View style={S.answer}><Text style={S.answerKicker}>CURRENCY RESULT</Text><Text style={S.answerValue}>{rate===null?(busy?'Fetching rate…':'Live rate unavailable — retry'):(to+' '+f(n(amount)*rate))}</Text>{rate!==null&&<Text style={S.formula}>1 {from} = {f(rate)} {to} • rate date: latest provider response</Text>}</View>
 <Text style={S.examples}>Supported quick list: {CURRENCIES.join(' • ')}</Text>
 </View>
}
export default function UniversalHome(){
 const router=useRouter(); const [mode,setMode]=useState<Mode>('smart');
 useEffect(()=>{const sub=BackHandler.addEventListener('hardwareBackPress',()=>{Alert.alert('Exit SmartCalc AI?','Are you sure you want to exit the app?', [{text:'Cancel',style:'cancel'},{text:'Exit',style:'destructive',onPress:()=>BackHandler.exitApp()}]);return true});return ()=>sub.remove()},[]);
 return <View style={S.root}><ScrollView contentContainerStyle={S.page}>
  <View style={S.hero}><Text style={S.badge}>SMARTCALC AI · UNIVERSAL ENGINE</Text><Text style={S.title}>Calculate <Text style={{color:'#63E5FF'}}>Anything.</Text></Text><Text style={S.sub}>Calculator + Converter + Finance + Engineering + Cooler Motor Manufacturing</Text></View>
  <View style={S.tabs}>{[['smart','🧠 Smart'],['convert','🔄 Convert'],['motor','⚙️ Motor'],['sales','💰 Sales'],['tools','💱 Currency']].map(([id,label])=><Pressable key={id} onPress={()=>setMode(id as Mode)} style={[S.tab,mode===id&&S.tabOn]}><Text style={[S.tabText,mode===id&&S.tabTextOn]}>{label}</Text></Pressable>)}</View>
  {mode==='smart'&&<SmartPanel/>}{mode==='convert'&&<ConverterPanel/>}{mode==='motor'&&<MotorPanel/>}{mode==='sales'&&<SalesPanel/>}{mode==='tools'&&<CurrencyPanel/>}
  <View style={S.preserve}><Text style={S.preserveTitle}>✓ Existing SmartCalc preserved</Text><Text style={S.muted}>All existing calculator tools, Chess, AI Chat, history and integrations remain available.</Text><Pressable onPress={()=>router.push('/smart')} style={S.secondary}><Text style={S.secondaryText}>OPEN FULL EXISTING SMARTCALC →</Text></Pressable></View>
 </ScrollView></View>
}
const S=StyleSheet.create({
 root:{flex:1,backgroundColor:'#F4F8FF'},page:{padding:16,paddingBottom:40},hero:{padding:20,borderRadius:28,backgroundColor:'#287BFF',borderWidth:1,borderColor:'#63E5FF',shadowColor:'#173D9B',shadowOpacity:.3,shadowRadius:16,elevation:9},badge:{fontSize:10,fontWeight:'900',color:'#CFFBFF',letterSpacing:1.2},title:{fontSize:30,fontWeight:'900',color:'#FFF',marginTop:9},sub:{fontSize:12,fontWeight:'700',color:'#EAF5FF',lineHeight:18,marginTop:6},tabs:{flexDirection:'row',gap:7,marginVertical:14,flexWrap:'wrap'},tab:{paddingHorizontal:13,paddingVertical:11,borderRadius:17,backgroundColor:'#FFF',borderWidth:1,borderColor:'#D7E5FA'},tabOn:{backgroundColor:'#176CFF',borderColor:'#5BB8FF'},tabText:{fontSize:11,fontWeight:'900',color:'#274064'},tabTextOn:{color:'#FFF'},section:{fontSize:20,fontWeight:'900',color:'#111B3C',marginTop:15,marginBottom:6},muted:{fontSize:12,color:'#5D7192',lineHeight:18},bigInput:{minHeight:58,borderRadius:18,backgroundColor:'#FFF',borderWidth:1,borderColor:'#CFE0F8',paddingHorizontal:15,fontSize:15,color:'#142449',marginTop:12},answer:{marginTop:10,padding:16,borderRadius:20,backgroundColor:'#082F36',borderWidth:1,borderColor:'#28B9B0'},answerKicker:{fontSize:9,color:'#67E8DE',fontWeight:'900',letterSpacing:1.5},answerValue:{fontSize:29,color:'#FFF',fontWeight:'900',marginTop:5},answerTitle:{fontSize:12,color:'#B8FFF7',fontWeight:'800',marginTop:4},formula:{fontSize:11,color:'#D8FFF9',marginTop:7,lineHeight:17},detail:{fontSize:11,color:'#A9C9C6',marginTop:4},quickGrid:{flexDirection:'row',flexWrap:'wrap',gap:8,marginTop:6},quick:{padding:10,borderRadius:14,backgroundColor:'#E7F1FF',borderWidth:1,borderColor:'#C8DDFB'},quickText:{fontSize:10,fontWeight:'800',color:'#193762'},row:{flexDirection:'row',gap:7,marginTop:12},field:{height:50,borderRadius:13,backgroundColor:'#FFF',borderWidth:1,borderColor:'#CFE0F8',paddingHorizontal:10,color:'#142449',fontSize:14},examples:{fontSize:10,color:'#647896',lineHeight:17,marginTop:11},formGrid:{flexDirection:'row',flexWrap:'wrap',gap:8,marginTop:10},fieldWrap:{width:'48.5%'},label:{fontSize:9,color:'#5D7192',fontWeight:'900',marginBottom:5},metricGrid:{flexDirection:'row',flexWrap:'wrap',gap:8,marginTop:13},metric:{width:'48.5%',padding:12,borderRadius:16,backgroundColor:'#FFF',borderWidth:1,borderColor:'#D7E6FA'},metricLabel:{fontSize:9,color:'#6680A3',fontWeight:'800'},metricValue:{fontSize:16,color:'#142449',fontWeight:'900',marginTop:4},example:{marginTop:12,fontSize:10,color:'#49627F',lineHeight:17},primary:{marginTop:10,height:48,borderRadius:14,backgroundColor:'#176CFF',alignItems:'center',justifyContent:'center'},primaryText:{color:'#FFF',fontSize:12,fontWeight:'900'},preserve:{marginTop:22,padding:15,borderRadius:19,backgroundColor:'#EAF7F4',borderWidth:1,borderColor:'#A9E4D7'},preserveTitle:{fontSize:14,fontWeight:'900',color:'#11685B',marginBottom:5},secondary:{marginTop:11,padding:13,borderRadius:13,backgroundColor:'#FFF',borderWidth:1,borderColor:'#9AD5CB',alignItems:'center'},secondaryText:{fontSize:10,fontWeight:'900',color:'#126C60'}
});
