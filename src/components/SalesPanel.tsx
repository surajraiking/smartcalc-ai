import React, { useMemo, useState } from 'react';

const n = (x: string) => {
  const v = Number(String(x).replace(/,/g, ''));
  return Number.isFinite(v) ? v : 0;
};

const f = (x: number) =>
  Number.isFinite(x) ? x.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : '0';

const pct = (a: number, r: number) => (a * r) / 100;

function Pick({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ flex: '1 1 calc(50% - 8px)', minWidth: 140 }}>
      <label style={{ display: 'block', fontSize: 10, color: '#5D7192', fontWeight: 900, marginBottom: 5 }}>
        {label}
      </label>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          width: '100%',
          height: 48,
          borderRadius: 13,
          backgroundColor: '#FFF',
          border: '1px solid #CFE0F8',
          padding: '0 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: '#142449',
          fontSize: 13,
          fontWeight: 800,
        }}
      >
        <span>{value}</span>
        <span style={{ color: '#176CFF' }}>▾</span>
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(7, 18, 48, 0.75)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 360,
              maxHeight: '75vh',
              backgroundColor: '#FFF',
              borderRadius: 22,
              padding: 16,
              border: '2px solid #63E5FF',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            }}
          >
            <h3 style={{ fontSize: 17, fontWeight: 900, color: '#142449', marginBottom: 12 }}>{label}</h3>
            <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {options.map((o) => (
                <button
                  type="button"
                  key={o}
                  onClick={() => {
                    onChange(o);
                    setOpen(false);
                  }}
                  style={{
                    padding: 13,
                    borderRadius: 12,
                    backgroundColor: o === value ? '#D9F7FF' : '#F0F5FF',
                    border: '1px solid',
                    borderColor: o === value ? '#36B9ED' : '#DFE8F8',
                    textAlign: 'left',
                    color: '#142449',
                    fontWeight: 800,
                  }}
                >
                  {o}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{
                marginTop: 12,
                padding: 12,
                borderRadius: 12,
                backgroundColor: '#176CFF',
                color: '#FFF',
                fontWeight: 900,
                textAlign: 'center',
              }}
            >
              CLOSE
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SalesPanel() {
  const [qty, setQty] = useState('100');
  const [cost, setCost] = useState('500');
  const [price, setPrice] = useState('750');
  const [mrp, setMrp] = useState('900');
  const [disc, setDisc] = useState('5');
  const [trade, setTrade] = useState('0');
  const [addDisc, setAddDisc] = useState('0');
  const [gst, setGst] = useState('18');
  const [inclusive, setInclusive] = useState(false);
  const [inter, setInter] = useState(false);
  const [freight, setFreight] = useState('0');
  const [packing, setPacking] = useState('0');
  const [other, setOther] = useState('0');
  const [commission, setCommission] = useState('0');
  const [marketFee, setMarketFee] = useState('0');
  const [returns, setReturns] = useState('0');
  const [advance, setAdvance] = useState('0');
  const [received, setReceived] = useState('0');
  const [fixed, setFixed] = useState('0');
  const [target, setTarget] = useState('0');
  const [salesman, setSalesman] = useState('0');
  const [free, setFree] = useState('0');
  const [targetMargin, setTargetMargin] = useState('20');

  const c = useMemo(() => {
    const q = n(qty);
    const cp = n(cost);
    const sp = n(price);
    const mr = n(mrp);
    const d = n(disc);
    const td = n(trade);
    const ad = n(addDisc);
    const gr = n(gst);
    const gross = q * sp;
    const discount = pct(gross, d);
    const tradeDiscount = pct(gross - discount, td);
    const additionalDiscount = pct(gross - discount - tradeDiscount, ad);
    const taxableBeforeCharges = Math.max(0, gross - discount - tradeDiscount - additionalDiscount);
    const taxable = inclusive && gr > 0 ? taxableBeforeCharges / (1 + gr / 100) : taxableBeforeCharges;
    const tax = pct(taxable, gr);
    const cgst = inter ? 0 : tax / 2;
    const sgst = inter ? 0 : tax / 2;
    const igst = inter ? tax : 0;
    const charges = n(freight) + n(packing) + n(other);
    const commissionAmt = pct(taxable, n(commission));
    const marketplaceAmt = pct(taxable, n(marketFee));
    const invoice = inclusive ? taxableBeforeCharges + charges : taxable + tax + charges;
    const returnAmt = pct(invoice, n(returns));
    const netSales = Math.max(0, invoice - returnAmt);
    const revenueBeforeReturns = inclusive && gr > 0 ? taxableBeforeCharges / (1 + gr / 100) : taxableBeforeCharges;
    const netRevenueExTax = Math.max(0, revenueBeforeReturns * (1 - n(returns) / 100));
    const totalCost = q * cp + charges + commissionAmt + marketplaceAmt;
    const profit = netRevenueExTax - totalCost;
    const margin = netRevenueExTax ? (profit / netRevenueExTax) * 100 : 0;
    const markup = totalCost ? (profit / totalCost) * 100 : 0;
    const unitNet = q ? netSales / q : 0;
    const contribution = sp * (1 - d / 100) * (1 - td / 100) * (1 - ad / 100) - cp;
    const breakEven = contribution > 0 ? n(fixed) / contribution : 0;
    const targetAchieved = n(target) > 0 ? (netSales / n(target)) * 100 : 0;
    const commissionSalesman = pct(netSales, n(salesman));
    const pending = Math.max(0, netSales - n(advance) - n(received));
    const discountFromMrp = mr ? Math.max(0, ((mr - sp) / mr) * 100) : 0;
    const marginPriceFor20 = cp / (1 - 0.2);
    const priceForMargin = (m: number) => (m < 100 ? cp / (1 - m / 100) : 0);
    const freeTotal = q + n(free);
    const targetMarginPrice = n(targetMargin) < 100 && n(targetMargin) >= 0 ? cp / (1 - n(targetMargin) / 100) : 0;
    return {
      q,
      cp,
      sp,
      mr,
      gross,
      discount,
      tradeDiscount,
      additionalDiscount,
      taxable,
      tax,
      cgst,
      sgst,
      igst,
      charges,
      commissionAmt,
      marketplaceAmt,
      invoice,
      returnAmt,
      netSales,
      netRevenueExTax,
      totalCost,
      profit,
      margin,
      markup,
      unitNet,
      breakEven,
      targetAchieved,
      commissionSalesman,
      pending,
      discountFromMrp,
      marginPriceFor20,
      priceForMargin,
      freeTotal,
      targetMarginPrice,
    };
  }, [
    qty,
    cost,
    price,
    mrp,
    disc,
    trade,
    addDisc,
    gst,
    inclusive,
    inter,
    freight,
    packing,
    other,
    commission,
    marketFee,
    returns,
    advance,
    received,
    fixed,
    target,
    salesman,
    free,
    targetMargin,
  ]);

  const Field = ({ label, value, set }: { label: string; value: string; set: (v: string) => void }) => (
    <div style={{ flex: '1 1 calc(50% - 8px)', minWidth: 140 }}>
      <label style={{ display: 'block', fontSize: 10, color: '#5D7192', fontWeight: 900, marginBottom: 5 }}>
        {label}
      </label>
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => set(e.target.value)}
        style={{
          width: '100%',
          height: 48,
          borderRadius: 13,
          backgroundColor: '#FFF',
          border: '1px solid #CFE0F8',
          padding: '0 12px',
          color: '#142449',
          fontSize: 14,
          fontWeight: 700,
          outline: 'none',
        }}
      />
    </div>
  );

  const M = ({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) => (
    <div
      style={{
        flex: '1 1 calc(50% - 8px)',
        minWidth: 140,
        padding: 12,
        borderRadius: 14,
        backgroundColor: accent ? '#EEFFFC' : '#FFF',
        border: `1px solid ${accent ? '#55D6C8' : '#D7E6FA'}`,
      }}
    >
      <div style={{ fontSize: 10, color: '#6680A3', fontWeight: 800 }}>{label}</div>
      <div style={{ fontSize: 16, color: '#142449', fontWeight: 900, marginTop: 3 }}>{value}</div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 900, color: '#111B3C', marginBottom: 4 }}>
          💰 Sales & Business Calculator
        </h2>
        <p style={{ fontSize: 12, color: '#5D7192', lineHeight: '18px' }}>
          Har field me value type karein — results turant live calculate honge. Margin/markup profit GST ko revenue se alag karke calculate kiye jaate hain.
        </p>
      </div>

      {/* Main summary card */}
      <div
        style={{
          padding: 18,
          borderRadius: 22,
          backgroundColor: '#082F36',
          border: '1px solid #28B9B0',
          boxShadow: '0 8px 24px rgba(8, 47, 54, 0.25)',
        }}
      >
        <div style={{ fontSize: 10, color: '#67E8DE', fontWeight: 900, letterSpacing: '1.5px' }}>
          ⚡ LIVE RESULT • AUTO-UPDATES
        </div>
        <div style={{ fontSize: 32, color: '#FFF', fontWeight: 900, marginTop: 4 }}>₹{f(c.netSales)}</div>
        <div style={{ fontSize: 10, color: '#B8FFF7', fontWeight: 800, marginTop: 2, textTransform: 'uppercase' }}>
          INVOICE / NET REALISATION (GST INCLUDED AS CONFIGURED)
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
          <M label="Profit (ex-GST revenue)" value={'₹' + f(c.profit)} accent />
          <M label="Profit Margin" value={f(c.margin) + '%'} accent />
          <M label="Taxable Revenue" value={'₹' + f(c.netRevenueExTax)} />
          <M label="Pending Balance" value={'₹' + f(c.pending)} />
        </div>
      </div>

      {/* 1. SALE / PRICE */}
      <div>
        <h3 style={{ fontSize: 13, fontWeight: 900, color: '#176CFF', marginBottom: 8 }}>1. SALE / PRICE</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <Field label="Quantity" value={qty} set={setQty} />
          <Field label="Cost / Unit ₹" value={cost} set={setCost} />
          <Field label="Selling Price / Unit ₹" value={price} set={setPrice} />
          <Field label="MRP / Unit ₹" value={mrp} set={setMrp} />
          <Field label="Discount %" value={disc} set={setDisc} />
          <Field label="Trade Discount %" value={trade} set={setTrade} />
          <Field label="Additional Discount %" value={addDisc} set={setAddDisc} />
          <Field label="Free Qty" value={free} set={setFree} />
        </div>
      </div>

      {/* 2. GST / INVOICE */}
      <div>
        <h3 style={{ fontSize: 13, fontWeight: 900, color: '#176CFF', marginBottom: 8 }}>2. GST / INVOICE</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <Pick
            label="GST RATE"
            value={gst + '%'}
            options={['0%', '0.1%', '0.25%', '3%', '5%', '12%', '18%', '28%']}
            onChange={(x) => setGst(x.replace('%', ''))}
          />
          <Field label="Freight ₹" value={freight} set={setFreight} />
          <Field label="Packing ₹" value={packing} set={setPacking} />
          <Field label="Other Charges ₹" value={other} set={setOther} />
          <Pick
            label="TAX PRICE MODE"
            value={inclusive ? 'GST Inclusive' : 'GST Exclusive'}
            options={['GST Inclusive', 'GST Exclusive']}
            onChange={(x) => setInclusive(x === 'GST Inclusive')}
          />
          <Pick
            label="SUPPLY TYPE"
            value={inter ? 'IGST / Inter-state' : 'CGST + SGST / Intra-state'}
            options={['IGST / Inter-state', 'CGST + SGST / Intra-state']}
            onChange={(x) => setInter(x === 'IGST / Inter-state')}
          />
        </div>
      </div>

      {/* 3. BUSINESS COST / REALISATION */}
      <div>
        <h3 style={{ fontSize: 13, fontWeight: 900, color: '#176CFF', marginBottom: 8 }}>
          3. BUSINESS COST / REALISATION
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <Field label="Sales Commission %" value={commission} set={setCommission} />
          <Field label="Marketplace Fee %" value={marketFee} set={setMarketFee} />
          <Field label="Sales Return %" value={returns} set={setReturns} />
          <Field label="Salesman Commission %" value={salesman} set={setSalesman} />
          <Field label="Advance Received ₹" value={advance} set={setAdvance} />
          <Field label="Amount Received ₹" value={received} set={setReceived} />
        </div>
      </div>

      {/* FULL METRIC BREAKDOWN */}
      <div
        style={{
          padding: 16,
          borderRadius: 20,
          backgroundColor: '#082F36',
          border: '1px solid #28B9B0',
        }}
      >
        <div style={{ fontSize: 10, color: '#67E8DE', fontWeight: 900, letterSpacing: '1.5px' }}>
          LIVE SALES RESULT
        </div>
        <div style={{ fontSize: 28, color: '#FFF', fontWeight: 900, marginTop: 4 }}>₹{f(c.netSales)}</div>
        <div style={{ fontSize: 10, color: '#B8FFF7', fontWeight: 800, marginTop: 2 }}>
          NET SALES / REALISATION
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
          <M label="Gross Sales" value={'₹' + f(c.gross)} />
          <M label="Total Discount" value={'₹' + f(c.discount + c.tradeDiscount + c.additionalDiscount)} />
          <M label="Taxable Value" value={'₹' + f(c.taxable)} />
          <M label={inter ? 'IGST' : 'CGST + SGST'} value={'₹' + f(c.tax)} />
          <M label="Invoice Total" value={'₹' + f(c.invoice)} />
          <M label="Sales Return" value={'₹' + f(c.returnAmt)} />
          <M label="Total Cost" value={'₹' + f(c.totalCost)} />
          <M label="Profit ₹" value={'₹' + f(c.profit)} accent />
          <M label="Margin %" value={f(c.margin) + '%'} accent />
          <M label="Markup %" value={f(c.markup) + '%'} />
          <M label="Selling / Unit" value={'₹' + f(c.unitNet)} />
          <M label="Pending / Outstanding" value={'₹' + f(c.pending)} />
        </div>
      </div>

      {/* 4. GST BREAKUP */}
      <div>
        <h3 style={{ fontSize: 13, fontWeight: 900, color: '#176CFF', marginBottom: 8 }}>4. GST BREAKUP</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <M label="Taxable" value={'₹' + f(c.taxable)} />
          <M label="CGST" value={'₹' + f(c.cgst)} />
          <M label="SGST" value={'₹' + f(c.sgst)} />
          <M label="IGST" value={'₹' + f(c.igst)} />
        </div>
      </div>

      {/* 5. MARGIN / MARKUP TOOLS */}
      <div>
        <h3 style={{ fontSize: 13, fontWeight: 900, color: '#176CFF', marginBottom: 8 }}>
          5. MARGIN / MARKUP TOOLS
        </h3>
        <div
          style={{
            padding: 14,
            borderRadius: 16,
            backgroundColor: '#F1F6FF',
            border: '1px solid #D4E2F6',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          <div style={{ fontSize: 12, color: '#314B70', fontWeight: 700 }}>
            Actual Margin = Profit ÷ Net Sales × 100
          </div>
          <div style={{ fontSize: 12, color: '#314B70', fontWeight: 700 }}>
            Markup = Profit ÷ Cost × 100
          </div>
          <div style={{ fontSize: 12, color: '#314B70', fontWeight: 700 }}>
            MRP Discount = (MRP − Selling Price) ÷ MRP × 100 = {f(c.discountFromMrp)}%
          </div>
          <div style={{ fontSize: 12, color: '#314B70', fontWeight: 700 }}>
            20% margin selling price = ₹{f(c.marginPriceFor20)} per unit
          </div>
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Field label="TARGET PROFIT MARGIN %" value={targetMargin} set={setTargetMargin} />
            <div style={{ fontSize: 11, color: '#314B70', fontWeight: 700 }}>
              Required selling price at {f(n(targetMargin))}% margin = ₹{f(c.targetMarginPrice)} per unit (margin must be below 100%)
            </div>
          </div>
          <div style={{ fontSize: 12, color: '#314B70', fontWeight: 700, marginTop: 4 }}>
            Free Qty सहित dispatch quantity = {f(c.freeTotal)}
          </div>
        </div>
      </div>

      {/* 6. TARGET / BREAK-EVEN */}
      <div>
        <h3 style={{ fontSize: 13, fontWeight: 900, color: '#176CFF', marginBottom: 8 }}>
          6. TARGET / BREAK-EVEN
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <Field label="Fixed Cost ₹" value={fixed} set={setFixed} />
          <Field label="Sales Target ₹" value={target} set={setTarget} />
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
          <M label="Break-even Qty" value={f(c.breakEven)} />
          <M label="Target Achieved" value={f(c.targetAchieved) + '%'} />
          <M label="Salesman Commission" value={'₹' + f(c.commissionSalesman)} />
          <M label="Marketplace Fee" value={'₹' + f(c.marketplaceAmt)} />
        </div>
      </div>

      {/* 7. CONVERSATIONAL EXAMPLES */}
      <div>
        <h3 style={{ fontSize: 13, fontWeight: 900, color: '#176CFF', marginBottom: 8 }}>
          7. CONVERSATIONAL EXAMPLES
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            [
              '500 motors • ₹850 sale • ₹600 cost • 18% GST • 5% discount',
              () => {
                setQty('500');
                setPrice('850');
                setCost('600');
                setGst('18');
                setDisc('5');
              },
            ],
            [
              '100 pcs • ₹750 sale • ₹500 cost',
              () => {
                setQty('100');
                setPrice('750');
                setCost('500');
              },
            ],
            [
              '₹900 MRP • ₹750 sale price',
              () => {
                setMrp('900');
                setPrice('750');
              },
            ],
            [
              '1000 qty • 50 free',
              () => {
                setQty('1000');
                setFree('50');
              },
            ],
          ].map(([label, fn]: any) => (
            <button
              type="button"
              key={label}
              onClick={fn}
              style={{
                padding: 10,
                borderRadius: 10,
                backgroundColor: '#FFFFFF',
                border: '1px solid #D5E5FA',
                textAlign: 'left',
                color: '#1E3A8A',
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {label} ↗
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
