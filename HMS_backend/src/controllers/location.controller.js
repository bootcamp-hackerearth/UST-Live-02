const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

const {
  getStates,
  getDistrictsByStateId,
  getTaluksByDistrict,
  getPostOfficeAreasByDistrict,
  getPincodesByDistrict,
} = require("../services/patient/india-location.service");

const requireStateAndDistrict = (query) => {
  const { state, district } = query;

  if (!state || !district) {
    throw new ApiError(400, "State and district are required", "BAD_REQUEST");
  }

  return { state, district };
};

const getIndiaStates = asyncHandler(async (req, res) => {
  const states = await getStates();

  return res
    .status(200)
    .json(new ApiResponse(200, "States retrieved successfully", states));
});

const getIndiaDistricts = asyncHandler(async (req, res) => {
  const districts = await getDistrictsByStateId(req.params.stateId);

  if (!districts) {
    throw new ApiError(404, "State not found", "STATE_NOT_FOUND");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Districts retrieved successfully", districts));
});

const getIndiaPincodes = asyncHandler(async (req, res) => {
  const { state, district } = requireStateAndDistrict(req.query);
  const pincodes = await getPincodesByDistrict(state, district);

  return res
    .status(200)
    .json(new ApiResponse(200, "Pincodes retrieved successfully", pincodes));
});

const getIndiaPostOfficeAreas = asyncHandler(async (req, res) => {
  const { state, district } = requireStateAndDistrict(req.query);
  const areas = await getPostOfficeAreasByDistrict(state, district);

  return res
    .status(200)
    .json(new ApiResponse(200, "Post offices retrieved successfully", areas));
});

const getIndiaTaluks = asyncHandler(async (req, res) => {
  const { state, district } = requireStateAndDistrict(req.query);
  const taluks = await getTaluksByDistrict(state, district);

  return res
    .status(200)
    .json(new ApiResponse(200, "Taluks retrieved successfully", taluks));
});

module.exports = {
  getIndiaStates,
  getIndiaDistricts,
  getIndiaPincodes,
  getIndiaPostOfficeAreas,
  getIndiaTaluks,
};
