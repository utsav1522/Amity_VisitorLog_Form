import axios from "axios";
import { API_CONFIG } from "../config/api";
import { generateVisitorId } from "../utils/visitorId";

const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
});

const LOCAL_VISITOR_CACHE_KEY = "vms_visitor_cache";

const readVisitorCache = () => {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_VISITOR_CACHE_KEY) || "{}");
  } catch {
    return {};
  }
};

const writeVisitorCache = (cache) => {
  localStorage.setItem(LOCAL_VISITOR_CACHE_KEY, JSON.stringify(cache));
};

const cacheVisitorDetails = (passId, details) => {
  if (!passId) return;
  const cache = readVisitorCache();
  cache[passId] = {
    ...(cache[passId] || {}),
    ...details,
  };
  writeVisitorCache(cache);
};

const getCachedVisitorDetails = (passId) => {
  const cache = readVisitorCache();
  return cache[passId] || null;
};

const normalizeArcGisDate = (value) => {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return new Date(value).toISOString();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
};

const normalizeCoordinate = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) return null;
  return Number(numericValue.toFixed(6));
};

export const checkFormAccessByLocation = async ({ latitude, longitude }) => {
  const geofenceClient = axios.create({
    baseURL: API_CONFIG.GEOFENCE_BASE_URL,
  });

  const params = {
    where: "1=1",
    returnCountOnly: true,
    geometry: `${longitude},${latitude}`,
    geometryType: "esriGeometryPoint",
    spatialRel: "esriSpatialRelIntersects",
    inSR: 4326,
    f: "json",
  };

  if (API_CONFIG.API_KEY) {
    params.token = API_CONFIG.API_KEY;
  }

  const response = await geofenceClient.get(API_CONFIG.ENDPOINTS.GEOFENCE_QUERY, { params });
  const count = Number(response.data?.count ?? 0);

  return count > 0;
};

/** Convert a base64 data-URL to a File object */
const dataUrlToFile = (dataUrl, filename = "photo.jpg") => {
  const [meta, base64] = dataUrl.split(",");
  const mime = meta.match(/:(.*?);/)?.[1] || "image/jpeg";
  const byteString = atob(base64);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new File([ab], filename, { type: mime });
};

/** Upload an attachment (profile photo) to a feature */
const uploadAttachment = async (objectId, dataUrl) => {
  const file = dataUrlToFile(dataUrl, "profile-photo.jpg");
  const formData = new FormData();
  formData.append("attachment", file);
  formData.append("f", "json");

  const url = API_CONFIG.attachmentUrl(objectId);
  const response = await axios.post(url, formData);
  if (!response.data?.addAttachmentResult?.success) {
    console.error("Attachment upload failed:", response.data);
  }
};

/** Fetch the first attachment URL for a feature */
const fetchAttachmentUrl = async (objectId) => {
  try {
    const url = `${API_CONFIG.attachmentQueryUrl(objectId)}?f=json`;
    const response = await axios.get(url);
    const infos = response.data?.attachmentInfos || [];
    if (infos.length === 0) return "";
    // Return direct URL to the attachment
    return `${API_CONFIG.attachmentQueryUrl(objectId)}/${infos[0].id}`;
  } catch {
    return "";
  }
};

/**
 * Resolves the final stored value for fields with "Other" option.
 * If selected value is "Other" and a manual text is provided, returns "Other | {text}".
 */
const resolveOtherField = (selected, manual) =>
  selected === "Other" && manual?.trim() ? `Other | ${manual.trim()}` : selected || null;

/**
 * Create a new visitor record in ArcGIS Feature Service
 * Maps form fields to ArcGIS schema
 */
