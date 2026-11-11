// ============================================================================
// ARAPY MULTI-TENANT WHITE-LABEL SEED TEMPLATES
// Zero proper names hardcoded. 100% of business data, categories, services,
// collaborators, work options, schedules, phones, addresses, photos, and UI
// labels live in each tenant's isolated database and are 100% editable.
// ============================================================================

export const THEME_PRESETS = [
  {
    id: 'dusty-rose-luxury',
    name: 'Dusty Rose & Dark Studio (Referencia Original)',
    primaryRose: '#D67479',
    primaryRoseDark: '#B8585E',
    primaryRoseSoft: '#F6E2E3',
    lilacAccent: '#CFA8F5',
    lilacDark: '#A978DF',
    ivoryBg: '#FAF7F6',
    sheetCream: '#F7F2EE',
    studioDark: '#191412',
    splashDark: '#0F0C0D'
  },
  {
    id: 'lavender-noir',
    name: 'Lavender Noir & Alabaster',
    primaryRose: '#B87FE8',
    primaryRoseDark: '#9256C4',
    primaryRoseSoft: '#EFE4FA',
    lilacAccent: '#CFA8F5',
    lilacDark: '#9B6BD1',
    ivoryBg: '#F9F7FC',
    sheetCream: '#F6F2F9',
    studioDark: '#141118',
    splashDark: '#0C0910'
  },
  {
    id: 'champagne-gold',
    name: 'Champagne Gold & Nude Atelier',
    primaryRose: '#C5956B',
    primaryRoseDark: '#A4754D',
    primaryRoseSoft: '#F5EAE0',
    lilacAccent: '#DFB995',
    lilacDark: '#B98C62',
    ivoryBg: '#FAF7F3',
    sheetCream: '#F7F2EC',
    studioDark: '#1A1511',
    splashDark: '#110D0A'
  },
  {
    id: 'emerald-botanical',
    name: 'Emerald Spa & Soft Cream',
    primaryRose: '#4A8B75',
    primaryRoseDark: '#366E5B',
    primaryRoseSoft: '#E2F1EC',
    lilacAccent: '#8ED1B9',
    lilacDark: '#5BA88D',
    ivoryBg: '#F6FAF8',
    sheetCream: '#F1F6F3',
    studioDark: '#111916',
    splashDark: '#0A100E'
  }
];

export const DEFAULT_MASTER_REGISTRY = {
  arapyConfig: {
    platformName: 'ARAPY Cloud Control — Multi-Negocios',
    masterPin: '2026',
    supportWhatsapp: '5493764000000',
    centralWebhookUrl: ''
  },
  tenants: [
    {
      slug: 'estudio-principal',
      businessName: 'Nombre de tu Salón (Editable)',
      ownerName: 'Titular del Negocio (Editable)',
      ownerPin: '1234',
      plan: 'PRO IA FULL',
      status: 'active',
      city: 'Tu Ciudad (Editable)',
      createdAt: '2026-11-01T10:00:00.000Z',
      dbNamespace: 'arapy_tenant_db::estudio-principal'
    },
    {
      slug: 'sucursal-demo-2',
      businessName: 'Salón Ejemplo 2 (Editable)',
      ownerName: 'Titular Sucursal 2 (Editable)',
      ownerPin: '1234',
      plan: 'PRO IA FULL',
      status: 'active',
      city: 'Sucursal 2 (Editable)',
      createdAt: '2026-11-05T14:00:00.000Z',
      dbNamespace: 'arapy_tenant_db::sucursal-demo-2'
    }
  ]
};

