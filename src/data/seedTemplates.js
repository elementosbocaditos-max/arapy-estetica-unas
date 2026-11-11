// ============================================================================
// ARAPY MULTI-TENANT SEED TEMPLATES
// Every single text, image, service, specialist, schedule, and color is stored
// inside the tenant's isolated database and is 100% editable by the business owner.
// ============================================================================

export const THEME_PRESETS = [
  {
    id: 'dusty-rose-luxury',
    name: 'Dusty Rose & Dark Studio (Original Referencia)',
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
    platformName: 'ARAPY Cloud Control — Beauty & Nail SaaS',
    masterPin: '2026',
    supportWhatsapp: '5493764000000',
    centralWebhookUrl: ''
  },
  tenants: [
    {
      slug: 'daniela-gimenez',
      businessName: 'Daniela Giménez — Nail & Hair Studio',
      ownerName: 'Daniela Giménez',
      ownerPin: '1234',
      plan: 'PRO IA FULL',
      status: 'active', // 'active' | 'trial' | 'suspended'
      city: 'Argentina',
      createdAt: '2026-11-01T10:00:00.000Z',
      dbNamespace: 'arapy_tenant_db::daniela-gimenez'
    },
    {
      slug: 'velvet-atelier',
      businessName: 'Velvet Nails & Hair Boutique',
      ownerName: 'Valentina Gómez',
      ownerPin: '1234',
      plan: 'PRO IA FULL',
      status: 'active',
      city: 'Buenos Aires',
      createdAt: '2026-11-05T14:00:00.000Z',
      dbNamespace: 'arapy_tenant_db::velvet-atelier'
    }
  ]
};

