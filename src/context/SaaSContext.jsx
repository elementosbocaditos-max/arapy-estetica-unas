import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  DEFAULT_MASTER_REGISTRY,
  createTenantSeedDatabase,
  THEME_PRESETS
} from '../data/seedTemplates';
import {
  loadMasterRegistry,
  saveMasterRegistry,
  loadTenantDatabase,
  saveTenantDatabase,
  resetTenantDatabaseOnDisk,
  compressAndUploadImage,
  loadClientProfileMemory,
  saveClientProfileMemory
} from '../db/storageEngine';

const SaaSContext = createContext(null);

export function SaaSProvider({ children }) {
  // Determine initial tenant slug from URL (?salon=slug)
  const getInitialSlug = () => {
    const params = new URLSearchParams(window.location.search);
    return (params.get('salon') || 'daniela-gimenez').trim().toLowerCase();
  };

  const [registry, setRegistry] = useState(DEFAULT_MASTER_REGISTRY);
  const [activeSlug, setActiveSlug] = useState(getInitialSlug);
  const [tenantDb, setTenantDb] = useState(() => createTenantSeedDatabase(getInitialSlug()));
  const [isLoadingDb, setIsLoadingDb] = useState(true);
  const [saveStatus, setSaveStatus] = useState({
    saving: false,
    diskSaved: true,
    lastSavedAt: new Date().toISOString(),
    message: 'Sincronizado en disco'
  });

  // Navigation & View Modes:
  // activeScreen: 'splash' | 'home' | 'services' | 'inspo' | 'booking'
  // viewMode: 'single' (Mobile App Interactive) | 'showcase' (Side-by-Side Reference Screens)
  const [activeScreen, setActiveScreen] = useState('splash');
  const [viewMode, setViewMode] = useState('showcase');
  const [liveEditMode, setLiveEditMode] = useState(false);

  // Modals: 'none' | 'ai' | 'owner' | 'arapy'
  const [activeModal, setActiveModal] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const panel = params.get('panel') || params.get('mode');
    if (panel === 'owner' || panel === 'admin') return 'owner';
    if (panel === 'arapy' || panel === 'superadmin') return 'arapy';
    return 'none';
  });

  // End-Client Booking Draft State
  const [clientProfile, setClientProfile] = useState(() =>
    loadClientProfileMemory(getInitialSlug())
  );
  const [selectedServiceId, setSelectedServiceId] = useState('srv-manicure-3d');
  const [selectedSpecialistId, setSelectedSpecialistId] = useState('spec-1');
  const [selectedDateLabel, setSelectedDateLabel] = useState('Lun 12:11');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('12:00');
  const [selectedNailShape, setSelectedNailShape] = useState('Almendra');
  const [addedInspoIds, setAddedInspoIds] = useState(['inspo-1', 'inspo-2', 'inspo-3']);
  const [clientUploadedInspo, setClientUploadedInspo] = useState([]);
  const [likedInspoIds, setLikedInspoIds] = useState(['inspo-1', 'inspo-3']);
  const [promoApplied, setPromoApplied] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3400);
  }, []);

  // Load Master Registry & Active Tenant Database from Disk + IndexedDB
  useEffect(() => {
    let mounted = true;
    async function boot() {
      setIsLoadingDb(true);
      const reg = await loadMasterRegistry(DEFAULT_MASTER_REGISTRY);
      if (!mounted) return;
      setRegistry(reg);

      const tenantMeta = reg.tenants.find((t) => t.slug === activeSlug) || {};
      const db = await loadTenantDatabase(activeSlug, (slug) =>
        createTenantSeedDatabase(slug, tenantMeta)
      );
      if (!mounted) return;

      setTenantDb(db);
      setClientProfile(loadClientProfileMemory(activeSlug));

      // Ensure selected IDs exist in this tenant's catalog
      if (db.services?.length) {
        setSelectedServiceId(db.services[0].id);
      }
      if (db.specialists?.length) {
        setSelectedSpecialistId(db.specialists[0].id);
      }
      if (db.inspoGallery?.length) {
        setAddedInspoIds(db.inspoGallery.slice(0, 3).map((i) => i.id));
      }

      setIsLoadingDb(false);
    }
    boot();
    return () => {
      mounted = false;
    };
  }, [activeSlug]);

  // Inject CSS Variables dynamically for the active tenant's color palette
  useEffect(() => {
    const colors = tenantDb?.branding?.colors || THEME_PRESETS[0];
    const root = document.documentElement;
    root.style.setProperty('--rose-primary', colors.primaryRose || '#D67479');
    root.style.setProperty('--rose-dark', colors.primaryRoseDark || '#B8585E');
    root.style.setProperty('--rose-soft', colors.primaryRoseSoft || '#F6E2E3');
    root.style.setProperty('--lilac-accent', colors.lilacAccent || '#CFA8F5');
    root.style.setProperty('--lilac-dark', colors.lilacDark || '#A978DF');
    root.style.setProperty('--ivory-bg', colors.ivoryBg || '#FAF7F6');
    root.style.setProperty('--sheet-cream', colors.sheetCream || '#F7F2EE');
    root.style.setProperty('--studio-dark', colors.studioDark || '#191412');
    root.style.setProperty('--splash-dark', colors.splashDark || '#0F0C0D');
    document.title = `${tenantDb?.branding?.businessName || 'Beauty Studio'} — Turnos con IA`;
  }, [tenantDb]);

  // Core Persistence Mutator: saves immediately to Disk + IndexedDB
  const persistTenantUpdate = useCallback(
    async (updater, statusText = 'Guardado en Base de Datos y Disco') => {
      setSaveStatus((prev) => ({ ...prev, saving: true, message: 'Guardando en disco...' }));
      let nextDb = null;
      setTenantDb((prev) => {
        nextDb = typeof updater === 'function' ? updater(prev) : updater;
        return nextDb;
      });

      if (nextDb) {
        const res = await saveTenantDatabase(activeSlug, nextDb);
        // Also keep businessName in Master Registry synced if it changed
        if (nextDb.branding?.businessName) {
          setRegistry((prevReg) => {
            const updatedTenants = prevReg.tenants.map((t) =>
              t.slug === activeSlug
                ? {
                    ...t,
                    businessName: nextDb.branding.businessName,
                    ownerName: nextDb.operations?.paymentHolder || t.ownerName,
                    status: nextDb.status || t.status
                  }
                : t
            );
            saveMasterRegistry(updatedTenants, prevReg.arapyConfig);
            return { ...prevReg, tenants: updatedTenants };
          });
        }
        setSaveStatus({
          saving: false,
          diskSaved: res.diskSaved,
          lastSavedAt: res.updatedAt,
          message: statusText
        });
      }
    },
    [activeSlug]
  );

  // Update a nested branding or operations field directly
  const updateBrandingField = useCallback(
    (field, value) => {
      persistTenantUpdate(
        (prev) => ({
          ...prev,
          branding: {
            ...prev.branding,
            [field]: value
          }
        }),
        `Actualizado: ${field}`
      );
    },
    [persistTenantUpdate]
  );

  const updateOperationsField = useCallback(
    (field, value) => {
      persistTenantUpdate(
        (prev) => ({
          ...prev,
          operations: {
            ...prev.operations,
            [field]: value
          }
        }),
        `Operación actualizada: ${field}`
      );
    },
    [persistTenantUpdate]
  );

  const applyThemePreset = useCallback(
    (presetId) => {
      const preset = THEME_PRESETS.find((p) => p.id === presetId) || THEME_PRESETS[0];
      persistTenantUpdate(
        (prev) => ({
          ...prev,
          branding: {
            ...prev.branding,
            themeId: preset.id,
            colors: { ...preset }
          }
        }),
        `Tema aplicado: ${preset.name}`
      );
      showToast(`🎨 Paleta cambiada a "${preset.name}"`);
    },
    [persistTenantUpdate, showToast]
  );

  const updateCustomColor = useCallback(
    (colorKey, hexValue) => {
      persistTenantUpdate(
        (prev) => ({
          ...prev,
          branding: {
            ...prev.branding,
            themeId: 'custom',
            colors: {
              ...prev.branding.colors,
              [colorKey]: hexValue
            }
          }
        }),
        `Color personalizado guardado`
      );
    },
    [persistTenantUpdate]
  );

  // Upload any photo from phone/PC and save permanently to /public/uploads/<slug>/ + DB
  const uploadAndSaveImage = useCallback(
    async (file, label = 'photo') => {
      if (!file) return null;
      setSaveStatus((prev) => ({
        ...prev,
        saving: true,
        message: 'Subiendo y optimizando foto en disco...'
      }));
      const uploaded = await compressAndUploadImage(file, activeSlug, label);
      setSaveStatus({
        saving: false,
        diskSaved: uploaded.persistedOnDisk,
        lastSavedAt: uploaded.savedAt,
        message: '📷 Foto guardada en el servidor'
      });
      showToast('📷 Foto subida y guardada permanentemente');
      return uploaded.url;
    },
    [activeSlug, showToast]
  );

  // Switch active tenant (or create new tenant from ARAPY Console)
  const switchTenant = useCallback(
    (targetSlug) => {
      const clean = String(targetSlug).trim().toLowerCase();
      const url = new URL(window.location.href);
      url.searchParams.set('salon', clean);
      window.history.pushState({}, '', url.toString());
      setActiveSlug(clean);
      showToast(`🏢 Cambiado a la base de datos de: ${clean}`);
    },
    [showToast]
  );

  const createNewTenantFromArapy = useCallback(
    async ({ businessName, slug, ownerName, ownerPin, whatsappNumber, city, plan }) => {
      const cleanSlug = String(slug || businessName)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      if (!cleanSlug) return null;

      const newTenantEntry = {
        slug: cleanSlug,
        businessName: businessName || 'Nuevo Estudio de Belleza',
        ownerName: ownerName || 'Dueña del Salón',
        ownerPin: ownerPin || '1234',
        plan: plan || 'PRO IA FULL',
        status: 'active',
        city: city || 'Argentina',
        createdAt: new Date().toISOString(),
        dbNamespace: `arapy_tenant_db::${cleanSlug}`
      };

      const freshDb = createTenantSeedDatabase(cleanSlug, {
        businessName: newTenantEntry.businessName,
        ownerName: newTenantEntry.ownerName,
        ownerPin: newTenantEntry.ownerPin,
        whatsappNumber: whatsappNumber || '5491123456789',
        status: 'active',
        plan: newTenantEntry.plan
      });

      await saveTenantDatabase(cleanSlug, freshDb);

      const nextTenants = [
        ...registry.tenants.filter((t) => t.slug !== cleanSlug),
        newTenantEntry
      ];
      await saveMasterRegistry(nextTenants, registry.arapyConfig);
      setRegistry((prev) => ({ ...prev, tenants: nextTenants }));
      switchTenant(cleanSlug);
      return cleanSlug;
    },
    [registry, switchTenant]
  );

  const toggleTenantStatusFromArapy = useCallback(
    async (targetSlug, nextStatus) => {
      const nextTenants = registry.tenants.map((t) =>
        t.slug === targetSlug ? { ...t, status: nextStatus } : t
      );
      await saveMasterRegistry(nextTenants, registry.arapyConfig);
      setRegistry((prev) => ({ ...prev, tenants: nextTenants }));
      if (targetSlug === activeSlug) {
        persistTenantUpdate((prev) => ({ ...prev, status: nextStatus }), `Estado: ${nextStatus}`);
      }
      showToast(`Estado de ${targetSlug}: ${nextStatus.toUpperCase()}`);
    },
    [registry, activeSlug, persistTenantUpdate, showToast]
  );

  // Booking Flow Actions
  const selectedService = useMemo(() => {
    return (
      tenantDb.services?.find((s) => s.id === selectedServiceId) ||
      tenantDb.services?.[0] || {
        id: 'default',
        name: 'Manicure 3D',
        addonLabel: '+ mini patterns',
        price: 24000,
        durationMin: 90,
        image: '/assets/studio-nails.jpg'
      }
    );
  }, [tenantDb.services, selectedServiceId]);

  const selectedSpecialist = useMemo(() => {
    return (
      tenantDb.specialists?.find((s) => s.id === selectedSpecialistId) ||
      tenantDb.specialists?.[0] || {
        id: 'spec-1',
        name: 'Daniela Giménez',
        studioCode: 'DG Studio',
        avatar: '/assets/stylist-main.jpg'
      }
    );
  }, [tenantDb.specialists, selectedSpecialistId]);

  const resolvedAddedInspoPhotos = useMemo(() => {
    const galleryMatches = (tenantDb.inspoGallery || [])
      .filter((item) => addedInspoIds.includes(item.id))
      .map((item) => item.image);
    return [...clientUploadedInspo, ...galleryMatches];
  }, [tenantDb.inspoGallery, addedInspoIds, clientUploadedInspo]);

  const pricingSummary = useMemo(() => {
    const basePrice = Number(selectedService?.price || 0);
    const finalTotal = promoApplied ? Math.round(basePrice * 0.8) : basePrice;
    const depositPct = Number(tenantDb.operations?.depositPercentage ?? 50);
    const depositAmount = Math.round((finalTotal * depositPct) / 100);
    const remainingAmount = Math.max(0, finalTotal - depositAmount);
    return {
      basePrice,
      finalTotal,
      depositPct,
      depositAmount,
      remainingAmount
    };
  }, [selectedService, promoApplied, tenantDb.operations?.depositPercentage]);

  const computedTimeRange = useMemo(() => {
    const start = selectedTimeSlot || '12:00';
    const [hh, mm] = start.split(':').map((n) => parseInt(n, 10) || 0);
    const dur = Number(selectedService?.durationMin || 90);
    const totalMinutes = hh * 60 + mm + dur;
    const endH = String(Math.floor(totalMinutes / 60) % 24).padStart(2, '0');
    const endM = String(totalMinutes % 60).padStart(2, '0');
    return `${start}-${endH}:${endM}`;
  }, [selectedTimeSlot, selectedService]);

  const selectServiceAndGoToBooking = useCallback(
    (serviceId, applyPromoDiscount = false) => {
      setSelectedServiceId(serviceId);
      setPromoApplied(Boolean(applyPromoDiscount));
      setActiveScreen('booking');
      showToast('✨ Servicio cargado en tu tarjeta de reserva');
    },
    [showToast]
  );

  const toggleInspoSelection = useCallback(
    (inspoId) => {
      setAddedInspoIds((prev) => {
        const exists = prev.includes(inspoId);
        const next = exists ? prev.filter((id) => id !== inspoId) : [inspoId, ...prev];
        showToast(
          exists
            ? 'Foto quitada de tu selección Added Inspo'
            : '✨ Diseño sumado a "Added Inspo" para tu turno'
        );
        return next;
      });
    },
    [showToast]
  );

  const toggleInspoLike = useCallback(
    (inspoId) => {
      const isLiked = likedInspoIds.includes(inspoId);
      setLikedInspoIds((prev) =>
        isLiked ? prev.filter((id) => id !== inspoId) : [...prev, inspoId]
      );
      persistTenantUpdate(
        (prev) => ({
          ...prev,
          inspoGallery: (prev.inspoGallery || []).map((item) =>
            item.id === inspoId
              ? { ...item, likes: Math.max(0, Number(item.likes || 0) + (isLiked ? -1 : 1)) }
              : item
          )
        }),
        'Me gusta actualizado'
      );
    },
    [likedInspoIds, persistTenantUpdate]
  );

  const confirmAndSaveAppointment = useCallback(
    async ({ customClientName, customClientPhone, customNotes, sendWhatsapp = true }) => {
      const finalName = (customClientName || clientProfile.name || 'Clienta').trim();
      const finalPhone = (customClientPhone || clientProfile.phone || '').trim();
      const updatedProfile = {
        name: finalName,
        phone: finalPhone,
        notes: customNotes || ''
      };
      setClientProfile(updatedProfile);
      saveClientProfileMemory(activeSlug, updatedProfile);

      const newApt = {
        id: `apt-${Date.now()}`,
        code: `${(tenantDb.branding?.logoText || 'DG').toUpperCase()}-${Math.floor(
          100 + Math.random() * 900
        )}`,
        clientName: finalName,
        clientPhone: finalPhone,
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        addonLabel: selectedService.addonLabel || '',
        specialistId: selectedSpecialist.id,
        specialistName: selectedSpecialist.name,
        studioCode: selectedSpecialist.studioCode || tenantDb.branding?.studioSubCode || 'Studio',
        dateLabel: selectedDateLabel,
        timeSlot: selectedTimeSlot,
        timeRange: computedTimeRange,
        totalPrice: pricingSummary.finalTotal,
        depositAmount: pricingSummary.depositAmount,
        status: 'confirmed',
        nailShape: selectedNailShape,
        inspoImages:
          resolvedAddedInspoPhotos.length > 0
            ? resolvedAddedInspoPhotos
            : [selectedService.image],
        notes: customNotes || '',
        createdAt: new Date().toISOString()
      };

      await persistTenantUpdate(
        (prev) => ({
          ...prev,
          appointments: [newApt, ...(prev.appointments || [])]
        }),
        `Turno ${newApt.code} guardado en Base de Datos`
      );

      showToast(`✅ Turno #${newApt.code} guardado y confirmado`);

      if (sendWhatsapp) {
        const cleanWa = String(tenantDb.operations?.whatsappNumber || '').replace(/\D/g, '');
        const cur = tenantDb.operations?.currencySymbol || '$';
        const msgLines = [
          `✨ *NUEVA RESERVA DE TURNO (${newApt.code})* ✨`,
          `🏢 *Salón:* ${tenantDb.branding?.businessName}`,
          `👤 *Clienta:* ${finalName}`,
          `💅 *Servicio:* ${selectedService.name} ${selectedService.addonLabel || ''}`,
          `👩‍🎨 *Especialista:* ${selectedSpecialist.name}`,
          `📅 *Fecha y Hora:* ${selectedDateLabel} (${computedTimeRange})`,
          `💎 *Estilo / Forma:* ${selectedNailShape}`,
          `🖼️ *Fotos Inspo adjuntas:* ${newApt.inspoImages.length} diseño(s)`,
          `💰 *Total:* ${cur}${pricingSummary.finalTotal.toLocaleString('es-AR')}`,
          `🔒 *Seña (${pricingSummary.depositPct}%):* ${cur}${pricingSummary.depositAmount.toLocaleString('es-AR')} (Alias: ${tenantDb.operations?.paymentAlias})`,
          customNotes ? `📝 *Nota:* ${customNotes}` : ''
        ]
          .filter(Boolean)
          .join('\n');

        const waUrl = `https://wa.me/${cleanWa}?text=${encodeURIComponent(msgLines)}`;
        window.open(waUrl, '_blank', 'noopener,noreferrer');
      }

      return newApt;
    },
    [
      clientProfile,
      activeSlug,
      tenantDb,
      selectedService,
      selectedSpecialist,
      selectedDateLabel,
      selectedTimeSlot,
      computedTimeRange,
      pricingSummary,
      selectedNailShape,
      resolvedAddedInspoPhotos,
      persistTenantUpdate,
      showToast
    ]
  );

  const resetCurrentTenantToDefaults = useCallback(async () => {
    const meta = registry.tenants.find((t) => t.slug === activeSlug) || {};
    const fresh = createTenantSeedDatabase(activeSlug, meta);
    const res = await resetTenantDatabaseOnDisk(activeSlug, fresh);
    setTenantDb(res.data);
    showToast('🔄 Datos de ejemplo restaurados en disco');
  }, [activeSlug, registry.tenants, showToast]);

  // ARAPY MASTER CONSOLE BRIDGE (/estetica-unas route + postMessage + global API)
  useEffect(() => {
    const bridgeApi = {
      moduleId: 'arapy-estetica-unas',
      route: '/estetica-unas',
      activeSlug,
      getTenants: () => registry.tenants,
      getActiveTenantDb: () => tenantDb,
      switchTenant,
      createNewTenant: createNewTenantFromArapy,
      setTenantStatus: toggleTenantStatusFromArapy,
      openArapyConsole: () => setActiveModal('arapy'),
      openOwnerPanel: () => setActiveModal('owner')
    };
    window.ARAPY_ESTETICA_UNAS_API = bridgeApi;

    // Emit state sync to parent ARAPY Master Console if embedded
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage(
          {
            source: 'arapy-estetica-unas',
            route: '/estetica-unas',
            type: 'ARAPY_MODULE_SYNC',
            activeSlug,
            businessName: tenantDb.branding?.businessName,
            status: tenantDb.status,
            tenantsCount: registry.tenants?.length || 0
          },
          '*'
        );
      }
    } catch {
      // ignore cross-origin frame errors
    }

    const onMessage = (event) => {
      const msg = event.data;
      if (!msg || msg.target !== 'arapy-estetica-unas') return;
      if (msg.action === 'SWITCH_TENANT' && msg.slug) {
        switchTenant(msg.slug);
      } else if (msg.action === 'SET_STATUS' && msg.slug && msg.status) {
        toggleTenantStatusFromArapy(msg.slug, msg.status);
      } else if (msg.action === 'CREATE_TENANT' && msg.payload) {
        createNewTenantFromArapy(msg.payload);
      } else if (msg.action === 'OPEN_PANEL') {
        setActiveModal(msg.panel || 'owner');
      }
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [
    activeSlug,
    registry.tenants,
    tenantDb,
    switchTenant,
    createNewTenantFromArapy,
    toggleTenantStatusFromArapy
  ]);

  const value = {
    registry,
    setRegistry,
    activeSlug,
    switchTenant,
    createNewTenantFromArapy,
    toggleTenantStatusFromArapy,
    tenantDb,
    isLoadingDb,
    saveStatus,
    persistTenantUpdate,
    updateBrandingField,
    updateOperationsField,
    applyThemePreset,
    updateCustomColor,
    uploadAndSaveImage,
    resetCurrentTenantToDefaults,
    activeScreen,
    setActiveScreen,
    viewMode,
    setViewMode,
    liveEditMode,
    setLiveEditMode,
    activeModal,
    setActiveModal,
    clientProfile,
    setClientProfile,
    selectedServiceId,
    setSelectedServiceId,
    selectedService,
    selectedSpecialistId,
    setSelectedSpecialistId,
    selectedSpecialist,
    selectedDateLabel,
    setSelectedDateLabel,
    selectedTimeSlot,
    setSelectedTimeSlot,
    computedTimeRange,
    selectedNailShape,
    setSelectedNailShape,
    addedInspoIds,
    setAddedInspoIds,
    clientUploadedInspo,
    setClientUploadedInspo,
    resolvedAddedInspoPhotos,
    likedInspoIds,
    toggleInspoSelection,
    toggleInspoLike,
    promoApplied,
    setPromoApplied,
    pricingSummary,
    selectServiceAndGoToBooking,
    confirmAndSaveAppointment,
    toastMessage,
    showToast
  };

  return <SaaSContext.Provider value={value}>{children}</SaaSContext.Provider>;
}

export function useSaaS() {
  const ctx = useContext(SaaSContext);
  if (!ctx) throw new Error('useSaaS must be used inside SaaSProvider');
  return ctx;
}
