import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef
} from 'react';
import {
  DEFAULT_MASTER_REGISTRY,
  createTenantSeedDatabase,
  THEME_PRESETS
} from '../data/seedTemplates';
import {
  loadMasterRegistry,
  saveMasterRegistry,
  getSynchronousTenantSnapshot,
  loadTenantDatabase,
  saveTenantDatabase,
  deleteTenantDatabaseCompletely,
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
    return (params.get('salon') || 'estudio-principal').trim().toLowerCase();
  };

  const [registry, setRegistry] = useState(DEFAULT_MASTER_REGISTRY);
  const registryRef = useRef(DEFAULT_MASTER_REGISTRY);

  const [activeSlug, setActiveSlug] = useState(getInitialSlug);

  const [tenantDb, setTenantDb] = useState(() => {
    const initSlug = getInitialSlug();
    const cached = getSynchronousTenantSnapshot(initSlug);
    return cached && cached.slug ? cached : createTenantSeedDatabase(initSlug);
  });
  const tenantDbRef = useRef(tenantDb);

  const [isLoadingDb, setIsLoadingDb] = useState(true);
  const [saveStatus, setSaveStatus] = useState({
    saving: false,
    diskSaved: true,
    lastSavedAt: new Date().toISOString(),
    message: 'Datos sincronizados y guardados'
  });

  // Navigation & View Modes:
  // activeScreen: 'splash' | 'home' | 'services' | 'inspo' | 'booking'
  // viewMode: 'single' (Native Full-Screen Mobile App)
  const [activeScreen, setActiveScreen] = useState('splash');
  const [viewMode, setViewMode] = useState('single');
  const [liveEditMode, setLiveEditMode] = useState(false);

  // Modals: 'none' | 'ai' | 'owner' | 'arapy' | 'share' | 'drawer'
  const [activeModal, setActiveModal] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const panel = params.get('panel') || params.get('mode');
    if (panel === 'owner' || panel === 'admin') return 'owner';
    if (panel === 'arapy' || panel === 'superadmin') return 'arapy';
    if (panel === 'share') return 'share';
    if (panel === 'drawer' || panel === 'menu') return 'drawer';
    return 'none';
  });

  // End-Client Booking Draft State
  const [clientProfile, setClientProfile] = useState(() =>
    loadClientProfileMemory(
      getInitialSlug(),
      tenantDb?.branding?.defaultClientGreetingName || 'Clienta'
    )
  );
  const [selectedServiceId, setSelectedServiceId] = useState('srv-manicure-3d');
  const [selectedSpecialistId, setSelectedSpecialistId] = useState('spec-1');
  const [selectedDateLabel, setSelectedDateLabel] = useState('Hoy');
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

  // Keep refs synced at all times
  useEffect(() => {
    tenantDbRef.current = tenantDb;
  }, [tenantDb]);

  useEffect(() => {
    registryRef.current = registry;
  }, [registry]);

  // Load Master Registry & Active Tenant Database from Disk + IndexedDB + LocalStorage
  useEffect(() => {
    let mounted = true;
    async function boot() {
      setIsLoadingDb(true);
      const reg = await loadMasterRegistry(DEFAULT_MASTER_REGISTRY);
      if (!mounted) return;
      registryRef.current = reg;
      setRegistry(reg);

      const tenantMeta = reg.tenants.find((t) => t.slug === activeSlug) || {};
      const loadedDb = await loadTenantDatabase(activeSlug, (slug) =>
        createTenantSeedDatabase(slug, tenantMeta)
      );
      if (!mounted) return;

      // Ensure legacy records always have categories, workOptions, availableDates arrays
      const normalizedDb = {
        ...loadedDb,
        categories:
          Array.isArray(loadedDb.categories) && loadedDb.categories.length > 0
            ? loadedDb.categories
            : createTenantSeedDatabase(activeSlug).categories,
        operations: {
          ...createTenantSeedDatabase(activeSlug).operations,
          ...(loadedDb.operations || {})
        },
        branding: {
          ...createTenantSeedDatabase(activeSlug).branding,
          ...(loadedDb.branding || {})
        },
        finances: {
          ...createTenantSeedDatabase(activeSlug).finances,
          ...(loadedDb.finances || {})
        }
      };

      tenantDbRef.current = normalizedDb;
      setTenantDb(normalizedDb);
      setClientProfile(
        loadClientProfileMemory(
          activeSlug,
          normalizedDb.branding?.defaultClientGreetingName || 'Clienta'
        )
      );

      // Ensure selected IDs exist in this tenant's catalog
      if (normalizedDb.services?.length) {
        setSelectedServiceId((prev) =>
          normalizedDb.services.some((s) => s.id === prev)
            ? prev
            : normalizedDb.services[0].id
        );
      }
      if (normalizedDb.specialists?.length) {
        setSelectedSpecialistId((prev) =>
          normalizedDb.specialists.some((s) => s.id === prev)
            ? prev
            : normalizedDb.specialists[0].id
        );
      }
      if (normalizedDb.operations?.availableDates?.length) {
        setSelectedDateLabel((prev) =>
          normalizedDb.operations.availableDates.includes(prev)
            ? prev
            : normalizedDb.operations.availableDates[0]
        );
      }
      if (normalizedDb.operations?.timeSlots?.length) {
        setSelectedTimeSlot((prev) =>
          normalizedDb.operations.timeSlots.includes(prev)
            ? prev
            : normalizedDb.operations.timeSlots[0]
        );
      }
      if (normalizedDb.operations?.workOptions?.length) {
        setSelectedNailShape((prev) =>
          normalizedDb.operations.workOptions.includes(prev)
            ? prev
            : normalizedDb.operations.workOptions[0]
        );
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
    document.title = `${tenantDb?.branding?.businessName || 'Estudio de Belleza'} — Turnos Online`;
  }, [tenantDb]);

  // Core Persistence Mutator: synchronously computes next state via tenantDbRef and saves to LocalStorage + IndexedDB + Disk
  const persistTenantUpdate = useCallback(
    async (updater, statusText = 'Guardado permanentemente') => {
      setSaveStatus((prev) => ({ ...prev, saving: true, message: 'Guardando cambios...' }));

      const currentDb = tenantDbRef.current;
      const nextDb = typeof updater === 'function' ? updater(currentDb) : updater;

      if (!nextDb) return;

      tenantDbRef.current = nextDb;
      setTenantDb(nextDb);

      const res = await saveTenantDatabase(activeSlug, nextDb);

      // Sync businessName, ownerName, phone, city in Master Registry if changed
      if (nextDb.branding?.businessName) {
        const currentReg = registryRef.current;
        const existsInReg = (currentReg.tenants || []).some((t) => t.slug === activeSlug);
        const updatedTenants = existsInReg
          ? currentReg.tenants.map((t) =>
              t.slug === activeSlug
                ? {
                    ...t,
                    businessName: nextDb.branding.businessName,
                    ownerName: nextDb.operations?.paymentHolder || t.ownerName,
                    whatsappNumber: nextDb.operations?.whatsappNumber || t.whatsappNumber,
                    status: nextDb.status || t.status
                  }
                : t
            )
          : [
              ...(currentReg.tenants || []),
              {
                slug: activeSlug,
                businessName: nextDb.branding.businessName,
                ownerName: nextDb.operations?.paymentHolder || 'Titular',
                ownerPin: nextDb.ownerPin || '1234',
                plan: nextDb.plan || 'PRO IA FULL',
                status: nextDb.status || 'active',
                city: nextDb.operations?.address || 'Local Principal',
                createdAt: new Date().toISOString(),
                dbNamespace: `arapy_tenant_db::${activeSlug}`
              }
            ];

        const nextReg = { ...currentReg, tenants: updatedTenants };
        registryRef.current = nextReg;
        setRegistry(nextReg);
        await saveMasterRegistry(updatedTenants, currentReg.arapyConfig);
      }

      setSaveStatus({
        saving: false,
        diskSaved: res.diskSaved,
        lastSavedAt: res.updatedAt,
        message: statusText
      });
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
        `Guardado: ${field}`
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
        `Guardado: ${field}`
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
        `Paleta aplicada: ${preset.name}`
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
        'Color personalizado guardado'
      );
    },
    [persistTenantUpdate]
  );

  // Upload any photo from phone/PC and save permanently
  const uploadAndSaveImage = useCallback(
    async (file, label = 'photo') => {
      if (!file) return null;
      setSaveStatus((prev) => ({
        ...prev,
        saving: true,
        message: 'Optimizando y guardando foto...'
      }));
      const uploaded = await compressAndUploadImage(file, activeSlug, label);
      setSaveStatus({
        saving: false,
        diskSaved: uploaded.persistedOnDisk,
        lastSavedAt: uploaded.savedAt,
        message: '📷 Foto guardada permanentemente'
      });
      showToast('📷 Foto guardada en la base de datos del negocio');
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
      showToast(`🏢 Base de datos activa: ${clean}`);
    },
    [showToast]
  );

  // Unlimited Clients CRUD in ARAPY Master Console
  const createNewTenantFromArapy = useCallback(
    async ({ businessName, slug, ownerName, ownerPin, whatsappNumber, city, plan }) => {
      const cleanSlug = String(slug || businessName || `cliente-${Date.now()}`)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      if (!cleanSlug) return null;

      const newTenantEntry = {
        slug: cleanSlug,
        businessName: businessName || 'Nombre de tu Salón (Editable)',
        ownerName: ownerName || 'Titular del Negocio (Editable)',
        ownerPin: ownerPin || '1234',
        plan: plan || 'PRO IA FULL',
        status: 'active',
        city: city || 'Dirección / Ciudad (Editable)',
        whatsappNumber: whatsappNumber || '5491100000000',
        createdAt: new Date().toISOString(),
        dbNamespace: `arapy_tenant_db::${cleanSlug}`
      };

      const freshDb = createTenantSeedDatabase(cleanSlug, {
        businessName: newTenantEntry.businessName,
        ownerName: newTenantEntry.ownerName,
        ownerPin: newTenantEntry.ownerPin,
        whatsappNumber: newTenantEntry.whatsappNumber,
        address: newTenantEntry.city,
        status: 'active',
        plan: newTenantEntry.plan
      });

      await saveTenantDatabase(cleanSlug, freshDb);

      const currentReg = registryRef.current;
      const nextTenants = [
        ...(currentReg.tenants || []).filter((t) => t.slug !== cleanSlug),
        newTenantEntry
      ];
      const nextReg = { ...currentReg, tenants: nextTenants };
      registryRef.current = nextReg;
      setRegistry(nextReg);
      await saveMasterRegistry(nextTenants, currentReg.arapyConfig);
      switchTenant(cleanSlug);
      return cleanSlug;
    },
    [switchTenant]
  );

  const updateTenantMetaFromArapy = useCallback(
    async (targetSlug, patch) => {
      const currentReg = registryRef.current;
      const nextTenants = (currentReg.tenants || []).map((t) =>
        t.slug === targetSlug ? { ...t, ...patch } : t
      );
      const nextReg = { ...currentReg, tenants: nextTenants };
      registryRef.current = nextReg;
      setRegistry(nextReg);
      await saveMasterRegistry(nextTenants, currentReg.arapyConfig);

      if (targetSlug === activeSlug) {
        await persistTenantUpdate((prev) => ({
          ...prev,
          status: patch.status ?? prev.status,
          branding: {
            ...prev.branding,
            businessName: patch.businessName ?? prev.branding.businessName
          },
          operations: {
            ...prev.operations,
            paymentHolder: patch.ownerName ?? prev.operations.paymentHolder,
            whatsappNumber: patch.whatsappNumber ?? prev.operations.whatsappNumber
          }
        }));
      }
    },
    [activeSlug, persistTenantUpdate]
  );

  const toggleTenantStatusFromArapy = useCallback(
    async (targetSlug, nextStatus) => {
      await updateTenantMetaFromArapy(targetSlug, { status: nextStatus });
      showToast(`Estado de ${targetSlug}: ${nextStatus.toUpperCase()}`);
    },
    [updateTenantMetaFromArapy, showToast]
  );

  const deleteTenantFromArapy = useCallback(
    async (targetSlug) => {
      const currentReg = registryRef.current;
      const remaining = (currentReg.tenants || []).filter((t) => t.slug !== targetSlug);
      await deleteTenantDatabaseCompletely(targetSlug);

      // If all tenants were deleted, create a clean default one so the app always has an active workspace
      const finalTenants =
        remaining.length > 0 ? remaining : DEFAULT_MASTER_REGISTRY.tenants.slice(0, 1);

      const nextReg = { ...currentReg, tenants: finalTenants };
      registryRef.current = nextReg;
      setRegistry(nextReg);
      await saveMasterRegistry(finalTenants, currentReg.arapyConfig);

      if (targetSlug === activeSlug) {
        switchTenant(finalTenants[0].slug);
      }
      showToast(`🗑️ Cliente "${targetSlug}" eliminado permanentemente`);
    },
    [activeSlug, switchTenant, showToast]
  );

  // Booking Flow Computed State
  const selectedService = useMemo(() => {
    return (
      tenantDb.services?.find((s) => s.id === selectedServiceId) ||
      tenantDb.services?.[0] || {
        id: 'default',
        name: 'Servicio (Editable)',
        addonLabel: '+ detalle',
        price: 20000,
        durationMin: 60,
        image: './assets/studio-nails.jpg'
      }
    );
  }, [tenantDb.services, selectedServiceId]);

  const selectedSpecialist = useMemo(() => {
    return (
      tenantDb.specialists?.find((s) => s.id === selectedSpecialistId) ||
      tenantDb.specialists?.[0] || {
        id: 'spec-default',
        name: 'Colaboradora (Editable)',
        role: 'Especialista',
        studioCode: tenantDb.branding?.studioSubCode || 'Sucursal Principal',
        avatar: './assets/stylist-main.jpg'
      }
    );
  }, [tenantDb.specialists, selectedSpecialistId, tenantDb.branding?.studioSubCode]);

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
    const dur = Number(selectedService?.durationMin || 60);
    // Add +20 min automatically if the selected work option mentions removal ("retiro")
    const extraRemoval = String(selectedNailShape || '')
      .toLowerCase()
      .includes('retiro')
      ? 20
      : 0;
    const totalMinutes = hh * 60 + mm + dur + extraRemoval;
    const endH = String(Math.floor(totalMinutes / 60) % 24).padStart(2, '0');
    const endM = String(totalMinutes % 60).padStart(2, '0');
    return `${start}-${endH}:${endM}`;
  }, [selectedTimeSlot, selectedService, selectedNailShape]);

  const selectServiceAndGoToBooking = useCallback(
    (serviceId, applyPromoDiscount = false) => {
      setSelectedServiceId(serviceId);
      setPromoApplied(Boolean(applyPromoDiscount));
      setActiveScreen('booking');
      showToast('✨ Servicio seleccionado para tu reserva');
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
      const finalName = (
        customClientName ||
        clientProfile.name ||
        tenantDb.branding?.defaultClientGreetingName ||
        'Clienta'
      ).trim();
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
        code: `${(tenantDb.branding?.logoText || 'TS').toUpperCase()}-${Math.floor(
          100 + Math.random() * 900
        )}`,
        clientName: finalName,
        clientPhone: finalPhone,
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        addonLabel: selectedService.addonLabel || '',
        specialistId: selectedSpecialist.id,
        specialistName: selectedSpecialist.name,
        studioCode:
          selectedSpecialist.studioCode || tenantDb.branding?.studioSubCode || 'Sucursal',
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
        `Turno ${newApt.code} guardado en la Agenda`
      );

      showToast(`✅ Turno #${newApt.code} guardado y confirmado`);

      if (sendWhatsapp) {
        const cleanWa = String(tenantDb.operations?.whatsappNumber || '').replace(/\D/g, '');
        const cur = tenantDb.operations?.currencySymbol || '$';
        const msgLines = [
          `✨ *NUEVA RESERVA DE TURNO (${newApt.code})* ✨`,
          `🏢 *Salón:* ${tenantDb.branding?.businessName}`,
          `📍 *Dirección:* ${tenantDb.operations?.address || ''}`,
          `👤 *Clienta:* ${finalName}`,
          `💅 *Servicio:* ${selectedService.name} ${selectedService.addonLabel || ''}`,
          `👩‍🎨 *Profesional:* ${selectedSpecialist.name}`,
          `📅 *Fecha y Hora:* ${selectedDateLabel} (${computedTimeRange})`,
          `💎 *Opción / Detalle:* ${selectedNailShape}`,
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
    const meta = registryRef.current.tenants.find((t) => t.slug === activeSlug) || {};
    const fresh = createTenantSeedDatabase(activeSlug, meta);
    const res = await resetTenantDatabaseOnDisk(activeSlug, fresh);
    tenantDbRef.current = res.data;
    setTenantDb(res.data);
    showToast('🔄 Plantilla base restaurada');
  }, [activeSlug, showToast]);

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
      updateTenantMeta: updateTenantMetaFromArapy,
      deleteTenant: deleteTenantFromArapy,
      setTenantStatus: toggleTenantStatusFromArapy,
      openArapyConsole: () => setActiveModal('arapy'),
      openOwnerPanel: () => setActiveModal('owner')
    };
    window.ARAPY_ESTETICA_UNAS_API = bridgeApi;

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
      } else if (msg.action === 'DELETE_TENANT' && msg.slug) {
        deleteTenantFromArapy(msg.slug);
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
    updateTenantMetaFromArapy,
    deleteTenantFromArapy,
    toggleTenantStatusFromArapy
  ]);

  const value = {
    registry,
    setRegistry,
    activeSlug,
    switchTenant,
    createNewTenantFromArapy,
    updateTenantMetaFromArapy,
    deleteTenantFromArapy,
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
