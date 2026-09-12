// Modular Map Service & Provider Abstraction for Krishi Mentor
// Supports Leaflet, multiple tile layers (Satellite, Street, Terrain), field polygon drawing, and offline fallback

import L from 'leaflet';
import { LatLngTuple, MapTileProvider } from '../../types/geospatial';
import { Farm } from '../../types/farm';
import { Field, FieldObservation, FieldHealthStatus } from '../../types/field';
import { calculatePolygonArea } from '../geospatial/geospatialService';

export interface MapInitOptions {
  center: LatLngTuple;
  zoom: number;
  tileProvider?: MapTileProvider;
  onMapClick?: (latlng: LatLngTuple) => void;
}

export interface IMapAdapter {
  initialize(container: HTMLElement, options: MapInitOptions): void;
  setCenter(center: LatLngTuple, zoom?: number): void;
  setTileProvider(provider: MapTileProvider): void;
  renderFarm(farm: Farm, onFarmClick?: () => void): void;
  renderFields(fields: Field[], selectedFieldId?: string, onSelectField?: (field: Field) => void): void;
  renderObservations(observations: FieldObservation[], onSelectObservation?: (obs: FieldObservation) => void): void;
  startDrawing(onPointAdded: (points: LatLngTuple[], currentAreaAcres: number) => void): void;
  undoLastDrawPoint(): LatLngTuple[];
  clearDrawing(): void;
  finishDrawing(): LatLngTuple[];
  isDrawingActive(): boolean;
  getDrawnPoints(): LatLngTuple[];
  invalidateSize(): void;
  destroy(): void;
}

// Health status color palette
export const HEALTH_COLOR_PALETTE: Record<
  FieldHealthStatus,
  { stroke: string; fill: string; badgeBg: string; text: string; label: string; labelHi: string }
> = {
  HEALTHY: {
    stroke: '#059669',
    fill: '#10b981',
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    text: 'text-emerald-700',
    label: 'Healthy',
    labelHi: 'स्वस्थ',
  },
  MONITOR: {
    stroke: '#d97706',
    fill: '#f59e0b',
    badgeBg: 'bg-amber-100 text-amber-800 border-amber-300',
    text: 'text-amber-700',
    label: 'Monitor',
    labelHi: 'निगरानी जरूरी',
  },
  AT_RISK: {
    stroke: '#ea580c',
    fill: '#f97316',
    badgeBg: 'bg-orange-100 text-orange-800 border-orange-300',
    text: 'text-orange-700',
    label: 'At Risk',
    labelHi: 'जोखिम में',
  },
  HIGH_RISK: {
    stroke: '#dc2626',
    fill: '#ef4444',
    badgeBg: 'bg-red-100 text-red-800 border-red-300',
    text: 'text-red-700',
    label: 'High Risk',
    labelHi: 'गंभीर जोखिम',
  },
  UNKNOWN: {
    stroke: '#0284c7',
    fill: '#38bdf8',
    badgeBg: 'bg-sky-100 text-sky-800 border-sky-300',
    text: 'text-sky-700',
    label: 'Not Assessed',
    labelHi: 'अजांचित',
  },
};

export class LeafletMapAdapter implements IMapAdapter {
  private map: L.Map | null = null;
  private currentTileLayer: L.TileLayer | null = null;
  private farmLayerGroup: L.LayerGroup = L.layerGroup();
  private fieldsLayerGroup: L.LayerGroup = L.layerGroup();
  private observationsLayerGroup: L.LayerGroup = L.layerGroup();
  private drawingLayerGroup: L.LayerGroup = L.layerGroup();

  private drawingActive = false;
  private drawnPoints: LatLngTuple[] = [];
  private onPointAddedCallback: ((points: LatLngTuple[], currentAreaAcres: number) => void) | null = null;

