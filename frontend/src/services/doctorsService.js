import api from "../utils/api";

export const listDoctors = async () => (await api.get("/doctors")).data.data;

export const createDoctor = async (fields) => (await api.post("/doctors", fields)).data.data;

export const updateDoctor = async (id, fields) => (await api.put(`/doctors/${id}`, fields)).data.data;

export const deleteDoctor = async (id) => {
  await api.delete(`/doctors/${id}`);
};
