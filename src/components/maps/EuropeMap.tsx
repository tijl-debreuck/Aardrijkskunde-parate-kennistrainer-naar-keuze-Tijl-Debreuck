import React, { useEffect, useState, useRef } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'motion/react';
import * as topojson from 'topojson-client';
import { europeCapitals, europeRivers, europeMountains, europeSeas } from '../../data/geoData';
import { Layers, Tag } from 'lucide-react';
import { translateName, Language } from '../../utils/language';

interface EuropeMapProps {
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

// Map numeric IDs from world-atlas to Europe IDs in europe.json
const europeIdMap: Record<number, string> = {
  8:   "eu-l-alb", // Albania
  528: "eu-l-ned", // Netherlands
  56:  "eu-l-bel", // Belgium
  442: "eu-l-lux", // Luxembourg
  250: "eu-l-fra", // France
  276: "eu-l-dui", // Germany
  826: "eu-l-gbr", // United Kingdom
  372: "eu-l-ier", // Ireland
  380: "eu-l-ita", // Italy
  724: "eu-l-spa", // Spain
  620: "eu-l-por", // Portugal
  756: "eu-l-zwi", // Switzerland
  40:  "eu-l-oos", // Austria
  616: "eu-l-pol", // Poland
  203: "eu-l-tsj", // Czech Republic
  703: "eu-l-slo", // Slovakia
  348: "eu-l-hon", // Hungary
  191: "eu-l-kro", // Croatia
  705: "eu-l-slv", // Slovenia
  688: "eu-l-ser", // Serbia
  499: "eu-l-mon", // Montenegro
  70:  "eu-l-bos", // Bosnia
  807: "eu-l-nma", // North Macedonia
  300: "eu-l-gri", // Greece
  100: "eu-l-bul", // Bulgaria
  642: "eu-l-roe", // Romania
  498: "eu-l-mol", // Moldova
  804: "eu-l-oek", // Ukraine
  112: "eu-l-wit", // Belarus
  440: "eu-l-lit", // Lithuania
  428: "eu-l-let", // Latvia
  233: "eu-l-est", // Estonia
  643: "eu-l-rus", // Russia
  470: "eu-l-mal", // Malta
  196: "eu-l-cyp", // Cyprus
  208: "eu-l-den", // Denmark
  578: "eu-l-nor", // Norway
  752: "eu-l-swe", // Sweden
  246: "eu-l-fin", // Finland
  352: "eu-l-isl"  // Iceland
};

const EuropeMap = React.memo(function EuropeMap({ activeQuestion, onResult, interactiveMode = true, showCorrectAnswer = false, wrongItems = [], language }: EuropeMapProps) {
  const activeLang: Language = language || (localStorage.getItem('geo_language') as Language) || 'nl';
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [countriesGeo, setCountriesGeo] = useState<any[]>([]);
  const [neighborGeo, setNeighborGeo] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [clickedItem, setClickedItem] = useState<string | null>(null);
  const [isCorrectState, setIsCorrectState] = useState<boolean | null>(null);

  const [zoomScale, setZoomScale] = useState(1);

  // Active layers switches
  const [showCountries, setShowCountries] = useState(true);
  const [showCapitals, setShowCapitals] = useState(true);
  const [showRivers, setShowRivers] = useState(true);
  const [showMountains, setShowMountains] = useState(true);
  const [showSeas, setShowSeas] = useState(true);
  const [showLabels, setShowLabels] = useState(true);

  // Fetch geographic boundaries
  useEffect(() => {
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json')
      .then(res => res.json())
      .then(data => {
        const countriesArr = topojson.feature(data, data.objects.countries) as any;
        const europeanGeometries: any[] = [];
        const neighborGeometries: any[] = [];

        countriesArr.features.forEach((f: any) => {
          const isEurope = f.properties?.name === 'Kosovo' || !!europeIdMap[Number(f.id)];
          if (isEurope) {
            europeanGeometries.push(f);
          } else {
            neighborGeometries.push(f);
          }
        });

        setCountriesGeo(europeanGeometries || []);
        setNeighborGeo(neighborGeometries || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading europe borders", err);
        setLoading(false);
      });
  }, []);

  // Map settings and sizes
  const width = 800;
  const height = 460;

  // Projection setup: Albers or Conic Conformal works beautifully for Europe
  const projection = d3.geoConicConformal()
    .center([11, 52]) // center of Europe lon/lat
    .rotate([0, 0])
    .parallels([35, 65])
    .scale(550) // Zoomed in heavily on Europe
    .translate([width / 2, height / 2 + 30]);

  const pathGenerator = d3.geoPath().projection(projection);

  // Clear states when target changes
  useEffect(() => {
    setClickedItem(null);
    setIsCorrectState(null);
  }, [activeQuestion]);

  const handleEntityClick = (itemId: string, itemName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!interactiveMode || showCorrectAnswer) return;

    setClickedItem(itemId);

    if (activeQuestion) {
      const isCorrect = itemId === activeQuestion.targetId || 
                        itemId.replace('capital-', '') === activeQuestion.targetId.replace('capital-', '') ||
                        itemName.toLowerCase() === activeQuestion.correctAnswer.toLowerCase() ||
                        (activeQuestion.geoItem?.name && itemName.toLowerCase() === activeQuestion.geoItem.name.toLowerCase()) ||
                        (activeQuestion.geoItem?.naam && itemName.toLowerCase() === activeQuestion.geoItem.naam.toLowerCase()) ||
                        (activeQuestion.geoItem?.capital && itemName.toLowerCase() === activeQuestion.geoItem.capital.toLowerCase()) ||
                        (activeQuestion.geoItem?.hoofdstad && itemName.toLowerCase() === activeQuestion.geoItem.hoofdstad.toLowerCase());
      setIsCorrectState(isCorrect);

      if (onResult) {
        onResult(isCorrect, itemName, itemId);
      }
    }
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
            onClick={() => setShowCountries(p => !p)}
            className={`px-3 py-1.5 sm:py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
              showCountries ? 'bg-blue-600/30 border-blue-400 text-blue-200' : 'bg-transparent border-white/10 text-slate-400 hover:text-slate-200'
            }`}
          >
            🌍 Europese Landen
          </button>
          <button 
            onClick={() => setShowCapitals(p => !p)}
            className={`px-3 py-1.5 sm:py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
              showCapitals ? 'bg-amber-600/30 border-amber-400 text-amber-200' : 'bg-transparent border-white/10 text-slate-400 hover:text-slate-200'
            }`}
          >
            🏛️ Hoofdsteden
          </button>
          <button 
            onClick={() => setShowRivers(p => !p)}
            className={`px-3 py-1.5 sm:py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
              showRivers ? 'bg-sky-600/30 border-sky-400 text-sky-200' : 'bg-transparent border-white/10 text-slate-400 hover:text-slate-200'
            }`}
          >
            🌊 Wateren / Rivieren
          </button>
          <button 
            onClick={() => setShowMountains(p => !p)}
            className={`px-3 py-1.5 sm:py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
              showMountains ? 'bg-emerald-600/30 border-emerald-400 text-emerald-200' : 'bg-transparent border-white/10 text-slate-400 hover:text-slate-200'
            }`}
          >
            ⛰️ Gebergten
          </button>
          <button 
            onClick={() => setShowSeas(p => !p)}
            className={`px-3 py-1.5 sm:py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
              showSeas ? 'bg-teal-600/30 border-teal-400 text-teal-200' : 'bg-transparent border-white/10 text-slate-400 hover:text-slate-200'
            }`}
          >
            🌊 Zeeën & Oceanen
          </button>

          {/* Label switch option */}
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
        {loading && (
          <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center space-y-3 z-30">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-mono text-slate-400">Cartografie van Europa laden...</p>
          </div>
        )}

        {/* HUD Game Instruction */}
        {interactiveMode && activeQuestion && (
          <div className="absolute top-2 left-2 right-2 sm:top-4 sm:left-4 sm:right-auto z-20 px-3 py-1.5 sm:px-4 sm:py-2 border border-blue-500/30 rounded-xl backdrop-blur-md shadow-lg" style={{ backgroundColor: "#172540" }}>
            <span className="text-[9px] sm:text-[10px] font-mono font-bold uppercase text-sky-300 block tracking-widest">EUROPESE VRAAG:</span>
            <span className="text-xs sm:text-base font-extrabold tracking-tight text-white block mt-0.5">
              {activeQuestion.category === 'capital'
                ? `Klik op de hoofdstad: ${activeQuestion.correctAnswer}`
                : activeQuestion.category === 'country'
                ? `Klik op het land: ${activeQuestion.correctAnswer}`
                : activeQuestion.category === 'river'
                ? `Klik op de rivier: ${activeQuestion.correctAnswer}`
                : activeQuestion.category === 'mountain'
                ? `Klik op het gebergte: ${activeQuestion.correctAnswer}`
                : `Klik op het object: ${activeQuestion.geoItem?.name || activeQuestion.correctAnswer}`
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
            {/* Seterra Light Sea background color */}
            <rect width={width} height={height} fill="#a9d4f9" />

            {/* Subtle Grayscale Background Layer for Neighboring Continents & Regions */}
            <g id="europe-neighbor-context-layer">
              {neighborGeo.map((f: any, i: number) => {
                const pathData = pathGenerator(f);
                if (!pathData) return null;
                return (
                  <path
                    key={`neighbor-f-${i}`}
                    d={pathData}
                    fill="#e2e8f0"
                    stroke="#cbd5e1"
                    strokeWidth="0.8"
                    className="pointer-events-none select-none opacity-90"
                  />
                );
              })}
            </g>

            {/* Render Countries Layer */}
            <g id="europe-countries-layer">
              {countriesGeo.map((feature, i) => {
                const numericId = Number(feature.id);
                let mappedId = europeIdMap[numericId];
                if (!mappedId && feature.properties?.name === 'Kosovo') {
                  mappedId = 'eu-l-kos';
                }
                mappedId = mappedId || `country-${numericId}`;
                const rawCountryName = feature.properties.name || "Land";
                const countryName = translateName(rawCountryName, activeLang);

                let fill = '#ffffff';
                let stroke = '#64748b';
                
                const isHovered = showCountries && hoveredItem === mappedId;
                const isWrong = showCountries && wrongItems.includes(mappedId);
                const isClicked = showCountries && clickedItem === mappedId;
                const isTheCorrectOne = showCountries && (showCorrectAnswer || (isClicked && isCorrectState)) && mappedId === activeQuestion?.targetId;

                if (isHovered) {
                  fill = '#bae6fd';
                }

                if (isWrong) {
                  fill = '#f43f5e';
                  stroke = '#be123c';
                }

                if (isClicked) {
                  fill = isCorrectState ? '#10b981' : '#f43f5e';
                  stroke = isCorrectState ? '#047857' : '#be123c';
                }

                if (isTheCorrectOne) {
                  fill = '#10b981';
                  stroke = '#047857';
                }

                if (!showCountries) {
                  fill = '#f1f5f9';
                }

                const centroid = pathGenerator.centroid(feature);
                const shouldShowLabel = showCountries && ((!interactiveMode && showLabels) || isWrong || clickedItem === mappedId || isTheCorrectOne);

                return (
                  <g key={`euro-country-grp-${i}`}>
                    <path
                      d={pathGenerator(feature) || ''}
                      fill={fill}
                      stroke={stroke}
                      strokeWidth="0.8"
                      className={`transition-colors duration-155 ${showCountries ? 'cursor-pointer' : 'pointer-events-none'}`}
                      onMouseEnter={showCountries ? () => setHoveredItem(mappedId) : undefined}
                      onMouseLeave={showCountries ? () => setHoveredItem(null) : undefined}
                      onClick={showCountries ? (e) => handleEntityClick(mappedId, countryName, e) : undefined}
                    />
                    {shouldShowLabel && centroid && !isNaN(centroid[0]) && (
                      <g transform={`translate(${centroid[0]}, ${centroid[1]}) scale(${1 / zoomScale})`}>
                        <text
                          x={0}
                          y={0}
                          textAnchor="middle"
                          style={{ paintOrder: 'stroke', stroke: '#ffffff', strokeWidth: '3px', strokeLinejoin: 'round' }}
                          className="text-[11.5px] font-sans font-extrabold fill-slate-900 pointer-events-none"
                        >
                          {countryName}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </g>

            {/* Render Mountain Ranges Layer */}
            <AnimatePresence>
              {showMountains && (
                <motion.g 
                  key="europe-mountains-layer"
                  id="europe-mountains-layer"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                >
                  {europeMountains.map((mount, i) => {
                    const mountName = translateName(mount.name, activeLang);
                    const isHovered = hoveredItem === mount.id;
                    const isWrong = wrongItems.includes(mount.id);
                    const isClicked = clickedItem === mount.id;
                    const coords = mount.coordinates;

                    if (!coords) return null;
                    const [projX, projY] = projection(coords) || [0, 0];

                    const isTheCorrectOne = (showCorrectAnswer || (isClicked && isCorrectState)) && mount.id === activeQuestion?.targetId;
                    let mountainFill = isWrong
                      ? '#f43f5e'
                      : (isClicked 
                          ? (isCorrectState ? '#10b981' : '#f43f5e') 
                          : (isTheCorrectOne ? '#10b981' : (isHovered ? '#f59e0b' : '#b45309')));
                    const shouldShowLabel = (!interactiveMode && showLabels) || isWrong || clickedItem === mount.id || isTheCorrectOne;

                    // Render polygon of the mountain range if available
                    const projectedPolygon = mount.polygon
                      ? (mount.polygon.map(pt => projection(pt)).filter(Boolean) as [number, number][])
                      : null;

                    let polygonPathData = '';
                    if (projectedPolygon && projectedPolygon.length >= 3) {
                      polygonPathData = projectedPolygon.map((pt, idx) => `${idx === 0 ? 'M' : 'L'} ${pt[0].toFixed(1)},${pt[1].toFixed(1)}`).join(' ') + ' Z';
                    }

                    return (
                      <g 
                        key={`euro-mount-${i}`}
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredItem(mount.id)}
                        onMouseLeave={() => setHoveredItem(null)}
                        onClick={(e) => handleEntityClick(mount.id, mountName, e)}
                      >
                        {polygonPathData ? (
                          <>
                            {/* Real GeoJSON mountain range contour polygon */}
                            <path
                              d={polygonPathData}
                              fill={mountainFill}
                              fillOpacity={isHovered ? "0.85" : "0.65"}
                              stroke={isHovered ? "#fbbf24" : "#78350f"}
                              strokeWidth={isHovered ? `${2.2 / Math.sqrt(zoomScale)}` : `${1.2 / Math.sqrt(zoomScale)}`}
                              strokeDasharray={isHovered ? "none" : "3 1"}
                              strokeLinejoin="round"
                              className="transition-all duration-150"
                            />
                            {/* Inner peak hatching line along range center */}
                            {projectedPolygon && projectedPolygon.length > 4 && (
                              <path
                                d={`M ${projectedPolygon[0][0]},${projectedPolygon[0][1]} L ${projectedPolygon[Math.floor(projectedPolygon.length/2)][0]},${projectedPolygon[Math.floor(projectedPolygon.length/2)][1]}`}
                                stroke="#fef3c7"
                                strokeWidth={1.2 / Math.sqrt(zoomScale)}
                                strokeDasharray="4 2"
                                strokeLinecap="round"
                                className="pointer-events-none opacity-80"
                              />
                            )}
                          </>
                        ) : (
                          /* Fallback multi-peak mountain range icon if polygon not defined */
                          <g transform={`translate(${projX}, ${projY}) scale(${1 / zoomScale})`}>
                            <path
                              d="M -16,6 L -10,-7 L -5,-1 L 0,-14 L 6,1 L 11,-8 L 17,6 Z"
                              fill={mountainFill}
                              stroke="#fef3c7"
                              strokeWidth="1"
                              strokeLinejoin="round"
                            />
                            <path d="M -10,-7 L -8,-2 M 0,-14 L 2,-6 M 11,-8 L 13,-3" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" />
                          </g>
                        )}
                        {shouldShowLabel && (
                          <g transform={`translate(${projX}, ${projY}) scale(${1 / zoomScale})`}>
                            <rect x={-(mountName.length * 4.2 + 6)} y="-10" width={mountName.length * 8.4 + 12} height="18" rx="4" fill="#78350f" stroke="#ffffff" strokeWidth="1" />
                            <text
                              x="0"
                              y="3"
                              textAnchor="middle"
                              className="text-[10px] font-sans font-black fill-white pointer-events-none"
                            >
                              {mountName}
                            </text>
                          </g>
                        )}
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
                  key="europe-rivers-layer"
                  id="europe-rivers-layer"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                >
                  {europeRivers.map((river, i) => {
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
                          : (isTheCorrectOne ? '#10b981' : (isHovered ? '#2563eb' : '#0284c7')));
                    const shouldShowLabel = (!interactiveMode && showLabels) || isWrong || clickedItem === river.id || isTheCorrectOne;

                    return (
                      <g key={`euro-river-${i}`}>
                        {/* Transparent wider hit path for easier clicking */}
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
                          strokeWidth={isHovered ? `${3.5 / Math.sqrt(zoomScale)}` : `${2 / Math.sqrt(zoomScale)}`}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="transition-all duration-150 pointer-events-none drop-shadow-sm"
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

            {/* Render Seas & Oceans Layer */}
            <AnimatePresence>
              {showSeas && (
                <motion.g 
                  key="europe-seas-layer"
                  id="europe-seas-layer"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                >
                  {europeSeas.map((sea, i) => {
                    const seaName = translateName(sea.name, activeLang);
                    if (!sea.coordinates) return null;
                    const [projX, projY] = projection(sea.coordinates) || [0, 0];

                    const isHovered = hoveredItem === sea.id;
                    const isWrong = wrongItems.includes(sea.id);
                    const isClicked = clickedItem === sea.id;
                    const isTheCorrectOne = (showCorrectAnswer || (isClicked && isCorrectState)) && activeQuestion?.targetId === sea.id;

                    let seaBadgeBg = isWrong
                      ? '#f43f5e'
                      : (isClicked
                          ? (isCorrectState ? '#10b981' : '#f43f5e')
                          : (isTheCorrectOne ? '#10b981' : (isHovered ? '#0284c7' : '#0369a1')));

                    const shouldShowLabel = (!interactiveMode && showLabels) || isWrong || clickedItem === sea.id || isTheCorrectOne;

                    return (
                      <g 
                        key={`euro-sea-${i}`}
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredItem(sea.id)}
                        onMouseLeave={() => setHoveredItem(null)}
                        onClick={(e) => handleEntityClick(sea.id, seaName, e)}
                      >
                        {/* Nautical wave symbol */}
                        <g transform={`translate(${projX}, ${projY}) scale(${1 / zoomScale})`}>
                          <circle
                            r="11"
                            fill={seaBadgeBg}
                            fillOpacity={isHovered || isTheCorrectOne || isClicked ? 0.95 : 0.75}
                            stroke="#ffffff"
                            strokeWidth="1.2"
                            className="transition-all duration-150 shadow-sm"
                          />
                          <path
                            d="M -5,1 Q -2.5,-3 0,1 Q 2.5,-3 5,1"
                            fill="none"
                            stroke="#ffffff"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                        </g>

                        {shouldShowLabel && (
                          <g transform={`translate(${projX}, ${projY + 16}) scale(${1 / zoomScale})`}>
                            <rect
                              x={-(seaName.length * 3.8 + 6)}
                              y="-8"
                              width={seaName.length * 7.6 + 12}
                              height="16"
                              rx="3"
                              fill={seaBadgeBg}
                              stroke="#ffffff"
                              strokeWidth="0.8"
                              className="shadow-sm"
                            />
                            <text
                              x="0"
                              y="3"
                              textAnchor="middle"
                              className="text-[9.5px] font-sans font-bold fill-white pointer-events-none"
                            >
                              {seaName}
                            </text>
                          </g>
                        )}
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
                  key="europe-capitals-layer"
                  id="europe-capitals-layer"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                >
                  {europeCapitals.map((cap, i) => {
                    const capName = translateName(cap.name, activeLang);
                    if (!cap.coordinates) return null;
                    const [projX, projY] = projection(cap.coordinates) || [0, 0];

                    const isHovered = hoveredItem === cap.id;
                    const isWrong = wrongItems.includes(cap.id);
                    const isClicked = clickedItem === cap.id;
                    const isTheCorrectOne = (showCorrectAnswer || (isClicked && isCorrectState)) && activeQuestion?.targetId === cap.id;

                    let color = '#f59e0b';
                    let radius = isHovered ? 6 : 3.5;

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

                    const shouldShowLabel = (!interactiveMode && showLabels) || isWrong || clickedItem === cap.id || isTheCorrectOne;

                    return (
                      <g 
                        key={`euro-cap-${i}`}
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredItem(cap.id)}
                        onMouseLeave={() => setHoveredItem(null)}
                        onClick={(e) => handleEntityClick(cap.id, capName, e)}
                      >
                        <g transform={`translate(${projX}, ${projY}) scale(${1 / zoomScale})`}>
                          <circle
                            cx={0}
                            cy={0}
                            r={radius}
                            fill={color}
                            stroke="#0f172a"
                            strokeWidth="1"
                          />
                          {shouldShowLabel && (
                            <text
                              x={0}
                              y={-8}
                              textAnchor="middle"
                              style={{ paintOrder: 'stroke', stroke: '#ffffff', strokeWidth: '3px', strokeLinejoin: 'round' }}
                              className="text-[11px] font-sans font-extrabold fill-slate-900 pointer-events-none"
                            >
                              {capName}
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

export default EuropeMap;
