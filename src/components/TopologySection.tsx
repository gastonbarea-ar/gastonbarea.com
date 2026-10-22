import React, { useState } from 'react';
import { 
  Globe, 
  Cpu, 
  Database, 
  Server, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { OSWindowFrame } from './common/OSWindowFrame';

export const TopologySection: React.FC = () => {
  const [activeLayer, setActiveLayer] = useState<number>(0);

  const layers = [
    {
      id: 0,
      title: 'Frontend & Experiencia UI/UX',
      tag: 'Edge / SSR',
      icon: Globe,
      techs: 'Next.js · React · Tailwind CSS · PWA',
      role: 'Presentación responsiva, Server-Side Rendering (SSR) y aplicaciones web progresivas (PWA) de carga instantánea.',
      specs: [
        { label: 'Renderizado', value: 'Edge Delivery & Server-Side Rendering' },
        { label: 'Norma de Diseño', value: 'Mobile-First, WCAG 2.1 AA, cero dependencias pesadas' },
        { label: 'Seguridad', value: 'JWT Bearer, validación Zod y sanitización en cliente' },
        { label: 'Tolerancia', value: 'Caché offline y service workers integrados' }
      ]
    },
    {
      id: 1,
      title: 'Capa de Servicios & Integraciones',
      tag: 'Alta Concurrencia',
      icon: Cpu,
      techs: 'APIs REST · Odoo ERP · Microservicios Node / Python',
      role: 'Orquestación de lógica de negocio, módulos de gestión corporativa en Odoo y APIs desacopladas.',
      specs: [
        { label: 'Plataforma Core', value: 'Odoo ERP (Ventas, Facturación, Inventario y CRM)' },
        { label: 'Microservicios', value: 'Node.js y Python FastAPI asíncrono' },
        { label: 'Integración', value: 'REST JSON, Webhooks y RPC sobre TLS 1.3' },
        { label: 'Arquitectura', value: 'Procesos modulares desacoplados en contenedores' }
      ]
    },
    {
      id: 2,
      title: 'Bases de Datos & Persistencia ACID',
      tag: 'Cero Pérdida',
      icon: Database,
      techs: 'PostgreSQL · Supabase · Backups Cifrados Diarios',
      role: 'Almacenamiento transaccional de máxima integridad relacional, modelos analíticos y replicación.',
      specs: [
        { label: 'Motor Relacional', value: 'PostgreSQL 16+ empresarial con indexación avanzada' },
        { label: 'Aislamiento', value: 'Row Level Security (RLS) y esquemas segregados' },
        { label: 'Copias de Seguridad', value: 'Volcado diario cifrado AES-256 con retención offsite' },
        { label: 'Cumplimiento', value: 'ACID estricto, transacciones atómicas seguras' }
      ]
    },
    {
      id: 3,
      title: 'Infraestructura Host & Seguridad Perimetral',
      tag: '99.9% Uptime',
      icon: Server,
      techs: 'Linux Ubuntu Server · Docker Compose · Nginx · WireGuard VPN',
      role: 'Entorno de ejecución aislado en hardware dedicado o VPS con defensas perimetrales activas.',
      specs: [
        { label: 'Sistema Base', value: 'Ubuntu Server LTS con kernel optimizado' },
        { label: 'Contenedores', value: 'Docker & Docker Compose con cuotas de recursos' },
        { label: 'Reverse Proxy', value: 'Nginx con compresión Brotli y HTTP/2 & HTTP/3' },
        { label: 'Defensa de Red', value: 'UFW Firewall, llaves ED25519 y VPN WireGuard' }
      ]
    }
  ];

  return (
    <section id="topologia" className="py-20 md:py-28 bg-[#F4F4F4] relative border-b border-blue-900/10">
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-2 sm:px-4 md:px-6 space-y-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30 shadow-xs text-xs font-mono font-semibold">
            <Server className="w-3.5 h-3.5 text-sky-400" />
            <span>TOPOLOGÍA DE SISTEMAS</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-blue-950 leading-tight">
            Ingeniería para Producción Continua
          </h2>
          <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-normal">
            Arquitectura multicapa desacoplada para sistemas corporativos, transacciones seguras y tolerancia a fallos.
          </p>
        </div>

        {/* FUNCTIONAL OS WINDOW: TOPOLOGY MONITOR */}
        <OSWindowFrame
          accentTheme="sky"
          processName="sys/net/topology-monitor.net"
          windowTitle="TOPOLOGÍA DE SISTEMAS · ARQUITECTURA MULTICAPA & REDES"
          securityBadge="VPN WIREGUARD & ED25519"
          statusBadge="4 CAPAS EN LÍNEA"
          portBadge="HTTP/3 · QUIC · TLS 1.3"
          className="my-0 px-0"
          footerTelemetry={[
            { label: 'LAYER', value: layers[activeLayer].tag, highlight: true },
            { label: 'PERSISTENCE', value: 'ACID POSTGRESQL' },
            { label: 'DEFENSE', value: 'UFW + WIREGUARD' },
          ]}
        >
          <div className="p-4 sm:p-6 md:p-8 bg-slate-950/98 text-left">
            {/* Bento Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Stack list (6 cols) */}
              <div className="lg:col-span-6 space-y-3">
                {layers.map((layer) => {
                  const Icon = layer.icon;
                  const isSelected = activeLayer === layer.id;

                  return (
                    <button
                      key={layer.id}
                      onClick={() => setActiveLayer(layer.id)}
                      type="button"
                      className={`w-full text-left p-5 sm:p-6 rounded-2xl border transition-all duration-200 relative group cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600/20 border-blue-400 shadow-lg shadow-blue-500/10 ring-1 ring-blue-400'
                          : 'bg-slate-900/70 border-white/10 hover:border-white/20 hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                            isSelected ? 'bg-blue-600 text-white' : 'bg-slate-800 text-sky-400 group-hover:bg-slate-700'
                          }`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className={`text-sm sm:text-base font-bold ${
                              isSelected ? 'text-white' : 'text-slate-200'
                            }`}>
                              {layer.title}
                            </h3>
                            <p className="text-xs font-mono text-slate-400 mt-0.5">
                              {layer.techs}
                            </p>
                          </div>
                        </div>

                        <span className={`text-[11px] font-mono px-2.5 py-1 rounded-full border shrink-0 font-medium ${
                          isSelected
                            ? 'text-sky-300 bg-blue-500/20 border-blue-400/30'
                            : 'text-slate-400 bg-slate-800 border-white/10'
                        }`}>
                          {layer.tag}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Deep inspection card (6 cols) */}
              <div className="lg:col-span-6">
                <div className="rounded-3xl bg-slate-900/90 border border-white/10 p-6 sm:p-8 shadow-xl relative space-y-6">
                  
                  <div className="flex items-center justify-between pb-4 border-b border-white/10">
                    <div className="text-xs font-mono tracking-wider text-sky-400 uppercase font-semibold flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span>Inspección de Capa</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono font-medium">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Verificado en Producción</span>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                        {layers[activeLayer].title}
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                        {layers[activeLayer].role}
                      </p>
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="text-xs font-mono uppercase tracking-wider text-sky-300 font-semibold">
                        Protocolos & Especificaciones:
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {layers[activeLayer].specs.map((spec, i) => (
                          <div key={i} className="p-3.5 rounded-xl bg-slate-950/60 border border-white/10">
                            <div className="text-[10px] font-mono uppercase text-sky-400 font-medium">
                              {spec.label}
                            </div>
                            <div className="text-xs font-semibold text-slate-200 mt-1">
                              {spec.value}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-400/20 text-xs text-slate-300 leading-relaxed font-mono">
                      <span className="text-sky-300 font-bold">Invariante de Arquitectura:</span> Todo componente es desplegado mediante infraestructura como código reproducible, con volúmenes de persistencia aislados y recuperación con cero downtime.
                    </div>

                  </div>

                </div>
              </div>
            </div>
          </div>
        </OSWindowFrame>

      </div>
    </section>
  );
};
