import type { Locale } from "./site-config";

export type Category = "city" | "day-trip" | "concierge";
export type Experience = {
  slug: string;
  category: Category;
  price: number | null;
  hours: number;
  image: string;
  imageAlt: string;
  imageCredit?: { name: string; url: string };
  planningLinks?: { url: string; en: string; es: string }[];
  en: ExperienceCopy;
  es: ExperienceCopy;
};
type ExperienceCopy = {
  title: string; eyebrow: string; description: string; intro: string;
  stops: { title: string; description: string }[];
  included: string[]; excluded: string[]; pace: string; bestFor: string;
  imageNote?: string;
};

export const experiences: Experience[] = [
  {
    slug: "barcelona-gaudi", category: "city", price: 120, hours: 4,
    image: "/images/barcelona.webp", imageAlt: "Sagrada Família surrounded by Barcelona’s Eixample district",
    en: {
      title: "Barcelona & the world of Gaudí", eyebrow: "THE CITY ESSENTIALS",
      description: "Extraordinary architecture, little local discoveries, and Barcelona at your own pace.",
      intro: "Get to know the Barcelona you’ve dreamed of, with a host who makes it feel familiar. From the extraordinary Sagrada Família to the elegant streets of Eixample, we shape the day around your curiosity, energy, and interests.",
      stops: [
        { title: "A warm welcome", description: "Meet your host at an agreed central location or arrange hotel pickup in your quote. Talk through the day over a relaxed introduction." },
        { title: "Sagrada Família", description: "Discover the stories behind Gaudí’s basilica from the outside. An interior visit can be arranged with separately purchased timed-entry tickets." },
        { title: "Passeig de Gràcia", description: "Walk past Casa Batlló and Casa Milà, with time for photographs and the small details that make this avenue special." },
        { title: "Make it your Barcelona", description: "Finish with a café stop, a neighbourhood walk, or a Park Güell visit if timing and ticket availability allow. We agree the final route with you." },
      ],
      included: ["Private host for your group", "An itinerary adapted to your pace", "Preferred-language request", "Help planning attraction reservations"],
      excluded: ["Attraction admission tickets", "Meals and personal purchases", "Transport unless included in your written quote"],
      pace: "Flexible walking; rest stops welcome", bestFor: "First visits, families & architecture lovers",
    },
    es: {
      title: "Barcelona y el mundo de Gaudí", eyebrow: "LOS IMPRESCINDIBLES",
      description: "Arquitectura extraordinaria, descubrimientos locales y Barcelona a tu ritmo.",
      intro: "Descubre la Barcelona que imaginas con un anfitrión que te hará sentir en casa. Desde la Sagrada Família hasta las calles del Eixample, adaptamos el día a tus intereses y a tu ritmo.",
      stops: [
        { title: "Una cálida bienvenida", description: "Encuentra a tu anfitrión en un punto céntrico acordado o solicita recogida en el hotel en tu presupuesto." },
        { title: "Sagrada Família", description: "Descubre la historia de la basílica desde el exterior. La visita interior se puede organizar con entradas con horario, adquiridas por separado." },
        { title: "Passeig de Gràcia", description: "Pasea por Casa Batlló y Casa Milà con tiempo para hacer fotos y apreciar cada detalle." },
        { title: "Tu propia Barcelona", description: "Termina con un café, un paseo de barrio o una visita al Park Güell según el tiempo y la disponibilidad de entradas. Acordamos contigo la ruta final." },
      ],
      included: ["Anfitrión privado para tu grupo", "Ruta adaptada a tu ritmo", "Solicitud de idioma preferido", "Ayuda con las reservas de atracciones"],
      excluded: ["Entradas a las atracciones", "Comidas y compras personales", "Transporte salvo que figure en el presupuesto"],
      pace: "Paseo flexible con descansos", bestFor: "Primeras visitas, familias y amantes de la arquitectura",
    },
  },
  {
    slug: "montserrat", category: "day-trip", price: 180, hours: 8,
    image: "/images/montserrat.webp", imageAlt: "Montserrat monastery beneath its distinctive rocky mountain peaks",
    en: {
      title: "A little closer to the clouds", eyebrow: "MONTSERRAT ESCAPE",
      description: "Mountain air, a remarkable monastery, and a slower kind of day beyond the city.",
      intro: "Trade the city’s bustle for the extraordinary silhouettes of Montserrat. This private day is about mountain views, the monastery setting, and unhurried time together. Your route and transport are agreed before you travel.",
      stops: [
        { title: "Leave the city behind", description: "Meet at the agreed departure point. Choose private transport in your quote or ask us to plan a rail-based journey." },
        { title: "The mountain & monastery", description: "Explore the monastery surroundings and viewpoints. Basilica access, special visits, and performance tickets are subject to availability and charged separately." },
        { title: "Lunch, your way", description: "Allow time for a local lunch or a packed meal. Share dietary preferences ahead of time so we can plan suitable options." },
        { title: "One more view", description: "Enjoy an optional gentle walk or additional viewpoint, adapted to your group’s mobility and the weather, before returning to Barcelona." },
      ],
      included: ["Private host for the day", "A personalised mountain itinerary", "Help coordinating travel and reservations", "Rest stops planned around your group"],
      excluded: ["Transport unless quoted", "Funicular and attraction tickets", "Lunch and other refreshments"],
      pace: "A full day; walking adapted to your group", bestFor: "Nature lovers, couples & multigenerational families",
    },
    es: {
      title: "Un poco más cerca de las nubes", eyebrow: "ESCAPADA A MONTSERRAT",
      description: "Aire de montaña, un monasterio único y un día tranquilo lejos de la ciudad.",
      intro: "Cambia el ritmo de la ciudad por las siluetas de Montserrat. Un día privado de vistas, cultura y tiempo juntos. Acordamos la ruta y el transporte antes del viaje.",
      stops: [
        { title: "Deja atrás la ciudad", description: "Encuentro en el punto acordado. Elige transporte privado en el presupuesto o pide una propuesta en tren." },
        { title: "Montaña y monasterio", description: "Explora los alrededores y los miradores. El acceso a la basílica, las visitas especiales y las actuaciones dependen de la disponibilidad y se pagan aparte." },
        { title: "Almuerzo a tu gusto", description: "Tiempo para comer en la zona o disfrutar de un pícnic. Comparte tus preferencias alimentarias para planificar opciones adecuadas." },
        { title: "Una vista más", description: "Un paseo suave o un mirador adicional, adaptado a la movilidad de tu grupo y al tiempo, antes de regresar a Barcelona." },
      ],
      included: ["Anfitrión privado durante el día", "Itinerario de montaña personalizado", "Ayuda con transporte y reservas", "Descansos adaptados al grupo"],
      excluded: ["Transporte salvo presupuesto", "Funicular y entradas", "Almuerzo y bebidas"],
      pace: "Día completo; paseo adaptado al grupo", bestFor: "Naturaleza, parejas y familias de varias generaciones",
    },
  },
  {
    slug: "costa-brava", category: "day-trip", price: 220, hours: 8,
    image: "/images/coast.webp", imageAlt: "Whitewashed waterfront houses and boats in Calella de Palafrugell, Costa Brava",
    en: {
      title: "The Mediterranean, unhurried", eyebrow: "COSTA BRAVA DAY OUT",
      description: "Seaside villages, salt in the air, and those blue-water moments you came for.",
      intro: "Whitewashed villages, fishing boats, and a long lunch by the water. Discover a quieter side of Catalonia on a day shaped around you. Coastal walks, swimming stops, and accessible viewpoints are planned according to the season and your preferences.",
      stops: [
        { title: "A scenic start", description: "Depart Barcelona using your agreed transport arrangement, with a comfortable pace and time for a break." },
        { title: "A village by the sea", description: "Explore Calella de Palafrugell or another agreed coastal village. Wander the waterfront and take in the Mediterranean views." },
        { title: "A leisurely lunch", description: "Choose a seaside restaurant or a simpler picnic stop. We help plan around dietary needs; meals are paid separately." },
        { title: "Your afternoon", description: "Opt for a gentle coastal walk, a beach break, or another village before the journey back. Swimming is weather-dependent and at your own discretion." },
      ],
      included: ["A private full-day host", "A route tailored to the season", "Village and dining recommendations", "Planning for your preferred pace"],
      excluded: ["Transport unless quoted", "Meals and drinks", "Optional activities or admissions"],
      pace: "Relaxed, with optional coastal walking", bestFor: "Couples, beach lovers & slow travelers",
    },
    es: {
      title: "El Mediterráneo, sin prisas", eyebrow: "UN DÍA EN LA COSTA BRAVA",
      description: "Pueblos junto al mar, brisa salada y esos momentos de agua azul que buscabas.",
      intro: "Pueblos blancos, barcos de pesca y un almuerzo frente al mar. Descubre una Cataluña más tranquila con un día diseñado para ti. Los paseos, las paradas en la playa y los miradores se adaptan a la temporada y a tus preferencias.",
      stops: [
        { title: "Un comienzo panorámico", description: "Sal de Barcelona con el transporte acordado, a un ritmo cómodo y con tiempo para descansar." },
        { title: "Un pueblo frente al mar", description: "Explora Calella de Palafrugell u otro pueblo costero acordado. Pasea por el paseo marítimo y disfruta de las vistas." },
        { title: "Un almuerzo tranquilo", description: "Elige un restaurante junto al mar o un pícnic. Te ayudamos con tus necesidades alimentarias; la comida se paga aparte." },
        { title: "Tu tarde", description: "Elige un paseo costero suave, una pausa en la playa u otro pueblo antes del regreso. El baño depende del tiempo y queda a tu criterio." },
      ],
      included: ["Anfitrión privado durante todo el día", "Ruta adaptada a la temporada", "Recomendaciones de pueblos y restaurantes", "Planificación a tu ritmo"],
      excluded: ["Transporte salvo presupuesto", "Comidas y bebidas", "Actividades y entradas opcionales"],
      pace: "Relajado, con paseos opcionales", bestFor: "Parejas, amantes del mar y viajes tranquilos",
    },
  },
  {
    slug: "food-and-old-town", category: "city", price: 40, hours: 2,
    image: "/images/food.webp", imageAlt: "A traditional Spanish seafood paella served with fresh lemon",
    en: {
      title: "Good food. Better company.", eyebrow: "FOOD & OLD TOWN",
      description: "Old-town wandering and help finding food that feels right for you.",
      intro: "Discover the small pleasures of Barcelona: a narrow street, a lively square, and a table worth sitting at. Your host helps you navigate menus, explain dietary needs, and find a comfortable way to enjoy local food.",
      stops: [
        { title: "Meet in the old town", description: "Start at an agreed central meeting point and share what you’d like to taste or avoid." },
        { title: "Streets with a story", description: "Wander the Gothic Quarter at an easy pace, with time to enjoy its squares and atmosphere." },
        { title: "Find your table", description: "Explore suitable dining choices and get help discussing ingredients with restaurant staff. Food and drinks are paid directly to the restaurant." },
      ],
      included: ["Private host for two hours", "Old-town orientation", "Menu and ordering assistance", "Dietary-preference planning"],
      excluded: ["Food and drinks", "Restaurant bookings with fees", "Transport"],
      pace: "Easy city walking", bestFor: "Food-curious travelers & first evenings",
    },
    es: {
      title: "Buena comida. Mejor compañía.", eyebrow: "SABORES Y CASCO ANTIGUO",
      description: "Paseos por el casco antiguo y ayuda para encontrar comida a tu gusto.",
      intro: "Disfruta de los pequeños placeres de Barcelona: callejuelas, plazas y una mesa acogedora. Tu anfitrión te ayuda con las cartas y tus preferencias alimentarias.",
      stops: [
        { title: "Encuentro en el centro", description: "Comienza en un punto acordado y comparte lo que te gustaría probar o evitar." },
        { title: "Calles con historia", description: "Pasea por el Barrio Gótico a un ritmo tranquilo y disfruta de sus plazas." },
        { title: "Encuentra tu mesa", description: "Descubre opciones para comer y recibe ayuda al preguntar por los ingredientes. La comida se paga directamente al restaurante." },
      ],
      included: ["Anfitrión privado durante dos horas", "Orientación por el casco antiguo", "Ayuda con cartas y pedidos", "Planificación alimentaria"],
      excluded: ["Comidas y bebidas", "Reservas con cargo", "Transporte"],
      pace: "Paseo urbano suave", bestFor: "Amantes de la comida y primeras noches",
    },
  },
  {
    slug: "airport-welcome", category: "concierge", price: 60, hours: 1,
    image: "/images/airport-arrival.webp", imageAlt: "Travellers walking with suitcases through Barcelona–El Prat Airport",
    imageCredit: { name: "Iván Sanchez Jimenez / Unsplash", url: "https://unsplash.com/photos/a-couple-of-people-that-are-walking-with-luggage-ieYFuzxuvXU" },
    en: {
      title: "A familiar face on arrival", eyebrow: "AIRPORT WELCOME",
      description: "Start your Barcelona visit with a personal welcome and a coordinated onward journey.",
      intro: "Arriving somewhere new is easier when someone is expecting you. Share your flight, luggage, and accommodation details, and we’ll plan a personal welcome at Barcelona–El Prat Airport and the next step of your journey.",
      stops: [
        { title: "Plan before you land", description: "Share your flight number, arrival terminal, group size, luggage, and any child-seat or accessibility needs." },
        { title: "Your airport welcome", description: "Meet your host at a clearly agreed meeting point. We confirm flight monitoring and waiting arrangements in your quote." },
        { title: "On to your accommodation", description: "Travel using the transport confirmed in your booking. Private vehicle costs and any waiting fees are itemised beforehand." },
      ],
      included: ["Personal arrival coordination", "Agreed airport meeting point", "Help communicating with transport providers"],
      excluded: ["Vehicle fare unless explicitly quoted", "Extra waiting beyond agreed terms", "Additional stops or luggage charges"],
      pace: "Arrival assistance; duration depends on traffic", bestFor: "Families, first visits & late arrivals by arrangement",
    },
    es: {
      title: "Una cara familiar al llegar", eyebrow: "BIENVENIDA EN EL AEROPUERTO",
      description: "Comienza tu visita con una bienvenida personal y el siguiente trayecto coordinado.",
      intro: "Llegar a un destino nuevo es más fácil cuando alguien te espera. Comparte los datos del vuelo, el equipaje y el alojamiento para organizar la bienvenida en Barcelona–El Prat.",
      stops: [
        { title: "Antes de aterrizar", description: "Comparte el vuelo, la terminal, el grupo, el equipaje y las necesidades de sillas infantiles o accesibilidad." },
        { title: "Tu bienvenida", description: "Encuentra a tu anfitrión en el punto acordado. Confirmamos el seguimiento del vuelo y los tiempos de espera en el presupuesto." },
        { title: "Hacia tu alojamiento", description: "Viaja con el transporte confirmado. Los costes del vehículo y la espera se detallan antes de reservar." },
      ],
      included: ["Coordinación personal de llegada", "Punto de encuentro acordado", "Ayuda con los proveedores de transporte"],
      excluded: ["Vehículo salvo presupuesto", "Espera adicional", "Paradas o equipaje adicionales"],
      pace: "Asistencia a la llegada; depende del tráfico", bestFor: "Familias, primeras visitas y llegadas tardías acordadas",
    },
  },
  {
    slug: "shopping-and-concierge", category: "concierge", price: 160, hours: 5,
    image: "/images/gothic.webp", imageAlt: "Historic architecture in the heart of Barcelona",
    en: {
      title: "A day made around you", eyebrow: "SHOPPING & CONCIERGE",
      description: "From shopping stops to special plans, let us take care of the little details.",
      intro: "A shopping day, a family celebration, or a little help connecting the pieces of your stay. Share what you have in mind and we’ll create a practical plan, with clear arrangements and a host on hand.",
      stops: [
        { title: "Tell us your wish list", description: "Choose city shopping, a La Roca Village visit, or a custom mix. We agree travel time and transport costs before booking." },
        { title: "Explore at your pace", description: "Make room for browsing, café breaks, and the stores you actually want to visit." },
        { title: "Help with the details", description: "Get practical help with directions and communications. Tax-free eligibility and refunds are determined by retailers and the relevant authorities." },
      ],
      included: ["Private host and planning", "A personalised shopping route", "Practical language assistance"],
      excluded: ["Purchases and meals", "Transport unless quoted", "Any third-party booking fees"],
      pace: "Flexible shopping and café stops", bestFor: "Shopping days, celebrations & custom plans",
    },
    es: {
      title: "Un día diseñado para ti", eyebrow: "COMPRAS Y CONCIERGE",
      description: "Desde compras hasta planes especiales, cuidamos los pequeños detalles.",
      intro: "Un día de compras, una celebración o ayuda para organizar tu estancia. Cuéntanos tu idea y prepararemos un plan práctico y claro con un anfitrión a tu lado.",
      stops: [
        { title: "Comparte tus ideas", description: "Elige compras en la ciudad, La Roca Village o un plan combinado. Acordamos el transporte antes de reservar." },
        { title: "Explora a tu ritmo", description: "Tiempo para las tiendas que te interesan y descansos para tomar un café." },
        { title: "Ayuda con los detalles", description: "Asistencia con direcciones e idioma. Las condiciones de devolución de impuestos las determinan los comercios y las autoridades." },
      ],
      included: ["Anfitrión privado y planificación", "Ruta de compras personalizada", "Asistencia práctica de idioma"],
      excluded: ["Compras y comidas", "Transporte salvo presupuesto", "Cargos de terceros"],
      pace: "Compras y descansos flexibles", bestFor: "Compras, celebraciones y planes personalizados",
    },
  },
  {
    slug: "camp-nou-barca", category: "city", price: null, hours: 3,
    image: "/images/camp-nou.webp", imageAlt: "The pitch and blue-and-maroon stands at Camp Nou before redevelopment",
    imageCredit: { name: "Dmitry Tomashek / Unsplash", url: "https://unsplash.com/photos/people-watching-football-game-during-daytime-pH7_hVJ65ss" },
    planningLinks: [
      { url: "https://www.fcbarcelona.com/en/tickets/camp-nou-experience", en: "Official museum & stadium ticket options", es: "Entradas oficiales de museo y estadio" },
      { url: "https://store.fcbarcelona.com/pages/store-finder", en: "Official Barça Store locations", es: "Tiendas oficiales del Barça" },
    ],
    en: {
      title: "Camp Nou, Barça Museum & Store", eyebrow: "A LITTLE BLAUGRANA MAGIC",
      description: "Club legends, stadium views and a keepsake in Barça colours. A private outing for your football people.",
      intro: "Make room for the part of Barcelona that lives and breathes football. Spend around three hours discovering Barça’s story, choosing the right stadium visit and browsing the official store, with your host helping the day run smoothly. We arrange your route around the tickets available for your date; this is independent hosting, not an official FC Barcelona tour.",
      imageNote: "Camp Nou before redevelopment; today’s stadium appearance and access may differ.",
      stops: [
        { title: "Meet your host · 15 minutes", description: "Start at an agreed meeting point near the Camp Nou visitor facilities in Les Corts. Check your timed tickets, talk through your favourite players and settle into the visit." },
        { title: "Barça Museum · 60–75 minutes", description: "Explore club history, trophies and immersive displays at your own pace. Museum admission and any audio guide are provided through your separately purchased official ticket." },
        { title: "Your Camp Nou moment · 30–45 minutes", description: "Choose the panoramic stadium visit if you hold a Spotify Camp Nou Experience ticket. The basic museum ticket offers a construction viewpoint instead. We confirm access for your date; pitch, tunnel and dressing-room visits are not promised." },
        { title: "Barça Store & a relaxed finish · 30–45 minutes", description: "Allow time for the official Camp Nou store, shirts and souvenirs, then a refreshment break nearby if you wish. Purchases and refreshments are separate; the final order follows your ticket times." },
      ],
      included: ["Private host and visit planning", "Help choosing official ticket options", "Time for photos and store browsing", "Preferred-language request"],
      excluded: ["Museum, stadium and match tickets", "Merchandise, food and drinks", "Transport unless quoted", "Special-access or match-day upgrades"],
      pace: "Around three hours; ask about stairs and accessible access before choosing tickets", bestFor: "Barça fans, football-loving families & first stadium visits",
    },
    es: {
      title: "Camp Nou, Museo del Barça y tienda", eyebrow: "UN POCO DE MAGIA BLAUGRANA",
      description: "Leyendas del club, vistas del estadio y un recuerdo blaugrana. Una salida privada para quienes viven el fútbol.",
      intro: "Descubre la Barcelona que vive el fútbol. Dedica unas tres horas a la historia del Barça, a elegir la visita adecuada al estadio y a la tienda oficial, con un anfitrión que facilita el plan. Adaptamos la ruta a las entradas disponibles para tu fecha. Es un servicio de anfitrión independiente, no una visita oficial del FC Barcelona.",
      imageNote: "Camp Nou antes de la remodelación; el aspecto y los accesos actuales pueden variar.",
      stops: [
        { title: "Encuentro con tu anfitrión · 15 minutos", description: "Empezamos en un punto acordado cerca de las instalaciones para visitantes del Camp Nou, en Les Corts. Revisamos tus entradas con horario y hablamos de tus jugadores favoritos." },
        { title: "Museo del Barça · 60–75 minutos", description: "Recorre la historia del club, los trofeos y las exposiciones inmersivas a tu ritmo. El acceso al museo y la audioguía dependen de la entrada oficial que se adquiere por separado." },
        { title: "Tu momento Camp Nou · 30–45 minutos", description: "Elige la visita panorámica al estadio con la entrada Spotify Camp Nou Experience. La entrada básica del museo ofrece un mirador de las obras. Confirmamos el acceso para tu fecha; no prometemos visitas al césped, al túnel ni a los vestuarios." },
        { title: "Tienda del Barça y un final tranquilo · 30–45 minutos", description: "Tiempo para la tienda oficial del Camp Nou, camisetas y recuerdos, y una pausa para tomar algo si te apetece. Compras y consumiciones aparte. El orden final se adapta a los horarios de tus entradas." },
      ],
      included: ["Anfitrión privado y planificación", "Ayuda para elegir entradas oficiales", "Tiempo para fotos y compras", "Solicitud de idioma preferido"],
      excluded: ["Entradas de museo, estadio y partidos", "Compras, comidas y bebidas", "Transporte salvo presupuesto", "Accesos especiales y opciones de día de partido"],
      pace: "Unas tres horas; consulta escaleras y accesibilidad antes de elegir entradas", bestFor: "Aficionados del Barça, familias futboleras y primeras visitas al estadio",
    },
  },
  {
    slug: "gothic-quarter", category: "city", price: null, hours: 3,
    image: "/images/gothic-quarter.webp", imageAlt: "Barcelona Cathedral overlooking the square in the Gothic Quarter",
    imageCredit: { name: "Walter Martin / Unsplash", url: "https://unsplash.com/photos/gothic-barcelona-cathedral-towering-over-a-bustling-city-square-B55Mvns1xjs" },
    planningLinks: [{ url: "https://bid.barcelonaturisme.com/wv3/en/page/1052/gothic-quarter.html", en: "Explore the Gothic Quarter", es: "Descubre el Barrio Gótico" }],
    en: {
      title: "Gothic Quarter, one little street at a time", eyebrow: "THE OLD CITY, SLOWLY",
      description: "Roman traces, quiet squares and the little lanes that make Barcelona feel timeless.",
      intro: "Take an unhurried three-hour walk through Barcelona’s old heart. We connect the cathedral surroundings, intimate squares and layers of Roman and medieval history into a route with time to look up, ask questions and pause for a café. Start in the morning or late afternoon, according to the season and your group’s pace.",
      stops: [
        { title: "Plaça Nova & the cathedral · 35 minutes", description: "Meet by the cathedral square and begin with the old city’s Roman gateway and cathedral exterior. An interior visit is an optional, separately ticketed addition that changes the route." },
        { title: "Pont del Bisbe & Sant Felip Neri · 35 minutes", description: "Follow Carrer del Bisbe for the much-photographed bridge, then slow down in the small square of Sant Felip Neri. Leave time for the details and stories tucked between the landmarks." },
        { title: "El Call & Plaça Sant Jaume · 35 minutes", description: "Walk the lanes of the historic Jewish quarter and emerge into Sant Jaume, home to the City Hall and the Palau de la Generalitat. These are exterior stops rather than reserved building visits." },
        { title: "Roman traces & Plaça del Rei · 35 minutes", description: "Look for the Temple of Augustus columns when the site is open, then continue to the medieval royal square. A longer archaeology or museum visit can be arranged separately." },
        { title: "Plaça del Pi, a café & Plaça Reial · 40 minutes", description: "Finish through the streets around Santa Maria del Pi with a café pause, then reach palm-lined Plaça Reial. Your host can help choose somewhere for lunch or the next chapter of your day." },
      ],
      included: ["Private host for an old-town walk", "A route adapted to your interests", "Photo and café pauses", "Preferred-language request"],
      excluded: ["Cathedral and museum tickets", "Food, drinks and purchases", "Hotel transfers unless quoted"],
      pace: "About three hours on foot; uneven paving and rest stops", bestFor: "History lovers, photographers & curious first-time visitors",
    },
    es: {
      title: "Barrio Gótico, calle a calle", eyebrow: "EL CASCO ANTIGUO, SIN PRISAS",
      description: "Huellas romanas, plazas tranquilas y callejuelas que parecen detener el tiempo.",
      intro: "Disfruta de un paseo de unas tres horas por el corazón antiguo de Barcelona. Unimos el entorno de la catedral, pequeñas plazas e historia romana y medieval con tiempo para mirar, preguntar y tomar un café. El inicio puede ser por la mañana o a última hora de la tarde, según la temporada y tu ritmo.",
      stops: [
        { title: "Plaça Nova y la catedral · 35 minutos", description: "Encuentro junto a la plaza de la catedral para conocer el acceso romano y el exterior del templo. La visita interior es opcional, con entrada aparte, y requiere ajustar la ruta." },
        { title: "Pont del Bisbe y Sant Felip Neri · 35 minutos", description: "Seguimos por Carrer del Bisbe para contemplar su famoso puente y entrar en la pequeña plaza de Sant Felip Neri. Tiempo para fotos y detalles entre los grandes lugares." },
        { title: "El Call y Plaça Sant Jaume · 35 minutos", description: "Recorremos el antiguo barrio judío hasta Sant Jaume, donde se encuentran el Ayuntamiento y el Palau de la Generalitat. Las paradas son exteriores, sin acceso reservado a los edificios." },
        { title: "Huellas romanas y Plaça del Rei · 35 minutos", description: "Buscamos las columnas del Templo de Augusto si el recinto está abierto y continuamos hacia la plaza del antiguo conjunto real. Las visitas arqueológicas o de museo más largas se organizan aparte." },
        { title: "Plaça del Pi, café y Plaça Reial · 40 minutos", description: "Terminamos por las calles de Santa Maria del Pi, con una pausa para un café, hasta Plaça Reial y sus palmeras. Tu anfitrión puede ayudarte a elegir dónde comer o cómo continuar el día." },
      ],
      included: ["Anfitrión privado para el paseo", "Ruta adaptada a tus intereses", "Pausas para fotos y café", "Solicitud de idioma preferido"],
      excluded: ["Entradas de catedral y museos", "Comidas, bebidas y compras", "Traslados salvo presupuesto"],
      pace: "Unas tres horas a pie; pavimento irregular y descansos", bestFor: "Historia, fotografía y primeras visitas con curiosidad",
    },
  },
  {
    slug: "barcelona-nightlife", category: "city", price: null, hours: 4,
    image: "/images/barcelona-nightlife.webp", imageAlt: "Barcelona’s illuminated skyline after dark",
    imageCredit: { name: "Alp Ancel / Unsplash", url: "https://unsplash.com/photos/a-city-at-night-s1E8gYn8guw" },
    planningLinks: [
      { url: "https://www.barcelonaturisme.com/wv3/en/page/4677/live-music.html", en: "Barcelona’s live-music ideas", es: "Ideas de música en directo en Barcelona" },
      { url: "https://jamboreejazz.com/en/", en: "Check the Jamboree programme", es: "Consulta la programación del Jamboree" },
    ],
    en: {
      title: "Barcelona nightlife, your kind of evening", eyebrow: "WHEN THE CITY LIGHTS UP",
      description: "A little tapas, a favourite soundtrack and Barcelona after dark. Set the mood; we shape the night.",
      intro: "An evening for your people, whether that means a table of tapas, live jazz, cocktails or a little dancing. This sample four-hour route stays around El Born and the Gothic Quarter, with an Eixample alternative agreed in advance. We choose venues for your taste and date, keep alcohol optional and agree the finish and journey home before you head out.",
      stops: [
        { title: "Set the mood in El Born · 30 minutes", description: "Meet your host around 19:30 for a gentle evening stroll and a conversation about the music, atmosphere and food you enjoy. The exact start follows your restaurant and show reservations." },
        { title: "Tapas, your way · 75 minutes", description: "Settle into a pre-agreed restaurant in El Born or the Gothic Quarter. Share dietary preferences ahead of time; your host helps with menus and the pace of the evening. Food and drinks are paid separately." },
        { title: "A little live music · 75 minutes", description: "Continue towards Plaça Reial for a booked jazz or other live set at Jamboree when the programme suits you. A flamenco performance or a relaxed cocktail bar can replace it. Tickets and reservations are subject to availability." },
        { title: "One more stop, or a gentle finish · 60 minutes", description: "Choose a final bar, an after-dark walk or a return towards your accommodation. A later club visit or an Eixample route can be planned instead. We confirm age limits, ID requirements, dress codes and transport; entry is always the venue’s decision." },
      ],
      included: ["Private evening host and planning", "Help selecting restaurants and music", "A route shaped around your comfort", "Return-journey planning"],
      excluded: ["Meals, drinks and cover charges", "Show and club admission tickets", "Taxis or private transfers", "Hosting beyond the agreed four hours"],
      pace: "A relaxed four-hour evening; timing follows reservations", bestFor: "Couples, friends & adults looking for a personal night out",
    },
    es: {
      title: "Vida nocturna en Barcelona, a tu manera", eyebrow: "CUANDO LA CIUDAD SE ILUMINA",
      description: "Unas tapas, tu música favorita y Barcelona de noche. Tú eliges el ambiente; nosotros cuidamos el plan.",
      intro: "Una noche para tu grupo: tapas, jazz en directo, cócteles o un poco de baile. Esta propuesta de cuatro horas se centra en El Born y el Barrio Gótico; se puede acordar una alternativa por el Eixample. Elegimos locales para tus gustos y tu fecha, con opciones sin alcohol, y concretamos el final y la vuelta antes de salir.",
      stops: [
        { title: "Empezamos por El Born · 30 minutos", description: "Encuentro con tu anfitrión hacia las 19:30 para un paseo tranquilo y hablar de música, ambiente y comida. El inicio exacto depende de las reservas de cena y espectáculo." },
        { title: "Tapas a tu gusto · 75 minutos", description: "Cena en un restaurante acordado del Born o del Gótico. Comparte antes tus preferencias alimentarias; tu anfitrión ayuda con el menú y el ritmo de la noche. Comida y bebidas aparte." },
        { title: "Un poco de música en directo · 75 minutos", description: "Continuamos hacia Plaça Reial para una actuación reservada de jazz u otra música en Jamboree, si encaja con tus gustos. Se puede sustituir por flamenco o un bar tranquilo. Entradas y reservas sujetas a disponibilidad." },
        { title: "Una última parada, o un final tranquilo · 60 minutos", description: "Elige otro bar, un paseo nocturno o volver hacia tu alojamiento. Podemos acordar una discoteca más tarde o una ruta por el Eixample. Confirmamos edades, documentación, vestimenta y transporte; la admisión depende del local." },
      ],
      included: ["Anfitrión privado y planificación nocturna", "Ayuda para elegir restaurantes y música", "Ruta adaptada a tu comodidad", "Planificación de la vuelta"],
      excluded: ["Comidas, bebidas y consumiciones mínimas", "Entradas de conciertos y discotecas", "Taxis y traslados privados", "Tiempo adicional fuera de las cuatro horas acordadas"],
      pace: "Una noche tranquila de cuatro horas; horarios según reservas", bestFor: "Parejas, amigos y adultos que buscan una noche personal",
    },
  },
];

export function experienceCopy(experience: Experience, locale: Locale) {
  return experience[locale];
}
export function findExperience(slug: string) {
  return experiences.find((experience) => experience.slug === slug);
}
