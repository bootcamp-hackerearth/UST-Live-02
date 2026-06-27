const INDIA_LOCATION_SOURCE_URL =
  process.env.INDIA_LOCATION_SOURCE_URL ||
  "https://raw.githubusercontent.com/sab99r/Indian-States-And-Districts/master/states-and-districts.json";
const INDIA_ADMIN_AREA_SOURCE_URL =
  process.env.INDIA_ADMIN_AREA_SOURCE_URL ||
  "https://raw.githubusercontent.com/pranshumaheshwari/indian-cities-and-villages/master/data.json";

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const PINCODE_CACHE_TTL_MS = 6 * 60 * 60 * 1000;

let cachedLocations = null;
let cacheExpiresAt = 0;
let cachedAdminAreas = null;
let adminAreaCacheExpiresAt = 0;
const pincodeCache = new Map();
const areaCache = new Map();

const FALLBACK_LOCATIONS = [
  {
    id: "1",
    name: "Kerala",
    districts: [
      "Alappuzha",
      "Ernakulam",
      "Idukki",
      "Kannur",
      "Kasaragod",
      "Kollam",
      "Kottayam",
      "Kozhikode",
      "Malappuram",
      "Palakkad",
      "Pathanamthitta",
      "Thiruvananthapuram",
      "Thrissur",
      "Wayanad",
    ],
  },
];

const isLocalCertificateError = (error) =>
  error?.cause?.code === "UNABLE_TO_GET_ISSUER_CERT_LOCALLY" ||
  error?.code === "UNABLE_TO_GET_ISSUER_CERT_LOCALLY";

const enableDevelopmentTlsFallback = () => {
  if (process.env.NODE_ENV === "production") {
    return false;
  }

  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

  return true;
};

const fetchWithTlsFallback = async (url, options) => {
  try {
    return await fetch(url, options);
  } catch (error) {
    if (!isLocalCertificateError(error) || !enableDevelopmentTlsFallback()) {
      throw error;
    }

    return fetch(url, options);
  }
};

const cleanName = (value) =>
  String(value || "")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

const normalizeName = (value) =>
  cleanName(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const normalizeAlias = (value) => {
  const normalized = normalizeName(value);
  const aliases = {
    trivandrum: "thiruvananthapuram",
    trivanathapuram: "thiruvananthapuram",
  };

  return aliases[normalized] || normalized;
};

const compareText = (first, second) => first.localeCompare(second);

const comparePostOfficeArea = (first, second) =>
  `${first.taluk} ${first.name}`.localeCompare(`${second.taluk} ${second.name}`);

const getNameVariants = (value) => {
  const name = cleanName(value);
  const variants = new Set();
  const beforeParenthesis = name.replace(/\s*\([^)]*\)\s*/g, " ").trim();
  const parenthesisMatches = [...name.matchAll(/\(([^)]*)\)/g)];

  parenthesisMatches.forEach((match) => {
    if (match[1]) {
      variants.add(match[1].trim());
    }
  });

  if (beforeParenthesis) {
    variants.add(beforeParenthesis);
  }

  if (variants.size === 0) {
    variants.add(name);
  }

  return [...variants].filter(Boolean);
};

const namesMatch = (first, second) => {
  const firstName = normalizeAlias(first);
  const secondName = normalizeAlias(second);

  if (!firstName || !secondName) {
    return false;
  }

  return (
    firstName === secondName ||
    firstName.includes(secondName) ||
    secondName.includes(firstName) ||
    getNameVariants(first).some((variant) => normalizeName(variant) === secondName) ||
    getNameVariants(second).some((variant) => normalizeName(variant) === firstName)
  );
};

const fetchLocationData = async () => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetchWithTlsFallback(INDIA_LOCATION_SOURCE_URL, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": "HMS-Backend/1.0",
      },
    });

    if (!response.ok) {
      throw new Error(`Location source failed with ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data.states)) {
      throw new Error("Location source returned invalid data");
    }

    return data.states.map((item, index) => ({
      id: String(index + 1),
      name: cleanName(item.state),
      districts: (item.districts || []).map(cleanName).filter(Boolean),
    }));
  } finally {
    clearTimeout(timeout);
  }
};

const getLocations = async () => {
  if (cachedLocations && Date.now() < cacheExpiresAt) {
    return cachedLocations;
  }

  try {
    cachedLocations = await fetchLocationData();
  } catch (error) {
    cachedLocations = FALLBACK_LOCATIONS;
  }

  cacheExpiresAt = Date.now() + CACHE_TTL_MS;

  return cachedLocations;
};

const fetchAdminAreaData = async () => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetchWithTlsFallback(INDIA_ADMIN_AREA_SOURCE_URL, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": "HMS-Backend/1.0",
      },
    });

    if (!response.ok) {
      throw new Error(`Admin area source failed with ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error("Admin area source returned invalid data");
    }

    return data;
  } finally {
    clearTimeout(timeout);
  }
};