export function createTenantSeedDatabase(slug = 'estudio-principal', customMeta = {}) {
  const isSecondDemo = slug === 'sucursal-demo-2';
  const businessName =
    customMeta.businessName ||
    (isSecondDemo ? 'Salón Ejemplo 2 (Editable)' : 'Nombre de tu Salón (Editable)');
  const ownerName =
    customMeta.ownerName ||
    (isSecondDemo ? 'Titular Sucursal 2 (Editable)' : 'Titular del Negocio (Editable)');

  return {
    slug,
    dbNamespace: `arapy_tenant_db::${slug}`,
    ownerPin: customMeta.ownerPin || '1234',
    status: customMeta.status || 'active',
    plan: customMeta.plan || 'PRO IA FULL',

    // 1. BRANDING & ALL UI TEXTS / LABELS (100% Editable on-screen or in Owner Panel)
    branding: {
      businessName,
      studioBadgeTitle: 'B E A U T Y   S T U D I O',
      studioSubCode: 'Sucursal Principal',
      logoText: 'TS',
      logoUrl: '',
      defaultClientGreetingName: 'Clienta',

      // Screen 1: Splash Hero
      splashHeroImage: './assets/splash-hero.jpg',
      splashTitleLine1: 'Lucí Increíble,',
      splashTitleLine2Prefix: 'Sentite ',
      splashTitleHighlight: 'Única',
      splashSubtitle: 'Estética de Uñas & Peluquería Femenina diseñada a tu medida',
      splashPrimaryButton: 'Reservar Turno',
      splashSecondaryButton: 'Explorar Servicios',

      // Screen 2: Home Dashboard
      homeWelcomePrefix: 'Hola,',
      homeWelcomeSubtitle: '¡Bienvenida a nuestro espacio de belleza!',
      searchPlaceholder: 'Buscar servicio, diseño, tratamiento...',
      allCategoriesLabel: '✨ Todo',
      inspoShortcutLabel: '🖤 Add Inspo',
      popularSectionTitle: 'Servicios Destacados',
      seeAllLabel: 'Ver todos',
      offersSectionTitle: 'Promociones Activas',
      seeCombosLabel: 'Ver más',
      upcomingSectionTitle: 'Próximo Turno',
      emptyAppointmentTitle: 'Aún no tenés turnos agendados',
      emptyAppointmentSub: 'Tocá aquí para elegir tu servicio y horario',
      bookButtonLabel: 'Reservar',
      aiButtonLabel: 'Asesora IA',

      // Special Offer Banner
      offerDiscountBadge: '20% OFF',
      offerTitle: 'Promoción Especial (Editable)',
      offerSubtitle: 'Configurable desde tu panel o tocando aquí',
      offerButtonText: 'Reservar Promo',
      offerBannerImage: './assets/hair-balayage.jpg',
      offerLinkedServiceId: 'srv-hair-color',

      // Screen 3: Our Services Header
      servicesHeaderTitle: 'Nuestros Servicios',
      servicesHeaderSubtitle: 'Elegí la categoría o el trabajo que querés realizarte hoy',

      // Screen 4: Add Inspo Dark Screen
      inspoHeaderTitle: 'Add inspo',
      inspoHeaderSubtitle: 'Elegí fotos de referencia o subí la tuya para tu turno',
      inspoUploadButtonLabel: 'Subir Foto Propia',
      inspoBookNowButtonLabel: 'Book now',
      inspoExploreTabLabel: 'Explorar Todo',
      inspoConfirmFooterLabel: 'Usar diseños elegidos en mi Turno →',

      // Screen 5: Beauty Studio Booking Sheet
      bookingHeroImage: './assets/studio-nails.jpg',
      studioInteriorImage: './assets/studio-lounge.jpg',
      bookingStatusUnconfirmed: 'Pendiente de confirmar',
      bookingStylistPrefix: 'Profesional:',
      bookingAddedInspoLabel: 'Added inspo',
      bookingSelectedDateLabel: 'Fecha y Hora',
      bookingConfirmButtonPrefix: 'Confirmar Turno • Seña',
      depositLegalNote:
        'Al confirmar la reserva, se solicita una seña para asegurar tu lugar en la agenda.',

      // Color Theme
      themeId: isSecondDemo ? 'lavender-noir' : 'dusty-rose-luxury',
      colors: isSecondDemo ? { ...THEME_PRESETS[1] } : { ...THEME_PRESETS[0] }
    },

    // 2. OPERATIONS, CONTACT INFO, SCHEDULE, WORK OPTIONS, DEPOSIT & WHATSAPP (100% Editable)
    operations: {
      currencySymbol: '$',
      depositPercentage: 50,
      paymentAlias: 'TU.ALIAS.MP',
      paymentCvu: '0000000000000000000000',
      paymentHolder: ownerName,
      paymentBankName: 'Mercado Pago / Transferencia Bancaria',
      whatsappNumber: customMeta.whatsappNumber || '5491100000000',
      phoneDisplay: '+54 9 11 0000-0000 (Editable)',
      address: customMeta.address || 'Dirección de tu Local 123 (Editable)',
      businessHoursText: 'Lun a Sáb de 09:00 a 20:00 hs (Editable)',
      openDays: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
      availableDates: [
        'Hoy',
        'Mañana',
        'Jueves',
        'Viernes',
        'Sábado',
        'Lunes',
        'Martes',
        'Miércoles'
      ],
      timeSlots: [
        '09:00',
        '10:00',
        '11:00',
        '12:00',
        '13:30',
        '15:00',
        '16:30',
        '18:00',
        '19:00'
      ],
      workOptions: [
        'Almendra',
        'Coffin',
        'Squoval',
        'Natural / Corto',
        'Con Retiro Previo (+20 min)',
        'Pelo Corto / Medio',
        'Pelo Largo'
      ],
      aiGreeting:
        '¡Hola! Soy la Asesora IA del salón. Contame qué servicio o estilo te gustaría hacerte hoy y te armo la recomendación ideal con precios y horarios disponibles.'
    },

    // 3. DYNAMIC CATEGORIES (Unlimited: Owner can add, edit, or delete any category)
    categories: [
      {
        id: 'unas',
        name: 'Estética de Uñas',
        shortLabel: 'Uñas',
        icon: '💅'
      },
      {
        id: 'pelo',
        name: 'Peluquería Femenina',
        shortLabel: 'Peluquería',
        icon: '✂️'
      },
      {
        id: 'combos',
        name: 'Combos Integrales',
        shortLabel: 'Combos',
        icon: '✨'
      }
    ],

    // 4. COLLABORATORS / SPECIALISTS (Unlimited: Owner can add, edit, or remove any collaborator)
    specialists: [
      {
        id: 'spec-1',
        name: 'Colaboradora 1 (Nombre Editable)',
        role: 'Especialista Principal (Editable)',
        studioCode: 'Box / Sillón 1',
        avatar: './assets/stylist-main.jpg',
        rating: '5.0',
        specialties: ['unas', 'pelo', 'combos'],
        verified: true
      },
      {
        id: 'spec-2',
        name: 'Colaboradora 2 (Nombre Editable)',
        role: 'Especialista en Uñas & Nail Art (Editable)',
        studioCode: 'Box / Mesa 2',
        avatar: './assets/inspo-rose-french.jpg',
        rating: '4.9',
        specialties: ['unas', 'combos'],
        verified: true
      },
      {
        id: 'spec-3',
        name: 'Colaboradora 3 (Nombre Editable)',
        role: 'Estilista & Colorista (Editable)',
        studioCode: 'Sillón 3',
        avatar: './assets/hair-cut.jpg',
        rating: '4.9',
        specialties: ['pelo', 'combos'],
        verified: true
      }
    ],

    // 5. SERVICES / WORK CATALOG (Unlimited: Owner can add, edit, or delete any service)
    services: [
      {
        id: 'srv-manicure-3d',
        name: 'Manicure 3D',
        addonLabel: '+ mini patterns',
        category: 'unas',
        popularIcon: 'sparkles',
        isPopular: true,
        shortDesc: 'Esculpido, relieve 3D, efectos Chrome & Nail Art personalizado',
        price: 24000,
        durationMin: 90,
        image: './assets/studio-nails.jpg'
      },
      {
        id: 'srv-kapping-gel',
        name: 'Kapping Gel & Semipermanente',
        addonLabel: '+ nivelación',
        category: 'unas',
        popularIcon: 'hand',
        isPopular: true,
        shortDesc: 'Baño de gel protector sobre uña natural + color de larga duración',
        price: 19500,
        durationMin: 60,
        image: './assets/inspo-rose-french.jpg'
      },
      {
        id: 'srv-soft-gel',
        name: 'Soft Gel Extensions',
        addonLabel: '+ largo a elección',
        category: 'unas',
        popularIcon: 'gem',
        isPopular: true,
        shortDesc: 'Alargamiento con tips de gel livianos y acabado natural',
        price: 26000,
        durationMin: 90,
        image: './assets/inspo-black-gold.jpg'
      },
      {
        id: 'srv-hair-cut',
        name: 'Corte Femenino & Brushing',
        addonLabel: '+ lavado spa',
        category: 'pelo',
        popularIcon: 'scissors',
        isPopular: true,
        shortDesc: 'Corte de diseño adaptado a tus facciones + modelado profesional',
        price: 18000,
        durationMin: 60,
        image: './assets/hair-cut.jpg'
      },
      {
        id: 'srv-hair-color',
        name: 'Coloración & Balayage',
        addonLabel: '+ baño de luz',
        category: 'pelo',
        popularIcon: 'palette',
        isPopular: true,
        shortDesc: 'Iluminación dimensional, mechas, rubios personalizados o color global',
        price: 42000,
        durationMin: 120,
        image: './assets/hair-balayage.jpg'
      },
      {
        id: 'srv-hair-spa',
        name: 'Hair Spa & Nutrición Capilar',
        addonLabel: '+ sellado brillo',
        category: 'pelo',
        popularIcon: 'flower',
        isPopular: true,
        shortDesc: 'Hidratación profunda anti-frizz con keratina orgánica y masaje capilar',
        price: 25000,
        durationMin: 60,
        image: './assets/splash-hero.jpg'
      },
      {
        id: 'srv-combo-total',
        name: 'Combo Uñas + Corte & Brushing',
        addonLabel: '+ sesión integral',
        category: 'combos',
        popularIcon: 'crown',
        isPopular: true,
        shortDesc: 'Manicura Semipermanente/Kapping + Corte o Brushing en una sola visita',
        price: 34000,
        durationMin: 90,
        image: './assets/studio-lounge.jpg'
      }
    ],

    // 6. "ADD INSPO" GALLERY (Unlimited: Owner & clients can add/replace/delete photos)
    inspoGallery: [
      {
        id: 'inspo-1',
        title: 'Black Matte & Rose Gold French',
        category: 'unas',
        nailShape: 'Almendra',
        likes: 148,
        image: './assets/inspo-black-gold.jpg',
        linkedServiceId: 'srv-manicure-3d'
      },
      {
        id: 'inspo-2',
        title: 'Milky Pink & Micro Pearl French',
        category: 'unas',
        nailShape: 'Almendra',
        likes: 215,
        image: './assets/inspo-rose-french.jpg',
        linkedServiceId: 'srv-kapping-gel'
      },
      {
        id: 'inspo-3',
        title: 'Violet Chrome 3D Relief',
        category: 'unas',
        nailShape: 'Coffin',
        likes: 189,
        image: './assets/studio-nails.jpg',
        linkedServiceId: 'srv-manicure-3d'
      },
      {
        id: 'inspo-4',
        title: 'Balayage Caramel Rose Waves',
        category: 'pelo',
        nailShape: 'Ondas Glamour',
        likes: 174,
        image: './assets/hair-balayage.jpg',
        linkedServiceId: 'srv-hair-color'
      },
      {
        id: 'inspo-5',
        title: 'Layered Cut & Brushing',
        category: 'pelo',
        nailShape: 'Corte en Capas',
        likes: 132,
        image: './assets/hair-cut.jpg',
        linkedServiceId: 'srv-hair-cut'
      },
      {
        id: 'inspo-6',
        title: 'Berry Chrome Nails & Glossy Waves',
        category: 'combos',
        nailShape: 'Look Completo',
        likes: 264,
        image: './assets/splash-hero.jpg',
        linkedServiceId: 'srv-combo-total'
      }
    ],

    // 7. SAMPLE APPOINTMENTS AGENDA (Editable & manageable in Owner Agenda)
    appointments: [
      {
        id: 'apt-1001',
        code: 'TS-841',
        clientName: 'Clienta Ejemplo (Editable)',
        clientPhone: '5491100000000',
        serviceId: 'srv-hair-cut',
        serviceName: 'Corte Femenino & Brushing',
        addonLabel: '+ lavado spa',
        specialistId: 'spec-1',
        specialistName: 'Colaboradora 1 (Nombre Editable)',
        studioCode: 'Sucursal Principal',
        dateLabel: 'Hoy',
        timeSlot: '11:00',
        timeRange: '11:00-12:00',
        totalPrice: 18000,
        depositAmount: 9000,
        status: 'completed',
        nailShape: 'Natural / Corto',
        inspoImages: ['./assets/hair-cut.jpg', './assets/inspo-rose-french.jpg'],
        notes: 'Turno atendido y abonado en su totalidad.',
        paymentMethod: 'Mercado Pago / Transferencia',
        commissionPaid: 5400,
        createdAt: '2026-11-11T10:00:00.000Z'
      },
      {
        id: 'apt-1002',
        code: 'TS-842',
        clientName: 'Clienta 2 (Editable)',
        clientPhone: '5491100000001',
        serviceId: 'srv-manicure-3d',
        serviceName: 'Manicure 3D',
        addonLabel: '+ mini patterns',
        specialistId: 'spec-2',
        specialistName: 'Colaboradora 2 (Nombre Editable)',
        studioCode: 'Sucursal Principal',
        dateLabel: 'Mañana',
        timeSlot: '15:00',
        timeRange: '15:00-16:30',
        totalPrice: 24000,
        depositAmount: 12000,
        status: 'confirmed',
        nailShape: 'Almendra',
        inspoImages: ['./assets/studio-nails.jpg'],
        notes: 'Seña abonada por Alias bancario.',
        paymentMethod: 'Transferencia Bancaria',
        commissionPaid: 7200,
        createdAt: '2026-11-11T11:00:00.000Z'
      }
    ],

    // 8. FULL FINANCIAL SYSTEM (Cash Flow, Incomes, Expenses, Commissions & Daily Closing)
    finances: {
      initialCashBalance: 15000,
      collaboratorCommissionRate: 40, // % standard commission for collaborators
      taxRate: 0,
      paymentMethods: [
        'Efectivo',
        'Mercado Pago / Transferencia',
        'Tarjeta de Débito',
        'Tarjeta de Crédito',
        'Cuenta Corriente'
      ],
      expenses: [
        {
          id: 'exp-1',
          date: '2026-11-11',
          category: 'Insumos & Esmaltes',
          concept: 'Reposición geles UV, limas y top coat',
          amount: 8500,
          paymentMethod: 'Efectivo',
          collaboratorId: 'general',
          receiptNumber: 'FAC-00129'
        },
        {
          id: 'exp-2',
          date: '2026-11-10',
          category: 'Servicios & Alquiler',
          concept: 'Luz y Wi-Fi del salón',
          amount: 14000,
          paymentMethod: 'Mercado Pago / Transferencia',
          collaboratorId: 'general',
          receiptNumber: 'FAC-00118'
        }
      ],
      cashMovements: [
        {
          id: 'mov-1',
          date: '2026-11-11T09:00:00.000Z',
          type: 'apertura', // 'apertura' | 'ingreso' | 'egreso' | 'retiro'
          description: 'Apertura de Caja Inicial',
          amount: 15000,
          paymentMethod: 'Efectivo'
        }
      ]
    },

    // 9. PER-TENANT CLOUD DATABASE CONNECTOR (Supabase / Webhook)
    databaseConfig: {
      provider: 'local_disk_and_idb',
      supabaseUrl: '',
      supabaseAnonKey: '',
      webhookUrl: ''
    }
  };
}
