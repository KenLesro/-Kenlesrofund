import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, ComposedChart, Area } from 'recharts';
import { Activity, Zap, Shield, Brain, Cpu, Terminal, TrendingUp, AlertTriangle, RefreshCw } from 'lucide-react';

// --- MATH & PHYSICS ENGINE ---
const PhysicsEngine = {
  generateMarketData: (ticker, days = 100) => {
    let price = 100 + Math.random() * 50;
    const data = [];
    const vol = 0.02; 
    for (let i = 0; i < days; i++) {
      const change = (Math.random() - 0.5) * vol * price;
      price += change;
      const volume = Math.floor(Math.random() * 5000000) + 1000000;
      const ma20 = price * (1 + (Math.random() - 0.5) * 0.05);
      const reflexivity = ((price - ma20) / ma20) * (volume / 2500000);
      data.push({
        date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        close: price,
        reflexivity: reflexivity
      });
    }
    return data;
  },
  monteCarloSimulation: (startPrice, days = 10, sims = 50) => {
    const paths = [];
    const dt = 1 / 252;
    const vol = 0.35; 
    const drift = 0.05; 
    for (let i = 0; i < sims; i++) {
      let currentPrice = startPrice;
      const path = [{ day: 0, price: currentPrice }];
      for (let t = 1; t <= days; t++) {
        const shock = (Math.random() + Math.random() + Math.random() + Math.random() + Math.random() + Math.random() - 3) / Math.sqrt(0.5); 
        const ret = (drift - 0.5 * vol * vol) * dt + vol * Math.sqrt(dt) * shock;
        currentPrice = currentPrice * Math.exp(ret);
        path.push({ day: t, price: currentPrice });
      }
      paths.push(path);
    }
    return paths;
  },
  fftSpectrum: (dataPoints) => {
    return Array.from({ length: 30 }, (_, i) => ({
      frequency: i + 1,
      amplitude: Math.abs(Math.sin(i * 0.5)) * Math.random() * 10 + (30 - i) * 0.5
    }));
  }
};

// --- UI COMPONENTS ---
const Card = ({ children, className = "" }) => (
  <div className={`bg-gray-900 border border-gray-800 rounded-lg p-4 ${className}`}>{children}</div>
);

const Metric = ({ label, value, sub, color = "text-white" }) => (
  <div className="flex flex-col">
    <span className="text-gray-500 text-xs uppercase tracking-wider">{label}</span>
    <span className={`text-xl font-bold font-mono ${color}`}>{value}</span>
    {sub && <span className="text-gray-600 text-xs">{sub}</span>}
  </div>
);

