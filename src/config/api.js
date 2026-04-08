export const API_CONFIG = {
  BASE_URL: "https://services7.arcgis.com/thejR7S8L6Ql48EA/arcgis/rest/services/Visitor_Logs/FeatureServer/0",
  GEOFENCE_BASE_URL:
    "https://services7.arcgis.com/thejR7S8L6Ql48EA/arcgis/rest/services/Form_Access_Geofence/FeatureServer/0",
  ENDPOINTS: {
    CREATE_VISITOR: "/addFeatures",
    GET_VISITOR: "/query",
    UPDATE_EXIT: "/updateFeatures",
    GEOFENCE_QUERY: "/query",
  },
  /** Builds the addAttachment URL for a given objectId */
  attachmentUrl: (objectId) =>
    `https://services7.arcgis.com/thejR7S8L6Ql48EA/arcgis/rest/services/Visitor_Logs/FeatureServer/0/${objectId}/addAttachment`,
  /** Builds the queryAttachments URL for a given objectId */
  attachmentQueryUrl: (objectId) =>
    `https://services7.arcgis.com/thejR7S8L6Ql48EA/arcgis/rest/services/Visitor_Logs/FeatureServer/0/${objectId}/attachments`,
  // Leave blank for open public service
  API_KEY: "",
};
