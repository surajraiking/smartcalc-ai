import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

const n=(x:string)=>{const v=Number(String(x).replace(/,/g,''));return Number.isFinite(v)?v:0};
const f=(x:number)=>Number.isFinite(x)?x.toLocaleString('en-IN',{maximumFractionDigits:2}):'0';
const pct=(a:number,r:number)=>a*r/100;
function Pick({label,value,options,onChange}: {label:string;value:string;options:string[];onChange:(v:string)=>void}){ const [open,setOpen]=useState(false); return <View style={S.fw}><Text style={S.label}>{label}</Text><Pressable onPress={()=>setOpen(true)} style={[S.field,{justifyContent:'center',flexDirection:'row',alignItems:'center'}]}><Text style={{flex:1,color:'#142449',fontSize:13,fontWeight:'800'}}>{value}</Text><Text style={{color:'#176CFF'}}>▾</Text></Pressable><Modal visible={open} transparent animationType="fade" onRequestClose={()=>setOpen(false)}><View style={{flex:1,backgroundColor:'#071230CC',justifyContent:'center',padding:24}}><View style={{backgroundColor:'#FFFFFF',borderRadius:22,padding:16,maxHeight:'70%',borderWidth:2,borderColor:'#63E5FF'}}><Text style={{fontSize:18,fontWeight:'900',color:'#142449',marginBottom:12}}>{label}</Text><ScrollView>{options.map(o=><Pressable key={o} onPress={()=>{onChange(o);setOpen(false)}} style={{padding:14,borderRadius:12,backgroundColor:o===value?'#D9F7FF':'#F0F5FF',marginBottom:6}}><Text style={{color:'#142449',fontWeight:'800'}}>{o}</Text></Pressable>)}</ScrollView><Pressable onPress={()=>setOpen(false)} style={S.close}><Text style={{color:'#FFFFFF',fontWeight:'900'}}>CLOSE</Text></Pressable></View></View></Modal></View>}


