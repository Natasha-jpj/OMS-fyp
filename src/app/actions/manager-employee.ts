"use server";

export async function managerHireEmployee(_formData: FormData) {
  return { success: false, error: "Managers are not allowed to hire staff." };
}