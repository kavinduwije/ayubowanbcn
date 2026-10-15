# New Barcelona experiences

Research checked on 14 October 2026. Routes, durations and suggested start times are Ayubowan sample itineraries, not official attraction packages. Admission, opening times, host availability and the final itinerary must be reconfirmed for each requested date. The owner selected **Request a quote** for all three new experiences.

## Camp Nou, Barça Museum and store

- [FC Barcelona's current Tours & Museum page](https://www.fcbarcelona.com/en/tickets/camp-nou-experience) distinguishes the museum ticket with construction viewpoint from the Spotify Camp Nou Experience with a panoramic stadium visit. Avoid promising a stadium interior on a basic museum ticket or generic access to the pitch, tunnels or dressing rooms.
- [FC Barcelona's stadium-tour announcement](https://www.fcbarcelona.com/en/club/news/4440096/spotify-camp-nou-tours-are-back) describes the panoramic visit and stairs/accessibility differences. Ask about mobility before choosing a ticket.
- [The official store finder](https://store.fcbarcelona.com/pages/store-finder) lists the Camp Nou store on Carrer d'Arístides Maillol. Recheck its hours for each date; no fixed opening hours or third-party ticket prices are published in the Ayubowan offer.

The three-hour proposal combines a welcome, museum visit, ticket-dependent stadium view, and store browsing. Ayubowan is independent of FC Barcelona; attraction admissions are separate from private hosting. The labelled historical stadium image is described in `ASSETS.md`.

## Gothic Quarter

- [Barcelona Tourism's Gothic Quarter itinerary](https://bid.barcelonaturisme.com/wv3/en/page/1052/gothic-quarter.html) identifies the cathedral, Sant Felip Neri, El Call, Sant Jaume, Temple of Augustus and Plaça del Rei.
- [Barcelona Tourism's Plaça del Rei page](https://www.barcelonaturisme.com/wv3/en/page/553/placa-del-rei.html) describes the royal ensemble and Roman remains.
- [Barcelona Tourism's Sant Jaume page](https://www.barcelonaturisme.cat/wv3/es/page/1245/placa-sant-jaume.html) confirms the City Hall and Generalitat setting.

The three-hour walking proposal starts at Plaça Nova, explores the bridge and intimate squares, and finishes via Plaça del Pi and Plaça Reial. Interiors and museum visits are optional additions, not included admissions. Walking times include photo and café pauses.

## Barcelona nightlife

- [Barcelona Tourism's live-music overview](https://www.barcelonaturisme.com/wv3/en/page/4677/live-music.html) identifies Jamboree for jazz and Los Tarantos/City Hall for flamenco.
- [Jamboree's programme and address](https://jamboreejazz.com/en/) confirms live events at Plaça Reial. Do not promise a specific artist or reserve an unverified show.
- [Barcelona Tourism's Eixample nightlife page](https://www.barcelonaturisme.com/wv3/ca/page/660/eixample.html) describes the area's bars, restaurants and clubs as a possible alternative route.

The four-hour sample evening starts around 19:30, with an El Born walk, dinner, a booked music stop and an optional final bar/walk. Start times follow reservations. Alcohol is optional; age/ID/dress requirements and admission are checked with each venue. Meals, drinks, show tickets, transport and extra hosting hours are separate.

## Pricing and enquiry storage

`price: null` marks an experience that needs a personal quote. Selecting any such experience removes numeric totals and per-person estimates from the planner, including mixed priced/quote-only plans. The PHP backend stores `-1` as an internal quote-required marker in the existing `estimate_eur INTEGER NOT NULL` column; the studio displays **Request a quote**. This preserves the existing database schema and earlier enquiries. Visitors never submit a price. Both validators accept up to the current catalog length (nine distinct experiences).