export default function SalesPanel(){
 const [qty,setQty]=useState('100'),[cost,setCost]=useState('500'),[price,setPrice]=useState('750'),[mrp,setMrp]=useState('900');
 const [disc,setDisc]=useState('5'),[trade,setTrade]=useState('0'),[addDisc,setAddDisc]=useState('0');
 const [gst,setGst]=useState('18'),[inclusive,setInclusive]=useState(false),[inter,setInter]=useState(false);
 const [freight,setFreight]=useState('0'),[packing,setPacking]=useState('0'),[other,setOther]=useState('0');
 const [commission,setCommission]=useState('0'),[marketFee,setMarketFee]=useState('0');
 const [returns,setReturns]=useState('0'),[advance,setAdvance]=useState('0'),[received,setReceived]=useState('0');
 const [fixed,setFixed]=useState('0'),[target,setTarget]=useState('0'),[salesman,setSalesman]=useState('0');
 const [free,setFree]=useState('0'),[targetMargin,setTargetMargin]=useState('20');

 const c=useMemo(()=>{
  const q=n(qty), cp=n(cost), sp=n(price), mr=n(mrp), d=n(disc), td=n(trade), ad=n(addDisc), gr=n(gst);
  const gross=q*sp;
  const discount=pct(gross,d), tradeDiscount=pct(gross-discount,td), additionalDiscount=pct(gross-discount-tradeDiscount,ad);
  const taxableBeforeCharges=Math.max(0,gross-discount-tradeDiscount-additionalDiscount);
  const taxable=inclusive && gr>0 ? taxableBeforeCharges/(1+gr/100) : taxableBeforeCharges;
  const tax=pct(taxable,gr);
  const cgst=inter?0:tax/2, sgst=inter?0:tax/2, igst=inter?tax:0;
  const charges=n(freight)+n(packing)+n(other);
  const commissionAmt=pct(taxable,n(commission)), marketplaceAmt=pct(taxable,n(marketFee));
  const invoice=inclusive?taxableBeforeCharges+charges:taxable+tax+charges;
  const returnAmt=pct(invoice,n(returns));
  const netSales=Math.max(0,invoice-returnAmt);
  const revenueBeforeReturns=inclusive&&gr>0?taxableBeforeCharges/(1+gr/100):taxableBeforeCharges;
  const netRevenueExTax=Math.max(0,revenueBeforeReturns*(1-n(returns)/100));
  const totalCost=q*cp+charges+commissionAmt+marketplaceAmt;
  const profit=netRevenueExTax-totalCost;
  const margin=netRevenueExTax?profit/netRevenueExTax*100:0;
  const markup=totalCost?profit/totalCost*100:0;
  const unitNet=q?netSales/q:0;
  const contribution=(sp*(1-d/100)*(1-td/100)*(1-ad/100))-cp;
  const breakEven=contribution>0?n(fixed)/contribution:0;
  const targetAchieved=n(target)>0?netSales/n(target)*100:0;
  const commissionSalesman=pct(netSales,n(salesman));
  const pending=Math.max(0,netSales-n(advance)-n(received));
  const discountFromMrp=mr?Math.max(0,(mr-sp)/mr*100):0;
  const marginPriceFor20=cp/(1-0.20);
  const priceForMargin=(m:number)=>m<100?cp/(1-m/100):0;
  const freeTotal=q+n(free);
  const targetMarginPrice=n(targetMargin)<100&&n(targetMargin)>=0?cp/(1-n(targetMargin)/100):0;
  return {q,cp,sp,mr,gross,discount,tradeDiscount,additionalDiscount,taxable,tax,cgst,sgst,igst,charges,commissionAmt,marketplaceAmt,invoice,returnAmt,netSales,netRevenueExTax,totalCost,profit,margin,markup,unitNet,breakEven,targetAchieved,commissionSalesman,pending,discountFromMrp,marginPriceFor20,priceForMargin,freeTotal,targetMarginPrice};
 },[qty,cost,price,mrp,disc,trade,addDisc,gst,inclusive,inter,freight,packing,other,commission,marketFee,returns,advance,received,fixed,target,salesman,free]);

 const Field=({label,value,set}:any)=><View style={S.fw}><Text style={S.label}>{label}</Text><TextInput value={value} onChangeText={set} keyboardType="decimal-pad" style={S.field}/></View>;
 const M=({label,value,accent=false}:any)=><View style={[S.metric,accent&&S.accent]}><Text style={S.ml}>{label}</Text><Text style={S.mv}>{value}</Text></View>;

 return <ScrollView nestedScrollEnabled>
  <Text style={S.section}>💰 Sales & Business Calculator</Text>
  <Text style={S.muted}>Har field me value type karein — results turant live calculate honge. Margin/markup profit GST ko revenue se alag karke calculate kiye jaate hain.</Text>
  <View style={[S.result,{marginTop:10}]}><Text style={S.kicker}>⚡ LIVE RESULT • AUTO-UPDATES</Text><Text style={S.big}>₹{f(c.netSales)}</Text><Text style={S.caption}>INVOICE / NET REALISATION (GST INCLUDED AS CONFIGURED)</Text><View style={S.metricGrid}><M label="Profit (ex-GST revenue)" value={'₹'+f(c.profit)} accent/><M label="Profit Margin" value={f(c.margin)+'%'} accent/><M label="Taxable Revenue" value={'₹'+f(c.netRevenueExTax)}/><M label="Pending Balance" value={'₹'+f(c.pending)}/></View></View>
  <Text style={S.head}>1. SALE / PRICE</Text>
  <View style={S.grid}>
   <Field label="Quantity" value={qty} set={setQty}/><Field label="Cost / Unit ₹" value={cost} set={setCost}/>
   <Field label="Selling Price / Unit ₹" value={price} set={setPrice}/><Field label="MRP / Unit ₹" value={mrp} set={setMrp}/>
  </View>
  <View style={S.grid}>
   <Field label="Discount %" value={disc} set={setDisc}/><Field label="Trade Discount %" value={trade} set={setTrade}/>
   <Field label="Additional Discount %" value={addDisc} set={setAddDisc}/><Field label="Free Qty" value={free} set={setFree}/>
  </View>

  <Text style={S.head}>2. GST / INVOICE</Text>
  <View style={S.grid}>
   <Pick label="GST RATE" value={gst+"%"} options={["0%","0.1%","0.25%","3%","5%","12%","18%","28%"]} onChange={x=>setGst(x.replace("%",""))}/><Field label="Freight ₹" value={freight} set={setFreight}/>
   <Field label="Packing ₹" value={packing} set={setPacking}/><Field label="Other Charges ₹" value={other} set={setOther}/>
  </View>
  <View style={S.switchRow}>
   <Pick label="TAX PRICE MODE" value={inclusive?"GST Inclusive":"GST Exclusive"} options={["GST Inclusive","GST Exclusive"]} onChange={x=>setInclusive(x==="GST Inclusive")}/>
   <Pick label="SUPPLY TYPE" value={inter?"IGST / Inter-state":"CGST + SGST / Intra-state"} options={["IGST / Inter-state","CGST + SGST / Intra-state"]} onChange={x=>setInter(x==="IGST / Inter-state")}/>
  </View>

  <Text style={S.head}>3. BUSINESS COST / REALISATION</Text>
  <View style={S.grid}>
   <Field label="Sales Commission %" value={commission} set={setCommission}/><Field label="Marketplace Fee %" value={marketFee} set={setMarketFee}/>
   <Field label="Sales Return %" value={returns} set={setReturns}/><Field label="Salesman Commission %" value={salesman} set={setSalesman}/>
   <Field label="Advance Received ₹" value={advance} set={setAdvance}/><Field label="Amount Received ₹" value={received} set={setReceived}/>
  </View>

  <View style={S.result}><Text style={S.kicker}>LIVE SALES RESULT</Text><Text style={S.big}>₹{f(c.netSales)}</Text><Text style={S.caption}>NET SALES / REALISATION</Text>
   <View style={S.metricGrid}>
    <M label="Gross Sales" value={'₹'+f(c.gross)}/><M label="Total Discount" value={'₹'+f(c.discount+c.tradeDiscount+c.additionalDiscount)}/>
    <M label="Taxable Value" value={'₹'+f(c.taxable)}/><M label={inter?'IGST':'CGST + SGST'} value={'₹'+f(c.tax)}/>
    <M label="Invoice Total" value={'₹'+f(c.invoice)}/><M label="Sales Return" value={'₹'+f(c.returnAmt)}/>
    <M label="Total Cost" value={'₹'+f(c.totalCost)}/><M label="Profit ₹" value={'₹'+f(c.profit)} accent/>
    <M label="Margin %" value={f(c.margin)+'%' } accent/><M label="Markup %" value={f(c.markup)+'%'}/>
    <M label="Selling / Unit" value={'₹'+f(c.unitNet)}/><M label="Pending / Outstanding" value={'₹'+f(c.pending)}/>
   </View>
  </View>

  <Text style={S.head}>4. GST BREAKUP</Text>
  <View style={S.metricGrid}><M label="Taxable" value={'₹'+f(c.taxable)}/><M label="CGST" value={'₹'+f(c.cgst)}/><M label="SGST" value={'₹'+f(c.sgst)}/><M label="IGST" value={'₹'+f(c.igst)}/></View>

  <Text style={S.head}>5. MARGIN / MARKUP TOOLS</Text>
  <View style={S.info}>
   <Text style={S.infoText}>Actual Margin = Profit ÷ Net Sales × 100</Text>
   <Text style={S.infoText}>Markup = Profit ÷ Cost × 100</Text>
   <Text style={S.infoText}>MRP Discount = (MRP − Selling Price) ÷ MRP × 100 = {f(c.discountFromMrp)}%</Text>
   <Text style={S.infoText}>20% margin selling price = ₹{f(c.marginPriceFor20)} per unit</Text><View style={{marginTop:10}}><Field label="TARGET PROFIT MARGIN %" value={targetMargin} set={setTargetMargin}/><Text style={S.infoText}>Required selling price at {f(n(targetMargin))}% margin = ₹{f(c.targetMarginPrice)} per unit (margin must be below 100%)</Text></View>
   <Text style={S.infoText}>Free Qty सहित dispatch quantity = {f(c.freeTotal)}</Text>
  </View>

  <Text style={S.head}>6. TARGET / BREAK-EVEN</Text>
  <View style={S.grid}><Field label="Fixed Cost ₹" value={fixed} set={setFixed}/><Field label="Sales Target ₹" value={target} set={setTarget}/></View>
  <View style={S.metricGrid}><M label="Break-even Qty" value={f(c.breakEven)}/><M label="Target Achieved" value={f(c.targetAchieved)+'%'}/><M label="Salesman Commission" value={'₹'+f(c.commissionSalesman)}/><M label="Marketplace Fee" value={'₹'+f(c.marketplaceAmt)}/></View>

  <Text style={S.head}>7. CONVERSATIONAL EXAMPLES</Text>
  <View style={S.info}>{[['500 motors • ₹850 sale • ₹600 cost • 18% GST • 5% discount',()=>{setQty('500');setPrice('850');setCost('600');setGst('18');setDisc('5')}],['100 pcs • ₹750 sale • ₹500 cost',()=>{setQty('100');setPrice('750');setCost('500')}],['₹900 MRP • ₹750 sale price',()=>{setMrp('900');setPrice('750')}],['1000 qty • 50 free',()=>{setQty('1000');setFree('50')}]].map(([label,fn]:any)=><Pressable key={label} onPress={fn} style={S.exampleChip}><Text style={S.infoText}>{label} ↗</Text></Pressable>)}</View>
 </ScrollView>
}
const S=StyleSheet.create({
 section:{fontSize:20,fontWeight:'900',color:'#111B3C',marginTop:15,marginBottom:6},muted:{fontSize:12,color:'#5D7192',lineHeight:18},head:{fontSize:13,fontWeight:'900',color:'#176CFF',marginTop:18,marginBottom:8},grid:{flexDirection:'row',flexWrap:'wrap',gap:8},fw:{width:'48.5%'},label:{fontSize:9,color:'#5D7192',fontWeight:'900',marginBottom:5},field:{height:48,borderRadius:13,backgroundColor:'#FFF',borderWidth:1,borderColor:'#CFE0F8',paddingHorizontal:10,color:'#142449',fontSize:14},switchRow:{flexDirection:'row',gap:8,marginTop:10,flexWrap:'wrap'},switch:{paddingVertical:11,paddingHorizontal:12,borderRadius:13,backgroundColor:'#E7F1FF',borderWidth:1,borderColor:'#C8DDFB'},on:{backgroundColor:'#176CFF',borderColor:'#176CFF'},swText:{fontSize:10,fontWeight:'900',color:'#193762'},result:{marginTop:15,padding:16,borderRadius:21,backgroundColor:'#082F36',borderWidth:1,borderColor:'#28B9B0'},kicker:{fontSize:9,color:'#67E8DE',fontWeight:'900',letterSpacing:1.5},big:{fontSize:30,color:'#FFF',fontWeight:'900',marginTop:5},caption:{fontSize:10,color:'#B8FFF7',fontWeight:'800',marginTop:2},metricGrid:{flexDirection:'row',flexWrap:'wrap',gap:8,marginTop:12},metric:{width:'48.5%',padding:11,borderRadius:14,backgroundColor:'#FFF',borderWidth:1,borderColor:'#D7E6FA'},accent:{borderColor:'#55D6C8',backgroundColor:'#EEFFFC'},ml:{fontSize:9,color:'#6680A3',fontWeight:'800'},mv:{fontSize:15,color:'#142449',fontWeight:'900',marginTop:3},info:{marginTop:8,padding:13,borderRadius:15,backgroundColor:'#F1F6FF',borderWidth:1,borderColor:'#D4E2F6'},infoText:{fontSize:11,color:'#314B70',fontWeight:'700',lineHeight:19},exampleChip:{padding:8,marginVertical:3,borderRadius:10,backgroundColor:'#FFFFFF',borderWidth:1,borderColor:'#D5E5FA'},close:{marginTop:10,alignItems:'center',padding:12,borderRadius:12,backgroundColor:'#176CFF'}
});
