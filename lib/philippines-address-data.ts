// Complete address data for Philippines provinces with ALL cities and municipalities
// Data includes representative barangays for each city/municipality

export interface AddressData {
  [province: string]: {
    [cityOrMunicipality: string]: string[]
  }
}

export const addressData: AddressData = {
  "Metro Manila": {
    // 16 Cities + 1 Municipality
    "Manila": ["Binondo", "Ermita", "Intramuros", "Malate", "Paco", "Pandacan", "Port Area", "Quiapo", "Sampaloc", "San Andres", "San Miguel", "San Nicolas", "Santa Ana", "Santa Cruz", "Santa Mesa", "Tondo"],
    
    "Quezon City": ["Alicia", "Amihan", "Apolonio Samson", "Baesa", "Bagbag", "Bagbaguin", "Bagong Lipunan ng Crame", "Bagong Pag-asa", "Bagong Silangan", "Bagumbayan", "Bagumbuhay", "Bahay Toro", "Balingasa", "Balong Bato", "Batasan Hills", "Bayanihan", "Blue Ridge A", "Blue Ridge B", "Botocan", "Bungad", "Camp Aguinaldo", "Capri", "Central", "Claro", "Commonwealth", "Culiat", "Damar", "Damayan", "Damayang Lagi", "Del Monte", "Dioquino Zobel", "Don Manuel", "Doña Aurora", "Doña Faustina Subdivision", "Doña Imelda", "Doña Josefa", "Duyan-duyan", "E. Rodriguez", "East Kamias", "Escopa I", "Escopa II", "Escopa III", "Escopa IV", "Fairview", "Greater Lagro", "Gulod", "Holy Spirit", "Horseshoe", "Immaculate Conception", "Kaligayahan", "Kalusugan", "Kamuning", "Katipunan", "Kaunlaran", "Kristong Hari", "Krus na Ligas", "Laging Handa", "Libis", "Lourdes", "Loyola Heights", "Malaya", "Mangga", "Manresa", "Mariana", "Mariblo", "Marilag", "Masagana", "Masambong", "Matandang Balara", "Milagrosa", "N.S. Amoranto (Gintong Silahis)", "Nagkaisang Nayon", "Nakpil", "New Era", "North Fairview", "Novaliches Proper", "Obrero", "Old Capitol Site", "Padilla", "Pag-ibig sa Nayon", "Paligsahan", "Paltok", "Pansol", "Paraiso", "Pasong Putik Proper", "Pasong Tamo", "Payatas", "Phil-Am", "Pinagkaisahan", "Pinyahan", "Project 6", "Quirino 2-A", "Quirino 2-B", "Quirino 2-C", "Quirino 3-A", "Ramon Magsaysay", "Roxas", "Sacred Heart", "Salvacion", "San Agustin", "San Antonio", "San Bartolome", "San Isidro", "San Isidro Labrador", "San Jose", "San Martin de Porres", "San Roque", "San Vicente", "Sangandaan", "Santa Cruz", "Santa Lucia", "Santa Monica", "Santa Teresita", "Santo Cristo", "Santo Domingo (Matalahib)", "Santo Niño", "Santol", "Sauyo", "Sienna", "Sikatuna Village", "Silangan", "Socorro", "South Triangle", "Tagumpay", "Talampas", "Talayan", "Talipapa", "Tandang Sora", "Tatalon", "Teachers Village East", "Teachers Village West", "U.P. Campus", "U.P. Village", "Ugong Norte", "Unang Sigaw", "Valencia", "Vasra", "Veterans Village", "West Triangle", "White Plains"],
    
    "Caloocan": ["Barangay 1", "Barangay 2", "Barangay 3", "Barangay 4", "Barangay 5", "Barangay 6", "Barangay 7", "Barangay 8", "Barangay 9", "Barangay 10", "Barangay 11", "Barangay 12", "Barangay 13", "Barangay 14", "Barangay 15", "Barangay 16", "Barangay 17", "Barangay 18", "Barangay 19", "Barangay 20", "Barangay 21", "Barangay 22", "Barangay 23", "Barangay 24", "Barangay 25", "Barangay 26", "Barangay 27", "Barangay 28", "Barangay 29", "Barangay 30", "Barangay 31", "Barangay 32", "Barangay 33", "Barangay 34", "Barangay 35", "Barangay 36", "Barangay 37", "Barangay 38", "Barangay 39", "Barangay 40", "Barangay 41", "Barangay 42", "Barangay 43", "Barangay 44", "Barangay 45", "Barangay 46", "Barangay 47", "Barangay 48", "Barangay 49", "Barangay 50", "Barangay 51", "Barangay 52", "Barangay 53", "Barangay 54", "Barangay 55", "Barangay 56", "Barangay 57", "Barangay 58", "Barangay 59", "Barangay 60", "Barangay 61", "Barangay 62", "Barangay 63", "Barangay 64", "Barangay 65", "Barangay 66", "Barangay 67", "Barangay 68", "Barangay 69", "Barangay 70", "Barangay 71", "Barangay 72", "Barangay 73", "Barangay 74", "Barangay 75", "Barangay 76", "Barangay 77", "Barangay 78", "Barangay 79", "Barangay 80", "Barangay 81", "Barangay 82", "Barangay 83", "Barangay 84", "Barangay 85", "Barangay 86", "Barangay 87", "Barangay 88", "Bagbaguin", "Bagong Silang", "Bagumbong", "Camarin", "Kaybiga", "Lilles Ville", "Tala", "Marulas", "San Jose"],
    
    "Las Piñas": ["Almanza Dos", "Almanza Uno", "B.F. International Village", "Daniel Fajardo", "Elias Aldana", "Ilaya", "Manuyo Dos", "Manuyo Uno", "Pamplona Dos", "Pamplona Tres", "Pamplona Uno", "Pilar", "Pulang Lupa Dos", "Pulang Lupa Uno", "Talon Dos", "Talon Kuatro", "Talon Singko", "Talon Tres", "Zapote"],
    
    "Makati": ["Bangkal", "Bel-Air", "Carmona", "Cembo", "Comembo", "Dasmariñas", "East Rembo", "Forbes Park", "Guadalupe Nuevo", "Guadalupe Viejo", "Kasilawan", "La Paz", "Magallanes", "Olympia", "Palanan", "Pembo", "Pinagkaisahan", "Pio del Pilar", "Pitogo", "Poblacion", "Post Proper Northside", "Post Proper Southside", "Rizal", "San Antonio", "San Isidro", "San Lorenzo", "Santa Cruz", "Singkamas", "South Cembo", "Tejeros", "Urdaneta", "Valenzuela", "West Rembo"],
    
    "Malabon": ["Acacia", "Baritan", "Bayan-bayanan", "Catmon", "Concepcion", "Dampalit", "Flores", "Hulong Duhat", "Ibaba", "Longos", "Maysilo", "Muzon", "Niugan", "Panghulo", "Potrero", "San Agustin", "Santolan", "Tañong", "Tinajeros", "Tonsuya", "Tugatog"],
    
    "Mandaluyong": ["Addition Hills", "Bagong Silang", "Barangka Drive", "Barangka Ibaba", "Barangka Ilaya", "Barangka Itaas", "Buayang Bato", "Burol", "Daang Bakal", "Hagdang Bato Itaas", "Hagdang Bato Libis", "Harapin Ang Bukas", "Highway Hills", "Hulo", "Mabini-J. Rizal", "Malamig", "Mauway", "Namayan", "New Zaniga", "Old Zaniga", "Pag-asa", "Plainview", "Pleasant Hills", "Poblacion", "San Jose", "Vergara", "Wack-Wack Greenhills"],
    
    "Marikina": ["Barangka", "Calumpang", "Concepcion Dos", "Concepcion Uno", "Fortune", "Industrial Valley", "Jesus Dela Peña", "Malanday", "Marikina Heights", "Nangka", "Parang", "San Roque", "Santa Elena", "Santo Niño", "Tañong", "Tumana"],
    
    "Muntinlupa": ["Alabang", "Bayanan", "Buli", "Cupang", "Poblacion", "Putatan", "Sucat", "Tunasan", "New Alabang Village"],
    
    "Navotas": ["Bagumbayan North", "Bagumbayan South", "Bangculasi", "Daanghari", "Navotas East", "Navotas West", "North Bay Boulevard North", "North Bay Boulevard South", "San Jose", "San Rafael Village", "San Roque", "Sipac-Almacen", "Tangos North", "Tangos South", "Tanza"],
    
    "Parañaque": ["Baclaran", "BF Homes", "Don Bosco", "Don Galo", "La Huerta", "Marcelo Green", "Merville", "Moonwalk", "San Antonio", "San Dionisio", "San Isidro", "San Martin de Porres", "Santo Niño", "Sun Valley", "Tambo", "Vitalez"],
    
    "Pasay": ["Barangay 1 to 20", "Barangay 21 to 40", "Barangay 41 to 60", "Barangay 61 to 80", "Barangay 81 to 100", "Barangay 101 to 120", "Barangay 121 to 140", "Barangay 141 to 160", "Barangay 161 to 180", "Barangay 181 to 201"],
    
    "Pasig": ["Bagong Ilog", "Bagong Katipunan", "Bambang", "Buting", "Caniogan", "Dela Paz", "Kalawaan", "Kapasigan", "Kapitolyo", "Malinao", "Manggahan", "Maybunga", "Oranbo", "Palatiw", "Pinagbuhatan", "Pineda", "Rosario", "Sagad", "San Antonio", "San Joaquin", "San Jose", "San Miguel", "San Nicolas", "Santa Cruz", "Santa Lucia", "Santa Rosa", "Santo Tomas", "Santolan", "Sumilang", "Ugong"],
    
    "Pateros": ["Aguho", "Magtanggol", "Martires del '96", "Poblacion", "San Pedro", "San Roque", "Santa Ana", "Santo Rosario-Kanluran", "Santo Rosario-Silangan", "Tabacalera"],
    
    "San Juan": ["Addition Hills", "Balong-Bato", "Batis", "Corazon de Jesus", "Ermitaño", "Greenhills", "Halo-Halo", "Isabelita", "Kabayanan", "Little Baguio", "Maytunas", "Onse", "Pasadena", "Pedro Cruz", "Progreso", "Rivera", "Salapan", "San Perfecto", "Santa Lucia", "Tibagan"],
    
    "Taguig": ["Bagumbayan", "Bambang", "Calzada", "Central Bicutan", "Central Signal Village", "Fort Bonifacio", "Hagonoy", "Ibayo-Tipas", "Katuparan", "Ligid-Tipas", "Lower Bicutan", "Maharlika Village", "Napindan", "New Lower Bicutan", "North Daang Hari", "North Signal Village", "Palingon", "Pinagsama", "San Miguel", "Santa Ana", "South Daang Hari", "South Signal Village", "Tanyag", "Tuktukan", "Upper Bicutan", "Ususan", "Wawa", "Western Bicutan"],
    
    "Valenzuela": ["Arkong Bato", "Bagbaguin", "Balangkas", "Bignay", "Bisig", "Canumay East", "Canumay West", "Coloong", "Dalandanan", "Gen. T. de Leon", "Isla", "Karuhatan", "Lawang Bato", "Lingunan", "Mabolo", "Malanday", "Malinta", "Mapulang Lupa", "Marulas", "Maysan", "Palasan", "Parada", "Pariancillo Villa", "Paso de Blas", "Pasolo", "Poblacion", "Polo", "Punturin", "Rincon", "Tagalag", "Ugong", "Viente Reales", "Wawang Pulo"]
  },

  "Bulacan": {
    // Cities
    "Malolos": ["Anilao", "Atlag", "Babatnin", "Bagna", "Bagong Bayan", "Balayong", "Balite", "Bangkal", "Barihan", "Bulihan", "Bungahan", "Caingin", "Calero", "Caliligawan", "Canalate", "Caniogan", "Catmon", "Cofradia", "Dakila", "Guinhawa", "Ligas", "Liyang", "Longos", "Look 1st", "Look 2nd", "Lugam", "Mabolo", "Mambog", "Masile", "Matimbo", "Mojon", "Namayan", "Niugan", "Pamarawan", "Panasahan", "Pinagbakahan", "San Agustin", "San Gabriel", "San Juan", "San Pablo", "San Vicente", "Santiago", "Santisima Trinidad", "Santo Cristo", "Santo Niño", "Santo Rosario", "Sumapang Bata", "Sumapang Matanda", "Taal", "Tikay"],
    
    "Meycauayan": ["Bagbaguin", "Bahay Pare", "Bancal", "Banga", "Bayugan", "Bisig", "Bogon", "Calvario", "Camalig", "Hulo", "Iba", "Langka", "Lawa", "Libtong", "Liputan", "Longos", "Malhacan", "Pajo", "Pandayan", "Pantoc", "Perez", "Poblacion", "Saluysoy", "St. Francis", "Tugatog", "Ubihan", "Zamora"],
    
    "San Jose del Monte": ["Assumption", "Bagong Buhay I", "Bagong Buhay II", "Bagong Buhay III", "Citrus", "Ciudad Real", "Dulong Bayan I", "Dulong Bayan II", "Fatima I", "Fatima II", "Fatima III", "Fatima IV", "Fatima V", "Francisco Homes-Guijo", "Francisco Homes-Mulawin", "Francisco Homes-Narra", "Francisco Homes-Yakal", "Gaya-gaya", "Graceville", "Gumaoc Central", "Gumaoc East", "Gumaoc West", "Kaybanban", "Kaypian", "Lawang Pari", "Maharlika", "Minuyan I", "Minuyan II", "Minuyan III", "Minuyan IV", "Minuyan Proper", "Minuyan V", "Muzon", "Paradise III", "Poblacion", "Rafael Village", "San Isidro", "San Manuel", "San Martin I", "San Martin II", "San Martin III", "San Martin IV", "San Pedro", "San Rafael I", "San Rafael III", "San Rafael IV", "San Rafael V", "San Roque", "Santa Cruz I", "Santa Cruz II", "Santa Cruz III", "Santa Cruz IV", "Santa Cruz V", "Santo Cristo", "Santo Niño", "Santo Niño II", "Sapang Palay", "St. Martin de Porres", "Tungkong Mangga"],
    
    // Municipalities
    "Marilao": ["Abangan Norte", "Abangan Sur", "Lambakin", "Lias", "Loma de Gato", "Nagbalon", "Patubig", "Poblacion I", "Poblacion II", "Prenza I", "Prenza II", "Santa Rosa I", "Santa Rosa II", "Saog", "Tabing Ilog", "Ibayo"],
    
    "Bocaue": ["Antipona", "Bagumbayan", "Bambang", "Batia", "Biñang 1st", "Biñang 2nd", "Bolacan", "Bundukan", "Bunlo", "Caingin", "Duhat", "Igulot", "Lolomboy", "Poblacion", "Sulucan", "Taal", "Tambobong", "Turo", "Wakas"],
    
    "Balagtas": ["Borol 1st", "Borol 2nd", "Dalig", "Longos", "Panginay", "Pulong Gubat", "San Juan", "Santol", "Wawa"],
    
    "Guiguinto": ["Cutcut", "Daungan", "Ilang-Ilang", "Malis", "Panginay", "Poblacion", "Pritil", "Pulong Gubat", "Santa Cruz", "Santa Rita", "Tabang", "Tabe", "Tiaong", "Tuktukan"],
    
    "Plaridel": ["Agnaya", "Bagong Silang", "Banga I", "Banga II", "Bantug", "Bisag", "Bulihan", "Culianin", "Dampol I", "Dampol II-A", "Dampol II-B", "Lagundi", "Lalangan", "Lumang Bayan", "Parulan", "Poblacion", "Rueda", "Sabang", "San Jose", "Santa Ines", "Santo Niño", "Sapang Bayan", "Tabang"],
    
    "Bulakan": ["Balubad", "Bambang", "Maysantol", "Matungao", "Perez", "Pitpitan", "San Francisco", "San Jose", "San Nicolas", "Santa Ana", "Santa Ines", "Taliptip", "Tibig"],
    
    "Calumpit": ["Balite", "Balungao", "Buguion", "Bulusan", "Calantipe", "Caniogan", "Corazon", "Frances", "Gatbuca", "Gugo", "Iba Este", "Iba O'Este", "Longos", "Meysulao", "Palimbang", "Panducot", "Peñascola", "Poblacion", "Pungo", "San Jose", "San Marcos", "Santa Lucia", "Santo Niño", "Sapang Bayan", "Sergio Bayan", "Sucol"],
    
    "Hagonoy": ["Abulalas", "Carillo", "Iba", "Iba-Ibayo", "Mercado", "Palapat", "Pugad", "Sagrada Familia", "San Agustin", "San Isidro", "San Jose", "San Juan", "San Miguel", "San Nicolas", "San Pablo", "San Pascual", "San Pedro", "San Roque", "Santa Cruz", "Santa Elena", "Santo Niño", "Santo Rosario", "Tampok", "Tibaguin"],
    
    "Paombong": ["Binakod", "Kapitangan", "Malumot", "Masukol", "Pinalagdan", "Poblacion", "San Isidro I", "San Isidro II", "San Jose", "San Roque", "San Vicente", "Santa Cruz", "Santo Niño", "Siling Bata"],
    
    "Obando": ["Binuangan", "Catanghalan", "Hulo", "Lawa", "Paliwas", "Panghulo", "Poblacion", "San Pascual", "Salambao", "Tawiran"],
    
    "Pandi": ["Bagbaguin", "Bagong Barrio", "Baka-bakahan", "Bunsuran I", "Bunsuran II", "Bunsuran III", "Cacarong Bata", "Cacarong Matanda", "Cupang", "Malibong Bata", "Malibong Matanda", "Manatal", "Mapulang Lupa", "Masagana", "Masikap", "Pinagkuartelan", "Poblacion", "Real de Cacarong", "San Roque", "Siling Bata", "Siling Matanda"],
    
    "Angat": ["Banaban", "Baybay", "Binagbag", "Donacion", "Encanto", "Laog", "Marungko", "Niugan", "Paltok", "Pulong Yantok", "San Roque", "Santa Cruz", "Santa Lucia", "Santo Cristo", "Sulucan", "Taboc"],
    
    "Bustos": ["Bonga Mayor", "Bonga Menor", "Buisan", "Camachilihan", "Cambaog", "Catacte", "Liciada", "Malamig", "Malawak", "Poblacion", "San Pedro", "Tanawan", "Tibagan"],
    
    "San Ildefonso": ["Akle", "Alagao", "Basuit", "Bubulong Malaki", "Bubulong Munti", "Calasag", "Calawitan", "Casalat", "Gabihan", "Garlang", "Maasim", "Makapilapil", "Malipampang", "Mataas na Parang", "Matimbubong", "Nabaong-Garlang", "Palapala", "Pasong Bangkal", "Pinaod", "Poblacion", "Sapang Dayap", "Sapang Putik", "Sumandig", "Upig"],
    
    "San Miguel": ["Bagong Bayan", "Bagong Pag-asa", "Balaong", "Balite", "Bantog", "Batasan", "Biclat", "Buga", "Buliran", "Calumpang", "Cambio", "Camias", "Ilog-Bulo", "Lambakin", "Malibay", "Mandile", "Masalipit", "Narra", "Pacalag", "Paliwas", "Partida", "Poblacion", "Pulong Duhat", "Salacot", "San Agustin", "San Jose", "San Juan", "San Vicente", "Santa Ines", "Santa Lucia", "Santa Rita", "Santo Niño", "Sapang", "Sibilat", "Tartaro", "Tigpalas"],
    
    "San Rafael": ["Banca-Banca", "Caingin", "Coral na Bato", "Cruz na Daan", "Dagat-Dagatan", "Diliman I", "Diliman II", "Lico", "Maasim", "Maronquillo", "Pantubig", "Pariañgan", "Pasong Bangkal", "Pasong Callos", "Pasong Intsik", "Poblacion", "Pulong Bayabas", "Salapungan", "Sampaloc", "San Agustin", "San Roque", "Talacsan", "Tambubong", "Ulingao"],
    
    "Santa Maria": ["Bagbaguin", "Balasing", "Buenavista", "Camangyanan", "Catmon", "Cay Pombo", "Caysio", "Guyong", "Lalakhan", "Mag-asawang Sapa", "Mahabang Parang", "Manggahan", "Parada", "Poblacion", "Pulong Buhangin", "San Gabriel", "San Jose Patag", "Santa Clara", "Santa Cruz", "Silangan", "Tabing Bakod", "Tumana"],
    
    "Norzagaray": ["Bangkal", "Baraka", "Bigte", "Bitungol", "Friendship Village", "Lapu-lapu", "Matictic", "Minuyan", "Partida", "Pinagtulayan", "Poblacion", "San Mateo", "Santa Clara", "Tigbe"],
    
    "Doña Remedios Trinidad": ["Bayabas", "Kabayunan", "Kalawakan", "Camachin", "Pulong Sampalok"],
    
    "Baliwag": ["Bagong Nayon", "Barangca", "Calantipay", "Catulinan", "Concepcion", "Hinukay", "Makinabang", "Pagala", "Paliwas", "Piel", "Poblacion", "Sabang", "San Jose", "Santa Barbara", "Subic", "Sulivan", "Tangos", "Tarcan", "Tiaong", "Tibag", "Tilapayong", "Villa Vicenta"],
    
    "Pulilan": ["Balatong", "Dampol I", "Dampol II-A", "Dampol II-B", "Dulong Malabon", "Inaon", "Longos", "Lumbac", "Paltao", "Penabatan", "Poblacion", "Santo Cristo", "Taal", "Tibag", "Tinejero"]
  },

  "Pampanga": {
    // Cities
    "Angeles City": ["Agapito del Rosario", "Amsic", "Anunas", "Balibago", "Capaya", "Claro M. Recto", "Cuayan", "Cutcut", "Cutud", "Del Pilar", "Lourdes Northwest", "Lourdes Sur", "Margot", "Mining", "Pampang", "Pulung Cacutud", "Pulung Maragul", "Pulungbulu", "Salapungan", "San Jose", "San Nicolas", "Santa Teresita", "Santa Trinidad", "Santo Cristo", "Santo Domingo", "Santo Rosario", "Sapalibutad", "Sapangbato", "Tabun", "Virgen Delos Remedios"],
    
    "San Fernando": ["Alasas", "Baliti", "Bulaon", "Calulut", "Dela Paz Norte", "Dela Paz Sur", "Del Carmen", "Del Pilar", "Del Rosario", "Dolores", "Juliana", "Lara", "Lourdes", "Magliman", "Maimpis", "Malino", "Malpitic", "Pandaras", "Panipuan", "Quebiawan", "Saguin", "San Agustin", "San Felipe", "San Isidro", "San Jose", "San Juan", "San Nicolas", "San Pedro", "Santa Lucia", "Santa Teresita", "Santo Niño", "Santo Rosario", "Sindalan", "Telabastagan"],
    
    "Mabalacat": ["Atlu-Bola", "Bical", "Bundagul", "Cacutud", "Calumpang", "Camachiles", "Dapdap", "Dau", "Dolores", "Duquit", "Lakandula", "Mabiga", "Macapagal Village", "Mamatitang", "Mangalit", "Mawaque", "Poblacion", "Pulung Santol", "San Francisco", "San Joaquin", "Sapang Bato", "Sapang Biabas", "Saplad", "Tabun"],
    
    // Municipalities
    "Guagua": ["Ascomo", "Bancal", "Facundo", "Lambac", "Magsaysay", "Maquiapo", "Natividad", "Pangulo", "Plaza Burgos", "Poblacion", "Pulungmasle", "Rizal", "San Agustin", "San Antonio", "San Isidro", "San Jose", "San Juan Bautista", "San Juan Nepomuceno", "San Matias", "San Miguel", "San Nicolas 1st", "San Nicolas 2nd", "San Pablo", "San Pedro", "San Rafael", "San Roque", "San Vicente", "Santa Filomena", "Santa Ines", "Santo Niño", "Villaflor"],
    
    "Porac": ["Babo Pangulo", "Babo Sacan", "Balubad", "Calzadang Bayu", "Camias", "Cangatba", "Diaz", "Jalung", "Mancatian", "Manibaug Libutad", "Manibaug Paralaya", "Manibaug Pasig", "Manuali", "Mitla Proper", "Pias", "Pio", "Planas", "Poblacion", "Pulung Santol", "Salu", "Samaniego", "San Jose Mitla", "Santa Cruz", "Sepung Calzada", "Sinura", "Sula"],
    
    "Apalit": ["Balucuc", "Calantipe", "Cansinala", "Capalangan", "Colgante", "Paligui", "Sampaloc", "San Juan", "San Vicente", "Sucad", "Sulipan"],
    
    "Arayat": ["Arenas", "Batasan", "Buensuceso", "Candating", "Guemasan", "La Paz (Turu)", "Lacmit", "Lacquios", "Mangga-Cacutud", "Mapalad", "Paralaya", "Plazang Luma", "Poblacion", "San Agustin Norte", "San Agustin Sur", "San Antonio", "San Jose Mesulo", "San Juan Bano", "San Mateo", "San Nicolas", "San Roque Bitas", "Santo Niño Tabuan", "Suclayin", "Telapayong"],
    
    "Bacolor": ["Balas", "Calibutbut", "Camuning", "Concepcion", "Dolores", "Duat", "Macabacle", "Magliman", "Maliwalu", "Mesalipit", "Palihan", "Parulog", "Potrero", "San Antonio", "San Isidro", "San Vicente", "Sta. Barbara", "Sta. Ines", "Talba", "Tinajero"],
    
    "Candaba": ["Barangca", "Bahay Pare", "Buas", "Cuayang Bugtong", "Dalayap", "Dulong Ilog", "Magumbang Paligui", "Mandasig", "Mandili", "Manuk", "Paralaya", "Parulung Prado", "Pasig", "Poblacion", "San Agustin", "Santa Lucia", "Talang", "Tenejero", "Vizal San Pablo", "Vizal Santo Cristo", "Vizal Santo Niño"],
    
    "Floridablanca": ["Basa Air Base", "Bodega", "Carmel", "Del Carmen", "Gutad", "Nabuclod", "Paguiruan", "Palmayo", "San Antonio", "San Isidro", "San Jose", "San Nicolas", "San Pedro", "Santa Monica", "Santo Niño"],
    
    "Lubao": ["Balantacan", "Bancal Pugad", "Bancal Sinubli", "Baruya (San Rafael)", "Calangain", "De la Paz", "Lourdes", "Prado Siongco", "Remedios", "San Agustin", "San Antonio", "San Isidro", "San Jose Gumi", "San Juan", "San Matias", "San Miguel", "San Nicolas 1st", "San Nicolas 2nd", "San Pablo 1st", "San Pablo 2nd", "San Pedro Palcarangan", "San Pedro Saug", "Santa Barbara", "Santa Catalina", "Santa Cruz", "Santa Lucia 1st", "Santa Lucia 2nd", "Santa Maria", "Santa Monica", "Santa Rita", "Santa Teresa 1st", "Santa Teresa 2nd", "Santiago", "Santo Domingo", "Santo Tomas"],
    
    "Macabebe": ["Batasan", "Caduang Tete", "Castuli", "Consuelo", "Dalayap", "De la Paz", "Dungan", "Konkol", "Lacmit", "Lanang", "Manggang Marikit", "Mataguey", "Poblacion", "Pulung San Luis", "San Francisco", "San Isidro", "San Jose", "San Rafael", "Santa Lutgarda", "Santa Maria", "Santa Rita", "Santo Niño", "Santo Rosario"],
    
    "Masantol": ["Alauli", "Balibago", "Bebe Anac", "Bebe Matua", "Bulacus", "Cambasi", "Nigui", "Palimpe", "San Isidro", "San Nicolas", "San Pablo", "San Pedro", "Santa Lucia", "Santa Monica", "Santo Niño", "Sapang Kawayan", "Sexmoan"],
    
    "Mexico": ["Acli", "Anao", "Barangka", "Buenavista", "Camuning", "Cawayan", "Concepcion", "Culubasa", "Divisoria", "Dolores", "Gandus", "Lagundi", "Laput", "Laug", "Masamat", "Masangsang", "Pangatlan", "Panipuan", "Parian", "Poblacion", "San Antonio", "San Carlos", "San Jose Malino", "San Jose Matulid", "San Juan", "San Lorenzo", "San Miguel", "San Nicolas", "San Pablo", "San Patricio", "San Roque", "San Vicente", "Santa Cruz", "Santa Maria", "Santo Christo", "Santo Rosario", "Suclaban", "Tangle"],
    
    "Minalin": ["Bulac", "Dawe", "Labo", "Maniango", "San Francisco 1", "San Francisco 2", "San Nicolas", "San Pedro", "Santo Rosario", "Saplad Dalakit"],
    
    "Samal": ["San Antonio", "San Jose", "San Juan", "San Nicolas", "San Pedro", "San Roque", "Santa Lucia", "Santa Monica", "Santo Cristo", "Santo Niño", "Santo Rosario"],
    
    "Santa Ana": ["San Agustin", "San Bartolome", "San Isidro", "San Joaquin", "San Jose", "San Juan", "San Nicolas", "San Pablo", "San Pedro", "San Roque", "Santa Lucia", "Santo Rosario"],
    
    "Santa Rita": ["Becudang", "San Agustin", "San Basilio", "San Isidro", "San Jose", "San Juan", "San Vicente", "Santa Monica"],
    
    "Santo Tomas": ["Moras de la Paz", "Poblacion", "San Bartolome", "San Matias", "San Vicente", "Santo Rosario"],
    
    "Magalang": ["Bucanan", "Camias", "Dolores", "La Paz", "Navaling", "Poblacion", "San Agustin", "San Francisco", "San Ildefonso", "San Nicolas", "San Pablo", "San Pedro", "Santa Cruz", "Santo Niño", "Santo Rosario"],
    
    "Sta. Ana": ["San Agustin", "San Bartolome", "San Isidro", "San Joaquin", "San Jose", "San Juan", "San Nicolas", "San Pablo", "San Pedro", "San Roque", "Santa Lucia", "Santo Rosario"]
  },

  "Zambales": {
    // Cities
    "Olongapo": ["Asinan Poblacion", "Asinan Proper", "Banicain", "Barretto", "East Bajac-Bajac", "East Tapinac", "Gordon Heights", "Kalaklan", "Mabayuan", "New Cabalan", "New Ilalim", "New Kababae", "New Kalalake", "Old Cabalan", "Pag-asa", "Santa Rita", "West Bajac-Bajac", "West Tapinac"],
    
    // Municipalities
    "Iba": ["Amungan", "Bangantalinga", "Dirita-Baloguen", "Lipay-Dingin-Panibuatan", "Palanginan", "San Agustin", "Santa Barbara", "Santo Rosario", "Zone 1 Poblacion", "Zone 2 Poblacion", "Zone 3 Poblacion", "Zone 4 Poblacion", "Zone 5 Poblacion", "Zone 6 Poblacion"],
    
    "Botolan": ["Bangan", "Batonlapoc", "Belbel", "Beneg", "Binuclutan", "Capayawan", "Carael", "Danacbunga", "Maguisguis", "Malomboy", "Moraza", "Owaog-Nibloc", "Paco (Pob.)", "Palis", "Parel", "Paudpod", "Porac", "Poonbato", "San Isidro", "San Juan", "San Miguel", "Taugtog", "Villar", "Bancal"],
    
    "Cabangan": ["Aglao", "Cadiguinan", "Casabaan", "Concordia", "Del Pilar", "Felmida-Diaz", "Lomboy", "Luo", "New San Juan", "Panan", "Paite", "Paudpod", "Poblacion", "San Isidro", "Santa Rita", "Taugtog"],
    
    "Candelaria": ["Apo Apat", "Babancal", "Bacong", "Bambang", "Binabalian", "Bulawen", "Catol", "Dampay", "Libertador", "Maasin", "Malimanga", "Poblacion", "San Isidro", "Santa Cruz", "Sinabacan", "Taposo", "Uacon"],
    
    "Castillejos": ["Balaybay", "Del Pilar", "Looc", "Magsaysay", "Nagbunga", "Nagbayan", "Poblacion", "San Agustin", "San Juan", "San Jose", "San Nicolas", "San Roque", "Santa Maria", "Santo Tomas"],
    
    "Masinloc": ["Baloganon", "Bamban", "Banaag", "Collat", "Inhobol", "Lipay", "Poblacion", "San Lorenzo", "San Salvador", "Santa Monica", "Taltal", "Tapuac"],
    
    "Palauig": ["Alwa", "Bato", "Bulawen", "Cauyan", "East Poblacion", "Garreta", "Laoag", "Libaba", "Liozon", "Lipay", "Macarang", "Pangolingan", "Salaza", "San Juan", "Santo Niño", "Tition", "Tinabacan", "Villacorta", "West Poblacion"],
    
    "San Antonio": ["Antipolo", "Bano", "Burgos", "Causip", "Haway-Haway", "Lucapon North", "Lucapon South", "Luna", "Lumibao", "Nagbayan", "Paite", "Palis", "Pandaquit", "Poblacion", "Pundaquit", "San Gregorio", "San Juan", "San Miguel", "San Pablo", "Santa Rita", "Villar"],
    
    "San Felipe": ["Amagna", "Apostol", "Balincaguing", "Farañal", "Feria", "Maloma", "Mangompisang", "Poblacion", "Rosete", "San Rafael"],
    
    "San Marcelino": ["Aglao", "Buhawen", "Central", "Consuelo Norte", "Consuelo Sur", "La Paz", "Linusungan", "Lucero", "Locloc", "Poblacion", "Rabanes", "San Guillermo", "Santa Fe", "Santo Niño"],
    
    "San Narciso": ["Aliwanag", "Beddeng", "Dallipawen", "La Paz", "Namatacan", "Omaya", "Patrocinio", "Poblacion", "San Pascual", "Siminublan", "Sitio Baño"],
    
    "Santa Cruz": ["Bolitoc", "Calsib", "Candelaria", "Guisguis", "Lambingan", "Lipay", "Lomboy", "Lucero", "Mabini", "Malabago", "Naulo", "Pagatpat", "Poblacion East", "Poblacion West", "San Fernando", "Sangalang", "Santo Tomas", "Tubo-tubo"],
    
    "Subic": ["Aningway Sacatihan", "Asinan Poblacion", "Asinan Proper", "Baraca-Camachile", "Cawag", "Calapandayan", "Ilwas", "Mangan-Vaca", "Matain", "Naugsol", "Pamatawan", "San Isidro", "Santo Tomas", "Wawandue (Rizal)"]
  },

  "Rizal": {
    // Cities
    "Antipolo": ["Bagong Nayon", "Beverly Hills", "Calawis", "Cupang", "Dalig", "Dela Paz", "Inarawan", "Mambugan", "Mayamot", "Mountain View", "Muntingdilaw", "Poblacion", "San Isidro", "San Jose", "San Juan", "San Luis", "San Roque", "Santa Cruz", "Santo Niño", "Valley Golf"],
    
    // Municipalities
    "Angono": ["Bagumbayan", "Kalayaan", "Mahabang Parang", "Poblacion Ibaba", "Poblacion Itaas", "San Isidro", "San Pedro", "San Roque", "San Vicente", "Santo Niño"],
    
    "Baras": ["Concepcion", "Evangelista", "Mabini", "Pinugay", "Rizal", "San Jose", "San Juan", "San Miguel", "San Salvador", "Santiago"],
    
    "Binangonan": ["Bangad", "Batingan", "Bilibiran", "Binitagan", "Bisaya", "Calumpang", "Darangan", "Ginoong Sanay", "Gulod", "Habagatan", "Ithan", "Janosa", "Kalawaan", "Kalinawan", "Kasile", "Kaytome", "Kinaboogan", "Layunan", "Libid", "Libis", "Lunsad", "Macamot", "Mahabang Parang", "Malakban", "Mambog", "Manggahan", "Maningning Kagalingan", "Palangoy", "Pantok", "Pila-Pila", "Pipindan", "Poblacion", "Rayap", "Sabang", "San Carlos", "Taktak", "Tatala", "Tayuman", "Tunggahan"],
    
    "Cainta": ["Dayap", "San Andres", "San Isidro", "San Juan", "San Roque", "Santa Rosa"],
    
    "Cardona": ["Boor", "Calahan", "Dalig", "Del Remedio", "Iglesia", "Lambac", "Looc", "Malanggam", "Nagsulo", "Natu", "Patunhay", "Poblacion", "Real", "San Roque", "Subay", "Taculing"],
    
    "Jalajala": ["Bagumbong", "Bayugo", "Lubo", "Paalaman", "Palaypalay", "Poblacion", "Punta", "Second District", "Sipsipin", "Special District (poblacion)", "Tubuan"],
    
    "Morong": ["Bombongan", "Lagundi", "Maybancal", "Pandan", "San Guillermo", "San Jose", "San Juan", "San Pedro", "Santo Angel"],
    
    "Pililla": ["Bagumbayan", "Halayhayin", "Hulo", "Imatong", "Malaya", "Niogan", "Pili", "Quisao", "Wawa"],
    
    "Rodriguez": ["Balite", "Burgos", "Geronimo", "Macabud", "Manggahan", "Mascap", "Montalban Poblacion", "Puray", "Rosario", "San Isidro", "San Jose", "San Rafael"],
    
    "San Mateo": ["Ampid I", "Ampid II", "Banaba", "Dulong Bayan", "Dulongbayan Proper", "Guitnangbayan I", "Guitnangbayan II", "Malanday", "Maly", "Pintong Bocaue", "Santa Ana", "Silangan"],
    
    "Tanay": ["Alansi", "Cuyambay", "Laiban", "Mag-Ampon", "Poblacion", "Sampaloc", "San Andres", "San Isidro", "Santa Ines", "Tandang Kutyo"],
    
    "Taytay": ["Dolores", "Muzon", "San Isidro", "San Juan", "Santa Ana"],
    
    "Teresa": ["Bagumbayan", "Calumpang", "Dalig", "Dulumbayan", "May-Iba", "Poblacion", "Prinza", "San Gabriel", "San Roque"]
  },

  "Cavite": {
    // Cities
    "Bacoor": ["Alima", "Aniban I", "Aniban II", "Aniban III", "Aniban IV", "Aniban V", "Banalo", "Bayanan", "Buhay na Tubig", "Camposanto", "Campo Santo", "Daang Bukid", "Digman", "Dulong Bayan", "Habay I", "Habay II", "Kaingin", "Ligas I", "Ligas II", "Ligas III", "Longos", "Maliksi I", "Maliksi II", "Maliksi III", "Mambog I", "Mambog II", "Mambog III", "Mambog IV", "Mambog V", "Molino I", "Molino II", "Molino III", "Molino IV", "Molino V", "Molino VI", "Molino VII", "Niog I", "Niog II", "Niog III", "Panapaan I", "Panapaan II", "Panapaan III", "Panapaan IV", "Panapaan V", "Panapaan VI", "Panapaan VII", "Panapaan VIII", "Queens Row Central", "Queens Row East", "Queens Row West", "Real I", "Real II", "Salinas I", "Salinas II", "Salinas III", "Salinas IV", "San Nicolas I", "San Nicolas II", "San Nicolas III", "Sineguelasan", "Tabing Dagat", "Talaba I", "Talaba II", "Talaba III", "Talaba IV", "Talaba V", "Talaba VI", "Talaba VII", "Zapote I", "Zapote II", "Zapote III", "Zapote IV", "Zapote V"],
    
    "Cavite City": ["Barangay 1", "Barangay 2", "Barangay 3", "Barangay 4", "Barangay 5", "Barangay 6", "Barangay 7", "Barangay 8", "Barangay 9", "Barangay 10", "Barangay 11", "Barangay 12", "Barangay 13", "Barangay 14", "Barangay 15", "Barangay 16", "Barangay 17", "Barangay 18", "Barangay 19", "Barangay 20", "Barangay 21", "Barangay 22", "Barangay 23", "Barangay 24", "Barangay 25", "Barangay 26", "Barangay 27", "Barangay 28", "Barangay 29", "Barangay 30", "Barangay 31", "Barangay 32", "Barangay 33", "Barangay 34", "Barangay 35", "Barangay 36", "Barangay 37", "Barangay 38", "Barangay 39", "Barangay 40", "Barangay 41", "Barangay 42", "Barangay 43", "Barangay 44", "Barangay 45", "Barangay 46", "Barangay 47", "Barangay 48", "Barangay 49", "Barangay 50", "Barangay 51", "Barangay 52", "Barangay 53", "Barangay 54", "Barangay 55", "Barangay 56", "Barangay 57", "Barangay 58", "Barangay 59", "Barangay 60", "Barangay 61", "Barangay 62", "Barangay 63", "Barangay 64", "Barangay 65", "Barangay 66", "Barangay 67", "Barangay 68", "Barangay 69", "Barangay 70", "Barangay 71", "Barangay 72", "Barangay 73", "Barangay 74", "Barangay 75", "Barangay 76", "Barangay 77", "Barangay 78", "Barangay 79", "Barangay 80", "Barangay 81", "Barangay 82", "Barangay 83", "Barangay 84", "Barangay 85", "Barangay 86", "Barangay 87", "Barangay 88", "Barangay 89"],
    
    "Dasmariñas": ["Bagong Bayan I-A", "Bagong Bayan I-B", "Bagong Bayan II", "Bagong Bayan III", "Burol I", "Burol II", "Burol III", "Emmanuel Bergado I", "Emmanuel Bergado II", "Fatima I", "Fatima II", "Fatima III", "Langkaan I", "Langkaan II", "Luzviminda I", "Luzviminda II", "Paliparan I", "Paliparan II", "Paliparan III", "Salawag", "Salitran I", "Salitran II", "Salitran III", "Salitran IV", "Sampaloc I", "Sampaloc II", "Sampaloc III", "Sampaloc IV", "Sampaloc V", "San Agustin I", "San Agustin II", "San Agustin III", "San Andres I", "San Andres II", "San Antonio de Padua I", "San Antonio de Padua II", "San Dionisio", "San Esteban", "San Isidro I", "San Isidro II", "San Jose", "San Lorenzo Ruiz I", "San Lorenzo Ruiz II", "San Luis I", "San Luis II", "San Manuel I", "San Manuel II", "San Mateo", "San Miguel I", "San Miguel II", "San Nicolas I", "San Nicolas II", "San Roque", "San Simon", "Santa Cristina I", "Santa Cristina II", "Santa Cruz I", "Santa Cruz II", "Santa Fe", "Santa Lucia", "Santo Cristo", "Santo Niño I", "Santo Niño II", "Sukol", "Victoria Reyes", "Zone I (Pob.)", "Zone II (Pob.)", "Zone III (Pob.)", "Zone IV (Pob.)"],
    
    "General Trias": ["Alingaro", "Arnaldo", "Bacao I", "Bacao II", "Bagumbayan", "Biclatan", "Buenavista I", "Buenavista II", "Buenavista III", "Corregidor", "Dulong Bayan", "Governor Ferrer", "Javalera", "Manggahan", "Navarro", "Ninety Sixth", "Panungyanan", "Pasong Camachile I", "Pasong Camachile II", "Pasong Kawayan I", "Pasong Kawayan II", "Pinagtipunan", "Prinza", "Sampalucan", "San Francisco", "San Gabriel", "San Juan I", "San Juan II", "Santa Clara", "Santiago", "Tapia", "Tejero", "Vibora"],
    
    "Imus": ["Alapan I-A", "Alapan I-B", "Alapan I-C", "Alapan II-A", "Alapan II-B", "Anabu I-A", "Anabu I-B", "Anabu I-C", "Anabu I-D", "Anabu I-E", "Anabu I-F", "Anabu I-G", "Anabu II-A", "Anabu II-B", "Anabu II-C", "Anabu II-D", "Anabu II-E", "Anabu II-F", "Bagong Silang", "Bayan Luma I", "Bayan Luma II", "Bayan Luma III", "Bayan Luma IV", "Bayan Luma IX", "Bayan Luma V", "Bayan Luma VI", "Bayan Luma VII", "Bayan Luma VIII", "Bucandala I", "Bucandala II", "Bucandala III", "Bucandala IV", "Bucandala V", "Buhay na Tubig", "Carsadang Bago I", "Carsadang Bago II", "Covelandia", "Epza I-A", "Epza I-B", "Epza I-C", "Magdalo", "Maharlika", "Malagasang I-A", "Malagasang I-B", "Malagasang I-C", "Malagasang I-D", "Malagasang I-E", "Malagasang I-F", "Malagasang I-G", "Malagasang II-A", "Malagasang II-B", "Malagasang II-C", "Malagasang II-D", "Malagasang II-E", "Malagasang II-F", "Malagasang II-G", "Mariano Espeleta I", "Mariano Espeleta II", "Mariano Espeleta III", "Medicion I-A", "Medicion I-B", "Medicion I-C", "Medicion I-D", "Medicion II-A", "Medicion II-B", "Medicion II-C", "Medicion II-D", "Medicion II-E", "Medicion II-F", "Palico I", "Palico II", "Palico III", "Palico IV", "Pasong Buaya I", "Pasong Buaya II", "Pinagbuklod", "Poblacion I-A", "Poblacion I-B", "Poblacion I-C", "Poblacion II-A", "Poblacion II-B", "Poblacion III-A", "Poblacion III-B", "Poblacion IV-A", "Poblacion IV-B", "Poblacion IV-C", "Poblacion IV-D", "Pulo", "Tanzang Luma I", "Tanzang Luma II", "Tanzang Luma III", "Tanzang Luma IV", "Tanzang Luma V", "Tanzang Luma VI", "Toclong I-A", "Toclong I-B", "Toclong I-C", "Toclong II-A", "Toclong II-B"],
    
    "Tagaytay": ["Asisan", "Bagong Tubig", "Calabuso", "Dapdap East", "Dapdap West", "Francisco", "Guinhawa North", "Guinhawa South", "Iruhin Central", "Iruhin East", "Iruhin South", "Iruhin West", "Kaybagal Central", "Kaybagal North", "Kaybagal South", "Mag-asawang Ilat", "Maharlika East", "Maharlika West", "Maitim 2nd Central", "Maitim 2nd East", "Maitim 2nd West", "Mendez Crossing East", "Mendez Crossing West", "Neogan", "Patutong Malaki North", "Patutong Malaki South", "Sambong", "San Jose", "Silang Crossing East", "Silang Crossing West", "Sungay East", "Sungay West", "Tolentino East", "Tolentino West", "Zambal"],
    
    "Trece Martires": ["Aguado", "Cabezas", "Cabuco", "De Ocampo", "Inocencio", "Lallana", "Lapidario", "Luciano", "Osorio", "Perez", "Quintero", "Reyes", "San Agustin"],
    
    // Municipalities
    "Alfonso": ["Amuyong", "Barangay I (Pob.)", "Barangay II (Pob.)", "Barangay III (Pob.)", "Barangay IV (Pob.)", "Buck Estate", "Kaysuyo", "Luksuhin", "Marahan I", "Marahan II", "Matagbak I", "Matagbak II", "Pajo", "Sikat", "Sulsugin", "Taywanak"],
    
    "Amadeo": ["Banaybanay", "Barangay I (Pob.)", "Barangay II (Pob.)", "Barangay III (Pob.)", "Barangay IV (Pob.)", "Barangay V (Pob.)", "Barangay VI (Pob.)", "Barangay VII (Pob.)", "Barangay VIII (Pob.)", "Bucal", "Buho", "Dagatan", "Halang", "Loma", "Maymangga", "Minantok", "Pangil", "Salaban", "Talon", "Tohang"],
    
    "Carmona": ["Barangay 1 (Pob.)", "Barangay 2 (Pob.)", "Barangay 3 (Pob.)", "Barangay 4 (Pob.)", "Barangay 5 (Pob.)", "Bancal", "Cabilang Baybay", "Lantic", "Mabuhay", "Maduya", "Milagrosa", "Real"],
    
    "General Emilio Aguinaldo": ["Batas Dao", "Kaymisas", "Kabulusan", "Kaypaaba", "Lumipa", "Poblacion I", "Poblacion II", "Poblacion III", "Poblacion IV", "Tabora"],
    
    "Indang": ["Agus-us", "Alulod", "Banaba Cerca", "Banaba Lejos I", "Banaba Lejos II", "Bancod", "Buna Cerca", "Buna Lejos I", "Buna Lejos II", "Calumpang Cerca", "Calumpang Lejos I", "Calumpang Lejos II", "Carasuchi", "Daine I", "Daine II", "Guyam Malaki", "Guyam Munti", "Harasan", "Kayquit I", "Kayquit II", "Kayquit III", "Limbon", "Lumampong Balagbag", "Lumampong Halayhay", "Mahabangkahoy Cerca", "Mahabangkahoy Lejos", "Mataas na Lupa", "Pulo", "Tambo Balagbag", "Tambo Ilaya", "Tambo Malaki", "Tambo Kulit"],
    
    "Kawit": ["Balsahan-Bisita", "Binakayan-Aplaya", "Binakayan-Kanluran", "Congbalay-Legaspi", "Gahak", "Kaingen", "Magdalo (Putol)", "Manggahan-Lawin", "Marulas", "Panamitan", "Poblacion", "Pulvorista", "San Sebastian", "Santa Isabel", "Tabon I", "Tabon II", "Tabon III", "Toclong", "Tramo-Bantayan", "Wakas I", "Wakas II"],
    
    "Magallanes": ["Barangay 1", "Barangay 2", "Barangay 3", "Barangay 4", "Barangay 5", "Barangay 6", "Barangay 7", "Barangay 8", "Barangay 9", "Barangay 10", "Barangay 11", "Barangay 12", "Barangay 13", "Barangay 14", "Barangay 15", "Barangay 16"],
    
    "Maragondon": ["Bagong Buhay I", "Bagong Buhay II", "Bagong Buhay III", "Balayungan", "Bucal I", "Bucal II", "Bucal III-A", "Bucal III-B", "Bucal IV-A", "Bucal IV-B", "Caingin", "Garita I", "Garita II", "Layong Mabilog", "Mabato", "Pantihan I", "Pantihan II", "Pantihan III", "Patungan", "Pinagsanhan", "Poblacion I-A", "Poblacion I-B", "Poblacion II-A", "Poblacion II-B", "Poblacion III-A", "Poblacion III-B", "San Miguel I-A", "San Miguel I-B", "San Miguel II-A", "San Miguel II-B", "Talipusngo", "Tulay Silangan", "Tulay Kanluran"],
    
    "Mendez": ["Anuling Cerca I", "Anuling Cerca II", "Anuling Lejos I", "Anuling Lejos II", "Banilad", "Galicia I", "Galicia II", "Galicia III", "Miguel Mojica", "Panungyan I", "Panungyan II", "Poblacion I", "Poblacion II", "Poblacion III"],
    
    "Naic": ["Bagong Kalsada", "Balsahan", "Bancaan", "Bucana Malaki", "Bucana Sasahan", "Capt. C. Nazareno (Pob.)", "Calubcob", "Gomez-Zamora (Pob.)", "Halang", "Humbac", "Ibayo Estacion", "Ibayo Silangan", "Kanluran", "Labac", "Latoria", "Mabolo", "Main", "Makina", "Malainen Bago", "Malainen Luma", "Molino", "Muzon", "Palangue Central", "Palangue Habog", "Palangue Saguin", "Sabang", "Santulan", "Sapa", "Timalan Balsahan", "Timalan Concepcion"],
    
    "Noveleta": ["Magdiwang", "Poblacion", "Salcedo I", "Salcedo II", "San Antonio I", "San Antonio II", "San Jose I", "San Jose II", "San Juan I", "San Juan II", "San Rafael I", "San Rafael II", "San Rafael III", "San Rafael IV", "Santa Rosa I", "Santa Rosa II"],
    
    "Rosario": ["Bagbag I", "Bagbag II", "Kanluran", "Ligtong I", "Ligtong II", "Ligtong III", "Ligtong IV", "Muzon I", "Muzon II", "Poblacion", "Salinas I", "Salinas II", "Salinas III", "Salinas IV", "Sapa I", "Sapa II", "Sapa III", "Sapa IV", "Tejeros Convention", "Wawa I", "Wawa II", "Wawa III"],
    
    "Silang": ["Acacia", "Anahaw I", "Anahaw II", "Balite I", "Balite II", "Balite III", "Batas", "Biga I", "Biga II", "Biluso", "Bucal", "Bunga", "Cahil I", "Cahil II", "Carmen", "Hukay", "Iba", "Inchican", "Ipil I", "Ipil II", "Kaong", "Katigan I", "Katigan II", "Lalaan I", "Lalaan II", "Litlit", "Lucsuhin", "Lumil", "Maguyam", "Malabag", "Mataas na Burol", "Mendez Crossing East", "Mendez Crossing West", "Narra I", "Narra II", "Narra III", "Paligawan", "Pasong Langka", "Poblacion I", "Poblacion II", "Poblacion III", "Pooc I", "Pooc II", "Pook ni Banal", "Pulong Bunga", "Pulong Saging", "Sabutan", "San Miguel I", "San Miguel II", "San Vicente I", "San Vicente II", "Santol", "Tartaria", "Tibatib", "Tibig", "Toledo", "Tubuan I", "Tubuan II", "Tubuan III", "Ulat", "Yakal"],
    
    "Tanza": ["Amaya I", "Amaya II", "Amaya III", "Amaya IV", "Amaya V", "Amaya VI", "Amaya VII", "Bagtas", "Biga", "Biwas", "Bucal", "Bunga", "Calibuyo", "Capipisa", "Daang Amaya I", "Daang Amaya II", "Daang Amaya III", "Hukay", "Julugan I", "Julugan II", "Julugan III", "Julugan IV", "Julugan V", "Julugan VI", "Julugan VII", "Julugan VIII", "Lambingan", "Mulawin", "Paradahan I", "Paradahan II", "Punta I", "Punta II", "Sahud Ulan", "Sanja Mayor", "Santol", "Tanauan", "Tres Cruses"],
    
    "Ternate": ["Barangay 1", "Barangay 2", "Barangay 3", "Barangay 4", "Barangay 5", "Barangay 6", "Barangay 7", "Barangay 8", "Barangay 9", "Barangay 10", "Barangay 11", "Barangay 12", "Barangay 13", "Barangay 14", "Barangay 15", "Barangay 16", "Barangay 17"]
  },

  "Laguna": {
    // Cities
    "Biñan": ["Bungahan", "Canlalay", "Casile", "De La Paz", "Ganado", "Langkiwa", "Loma", "Malaban", "Malamig", "Mampalasan", "Platero", "Poblacion", "San Antonio", "San Francisco", "San Jose", "San Vicente", "Santo Domingo", "Santo Niño", "Santo Tomas", "Soro-soro", "Sto. Tomas", "Timbao", "Zapote"],
    
    "Cabuyao": ["Banaybanay", "Barangay Uno", "Barangay Dos", "Barangay Tres", "Bigaa", "Butong", "Casile", "Diezmo", "Gulod", "Mamatid", "Marinig", "Niugan", "Pittland", "Pulo", "Sala", "San Isidro", "Barangay Uno", "Barangay Dos", "Barangay Tres"],
    
    "Calamba": ["Bagong Kalsada", "Banadero", "Banlic", "Barandal", "Batino", "Burol", "Camaligan", "Canlubang", "Halang", "Hornos", "Kay-Anlog", "La Mesa", "Laguerta", "Lawa", "Lecheria", "Lingga", "Looc", "Mabato", "Majada Labas", "Makiling", "Mapagong", "Masili", "Maunong", "Mayapa", "Milagrosa (Tulo)", "Paciano Rizal", "Palingon", "Palo-Alto", "Pansol", "Parian", "Poblacion (Barangay 1)", "Poblacion (Barangay 2)", "Poblacion (Barangay 3)", "Poblacion (Barangay 4)", "Poblacion (Barangay 5)", "Poblacion (Barangay 6)", "Poblacion (Barangay 7)", "Punta", "Puting Lupa", "Real", "Saimsim", "Sampiruhan", "San Cristobal", "San Jose", "San Juan", "Sirang Lupa", "Sucol", "Turbina", "Ulango", "Uwisan"],
    
    "San Pablo": ["Barangay I-A (Pob.)", "Barangay I-B (Pob.)", "Barangay II-A (Pob.)", "Barangay II-B (Pob.)", "Barangay II-C (Pob.)", "Barangay II-D (Pob.)", "Barangay II-E (Pob.)", "Barangay II-F (Pob.)", "Barangay III-A (Pob.)", "Barangay III-B (Pob.)", "Barangay III-C (Pob.)", "Barangay III-D (Pob.)", "Barangay III-E (Pob.)", "Barangay III-F (Pob.)", "Barangay IV-A (Pob.)", "Barangay IV-B (Pob.)", "Barangay IV-C (Pob.)", "Barangay V-A (Pob.)", "Barangay V-B (Pob.)", "Barangay V-C (Pob.)", "Barangay V-D (Pob.)", "Barangay VI-A (Pob.)", "Barangay VI-B (Pob.)", "Barangay VI-C (Pob.)", "Barangay VI-D (Pob.)", "Barangay VI-E (Pob.)", "Barangay VII-A (Pob.)", "Barangay VII-B (Pob.)", "Barangay VII-C (Pob.)", "Barangay VII-D (Pob.)", "Barangay VII-E (Pob.)", "Atisan", "Bautista", "Concepcion", "Del Remedio", "Dolores", "San Antonio 1", "San Antonio 2", "San Bartolome", "San Buenaventura", "San Crispin", "San Cristobal", "San Diego", "San Francisco", "San Gabriel", "San Gregorio", "San Ignacio", "San Isidro", "San Joaquin", "San Jose", "San Juan", "San Lorenzo", "San Lucas 1", "San Lucas 2", "San Marcos", "San Mateo", "San Miguel", "San Nicolas", "San Pedro", "San Rafael", "San Roque", "San Vicente", "Santa Ana", "Santa Catalina", "Santa Cruz", "Santa Elena", "Santa Felomina", "Santa Isabel", "Santa Maria", "Santa Maria Magdalena", "Santa Monica", "Santa Veronica", "Santiago I", "Santiago II", "Santisimo Rosario", "Santo Angel", "Santo Cristo", "Santo Niño", "Soledad"],
    
    "San Pedro": ["Bagong Silang", "Cuyab", "Calendola", "Chrysanthemum", "Estrella", "Fatima", "G.S.I.S.", "Landayan", "Langgam", "Laram", "Magsaysay", "Maharlika", "Narra", "Nueva", "Pacita I", "Pacita II", "Poblacion", "Riverside", "Rosario", "Sampaguita Village", "San Antonio", "San Lorenzo Ruiz", "San Roque", "San Vicente", "Santo Niño", "United Bayanihan", "United Better Living"],
    
    "Santa Rosa": ["Aplaya", "Balibago", "Caingin", "Dila", "Dita", "Don Jose", "Ibaba", "Kanluran", "Labas", "Macabling", "Malitlit", "Malusak", "Market Area", "Pooc", "Pulong Santa Cruz", "Sinalhan", "Tagapo"],
    
    // Municipalities
    "Alaminos": ["Barangay I (Pob.)", "Barangay II (Pob.)", "Barangay III (Pob.)", "Barangay IV (Pob.)", "Del Carmen", "Palma", "San Agustin", "San Andres", "San Benito", "San Gregorio", "San Ildefonso", "San Juan", "San Miguel", "San Roque", "Santa Rosa"],
    
    "Bay": ["Bitin", "Calo", "Dila", "Masaya", "Paciano Rizal", "Puypuy", "San Antonio", "San Isidro", "Santa Cruz", "Santo Domingo", "Tagumpay", "Tranca"],
    
    "Calauan": ["Balayhangin", "Bangyas", "Dayap", "Hanggan", "Imok", "Lamot 1", "Lamot 2", "Mabacan", "Masiit", "Paliparan", "Perez", "Prinza", "San Isidro", "Santo Tomas"],
    
    "Cavinti": ["Anglas", "Bangco", "Bukal", "Bulajo", "Cansuso", "Duhat", "Inao-Awan", "Kanluran Talaongan", "Labayo", "Layasin", "Lumot", "Mahipon", "Paowin", "Poblacion", "Sisilmin", "Silangan Talaongan", "Sumucab", "Tibatib", "Udia"],
    
    "Famy": ["Asana", "Bacong-Sigsigan", "Bagong Pag-Asa (Pob.)", "Balitoc", "Banaba (Pob.)", "Batuhan", "Bulihan", "Caballero (Pob.)", "Calumpang (Pob.)", "Cuebang Bato", "Damayan (Pob.)", "Kataypuanan", "Kapatalan", "Liyang", "Maate", "Magdalo (Pob.)", "Mayatba", "Minayutan", "Salangbato", "Tunhak"],
    
    "Kalayaan": ["Longos", "San Antonio", "San Juan (Pob.)"],
    
    "Liliw": ["Bagong Anyo (Pob.)", "Bayate", "Bongkol", "Bubukal", "Culoy", "Dagatan", "Daniw", "Dita", "Ibabang Palina", "Ibabang San Roque", "Ibabang Sungi", "Ibabang Taykin", "Ilayang Palina", "Ilayang San Roque", "Ilayang Sungi", "Ilayang Taykin", "Kanlurang Bukal", "Laguan", "Luquin", "Malabo-Kalantukan", "Masikap (Pob.)", "Maslun (Pob.)", "Mojon", "Novaliches", "Oples", "Pag-asa (Pob.)", "Palayan", "Rizal (Pob.)", "San Isidro", "Silangang Bukal", "Tuy-Baanan"],
    
    "Los Baños": ["Años", "Bagong Silang", "Bambang", "Batong Malake", "Baybayin", "Bayog", "Lalakay", "Maahas", "Malinta", "Mayondon", "Putho-Tuntungin", "San Antonio", "Tadlac", "Timugan"],
    
    "Luisiana": ["Barangay Zone I (Pob.)", "Barangay Zone II (Pob.)", "Barangay Zone III (Pob.)", "Barangay Zone IV (Pob.)", "Barangay Zone V (Pob.)", "Barangay Zone VI (Pob.)", "Barangay Zone VII (Pob.)", "Barangay Zone VIII (Pob.)", "De La Paz", "San Antonio", "San Buenaventura", "San Diego", "San Isidro", "San Jose", "San Juan", "San Luis", "San Pablo", "San Pedro", "San Rafaél", "San Roque", "San Salvador", "Santo Domingo", "Santo Tomas"],
    
    "Lumban": ["Bagong Silang", "Balimbingan (Pob.)", "Balubad", "Caliraya", "Concepcion", "Lewin", "Maracta (Pob.)", "Maytalang I", "Maytalang II", "Primera Parang (Pob.)", "Primera Pulo (Pob.)", "Salac (Pob.)", "Santo Niño (Pob.)", "Segunda Parang (Pob.)", "Segunda Pulo (Pob.)", "Wawa"],
    
    "Mabitac": ["Amuyong", "Bayanihan (Pob.)", "Lambac (Pob.)", "Libis ng Nayon (Pob.)", "Lucong", "Maligaya (Pob.)", "Masikap (Pob.)", "Matalatala", "Nanguma", "Numero", "Pag-asa (Pob.)", "Pangil", "Poblacion", "San Antonio", "San Miguel", "Sinagtala"],
    
    "Magdalena": ["Alipit", "Baanan", "Balanac", "Bucal", "Buenavista", "Bungkol", "Buo", "Burlungan", "Cigaras", "Halayhayin", "Ibabang Atingay", "Ibabang Butnong", "Ilayang Atingay", "Ilayang Butnong", "Ilog", "Malaking Ambling", "Malinao", "Maravilla", "Munting Ambling", "Poblacion", "Sabang", "Salasad", "Tanawan", "Tipunan"],
    
    "Majayjay": ["Amonoy", "Bakia", "Balanac", "Balayong", "Banilad", "Banti", "Bitaoy", "Bukal", "Burgos", "Burol", "Coralao", "Gagalot", "Ibabang Banga", "Ibabang Bayucain", "Ilayang Banga", "Ilayang Bayucain", "Isabang", "Malinao", "May-It", "Munting Kawayan", "Olla", "Oobi", "Origuel (Pob.)", "Panalaban", "Pangil", "Panglan", "Piit", "Pook", "Rizal", "San Francisco (Pob.)", "San Miguel (Pob.)", "San Roque", "Santa Catalina (Pob.)", "Suba", "Talortor", "Tanawan", "Taytay"],
    
    "Nagcarlan": ["Abo", "Alibungbungan", "Alumbrado", "Balayong", "Balimbing", "Balinacon", "Bamban", "Banago", "Banca-banca", "Bangcuro", "Banilad", "Bayaquitos", "Buboy", "Buenavista", "Buhanginan", "Bukal", "Bunga", "Cabuyew", "Calumpang", "Kanluran Kabubuhayan", "Kanluran Lazaan", "Labangan", "Lawaguin", "Maiit", "Malaya", "Malinao", "Manaol", "Maravilla", "Nagcalbang", "Oples", "Palayan", "Palina", "Poblacion I (Barangay I)", "Poblacion II (Barangay II)", "Poblacion III (Barangay III)", "Sabang", "San Francisco", "Santa Lucia", "Sibulan", "Silangan Ilaya", "Silangan Kabubuhayan", "Silangan Lazaan", "Sinipian", "Sulsuguin", "Talahib", "Talangan", "Taytay", "Tipacan", "Wakat", "Yukos"],
    
    "Paete": ["Bagumbayan (Pob.)", "Bangkusay (Pob.)", "Ermita (Pob.)", "Ibaba del Norte (Pob.)", "Ibaba del Sur (Pob.)", "Ilaya del Norte (Pob.)", "Ilaya del Sur (Pob.)", "Maytoong (Pob.)", "Quinale (Pob.)"],
    
    "Pagsanjan": ["Anibong", "Barangay I (Pob.)", "Barangay II (Pob.)", "Biñan", "Buboy", "Cabanbanan", "Calusiche", "Dingin", "Lambac", "Layugan", "Magdapio", "Maulawin", "Pinagsanjan", "Sabang", "Sampaloc", "San Isidro"],
    
    "Pakil": ["Banilan", "Baño (Pob.)", "Burgos (Pob.)", "Casa Real", "Casinsin", "Dorado", "Gonzales (Pob.)", "Kabulusan", "Matikiw", "Rizal (Pob.)", "Saray", "Taft (Pob.)", "Tavera (Pob.)"],
    
    "Pangil": ["Balian", "Dambo", "Galalan", "Isla (Pob.)", "Mabato-Azufre", "Natividad (Pob.)", "San Jose (Pob.)", "Sulib", "Balayong"],
    
    "Pila": ["Aplaya", "Bagong Pook", "Bukal", "Bulilan Norte (Pob.)", "Bulilan Sur (Pob.)", "Concepcion", "Labuin", "Linga", "Masico", "Mojon", "Pansol", "Pinagbayanan", "San Antonio", "San Miguel", "Santa Clara Norte (Pob.)", "Santa Clara Sur (Pob.)", "Tubuan"],
    
    "Rizal": ["Antipolo", "Entablado", "Laguan", "Paule 1", "Paule 2", "East Poblacion", "West Poblacion", "Pook", "Tala", "Talaga", "Tuy"],
    
    "San Pedro": ["Bagong Silang", "Cuyab", "Calendola", "Chrysanthemum", "Estrella", "Fatima", "G.S.I.S.", "Landayan", "Langgam", "Laram", "Magsaysay", "Maharlika", "Narra", "Nueva", "Pacita I", "Pacita II", "Poblacion", "Riverside", "Rosario", "Sampaguita Village", "San Antonio", "San Lorenzo Ruiz", "San Roque", "San Vicente", "Santo Niño", "United Bayanihan", "United Better Living"],
    
    "Santa Cruz": ["Alipit", "Bagumbayan", "Bubukal", "Calios", "Duhat", "Gatid", "Jasaan", "Labuin", "Malinao", "Oogong", "Pagsawitan", "Palasan", "Patimbao", "Poblacion A", "Poblacion B", "Poblacion C", "Poblacion D", "Poblacion E", "Poblacion F", "San Jose", "San Juan", "San Pablo Norte", "San Pablo Sur", "Santisima Cruz", "Santo Angel Central", "Santo Angel Norte", "Santo Angel Sur"],
    
    "Santa Maria": ["Adia", "Bagong Pook", "Bagumbayan", "Cabooan", "Calangay", "Cambuja", "Coralan", "Cueva", "Inayapan", "Jose Laurel, Sr.", "Jose P. Rizal", "Macasipac", "Masinao", "Parang ng Buho", "Poblacion Dos", "Poblacion Quatro", "Poblacion Tres", "Poblacion Uno", "Talangka", "Tungkod"],
    
    "Siniloan": ["Acevida", "Bagong Pag-Asa (Pob.)", "Bagumbarangay (Pob.)", "Buhay", "G. Redor (Pob.)", "Gen. Luna", "Halayhayin", "J. Noveras (Pob.)", "Kapatalan", "Liyang", "Llavac", "Lubigan", "Macatad", "Magsaysay", "Mayatba", "Mendiola", "P. Burgos", "Pandeno", "Salubungan", "Wawa"],
    
    "Victoria": ["Banca-banca", "Daniw", "Gagalot", "Mabulu-Malaki", "Mabulu-Paquil", "Nanhaya (Pob.)", "Pagalangan", "Poblacion I", "Poblacion II", "San Benito", "San Felix", "San Francisco", "San Roque (Bulusan)"]
  },

  "Batangas": {
    // Cities
    "Batangas City": ["Alangilan", "Balagtas", "Balete", "Banaba Center", "Banaba Kanluran", "Banaba Silangan", "Bilogo", "Bolbok", "Bukal", "Calicanto", "Catandala", "Concepcion", "Conde Itaas", "Conde Labak", "Cuta", "Dalig", "Dela Paz", "Dela Paz Pulot Aplaya", "Dela Paz Pulot Itaas", "Dumantay", "Gulod Itaas", "Gulod Labak", "Haligue Kanluran", "Haligue Silangan", "Ilihan", "Kumba", "Kumintang Ibaba", "Kumintang Ilaya", "Libjo", "Liponpon", "Maapas", "Mahabang Dahilig", "Mahabang Parang", "Mahacot Silangan", "Mahacot Kanluran", "Malalim", "Malibayo", "Malitam", "Maruclap", "Mabacong", "Pagkilatan", "Paharang Kanluran", "Paharang Silangan", "Pallocan Kanluran", "Pallocan Silangan", "Pinamucan", "Pinamucan Ibaba", "Pinamucan Silangan", "Poblacion", "Rizal", "San Agapito Ilaya", "San Agapito Isla Verde", "San Andres Ilaya", "San Antonio", "San Isidro", "San Jose Sico", "San Miguel", "San Pedro", "Santa Clara", "Santa Rita Aplaya", "Santa Rita Karsada", "Santo Domingo", "Santo Niño", "Simlong", "Sirang Lupa", "Sorosoro Ibaba", "Sorosoro Ilaya", "Sorosoro Karsada", "Tabangao Ambulong", "Tabangao Aplaya", "Tabangao Dao", "Talahib Pandayan", "Talahib Payapa", "Talumpok Kanluran", "Talumpok Silangan", "Tinga Itaas", "Tinga Labak", "Tulo", "Wawa"],
    
    "Lipa": ["Adya", "Anilao", "Anilao-Labac", "Antipolo del Norte", "Antipolo del Sur", "Bagong Pook", "Balintawak", "Banaybanay", "Bolbok", "Bugtong na Pulo", "Bulacnin", "Bulaklakan", "Calamias", "Cumba", "Dagatan", "Duhatan", "Halang", "Inosluban", "Kayumanggi", "Latag", "Lodlod", "Lumbang", "Mabini", "Malagonlong", "Malitlit", "Marauoy", "Mataas na Lupa", "Munting Pulo", "Pagolingin Bata", "Pagolingin East", "Pagolingin West", "Pangao", "Pinagkawitan", "Pinagtongulan", "Plaridel", "Poblacion Barangay 1", "Poblacion Barangay 2", "Poblacion Barangay 3", "Poblacion Barangay 4", "Poblacion Barangay 5", "Poblacion Barangay 6", "Poblacion Barangay 7", "Poblacion Barangay 8", "Poblacion Barangay 9", "Poblacion Barangay 10", "Poblacion Barangay 11", "Poblacion Barangay 12", "Pusil", "Quezon", "Rizal", "Sabang", "Sampaguita", "San Benito", "San Carlos", "San Celestino", "San Francisco", "San Guillermo", "San Isidro", "San Jose", "San Lucas", "San Salvador", "San Sebastian (Balagbag)", "Santo Niño", "Santo Toribio", "Sapac", "Sico", "Talisay", "Tambo", "Tangob", "Tanguay", "Tibig", "Tipacan"],
    
    "Tanauan": ["Altura Bata", "Altura Matanda", "Altura South", "Ambulong", "Bagbag", "Bagumbayan", "Balele", "Banjo East", "Banjo Laurel", "Bantayan", "Bilog-bilog", "Boot", "Cale", "Darasa", "Gonzales", "Hidalgo", "Janopol", "Janopol Oriental", "Laurel", "Luyos", "Mabini", "Malaking Pulo", "Maria Paz", "Maugat", "Montana", "Natatas", "Pagaspas", "Pantay Bata", "Pantay Matanda", "Poblacion Barangay 1", "Poblacion Barangay 2", "Poblacion Barangay 3", "Poblacion Barangay 4", "Poblacion Barangay 5", "Poblacion Barangay 6", "Poblacion Barangay 7", "Sala", "Sambat", "San Jose", "Santol", "Santor", "Sulpoc", "Suplang", "Talaga", "Tinurik", "Trapiche", "Ulango", "Wawa"],
    
    // Municipalities  
    "Agoncillo": ["Adia", "Bagong Sikat", "Balangon", "Banyaga", "Barigon", "Bilibinwang", "Coral na Munti", "Guitna", "Mabini", "Pamiga", "Panhulan", "Pansipit", "Santa Cruz", "Santo Tomas", "Subic Ibaba", "Subic Ilaya"],
    
    "Alitagtag": ["Balagbag", "Concepcion", "Concordia", "Dalipit East", "Dalipit West", "Dominador East", "Dominador West", "Munlawin", "Muzon", "Ping-as", "Poblacion East", "Poblacion West", "San Jose", "San Juan", "Santa Cruz"],
    
    "Balayan": ["Baclaran", "Barangay 1 (Pob.)", "Barangay 2 (Pob.)", "Barangay 3 (Pob.)", "Barangay 4 (Pob.)", "Barangay 5 (Pob.)", "Barangay 6 (Pob.)", "Barangay 7 (Pob.)", "Barangay 8 (Pob.)", "Barangay 9 (Pob.)", "Barangay 10 (Pob.)", "Barangay 11 (Pob.)", "Barangay 12 (Pob.)", "Caloocan", "Calzada", "Carenahan", "Caybunga", "Canda", "Dalig", "Dao", "Dilao", "Duhatan", "Durungao", "Gimalas", "Gumamela", "Lagnas", "Lanatan", "Langgangan", "Magabe", "Malalay", "Munting Tubig", "Navotas", "Palikpikan", "Patugo", "Puting Bato East", "Puting Bato West", "Magabe", "San Juan", "San Piro", "Santol", "Sukol", "Taludtud", "Tanggoy"],
    
    "Balete": ["Alangilan", "Calawit", "Looc", "Magapi", "Makina", "Malabanan", "Paligawan", "Palsara", "Poblacion", "Sala", "Sampalocan", "San Sebastian", "Solis"],
    
    "Bauan": ["Alagao", "Aplaya", "As-Is", "Baguilawa", "Balayong", "Banaba", "Barangay 1 (Pob.)", "Barangay 2 (Pob.)", "Barangay 3 (Pob.)", "Barangay 4 (Pob.)", "Bolo", "Colvo", "Cupang", "Durungao", "Gulibay", "Inicbulan", "Locloc", "Malalim", "Manalupa", "Manghinao Proper", "Manghinao Uno", "New Danglayan", "Old Danglayan", "Orense", "Pering", "Pinamukawan", "Rizal", "Sampaguita", "San Agustin", "San Andres Proper", "San Antonio", "San Diego", "San Miguel", "San Pablo", "San Pedro", "San Roque", "San Salvador", "San Teodoro", "Santa Maria", "Sinala"],
    
    "Calaca": ["Balimbing", "Bambang", "Barangay 1 (Pob.)", "Barangay 2 (Pob.)", "Barangay 3 (Pob.)", "Barangay 4 (Pob.)", "Barangay 5 (Pob.)", "Bisaya", "Cahil", "Calantas", "Caluangan", "Camastilisan", "Catubunan", "Dacanlao", "Loma", "Lumbangan", "Makina", "Matipok", "Munting Coral", "Niyugan", "Pantay", "Payapa Ibaba", "Payapa Ilaya", "Puting Bato East", "Puting Bato West", "Puting Kahoy", "Quisumbing", "San Rafael", "Santa Rosa", "Sinisian", "Talisay", "Taytay"],
    
    "Calatagan": ["Bagong Silang", "Balibago", "Balitoc", "Barangay 1 (Pob.)", "Barangay 2 (Pob.)", "Barangay 3 (Pob.)", "Barangay 4 (Pob.)", "Biga", "Buhay na Sapa", "Carlosa", "Carretunan", "Hukay", "Encarnacion", "Lucsuhin", "Luya", "Paraiso", "Quilitisan", "Real", "Sambungan", "Santa Ana", "Talibayog", "Tanagan", "Talisay"],
    
    "Cuenca": ["Balagbag", "Bungahan", "Calumayin", "Dalipit East", "Dalipit West", "Dita", "Don Juan", "Emmanuel", "Ibabao", "Labac", "Pinagkurusan"],
    
    "Ibaan": ["Bago", "Balanga", "Bungahan", "Calamias", "Catandala", "Coliat", "Dayapan", "Lapu-lapu", "Lucsuhin", "Mabalor", "Malainin", "Matala", "Munting Tubig", "Palindan", "Pangao", "Poblacion", "Sabang", "Salaban Ibaba", "Salaban Ilaya", "San Agustin", "Sandalan", "Talaibon", "Tulay na Patpat"],
    
    "Laurel": ["As-Is", "Balakilong", "Berinayan", "Bugaan East", "Bugaan West", "Buso-buso", "Dayap Itaas", "Gulod", "J. Leviste", "Niyugan", "Paliparan", "Poblacion 1", "Poblacion 2", "Poblacion 3", "San Gabriel", "San Gregorio", "San Joaquin", "Santa Maria"],
    
    "Lemery": ["Anak-Dagat", "Arumahan", "Ayao-iyao", "Bagong Pook", "Bagong Sikat", "Balanga", "Bukal", "Cahilan I", "Cahilan II", "Dayapan", "Dita", "Maguihan", "Maigsing Dahilig", "Maitim", "Mahabang Dahilig", "Malinis", "Masalisi", "Maligaya", "Mataas na Bayan", "Mayasang", "Niugan", "Palanas", "Poblacion Barangay 1", "Poblacion Barangay 2", "Poblacion Barangay 3", "Poblacion Barangay 4", "Sambal Ibaba", "Sambal Ilaya", "San Isidro", "Sangalang", "Talaga East", "Talaga Proper", "Talaga West", "Tubigan", "Wawa"],
    
    "Lian": ["Bagong Pook", "Balibago", "Banga", "Binubusan", "Cumba", "Humaya", "Kapito", "Lagadlarin", "Luyahan", "Malaruhatan", "Matabungkay", "Palanas", "Poblacion", "Prenza", "San Diego", "San Jose", "Santol", "Lumaniag", "Balibago"],
    
    "Lobo": ["Apar", "Balatbat", "Balibago", "Biga", "Boboy", "Bolo", "Cahigam", "Calo", "Calumpit", "Fabrica", "Jaybanga", "Lagadlarin", "Mabilog na Bundok", "Malabrigo", "Malapad na Parang", "Masaguitsit", "Nagtalongtong", "Nagtoctoc", "Olo-olo", "Pinaghawanan", "Poblacion", "Salong", "San Miguel", "San Nicolas", "Santol", "Sawang", "Soloc", "Tabigue"],
    
    "Mabini": ["Anilao Proper", "Anilao East", "Bagalangit", "Balayan", "Balete", "Bulacan", "Calamias", "Gasang", "Laurel", "Ligaya", "Lugay", "Mainaga", "Mainit", "Majuben", "Malimatoc I", "Malimatoc II", "Pinagtongulan", "Poblacion", "Pulang Lupa", "Pulong Anahao", "Pulong Balibaguhan", "Pulong Niogan", "Sampaguita", "San Francisco", "San Jose", "San Juan", "San Pedro", "San Teodoro", "Santa Ana", "Santa Mesa", "Santo Niño", "Santo Tomas"],
    
    "Malvar": ["Bagong Pook", "Bilucao", "Bulihan", "Luta del Norte", "Luta del Sur", "Poblacion", "San Fernando", "San Gregorio", "San Juan", "San Pedro I", "San Pedro II", "San Pioquinto", "Santiago"],
    
    "Mataas na Kahoy": ["Bayorbor", "Calingatan", "Kinalaglagan", "Loob", "Lumpiaan", "Manggahan", "Nangkaan", "Poblacion", "Pulong Suso", "Santol", "Upa"],
    
    "Nasugbu": ["Aga", "Alaiian", "Anak-Dagat", "Balaytigui", "Banilad", "Barangay 1 (Pob.)", "Barangay 2 (Pob.)", "Barangay 3 (Pob.)", "Barangay 4 (Pob.)", "Barangay 5 (Pob.)", "Barangay 6 (Pob.)", "Barangay 7 (Pob.)", "Barangay 8 (Pob.)", "Barangay 9 (Pob.)", "Barangay 10 (Pob.)", "Barangay 11 (Pob.)", "Barangay 12 (Pob.)", "Bilaran", "Bucana", "Bulihan", "Bunducan", "Butucan", "Calayo", "Catandaan", "Cogunan", "Dayap", "Kaylaway", "Kayrilaw", "Latag", "Looc", "Lumbangan", "Malapad na Bato", "Mataas na Pulo", "Munting Indan", "Natipuan", "Pantalan", "Papaya", "Putat", "Reparo", "Talangan", "Tumalim", "Utod", "Wawa"],
    
    "Padre Garcia": ["Banaba", "Bawi", "Bilibinwang", "Castillo", "Cawongan", "Manggas", "Maugat", "Payapa", "Poblacion", "Pook ni Banal", "Quilo-quilo", "Sampaloc", "San Felipe", "San Miguel", "Tamak"],
    
    "Rosario": ["Alupay", "Antipolo", "Bacao", "Bagong Pook", "Balibago", "Bayawang", "Bulihan", "Cahigam", "Calaguiman", "Casilagan", "Gumamela", "Ligtong I", "Ligtong II", "Ligtong III", "Ligtong IV", "Lumbangan", "Lutucan I", "Lutucan II", "Mabato", "Malaya", "Manlunas", "Mayuro", "Namuco", "Namunga", "Palanas", "Pili", "Pinagbayanan", "Pinagtung-ulan", "Poblacion", "Pulong Anahao", "Pulong Buli", "Putingkahoy", "San Carlos", "San Isidro", "San Jose", "San Juan", "San Nicolas", "San Roque", "Tiquiwan"],
    
    "San Jose": ["Aguila", "Anus", "Apar", "Balagtasin", "Barangay I (Pob.)", "Barangay II (Pob.)", "Barangay III (Pob.)", "Barangay IV (Pob.)", "Bigain I", "Bigain II", "Calansayan", "Dagatan", "Don Luis", "Galamay-Amo", "Lapolapo", "Lumil", "Mabunga", "Mabuti", "Pisa", "Pinagtung-ulan", "Pulangbato", "San Isidro", "San Juan", "Santa Cruz", "Taysan", "Santo Cristo"],
    
    "San Luis": ["Bagong Tubig", "Balagtasin", "Balite", "Dulangan", "Durungao", "Locloc", "Mahabang Parang", "Poblacion", "San Isidro", "San Jose", "San Martin", "Taliba", "Tejero", "Tungal"],
    
    "San Nicolas": ["Alas-as", "Balete", "Baluk-baluk", "Bulihan", "Calangay", "Calayo", "Dao", "Halang", "Lumang Bayan", "Maabud Norte", "Maabud Sur", "Munlawin", "Pansipit", "Panghayaan", "Poblacion", "San Andres", "San Jose", "Sinisian", "Taliba", "Talisay"],
    
    "San Pascual": ["Alalum", "Antipolo", "Balimbing", "Banaba", "Banilad", "Barangay 1 (Pob.)", "Barangay 2 (Pob.)", "Barangay 3 (Pob.)", "Barangay 4 (Pob.)", "Danglayan", "Del Pilar", "Gelerang Kawayan", "Ilat Norte", "Ilat Sur", "Kapunitan", "Katuray", "Laurel", "Lucsuhin", "Malaking Pulo", "Nag-iba I", "Nag-iba II", "Natunuan", "Palsahingin", "Pila", "Pulang Bato", "Sambat", "San Antonio", "San Mariano", "San Mateo", "San Roque", "Santa Elena", "Santol", "Santo Niño"],
    
    "Santa Teresita": ["Antipolo", "Bihis", "Burol", "Calayaan", "Cutang Cawayan", "Irukan", "Kayloma", "Poblacion", "San Isidro", "Saimsim", "San Pablo", "Santo Niño"],
    
    "Santo Tomas": ["Barangay I (Pob.)", "Barangay II (Pob.)", "Barangay III (Pob.)", "Barangay IV (Pob.)", "San Agustin", "San Antonio", "San Bartolome", "San Felix", "San Fernando", "San Francisco", "San Isidro Norte", "San Isidro Sur", "San Joaquin", "San Jose", "San Juan", "San Luis", "San Miguel", "San Pablo", "San Pedro", "San Rafael", "San Roque", "San Vicente", "Santa Ana", "Santa Anastacia", "Santa Clara", "Santa Cruz", "Santa Elena", "Santa Maria", "Santa Teresita", "Santiago I", "Santiago II", "Santo Cristo", "Santo Niño", "Sico I", "Sico II"],
    
    "Taal": ["Apacay", "Balisong", "Bihis", "Bolboc", "Buli", "Butong", "Carasuche", "Cawit", "Cubamba", "Cuta East", "Cuta West", "Daga", "Gahol", "Halang", "Imamawo", "Lapu-lapu", "Lumbangan", "Magahis", "Manalupang", "Marcos", "Maria Paz", "Matula", "Natipuan", "Palanas", "Poblacion I", "Poblacion II", "Poblacion III", "Poblacion IV", "Poblacion V", "Pook", "Pulang Bato", "Sahaguintan", "Sala", "Sampaloc", "San Guillermo", "Santa Teresa", "Sepung Pajo", "Sepung Gitna", "Sibacan", "Sinturisan", "Talaga", "Taytay", "Tierra Alta", "Tibulsoy", "Trapiche", "Unta Salagsing"],
    
    "Talisay": ["Aya", "Banga", "Balas", "Buco", "Caloocan", "Mataas na Lipa", "Miranda", "Poblacion East", "Poblacion West", "San Guillermo", "Santa Maria", "Sampaloc", "Tranca"],
    
    "Taysan": ["Balete", "Bilogo", "Bukal", "Dagatan", "Guinhawa", "Laurel", "Mahanadiong", "Mataas na Lupa", "Olo", "Panghayaan", "Papaya", "Pinagbayanan", "Poblacion", "San Isidro", "San Marcelino", "Santo Niño", "Tilambo"],
    
    "Tingloy": ["Baybayin", "Corona", "Gambang", "Ligaya", "Mahabang Gulod", "Papaya", "Poblacion", "San Isidro", "San Jose", "San Juan", "Santa Ana", "Talahib"],
    
    "Tuy": ["Alo", "Balaytigue", "Bayudbud", "Bolboc", "Burgos", "Dalima", "Dao", "Guinhawa", "Lumbangan", "Luntal", "Magahis", "Malibu", "Mataywanac", "Palsahingin", "Putol", "Rillo", "Sabang", "San Jose", "San Roque", "Santo Niño", "Talon", "Toong"]
  },

  "Quezon": {
    // Cities
    "Lucena": ["Barangay 1", "Barangay 2", "Barangay 3", "Barangay 4", "Barangay 5", "Barangay 6", "Barangay 7", "Barangay 8", "Barangay 9", "Barangay 10", "Barangay 11", "Barra", "Bocohan", "Cotta", "Dalahican", "Domoit", "Gulang-Gulang", "Ibabang Dupay", "Ibabang Iyam", "Ilayang Dupay", "Ilayang Iyam", "Isabang", "Market View", "Mayao Castillo", "Mayao Crossing", "Mayao Kanluran", "Mayao Parada", "Mayao Silangan", "Ransohan", "Salinas", "Talao-Talao"],
    
    "Tayabas": ["Anos", "Alitao", "Alsam Ibaba", "Alsam Ilaya", "Alupay", "Angeles Zone I", "Angeles Zone II", "Angeles Zone III", "Angeles Zone IV", "Angelina", "Ayaas", "Baguio", "Banilad", "Bukal Ibaba", "Bukal Ilaya", "Calantas", "Calumpang", "Camaysa", "Dapdap", "Domoit Kanluran", "Domoit Silangan", "Gibanga", "Ibas", "Ilasan Ibaba", "Ilasan Ilaya", "Ipilan", "Isabang", "Katigan Kanluran", "Katigan Silangan", "Lakawan", "Lalo", "Lawigue", "Lita (Pob.)", "Malaoa", "Masin", "Mate", "Mateuna", "Mayowe", "Nangka", "Opias", "Palale Ibaba", "Palale Ilaya", "Palale Kanluran", "Palale Silangan", "Pandakaki", "Pook", "Potol", "San Diego Zone I", "San Diego Zone II", "San Diego Zone III", "San Diego Zone IV", "San Isidro Zone I", "San Isidro Zone II", "San Isidro Zone III", "San Isidro Zone IV", "San Roque Zone I", "San Roque Zone II", "Talon", "Tamlong", "Tongko", "Valencia", "Wakas"],
    
    // Municipalities
    "Agdangan": ["Binagbag", "Dayap", "Ibabang Kinagunan", "Ilayang Kinagunan", "Kanlurang Calutan", "Kanlurang Maligaya", "Poblacion I", "Poblacion II", "Salvacion", "Silangang Calutan", "Silangang Maligaya"],
    
    "Alabat": ["Bacong", "Barangay Zone I (Pob.)", "Barangay Zone II (Pob.)", "Barangay Zone III (Pob.)", "Barangay Zone IV (Pob.)", "Buenavista", "Caglate", "Camagong", "Gordon", "Pambilan Norte", "Pambilan Sur", "San Andres", "San Gregorio", "Villa Esperanza", "Villa Jesus Este", "Villa Jesus Weste", "Villa Norte", "Villa Peace"],
    
    "Atimonan": ["Balubad", "Balugohin", "Caridad Ibaba", "Caridad Ilaya", "Habingan", "Inalig", "Kilait", "Kulawit", "Lubi", "Magsaysay", "Malinao Ibaba", "Malinao Ilaya", "Matambo", "Montes Balayon", "Montes Kallagan", "Poblacion", "Ponon", "Proper Talisay", "Pulong Bayabas", "Salangan Ibaba", "Salangan Ilaya", "Sampaloc", "San Andres", "San Isidro", "San Rafael", "Santa Catalina", "Santa Rosa", "Sapaan", "Sokol", "Talaba", "Talisay", "Tinandog", "Villa Ibaba", "Villa Ilaya"],
    
    "Buenavista": ["Bago", "Bagong Silang", "Barangay Zone 1 (Pob.)", "Barangay Zone 2 (Pob.)", "Barangay Zone 3 (Pob.)", "Barangay Zone 4 (Pob.)", "Barangay Zone 5 (Pob.)", "Bukal Norte", "Bukal Sur", "Calamias", "Cawayan", "Catalino", "Humayingan", "Kabulusan", "Masaya", "Mayubok", "Nag-Cruz", "Origuel", "Sandig", "Tala-Tala"],
    
    "Burdeos": ["Aluyon", "Amot", "Anibawan", "Bonifacio", "Cabugao", "Cabuy", "Calutcot", "Carlagan", "Mabini", "Matabungkay", "Palasan", "Poblacion", "San Rafael", "Sangirin", "Santa Cruz", "Santa Rosa", "Tampatong", "Tulay Buhangin", "Yuni"],
    
    "Calauag": ["Anahawan", "Apad Lutao", "Apad Taisan", "Atulayan", "Baclaran", "Bagong Silang", "Bangkuruhan", "Bantolinao", "Barangay I (Pob.)", "Barangay II (Pob.)", "Barangay III (Pob.)", "Barangay IV (Pob.)", "Barangay V (Pob.)", "Binutas", "Biyan", "Bukid", "Bululawan", "Dapdap", "Dominlog", "Doña Aurora", "Guinosutan", "Ipil", "Kalibo (Batabat)", "Katangtang", "Kigtan", "Kinalin Ibaba", "Kinalin Ilaya", "Kinamaligan", "Kumaludkud", "Kunalum", "Kuyaoyao", "Lagay", "Lainglang", "Lungib", "Mabini", "Madlangdungan", "Maglipit Ilaya", "Maglipit Poblacion", "Maligaya", "Mangero", "Manlayo", "Mantugbue", "Marilag", "Mulay", "Pandanan", "Pansol", "Patihan", "Pinagbayanan", "Pinagkamaligan", "Pinagsakahan", "Pinagtalleran", "Rizal Ibaba", "Rizal Ilaya", "Sabang I", "Sabang II", "Salvacion", "San Ray", "San Roque Ibaba", "San Roque Ilaya", "Santol", "Sildora", "Sumulong", "Tabansak", "Talisay", "Tamis", "Tagbakin", "Tuhian", "Yaganak"],
    
    "Candelaria": ["Buenavista East", "Buenavista West", "Bukal Norte", "Bukal Sur", "Kinatihan I", "Kinatihan II", "Masin Norte", "Masin Sur", "Malabanban Norte", "Malabanban Sur", "Mangilag Norte", "Mangilag Sur", "Masalukot I", "Masalukot II", "Masalukot III", "Masalukot IV", "Masalukot V", "Mayabobo", "Pahinga Norte", "Pahinga Sur", "Poblacion", "San Andres", "San Isidro", "Santa Catalina Norte", "Santa Catalina Sur"],
    
    "Catanauan": ["Ajos", "Banalo", "Catumbo", "Barangay 1 (Pob.)", "Barangay 2 (Pob.)", "Barangay 3 (Pob.)", "Barangay 4 (Pob.)", "Barangay 5 (Pob.)", "Bato", "Bicahan", "Buhi", "Camandizon", "Catburawan", "Cutcutan", "Dahican", "Gatasan", "Ibong Bundok", "Inanawan", "Madulao", "Matandang Sabang Kanluran", "Matandang Sabang Silangan", "Navetas", "Ople", "Pacabit", "Pagsangahan", "Pansoy", "Poctol", "Sagrada", "San Isidro", "San Jose", "San Juan", "San Narciso", "San Pablo", "San Vicente", "Tabi"],
    
    "Dolores": ["Antonino", "Bahi", "Barangay 1 (Pob.)", "Barangay 2 (Pob.)", "Barangay 3 (Pob.)", "Barangay 4 (Pob.)", "Bato", "Bayan-bayan", "Bulakin", "Cabatang", "Cabong", "Calomboyan", "Cawayan I", "Cawayan II", "Dagatan", "Kiagot", "Kinalin Ibaba", "Kinalin Ilaya", "Manggalang", "Masinao", "Pinagkamaligan", "Putol", "Salong", "Santa Maria", "San Mateo", "Silongin Kanluran", "Silongin Silangan", "Sumilang"],
    
    "General Luna": ["Bacong Ibaba", "Bacong Ilaya", "Barangay I (Pob.)", "Barangay II (Pob.)", "Barangay III (Pob.)", "Barangay IV (Pob.)", "Camflora", "Lipata", "Malaya", "Maligaya", "Nieva", "Recto", "San Isidro Ibaba", "San Isidro Ilaya", "San Nicolas", "San Rafael", "Santa Maria"],
    
    "General Nakar": ["Anoling", "Banglos", "Batangan", "Canaway", "Catablingan", "Lumutan", "Mahabang Lalim", "Magsikap", "Maigang", "Minahan Norte", "Minahan Sur", "Pagsangahan", "Pamplona", "Pisa", "Poblacion", "Sablang", "San Marcelino", "Umiray"],
    
    "Gumaca": ["Apasan", "Bagong Bayan", "Bignay 1", "Bignay 2", "Bonliw", "Buensuceso", "Liwayway", "Mabini Ibaba", "Mabini Ilaya", "Mabunga", "Pagsangahan", "Poblacion", "Progreso", "Rosario", "Salinas", "San Agustin", "San Diego", "San Isidro Ibaba", "San Isidro Ilaya", "San Juan Ibaba", "San Juan Ilaya", "San Vicente", "Villa Arcaya", "Villa Bota", "Villa Escudero", "Villa Francia", "Villa Gomez", "Villa Hiwasayan", "Villa Padua", "Villa Perez", "Villa Realista", "Villa Resurreccion", "Villa Rodrigo I", "Villa Rodrigo II", "Villa San Francisco"],
    
    "Guinayangan": ["Aloneros", "Arbismen", "Bagong Silang", "Balasin", "Balogo", "Bukal", "Cabibihan", "Cabong", "Calimpak", "Casispalan", "Dancalan Caimawan", "Dancalan Central", "Dancalan Ilaya", "Danlagan", "Del Rosario", "Dungawan", "Ermita", "Gapas", "Hinagodngan", "Hinguiwin", "Ligaya", "Magsaysay", "Magsinukba", "Magsaysay", "Manggalayan Bundok", "Manggalayan Labak", "Magsaysay", "Poblacion", "Punay", "Salabusab", "San Isidro", "San Luis", "San Roque", "San Vicente", "Sipa", "Sinaliw Malaki", "Sinaliw Munti", "Tapel"],
    
    "Infanta": ["Abiawin", "Agos-agos", "Alitas", "Amolongin", "Anibongan", "Antikin", "Bacong", "Banugao", "Batis", "Binulasan", "Boboin", "Caagutayan", "Catambungan", "Comon", "Dinahican", "Gumian", "Ibona", "Ilog", "Ingas", "Libjo", "Limbo", "Lual", "Magsikap", "Miswa", "Pandan", "Payte", "Pilaway", "Pinaglapatan", "Poblacion", "Real", "Silangan", "Tongohin"],
    
    "Jomalig": ["Apad", "Bukal", "Casuguran", "Gango", "Talisoy"],
    
    "Lopez": ["Bacungan", "Bagacay", "Banabahin Ibaba", "Banabahin Ilaya", "Banilad", "Bayabas", "Bebito", "Bigajo", "Binahian A", "Binahian B", "Binahian C", "Binahian D", "Bohol", "Burgos", "Buyaboy", "Cagaguit", "Canda", "Capalong", "Concepcion", "Doña Aurora", "Esperanza", "Hondagua", "Ibabang Banga", "Ibabang Palale", "Ilayang Banga", "Ilayang Palale", "Jongo", "Lacdayan", "Lerma", "Liang", "Libas", "Macayoyo", "Maragondon", "Mojon-tampoy", "Olo-olo", "Pagkalinawan", "Pansol", "Parte", "Pisipis", "Rizal", "San Antonio", "San Francisco", "San Gabriel", "San Isidro", "San Jose", "San Juan", "San Lorenzo", "San Miguel", "San Nicolas", "San Rafael", "San Roque", "San Vicente", "Santa Elena", "Santa Maria", "Santa Rosa", "Siete Martires", "Sugod", "Tayunan", "Villa Bamba", "Villa Espina", "Villa Gomez", "Villa Hermosa"],
    
    "Macalelon": ["Alag", "Anibawan", "Areté", "Balungay", "Banot", "Binangan", "Bonbon", "Bukal", "Calapan", "Gapas", "Guinayangan", "Hinam", "Kalmot", "Kalubakis", "Langeban", "Lun-oy", "Matandang Guyam Malayo", "Matandang Guyam Malapit", "Pawa", "Poblacion", "Remedios", "San Andres Bundok", "San Andres Labak", "San Francisco", "San Isidro", "San Roque", "Talaongan", "Talawan"],
    
    "Mauban": ["Alitap", "Amuguis", "Bagong Bayan", "Balayong", "Cagbalogo I", "Cagbalogo II", "Concepcion Ibaba", "Concepcion Ilaya", "Daungan", "Lual", "Lucutan", "Macawayan", "Nag-Iba I", "Nag-Iba II", "Paje", "Panadtaran", "Pinagbakuran", "Polo", "Rizal", "Rosario", "San Gabriel", "San Lorenzo", "San Miguel", "San Rafael", "San Ricardo", "San Roque", "San Vicente", "Santa Lucia", "Santol", "Santo Angel", "Santo Cristo", "Santo Niño", "Soledad"],
    
    "Mulanay": ["Abgao", "Ajos", "Amugawan", "Anonang", "Bagong Silang", "Barangay 1 (Pob.)", "Barangay 2 (Pob.)", "Barangay 3 (Pob.)", "Barangay 4 (Pob.)", "Bolo", "Buenavista", "Burgos", "Cambuga", "Camaluanagan", "Magsaysay", "Mayubok", "Pachoca", "Parang ng Buho", "Silang", "Tulay Buhangin"],
    
    "Padre Burgos": ["Bigo", "Burgos", "Calumayin", "Kinabuhayan", "Loob", "Marao", "Punta", "Rosario", "San Isidro", "San Jose", "San Roque", "Sinag"],
    
    "Pagbilao": ["Alupaye", "Antipolo", "Barangay 1 (Pob.)", "Barangay 2 (Pob.)", "Barangay 3 (Pob.)", "Binahaan", "Bantigue", "Binahaan A", "Binahaan B", "Castillo", "Ibabang Polo", "Ibabang Palsabangon", "Ilayang Palsabangon", "Ilayang Polo", "Kalawit", "Kanluran", "Kataypuanan", "Libjo", "Mabunga", "Mapagong", "Matalipni", "Mulay", "Palsabangon", "Pinagtubigan East", "Pinagtubigan West", "Pinagturilan", "Rizal", "Salambao", "San Miguel", "San Salvador", "Santo Angel", "Silangan", "Talipan"],
    
    "Panukulan": ["Bangonbango", "Callejon", "Katimo", "Mailhi", "Nabaluarte", "Pag-Asa", "Palid", "Poblacion"],
    
    "Patnanungan": ["Amaga", "Busdak", "Kilogan", "Luod", "Patnanungan Norte (Pob.)", "Patnanungan Sur (Pob.)"],
    
    "Perez": ["Bagong Silang", "Mainit Norte", "Mainit Sur", "Maligaya", "Mapagmahal", "Pangkawa", "Rizal", "Santa Maria"],
    
    "Pitogo": ["Amolongin", "Biga", "Bosigon", "Caglate", "Catanauan", "Duhat", "Ibabang Burgos", "Ibabang Pacatin", "Ilayang Burgos", "Ilayang Pacatin", "Mabini", "Mambulao", "Mampaitan", "Pele", "Poblacion", "Rizal", "San Roque", "San Vicente", "Timbo"],
    
    "Plaridel": ["Basiao", "Concepcion", "Guinabsan", "Ilayang Pagbabaluarte", "Kinagunan", "Libas", "Paang Bundok", "Pili", "Poblacion", "Salahan"],
    
    "Polillo": ["Aluyon", "Anawan", "Atulayan", "Balesin", "Bañadero", "Bato", "Bucao", "Cagbalogo", "Inampo", "Languyin", "Libjo", "Lipata", "Pandan", "Pamatdan", "Pilion", "Poblacion", "Sabang", "Salipsip", "Sibulan", "Taluong"],
    
    "Quezon": ["Apad Lutao", "Barangay 1 (Pob.)", "Barangay 2 (Pob.)", "Barangay 3 (Pob.)", "Barangay 4 (Pob.)", "Barangay 5 (Pob.)", "Barangay 6 (Pob.)", "Barangay 7 (Pob.)", "Bucal", "Cabay", "Cabiguhan", "Buayanon", "Chamaguin", "Cometa", "Hagakhakin", "Jacla", "Mabini", "Mascariña", "Nangka", "Paniquian", "San Antonio", "San Francisco", "San Jose", "San Nicolas", "Villa Belen", "Villa Francia", "Villa Francia Pob. (Sagrada Familia)", "Villa Mercedes", "Villa Pagdanga-an", "Villa San Isidro", "Villa San Roque"],
    
    "Real": ["Capalong", "Cawayan", "Kinamaligan", "Llavac", "Lubayat", "Maragondon", "Poblacion I", "Poblacion II", "Tanauan", "Tignoan", "Ungos"],
    
    "Sampaloc": ["Alupay", "Apasan", "Bilucao", "Caldong", "Ibabang Owain", "Ilayang Owain", "Mamala I", "Mamala II", "Poblacion", "Sabang I", "Sabang II", "San Bueno", "San Roque", "Taquico"],
    
    "San Andres": ["Alibijaban", "Balogo", "Camangahan", "Capaque", "Catagbacan", "Inabuan", "Mangero", "Pansoy", "Paputungan", "Poblacion", "Talabaan", "Tala-totoo"],
    
    "San Antonio": ["Barangay 1 (Pob.)", "Barangay 2 (Pob.)", "Barangay 3 (Pob.)", "Barangay 4 (Pob.)", "Bulihan", "Buton", "Cagbalogo", "Cagbalogo", "Cebulan", "Concepcion", "Fugu", "Kilikilihan", "Malinao Ibaba", "Malinao Ilaya", "Matipok", "Paniquian", "Pansol", "Patong", "Sampaguita", "San Jose", "San Vicente", "Silangang Calutan"],
    
    "San Francisco": ["Amot", "Butanguiad", "Casay", "Dulangan", "Huyon-Uyon", "Ibabang Tayuman", "Ilayang Tayuman", "Inabuan", "Lictin", "Lipata", "Magsaysay", "Makatli", "Malaruhatan", "Mangalip", "Pagsangahan", "Pugon", "Rizal", "Silang", "Talisay"],
    
    "San Narciso": ["Abuyon", "Andres Bonifacio", "Barangay I (Pob.)", "Barangay II (Pob.)", "Barangay III (Pob.)", "Barangay IV (Pob.)", "Binay", "Buenavista", "Busokbusok", "Calwit", "Guinhalinan", "Mabini", "Maligaya", "Manlampong", "Pagolingin", "Pagdanan", "Panggulayan", "Patnanungan", "Pinagbakuran", "Rizal", "San Pascual", "San Rafael", "Santa Lucia", "Tulay Buhangin"],
    
    "Sariaya": ["Antipolo", "Baguio", "Balubal", "Barrio Barreto", "Bucal", "Bukal", "Castañas", "Concepcion Banahaw", "Concepcion Palasan", "Gibanga", "Guisguis-San Roque", "Guisguis-Talon", "Janagdong", "Limbon", "Lutucan Bata", "Lutucan Malaki", "Mamala", "Manggalang Bantilan", "Manggalang Kiling", "Manggalang-Suba", "Montecillo", "Morong", "Pili", "Poblacion Uno", "Poblacion Dos", "Poblacion Tres", "Poblacion Quatro", "Sampaloc Bogon", "Sampaloc Uno", "Sampaloc Dos", "San Benito", "San Francisco", "San Isidro", "San Juan", "San Pedro", "San Roque", "Santa Catalina", "Semeriana", "Sinipian", "Sildora", "Talaan Aplaya", "Talaan Proper", "Tumbaga I", "Tumbaga II"],
    
    "Tagkawayan": ["Aliji", "Aldavoc", "Bagong Silang", "Bamban", "Barangay 1 (Pob.)", "Barangay 2 (Pob.)", "Barangay 3 (Pob.)", "Barangay 4 (Pob.)", "Cabibihan", "Cabugwang", "Candalapdap", "Casasahan", "Cocog-Maragondon", "Cueva", "Katimo", "Kiloblob", "Landing", "Laurel", "Lual", "Maguibuay", "Mahinta", "Magsaysay", "Malbog", "Manato Central", "Manato Station", "Mapulot", "Payapa", "Quezon", "Rizal", "Salao", "San Diego", "San Francisco", "San Isidro", "San Miguel", "San Pedro", "San Roque", "Santo Niño", "Seguiwan", "Tabason", "Tunton", "Victoria"],
    
    "Tiaong": ["Anastacia", "Aquino", "Ayusan I", "Ayusan II", "Behia", "Bukal", "Bula", "Bulakin", "Cabatang", "Cabay", "Del Rosario", "Lagalag", "Lalig", "Lumingon", "Lusacan", "Paiisa", "Palagaran", "Poblacion Barangay 1", "Poblacion Barangay 2", "Poblacion Barangay 3", "Poblacion Barangay 4", "Poblacion Barangay 5", "Quipot", "San Agustin", "San Francisco", "San Isidro", "San Jose", "San Juan", "San Pedro", "Tagbakin", "Talisay", "Tamisian"],
    
    "Unisan": ["Almacen", "Balagtas", "Balanacan", "Bonifacio", "Bulo Ibaba", "Bulo Ilaya", "Burgos", "General Luna", "Kalilayan Ibaba", "Kalilayan Ilaya", "Mabini", "Mairok Ibaba", "Mairok Ilaya", "Maligaya", "Malvar", "Monteclaros", "Pagaguasan", "Pagalongan", "Plaridel", "Poctol", "Poblacion", "Punta", "Puting Buhangin", "Quezon", "Raquedan", "Rizal", "San Roque", "Silangan", "Sokol", "Tagumpay", "Tubas", "Tubigan"]
  }
}