export function createTenantSeedDatabase(slug = 'daniela-gimenez', customMeta = {}) {
  const isVelvet = slug === 'velvet-atelier';
  const businessName =
    customMeta.businessName ||
    (isVelvet ? 'Velvet Nails & Hair Boutique' : 'Daniela Giménez Studio');
  const ownerName =
    customMeta.ownerName || (isVelvet ? 'Valentina Gómez' : 'Daniela Giménez');

  return {
    slug,
    dbNamespace: `arapy_tenant_db::${slug}`,
    ownerPin: customMeta.ownerPin || '1234',
    status: customMeta.status || 'active',
    plan: customMeta.plan || 'PRO IA FULL',

    // 1. BRANDING & SCREENS COPY (100% Editable on-screen or in Owner Panel)
    branding: {
      businessName,
      studioBadgeTitle: 'B E A U T Y   S T U D I O',
      studioSubCode: isVelvet ? 'VN Studio' : 'DG Studio',
      logoText: isVelvet ? 'VN' : 'DG',
      logoUrl: '',

      // Screen 1: Splash Hero ("Look Good, Feel Beautiful")
      splashHeroImage: './assets/splash-hero.jpg',
      splashTitleLine1: 'Lucí Increíble,',
      splashTitleLine2Prefix: 'Sentite ',
      splashTitleHighlight: 'Única',
      splashSubtitle: 'Estética de Uñas & Peluquería Femenina diseñada para vos',
      splashPrimaryButton: 'Reservar Turno',
      splashSecondaryButton: 'Explorar Servicios',

      // Screen 2: Home Dashboard ("Hi, Mahi — Welcome Back!")
      homeWelcomePrefix: 'Hola,',
      homeWelcomeSubtitle: '¡Bienvenida de nuevo a tu espacio de belleza!',
      searchPlaceholder: 'Buscar uñas, kapping, corte, color...',
      popularSectionTitle: 'Servicios Populares',
      offersSectionTitle: 'Ofertas Especiales',
      upcomingSectionTitle: 'Próximo Turno',

      // Special Offer Banner (20% OFF card)
      offerDiscountBadge: '20% OFF',
      offerTitle: 'En Coloración + Kapping Gel',
      offerSubtitle: 'Solo por este fin de semana',
      offerButtonText: 'Reservar Promo',
      offerBannerImage: './assets/hair-balayage.jpg',
      offerLinkedServiceId: 'srv-hair-color',

      // Screen 3: Our Services Header
      servicesHeaderTitle: 'Nuestros Servicios',
      servicesHeaderSubtitle: 'Encontrá el servicio perfecto de Uñas o Pelo para vos',

      // Screen 4: Add Inspo Dark Screen
      inspoHeaderTitle: 'Add inspo',
      inspoHeaderSubtitle: 'Tu satisfacción es nuestro compromiso',

      // Screen 5: Beauty Studio Booking Sheet
      bookingHeroImage: './assets/studio-nails.jpg',
      studioInteriorImage: './assets/studio-lounge.jpg',
      depositLegalNote:
        'Al confirmar la reserva, se solicita una seña del 50% del total para asegurar tu turno.',

      // Color Theme
      themeId: isVelvet ? 'lavender-noir' : 'dusty-rose-luxury',
      colors: isVelvet
        ? { ...THEME_PRESETS[1] }
        : { ...THEME_PRESETS[0] }
    },

    // 2. OPERATIONS, SCHEDULE, DEPOSIT & WHATSAPP
    operations: {
      currencySymbol: '$',
      depositPercentage: 50,
      paymentAlias: isVelvet ? 'VELVET.NAILS.MP' : 'DANIELA.STUDIO.MP',
      paymentCvu: '0000003100084921847291',
      paymentHolder: ownerName,
      paymentBankName: 'Mercado Pago / Transferencia',
      whatsappNumber: customMeta.whatsappNumber || '5491123456789',
      address: isVelvet ? 'Av. Santa Fe 3240, Palermo' : 'Av. Principal 450, Estudio Central',
      openDays: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
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
      aiGreeting: `¡Hola! Soy la Asesora IA de ${businessName}. Contame si hoy querés hacerte las uñas, cortarte o teñirte el pelo, o combinar ambos y te armo el turno ideal en segundos.`
    },

    // 3. SPECIALISTS / STAFF (100% Editable)
    specialists: [
      {
        id: 'spec-1',
        name: ownerName,
        role: 'Directora • Nail Artist & Estilista',
        studioCode: isVelvet ? 'VN Studio' : 'DG Studio',
        avatar: './assets/stylist-main.jpg',
        rating: '5.0',
        specialties: ['unas', 'pelo', 'combos'],
        verified: true
      },
      {
        id: 'spec-2',
        name: 'Sofía Martínez',
        role: 'Especialista en Manicura 3D & Soft Gel',
        studioCode: isVelvet ? 'VN Studio' : 'DG Studio',
        avatar: './assets/inspo-rose-french.jpg',
        rating: '4.9',
        specialties: ['unas', 'combos'],
        verified: true
      },
      {
        id: 'spec-3',
        name: 'Camila Torres',
        role: 'Colorista & Corte Femenino',
        studioCode: isVelvet ? 'VN Studio' : 'DG Studio',
        avatar: './assets/hair-cut.jpg',
        rating: '4.9',
        specialties: ['pelo', 'combos'],
        verified: true
      }
    ],

    // 4. SERVICES CATALOG (Nails + Women's Hair + Combos — 100% Editable)
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
        shortDesc: 'Baño de gel protector sobre tu uña natural + color por 21 días',
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
        isPopular: false,
        shortDesc: 'Alargamiento inmediato con tips de gel livianos y acabado natural',
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
        isPopular: false,
        shortDesc: 'Iluminación dimensional, mechas, rubios personalizados o color global',
        price: 42000,
        durationMin: 120,
        image: './assets/hair-balayage.jpg'
      },
      {
        id: 'srv-hair-spa',
        name: 'Hair Spa & Nutrición Botox',
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
        isPopular: false,
        shortDesc: 'Manicura Semipermanente/Kapping + Corte o Brushing en una sola visita',
        price: 34000,
        durationMin: 90,
        image: './assets/studio-lounge.jpg'
      }
    ],

    // 5. "ADD INSPO" GALLERY (100% Editable + Clients can upload their own photo)
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
        title: 'Layered Butterfly Cut & Blowout',
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

    // 6. INITIAL SAMPLE APPOINTMENTS (Editable & manageable in Owner Agenda)
    appointments: [
      {
        id: 'apt-1001',
        code: 'DG-841',
        clientName: 'Mahi',
        clientPhone: '5491155550101',
        serviceId: 'srv-hair-cut',
        serviceName: 'Corte Femenino & Brushing',
        addonLabel: '+ lavado spa',
        specialistId: 'spec-1',
        specialistName: ownerName,
        studioCode: isVelvet ? 'VN Studio' : 'DG Studio',
        dateLabel: 'Lun 18 Nov',
        timeSlot: '11:00',
        timeRange: '11:00-12:00',
        totalPrice: 18000,
        depositAmount: 9000,
        status: 'confirmed', // 'unconfirmed' | 'confirmed' | 'completed' | 'cancelled'
        nailShape: 'Natural',
        inspoImages: ['/assets/hair-cut.jpg', '/assets/inspo-rose-french.jpg'],
        notes: 'Quiere mantener el largo en capas suaves.',
        createdAt: '2026-11-11T10:00:00.000Z'
      }
    ],

    // 7. PER-TENANT CLOUD DATABASE CONNECTOR (Supabase / Webhook)
    databaseConfig: {
      provider: 'local_disk_and_idb', // 'local_disk_and_idb' | 'supabase' | 'arapy_cloud'
      supabaseUrl: '',
      supabaseAnonKey: '',
      webhookUrl: ''
    }
  };
}
