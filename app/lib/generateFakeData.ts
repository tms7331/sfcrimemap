export interface CrimeIncident {
  id: number;
  longitude: number;
  latitude: number;
  incident_category: string;
  incident_subcategory: string;
  incident_description: string;
  incident_datetime: Date;
  incident_date: string;
  incident_time: string;
  incident_year: number;
  incident_day_of_week: string;
  police_district: string;
  analysis_neighborhood: string;
  resolution: string;
  address: string;
}

const crimeCategories = [
  'Larceny Theft',
  'Assault',
  'Burglary',
  'Motor Vehicle Theft',
  'Malicious Mischief',
  'Fraud',
  'Drug Offense',
  'Robbery',
  'Vandalism',
  'Other'
];

const subcategories: Record<string, string[]> = {
  'Larceny Theft': ['Theft from Vehicle', 'Shoplifting', 'Pickpocket', 'Bicycle Theft'],
  'Assault': ['Simple Assault', 'Aggravated Assault', 'Domestic Violence'],
  'Burglary': ['Residential Burglary', 'Commercial Burglary', 'Attempted Burglary'],
  'Motor Vehicle Theft': ['Auto Theft', 'Attempted Auto Theft', 'Motorcycle Theft'],
  'Malicious Mischief': ['Graffiti', 'Property Damage', 'Vandalism'],
  'Fraud': ['Credit Card Fraud', 'Identity Theft', 'Check Fraud', 'Wire Fraud'],
  'Drug Offense': ['Possession', 'Sale', 'Manufacturing'],
  'Robbery': ['Street Robbery', 'Commercial Robbery', 'Residential Robbery'],
  'Vandalism': ['Graffiti', 'Property Damage'],
  'Other': ['Trespassing', 'Disorderly Conduct', 'Missing Person']
};

const policeDistricts = [
  'Central', 'Northern', 'Park', 'Southern', 'Mission',
  'Tenderloin', 'Richmond', 'Ingleside', 'Taraval', 'Bayview'
];

const neighborhoods = [
  'Financial District', 'Chinatown', 'North Beach', 'Russian Hill',
  'Nob Hill', 'Union Square', 'SOMA', 'Mission District', 'Castro',
  'Haight-Ashbury', 'Sunset District', 'Richmond District', 'Marina',
  'Pacific Heights', 'Presidio', 'Potrero Hill', 'Dogpatch', 'Bayview',
  'Hunters Point', 'Visitacion Valley', 'Bernal Heights', 'Glen Park'
];

const resolutions = [
  'Open or Active',
  'Cite or Arrest Adult',
  'Exceptional Adult',
  'Unfounded'
];

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function generateAddress(): string {
  const streetNumber = Math.floor(Math.random() * 9999) + 1;
  const streetNames = ['Market', 'Mission', 'Valencia', 'Folsom', 'Howard', 'Geary', 'Post', 'Sutter', 'Bush', 'Pine'];
  const streetTypes = ['St', 'Ave', 'Blvd', 'Way', 'Ln'];
  
  return `${streetNumber} ${streetNames[Math.floor(Math.random() * streetNames.length)]} ${streetTypes[Math.floor(Math.random() * streetTypes.length)]}`;
}

export function generateFakeCrimeData(count: number = 1000): CrimeIncident[] {
  const incidents: CrimeIncident[] = [];
  const baseDate = new Date();
  
  // SF bounds roughly
  const bounds = {
    north: 37.8324,
    south: 37.6940,
    east: -122.3549,
    west: -122.5149
  };
  
  // Create some hotspots for more realistic clustering
  const hotspots = [
    { lat: 37.7599, lng: -122.4148, radius: 0.02 }, // Tenderloin
    { lat: 37.7841, lng: -122.4065, radius: 0.015 }, // Downtown
    { lat: 37.7580, lng: -122.4190, radius: 0.018 }, // SOMA
    { lat: 37.7609, lng: -122.4350, radius: 0.02 }, // Western Addition
    { lat: 37.7215, lng: -122.4525, radius: 0.015 }, // Outer Sunset
  ];
  
  for (let i = 0; i < count; i++) {
    const category = crimeCategories[Math.floor(Math.random() * crimeCategories.length)];
    const subcategoryList = subcategories[category] || ['General'];
    const subcategory = subcategoryList[Math.floor(Math.random() * subcategoryList.length)];
    
    // 60% chance to be near a hotspot
    let lat: number, lng: number;
    if (Math.random() < 0.6) {
      const hotspot = hotspots[Math.floor(Math.random() * hotspots.length)];
      const angle = Math.random() * 2 * Math.PI;
      const distance = Math.random() * hotspot.radius;
      lat = hotspot.lat + distance * Math.cos(angle);
      lng = hotspot.lng + distance * Math.sin(angle);
    } else {
      lat = randomInRange(bounds.south, bounds.north);
      lng = randomInRange(bounds.west, bounds.east);
    }
    
    // Generate random date within the last year
    const daysAgo = Math.floor(Math.random() * 365);
    const incidentDate = new Date(baseDate);
    incidentDate.setDate(incidentDate.getDate() - daysAgo);
    
    // Random time with higher probability during evening/night
    const hourProbability = Math.random();
    let hour: number;
    if (hourProbability < 0.3) {
      hour = Math.floor(Math.random() * 8); // 0-7 (midnight to 8am)
    } else if (hourProbability < 0.5) {
      hour = Math.floor(Math.random() * 8) + 8; // 8-15 (8am to 4pm)
    } else {
      hour = Math.floor(Math.random() * 8) + 16; // 16-23 (4pm to midnight)
    }
    
    incidentDate.setHours(hour);
    incidentDate.setMinutes(Math.floor(Math.random() * 60));
    
    const incident: CrimeIncident = {
      id: i + 1,
      longitude: lng,
      latitude: lat,
      incident_category: category,
      incident_subcategory: subcategory,
      incident_description: `${subcategory} - ${category}`,
      incident_datetime: incidentDate,
      incident_date: incidentDate.toISOString().split('T')[0],
      incident_time: incidentDate.toTimeString().split(' ')[0],
      incident_year: incidentDate.getFullYear(),
      incident_day_of_week: daysOfWeek[incidentDate.getDay()],
      police_district: policeDistricts[Math.floor(Math.random() * policeDistricts.length)],
      analysis_neighborhood: neighborhoods[Math.floor(Math.random() * neighborhoods.length)],
      resolution: resolutions[Math.floor(Math.random() * resolutions.length)],
      address: generateAddress()
    };
    
    incidents.push(incident);
  }
  
  return incidents;
}