  initialize(container: HTMLElement, options: MapInitOptions): void {
    if (this.map) {
      this.destroy();
    }

    // Default Leaflet icon path fix
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    this.map = L.map(container, {
      center: options.center,
      zoom: options.zoom,
      zoomControl: false,
      attributionControl: true,
      maxZoom: 19,
      minZoom: 4,
    });

    // Add zoom control at bottom-right for clean mobile ergonomics
    L.control
      .zoom({
        position: 'bottomright',
      })
      .addTo(this.map);

    this.setTileProvider(options.tileProvider || 'satellite_hybrid');

    this.farmLayerGroup.addTo(this.map);
    this.fieldsLayerGroup.addTo(this.map);
    this.observationsLayerGroup.addTo(this.map);
    this.drawingLayerGroup.addTo(this.map);

    // Map click event handling for drawing or selecting
    this.map.on('click', (e: L.LeafletMouseEvent) => {
      const clickedTuple: LatLngTuple = [
        Math.round(e.latlng.lat * 10000) / 10000,
        Math.round(e.latlng.lng * 10000) / 10000,
      ];

      if (this.drawingActive) {
        this.addDrawPoint(clickedTuple);
      } else if (options.onMapClick) {
        options.onMapClick(clickedTuple);
      }
    });

    // Invalidate size shortly after mount to ensure crisp tile layout
    setTimeout(() => {
      if (this.map) this.map.invalidateSize();
    }, 200);
  }

  setCenter(center: LatLngTuple, zoom?: number): void {
    if (!this.map) return;
    if (zoom) {
      this.map.setView(center, zoom, { animate: true });
    } else {
      this.map.panTo(center, { animate: true });
    }
  }

  setTileProvider(provider: MapTileProvider): void {
    if (!this.map) return;

    if (this.currentTileLayer) {
      this.map.removeLayer(this.currentTileLayer);
    }

    let url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    let attribution = '&copy; OpenStreetMap contributors';
    let maxZoom = 19;

    if (provider === 'satellite_hybrid') {
      // High-resolution Esri World Imagery
      url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      attribution = 'Tiles &copy; Esri, Maxar, Earthstar Geographics';
      maxZoom = 18;
    } else if (provider === 'topo_terrain') {
      url = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
      attribution = 'Map data &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap';
      maxZoom = 17;
    }

    this.currentTileLayer = L.tileLayer(url, {
      maxZoom,
      attribution,
      detectRetina: true,
    }).addTo(this.map);
  }

  renderFarm(farm: Farm, onFarmClick?: () => void): void {
    this.farmLayerGroup.clearLayers();
    if (!this.map || !farm.location.latitude || !farm.location.longitude) return;

    const lat = farm.location.latitude;
    const lng = farm.location.longitude;

    // Custom Farm Pin Icon with pulsed radar indicator
    const farmIconHtml = `
      <div class="relative flex items-center justify-center cursor-pointer group" style="width: 48px; height: 48px;">
        <div class="absolute w-10 h-10 bg-emerald-500/20 rounded-full animate-ping"></div>
        <div class="w-10 h-10 bg-stone-900 border-2 border-emerald-400 rounded-2xl shadow-xl flex items-center justify-center text-white transition transform group-hover:scale-110">
          <svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
          </svg>
        </div>
      </div>
    `;

    const icon = L.divIcon({
      html: farmIconHtml,
      className: 'custom-farm-marker',
      iconSize: [48, 48],
      iconAnchor: [24, 24],
    });

    const marker = L.marker([lat, lng], { icon });

    const popupHtml = `
      <div class="p-2.5 font-sans min-w-[200px] text-stone-900">
        <div class="flex items-center justify-between gap-2 border-b border-stone-100 pb-1.5 mb-1.5">
          <span class="font-bold text-sm text-stone-900">${farm.name}</span>
          ${farm.isDemo ? '<span class="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">DEMO</span>' : ''}
        </div>
        <div class="text-xs text-stone-600 mb-2">
          📍 ${farm.village ? `${farm.village}, ` : ''}${farm.district}, ${farm.state}
        </div>
        <div class="grid grid-cols-2 gap-1 text-[11px] bg-stone-50 p-2 rounded-lg mb-2">
          <div><span class="text-stone-500 block">Primary Crop</span><strong>${farm.primaryCrop}</strong></div>
          <div><span class="text-stone-500 block">Fields</span><strong>${farm.fields.length} Field(s)</strong></div>
        </div>
      </div>
    `;

    marker.bindPopup(popupHtml, { closeButton: true });

    if (onFarmClick) {
      marker.on('click', () => onFarmClick());
    }

    this.farmLayerGroup.addLayer(marker);
  }

