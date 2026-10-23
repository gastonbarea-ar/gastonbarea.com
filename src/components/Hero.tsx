import React from 'react';
import { 
  TrendingUp, 
  TrendingDown,
  Activity,
} from 'lucide-react';
import { PresentationVideo } from './PresentationVideo';

interface TechStockItem {
  symbol: string;
  name: string;
  price: string;
  change: string;
  isPositive: boolean;
  marketCap: string;
}

const WALL_STREET_TECH_STOCKS: TechStockItem[] = [
  { symbol: 'NVDA', name: 'NVIDIA', price: '$142.85', change: '+3.82%', isPositive: true, marketCap: '$3.51T' },
  { symbol: 'AAPL', name: 'Apple', price: '$236.40', change: '+1.24%', isPositive: true, marketCap: '$3.60T' },
  { symbol: 'MSFT', name: 'Microsoft', price: '$431.15', change: '+1.78%', isPositive: true, marketCap: '$3.20T' },
  { symbol: 'GOOGL', name: 'Alphabet', price: '$184.50', change: '+2.15%', isPositive: true, marketCap: '$2.28T' },
  { symbol: 'AMZN', name: 'Amazon', price: '$199.70', change: '+1.60%', isPositive: true, marketCap: '$2.09T' },
  { symbol: 'META', name: 'Meta', price: '$592.30', change: '+2.90%', isPositive: true, marketCap: '$1.50T' },
  { symbol: 'TSLA', name: 'Tesla', price: '$222.80', change: '+4.35%', isPositive: true, marketCap: '$712B' },
  { symbol: 'ORCL', name: 'Oracle', price: '$176.40', change: '+1.95%', isPositive: true, marketCap: '$485B' },
  { symbol: 'PLTR', name: 'Palantir', price: '$44.60', change: '+6.10%', isPositive: true, marketCap: '$100B' },
  { symbol: 'CRM', name: 'Salesforce', price: '$296.80', change: '+0.92%', isPositive: true, marketCap: '$288B' },
  { symbol: 'QQQ', name: 'Nasdaq 100', price: '$498.20', change: '+1.85%', isPositive: true, marketCap: 'Tech ETF' },
  { symbol: 'BTC/USD', name: 'Bitcoin', price: '$68,950', change: '+3.12%', isPositive: true, marketCap: '$1.36T' },
];

