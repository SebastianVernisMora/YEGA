import React, { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from '@/components/ui/table'
import { Button as FButton } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert as FAlert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Sheet, SheetContent, SheetHeader as FSheetHeader, SheetTitle } from '@/components/ui/sheet'
import MobileHeader from '../../components/ui/MobileHeader'
import CardSoft from '../../components/ui/CardSoft'
import { reverseGeocode } from '../../lib/geocoding'
import { useCart } from '../../context/CartContext'
// Quitamos BottomSheet local; usamos Sheet del set Figma
import api from '../../services/apiClient'
import { SECTIONS } from '../../config/sections'
import { Link } from 'react-router-dom'
import { SectionIconMap, SubcatIconMap, LocationIcon, StarIcon, ClockIcon } from '../../components/icons/SectionIcons'
import { Modal, Form, Button } from 'react-bootstrap'

const ClienteTiendas = () => {
  const [coords, setCoords] = useState(null)
  const [_radio, _setRadio] = useState(10)
  const [selectedStore, setSelectedStore] = useState(null)
  const [section, setSection] = useState(SECTIONS[0].id)
  const activeSection = useMemo(() => SECTIONS.find(s => s.id === section), [section])
  const [subcat, setSubcat] = useState('')
  const [addressText, setAddressText] = useState('')
  const [showAddrModal, setShowAddrModal] = useState(false)
  const [addrDraft, setAddrDraft] = useState('')
  const shortAddress = useMemo(() => {
    if (!addressText) return ''
    const first = addressText.split(',')[0]?.trim()
    return first || addressText
  }, [addressText])
  const [chip, setChip] = useState('nearby')
  const { addItem, items, subtotal } = useCart()
  

  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        try { localStorage.setItem('yega_geo_ok', '1') } catch {}
      },
      () => setCoords({ lat: -34.6, lng: -58.4 }) // fallback Buenos Aires
    )
  }, [])

  useEffect(() => {
    (async () => {
      if (coords) {
        const saved = localStorage.getItem('yega_addr')
        if (saved) setAddressText(saved)
        const place = await reverseGeocode(coords.lat, coords.lng)
        if (place) {
          setAddressText(place)
          try { localStorage.setItem('yega_addr', place) } catch {}
        }
      }
    })()
  }, [coords])

  // Tiendas derivadas por sección (productos filtrados por categoría/subcategoría)
  const storesQuery = useQuery({
    enabled: !!activeSection,
    queryKey: ['stores-by-section', activeSection?.categoria, subcat],
    queryFn: async () => {
      const params = { limit: 200, categoria: activeSection?.categoria }
      if (subcat) params.buscar = subcat
      const res = await api.get('/products', { params })
      const productos = res.data.productos || []
      const byStore = new Map()
      for (const p of productos) {
        const t = p.tiendaId
        if (t?._id && !byStore.has(t._id)) {
          byStore.set(t._id, {
            id: t._id,
            nombre: t.nombre,
            telefono: t.telefono,
            ubicacion: t.ubicacion,
          })
        }
      }
      return { tiendas: Array.from(byStore.values()) }
    }
  })

  const productsQuery = useQuery({
    enabled: !!selectedStore,
    queryKey: ['products-by-store', selectedStore],
    queryFn: async () => {
      const res = await api.get('/products', { params: { tiendaId: selectedStore, limit: 50 } })
      return res.data
    }
  })

  // Fallback: si no hay coords o no hay tiendas cercanas, listar tiendas desde productos
  const fallbackStoresQuery = useQuery({
    enabled: !coords || (storesQuery.data && storesQuery.data.tiendas?.length === 0),
    queryKey: ['fallback-stores'],
    queryFn: async () => {
      const res = await api.get('/products', { params: { limit: 100 } })
      const productos = res.data.productos || []
      const byStore = new Map()
      for (const p of productos) {
        if (p.tiendaId?._id && !byStore.has(p.tiendaId._id)) {
          byStore.set(p.tiendaId._id, {
            id: p.tiendaId._id,
            nombre: p.tiendaId.nombre,
            telefono: p.tiendaId.telefono,
            ubicacion: p.tiendaId.ubicacion,
            distancia: null,
          })
        }
      }
      return Array.from(byStore.values())
    }
  })

  // sin categorías placeholder; se usan subcategorías de la sección

  // Pedidos activos del cliente
  const ordersQuery = useQuery({
    queryKey: ['orders-active-client'],
    queryFn: async () => {
      const res = await api.get('/orders', { params: { limit: 50 } })
      return res.data
    },
    refetchInterval: 5000,
  })

  const pedidosActivos = (ordersQuery.data?.pedidos || []).filter(o => !['entregado','cancelado'].includes(o.estado))
  const [showFilters, setShowFilters] = useState(false)

  return (
    <div className="p-4">
      <MobileHeader>
        <div className="w-full text-center">
          <span
            role="button"
            onClick={() => { setAddrDraft(addressText || ''); setShowAddrModal(true) }}
            title="Editar dirección de entrega"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-sm text-white/90 cursor-pointer hover:bg-white/10"
          >
            {shortAddress || (coords ? `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}` : 'Solicitando permiso...')}
          </span>
        </div>
      </MobileHeader>
      {/* Modal edición de dirección */}
      <Modal show={showAddrModal} onHide={() => setShowAddrModal(false)} centered>
        <Modal.Header closeButton className="card-yega">
          <Modal.Title className="text-yega-silver m-0">Editar dirección de entrega</Modal.Title>
        </Modal.Header>
        <Modal.Body className="card-yega">
          <Form.Group className="mb-3">
            <Form.Label className="form-label-yega">Calle y número</Form.Label>
            <Form.Control
              autoFocus
              placeholder="Ej: Av. Siempre Viva 742"
              value={addrDraft}
              onChange={(e)=> setAddrDraft(e.target.value)}
              className="form-control-yega"
            />
            <Form.Text className="text-white-50">Solo calle y número. La ciudad se infiere por geolocalización.</Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="card-yega d-flex justify-content-between">
          <Button variant="outline-light" className="btn-yega-secondary" onClick={() => setShowAddrModal(false)}>Cancelar</Button>
          <Button
            className="btn-yega-primary"
            onClick={() => {
              const next = (addrDraft || '').trim();
              setAddressText(next)
              try { localStorage.setItem('yega_addr', next) } catch {}
              setShowAddrModal(false)
            }}
          >
            Guardar
          </Button>
        </Modal.Footer>
      </Modal>
      {/* Header extra eliminado */}

      {/* Secciones principales (centradas) */}
      <div className="mb-3 d-flex flex-wrap justify-content-center gap-2 text-center">
        {SECTIONS.map(s => {
          const Icon = SectionIconMap[s.id]
          return (
            <FButton
              key={s.id}
              variant={section===s.id? 'default':'outline'}
              className="rounded-full inline-flex items-center justify-center p-2 size-9"
              onClick={()=>{setSection(s.id); setSubcat('')}}
              title={s.label}
              aria-label={s.label}
            >
              {Icon ? <Icon size={18} /> : null}
            </FButton>
          )
        })}
      </div>

      {/* Subcategorías (centradas) */}
      <div className="mb-3 d-flex flex-wrap justify-content-center gap-2 text-center">
        {(activeSection?.subcategories||[]).map(sc => {
          const SIcon = SubcatIconMap[sc]
          return (
            <FButton
              key={sc}
              variant={subcat===sc? 'default':'outline'}
              className="rounded-full inline-flex items-center justify-center p-2 size-9"
              onClick={()=> setSubcat(subcat===sc?'':sc)}
              title={sc}
              aria-label={sc}
            >
              {SIcon ? <SIcon size={16} /> : null}
            </FButton>
          )
        })}
      </div>


      {/* Filtros */}
      <div className="mb-3 text-center">
        <FButton className="rounded-full" onClick={()=> setShowFilters(true)}>Filtros</FButton>
      </div>

      {/* Pedidos activos (centrado, sin scroll horizontal) */}
      {ordersQuery.isLoading ? (
        <div className="text-center py-3"><div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white" /></div>
      ) : pedidosActivos.length > 0 ? (
        <div className="mb-4">
          <div className="row g-3 justify-content-center">
            {pedidosActivos.map((o) => (
              <div className="col-md-6 col-lg-4" key={o._id}>
                <Link to={`/cliente/seguimiento?id=${o._id}`} className="text-reset text-decoration-none">
                  <CardSoft className="w-100 cursor-pointer">
                    <div className="p-3 text-center">
                      <div className="d-flex justify-content-between align-items-center">
                        <strong>{o.tiendaId?.nombre ?? 'Tienda'}</strong>
                        <Badge variant="secondary">{o.estado}</Badge>
                      </div>
                      <div className="mt-2 text-muted text-sm">ETA aprox: {o.tiempo_estimado ?? 30} min</div>
                      <div className="small">Pedido {o.numero_pedido}</div>
                    </div>
                  </CardSoft>
                </Link>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Chips de filtro/orden con iconos */}
      <div className="mb-3 text-center">
        {[
          { id: 'nearby', label: 'Cercanos', Icon: LocationIcon },
          { id: 'rated', label: 'Mejor valorados', Icon: StarIcon },
          { id: 'fast', label: 'Entrega rápida', Icon: ClockIcon },
        ].map(({ id, label, Icon }) => (
          <FButton
            key={id}
            variant={chip === id ? 'default' : 'outline'}
            className={chip === id ? 'rounded-full me-2 inline-flex items-center gap-2' : 'rounded-full me-2 inline-flex items-center gap-2'}
            onClick={() => setChip(id)}
            title={label}
            aria-label={label}
          >
            {Icon ? <Icon size={16} /> : null}
          </FButton>
        ))}
      </div>

      {!coords && (
        <FAlert>
          <AlertTitle>Ubicación</AlertTitle>
          <AlertDescription>Obteniendo tu ubicación...</AlertDescription>
        </FAlert>
      )}

      {storesQuery.isLoading && (
        <div className="text-center py-4"><div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white" /></div>
      )}

      {storesQuery.isError && (
        <FAlert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>No se pudieron cargar tiendas.</AlertDescription></FAlert>
      )}

      {!storesQuery.isLoading && !storesQuery.isError && storesQuery.data?.tiendas?.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {storesQuery.data?.tiendas.map(t => (
            <Card key={t.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-semibold">{t.nombre}</div>
                    <div className="text-sm text-white/70">{t.telefono || '—'}</div>
                    <div className="text-xs text-white/60 truncate">{t.ubicacion?.direccion || `${t.ubicacion?.latitud}, ${t.ubicacion?.longitud}`}</div>
                  </div>
                  {typeof t.distancia === 'number' && (
                    <span className="text-xs text-white/70">{t.distancia.toFixed(2)} km</span>
                  )}
                </div>
                <div className="mt-3 text-right">
                  <FButton size="sm" className="btn-yega-primary" onClick={() => setSelectedStore(t.id)}>
                    Ver Productos
                  </FButton>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Fallback */}
      {((!coords) || (storesQuery.data && storesQuery.data.tiendas?.length === 0)) && !fallbackStoresQuery.isLoading && (
        <>
          <h5 className="text-yega-silver mt-4">Tiendas disponibles</h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {fallbackStoresQuery.data?.map(t => (
              <Card key={t.id}>
                <CardContent className="p-4">
                  <div className="font-semibold">{t.nombre}</div>
                  <div className="text-sm text-white/70">{t.telefono || '—'}</div>
                  <div className="text-xs text-white/60 truncate">{t.ubicacion?.direccion || (t.ubicacion ? `${t.ubicacion.latitud}, ${t.ubicacion.longitud}` : '—')}</div>
                  <div className="mt-3 text-right">
                    <FButton size="sm" className="btn-yega-primary" onClick={() => setSelectedStore(t.id)}>Ver Productos</FButton>
                  </div>
                </CardContent>
              </Card>
            ))}
            {(fallbackStoresQuery.data?.length || 0) === 0 && (
              <div className="col-span-full text-center text-muted py-4">Sin tiendas</div>
            )}
          </div>
        </>
      )}

      {selectedStore && (
        <div className="mt-4">
          <h4 className="text-yega-gold">Productos de la tienda</h4>
          {productsQuery.isLoading && <div className="text-center py-3"><div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white" /></div>}
          {productsQuery.isError && <FAlert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>No se pudieron cargar productos.</AlertDescription></FAlert>}
          {!productsQuery.isLoading && !productsQuery.isError && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productsQuery.data?.productos?.map(p => (
                  <TableRow key={p._id}>
                    <TableCell>{p.nombre}</TableCell>
                    <TableCell className="text-truncate max-w-[280px]">{p.descripcion}</TableCell>
                    <TableCell>${p.precio?.toFixed?.(2) ?? p.precio}</TableCell>
                    <TableCell>{p.stock}</TableCell>
                    <TableCell className="text-right">
                      <FButton size="sm" onClick={() => addItem(p, 1)} disabled={p.stock <= 0}>
                        Agregar
                      </FButton>
                    </TableCell>
                  </TableRow>
                ))}
                {(productsQuery.data?.productos?.length || 0) === 0 && (
                  <TableRow><TableCell colSpan={4} className="text-center text-muted py-3">Sin productos</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      )}

      {/* Resumen de carrito */}
      {items.length > 0 && (
        <div className="mt-4 flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
          <div>
            <div className="font-semibold">{items.length} producto(s)</div>
            <div className="text-sm text-white/70">Subtotal: ${subtotal.toFixed(2)}</div>
          </div>
          <div className="flex gap-2">
            <FButton variant="outline" onClick={() => setSelectedStore(null)}>Seguir explorando</FButton>
            <FButton className="btn-yega-primary" onClick={() => (window.location.href = '/cliente/checkout')}>Ir a pagar</FButton>
          </div>
        </div>
      )}

      <Sheet open={showFilters} onOpenChange={setShowFilters}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <FSheetHeader>
            <SheetTitle>Filtra tu búsqueda</SheetTitle>
          </FSheetHeader>
          <div className="text-white/70 text-sm mt-2 mb-3">Oferta</div>
          <div className="flex flex-wrap gap-2 mb-4">
            {['Entrega','Levantar','Oferta','Pago en línea disponible'].map((t) => (
              <FButton key={t} variant="outline" className="rounded-full">{t}</FButton>
            ))}
          </div>
          <div className="text-white/70 text-sm mb-3">Entregar tiempo</div>
          <div className="flex flex-wrap gap-2 mb-4">
            {['10-15 min','20 min','30 min'].map((t) => (
              <FButton key={t} variant="outline" className="rounded-full">{t}</FButton>
            ))}
          </div>
          <div className="text-white/70 text-sm mb-3">Fijación de precios</div>
          <div className="flex gap-2 mb-4">
            {['$','$$','$$$'].map((t) => (
              <FButton key={t} variant="outline" className="rounded-full">{t}</FButton>
            ))}
          </div>
          <FButton className="btn-yega-primary">Aplicar filtros</FButton>
        </SheetContent>
      </Sheet>
    </div>
  )
}

export default ClienteTiendas
