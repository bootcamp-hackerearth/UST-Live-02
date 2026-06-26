import { SpecializationModel } from "../types/ui.types";
import api from "./interceptor.service";

export const getSpecializations = async () => {
  const response = await api.get("ui/getSpecializations");
  return response.data as SpecializationModel[];
};
