import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from 'react-leaflet'
import { divIcon } from 'leaflet'
import { useNavigate } from 'react-router'
import type { BuildingConfig } from '../sites/types'
import 'leaflet/dist/leaflet.css'

// 按真实经纬度排布的卫星地图（Esri World Imagery）
export default function ShanxiSatelliteMap({ sites }: { sites: BuildingConfig[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#4a4032]">
      <MapContainer
        center={[37.7, 112.3]}
        zoom={7}
        minZoom={6}
        maxZoom={12}
        scrollWheelZoom
        className="h-[520px] w-full bg-[#1d1812]"
        attributionControl={false}
      >
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution='Esri, DigitalGlobe, GeoEye, i-cubed, USDA, USGS, AEX, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        />
        <Markers sites={sites} />
      </MapContainer>
      <div className="bg-[#221c15] px-3 py-2 text-center text-[10px] text-[#8a7f6a]">
        影像底图：Esri World Imagery · 滚轮缩放 / 拖拽平移 · 点图钉进站点
      </div>
    </div>
  )
}

function Markers({ sites }: { sites: BuildingConfig[] }) {
  const navigate = useNavigate()
  const map = useMap()

  useEffect(() => {
    const bounds = sites.filter((s) => s.geo).map((s) => [s.geo![1] + s.geo![3], s.geo![0] + s.geo![2]] as [number, number])
    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [28, 28], maxZoom: 9 })
    }
  }, [sites, map])

  return (
    <>
      {sites
        .filter((s) => s.geo)
        .map((s, i) => {
          const [lng, lat, jx, jy] = s.geo!
          const icon = divIcon({
            html: `<div class="site-pin"><img src="/models/building-${s.id}.preview.png" alt="${s.name}" /></div>`,
            iconSize: [40, 40],
            iconAnchor: [20, 40],
            className: 'site-div-icon',
          })
          return (
            <Marker
              key={s.id}
              position={[lat + jy, lng + jx]}
              icon={icon}
              eventHandlers={{
                click: () => navigate(`/s/${s.id}`),
              }}
            >
              <Tooltip direction="top" offset={[0, -6]} opacity={0.95} permanent={false}>
                <div className="text-xs">
                  <strong>
                    {String(i + 1).padStart(2, '0')} · {s.name}
                  </strong>
                  <div className="mt-0.5 text-[10px] opacity-80">{s.alias}</div>
                  <div className="mt-1 text-[10px] text-[#c9a227]">点击进入站点 →</div>
                </div>
              </Tooltip>
            </Marker>
          )
        })}
    </>
  )
}
