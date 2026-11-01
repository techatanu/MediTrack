import api from "../utils/api";

/**
 * @param {{ search?: string, category?: string, doctor?: string, sort?: string, page?: number, limit?: number }} params
 * @returns {Promise<{ reports: object[], pagination: { total: number, page: number, pages: number, limit: number } }>}
 */
export const listReports = async (params = {}) => {
  const res = await api.get("/reports", { params });
  return { reports: res.data.data, pagination: res.data.pagination };
};

export const getReport = async (id) => (await api.get(`/reports/${id}`)).data.data;

/** Short-lived signed link to the report's file. @returns {Promise<{ url: string, expiresAt: string|null, mimeType: string }>} */
export const getReportFileLink = async (id) => (await api.get(`/reports/${id}/file`)).data.data;

export const createReport = async ({ title, category, reportDate, doctor, file }) => {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("category", category);
  formData.append("reportDate", reportDate);
  if (doctor) formData.append("doctor", doctor);
  if (file) formData.append("image", file);
  return (await api.post("/reports", formData)).data.data;
};

export const deleteReport = async (id) => {
  await api.delete(`/reports/${id}`);
};
