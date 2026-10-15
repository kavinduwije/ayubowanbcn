import type { Locale } from "./site-config";

type Copy = Record<Locale, string>;
export type GuideSection = { id: string; title: Copy; paragraphs: Copy[]; links?: { path: string; label: Copy }[] };
export type TravelGuide = {
  slug: string; title: Copy; description: Copy; answer: Copy;
  image: string; imageAlt: Copy; imageCaption: Copy; imageCredit?: { name: string; url: string };
  sections: GuideSection[]; faqs: { question: Copy; answer: Copy }[];
  sources: { name: string; url: string }[];
};

// Change this only after reviewing the guide's facts and primary sources.
export const guidesReviewedAt = "2026-10-15";

export const travelGuides: TravelGuide[] = [
  {
    slug: "barcelona-for-sri-lankans",
    title: { en: "Barcelona for Sri Lankan Travellers", es: "Barcelona para viajeros de Sri Lanka" },
    description: {
      en: "A practical guide for Sri Lankans in Barcelona: Sinhala and Tamil hosting, airport welcomes, food, private experiences and a relaxed three-day plan.",
      es: "Guía de Barcelona para viajeros de Sri Lanka: anfitriones en cingalés y tamil, bienvenida en el aeropuerto, comida y un itinerario de tres días.",
    },
    answer: {
      en: "Visiting Barcelona from Sri Lanka, or meeting family here? Ayubowan Barcelona is an online booking and referral platform connecting you with independent guides and hosts. Request Sinhala, Tamil, English or Spanish; we confirm your provider, language availability, itinerary and price before you book.",
      es: "¿Visitas Barcelona desde Sri Lanka o te reúnes aquí con tu familia? Ayubowan Barcelona es una plataforma online de reservas y contactos que te conecta con guías y anfitriones independientes. Solicita cingalés, tamil, inglés o español; confirmamos el proveedor, el idioma, la ruta y el precio antes de reservar.",
    },
    image: "/images/gothic-quarter.webp",
    imageAlt: { en: "Barcelona Cathedral and the square in the Gothic Quarter", es: "La Catedral de Barcelona y la plaza del Barrio Gótico" },
    imageCaption: { en: "A first wander through the old city, with time to stop and settle in.", es: "Un primer paseo por el casco antiguo, con tiempo para parar y orientarte." },
    imageCredit: { name: "Walter Martin / Unsplash", url: "https://unsplash.com/photos/gothic-barcelona-cathedral-towering-over-a-bustling-city-square-B55Mvns1xjs" },
    sections: [
      { id: "your-host", title: { en: "A familiar language. A personal welcome.", es: "Un idioma familiar. Una bienvenida personal." }, paragraphs: [
        { en: "Tell the Ayubowan team who is travelling, your preferred language and what would make the visit easier: a gentle pace for parents, a shorter day with children, shopping help or time for familiar food. Language requests depend on the host available for your date; they are confirmed personally.", es: "Cuéntale al equipo de Ayubowan quién viaja, el idioma preferido y qué os facilitaría la visita: un ritmo suave para los padres, jornadas cortas con niños, ayuda con las compras o tiempo para sabores familiares. Confirmamos personalmente el idioma según la disponibilidad en tu fecha." },
        { en: "Our platform connects visitors of every background with independent providers. For Sri Lankans living in Barcelona and welcoming relatives, we can help shape a private day around the family. Immigration, residence, employment and consular services are outside our travel service.", es: "Nuestra plataforma conecta a personas de cualquier origen con proveedores independientes. Si eres de Sri Lanka, vives en Barcelona y recibes a familiares, podemos preparar un día privado para vuestro grupo. Nuestro servicio no incluye trámites de inmigración, residencia, empleo o asistencia consular." },
      ], links: [{ path: "/plan-your-trip", label: { en: "Ask for a host in your language", es: "Solicita un anfitrión en tu idioma" } }] },
      { id: "airport", title: { en: "Arriving at Barcelona–El Prat", es: "Llegar a Barcelona–El Prat" }, paragraphs: [
        { en: "Check your arrival terminal with your airline before agreeing a meeting point. Aena lists metro line L9 Sud and a free shuttle between terminals. TMB states that the T-casual ticket is not valid at the Aeroport T1 and Aeroport T2 metro stations. Check the official links below for the ticket that suits your journey.", es: "Confirma la terminal de llegada con la aerolínea antes de acordar el encuentro. Aena indica la línea de metro L9 Sud y una lanzadera gratuita entre terminales. Según TMB, la T-casual no sirve en las estaciones de metro Aeroport T1 y Aeroport T2. Consulta los enlaces oficiales para elegir el billete adecuado." },
        { en: "To request an airport welcome with an independent provider, share your flight number, terminal, luggage and group size through the enquiry form. We agree the meeting arrangements and onward travel in writing. Hosting assistance, a taxi or another transport provider, parking and child seats must be confirmed in your quote; a welcome is not automatically a vehicle transfer.", es: "Para solicitar una bienvenida con un proveedor independiente, indica en el formulario el vuelo, la terminal, el equipaje y el tamaño del grupo. Acordamos por escrito el encuentro y la continuación del viaje. El acompañamiento, el taxi u otro transporte, el aparcamiento y las sillas infantiles deben figurar en el presupuesto; la bienvenida no incluye automáticamente un traslado en vehículo." },
      ], links: [{ path: "/experiences/airport-welcome", label: { en: "See the airport welcome", es: "Ver la bienvenida en el aeropuerto" } }] },
      { id: "three-days", title: { en: "A comfortable three-day starting point", es: "Una propuesta tranquila de tres días" }, paragraphs: [
        { en: "Day 1 — Settle in, then take a short Gothic Quarter walk. Leave room for a meal and an early finish after a long flight. Keep the old town flexible if your group needs breaks or step-free routes.", es: "Día 1 — Instalaos y dad un paseo corto por el Barrio Gótico. Reservad tiempo para comer y terminar pronto después del vuelo. Adaptamos el recorrido si necesitáis descansos o evitar escalones." },
        { en: "Day 2 — Choose a Gaudí-focused city day or a Barça Museum and Store outing. Share your priorities before tickets are bought. Attraction admissions, football access and opening arrangements depend on the date and require separate confirmation.", es: "Día 2 — Elegid una jornada dedicada a Gaudí o una visita al Museo y la tienda del Barça. Indicad vuestras prioridades antes de comprar entradas. El acceso a monumentos, instalaciones de fútbol y horarios depende de la fecha y requiere confirmación." },
        { en: "Day 3 — Consider Montserrat or the Costa Brava if your group wants a full day away from the city. A slower city day with food and shopping assistance is an equally good choice. These are separate experiences to discuss, not a prepaid three-day package.", es: "Día 3 — Considerad Montserrat o la Costa Brava si os apetece salir de la ciudad. Un día más suave con ayuda para comer y comprar también es una buena opción. Son experiencias independientes para valorar, no un paquete de tres días pagado por adelantado." },
      ], links: [
        { path: "/experiences/gothic-quarter", label: { en: "Gothic Quarter", es: "Barrio Gótico" } },
        { path: "/experiences/barcelona-gaudi", label: { en: "Barcelona & Gaudí", es: "Barcelona y Gaudí" } },
        { path: "/experiences/camp-nou-barca", label: { en: "Barça Museum & Store", es: "Museo y tienda del Barça" } },
        { path: "/experiences/montserrat", label: { en: "Montserrat", es: "Montserrat" } },
        { path: "/experiences/costa-brava", label: { en: "Costa Brava", es: "Costa Brava" } },
      ] },
      { id: "food", title: { en: "Finding familiar food", es: "Encontrar sabores familiares" }, paragraphs: [
        { en: "If you are looking for a Sri Lankan restaurant in Barcelona, start with our researched food guide. It separates confirmed menu information from requests that still need checking. Tell your host which dishes matter to you and whether your group needs vegetarian, vegan or halal options; confirm ingredients and preparation directly with the venue.", es: "Si buscas un restaurante de Sri Lanka en Barcelona, empieza por nuestra guía gastronómica. Distingue la información de los menús consultados de las peticiones pendientes de confirmar. Indica qué platos os interesan y si necesitáis opciones vegetarianas, veganas o halal; confirma ingredientes y preparación con el local." },
      ], links: [{ path: "/sri-lankan-restaurants-barcelona", label: { en: "Read the Sri Lankan food guide", es: "Leer la guía de comida de Sri Lanka" } }, { path: "/experiences/food-and-old-town", label: { en: "Food & dining assistance", es: "Ayuda para comer en Barcelona" } }] },
      { id: "before-booking", title: { en: "What to share before you book", es: "Qué contarnos antes de reservar" }, paragraphs: [
        { en: "Send your dates, number of adults and children, preferred language, accommodation area and the experiences you like. Mention mobility needs, dietary requests and a comfortable budget. You receive a personal plan and an itemised quote; sending an enquiry does not confirm a booking. Tickets, transport and meals are separate unless the written quote includes them.", es: "Envía las fechas, el número de adultos y niños, el idioma, la zona de alojamiento y las experiencias que os interesan. Añade necesidades de movilidad, alimentación y presupuesto. Recibirás una propuesta personal y un presupuesto detallado; enviar la solicitud no confirma la reserva. Entradas, transporte y comidas son aparte salvo inclusión expresa." },
      ] },
    ],
    faqs: [
      { question: { en: "Can I book a Sinhala- or Tamil-speaking host in Barcelona?", es: "¿Puedo solicitar un anfitrión en cingalés o tamil en Barcelona?" }, answer: { en: "Yes, you can request Sinhala or Tamil when enquiring with Ayubowan Barcelona. We confirm the available host and language for your dates before you book. English and Spanish can also be requested.", es: "Sí, puedes solicitar cingalés o tamil a Ayubowan Barcelona. Confirmamos el anfitrión y el idioma disponibles para tus fechas antes de reservar. También puedes pedir inglés o español." } },
      { question: { en: "Can you help Sri Lankan families arriving at the airport?", es: "¿Ayudáis a familias de Sri Lanka que llegan al aeropuerto?" }, answer: { en: "You can request airport welcome assistance from an independent provider through Ayubowan. Share your flight details, group size and luggage so we can confirm the provider, meeting point and quote. Vehicle transport is included only if confirmed in writing.", es: "Puedes solicitar una bienvenida con un proveedor independiente a través de Ayubowan. Indica el vuelo, el grupo y el equipaje para confirmar el proveedor, el encuentro y el presupuesto. El transporte en vehículo solo se incluye si se confirma por escrito." } },
      { question: { en: "Is Ayubowan Barcelona a Sri Lankan community organisation?", es: "¿Ayubowan Barcelona es una asociación de la comunidad de Sri Lanka?" }, answer: { en: "Ayubowan Barcelona is an online booking and referral platform operated by TIPSTOTRIP TECHNOLOGIES S.L. We help visitors plan experiences; we are not a community association or a consular service.", es: "Ayubowan Barcelona es una plataforma online de reservas y contactos de TIPSTOTRIP TECHNOLOGIES S.L. Ayudamos a planificar experiencias; no somos una asociación comunitaria ni un servicio consular." } },
    ],
    sources: [
      { name: "Aena · Barcelona–El Prat metro and terminal connections", url: "https://www.aena.es/en/josep-tarradellas-barcelona-el-prat/getting-there/underground.html" },
      { name: "TMB · T-casual conditions and airport metro exclusions", url: "https://www.tmb.cat/en/barcelona-fares-metro-bus/t-casual" },
    ],
  },
  {
    slug: "sri-lankan-restaurants-barcelona",
    title: { en: "Looking for a Sri Lankan Restaurant in Barcelona?", es: "¿Buscas un restaurante de Sri Lanka en Barcelona?" },
    description: { en: "Where to start when looking for Sri Lankan food in Barcelona, with two verified Indian alternatives, addresses, official menus and questions to ask.", es: "Dónde empezar a buscar comida de Sri Lanka en Barcelona: dos alternativas indias con direcciones, menús oficiales y preguntas antes de reservar." },
    answer: { en: "We could not confirm a dedicated Sri Lankan restaurant in Barcelona with both a current street address and an official menu in our review on 15 October 2026. Below are two Indian alternatives with published Barcelona addresses and menus. Ask directly about Sri Lankan dishes before making a special trip.", es: "En nuestra revisión del 15 de octubre de 2026 no pudimos confirmar un restaurante especializado en Sri Lanka en Barcelona con dirección y menú oficiales actuales. Estas dos alternativas indias publican dirección y carta en Barcelona. Pregunta directamente por los platos de Sri Lanka antes de desplazarte." },
    image: "/images/sri-lankan-food.webp",
    imageAlt: { en: "Sri Lankan rice and curry with several vegetable side dishes", es: "Arroz y curry de Sri Lanka con varios acompañamientos vegetales" },
    imageCaption: { en: "Sri Lankan rice and curry photographed in Mirissa, Sri Lanka. An illustration of the cuisine, not a dish or venue from this Barcelona guide.", es: "Arroz y curry fotografiados en Mirissa, Sri Lanka. Imagen ilustrativa de la cocina, no de un plato o local de esta guía de Barcelona." },
    imageCredit: { name: "Zoshua Colah / Unsplash", url: "https://unsplash.com/photos/a-plate-of-rice-and-various-south-asian-dishes-_WQ1qARALg4" },
    sections: [
      { id: "what-we-checked", title: { en: "A useful starting point, checked at the source", es: "Un punto de partida con fuentes directas" }, paragraphs: [
        { en: "We reviewed the venues’ own websites and menus for their stated cuisine and address. This is a source-checked planning guide, not a record of personal restaurant visits. Opening hours, kitchens and menus can change. Confirm your date, dish and dietary requirements directly with the restaurant.", es: "Consultamos las webs y cartas de los locales para comprobar la cocina anunciada y la dirección. Esta guía se basa en fuentes, no en visitas personales a los restaurantes. Los horarios, las cocinas y los menús pueden cambiar. Confirma directamente la fecha, los platos y las necesidades alimentarias." },
      ] },
      { id: "sri-lankan-dishes", title: { en: "Want kottu, hoppers or Sri Lankan rice and curry?", es: "¿Buscas kottu, hoppers o arroz con curry de Sri Lanka?" }, paragraphs: [
        { en: "Ask for the exact dish and the date you plan to eat it. A restaurant listed under a broad delivery category may offer a different cuisine. An Indian menu alone does not confirm Sri Lankan dishes. For catering or a private meal, ask for a current menu, minimum group size, location, total price and advance-notice requirements before paying.", es: "Pregunta por el plato concreto y por la fecha en la que quieres comerlo. Una categoría amplia de una app de reparto puede incluir otras cocinas. Una carta india no confirma platos de Sri Lanka. Para catering o comidas privadas, solicita menú actual, grupo mínimo, ubicación, precio total y antelación necesaria antes de pagar." },
        { en: "A message you can send: “Hello, do you currently serve Sri Lankan kottu, hoppers or rice and curry? We are a group of [number] visiting on [date]. Could you confirm the menu, address, price and whether a reservation is needed?”", es: "Mensaje de ejemplo: «Hola, ¿servís actualmente kottu, hoppers o arroz con curry de Sri Lanka? Somos [número] personas y queremos ir el [fecha]. ¿Podéis confirmar la carta, dirección, precio y si es necesario reservar?»" },
      ] },
      { id: "dietary-needs", title: { en: "Make dietary needs part of the reservation", es: "Incluye tus necesidades en la reserva" }, paragraphs: [
        { en: "Explain allergies directly to the restaurant and ask about ingredients, sauces, shared cooking equipment and cross-contact. Check vegan suitability dish by dish, including dairy and ghee. If halal preparation matters, ask what is available and how the restaurant confirms it. A spicy or vegetarian menu is not enough to answer these questions.", es: "Comunica las alergias al restaurante y pregunta por ingredientes, salsas, utensilios compartidos y contacto cruzado. Comprueba cada plato vegano, incluidos lácteos y ghee. Si necesitas preparación halal, pregunta qué ofrecen y cómo lo confirman. Una carta picante o vegetariana no resuelve estas cuestiones." },
      ] },
      { id: "food-in-your-day", title: { en: "Fit a familiar meal into your Barcelona day", es: "Haz sitio a una comida familiar en Barcelona" }, paragraphs: [
        { en: "Ayubowan Barcelona is an online booking and referral platform connecting travellers with independent providers. Tell us what your group hopes to eat and where you are staying. An independent host’s food and dining assistance can help you plan a meal stop alongside your visit; restaurant availability, bookings and meals are confirmed separately. These listings are independent editorial suggestions, not paid placements or partnerships.", es: "Ayubowan Barcelona es una plataforma online de reservas y contactos que conecta a viajeros con proveedores independientes. Cuéntanos qué queréis comer y dónde os alojáis. La ayuda gastronómica de un anfitrión independiente permite planificar una parada durante la visita; disponibilidad, reservas y comidas se confirman aparte. Estas referencias editoriales son independientes, sin pago ni colaboración con los locales." },
      ], links: [{ path: "/experiences/food-and-old-town", label: { en: "Explore food & dining assistance", es: "Ver la ayuda gastronómica" } }, { path: "/barcelona-for-sri-lankans", label: { en: "Barcelona for Sri Lankan travellers", es: "Barcelona para viajeros de Sri Lanka" } }] },
    ],
    faqs: [
      { question: { en: "Are the restaurants in this guide Sri Lankan?", es: "¿Los restaurantes de esta guía son de Sri Lanka?" }, answer: { en: "The two listed alternatives describe their food as Indian. They are included for travellers seeking familiar South Asian flavours. We have not verified a current Sri Lankan menu at either venue; contact them about specific dishes.", es: "Las dos alternativas anuncian cocina india. Las incluimos para quienes buscan sabores del sur de Asia. No hemos verificado una carta actual de Sri Lanka en ninguno de los dos locales; pregunta por los platos concretos." } },
      { question: { en: "Is Ayubowan Barcelona a Sri Lankan restaurant?", es: "¿Ayubowan Barcelona es un restaurante de Sri Lanka?" }, answer: { en: "No. Ayubowan Barcelona connects travellers with independent guides and experience providers. A host can help plan meal stops; the restaurant supplies and charges for food unless the written quote explicitly includes it.", es: "No. Ayubowan Barcelona conecta a viajeros con guías y proveedores independientes. Un anfitrión puede ayudar a planificar las comidas; el restaurante las prepara y cobra salvo inclusión expresa en el presupuesto." } },
      { question: { en: "Can you guarantee halal, vegan or allergy-safe meals?", es: "¿Podéis garantizar comidas halal, veganas o aptas para alergias?" }, answer: { en: "We can help communicate your requests. The restaurant must confirm ingredients, preparation and what it can safely accommodate before you order. We do not certify restaurants or guarantee an allergen-free kitchen.", es: "Podemos ayudar a comunicar tus necesidades. El restaurante debe confirmar ingredientes, preparación y qué puede atender antes de pedir. No certificamos restaurantes ni garantizamos cocinas libres de alérgenos." } },
    ],
    sources: [
      { name: "Papadam · official menu and contact address", url: "https://papadam.es/menu/" },
      { name: "Saravanaa Bhavan Barcelona · official address and website", url: "https://saravanaabhavan.es/" },
      { name: "Saravanaa Bhavan Barcelona · published menu (PDF)", url: "https://saravanaabhavan.es/wp-content/uploads/2026/09/56437763_1.pdf" },
    ],
  },
];

export const foodVenues = [
  { name: "Papadam", address: "Ronda de Sant Pau, 11, 08015 Barcelona", url: "https://papadam.es/", menu: "https://papadam.es/menu/", cuisine: { en: "Indian alternative", es: "Alternativa india" }, description: { en: "Its official menu lists Indian curries, biryani and vegetarian dishes. Check directly for any Sri Lankan specials.", es: "Su carta oficial incluye curris indios, biryani y platos vegetarianos. Consulta directamente si ofrecen especialidades de Sri Lanka." } },
  { name: "Saravanaa Bhavan", address: "La Rambla, 122, 08002 Barcelona", url: "https://saravanaabhavan.es/", menu: "https://saravanaabhavan.es/wp-content/uploads/2026/09/56437763_1.pdf", cuisine: { en: "Indian vegetarian alternative", es: "Alternativa india vegetariana" }, description: { en: "The Barcelona website publishes an Indian vegetarian menu, including dosa and idli. Ask about individual dishes and dietary needs.", es: "La web de Barcelona publica una carta india vegetariana con dosa e idli. Pregunta por los platos y tus necesidades alimentarias." } },
];
