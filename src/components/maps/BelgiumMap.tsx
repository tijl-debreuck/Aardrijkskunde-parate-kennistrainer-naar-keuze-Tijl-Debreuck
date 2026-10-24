import React, { useEffect, useState, useRef } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'motion/react';
import provincesData from '../../data/belgium.json';
import { belgiumRivers, belgiumHighways, belgiumPorts, belgiumPeaks, belgiumTaalgrens } from '../../data/geoData';
import { Layers, Tag } from 'lucide-react';
import { translateName, Language } from '../../utils/language';

interface BelgiumMapProps {
  activeQuestion?: {
    id: string;
    targetId: string;
    correctAnswer: string;
    geoItem?: any;
    category?: string;
  } | null;
  onResult?: (isCorrect: boolean, chosenVal: string, clickedId: string) => void;
  interactiveMode?: boolean;
  showCorrectAnswer?: boolean;
  wrongItems?: string[];
  language?: Language;
}

const BelgiumMap = React.memo(function BelgiumMap({ activeQuestion, onResult, interactiveMode = true, showCorrectAnswer = false, wrongItems = [], language }: BelgiumMapProps) {
  const activeLang: Language = language || (localStorage.getItem('geo_language') as Language) || 'nl';
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [clickedItem, setClickedItem] = useState<string | null>(null);
  const [isCorrectState, setIsCorrectState] = useState<boolean | null>(null);

  const [zoomScale, setZoomScale] = useState(1);

  // Active layers switches
  const [showRegions, setShowRegions] = useState(false);
  const [showProvinces, setShowProvinces] = useState(true);
  const [showCapitals, setShowCapitals] = useState(true);
  const [showRivers, setShowRivers] = useState(true);
  const [showHighways, setShowHighways] = useState(true);
  const [showPorts, setShowPorts] = useState(true);
  const [showFeatures, setShowFeatures] = useState(true);
  const [showLabels, setShowLabels] = useState(true);

  // Map settings and sizes
  const width = 800;
  const height = 460;

  // Projection setup for Belgium: Mercator centered at [4.4699, 50.5039]
  const projection = d3.geoMercator()
    .center([4.4699, 50.5039])
    .scale(10000) // Heavily centered on Belgium
    .translate([width / 2, height / 2 + 10]);

  // Clear states when target changes
  useEffect(() => {
    setClickedItem(null);
    setIsCorrectState(null);
  }, [activeQuestion]);

  const handleEntityClick = (itemId: string, itemName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!interactiveMode || showCorrectAnswer) return;

    const vlaamsProvIds = ['be-p-wvl', 'be-p-ovl', 'be-p-ant', 'be-p-lim', 'be-p-vbr'];
    const waalsProvIds = ['be-p-brw', 'be-p-hen', 'be-p-nam', 'be-p-lui', 'be-p-lux'];
    
    let resolvedId = itemId;
    let resolvedName = itemName;

    if (activeQuestion?.category === 'region' || activeQuestion?.targetId?.startsWith('be-reg-') || showRegions) {
      if (vlaamsProvIds.includes(itemId) || itemId === 'be-reg-vla') {
        resolvedId = 'be-reg-vla';
        resolvedName = 'Vlaams Gewest';
      } else if (waalsProvIds.includes(itemId) || itemId === 'be-reg-waa') {
        resolvedId = 'be-reg-waa';
        resolvedName = 'Waals Gewest';
      } else if (itemId === 'be-p-bru' || itemId === 'be-reg-bru') {
        resolvedId = 'be-reg-bru';
        resolvedName = 'Brussels Hoofdstedelijk Gewest';
      }
    }

    setClickedItem(resolvedId);

    if (activeQuestion) {
      const isCorrect = resolvedId === activeQuestion.targetId || 
                        itemId === activeQuestion.targetId ||
                        itemId.replace('capital-', '') === activeQuestion.targetId.replace('capital-', '') ||
                        resolvedName.toLowerCase() === activeQuestion.correctAnswer.toLowerCase() ||
                        itemName.toLowerCase() === activeQuestion.correctAnswer.toLowerCase() ||
                        (activeQuestion.geoItem?.name && resolvedName.toLowerCase() === activeQuestion.geoItem.name.toLowerCase()) ||
                        (activeQuestion.geoItem?.name && itemName.toLowerCase() === activeQuestion.geoItem.name.toLowerCase()) ||
                        (activeQuestion.geoItem?.naam && resolvedName.toLowerCase() === activeQuestion.geoItem.naam.toLowerCase()) ||
                        (activeQuestion.geoItem?.capital && itemName.toLowerCase() === activeQuestion.geoItem.capital.toLowerCase()) ||
                        (activeQuestion.geoItem?.hoofdstad && itemName.toLowerCase() === activeQuestion.geoItem.hoofdstad.toLowerCase());
      setIsCorrectState(isCorrect);

      if (onResult) {
        onResult(isCorrect, resolvedName, resolvedId);
      }
    }
  };

  // Build polygon path drawing utilizing projected coordinates list
  const getPolygonPathData = (polygonPoints: [number, number][]) => {
    if (!polygonPoints) return '';
    const projected = polygonPoints.map(point => {
      const projectedPoint = projection(point);
      return projectedPoint ? `${projectedPoint[0]},${projectedPoint[1]}` : '';
    }).filter(Boolean);
    return `M ${projected.join(' L ')} Z`;
  };

  const zoomRef = useRef<any>(null);
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    let rafId: number | null = null;
    let lastK = 1;

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 8])
      .on("zoom", (e) => {
        svg.select("g#map-zoom-group").attr("transform", e.transform as string);
        if (Math.abs(e.transform.k - lastK) > 0.01) {
          lastK = e.transform.k;
          if (rafId) cancelAnimationFrame(rafId);
          rafId = requestAnimationFrame(() => {
            setZoomScale(e.transform.k);
          });
        }
      });
    zoomRef.current = zoom;
    svg.call(zoom);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  const handleZoomIn = () => {
    if (svgRef.current && zoomRef.current) {
      d3.select(svgRef.current as any).transition().duration(300).call(zoomRef.current.scaleBy, 1.5);
    }
  };

  const handleZoomOut = () => {
    if (svgRef.current && zoomRef.current) {
      d3.select(svgRef.current as any).transition().duration(300).call(zoomRef.current.scaleBy, 0.66);
    }
  };

  return (
    <div className="space-y-4">
      {/* Map Control Layer Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-2.5 sm:p-3.5 border border-blue-900/40 rounded-2xl backdrop-blur-md" style={{ backgroundColor: "#172540" }}>
        <div className="flex items-center gap-2 shrink-0">
          <Layers className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-mono font-bold uppercase text-slate-300">Zichtbare Lagen:</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar whitespace-nowrap py-0.5 max-w-full">
          <button 
            onClick={() => setShowRegions(p => !p)}
            className={`px-3 py-1.5 sm:py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
              showRegions || activeQuestion?.category === 'region' ? 'bg-emerald-600/30 border-emerald-400 text-emerald-200' : 'bg-transparent border-white/10 text-slate-400 hover:text-slate-200'
            }`}
          >
            🇧🇪 Gewesten
          </button>
          <button 
            onClick={() => setShowProvinces(p => !p)}
            className={`px-3 py-1.5 sm:py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
              showProvinces ? 'bg-blue-600/30 border-blue-400 text-blue-200' : 'bg-transparent border-white/10 text-slate-400 hover:text-slate-200'
            }`}
          >
            🇧🇪 Provincies
          </button>
          <button 
            onClick={() => setShowCapitals(p => !p)}
            className={`px-3 py-1.5 sm:py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
              showCapitals ? 'bg-amber-600/30 border-amber-400 text-amber-200' : 'bg-transparent border-white/10 text-slate-400 hover:text-slate-200'
            }`}
          >
            🏛️ Provinciehoofdsteden
          </button>
          <button 
            onClick={() => setShowRivers(p => !p)}
            className={`px-3 py-1.5 sm:py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
              showRivers ? 'bg-sky-600/30 border-sky-400 text-sky-200' : 'bg-transparent border-white/10 text-slate-400 hover:text-slate-200'
            }`}
          >
            🌊 Waterlopen & Kanalen
          </button>
          <button 
            onClick={() => setShowHighways(p => !p)}
            className={`px-3 py-1.5 sm:py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
              showHighways ? 'bg-orange-600/30 border-orange-400 text-orange-200' : 'bg-transparent border-white/10 text-slate-400 hover:text-slate-200'
            }`}
          >
            🛣️ Autosnelwegen
          </button>
          <button 
            onClick={() => setShowPorts(p => !p)}
            className={`px-3 py-1.5 sm:py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
              showPorts ? 'bg-cyan-600/30 border-cyan-400 text-cyan-200' : 'bg-transparent border-white/10 text-slate-400 hover:text-slate-200'
            }`}
          >
            ⚓ Havens
          </button>
          <button 
            onClick={() => setShowFeatures(p => !p)}
            className={`px-3 py-1.5 sm:py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
              showFeatures ? 'bg-purple-600/30 border-purple-400 text-purple-200' : 'bg-transparent border-white/10 text-slate-400 hover:text-slate-200'
            }`}
          >
            📍 Parate Kennis
          </button>

          {/* Toggle label names option (Study mode only) */}
          <button
            onClick={() => !interactiveMode && setShowLabels(prev => !prev)}
            disabled={interactiveMode}
            title={interactiveMode ? "Namen zijn verborgen tijdens de quiz" : "Schakel plaatsnamen in of uit"}
            className={`px-3 py-1.5 sm:py-1 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 ${
              interactiveMode 
                ? 'opacity-40 bg-slate-800 text-slate-500 border-white/5 cursor-not-allowed'
                : (showLabels 
                    ? 'bg-indigo-600/30 border-indigo-400 text-indigo-200 shadow-sm cursor-pointer' 
                    : 'bg-transparent border-white/10 text-slate-400 hover:text-slate-200 cursor-pointer')
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            Namen {interactiveMode ? '(Quiz)' : (showLabels ? '(Aan)' : '(Uit)')}
          </button>
        </div>
      </div>

      {/* Main Map SVG Area */}
      <div className="relative border border-blue-900/40 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl" style={{ backgroundColor: "#0f172a" }}>
        {/* HUD Game Instruction */}
        {interactiveMode && activeQuestion && (
          <div className="absolute top-2 left-2 right-2 sm:top-4 sm:left-4 sm:right-auto z-20 px-3 py-1.5 sm:px-4 sm:py-2 border border-blue-500/30 rounded-xl backdrop-blur-md shadow-lg" style={{ backgroundColor: "#172540" }}>
            <span className="text-[9px] sm:text-[10px] font-mono font-bold uppercase text-sky-300 block tracking-widest">BELGISCHE VRAAG:</span>
            <span className="text-xs sm:text-base font-extrabold tracking-tight text-white block mt-0.5">
              {activeQuestion.geoItem?.capital && activeQuestion.category === 'capital'
                ? `Klik op de provinciehoofdstad: ${activeQuestion.correctAnswer}`
                : activeQuestion.category === 'highway'
                ? `Klik op de autosnelweg: ${activeQuestion.correctAnswer}`
                : activeQuestion.category === 'province'
                ? `Klik op de provincie: ${activeQuestion.correctAnswer}`
                : activeQuestion.category === 'river'
                ? `Klik op de rivier: ${activeQuestion.correctAnswer}`
                : `Klik op het geografisch object: ${activeQuestion.geoItem?.name || activeQuestion.correctAnswer}`
              }
            </span>
          </div>
        )}

        <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 flex flex-col gap-2 z-10">
          <button onClick={handleZoomIn} className="w-11 h-11 sm:w-10 sm:h-10 flex items-center justify-center bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-white rounded-xl backdrop-blur-md border border-white/10 shadow-lg text-2xl font-bold cursor-pointer transition-all">+</button>
          <button onClick={handleZoomOut} className="w-11 h-11 sm:w-10 sm:h-10 flex items-center justify-center bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-white rounded-xl backdrop-blur-md border border-white/10 shadow-lg text-2xl font-bold cursor-pointer transition-all">-</button>
        </div>

        <svg 
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto max-h-[calc(100dvh-180px)] min-h-[300px] sm:min-h-[440px] select-none text-slate-100 touch-pan-x touch-pan-y"
          style={{ cursor: interactiveMode ? 'crosshair' : 'grab' }}
        >
          <g id="map-zoom-group">
            {/* Continental Land Backdrop (No water surrounding inland borders or in center!) */}
            <rect width={width} height={height} fill="#e2e8f0" />

            {/* Dedicated North Sea (Noordzee) only at the coast in North-West */}
            <path
              d="M 0,0 L 290,0 L 235,50 L 175,85 L 110,115 L 45,145 L 0,165 Z"
              fill="#93c5fd"
              stroke="#60a5fa"
              strokeWidth="1.2"
            />

            {/* Render Neighboring Countries Layer (Subtle Grayscale Orientation Context) */}
            <g id="neighbors-layer">
              {((provincesData as any).neighbors || []).map((neighbor: any, i: number) => {
                const pathData = getPolygonPathData(neighbor.polygon);
                const [centroidX, centroidY] = neighbor.coordinates ? projection(neighbor.coordinates) || [0, 0] : [0, 0];
                return (
                  <g key={`neighbor-${neighbor.id}-${i}`}>
                    <path
                      d={pathData}
                      fill="#cbd5e1"
                      stroke="#94a3b8"
                      strokeWidth="1.2"
                      strokeDasharray="3 3"
                    />
                    {centroidX > 0 && centroidY > 0 && (
                      <g transform={`translate(${centroidX}, ${centroidY}) scale(${1 / zoomScale})`}>
                        <text
                          x={0}
                          y={0}
                          textAnchor="middle"
                          className="text-[11px] font-sans font-bold fill-slate-500 tracking-wider uppercase pointer-events-none opacity-80"
                        >
                          {translateName(neighbor.name, activeLang)}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
              {/* Noordzee orientation label */}
              <text
                x={projection([2.65, 51.35])?.[0] || 90}
                y={projection([2.65, 51.35])?.[1] || 70}
                textAnchor="middle"
                className="text-[12px] font-serif italic font-extrabold fill-sky-800/80 tracking-widest uppercase pointer-events-none"
              >
                {translateName("Noordzee", activeLang)}
              </text>
            </g>

            {/* Render Provinces & Gewesten Layer */}
            {(() => {
              const isRegionActive = showRegions || activeQuestion?.category === 'region' || activeQuestion?.targetId?.startsWith('be-reg-');
              const vlaamsProvIds = ['be-p-wvl', 'be-p-ovl', 'be-p-ant', 'be-p-lim', 'be-p-vbr'];
              const waalsProvIds = ['be-p-brw', 'be-p-hen', 'be-p-nam', 'be-p-lui', 'be-p-lux'];

              return (
                <g id="provinces-layer">
                  {provincesData.provinces.map((province: any, i) => {
                    const provId = province.id;
                    const rawProvName = province.name;
                    const provName = translateName(rawProvName, activeLang);
                    const pathData = getPolygonPathData(province.polygon);

                    const isFlemish = vlaamsProvIds.includes(provId);
                    const isWalloon = waalsProvIds.includes(provId);

                    let fill = isRegionActive ? (isFlemish ? '#fef08a' : '#fecdd3') : '#ffffea';
                    let stroke = isRegionActive ? (isFlemish ? '#ca8a04' : '#e11d48') : '#475569';

                    const isProvHovered = hoveredItem === provId;
                    const isRegionHovered = isRegionActive && (
                      (isFlemish && (hoveredItem === 'be-reg-vla' || vlaamsProvIds.includes(hoveredItem || ''))) ||
                      (isWalloon && (hoveredItem === 'be-reg-waa' || waalsProvIds.includes(hoveredItem || '')))
                    );

                    if (isProvHovered || isRegionHovered) {
                      fill = '#bae6fd';
                    }

                    const isProvWrong = wrongItems.includes(provId);
                    const isRegionWrong = isRegionActive && (
                      (isFlemish && wrongItems.includes('be-reg-vla')) ||
                      (isWalloon && wrongItems.includes('be-reg-waa'))
                    );
                    if (isProvWrong || isRegionWrong) {
                      fill = '#f43f5e';
                      stroke = '#be123c';
                    }

                    const isProvClicked = clickedItem === provId;
                    const isRegionClicked = isRegionActive && (
                      (isFlemish && clickedItem === 'be-reg-vla') ||
                      (isWalloon && clickedItem === 'be-reg-waa')
                    );
                    if (isProvClicked || isRegionClicked) {
                      fill = isCorrectState ? '#10b981' : '#f43f5e';
                      stroke = isCorrectState ? '#047857' : '#be123c';
                    }

                    const isProvTarget = (showCorrectAnswer || (isCorrectState && (isProvClicked || isRegionClicked))) && provId === activeQuestion?.targetId;
                    const isRegionTarget = isRegionActive && (showCorrectAnswer || (isCorrectState && (isProvClicked || isRegionClicked))) && (
                      (isFlemish && activeQuestion?.targetId === 'be-reg-vla') ||
                      (isWalloon && activeQuestion?.targetId === 'be-reg-waa')
                    );

                    if (isProvTarget || isRegionTarget) {
                      fill = '#10b981';
                      stroke = '#047857';
                    }

                    if (!showProvinces && !isRegionActive) {
                      fill = '#f1f5f9';
                    }

                    const shouldShowLabel = (!isRegionActive && showProvinces && ((!interactiveMode && showLabels) || isProvWrong || isProvClicked || isProvTarget));
                    const [centroidX, centroidY] = province.coordinates ? projection(province.coordinates) || [0, 0] : [0, 0];

                    return (
                      <g key={`province-grp-${i}`}>
                        <path
                          d={pathData}
                          fill={fill}
                          stroke={stroke}
                          strokeWidth="1.2"
                          className="transition-colors duration-155 cursor-pointer"
                          onMouseEnter={() => setHoveredItem(isRegionActive ? (isFlemish ? 'be-reg-vla' : 'be-reg-waa') : provId)}
                          onMouseLeave={() => setHoveredItem(null)}
                          onClick={(e) => handleEntityClick(provId, provName, e)}
                        />
                        {shouldShowLabel && centroidX > 0 && (
                          <g transform={`translate(${centroidX}, ${centroidY}) scale(${1 / zoomScale})`}>
                            <text
                              x={0}
                              y={0}
                              textAnchor="middle"
                              style={{ paintOrder: 'stroke', stroke: '#ffffff', strokeWidth: '3.5px', strokeLinejoin: 'round' }}
                              className="text-[12px] font-sans font-extrabold fill-slate-900 pointer-events-none"
                            >
                              {provName}
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })}

                  {/* Gewesten Top-Level Overlay Labels when in Gewesten mode */}
                  {isRegionActive && (
                    <>
                      <g transform={`translate(${projection([3.9, 51.05])?.[0] || 320}, ${projection([3.9, 51.05])?.[1] || 150}) scale(${1 / zoomScale})`}>
                        <text
                          x={0}
                          y={0}
                          textAnchor="middle"
                          style={{ paintOrder: 'stroke', stroke: '#ffffff', strokeWidth: '4px', strokeLinejoin: 'round' }}
                          className="text-[15px] font-sans font-black fill-amber-950 pointer-events-none tracking-wide"
                        >
                          Vlaams Gewest
                        </text>
                      </g>
                      <g transform={`translate(${projection([4.9, 50.25])?.[0] || 480}, ${projection([4.9, 50.25])?.[1] || 320}) scale(${1 / zoomScale})`}>
                        <text
                          x={0}
                          y={0}
                          textAnchor="middle"
                          style={{ paintOrder: 'stroke', stroke: '#ffffff', strokeWidth: '4px', strokeLinejoin: 'round' }}
                          className="text-[15px] font-sans font-black fill-rose-950 pointer-events-none tracking-wide"
                        >
                          Waals Gewest
                        </text>
                      </g>
                    </>
                  )}
                </g>
              );
            })()}

            {/* Render Brussels Enclave Layer */}
            {(provincesData as any).brussels && (() => {
              const bru = (provincesData as any).brussels;
              const bruCapital = translateName(bru.capital || bru.name, activeLang);
              const pathData = getPolygonPathData(bru.polygon);
              const isRegionActive = showRegions || activeQuestion?.category === 'region' || activeQuestion?.targetId?.startsWith('be-reg-');

              const isBruHovered = hoveredItem === bru.id || hoveredItem === 'be-reg-bru';
              const isBruWrong = wrongItems.includes(bru.id) || wrongItems.includes('be-reg-bru');
              const isBruClicked = clickedItem === bru.id || clickedItem === 'be-reg-bru';
              const isBruTarget = (showCorrectAnswer || (isBruClicked && isCorrectState)) && (bru.id === activeQuestion?.targetId || 'be-reg-bru' === activeQuestion?.targetId);

              let fill = isRegionActive ? '#bae6fd' : '#fed7aa';
              let stroke = isRegionActive ? '#0284c7' : '#c2410c';

              if (isBruHovered) fill = '#7dd3fc';
              if (isBruWrong) {
                fill = '#f43f5e';
                stroke = '#be123c';
              }
              if (isBruClicked) {
                fill = isCorrectState ? '#10b981' : '#f43f5e';
                stroke = isCorrectState ? '#047857' : '#be123c';
              }
              if (isBruTarget) {
                fill = '#10b981';
                stroke = '#047857';
              }

              const [centroidX, centroidY] = projection(bru.coordinates) || [0, 0];
              const shouldShowLabel = (!interactiveMode && showLabels) || isBruWrong || isBruClicked || isBruTarget || isRegionActive;

              return (
                <g id="brussels-enclave-layer">
                  <path
                    d={pathData}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth="1.5"
                    className="transition-colors duration-155 cursor-pointer"
                    onMouseEnter={() => setHoveredItem(isRegionActive ? 'be-reg-bru' : bru.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                    onClick={(e) => handleEntityClick(isRegionActive ? 'be-reg-bru' : bru.id, isRegionActive ? 'Brussels Hoofdstedelijk Gewest' : bruCapital, e)}
                  />
                  {shouldShowLabel && (
                    <g transform={`translate(${centroidX}, ${centroidY}) scale(${1 / zoomScale})`}>
                      <text
                        x={0}
                        y={0}
                        textAnchor="middle"
                        style={{ paintOrder: 'stroke', stroke: '#ffffff', strokeWidth: '3px', strokeLinejoin: 'round' }}
                        className="text-[11px] font-sans font-black fill-blue-950 pointer-events-none"
                      >
                        {isRegionActive ? "Brussel" : bruCapital}
                      </text>
                    </g>
                  )}
                </g>
              );
            })()}

            {/* Render Highways Layer */}
            <AnimatePresence>
              {showHighways && (
                <motion.g 
                  key="belgium-highways-layer"
                  id="belgium-highways-layer"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                >
                  {belgiumHighways.map((hw, i) => {
                    const hwName = translateName(hw.name, activeLang);
                    const isHovered = hoveredItem === hw.id;
                    const isWrong = wrongItems.includes(hw.id);
                    const isClicked = clickedItem === hw.id;
                    const isTheCorrectOne = (showCorrectAnswer || (isClicked && isCorrectState)) && activeQuestion?.targetId === hw.id;
                    const lineGenerator = d3.line().curve(d3.curveBasis);
                    if (!hw.coordinatesList) return null;

                    const projectedPoints = hw.coordinatesList.map(coord => projection(coord) || [0, 0]);
                    const pathData = lineGenerator(projectedPoints as [number, number][]);

                    let strokeColor = isWrong
                      ? '#f43f5e'
                      : (isTheCorrectOne
                          ? '#10b981'
                          : isClicked
                            ? (isCorrectState ? '#10b981' : '#f43f5e')
                            : (isHovered ? '#1d4ed8' : '#2563eb'));

                    let badgeBg = isWrong
                      ? '#f43f5e'
                      : (isTheCorrectOne
                          ? '#10b981'
                          : isClicked
                            ? (isCorrectState ? '#10b981' : '#f43f5e')
                            : (isHovered ? '#1d4ed8' : '#1e40af'));

                    const shouldShowLabel = (!interactiveMode && showLabels) || isWrong || clickedItem === hw.id || isTheCorrectOne;

                    return (
                      <g key={`bel-hw-${i}`}>
                        {/* Transparent wider hit path for easier click & hover */}
                        <path
                          d={pathData || ''}
                          fill="none"
                          stroke="transparent"
                          strokeWidth="16"
                          className="cursor-pointer"
                          onMouseEnter={() => setHoveredItem(hw.id)}
                          onMouseLeave={() => setHoveredItem(null)}
                          onClick={(e) => handleEntityClick(hw.id, hwName, e)}
                        />
                        <path
                          d={pathData || ''}
                          fill="none"
                          stroke={strokeColor}
                          strokeWidth={isHovered || isClicked || isTheCorrectOne || isWrong ? `${5 / Math.sqrt(zoomScale)}` : `${3.5 / Math.sqrt(zoomScale)}`}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="transition-all duration-150 cursor-pointer pointer-events-none drop-shadow-sm"
                        />
                        {hw.coordinates && shouldShowLabel && (() => {
                          const [lblX, lblY] = projection(hw.coordinates) || [0, 0];
                          return (
                            <g transform={`translate(${lblX}, ${lblY - 6}) scale(${1 / zoomScale})`} className="pointer-events-none">
                              <rect x="-16" y="-10" width="32" height="18" rx="4" fill={badgeBg} stroke="#ffffff" strokeWidth="1.2" />
                              <text x="0" y="3.5" textAnchor="middle" className="text-[10.5px] font-sans font-black fill-white">
                                {hwName}
                              </text>
                            </g>
                          );
                        })()}
                      </g>
                    );
                  })}
                </motion.g>
              )}
            </AnimatePresence>

            {/* Render Rivers Layer */}
            <AnimatePresence>
              {showRivers && (
                <motion.g 
                  key="belgium-rivers-layer"
                  id="belgium-rivers-layer"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                >
                  {belgiumRivers.map((river, i) => {
                    const riverName = translateName(river.name, activeLang);
                    const isHovered = hoveredItem === river.id;
                    const isWrong = wrongItems.includes(river.id);
                    const isClicked = clickedItem === river.id;
                    const isTheCorrectOne = (showCorrectAnswer || (isClicked && isCorrectState)) && activeQuestion?.targetId === river.id;
                    const lineGenerator = d3.line().curve(d3.curveBasis);

                    if (!river.coordinatesList) return null;

                    const projectedPoints = river.coordinatesList.map(coord => projection(coord) || [0, 0]);
                    const pathData = lineGenerator(projectedPoints as [number, number][]);

                    let strokeColor = isWrong
                      ? '#f43f5e'
                      : (isClicked 
                          ? (isCorrectState ? '#10b981' : '#f43f5e') 
                          : (isTheCorrectOne ? '#10b981' : (isHovered ? '#60a5fa' : '#38bdf8')));
                    const shouldShowLabel = (!interactiveMode && showLabels) || isWrong || clickedItem === river.id || isTheCorrectOne;

                    return (
                      <g key={`bel-river-${i}`}>
                        {/* Transparent wider hit path for easy clicking */}
                        <path
                          d={pathData || ''}
                          fill="none"
                          stroke="transparent"
                          strokeWidth="14"
                          className="cursor-pointer"
                          onMouseEnter={() => setHoveredItem(river.id)}
                          onMouseLeave={() => setHoveredItem(null)}
                          onClick={(e) => handleEntityClick(river.id, riverName, e)}
                        />
                        <path
                          d={pathData || ''}
                          fill="none"
                          stroke={strokeColor}
                          strokeWidth={isHovered ? `${4 / Math.sqrt(zoomScale)}` : `${2.4 / Math.sqrt(zoomScale)}`}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="transition-all duration-155 pointer-events-none drop-shadow-sm"
                        />
                        {river.coordinates && shouldShowLabel && (() => {
                          const [lblX, lblY] = projection(river.coordinates) || [0, 0];
                          return (
                            <g transform={`translate(${lblX}, ${lblY}) scale(${1 / zoomScale})`}>
                              <text
                                x={0}
                                y={-4}
                                textAnchor="middle"
                                style={{ paintOrder: 'stroke', stroke: '#ffffff', strokeWidth: '3px', strokeLinejoin: 'round' }}
                                className="text-[11px] font-sans font-extrabold fill-sky-950 pointer-events-none"
                              >
                                {riverName}
                              </text>
                            </g>
                          );
                        })()}
                      </g>
                    );
                  })}
                </motion.g>
              )}
            </AnimatePresence>

            {/* Render Capitals Layer */}
            <AnimatePresence>
              {showCapitals && (
                <motion.g 
                  key="belgium-capitals-layer"
                  id="belgium-capitals-layer"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                >
                  {provincesData.provinces.map((prov: any, i) => {
                    const provCapital = translateName(prov.capital, activeLang);
                    if (!prov.coordinates) return null;
                    const [projX, projY] = projection(prov.coordinates) || [0, 0];

                    const capId = `capital-${prov.id}`;
                    const isHovered = hoveredItem === capId;
                    const isWrong = wrongItems.includes(capId);
                    const isClicked = clickedItem === capId;
                    const isTheCorrectOne = (showCorrectAnswer || (isClicked && isCorrectState)) && activeQuestion?.targetId === capId;

                    let color = '#f59e0b';
                    let radius = isHovered ? 6 : 4;

                    if (isWrong) {
                      color = '#f43f5e';
                      radius = 6.5;
                    }
                    if (isClicked) {
                      color = isCorrectState ? '#10b981' : '#f43f5e';
                      radius = 7;
                    }
                    if (isTheCorrectOne) {
                      color = '#10b981';
                      radius = 7.5;
                    }

                    const shouldShowLabel = (!interactiveMode && showLabels) || isWrong || clickedItem === capId || isTheCorrectOne;

                    return (
                      <g 
                        key={`bel-cap-${i}`}
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredItem(capId)}
                        onMouseLeave={() => setHoveredItem(null)}
                        onClick={(e) => handleEntityClick(capId, provCapital, e)}
                      >
                        <g transform={`translate(${projX}, ${projY}) scale(${1 / zoomScale})`}>
                          <circle
                            cx={0}
                            cy={0}
                            r={radius}
                            fill={color}
                            stroke="#0f172a"
                            strokeWidth="1.2"
                          />
                          {shouldShowLabel && (
                            <text
                              x={0}
                              y={-8}
                              textAnchor="middle"
                              style={{ paintOrder: 'stroke', stroke: '#ffffff', strokeWidth: '3px', strokeLinejoin: 'round' }}
                              className="text-[11px] font-sans font-extrabold fill-slate-900 pointer-events-none"
                            >
                              {provCapital}
                            </text>
                          )}
                        </g>
                      </g>
                    );
                  })}
                </motion.g>
              )}
            </AnimatePresence>

            {/* Render Ports Layer */}
            <AnimatePresence>
              {showPorts && (
                <motion.g 
                  key="belgium-ports-layer"
                  id="belgium-ports-layer"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {belgiumPorts.map((port, i) => {
                    const portName = translateName(port.name, activeLang);
                    if (!port.coordinates) return null;
                    const [projX, projY] = projection(port.coordinates) || [0, 0];

                    const portId = port.id;
                    const isHovered = hoveredItem === portId;
                    const isWrong = wrongItems.includes(portId);
                    const isClicked = clickedItem === portId;
                    const isTheCorrectOne = (showCorrectAnswer || (isClicked && isCorrectState)) && (activeQuestion?.targetId === portId || activeQuestion?.targetId?.includes(portId));

                    let color = '#0284c7';
                    if (isHovered) color = '#38bdf8';
                    if (isWrong) color = '#f43f5e';
                    if (isClicked) color = isCorrectState ? '#10b981' : '#f43f5e';
                    if (isTheCorrectOne) color = '#10b981';

                    const shouldShowLabel = (!interactiveMode && showLabels) || isWrong || clickedItem === portId || isTheCorrectOne;

                    return (
                      <g 
                        key={`bel-port-${i}`}
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredItem(portId)}
                        onMouseLeave={() => setHoveredItem(null)}
                        onClick={(e) => handleEntityClick(portId, portName, e)}
                      >
                        <g transform={`translate(${projX}, ${projY}) scale(${1 / zoomScale})`}>
                          <rect x="-6" y="-6" width="12" height="12" rx="3" fill={color} stroke="#ffffff" strokeWidth="1.5" />
                          {shouldShowLabel && (
                            <text
                              x={0}
                              y={-10}
                              textAnchor="middle"
                              style={{ paintOrder: 'stroke', stroke: '#ffffff', strokeWidth: '3px', strokeLinejoin: 'round' }}
                              className="text-[10.5px] font-sans font-black fill-sky-950 pointer-events-none"
                            >
                              ⚓ {portName}
                            </text>
                          )}
                        </g>
                      </g>
                    );
                  })}
                </motion.g>
              )}
            </AnimatePresence>

            {/* Render Parate Kennis Features Layer (Botrange peak & Taalgrens line) */}
            <AnimatePresence>
              {showFeatures && (
                <motion.g 
                  key="belgium-features-layer"
                  id="belgium-features-layer"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Taalgrens */}
                  {(() => {
                    const tg = belgiumTaalgrens;
                    const tgName = translateName(tg.name, activeLang);
                    const isHovered = hoveredItem === tg.id;
                    const isWrong = wrongItems.includes(tg.id);
                    const isClicked = clickedItem === tg.id;
                    const isTheCorrectOne = (showCorrectAnswer || (isClicked && isCorrectState)) && activeQuestion?.targetId === tg.id;
                    const lineGenerator = d3.line().curve(d3.curveBasis);
                    const projectedPoints = tg.coordinatesList?.map(coord => projection(coord) || [0, 0]) || [];
                    const pathData = lineGenerator(projectedPoints as [number, number][]);

                    let strokeColor = isWrong
                      ? '#f43f5e'
                      : (isTheCorrectOne
                          ? '#10b981'
                          : isClicked
                            ? (isCorrectState ? '#10b981' : '#f43f5e')
                            : (isHovered ? '#8b5cf6' : '#a855f7'));

                    const shouldShowLabel = (!interactiveMode && showLabels) || isWrong || clickedItem === tg.id || isTheCorrectOne;

                    return (
                      <g key="bel-taalgrens-group">
                        <path
                          d={pathData || ''}
                          fill="none"
                          stroke="transparent"
                          strokeWidth="14"
                          className="cursor-pointer"
                          onMouseEnter={() => setHoveredItem(tg.id)}
                          onMouseLeave={() => setHoveredItem(null)}
                          onClick={(e) => handleEntityClick(tg.id, tgName, e)}
                        />
                        <path
                          d={pathData || ''}
                          fill="none"
                          stroke={strokeColor}
                          strokeWidth={isHovered ? `${3.5 / Math.sqrt(zoomScale)}` : `${2.2 / Math.sqrt(zoomScale)}`}
                          strokeDasharray="6 3"
                          strokeLinecap="round"
                          className="transition-all duration-150 pointer-events-none drop-shadow-sm"
                        />
                        {tg.coordinates && shouldShowLabel && (() => {
                          const [lblX, lblY] = projection(tg.coordinates) || [0, 0];
                          return (
                            <g transform={`translate(${lblX}, ${lblY - 8}) scale(${1 / zoomScale})`} className="pointer-events-none">
                              <text
                                x={0}
                                y={0}
                                textAnchor="middle"
                                style={{ paintOrder: 'stroke', stroke: '#ffffff', strokeWidth: '3px', strokeLinejoin: 'round' }}
                                className="text-[10px] font-sans font-bold fill-purple-900"
                              >
                                {tgName}
                              </text>
                            </g>
                          );
                        })()}
                      </g>
                    );
                  })()}

                  {/* Signaal van Botrange Peak */}
                  {belgiumPeaks.map((peak, i) => {
                    const peakName = translateName(peak.name, activeLang);
                    if (!peak.coordinates) return null;
                    const [projX, projY] = projection(peak.coordinates) || [0, 0];
                    const isHovered = hoveredItem === peak.id;
                    const isWrong = wrongItems.includes(peak.id);
                    const isClicked = clickedItem === peak.id;
                    const isTheCorrectOne = (showCorrectAnswer || (isClicked && isCorrectState)) && activeQuestion?.targetId === peak.id;

                    let color = '#b45309';
                    if (isHovered) color = '#d97706';
                    if (isWrong) color = '#f43f5e';
                    if (isClicked) color = isCorrectState ? '#10b981' : '#f43f5e';
                    if (isTheCorrectOne) color = '#10b981';

                    const shouldShowLabel = (!interactiveMode && showLabels) || isWrong || clickedItem === peak.id || isTheCorrectOne;

                    return (
                      <g 
                        key={`bel-peak-${i}`}
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredItem(peak.id)}
                        onMouseLeave={() => setHoveredItem(null)}
                        onClick={(e) => handleEntityClick(peak.id, peakName, e)}
                      >
                        <g transform={`translate(${projX}, ${projY}) scale(${1 / zoomScale})`}>
                          <polygon points="0,-8 7,5 -7,5" fill={color} stroke="#ffffff" strokeWidth="1.2" />
                          {shouldShowLabel && (
                            <text
                              x={0}
                              y={-12}
                              textAnchor="middle"
                              style={{ paintOrder: 'stroke', stroke: '#ffffff', strokeWidth: '3px', strokeLinejoin: 'round' }}
                              className="text-[10px] font-sans font-black fill-amber-950 pointer-events-none"
                            >
                              ▲ {peakName} (694m)
                            </text>
                          )}
                        </g>
                      </g>
                    );
                  })}
                </motion.g>
              )}
            </AnimatePresence>
          </g>
        </svg>
      </div>
    </div>
  );
});

export default BelgiumMap;