  renderFields(
    fields: Field[],
    selectedFieldId?: string,
    onSelectField?: (field: Field) => void
  ): void {
    this.fieldsLayerGroup.clearLayers();
    if (!this.map) return;

    for (const field of fields) {
      const palette = HEALTH_COLOR_PALETTE[field.healthStatus] || HEALTH_COLOR_PALETTE.UNKNOWN;
      const isSelected = selectedFieldId === field.id;

      // Render boundary polygon if points exist
      if (field.boundary && field.boundary.length >= 3) {
        const polygon = L.polygon(field.boundary, {
          color: isSelected ? '#ffffff' : palette.stroke,
          weight: isSelected ? 3.5 : 2.5,
          fillColor: palette.fill,
          fillOpacity: isSelected ? 0.45 : 0.28,
          dashArray: isSelected ? undefined : '4, 4',
        });

        // Tooltip showing field name & crop
        polygon.bindTooltip(
          `<strong>${field.name}</strong> • ${field.crop} (${field.area ? `${field.area} ${field.areaUnit || 'ac'}` : ''})`,
          {
            permanent: false,
            direction: 'center',
            className: 'field-map-tooltip text-xs font-semibold px-2 py-1 rounded bg-stone-900 text-white shadow',
          }
        );

        if (onSelectField) {
          polygon.on('click', () => onSelectField(field));
        }

        this.fieldsLayerGroup.addLayer(polygon);

        // Center badge marker showing health status
        let latSum = 0;
        let lngSum = 0;
        for (const [pLat, pLng] of field.boundary) {
          latSum += pLat;
          lngSum += pLng;
        }
        const centerLat = latSum / field.boundary.length;
        const centerLng = lngSum / field.boundary.length;

        const centerBadgeHtml = `
          <div class="px-2 py-0.5 rounded-full shadow-md text-[10px] font-bold border flex items-center gap-1 cursor-pointer transition transform hover:scale-105 ${
            palette.badgeBg
          } ${isSelected ? 'ring-2 ring-white ring-offset-1 scale-105' : ''}">
            <span class="w-1.5 h-1.5 rounded-full" style="background-color: ${palette.stroke}"></span>
            <span>${field.name}</span>
          </div>
        `;

        const centerIcon = L.divIcon({
          html: centerBadgeHtml,
          className: 'custom-field-badge',
          iconSize: [80, 24],
          iconAnchor: [40, 12],
        });

        const centerMarker = L.marker([centerLat, centerLng], { icon: centerIcon });
        if (onSelectField) {
          centerMarker.on('click', () => onSelectField(field));
        }
        this.fieldsLayerGroup.addLayer(centerMarker);
      }
    }
  }

