const https = require("node:https");
const INDIA_LOCATION_SOURCE_URL =
  process.env.INDIA_LOCATION_SOURCE_URL ||
  "https://raw.githubusercontent.com/sab99r/Indian-States-And-Districts/master/states-and-districts.json";
const INDIA_ADMIN_AREA_SOURCE_URL =
  process.env.INDIA_ADMIN_AREA_SOURCE_URL ||
  "https://raw.githubusercontent.com/pranshumaheshwari/indian-cities-and-villages/master/data.json";
const ApiError = require("../../utils/ApiError");
const logger = require("../../utils/logger");

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const PINCODE_CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const allowInsecureLocationFetch =
  process.env.ALLOW_INSECURE_LOCATION_FETCH !== "false" &&
  process.env.NODE_ENV !== "production";

let cachedLocations = null;
let cacheExpiresAt = 0;
let cachedAdminAreas = null;
let adminAreaCacheExpiresAt = 0;
const pincodeCache = new Map();
const areaCache = new Map();

const cleanName = (value) =>
  String(value || "")
    .replaceAll("&amp;", "&")
    .replaceAll(/\s+/g, " ")
    .trim();

const normalizeName = (value) =>
  cleanName(value)
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, " ")
    .replaceAll(/\s+/g, " ")
    .trim();

const normalizeAlias = (value) => {
  const normalized = normalizeName(value);
  const aliases = {
    trivandrum: "thiruvananthapuram",
    trivanathapuram: "thiruvananthapuram",
  };

  return aliases[normalized] || normalized;
};

const getNameVariants = (value) => {
  const name = cleanName(value);
  const variants = new Set();
  const beforeParenthesis = name.replaceAll(/\s{0,10}\([^)]{0,500}\)\s{0,10}/g, " ").trim();
  const parenthesisMatches = [...name.matchAll(/\(([^)]{0,500})\)/g)];

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
    getNameVariants(first).some(
      (variant) => normalizeName(variant) === secondName,
    ) ||
    getNameVariants(second).some(
      (variant) => normalizeName(variant) === firstName,
    )
  );
};

const isLocalIssuerCertificateError = (error) =>
  error?.cause?.code === "UNABLE_TO_GET_ISSUER_CERT_LOCALLY" ||
  error?.code === "UNABLE_TO_GET_ISSUER_CERT_LOCALLY";

const fetchJsonWithInsecureTls = (url, timeoutMs) =>
  new Promise((resolve, reject) => {
    const request = https.get(
      url,
      {
        agent: new https.Agent({
          rejectUnauthorized: false,
        }),
        headers: {
          Accept: "application/json",
          "User-Agent": "HMS-Backend/1.0",
        },
        timeout: timeoutMs,
      },
      (response) => {
        const chunks = [];

        response.on("data", (chunk) => {
          chunks.push(chunk);
        });

        response.on("end", () => {
          const body = Buffer.concat(chunks).toString("utf8");

          if (response.statusCode < 200 || response.statusCode >= 300) {
            reject(
              new ApiError(
                502,
                `Location source failed with ${response.statusCode}`,
                "LOCATION_SOURCE_FAILED",
              ),
            );
            return;
          }

          try {
            resolve(JSON.parse(body));
          } catch (error) {
            reject(
              new ApiError(
                502,
                "Location source returned invalid JSON",
                "LOCATION_SOURCE_INVALID_JSON",
                {
                  cause: error.message,
                },
              ),
            );
          }
        });
      },
    );

    request.on("timeout", () => {
      request.destroy(
        new ApiError(
          504,
          "Location source request timed out",
          "LOCATION_SOURCE_TIMEOUT",
        ),
      );
    });

    request.on("error", reject);
  });

const fetchJson = async (url, timeoutMs, sourceName) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": "HMS-Backend/1.0",
      },
    });

    if (!response.ok) {
      throw new ApiError(
        502,
        `${sourceName} source failed with ${response.status}`,
        "LOCATION_SOURCE_FAILED",
      );
    }

    return response.json();
  } catch (error) {
    if (allowInsecureLocationFetch && isLocalIssuerCertificateError(error)) {
      logger.warn(`${sourceName} source TLS verification failed; retrying`, {
        url,
        reason: error.cause?.code || error.code,
      });

      return fetchJsonWithInsecureTls(url, timeoutMs);
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
};

const fetchLocationData = async () => {
  const data = await fetchJson(INDIA_LOCATION_SOURCE_URL, 10000, "Location");

  if (!Array.isArray(data.states)) {
    throw new ApiError(
      502,
      "Location source returned invalid data",
      "LOCATION_SOURCE_INVALID_DATA",
    );
  }

  return data.states.map((item, index) => ({
    id: String(index + 1),
    name: cleanName(item.state),
    districts: (item.districts || []).map(cleanName).filter(Boolean),
  }));
};

const getLocations = async () => {
  if (cachedLocations && Date.now() < cacheExpiresAt) {
    return cachedLocations;
  }

  cachedLocations = await fetchLocationData();
  cacheExpiresAt = Date.now() + CACHE_TTL_MS;

  return cachedLocations;
};

const fetchAdminAreaData = async () => {
  const data = await fetchJson(INDIA_ADMIN_AREA_SOURCE_URL, 15000, "Admin area");

  if (!Array.isArray(data)) {
    throw new ApiError(
      502,
      "Admin area source returned invalid data",
      "ADMIN_AREA_SOURCE_INVALID_DATA",
    );
  }

  return data;
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
  const adminAreas = await getAdminAreas();
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
  ].sort((a, b) => a.localeCompare(b));
};

const fetchPostOffices = async (searchTerm) => {
  try {
    const data = await fetchJson(
      `https://api.postalpincode.in/postoffice/${encodeURIComponent(searchTerm)}`,
      5000,
      "Postal",
    );
    const result = Array.isArray(data) ? data[0] : null;

    if (result?.Status !== "Success" || !Array.isArray(result.PostOffice)) {
      return [];
    }

    return result.PostOffice;
  } catch {
    return [];
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

const getMatchingPostOffices = async (
  stateSearch,
  districtSearch,
  district,
) => {
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
  ].sort((first, second) =>
    `${first.taluk} ${first.name}`.localeCompare(
      `${second.taluk} ${second.name}`,
    ),
  );

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
  ].sort((a, b) => a.localeCompare(b));

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
