const {
  getStates,
  getDistrictsByStateId,
  getTaluksByDistrict,
  getPostOfficeAreasByDistrict,
  getPincodesByDistrict,
} = require("../services/india-location.service");
 
const getIndiaStates = async (req, res, next) => {
  try {
    const states = await getStates();
 
    return res.status(200).json({
      success: true,
      message: "States retrieved successfully",
      data: states,
    });
  } catch (error) {
    next(error);
  }
};
 
const getIndiaDistricts = async (req, res, next) => {
  try {
    const districts = await getDistrictsByStateId(req.params.stateId);
 
    if (!districts) {
      return res.status(404).json({
        success: false,
        message: "State not found",
      });
    }
 
    return res.status(200).json({
      success: true,
      message: "Districts retrieved successfully",
      data: districts,
    });
  } catch (error) {
    next(error);
  }
};
 
const getIndiaPincodes = async (req, res, next) => {
  try {
    const { state, district } = req.query;
 
    if (!state || !district) {
      return res.status(400).json({
        success: false,
        message: "State and district are required",
      });
    }
 
    const pincodes = await getPincodesByDistrict(state, district);
 
    return res.status(200).json({
      success: true,
      message: "Pincodes retrieved successfully",
      data: pincodes,
    });
  } catch (error) {
    next(error);
  }
};
 
const getIndiaPostOfficeAreas = async (req, res, next) => {
  try {
    const { state, district } = req.query;
 
    if (!state || !district) {
      return res.status(400).json({
        success: false,
        message: "State and district are required",
      });
    }
 
    const areas = await getPostOfficeAreasByDistrict(state, district);
 
    return res.status(200).json({
      success: true,
      message: "Post offices retrieved successfully",
      data: areas,
    });
  } catch (error) {
    next(error);
  }
};
 
const getIndiaTaluks = async (req, res, next) => {
  try {
    const { state, district } = req.query;
 
    if (!state || !district) {
      return res.status(400).json({
        success: false,
        message: "State and district are required",
      });
    }
 
    const taluks = await getTaluksByDistrict(state, district);
 
    return res.status(200).json({
      success: true,
      message: "Taluks retrieved successfully",
      data: taluks,
    });
  } catch (error) {
    next(error);
  }
};
 
module.exports = {
  getIndiaStates,
  getIndiaDistricts,
  getIndiaPincodes,
  getIndiaPostOfficeAreas,
  getIndiaTaluks,
};
 