interface HeroProps {
  onExploreServices: () => void;
  onScheduleClick: () => void;
  onWhatsAppClick: () => void;
  onDiagnosticoClick: () => void;
  onExplorePillars?: () => void;
  onClientPortalClick?: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onScheduleClick,
  onWhatsAppClick,
  onDiagnosticoClick,
  onClientPortalClick,
}) => {
  return (
    <section className="relative pt-2 sm:pt-4 pb-12 md:pb-20 overflow-hidden border-b border-blue-900/10 bg-[#F4F4F4]">
      {/* Subtle Integrated Ambient Light Gradient */}
      <div 
        className="absolute top-10 left-1/2 -translate-x-1/2 w-[1000px] h-[350px] bg-gradient-to-b from-blue-400/10 via-indigo-300/10 to-transparent blur-3xl pointer-events-none rounded-full z-0"
        aria-hidden="true"
      />

      {/* MASTER HERO CONTENT - EXACT SAME 1400px WIDTH AND RESPONSIVE PADDING */}
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-2 sm:px-4 md:px-6 text-center space-y-6">
        
        {/* 1. MASTER SHOWCASE FRAME: Video de Fondo + Menú Central Integrado con Marca Gastón Barea (NO MODIFICAR) */}
        <PresentationVideo
          onScheduleClick={onScheduleClick}
          onDiagnosticoClick={onDiagnosticoClick}
          onWhatsAppClick={onWhatsAppClick}
          onClientPortalClick={onClientPortalClick}
        />

        {/* 2. WALL STREET TECH TICKER / VALOR BURSÁTIL TECNOLÓGICAS (PANEL CORREDIZO) */}
        <div className="w-full">
          <div className="relative overflow-hidden rounded-2xl bg-slate-950/95 backdrop-blur-md border border-white/10 shadow-lg text-xs font-mono py-2 sm:py-2.5 px-3 sm:px-4 flex items-center group">
            
            {/* Pinned Left Header: Wall Street Live Terminal Badge */}
            <div className="shrink-0 flex items-center gap-2 pr-3 sm:pr-4 border-r border-white/10 z-20 bg-slate-950/95">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50" />
              <div className="flex flex-col text-left">
                <span className="text-[11px] sm:text-xs font-bold text-white tracking-wider flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden xs:inline">WALL ST</span>
                  <span className="text-emerald-400">TECH</span>
                </span>
                <span className="text-[9px] text-slate-400 font-mono tracking-tight hidden sm:inline">
                  NASDAQ · LIVE FEED
                </span>
              </div>
            </div>

            {/* Edge Gradients for Smooth Infinite Tape Fade */}
            <div className="absolute left-[95px] sm:left-[145px] top-0 bottom-0 w-6 sm:w-10 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-14 bg-gradient-to-l from-slate-950 via-slate-950/80 to-transparent z-10 pointer-events-none" />

            {/* Infinite Marquee Scrolling Tech Stocks Tape */}
            <div className="overflow-hidden w-full flex items-center select-none py-0.5">
              <div className="animate-marquee flex items-center gap-6 sm:gap-8 whitespace-nowrap pl-4 sm:pl-6 cursor-default">
                {/* Loop 1 */}
                {WALL_STREET_TECH_STOCKS.map((stock, idx) => (
                  <div 
                    key={`stock-1-${idx}`} 
                    className="flex items-center gap-2 sm:gap-2.5 hover:bg-white/5 py-1 px-2 rounded-lg transition-colors"
                  >
                    <span className="font-bold text-white tracking-wide text-xs">
                      {stock.symbol}
                    </span>
                    <span className="text-slate-300 font-semibold text-[11px] sm:text-xs">
                      {stock.price}
                    </span>
                    <span 
                      className={`inline-flex items-center gap-0.5 text-[10px] sm:text-[11px] font-bold px-1.5 py-0.5 rounded ${
                        stock.isPositive 
                          ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' 
                          : 'text-rose-400 bg-rose-500/10 border border-rose-500/20'
                      }`}
                    >
                      {stock.isPositive ? (
                        <TrendingUp className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-rose-400" />
                      )}
                      <span>{stock.change}</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono hidden md:inline">
                      ({stock.marketCap})
                    </span>
                    <span className="text-slate-700 ml-1">·</span>
                  </div>
                ))}

                {/* Loop 2 (Duplicate for seamless infinite scroll) */}
                {WALL_STREET_TECH_STOCKS.map((stock, idx) => (
                  <div 
                    key={`stock-2-${idx}`} 
                    className="flex items-center gap-2 sm:gap-2.5 hover:bg-white/5 py-1 px-2 rounded-lg transition-colors"
                  >
                    <span className="font-bold text-white tracking-wide text-xs">
                      {stock.symbol}
                    </span>
                    <span className="text-slate-300 font-semibold text-[11px] sm:text-xs">
                      {stock.price}
                    </span>
                    <span 
                      className={`inline-flex items-center gap-0.5 text-[10px] sm:text-[11px] font-bold px-1.5 py-0.5 rounded ${
                        stock.isPositive 
                          ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' 
                          : 'text-rose-400 bg-rose-500/10 border border-rose-500/20'
                      }`}
                    >
                      {stock.isPositive ? (
                        <TrendingUp className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-rose-400" />
                      )}
                      <span>{stock.change}</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono hidden md:inline">
                      ({stock.marketCap})
                    </span>
                    <span className="text-slate-700 ml-1">·</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Subtle Right Hover Pause Hint */}
            <div className="hidden lg:flex items-center shrink-0 pl-3 border-l border-white/10 z-20 bg-slate-950/95 text-[10px] text-slate-400 font-mono">
              <span className="text-slate-400">Pausar al pasar cursor</span>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