export const createVisitor = async (payload) => {
  try {
    const passId = generateVisitorId(); // Format: AMU-YYYYMMDD-<unique-id>
    const entryTimeMs = new Date(payload.entryTime).getTime();
    const latitude = normalizeCoordinate(payload.latitude);
    const longitude = normalizeCoordinate(payload.longitude);

    const resolvedVisitorType = resolveOtherField(payload.visitorType, payload.visitorTypeOther);
    const resolvedPurpose = resolveOtherField(payload.purposeOfVisit, payload.purposeOfVisitOther);

    // Build feature attributes matching ArcGIS schema
    const attributes = {
      PassID: passId,
      FullName: payload.fullName,
      MobileNumber: payload.mobileNumber,
      VisitorType: resolvedVisitorType,
      purposeOfVisit: resolvedPurpose,
      gateNumber: payload.entryGate || null,
      department: payload.department || null,
      vehicleNumber: payload.vehicleNumber || null,
      expectedHours: payload.expectedHours || null,
      num_of_visitors: payload.num_of_visitors || 1,
      gov_id_type: payload.gov_id_type || null,
      gov_id_number: payload.gov_id_number || null,
      latitude,
      longitude,
      PassStatus: "Generated",
      EntryTime: entryTimeMs,
      ExitTime: null,
      Duration: null,
    };

    // POST to addFeatures endpoint
    const response = await apiClient.post(API_CONFIG.ENDPOINTS.CREATE_VISITOR, null, {
      params: {
        features: JSON.stringify([{ attributes }]),
        f: "json",
      },
    });

    if (!response.data.addResults || response.data.addResults.length === 0) {
      throw new Error("Failed to create visitor record");
    }

    const result = response.data.addResults[0];
    if (!result.success) {
      throw new Error(result.error?.description || "Feature creation failed");
    }

    // Upload profile photo as attachment if provided
    if (payload.profilePhoto) {
      await uploadAttachment(result.objectId, payload.profilePhoto);
    }

    cacheVisitorDetails(passId, {
      fullName: payload.fullName || "",
      mobileNumber: payload.mobileNumber || "",
      visitorType: resolvedVisitorType || "",
      emailId: payload.emailId || "",
      department: payload.department || "",
      purposeOfVisit: resolvedPurpose || "",
      entryGate: payload.entryGate || "",
      vehicleNumber: payload.vehicleNumber || "",
      expectedHours: payload.expectedHours || null,
      num_of_visitors: payload.num_of_visitors || 1,
      gov_id_type: payload.gov_id_type || "",
      gov_id_number: payload.gov_id_number || "",
      latitude,
      longitude,
      profilePhoto: payload.profilePhoto || "",
      entryTime: payload.entryTime || null,
    });

    return {
      success: true,
      data: {
        passId,
        objectId: result.objectId,
        status: "Generated",
        entryTime: payload.entryTime,
        fullName: payload.fullName,
        mobileNumber: payload.mobileNumber,
        emailId: payload.emailId || "",
        visitorType: resolvedVisitorType,
        purposeOfVisit: resolvedPurpose,
        entryGate: payload.entryGate || null,
        department: payload.department || "",
        vehicleNumber: payload.vehicleNumber || null,
        expectedHours: payload.expectedHours || null,
        num_of_visitors: payload.num_of_visitors || 1,
        gov_id_type: payload.gov_id_type || "",
        gov_id_number: payload.gov_id_number || "",
        latitude,
        longitude,
        profilePhoto: payload.profilePhoto || "",
      },
    };
  } catch (error) {
    console.error("createVisitor error:", error);
    throw new Error(error.response?.data?.error?.description || "Unable to create visitor pass");
  }
};

/**
 * Fetch visitor by PassID from ArcGIS Feature Service
 */