  renderObservations(
    observations: FieldObservation[],
    onSelectObservation?: (obs: FieldObservation) => void
  ): void {
    this.observationsLayerGroup.clearLayers();
    if (!this.map) return;

    for (const obs of observations) {
      if (!obs.latitude || !obs.longitude) continue;

      const isDisease = obs.problemType === 'Disease';
      const isPest = obs.problemType === 'Pest';
      const isHealthy = obs.problemType === 'Healthy';

      const pinBg = isHealthy ? 'bg-emerald-600' : isDisease ? 'bg-rose-600' : isPest ? 'bg-amber-600' : 'bg-sky-600';

      const obsMarkerHtml = `
        <div class="w-7 h-7 ${pinBg} rounded-full shadow-lg border-2 border-white flex items-center justify-center text-white cursor-pointer transform hover:scale-125 transition">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
        </div>
      `;

      const icon = L.divIcon({
        html: obsMarkerHtml,
        className: 'observation-pin',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([obs.latitude, obs.longitude], { icon });

      const popupContent = `
        <div class="p-2 font-sans min-w-[190px] text-stone-900">
          <div class="font-bold text-xs text-stone-900 mb-0.5">${obs.diagnosis}</div>
          <div class="text-[11px] text-stone-500 mb-1.5">${obs.fieldName} • ${obs.crop}</div>
          <div class="flex items-center gap-1.5 mb-2">
            <span class="text-[10px] px-1.5 py-0.5 rounded font-bold ${
              obs.severity === 'High' || obs.severity === 'Critical'
                ? 'bg-red-100 text-red-800'
                : 'bg-amber-100 text-amber-800'
            }">${obs.severity} Severity</span>
            <span class="text-[10px] text-stone-500">${Math.round(obs.confidence * 100)}% Conf.</span>
          </div>
          ${obs.notes ? `<p class="text-[11px] italic text-stone-600 border-t pt-1 border-stone-100">${obs.notes}</p>` : ''}
        </div>
      `;

      marker.bindPopup(popupContent);

      if (onSelectObservation) {
        marker.on('click', () => onSelectObservation(obs));
      }

      this.observationsLayerGroup.addLayer(marker);
    }
  }

  startDrawing(onPointAdded: (points: LatLngTuple[], currentAreaAcres: number) => void): void {
    this.drawingActive = true;
    this.drawnPoints = [];
    this.onPointAddedCallback = onPointAdded;
    this.drawingLayerGroup.clearLayers();

    if (this.map) {
      this.map.getContainer().style.cursor = 'crosshair';
    }
  }

  private addDrawPoint(point: LatLngTuple): void {
    this.drawnPoints.push(point);
    this.renderDrawingPreview();

    const areaResult = calculatePolygonArea(this.drawnPoints);
    if (this.onPointAddedCallback) {
      this.onPointAddedCallback([...this.drawnPoints], areaResult.acres);
    }
  }

  private renderDrawingPreview(): void {
    this.drawingLayerGroup.clearLayers();

    // Render vertex markers
    this.drawnPoints.forEach((pt, idx) => {
      const isFirst = idx === 0;
      const vertexIcon = L.divIcon({
        html: `<div class="w-4 h-4 ${
          isFirst ? 'bg-amber-500 ring-2 ring-white' : 'bg-white border-2 border-emerald-600'
        } rounded-full shadow flex items-center justify-center text-[9px] font-bold text-stone-900">${idx + 1}</div>`,
        className: 'draw-vertex-point',
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });
      const m = L.marker(pt, { icon: vertexIcon });
      this.drawingLayerGroup.addLayer(m);
    });

    if (this.drawnPoints.length >= 2) {
      const polyline = L.polyline(this.drawnPoints, {
        color: '#10b981',
        weight: 3,
        dashArray: '5, 5',
      });
      this.drawingLayerGroup.addLayer(polyline);
    }

    if (this.drawnPoints.length >= 3) {
      const poly = L.polygon(this.drawnPoints, {
        color: '#059669',
        weight: 2,
        fillColor: '#10b981',
        fillOpacity: 0.25,
      });
      this.drawingLayerGroup.addLayer(poly);
    }
  }

  undoLastDrawPoint(): LatLngTuple[] {
    if (this.drawnPoints.length > 0) {
      this.drawnPoints.pop();
      this.renderDrawingPreview();
      const areaResult = calculatePolygonArea(this.drawnPoints);
      if (this.onPointAddedCallback) {
        this.onPointAddedCallback([...this.drawnPoints], areaResult.acres);
      }
    }
    return [...this.drawnPoints];
  }

  clearDrawing(): void {
    this.drawnPoints = [];
    this.drawingLayerGroup.clearLayers();
    if (this.onPointAddedCallback) {
      this.onPointAddedCallback([], 0);
    }
  }

  finishDrawing(): LatLngTuple[] {
    const finalPoints = [...this.drawnPoints];
    this.drawingActive = false;
    this.drawingLayerGroup.clearLayers();
    if (this.map) {
      this.map.getContainer().style.cursor = '';
    }
    return finalPoints;
  }

  isDrawingActive(): boolean {
    return this.drawingActive;
  }

  getDrawnPoints(): LatLngTuple[] {
    return [...this.drawnPoints];
  }

  invalidateSize(): void {
    if (this.map) {
      this.map.invalidateSize();
    }
  }

  destroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }
}