const getAdminAreas = async () => {
  if (cachedAdminAreas && Date.now() < adminAreaCacheExpiresAt) {
    return cachedAdminAreas;
  }

  cachedAdminAreas = await fetchAdminAreaData();
  adminAreaCacheExpiresAt = Date.now() + CACHE_TTL_MS;

  return cachedAdminAreas;
};

const getStates = async () => {
  const locations = await getLocations();

  return locations.map(({ id, name }) => ({
    id,
    name,
  }));
};

const getDistrictsByStateId = async (stateId) => {
  const locations = await getLocations();
  const state = locations.find((item) => item.id === String(stateId));

  if (!state) {
    return null;
  }

  return state.districts;
};

const getTaluksByDistrict = async (stateName, districtName) => {
  let adminAreas = [];

  try {
    adminAreas = await getAdminAreas();
  } catch {
    return [];
  }

  const state = adminAreas.find((item) => namesMatch(item.state, stateName));

  if (!state) {
    return [];
  }

  const district = (state.districts || []).find((item) =>
    namesMatch(item.district, districtName),
  );

  if (!district) {
    return [];
  }

  return [
    ...new Set(
      (district.subDistricts || [])
        .map((item) => cleanName(item.subDistrict))
        .filter(Boolean),
    ),
  ].sort(compareText);
};

const fetchPostOffices = async (searchTerm) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetchWithTlsFallback(
      `https://api.postalpincode.in/postoffice/${encodeURIComponent(searchTerm)}`,
      {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
          "User-Agent": "HMS-Backend/1.0",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Postal source failed with ${response.status}`);
    }

    const data = await response.json();
    const result = Array.isArray(data) ? data[0] : null;

    if (result?.Status !== "Success" || !Array.isArray(result.PostOffice)) {
      return [];
    }

    return result.PostOffice;
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
};

const matchesLocation = (postOffice, stateSearch, districtSearch) => {
  const postOfficeState = normalizeName(postOffice.State);
  const postOfficeDistrict = normalizeName(postOffice.District);

  return (
    postOfficeState === stateSearch &&
    (postOfficeDistrict === districtSearch ||
      districtSearch.includes(postOfficeDistrict) ||
      postOfficeDistrict.includes(districtSearch))
  );
};

const getMatchingPostOffices = async (stateSearch, districtSearch, district) => {
  for (const variant of getNameVariants(district)) {
    const postOffices = await fetchPostOffices(variant);
    const matchingPostOffices = postOffices.filter((postOffice) =>
      matchesLocation(postOffice, stateSearch, districtSearch),
    );

    if (matchingPostOffices.length > 0) {
      return matchingPostOffices;
    }
  }

  return [];
};

const getPostOfficeAreasByDistrict = async (stateName, districtName) => {
  const state = cleanName(stateName);
  const district = cleanName(districtName);
  const cacheKey = `${normalizeName(state)}:${normalizeName(district)}`;
  const cached = areaCache.get(cacheKey);

  if (cached && Date.now() < cached.expiresAt) {
    return cached.data;
  }

  const stateSearch = normalizeName(state);
  const districtSearch = normalizeName(district);
  const districtPostOffices = await getMatchingPostOffices(
    stateSearch,
    districtSearch,
    district,
  );

  const areas = [
    ...new Map(
      districtPostOffices
        .map((postOffice) => {
          const pincode = String(postOffice.Pincode || "");

          if (!/^\d{6}$/.test(pincode)) {
            return null;
          }

          const taluk = cleanName(postOffice.Block);
          const name = cleanName(postOffice.Name);
          const displayTaluk =
            taluk && taluk !== "NA" ? taluk : cleanName(postOffice.Division);
          const key = `${normalizeName(displayTaluk)}:${normalizeName(name)}:${pincode}`;

          return [
            key,
            {
              taluk: displayTaluk,
              name,
              pincode,
            },
          ];
        })
        .filter(Boolean),
    ).values(),
  ].sort(comparePostOfficeArea);

  areaCache.set(cacheKey, {
    data: areas,
    expiresAt: Date.now() + PINCODE_CACHE_TTL_MS,
  });

  return areas;
};

const getPincodesByDistrict = async (stateName, districtName) => {
  const state = cleanName(stateName);
  const district = cleanName(districtName);
  const cacheKey = `${normalizeName(state)}:${normalizeName(district)}`;
  const cached = pincodeCache.get(cacheKey);

  if (cached && Date.now() < cached.expiresAt) {
    return cached.data;
  }

  const stateSearch = normalizeName(state);
  const districtSearch = normalizeName(district);
  const postOffices = await getMatchingPostOffices(
    stateSearch,
    districtSearch,
    district,
  );

  const pincodes = [
    ...new Set(
      postOffices
        .map((postOffice) => postOffice.Pincode)
        .filter((pincode) => /^\d{6}$/.test(String(pincode))),
    ),
  ].sort(compareText);

  pincodeCache.set(cacheKey, {
    data: pincodes,
    expiresAt: Date.now() + PINCODE_CACHE_TTL_MS,
  });

  return pincodes;
};

module.exports = {
  getStates,
  getDistrictsByStateId,
  getTaluksByDistrict,
  getPostOfficeAreasByDistrict,
  getPincodesByDistrict,
};
 