export const getVisitorById = async (passId) => {
  try {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.GET_VISITOR, {
      params: {
        where: `PassID='${passId}'`,
        outFields: "*",
        f: "json",
      },
    });

    const features = response.data.features || [];
    if (features.length === 0) {
      return {
        success: false,
        data: null,
        message: "Visitor ID not found",
      };
    }

    const feature = features[0];
    const attrs = feature.attributes;
    const cached = getCachedVisitorDetails(attrs.PassID);

    // Fetch profile photo from attachments
    const profilePhoto = await fetchAttachmentUrl(attrs.OBJECTID) || cached?.profilePhoto || "";

    return {
      success: true,
      data: {
        passId: attrs.PassID,
        objectId: attrs.OBJECTID,
        fullName: attrs.FullName || cached?.fullName || "",
        mobileNumber: attrs.MobileNumber || cached?.mobileNumber || "",
        emailId: attrs.EmailID || attrs.emailId || cached?.emailId || "",
        visitorType: attrs.VisitorType || cached?.visitorType || "",
        purposeOfVisit: attrs.purposeOfVisit || attrs.PurposeOfVisit || cached?.purposeOfVisit || "",
        entryGate: attrs.gateNumber || attrs.EntryGate || attrs.GateNumber || cached?.entryGate || "",
        department: attrs.department || attrs.Department || cached?.department || "",
        vehicleNumber: attrs.vehicleNumber || attrs.VehicleNumber || cached?.vehicleNumber || "",
        expectedHours: attrs.expectedHours || cached?.expectedHours || null,
        num_of_visitors: attrs.num_of_visitors ?? cached?.num_of_visitors ?? 1,
        gov_id_type: attrs.gov_id_type || cached?.gov_id_type || "",
        gov_id_number: attrs.gov_id_number || cached?.gov_id_number || "",
        latitude: attrs.latitude ?? cached?.latitude ?? null,
        longitude: attrs.longitude ?? cached?.longitude ?? null,
        profilePhoto,
        status: attrs.PassStatus,
        entryTime: normalizeArcGisDate(attrs.EntryTime) || cached?.entryTime || null,
        exitTime: normalizeArcGisDate(attrs.ExitTime),
        duration: attrs.Duration || null,
      },
    };
  } catch (error) {
    console.error("getVisitorById error:", error);
    throw new Error("Unable to fetch visitor details");
  }
};

/**
 * Update visitor record on exit
 * Marks PassStatus as EXPIRED and records ExitTime and Duration
 */
export const updateVisitorExit = async (passId, updates) => {
  try {
    const exitTimeMs = new Date(updates.exitTime).getTime();
    const entryTimeMs = new Date(updates.entryTime).getTime();

    // Calculate duration in minutes
    const durationMs = exitTimeMs - entryTimeMs;
    const durationMins = Math.floor(durationMs / 60000);
    const hours = Math.floor(durationMins / 60);
    const mins = durationMins % 60;
    const durationStr = `${hours} hrs ${mins} mins`;

    // Query to find OBJECTID by PassID
    const queryResponse = await apiClient.get(API_CONFIG.ENDPOINTS.GET_VISITOR, {
      params: {
        where: `PassID='${passId}'`,
        outFields: "OBJECTID",
        f: "json",
      },
    });

    const features = queryResponse.data.features || [];
    if (features.length === 0) {
      throw new Error("Visitor record not found");
    }

    const objectId = features[0].attributes.OBJECTID;

    // Build update feature
    const attributes = {
      OBJECTID: objectId,
      PassID: passId,
      PassStatus: "EXPIRED",
      ExitTime: exitTimeMs,
      Duration: durationStr,
    };

    // POST to updateFeatures endpoint
    const updateResponse = await apiClient.post(API_CONFIG.ENDPOINTS.UPDATE_EXIT, null, {
      params: {
        features: JSON.stringify([{ attributes }]),
        f: "json",
      },
    });

    if (!updateResponse.data.updateResults || updateResponse.data.updateResults.length === 0) {
      throw new Error("Failed to update visitor record");
    }

    const result = updateResponse.data.updateResults[0];
    if (!result.success) {
      throw new Error(result.error?.description || "Feature update failed");
    }

    return {
      success: true,
      data: {
        passId,
        status: "EXPIRED",
        exitTime: updates.exitTime,
        duration: durationStr,
      },
    };
  } catch (error) {
    console.error("updateVisitorExit error:", error);
    throw new Error(error.message || "Unable to complete exit");
  }
};

export { apiClient };