// --- MAIN APP COMPONENT ---
export default function TitanTerminal() {
  const [ticker, setTicker] = useState("BTC-USD");
  const [capital, setCapital] = useState(1000000);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("market");
  
  const [marketData, setMarketData] = useState([]);
  const [mcPaths, setMcPaths] = useState([]);
  const [fftData, setFftData] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [risk, setRisk] = useState(null);

  const runAnalysis = () => {
    setLoading(true);
    setTimeout(() => {
      const data = PhysicsEngine.generateMarketData(ticker);
      const currentPrice = data[data.length - 1].close;
      const mc = PhysicsEngine.monteCarloSimulation(currentPrice);
      const fft = PhysicsEngine.fftSpectrum(data);
      
      // Simplified Logic
      const last = data[data.length - 1];
      const prev = data[data.length - 20];
      const momentum = (last.close - prev.close) / prev.close + (Math.random() - 0.5) * 0.1;
      const signal = momentum > 0.02 ? 'BULLISH' : momentum < -0.02 ? 'BEARISH' : 'NEUTRAL';
      
      const returns = data.slice(1).map((d, i) => Math.log(d.close / data[i].close));
      returns.sort((a, b) => a - b);
      const var95 = Math.abs(returns[Math.floor(returns.length * 0.05)]);

      setMarketData(data);
      setMcPaths(mc);
      setFftData(fft);
      setAnalysis({ score: momentum, signal });
      setRisk({ varPct: var95, varCash: var95 * capital, kelly: 0.15 + Math.random() * 0.1 });
      setLoading(false);
    }, 800);
  };

  useEffect(() => { runAnalysis(); }, []);
  const fmtUSD = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
  const fmtPct = (n) => (n * 100).toFixed(2) + '%';

  return (
    <div className="min-h-screen bg-black text-gray-300 font-sans p-6">
      <header className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
        <div className="flex items-center gap-2">
          <Activity className="text-blue-500 h-6 w-6" />
          <h1 className="text-xl font-bold text-white">Q-FUND <span className="text-blue-500">TITAN</span></h1>
        </div>
        <div className="text-xs font-mono text-gray-500 flex gap-4">
          <span>CORE: ONLINE</span><span>AI: ACTIVE</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Panel */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="space-y-4 border-l-4 border-l-blue-600">
            <div className="flex items-center gap-2 text-white font-semibold">
              <Terminal className="h-4 w-4" /><span>System Control</span>
            </div>
            <input type="text" value={ticker} onChange={(e) => setTicker(e.target.value.toUpperCase())} className="w-full bg-black border border-gray-700 rounded px-3 py-2 text-white font-mono" />
            <input type="number" value={capital} onChange={(e) => setCapital(parseFloat(e.target.value))} className="w-full bg-black border border-gray-700 rounded px-3 py-2 text-white font-mono" />
            <button onClick={runAnalysis} disabled={loading} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold flex justify-center gap-2">
              {loading ? <RefreshCw className="animate-spin h-4 w-4"/> : <Zap className="h-4 w-4" />} {loading ? 'PROCESSING...' : 'EXECUTE'}
            </button>
          </Card>
          
          <Card>
             <div className="flex items-center gap-2 mb-2 text-purple-400 font-semibold"><Brain className="h-4 w-4" /><span>Neural Engine</span></div>
             {analysis && <Metric label="Signal" value={analysis.signal} color={analysis.signal==='BULLISH'?'text-emerald-400':analysis.signal==='BEARISH'?'text-red-400':'text-yellow-400'} />}
          </Card>

          <Card>
            <div className="flex items-center gap-2 mb-2 text-emerald-400 font-semibold"><Shield className="h-4 w-4" /><span>Risk</span></div>
            {risk && <Metric label="VaR (95%)" value={fmtUSD(risk.varCash)} sub={fmtPct(risk.varPct)} />}
          </Card>
        </div>

        {/* Right Panel */}
        <div className="lg:col-span-9 space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">{ticker}</h2>
            <div className="flex gap-2">
              {['market', 'monte', 'fft'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-1 rounded text-xs font-bold uppercase ${activeTab === tab ? 'bg-gray-700 text-white' : 'text-gray-500'}`}>{tab}</button>
              ))}
            </div>
          </div>

          <div className="h-[400px] w-full bg-gray-900 border border-gray-800 rounded-lg p-4">
             <ResponsiveContainer width="100%" height="100%">
               {activeTab === 'market' ? (
                 <ComposedChart data={marketData}>
                   <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                   <XAxis dataKey="date" stroke="#4b5563" tick={{fontSize: 10}} tickFormatter={(val) => val.substring(5)} />
                   <YAxis stroke="#4b5563" tick={{fontSize: 10}} />
                   <RechartsTooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151' }} />
                   <Area type="monotone" dataKey="close" stroke="#3b82f6" fillOpacity={0.1} fill="#3b82f6" />
                   <Bar dataKey="reflexivity" fill="#ef4444" opacity={0.5} yAxisId="right" />
                   <YAxis yAxisId="right" orientation="right" hide />
                 </ComposedChart>
               ) : activeTab === 'monte' ? (
                 <LineChart>
                   <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                   <XAxis dataKey="day" stroke="#4b5563" />
                   <YAxis stroke="#4b5563" domain={['auto', 'auto']} />
                   {mcPaths.map((path, idx) => <Line key={idx} data={path} type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={1} strokeOpacity={0.2} dot={false} />)}
                 </LineChart>
               ) : (
                 <BarChart data={fftData}>
                   <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                   <XAxis dataKey="frequency" stroke="#4b5563" />
                   <YAxis stroke="#4b5563" />
                   <Bar dataKey="amplitude" fill="#10b981" />
                 </BarChart>
               )}
             </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
