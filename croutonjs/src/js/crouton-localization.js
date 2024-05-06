var words;

function CroutonLocalization(language) {
	this.language = language;
	this.words = {
		"ar": {
			"days_of_the_week" : ["", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء ", "الخميس", "الجمعة", "السبت"],
			"weekday" : "يوم عمل",
			"city" : "مدينة",
			"cities" : "المدن",
			"groups" : "مجموعات",
			"areas" : "المناطق",
			"regions": "المناطق",
			"locations" : "المواقع",
			"counties" : "المقاطعات",
			"states" : "المقاطعات",
			"postal_codes" : "الرموز البريدية",
			"formats" : "الأشكال",
			"map" : "خريطة",
			"neighborhood": "الحي",
			"near_me": "بالقرب مني",
			"text_search": "البحث عن النص",
			"click_search": "انقر فوق البحث",
			"pan_and_zoom": "عموم + التكبير",
			"languages": "اللغات",
			"common_needs": "الاحتياجات المشتركة",
			"meeting_count": "الاجتماعات الأسبوعية:",
			"venue_types": "أنواع المكان",
			"venue_type_choices": {
				IN_PERSON: "شخصيا",
				VIRTUAL: "افتراضي",
			},
			"service_body_types": {
				AS: "لجنة خدمات المنطق",
				RS: "لجنة خدمات الإقلي.م",
				ZF: "منتدى المنطقة"	,
				MA: "لجنة خدمات العاصمة",
				LS: "خدمة المنتديات المحلية",	
				GS: "Group Support Forum",
			},
			'css-textalign': 'style="text-align:right;"',
			'css-floatdirection': 'style="float:right;"',
			"share": "مشاركة",
			'tabular': "جدول",
			'google_directions': 'اتجاهات جوجل للاجتماع',
			"no_meetings_for_this_day": "لا توجد اجتماعات لهذا اليوم.",
			'all': 'الجميع',
			'menu': 'القائمة',
			'search for meetings':'البحث عن الاجتماعات',
			'show meetings near...': 'أظهر الاجتماعات بالقرب من...',
			'filter meetings':'سرد الاجتماعات',
			'visible meeting list': 'قائمة الاجتماعات المرئية',
			'enter a city or zip code': 'أدخل المدينة أو الرمز البريدي',
			'toggle fullscreen mode': 'تبديل وضع ملء الشاشة',
			'close': "قريب",
			"bmlt2ics": "Add to your calendar",
			'meeting page': "صفحة الاجتماع",
			'meeting details': "تفاصيل الاجتماع"
		},
		"da-DK": {
			"days_of_the_week": ["", "Søndag", "Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag"],
			"weekday": 'Ugedag',
			"city": "By",
			"cities": "Byer",
			"groups": "Grupper",
			"areas": "Områder",
			"regions": "Regions",
			"locations": "Lokalite",
			"counties": "Amter",
			"states": "Provinser",
			"postal_codes": "Post nummer",
			"formats": "Struktur",
			"map": "Kort",
			"neighborhood": "Neighborhood",
			"near_me": "Near Me",
			"text_search": "Text Search",
			"click_search": "Click Search",
			"pan_and_zoom": "Pan + Zoom",
			"languages": "Languages",
			"common_needs": "Common Needs",
			"meeting_count": "Weekly Meetings:",
			"venue_types": "Venue Types",
			"venue_type_choices": {
				IN_PERSON: "In Person",
				VIRTUAL: "Virtual",
			},
			"service_body_types": {
				AS: "Area Service Committee",
				RS: "Regional Service Committee",
				ZF: "Zonal Forum",
				MA: "Metropolitan Service Committee",
				LS: "Local Service Forum",
				GS: "Group Support Forum"
			},
			"share": "share",
			"no_meetings_for_this_day": "No meetings for this day.",
			'css-textalign': '',
			'css-floatdirection': '',
			'tabular': "As table",
			'google_directions': 'Google directions to meeting',
			'all': 'All',
			'menu': 'Menu',
			"bmlt2ics": "Add to your calendar",
			'search for meetings': 'Search for meetings',
			'show meetings near...': 'Show meetings near...',
			'filter meetings': 'Filter meetings',
			'visible meeting list': 'Visible meetings as list',
			'enter a city or zip code': 'Enter a city or zip code',
			'toggle fullscreen mode': 'Toggle fullscreen mode',
		},
		"de-DE":{
			"days_of_the_week": ["", "Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"],
			"weekday": 'Wochentag',
			"city": "Stadt",
			"cities": "Städte",
			"groups": "Gruppen",
			"areas": "Gebiete",
			"regions": "Regions",
			"locations": "Orte",
			"counties": "Landkreise",
			"states": "Bundesländer",
			"postal_codes": "PLZ",
			"formats": "Formate",
			"map": "Karte",
			"neighborhood": "Nachbarschaft",
			"near_me": "In meiner Nähe",
			"text_search": "Textsuche",
			"click_search": "Klicksuche",
			"pan_and_zoom": "Schwenken + Zoomen",
			"languages": "Sprachen",
			"common_needs": "Common Needs",
			"meeting_count": "Wöchentliche Meetings:",
			"venue_types": "Treffpunktarten",
			"venue_type_choices": {
				IN_PERSON: "Präsens-Meetings",
				VIRTUAL: "Online-Meetings",
			},
			"service_body_types": {
				AS: "Area Service Committee",
				RS: "Regional Service Committee",
				ZF: "Zonal Forum",
				MA: "Metropolitan Service Committee",
				LS: "Local Service Forum",
				GS: "Group Support Forum"
			},
			"share": "Teilen",
			'tabular': "Als Tabelle",
			'google_directions': 'Google Routenplaner',
			"no_meetings_for_this_day": "Keine Meetings an diesem Tag.",
			'css-textalign': '',
			'css-floatdirection': '',
			'all': 'Alle',
			'menu': 'Menu',
			'search for meetings': 'Search for meetings',
			'show meetings near...': 'Meetings in andere Städten',
			'filter meetings': 'Filter für Sprache, Format usw.',
			'visible meeting list': 'Sichtbare Meetings als Tabelle',
			'enter a city or zip code': 'Stadt oder PLZ',
			'toggle fullscreen mode': 'Umschalten Vollbildmodus',
			'close': "Schliessen",
			"bmlt2ics": "Zu Kalender hinzufügen",
			'meeting page': "Meeting Seite",
			'meeting details': "Genaueres zum Meeting"
		},
		"en-AU": {
			"days_of_the_week" : ["", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
			"weekday" : "Weekday",
			"city" : "City",
			"cities" : "Cities",
			"groups" : "Groups",
			"areas" : "Areas",
			"regions": "Regions",
			"locations" : "Locations",
			"counties" : "Counties",
			"states" : "States",
			"postal_codes" : "Postcodes",
			"formats" : "Formats",
			"map" : "Map",
			"neighborhood": "Neighborhood",
			"near_me": "Near Me",
			"text_search": "Text Search",
			"click_search": "Click Search",
			"languages": "Languages",
			"common_needs": "Common Needs",
			"meeting_count": "Weekly Meetings:",
			"venue_types": "Venue Types",
			"venue_type_choices": {
				IN_PERSON: "In Person",
				VIRTUAL: "Virtual",
			},
			"service_body_types": {
				AS: "Area Service Committee",
				RS: "Regional Service Committee",
				ZF: "Zonal Forum",
				MA: "Metropolitan Service Committee",
				LS: "Local Service Forum",
				GS: "Group Support Forum"
			},
			"share": "share",
			'tabular': "As table",
			'google_directions': 'Google directions to meeting',
			"no_meetings_for_this_day": "No meetings for this day.",
			'css-textalign': '',
			'css-floatdirection': '',
			"bmlt2ics": "Add to your calendar",
			'all': 'All',
			'menu': 'Menu',
			'search for meetings': 'Search for meetings',
			'show meetings near...': 'Show meetings near...',
			'filter meetings': 'Filter meetings',
			'visible meeting list': 'Visible meetings as list',
			'enter a city or zip code': 'Enter a city or zip code',
			'toggle fullscreen mode': 'Toggle fullscreen mode',
			'close': "Close",
			'meeting page': "Meeting Page",
			'meeting details': "Meeting Details"
		},
		"en-CA": {
			"days_of_the_week" : ["", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
			"weekday" : "Weekday",
			"city" : "City",
			"cities" : "Cities",
			"groups" : "Groups",
			"areas" : "Areas",
			"regions": "Regions",
			"locations" : "Locations",
			"counties" : "Counties",
			"states" : "Provinces",
			"postal_codes" : "Postal Codes",
			"formats" : "Formats",
			"map" : "Map",
			"neighborhood": "Neighborhood",
			"near_me": "Near Me",
			"text_search": "Text Search",
			"click_search": "Click Search",
			"pan_and_zoom": "Pan + Zoom",
			"languages": "Languages",
			"common_needs": "Common Needs",
			"meeting_count": "Weekly Meetings:",
			"venue_types": "Venue Types",
			"venue_type_choices": {
				IN_PERSON: "In Person",
				VIRTUAL: "Virtual",
			},
			"service_body_types": {
				AS: "Area Service Committee",
				RS: "Regional Service Committee",
				ZF: "Zonal Forum",
				MA: "Metropolitan Service Committee",
				LS: "Local Service Forum",
				GS: "Group Support Forum"
			},
			"share": "share",
			'tabular': "As table",
			'google_directions': 'Google directions to meeting',
			"no_meetings_for_this_day": "No meetings for this day.",
			'css-textalign': '',
			'css-floatdirection': '',
			'all': 'All',
			'menu': 'Menu',
			'search for meetings': 'Search for meetings',
			'show meetings near...': 'Show meetings near...',
			'filter meetings': 'Filter meetings',
			'visible meeting list': 'Visible meetings as list',
			'enter a city or zip code': 'Enter a city or zip code',
			'toggle fullscreen mode': 'Toggle fullscreen mode',
			'close': "Close",
			"bmlt2ics": "Add to your calendar",
			'meeting page': "Meeting Page",
			'meeting details': "Meeting Details"
		},
		"en-NZ": {
			"days_of_the_week" : ["", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
			"weekday" : "Weekday",
			"city" : "City",
			"cities" : "Cities",
			"groups" : "Groups",
			"areas" : "Areas",
			"regions": "Regions",
			"locations" : "Locations",
			"counties" : "Counties",
			"states" : "States",
			"postal_codes" : "Postcodes",
			"formats" : "Formats",
			"map" : "Map",
			"neighborhood": "Neighborhood",
			"near_me": "Near Me",
			"text_search": "Text Search",
			"click_search": "Click Search",
			"pan_and_zoom": "Pan + Zoom",
			"languages": "Languages",
			"common_needs": "Common Needs",
			"meeting_count": "Weekly Meetings:",
			"venue_types": "Venue Types",
			"venue_type_choices": {
				IN_PERSON: "In Person",
				VIRTUAL: "Virtual",
			},
			"service_body_types": {
				AS: "Area Service Committee",
				RS: "Regional Service Committee",
				ZF: "Zonal Forum",
				MA: "Metropolitan Service Committee",
				LS: "Local Service Forum",
				GS: "Group Support Forum"
			},
			"share": "share",
			'tabular': "As table",
			'google_directions': 'Google directions to meeting',
			"no_meetings_for_this_day": "No meetings for this day.",
			'css-textalign': '',
			'css-floatdirection': '',
			'all': 'All',
			'menu': 'Menu',
			'search for meetings': 'Search for meetings',
			'show meetings near...': 'Show meetings near...',
			'filter meetings': 'Filter meetings',
			'visible meeting list': 'Visible meetings as list',
			'enter a city or zip code': 'Enter a city or zip code',
			'toggle fullscreen mode': 'Toggle fullscreen mode',
			'close': "Close",
			"bmlt2ics": "Add to your calendar",
			'meeting page': "Meeting Page",
			'meeting details': "Meeting Details"
		},
		"en-UK": {
			"days_of_the_week" : ["", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
			"weekday" : "Weekday",
			"city" : "City",
			"cities" : "Cities",
			"groups" : "Groups",
			"areas" : "Areas",
			"regions": "Regions",
			"locations" : "Locations",
			"counties" : "Counties",
			"states" : "States",
			"postal_codes" : "Postcodes",
			"formats" : "Formats",
			"map" : "Map",
			"neighborhood": "Neighborhood",
			"near_me": "Near Me",
			"text_search": "Text Search",
			"click_search": "Click Search",
			"pan_and_zoom": "Pan + Zoom",
			"languages": "Languages",
			"common_needs": "Common Needs",
			"meeting_count": "Weekly Meetings:",
			"venue_types": "Venue Types",
			"venue_type_choices": {
				IN_PERSON: "In Person",
				VIRTUAL: "Virtual",
			},
			"service_body_types": {
				AS: "Area Service Committee",
				RS: "Regional Service Committee",
				ZF: "Zonal Forum",
				MA: "Metropolitan Service Committee",
				LS: "Local Service Forum",
				GS: "Group Support Forum"
			},
			"share": "share",
			'tabular': "As table",
			'google_directions': 'Google directions to meeting',
			"no_meetings_for_this_day": "No meetings for this day.",
			'css-textalign': '',
			'css-floatdirection': '',
			'all': 'All',
			'menu': "Menu",
			"bmlt2ics": "Add to your calendar",
			'search for meetings': 'Search for meetings',
			'show meetings near...': 'Show meetings near...',
			'filter meetings': 'Filter meetings',
			'visible meeting list': 'Visible meetings as list',
			'enter a city or zip code': 'Enter a city or zip code',
			'toggle fullscreen mode': 'Toggle fullscreen mode',
			'close': "Close",
			'meeting page': "Meeting Page",
			'meeting details': "Meeting Details"
		},
		"en-US": {
			"days_of_the_week" : ["", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
			"weekday" : "Weekday",
			"city" : "City",
			"cities" : "Cities",
			"groups" : "Groups",
			"areas" : "Areas",
			"regions": "Regions",
			"locations" : "Locations",
			"counties" : "Counties",
			"states" : "States",
			"postal_codes" : "Zips",
			"formats" : "Formats",
			"map" : "Map",
			"neighborhood": "Neighborhood",
			"near_me": "Near Me",
			"text_search": "Text Search",
			"click_search": "Click Search",
			"pan_and_zoom": "Pan + Zoom",
			"languages": "Languages",
			"common_needs": "Common Needs",
			"meeting_count": "Weekly Meetings:",
			"venue_types": "Venue Types",
			'tabular': "As table",
			'google_directions': 'Google directions to meeting',
			"venue_type_choices": {
				IN_PERSON: "In Person",
				VIRTUAL: "Virtual",
			},
			"service_body_types": {
				AS: "Area Service Committee",
				RS: "Regional Service Committee",
				ZF: "Zonal Forum",
				MA: "Metropolitan Service Committee",
				LS: "Local Service Forum",
				GS: "Group Support Forum"
			},
			"share": "share",
			"no_meetings_for_this_day": "No meetings for this day.",
			'css-textalign': '',
			'css-floatdirection': '',
			'all': 'All',
			'menu': "Menu",
			'search for meetings': 'Search for meetings',
			'show meetings near...': 'Show meetings near...',
			'filter meetings': 'Filter meetings',
			'visible meeting list': 'Visible meetings as list',
			'enter a city or zip code': 'Enter a city or zip code',
			'toggle fullscreen mode': 'Toggle fullscreen mode',
			'close': "Close",
			"bmlt2ics": "Add to your calendar",
			'meeting page': "Meeting Page",
			'meeting details': "Meeting Details"
		},
		"es-US": {
			"days_of_the_week" : ["", "Domingo", " Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
			"weekday" : "Día de la semana",
			"city" : "Ciudad",
			"cities" : "Ciudades",
			"groups" : "Grupos",
			"areas" : "Areas",
			"regions": "Regions",
			"locations" : "Ubicaciones",
			"counties" : "Condados",
			"states" : "Estados",
			"postal_codes" : "Codiagos postales",
			"formats" : "Formatos",
			"map" : "Mapa",
			"neighborhood": "Neighborhood",
			"near_me": "Near Me",
			"text_search": "Text Search",
			"click_search": "Click Search",
			"pan_and_zoom": "Pan + Zoom",
			"languages": "Languages",
			"common_needs": "Common Needs",
			"meeting_count": "Weekly Meetings:",
			"venue_types": "Venue Types",
			"venue_type_choices": {
				IN_PERSON: "In Person",
				VIRTUAL: "Virtual",
			},
			"service_body_types": {
				AS: "Area Service Committee",
				RS: "Regional Service Committee",
				ZF: "Zonal Forum",
				MA: "Metropolitan Service Committee",
				LS: "Local Service Forum",
				GS: "Group Support Forum"
			},
			"share": "share",
			"no_meetings_for_this_day": "No meetings for this day.",
			'css-textalign': '',
			'tabular': "As table",
			'google_directions': 'Google directions to meeting',
			'css-floatdirection': '',
			'all': 'All',
			'menu': "Menu",
			'search for meetings': 'Search for meetings',
			'show meetings near...': 'Show meetings near...',
			'filter meetings': 'Filter meetings',
			'visible meeting list': 'Visible meetings as list',
			'enter a city or zip code': 'Enter a city or zip code',
			'toggle fullscreen mode': 'Toggle fullscreen mode',
			'close': "Close",
			"bmlt2ics": "Add to your calendar",
			'meeting page': "Meeting Page",
			'meeting details': "Meeting Details"
		},
		"fa-IR": {
			"days_of_the_week" : ["", 'یَکشَنب', 'دوشَنبه', 'سه‌شنبه', 'چهار شنبه', 'پَنج شَنبه', 'جُمعه', 'شَنبه'],
			"weekday" : "روز هفته",
			"city" : "شهر",
			"cities" : "شهرها",
			"groups" : "گروه ها",
			"areas" : "نواحی",
			"regions": "Regions",
			"locations" : "آدرسها",
			"counties" : "بخشها",
			"states" : "ایالات",
			"postal_codes":"کد پستی",
			"formats" : "فورمت ها",
			"map" : "نقشه",
			"neighborhood": "Neighborhood",
			"near_me": "Near Me",
			"text_search": "Text Search",
			"click_search": "Click Search",
			"pan_and_zoom": "Pan + Zoom",
			"languages": "Languages",
			"common_needs": "Common Needs",
			"meeting_count": "Weekly Meetings:",
			"venue_types": "Venue Types",
			"venue_type_choices": {
				IN_PERSON: "In Person",
				VIRTUAL: "Virtual",
			},
			"service_body_types": {
				AS: "Area Service Committee",
				RS: "Regional Service Committee",
				ZF: "Zonal Forum",
				MA: "Metropolitan Service Committee",
				LS: "Local Service Forum",
				GS: "Group Support Forum"
			},
			"share": "share",
			'tabular': "As table",
			'google_directions': 'Google directions to meeting',
			"no_meetings_for_this_day": "No meetings for this day.",
			'css-textalign': 'style="text-align:right;"',
			'css-floatdirection': 'style="float:right;"',
			'all': 'All',
			'menu': "Menu",
			'search for meetings': 'Search for meetings',
			'show meetings near...': 'Show meetings near...',
			'filter meetings': 'Filter meetings',
			'visible meeting list': 'Visible meetings as list',
			'enter a city or zip code': 'Enter a city or zip code',
			'toggle fullscreen mode': 'Toggle fullscreen mode',
			'close': "Close",
			"bmlt2ics": "Add to your calendar",
			'meeting page': "Meeting Page",
			'meeting details': "Meeting Details"
		},
		"fr-CA": {
			"days_of_the_week" : ["", "Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"],
			"weekday" : "Journée",
			"city" : "Ville",
			"cities" : "Villes",
			"groups" : "Groupes",
			"areas" : "ASL",
			"regions": "Regions",
			"locations" : "Emplacements",
			"counties" : "Régions",
			"states" : "Provinces",
			"postal_codes" : "Codes postaux",
			"formats" : "Formats",
			"map" : "Carte",
			"neighborhood": "Quartier",
			"near_me": "À côté de moi",
			"text_search": "Recherche textuelle",
			"click_search": "Recherche au clic",
			"pan_and_zoom": "Panoramique + Zoom",
			"languages": "Langages",
			"common_needs": "Besoins",
			"meeting_count": "Nombre de réunions par semaine",
			"venue_types": "Types de lieux",
			"venue_type_choices": {
				IN_PERSON: "Physique",
				VIRTUAL: "Virtuel",
			},
			"service_body_types": {
				AS: "Area Service Committee",
				RS: "Regional Service Committee",
				ZF: "Zonal Forum",
				MA: "Metropolitan Service Committee",
				LS: "Local Service Forum",
				GS: "Group Support Forum"
			},
			"share": "Partager",
			"tabular": "Liste",
			"google_directions": "Itinéraire sur Google Maps",
			"no_meetings_for_this_day": "Pas de réunion aujourd'hui.",
			"css-textalign": "css-textalign",
			"css-floatdirection": "css-floatdirection",
			"all": "Tout",
			"menu": "Menu",
			"search for meetings": "Rechercher des réunions",
			"show meetings near...": "Afficher les réunions près de...",
			"filter meetings": "Filtrer les réunions",
			"visible meeting list": "Liste des réunions visibles",
			"enter a city or zip code": "Entrer une ville ou un code postal",
			"toggle fullscreen mode": "Basculer en mode plein écran",
			"close": "Fermer",
			"bmlt2ics": "Ajouter au calendrier",
			"meeting page": "Page de la réunion",
			"meeting details": "Détails de la réunion"
		},
		"it-IT": {
			"days_of_the_week" : ["", "Domenica", " Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"],
			"weekday" : "Giorno",
			"city" : "Città",
			"cities" : "Città",
			"groups" : "Gruppi",
			"areas" : "Aree",
			"regions": "Regione",
			"locations" : "Località",
			"counties" : "Province",
			"states" : "Regione",
			"postal_codes" : "CAP",
			"formats" : "Formati",
			"map" : "Mappa",
			"neighborhood": "Quartiere",
			"near_me": "Vicino a me",
			"text_search": "Ricerca testuale",
			"click_search": "Fare click su cerca",
			"pan_and_zoom": "Panoramica e zoom",
			"languages": "Lingue",
			"common_needs": "Bisogni comuni",
			"meeting_count": "Incontri settimanali:",
			"venue_types": "Tipologia di locali",
			"venue_type_choices": {
				IN_PERSON: "Riunione fisica",
				VIRTUAL: "Riunione virtuale",
			},
			"service_body_types": {
				AS: "Comitato area",
				RS: "Comitato di regione",
				ZF: "Zonal Forum",
				MA: "Metropolitan Service Committee",
				LS: "Local Service Forum",
				GS: "Forum supporto gruppi"
			},
			"share": "Condividi",
			'tabular': "Tabellare",
			'google_directions': 'Mappa',
			"no_meetings_for_this_day": "Nessuna riunione per questo giorno.",
			'css-textalign': '',
			'css-floatdirection': '',
			'all': 'Tutti',
			'menu': "Menu",
			'search for meetings': 'Search for meetings',
			'show meetings near...': 'Mostra incontri nelle vicinanze..',
			'filter meetings': 'Filtrare le riunioni',
			'visible meeting list': 'Elenco riunioni visibile',
			'enter a city or zip code': 'Inserire una città o un codice postale',
			'toggle fullscreen mode': 'Attiva/disattiva la modalità a schermo intero',
			'close': "Close",
			"bmlt2ics": "Add to your calendar",
			'meeting page': "Meeting Page",
			'meeting details': "Meeting Details"
		},
		"nl-NL": {
			"days_of_the_week" : ["", "Zondag", "Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag"],
			"weekday" : "Dag van de week",
			"city" : "Stad",
			"cities" : "Steden",
			"groups" : "Groepen",
			"areas" : "Gebieden",
			"regions": "Regions",
			"locations" : "Locaties",
			"counties" : "Landen",
			"states" : "Provincies",
			"postal_codes" : "Postcodes",
			"formats" : "Formats",
			"map" : "Kaart",
			"neighborhood": "Buurt",
			"near_me": "Bij mij in de buurt",
			"text_search": "Zoek op tekst",
			"click_search": "Klik om te zoeken",
			"pan_and_zoom": "Pan + Zoom",
			"languages": "Talen",
			"common_needs": "Common Needs",
			"meeting_count": "Weekly Meetings:",
			"venue_types": "Soorten locaties",
			"venue_type_choices": {
				IN_PERSON: "Fysiek",
				VIRTUAL: "Online",
			},
			"service_body_types": {
				AS: "Area Service Committee",
				RS: "Regional Service Committee",
				ZF: "Zonal Forum",
				MA: "Metropolitan Service Committee",
				LS: "Local Service Forum",
				GS: "Group Support Forum"
			},
			"share": "share",
			'tabular': "As table",
			'google_directions': 'Google directions to meeting',
			"no_meetings_for_this_day": "No meetings for this day.",
			'css-textalign': '',
			'css-floatdirection': '',
			'all': 'All',
			'menu': "Menu",
			'search for meetings': 'Search for meetings',
			'show meetings near...': 'Show meetings near...',
			'filter meetings': 'Filter meetings',
			'visible meeting list': 'Visible meetings as list',
			'enter a city or zip code': 'Enter a city or zip code',
			'toggle fullscreen mode': 'Toggle fullscreen mode',
			'close': "Close",
			"bmlt2ics": "Add to your calendar",
			'meeting page': "Meeting Page",
			'meeting details': "Meeting Details"
		},
		"pl-PL": {
			"days_of_the_week" : ["", "Niedziela", "Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota"],
			"weekday" : "Dzień tygodnia",
			"city" : "Miasto",
			"cities" : "Miasta",
			"groups" : "Grupy",
			"areas" : "Okręgi",
			"regions": "Regions",
			"locations" : "Lokalizacje",
			"counties" : "Powiaty",
			"states" : "Województwa",
			"postal_codes" : "Kody pocztowe",
			"formats" : "Formaty",
			"map" : "Mapa",
			"neighborhood": "Sąsiedztwo",
			"near_me": "Blisko Mnie",
			"text_search": "Wpisz",
			"click_search": "Kliknij na mapie",
			"pan_and_zoom": "Przesuń powiększ",
			"languages": "Języki",
			"common_needs": "Common Needs",
			"meeting_count": "Weekly Meetings:",
			"venue_types": "Venue Types",
			"venue_type_choices": {
				IN_PERSON: "In Person",
				VIRTUAL: "Virtual",
			},
			"service_body_types": {
				AS: "Area Service Committee",
				RS: "Regional Service Committee",
				ZF: "Zonal Forum",
				MA: "Metropolitan Service Committee",
				LS: "Local Service Forum",
				GS: "Group Support Forum"
			},
			"share": "share",
			'tabular': "As table",
			'google_directions': 'Google directions to meeting',
			"no_meetings_for_this_day": "No meetings for this day.",
			'css-textalign': '',
			'css-floatdirection': '',
			'all': 'All',
			'menu': "Menu",
			'search for meetings': 'Search for meetings',
			'show meetings near...': 'Show meetings near...',
			'filter meetings': 'Filter meetings',
			'visible meeting list': 'Visible meetings as list',
			'enter a city or zip code': 'Enter a city or zip code',
			'toggle fullscreen mode': 'Toggle fullscreen mode',
			'close': "Close",
			"bmlt2ics": "Add to your calendar",
			'meeting page': "Meeting Page",
			'meeting details': "Meeting Details"
		},
		"pt-BR": {
			"days_of_the_week" : ["", "Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"],
			"weekday" : "Dia da semana",
			"city" : "Cidade",
			"cities" : "Cidades",
			"groups" : "Grupos",
			"areas" : "Áreas",
			"regions": "Regions",
			"locations" : "Localizações",
			"counties" : "Municípios",
			"states" : "Estados",
			"postal_codes" : "CEPs",
			"formats" : "Formatos",
			"map" : "Mapa",
			"neighborhood": "Bairro",
			"near_me": "Minha Localização",
			"text_search": "digite um endereço",
			"click_search": "Clique no local",
			"pan_and_zoom": "Panorâmico + Zoom",
			"languages": "Idiomas",
			"common_needs": "Common Needs",
			"meeting_count": "Weekly Meetings:",
			"venue_types": "tipos de reunião",
			"venue_type_choices": {
				IN_PERSON: "Presencial",
				VIRTUAL: "Virtual",
			},
			"service_body_types": {
				AS: "Area Service Committee",
				RS: "Regional Service Committee",
				ZF: "Zonal Forum",
				MA: "Metropolitan Service Committee",
				LS: "Local Service Forum",
				GS: "Group Support Forum"
			},
			"share": "Compartilhar",
			'tabular': "As table",
			'google_directions': 'Google directions to meeting',
			"no_meetings_for_this_day": "No meetings for this day.",
			'css-textalign': '',
			'css-floatdirection': '',
			'all': 'All',
			'menu': "Menu",
			"bmlt2ics": "Add to your calendar",
			'search for meetings': 'Search for meetings',
			'show meetings near...': 'Show meetings near...',
			'filter meetings': 'Filter meetings',
			'visible meeting list': 'Visible meetings as list',
			'enter a city or zip code': 'Enter a city or zip code',
			'toggle fullscreen mode': 'Toggle fullscreen mode',
			'close': "Close",
			'meeting page': "Meeting Page",
			'meeting details': "Meeting Details"
		},
		"ru-RU": {
			"days_of_the_week" : ["", "Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"],
			"weekday" : "будний день",
			"city" : "Город",
			"cities" : "Города",
			"groups" : "Группы",
			"areas" : "Зоны",
			"regions": "Regions",
			"locations" : "Локации",
			"counties" : "Страны",
			"states" : "Штаты",
			"postal_codes" : "Индексы (почтовые)",
			"formats" : "Форматы",
			"map" : "Карта",
			"neighborhood": "Соседство",
			"near_me": "Около меня",
			"text_search": "Поиск текста",
			"click_search": "Нажмите Поиск",
			"pan_and_zoom": "Pan + Zoom",
			"languages": "Языки",
			"common_needs": "Common Needs",
			"meeting_count": "Weekly Meetings:",
			"venue_types": "Venue Types",
			"venue_type_choices": {
				IN_PERSON: "In Person",
				VIRTUAL: "Virtual",
			},
			"service_body_types": {
				AS: "Area Service Committee",
				RS: "Regional Service Committee",
				ZF: "Zonal Forum",
				MA: "Metropolitan Service Committee",
				LS: "Local Service Forum",
				GS: "Group Support Forum"
			},
			"share": "share",
			'tabular': "As table",
			'google_directions': 'Google directions to meeting',
			"no_meetings_for_this_day": "No meetings for this day.",
			'css-textalign': '',
			'css-floatdirection': '',
			'all': 'All',
			'menu': "Menu",
			"bmlt2ics": "Add to your calendar",
			'search for meetings': 'Search for meetings',
			'show meetings near...': 'Show meetings near...',
			'filter meetings': 'Filter meetings',
			'visible meeting list': 'Visible meetings as list',
			'enter a city or zip code': 'Enter a city or zip code',
			'toggle fullscreen mode': 'Toggle fullscreen mode',
			'close': "Close",
			'meeting page': "Meeting Page",
			'meeting details': "Meeting Details"
		},
		"sv-SE": {
			"days_of_the_week" : ["", "Söndag", "Måndag", "Tisdag", "Onsdag", "Torsdag", "Fredag", "Lördag"],
			"weekday" : "Veckodag",
			"city" : "Stad",
			"cities" : "Städer",
			"groups" : "Grupper",
			"areas" : "Distrikt",
			"regions": "Regions",
			"locations" : "Plats",
			"counties" : "Land",
			"states" : "Stater",
			"postal_codes" : "Postnummer",
			"formats" : "Format",
			"map" : "Karta",
			"neighborhood": "Region",
			"near_me": "Nära mig",
			"text_search": "Söktext",
			"click_search": "Sök",
			"pan_and_zoom": "Panorera + Zooma",
			"languages": "Språk",
			"common_needs": "Common Needs",
			"meeting_count": "Weekly Meetings:",
			"venue_types": "Venue Types",
			"venue_type_choices": {
				IN_PERSON: "In Person",
				VIRTUAL: "Virtual",
			},
			"service_body_types": {
				AS: "Area Service Committee",
				RS: "Regional Service Committee",
				ZF: "Zonal Forum",
				MA: "Metropolitan Service Committee",
				LS: "Local Service Forum",
				GS: "Group Support Forum"
			},
			"share": "share",
			'tabular': "As table",
			'google_directions': 'Google directions to meeting',
			"no_meetings_for_this_day": "No meetings for this day.",
			'css-textalign': '',
			'css-floatdirection': '',
			'all': 'All',
			'menu': "Menu",
			'search for meetings': 'Search for meetings',
			'show meetings near...': 'Show meetings near...',
			'filter meetings': 'Filter meetings',
			'visible meeting list': 'Visible meetings as list',
			'enter a city or zip code': 'Enter a city or zip code',
			'toggle fullscreen mode': 'Toggle fullscreen mode',
			'close': "Close",
			"bmlt2ics": "Add to your calendar",
			'meeting page': "Meeting Page",
			'meeting details': "Meeting Details"
		}
	};
}

CroutonLocalization.prototype.getDayOfTheWeekWord = function(day_id) {
	return this.words[this.language]['days_of_the_week'][day_id];
};

CroutonLocalization.prototype.getWord = function(word) {
	const ret = this.words[this.language][word.toLowerCase()];
	if (typeof ret === 'undefined') return word;
	return ret;
};

CroutonLocalization.prototype.getVenueType = function(type) {
	return this.words[this.language]['venue_type_choices'][type];
}

CroutonLocalization.prototype.getServiceBodyType = function(type) {
	return this.words[this.language]['service_body_types'][type];
}
